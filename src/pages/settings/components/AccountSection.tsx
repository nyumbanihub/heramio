import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/store/AppDataProvider";
import { locationOptions } from "@/lib/content";
import { SettingsSection, FieldLabel } from "@/pages/settings/components/SettingsUI";

export default function AccountSection({ onToast }: { onToast: (message: string) => void }) {
  const { me, updateAccount, changeAvatar } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [estate, setEstate] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [county, setCounty] = useState("Nairobi");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!me) return;
    setDisplayName(me.name);
    setBio(me.bio);
    setEstate(me.estate);
    setCountry(me.country || "Kenya");
    setCounty(me.county || "Nairobi");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const countyOptions = locationOptions.find((o) => o.country === country)?.counties ?? [];

  const handleAvatar = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const ok = await changeAvatar(file);
    setUploading(false);
    onToast(ok ? "Profile photo updated" : "Couldn't update photo");
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await updateAccount({
      displayName: displayName.trim() || "Member",
      bio: bio.trim(),
      estate: estate.trim(),
      country,
      county,
    });
    setSaving(false);
    onToast(ok ? "Profile saved" : "Couldn't save your profile");
  };

  return (
    <SettingsSection title="Account" icon="ri-user-settings-line" description="Your public profile details">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[2px]">
          <img
            src={me?.avatar}
            alt={me?.name ?? "Profile"}
            className="h-full w-full rounded-full border-2 border-background-50 object-cover object-top"
          />
        </span>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-3.5 py-2 text-xs font-semibold text-foreground-800 disabled:opacity-60"
          >
            <i className={uploading ? "ri-loader-4-line animate-spin" : "ri-camera-line"} />
            {uploading ? "Uploading..." : "Change photo"}
          </button>
          <p className="mt-1 text-[11px] text-foreground-500">JPG or PNG, up to 5MB</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)}
        />
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <FieldLabel>Display name</FieldLabel>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>

        <label className="block">
          <FieldLabel>Bio</FieldLabel>
          <textarea
            value={bio}
            maxLength={500}
            rows={3}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell members a little about you"
            className="w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <span className="mt-1 block text-right text-[11px] text-foreground-400">{bio.length}/500</span>
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <FieldLabel>Country</FieldLabel>
            <select
              value={country}
              onChange={(e) => {
                const next = e.target.value;
                setCountry(next);
                const first = locationOptions.find((o) => o.country === next)?.counties[0] ?? "";
                setCounty(first);
              }}
              className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
            >
              {locationOptions.map((o) => (
                <option key={o.country}>{o.country}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <FieldLabel>County / State</FieldLabel>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
            >
              {countyOptions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <FieldLabel>Estate / Area</FieldLabel>
            <input
              type="text"
              value={estate}
              onChange={(e) => setEstate(e.target.value)}
              placeholder="e.g. Kilimani"
              className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60 sm:w-auto"
      >
        <i className={saving ? "ri-loader-4-line animate-spin" : "ri-save-3-line"} />
        {saving ? "Saving..." : "Save changes"}
      </button>
    </SettingsSection>
  );
}