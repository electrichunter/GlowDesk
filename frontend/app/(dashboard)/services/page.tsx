"use client";

import { useState, useEffect } from "react";
import { defaultServiceTemplates, getSectorLabel, getSectorIcon } from "@/__mocks__/mock-data";
import type { Service } from "@/lib/types";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateSector, setSelectedTemplateSector] = useState("beauty");

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const { data } = await apiRequest<any[]>("/services");
        if (data && Array.isArray(data)) {
          setServices(
            data.map((s) => ({
              id: s.id,
              tenant_id: s.tenant_id,
              name: s.name,
              category: s.category || "Genel",
              duration_minutes: s.duration_minutes || 30,
              price: floatNumber(s.price),
              currency: "TRY",
              description: s.description || undefined,
              created_at: s.created_at || new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        console.error("Services fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  function floatNumber(val: any): number {
    const p = parseFloat(val);
    return isNaN(p) ? 0 : p;
  }

  // Form State
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(200);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const { apiRequest } = await import("@/lib/api-client");
      const { data: newSvc, error } = await apiRequest<any>("/services", {
        method: "POST",
        body: JSON.stringify({
          tenantId: "tenant-demo-1",
          name: name.trim(),
          durationMinutes: duration,
          price: price,
        }),
      });

      if (error) {
        alert(`❌ Hata: ${error}`);
        return;
      }

      if (newSvc) {
        const formatted: Service = {
          id: newSvc.id,
          tenant_id: newSvc.tenant_id,
          name: newSvc.name,
          duration_minutes: newSvc.duration_minutes,
          price: floatNumber(newSvc.price),
          currency: "TRY",
          created_at: new Date().toISOString(),
        };

        setServices((prev) => [...prev, formatted]);
        setShowAddModal(false);
        setName("");
        setDuration(30);
        setPrice(200);
      }
    } catch (err) {
      console.error("Service save error:", err);
    }
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Bu hizmeti silmek istediğinize emin misiniz?")) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      localStorage.setItem("glowdesk_services", JSON.stringify(updated));
    }
  };

  const handleAddFromTemplate = (templateSector: string) => {
    const templates = defaultServiceTemplates[templateSector] || [];
    const newServices: Service[] = templates.map((t, i) => ({
      id: `svc-tpl-${Date.now()}-${i}`,
      tenant_id: "tenant-1",
      name: t.name,
      duration_minutes: t.duration_minutes,
      price: t.price,
      currency: "TRY",
      created_at: new Date().toISOString(),
    }));
    const updated = [...services, ...newServices];
    setServices(updated);
    localStorage.setItem("glowdesk_services", JSON.stringify(updated));
    setShowTemplateModal(false);
  };

  const sectorOptions = [
    { key: "beauty",  label: getSectorLabel("beauty"),  icon: getSectorIcon("beauty") },
    { key: "barber",  label: getSectorLabel("barber"),  icon: getSectorIcon("barber") },
    { key: "massage", label: getSectorLabel("massage"), icon: getSectorIcon("massage") },
    { key: "spa",     label: getSectorLabel("spa"),     icon: getSectorIcon("spa") },
    { key: "clinic",  label: getSectorLabel("clinic"),  icon: getSectorIcon("clinic") },
  ];

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#1E1B4B]">Hizmet Menüsü</h1>
          <p className="text-slate-500 text-xs mt-1">Salonunuzda sunduğunuz hizmetleri, sürelerini ve fiyat tarifelerini yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="btn-secondary text-xs py-2.5 px-4"
          >
            📋 Hazır Şablon Ekle
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs py-2.5 px-4 shadow-sm"
          >
            ➕ Yeni Hizmet Ekle
          </button>
        </div>
      </div>

      {/* Hizmet Listesi veya Boş Ekran */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="brand-card p-5 space-y-4 bg-white flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-[#1E1B4B] text-base">{s.name}</h3>
                  <button
                    onClick={() => handleDeleteService(s.id)}
                    className="text-slate-300 hover:text-rose-600 text-sm p-1 font-bold"
                    title="Hizmeti Sil"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  ⏱️ Süre: {s.duration_minutes} Dakika
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Hizmet Ücreti</span>
                <span className="text-lg font-black text-indigo-950">
                  ₺{s.price?.toLocaleString("tr-TR") || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="brand-card p-12 text-center text-slate-500 space-y-3 bg-white">
          <span className="text-4xl block">✂️</span>
          <h3 className="font-extrabold text-[#1E1B4B] text-base">Henüz Hizmet Tanımlanmadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Salonunuzda sunduğunuz hizmetleri ve fiyat tarifelerini eklemek için yukarıdaki 'Yeni Hizmet Ekle' veya 'Hazır Şablon Ekle' butonlarını kullanabilirsiniz.
          </p>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">🗒️ Sektör Hizmet Şablonu</h3>
                <p className="text-slate-500 text-xs mt-0.5">Sektörünüzü seçin, hazır hizmetleri tek tıkla ekleyin.</p>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {sectorOptions.map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedTemplateSector(s.key)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      selectedTemplateSector === s.key
                        ? "bg-[#1E1B4B] border-[#1E1B4B] text-white shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-[9px] font-bold leading-tight">{s.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {getSectorIcon(selectedTemplateSector)} {getSectorLabel(selectedTemplateSector)} — Hazır Hizmetler
                </p>
                {(defaultServiceTemplates[selectedTemplateSector] || []).map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200/60 last:border-0">
                    <div>
                      <span className="text-xs text-[#1E1B4B] font-bold">{t.name}</span>
                      <span className="text-[10px] text-slate-500 block">⏱ {t.duration_minutes} dk</span>
                    </div>
                    <span className="text-xs font-black text-indigo-900">₺{t.price.toLocaleString("tr-TR")}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => handleAddFromTemplate(selectedTemplateSector)}
                  className="w-2/3 btn-primary justify-center text-xs py-3 shadow-md"
                >
                  ✅ Tüm Şablonları Ekle ({(defaultServiceTemplates[selectedTemplateSector] || []).length} hizmet)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-[#1E1B4B] font-display text-lg">Yeni Hizmet Ekle</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddService} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Hizmet Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Klasik Cilt Bakımı"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Hizmet Süresi (Dakika)</label>
                <input
                  type="number"
                  required
                  min={10}
                  step={5}
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Fiyat (TRY)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  className="input-dark"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-primary justify-center text-xs py-3 shadow-md"
                >
                  Hizmeti Kaydet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
