"use client";

import { useState, useEffect } from "react";
import { markListingSold } from "@/lib/actions/listings";

type PortfolioType = "SATILIK" | "KIRALIK";
type PropertyType = string;
type AuthorizationType = "YETKILI" | "YETKISIZ";
type ListingStatus = "ACTIVE" | "SOLD";

type ListingRow = {
  id: string;
  title: string;
  portfolioType: PortfolioType;
  propertyType: PropertyType;
  authorizationType: AuthorizationType;
  status: ListingStatus;
  isDeleted: boolean;
  createdAt: string;
  price: number | string;
};

type Filters = {
  q: string;
  status: "all" | "ACTIVE" | "SOLD";
  auth: "all" | "YETKILI" | "YETKISIZ";
  portfolio: "all" | "SATILIK" | "KIRALIK";
  deleted: "hide" | "showOnlyDeleted" | "showAll";
};

export default function Page() {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"add" | "list">("list");
  const [filters, setFilters] = useState<Filters>({
    q: "",
    status: "all",
    auth: "all",
    portfolio: "all",
    deleted: "hide",
  });

  const [formData, setFormData] = useState({
    title: "",
    portfolioType: "SATILIK" as PortfolioType,
    propertyType: "EV" as PropertyType,
    authorizationType: "YETKILI" as AuthorizationType,
    price: "",
    rooms: "",
    sqm: "",
    city: "",
    district: "",
    neighborhood: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.q) params.set("q", filters.q);
      params.set("status", filters.status);
      params.set("auth", filters.auth);
      params.set("portfolio", filters.portfolio);
      params.set("deleted", filters.deleted);

      const res = await fetch(`/api/consultant/listings?${params}`);
      const data = await res.json();
      if (data.ok) {
        setListings(data.data);
      } else {
        setError(data.error || "Failed to fetch listings");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const payload = {
      title: formData.title,
      portfolioType: formData.portfolioType,
      propertyType: formData.propertyType,
      price: parseFloat(formData.price),
      rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
      sqm: formData.sqm ? parseFloat(formData.sqm) : undefined,
      location: {
        city: formData.city,
        district: formData.district,
        neighborhood: formData.neighborhood || undefined,
      },
      authorizationType: formData.authorizationType,
    };

    try {
      const res = await fetch("/api/consultant/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        setFormData({
          title: "",
          portfolioType: "SATILIK",
          propertyType: "EV",
          authorizationType: "YETKILI",
          price: "",
          rooms: "",
          sqm: "",
          city: "",
          district: "",
          neighborhood: "",
        });
        fetchListings();
        setActiveTab("list");
      } else {
        setFormError(data.error || "Failed to create listing");
      }
    } catch (err) {
      setFormError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAuthChange = async (id: string, newAuth: AuthorizationType) => {
    try {
      const res = await fetch("/api/consultant/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, authorizationType: newAuth }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchListings();
      } else {
        alert(data.error || "Failed to update");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const res = await fetch("/api/consultant/listings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.ok) {
        fetchListings();
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const handleMarkSold = async (listingId: string) => {
    const input = prompt("Enter commission amount:");
    if (input === null) return;
    const commissionAmount = parseFloat(input);
    if (!Number.isFinite(commissionAmount) || commissionAmount <= 0) {
      alert("Invalid commission amount");
      return;
    }

    try {
      const result = await markListingSold({ listingId, commissionAmount });
      if (result.success) {
        alert("Sold");
        await fetchListings();
      } else {
        alert(result.error);
      }
    } catch (err) {
      alert("Network error");
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(numPrice);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-xl font-semibold mb-6">Consultant • İlanlar</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("add")}
          className={`px-4 py-2 rounded-full ${activeTab === "add" ? "bg-blue-600 text-white" : "bg-gray-800 text-white/80 hover:bg-gray-700"}`}
        >
          İlan Ekle
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-full ${activeTab === "list" ? "bg-blue-600 text-white" : "bg-gray-800 text-white/80 hover:bg-gray-700"}`}
        >
          İlanlarım
        </button>
      </div>

      {activeTab === "add" && (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg border border-white/10 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Portfolio Type</label>
              <select
                value={formData.portfolioType}
                onChange={(e) => setFormData({ ...formData, portfolioType: e.target.value as PortfolioType })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="SATILIK">SATILIK</option>
                <option value="KIRALIK">KIRALIK</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value as PropertyType })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="EV">EV</option>
                <option value="ARSA">ARSA</option>
                <option value="DİĞER">DİĞER</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Authorization Type</label>
              <select
                value={formData.authorizationType}
                onChange={(e) => setFormData({ ...formData, authorizationType: e.target.value as AuthorizationType })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="YETKILI">YETKILI</option>
                <option value="YETKISIZ">YETKISIZ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rooms (optional)</label>
              <input
                type="number"
                value={formData.rooms}
                onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sqm (optional)</label>
              <input
                type="number"
                value={formData.sqm}
                onChange={(e) => setFormData({ ...formData, sqm: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Neighborhood (optional)</label>
              <input
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          {formError && <p className="text-red-500 mt-4">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Create Listing"}
          </button>
        </form>
      )}

      {activeTab === "list" && (
        <>
          <div className="bg-gray-800 p-4 rounded-lg border border-white/10 mb-6">
            <div className="grid grid-cols-6 gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SOLD">Sold</option>
              </select>
              <select
                value={filters.auth}
                onChange={(e) => setFilters({ ...filters, auth: e.target.value as any })}
                className="bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="all">All Auth</option>
                <option value="YETKILI">YETKILI</option>
                <option value="YETKISIZ">YETKISIZ</option>
              </select>
              <select
                value={filters.portfolio}
                onChange={(e) => setFilters({ ...filters, portfolio: e.target.value as any })}
                className="bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="all">All Portfolio</option>
                <option value="SATILIK">SATILIK</option>
                <option value="KIRALIK">KIRALIK</option>
              </select>
              <select
                value={filters.deleted}
                onChange={(e) => setFilters({ ...filters, deleted: e.target.value as any })}
                className="bg-gray-900/60 border border-white/10 text-white placeholder-white/40 rounded-lg px-3 py-2"
              >
                <option value="hide">Hide Deleted</option>
                <option value="showOnlyDeleted">Show Only Deleted</option>
                <option value="showAll">Show All</option>
              </select>
            </div>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div className="bg-gray-800 rounded-lg overflow-hidden border border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 text-white/80">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4 text-left">Auth</th>
                  <th className="p-4 text-left">Portfolio/Property</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Created</th>
                  <th className="p-4 text-left">Deleted</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id} className="border-t border-white/10 hover:bg-gray-700/50">
                    <td className="p-4">{listing.title}</td>
                    <td className="p-4">
                      <select
                        value={listing.authorizationType}
                        onChange={(e) => handleAuthChange(listing.id, e.target.value as AuthorizationType)}
                        className="bg-gray-900/60 border border-white/10 text-white rounded-lg px-2 py-1"
                        disabled={listing.isDeleted}
                      >
                        <option value="YETKILI">YETKILI</option>
                        <option value="YETKISIZ">YETKISIZ</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="inline-block bg-blue-600/20 text-blue-200 px-2 py-1 rounded border border-blue-500/30 mr-2">
                        {listing.portfolioType}
                      </span>
                      <span className="inline-block bg-green-600/20 text-green-200 px-2 py-1 rounded border border-green-500/30">
                        {listing.propertyType}
                      </span>
                    </td>
                    <td className="p-4">{formatPrice(listing.price)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded border ${listing.status === "ACTIVE" ? "bg-green-600/20 text-green-200 border-green-500/30" : "bg-amber-600/20 text-amber-200 border-amber-500/30"}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-4">{formatDate(listing.createdAt)}</td>
                    <td className="p-4">
                      {listing.isDeleted && (
                        <span className="inline-block bg-red-600/20 text-red-200 px-2 py-1 rounded border border-red-500/30">Deleted</span>
                      )}
                    </td>
                    <td className="p-4">
                      {listing.status === "ACTIVE" && !listing.isDeleted && (
                        <button
                          onClick={() => handleMarkSold(listing.id)}
                          className="text-green-400 hover:text-green-300 mr-4"
                        >
                          Mark Sold
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-400 hover:text-red-300"
                        disabled={listing.isDeleted}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}