"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSession, setSessionCookie, type UserRole } from "@/lib/session";
import { isValidEmail, sanitizeText, toSlug, checkPasswordStrength } from "@/lib/sanitize";
import { TURKEY_CITIES } from "@/lib/cities";

const SECTORS = [
  { id: "legal", label: "Hukuk & Danışmanlık", icon: "⚖️", desc: "Avukatlık & Danışmanlık Bürosu" },
  { id: "clinic", label: "Klinik & Poliklinik", icon: "🩺", desc: "Diş, Medikal Estetik & Sağlık" },
  { id: "beauty", label: "Güzellik & Bakım", icon: "💄", desc: "Güzellik Salonu & Estetik" },
  { id: "barber", label: "Berber & Erkek Kuaförü", icon: "💈", desc: "Erkek Kuaförü & Sakal Tasarımı" },
  { id: "spa", label: "Masaj & Spa", icon: "💆", desc: "Wellness, Terapi & Spa" },
  { id: "auto", label: "Oto Bakım & Detailing", icon: "🚗", desc: "Oto Servis, Lift & Detailing" },
  { id: "fitness", label: "Fitness & Pilates", icon: "💪", desc: "Butik Stüdyo & Pilates" },
  { id: "vet", label: "Veteriner & Pet Care", icon: "🐾", desc: "Klinik & Pet Grooming" },
  { id: "coaching", label: "Özel Ders & Koçluk", icon: "📚", desc: "Eğitim & Danışmanlık" },
  { id: "photo", label: "Fotoğraf Stüdyosu", icon: "📸", desc: "Çekim Platoları & Ekipman" },
  { id: "coworking", label: "Toplantı Odası & Coworking", icon: "🏢", desc: "Ortak Çalışma & Plaza" },
  { id: "restoran", label: "Restoran & Kafe", icon: "🍽️", desc: "Masa & Rezervasyon Yönetimi" },
];

const STAFF_OPTIONS = [
  { value: "1 Personel (Yalnızca Ben)", label: "1 Personel", desc: "Yalnızca ben çalışıyorum", icon: "👤" },
  { value: "2-5 Personel", label: "2-5 Ekip Üyesi", desc: "Butik & Küçük Ölçekli Ekip", icon: "👥" },
  { value: "6-10 Personel", label: "6-10 Profesyonel", desc: "Büyüyen Orta Ölçekli İşletme", icon: "🏢" },
  { value: "10+ Personel", label: "10+ Kurumsal", desc: "Çoklu Personel & Şube", icon: "🚀" },
];

