import { useMemo } from "react";
import { Shirt, Droplets, Heart, Bookmark } from "lucide-react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ClosetItem } from "../types";
import { useNavigate } from "react-router-dom";
import { useCloset } from "../hooks/useCloset";
import { useOutfits } from "../hooks/useOutfits";

export default function Dashboard({ 
  userId
}: { 
  userId: string;
}) {
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

  return (
    <div className="space-y-12 pb-20">
      <header className="space-y-2">
        <h2 className="text-4xl font-serif italic text-gray-900">Wardrobe Overview</h2>
        <p className="text-gray-500 font-sans tracking-wide uppercase text-[10px] font-bold">
          Analytics & Curation Center
        </p>
      </header>

      {/* Quick Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Shirt} label="Total Items" value={stats.total} />
        <StatCard icon={Droplets} label="Laundry" value={stats.dirty} highlight={stats.dirty > 0} />
        <StatCard icon={Heart} label="Favorites" value={stats.favorites} />
        <StatCard icon={Bookmark} label="Lookbook" value={stats.looks} onClick={() => navigate('/lookbook')} interactive />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Content */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif italic text-gray-900">Recent Arrivals</h3>
                <button
                  onClick={() => navigate('/closet')}
                  className="text-[10px] font-sans font-bold tracking-widest text-gray-400 hover:text-black uppercase"
                >
                  Explore All
                </button>
              </div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse" />
                ))
              ) : items.length > 0 ? (
                items.slice(0, 5).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group relative"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt="" 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" 
                    />
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
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-xl font-serif italic text-gray-900">Saved Looks</h3>
                <button 
                  onClick={() => navigate('/lookbook')}
                  className="text-[10px] font-sans font-bold tracking-widest text-gray-400 hover:text-black uppercase"
                >
                  Lookbook
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm space-y-4">
                    <div className="flex -space-x-4 mb-4">
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

        {/* Right: Insights */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 h-full">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-8">Composition</h4>
            
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: "Empty", value: 1 }]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    cornerRadius={10}
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {categoryData.length === 0 && <Cell key="empty" fill="#f3f4f6" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    itemStyle={{ fontSize: "12px", fontFamily: "sans-serif" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {categoryData.slice(0, 4).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-sans text-gray-600">{cat.name}</span>
                  </div>
                  <span className="font-mono text-gray-400">{cat.value}</span>
                </div>
              ))}
              {categoryData.length > 4 && (
                <p className="text-[10px] text-center text-gray-400 pt-4 font-sans uppercase tracking-widest">
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

function StatCard({ icon: Icon, label, value, highlight = false, interactive = false, onClick }: { icon: React.ElementType; label: string; value: number; highlight?: boolean; interactive?: boolean; onClick?: () => void }) {
  const Component = interactive ? motion.button : motion.div;
  return (
    <Component 
      onClick={onClick}
      whileHover={interactive ? { y: -2 } : {}}
      className={`p-6 rounded-3xl border ${highlight ? "bg-red-50 border-red-100" : "bg-white border-gray-100"} ${interactive ? "cursor-pointer hover:shadow-md transition-shadow text-left" : "shadow-sm"}`}
    >
      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-4 ${highlight ? "bg-red-500 text-white" : "bg-gray-50 text-gray-400"}`}>
        <Icon size={20} />
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-serif italic ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </Component>
  );
}
