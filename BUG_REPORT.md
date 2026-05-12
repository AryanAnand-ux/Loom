# Loom - Comprehensive Project Audit & Bug Report

## 1. Architectural Weakness & Data Loss Bug: Local File Fallback
* **Severity:** CRITICAL
* **Root Cause:** The `useCloset` and `useOutfits` hooks, as well as `AddItem.tsx` and `ClosetGrid.tsx`, rely on a dual-write/fallback mechanism. When Firebase rules block a request or fail, data is saved to a local Express server in a file called `closet-fallback.json` and images to a local `/uploads` folder.
* **Why it's bad:** In a production environment (like Vercel, Render, or Heroku), the filesystem is often ephemeral or read-only. Data saved to `closet-fallback.json` or `/uploads` will be wiped out when the server restarts or scales, causing items to "vanish" upon page refresh. Furthermore, merging data between Firebase and a local JSON file causes severe race conditions and UI inconsistencies.
* **Affected Files:** `src/hooks/useCloset.ts`, `src/hooks/useOutfits.ts`, `src/components/AddItem.tsx`, `src/components/ClosetGrid.tsx`, `server/index.cjs`
* **Reproduction Steps:** Add an item when Firebase rules deny the request. The item saves locally. Restart the backend server (simulating a production restart). The item is gone.
* **Recommended Fix:** Completely strip out the local `closet-fallback.json` and `/uploads` proxy logic. Rely **100% on Firebase** for data persistence. Ensure `firestore.rules` and Firebase configs are correct so fallbacks are never needed.
* **Implementation Difficulty:** Medium
* **Risk Level:** High (requires refactoring core data hooks).

## 2. Security Vulnerability: Unprotected AI Endpoints
* **Severity:** HIGH
* **Root Cause:** The `/api/classify` and `/api/suggest` endpoints in `server/index.cjs` do not verify the identity of the requester.
* **Why it's bad:** Anyone who finds the backend URL can send POST requests to these endpoints and exhaust your Gemini API quota, costing you money or breaking the app for recruiters.
* **Affected Files:** `server/index.cjs`
* **Reproduction Steps:** Send a POST request to `http://localhost:5000/api/classify` via Postman without any auth tokens. It will process the image.
* **Recommended Fix:** Implement Firebase Admin SDK on the Express server to verify Firebase ID tokens passed from the frontend via the `Authorization` header.
* **Implementation Difficulty:** Medium
* **Risk Level:** Medium.

## 3. Code Smell & Bad Practice: Mixed Timestamp Types
* **Severity:** LOW
* **Root Cause:** `src/types/index.ts` defines `createdAt` as `unknown`. The `timestampUtils.ts` has to guess if it's a Firestore Timestamp, an ISO string (from the fallback), or an epoch number.
* **Why it's bad:** It breaks TypeScript's strict typing benefits and can cause sorting bugs if the fallback and Firestore dates are parsed incorrectly.
* **Affected Files:** `src/types/index.ts`, `src/lib/timestampUtils.ts`, `src/hooks/useCloset.ts`
* **Recommended Fix:** Once the fallback is removed, enforce that `createdAt` is always a `Timestamp` type from Firestore on the frontend.
* **Implementation Difficulty:** Easy
* **Risk Level:** Low.

## 4. UI/UX Bug: AddItem Error Swallowing
* **Severity:** MEDIUM
* **Root Cause:** In `AddItem.tsx`, if the Firebase Storage upload fails, it attempts the fallback. If both fail, the error message shown to the user is often a generic Firebase error string that is not recruiter-friendly.
* **Affected Files:** `src/components/AddItem.tsx`
* **Recommended Fix:** Improve error handling to show clean, user-friendly toast notifications or messages instead of raw error dumps.
* **Implementation Difficulty:** Easy
* **Risk Level:** Low.

## 5. Deployment Requirement: Missing Production Build Setup
* **Severity:** HIGH
* **Root Cause:** The project uses `.env.example` but is missing clear configuration separation for the Vite frontend and Express backend for a production deployment.
* **Recommended Fix:** Update scripts and provide a clear Vercel + Render deployment plan, ensuring `VITE_API_URL` correctly points to the deployed Express backend, and the Express backend correctly validates CORS for the Vercel domain.
* **Implementation Difficulty:** Easy
* **Risk Level:** Low.
