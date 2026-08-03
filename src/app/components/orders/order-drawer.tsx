"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import {
  useGetSingleOrderQuery,
  useUpdateAdminNotesMutation,
  useUpdateStatusMutation,
} from "@/redux/order/orderApi";
import { notifyError, notifySuccess } from "@/utils/toast";
import InvoicePrint from "./invoice-print";
import type { IOrderCartItem, Order } from "@/types/order-amount-type";

const STATUS_OPTS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "delivered", label: "Delivered" },
  { value: "cancel", label: "Cancelled" },
];

const inr = (n?: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const lineUnit = (item: IOrderCartItem) => {
  const price = Number(item.price) || 0;
  const discount = Number(item.discount) || 0;
  return discount > 0 ? price - (price * discount) / 100 : price;
};

const productImg = (item: IOrderCartItem) =>
  item.img ||
  item.imageURLs?.find((x) => x?.isDefault)?.img ||
  item.imageURLs?.[0]?.img ||
  "";

const paymentBadge = (order?: Order | null) => {
  const method = String(order?.paymentMethod || "").toLowerCase();
  const paid = Boolean(order?.paymentIntent?.razorpay_payment_id);
  if (method.includes("razorpay") || method.includes("card")) {
    return paid
      ? { label: "Paid", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : { label: "Unpaid", cls: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (method.includes("cod") || method.includes("cash")) {
    return {
      label: order?.status === "delivered" ? "COD Collected" : "COD Pending",
      cls: "bg-sky-50 text-sky-700 border-sky-200",
    };
  }
  return { label: order?.paymentMethod || "—", cls: "bg-slate-50 text-slate-600 border-slate-200" };
};

const statusCls = (s?: string) => {
  const v = String(s || "").toLowerCase();
  if (v === "delivered") return "bg-emerald-50 text-emerald-700";
  if (v === "processing") return "bg-indigo-50 text-indigo-700";
  if (v === "cancel") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

type Props = {
  orderId: string | null;
  open: boolean;
  onClose: () => void;
};

const OrderDrawer = ({ orderId, open, onClose }: Props) => {
  const skip = !orderId || !open;
  const { data: order, isLoading, isFetching, isError } = useGetSingleOrderQuery(
    orderId || "",
    { skip }
  );
  const [updateStatus] = useUpdateStatusMutation();
  const [updateNotes, { isLoading: savingNotes }] = useUpdateAdminNotesMutation();
  const [notes, setNotes] = useState("");
  const printRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNotes(order?.adminNotes || "");
  }, [order?.adminNotes, order?._id]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${order?.invoice || "order"}`,
  });

  const pay = useMemo(() => paymentBadge(order), [order]);

  const timeline = useMemo(() => {
    if (!order) return [];
    const created = order.createdAt;
    const updated = order.updatedAt;
    const status = String(order.status || "pending").toLowerCase();
    return [
      {
        key: "placed",
        title: "Order placed",
        time: created,
        done: true,
      },
      {
        key: "processing",
        title: "Processing",
        time: status === "processing" || status === "delivered" ? updated : null,
        done: status === "processing" || status === "delivered",
      },
      {
        key: "delivered",
        title: status === "cancel" ? "Cancelled" : "Delivered",
        time: status === "delivered" || status === "cancel" ? updated : null,
        done: status === "delivered" || status === "cancel",
      },
    ];
  }, [order]);

  const fullAddress = order
    ? [order.address, order.city, order.zipCode, order.country]
        .filter(Boolean)
        .join(", ")
    : "";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        `${order?.name || ""}\n${fullAddress}\nPhone: ${order?.contact || ""}`
      );
      notifySuccess("Address copied");
    } catch {
      notifyError("Could not copy");
    }
  };

  const onStatus = async (value: string) => {
    if (!orderId) return;
    const res = await updateStatus({ id: orderId, status: { status: value } });
    if ("data" in res && res.data?.message) notifySuccess(res.data.message);
  };

  const onSaveNotes = async () => {
    if (!orderId) return;
    const res = await updateNotes({ id: orderId, adminNotes: notes });
    if ("data" in res && res.data?.success) notifySuccess("Notes saved");
    else notifyError("Failed to save notes");
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed top-0 right-0 z-[91] h-full w-full max-w-[520px] bg-white shadow-2xl flex flex-col animate-[slideIn_.28s_ease]">
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(24px); opacity: 0.6; }
            to { transform: none; opacity: 1; }
          }
        `}</style>

        <header className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
              Order
            </p>
            <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
              #{order?.invoice || "…"}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusCls(
                  order?.status
                )}`}
              >
                {order?.status || "—"}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pay.cls}`}
              >
                {pay.label}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {String(order?.paymentMethod || "—")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {(isLoading || isFetching) && (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-slate-100 rounded-lg" />
              <div className="h-32 bg-slate-100 rounded-lg" />
              <div className="h-40 bg-slate-100 rounded-lg" />
            </div>
          )}

          {isError && (
            <p className="text-sm text-rose-600">Failed to load order details.</p>
          )}

          {order && !isLoading && (
            <>
              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Customer
                </h3>
                <p className="text-sm font-semibold text-slate-900">
                  {order.name ||
                    (typeof order.user === "object" ? order.user?.name : "") ||
                    "—"}
                </p>
                <p className="text-sm text-slate-600 mt-1">{order.email || "—"}</p>
                <p className="text-sm text-slate-900 font-medium mt-1">
                  {order.contact || "No phone"}
                </p>
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Shipping address
                  </h3>
                  <button
                    type="button"
                    onClick={copyAddress}
                    className="text-[11px] font-semibold text-[#4a1f1a] underline"
                  >
                    Copy address
                  </button>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {order.name}
                  {"\n"}
                  {fullAddress}
                </p>
                {order.orderNote ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Customer note: {order.orderNote}
                  </p>
                ) : null}
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Products ({order.cart?.length || 0})
                </h3>
                <ul className="space-y-3">
                  {(order.cart || []).map((item, idx) => {
                    const img = productImg(item);
                    const qty = item.orderQuantity || 1;
                    return (
                      <li
                        key={`${item._id || idx}-${item.selectedSize || ""}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-14 h-[72px] bg-slate-100 rounded overflow-hidden shrink-0">
                          {img ? (
                            <Image
                              src={img}
                              alt={item.title || "product"}
                              fill
                              className="object-cover object-top"
                              sizes="56px"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.selectedSize
                              ? `Size: ${item.selectedSize}`
                              : "Size: —"}{" "}
                            · Qty: {qty}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                          {inr(lineUnit(item) * qty)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{inr(order.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping</span>
                    <span>{inr(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Discount</span>
                    <span>−{inr(order.discount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900 pt-1">
                    <span>Total</span>
                    <span>{inr(order.totalAmount)}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Payment details
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Method</dt>
                    <dd className="font-medium text-slate-900">
                      {order.paymentMethod}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-medium text-slate-900">{pay.label}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Razorpay Order</dt>
                    <dd className="font-mono text-[11px] text-slate-700 break-all text-right">
                      {order.paymentIntent?.razorpay_order_id || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Payment ID</dt>
                    <dd className="font-mono text-[11px] text-slate-700 break-all text-right">
                      {order.paymentIntent?.razorpay_payment_id || "—"}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Status timeline
                </h3>
                <ol className="space-y-3">
                  {timeline.map((step) => (
                    <li key={step.key} className="flex gap-3">
                      <span
                        className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                          step.done ? "bg-[#4a1f1a]" : "bg-slate-300"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            step.done ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {step.time
                            ? dayjs(step.time).format("MMM D, YYYY · h:mm A")
                            : "Pending"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Update status
                </h3>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  value={String(order.status || "pending").toLowerCase()}
                  onChange={(e) => onStatus(e.target.value)}
                >
                  {STATUS_OPTS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </section>

              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Admin notes
                </h3>
                <textarea
                  className="w-full min-h-[96px] rounded-lg border border-slate-200 p-3 text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes for this order…"
                />
                <button
                  type="button"
                  onClick={onSaveNotes}
                  disabled={savingNotes}
                  className="mt-2 h-9 px-4 rounded-lg bg-[#4a1f1a] text-white text-xs font-semibold tracking-wide uppercase disabled:opacity-50"
                >
                  {savingNotes ? "Saving…" : "Save notes"}
                </button>
              </section>
            </>
          )}
        </div>

        <footer className="border-t border-slate-200 px-5 py-3 flex gap-2 bg-white">
          <button
            type="button"
            onClick={() => handlePrint()}
            disabled={!order}
            className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Download invoice
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold"
          >
            Close
          </button>
        </footer>
      </aside>

      {order && (
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <InvoicePrint orderData={order} />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDrawer;
