import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import { useAppData } from "@/store/AppDataProvider";
import { useAuth } from "@/hooks/useAuth";
import AccountSection from "@/pages/settings/components/AccountSection";
import NotificationsSection from "@/pages/settings/components/NotificationsSection";
import PrivacySection from "@/pages/settings/components/PrivacySection";
import PreferencesSection from "@/pages/settings/components/PreferencesSection";
import PayoutSection from "@/pages/settings/components/PayoutSection";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { role } = useAppData();
  const [toast, setToast] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

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

  return (
    <>
      <TopBar title="Settings" />

      <div className="mx-auto w-full max-w-[640px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 px-4 py-4">
          <h1 className="font-heading text-xl font-semibold text-foreground-950">Settings</h1>
          <p className="mt-1 text-sm text-foreground-600">
            Manage your account, notifications, privacy and preferences.
          </p>
        </div>

        <AccountSection onToast={flash} />
        <NotificationsSection onToast={flash} />
        <PrivacySection onToast={flash} />
        {role === "host" ? <PayoutSection onToast={flash} /> : null}
        <PreferencesSection onToast={flash} />

        <section className="border-b border-background-200/70 px-4 py-5">
          <Link
            to="/trips"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-background-200/80 bg-background-50 px-3.5 py-3 transition-colors hover:bg-background-100/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-800">
              <i className="ri-suitcase-line text-lg" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground-950">My trips</span>
              <span className="block text-xs text-foreground-500">View bookings you've made</span>
            </span>
            <i className="ri-arrow-right-s-line text-xl text-foreground-400" />
          </Link>
        </section>

        <section className="px-4 py-5">
          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
          >
            <i className="ri-logout-box-r-line" />
            Log out
          </button>
          <p className="mt-4 text-center text-xs text-foreground-400">
            Heramio · Built with care in Nairobi
          </p>
        </section>
      </div>

      {confirmLogout ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/50 px-4 pb-6 sm:items-center sm:pb-0">
          <div className="w-full max-w-[380px] rounded-lg border border-background-200 bg-background-50 p-5">
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

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4">
          <span className="rounded-full bg-foreground-950 px-4 py-2 text-xs font-medium text-background-50">
            {toast}
          </span>
        </div>
      ) : null}
    </>
  );
}