"use client";
import React, { useMemo } from "react";
import OrderTable from "./order-table";
import { useGetAllOrdersQuery } from "@/redux/order/orderApi";

const OrderArea = () => {
  const { data: orders, isLoading } = useGetAllOrdersQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
  });

  const stats = useMemo(() => {
    const list = orders?.data || [];
    const total = list.length;
    const pending = list.filter(
      (o) => String(o.status).toLowerCase() === "pending"
    ).length;
    const processing = list.filter(
      (o) => String(o.status).toLowerCase() === "processing"
    ).length;
    const revenue = list.reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);
    const razorpay = list.filter((o) =>
      /razorpay|card/i.test(String(o.paymentMethod || ""))
    ).length;
    return { total, pending, processing, revenue, razorpay };
  }, [orders?.data]);

  const inr = (n: number) =>
    `₹${Number(n || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total orders", value: isLoading ? "…" : String(stats.total) },
          { label: "Pending", value: isLoading ? "…" : String(stats.pending) },
          {
            label: "Processing",
            value: isLoading ? "…" : String(stats.processing),
          },
          {
            label: "Gross revenue",
            value: isLoading ? "…" : inr(stats.revenue),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
              {card.label}
            </p>
            <p className="text-lg font-semibold text-slate-900 mt-0.5 mb-0">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Orders</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Shopify-style order management · click View for full details
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#4a1f1a]/8 text-[#4a1f1a]">
            {isLoading ? "…" : `${stats.razorpay} Razorpay`}
          </span>
        </div>
        <OrderTable />
      </div>
    </div>
  );
};

export default OrderArea;
