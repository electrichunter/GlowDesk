"use client";

/**
 * GlowDesk — Salon Onboarding (Kurulum Sihirbazı & Tanıtım)
 *
 * Yeni kaydolan salon sahiplerini adım adım karşılar:
 * 1. Tanıtım & Hoş Geldiniz
 * 2. İşletme Adı, İletişim, Şehir/İlçe, Adres ve Çalışma Saatleri
 * 3. Sektör Seçimi & Tek Tıkla Hizmet Şablonu Yükleme
 * 4. Kaydet ve Canlıya Geç (Gerçek Persistence)
 */

import { useState, useEffect } from "react";
import { getCurrentSession, setSessionCookie, createSession, type SessionPayload } from "@/lib/session";
import { defaultServiceTemplates, getSectorLabel, getSectorIcon } from "@/__mocks__/mock-data";
import { safeJsonParse } from "@/lib/sanitize";

export interface TenantSettings {
  tenantName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  address: string;
  sector: string;
  openTime: string;
  closeTime: string;
  closedDay: string;
  onboardingCompleted: boolean;
}

const DEFAULT_SETTINGS: TenantSettings = {
  tenantName: "",
  phone: "",
  city: "İstanbul",
  district: "Şişli",
  neighborhood: "Merkez Mah.",
  address: "Merkez Cad. No: 12",
  sector: "beauty",
  openTime: "09:00",
  closeTime: "20:00",
  closedDay: "Pazar",
  onboardingCompleted: false,
};

