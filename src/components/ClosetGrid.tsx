import { useState, useMemo } from "react";
import { db, storage } from "../lib/firebase";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { handleFirestoreError, OperationType } from "../lib/errorUtils";
import { useCloset } from "../hooks/useCloset";
import { Trash2, Droplets, Wind, Search, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClosetItem } from "../types";

// Re-export for backward compatibility — import from "../types" directly in new code
export type { ClosetItem };

export default function ClosetGrid({ userId }: { userId: string }) {
  const { items, loading, error } = useCloset(userId);
  const [filter, setFilter] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");


  const toggleLaundry = async (id: string, isDirty: boolean) => {
    const path = `users/${userId}/closet/${id}`;
    try {
      await updateDoc(doc(db, path), { isDirty });
    } catch (err) {
      console.error("toggleLaundry: Firestore update failed", err);
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    const path = `users/${userId}/closet/${id}`;
    try {
      await updateDoc(doc(db, path), { isFavorite });
    } catch (err) {
      console.error("toggleFavorite: Firestore update failed", err);
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteItem = async (id: string, storagePath?: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    const path = `users/${userId}/closet/${id}`;
    try {
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef).catch((e) =>
          console.warn("Image delete failed (might be already gone):", e)
        );
      }
      await deleteDoc(doc(db, path));
    } catch (err) {
      console.error("deleteItem: Firestore delete failed", err);
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const filteredItems = useMemo(() => items.filter((item) => {
    const matchesSearch =
      item.category.toLowerCase().includes(filter.toLowerCase()) ||
      item.vibe.toLowerCase().includes(filter.toLowerCase());
    let matchesTab = true;

    const catLower = item.category.toLowerCase();
    const isTopWear = ["t-shirt", "shirt", "hoodie", "sweater", "jacket", "top", "blouse", "coat", "tank top", "sweatshirt"].some((k) => catLower.includes(k));
    const isBottomWear = ["jeans", "pants", "shorts", "skirt", "bottom", "trousers", "joggers", "leggings"].some((k) => catLower.includes(k));
    const isShoes = ["shoes", "sneakers", "boots", "heels", "sandals", "footwear", "oxfords", "loafers", "trainers"].some((k) => catLower.includes(k));

    if (selectedFilter === "Favorites") matchesTab = item.isFavorite;
    else if (selectedFilter === "Needs Laundry") matchesTab = item.isDirty;
    else if (selectedFilter === "Top Wear") matchesTab = isTopWear || catLower.includes("top wear");
    else if (selectedFilter === "Bottom Wear") matchesTab = isBottomWear || catLower.includes("bottom wear");
    else if (selectedFilter === "Shoes") matchesTab = isShoes || catLower.includes("shoes");
    else if (selectedFilter !== "All") matchesTab = item.category === selectedFilter;

    return matchesSearch && matchesTab;
  }), [items, filter, selectedFilter]);

  const presetTabs = ["All", "Top Wear", "Bottom Wear", "Shoes", "Favorites", "Needs Laundry"];
  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(items.map((i) => i.category))).filter((cat: string) => {
      const catLower = cat.toLowerCase();
      const isTopWear = ["t-shirt", "shirt", "hoodie", "sweater", "jacket", "top", "blouse", "coat", "tank top", "sweatshirt"].some((k) => catLower.includes(k));
      const isBottomWear = ["jeans", "pants", "shorts", "skirt", "bottom", "trousers", "joggers", "leggings"].some((k) => catLower.includes(k));
      const isShoes = ["shoes", "sneakers", "boots", "heels", "sandals", "footwear", "oxfords", "loafers", "trainers"].some((k) => catLower.includes(k));
      if (isTopWear || isBottomWear || isShoes) return false;
      if (["top wear", "bottom wear", "shoes", "favorites", "needs laundry", "all"].includes(catLower)) return false;
      return true;
    });
    return [...presetTabs, ...dynamicCategories].slice(0, 15);
  }, [items]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-[3/4] bg-white rounded-3xl animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif italic">My Closet</h2>
          <p className="text-gray-500 text-sm">{items.length} pieces collected</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items, vibes, or styles..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full h-12 rounded-full bg-white border border-gray-200 pl-12 pr-6 text-sm font-sans focus:border-black focus:ring-0 transition-all outline-none shadow-sm"
          />
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Could not load closet items.</p>
          <p className="text-xs mt-1 break-all">{error}</p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-gray-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all border ${
              selectedFilter === cat
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-center text-gray-400">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Wind size={32} />
          </div>
          <p className="font-serif italic text-lg text-gray-500">Silence in the closet...</p>
          <p className="text-xs font-sans tracking-wide">Try adjusting your search or add new pieces.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-20">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col gap-3"
              >
                <div className="relative h-64 overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-xl group-hover:-translate-y-1">
                  <img
                    src={item.imageUrl}
                    alt={item.category}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {item.isDirty && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Droplets size={24} />
                        <span className="text-[10px] uppercase font-bold tracking-widest font-sans">Needs Laundry</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id, !item.isFavorite); }}
                      className={`h-8 w-8 flex items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all ${
                        item.isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart size={14} className={item.isFavorite ? "fill-current" : ""} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 flex gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => toggleLaundry(item.id, !item.isDirty)}
                      className={`h-10 w-10 flex items-center justify-center rounded-full shadow-lg ${
                        item.isDirty ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:text-blue-500"
                      }`}
                      title={item.isDirty ? "Mark as Clean" : "Mark as Dirty"}
                    >
                      <Droplets size={16} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id, item.storagePath)}
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-red-500 shadow-lg"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-md rounded-full text-[8px] font-sans font-bold text-white uppercase tracking-widest">
                    {item.vibe}
                  </div>
                </div>

                <div className="px-1">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{item.category}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold font-sans">{item.season}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
