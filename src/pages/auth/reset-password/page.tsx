import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "@/pages/auth/components/AuthShell";
import AuthInput from "@/pages/auth/components/AuthInput";
import AuthNotice from "@/pages/auth/components/AuthNotice";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { user, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Your new password needs to be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      navigate("/", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!loading && !user) {
    return (
      <AuthShell
        title="Reset link needed"
        subtitle="This page needs a valid reset code. Request a new one and we'll get you sorted."
      >
        <Link
          to="/auth/forgot-password"
          className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600"
        >
          <i className="ri-refresh-line text-lg" />
          Request a new code
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle={
        email
          ? `Choose a new password for ${email}.`
          : "Choose a new password for your account."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput
          id="reset-password"
          label="New password"
          icon="ri-lock-line"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <AuthInput
          id="reset-confirm"
          label="Confirm new password"
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
          <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-lock-password-line text-lg"} />
          {busy ? "Updating..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-600">
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