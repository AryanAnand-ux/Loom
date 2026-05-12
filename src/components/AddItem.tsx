import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";
import { classifyImage, ClassificationResult } from "../services/geminiService";
import { db, storage } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { handleFirestoreError, OperationType } from "../lib/errorUtils";
import { motion } from "motion/react";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out. Please try again.`)), ms);
    }),
  ]);
}

export default function AddItem({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [image, setImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onerror = () => {
          setError("Failed to load image. Please try a different photo.");
        };
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 600; // Reduced from 800 for faster processing and lower bandwidth
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/webp", 0.7);
          setImage(compressedBase64);
          
          // Convert to blob for storage
          canvas.toBlob((blob) => {
            setImageBlob(blob);
          }, "image/webp", 0.7);

          setResult(null);
          setError(null);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const classify = async () => {
    if (!image || !imageBlob || !userId) return;
    setIsClassifying(true);
    setError(null);
    try {
      const data = await classifyImage(image);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to analyze image. Please try again.";
      setError(message);
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  useEffect(() => {
    // Only trigger when image is first set (not on every state change)
    if (image && imageBlob && !result && !isClassifying && !error) {
      classify();
    }
  }, [image, imageBlob]); // ✅ Only depend on image inputs

  const saveToCloset = async () => {
    if (!result || !imageBlob || !userId) return;
    setIsSaving(true);
    setError(null);
    const itemId = crypto.randomUUID();
    const storagePath = `users/${userId}/closet/${itemId}.webp`;
    const firestorePath = `users/${userId}/closet/${itemId}`;
    
    try {
      // Upload image only when user confirms save, so classification remains independent.
      const storageRef = ref(storage, storagePath);
      let downloadURL: string;
      try {
        await withTimeout(uploadBytes(storageRef, imageBlob), 20000, "Image upload");
        downloadURL = await withTimeout(getDownloadURL(storageRef), 10000, "Image URL fetch");
      } catch (uploadErr) {
        console.error('Storage upload failed:', uploadErr);
        throw new Error('Failed to upload image to Firebase Storage. Please check your connection and rules.');
      }

      const payload = {
        ownerId: userId,
        imageUrl: downloadURL,
        storagePath,
        category: result.category,
        colorPalette: result.color_palette,
        formalityScore: result.formality_score,
        season: result.season,
        vibe: result.vibe,
        isDirty: false,
        isFavorite: false,
        createdAt: serverTimestamp(),
      };

      try {
        await withTimeout(setDoc(doc(db, firestorePath), payload), 15000, "Closet save");
      } catch (firestoreErr) {
        console.error('Firestore save failed:', firestoreErr);
        throw new Error('Failed to save item to your closet. Please check your connection and rules.');
      }

      setIsAdded(true);
      console.log('AddItem: saved item', firestorePath, { downloadURL });
      onComplete();
    } catch (err) {
      console.error("Save Error:", err);
      // Build a helpful error message for the UI (truncate to avoid excessive length)
      let message = "Failed to save item. Please check your connection and try again.";
      try {
        if (err instanceof Error) message = err.message;
        else if (typeof err === 'string') message = err;
        else message = JSON.stringify(err);
      } catch {
        message = String(err);
      }

      if (message.includes("permission-denied")) {
        setError("Save blocked by Firebase permissions. Check Storage/Firestore rules and login state. Details: " + message.slice(0, 300));
      } else {
        setError(message.slice(0, 500));
      }

      // Preserve structured logging without breaking UI flow.
      try {
        handleFirestoreError(err, OperationType.WRITE, firestorePath);
      } catch {
        // Intentionally swallow logger rethrow to keep component responsive.
      }
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif italic">New Addition</h2>
          <p className="text-gray-500 text-sm">Upload or capture a photo to classify.</p>
        </div>
        {image && (
          <button onClick={() => { setImage(null); setImageBlob(null); setResult(null); setError(null); setIsAdded(false); }} className="text-gray-400 hover:text-black transition-colors">
            <X size={24} />
          </button>
        )}
      </header>

      {!image ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-square rounded-3xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-black transition-colors group p-6 relative overflow-hidden">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
              <Camera size={32} />
            </div>
            <div className="text-center">
              <p className="font-sans font-medium text-gray-900">Take Photo</p>
              <p className="font-sans text-xs text-gray-500">Using camera</p>
            </div>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              capture="environment" 
              aria-label="Take photo with camera"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="aspect-square rounded-3xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-black transition-colors group p-6 relative overflow-hidden">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="font-sans font-medium text-gray-900">Choose from Gallery</p>
              <p className="font-sans text-xs text-gray-500">Pick an existing photo</p>
            </div>
            <input 
              ref={galleryInputRef} 
              type="file" 
              accept="image/*" 
              aria-label="Choose photo from gallery"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              onChange={handleFileChange} 
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-xl border border-gray-200">
            <img src={image} alt="Clothing preview" className="w-full h-full object-cover" />
          </div>

          <div className="flex flex-col justify-center space-y-6">
            {!result ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Loom is analyzing the properties of your image...</p>
                <div className="w-full h-14 rounded-full bg-black text-white font-sans text-sm font-semibold tracking-wider flex items-center justify-center gap-2 opacity-90 transition-all">
                  {error ? <AlertCircle size={18} /> : <Loader2 size={18} className="animate-spin" />}
                  {error ? "ANALYSIS FAILED" : "ANALYZING..."}
                </div>
                {error && (
                  <div className="space-y-2">
                    <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={14}/> {error}</p>
                    <button onClick={classify} className="text-xs font-bold text-black border-b border-black">TRY AGAIN</button>
                  </div>
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold font-sans">Category</label>
                    <input 
                      value={result.category} 
                      onChange={(e) => setResult({...result, category: e.target.value})}
                      className="text-xl font-serif italic text-gray-900 border-b border-gray-200 pb-2 w-full outline-none focus:border-black transition-colors bg-transparent" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold font-sans">Vibe</label>
                    <input 
                      value={result.vibe} 
                      onChange={(e) => setResult({...result, vibe: e.target.value})}
                      className="text-gray-900 font-sans border-b border-gray-200 pb-2 w-full outline-none focus:border-black transition-colors bg-transparent" 
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold font-sans">Formality ({result.formality_score}/10)</label>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        value={result.formality_score}
                        onChange={(e) => setResult({...result, formality_score: parseInt(e.target.value)})}
                        className="w-full accent-black"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex-1 min-w-[120px] space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold font-sans">Colors (comma separated)</label>
                      <input 
                        value={result.color_palette.join(", ")} 
                        onChange={(e) => setResult({...result, color_palette: e.target.value.split(",").map(c => c.trim())})}
                        className="text-xs font-sans text-gray-900 border-b border-gray-200 pb-2 w-full outline-none focus:border-black transition-colors bg-transparent" 
                      />
                    </div>
                    <div className="flex-1 min-w-[120px] space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold font-sans">Season</label>
                      <input 
                        value={result.season} 
                        onChange={(e) => setResult({...result, season: e.target.value})}
                        className="text-xs font-sans text-gray-900 border-b border-gray-200 pb-2 w-full outline-none focus:border-black transition-colors bg-transparent" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveToCloset}
                  disabled={isSaving || isAdded}
                  className="w-full h-14 rounded-full bg-black text-white font-sans text-sm font-semibold tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : isAdded ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <Sparkles size={18} />
                  )}
                  {isSaving ? "SAVING..." : isAdded ? "ADDED" : "ADD TO CLOSET"}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
