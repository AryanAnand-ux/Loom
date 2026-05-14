import { useState, useMemo } from "react";
import { db, storage } from "../lib/firebase";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { handleFirestoreError, OperationType } from "../lib/errorUtils";
import { useCloset } from "../hooks/useCloset";
import { Trash2, Droplets, Wind, Search, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClosetItem } from "../types";

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
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    const path = `users/${userId}/closet/${id}`;
    try {
      await updateDoc(doc(db, path), { isFavorite });
    } catch (err) {
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
    const isAccessories = ["accessory", "accessories", "watch", "watches", "chain", "chains", "bracelet", "bracelets", "necklace", "necklaces", "ring", "rings", "belt", "belts", "bag", "bags", "sunglasses", "glasses", "cap", "hat"].some((k) => catLower.includes(k));
    if (selectedFilter === "Favorites") matchesTab = item.isFavorite;
    else if (selectedFilter === "Needs Laundry") matchesTab = item.isDirty;
    else if (selectedFilter === "Top Wear") matchesTab = isTopWear || catLower.includes("top wear");
    else if (selectedFilter === "Bottom Wear") matchesTab = isBottomWear || catLower.includes("bottom wear");
    else if (selectedFilter === "Shoes") matchesTab = isShoes || catLower.includes("shoes");
    else if (selectedFilter === "Accessories") matchesTab = isAccessories || catLower.includes("accessories");
    else if (selectedFilter !== "All") matchesTab = item.category === selectedFilter;
    return matchesSearch && matchesTab;
  }), [items, filter, selectedFilter]);

  const presetTabs = ["All", "Top Wear", "Bottom Wear", "Shoes", "Accessories", "Favorites", "Needs Laundry"];
  const categories = useMemo(() => {
    const dynamicCategories = Array.from(new Set(items.map((i) => i.category))).filter((cat: string) => {
      const catLower = cat.toLowerCase();
      const isTopWear = ["t-shirt", "shirt", "hoodie", "sweater", "jacket", "top", "blouse", "coat", "tank top", "sweatshirt"].some((k) => catLower.includes(k));
      const isBottomWear = ["jeans", "pants", "shorts", "skirt", "bottom", "trousers", "joggers", "leggings"].some((k) => catLower.includes(k));
      const isShoes = ["shoes", "sneakers", "boots", "heels", "sandals", "footwear", "oxfords", "loafers", "trainers"].some((k) => catLower.includes(k));
      const isAccessories = ["accessory", "accessories", "watch", "watches", "chain", "chains", "bracelet", "bracelets", "necklace", "necklaces", "ring", "rings", "belt", "belts", "bag", "bags", "sunglasses", "glasses", "cap", "hat"].some((k) => catLower.includes(k));
      if (isTopWear || isBottomWear || isShoes || isAccessories) return false;
      if (["top wear", "bottom wear", "shoes", "accessories", "favorites", "needs laundry", "all"].includes(catLower)) return false;
      return true;
    });
    return [...presetTabs, ...dynamicCategories].slice(0, 15);
  }, [items]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-[3/4] bg-white rounded-3xl animate-pulse shadow-sm" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-col gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-serif italic">My Closet</h2>
          <p className="text-gray-500 text-sm">{items.length} pieces collected</p>
        </div>

        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

      {/* Filter Tabs — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-gray-100 -mx-4 px-4 md:mx-0 md:px-0 snap-x scroll-px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2.5 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all border snap-start min-h-[40px] ${
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
        <div className="flex flex-col items-center justify-center gap-4 text-center text-gray-400 py-24">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
            <Wind size={32} />
          </div>
          <p className="font-serif italic text-lg text-gray-500">Silence in the closet...</p>
          <p className="text-xs font-sans tracking-wide">Try adjusting your search or add new pieces.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 pb-4">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group flex flex-col gap-2"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
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

                  {/* Favorite — always visible on touch */}
                  <div className="absolute top-2 left-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id, !item.isFavorite); }}
                      className={`h-9 w-9 flex items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all ${
                        item.isFavorite ? "bg-red-500 text-white" : "bg-white/80 text-gray-400 hover:text-red-500"
                      }`}
                      aria-label={item.isFavorite ? "Unfavorite" : "Favorite"}
                    >
                      <Heart size={14} className={item.isFavorite ? "fill-current" : ""} />
                    </button>
                  </div>

                  {/* Action buttons — always visible on mobile, hover on desktop */}
                  <div className="absolute bottom-2 left-2 flex gap-2 md:translate-y-12 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => toggleLaundry(item.id, !item.isDirty)}
                      className={`h-9 w-9 flex items-center justify-center rounded-full shadow-lg ${
                        item.isDirty ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:text-blue-500"
                      }`}
                      title={item.isDirty ? "Mark as Clean" : "Mark as Dirty"}
                      aria-label={item.isDirty ? "Mark as Clean" : "Mark as Dirty"}
                    >
                      <Droplets size={15} />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id, item.storagePath)}
                      className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-red-500 shadow-lg"
                      title="Delete Item"
                      aria-label="Delete item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-[8px] font-sans font-bold text-white uppercase tracking-widest max-w-[80px] truncate">
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
