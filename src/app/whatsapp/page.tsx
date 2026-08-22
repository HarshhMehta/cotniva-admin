"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";
import { adminFetchInit } from "@/utils/admin-auth-headers";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function WhatsAppPage() {
  const [status, setStatus] = useState("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [number, setNumber] = useState<string | null>(null);
  const [sessionTakenElsewhere, setSessionTakenElsewhere] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const startedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/whatsapp/status`, adminFetchInit());
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.status);
        setQr(data.data.qr || null);
        setNumber(data.data.number || null);
        setSessionTakenElsewhere(Boolean(data.data.sessionTakenElsewhere));
      }
    } catch {
      // silent poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  const connectSession = useCallback(async () => {
    setBusy(true);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/connect`, adminFetchInit({ method: "POST" }));
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.status);
        setQr(data.data.qr || null);
        setNumber(data.data.number || null);
        setSessionTakenElsewhere(Boolean(data.data.sessionTakenElsewhere));
      } else {
        notifyError("Could not start WhatsApp connection");
      }
    } catch {
      notifyError("Something went wrong");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 3000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  // One connect attempt on open only if idle (not after 440 / replaced)
  useEffect(() => {
    if (startedRef.current || loading) return;
    if (
      status === "connected" ||
      status === "qr" ||
      status === "connecting" ||
      status === "replaced" ||
      sessionTakenElsewhere
    ) {
      startedRef.current = true;
      return;
    }
    startedRef.current = true;
    connectSession();
  }, [loading, status, sessionTakenElsewhere, connectSession]);

  const handleLogout = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/logout`, adminFetchInit({ method: "POST" }));
      const data = await res.json();
      if (data.success) {
        notifySuccess(data.message || "Disconnected");
        setStatus("disconnected");
        setQr(null);
        setNumber(null);
        setSessionTakenElsewhere(false);
        startedRef.current = false;
        setTimeout(fetchStatus, 800);
      } else {
        notifyError("Failed to disconnect");
      }
    } catch {
      notifyError("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const statusLabel: Record<string, string> = {
    connected: "Connected",
    qr: "Scan QR Code",
    connecting: "Connecting...",
    disconnected: "Disconnected",
    replaced: "Taken by another server",
  };

  const statusColor: Record<string, string> = {
    connected: "bg-green-100 text-green-800",
    qr: "bg-amber-100 text-amber-800",
    connecting: "bg-themeLight text-theme",
    disconnected: "bg-gray-100 text-gray-700",
    replaced: "bg-red-100 text-red-800",
  };

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100 min-h-screen">
        <div className="max-w-2xl bg-white px-4 sm:px-8 py-6 sm:py-8 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold text-heading mb-2">
            WhatsApp Login (Baileys)
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Scan this QR with WhatsApp on your phone to enable OTP login for
            customers. Open WhatsApp → Linked Devices → Link a Device.
          </p>

          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                statusColor[status] || statusColor.disconnected
              }`}
            >
              {statusLabel[status] || status}
            </span>
            {number && (
              <span className="text-sm text-gray-600">
                Connected as: <strong>+{number}</strong>
              </span>
            )}
          </div>

          {(sessionTakenElsewhere || status === "replaced") && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed">
              Another client took this WhatsApp session (code 440). Close WhatsApp
              Web / other servers, wait 10 seconds, then click Connect once.
            </div>
          )}

          <div className="mb-6 flex justify-center">
            {loading && !qr && status !== "connected" ? (
              <div className="w-[280px] h-[280px] flex items-center justify-center border border-dashed border-gray-300 rounded-md text-sm text-gray-500">
                Loading…
              </div>
            ) : status === "connected" ? (
              <div className="w-[280px] h-[280px] flex flex-col items-center justify-center border border-green-200 bg-green-50 rounded-md text-center px-4">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-sm font-medium text-green-800">
                  WhatsApp is connected
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Customer login OTPs will be sent from this number.
                </p>
              </div>
            ) : qr ? (
              <img
                src={qr}
                alt="WhatsApp QR"
                className="w-[280px] h-[280px] border border-gray-200 rounded-md"
              />
            ) : (
              <div className="w-[280px] h-[280px] flex items-center justify-center border border-dashed border-gray-300 rounded-md text-sm text-gray-500 text-center px-4">
                Click Connect to start WhatsApp
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={connectSession}
              disabled={busy || status === "connected" || status === "connecting"}
              className="tp-btn px-5 py-2 bg-theme text-white rounded text-sm disabled:opacity-60"
            >
              {status === "qr" ? "Refresh QR" : "Connect"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={busy || status === "disconnected"}
              className="px-5 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded text-xs text-gray-600 leading-relaxed">
            <strong className="block mb-1">Important</strong>
            Run WhatsApp on <em>only one</em> backend at a time (local OR
            production). Two servers with the same number cause endless
            connect/disconnect (error 440).
            <br />
            <br />
            1. Scan the QR using the business WhatsApp number.
            <br />
            2. Keep that one backend running so the session stays alive.
            <br />
            3. Customers enter mobile → OTP on WhatsApp → login.
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
