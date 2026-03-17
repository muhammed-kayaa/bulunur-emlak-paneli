"use client"

import { useEffect, useMemo, useState } from "react"

type FinanceRow = {
  id: string
  monthKey: string
  soldAt: string
  commissionAmount: string
  consultantShare: string
  adminShare: string
  commissionRateSnapshot: number
  listing: {
    id: string
    title: string
    location: string
  }
  consultant: {
    id: string
    name: string
    email: string
  }
}

type Summary = {
  salesCount: number
  totalCommission: number | string
  totalConsultantShare: number | string
  totalAdminShare: number | string
}

type ApiResponse = {
  ok: boolean
  error?: string
  data?: {
    summary: Summary
    rows: FinanceRow[]
  }
}

const formatMoney = (value: number | string) => {
  const parsed = typeof value === "number" ? value : Number(value)
  if (Number.isNaN(parsed)) return "-"
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(parsed)
}

const formatSoldDate = (soldAt: string) => {
  const date = new Date(soldAt)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const getCurrentMonthKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  return `${year}-${month}`
}

export default function AdminFinancePage() {
  const [monthKey, setMonthKey] = useState(getCurrentMonthKey())
  const [rows, setRows] = useState<FinanceRow[]>([])
  const [summary, setSummary] = useState<Summary>({
    salesCount: 0,
    totalCommission: 0,
    totalConsultantShare: 0,
    totalAdminShare: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (activeMonthKey: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/finance?monthKey=${encodeURIComponent(activeMonthKey)}`)
      const json = (await res.json()) as ApiResponse
      if (!res.ok || !json.ok || !json.data) {
        setError(json?.error || "Canï¿½t load finance data")
        setRows([])
        setSummary({ salesCount: 0, totalCommission: 0, totalConsultantShare: 0, totalAdminShare: 0 })
        return
      }

      setRows(json.data.rows ?? [])
      setSummary(json.data.summary ?? { salesCount: 0, totalCommission: 0, totalConsultantShare: 0, totalAdminShare: 0 })
    } catch {
      setError("Canï¿½t load finance data")
      setRows([])
      setSummary({ salesCount: 0, totalCommission: 0, totalConsultantShare: 0, totalAdminShare: 0 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData(monthKey)
  }, [monthKey])

  const summaryCards = useMemo(
    () => [
      { label: "Sales Count", value: summary.salesCount.toString() },
      { label: "Total Commission", value: formatMoney(summary.totalCommission) },
      { label: "Total Consultant Share", value: formatMoney(summary.totalConsultantShare) },
      { label: "Total Admin Share", value: formatMoney(summary.totalAdminShare) },
    ],
    [summary],
  )

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-2xl font-bold text-white">Finance</h1>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs uppercase tracking-[0.2em] text-slate-300">Month</label>
              <input
                type="month"
                value={monthKey}
                onChange={(event) => setMonthKey(event.target.value)}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          </div>

          <div className="mt-4">
            {error ? (
              <div className="rounded-md border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">Error: {error}</div>
            ) : null}
            {loading ? (
              <div className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">Loading finance data...</div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</div>
                <div className="mt-1 text-lg font-semibold text-white">{card.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 overflow-auto rounded-xl border border-slate-700">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="border-b border-slate-700 px-3 py-2 text-left">Sold Date</th>
                  <th className="border-b border-slate-700 px-3 py-2 text-left">Listing Title</th>
                  <th className="border-b border-slate-700 px-3 py-2 text-left">Consultant</th>
                  <th className="border-b border-slate-700 px-3 py-2 text-right">Commission</th>
                  <th className="border-b border-slate-700 px-3 py-2 text-right">Consultant Share</th>
                  <th className="border-b border-slate-700 px-3 py-2 text-right">Admin Share</th>
                  <th className="border-b border-slate-700 px-3 py-2 text-right">Rate Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-slate-400">No sales found for this month.</td>
                  </tr>
                ) : null}
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-slate-200">{formatSoldDate(row.soldAt)}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-100">{row.listing.title}</div>
                      <div className="text-xs text-slate-400">{row.listing.location}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-100">{row.consultant.name}</div>
                      <div className="text-xs text-slate-400">{row.consultant.email}</div>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-200">{formatMoney(row.commissionAmount)}</td>
                    <td className="px-3 py-2 text-right text-slate-200">{formatMoney(row.consultantShare)}</td>
                    <td className="px-3 py-2 text-right text-slate-200">{formatMoney(row.adminShare)}</td>
                    <td className="px-3 py-2 text-right text-slate-200">{row.commissionRateSnapshot.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
