"use client";

import { useState, useEffect, useMemo } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface PhysicalResource {
  id: string;
  name: string;
  resource_type: string;
  description?: string;
  capacity: number;
  is_available: boolean;
  status: "available" | "occupied" | "maintenance";
  buffer_after_minutes: number;
  notes?: string;
}

export default function ResourcesPage() {
  const { vertical, verticalConfig, tenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<PhysicalResource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // New Resource Form States
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("room");
  const [newCapacity, setNewCapacity] = useState(1);
  const [newDesc, setNewDesc] = useState("");

  // Dynamic titles and labels based on active vertical
  const resourceTitle = useMemo(() => {
    switch (vertical) {
      case "vet":
        return "🐾 Pet Otel Odaları & Grooming Pedleri";
      case "clinic":
        return "🩺 Diş Ünitleri, Cihazlar & Ameliyathaneler";
      case "auto":
        return "🚗 Servis Liftleri, Yıkama Bayları & Pedler";
      case "photo":
        return "📸 Çekim Platoları & Ekipman Kiralamaları";
      case "spa":
        return "🧖 VIP Suitler, Masaj Odaları & Saunalar";
      case "coworking":
        return "🏢 Toplantı Odaları & Özel Çalışma Masaları";
      case "driving":
        return "🚘 Direksiyon Eğitim Araçları";
      case "salon":
        return "✂️ Koltuklar, Yıkama Setleri & VIP Bakım Odaları";
      default:
        return "🏢 Fiziki Kaynaklar & Alan Yönetimi";
    }
  }, [vertical]);

  const resourceTypes = useMemo(() => {
    switch (vertical) {
      case "vet":
        return [
          { value: "kennel", label: "🐶 Pet Otel Odası / Kafes" },
          { value: "pet_room", label: "🐱 Kedi Suiti / Serbest Alan" },
          { value: "station", label: "✂️ Grooming & Tıraş Masası" },
          { value: "equipment", label: "💉 Aşı & Muayene Masası" },
        ];
      case "clinic":
        return [
          { value: "seat", label: "🦷 Dental Koltuk / Ünit" },
          { value: "equipment", label: "🩻 Röntgen & Tomografi Cihazı" },
          { value: "room", label: "🏥 Operasyon / Ameliyathane" },
        ];
      case "auto":
        return [
          { value: "bay", label: "🚗 2-Pistonlu / 4-Pistonlu Lift" },
          { value: "station", label: "🧼 Detailing & Yıkama Pedi" },
          { value: "vehicle", label: "🚚 İkame Araç Filosu" },
        ];
      case "photo":
        return [
          { value: "studio", label: "📸 Çekim Platosu (Beyaz/Siyah/Gün Işığı)" },
          { value: "equipment", label: "💡 Işık Seti & Paraflaş" },
          { value: "equipment", label: "📷 Kamera & Lens Ekipmanı" },
        ];
      case "spa":
        return [
          { value: "room", label: "🧖 VIP Çift Masaj Suiti" },
          { value: "room", label: "🌿 Aromaterapi Odası" },
          { value: "room", label: "🔥 Türk Hamamı / Sauna" },
        ];
      case "coworking":
        return [
          { value: "room", label: "🏢 10 Kişilik Toplantı Odası" },
          { value: "seat", label: "💻 Sabit Çalışma Masası" },
          { value: "room", label: "🎙️ Podcast & Medya Odası" },
        ];
      default:
        return [
          { value: "room", label: "🚪 Hizmet / Bakım Odası" },
          { value: "seat", label: "🪑 Koltuk / İstasyon" },
          { value: "equipment", label: "⚙️ Cihaz / Ekipman" },
        ];
    }
  }, [vertical]);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const tenantId = tenant?.id || "tenant-demo-1";
        const { data } = await apiRequest<any[]>(`/v1/resources?tenant_id=${tenantId}`);

        if (data && Array.isArray(data) && data.length > 0) {
          setResources(
            data.map((r) => ({
              id: r.id,
              name: r.name,
              resource_type: r.resource_type || "room",
              description: r.description || "",
              capacity: r.capacity || 1,
              is_available: r.is_available ?? true,
              status: r.is_available ? "available" : "occupied",
              buffer_after_minutes: r.buffer_after_minutes || 0,
            }))
          );
        } else {
          // Default mock data based on vertical
          const mockDefaults: PhysicalResource[] =
            vertical === "vet"
              ? [
                  { id: "res-v1", name: "VIP Pet Otel Suiti #101 (Klima & Kamera)", resource_type: "kennel", description: "Büyük ırk köpekler için 15m² özel bahçeli alan", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 30 },
                  { id: "res-v2", name: "Kedi Otel Odası #202 (Tırmanma Ağaçlı)", resource_type: "pet_room", description: "Sessiz, cam manzaralı kedi oyun odası", capacity: 2, is_available: false, status: "occupied", buffer_after_minutes: 15 },
                  { id: "res-v3", name: "Pet Grooming & Medikal Yıkama Pedi", resource_type: "station", description: "Kurulama ve ırk tıraş istasyonu", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 10 },
                ]
              : vertical === "clinic"
              ? [
                  { id: "res-c1", name: "1. Muayene & Ünit Koltuğu", resource_type: "seat", description: "Planmeca 3D Dental Ünit", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 15 },
                  { id: "res-c2", name: "Panoramik Röntgen & Tomografi Odası", resource_type: "equipment", description: "Uçtan uca kurşun kaplama korumalı", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 10 },
                  { id: "res-c3", name: "Steril İmplant Ameliyathanesi", resource_type: "room", description: "HEPA filtreli cerrahi operasyon salonu", capacity: 1, is_available: false, status: "occupied", buffer_after_minutes: 30 },
                ]
              : vertical === "auto"
              ? [
                  { id: "res-a1", name: "1. Otomatik Hidrolik Lift (3.5 Ton)", resource_type: "bay", description: "Mekanik ve yağ değişim lifti", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 15 },
                  { id: "res-a2", name: "Seramik Kaplama & Detailing Pedi", resource_type: "station", description: "Özel tozsuz ışık tüneli", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 20 },
                ]
              : [
                  { id: "res-d1", name: "1. Hizmet & Bakım Odası", resource_type: "room", description: "Ana çalışma alanı", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 10 },
                  { id: "res-d2", name: "VIP Koltuk / Ekipman İstasyonu", resource_type: "seat", description: "Özel rezervasyonlu alan", capacity: 1, is_available: true, status: "available", buffer_after_minutes: 10 },
                ];
          setResources(mockDefaults);
        }
      } catch (err) {
        console.error("Resources fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [vertical, tenant]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newRes: PhysicalResource = {
      id: `res-${Date.now()}`,
      name: newName.trim(),
      resource_type: newType,
      description: newDesc.trim() || undefined,
      capacity: newCapacity,
      is_available: true,
      status: "available",
      buffer_after_minutes: 15,
    };

    try {
      const { apiRequest } = await import("@/lib/api-client");
      await apiRequest("/v1/resources/", {
        method: "POST",
        body: JSON.stringify({
          name: newRes.name,
          resource_type: newRes.resource_type,
          description: newRes.description,
          capacity: newRes.capacity,
          buffer_after_minutes: 15,
        }),
      }).catch(() => null);

      setResources((prev) => [newRes, ...prev]);
      setShowAddModal(false);
      setNewName("");
      setNewDesc("");
      setNewCapacity(1);
    } catch (err) {
      console.error("Add resource error:", err);
    }
  };

  const handleToggleStatus = (id: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === "available" ? "occupied" : r.status === "occupied" ? "maintenance" : "available";
          return {
            ...r,
            status: nextStatus,
            is_available: nextStatus === "available",
          };
        }
        return r;
      })
    );
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredResources = useMemo(() => {
    if (filterType === "all") return resources;
    return resources.filter((r) => r.resource_type === filterType || r.status === filterType);
  }, [resources, filterType]);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 uppercase border border-indigo-200/80">
              {verticalConfig?.displayName || "Sektörel Varlıklar"}
            </span>
          </div>
          <h1 className="text-2xl font-black font-display text-[#1E1B4B]">
            {resourceTitle}
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            İşletmenizin fiziki odalarını, koltuklarını, cihazlarını ve kapasite takvimini yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-cyan text-xs py-3 px-6 font-extrabold shadow-md flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <span>➕ Yeni Alan / Kaynak Ekle</span>
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Toplam Tanımlı Kaynak</span>
          <h3 className="text-2xl font-black text-slate-900 font-display">{resources.length} Adet</h3>
          <span className="text-xs text-emerald-600 font-bold">✓ Kapasite Takvimi Aktif</span>
        </div>

        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">● Kullanıma Uygun (Boş)</span>
          <h3 className="text-2xl font-black text-emerald-950 font-display">
            {resources.filter((r) => r.status === "available").length} Odaları/Koltuk
          </h3>
          <span className="text-xs text-emerald-700 font-bold">Anında Rezervasyona Hazır</span>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">🔒 Dolu veya Bakımda</span>
          <h3 className="text-2xl font-black text-amber-950 font-display">
            {resources.filter((r) => r.status !== "available").length} Kaynak
          </h3>
          <span className="text-xs text-amber-700 font-bold">Otomatik Tampon Süre Aktif</span>
        </div>
      </div>

      {/* Resource Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterType === "all" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Tüm Kaynaklar ({resources.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("available")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterType === "available" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          ● Boş / Uygun ({resources.filter((r) => r.status === "available").length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("occupied")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
            filterType === "occupied" ? "bg-amber-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          🔒 Dolu / Kullanımda ({resources.filter((r) => r.status === "occupied").length})
        </button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredResources.length === 0 ? (
        <EmptyState
          title="Henüz Kaynak Tanımlanmadı"
          description="İşletmenizin odalarını, koltuklarını veya cihazlarını ekleyerek çakışmasız randevu alımına başlayın."
          actionLabel="➕ İlk Kaynağı Ekle"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className={`p-6 rounded-3xl bg-white border transition-all duration-300 space-y-4 hover:shadow-lg ${
                res.status === "available"
                  ? "border-emerald-200 hover:border-emerald-300"
                  : res.status === "occupied"
                  ? "border-amber-200 hover:border-amber-300"
                  : "border-rose-200 hover:border-rose-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      res.status === "available"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : res.status === "occupied"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {res.status === "available"
                      ? "● Uygun / Boş"
                      : res.status === "occupied"
                      ? "🔒 Dolu / Rezervasyonda"
                      : "🛠️ Bakımda"}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-2 font-display">
                    {res.name}
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-lg">
                  {vertical === "vet" ? "🐶" : vertical === "clinic" ? "🦷" : vertical === "auto" ? "🚗" : "🚪"}
                </div>
              </div>

              {res.description && (
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {res.description}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>Eşzamanlı Kapasite: <strong className="text-slate-900">{res.capacity} Kişi/Pet</strong></span>
                <span>Tampon: <strong className="text-indigo-600">{res.buffer_after_minutes} dk</strong></span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(res.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    res.status === "available"
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {res.status === "available" ? "🔒 Dolu Yap" : "✓ Boşalt / Uygun Yap"}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(res.id)}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                  title="Kaynağı Sil"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-display">
                ➕ Yeni Fiziki Kaynak / Oda Ekle
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kaynak / Oda Adı *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    vertical === "vet"
                      ? "VIP Kedi Otel Suiti #102"
                      : vertical === "clinic"
                      ? "2. Dental Muayene Koltuğu"
                      : "1. Lift / Yıkama Pedi"
                  }
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-dark bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kaynak Türü *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="input-dark bg-white font-bold"
                >
                  {resourceTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kapasite (Kişi / Pet / Araç) *</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(parseInt(e.target.value) || 1)}
                  className="input-dark bg-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Açıklama & Özellikler</label>
                <textarea
                  rows={3}
                  placeholder="Klima, 7/24 canlı kamera izleme, HEPA filtre vb."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-dark bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 btn-secondary justify-center py-2.5 font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-cyan justify-center py-2.5 font-extrabold shadow-md"
                >
                  Kaynağı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
