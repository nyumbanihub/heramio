import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import DetailsForm from "@/pages/onboarding/components/DetailsForm";
import SelfieCapture from "@/pages/onboarding/components/SelfieCapture";
import { useMyProfile, type ProfileSavePayload } from "@/hooks/useMyProfile";

const emptyForm: ProfileSavePayload = {
  display_name: "",
  username: "",
  gender: "woman",
  country: "",
  county: "",
  estate: "",
  bio: "",
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, selfie, loading, error: loadError, saveProfile, submitSelfie } = useMyProfile();

  const [form, setForm] = useState<ProfileSavePayload>(emptyForm);
  const [initialized, setInitialized] = useState(false);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || initialized) return;
    if (profile) {
      setForm({
        display_name: profile.display_name ?? "",
        username: profile.username ?? "",
        gender: profile.gender ?? "woman",
        country: profile.country ?? "",
        county: profile.county ?? "",
        estate: profile.estate ?? "",
        bio: profile.bio ?? "",
      });
      setStep(selfie ? 3 : 2);
    } else {
      setStep(1);
    }
    setInitialized(true);
  }, [loading, initialized, profile, selfie]);

  const patch = (updates: Partial<ProfileSavePayload>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleDetails = async () => {
    setError("");
    if (!form.display_name.trim()) return setError("Please add a display name.");
    if (!form.username.trim()) return setError("Please choose a username.");
    if (!form.country) return setError("Please select your country.");
    if (!form.county) return setError("Please select your county or region.");
    if (!form.estate.trim()) return setError("Please enter your estate or area.");

    setBusy(true);
    const result = await saveProfile({ ...form, display_name: form.display_name.trim(), estate: form.estate.trim() });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not save your details.");
      return;
    }
    setStep(selfie ? 3 : 2);
  };

  const handleSelfie = async (blob: Blob) => {
    setError("");
    setBusy(true);
    const result = await submitSelfie(blob);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Could not verify your selfie.");
      return;
    }
    setStep(3);
  };

  const steps = [
    { number: 1, label: "Details" },
    { number: 2, label: "Selfie" },
    { number: 3, label: "Done" },
  ];

  return (
    <>
      <TopBar title="Your profile" />

      <div className="mx-auto w-full max-w-[640px] px-4 py-5 lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 pb-4">
          <h1 className="font-heading text-xl font-semibold text-foreground-950">
            Set up your dating profile
          </h1>
          <p className="mt-1 text-sm text-foreground-700">
            Add your details and take one real selfie. Your selfie is locked on your profile for safety.
          </p>

          <ol className="mt-4 flex items-center gap-2">
            {steps.map((item, index) => (
              <li key={item.number} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step >= item.number
                      ? "bg-primary-500 text-background-50"
                      : "bg-background-200 text-foreground-600"
                  }`}
                >
                  {step > item.number ? <i className="ri-check-line" /> : item.number}
                </span>
                <span
                  className={`text-xs font-medium ${
                    step >= item.number ? "text-foreground-900" : "text-foreground-500"
                  }`}
                >
                  {item.label}
                </span>
                {index < steps.length - 1 ? (
                  <span className="mx-1 hidden h-px flex-1 bg-background-200 sm:block" />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="py-6">
          {loadError ? (
            <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
              <i className="ri-error-warning-line mt-0.5" />
              <span>{loadError}</span>
            </div>
          ) : null}

          {step === 1 ? (
            <DetailsForm form={form} onChange={patch} onSubmit={handleDetails} busy={busy} error={error} />
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg bg-secondary-50 px-3 py-2.5 text-xs text-secondary-800">
                <i className="ri-information-line mt-0.5" />
                <span>
                  Take a clear selfie in good light, looking straight at the camera. This becomes your
                  locked verification photo — it can never be edited or replaced.
                </span>
              </div>

              {selfie ? (
                <div className="flex items-center gap-2 rounded-md border border-secondary-200 bg-secondary-50 px-3 py-2.5 text-sm text-secondary-900">
                  <i className="ri-lock-2-fill" />
                  Your selfie is already verified and locked.
                </div>
              ) : null}

              {error ? (
                <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
                  <i className="ri-error-warning-line mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : null}

              <SelfieCapture onCaptured={handleSelfie} busy={busy} disabled={Boolean(selfie)} />

              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-medium text-foreground-800"
              >
                <i className="ri-arrow-left-line" />
                Back to details
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-background-50">
                <i className="ri-shield-check-fill text-4xl" />
              </span>
              <h2 className="mt-4 font-heading text-xl font-semibold text-foreground-950">
                You're verified
              </h2>
              <p className="mt-1 max-w-sm text-sm text-foreground-700">
                Your details are saved and your selfie is locked to your profile. Members will always be
                able to see the real you.
              </p>
              <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600"
                >
                  <i className="ri-user-3-line text-lg" />
                  View my profile
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-4 py-3 text-sm font-semibold text-foreground-800"
                >
                  <i className="ri-pencil-line text-lg" />
                  Edit details
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <p className="border-t border-background-200/70 py-4 text-center text-[11px] text-foreground-400">
          Heramio never shares your exact location ·{" "}
          <Link to="/profile" className="text-primary-600">
            Back to profile
          </Link>
        </p>
      </div>
    </>
  );
}