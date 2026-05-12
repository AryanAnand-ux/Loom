# Security Audit

This document outlines the security posture of the Loom project following the production-ready architecture refactor.

## 1. Data Isolation (Firestore)
**Status: SECURE**
All user data (closet items and lookbook outfits) are secured via strict `firestore.rules`.
- A user can only read and write documents where the `ownerId` matches their authenticated Firebase `uid`.
- Creation requests must contain a valid server timestamp.
- Field types, string length boundaries, and strict payload shapes are enforced directly at the database level.
- The default rule is explicitly `deny`.

## 2. API Proxy Security (Express)
**Status: PARTIALLY SECURE (Action Recommended)**
The Express proxy hides the `GEMINI_API_KEY` from the client, preventing key scraping. 
- Cross-Origin Resource Sharing (CORS) is strictly enabled for production. The `ALLOWED_ORIGINS` environment variable prevents other domains from making browser-based requests to the API.
- Payload limits (`10mb`) are enforced by Express to prevent Denial of Service via massive image uploads.
- **Action Recommended:** The `/api/classify` and `/api/suggest` endpoints do not yet verify a Firebase Auth token. If a malicious user discovers the API URL, they can send cURL/Postman requests to exhaust the Gemini quota. In the future, the Firebase Admin SDK should be added to the Express server to verify the `Authorization` header.

## 3. Storage Security
**Status: IMPLICITLY SECURE**
Firebase storage rules should be configured similarly to Firestore rules: users should only be able to read and write to `users/{uid}/closet/{itemId}`. The removal of the local Express fallback upload folder (`/uploads`) significantly improved the security profile, as local disks are no longer subject to directory traversal or unauthorized file hosting.

## 4. Secret Management
**Status: SECURE**
API keys and Firebase configurations are strictly managed via environment variables. The `.gitignore` prevents `.env` and `firebase-applet-config.json` from being committed.
