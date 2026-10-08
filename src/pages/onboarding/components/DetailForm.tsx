import { locationOptions } from "@/lib/content";
import type { ProfileSavePayload } from "@/hooks/useMyProfile";

interface DetailsFormProps {
  form: ProfileSavePayload;
  onChange: (patch: Partial<ProfileSavePayload>) => void;
  onSubmit: () => void;
  busy: boolean;
  error: string;
}

const fieldClass =
  "w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 transition-colors hover:border-background-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600";

export default function DetailsForm({ form, onChange, onSubmit, busy, error }: DetailsFormProps) {
  const counties = locationOptions.find((option) => option.country === form.country)?.counties ?? [];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Display name</span>
          <input
            type="text"
            value={form.display_name}
            onChange={(event) => onChange({ display_name: event.target.value })}
            placeholder="Amara Okafor"
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Username</span>
          <span className="relative flex items-center">
            <span className="pointer-events-none absolute left-3 text-sm text-foreground-400">@</span>
            <input
              type="text"
              value={form.username}
              onChange={(event) =>
                onChange({ username: event.target.value.replace(/\s/g, "").toLowerCase() })
              }
              placeholder="amaraokafor"
              className={`${fieldClass} pl-8`}
            />
          </span>
        </label>
      </div>

      <div>
        <span className={labelClass}>I am a</span>
        <div className="flex rounded-full bg-background-200/70 px-1 py-1">
          {(["woman", "man"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ gender: option })}
              className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium capitalize transition-colors ${
                form.gender === option
                  ? "bg-background-50 text-foreground-950"
                  : "text-foreground-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={labelClass}>Country</span>
          <span className="relative block">
            <select
              value={form.country}
              onChange={(event) => onChange({ country: event.target.value, county: "" })}
              className={`${fieldClass} appearance-none`}
            >
              <option value="">Select country</option>
              {locationOptions.map((option) => (
                <option key={option.country} value={option.country}>
                  {option.country}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg text-foreground-400" />
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>County / Region</span>
          <span className="relative block">
            <select
              value={form.county}
              onChange={(event) => onChange({ county: event.target.value })}
              disabled={!form.country}
              className={`${fieldClass} appearance-none disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <option value="">{form.country ? "Select county" : "Pick a country first"}</option>
              {counties.map((county) => (
                <option key={county} value={county}>
                  {county}
                </option>
              ))}
            </select>
            <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg text-foreground-400" />
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>Estate / Area</span>
          <span className="relative flex items-center">
            <i className="ri-map-pin-2-line pointer-events-none absolute left-3 text-base text-foreground-400" />
            <input
              type="text"
              value={form.estate}
              onChange={(event) => onChange({ estate: event.target.value })}
              placeholder="e.g. Kilimani"
              className={`${fieldClass} pl-9`}
            />
          </span>
        </label>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-foreground-500">
        <i className="ri-lock-2-line" />
        We only ever show your area-level estate — never your exact address.
      </p>

      <label className="block">
        <span className={labelClass}>About you</span>
        <textarea
          value={form.bio}
          onChange={(event) => onChange({ bio: event.target.value.slice(0, 300) })}
          rows={3}
          maxLength={300}
          placeholder="A sentence or two about what you enjoy and what you're looking for."
          className={`${fieldClass} resize-none`}
        />
        <span className="mt-1 block text-right text-[11px] text-foreground-400">
          {form.bio.length}/300
        </span>
      </label>

      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
          <i className="ri-error-warning-line mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-arrow-right-line text-lg"} />
        {busy ? "Saving..." : "Save & continue to selfie"}
      </button>
    </form>
  );
}