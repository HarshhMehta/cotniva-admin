/**
 * Admin API base URL.
 *
 * In the browser we always use same-origin `/api/*` (Vercel proxy → cPanel backend).
 * Avoids cross-site cookies and cPanel ModSecurity blocking PATCH on the API host.
 */
export function getAdminApiBase(): string {
  if (typeof window !== "undefined") {
    return "";
  }

  const site = String(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (site) return site;

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return String(
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ""
  ).replace(/\/$/, "");
}

/** Build `/api/...` URL for fetch (relative in browser). */
export function adminApiUrl(path: string): string {
  const trimmed = String(path || "").trim();
  if (!trimmed || trimmed === "/") return "";
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const base = getAdminApiBase();
  return base ? `${base}${normalized}` : normalized;
}
