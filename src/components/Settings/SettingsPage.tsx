import { signOut } from "firebase/auth";
import { motion } from "motion/react";
import { LogOut } from "lucide-react";
import SettingsMenuItem from "./SettingsMenuItem";
import { User, Lock, Shield, AlertTriangle, Code } from "lucide-react";
import { auth } from "../../lib/firebase";

export default function SettingsPage() {
  const handleSignOut = async () => {
    await signOut(auth);
  };
  const SETTINGS_ITEMS = [
    { to: "profile", icon: User, label: "Profile", description: "Manage your account info" },
    { to: "about", icon: Code, label: "About & Contact", description: "Source, socials and contact" },
    { to: "change-password", icon: Lock, label: "Change Password", description: "Update your password" },
    { to: "privacy", icon: Shield, label: "Privacy", description: "Privacy & data" },
    { to: "delete-account", icon: AlertTriangle, label: "Delete Account", description: "Permanently remove account" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 pb-4"
    >
      <header className="space-y-1">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Account Management</p>
        <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900">Settings</h2>
      </header>

      <div className="grid gap-3">
        {SETTINGS_ITEMS.map((item, idx) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <SettingsMenuItem {...item} to={`/settings/${item.to}`} />
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <motion.button
          onClick={handleSignOut}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all text-xs font-semibold tracking-widest uppercase"
        >
          <LogOut size={14} />
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
}
