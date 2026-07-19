"use client";
import React, { useEffect, useState, useCallback } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function WhatsAppPage() {
  const [status, setStatus] = useState("disconnected");
  const [qr, setQr] = useState<string | null>(null);
  const [number, setNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/whatsapp/status`);
      const data = await res.json();
      if (data.success) {
        setStatus(data.data.status);
        setQr(data.data.qr || null);
        setNumber(data.data.number || null);
      }
    } catch {
      // silent poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 2500);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const handleLogout = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${API}/api/whatsapp/logout`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        notifySuccess(data.message || "Disconnected");
        setStatus("disconnected");
        setQr(null);
        setNumber(null);
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

  const handleRefresh = async () => {
    setBusy(true);
    setLoading(true);
    await fetchStatus();
    setBusy(false);
  };

  const statusLabel: Record<string, string> = {
    connected: "Connected",
    qr: "Scan QR Code",
    connecting: "Connecting...",
    disconnected: "Disconnected",
  };

  const statusColor: Record<string, string> = {
    connected: "bg-green-100 text-green-800",
    qr: "bg-amber-100 text-amber-800",
    connecting: "bg-blue-100 text-blue-800",
    disconnected: "bg-gray-100 text-gray-700",
  };

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100 min-h-screen">
        <div className="max-w-2xl bg-white px-8 py-8 rounded-md shadow-sm">
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

          <div className="mb-6 flex justify-center">
            {loading && !qr && status !== "connected" ? (
              <div className="w-[280px] h-[280px] flex items-center justify-center border border-dashed border-gray-300 rounded-md text-sm text-gray-500">
                Loading QR...
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
                Click Refresh to generate QR code
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={busy}
              className="tp-btn px-5 py-2 bg-theme text-white rounded text-sm disabled:opacity-60"
            >
              Refresh QR
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
            <strong className="block mb-1">How it works</strong>
            1. Scan the QR using the business WhatsApp number.
            <br />
            2. Keep the backend server running so the session stays alive.
            <br />
            3. Customers enter their mobile number on the store → OTP is sent on
            WhatsApp → they verify and log in.
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
