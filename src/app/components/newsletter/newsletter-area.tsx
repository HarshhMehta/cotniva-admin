"use client";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  useGetNewsletterStatsQuery,
  useGetNewsletterSubscribersQuery,
  useGetNewsletterCampaignsQuery,
  useSendNewsletterTestMutation,
  useSendNewsletterCampaignMutation,
} from "@/redux/newsletter/newsletterApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const STATUS_FILTERS = [
  { key: "", label: "All" },
  { key: "active", label: "Active" },
  { key: "unsubscribed", label: "Unsubscribed" },
  { key: "pending", label: "Pending" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    unsubscribed: "bg-slate-100 text-slate-600 border-slate-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return map[status] || "bg-slate-50 text-slate-600 border-slate-200";
};

const NewsletterArea = () => {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const { data: statsData, isLoading: statsLoading } =
    useGetNewsletterStatsQuery();
  const { data, isLoading, isFetching } = useGetNewsletterSubscribersQuery({
    page,
    limit: 20,
    status,
    q: search,
  });
  const { data: campaignsData } = useGetNewsletterCampaignsQuery({
    page: 1,
    limit: 20,
  });
  const [sendTest, { isLoading: testing }] = useSendNewsletterTestMutation();
  const [sendAll, { isLoading: sending }] = useSendNewsletterCampaignMutation();

  const stats = statsData?.data;
  const rows = data?.data || [];
  const pagination = data?.pagination;
  const campaigns = campaignsData?.data || [];
  const activeCount = Number(stats?.active || 0);

  const cards = useMemo(
    () => [
      { label: "Total subscribers", value: stats?.total ?? "…" },
      { label: "Active", value: stats?.active ?? "…" },
      { label: "Unsubscribed", value: stats?.unsubscribed ?? "…" },
      { label: "Inactive / other", value: stats?.pending ?? "…" },
    ],
    [stats]
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(q.trim());
    setPage(1);
  };

  const openComposer = () => {
    setComposerOpen(true);
  };

  const onSendTest = async () => {
    if (!subject.trim() || !content.trim()) {
      notifyError("Subject and message are required");
      return;
    }
    const res = await sendTest({
      subject: subject.trim(),
      content: content.trim(),
    });
    if ("data" in res && res.data?.success) {
      notifySuccess(res.data.message || "Test email sent");
    } else {
      const err = res as any;
      notifyError(
        err?.error?.data?.message || "Could not send test email"
      );
    }
  };

  const onSendAll = async () => {
    if (!subject.trim() || !content.trim()) {
      notifyError("Subject and message are required");
      return;
    }
    const ok = window.confirm(
      `You are about to send this email to ${activeCount.toLocaleString(
        "en-IN"
      )} subscribers. Continue?`
    );
    if (!ok) return;

    const res = await sendAll({
      subject: subject.trim(),
      content: content.trim(),
      confirm: true,
    });
    if ("data" in res && res.data?.success) {
      notifySuccess(res.data.message || "Campaign started");
      setComposerOpen(false);
      setSubject("");
      setContent("");
    } else {
      const err = res as any;
      notifyError(
        err?.error?.data?.message || "Could not start campaign"
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="bg-white rounded-xl border border-slate-200/80 shadow-xs px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400 font-semibold">
              {c.label}
            </p>
            <p className="text-lg font-semibold text-slate-900 mt-0.5 mb-0">
              {statsLoading ? "…" : c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Subscribers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active subscribers receive marketing emails
              </p>
            </div>
            <button
              type="button"
              onClick={openComposer}
              className="h-10 px-4 rounded-lg text-sm font-semibold bg-[#4a1f1a] text-white border border-[#4a1f1a] hover:opacity-95"
            >
              Write Email
            </button>
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
          </div>

          <form onSubmit={onSearch} className="flex flex-wrap gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email"
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm min-w-[220px] flex-1"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Subscribed At</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                rows.map((row: any) => (
                  <tr
                    key={row._id}
                    className="border-t border-slate-100 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3 text-slate-800 font-medium">
                      {row.email}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${statusBadge(
                          row.status
                        )}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {row.subscribedAt
                        ? dayjs(row.subscribedAt).format("DD MMM YYYY, HH:mm")
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="text-xs font-semibold text-[#4a1f1a]"
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
              Page {pagination.page} of {pagination.pages} · {pagination.total}{" "}
              total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 px-3 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 rounded-lg border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Campaign History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Recent newsletter and test sends
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Campaign</th>
                <th className="px-5 py-3 font-semibold">Recipients</th>
                <th className="px-5 py-3 font-semibold">Sent</th>
                <th className="px-5 py-3 font-semibold">Failed</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    No campaigns yet
                  </td>
                </tr>
              ) : (
                campaigns.map((c: any) => (
                  <tr key={c._id} className="border-t border-slate-100">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {c.subject}
                      {c.isTest ? (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">
                          test
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {c.recipientCount ?? 0}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.sentCount ?? 0}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {c.failedCount ?? 0}
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-700">
                      {c.status}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {dayjs(c.createdAt).format("DD MMM YYYY, HH:mm")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Subscriber
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Email
                </dt>
                <dd className="text-slate-800">{selected.email}</dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Status
                </dt>
                <dd className="capitalize text-slate-800">{selected.status}</dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Subscribed at
                </dt>
                <dd className="text-slate-800">
                  {selected.subscribedAt
                    ? dayjs(selected.subscribedAt).format("DD MMM YYYY, HH:mm")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Unsubscribed at
                </dt>
                <dd className="text-slate-800">
                  {selected.unsubscribedAt
                    ? dayjs(selected.unsubscribedAt).format(
                        "DD MMM YYYY, HH:mm"
                      )
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 text-xs uppercase tracking-wide">
                  Created
                </dt>
                <dd className="text-slate-800">
                  {selected.createdAt
                    ? dayjs(selected.createdAt).format("DD MMM YYYY, HH:mm")
                    : "—"}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 h-9 px-4 rounded-lg border border-slate-200 text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      {composerOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setComposerOpen(false)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full p-5 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">Write Email</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Cotniva-branded marketing email · unsubscribe link included
              automatically
            </p>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="New Collection is Live"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm mb-4"
            />

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Send To
            </label>
            <div className="h-10 px-3 rounded-lg border border-slate-200 text-sm mb-4 flex items-center text-slate-700 bg-slate-50">
              All Active Subscribers — {activeCount.toLocaleString("en-IN")}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write your newsletter message…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm mb-4 resize-y"
            />

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={testing || sending}
                onClick={onSendTest}
                className="h-10 px-4 rounded-lg border border-slate-200 text-sm font-semibold disabled:opacity-50"
              >
                {testing ? "Sending…" : "Send Test Email"}
              </button>
              <button
                type="button"
                disabled={testing || sending || activeCount === 0}
                onClick={onSendAll}
                className="h-10 px-4 rounded-lg bg-[#4a1f1a] text-white text-sm font-semibold disabled:opacity-50"
              >
                {sending
                  ? "Starting…"
                  : `Send to ${activeCount.toLocaleString("en-IN")} Subscribers`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NewsletterArea;
