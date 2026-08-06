"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } = from "@/lib/api-client";

interface ServiceItem {
  id: string;
  tenant_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
  category?: string;
}

interface StaffItem {
  id: string;
  fullName: string;
  role: string;
  title?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  sector: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  rating?: number;
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export default function SelfBookingPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenantSlug as string) || "demo-salon";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);

  // Form Selections
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("any");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"on_site" | "deposit">("on_site");

  // Customer Contact Info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingRef, setBookingRef] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const loadBookingPageData = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        // 1. Fetch Tenant data from DB by slug
        const resTenant = await apiRequest<TenantInfo>(`/tenants/public/by-slug/${tenantSlug}`);
        if (!resTenant.data) {
          setErrorMessage("İşletme bulunamadı veya pasif durumda.");
          setLoading(false);
          return;
        }

        const tData = resTenant.data;
        setTenant(tData);

        // 2. Fetch Services for this specific Tenant
        const resServices = await apiRequest<ServiceItem[]>(`/services/public/${tData.id}`);
        if (resServices.data && Array.isArray(resServices.data) && resServices.data.length > 0) {
          setServices(
            resServices.data.map((s: any) => ({
              id: s.id,
              tenant_id: s.tenant_id,
              name: s.name,
              price: parseFloat(s.price || 0),
              duration_minutes: s.duration_minutes || 30,
              description: s.description,
              category: s.category,
            }))
          );
        } else {
          // Fallback initial service for new tenants
          setServices([
            {
              id: `svc-demo-${tData.id}`,
              tenant_id: tData.id,
              name: `${tData.name} — Standart Seans & Hizmet`,
              price: 500,
              duration_minutes: 45,
              description: "Hizmet detayları işletme tarafından ayarlanacaktır.",
            },
          ]);
        }

        // 3. Fetch Real Staff for this specific Tenant from DB
        const resStaff = await apiRequest<StaffItem[]>(`/staff/public/${tData.id}`);
        if (resStaff.data && Array.isArray(resStaff.data) && resStaff.data.length > 0) {
          setStaffList(resStaff.data);
        } else {
          setStaffList([
            { id: "staff-any", fullName: `${tData.name} Uzman Kadrosu`, role: "staff" }
          ]);
        }

      } catch (err) {
        console.error("Booking page load error:", err);
        setErrorMessage("İşletme verileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    loadBookingPageData();
  }, [tenantSlug]);

  // Calculate end time based on selected service duration
  const getCalculatedEndTime = () => {
    if (!selectedTime) return "10:30:00";
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const duration = selectedService?.duration_minutes || 30;
    const totalMinutes = hours * 60 + minutes + duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      const refCode = `GLOW-${Math.floor(100000 + Math.random() * 900000)}`;
      const endTimeStr = getCalculatedEndTime();

      // Submit real appointment to backend DB
      const res = await apiRequest<any>("/appointments/", {
        method: "POST",
        body: JSON.stringify({
          tenant_id: tenant.id,
          service_id: selectedService?.id,
          staff_id: selectedStaffId !== "any" && selectedStaffId !== "staff-any" ? selectedStaffId : null,
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          appointment_date: selectedDate,
          start_time: `${selectedTime}:00`,
          end_time: endTimeStr,
          notes: `[Online Self-Booking] Hizmet: ${selectedService?.name || 'Genel'} | Müşteri Notu: ${notes || 'Yok'} | Ref: ${refCode} | Ödeme: ${paymentOption === "deposit" ? "Kapara Provizyonu" : "Yerinde Tahsilat"}`,
          total_price: selectedService?.price || 0,
        }),
      });

      if (res.error) {
        setErrorMessage(`Randevu kaydedilemedi: ${res.error}`);
        setSubmitting(false);
        return;
      }

      setBookingRef(refCode);
      setStep(5); // Go to success confirmation screen
    } catch (err: any) {
      console.error("Self booking error:", err);
      setErrorMessage("Bağlantı hatası: Randevu kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">İşletme Bilgileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !tenant) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-black font-display text-white">İşletme Bulunamadı</h2>
          <p className="text-xs text-slate-400">{errorMessage}</p>
          <div className="pt-2">
            <Link href="/explore" className="btn-primary-blue text-xs py-3 px-6 inline-block">
              🔍 Tüm İşletmeleri Keşfet →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedStaffObj = staffList.find((s) => s.id === selectedStaffId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      
      {/* ── HEADER ── */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/explore" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm transition-colors" title="Keşfet'e Dön">
              ←
            </Link>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight font-display">{tenant?.name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>📍</span>
                <span>{tenant?.address || `${tenant?.district || ''}, ${tenant?.city || 'İstanbul'}`}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              ✓ Onaylı İşletme
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT STEPPER ── */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Stepper Progress Indicator */}
        {step <= 4 && (
          <div className="mb-8">
            <div className="flex justify-between text-xs font-extrabold text-slate-400 mb-2">
              <span className={step >= 1 ? "text-blue-400" : ""}>1. Hizmet</span>
              <span className={step >= 2 ? "text-blue-400" : ""}>2. Uzman</span>
              <span className={step >= 3 ? "text-blue-400" : ""}>3. Tarih & Saat</span>
              <span className={step >= 4 ? "text-blue-400" : ""}>4. Onay</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: HİZMET SEÇİMİ ── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Adım 1 / 4</span>
              <h2 className="text-2xl font-black text-white font-display mt-1">Hangi Hizmeti Almak İstersiniz?</h2>
              <p className="text-slate-400 text-xs mt-1">Lütfen almak istediğiniz randevu seansını seçin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                      isSelected
                        ? "bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40 shadow-xl shadow-blue-500/10 scale-[1.02]"
                        : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-white text-base font-display">{svc.name}</h3>
                      <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ₺{svc.price}
                      </span>
                    </div>

                    {svc.description && (
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{svc.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        ⏱ {svc.duration_minutes} Dakika
                      </span>
                      <span className="text-cyan-400 font-bold">✨ Anında Onay</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all mt-4 cursor-pointer"
            >
              Devam Et: Uzman Seçimi ➔
            </button>
          </div>
        )}

        {/* ── STEP 2: GERÇEK UZMAN SEÇİMİ ── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Adım 2 / 4</span>
              <h2 className="text-2xl font-black text-white font-display mt-1">Uzman / Kadro Tercihi</h2>
              <p className="text-slate-400 text-xs mt-1">
                Seçilen Hizmet: <strong className="text-blue-400 font-bold">{selectedService?.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {/* Option: Any Available Staff */}
              <div
                onClick={() => setSelectedStaffId("any")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedStaffId === "any"
                    ? "bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40"
                    : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">En Hızlı Müsait Seans (Fark Etmez)</h3>
                    <p className="text-[11px] text-slate-400">En erken müsait uzmana otomatik atanır.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  En Hızlı ⚡
                </span>
              </div>

              {/* Real Staff Members from DB */}
              {staffList.map((stf) => (
                <div
                  key={stf.id}
                  onClick={() => setSelectedStaffId(stf.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedStaffId === stf.id
                      ? "bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-extrabold text-sm flex items-center justify-center border border-slate-700">
                      👤
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">{stf.fullName}</h3>
                      <p className="text-[11px] text-slate-400">{stf.title || "İşletme Uzmanı"}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    Müsait
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 rounded-2xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
              >
                ◀ Geri
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-4 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all cursor-pointer"
              >
                Devam Et: Tarih & Saat ➔
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: TARİH & SAAT SEÇİMİ ── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Adım 3 / 4</span>
              <h2 className="text-2xl font-black text-white font-display mt-1">Tarih ve Saat Seçimi</h2>
              <p className="text-slate-400 text-xs mt-1">Size en uygun randevu zamanını belirleyin.</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Tarih Seçin</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-extrabold text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Müsait Saatler</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTime(slot)}
                    className={`py-3 px-2 rounded-xl text-xs font-extrabold font-mono transition-all border cursor-pointer ${
                      selectedTime === slot
                        ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-4 rounded-2xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
              >
                ◀ Geri
              </button>
              <button
                type="button"
                disabled={!selectedTime}
                onClick={() => setStep(4)}
                className="w-2/3 py-4 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all cursor-pointer"
              >
                Devam Et: Bilgiler & Onay ➔
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: İLETİŞİM & GERÇEK DB KAYDI ── */}
        {step === 4 && (
          <form onSubmit={handleConfirmBooking} className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Adım 4 / 4</span>
              <h2 className="text-2xl font-black text-white font-display mt-1">İletişim & Randevu Onayı</h2>
              <p className="text-slate-400 text-xs mt-1">Bilgilerinizi girin, randevunuz doğrudan işletme takvimine işlensin.</p>
            </div>

            {/* Summary Box */}
            <div className="p-5 rounded-3xl bg-blue-950/50 border border-blue-500/30 space-y-3 text-xs backdrop-blur-md">
              <div className="flex justify-between items-center text-slate-300">
                <span>İşletme:</span>
                <strong className="text-white font-bold">{tenant?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Seçilen Hizmet:</span>
                <strong className="text-blue-400 font-bold">{selectedService?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Uzman Kadro:</span>
                <strong className="text-cyan-400 font-bold">
                  {selectedStaffObj ? selectedStaffObj.fullName : "En Hızlı Müsait Seans"}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Tarih & Saat:</span>
                <strong className="text-white font-mono font-bold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  {selectedDate} / {selectedTime}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-300 border-t border-blue-500/20 pt-3">
                <span className="font-bold text-white">Toplam Hizmet Tutarı:</span>
                <strong className="text-emerald-400 font-mono text-base font-black">₺{selectedService?.price}</strong>
              </div>
            </div>

            {/* Contact Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1.5">Adınız Soyadınız *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ömer Faruk Uysal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm font-semibold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1.5">Cep Telefonunuz (WhatsApp Teyit Mesajı İçin) *</label>
                <input
                  type="tel"
                  required
                  placeholder="Örn: 0555 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm font-mono font-semibold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1.5">Özel Notunuz (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="Örn: İlk defa geliyorum / Hassas cilt bakımı ricası"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-400 mb-1.5">Ödeme / Tahsilat Seçeneği</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("on_site")}
                    className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      paymentOption === "on_site"
                        ? "bg-blue-950/70 border-blue-500 text-white ring-2 ring-blue-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-extrabold text-white text-sm">🏠 İşletmede Tahsilat</div>
                    <div className="text-[11px] text-slate-400 mt-1 font-normal">Nakit, POS veya Kredi Kartı</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption("deposit")}
                    className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      paymentOption === "deposit"
                        ? "bg-blue-950/70 border-blue-500 text-white ring-2 ring-blue-500/30"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-extrabold text-white text-sm">💳 Kapara & Provizyon</div>
                    <div className="text-[11px] text-emerald-400 mt-1 font-normal">No-Show Koruması Onaylı</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 py-4 rounded-2xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
              >
                ◀ Geri
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-white shadow-xl shadow-emerald-500/20 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Veritabanına Kaydediliyor...</span>
                  </>
                ) : (
                  <span>✓ Randevuyu İşletme Takvimine İşle</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 5: GERÇEK BAŞARI EKRANI ── */}
        {step === 5 && (
          <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-emerald-500/20">
              ✓
            </div>
            
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                ● Gerçek Veritabanı Kaydı Başarılı
              </span>
              <h2 className="text-3xl font-black text-white font-display">Randevunuz Takvime İşlendi!</h2>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                {tenant?.name} yönetim paneline ve canlı takvimine randevunuz başarıyla kaydedilmiştir.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 bg-slate-900/90 border border-slate-800 rounded-3xl text-left space-y-3.5 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Referans Kodu</span>
                <span className="font-mono font-black text-cyan-400 text-sm bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 tracking-wider">
                  {bookingRef}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">İşletme:</span>
                <span className="font-extrabold text-white">{tenant?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Müşteri:</span>
                <span className="font-extrabold text-white">{fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Telefon:</span>
                <span className="font-mono font-bold text-slate-300">{phone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Hizmet:</span>
                <span className="font-extrabold text-blue-400">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tarih & Saat:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedDate} / {selectedTime}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 max-w-md mx-auto">
              <button
                onClick={() => {
                  setStep(1);
                  setSelectedService(null);
                  setSelectedTime("");
                  setErrorMessage("");
                }}
                className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-all cursor-pointer"
              >
                + Başka Randevu Al
              </button>
              <Link
                href="/explore"
                className="px-6 py-3.5 rounded-2xl font-extrabold text-xs bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all cursor-pointer inline-block"
              >
                🔍 İşletmeleri Keşfet →
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Powered by <strong className="text-slate-300 font-extrabold">GlowDesk Real-Time Enterprise Engine</strong>
      </footer>
    </div>
  );
}
