"use client"

import { useEffect, useState } from "react"

type ListingRow = {
  id: string
  title: string
  portfolioType: "SATILIK" | "KIRALIK"
  propertyType: string
  price: number | string
  location: string
  authorizationType: "YETKILI" | "YETKISIZ"
  status: "ACTIVE" | "SOLD"
  isDeleted: boolean
  createdAt: string
  soldAt?: string | null
  consultant: {
    id: string
    name: string
    email: string
  }
}

type Filters = {
  q: string
  status: "all" | "ACTIVE" | "SOLD"
  auth: "all" | "YETKILI" | "YETKISIZ"
  portfolio: "all" | "SATILIK" | "KIRALIK"
  deleted: "hide" | "showOnlyDeleted" | "showAll"
}

const formatPrice = (price: number | string) => {
  const amount = typeof price === "string" ? Number(price) : price
  if (Number.isNaN(amount)) return "-"
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount)
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<ListingRow[]>([])
  const [filters, setFilters] = useState<Filters>({
    q: "",
    status: "all",
    auth: "all",
    portfolio: "all",
    deleted: "hide",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const buildQuery = (f: Filters) => {
    const params = new URLSearchParams()
    if (f.q.trim()) params.set("q", f.q.trim())
    if (f.status !== "all") params.set("status", f.status)
    if (f.auth !== "all") params.set("auth", f.auth)
    if (f.portfolio !== "all") params.set("portfolio", f.portfolio)
    if (f.deleted !== "hide") params.set("deleted", f.deleted)
    return params.toString()
  }

  const fetchListings = async () => {
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    try {
      const query = buildQuery(filters)
      const url = `/api/admin/listings${query ? `?${query}` : ""}`
      const res = await fetch(url)
      const json = await res.json()
      if (!res.ok || !json.ok) {
        setError(json?.error || "Failed to fetch listings")
        setListings([])
        return
      }
      setListings(Array.isArray(json.data) ? json.data : [])
    } catch {
      setError("Failed to fetch listings")
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchListings()
  }, [filters])

  const patchListing = async (id: string, payload: { authorizationType?: "YETKILI" | "YETKISIZ"; status?: "ACTIVE" | "SOLD" }) => {
    setSavingId(id)
    setStatusMessage(null)
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        alert(json?.error || "Failed to update listing")
        return
      }
      setStatusMessage("Listing updated successfully")
      await fetchListings()
    } catch {
      alert("Failed to update listing")
    } finally {
      setSavingId(null)
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm("Bu ilaný silmek istediðinize emin misiniz?")) return
    setSavingId(id)
    setStatusMessage(null)
    try {
      const res = await fetch("/api/admin/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        alert(json?.error || "Failed to delete listing")
        return
      }
      setStatusMessage("Listing deleted successfully")
      await fetchListings()
    } catch {
      alert("Failed to delete listing")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="text-2xl font-bold text-white">Listings</h1>
            </div>
            <p className="text-sm text-slate-300">Manage listings from your DB via admin API.</p>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Baþlýk veya konum ara..."
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as Filters["status"] }))}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SOLD">SOLD</option>
            </select>
            <select
              value={filters.auth}
              onChange={(e) => setFilters((prev) => ({ ...prev, auth: e.target.value as Filters["auth"] }))}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">Tüm Yetkilendirme</option>
              <option value="YETKILI">YETKILI</option>
              <option value="YETKISIZ">YETKISIZ</option>
            </select>
            <select
              value={filters.portfolio}
              onChange={(e) => setFilters((prev) => ({ ...prev, portfolio: e.target.value as Filters["portfolio"] }))}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">Tüm Portföy</option>
              <option value="SATILIK">SATILIK</option>
              <option value="KIRALIK">KIRALIK</option>
            </select>
            <select
              value={filters.deleted}
              onChange={(e) => setFilters((prev) => ({ ...prev, deleted: e.target.value as Filters["deleted"] }))}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            >
              <option value="hide">Silinmiþleri Gizle</option>
              <option value="showOnlyDeleted">Sadece Silinmiþ</option>
              <option value="showAll">Tümünü Göster</option>
            </select>
          </div>

          {error ? <div className="mt-4 rounded-md border border-rose-500 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">Error: {error}</div> : null}
          {statusMessage ? <div className="mt-4 rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{statusMessage}</div> : null}

          <div className="mt-4 overflow-auto rounded-md border border-slate-700">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-300">
                <tr>
                  <th className="border-b border-slate-700 px-3 py-3">Title</th>
                  <th className="border-b border-slate-700 px-3 py-3">Consultant</th>
                  <th className="border-b border-slate-700 px-3 py-3">Authorization</th>
                  <th className="border-b border-slate-700 px-3 py-3">Portfolio / Property</th>
                  <th className="border-b border-slate-700 px-3 py-3">Price</th>
                  <th className="border-b border-slate-700 px-3 py-3">Status</th>
                  <th className="border-b border-slate-700 px-3 py-3">Created</th>
                  <th className="border-b border-slate-700 px-3 py-3">Deleted</th>
                  <th className="border-b border-slate-700 px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-5 text-center text-slate-400">Loading listings...</td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-5 text-center text-slate-400">No listings found.</td>
                  </tr>
                ) : (
                  listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-800/50">
                      <td className="px-3 py-3">
                        <div className="font-medium text-slate-100">{listing.title}</div>
                        <div className="text-xs text-slate-400">{listing.location}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-slate-100">{listing.consultant.name}</div>
                        <div className="text-xs text-slate-400">{listing.consultant.email}</div>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          disabled={savingId === listing.id}
                          value={listing.authorizationType}
                          onChange={(e) => patchListing(listing.id, { authorizationType: e.target.value as "YETKILI" | "YETKISIZ" })}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100"
                        >
                          <option value="YETKILI">YETKILI</option>
                          <option value="YETKISIZ">YETKISIZ</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-slate-100">{listing.portfolioType}</div>
                        <div className="text-xs text-slate-400">{listing.propertyType}</div>
                      </td>
                      <td className="px-3 py-3">{formatPrice(listing.price)}</td>
                      <td className="px-3 py-3">
                        <select
                          disabled={savingId === listing.id}
                          value={listing.status}
                          onChange={(e) => patchListing(listing.id, { status: e.target.value as "ACTIVE" | "SOLD" })}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SOLD">SOLD</option>
                        </select>
                      </td>
                      <td className="px-3 py-3 text-slate-200">{new Date(listing.createdAt).toLocaleString("tr-TR")}</td>
                      <td className="px-3 py-3">
                        {listing.isDeleted ? <span className="rounded-full bg-rose-600 px-2 py-1 text-xs text-white">Yes</span> : <span className="rounded-full bg-emerald-600 px-2 py-1 text-xs text-white">No</span>}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={savingId === listing.id}
                          className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                        >
                          {savingId === listing.id ? "Processing..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
