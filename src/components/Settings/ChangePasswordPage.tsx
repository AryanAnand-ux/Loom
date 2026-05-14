import { useState, useMemo } from "react";
import { Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { User as FirebaseUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import SettingsLayout from "./SettingsLayout";

export default function ChangePasswordPage({ user }: { user: FirebaseUser }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasPasswordProvider = useMemo(
    () => user.providerData.some((provider) => provider.providerId === "password"),
    [user.providerData],
  );

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user.email) throw new Error("No email found for account.");
      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message.replace("Firebase: ", "") : "Failed to update password.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPasswordProvider) {
    return (
      <SettingsLayout title="Change Password" subtitle="Update your password">
        <div className="rounded-[2.5rem] border border-yellow-100 bg-yellow-50 p-6 md:p-8 flex gap-3">
          <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 mb-2">Password changes not available</p>
            <p className="text-sm text-yellow-800">
              You're signed in with a social provider (Google). Password management is handled by your provider.
            </p>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout title="Change Password" subtitle="Update your password">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Security</p>
            <h3 className="text-lg font-serif italic text-gray-900">Update Password</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-gray-800 disabled:opacity-60 transition-all min-h-[48px]"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex gap-2 items-start">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
