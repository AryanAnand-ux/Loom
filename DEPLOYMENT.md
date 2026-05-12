# Deployment Guide

Loom is split into two deployable artifacts: the Static Frontend and the Express API Backend.

## 1. Backend Deployment (Express Proxy)
The backend must be deployed to a Node.js hosting provider (e.g., Render, Railway, Heroku).

### Steps (Render Example):
1. Connect your GitHub repository to Render and create a **Web Service**.
2. **Build Command:** `npm install`
3. **Start Command:** `node server/index.cjs`
4. **Environment Variables:**
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave empty if Render auto-assigns)
   - `GEMINI_API_KEY`: Your Google GenAI key.
   - `GEMINI_MODELS`: `gemini-2.5-flash`
   - `ALLOWED_ORIGINS`: The URL of your future deployed frontend (e.g., `https://loom.vercel.app`).

## 2. Frontend Deployment (Vite React)
The frontend can be deployed to any static host like Vercel, Netlify, or Firebase Hosting.

### Steps (Vercel Example):
1. Import your repository into Vercel.
2. **Framework Preset:** Vite
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variables:**
   - `VITE_API_URL`: The URL of the backend you deployed in Step 1 (e.g., `https://loom-api.onrender.com`).
   - `VITE_FIREBASE_API_KEY`: Your Firebase config.
   - `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase config.
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase config.
   - `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase config.
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase config.
   - `VITE_FIREBASE_APP_ID`: Your Firebase config.

## 3. Firebase Rules Configuration
You must deploy your Firestore security rules to ensure user data remains completely isolated.

Run from your local terminal:
```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

Make sure **Firebase Authentication** is enabled in your console for Email/Password and Google providers.
