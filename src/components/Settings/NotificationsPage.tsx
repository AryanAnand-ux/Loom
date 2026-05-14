import { useState, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import SettingsLayout from "./SettingsLayout";

const EMAIL_NOTIFICATIONS_KEY = "loom-settings-email-notifications";

export default function NotificationsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(EMAIL_NOTIFICATIONS_KEY);
    if (saved !== null) {
      setEmailNotifications(saved === "true");
    }
  }, []);

  const handleToggle = () => {
    setEmailNotifications(!emailNotifications);
    window.localStorage.setItem(EMAIL_NOTIFICATIONS_KEY, String(!emailNotifications));
    setMessage("Preferences saved.");
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <SettingsLayout title="Notifications" subtitle="Manage alerts">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <Bell size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Preferences</p>
            <h3 className="text-lg font-serif italic text-gray-900">Notification Settings</h3>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 cursor-pointer hover:border-black transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Email notifications</p>
              <p className="text-xs text-gray-500">Receive product and wardrobe updates by email</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={handleToggle}
              className="h-5 w-5 accent-black shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 opacity-50 cursor-not-allowed">
            <div>
              <p className="text-sm font-medium text-gray-900">Push notifications</p>
              <p className="text-xs text-gray-500">Coming soon</p>
            </div>
            <input type="checkbox" disabled className="h-5 w-5 shrink-0" />
          </label>
        </div>

        {message && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
