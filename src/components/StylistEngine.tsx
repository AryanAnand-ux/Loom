import { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { suggestOutfit, OutfitSuggestion } from "../services/geminiService";
import { handleFirestoreError, OperationType } from "../lib/errorUtils";
import { Sparkles, Calendar, Loader2, Quote, Info, Bookmark, Check, Sun, CloudRain, Snowflake, Cloud, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClosetItem } from "../types";
import { useCloset } from "../hooks/useCloset";

const SCENES = [
  "College Class", "A Coffee Date", "Professional Interview", "Gym Session",
  "Formal Evening Dinner", "Casual Weekend Outing", "Night Club/Party", "Technical Conference",
];

const WEATHERS = [
  { id: "Sunny", icon: Sun },
  { id: "Cold/Winter", icon: Snowflake },
  { id: "Rainy", icon: CloudRain },
  { id: "Cloudy", icon: Cloud },
];

export default function StylistEngine({ userId }: { userId: string }) {
  const { items: closet } = useCloset(userId);
  const [scene, setScene] = useState(SCENES[0]);
  const [weather, setWeather] = useState(WEATHERS[0].id);
  const [customScene, setCustomScene] = useState("");
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [isCurationInProcess, setIsCurationInProcess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatSuggestionError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("unresolved") || message.includes("could not be resolved")) {
      return "I couldn't map the AI suggestion to items in your closet. Try adding clearer tops, bottoms, and shoes, then dress me again.";
    }

    if (message.includes("dirty")) {
      return "The AI picked an item marked as dirty. Clean that item or swap it out, then try again.";
    }

    return message || "Failed to generate suggestion. Please try again.";
  };

  const styleMe = async (currentRejected: string[] = []) => {
    if (closet.length < 3) {
      setError("Please add at least 3 items to your closet (Top, Bottom, Footwear) first.");
      return;
    }
    setIsCurationInProcess(true);
    setError(null);
    try {
      const activeScene = customScene.trim() || scene;
      const data = await suggestOutfit(closet, `Scene: ${activeScene}. Weather: ${weather}.`, currentRejected);
      setSuggestion(data);
      setIsSaved(false);
    } catch (err) {
      setError(formatSuggestionError(err));
      console.error(err);
    } finally {
      setIsCurationInProcess(false);
    }
  };

  const handleSwap = (itemId: string) => {
    const newRejected = [...rejectedIds, itemId];
    setRejectedIds(newRejected);
    styleMe(newRejected);
  };

  const saveToLookbook = async () => {
    if (!suggestion || !userId) return;
    setIsSaving(true);
    const path = `users/${userId}/outfits`;
    try {
      await addDoc(collection(db, path), {
        ownerId: userId,
        topId: suggestion.topId,
        bottomId: suggestion.bottomId,
        footwearId: suggestion.footwearId,
        stylistNote: suggestion.stylistNote,
        scene: customScene.trim() || scene,
        createdAt: serverTimestamp(),
      });
      setIsSaved(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-4">
      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-serif italic">Outfit Maker</h2>
        <p className="text-gray-500 text-sm">Loom generates outfit suggestions based on your closet and scene.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather */}
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold tracking-widest font-sans text-gray-500">1. Weather</h3>
            <div className="grid grid-cols-2 gap-2">
              {WEATHERS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setWeather(id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-[20px] text-xs font-sans font-bold tracking-widest transition-all uppercase min-h-[48px] ${
                    weather === id
                      ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm border"
                      : "bg-white border border-gray-100 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  <span className="truncate">{id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div className="space-y-3">
            <h3 className="text-[10px] uppercase font-bold tracking-widest font-sans text-gray-500">2. Pick an Occasion</h3>
            <div className="flex flex-wrap gap-2">
              {SCENES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setScene(s); setCustomScene(""); }}
                  className={`px-3 py-2 rounded-full text-xs font-sans tracking-tight transition-all min-h-[40px] ${
                    scene === s && !customScene
                      ? "bg-black text-white shadow-md"
                      : "border border-gray-200 bg-white hover:border-black text-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <label className="text-[10px] uppercase font-bold tracking-widest font-sans text-gray-500 block mb-2">Or describe your day...</label>
              <input
                type="text"
                placeholder="Going to a rainy open mic..."
                value={customScene}
                onChange={(e) => setCustomScene(e.target.value)}
                className="w-full h-12 rounded-xl bg-white border border-gray-200 px-4 text-sm font-sans focus:border-black outline-none transition-all"
              />
            </div>
          </div>

          <button
            onClick={() => styleMe(rejectedIds)}
            disabled={isCurationInProcess}
            className="w-full h-14 rounded-3xl bg-black text-white font-sans text-sm font-semibold tracking-widest flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl group cursor-pointer"
          >
            {isCurationInProcess ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
            {isCurationInProcess ? "CURATING YOUR LOOK..." : (rejectedIds.length > 0 ? "REFRESH CURATION" : "DRESS ME")}
          </button>

          {error && <p className="text-red-500 text-sm flex items-center gap-2"><Info size={16} />{error}</p>}
        </div>

        {/* Result */}
        <div className="lg:col-span-3 min-h-[300px] md:min-h-[400px]">
          <AnimatePresence mode="wait">
            {!suggestion ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full w-full rounded-[40px] border-2 border-dashed border-gray-200 bg-white/50 flex flex-col items-center justify-center p-8 md:p-12 text-center gap-4 text-gray-400 min-h-[280px]">
                <div className="h-16 w-16 items-center justify-center flex bg-gray-50 rounded-full">
                  <Calendar size={32} />
                </div>
                <p className="font-serif italic text-lg text-gray-500">Pick a scene to begin curation</p>
                <p className="text-xs font-sans tracking-wide max-w-xs">I will browse your closet and find items that aren't in the laundry.</p>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-6">
                <div className="bg-white p-6 md:p-8 rounded-[40px] shadow-2xl border border-gray-100 flex flex-col gap-6 md:gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px bg-gray-900 flex-1" />
                      <span className="text-[10px] uppercase font-bold tracking-widest font-sans shrink-0">Selected Outfit</span>
                      <div className="h-px bg-gray-900 flex-1" />
                    </div>
                    <div className="space-y-6">
                      <OutfitRow label="Top" itemId={suggestion.topId} closet={closet} onSwap={() => handleSwap(suggestion.topId)} isCurating={isCurationInProcess} />
                      <OutfitRow label="Bottom" itemId={suggestion.bottomId} closet={closet} onSwap={() => handleSwap(suggestion.bottomId)} isCurating={isCurationInProcess} />
                      <OutfitRow label="Footwear" itemId={suggestion.footwearId} closet={closet} onSwap={() => handleSwap(suggestion.footwearId)} isCurating={isCurationInProcess} />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-3xl relative overflow-hidden">
                    <Quote size={36} className="absolute -top-2 -left-2 text-gray-200" />
                    <div className="relative">
                      <p className="text-sm font-serif italic text-gray-700 leading-relaxed">"{suggestion.stylistNote}"</p>
                      <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-black/40 font-sans">— Loom AI Analyst</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={saveToLookbook}
                    disabled={isSaving || isSaved}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-sans font-bold tracking-widest transition-all min-h-[48px] ${
                      isSaved ? "bg-green-500 text-white" : "bg-white border border-gray-200 hover:border-black text-gray-900"
                    }`}
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : (isSaved ? <Check size={14} /> : <Bookmark size={14} />)}
                    {isSaved ? "SAVED TO LOOKBOOK" : "SAVE TO LOOKBOOK"}
                  </button>
                  <button
                    onClick={() => { setSuggestion(null); setRejectedIds([]); }}
                    className="text-xs font-sans text-gray-400 hover:text-black font-bold tracking-widest transition-colors uppercase min-h-[48px] px-4"
                  >
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OutfitRow({ label, itemId, closet, onSwap, isCurating }: {
  label: string; itemId: string; closet: ClosetItem[]; onSwap: () => void; isCurating: boolean;
}) {
  const item = closet.find(i => i.id === itemId);
  if (!item) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-sans">{label}</h4>
          <p className="text-sm font-serif italic text-gray-400">Item no longer in closet</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm shrink-0">
          <img src={item.imageUrl} alt={item.category} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-sans">{label}</h4>
          <p className="text-lg md:text-xl font-serif italic text-gray-900 truncate">{item.category}</p>
        </div>
      </div>
      <button
        onClick={onSwap} disabled={isCurating} title="Swap item"
        className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-gray-50 hover:bg-black hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Swap ${label}`}
      >
        <RefreshCw size={18} />
      </button>
    </div>
  );
}
