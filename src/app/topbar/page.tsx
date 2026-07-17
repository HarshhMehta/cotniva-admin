"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";

export default function TopBarPage() {
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#4a0f0f");
  const [textColor, setTextColor] = useState("#ffffff");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topbar`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setText(data.data.text);
          setBgColor(data.data.bgColor);
          setTextColor(data.data.textColor);
          setIsActive(data.data.isActive);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topbar/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, bgColor, textColor, isActive }),
      });
      const data = await res.json();
      if (data.success) notifySuccess("Top bar updated!");
      else notifyError("Update failed");
    } catch {
      notifyError("Something went wrong");
    }
  };

  if (loading) return <Wrapper><div className="p-8">Loading...</div></Wrapper>;

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">
        <div className="max-w-xl bg-white px-8 py-8 rounded-md">
          <h2 className="text-base font-semibold text-heading mb-6">Top Bar Settings</h2>

          {/* Preview */}
          <div className="mb-6 rounded overflow-hidden">
            <div style={{ background: bgColor, color: textColor, padding: "10px", textAlign: "center", fontSize: 13, letterSpacing: 1 }}>
              {text || "Preview will appear here"}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">Bar Text</label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="FREE SHIPPING ABOVE ₹1299 | COD AVAILABLE"
            />
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Background Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Text Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                <input value={textColor} onChange={(e) => setTextColor(e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm" />
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
            <label htmlFor="isActive" className="text-sm font-medium">Show Top Bar</label>
          </div>

          <button onClick={handleSave} className="tp-btn px-7 py-2">Save Changes</button>
        </div>
      </div>
    </Wrapper>
  );
}