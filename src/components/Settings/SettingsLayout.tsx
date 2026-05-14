import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

interface SettingsLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function SettingsLayout({ title, subtitle, children }: SettingsLayoutProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 pb-4 max-w-2xl mx-auto"
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {subtitle && <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-1">{subtitle}</p>}
          <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900 break-words">{title}</h2>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold tracking-widest uppercase text-gray-600 hover:border-black hover:text-black hover:bg-gray-50 transition-all min-h-[44px] shrink-0"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </button>
      </header>

      {children}
    </motion.div>
  );
}
