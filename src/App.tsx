import { lazy, Suspense, useState, useEffect, Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { User, signOut, onAuthStateChanged } from "firebase/auth";
import { LayoutDashboard, Shirt, Sparkles, PlusCircle, ChevronLeft, Menu, Bookmark, LogOut } from "lucide-react";
import Auth, { UserProfile } from "./components/Auth";
import { auth } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import DebugPanel from "./components/DebugPanel";

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-20 text-center space-y-3">
          <p className="text-lg font-serif italic text-gray-700">Something went wrong.</p>
          <p className="text-xs text-gray-400 font-sans">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-4 px-6 py-2 rounded-full bg-black text-white text-xs font-sans tracking-widest"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = lazy(() => import("./components/Dashboard"));
const ClosetGrid = lazy(() => import("./components/ClosetGrid"));
const Lookbook = lazy(() => import("./components/Lookbook"));
const StylistEngine = lazy(() => import("./components/StylistEngine"));
const AddItem = lazy(() => import("./components/AddItem"));

// ─── NavItem (module-level to avoid recreation on every App render) ─────────
interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
}

const NavItem = ({ to, icon: Icon, label, isOpen }: NavItemProps) => (
  <NavLink
    to={to}
    title={!isOpen ? label : ""}
    className={({ isActive }) => `group flex w-full items-center gap-3 rounded-xl py-3 transition-all ${
      isOpen ? "px-4" : "justify-center"
    } ${
      isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100 hover:text-black"
    }`}
  >
    {({ isActive }) => (
      <>
        <Icon size={20} className={`${isActive ? "scale-110" : "group-hover:scale-110"} transition-transform flex-shrink-0`} />
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="font-sans text-sm font-medium tracking-wide whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </>
    )}
  </NavLink>
);

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1200; // 1.2 seconds for a premium feel
    const intervalTime = 20;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(newProgress);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(onComplete, 300); // slight pause at 100% before transitioning
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#f5f2ed] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-xs flex-col items-center gap-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-2xl">
          <Shirt size={40} />
        </div>
        
        <div className="w-full space-y-2">
          <div className="flex w-full items-end justify-between px-1">
            <h1 className="text-2xl font-serif italic tracking-tight text-gray-900">Loom</h1>
            <motion.span 
              className="font-mono text-sm font-bold text-gray-500"
              key={progress}
              initial={{ opacity: 0.5, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {progress}%
            </motion.span>
          </div>
          
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div 
              className="h-full bg-black rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authResolved || !introFinished) {
    return (
      <AnimatePresence>
        <LoadingScreen onComplete={() => setIntroFinished(true)} />
      </AnimatePresence>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#f5f2ed] text-gray-900 overflow-hidden">
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 288 : 80 }}
          className="flex flex-col border-r border-gray-200 bg-white/50 backdrop-blur-sm relative z-50"
        >
          <div className={`p-6 ${!isSidebarOpen ? "flex flex-col items-center" : ""}`}>
            <div className="flex items-center justify-between mb-10 w-full">
              <AnimatePresence mode="wait">
                {isSidebarOpen ? (
                  <motion.div 
                    key="logo-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                      <Shirt size={20} />
                    </div>
                    <h1 className="text-2xl font-serif italic">Loom</h1>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="logo-icon"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white cursor-pointer"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Shirt size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-black"
              >
                {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
            </div>

            <nav className="space-y-2 w-full">
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" isOpen={isSidebarOpen} />
              <NavItem to="/closet" icon={Shirt} label="My Closet" isOpen={isSidebarOpen} />
              <NavItem to="/lookbook" icon={Bookmark} label="Lookbook" isOpen={isSidebarOpen} />
              <NavItem to="/stylist" icon={Sparkles} label="Stylist AI" isOpen={isSidebarOpen} />
              <NavItem to="/add" icon={PlusCircle} label="Add New Item" isOpen={isSidebarOpen} />
            </nav>
          </div>

          <div className="mt-auto">
            <UserProfile user={user} isCollapsed={!isSidebarOpen} />
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Top Right Logout Button */}
          <div className="absolute top-6 right-8 z-40">
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm group"
              title="Logout"
            >
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Sign Out</span>
              <LogOut size={18} />
            </button>
          </div>

          <div className="p-10 max-w-7xl mx-auto">
            <ErrorBoundary>
            <Suspense fallback={<div className="py-20 text-center text-sm text-gray-500">Loading section...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard userId={user.uid} />} />
                <Route path="/closet" element={<ClosetGrid userId={user.uid} />} />
                <Route path="/lookbook" element={<Lookbook userId={user.uid} />} />
                <Route path="/stylist" element={<StylistEngine userId={user.uid} />} />
                <Route path="/add" element={<AddItemWrapper userId={user.uid} />} />
                <Route path="*" element={
                  <div className="py-20 text-center space-y-3">
                    <p className="text-3xl font-serif italic text-gray-700">Page not found.</p>
                    <p className="text-sm text-gray-400">The page you're looking for doesn't exist.</p>
                  </div>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
          </div>
          {import.meta.env.DEV && <DebugPanel />}
        </main>
      </div>
    </BrowserRouter>
  );
}

function AddItemWrapper({ userId }: { userId: string }) {
  const navigate = useNavigate();
  return <AddItem userId={userId} onComplete={() => navigate('/closet')} />;
}

