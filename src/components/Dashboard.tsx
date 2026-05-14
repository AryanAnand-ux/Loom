import { useMemo } from "react";
import { Shirt, Droplets, Heart, Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { User as FirebaseUser } from "firebase/auth";
import { ClosetItem } from "../types";
import { useNavigate } from "react-router-dom";
import { useCloset } from "../hooks/useCloset";
import { useOutfits } from "../hooks/useOutfits";

export default function Dashboard({ userId, user }: { userId: string; user: FirebaseUser }) {
  const navigate = useNavigate();
  const { items, loading } = useCloset(userId);
  const { outfits } = useOutfits(userId, 3);

  const stats = useMemo(() => ({
    total: items.length,
    dirty: items.filter(i => i.isDirty).length,
    favorites: items.filter(i => i.isFavorite).length,
    looks: outfits.length
  }), [items, outfits]);

  const categoryData = useMemo(() => items.reduce((acc: Array<{name: string, value: number}>, item) => {
    const existing = acc.find(a => a.name === item.category);
    if (existing) existing.value++;
    else acc.push({ name: item.category, value: 1 });
    return acc;
  }, []), [items]);

  const COLORS = ["#000000", "#4A4A4A", "#8E8E8E", "#C6C6C6", "#E5E5E5"];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const userName = user.isAnonymous ? "Guest" : (user.displayName || "Friend");

  return (
    <div className="space-y-8 md:space-y-12 pb-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-[2.5rem] p-6 md:p-8 text-white shadow-sm"
      >
        <p className="text-sm md:text-base font-serif italic mb-2">{getGreeting()}, <span className="font-bold">{userName}</span>! 👋</p>

      </motion.div>

      <header className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900">Wardrobe Overview</h2>
        <p className="text-gray-500 font-sans tracking-wide uppercase text-[10px] font-bold">Analytics &amp; Curation Center</p>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Shirt} label="Total Items" value={stats.total} />
        <StatCard icon={Droplets} label="Laundry" value={stats.dirty} highlight={stats.dirty > 0} />
        <StatCard icon={Heart} label="Favorites" value={stats.favorites} />
        <StatCard icon={Bookmark} label="Lookbook" value={stats.looks} onClick={() => navigate('/lookbook')} interactive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg md:text-xl font-serif italic text-gray-900">Recent Arrivals</h3>
              <button onClick={() => navigate('/closet')} className="text-[10px] font-sans font-bold tracking-widest text-gray-400 hover:text-black uppercase min-h-[44px] px-2">
                Explore All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : items.length > 0 ? (
                items.slice(0, 5).map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group">
                    <img src={item.imageUrl} alt="" loading="lazy" decoding="async"
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-white/50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-serif italic">Your closet is empty.</p>
                </div>
              )}
            </div>
          </section>

          {outfits.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-lg md:text-xl font-serif italic text-gray-900">Saved Looks</h3>
                <button onClick={() => navigate('/lookbook')} className="text-[10px] font-sans font-bold tracking-widest text-gray-400 hover:text-black uppercase min-h-[44px] px-2">
                  Lookbook
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm space-y-3">
                    <div className="flex -space-x-4">
                      <OutfitCircle itemId={outfit.topId} items={items} />
                      <OutfitCircle itemId={outfit.bottomId} items={items} />
                      <OutfitCircle itemId={outfit.footwearId} items={items} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-sans mb-1">{outfit.scene}</p>
                      <p className="text-xs font-serif italic text-gray-600 line-clamp-2 leading-relaxed">"{outfit.stylistNote}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Chart */}
        <div>
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-50">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-6">Composition</h4>
            <div className="h-52 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: "Empty", value: 1 }]}
                    innerRadius={50} outerRadius={70} paddingAngle={5} cornerRadius={10} dataKey="value"
                  >
                    {categoryData.map((_e, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {categoryData.length === 0 && <Cell key="empty" fill="#f3f4f6" />}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-sans text-gray-600 truncate">{cat.name}</span>
                  </div>
                  <span className="font-mono text-gray-400 ml-2">{cat.value}</span>
                </div>
              ))}
              {categoryData.length > 4 && (
                <p className="text-[10px] text-center text-gray-400 pt-2 font-sans uppercase tracking-widest">
                  + {categoryData.length - 4} more categories
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutfitCircle({ itemId, items }: { itemId: string; items: ClosetItem[] }) {
  const item = items.find(i => i.id === itemId);
  return (
    <div className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden shrink-0 shadow-sm">
      {item && <img src={item.imageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, highlight = false, interactive = false, onClick }: {
  icon: React.ElementType; label: string; value: number;
  highlight?: boolean; interactive?: boolean; onClick?: () => void;
}) {
  const Component = interactive ? motion.button : motion.div;
  return (
    <Component onClick={onClick} whileHover={interactive ? { y: -2 } : {}}
      className={`p-4 md:p-6 rounded-3xl border ${highlight ? "bg-red-50 border-red-100" : "bg-white border-gray-100"} ${interactive ? "cursor-pointer hover:shadow-md transition-shadow text-left w-full" : "shadow-sm"}`}>
      <div className={`h-9 w-9 rounded-2xl flex items-center justify-center mb-3 ${highlight ? "bg-red-500 text-white" : "bg-gray-50 text-gray-400"}`}>
        <Icon size={18} />
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-serif italic ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </Component>
  );
}
