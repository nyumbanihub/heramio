import { useAppData } from "@/store/AppDataProvider";
import type { UserPreferences } from "@/lib/types";
import { SettingsSection, ToggleRow } from "@/pages/settings/components/SettingsUI";

export default function PrivacySection({ onToast }: { onToast: (message: string) => void }) {
  const { me, savePreferences } = useAppData();
  const prefs = me?.prefs;
  if (!prefs) return null;

  const update = async (patch: Partial<UserPreferences>) => {
    const ok = await savePreferences({ ...prefs, ...patch });
    if (!ok) onToast("Couldn't update your privacy settings");
  };

  return (
    <SettingsSection title="Privacy" icon="ri-shield-keyhole-line" description="Control who can reach you">
      <div className="space-y-2">
        <ToggleRow
          icon="ri-eye-line"
          label="Show online status"
          description="Let members see when you're active"
          checked={prefs.privacyShowOnline}
          onChange={(v) => update({ privacyShowOnline: v })}
        />
        <ToggleRow
          icon="ri-chat-off-line"
          label="Allow messages"
          description="Members can start a chat with you"
          checked={prefs.privacyAllowMessages}
          onChange={(v) => update({ privacyAllowMessages: v })}
        />
        <ToggleRow
          icon="ri-search-eye-line"
          label="Appear in search & nearby"
          description="Your profile shows up in discovery"
          checked={prefs.privacyDiscoverable}
          onChange={(v) => update({ privacyDiscoverable: v })}
        />
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-lg bg-secondary-50 px-3 py-2.5 text-xs text-secondary-800">
        <i className="ri-information-line mt-0.5" />
        Your exact address is never shared. Guests only receive check-in details after a verified booking.
      </p>
    </SettingsSection>
  );
}