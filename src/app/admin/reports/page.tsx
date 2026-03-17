"use client"

import { useEffect, useMemo, useState } from "react"

type Consultant = {
  id: string
  name: string
  email: string
  photoUrl: string | null
  commissionRate: number
  isActive: boolean
}

type Listing = {
  id: string
  title: string
  status: "ACTIVE" | "SOLD"
  isDeleted: boolean
  createdAt: string
  soldAt?: string | null
}

type FinanceRow = {
  id: string
  listing: { id: string; title: string }
  consultant: { id: string; name: string; email: string }
  soldAt: string | null
  commissionAmount: string
  consultantShare: string
  adminShare: string
  monthKey: string
}

type FinanceResponse = {
  summary: {
    salesCount: number
    totalCommission: string
    totalConsultantShare: string
    totalAdminShare: string
  }
  rows: FinanceRow[]
}

const formatCurrency = (value: number | string) => {
  const numberValue = Number(value ?? 0)
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    Number.isFinite(numberValue) ? numberValue : 0,
  )
}

const toMonthKey = (date: Date) => `${date.getFullYear().toString().padStart(4, "0")}-${
  (date.getMonth() + 1).toString().padStart(2, "0")
}`

export default function AdminReportsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [finance, setFinance] = useState<FinanceResponse | null>(null)
  const [monthKey, setMonthKey] = useState(toMonthKey(new Date()))
  const [loading, setLoading] = useState(true)
  const [financeLoading, setFinanceLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConsultantsAndListings = async () => {
    setLoading(true)
    setError(null)
    try {
      const [consultantsRes, listingsRes] = await Promise.all([
        fetch("/api/admin/consultants"),
        fetch("/api/admin/listings"),
      ])

      const [consultantsJson, listingsJson] = await Promise.all([
        consultantsRes.json(),
        listingsRes.json(),
      ])

      if (!consultantsRes.ok || !consultantsJson.ok) {
        throw new Error(consultantsJson?.error || "Failed to load consultants")
      }
      if (!listingsRes.ok || !listingsJson.ok) {
        throw new Error(listingsJson?.error || "Failed to load listings")
      }

      setConsultants(Array.isArray(consultantsJson.data) ? consultantsJson.data : [])
      setListings(Array.isArray(listingsJson.data) ? listingsJson.data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading report data")
    } finally {
      setLoading(false)
    }
  }

  const fetchFinance = async (month: string) => {
    setFinanceLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/finance?monthKey=${encodeURIComponent(month)}`)
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json?.error || "Failed to load finance")
      }
      setFinance(json.data as FinanceResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading report data")
      setFinance(null)
    } finally {
      setFinanceLoading(false)
    }
  }

  useEffect(() => {
    void fetchConsultantsAndListings()
  }, [])

  useEffect(() => {
    void fetchFinance(monthKey)
  }, [monthKey])

  const totals = useMemo(() => {
    const totalConsultants = consultants.length
    const activeConsultants = consultants.filter((c) => c.isActive).length
    const totalListings = listings.length
    const activeListings = listings.filter((l) => l.status === "ACTIVE" && !l.isDeleted).length
    const soldListings = listings.filter((l) => l.status === "SOLD").length
    const deletedListings = listings.filter((l) => l.isDeleted).length

    return {
      totalConsultants,
      activeConsultants,
      totalListings,
      activeListings,
      soldListings,
      deletedListings,
    }
  }, [consultants, listings])

  const rows = finance?.rows ?? []
  const summary = finance?.summary

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-slate-950 p-4 text-slate-100 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-2xl font-bold text-white">Raporlar</h1>
              <p className="text-sm text-slate-300">Gerçek API verisiyle aylýk satýþ ve personel raporu.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <span className="text-slate-300">Ay seçimi</span>
                <input
                  type="month"
                  value={monthKey}
                  onChange={(e) => setMonthKey(e.target.value)}
                  className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="mt-4 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200">Loading...</div>
          ) : error ? (
            <div className="mt-4 rounded-md border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              Error loading report data
            </div>
          ) : null}

          {!loading && !error && (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Toplam Danýþman</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{totals.totalConsultants}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Aktif Danýþman</div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-300">{totals.activeConsultants}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Toplam Ýlan</div>
                  <div className="mt-1 text-2xl font-semibold text-white">{totals.totalListings}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Aktif Ýlan</div>
                  <div className="mt-1 text-2xl font-semibold text-emerald-300">{totals.activeListings}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Satýlan Ýlan</div>
                  <div className="mt-1 text-2xl font-semibold text-sky-300">{totals.soldListings}</div>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Silinen Ýlan</div>
                  <div className="mt-1 text-2xl font-semibold text-rose-300">{totals.deletedListings}</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400">Aylýk Finansal Özet</div>
                    <div className="text-sm text-slate-300">{monthKey}</div>
                  </div>
                  <div className="text-xs text-slate-300">{financeLoading ? "Yükleniyor..." : "Güncellendi"}</div>
                </div>
                {financeLoading ? (
                  <div className="rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300">Loading finance data...</div>
                ) : summary ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Satýþ Adedi</div>
                      <div className="mt-1 text-xl font-semibold text-white">{summary.salesCount}</div>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Toplam Komisyon</div>
                      <div className="mt-1 text-xl font-semibold text-emerald-300">
                        {formatCurrency(summary.totalCommission)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Danýþman Payý</div>
                      <div className="mt-1 text-xl font-semibold text-sky-300">
                        {formatCurrency(summary.totalConsultantShare)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
                      <div className="text-[11px] uppercase tracking-wide text-slate-400">Admin Payý</div>
                      <div className="mt-1 text-xl font-semibold text-amber-300">
                        {formatCurrency(summary.totalAdminShare)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300">No finance summary available.</div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Son Satýþlar</h2>
                    <p className="text-sm text-slate-300">Seçilen aya ait satýþ detaylarý</p>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-md border border-slate-700">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-800 text-left text-xs uppercase tracking-wide text-slate-300">
                      <tr>
                        <th className="border-b border-slate-700 px-2 py-2">Satýþ Tarihi</th>
                        <th className="border-b border-slate-700 px-2 py-2">Ýlan Baþlýðý</th>
                        <th className="border-b border-slate-700 px-2 py-2">Danýþman</th>
                        <th className="border-b border-slate-700 px-2 py-2">Komisyon</th>
                        <th className="border-b border-slate-700 px-2 py-2">Danýþman Payý</th>
                        <th className="border-b border-slate-700 px-2 py-2">Admin Payý</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeLoading ? (
                        <tr>
                          <td colSpan={6} className="px-2 py-4 text-center text-slate-400">Loading sales...</td>
                        </tr>
                      ) : rows.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-2 py-4 text-center text-slate-400">No sales data</td>
                        </tr>
                      ) : (
                        rows.map((sale) => {
                          const soldAtDate = sale.soldAt ? new Date(sale.soldAt) : null
                          return (
                            <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-800/50 last:border-b-0">
                              <td className="px-2 py-2 text-slate-200">{soldAtDate?.toLocaleDateString("tr-TR") ?? "-"}</td>
                              <td className="px-2 py-2 text-slate-200">{sale.listing?.title ?? "-"}</td>
                              <td className="px-2 py-2 text-slate-200">{sale.consultant?.name ?? "-"}</td>
                              <td className="px-2 py-2 text-emerald-300">{formatCurrency(sale.commissionAmount)}</td>
                              <td className="px-2 py-2 text-sky-300">{formatCurrency(sale.consultantShare)}</td>
                              <td className="px-2 py-2 text-amber-300">{formatCurrency(sale.adminShare)}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