const WORKSTATION_OPTIONS = [
  { value: "1-3 Koltuk / Masa", label: "1-3 Koltuk / Masa", desc: "Butik Çalışma Alanı", icon: "🪑" },
  { value: "4-8 Koltuk / Masa", label: "4-8 Koltuk / Masa", desc: "Standart Salon / Restoran", icon: "💈" },
  { value: "9-15 Koltuk / Masa", label: "9-15 Koltuk / Masa", desc: "Geniş Salon / Salon Alanı", icon: "🏨" },
  { value: "15+ Koltuk / Odası", label: "15+ Koltuk / Oda", desc: "Büyük Kompleks & Şube", icon: "🏢" },
];

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Adım 1: İşletme
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [sector, setSector] = useState("beauty");

  // Adım 2: Kapasite
  const [staffCount, setStaffCount] = useState("1 Personel (Yalnızca Ben)");
  const [workstationCount, setWorkstationCount] = useState("1-3 Koltuk / Masa");

  // Adım 3: Adres
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState("");

  // Adım 4: Kullanıcı
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pwStrength = checkPasswordStrength(password);

  const handleBusinessNameChange = (val: string) => {
    const cleaned = sanitizeText(val, 80);
    setBusinessName(cleaned);
    setSlug(toSlug(cleaned));
  };

  const handleGetGPSLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoStatus("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }
    setGeoLocating(true);
    setGeoStatus("Konum alınıyor...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGeoLocating(false);
        setGeoStatus(`📍 GPS Koordinatınız Alındı (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => {
        setGeoLocating(false);
        setGeoStatus("Konum izni alınamadı.");
      }
    );
  };

  const nextStep = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!businessName.trim()) {
        setErrorMsg("Lütfen işletme adını giriniz.");
        return;
      }
    } else if (step === 3) {
      if (!city.trim() || !district.trim() || !neighborhood.trim() || !street.trim()) {
        setErrorMsg("Lütfen İl, İlçe, Mahalle ve Cadde/Sokak bilgilerinin tamamını eksiksiz doldurunuz.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setErrorMsg("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !phone.trim() || !email || !password || !businessName.trim() || !city.trim() || !district.trim() || !neighborhood.trim() || !street.trim()) {
      setErrorMsg("Lütfen Adres (İl, İlçe, Mahalle, Cadde/Sokak) ve Hesap bilgilerinizin tamamını eksiksiz doldurunuz.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMsg("Geçerli bir e-posta adresi girin.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setLoading(true);

    const userId   = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tenantId = `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const cleanName = sanitizeText(fullName, 100);
    const role: UserRole = "owner";

    const userPayload = {
      id: userId, role, fullName: cleanName, email, phone,
      businessName, tenantId, sector, isNewUser: true,
    };

    try {
      const { apiRequest } = await import('@/lib/api-client');
      const { data, error } = await apiRequest('/auth/register/business', {
        method: 'POST',
        body: JSON.stringify({
          businessName,
          ownerName: cleanName,
          email,
          phone,
          password,
          sector,
          city,
          district,
          neighborhood,
          street,
          staffCount,
          workstationCount,
          lat,
          lng,
          address: address.trim() || `${neighborhood} ${street}, ${district}/${city}`
        }),
      });

      if (data && data.token) {
        setSessionCookie(data.token);
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("glowdesk_active_user", JSON.stringify(data.user));
        }

        setLoading(false);
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        } else {
          router.push("/dashboard");
        }
        return;
      }

      if (error) {
        setErrorMsg(error);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Register business error:", err);
      setErrorMsg(err?.message || "Sunucuya ulaşılamadı. Lütfen tekrar deneyiniz.");
      setLoading(false);
    }
  };

  const strengthColors = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "Çok Zayıf", "Zayıf", "Orta", "Güçlü"];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-[#1E293B]">
      {/* Sol Görsel Panel */}
      <div className="hidden md:flex flex-col justify-between w-[440px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500 rounded-full blur-[80px]" />
        </div>
        
        <Link href="/" className="relative z-10">
          <span className="text-3xl font-black font-display tracking-tight text-white">
            Glow<span className="text-cyan-400">Desk</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-extrabold rounded-full">
            <span>✨</span> 1 AY KOŞULSUZ ÜCRETSİZ
          </div>
          <h2 className="text-3xl font-black leading-tight font-display tracking-tight text-white">
            İşletmenizi 3 Dakikada Dijitalleştirin
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            Komisyonsuz randevu kabulü, otomatik WhatsApp hatırlatmaları ve akıllı müşteri yönetimi.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-200 font-semibold bg-white/5 border border-white/10 p-3 rounded-2xl">
              <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold">✓</span>
              <span>Anında hazır Canlı Demo verileri</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200 font-semibold bg-white/5 border border-white/10 p-3 rounded-2xl">
              <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold">✓</span>
              <span>Sıfır komisyon & Sabit fiyat garantisi</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-200 font-semibold bg-white/5 border border-white/10 p-3 rounded-2xl">
              <span className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold">✓</span>
              <span>Kredi kartı gerekmez</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 relative z-10 font-medium">© {new Date().getFullYear()} GlowDesk Platform. Tüm hakları saklıdır.</p>
      </div>

      {/* Sağ Sihirbaz Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 md:px-16 bg-white overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-6">
          
          {/* Üst İlerleme Çubuğu */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
              <span className={step >= 1 ? "text-indigo-600 font-extrabold" : ""}>1. İşletme</span>
              <span className={step >= 2 ? "text-indigo-600 font-extrabold" : ""}>2. Ekip & Kapasite</span>
              <span className={step >= 3 ? "text-indigo-600 font-extrabold" : ""}>3. Adres & Konum</span>
              <span className={step >= 4 ? "text-indigo-600 font-extrabold" : ""}>4. Hesap</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div className={`h-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-500 ${
                step === 1 ? "w-1/4" : step === 2 ? "w-2/4" : step === 3 ? "w-3/4" : "w-full"
              }`} />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
              <span>⚠️</span> <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ADIM 1: İşletme Bilgileri */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">İşletmenizi Tanımlayın</h1>
                  <p className="text-xs text-slate-500 mt-1">İşletmenizin adı ve hizmet alanınızı seçin.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">İşletme Adı *</label>
                    <input
                      type="text" required
                      placeholder="ör. TRAX Barber & Studio"
                      value={businessName}
                      onChange={(e) => handleBusinessNameChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Sektör / Hizmet Alanı *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {SECTORS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSector(s.id)}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            sector === s.id
                              ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold shadow-sm"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <span className="text-2xl mb-1">{s.icon}</span>
                          <div>
                            <p className="text-xs font-extrabold leading-snug">{s.label}</p>
                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1 mt-0.5">{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">İşletme Web Adresi (Slug)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs text-slate-400 font-semibold font-mono pointer-events-none">glowdesk.com/salon/</span>
                      <input
                        type="text" required
                        placeholder="trax-barber"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full pl-[150px] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-indigo-600 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Devam Et: Ekip & Kapasite</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* ADIM 2: Kapasite ve Ekip */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">Ekip ve Kapasite Yapısı</h1>
                  <p className="text-xs text-slate-500 mt-1">İşletmenizin ölçeğini ve hizmet kapasitesini belirleyin.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">👥 Kaç Personel / Çalışan Var?</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {STAFF_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStaffCount(opt.value)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            staffCount === opt.value
                              ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{opt.icon}</span>
                            <span className="text-xs font-extrabold">{opt.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">🪑 Kaç Koltuk / Masa / Bakım Odası Var?</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {WORKSTATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setWorkstationCount(opt.value)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            workstationCount === opt.value
                              ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{opt.icon}</span>
                            <span className="text-xs font-extrabold">{opt.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                  >
                    ← Geri
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Devam Et: Adres & Konum</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 3: Adres ve Konum */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">Net Adres ve Konum</h1>
                  <p className="text-xs text-slate-500 mt-1">Müşterilerinizin sizi haritada kolayca bulması için konum detayları.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Şehir (İl) *</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-600"
                      >
                        {TURKEY_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">İlçe *</label>
                      <input
                        type="text" required
                        placeholder="ör. Kadıköy"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Mahalle *</label>
                      <input
                        type="text" required
                        placeholder="ör. Caferağa Mah."
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Cadde / Sokak & No *</label>
                      <input
                        type="text" required
                        placeholder="ör. Moda Cad. No:42"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Tam Açık Adres / Yol Tarifi *</label>
                    <textarea
                      rows={2} required
                      placeholder="Moda Caddesi üzeri, İş Bankası karşısı..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-600 resize-none"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleGetGPSLocation}
                      disabled={geoLocating}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-50 to-cyan-50 hover:from-indigo-100 hover:to-cyan-100 border border-indigo-200/80 rounded-xl text-xs font-bold text-indigo-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="animate-pulse">📌</span>
                      <span>{geoLocating ? "GPS Alınıyor..." : "Mevcut Konumumu Haritaya Ekle (GPS Otomatik)"}</span>
                    </button>
                    {geoStatus && (
                      <p className="mt-1.5 text-[11px] font-bold text-emerald-600 text-center">{geoStatus}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                  >
                    ← Geri
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Devam Et: Yönetici Hesabı</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}

            {/* ADIM 4: Hesap Bilgileri */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">Hesabınızı Tamamlayın</h1>
                  <p className="text-xs text-slate-500 mt-1">Yönetici paneline giriş yapacağınız hesap bilgileri.</p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Ad Soyad *</label>
                    <input
                      type="text" required
                      placeholder="Ahmet Yılmaz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Telefon *</label>
                      <input
                        type="tel" required
                        placeholder="+90 555 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">E-posta *</label>
                      <input
                        type="email" required
                        placeholder="ahmet@glowdesk.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Giriş Şifresi *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="En az 8 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-indigo-600 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 text-xs font-bold"
                      >
                        {showPassword ? "Gizle" : "Göster"}
                      </button>
                    </div>

                    {password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className={`h-full ${strengthColors[Number(pwStrength)] || "bg-slate-200"} transition-all w-full`} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">{strengthLabels[Number(pwStrength)] || ""}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
                  >
                    ← Geri
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-2xl text-sm font-extrabold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Kuruluyor...</span>
                    ) : (
                      <>
                        <span>✨ Kaydı Tamamla & Başla</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Zaten hesabınız var mı?{" "}
              <Link href="/login" className="font-extrabold text-indigo-600 hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
