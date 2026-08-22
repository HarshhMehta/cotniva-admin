export const API_BASE =
  String(process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

/** Browser requests to the Cotniva API with HttpOnly admin session cookies */
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
