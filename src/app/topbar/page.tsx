"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";

const EMPTY_SLOTS = ["", "", ""];
const MAX = 3;

const normalizeSlots = (messages, text) => {
  const fromArr = Array.isArray(messages)
    ? messages.map((m) => String(m || "").trim()).filter(Boolean)
    : [];
  const fromText = String(text || "")
    .split(/\s*[|·•]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  const list = (fromArr.length ? fromArr : fromText).slice(0, MAX);
  while (list.length < MAX) list.push("");
  return list;
};

export default function TopBarPage() {
  const [messages, setMessages] = useState([...EMPTY_SLOTS]);
  const [bgColor, setBgColor] = useState("#4a0f0f");
  const [textColor, setTextColor] = useState("#ffffff");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topbar`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(normalizeSlots(data.data.messages, data.data.text));
          setBgColor(data.data.bgColor || "#4a0f0f");
          setTextColor(data.data.textColor || "#ffffff");
          setIsActive(data.data.isActive !== false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filled = messages.map((m) => m.trim()).filter(Boolean);
  const previewText =
    filled.length > 0
      ? filled.join("  ·  ")
      : "Add messages below — preview appears here";

  const setSlot = (index, value) => {
    setMessages((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSave = async () => {
    const clean = messages.map((m) => m.trim()).filter(Boolean).slice(0, MAX);
    if (!clean.length) {
      notifyError("Add at least one message");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topbar/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: clean,
            text: clean.join("  ·  "),
            bgColor,
            textColor,
            isActive,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setMessages(normalizeSlots(data.data.messages, data.data.text));
        notifySuccess("Top bar updated!");
      } else notifyError(data.message || "Update failed");
    } catch {
      notifyError("Something went wrong");
    }
  };

  if (loading)
    return (
      <Wrapper>
        <div className="p-8">Loading...</div>
      </Wrapper>
    );

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <div className="max-w-xl bg-white px-8 py-8 rounded-md">
          <h2 className="text-base font-semibold text-heading mb-2">
            Top Bar Settings
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Add up to 3 short promos. They scroll one after another on the
            storefront (e.g. free shipping, running offer, coupon code).
          </p>

          <div className="mb-6 rounded overflow-hidden">
            <div
              style={{
                background: bgColor,
                color: textColor,
                padding: "10px 12px",
                textAlign: "center",
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {previewText}
            </div>
          </div>

          <div className="mb-5 space-y-3">
            <label className="block text-sm font-medium">
              Messages (max {MAX})
            </label>
            {messages.map((msg, i) => (
              <div key={i}>
                <label className="mb-1 block text-xs text-slate-500">
                  Message {i + 1}
                  {i === 0 ? " *" : " (optional)"}
                </label>
                <input
                  value={msg}
                  onChange={(e) => setSlot(i, e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={
                    i === 0
                      ? "Free shipping above ₹1999"
                      : i === 1
                        ? "Running sale — limited time"
                        : "Use code RAKHI10 get 10% off"
                  }
                  maxLength={80}
                />
              </div>
            ))}
            <p className="text-xs text-slate-400">
              Tip: keep each line short — about 4–8 words works best in the
              marquee.
            </p>
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border"
                />
                <input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Show Top Bar
            </label>
          </div>

          <button type="button" onClick={handleSave} className="tp-btn px-7 py-2">
            Save Changes
          </button>
        </div>
      </div>
    </Wrapper>
  );
}
