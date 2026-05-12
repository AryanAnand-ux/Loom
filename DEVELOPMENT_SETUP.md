# Development Setup

## Prerequisites
1. Node.js (v18 or higher)
2. A Google Gemini API Key
3. A Firebase Project (with Firestore, Storage, and Auth enabled)

## Step-by-Step Guide

### 1. Clone & Install
```bash
git clone <repository>
cd Loom
npm install
```

### 2. Environment Variables
Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_gemini_key_here
GEMINI_MODELS=gemini-2.5-flash
VITE_API_URL=http://localhost:5000
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Firebase (optional if using firebase-applet-config.json)
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Firebase Configuration
You can optionally place a `firebase-applet-config.json` in the root of the project with your exported Firebase Config object. The app will prefer this local JSON file over the `.env` variables if it exists.

### 4. Running the Dev Servers
Loom uses `concurrently` to run both the Vite frontend and Express backend simultaneously.
```bash
npm run dev
```
- The frontend will be available at `http://localhost:3000`
- The backend API will be available at `http://localhost:5000`

### 5. Deployment / Build
To create a production build of the frontend:
```bash
npm run build
```
This generates a `dist` folder ready to be deployed to static hosting.
