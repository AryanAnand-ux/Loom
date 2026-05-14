import { useState, useEffect } from "react";
import { Palette, CheckCircle2 } from "lucide-react";
import SettingsLayout from "./SettingsLayout";

const THEME_STORAGE_KEY = "loom-settings-theme";
type ThemePreference = "system" | "light" | "dark";

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      setTheme(saved);
    }
  }, []);

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.dataset.themePreference = newTheme;
    setMessage("Theme updated.");
    setTimeout(() => setMessage(null), 2500);
  };

  const themeOptions: { value: ThemePreference; label: string; description: string }[] = [
    { value: "system", label: "System", description: "Follow device settings" },
    { value: "light", label: "Light", description: "Always light mode" },
    { value: "dark", label: "Dark", description: "Always dark mode" },
  ];

  return (
    <SettingsLayout title="Appearance" subtitle="Customize your look">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Personalization</p>
            <h3 className="text-lg font-serif italic text-gray-900">Theme Settings</h3>
          </div>
        </div>

        <div className="space-y-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={`w-full flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 transition-all ${
                theme === option.value
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-gray-50 text-gray-900 hover:border-black"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium">{option.label}</p>
                <p className={`text-xs ${theme === option.value ? "text-gray-300" : "text-gray-500"}`}>
                  {option.description}
                </p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  theme === option.value ? "border-white bg-white" : "border-gray-300"
                }`}
              >
                {theme === option.value && <div className="h-2.5 w-2.5 rounded-full bg-black" />}
              </div>
            </button>
          ))}
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
