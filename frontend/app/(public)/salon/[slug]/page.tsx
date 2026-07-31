"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SlotPicker from "@/components/salon/SlotPicker";
import { getTenantBySlug, getServicesByTenant, formatPrice, getSectorLabel } from "@/__mocks__/mock-data";
import type { Tenant, Service } from "@/lib/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SalonDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  const [selectedWorkstation, setSelectedWorkstation] = useState<string>("1. Koltuk / Masa");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTenantDetails = async () => {
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const { data: allTenants } = await apiRequest<Tenant[]>("/tenants");
        if (allTenants && Array.isArray(allTenants)) {
          const match = allTenants.find(
            (t) => t.slug === slug || t.id === slug
          );
          if (match) {
            setTenant(match);
            // Default services for booking UI
            setServices([
              { id: "svc-1", tenant_id: match.id, name: "Standart Hizmet / Randevu", duration_minutes: 45, price: 450, is_active: true, created_at: new Date().toISOString() },
              { id: "svc-2", tenant_id: match.id, name: "VIP Danışmanlık / Bakım", duration_minutes: 60, price: 750, is_active: true, created_at: new Date().toISOString() },
            ]);
            return;
          }
        }
      } catch (err) {
        console.error("FastAPI salon detail fetch error:", err);
      }
    };

    fetchTenantDetails();
  }, [slug]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  if (!tenant) {
    return (
      <div className="bg-[#F1F5F9] text-[#334155] min-h-screen flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Salon bilgileri yükleniyor...</p>
      </div>
    );
  }

  const getIllustration = (sector: string) => {
    switch (sector) {
      case "beauty":  return "/ilitrasyon/Makyaj.png";
      case "barber":  return "/ilitrasyon/sackesimi.png";
      case "massage": return "/ilitrasyon/maske.jpg";
      case "spa":     return "/ilitrasyon/maske.jpg";
      case "clinic":  return "/ilitrasyon/sackesimi.png";
      default:        return "/ilitrasyon/Makyaj.png";
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1200);
  };

  return (
    <div className="bg-[#F1F5F9] text-[#334155] min-h-screen flex flex-col pt-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol 2 Sütun */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Cover Header */}
          <div className="brand-card overflow-hidden relative min-h-[260px] flex flex-col justify-end p-8 bg-[#1E1B4B] text-white">
            <Image
              src={getIllustration(tenant.sector)}
              alt={tenant.name}
              fill
              className="object-cover opacity-25 filter contrast-125 pointer-events-none"
              priority
            />
            {/* Dark gradient overlay for 100% text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1B4B] via-[#1E1B4B]/85 to-slate-950/60 z-0 pointer-events-none" />

            <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-xs font-extrabold text-[#1E1B4B] shadow-md border border-white/20">
              {tenant.settings.review_count && tenant.settings.review_count > 0 ? (
                <span>★ {tenant.settings.rating} ({tenant.settings.review_count} Yorum)</span>
              ) : (
                <span className="text-cyan-700">🆕 Yeni Salon</span>
              )}
            </div>

            <div className="relative z-10 space-y-2">
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-widest block drop-shadow-xs">
                {getSectorLabel(tenant.sector)}
              </span>
              <h1 className="text-3xl md:text-4xl font-black font-display text-white drop-shadow-md">{tenant.name}</h1>
              <p className="text-xs md:text-sm text-slate-200 max-w-xl font-medium leading-relaxed drop-shadow-xs">{tenant.settings.description}</p>
              
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-200 pt-3 border-t border-white/15">
                <span className="flex items-center gap-1">📞 {tenant.settings.phone}</span>
                <span className="flex items-center gap-1">📍 {tenant.settings.district}, {tenant.settings.city}</span>
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="brand-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">Haftalık Çalışma Saatleri</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tenant.settings.working_hours && 
                Object.entries(tenant.settings.working_hours).map(([day, hours]) => {
                  const turkishDays: Record<string, string> = {
                    monday: "Pazartesi", tuesday: "Salı", wednesday: "Çarşamba",
                    thursday: "Perşembe", friday: "Cuma", saturday: "Cumartesi", sunday: "Pazar"
                  };
                  return (
                    <div key={day} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">{turkishDays[day]}</span>
                      <span className="text-xs font-extrabold text-[#1E1B4B] mt-0.5 block">
                        {hours.open ? `${hours.start} - ${hours.end}` : "Kapalı"}
                      </span>
                    </div>
                  );
                })
              }
            </div>
          </div>

          {/* Hizmet Listesi */}
          <div className="brand-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">Mevcut Hizmetler</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  onClick={() => {
                    if (step === 1) {
                      setSelectedService(service);
                      setStep(2);
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all flex justify-between items-center ${
                    selectedService?.id === service.id 
                      ? "bg-indigo-50 border-[#1E1B4B]" 
                      : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-[#1E1B4B] text-sm">{service.name}</h4>
                    <span className="text-xs text-slate-500 mt-0.5 block">⏱ {service.duration_minutes} Dakika</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-[#1E1B4B] text-base">{formatPrice(service.price || 0, service.currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Panel: Randevu Sihirbazı */}
        <div className="space-y-6">
          <div className="brand-card p-6 space-y-6 sticky top-28">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="font-bold text-[#1E1B4B] text-base font-display">Online Randevu Al</h3>
              <span className="text-xs font-extrabold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                {step < 4 ? `Adım ${step} / 3` : "Tamamlandı"}
              </span>
            </div>

            {step === 1 && (
              <div className="space-y-3 text-center py-6">
                <span className="text-3xl block">💁‍♀️</span>
                <h4 className="font-bold text-[#1E1B4B] text-sm">Hizmet Seçin</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Randevu almak için lütfen sol taraftaki listeden bir hizmete tıklayın.
                </p>
              </div>
            )}

            {step === 2 && selectedService && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Seçilen Hizmet:</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-[#1E1B4B]">{selectedService.name}</span>
                    <button 
                      onClick={() => { setSelectedService(null); setStep(1); }} 
                      className="text-xs text-cyan-600 font-bold hover:underline"
                    >
                      Değiştir
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Tarih</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-dark"
                  />
                </div>

                <div>
                  <SlotPicker
                    durationMinutes={selectedService.duration_minutes}
                    workstations={tenant.settings.workstations}
                    lunchBreak={tenant.settings.lunch_break}
                    selectedSlot={selectedSlot}
                    onSelectSlot={(time, ws) => {
                      setSelectedSlot(time);
                      if (ws) setSelectedWorkstation(ws);
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="w-full btn-primary py-3 justify-center text-xs shadow-md disabled:opacity-50"
                >
                  Müşteri Bilgilerine Geç
                </button>
              </div>
            )}

            {step === 3 && selectedService && selectedSlot && (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between"><span className="text-slate-500">Hizmet:</span><span className="font-bold text-[#1E1B4B]">{selectedService.name}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">İstasyon/Koltuk:</span><span className="font-bold text-cyan-700">{selectedWorkstation}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tarih & Saat:</span><span className="font-bold text-[#1E1B4B]">{selectedDate} / {selectedSlot}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5"><span className="text-slate-500">Tutar:</span><span className="font-extrabold text-[#1E1B4B]">{formatPrice(selectedService.price || 0, selectedService.currency)}</span></div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    placeholder="Adınız Soyadınız"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Telefon Numarası</label>
                  <input
                    type="tel"
                    required
                    placeholder="+90 555 123 4567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="input-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Notlar (İsteğe Bağlı)</label>
                  <textarea
                    placeholder="Özel istedikleriniz..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="input-dark h-20 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary w-1/3 justify-center text-xs py-3"
                  >
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-2/3 justify-center text-xs py-3 shadow-md"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Randevuyu Onayla"
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="space-y-4 text-center py-6">
                <span className="text-4xl block animate-bounce">🎉</span>
                <h4 className="font-extrabold text-[#1E1B4B] text-lg">Randevunuz Alındı!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Randevu onay bilgileri ve hatırlatma SMS'i kayıtlı telefon numaranıza iletilecektir.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedService(null);
                    setSelectedSlot(null);
                  }}
                  className="w-full btn-secondary py-3 justify-center text-xs"
                >
                  Yeni Randevu Al
                </button>
              </div>
            )}

          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
