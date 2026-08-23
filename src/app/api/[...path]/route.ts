import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin API proxy for Cotniva Admin.
 *
 * Browser → cotniva-admin.vercel.app/api/* (first-party cookies)
 * Vercel  → backend.cotniva.com/api/* (POST for PATCH — cPanel ModSecurity blocks PATCH)
 */
function backendOrigin() {
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

async function proxy(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const params = await context.params;
  const parts = params?.path;
  const path = Array.isArray(parts) ? parts.join("/") : String(parts || "");

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
  const target = `${backend}/api/${path}${incoming.search}`;

  const headers = new Headers();
  const forward = [
    "accept",
    "accept-language",
    "authorization",
    "content-type",
    "cookie",
    "x-device-id",
    "x-requested-with",
  ];
  for (const key of forward) {
    const v = req.headers.get(key);
    if (v) headers.set(key, v);
  }

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
  if (upstreamMethod === "PATCH" || upstreamMethod === "PUT" || upstreamMethod === "DELETE") {
    headers.set("X-HTTP-Method-Override", upstreamMethod);
    upstreamMethod = "POST";
  }

  const init: RequestInit & { duplex?: "half" } = {
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
    const message = err instanceof Error ? err.message : "error";
    return NextResponse.json(
      { success: false, message: `Upstream API unreachable: ${message}` },
      { status: 502 }
    );
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

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
