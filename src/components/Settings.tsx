import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../lib/firebase";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  deleteUser,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, writeBatch } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { ArrowLeft, Bell, CheckCircle2, Loader2, Lock, ShieldAlert, Trash2 } from "lucide-react";
import { motion } from "motion/react";

const THEME_STORAGE_KEY = "loom-settings-theme";
const EMAIL_STORAGE_KEY = "loom-settings-email-notifications";

type ThemePreference = "system" | "light" | "dark";

async function deleteCollectionDocuments(path: string) {
  const snapshot = await getDocs(query(collection(db, path)));
  if (snapshot.empty) return [] as Array<{ storagePath?: string }>;

  const records = snapshot.docs.map((item) => item.data() as { storagePath?: string });
  for (let index = 0; index < snapshot.docs.length; index += 400) {
    const batch = writeBatch(db);
    snapshot.docs.slice(index, index + 400).forEach((item) => batch.delete(item.ref));
    await batch.commit();
  }

  return records;
}

export default function Settings({ user }: { user: User }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const hasPasswordProvider = useMemo(
    () => user.providerData.some((provider) => provider.providerId === "password"),
    [user.providerData],
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    const savedEmailNotifications = window.localStorage.getItem(EMAIL_STORAGE_KEY);

    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      setTheme(savedTheme);
    }

    if (savedEmailNotifications !== null) {
      setEmailNotifications(savedEmailNotifications === "true");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(EMAIL_STORAGE_KEY, String(emailNotifications));
    document.documentElement.dataset.themePreference = theme;
  }, [theme, emailNotifications]);

  const savePreferenceMessage = async () => {
    setIsSavingPreferences(true);
    setSecurityError(null);
    setSecurityMessage("Preferences saved.");
    window.setTimeout(() => setSecurityMessage(null), 2500);
    setIsSavingPreferences(false);
  };

  const changePassword = async () => {
    if (!hasPasswordProvider || !user.email) {
      setSecurityError("Password changes are available for email/password accounts only.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("Fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError("New password must be at least 6 characters long.");
      return;
    }

    setIsUpdatingPassword(true);
    setSecurityError(null);
    setSecurityMessage(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSecurityMessage("Password updated successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message.replace("Firebase: ", "") : "Unable to update password.";
      setSecurityError(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setSecurityError('Type DELETE to confirm account removal.');
      return;
    }

    setIsDeletingAccount(true);
    setSecurityError(null);
    setSecurityMessage(null);

    try {
      if (hasPasswordProvider && user.email) {
        if (!currentPassword) {
          throw new Error("Enter your current password first.");
        }
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      } else {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
      }

      const closetRecords = await deleteCollectionDocuments(`users/${user.uid}/closet`);
      const outfitRecords = await deleteCollectionDocuments(`users/${user.uid}/outfits`);

      const storagePaths = [...closetRecords, ...outfitRecords]
        .map((item) => item.storagePath)
        .filter((path): path is string => Boolean(path));

      await Promise.allSettled(
        storagePaths.map((storagePath) => deleteObject(ref(storage, storagePath))),
      );

      await deleteDoc(doc(db, `users/${user.uid}`)).catch(() => undefined);
      await deleteUser(user);
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message.replace("Firebase: ", "") : "Unable to delete the account.";
      setSecurityError(message);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Account</p>
          <h2 className="text-3xl md:text-4xl font-serif italic text-gray-900">Settings</h2>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold tracking-widest uppercase text-gray-600 hover:border-black hover:text-black transition-all min-h-[44px]"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Common Preferences</p>
              <h3 className="text-xl font-serif italic text-gray-900">Personalize the app</h3>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemePreference)}
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Email notifications</p>
                <p className="text-xs text-gray-500">Get product and wardrobe updates by email.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-5 w-5 accent-black"
              />
            </label>

            <button
              onClick={savePreferenceMessage}
              disabled={isSavingPreferences}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-gray-800 disabled:opacity-60 min-h-[48px]"
            >
              {isSavingPreferences ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Save Preferences
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Security</p>
              <h3 className="text-xl font-serif italic text-gray-900">Change password</h3>
            </div>
          </div>

          {hasPasswordProvider ? (
            <div className="space-y-4">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black"
              />
              <button
                onClick={changePassword}
                disabled={isUpdatingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-gray-800 disabled:opacity-60 min-h-[48px]"
              >
                {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                Update Password
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Password changes are managed by your sign-in provider.
            </div>
          )}
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] border border-red-100 bg-white p-6 md:p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-500 text-white flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-red-400">Danger Zone</p>
            <h3 className="text-xl font-serif italic text-gray-900">Delete account</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 flex gap-3 items-start">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <p>
            This permanently removes your account, closet items, and saved looks. This action cannot be undone.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {hasPasswordProvider && (
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password for confirmation"
              className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black md:col-span-2"
            />
          )}
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black md:col-span-2"
          />
        </div>

        <button
          onClick={deleteAccount}
          disabled={isDeletingAccount}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-red-700 disabled:opacity-60 min-h-[48px]"
        >
          {isDeletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete Account
        </button>
      </motion.section>

      {securityError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {securityError}
        </div>
      )}

      {securityMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {securityMessage}
        </div>
      )}
    </div>
  );
}