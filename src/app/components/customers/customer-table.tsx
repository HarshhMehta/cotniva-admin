"use client";
import React, { useState } from "react";
import dayjs from "dayjs";
import { Search } from "@/svg";
import ErrorMsg from "../common/error-msg";
import CustomerDrawer from "./customer-drawer";
import {
  CustomerListItem,
  useGetCustomersQuery,
} from "@/redux/customer/customerApi";

const inr = (n?: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const statusCls = (s?: string) => {
  const v = String(s || "").toLowerCase();
  if (v === "active") return "bg-emerald-50 text-emerald-700";
  if (v === "blocked") return "bg-rose-50 text-rose-700";
  return "bg-slate-100 text-slate-600";
};

const CustomerTable = () => {
  const [search, setSearch] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading, isError } = useGetCustomersQuery({
    page,
    limit,
    search: searchQ || undefined,
    sort,
    status: status || undefined,
  });

  const rows = data?.data || [];
  const meta = data?.meta;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQ(search.trim());
  };

  let content: React.ReactNode = null;
  if (isLoading) {
    content = (
      <div className="px-5 py-12 text-center text-sm text-slate-500">
        Loading customers…
      </div>
    );
  } else if (isError) {
    content = (
      <div className="px-5 py-8">
        <ErrorMsg msg="Failed to load customers" />
      </div>
    );
  } else if (!rows.length) {
    content = (
      <div className="px-5 py-12 text-center text-sm text-slate-500">
        No customers found
      </div>
    );
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-[0.1em] text-slate-400">
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-3 py-3 font-semibold">Phone</th>
              <th className="px-3 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Registered</th>
              <th className="px-3 py-3 font-semibold text-right">Orders</th>
              <th className="px-3 py-3 font-semibold text-right">Spend</th>
              <th className="px-3 py-3 font-semibold">Last order</th>
              <th className="px-3 py-3 font-semibold">Last login</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c: CustomerListItem) => (
              <tr
                key={c._id}
                onClick={() => setDrawerId(c._id)}
                className="border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <td className="px-5 py-3.5 font-semibold text-slate-900">
                  {c.name || "—"}
                </td>
                <td className="px-3 py-3.5 text-slate-600">
                  {c.phone || c.contactNumber || "—"}
                </td>
                <td className="px-3 py-3.5 text-slate-600 max-w-[180px] truncate">
                  {c.email || "—"}
                </td>
                <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">
                  {c.registrationDate || c.createdAt
                    ? dayjs(c.registrationDate || c.createdAt).format(
                        "MMM D, YYYY"
                      )
                    : "—"}
                </td>
                <td className="px-3 py-3.5 text-right font-medium text-slate-900">
                  {c.totalOrders || 0}
                </td>
                <td className="px-3 py-3.5 text-right font-medium text-slate-900">
                  {inr(c.totalSpend)}
                </td>
                <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">
                  {c.lastOrder
                    ? dayjs(c.lastOrder).format("MMM D, YYYY")
                    : "—"}
                </td>
                <td className="px-3 py-3.5 text-slate-600 whitespace-nowrap">
                  {c.lastLogin
                    ? dayjs(c.lastLogin).format("MMM D, YYYY")
                    : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded-full capitalize ${statusCls(
                      c.status
                    )}`}
                  >
                    {c.status || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <form onSubmit={onSearch} className="relative w-full max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search />
          </span>
        </form>
        <div className="flex flex-wrap gap-2">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-white"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium bg-white"
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
            <option value="createdAt_desc">Newest registered</option>
            <option value="createdAt_asc">Oldest registered</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="lastLogin_desc">Recent login</option>
            <option value="lastOrder_desc">Recent order</option>
            <option value="spend_desc">Highest spend</option>
            <option value="orders_desc">Most orders</option>
          </select>
        </div>
      </div>

      {content}

      {meta && meta.pages > 1 && (
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Page {meta.page} of {meta.pages} · {meta.total} customers
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <CustomerDrawer
        customerId={drawerId}
        open={Boolean(drawerId)}
        onClose={() => setDrawerId(null)}
      />
    </>
  );
};

export default CustomerTable;
