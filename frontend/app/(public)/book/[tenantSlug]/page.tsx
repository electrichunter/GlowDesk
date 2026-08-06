"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Service, Tenant } from "@/lib/types";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

const STAFF_OPTIONS = [
  { id: "any", name: "Fark Etmez (En Hızlı Slot)", avatar: "⚡" },
  { id: "1. Koltuk (Ahmet Usta)", name: "1. Koltuk — Ahmet Usta (Kıdemli)", avatar: "✂️" },
  { id: "2. Koltuk (Mehmet Kalfa)", name: "2. Koltuk — Mehmet Kalfa", avatar: "💈" },
  { id: "VİP Bakım Odası", name: "VİP Bakım Odası — Özel Uzman", avatar: "✨" },
];

export default function SelfBookingPage() {
  const params = useParams();
  const tenantSlug = (params?.tenantSlug as string) || "demo-salon";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [tenant, setTenant] = useState<Partial<Tenant>>({
    name: "GlowDesk Güzellik & Bakım Salonu",
    slug: tenantSlug,
    settings: {
      address: "Nişantaşı, Abdi İpekçi Cad. No: 42, İstanbul",
      phone: "+90 (212) 555 0199",
      rating: 4.9,
    },
  });

  // Form selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"on_site" | "deposit">("deposit");

  // Customer contact info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingRef, setBookingRef] = useState<string>("");

  useEffect(() => {
    const fetchTenantAndServices = async () => {
      try {
        const { apiRequest } = await import("@/lib/api-client");
        
        // 1. Fetch Tenant info by slug
        const { data: tenantData } = await apiRequest<any>(`/tenants/public/by-slug/${tenantSlug}`);
        if (tenantData) {
          setTenant({
            id: tenantData.id,
            name: tenantData.name,
            slug: tenantData.slug,
            sector: tenantData.sector,
            settings: {
              address: tenantData.address || `${tenantData.district || 'Merkez'}, ${tenantData.city || 'İstanbul'}`,
              phone: tenantData.phone || "+90 (555) 000 0000",
              rating: tenantData.rating || 4.9,
            },
          });

          // 2. Fetch Tenant's Services
          const { data: dbSvcs } = await apiRequest<any[]>(`/services/public/${tenantData.id}`);
          if (dbSvcs && Array.isArray(dbSvcs) && dbSvcs.length > 0) {
            setServices(
              dbSvcs.map((s) => ({
                id: s.id,
                tenant_id: s.tenant_id,
                name: s.name,
                price: parseFloat(s.price || 0),
                duration_minutes: s.duration_minutes || 30,
                created_at: s.created_at || new Date().toISOString(),
              }))
            );
          } else {
            // Fallback default services for demo tenant
            setServices([
              { id: "s1", tenant_id: tenantData.id, name: "Standart Randevu & Seans", duration_minutes: 30, price: 500, created_at: "" },
              { id: "s2", tenant_id: tenantData.id, name: "VIP Danışmanlık & Hizmet", duration_minutes: 60, price: 1000, created_at: "" },
            ]);
          }
        }
      } catch (err) {
        console.error("Booking data fetch error:", err);
      }
    };

    fetchTenantAndServices();
  }, [tenantSlug]);

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { apiRequest } = await import("@/lib/api-client");
      const refCode = `GLOW-${Math.floor(100000 + Math.random() * 900000)}`;

      await apiRequest<any>("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant.id || tenantSlug,
          service_id: selectedService?.id,
          customer_name: fullName,
          customer_phone: phone,
          appointment_date: selectedDate,
          start_time: `${selectedTime}:00`,
          end_time: `${selectedTime}:45`,
          notes: `[Online Self-Booking] - ${notes} (${selectedStaff}) - Ref: ${refCode} - Ödeme: ${paymentOption === "deposit" ? "Depozito Provizyonu Alındı" : "Yerinde Ödeme"}`,
          total_price: selectedService?.price || 0,
        }),
      });

      setBookingRef(refCode);
      setStep(5); // Success step
    } catch (err) {
      console.error("Self booking error:", err);
      alert("Randevu oluşturulurken bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              G
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight">{tenant.name}</h1>
              <p className="text-xs text-slate-400">{tenant.settings?.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-extrabold">
            <span>★</span>
            <span>{tenant.settings?.rating}</span>
          </div>
        </div>
      </header>

      {/* Main Booking Stepper Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        {/* Progress Bar */}
        {step <= 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-extrabold text-slate-400 mb-2">
              <span className={step >= 1 ? "text-indigo-400" : ""}>1. Hizmet</span>
              <span className={step >= 2 ? "text-indigo-400" : ""}>2. Uzman</span>
              <span className={step >= 3 ? "text-indigo-400" : ""}>3. Zaman</span>
              <span className={step >= 4 ? "text-indigo-400" : ""}>4. Onay</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">Hangi Hizmeti Almak İstersiniz?</h2>
              <p className="text-slate-400 text-xs mt-1">Lütfen almak istediğiniz randevu hizmetini seçin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                    selectedService?.id === svc.id
                      ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl"
                      : "bg-slate-850/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-white text-base">{svc.name}</h3>
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ₺{svc.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>⏱ {svc.duration_minutes} Dakika</span>
                    <span>✨ Hijyenik & VIP</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-all mt-4"
            >
              Devam Et: Uzman Seçimi ➔
            </button>
          </div>
        )}

        {/* Step 2: Select Staff */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">Uzman / Koltuk Tercihiniz</h2>
              <p className="text-slate-400 text-xs mt-1">
                Seçilen Hizmet: <strong className="text-indigo-400">{selectedService?.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {STAFF_OPTIONS.map((stf) => (
                <div
                  key={stf.id}
                  onClick={() => setSelectedStaff(stf.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStaff === stf.id
                      ? "bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40"
                      : "bg-slate-850/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{stf.avatar}</span>
                    <span className="font-extrabold text-sm text-white">{stf.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Müsait</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
              >
                ◀ Geri
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all"
              >
                Devam Et: Tarih & Saat ➔
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Picker */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">Tarih ve Saat Seçimi</h2>
              <p className="text-slate-400 text-xs mt-1">Size en uygun randevu saatini belirleyin.</p>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Tarih Seçin</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white font-extrabold text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Time Slot Matrix */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Müsait Saatler</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-3 px-2 rounded-xl text-xs font-extrabold font-mono transition-all border ${
                      selectedTime === slot
                        ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/30 scale-105"
                        : "bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
              >
                ◀ Geri
              </button>
              <button
                disabled={!selectedTime}
                onClick={() => setStep(4)}
                className="w-2/3 py-3.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 hover:opacity-95 transition-all"
              >
                Devam Et: İletişim & Onay ➔
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Contact Info & Confirmation */}
        {step === 4 && (
          <form onSubmit={handleConfirmBooking} className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white">İletişim & Randevu Onayı</h2>
              <p className="text-slate-400 text-xs mt-1">Randevu detaylarınızı kontrol edip bilgilerinizi tamamlayın.</p>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Hizmet:</span>
                <strong className="text-white font-extrabold">{selectedService?.name}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Uzman:</span>
                <strong className="text-indigo-400 font-extrabold">{selectedStaff}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tarih & Saat:</span>
                <strong className="text-cyan-400 font-mono font-bold">{selectedDate} / {selectedTime}</strong>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-indigo-500/20 pt-2">
                <span>Toplam Ücret:</span>
                <strong className="text-emerald-400 font-mono text-sm font-black">₺{selectedService?.price}</strong>
              </div>
            </div>

            {/* Contact Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Adınız Soyadınız *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Cep Telefonunuz (SMS Onayı İçin) *</label>
                <input
                  type="tel"
                  required
                  placeholder="Örn: 0555 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">E-posta Adresi (İsteğe Bağlı)</label>
                <input
                  type="email"
                  placeholder="ahmet@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Ödeme Seçeneği</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("deposit")}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      paymentOption === "deposit"
                        ? "bg-indigo-950/60 border-indigo-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <div>💳 Depozitolu Provizyon (Önerilen)</div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-normal">₺100 ön onay - No-Show garantisi</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption("on_site")}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      paymentOption === "on_site"
                        ? "bg-indigo-950/60 border-indigo-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}
                  >
                    <div>🏠 Salon Kapısında Ödeme</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-normal">Nakit veya Kredi Kartı</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 py-4 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
              >
                ◀ Geri
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-4 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-xl shadow-emerald-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Randevu Kaydediliyor..." : "✓ Randevumu Onayla"}
              </button>
            </div>
          </form>
        )}

        {/* Step 5: Success Screen */}
        {step === 5 && (
          <div className="text-center py-12 space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/20">
              ✓
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Randevunuz Başarıyla Alındı!</h2>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Randevu onay detayınız SMS ve E-posta olarak gönderilmiştir.
              </p>
            </div>

            <div className="max-w-sm mx-auto p-6 bg-slate-800/90 border border-slate-700 rounded-2xl text-left space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Referans Kodu:</span>
                <span className="font-mono font-black text-indigo-400 tracking-wider">{bookingRef}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Müşteri:</span>
                <span className="font-extrabold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hizmet:</span>
                <span className="font-extrabold text-white">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tarih & Saat:</span>
                <span className="font-mono font-bold text-cyan-400">{selectedDate} / {selectedTime}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setSelectedService(null);
                setSelectedTime("");
              }}
              className="px-8 py-3.5 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 transition-all"
            >
              Yeni Randevu Al
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        Powered by <strong className="text-slate-400">GlowDesk Multi-Tenant Infrastructure</strong>
      </footer>
    </div>
  );
}
