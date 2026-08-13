"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { Search } from "@/svg";
import ErrorMsg from "../common/error-msg";
import Pagination from "../ui/Pagination";
import OrderDrawer from "./order-drawer";
import { useGetAllOrdersQuery } from "@/redux/order/orderApi";
import usePagination from "@/hooks/use-pagination";
import type { Order } from "@/types/order-amount-type";

type SortKey = "date_desc" | "date_asc" | "total_desc" | "total_asc" | "invoice_desc";

const inr = (n?: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const qtyOf = (o: Order) =>
  (o.cart || []).reduce((acc, curr) => acc + (Number(curr.orderQuantity) || 0), 0);

const paymentMeta = (o: Order) => {
  const method = String(o.paymentMethod || "").toLowerCase();
  const paid = Boolean(o.paymentIntent?.razorpay_payment_id);
  if (method.includes("razorpay") || method.includes("card")) {
    return {
      methodLabel: "Razorpay",
      methodCls: "bg-[#4a1f1a]/10 text-[#4a1f1a]",
      payLabel: paid ? "Paid" : "Unpaid",
      payCls: paid
        ? "bg-emerald-50 text-emerald-700"
        : "bg-amber-50 text-amber-700",
    };
  }
  return {
    methodLabel: "COD",
    methodCls: "bg-sky-50 text-sky-700",
    payLabel: o.status === "delivered" ? "Collected" : "Pending",
    payCls:
      o.status === "delivered"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-amber-50 text-amber-700",
  };
};

const statusCls = (s?: string) => {
  const v = String(s || "").toLowerCase();
  if (v === "delivered") return "bg-emerald-50 text-emerald-700";
  if (v === "processing") return "bg-indigo-50 text-indigo-700";
  if (v === "cancel") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

const customerName = (o: Order) =>
  o.name ||
  (typeof o.user === "object" ? o.user?.name : "") ||
  "Guest";

const OrderTable = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: orders, isError, isLoading } = useGetAllOrdersQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  // Deep-link from notification bell → open Order Drawer
  useEffect(() => {
    const orderId = searchParams.get("order");
    if (orderId) setDrawerId(orderId);
  }, [searchParams]);

  const closeDrawer = () => {
    setDrawerId(null);
    if (searchParams.get("order")) {
      router.replace("/orders");
    }
  };

  const filtered = useMemo(() => {
    let list = [...(orders?.data || [])];
    const q = searchVal.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const phone = String(o.contact || "").toLowerCase();
        const email = String(o.email || "").toLowerCase();
        const name = customerName(o).toLowerCase();
        const inv = String(o.invoice || "");
        const rzp =
          o.paymentIntent?.razorpay_payment_id ||
          o.paymentIntent?.razorpay_order_id ||
          "";
        return (
          inv.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          String(rzp).toLowerCase().includes(q)
        );
      });
    }
    if (statusFilter) {
      list = list.filter(
        (o) => String(o.status || "").toLowerCase() === statusFilter
      );
    }
    if (methodFilter === "razorpay") {
      list = list.filter((o) =>
        /razorpay|card/i.test(String(o.paymentMethod || ""))
      );
    }
    if (methodFilter === "cod") {
      list = list.filter((o) => /cod|cash/i.test(String(o.paymentMethod || "")));
    }
    if (paymentFilter === "paid") {
      list = list.filter((o) => Boolean(o.paymentIntent?.razorpay_payment_id));
    }
    if (paymentFilter === "unpaid") {
      list = list.filter((o) => {
        const isRzp = /razorpay|card/i.test(String(o.paymentMethod || ""));
        if (isRzp) return !o.paymentIntent?.razorpay_payment_id;
        return String(o.status || "").toLowerCase() !== "delivered";
      });
    }

    list.sort((a, b) => {
      if (sortKey === "date_asc")
        return dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf();
      if (sortKey === "total_desc")
        return Number(b.totalAmount || 0) - Number(a.totalAmount || 0);
      if (sortKey === "total_asc")
        return Number(a.totalAmount || 0) - Number(b.totalAmount || 0);
      if (sortKey === "invoice_desc")
        return Number(b.invoice || 0) - Number(a.invoice || 0);
      return dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    });
    return list;
  }, [orders?.data, searchVal, statusFilter, methodFilter, paymentFilter, sortKey]);

  const paginationData = usePagination(filtered, 10);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  let content: React.ReactNode = null;

  if (isLoading) {
    content = (
      <div className="px-6 py-10 space-y-3 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg" />
        ))}
      </div>
    );
  } else if (isError) {
    content = (
      <div className="px-6 py-8">
        <ErrorMsg msg="There was an error loading orders" />
      </div>
    );
  } else if (!filtered.length) {
    content = (
      <div className="px-6 py-12 text-center">
        <p className="text-slate-500 text-sm">No orders match your filters</p>
      </div>
    );
  } else {
    content = (
      <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                {[
                  "Invoice",
                  "Customer",
                  "Phone",
                  "Items",
                  "Total",
                  "Payment",
                  "Status",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const pay = paymentMeta(item);
                const avatar =
                  typeof item.user === "object" ? item.user?.imageURL : "";
                return (
                  <tr
                    key={item._id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setDrawerId(item._id)}
                        className="text-sm font-semibold text-slate-900 hover:text-[#4a1f1a]"
                      >
                        #{item.invoice}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-[160px]">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt=""
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-[#4a1f1a]/10 text-[#4a1f1a] text-xs font-semibold flex items-center justify-center">
                            {customerName(item).slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {customerName(item)}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                      {item.contact || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-700">
                      {qtyOf(item)}{" "}
                      <span className="text-slate-400">
                        ({item.cart?.length || 0} SKU)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-900 whitespace-nowrap">
                      {inr(item.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${pay.methodCls}`}
                        >
                          {pay.methodLabel}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pay.payCls}`}
                        >
                          {pay.payLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[11px] font-semibold capitalize px-2.5 py-1 rounded-full ${statusCls(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                      {dayjs(item.createdAt).format("MMM D, YYYY")}
                      <div className="text-[11px] text-slate-400">
                        {dayjs(item.createdAt).format("h:mm A")}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDrawerId(item._id)}
                          className="h-8 px-3 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-3 px-4 py-4 border-t border-slate-100">
          <p className="mb-0 text-xs text-slate-500">
            Showing {currentItems.length} of {filtered.length} orders
            {orders?.data?.length !== filtered.length
              ? ` (filtered from ${orders?.data?.length})`
              : ""}
          </p>
          <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-5 pt-5 pb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <input
            className="w-full h-11 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-[#4a1f1a]"
            type="text"
            placeholder="Search invoice, name, phone, email, Razorpay ID…"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400">
            <Search />
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancel">Cancelled</option>
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-white"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="">All methods</option>
            <option value="razorpay">Razorpay</option>
            <option value="cod">COD</option>
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-white"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">Payment status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid / COD pending</option>
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-white"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="total_desc">Highest total</option>
            <option value="total_asc">Lowest total</option>
            <option value="invoice_desc">Invoice ↓</option>
          </select>
        </div>
      </div>

      {content}

      <OrderDrawer
        orderId={drawerId}
        open={Boolean(drawerId)}
        onClose={closeDrawer}
      />
    </>
  );
};

export default OrderTable;
