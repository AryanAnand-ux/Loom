# Codebase Map

## Root Directory
* `package.json` - Node dependencies and npm scripts (`dev`, `build`, etc.)
* `vite.config.ts` - Vite frontend bundler configuration.
* `firebase.json` & `.firebaserc` - Firebase CLI project and hosting config.
* `firestore.rules` - Crucial security definitions for the Firestore database.
* `server/index.cjs` - The Express backend application.

## Frontend Source (`src/`)
### Entry Points
* `main.tsx` - Mounts the React app to the DOM.
* `App.tsx` - Handles routing, loading screens, and sidebar navigation layout.

### Components (`src/components/`)
* `Auth.tsx` - Handles user login (Email, Google, Guest).
* `Dashboard.tsx` - High-level analytics and quick stats.
* `ClosetGrid.tsx` - Renders the user's wardrobe, handles deleting and toggling items.
* `AddItem.tsx` - The interface for capturing photos and getting AI classifications.
* `StylistEngine.tsx` - The interface for getting AI outfit suggestions.
* `Lookbook.tsx` - Displays outfits saved by the StylistEngine.
* `DebugPanel.tsx` - Development overlay for real-time state tracking.

### Hooks (`src/hooks/`)
* `useCloset.ts` - Subscribes to the `closet` Firestore collection.
* `useOutfits.ts` - Subscribes to the `outfits` Firestore collection.

### Services (`src/services/`)
* `geminiService.ts` - Helper functions mapping frontend calls to the backend Express proxy (`/api/classify` and `/api/suggest`).

### Library / Utils (`src/lib/`)
* `firebase.ts` - Initializes the Firebase SDK.
* `errorUtils.ts` - Structured error handling.
* `timestampUtils.ts` - Parsers for different date types.

### Types (`src/types/`)
* `index.ts` - Global TypeScript interfaces (`ClosetItem`, `Outfit`).
