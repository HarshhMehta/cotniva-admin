"use client";
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import {
  useGetCustomerByIdQuery,
  useUpdateCustomerStatusMutation,
} from "@/redux/customer/customerApi";
import { notifyError, notifySuccess } from "@/utils/toast";

dayjs.extend(relativeTime);

type Props = {
  customerId: string | null;
  open: boolean;
  onClose: () => void;
};

const inr = (n?: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const CustomerDrawer = ({ customerId, open, onClose }: Props) => {
  const { data, isLoading, isError } = useGetCustomerByIdQuery(
    customerId || "",
    { skip: !open || !customerId }
  );
  const [updateStatus] = useUpdateCustomerStatusMutation();
  const customer = data?.data;

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

  const cartItems = useMemo(() => {
    const cart = customer?.currentCart as
      | { items?: Array<Record<string, unknown>> }
      | Array<Record<string, unknown>>
      | null
      | undefined;
    if (!cart) return [];
    if (Array.isArray(cart)) return cart;
    return Array.isArray(cart.items) ? cart.items : [];
  }, [customer?.currentCart]);

  if (!open) return null;

  const setStatus = async (status: string) => {
    if (!customerId) return;
    try {
      await updateStatus({ id: customerId, status }).unwrap();
      notifySuccess("Status updated");
    } catch {
      notifyError("Could not update status");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/35 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 z-[81] h-full w-full max-w-[440px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold">
              Customer
            </p>
            <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
              {isLoading ? "Loading…" : customer?.name || "—"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {customer?.phone || customer?.email || ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isError && (
            <p className="text-sm text-rose-600">Failed to load customer</p>
          )}

          {customer && (
            <>
              <section>
                <h3 className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-2">
                  Customer information
                </h3>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
                  {[
                    ["Phone", customer.phone || "—"],
                    ["Email", customer.email || "—"],
                    [
                      "Registered",
                      customer.registrationDate
                        ? dayjs(customer.registrationDate).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "—",
                    ],
                    [
                      "Last login",
                      customer.lastLogin
                        ? dayjs(customer.lastLogin).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "—",
                    ],
                    ["Status", customer.status || "—"],
                    ["Wishlist", String(customer.wishlistCount ?? 0)],
                  ].map(([k, v]) => (
                    <div
                      key={String(k)}
                      className="flex justify-between gap-3 px-3 py-2.5"
                    >
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-900 text-right">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  {["active", "inactive", "blocked"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${
                        customer.status === s
                          ? "bg-[#4a1f1a] text-white border-[#4a1f1a]"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 px-3 py-3">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">
                    Total orders
                  </p>
                  <p className="text-xl font-semibold text-slate-900 mt-1">
                    {customer.totalOrders || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 px-3 py-3">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">
                    Lifetime spend
                  </p>
                  <p className="text-xl font-semibold text-slate-900 mt-1">
                    {inr(customer.lifetimeSpend)}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-2">
                  Saved addresses
                </h3>
                {(customer.savedAddresses || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No addresses yet</p>
                ) : (
                  <div className="space-y-2">
                    {customer.savedAddresses.slice(0, 5).map((a, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                      >
                        <p className="font-medium text-slate-900">
                          {String(
                            (a as { name?: string }).name ||
                              [
                                (a as { firstName?: string }).firstName,
                                (a as { lastName?: string }).lastName,
                              ]
                                .filter(Boolean)
                                .join(" ") ||
                              "Address"
                          )}
                        </p>
                        <p className="mt-0.5">
                          {String(
                            (a as { address?: string }).address || ""
                          )}
                          {(a as { city?: string }).city
                            ? `, ${(a as { city?: string }).city}`
                            : ""}
                          {(a as { zipCode?: string }).zipCode
                            ? ` ${(a as { zipCode?: string }).zipCode}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-2">
                  Recent orders
                </h3>
                {(customer.recentOrders || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customer.recentOrders.map((o) => {
                      const order = o as {
                        _id: string;
                        invoice?: number;
                        totalAmount?: number;
                        status?: string;
                        createdAt?: string;
                      };
                      return (
                        <a
                          key={order._id}
                          href={`/orders?order=${order._id}`}
                          className="block rounded-xl border border-slate-200 px-3 py-2.5 hover:border-[#4a1f1a]/40 transition-colors"
                        >
                          <div className="flex justify-between gap-2 text-sm">
                            <span className="font-semibold text-slate-900">
                              #{order.invoice ?? "—"}
                            </span>
                            <span className="font-medium">
                              {inr(order.totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-2 text-xs text-slate-500 mt-1">
                            <span className="capitalize">
                              {order.status || "—"}
                            </span>
                            <span>
                              {order.createdAt
                                ? dayjs(order.createdAt).format("MMM D, YYYY")
                                : ""}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold mb-2">
                  Current cart
                  {customer.cartUpdatedAt && (
                    <span className="normal-case tracking-normal font-normal text-slate-400 ml-2">
                      · updated {dayjs(customer.cartUpdatedAt).fromNow()}
                    </span>
                  )}
                </h3>
                {cartItems.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No active cart on server
                  </p>
                ) : (
                  <div className="space-y-2">
                    {cartItems.slice(0, 8).map((item, i) => {
                      const it = item as {
                        title?: string;
                        img?: string;
                        orderQuantity?: number;
                        price?: number;
                      };
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
                        >
                          {it.img ? (
                            <Image
                              src={it.img}
                              alt=""
                              width={40}
                              height={40}
                              className="rounded-md object-cover w-10 h-10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-slate-100" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {it.title || "Item"}
                            </p>
                            <p className="text-xs text-slate-500">
                              Qty {it.orderQuantity || 1}
                              {it.price != null ? ` · ${inr(it.price)}` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default CustomerDrawer;
