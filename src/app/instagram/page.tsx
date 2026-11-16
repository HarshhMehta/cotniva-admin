"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";
import { adminFetchInit } from "@/utils/admin-auth-headers";
import { adminApiUrl } from "@/utils/api-base";

type InstagramStatus = {
  connected: boolean;
  username: string;
  expiresAt: string | null;
  lastRefreshedAt: string | null;
  lastError: string;
  expired: boolean;
};

const emptyStatus: InstagramStatus = {
  connected: false,
  username: "",
  expiresAt: null,
  lastRefreshedAt: null,
  lastError: "",
  expired: false,
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function InstagramSettingsPage() {
  const [status, setStatus] = useState<InstagramStatus>(emptyStatus);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadStatus = async () => {
    const res = await fetch(
      adminApiUrl("/api/instagram/status"),
      adminFetchInit()
    );
    const data = await res.json();
    if (data.success) setStatus(data.data || emptyStatus);
  };

  useEffect(() => {
    loadStatus()
      .catch(() => notifyError("Could not load Instagram status"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!token.trim()) {
      notifyError("Paste a new Instagram access token first");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        adminApiUrl("/api/instagram/token"),
        adminFetchInit({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: token.trim() }),
        })
      );
      const data = await res.json();
      if (data.success) {
        notifySuccess(data.message || "Instagram connected");
        setToken("");
        setStatus(data.data || emptyStatus);
      } else {
        notifyError(data.message || "Could not connect Instagram");
      }
    } catch {
      notifyError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch(
        adminApiUrl("/api/instagram/disconnect"),
        adminFetchInit({ method: "POST" })
      );
      const data = await res.json();
      if (data.success) {
        notifySuccess("Instagram disconnected");
        setStatus(data.data || emptyStatus);
      } else {
        notifyError(data.message || "Could not disconnect");
      }
    } catch {
      notifyError("Something went wrong");
    } finally {
      setDisconnecting(false);
    }
  };

  const badgeClass = status.connected && !status.expired
    ? "bg-green-100 text-green-800"
    : status.expired
      ? "bg-amber-100 text-amber-800"
      : "bg-gray-100 text-gray-700";

  if (loading) {
    return (
      <Wrapper>
        <div className="p-8">Loading...</div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <div className="max-w-2xl bg-white px-4 sm:px-8 py-6 sm:py-8 rounded-md">
          <h2 className="text-base font-semibold text-heading mb-2">
            Instagram feed
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Homepage “Catch us on Instagram” uses this connection. Tokens expire
            every 60 days; Cotniva refreshes them automatically after you save a
            new long-lived token once.
          </p>

          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
            >
              {status.connected && !status.expired
                ? "Connected"
                : status.expired
                  ? "Token expired"
                  : "Not connected"}
            </span>
            {status.username && (
              <span className="text-sm text-gray-600">
                Account: <strong>@{status.username}</strong>
              </span>
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded border border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500">Expires</div>
              <div>{formatDate(status.expiresAt)}</div>
            </div>
            <div className="rounded border border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500">Last refreshed</div>
              <div>{formatDate(status.lastRefreshedAt)}</div>
            </div>
          </div>

          {status.lastError ? (
            <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 leading-relaxed">
              {status.lastError}
            </div>
          ) : null}

          <ol className="mb-6 list-decimal pl-5 text-sm text-gray-600 space-y-2">
            <li>
              Open{" "}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Meta Developer Apps
              </a>
              .
            </li>
            <li>Select the Cotniva Instagram app.</li>
            <li>
              Go to Instagram → API setup with Instagram login → Generate token
              for <strong>@cotniva</strong>.
            </li>
            <li>Paste the long-lived token below and save. Do not share it.</li>
          </ol>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              New access token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={4}
              placeholder="IGAAxxxx…"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="tp-btn px-7 py-2"
            >
              {saving ? "Connecting…" : "Save token"}
            </button>
            {status.connected && (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-5 py-2 text-sm border border-gray-300 rounded"
              >
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
