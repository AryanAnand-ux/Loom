import { useState, useRef } from "react";
import { User, Mail, UserCircle2, Edit2, Save, X, Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { User as FirebaseUser, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import SettingsLayout from "./SettingsLayout";

export default function ProfilePage({ user }: { user: FirebaseUser }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user.photoURL || "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      const photoRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(photoRef, file);
      const downloadURL = await getDownloadURL(photoRef);

      await updateProfile(user, { photoURL: downloadURL });
      setSuccess("Profile photo updated successfully.");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message.replace("Firebase: ", "") : "Failed to upload photo.";
      setError(message);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile(user, { displayName: displayName.trim() });
      setSuccess("Profile updated successfully.");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err) {
      const message = err instanceof Error ? err.message.replace("Firebase: ", "") : "Failed to update profile.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user.displayName || "");
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  };

  return (
    <SettingsLayout title="Profile" subtitle="Your account info">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Account</p>
              <h3 className="text-lg font-serif italic text-gray-900">Profile Information</h3>
            </div>
          </div>
          {!user.isAnonymous && (
            <button
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-black"
              title={isEditing ? "Cancel" : "Edit profile"}
            >
              {isEditing ? <X size={18} /> : <Edit2 size={18} />}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 relative group">
            {user.isAnonymous || !photoPreview ? (
              <div className="h-16 w-16 rounded-full border border-gray-300 bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 relative">
                <UserCircle2 size={32} />
                {!user.isAnonymous && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-60"
                  >
                    <Camera size={18} className="text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full border border-gray-300 object-cover shrink-0 relative overflow-hidden">
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                {!user.isAnonymous && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:opacity-60"
                  >
                    {isUploadingPhoto ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
              disabled={isUploadingPhoto}
            />

            {isEditing ? (
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Name</p>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.isAnonymous ? "Guest User" : user.displayName || "Not set"}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail size={16} className="text-gray-500" />
              <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Email</p>
            </div>
            <p className="text-sm font-medium text-gray-900 break-all">{user.isAnonymous ? "demo@loom.app" : user.email}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Account Type</p>
            <div className="flex gap-2 flex-wrap">
              {user.isAnonymous && <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Guest</span>}
              {user.providerData.some((p) => p.providerId === "password") && (
                <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Email & Password</span>
              )}
              {user.providerData.some((p) => p.providerId === "google.com") && (
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">Google Sign-In</span>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-gray-800 disabled:opacity-60 transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 text-xs font-bold tracking-widest uppercase text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-all"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}

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
