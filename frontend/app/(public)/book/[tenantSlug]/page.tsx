"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { apiRequest } from "@/lib/api-client";

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

  // Validation States
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  // Phone Auto-Formatter (05XX XXX XX XX)
  const handlePhoneChange = (val: string) => {
    let raw = val.replace(/\D/g, "");
    if (raw.length > 0) {
      if (!raw.startsWith("0") && raw.startsWith("5")) {
        raw = "0" + raw;
      }
      raw = raw.slice(0, 11);
      let formatted = raw;
      if (raw.length > 4 && raw.length <= 7) {
        formatted = `${raw.slice(0, 4)} ${raw.slice(4)}`;
      } else if (raw.length > 7 && raw.length <= 9) {
        formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
      } else if (raw.length > 9) {
        formatted = `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7, 9)} ${raw.slice(9)}`;
      }
      setPhone(formatted);
    } else {
      setPhone("");
    }
  };

  const isPhoneValid = (p: string) => {
    const digits = p.replace(/\D/g, "");
    return digits.length === 11 && digits.startsWith("05");
  };

  const isFullNameValid = (name: string) => {
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    return trimmed.length >= 3 && parts.length >= 2 && parts.every((p) => p.length >= 2);
  };

  const isFormValid = isFullNameValid(fullName) && isPhoneValid(phone);

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
    setFullNameTouched(true);
    setPhoneTouched(true);

    if (!tenant) return;

    if (!isFormValid) {
      if (!isFullNameValid(fullName)) {
        setErrorMessage("Lütfen adınızı ve soyadınızı eksiksiz giriniz (En az 2 kelime).");
      } else if (!isPhoneValid(phone)) {
        setErrorMessage("Lütfen geçerli bir Türkiye cep telefonu numarası giriniz (05XX XXX XX XX formatında).");
      }
      return;
    }

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
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">İşletme Bilgileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !tenant) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-layered">
          <div className="text-5xl">⚠️</div>
          <h2 className="text-2xl font-black font-display text-slate-900">İşletme Bulunamadı</h2>
          <p className="text-xs text-slate-500">{errorMessage}</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* ── MAIN CONTENT STEPPER ── */}
      <main className="pt-28 pb-20 max-w-3xl w-full mx-auto px-4 flex-1">
        
        {/* Sub Header Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-layered mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/isletme/${tenant?.slug}`}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-sm font-bold transition-colors"
              title="İşletme Profiline Git"
            >
              ←
            </Link>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight font-display">{tenant?.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span>📍</span>
                <span>{tenant?.address || `${tenant?.district || ''}, ${tenant?.city || 'İstanbul'}`}</span>
              </p>
            </div>
          </div>

          <Link
            href={`/isletme/${tenant?.slug}`}
            className="px-3 py-1.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-xs font-bold hover:bg-[#0066FF] hover:text-white transition-colors"
          >
            🏬 Profili İncele
          </Link>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Stepper Progress Indicator */}
        {step <= 4 && (
          <div className="mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex justify-between text-xs font-extrabold text-slate-400 mb-2">
              <span className={step >= 1 ? "text-[#0066FF]" : ""}>1. Hizmet</span>
              <span className={step >= 2 ? "text-[#0066FF]" : ""}>2. Uzman</span>
              <span className={step >= 3 ? "text-[#0066FF]" : ""}>3. Tarih & Saat</span>
              <span className={step >= 4 ? "text-[#0066FF]" : ""}>4. Onay</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-[#0066FF] transition-all duration-500 rounded-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1: HİZMET SEÇİMİ ── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-extrabold text-[#0066FF] uppercase tracking-wider">Adım 1 / 4</span>
              <h2 className="text-2xl font-black text-slate-900 font-display mt-1">Hangi Hizmeti Almak İstersiniz?</h2>
              <p className="text-slate-500 text-xs mt-1">Lütfen almak istediğiniz randevu seansını seçin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 relative ${
                      isSelected
                        ? "bg-blue-50/80 border-[#0066FF] ring-2 ring-blue-500/30 shadow-md scale-[1.01]"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-slate-900 text-base font-display">{svc.name}</h3>
                      <span className="text-xs font-mono font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₺{svc.price}
                      </span>
                    </div>

                    {svc.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{svc.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        ⏱ {svc.duration_minutes} Dakika
                      </span>
                      <span className="text-[#0066FF] font-bold">✨ Anında Onay</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="w-full py-4 rounded-2xl font-extrabold text-sm btn-primary-blue shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all mt-4 cursor-pointer"
            >
              Devam Et: Uzman Seçimi ➔
            </button>
          </div>
        )}

        {/* ── STEP 2: GERÇEK UZMAN SEÇİMİ ── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-extrabold text-[#0066FF] uppercase tracking-wider">Adım 2 / 4</span>
              <h2 className="text-2xl font-black text-slate-900 font-display mt-1">Uzman / Kadro Tercihi</h2>
              <p className="text-slate-500 text-xs mt-1">
                Seçilen Hizmet: <strong className="text-[#0066FF] font-bold">{selectedService?.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {/* Option: Any Available Staff */}
              <div
                onClick={() => setSelectedStaffId("any")}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedStaffId === "any"
                    ? "bg-blue-50/80 border-[#0066FF] ring-2 ring-blue-500/30"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0066FF] flex items-center justify-center font-bold text-lg border border-blue-200">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">En Hızlı Müsait Seans (Fark Etmez)</h3>
                    <p className="text-[11px] text-slate-500">En erken müsait uzmana otomatik atanır.</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
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
                      ? "bg-blue-50/80 border-[#0066FF] ring-2 ring-blue-500/30"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0066FF] font-extrabold text-sm flex items-center justify-center border border-slate-200">
                      👤
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{stf.fullName}</h3>
                      <p className="text-[11px] text-slate-500">{stf.title || "İşletme Uzmanı"}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Müsait
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 rounded-2xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ◀ Geri
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 py-4 rounded-2xl font-extrabold text-xs btn-primary-blue shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all cursor-pointer"
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
              <span className="text-xs font-extrabold text-[#0066FF] uppercase tracking-wider">Adım 3 / 4</span>
              <h2 className="text-2xl font-black text-slate-900 font-display mt-1">Tarih ve Saat Seçimi</h2>
              <p className="text-slate-500 text-xs mt-1">Size en uygun randevu zamanını belirleyin.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-6">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-2">Tarih Seçin</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-[#0066FF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-2">Müsait Saatler</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3 px-2 rounded-xl text-xs font-extrabold font-mono transition-all border cursor-pointer ${
                        selectedTime === slot
                          ? "bg-[#0066FF] border-[#0066FF] text-white shadow-md shadow-blue-500/25 scale-105"
                          : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-4 rounded-2xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ◀ Geri
              </button>
              <button
                type="button"
                disabled={!selectedTime}
                onClick={() => setStep(4)}
                className="w-2/3 py-4 rounded-2xl font-extrabold text-xs btn-primary-blue shadow-lg shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95 transition-all cursor-pointer"
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
              <span className="text-xs font-extrabold text-[#0066FF] uppercase tracking-wider">Adım 4 / 4</span>
              <h2 className="text-2xl font-black text-slate-900 font-display mt-1">İletişim & Randevu Onayı</h2>
              <p className="text-slate-500 text-xs mt-1">Bilgilerinizi girin, randevunuz doğrudan işletme takvimine işlensin.</p>
            </div>

            {/* Summary Box */}
            <div className="p-6 rounded-3xl bg-blue-50/80 border border-blue-200 space-y-3 text-xs shadow-layered">
              <div className="flex justify-between items-center text-slate-700">
                <span>İşletme:</span>
                <strong className="text-slate-900 font-bold">{tenant?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Seçilen Hizmet:</span>
                <strong className="text-[#0066FF] font-bold">{selectedService?.name}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Uzman Kadro:</span>
                <strong className="text-[#1E1B4B] font-bold">
                  {selectedStaffObj ? selectedStaffObj.fullName : "En Hızlı Müsait Seans"}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Tarih & Saat:</span>
                <strong className="text-slate-900 font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  {selectedDate} / {selectedTime}
                </strong>
              </div>
              <div className="flex justify-between items-center text-slate-700 border-t border-blue-200 pt-3">
                <span className="font-bold text-slate-900">Toplam Hizmet Tutarı:</span>
                <strong className="text-emerald-600 font-mono text-base font-black">₺{selectedService?.price}</strong>
              </div>
            </div>

            {/* Contact Form Fields */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-layered space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-600">Adınız Soyadınız *</label>
                  {fullNameTouched && isFullNameValid(fullName) && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">✓ Geçerli Ad Soyad</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ömer Faruk Uysal"
                  value={fullName}
                  onBlur={() => setFullNameTouched(true)}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full p-4 rounded-2xl bg-slate-50 border text-slate-900 text-sm font-semibold focus:outline-none transition-all ${
                    fullNameTouched && !isFullNameValid(fullName)
                      ? "border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-50/30"
                      : isFullNameValid(fullName)
                      ? "border-emerald-500/60 bg-emerald-50/20"
                      : "border-slate-200 focus:border-[#0066FF]"
                  }`}
                />
                {fullNameTouched && !isFullNameValid(fullName) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    ⚠️ Lütfen adınızı ve soyadınızı aralarında boşluk olacak şekilde eksiksiz girin.
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-extrabold uppercase text-slate-600">Cep Telefonunuz (WhatsApp Teyidi İçin) *</label>
                  {phoneTouched && isPhoneValid(phone) && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">✓ Geçerli Telefon</span>
                  )}
                </div>
                <input
                  type="tel"
                  required
                  placeholder="Örn: 0555 123 45 67"
                  value={phone}
                  onBlur={() => setPhoneTouched(true)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full p-4 rounded-2xl bg-slate-50 border text-slate-900 text-sm font-mono font-semibold focus:outline-none transition-all ${
                    phoneTouched && !isPhoneValid(phone)
                      ? "border-rose-500/80 ring-2 ring-rose-500/20 bg-rose-50/30"
                      : isPhoneValid(phone)
                      ? "border-emerald-500/60 bg-emerald-50/20"
                      : "border-slate-200 focus:border-[#0066FF]"
                  }`}
                />
                {phoneTouched && !isPhoneValid(phone) && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    ⚠️ Lütfen 05XX ile başlayan 11 haneli geçerli bir cep telefonu numarası girin.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Özel Notunuz (İsteğe Bağlı)</label>
                <input
                  type="text"
                  placeholder="Örn: İlk defa geliyorum / Hassas cilt bakımı ricası"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#0066FF] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-600 mb-1.5">Ödeme / Tahsilat Seçeneği</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption("on_site")}
                    className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      paymentOption === "on_site"
                        ? "bg-blue-50/90 border-[#0066FF] text-slate-900 ring-2 ring-blue-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 text-sm">🏠 İşletmede Tahsilat</div>
                    <div className="text-[11px] text-slate-500 mt-1 font-normal">Nakit, POS veya Kredi Kartı</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption("deposit")}
                    className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      paymentOption === "deposit"
                        ? "bg-blue-50/90 border-[#0066FF] text-slate-900 ring-2 ring-blue-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 text-sm">💳 Kapara & Provizyon</div>
                    <div className="text-[11px] text-emerald-600 mt-1 font-normal">No-Show Koruması Onaylı</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 py-4 rounded-2xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                ◀ Geri
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-4 rounded-2xl font-black text-sm btn-primary-blue shadow-xl shadow-blue-500/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
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
          <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-layered">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center text-4xl mx-auto shadow-lg">
              ✓
            </div>
            
            <div className="space-y-2">
              <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                ● Gerçek Veritabanı Kaydı Başarılı
              </span>
              <h2 className="text-3xl font-black text-slate-900 font-display">Randevunuz Takvime İşlendi!</h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {tenant?.name} yönetim paneline ve canlı takvimine randevunuz başarıyla kaydedilmiştir.
              </p>
            </div>

            <div className="max-w-md mx-auto p-6 bg-slate-50 border border-slate-200 rounded-3xl text-left space-y-3.5 shadow-xs">
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Referans Kodu</span>
                <span className="font-mono font-black text-[#0066FF] text-sm bg-white px-3 py-1 rounded-xl border border-slate-200 tracking-wider">
                  {bookingRef}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">İşletme:</span>
                <span className="font-extrabold text-slate-900">{tenant?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Müşteri:</span>
                <span className="font-extrabold text-slate-900">{fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Telefon:</span>
                <span className="font-mono font-bold text-slate-800">{phone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Hizmet:</span>
                <span className="font-extrabold text-[#0066FF]">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tarih & Saat:</span>
                <span className="font-mono font-bold text-emerald-600">{selectedDate} / {selectedTime}</span>
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
                className="px-6 py-3.5 rounded-2xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                + Başka Randevu Al
              </button>
              <Link
                href="/explore"
                className="px-6 py-3.5 rounded-2xl font-extrabold text-xs btn-primary-blue shadow-md hover:scale-105 transition-all cursor-pointer inline-block"
              >
                🔍 İşletmeleri Keşfet →
              </Link>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
