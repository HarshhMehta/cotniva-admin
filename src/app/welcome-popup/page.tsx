"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import GlobalImgUpload from "@/app/components/category/global-img-upload";
import { notifyError, notifySuccess } from "@/utils/toast";
import { adminFetchInit } from "@/utils/admin-auth-headers";

const DEFAULTS = {
  isActive: true,
  image: "",
  heading: "HEY, DIVA! ✨",
  subheading: "Welcome to Cotniva 💗 A LITTLE WELCOME GIFT FOR YOU 🎁",
  body: "Get 10% OFF on your first Cotniva order.",
  codePrefix: "Use code",
  promoCode: "WELCOME10",
  codeSuffix: "at checkout.",
  buttonText: "SHOP NOW",
  buttonLink: "/shop",
};

export default function WelcomePopupPage() {
  const [form, setForm] = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/welcome-popup`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setForm({
            isActive: data.data.isActive !== false,
            image: data.data.image || "",
            heading: data.data.heading || DEFAULTS.heading,
            subheading: data.data.subheading || DEFAULTS.subheading,
            body: data.data.body || DEFAULTS.body,
            codePrefix: data.data.codePrefix || DEFAULTS.codePrefix,
            promoCode: data.data.promoCode || DEFAULTS.promoCode,
            codeSuffix: data.data.codeSuffix || DEFAULTS.codeSuffix,
            buttonText: data.data.buttonText || DEFAULTS.buttonText,
            buttonLink: data.data.buttonLink || DEFAULTS.buttonLink,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const setField = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.heading.trim()) {
      notifyError("Heading is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/welcome-popup/update`,
        adminFetchInit({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            heading: form.heading.trim(),
            subheading: form.subheading.trim(),
            body: form.body.trim(),
            codePrefix: form.codePrefix.trim(),
            promoCode: form.promoCode.trim().toUpperCase(),
            codeSuffix: form.codeSuffix.trim(),
            buttonText: form.buttonText.trim() || "SHOP NOW",
            buttonLink: form.buttonLink.trim() || "/shop",
          }),
        })
      );
      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        notifySuccess("Welcome popup saved!");
      } else notifyError(data.message || "Update failed");
    } catch {
      notifyError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

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
            Welcome Popup
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Split modal on the storefront — image on the left, offer text +
            copyable code + Shop Now on the right. Toggle off anytime.
          </p>

          {/* Live preview */}
          <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row min-h-[200px]">
              <div
                className="sm:w-1/2 min-h-[140px] bg-slate-100 bg-cover bg-center"
                style={{
                  backgroundImage: form.image
                    ? `url(${form.image})`
                    : undefined,
                  backgroundColor: form.image ? undefined : "#e8e0dc",
                }}
              >
                {!form.image && (
                  <div className="h-full min-h-[140px] flex items-center justify-center text-xs text-slate-400 px-4 text-center">
                    Upload an image for the left side
                  </div>
                )}
              </div>
              <div className="sm:w-1/2 p-4 sm:p-5 flex flex-col justify-center bg-white">
                <p className="text-sm font-bold text-[#4a1f1a] mb-1">
                  {form.heading || "Heading"}
                </p>
                <p className="text-[11px] text-slate-600 mb-2 leading-snug">
                  {form.subheading}
                </p>
                <p className="text-xs text-slate-800 mb-2">{form.body}</p>
                <p className="text-xs text-slate-700 mb-3">
                  {form.codePrefix}{" "}
                  <span className="font-semibold tracking-wide text-[#4a1f1a]">
                    {form.promoCode || "CODE"}
                  </span>{" "}
                  {form.codeSuffix}
                </p>
                <span className="inline-block self-start bg-[#4a1f1a] text-white text-[10px] font-semibold tracking-widest px-4 py-2 rounded">
                  {form.buttonText || "SHOP NOW"}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <input
              type="checkbox"
              id="welcomeActive"
              checked={form.isActive}
              onChange={(e) => setField("isActive", e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="welcomeActive" className="text-sm font-medium">
              Show welcome popup on storefront
            </label>
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium">Left image</label>
            <GlobalImgUpload
              setImage={(value) => {
                if (typeof value === "function") {
                  setForm((prev) => ({
                    ...prev,
                    image: value(prev.image),
                  }));
                } else {
                  setField("image", value || "");
                }
              }}
              image={form.image}
              default_img={form.image || undefined}
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
              label="Upload popup image"
              inputId="welcomePopupImage"
              hint="Portrait / lifestyle works best (left half of modal)"
            />
            {form.image ? (
              <button
                type="button"
                className="mt-2 text-xs text-red-500 underline"
                onClick={() => setField("image", "")}
              >
                Remove image
              </button>
            ) : null}
          </div>

          {(
            [
              ["heading", "Heading", "HEY, DIVA! ✨"],
              [
                "subheading",
                "Subheading",
                "Welcome to Cotniva 💗 A LITTLE WELCOME GIFT FOR YOU 🎁",
              ],
              ["body", "Body text", "Get 10% OFF on your first Cotniva order."],
              ["codePrefix", "Text before code", "Use code"],
              ["promoCode", "Promo code (copyable)", "WELCOME10"],
              ["codeSuffix", "Text after code", "at checkout."],
              ["buttonText", "Button text", "SHOP NOW"],
              ["buttonLink", "Button link", "/shop"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key} className="mb-4">
              <label className="mb-1 block text-sm font-medium">{label}</label>
              <input
                value={String(form[key])}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder={placeholder}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="tp-btn px-7 py-2"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </Wrapper>
  );
}
