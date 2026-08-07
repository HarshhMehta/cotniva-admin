'use client';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const API = () =>
  String(process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

type AbandonItem = {
  _id: string;
  reasons: string[];
  stillCancel?: boolean;
  page?: string;
  phone?: string;
  email?: string;
  cartTotal?: number;
  cartCount?: number;
  createdAt?: string;
};

type ReasonStat = { reason: string; count: number };

const CheckoutFeedbackArea = () => {
  const [items, setItems] = useState<AbandonItem[]>([]);
  const [stats, setStats] = useState<ReasonStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API()}/api/checkout-abandon?limit=50`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || 'Failed to load feedback');
        }
        if (cancelled) return;
        setItems(data.data?.items || []);
        setStats(data.data?.reasonStats || []);
        setTotal(data.data?.total || 0);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Error loading data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-400">
            Total responses
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{total}</p>
        </div>
        {(stats || []).slice(0, 2).map((s) => (
          <div
            key={s.reason}
            className="bg-white border border-slate-200 rounded-lg p-4"
          >
            <p className="text-[11px] uppercase tracking-wider text-slate-400 line-clamp-2">
              {s.reason}
            </p>
            <p className="text-2xl font-semibold text-[#4a1f1a] mt-1">
              {s.count}
            </p>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
      )}
      {error && (
        <p className="text-sm text-red-600 py-4 text-center">{error}</p>
      )}

      {!loading && !error && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Reasons</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Cart</th>
                  <th className="px-4 py-3 font-semibold">Page</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      No checkout feedback yet
                    </td>
                  </tr>
                )}
                {items.map((row) => (
                  <tr
                    key={row._id}
                    className="border-t border-slate-100 align-top"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {row.createdAt
                        ? dayjs(row.createdAt).format('DD MMM YYYY, hh:mm A')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-1">
                        {(row.reasons || []).map((r) => (
                          <li
                            key={r}
                            className="text-slate-800 leading-snug"
                          >
                            • {r}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{row.phone || '—'}</div>
                      <div className="text-xs text-slate-400">
                        {row.email || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      ₹{Number(row.cartTotal || 0).toLocaleString('en-IN')}
                      <div className="text-xs text-slate-400">
                        {row.cartCount || 0} items
                      </div>
                    </td>
                    <td className="px-4 py-3 uppercase text-xs tracking-wide text-slate-500">
                      {row.page || 'checkout'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {row.stillCancel === false ? (
                        <span className="text-emerald-700 font-medium">
                          Continued
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          Exited
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutFeedbackArea;
