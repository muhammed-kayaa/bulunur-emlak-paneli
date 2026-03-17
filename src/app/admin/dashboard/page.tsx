"use client"

import { useEffect, useMemo, useState } from "react"

type Consultant = {
  id: string
  name: string
  email: string
  photoUrl?: string | null
  commissionRate: number
  isActive: boolean
}

type Listing = {
  id: string
  status: "ACTIVE" | "SOLD"
  isDeleted: boolean
}

type FinanceSummary = {
  salesCount: number
  totalCommission: number
  totalConsultantShare: number
  totalAdminShare: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)

export default function AdminDashboard() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentMonthKey = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = `${now.getMonth() + 1}`.padStart(2, "0")
    return `${year}-${month}`
  }, [])

  const fetchData = async () => {
    setError(null)
    setLoading(true)
    try {
      const [consultantsRes, listingsRes, financeRes] = await Promise.all([
        fetch("/api/admin/consultants"),
        fetch("/api/admin/listings"),
        fetch(`/api/admin/finance?monthKey=${currentMonthKey}`),
      ])

      const consultantsJson = await consultantsRes.json()
      const listingsJson = await listingsRes.json()
      const financeJson = await financeRes.json()

      if (!consultantsRes.ok || !consultantsJson.ok) {
        throw new Error(consultantsJson?.error || "Consultants fetch failed")
      }
      if (!listingsRes.ok || !listingsJson.ok) {
        throw new Error(listingsJson?.error || "Listings fetch failed")
      }
      if (!financeRes.ok || !financeJson.ok) {
        throw new Error(financeJson?.error || "Finance fetch failed")
      }

      setConsultants(Array.isArray(consultantsJson.data) ? consultantsJson.data : [])
      setListings(Array.isArray(listingsJson.data) ? listingsJson.data : [])

      const summary = financeJson.data?.summary
      setFinanceSummary({
        salesCount: Number(summary?.salesCount ?? 0),
        totalCommission: Number(summary?.totalCommission ?? 0),
        totalConsultantShare: Number(summary?.totalConsultantShare ?? 0),
        totalAdminShare: Number(summary?.totalAdminShare ?? 0),
      })
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard data")
      setConsultants([])
      setListings([])
      setFinanceSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [currentMonthKey])

  const totalConsultants = consultants.length
  const activeConsultants = consultants.filter((c) => c.isActive).length
  const totalListings = listings.length
  const activeListings = listings.filter((l) => l.status === "ACTIVE").length
  const soldListings = listings.filter((l) => l.status === "SOLD").length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Admin</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-300">Live admin summary from your database and current month finance.</p>
            </div>
            <button
              onClick={fetchData}
              className="rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:border-slate-400 hover:bg-slate-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">Error: {error}</div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Consultants</p>
              <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalConsultants}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Active Consultants</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{loading ? "..." : activeConsultants}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total Listings</p>
              <p className="mt-2 text-2xl font-semibold text-white">{loading ? "..." : totalListings}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Active Listings</p>
              <p className="mt-2 text-2xl font-semibold text-sky-300">{loading ? "..." : activeListings}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Sold Listings</p>
              <p className="mt-2 text-2xl font-semibold text-amber-300">{loading ? "..." : soldListings}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Current Month Sales</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300">{loading ? "..." : financeSummary?.salesCount ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Current Month Total Commission</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-300">{loading ? "..." : formatCurrency(financeSummary?.totalCommission ?? 0)}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Current Month Admin Share</p>
              <p className="mt-2 text-2xl font-semibold text-fuchsia-300">{loading ? "..." : formatCurrency(financeSummary?.totalAdminShare ?? 0)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-200">Current Month:</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-200">{currentMonthKey}</span>
              <span className="text-slate-400">(Live API values from DB)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
