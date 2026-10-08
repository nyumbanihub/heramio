import { Link } from "react-router-dom";
import { useMyProfile } from "@/hooks/useMyProfile";

const genderLabel = (gender: string | null): string => {
  if (gender === "woman") return "Woman";
  if (gender === "man") return "Man";
  return "Not set";
};

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export default function ProfileVerification() {
  const { profile, selfie, selfieUrl, loading, error, refresh } = useMyProfile();

  if (loading) {
    return (
      <section className="border-b border-background-200/70 px-4 py-5">
        <div className="flex items-center gap-3 text-sm text-foreground-500">
          <i className="ri-loader-4-line animate-spin text-lg text-primary-500" />
          Loading your verified profile...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-b border-background-200/70 px-4 py-5">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
          <span className="flex items-center gap-2">
            <i className="ri-error-warning-line" />
            {error}
          </span>
          <button
            type="button"
            onClick={() => refresh()}
            className="shrink-0 cursor-pointer rounded-md border border-primary-300 px-3 py-1.5 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const complete = Boolean(profile) && Boolean(selfie);

  if (!complete) {
    const missingSelfie = !selfie;
    return (
      <section className="border-b border-background-200/70 px-4 py-5">
        <div className="overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-accent-50 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <i className="ri-shield-user-line text-xl" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-base font-semibold text-foreground-950">
                {missingSelfie ? "Verify your profile with a selfie" : "Complete your dating details"}
              </h2>
              <p className="mt-1 text-sm text-foreground-700">
                Add your gender, country, county and estate, then take one real selfie. It stays locked on
                your profile for safety — even if you change your photos later.
              </p>
              <Link
                to="/onboarding"
                className="mt-3 inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition hover:bg-primary-600"
              >
                <i className="ri-camera-lens-line text-base" />
                {missingSelfie ? "Verify now" : "Add my details"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const details = [
    { icon: "ri-women-line", label: "Gender", value: genderLabel(profile.gender) },
    { icon: "ri-earth-line", label: "Country", value: profile.country || "—" },
    { icon: "ri-map-2-line", label: "County / Region", value: profile.county || "—" },
    { icon: "ri-map-pin-2-line", label: "Estate / Area", value: profile.estate || "—" },
  ];

  return (
    <section className="border-b border-background-200/70 px-4 py-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground-950">
          <i className="ri-shield-check-fill text-primary-500" />
          Verified profile
        </h2>
        <Link
          to="/onboarding"
          className="cursor-pointer text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          Edit details
        </Link>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-2">
        {details.map((detail) => (
          <li
            key={detail.label}
            className="flex items-center gap-2 rounded-lg border border-background-200/80 bg-background-100/50 px-3 py-2.5"
          >
            <i className={`${detail.icon} text-base text-foreground-500`} />
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wide text-foreground-500">
                {detail.label}
              </span>
              <span className="block truncate text-sm font-medium text-foreground-900">
                {detail.value}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 overflow-hidden rounded-2xl border border-secondary-200 bg-secondary-50">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <i className="ri-lock-2-fill text-secondary-700" />
          <p className="text-xs font-semibold text-secondary-900">Original selfie · locked</p>
          <span className="ml-auto text-[11px] text-secondary-700">
            {formatDate(selfie.created_at)}
          </span>
        </div>
        <div className="mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden bg-foreground-950">
          {selfieUrl ? (
            <img
              src={selfieUrl}
              alt="Your locked verification selfie"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-background-100">
              <i className="ri-loader-4-line animate-spin text-2xl" />
            </div>
          )}
        </div>
        <p className="px-4 py-3 text-xs leading-relaxed text-secondary-800">
          This is the real selfie taken at verification. It can&apos;t be edited, replaced or hidden —
          other members will always see this original photo, even if your profile pictures change.
        </p>
      </div>
    </section>
  );
}