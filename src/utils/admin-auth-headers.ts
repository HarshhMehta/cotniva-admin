import { getAdminApiBase, adminApiUrl } from "@/utils/api-base";

export { getAdminApiBase, adminApiUrl };

/** @deprecated Use adminApiUrl('/api/...') — kept for existing imports */
export const API_BASE = getAdminApiBase();

/** Browser requests with HttpOnly admin session cookies (same-origin proxy) */
export function adminFetchInit(
  init: RequestInit = {}
): RequestInit & { credentials: "include" } {
  return {
    ...init,
    credentials: "include",
    headers: {
      ...(init.headers || {}),
    },
  };
}

/** @deprecated Use adminFetchInit() — Bearer tokens are no longer used */
export function getAdminAuthHeaders(): HeadersInit {
  return {};
}
