export const FULFILLMENT_FLOW = [
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Confirmed (legacy)",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancel: "Cancelled",
  cancelled: "Cancelled",
};

export const CANCEL_REASONS = [
  { code: "product_unavailable", label: "Product unavailable" },
  { code: "inventory_issue", label: "Inventory issue" },
  { code: "pricing_error", label: "Pricing error" },
  { code: "customer_address_issue", label: "Customer/address issue" },
  { code: "payment_verification_issue", label: "Payment/order verification issue" },
  { code: "other", label: "Other" },
];

export const NORMAL_NEXT: Record<string, string[]> = {
  confirmed: ["processing"],
  pending: ["processing"], // legacy mapped as confirmed
  processing: ["packed"],
  packed: ["shipped"],
  shipped: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
};

export const canEmergencyCancel = (status?: string) =>
  ["confirmed", "pending", "processing", "packed"].includes(
    String(status || "").toLowerCase()
  );

export const isCancelledStatus = (status?: string) =>
  ["cancel", "cancelled"].includes(String(status || "").toLowerCase());

export const statusBadgeClass = (s?: string) => {
  const v = String(s || "").toLowerCase();
  if (v === "delivered") return "bg-emerald-50 text-emerald-700";
  if (v === "out_for_delivery") return "bg-teal-50 text-teal-700";
  if (v === "shipped") return "bg-sky-50 text-sky-700";
  if (v === "packed") return "bg-violet-50 text-violet-700";
  if (v === "processing") return "bg-indigo-50 text-indigo-700";
  if (v === "confirmed" || v === "pending") return "bg-amber-50 text-amber-800";
  if (v === "cancel" || v === "cancelled") return "bg-rose-50 text-rose-700";
  return "bg-slate-50 text-slate-600";
};

export const paymentBadgeClass = (s?: string) => {
  const v = String(s || "").toLowerCase();
  if (v === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (v === "refunded") return "bg-slate-100 text-slate-700 border-slate-200";
  if (v === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

export const nextStatusOptions = (current?: string) => {
  const cur = String(current || "confirmed").toLowerCase();
  return (NORMAL_NEXT[cur] || []).map((value) => ({
    value,
    label: STATUS_LABELS[value] || value,
  }));
};
