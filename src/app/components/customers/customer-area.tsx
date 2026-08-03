"use client";
import React, { useMemo } from "react";
import CustomerTable from "./customer-table";
import { useGetCustomersQuery } from "@/redux/customer/customerApi";

const CustomerArea = () => {
  const { data, isLoading } = useGetCustomersQuery({ page: 1, limit: 1 });

  const total = data?.meta?.total ?? 0;

  const stats = useMemo(
    () => [
      {
        label: "Total customers",
        value: isLoading ? "…" : String(total),
      },
    ],
    [isLoading, total]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
              {card.label}
            </p>
            <p className="text-xl font-semibold text-slate-900 mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Customers</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, spend and activity · click a row for details
          </p>
        </div>
        <CustomerTable />
      </div>
    </div>
  );
};

export default CustomerArea;
