/**
 * Builds an absolute redirect URL that respects the app base path.
 * Used for Supabase email confirmation / recovery links.
 */
export const authRedirectUrl = (path: string): string => {
  const baseUrl = import.meta.env.BASE_URL || "/";
  const basePath = baseUrl.replace(/\/+$/, "").replace(/^\/+/, "");
  const prefix = basePath ? `/${basePath}` : "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${prefix}${cleanPath}`;
};