export default function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [session, setSession] = useState<SessionPayload | null>(null);

  // Form State
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("Şişli");
  const [address, setAddress] = useState("");
  const [sector, setSector] = useState("beauty");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [closedDay, setClosedDay] = useState("Pazar");
  const [autoLoadTemplates, setAutoLoadTemplates] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const active = getCurrentSession();
    if (active) {
      setSession(active);
      setTenantName(active.businessName || active.fullName || "Salonunuz");
      setPhone(active.phone || "+90 555 123 4567");
      setSector(active.sector || "beauty");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsSaving(true);

    try {
      const finalSettings: TenantSettings = {
        tenantName: tenantName.trim() || "Salonunuz",
        phone: phone.trim() || "+90 555 123 4567",
        city,
        district,
        neighborhood: "Merkez Mah.",
        address: address.trim() || `${city} ${district}`,
        sector,
        openTime,
        closeTime,
        closedDay,
        onboardingCompleted: true,
      };

      // 1. Ayarları localStorage'a kaydet (Gerçek demo persistance)
      localStorage.setItem("glowdesk_tenant_settings", JSON.stringify(finalSettings));

      // 2. Eğer sektör şablonlarını otomatik yükle seçiliyse hazır hizmetleri kaydet
      if (autoLoadTemplates) {
        const templates = defaultServiceTemplates[sector as keyof typeof defaultServiceTemplates] || defaultServiceTemplates.beauty;
        const newServices = templates.map((t, idx) => ({
          id: `svc-init-${Date.now()}-${idx}`,
          tenant_id: session?.tenantId || "tenant-1",
          name: t.name,
          duration_minutes: t.duration_minutes,
          price: t.price,
          category: "Genel",
          is_active: true,
        }));

        const existingServices = safeJsonParse(localStorage.getItem("glowdesk_services"), []);
        localStorage.setItem("glowdesk_services", JSON.stringify([...newServices, ...existingServices]));
      }

      // 3. Registered Tenants listesini güncelle (Salon Keşfet / Admin için)
      const registeredTenants = safeJsonParse<any[]>(localStorage.getItem("glowdesk_registered_tenants"), []);
      const slug = (tenantName || "salon").toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-");
      
      const existingIdx = registeredTenants.findIndex(t => t.id === session?.tenantId || t.name === tenantName);
      const tenantData = {
        id: session?.tenantId || `tenant-${Date.now()}`,
        name: tenantName,
        slug,
        sector,
        phone,
        city,
        district,
        subscription_tier: "pro",
        created_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        registeredTenants[existingIdx] = { ...registeredTenants[existingIdx], ...tenantData };
      } else {
        registeredTenants.unshift(tenantData);
      }
      localStorage.setItem("glowdesk_registered_tenants", JSON.stringify(registeredTenants));

      // 4. Session'ı güncelle (isNewUser: false)
      if (session) {
        const updatedPayload = {
          ...session,
          businessName: tenantName,
          sector,
          phone,
          isNewUser: false,
        };
        const token = createSession(updatedPayload);
        setSessionCookie(token);
      }

      setIsSaving(false);
      if (onComplete) onComplete();
      if (onClose) onClose();
    } catch {
      setIsSaving(false);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Üst Header & Adım İlerleme Çubuğu */}
        <div className="bg-[#1E1B4B] text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex justify-between items-center mb-6">
            <span className="text-xl font-black font-display tracking-tight text-white">
              Glow<span className="text-cyan-400">Desk</span>
            </span>
            <span className="text-xs font-bold px-3 py-1 bg-white/10 text-cyan-300 border border-white/20 rounded-full">
              Adım {step} / 4
            </span>
          </div>

          <h2 className="text-2xl font-extrabold font-display leading-tight relative z-10">
            {step === 1 && "🎉 GlowDesk'e Hoş Geldiniz!"}
            {step === 2 && "🏢 Salon Bilgileri & Çalışma Saatleri"}
            {step === 3 && "💈 Sektör Tercihi & Hazır Hizmet Yükleme"}
            {step === 4 && "🚀 Kurulum Tamamlandı!"}
          </h2>
          <p className="text-xs text-slate-300 mt-1 relative z-10">
            {step === 1 && "İşletmenizi müşterilerinize açmadan önce 2 dakikada temel ayarlarınızı yapalım."}
            {step === 2 && "Müşterilerinizin randevu alabilmesi için salon detaylarınızı ve açılış saatlerinizi belirtin."}
            {step === 3 && "Sektörünüze özel popüler hizmet listesini otomatik olarak yükleyebilir veya özelleştirebilirsiniz."}
            {step === 4 && "Ayarlarınız başarıyla kaydedildi. Artık randevu almaya hazırsınız!"}
          </p>

          {/* İlerleme Çubuğu */}
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-6 overflow-hidden flex">
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Adım İçerikleri */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-[#334155]">
          
          {/* Adım 1: Tanıtım */}
          {step === 1 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-sm">
                💈
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-extrabold text-[#1E1B4B] font-display">
                  Salonunuzu Dijitale Taşımaya Hazır mısınız?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  GlowDesk ile no-show oranlarınızı %94 azaltabilir, müşterilerinize 7/24 online randevu alma kolaylığı sunabilirsiniz. İlk kurulumu tamamlamak için yalnızca birkaç basit sorumuz var.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-lg mx-auto pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="block text-base mb-1">📅</span>
                  <span className="block text-xs font-bold text-[#1E1B4B]">Akıllı Takvim</span>
                  <span className="block text-[11px] text-slate-500">Çakışmasız canlı ajanda</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="block text-base mb-1">⚡</span>
                  <span className="block text-xs font-bold text-[#1E1B4B]">No-Show Motoru</span>
                  <span className="block text-[11px] text-slate-500">Otomatik bekleme listesi</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="block text-base mb-1">🔍</span>
                  <span className="block text-xs font-bold text-[#1E1B4B]">Salon Keşfet</span>
                  <span className="block text-[11px] text-slate-500">Bölgenizde öne çıkın</span>
                </div>
              </div>
            </div>
          )}

          {/* Adım 2: İşletme Bilgileri */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    İşletme / Salon Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="Örn: Zelza Güzellik Salonu"
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    İletişim Telefonu *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5xx xxx xx xx"
                    className="input-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    Şehir *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    İlçe *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Açık Adres / Cadde / Sokak
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Örn: Abdi İpekçi Cad. No:18 Kat:2"
                  className="input-dark"
                />
              </div>

              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider text-[#1E1B4B]">
                  ⏰ Çalışma Saatleri
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Açılış</label>
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="input-dark bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Kapanış</label>
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="input-dark bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Haftalık Tatil</label>
                    <select
                      value={closedDay}
                      onChange={(e) => setClosedDay(e.target.value)}
                      className="input-dark bg-white"
                    >
                      <option value="Pazar">Pazar</option>
                      <option value="Pazartesi">Pazartesi</option>
                      <option value="Yok">Tatil Yok (7/24)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Adım 3: Sektör & Şablon Hizmetler */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Salonunuzun Hizmet Sektörü
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "barber", label: "Berber & Erkek Kuaförü", icon: "💈" },
                    { id: "beauty", label: "Güzellik Salonu", icon: "💄" },
                    { id: "spa", label: "Cilt Bakımı & Spa", icon: "💆" },
                    { id: "massage", label: "Masaj & Terapi", icon: "🌿" },
                    { id: "clinic", label: "Klinik & Özel Medikal", icon: "🩺" },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSector(s.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                        sector === s.id
                          ? "border-cyan-500 bg-cyan-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <span className="text-xs font-bold text-[#1E1B4B]">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sektör Şablon Yükleme Seçeneği */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-[#1E1B4B]">
                      {getSectorIcon(sector)} {getSectorLabel(sector)} Hazır Hizmet Paketini Yükle
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Sektörünüze özel hazırlanmış varsayılan hizmetler ve fiyatlar otomatik tanımlanır.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoLoadTemplates}
                    onChange={(e) => setAutoLoadTemplates(e.target.checked)}
                    className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {autoLoadTemplates && (
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    {(defaultServiceTemplates[sector as keyof typeof defaultServiceTemplates] || defaultServiceTemplates.beauty).map((t, i) => (
                      <div key={i} className="flex justify-between p-2 bg-white rounded-lg border border-slate-200">
                        <span className="font-semibold truncate">{t.name}</span>
                        <span className="font-bold text-cyan-600">₺{t.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adım 4: Tamamlandı */}
          {step === 4 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
                ✓
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#1E1B4B] font-display">
                  Tebrikler! {tenantName || "Salonunuz"} Canlıya Hazır!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Tüm ayarlarınız kalıcı olarak kaydedildi. Randevu takviminizi yönetebilir, yeni hizmetler ekleyebilir ve Müşteri Keşfet sayfasından müşteri kabul etmeye başlayabilirsiniz.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left max-w-md mx-auto text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>İşletme Adı:</span>
                  <span className="font-bold text-[#1E1B4B]">{tenantName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sektör:</span>
                  <span className="font-bold text-[#1E1B4B]">{getSectorLabel(sector)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Konum:</span>
                  <span className="font-bold text-[#1E1B4B]">{city} / {district}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Çalışma Saatleri:</span>
                  <span className="font-bold text-[#1E1B4B]">{openTime} - {closeTime} ({closedDay} Tatil)</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Alt Aksiyon Butonları */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              ← Geri
            </button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && (!tenantName.trim() || !phone.trim())) {
                  alert("Lütfen işletme adı ve telefon numarasını doldurun.");
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md"
            >
              Devam Et →
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md"
            >
              Özet Gör ve Kaydet →
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleFinish}
              className="btn-primary py-3 px-8 text-xs font-extrabold shadow-lg bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
            >
              {isSaving ? "Kaydediliyor..." : "🚀 Kurulumu Bitir ve Paneli Aç"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
