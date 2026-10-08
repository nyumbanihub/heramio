import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verificationBadges } from "@/lib/content";
import { useAppData } from "@/store/AppDataProvider";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileHeader() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { me, myPostImages } = useAppData();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate("/auth/login", { replace: true });
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  if (!me) {
    return (
      <section className="border-b border-background-200/70 px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-foreground-500">
          <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
          Loading your profile
        </div>
      </section>
    );
  }

  const stats = [
    { label: "Posts", value: `${myPostImages.length}` },
    { label: "Followers", value: me.followers },
    { label: "Following", value: me.following },
  ];

  const location = [me.estate, me.county, me.country].filter(Boolean).join(", ");

  const details = [
    { icon: "ri-map-pin-line", label: location || "Add your location" },
    {
      icon: "ri-translate-2",
      label: me.languages.length > 0 ? me.languages.join(", ") : "Add the languages you speak",
    },
    { icon: "ri-user-star-line", label: me.role === "host" ? "Host account" : "Member account" },
  ];

  const badges = verificationBadges.map((badge) =>
    badge.key === "selfie" ? { ...badge, done: me.verified } : badge,
  );

  return (
    <section className="border-b border-background-200/70 px-4 py-5">
      <div className="flex items-start gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[3px] md:h-24 md:w-24">
          <img
            src={me.avatar}
            alt={me.name}
            title={me.name}
            className="h-full w-full rounded-full border-2 border-background-50 object-cover object-top"
          />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-1.5 font-heading text-xl font-semibold text-foreground-950">
            {me.name}
            {me.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
          </h1>
          <p className="text-sm text-foreground-500">@{me.username}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-800">
            <i className="ri-star-fill" />
            {Number(me.rating).toFixed(1)} rating
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-background-200/80 bg-background-100/50 py-3">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-heading text-lg font-semibold text-foreground-950">{stat.value}</p>
            <p className="text-xs text-foreground-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-foreground-800">
        {me.bio || "Add a short bio so members know a little about you."}
      </p>

      <ul className="mt-4 space-y-2">
        {details.map((detail) => (
          <li key={detail.icon} className="flex items-center gap-2.5 text-sm text-foreground-700">
            <i className={`${detail.icon} text-base text-foreground-500`} />
            {detail.label}
          </li>
        ))}
      </ul>

      {me.interests.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {me.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full bg-secondary-100 px-3 py-1.5 text-xs font-medium text-secondary-900"
            >
              {interest}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-500">
          Verification
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.key}
              title="Verification means this account completed the verification process. It does not guarantee a user's behaviour or safety."
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
                badge.done
                  ? "border-secondary-200 bg-secondary-50"
                  : "border-background-200 bg-background-100/50"
              }`}
            >
              <i
                className={`${badge.icon} text-lg ${
                  badge.done ? "text-secondary-600" : "text-foreground-400"
                }`}
              />
              <span className="flex-1 text-xs font-medium text-foreground-800">{badge.label}</span>
              <i
                className={
                  badge.done
                    ? "ri-checkbox-circle-fill text-secondary-600"
                    : "ri-time-line text-foreground-400"
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/onboarding")}
          className="flex-1 cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2.5 text-sm font-semibold text-background-50"
        >
          Edit profile
        </button>
        <button
          type="button"
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-800"
        >
          <i className="ri-settings-3-line text-lg" />
        </button>
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          aria-label="Log out"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-primary-200 text-primary-600"
        >
          <i className="ri-logout-box-r-line text-lg" />
        </button>
      </div>

      {confirmLogout ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground-950/50 px-4 pb-6 sm:items-center sm:pb-0">
          <div className="w-full max-w-[380px] animate-fade-up rounded-lg border border-background-200 bg-background-50 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <i className="ri-logout-box-r-line text-lg text-primary-600" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground-950">Log out?</h2>
                <p className="text-sm text-foreground-600">You'll need to sign back in to continue.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="flex-1 cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-800"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <i className={loggingOut ? "ri-loader-4-line animate-spin text-base" : "ri-logout-box-r-line text-base"} />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}