import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import BrandLogo from "@/components/feature/BrandLogo";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") as EmailOtpType | null;

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        } else if (tokenHash && type) {
          await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        }
      } catch {
        // Ignore — we fall through and send the user where they can retry.
      }

      if (!active) return;
      const { data } = await supabase.auth.getSession();
      navigate(data.session ? "/" : "/auth/login", { replace: true });
    };

    run();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-100">
      <BrandLogo />
      <span className="flex items-center gap-2 text-xs font-medium text-foreground-500">
        <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
        Finishing sign in
      </span>
    </div>
  );
}