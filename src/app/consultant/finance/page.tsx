"use client";

import { useState, useEffect } from "react";

// types coming from the API
interface Sale {
  id: string;
  soldAt: string;
  listing: { title: string; location: string };
  commissionAmount: string;
  consultantShare: string;
  adminShare: string;
  commissionRateSnapshot: number;
}

interface Summary {
  count: number;
  totalCommission: number;
  consultantTotal: number;
  adminTotal: number;
}

export default function ConsultantFinancePage() {
  const [monthKey, setMonthKey] = useState<string>(() => {
    const now = new Date();
    // YYYY-MM format required by <input type="month">
    return now.toISOString().slice(0, 7);
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<Summary>({
    count: 0,
    totalCommission: 0,
    consultantTotal: 0,
    adminTotal: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/consultant/finance?monthKey=${monthKey}`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (json.ok) {
          setSales(json.data.sales || []);
          setSummary(json.data.summary || {
            count: 0,
            totalCommission: 0,
            consultantTotal: 0,
            adminTotal: 0,
          });
        }
      } catch (e) {
        // ignore abort errors; in production you might show a toast
      }
      setLoading(false);
    }

    loadData();
    return () => controller.abort();
  }, [monthKey]);

  return (
    <div className="pb-8">
      <h1 className="text-xl font-semibold">Consultant • Muhasebe</h1>

      {/* month selector */}
      <div className="mt-4 flex items-center space-x-2">
        <label htmlFor="monthKey" className="text-white/80">
          Ay:
        </label>
        <input
          id="monthKey"
          type="month"
          value={monthKey}
          onChange={(e) => setMonthKey(e.target.value)}
          className="bg-gray-900 text-white rounded px-2 py-1"
        />
      </div>

      {/* summary cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Satış" value={summary.count.toString()} />
        <SummaryCard
          label="Toplam Komisyon"
          value={formatTRY(summary.totalCommission)}
        />
        <SummaryCard
          label="Danışman Payı"
          value={formatTRY(summary.consultantTotal)}
        />
        <SummaryCard
          label="Admin Payı"
          value={formatTRY(summary.adminTotal)}
        />
      </div>

      {/* table of sales */}
      {loading && <p className="mt-4">Yükleniyor...</p>}
      {!loading && (
        <div className="mt-6 overflow-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr>
                <th className="px-4 py-2">Satış Tarihi</th>
                <th className="px-4 py-2">İlan</th>
                <th className="px-4 py-2">Lokasyon</th>
                <th className="px-4 py-2">Komisyon</th>
                <th className="px-4 py-2">Danışman Payı</th>
                <th className="px-4 py-2">Admin Payı</th>
                <th className="px-4 py-2">Komisyon %</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="odd:bg-gray-800 even:bg-gray-900"
                >
                  <td className="px-4 py-2">
                    {new Date(s.soldAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{s.listing.title}</td>
                  <td className="px-4 py-2">{s.listing.location}</td>
                  <td className="px-4 py-2">
                    {formatTRY(Number(s.commissionAmount))}
                  </td>
                  <td className="px-4 py-2">
                    {formatTRY(Number(s.consultantShare))}
                  </td>
                  <td className="px-4 py-2">
                    {formatTRY(Number(s.adminShare))}
                  </td>
                  <td className="px-4 py-2">
                    {s.commissionRateSnapshot}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-gray-800 p-4 rounded">
      <p className="text-xs text-white/80 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg font-medium">{value}</p>
    </div>
  );
}

function formatTRY(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}