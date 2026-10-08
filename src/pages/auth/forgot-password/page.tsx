import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/pages/auth/components/AuthShell";
import AuthInput from "@/pages/auth/components/AuthInput";
import AuthNotice from "@/pages/auth/components/AuthNotice";
import { supabase } from "@/lib/supabase";
import { authRedirectUrl } from "@/lib/authRedirect";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"request" | "code">("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendResetCode = async () => {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Enter the email linked to your account.");
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: authRedirectUrl(
          `/auth/reset-password?email=${encodeURIComponent(email.trim())}`,
        ),
      });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setStage("code");
      setCooldown(30);
      setNotice(`We sent a 6-digit reset code to ${email.trim()}.`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendResetCode();
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "recovery",
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      navigate(`/auth/reset-password?email=${encodeURIComponent(email.trim())}`, { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (stage === "code") {
    return (
      <AuthShell
        title="Enter reset code"
        subtitle={`Type the 6-digit code we sent to ${email.trim()} to choose a new password.`}
      >
        <form onSubmit={handleVerify} className="space-y-4" noValidate>
          <AuthInput
            id="forgot-code"
            label="6-digit code"
            icon="ri-shield-keyhole-line"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            className="text-center text-lg font-semibold tracking-[0.5em]"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />

          {error ? <AuthNotice message={error} /> : null}
          {notice ? <AuthNotice variant="success" message={notice} /> : null}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-check-double-line text-lg"} />
            {busy ? "Verifying..." : "Verify code"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStage("request");
                setCode("");
                setError("");
                setNotice("");
              }}
              className="flex cursor-pointer items-center gap-1 font-medium text-foreground-600"
            >
              <i className="ri-arrow-left-line" />
              Use a different email
            </button>
            <button
              type="button"
              onClick={sendResetCode}
              disabled={cooldown > 0}
              className="cursor-pointer font-semibold text-primary-600 disabled:cursor-not-allowed disabled:text-foreground-400"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="No stress — enter your email and we'll send a 6-digit code to reset it."
    >
      <form onSubmit={handleSend} className="space-y-4" noValidate>
        <AuthInput
          id="forgot-email"
          label="Email"
          icon="ri-mail-line"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error ? <AuthNotice message={error} /> : null}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-send-plane-line text-lg"} />
          {busy ? "Sending..." : "Send reset code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-600">
        Remembered it?{" "}
        <Link
          to="/auth/login"
          className="cursor-pointer font-semibold text-primary-600 hover:text-primary-700"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}