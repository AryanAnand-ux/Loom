import { useState } from "react";
import { auth } from "../lib/firebase";
import { seedGuestCloset } from "../services/seedGuestCloset";
import {
  GoogleAuthProvider,
  signInWithPopup,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { LogIn, LogOut, Shirt, UserCircle2, Sparkles, Mail, Lock, UserPlus, Github, Linkedin, Globe } from "lucide-react";
import { motion } from "motion/react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    setAuthError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === "auth/operation-not-allowed") {
        setAuthError("Google Sign-In is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.");
      } else if (error.code !== "auth/popup-closed-by-user") {
        setAuthError(error.message || "Google Sign-In failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (isSignUp && password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message.replace("Firebase: ", "") : "Authentication failed";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    const guestEmail = "guest@gmail.com";
    const guestPass = "123456";
    setEmail(guestEmail);
    setPassword(guestPass);
    setAuthError(null);
    setIsSignUp(false);
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, guestEmail, guestPass);
      seedGuestCloset(cred.user.uid); // fire-and-forget seed
    } catch (error: unknown) {
      const authErr = error as { code?: string; message?: string };
      if (authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential") {
        try {
          const cred = await createUserWithEmailAndPassword(auth, guestEmail, guestPass);
          seedGuestCloset(cred.user.uid); // seed on first creation
        } catch {
          setAuthError("Guest account could not be initialized. Please check Firebase settings.");
        }
      } else {
        setAuthError(authErr.message || "Authentication failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f2ed] p-4 text-center overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-6 py-8"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-black text-white shadow-xl">
            <Shirt size={32} className="md:hidden" />
            <Shirt size={40} className="hidden md:block" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight text-gray-900">Loom</h1>
          <p className="font-sans text-xs tracking-wide text-gray-500 uppercase">Your Smart Wardrobe Assistant</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 text-left">
          <h2 className="text-xl md:text-2xl font-serif italic mb-5 text-center text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" required
                  className="w-full h-12 rounded-full bg-[#f8f8f8] border-none pl-12 pr-6 text-sm focus:ring-2 focus:ring-black transition-all outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Set your password" : "Enter your password"} required
                  className="w-full h-12 rounded-full bg-[#f8f8f8] border-none pl-12 pr-6 text-sm focus:ring-2 focus:ring-black transition-all outline-none"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {isSignUp && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password" required={isSignUp}
                    className="w-full h-12 rounded-full bg-[#f8f8f8] border-none pl-12 pr-6 text-sm focus:ring-2 focus:ring-black transition-all outline-none"
                  />
                </div>
              </motion.div>
            )}

            {authError && (
              <p className="text-red-500 text-xs text-center font-medium px-2 py-1 bg-red-50 rounded-xl">{authError}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button type="submit" disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black py-3 px-4 font-sans text-xs font-semibold tracking-widest text-white transition-all hover:bg-gray-800 disabled:opacity-60 min-h-[48px]">
                {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                {isLoading ? "..." : (isSignUp ? "SIGN UP" : "LOGIN")}
              </button>
              <button type="button" onClick={handleGuestLogin} disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full border-2 border-black bg-transparent py-3 px-4 font-sans text-xs font-semibold tracking-widest text-black transition-all hover:bg-gray-100 disabled:opacity-60 min-h-[48px]">
                <UserCircle2 size={16} />
                GUEST
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-col items-center gap-4 border-t border-gray-100 pt-5">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); setConfirmPassword(""); }}
              className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-black uppercase transition-colors min-h-[44px]"
            >
              {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>

            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] text-gray-300 font-bold">OR</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <button onClick={login} disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-3 px-4 font-sans text-xs font-semibold tracking-widest text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-300 shadow-sm disabled:opacity-60 min-h-[48px]">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              CONTINUE WITH GOOGLE
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#f5f2ed] text-gray-800 border border-gray-200">
            <Sparkles size={36} strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              <strong>Ever feel like you have nothing to wear, even though your wardrobe is packed?</strong> Loom helps you track your clothes and wear them smarter.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              Scroll through your wardrobe, mix and match outfits, and reduce unnecessary purchases — all in one place.
            </p>
          </div>
        </div>
      </motion.div>

        {/* Footer - only on auth page */}
        <footer className="mt-6 text-center text-xs text-gray-500">
          <p className="mb-2">Built by Aryan Anand</p>
          <div className="flex items-center justify-center gap-3">
            <a href="https://github.com/AryanAnand-ux" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-black">
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/aryananand-ux" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-black">
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>
            <a href="https://portfolio-one-phi-97.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-black">
              <Globe size={14} />
              <span>Portfolio</span>
            </a>
            <a href="mailto:aryan.anand1806@gmail.com" className="flex items-center gap-2 text-gray-500 hover:text-black">
              <Mail size={14} />
              <span>Email</span>
            </a>
          </div>
        </footer>
    </div>
  );
}

export function UserProfile({ user, isCollapsed }: { user: User; isCollapsed?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 border-t border-gray-200 ${isCollapsed ? "justify-center" : ""}`}>
      {user.isAnonymous || !user.photoURL ? (
        <div className="h-10 w-10 min-w-[40px] rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500">
          <UserCircle2 size={24} />
        </div>
      ) : (
        <img src={user.photoURL} alt={user.displayName || "User"} className="h-10 w-10 min-w-[40px] rounded-full border border-gray-300" />
      )}
      {!isCollapsed && (
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {user.isAnonymous ? "Guest User" : (user.displayName || user.email?.split("@")[0])}
          </p>
          <p className="truncate text-xs text-gray-500">
            {user.isAnonymous ? "demo@loom.app" : user.email}
          </p>
        </motion.div>
      )}
      {!isCollapsed && (
        <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center" title="Logout">
          <LogOut size={18} />
        </button>
      )}
    </div>
  );
}
