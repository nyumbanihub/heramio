import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface MyProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  gender: "woman" | "man" | null;
  country: string | null;
  county: string | null;
  estate: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface SelfieVerification {
  user_id: string;
  selfie_path: string;
  created_at: string;
}

export interface ProfileSavePayload {
  display_name: string;
  username: string;
  gender: "woman" | "man";
  country: string;
  county: string;
  estate: string;
  bio: string;
}

interface MutationResult {
  ok: boolean;
  error?: string;
}

interface UseMyProfileResult {
  profile: MyProfile | null;
  selfie: SelfieVerification | null;
  selfieUrl: string;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  saveProfile: (payload: ProfileSavePayload) => Promise<MutationResult>;
  uploadAvatar: (file: File) => Promise<string | null>;
  submitSelfie: (blob: Blob) => Promise<MutationResult>;
}

const ALLOWED_AVATAR_EXT = ["jpg", "jpeg", "png", "webp"];

/**
 * Loads and mutates the signed-in member's own profile and (locked) verification selfie.
 */
export function useMyProfile(): UseMyProfileResult {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [selfie, setSelfie] = useState<SelfieVerification | null>(null);
  const [selfieUrl, setSelfieUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, gender, country, county, estate, bio, avatar_url")
        .eq("user_id", userId)
        .maybeSingle();
      if (profileError) throw profileError;
      setProfile((profileRow as MyProfile) ?? null);

      const { data: selfieRow, error: selfieError } = await supabase
        .from("selfie_verifications")
        .select("user_id, selfie_path, created_at")
        .eq("user_id", userId)
        .maybeSingle();
      if (selfieError) throw selfieError;
      setSelfie((selfieRow as SelfieVerification) ?? null);

      if (selfieRow?.selfie_path) {
        const { data: signed } = await supabase.storage
          .from("selfies")
          .createSignedUrl(selfieRow.selfie_path as string, 60 * 60);
        setSelfieUrl(signed?.signedUrl ?? "");
      } else {
        setSelfieUrl("");
      }
    } catch {
      setError("We couldn't load your profile right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProfile = useCallback(
    async (payload: ProfileSavePayload): Promise<MutationResult> => {
      if (!userId) return { ok: false, error: "You're not signed in." };
      try {
        const { error: upsertError } = await supabase.from("profiles").upsert(
          { user_id: userId, ...payload, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
        if (upsertError) {
          if (upsertError.code === "23505") {
            return { ok: false, error: "That username is already taken. Try another." };
          }
          return { ok: false, error: upsertError.message };
        }
        await load();
        return { ok: true };
      } catch {
        return { ok: false, error: "Something went wrong. Please try again." };
      }
    },
    [userId, load],
  );

  const uploadAvatar = useCallback(
    async (file: File): Promise<string | null> => {
      if (!userId) return null;
      const rawExt = (file.name.split(".").pop() || "jpg").toLowerCase();
      const ext = ALLOWED_AVATAR_EXT.includes(rawExt) ? rawExt : "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
      if (uploadError) return null;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      return data.publicUrl;
    },
    [userId],
  );

  const submitSelfie = useCallback(
    async (blob: Blob): Promise<MutationResult> => {
      if (!userId) return { ok: false, error: "You're not signed in." };
      if (selfie) return { ok: false, error: "Your selfie is already verified and locked." };

      const path = `${userId}/selfie.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("selfies")
        .upload(path, blob, { upsert: false, contentType: "image/jpeg" });
      if (uploadError) {
        return { ok: false, error: "We couldn't upload your selfie. Please try again." };
      }

      const { error: insertError } = await supabase
        .from("selfie_verifications")
        .insert({ user_id: userId, selfie_path: path });
      if (insertError) {
        if (insertError.code === "23505") {
          return { ok: false, error: "Your selfie is already verified and locked." };
        }
        return { ok: false, error: insertError.message };
      }

      const { data: signed } = await supabase.storage
        .from("selfies")
        .createSignedUrl(path, 60 * 60);
      setSelfieUrl(signed?.signedUrl ?? "");
      setSelfie({ user_id: userId, selfie_path: path, created_at: new Date().toISOString() });
      return { ok: true };
    },
    [userId, selfie],
  );

  return { profile, selfie, selfieUrl, loading, error, refresh: load, saveProfile, uploadAvatar, submitSelfie };
}