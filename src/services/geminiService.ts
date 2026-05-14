import { ClosetItem } from "../types";

export interface ClassificationResult {
  category: string;
  color_palette: string[];
  formality_score: number;
  season: string;
  vibe: string;
}

const rawApiBase = import.meta.env.VITE_API_URL?.trim() || "";
const isLocalApiBase = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawApiBase);

// Use same-origin API routes by default so production builds do not get pinned to localhost.
const API_BASE = import.meta.env.DEV ? rawApiBase : (rawApiBase && !isLocalApiBase ? rawApiBase : "");

const getApiErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const payload = await response.json();
    if (payload && typeof payload.error === 'string') return payload.error;
    return fallback;
  } catch {
    return fallback;
  }
};

export const classifyImage = async (base64Image: string): Promise<ClassificationResult> => {
  const response = await fetch(`${API_BASE}/api/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to classify image'));
  }

  return response.json();
};

export interface OutfitSuggestion {
  topId: string;
  bottomId: string;
  footwearId: string;
  stylistNote: string;
}

export const suggestOutfit = async (closet: ClosetItem[], scene: string, rejectedIds: string[] = []): Promise<OutfitSuggestion> => {
  const response = await fetch(`${API_BASE}/api/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ closet, scene, rejectedIds }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, 'Failed to suggest outfit'));
  }

  return response.json();
};
