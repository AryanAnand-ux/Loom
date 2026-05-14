import { UserCog, CheckCircle2, AlertCircle } from "lucide-react";
import SettingsLayout from "./SettingsLayout";

export default function SecurityPage() {
  return (
    <SettingsLayout title="Security" subtitle="Account safety">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <UserCog size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Protection</p>
            <h3 className="text-lg font-serif italic text-gray-900">Security Information</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex gap-3">
            <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900 mb-1">Two-Factor Authentication</p>
              <p className="text-xs text-green-800">
                Coming soon. Enable 2FA for enhanced security on your account.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Session Management</p>
            <p className="text-xs text-gray-600 mb-3">
              You are currently logged in to this device. Active sessions will automatically expire after 30 days of inactivity.
            </p>
            <button className="text-xs font-semibold tracking-widest uppercase text-red-600 hover:text-red-700 transition-colors">
              Sign Out All Devices
            </button>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex gap-3">
            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">Tips for Security</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use a strong, unique password</li>
                <li>• Never share your credentials</li>
                <li>• Keep your email address up to date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
