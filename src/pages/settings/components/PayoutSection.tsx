import { useEffect, useState } from "react";
import { useAppData } from "@/store/AppDataProvider";
import { SettingsSection, FieldLabel } from "@/pages/settings/components/SettingsUI";

export default function PayoutSection({ onToast }: { onToast: (message: string) => void }) {
  const { me, savePayoutDetails } = useAppData();
  const [method, setMethod] = useState("M-Pesa Paybill");
  const [number, setNumber] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!me) return;
    setMethod(me.payoutMethod || "M-Pesa Paybill");
    setNumber(me.payoutNumber || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.id]);

  const handleSave = async () => {
    setSaving(true);
    const ok = await savePayoutDetails(method, number.trim());
    setSaving(false);
    onToast(ok ? "Payout details saved" : "Couldn't save payout details");
  };

  return (
    <SettingsSection
      title="Payout details"
      icon="ri-bank-card-line"
      description="Where we send your host earnings"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr]">
        <label className="block">
          <FieldLabel>Method</FieldLabel>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
          >
            <option>M-Pesa Paybill</option>
            <option>M-Pesa Till</option>
            <option>Bank transfer</option>
          </select>
        </label>
        <label className="block">
          <FieldLabel>Number / account</FieldLabel>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="e.g. 247247 · 0700 000 000"
            className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-5 py-2.5 text-sm font-semibold text-foreground-800 disabled:opacity-60 sm:w-auto"
      >
        <i className={saving ? "ri-loader-4-line animate-spin" : "ri-save-3-line"} />
        {saving ? "Saving..." : "Save payout details"}
      </button>
    </SettingsSection>
  );
}