import { Shield, Lock, Eye } from "lucide-react";
import SettingsLayout from "./SettingsLayout";

export default function PrivacyPage() {
  return (
    <SettingsLayout title="Privacy" subtitle="Your data & preferences">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Protection</p>
            <h3 className="text-lg font-serif italic text-gray-900">Privacy Policy</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Eye size={16} className="text-gray-500" />
              <p className="text-sm font-medium text-gray-900">Data Usage</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your wardrobe items and preferences are stored securely in Firestore. We do not share your data with third parties.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3 mb-3">
              <Lock size={16} className="text-gray-500" />
              <p className="text-sm font-medium text-gray-900">Encryption</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              All communications with our servers are encrypted using industry-standard SSL/TLS protocols.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              For our full privacy policy, please visit our website. You can request a copy of your data or request deletion at any time.
            </p>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
