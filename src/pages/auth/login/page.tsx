import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "@/pages/auth/components/AuthShell";
import AuthInput from "@/pages/auth/components/AuthInput";
import AuthNotice from "@/pages/auth/components/AuthNotice";
import { supabase } from "@/lib/supabase";

interface LocationState {
  from?: { pathname?: string };
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname;
  const redirectTo = from && from !== "/auth/login" ? from : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep meeting verified people nearby.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput
          id="login-email"
          label="Email"
          icon="ri-mail-line"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <div>
          <AuthInput
            id="login-password"
            label="Password"
            icon="ri-lock-line"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-foreground-600"
            >
              <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
              {showPassword ? "Hide" : "Show"} password
            </button>
            <Link
              to="/auth/forgot-password"
              className="cursor-pointer text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error ? <AuthNotice message={error} /> : null}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-login-circle-line text-lg"} />
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-600">
        New to Heramio?{" "}
        <Link
          to="/auth/register"
          className="cursor-pointer font-semibold text-primary-600 hover:text-primary-700"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}