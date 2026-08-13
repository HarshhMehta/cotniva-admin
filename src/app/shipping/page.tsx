"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import { notifyError, notifySuccess } from "@/utils/toast";

export default function ShippingSettingsPage() {
  const [deliveryCharge, setDeliveryCharge] = useState(100);
  const [freeShippingAbove, setFreeShippingAbove] = useState(1299);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store-settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDeliveryCharge(data.data.deliveryCharge ?? 100);
          setFreeShippingAbove(data.data.freeShippingAbove ?? 1299);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store-settings/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deliveryCharge: Number(deliveryCharge),
            freeShippingAbove: Number(freeShippingAbove),
          }),
        }
      );
      const data = await res.json();
      if (data.success) notifySuccess("Shipping settings saved!");
      else notifyError(data.message || "Update failed");
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
        <div className="max-w-xl bg-white px-4 sm:px-8 py-6 sm:py-8 rounded-md">
          <h2 className="text-base font-semibold text-heading mb-2">
            Shipping / Delivery
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Checkout delivery charges are calculated from these values. Free
            shipping applies when cart subtotal is at or above the threshold.
          </p>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium">
              Delivery charges (₹)
            </label>
            <input
              type="number"
              min={0}
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(Number(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium">
              Free delivery above (₹)
            </label>
            <input
              type="number"
              min={0}
              value={freeShippingAbove}
              onChange={(e) => setFreeShippingAbove(Number(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              Example: charge ₹{Number(deliveryCharge) || 0} until cart reaches ₹
              {Number(freeShippingAbove) || 0}, then free.
            </p>
          </div>

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
