import { NextRequest, NextResponse } from "next/server";

/**
 * Forward an admin browser request to the Cotniva API (cPanel).
 * Rewrites Set-Cookie for first-party admin host; converts PATCH/PUT/DELETE → POST
 * with X-HTTP-Method-Override (LiteSpeed often blocks those verbs).
 */
export function backendOrigin(): string {
  const fromEnv = (
    process.env.BACKEND_URL ||
    process.env.API_PROXY_TARGET ||
    ""
  ).replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const publicBase = String(process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
    /\/$/,
    ""
  );
  if (
    publicBase &&
    !publicBase.includes("localhost") &&
    !publicBase.includes("127.0.0.1")
  ) {
    return publicBase;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "https://backend.cotniva.com";
  }

  return "http://127.0.0.1:7001";
}

function rewriteSetCookie(raw: string) {
  let c = String(raw);
  c = c.replace(/;\s*Domain=[^;]*/gi, "");
  if (!/;\s*Secure/i.test(c)) c += "; Secure";
  if (/;\s*SameSite=None/i.test(c)) {
    c = c.replace(/;\s*SameSite=None/i, "; SameSite=Lax");
  } else if (!/;\s*SameSite=/i.test(c)) {
    c += "; SameSite=Lax";
  }
  if (!/;\s*Path=/i.test(c)) c += "; Path=/";
  return c;
}

/** Only auth cookies are needed upstream. Extra Vercel/browser cookies make the
 * Cookie header too large and LiteSpeed drops the connection (~10s → fetch failed). */
const FORWARD_COOKIE_NAMES = new Set([
  "cotniva_admin_access",
  "cotniva_admin_refresh",
]);

function filterUpstreamCookie(raw: string | null): string {
  if (!raw) return "";
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const name = part.split("=", 1)[0]?.trim();
      return Boolean(name && FORWARD_COOKIE_NAMES.has(name));
    })
    .join("; ");
}

/** @param apiPath path after /api/ e.g. "product/all" */
export async function proxyToBackend(
  req: NextRequest,
  apiPath: string
): Promise<Response> {
  const backend = backendOrigin();
  if (!backend) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Admin API proxy is not configured. Set BACKEND_URL on Vercel to your API origin.",
      },
      { status: 500 }
    );
  }

  const incoming = new URL(req.url);
  const path = String(apiPath || "").replace(/^\//, "");
  const target = `${backend}/api/${path}${incoming.search}`;

  const headers = new Headers();
  const forward = [
    "accept",
    "accept-language",
    "authorization",
    "content-type",
    "x-device-id",
    "x-requested-with",
  ];
  for (const key of forward) {
    const v = req.headers.get(key);
    if (v) headers.set(key, v);
  }

  const cookie = filterUpstreamCookie(req.headers.get("cookie"));
  if (cookie) headers.set("cookie", cookie);

  const adminHost = req.headers.get("host") || "";
  headers.set("x-forwarded-host", adminHost);
  headers.set("x-forwarded-proto", "https");
  const xf = req.headers.get("x-forwarded-for");
  if (xf) headers.set("x-forwarded-for", xf);
  const origin = req.headers.get("origin");
  if (origin) headers.set("origin", origin);
  const referer = req.headers.get("referer");
  if (referer) headers.set("referer", referer);

  let upstreamMethod = req.method;
  if (
    upstreamMethod === "PATCH" ||
    upstreamMethod === "PUT" ||
    upstreamMethod === "DELETE"
  ) {
    headers.set("X-HTTP-Method-Override", upstreamMethod);
    upstreamMethod = "POST";
  }

  const init: RequestInit = {
    method: upstreamMethod,
    headers,
    redirect: "manual",
  };

  if (upstreamMethod !== "GET" && upstreamMethod !== "HEAD") {
    init.body = Buffer.from(await req.arrayBuffer());
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    // One quick retry — LiteSpeed occasionally drops the first connection.
    try {
      upstream = await fetch(target, init);
    } catch (retryErr) {
      const message =
        retryErr instanceof Error
          ? retryErr.message
          : err instanceof Error
            ? err.message
            : "error";
      return NextResponse.json(
        { success: false, message: `Upstream API unreachable: ${message}` },
        { status: 502 }
      );
    }
  }

  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (
      k === "transfer-encoding" ||
      k === "connection" ||
      k === "content-encoding" ||
      k === "content-length" ||
      k === "set-cookie"
    ) {
      return;
    }
    outHeaders.set(key, value);
  });

  const upstreamHeaders = upstream.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const rawCookies =
    typeof upstreamHeaders.getSetCookie === "function"
      ? upstreamHeaders.getSetCookie()
      : [];

  if (rawCookies.length > 0) {
    for (const c of rawCookies) {
      outHeaders.append("set-cookie", rewriteSetCookie(c));
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) {
      outHeaders.append("set-cookie", rewriteSetCookie(single));
    }
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  const contentType = String(upstream.headers.get("content-type") || "");
  if (contentType.includes("text/html")) {
    return NextResponse.json(
      {
        success: false,
        message:
          upstream.status === 403
            ? "Request blocked by hosting firewall. Please retry or contact support."
            : "API returned an unexpected HTML response.",
      },
      { status: upstream.status >= 400 ? upstream.status : 502 }
    );
  }

  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}
