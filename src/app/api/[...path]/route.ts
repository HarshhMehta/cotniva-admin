import { NextRequest } from "next/server";
import { proxyToBackend } from "@/utils/proxy-to-backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin API proxy for Cotniva Admin.
 * Browser → cotniva-admin.vercel.app/api/* → backend.cotniva.com/api/*
 */
async function proxy(
  req: NextRequest,
  context: { params: Promise<{ path?: string[] }> }
) {
  const params = await context.params;
  const parts = params?.path;
  const path = Array.isArray(parts) ? parts.join("/") : String(parts || "");
  return proxyToBackend(req, path);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
