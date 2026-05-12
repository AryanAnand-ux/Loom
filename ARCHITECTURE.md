# Architecture

## High-Level Architecture
Loom follows a modern, decoupled client-server architecture:
- **Frontend (Client):** A React 19 Single Page Application (SPA) built with Vite and TailwindCSS v4.
- **Backend (API Proxy):** A Node.js Express server that securely handles Google Gemini API requests.
- **Database & Storage (BaaS):** Firebase handles Authentication, NoSQL Data Storage (Firestore), and Blob Storage (Cloud Storage).

## Data Flow
### 1. Adding an Item
1. User selects an image.
2. Frontend compresses the image into a WebP blob (max 600px).
3. The base64 version is sent to the Express backend (`/api/classify`).
4. Backend proxies the request to the Gemini API and returns structured JSON metadata.
5. The frontend uploads the original blob to Firebase Storage.
6. The frontend saves the download URL + metadata to Firestore.

### 2. Stylist Engine (Outfit Curation)
1. Frontend fetches all clean closet items from Firestore.
2. User selects an occasion and weather.
3. Frontend sends the context and the closet JSON array to the Express backend (`/api/suggest`).
4. Backend prompts the Gemini API to select a cohesive outfit (Top, Bottom, Shoes).
5. Frontend renders the suggestion. User can save it to the Firestore `outfits` collection.

## Why this Architecture?
- **Security:** By routing AI requests through the Express server, the `GEMINI_API_KEY` remains completely hidden from the client.
- **Real-time Sync:** Firebase `onSnapshot` hooks ensure the UI updates instantly when items are added, deleted, or marked for laundry.
- **Scalability:** The Vite frontend can be hosted statically on CDNs (Vercel, Netlify), while the Express API can be hosted on serverless platforms (Render, Railway).

## File Structure
- `src/components/`: Reusable UI modules (Dashboard, ClosetGrid, etc.)
- `src/hooks/`: Custom React hooks (`useCloset`, `useOutfits`) handling Firebase subscriptions.
- `src/lib/`: Core utilities (Firebase initialization, timestamp parsers, error handlers).
- `src/services/`: API wrappers (`geminiService.ts`).
- `server/index.cjs`: The Express API proxy.
