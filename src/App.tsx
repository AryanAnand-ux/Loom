import { lazy, Suspense, useState, useEffect, Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate, Link } from "react-router-dom";
import { User, onAuthStateChanged } from "firebase/auth";
import { LayoutDashboard, Shirt, Sparkles, PlusCircle, ChevronLeft, Menu, Bookmark, Settings as SettingsIcon } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import Auth from "./components/Auth";
import { auth } from "./lib/firebase";
import { motion, AnimatePresence } from "motion/react";

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
const SettingsPage = lazy(() => import("./components/Settings/SettingsPage"));
const ProfilePage = lazy(() => import("./components/Settings/ProfilePage"));
const AboutPage = lazy(() => import("./components/Settings/AboutPage"));
const ChangePasswordPage = lazy(() => import("./components/Settings/ChangePasswordPage"));
const PrivacyPage = lazy(() => import("./components/Settings/PrivacyPage"));
const DeleteAccountPage = lazy(() => import("./components/Settings/DeleteAccountPage"));

// ─── Nav config ──────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/closet",    icon: Shirt,           label: "My Closet"  },
  { to: "/lookbook",  icon: Bookmark,        label: "Lookbook"   },
  { to: "/stylist",   icon: Sparkles,        label: "Outfit Maker" },
  { to: "/add",       icon: PlusCircle,      label: "Add Item"   },
  { to: "/settings",  icon: SettingsIcon,    label: "Settings"   },
];

// ─── Desktop Sidebar NavItem ─────────────────────────────────────────────────
interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isOpen: boolean;
}

const SidebarNavItem = ({ to, icon: Icon, label, isOpen }: NavItemProps) => (
  <NavLink
    to={to}
    title={!isOpen ? label : ""}
    className={({ isActive }) =>
      `group flex w-full items-center gap-3 rounded-xl py-3 transition-all min-h-[44px] ${
        isOpen ? "px-4" : "justify-center"
      } ${
        isActive ? "bg-black text-white shadow-lg" : "text-gray-500 hover:bg-gray-100 hover:text-black"
      }`
    }
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

// ─── Mobile Bottom Nav ───────────────────────────────────────────────────────
const MobileBottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 flex md:hidden safe-bottom">
    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-all min-h-[56px] ${
            isActive ? "text-black" : "text-gray-400"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[9px] font-bold tracking-widest uppercase leading-none">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authResolved) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f2ed]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-2xl animate-pulse">
          <Shirt size={40} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Analytics />
      <BrowserRouter>
        <div className="flex h-screen bg-[#f5f2ed] text-gray-900 overflow-hidden">

        {/* ── Desktop Sidebar (hidden on mobile) ── */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 288 : 80 }}
          className="hidden md:flex flex-col border-r border-gray-200 bg-white/50 backdrop-blur-sm relative z-50 shrink-0"
        >
          <div className={`p-6 ${!isSidebarOpen ? "flex flex-col items-center" : ""}`}>
            <div className="flex items-center justify-between mb-10 w-full">
              <AnimatePresence mode="wait">
                {isSidebarOpen ? (
                  <Link to="/dashboard">
                    <motion.div
                      key="logo-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white shrink-0">
                        <Shirt size={20} />
                      </div>
                      <h1 className="text-2xl font-serif italic">Loom</h1>
                    </motion.div>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <motion.div
                      key="logo-icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white hover:scale-110 transition-transform shrink-0"
                    >
                      <Shirt size={20} />
                    </motion.div>
                  </Link>
                )}
              </AnimatePresence>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-black min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
              </button>
            </div>

            <nav className="space-y-2 w-full">
              {NAV_ITEMS.map(({ to, icon, label }) => (
                <SidebarNavItem key={to} to={to} icon={icon} label={label} isOpen={isSidebarOpen} />
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Mobile header bar */}
          <div className="flex md:hidden items-center px-4 pt-4 pb-2 gap-3 sticky top-0 z-30 bg-[#f5f2ed]/95 backdrop-blur-md border-b border-gray-100">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white shrink-0">
                <Shirt size={16} />
              </div>
              <h1 className="text-xl font-serif italic flex-1">Loom</h1>
            </Link>
          </div>

          <div className="px-4 py-4 md:p-6 lg:p-10 max-w-7xl mx-auto pb-24 md:pb-10">
            <ErrorBoundary>
              <Suspense fallback={<div className="py-20 text-center text-sm text-gray-500">Loading section...</div>}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard userId={user.uid} user={user} />} />
                  <Route path="/closet" element={<ClosetGrid userId={user.uid} />} />
                  <Route path="/lookbook" element={<Lookbook userId={user.uid} />} />
                  <Route path="/stylist" element={<StylistEngine userId={user.uid} />} />
                  <Route path="/add" element={<AddItemWrapper userId={user.uid} />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/settings/profile" element={<ProfilePage user={user} />} />
                  <Route path="/settings/about" element={<AboutPage />} />
                  <Route path="/settings/change-password" element={<ChangePasswordPage user={user} />} />
                  <Route path="/settings/privacy" element={<PrivacyPage />} />
                  <Route path="/settings/delete-account" element={<DeleteAccountPage user={user} />} />
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
        </main>
      </div>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </BrowserRouter>
    </>
  );
}

function AddItemWrapper({ userId }: { userId: string }) {
  const navigate = useNavigate();
  return <AddItem userId={userId} onComplete={() => navigate('/closet')} />;
}
