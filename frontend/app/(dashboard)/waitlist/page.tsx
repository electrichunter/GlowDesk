"use client";

import { useState, useEffect } from "react";
import WaitlistCard from "@/components/dashboard/WaitlistCard";
import { safeJsonParse } from "@/lib/sanitize";
import type { WaitlistEntry, Customer, Service } from "@/lib/types";

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    try {
      const savedWaitlist = localStorage.getItem("glowdesk_waitlist");
      const parsedWaitlist = safeJsonParse<WaitlistEntry[]>(savedWaitlist, []);
      setWaitlist(parsedWaitlist);

      const savedCusts = localStorage.getItem("glowdesk_customers");
      const parsedCusts = safeJsonParse<Customer[]>(savedCusts, []);
      setCustomers(parsedCusts);

      const savedSvcs = localStorage.getItem("glowdesk_services");
      const parsedSvcs = safeJsonParse<Service[]>(savedSvcs, []);
      setServices(parsedSvcs);
    } catch {
      setWaitlist([]);
      setCustomers([]);
      setServices([]);
    }
  }, []);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [timeStart, setTimeStart] = useState("10:00");
  const [timeEnd, setTimeEnd] = useState("14:00");

  const handleOfferSlot = (id: string) => {
    const updated = waitlist.map(w => w.id === id ? { ...w, status: "offered" as const } : w);
    setWaitlist(updated);
    localStorage.setItem("glowdesk_waitlist", JSON.stringify(updated));

    setTimeout(() => {
      setWaitlist(prev => {
        const confirmedList = prev.map(w => w.id === id ? { ...w, status: "confirmed" as const } : w);
        localStorage.setItem("glowdesk_waitlist", JSON.stringify(confirmedList));
        return confirmedList;
      });
    }, 3000);
  };

  const handleAddWaitlist = (e: React.FormEvent) => {
    e.preventDefault();

    const customer = customers.find(c => c.id === selectedCustomerId);
    const service = services.find(s => s.id === selectedServiceId);

    const newEntry: WaitlistEntry = {
      id: `wl-${Date.now()}`,
      tenant_id: "tenant-1",
      customer: {
        full_name: customer?.full_name || "Müşteri",
        phone: customer?.phone || "",
      },
      preferred_date: new Date().toISOString().split("T")[0],
      preferred_time_start: timeStart,
      preferred_time_end: timeEnd,
      service_id: selectedServiceId,
      service,
      status: "waiting",
      created_at: new Date().toISOString()
    };

    const updatedWaitlist = [...waitlist, newEntry];
    setWaitlist(updatedWaitlist);
    localStorage.setItem("glowdesk_waitlist", JSON.stringify(updatedWaitlist));
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#1E1B4B]">No-Show Kurtarma Motoru</h1>
          <p className="text-slate-500 text-xs mt-1">
            İptal olan veya gelmeyen müşterilerinizin saatini sıradaki kişilere otomatik/tek tıkla teklif edin.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs py-2.5 px-4"
        >
          ➕ Bekleme Listesine Ekle
        </button>
      </div>

      {/* Bilgilendirme Notu */}
      <div className="brand-card p-6 bg-white border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 block">🥊 GlowDesk Farkı</span>
          <h3 className="text-sm font-extrabold text-[#1E1B4B]">"No-Show Kurtarma Motoru"</h3>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-normal">
            İptal saatiniz <strong>Waitlist'teki kişilere SMS ile otomatik teklif edilir</strong>. Sıfır çabayla bos kalan saatleriniz dolar.
          </p>
        </div>
        <div className="px-5 py-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center min-w-[140px]">
          <span className="block text-2xl font-black text-[#1E1B4B]">{waitlist.length} Kayıt</span>
          <span className="text-[9px] uppercase font-bold text-slate-500">Aktif Sıradaki Müşteri</span>
        </div>
      </div>

      {/* Bekleme Listesi Akışı */}
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
          <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">Bekleyen Müşteriler</h3>
          <span className="text-xs text-slate-500 font-medium">Waitlist Listesi</span>
        </div>

        <div className="space-y-3">
          {waitlist.length > 0 ? (
            waitlist.map((entry) => (
              <WaitlistCard 
                key={entry.id} 
                entry={entry} 
                onOfferSlot={handleOfferSlot}
              />
            ))
          ) : (
            <div className="text-center py-12 brand-card bg-white text-slate-500 text-xs font-medium">
              Şu an bekleme listesinde kaydedilmiş müşteri bulunmuyor.
            </div>
          )}
        </div>
      </div>

      {/* Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#1E1B4B] font-display text-base">Bekleme Listesine Ekle</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWaitlist} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Müşteri</label>
                {customers.length > 0 ? (
                  <select 
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="input-dark bg-white"
                  >
                    <option value="">-- Müşteri Seçiniz --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} ({c.phone || "Telefon yok"})</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    ⚠️ Kayıtlı müşteri yok. Önce 'Müşteriler' sayfasından ekleyin.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Tercih Edilen Hizmet</label>
                {services.length > 0 ? (
                  <select 
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="input-dark bg-white"
                  >
                    <option value="">-- Hizmet Seçiniz --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ₺{s.price}</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    ⚠️ Kayıtlı hizmet yok. Önce 'Hizmetler' sayfasından ekleyin.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Başlangıç Saati</label>
                  <input
                    type="time"
                    required
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Bitiş Saati</label>
                  <input
                    type="time"
                    required
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 btn-secondary justify-center text-xs py-3"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="w-2/3 btn-primary justify-center text-xs py-3 shadow-md"
                >
                  Listeye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
