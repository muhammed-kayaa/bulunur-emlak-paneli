"use client";

import { useEffect, useMemo, useState } from "react";
import { Consultant } from "@/lib/mock/consultantsStore";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
};

export default function Page() {

  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', photoUrl: '', commissionRate: '' });
  const [error, setError] = useState('');

  const fetchConsultants = async () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.append("status", filter);
    if (search) params.append("q", search);
    const res = await fetch(`/api/admin/consultants?${params}`);
    const json = await res.json();
    if (json.ok) {
      setConsultants(json.data);
    }
  };

  useEffect(() => {
    fetchConsultants();
  }, [search, filter]);

  const filteredConsultants = useMemo(() => {
    return consultants.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && c.isActive) ||
        (filter === "inactive" && !c.isActive);
      return matchesSearch && matchesFilter;
    });
  }, [consultants, search, filter]);

  const summary = useMemo(() => {
    const activeConsultants = consultants.filter((c) => c.isActive);
    const totalMonthlyRevenue = consultants.reduce(
      (sum, c) => sum + c.metrics.monthlyRevenue,
      0
    );
    const totalMonthlySales = consultants.reduce(
      (sum, c) => sum + c.metrics.monthlySalesCount,
      0
    );
    const avgCommissionRate =
      activeConsultants.length > 0
        ? activeConsultants.reduce((sum, c) => sum + c.commissionRate, 0) /
          activeConsultants.length
        : 0;
    return {
      activeCount: activeConsultants.length,
      totalMonthlyRevenue,
      totalMonthlySales,
      avgCommissionRate: Math.round(avgCommissionRate * 100) / 100,
    };
  }, [consultants]);

  const handleCommissionChange = async (id: string, newRate: number) => {
    if (newRate < 0 || newRate > 100) return;
    const res = await fetch('/api/admin/consultants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'rate', value: newRate }),
    });
    const json = await res.json();
    if (json.ok) {
      setConsultants(prev => prev.map(c => c.id === id ? json.data : c));
    }
  };

  const handleToggleActive = async (id: string) => {
    const res = await fetch('/api/admin/consultants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'toggle' }),
    });
    const json = await res.json();
    if (json.ok) {
      setConsultants(prev => prev.map(c => c.id === id ? json.data : c));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu danışmanı silmek istediğinizden emin misiniz?")) return;
    const res = await fetch('/api/admin/consultants', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.ok) {
      setConsultants(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const commissionRate = parseInt(formData.commissionRate);
    if (isNaN(commissionRate)) {
      setError('Geçersiz komisyon oranı');
      return;
    }
    const res = await fetch('/api/admin/consultants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, commissionRate }),
    });
    const json = await res.json();
    if (json.ok) {
      setConsultants(prev => [json.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', photoUrl: '', commissionRate: '' });
    } else {
      setError(json.error || 'Bir hata oluştu');
    }
  };

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
        <h1 className="text-2xl font-semibold">Admin • Danışmanlar</h1>
        <p className="mt-2 text-white/60">
          Tüm danışmanlar, komisyon oranları ve performans
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-white/60">Aktif Danışmanlar</h3>
          <p className="text-2xl font-bold">{summary.activeCount}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-white/60">Aylık Gelir</h3>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalMonthlyRevenue)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-white/60">Aylık Satış</h3>
          <p className="text-2xl font-bold">{summary.totalMonthlySales}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-white/60">Ortalama Komisyon</h3>
          <p className="text-2xl font-bold">{summary.avgCommissionRate}%</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="İsim veya e-posta ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white placeholder-white/50"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "active" | "inactive")}
          className="px-4 py-2 bg-gray-800 border border-white/10 rounded-lg text-white"
        >
          <option value="all">Tümü</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
        </select>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
        >
          Yeni Danışman
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">İsim</th>
              <th className="px-4 py-3 text-left">E-posta</th>
              <th className="px-4 py-3 text-left">Komisyon (%)</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-left">Aylık Satış</th>
              <th className="px-4 py-3 text-left">Aylık Gelir</th>
              <th className="px-4 py-3 text-left">Toplam Satış</th>
              <th className="px-4 py-3 text-left">Toplam Gelir</th>
              <th className="px-4 py-3 text-left">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsultants.map((c) => (
              <tr key={c.id} className="border-t border-white/10 hover:bg-gray-700">
                <td className="px-4 py-3 flex items-center gap-3">
                  {c.photoUrl ? (
                    <img
                      src={c.photoUrl}
                      alt={c.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-medium">
                      {getInitials(c.name)}
                    </div>
                  )}
                  <span>{c.name}</span>
                </td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={c.commissionRate}
                    onChange={(e) =>
                      handleCommissionChange(c.id, parseInt(e.target.value) || 0)
                    }
                    className="w-16 px-2 py-1 bg-gray-700 border border-white/10 rounded text-white text-center"
                  />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      c.isActive
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {c.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3">{c.metrics.monthlySalesCount}</td>
                <td className="px-4 py-3">{formatCurrency(c.metrics.monthlyRevenue)}</td>
                <td className="px-4 py-3">{c.metrics.totalSalesCount}</td>
                <td className="px-4 py-3">{formatCurrency(c.metrics.totalRevenue)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(c.id)}
                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs font-medium"
                  >
                    {c.isActive ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Yeni Danışman Ekle</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">İsim</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">E-posta</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Fotoğraf URL (İsteğe bağlı)</label>
                <input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Komisyon Oranı (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded text-white"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-white font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}