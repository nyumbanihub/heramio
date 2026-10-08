import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/pages/auth/components/AuthShell";
import AuthInput from "@/pages/auth/components/AuthInput";
import AuthNotice from "@/pages/auth/components/AuthNotice";
import { supabase } from "@/lib/supabase";
import { authRedirectUrl } from "@/lib/authRedirect";

export default function Register() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"form" | "code">("form");

  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"dater" | "host">("dater");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (password.length < 8) {
      setError("Your password needs to be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), role },
          emailRedirectTo: authRedirectUrl("/auth/callback"),
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        navigate("/", { replace: true });
        return;
      }
      setStage("code");
      setCooldown(30);
      setNotice(`We sent a 6-digit code to ${email.trim()}. Enter it below to finish signing up.`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
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
        type: "signup",
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }
      navigate("/", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setCooldown(30);
      setNotice(`A fresh code is on its way to ${email.trim()}.`);
    } catch {
      setError("Could not resend the code. Please try again.");
    }
  };

  if (stage === "code") {
    return (
      <AuthShell
        title="Verify your email"
        subtitle={`Enter the 6-digit code we sent to ${email.trim()} to activate your account.`}
      >
        <form onSubmit={handleVerify} className="space-y-4" noValidate>
          <AuthInput
            id="register-code"
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
            {busy ? "Verifying..." : "Verify & continue"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStage("form");
                setCode("");
                setError("");
                setNotice("");
              }}
              className="flex cursor-pointer items-center gap-1 font-medium text-foreground-600"
            >
              <i className="ri-arrow-left-line" />
              Change details
            </button>
            <button
              type="button"
              onClick={handleResend}
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
      title="Create your account"
      subtitle="Join Heramio to meet verified people, book meetups at trusted hotels and discover events near you."
    >
      <form onSubmit={handleSignUp} className="space-y-4" noValidate>
        <AuthInput
          id="register-name"
          label="Full name"
          icon="ri-user-line"
          type="text"
          name="full_name"
          autoComplete="name"
          placeholder="Amara Okafor"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
            I'm here to
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {([
              {
                key: "dater" as const,
                icon: "ri-heart-3-line",
                title: "Date & meet people",
                desc: "Browse members, match and book meetups.",
              },
              {
                key: "host" as const,
                icon: "ri-hotel-line",
                title: "List a hotel or Airbnb",
                desc: "Sell stays, manage bookings and get paid.",
              },
            ]).map((option) => {
              const active = role === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRole(option.key)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-primary-400 bg-primary-50"
                      : "border-background-300 hover:bg-background-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active ? "bg-primary-500 text-background-50" : "bg-background-100 text-foreground-700"
                    }`}
                  >
                    <i className={`${option.icon} text-lg`} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                      {option.title}
                      {active ? <i className="ri-checkbox-circle-fill text-primary-500" /> : null}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-foreground-500">{option.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <AuthInput
          id="register-email"
          label="Email"
          icon="ri-mail-line"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthInput
          id="register-password"
          label="Password"
          icon="ri-lock-line"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AuthInput
          id="register-confirm"
          label="Confirm password"
          icon="ri-lock-2-line"
          type="password"
          name="confirm_password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />

        {error ? <AuthNotice message={error} /> : null}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-user-add-line text-lg"} />
          {busy ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-xs leading-relaxed text-foreground-500">
          By joining you agree to our Community Guidelines and confirm you are 18 or older.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-600">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="cursor-pointer font-semibold text-primary-600 hover:text-primary-700"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}