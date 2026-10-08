import { useAppData } from "@/store/AppDataProvider";
import type { UserPreferences } from "@/lib/types";
import { SettingsSection, ToggleRow } from "@/pages/settings/components/SettingsUI";

export default function NotificationsSection({ onToast }: { onToast: (message: string) => void }) {
  const { me, savePreferences } = useAppData();
  const prefs = me?.prefs;
  if (!prefs) return null;

  const update = async (patch: Partial<UserPreferences>) => {
    const ok = await savePreferences({ ...prefs, ...patch });
    if (!ok) onToast("Couldn't update your preferences");
  };

  return (
    <SettingsSection title="Notifications" icon="ri-notification-3-line" description="Choose what reaches you">
      <div className="space-y-2">
        <ToggleRow
          icon="ri-heart-3-line"
          label="Likes & comments"
          description="When someone likes or comments on your posts"
          checked={prefs.notifyLikes}
          onChange={(v) => update({ notifyLikes: v })}
        />
        <ToggleRow
          icon="ri-chat-3-line"
          label="Messages"
          description="When you receive a new chat message"
          checked={prefs.notifyMessages}
          onChange={(v) => update({ notifyMessages: v })}
        />
        <ToggleRow
          icon="ri-user-add-line"
          label="New followers"
          description="When someone starts following you"
          checked={prefs.notifyFollows}
          onChange={(v) => update({ notifyFollows: v })}
        />
        <ToggleRow
          icon="ri-mail-star-line"
          label="News & offers"
          description="Occasional product news and stay deals"
          checked={prefs.notifyMarketing}
          onChange={(v) => update({ notifyMarketing: v })}
        />
      </div>
    </SettingsSection>
  );
}