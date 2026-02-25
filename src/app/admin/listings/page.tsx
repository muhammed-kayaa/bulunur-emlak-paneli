"use client";

import { useEffect, useMemo, useState } from "react";
import { Listing } from "@/lib/mock/listingsStore";
import { Consultant } from "@/lib/mock/consultantsStore";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

export default function Page() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "SOLD">("all");
  const [authFilter, setAuthFilter] = useState<"all" | "YETKILI" | "YETKISIZ">("all");
  const [portfolioFilter, setPortfolioFilter] = useState<"all" | "SATILIK" | "KIRALIK">("all");
  const [deletedFilter, setDeletedFilter] = useState<"hide" | "showOnlyDeleted" | "showAll">("hide");

  const fetchListings = async () => {
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (authFilter !== "all") params.append("auth", authFilter);
    if (portfolioFilter !== "all") params.append("portfolio", portfolioFilter);
    if (deletedFilter !== "hide") params.append("deleted", deletedFilter);
    const res = await fetch(`/api/admin/listings?${params}`);
    const json = await res.json();
    if (json.ok) {
      setListings(json.data);
    }
  };

  const fetchConsultants = async () => {
    const res = await fetch("/api/admin/consultants");
    const json = await res.json();
    if (json.ok) {
      setConsultants(json.data);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [search, statusFilter, authFilter, portfolioFilter, deletedFilter]);

  const consultantMap = useMemo(() => {
    const map: { [id: string]: Consultant } = {};
    consultants.forEach(c => {
      map[c.id] = c;
    });
    return map;
  }, [consultants]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin • İlanlar</h1>
        <p className="mt-2 text-white/60">
          Tüm ilanlar ve durumları
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Başlık veya konum ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-white/50"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "ACTIVE" | "SOLD")}
          className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="SOLD">Satıldı</option>
        </select>
        <select
          value={authFilter}
          onChange={(e) => setAuthFilter(e.target.value as "all" | "YETKILI" | "YETKISIZ")}
          className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
        >
          <option value="all">Tüm Yetkilendirme</option>
          <option value="YETKILI">Yetkili</option>
          <option value="YETKISIZ">Yetkisiz</option>
        </select>
        <select
          value={portfolioFilter}
          onChange={(e) => setPortfolioFilter(e.target.value as "all" | "SATILIK" | "KIRALIK")}
          className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
        >
          <option value="all">Tüm Portföy</option>
          <option value="SATILIK">Satılık</option>
          <option value="KIRALIK">Kiralık</option>
        </select>
        <select
          value={deletedFilter}
          onChange={(e) => setDeletedFilter(e.target.value as "hide" | "showOnlyDeleted" | "showAll")}
          className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
        >
          <option value="hide">Silinmişleri Gizle</option>
          <option value="showOnlyDeleted">Sadece Silinmiş</option>
          <option value="showAll">Tümünü Göster</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Başlık</th>
              <th className="px-4 py-3 text-left">Danışman</th>
              <th className="px-4 py-3 text-left">Yetkilendirme</th>
              <th className="px-4 py-3 text-left">Portföy</th>
              <th className="px-4 py-3 text-left">Fiyat</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => {
              const consultant = consultantMap[l.consultantId];
              return (
                <tr key={l.id} className="border-t border-white/10 hover:bg-gray-700">
                  <td className="px-4 py-3">{l.title}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    {consultant?.photoUrl ? (
                      <img
                        src={consultant.photoUrl}
                        alt={consultant.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium">
                        {consultant ? getInitials(consultant.name) : "?"}
                      </div>
                    )}
                    <span>{consultant?.name || "Bilinmiyor"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        l.authorizationType === "YETKILI"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {l.authorizationType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        l.portfolioType === "SATILIK"
                          ? "bg-blue-600 text-white"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      {l.portfolioType}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(l.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        l.status === "ACTIVE"
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {l.status === "ACTIVE" ? "Aktif" : "Satıldı"}
                    </span>
                    {l.isDeleted && (
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                        Silinmiş
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium">
                      Görüntüle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}