const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ─── Validation ───────────────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY is not set. Create a .env file.');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';
const modelFallbacks = (process.env.GEMINI_MODELS || 'gemini-2.5-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

// ─── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : isDev
  ? ['http://localhost:3000', 'http://localhost:5000']
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (isDev) {
      // Allow any origin in development with warning
      console.warn(`CORS: Allowing request from ${origin}`);
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Removed local fallback mechanisms. 
// Firebase Firestore and Storage will be the sole source of truth in production.

// ─── Cache AI client (avoid re-instantiating per request) ─────────────────────
let _ai = null;
function getAI() {
  if (!_ai) {
    const { GoogleGenAI } = require('@google/genai');
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
}

// ─── Safe JSON parse helper ────────────────────────────────────────────────────
function safeParseJSON(text, context) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Invalid JSON from Gemini [${context}]: ${cleaned.slice(0, 200)}`);
  }
}

function isQuotaError(error) {
  const message = error && error.message ? String(error.message) : String(error || '');
  return message.includes('RESOURCE_EXHAUSTED') || message.includes('quota') || message.includes('429');
}

function isInvalidApiKeyError(error) {
  const message = error && error.message ? String(error.message) : String(error || '');
  return message.includes('API_KEY_INVALID') || message.includes('API Key not found') || message.includes('INVALID_ARGUMENT');
}

function isModelNotFoundError(error) {
  const message = error && error.message ? String(error.message) : String(error || '');
  return message.includes('NOT_FOUND') || message.includes('is not found for API version') || message.includes('models/');
}

function formatGeminiError(error) {
  if (isQuotaError(error)) {
    return {
      status: 429,
      message: 'AI quota exceeded for the current API key. Please try again later or use a different Gemini API key.',
    };
  }

  if (isInvalidApiKeyError(error)) {
    return {
      status: 400,
      message: 'Gemini API key is invalid. Add a valid key in .env (GEMINI_API_KEY).',
    };
  }

  if (isModelNotFoundError(error)) {
    return {
      status: 404,
      message: 'Configured Gemini model is unsupported for this API key/version. Update GEMINI_MODELS in .env.',
    };
  }

  return {
    status: 500,
    message: isDev ? (error && error.message ? error.message : 'Gemini request failed') : 'AI request failed. Please try again.',
  };
}

function buildFallbackClassification() {
  return {
    category: 'Clothing Item',
    color_palette: ['black', 'white'],
    formality_score: 5,
    season: 'All-season',
    vibe: 'Casual',
    fallback: true,
  };
}

async function generateWithFallback(ai, requestBody) {
  let lastError = null;

  for (const model of modelFallbacks) {
    try {
      return await ai.models.generateContent({
        ...requestBody,
        model,
      });
    } catch (error) {
      lastError = error;
      // Retry with next model for model-specific failures.
      if (!isQuotaError(error) && !isModelNotFoundError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── POST /api/classify ────────────────────────────────────────────────────────
app.post('/api/classify', async (req, res) => {
  try {
    const ai = getAI();
    const { image } = req.body;
    
    // Validation
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image provided or invalid format' });
    }
    
    if (image.length > 15 * 1024 * 1024) { // 15MB limit for base64
      return res.status(413).json({ error: 'Image too large (max 15MB)' });
    }

    const mimeType = image.match(/data:(image\/[a-zA-Z0-9+.-]+);/)?.[1];
    if (!mimeType) {
      return res.status(400).json({ error: 'Invalid image format (must be data URI)' });
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
      return res.status(400).json({ error: 'Unsupported image format' });
    }

    const imageData = image.includes(',') ? image.split(',')[1] : image;

    const response = await generateWithFallback(ai, {
      contents: [
        {
          parts: [
            {
              text: 'Analyze this clothing image. Return ONLY valid JSON with these exact fields: category (string, e.g. "T-shirt"), color_palette (array of color strings), formality_score (integer 1-10), season (string: Summer/Winter/Monsoon/All-season), vibe (string, e.g. "Streetwear").'
            },
            { inlineData: { mimeType, data: imageData } },
          ],
        },
      ],
      config: { responseMimeType: 'application/json' },
    });

    const parsed = safeParseJSON(response.text, 'classify');
    
    // Validate response structure
    if (!parsed.category || !parsed.color_palette || !parsed.formality_score || !parsed.season || !parsed.vibe) {
      throw new Error('Invalid response structure from AI');
    }
    
    res.json(parsed);
  } catch (error) {
    const formatted = formatGeminiError(error);
    console.error('Classification Error:', error && error.message ? error.message : error);
    if (formatted.status === 429 || formatted.status === 400 || formatted.status === 404) {
      return res.status(200).json(buildFallbackClassification());
    }

    res.status(formatted.status).json({ error: formatted.message });
  }
});

// ─── POST /api/suggest ────────────────────────────────────────────────────────
app.post('/api/suggest', async (req, res) => {
  try {
    const ai = getAI();
    const { closet, scene, rejectedIds } = req.body;

    // Validation
    if (!closet || !scene) {
      return res.status(400).json({ error: 'Missing required fields: closet and scene' });
    }
    if (!Array.isArray(closet)) {
      return res.status(400).json({ error: 'closet must be an array' });
    }
    if (closet.length < 3) {
      return res.status(400).json({ error: 'Closet must have at least 3 items' });
    }
    
    const maxClosetSize = 100;
    if (closet.length > maxClosetSize) {
      return res.status(413).json({ error: `Closet size too large (max ${maxClosetSize} items)` });
    }

    let promptText = `You are a Fashion Stylist. Suggest an outfit for: "${scene}".
Available closet items (JSON): ${JSON.stringify(closet)}.
Rules:
- Pick exactly ONE top, ONE bottom, ONE footwear.
- NEVER pick items with isDirty: true.`;

    if (Array.isArray(rejectedIds) && rejectedIds.length > 0) {
      promptText += `\n- NEVER use these item IDs: ${rejectedIds.join(', ')}.`;
    }

    promptText += `\n- Use color theory for a cohesive look.
Return ONLY valid JSON with fields: topId (string), bottomId (string), footwearId (string), stylistNote (1 sentence string).`;

    const response = await generateWithFallback(ai, {
      contents: promptText,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = safeParseJSON(response.text, 'suggest');
    
    // Validate response structure
    if (!parsed.topId || !parsed.bottomId || !parsed.footwearId || !parsed.stylistNote) {
      throw new Error('Invalid response structure from AI');
    }
    
    res.json(parsed);
  } catch (error) {
    const formatted = formatGeminiError(error);
    console.error('Suggestion Error:', error && error.message ? error.message : error);
    res.status(formatted.status).json({ error: formatted.message });
  }
});

app.listen(port, () => {
  console.log(`✨ Loom Backend running at http://localhost:${port}`);
  console.log(`   Mode: ${isDev ? 'development' : 'production'}`);
});
