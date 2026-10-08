import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_PUBLIC_SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL) as string | undefined;
const supabaseAnonKey =
  (import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/**
 * Single shared Supabase client for the whole app (singleton).
 */
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);