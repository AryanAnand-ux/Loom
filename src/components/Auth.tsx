import { useState } from "react";
import { auth } from "../lib/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { LogIn, LogOut, Shirt, UserCircle2, Sparkles, Mail, Lock, UserPlus } from "lucide-react";
import { motion } from "motion/react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: unknown) {
      console.error("Auth error:", error);
      const errorMessage = error instanceof Error ? error.message.replace("Firebase: ", "") : "Authentication failed";
      setAuthError(errorMessage);
    }
  };

  const handleGuestLogin = async () => {
    const guestEmail = "guest@gmail.com";
    const guestPass = "123456";
    
    setEmail(guestEmail);
    setPassword(guestPass);
    setAuthError(null);
    setIsSignUp(false);

    try {
      await signInWithEmailAndPassword(auth, guestEmail, guestPass);
    } catch (error: unknown) {
      // If guest doesn't exist, create it automatically
      const authError = error as { code?: string; message?: string };
      if (authError.code === "auth/user-not-found" || authError.code === "auth/invalid-credential") {
        try {
          await createUserWithEmailAndPassword(auth, guestEmail, guestPass);
        } catch {
          setAuthError("Guest account could not be initialized. Please check Firebase settings.");
        }
      } else {
        const message = authError.message || "Authentication failed";
        setAuthError(message);
      }
    }
  };



  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f2ed] p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl space-y-8"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-xl">
            <Shirt size={40} />
          </div>
          <h1 className="text-5xl font-serif italic tracking-tight text-gray-900">Loom</h1>
          <p className="font-sans text-sm tracking-wide text-gray-500 uppercase">Your Smart Wardrobe Assistant</p>
        </div>

        {/* Login Area */}
        <div className="mx-auto max-w-lg bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h2 className="text-2xl font-serif italic mb-6 text-center text-gray-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-4">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 rounded-full bg-[#f8f8f8] border-none pl-12 pr-6 text-sm focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-4">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 rounded-full bg-[#f8f8f8] border-none pl-12 pr-6 text-sm focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

            {authError && <p className="text-red-500 text-[10px] text-center font-medium px-4">{authError}</p>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 group flex items-center justify-center gap-2 rounded-full bg-black py-3 px-4 font-sans text-xs font-semibold tracking-widest text-white transition-all hover:bg-gray-800"
              >
                {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                {isSignUp ? "SIGN UP" : "LOGIN"}
              </button>
              
              <button
                type="button"
                onClick={handleGuestLogin}
                className="flex-1 group flex items-center justify-center gap-2 rounded-full border-2 border-black bg-transparent py-3 px-4 font-sans text-xs font-semibold tracking-widest text-black transition-all hover:bg-gray-100"
              >
                <UserCircle2 size={16} />
                LOGIN AS GUEST
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4 border-t border-gray-100 pt-6">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-black uppercase transition-colors"
            >
              {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
            </button>

            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <span className="text-[10px] text-gray-300 font-bold">OR</span>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>

            <button
              onClick={login}
              className="text-[10px] font-bold tracking-widest text-gray-400 hover:text-black uppercase transition-all flex items-center gap-2"
            >
              Continue with Google
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="mx-auto bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-8 text-left">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-[#f5f2ed] text-gray-800 border border-gray-200">
            <Sparkles size={48} strokeWidth={1.5} />
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              <strong>Ever feel like you have nothing to wear, even though your wardrobe is packed?</strong> Loom is here to change that. It helps you keep track of what clothes you already have and how often you wear them—all from your phone.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed font-sans">
              No more digging through piles or buying clothes you don't need. Just scroll through your wardrobe, mix and match outfits, and you'll always know what you've got. Plus, by reducing unnecessary purchases, we're all about sustainability and keeping your wardrobe organized.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export function UserProfile({ user, isCollapsed }: { user: User; isCollapsed?: boolean }) {
  return (
    <div className={`flex items-center gap-4 p-4 border-t border-gray-200 ${isCollapsed ? "justify-center" : ""}`}>
      {user.isAnonymous || !user.photoURL ? (
        <div className="h-10 w-10 min-w-10 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500">
          <UserCircle2 size={24} />
        </div>
      ) : (
        <img src={user.photoURL} alt={user.displayName || "User"} className="h-10 w-10 min-w-10 rounded-full border border-gray-300" />
      )}
      {!isCollapsed && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 overflow-hidden"
        >
          <p className="truncate text-sm font-medium text-gray-900">
            {user.isAnonymous ? "Guest User" : user.displayName}
          </p>
          <p className="truncate text-xs text-gray-500">
            {user.isAnonymous ? "demo@loom.app" : user.email}
          </p>
        </motion.div>
      )}
      {!isCollapsed && (
        <button
          onClick={() => signOut(auth)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      )}
    </div>
  );
}
