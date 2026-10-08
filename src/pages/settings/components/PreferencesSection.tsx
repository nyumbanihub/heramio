import { useAppData } from "@/store/AppDataProvider";
import { SettingsSection, FieldLabel } from "@/pages/settings/components/SettingsUI";

const languages = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
];

const currencies = ["KES", "USD", "EUR", "GBP", "NGN", "ZAR"];

export default function PreferencesSection({ onToast }: { onToast: (message: string) => void }) {
  const { me, savePreferences } = useAppData();
  const prefs = me?.prefs;
  if (!prefs) return null;

  const update = async (patch: { language?: string; currency?: string }) => {
    const ok = await savePreferences({ ...prefs, ...patch });
    onToast(ok ? "Preferences updated" : "Couldn't update preferences");
  };

  return (
    <SettingsSection title="Language & currency" icon="ri-translate-2" description="App display preferences">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Language</FieldLabel>
          <select
            value={prefs.language}
            onChange={(e) => update({ language: e.target.value })}
            className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Currency</FieldLabel>
          <select
            value={prefs.currency}
            onChange={(e) => update({ currency: e.target.value })}
            className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
          >
            {currencies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-foreground-500">
        Prices are shown in this currency where supported. Stay bookings are settled in KES.
      </p>
    </SettingsSection>
  );
}