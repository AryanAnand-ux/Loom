import { useState, useMemo } from "react";
import { Trash2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { User as FirebaseUser, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup, deleteUser } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, query, writeBatch } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../lib/firebase";
import SettingsLayout from "./SettingsLayout";

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

export default function DeleteAccountPage({ user }: { user: FirebaseUser }) {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPasswordProvider = useMemo(
    () => user.providerData.some((provider) => provider.providerId === "password"),
    [user.providerData],
  );

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      setError('Type "DELETE" to confirm.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (hasPasswordProvider && user.email) {
        if (!currentPassword) {
          throw new Error("Enter your password to confirm deletion.");
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

      await Promise.allSettled(storagePaths.map((storagePath) => deleteObject(ref(storage, storagePath))));

      await deleteDoc(doc(db, `users/${user.uid}`)).catch(() => undefined);
      await deleteUser(user);

      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message.replace("Firebase: ", "") : "Failed to delete account.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsLayout title="Delete Account" subtitle="Danger zone">
      <div className="rounded-[2.5rem] border border-red-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-red-100">
          <div className="h-12 w-12 rounded-2xl bg-red-500 text-white flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-red-600">Warning</p>
            <h3 className="text-lg font-serif italic text-gray-900">Permanently Delete Account</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex gap-3">
          <ShieldAlert size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-red-900 mb-1">This action cannot be undone</p>
            <p className="text-sm text-red-800">
              Deleting your account will permanently remove all your wardrobe items, saved looks, and account data. This is irreversible.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {hasPasswordProvider && (
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-widest font-bold text-gray-400 block mb-2">
              Confirmation
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={`Type "DELETE" to confirm`}
              className="w-full h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>

          <button
            onClick={handleDeleteAccount}
            disabled={isLoading || deleteConfirm !== "DELETE"}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all min-h-[48px]"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {isLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex gap-2 items-start">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
