"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import {
  useGetAdminReviewsQuery,
  useGetReviewStatsQuery,
  useUpdateReviewStatusMutation,
  useDeleteAdminReviewMutation,
} from "@/redux/review/reviewModerationApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const productImg = (p: any) =>
  p?.img || p?.imageURLs?.[0]?.img || p?.imageURLs?.[0]?.url || "";

const Stars = ({ n }: { n: number }) => (
  <span className="text-amber-500 tracking-tight" aria-label={`${n} stars`}>
    {"★".repeat(n)}
    <span className="text-slate-300">{"★".repeat(Math.max(0, 5 - n))}</span>
  </span>
);

const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const RATING_FILTERS = [5, 4, 3, 2, 1];

const ReviewsArea = () => {
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);

  const { data: statsData, isLoading: statsLoading } = useGetReviewStatsQuery();
  const { data, isLoading, isFetching } = useGetAdminReviewsQuery({
    page,
    limit: 20,
    status,
    rating,
    q: search,
  });
  const [updateStatus, { isLoading: updating }] =
    useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: deleting }] =
    useDeleteAdminReviewMutation();

  const stats = statsData?.data;
  const rows = data?.data || [];
  const pagination = data?.pagination;

  const cards = useMemo(
    () => [
      { label: "Total Reviews", value: stats?.total ?? "…" },
      { label: "Pending", value: stats?.pending ?? "…" },
      { label: "Approved", value: stats?.approved ?? "…" },
      { label: "Rejected", value: stats?.rejected ?? "…" },
      {
        label: "Avg Rating",
        value: statsLoading ? "…" : String(stats?.averageRating ?? 0),
      },
    ],
    [stats, statsLoading]
  );

  const onStatus = async (id: string, next: string) => {
    const res = await updateStatus({ id, status: next });
    if ("data" in res && res.data?.success) {
      notifySuccess(res.data.message || `Marked ${next}`);
      setSelected((s: any) =>
        s && s._id === id ? { ...s, status: next } : s
      );
    } else {
      notifyError("Could not update status");
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Delete this review permanently?")) return;
    const res = await deleteReview(id);
    if ("data" in res && res.data?.success) {
      notifySuccess("Review deleted");
      setSelected(null);
    } else {
      notifyError("Could not delete review");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
              {c.label}
            </p>
            <p className="text-lg font-semibold text-slate-900 mt-0.5 mb-0">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {stats?.ratingBreakdown ? (
        <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 flex flex-wrap gap-3 text-xs text-slate-600">
          {[5, 4, 3, 2, 1].map((r) => (
            <span key={r} className="font-medium">
              {r}★ {stats.ratingBreakdown[r] || 0}
            </span>
          ))}
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Reviews</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Moderate customer product reviews · verified purchases only
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key || "all"}
                type="button"
                onClick={() => {
                  setStatus(f.key);
                  setPage(1);
                }}
                className={`h-8 px-3 rounded-full text-xs font-semibold border ${
                  status === f.key
                    ? "bg-[#4a1f1a] text-white border-[#4a1f1a]"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
            {RATING_FILTERS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRating((prev) => (prev === String(r) ? "" : String(r)));
                  setPage(1);
                }}
                className={`h-8 px-3 rounded-full text-xs font-semibold border ${
                  rating === String(r)
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                {r}★
              </button>
            ))}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q.trim());
              setPage(1);
            }}
          >
            <input
              className="flex-1 h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Search product, customer or order…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[#4a1f1a] text-white text-xs font-semibold uppercase"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Review</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Verified</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No reviews found
                  </td>
                </tr>
              ) : (
                rows.map((r: any) => (
                  <tr
                    key={r._id}
                    className="border-b border-slate-50 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <div className="relative w-10 h-12 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                          {productImg(r.productId) ? (
                            <Image
                              src={productImg(r.productId)}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover object-top"
                            />
                          ) : null}
                        </div>
                        <span className="font-medium text-slate-800 line-clamp-2">
                          {r.productId?.title || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="font-medium text-slate-800">
                        {r.userId?.name || "—"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {r.userId?.email || ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Stars n={Number(r.rating) || 0} />
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {r.title ? (
                        <div className="font-medium text-slate-800 truncate">
                          {r.title}
                        </div>
                      ) : null}
                      <div className="text-xs text-slate-500 line-clamp-2">
                        {r.comment || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      #{r.order?.invoice || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.isVerifiedPurchase ? (
                        <span className="text-[10px] font-semibold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Verified
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          r.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : r.status === "rejected"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {r.createdAt
                        ? dayjs(r.createdAt).format("MMM D, YYYY")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#4a1f1a] underline"
                        onClick={() => setSelected(r)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 ? (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.pages}
              {isFetching ? " · updating…" : ""}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="h-8 px-3 rounded-lg border border-slate-200 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.pages}
                className="h-8 px-3 rounded-lg border border-slate-200 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selected ? (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/40"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <aside className="fixed top-0 right-0 z-[91] h-full w-full max-w-[440px] bg-white shadow-2xl flex flex-col">
            <header className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Review
                </p>
                <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                  {selected.productId?.title || "Product"}
                </h3>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-slate-100"
                onClick={() => setSelected(null)}
              >
                ×
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm">
              <div className="flex gap-3 items-center">
                <div className="relative w-16 h-20 rounded bg-slate-100 overflow-hidden">
                  {productImg(selected.productId) ? (
                    <Image
                      src={productImg(selected.productId)}
                      alt=""
                      fill
                      className="object-cover object-top"
                      sizes="64px"
                    />
                  ) : null}
                </div>
                <div>
                  <Stars n={Number(selected.rating) || 0} />
                  <p className="mt-1 text-slate-600">
                    {selected.userId?.name}
                    <br />
                    <span className="text-xs text-slate-400">
                      {selected.userId?.email}
                    </span>
                  </p>
                </div>
              </div>
              {selected.title ? (
                <p className="font-semibold text-slate-900">{selected.title}</p>
              ) : null}
              <p className="text-slate-700 whitespace-pre-wrap">
                {selected.comment || "No written review."}
              </p>
              {Array.isArray(selected.images) && selected.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selected.images.map((url: string) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative block w-16 h-16 rounded overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <Image
                        src={url}
                        alt="Review photo"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </a>
                  ))}
                </div>
              ) : null}
              <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>
                  <dt className="uppercase tracking-wider">Order</dt>
                  <dd className="text-slate-800 font-medium">
                    #{selected.order?.invoice || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Verified</dt>
                  <dd className="text-slate-800 font-medium">
                    {selected.isVerifiedPurchase ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Status</dt>
                  <dd className="text-slate-800 font-medium capitalize">
                    {selected.status}
                  </dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wider">Date</dt>
                  <dd className="text-slate-800 font-medium">
                    {selected.createdAt
                      ? dayjs(selected.createdAt).format("MMM D, YYYY h:mm A")
                      : "—"}
                  </dd>
                </div>
              </dl>
            </div>
            <footer className="px-5 py-4 border-t border-slate-200 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={updating}
                onClick={() => onStatus(selected._id, "approved")}
                className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold uppercase disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => onStatus(selected._id, "rejected")}
                className="h-9 px-4 rounded-lg bg-rose-600 text-white text-xs font-semibold uppercase disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => onDelete(selected._id)}
                className="h-9 px-4 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold uppercase ml-auto disabled:opacity-50"
              >
                Delete
              </button>
            </footer>
          </aside>
        </>
      ) : null}
    </div>
  );
};

export default ReviewsArea;
