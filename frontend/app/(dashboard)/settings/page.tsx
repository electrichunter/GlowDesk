"use client";

import { useState, useEffect } from "react";
import { getSectorLabel } from "@/__mocks__/mock-data";
import { getCurrentSession, setSessionCookie, createSession, type SessionPayload } from "@/lib/session";
import { safeJsonParse } from "@/lib/sanitize";
import { TURKEY_CITIES } from "@/lib/cities";
import type { BusinessSector } from "@/lib/types";
import { useTenant } from "@/contexts/TenantContext";
import PlanFeatureGate from "@/components/dashboard/PlanFeatureGate";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";

export default function SettingsPage() {
  const { tenant, activePlan, planConfig, openUpgradeModal, hasFeature, checkLimit, verticalConfig } = useTenant();

  const [session, setSession] = useState<SessionPayload | null>(null);
  const [tenantName, setTenantName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [sector, setSector] = useState<BusinessSector>("beauty");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("20:00");
  const [closedDay, setClosedDay] = useState("Pazar");
  const [lunchEnabled, setLunchEnabled] = useState(true);
  const [lunchStart, setLunchStart] = useState("12:30");
  const [lunchEnd, setLunchEnd] = useState("13:30");

  // Media & Gallery States
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80"
  ]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // Enterprise States
  const [smsSenderHeader, setSmsSenderHeader] = useState("GLOWSALON");
  const [branches, setBranches] = useState<Array<{ id: string; name: string; city: string; district: string; neighborhood?: string; street?: string; is_main?: boolean }>>([
    { id: "b-1", name: "Ana Şube / Merkez", city: "", district: "", is_main: true },
  ]);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [newBranchDistrict, setNewBranchDistrict] = useState("");
  const [newBranchNeighborhood, setNewBranchNeighborhood] = useState("");
  const [newBranchStreet, setNewBranchStreet] = useState("");

  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; created_at: string }>>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("https://api.glowdesk.com.tr/v1/webhook");

  const [workstations, setWorkstations] = useState<Array<{ id: string; name: string; is_active: boolean }>>([
    { id: "ws-1", name: "1. Koltuk / Masa", is_active: true },
  ]);
  const [newWsName, setNewWsName] = useState("");
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchTenantData = async () => {
      const active = getCurrentSession();
      if (active || tenant) {
        if (active) setSession(active);
        const currentName = tenant?.name || active?.businessName;
        const currentPhone = tenant?.settings?.phone || active?.phone;
        const currentSector = tenant?.sector || active?.sector;

        if (currentName) setTenantName(currentName);
        if (currentPhone) setPhone(currentPhone);
        if (currentSector) setSector(currentSector as BusinessSector);

        try {
          const { apiRequest } = await import("@/lib/api-client");
          const tenantId = tenant?.id || active?.tenantId || "tenant-demo-1";
          const { data } = await apiRequest<any>(`/tenants/${tenantId}`, { signal: controller.signal });
          if (data) {
            if (data.name) setTenantName(data.name);
            if (data.phone) setPhone(data.phone);
            if (data.city) setCity(data.city);
            if (data.district) setDistrict(data.district);
            if (data.neighborhood) setNeighborhood(data.neighborhood);
            if (data.street) setAddress(data.street);
            if (data.address) setAddress(data.address);
            if (data.sector) setSector(data.sector as BusinessSector);
          }
        } catch (err: any) {
          if (err?.name !== "AbortError") {
            console.error("Tenant settings load error:", err);
          }
        }
      }
    };

    fetchTenantData();
    return () => controller.abort();
  }, [tenant]);

  // Ana Şube Konumunu kullanıcının kayıtlı şehir/ilçe/mahalle/adres bilgileriyle senkronize et
  useEffect(() => {
    setBranches((prev) => {
      if (prev.length === 0) {
        return [{
          id: "b-1",
          name: "Ana Şube / Merkez",
          city: city || "İstanbul",
          district: district || "Merkez",
          neighborhood: neighborhood || "Merkez Mah.",
          street: address || "Cadde / Sokak No:1",
          is_main: true,
        }];
      }
      return prev.map((b) => {
        if (b.is_main) {
          return {
            ...b,
            city: city || b.city || "İstanbul",
            district: district || b.district || "Merkez",
            neighborhood: neighborhood || b.neighborhood || "Merkez Mah.",
            street: address || b.street || "Cadde / Sokak No:1",
          };
        }
        return b;
      });
    });
  }, [city, district, neighborhood, address]);

  const handleAddWorkstation = () => {
    if (!newWsName.trim()) return;
    const newWs = { id: `ws-${Date.now()}`, name: newWsName.trim(), is_active: true };
    setWorkstations((prev) => [...prev, newWs]);
    setNewWsName("");
  };

  const handleToggleWorkstation = (id: string) => {
    setWorkstations((prev) =>
      prev.map((w) => (w.id === id ? { ...w, is_active: !w.is_active } : w))
    );
  };

  const handleRemoveWorkstation = (id: string) => {
    setWorkstations((prev) => prev.filter((w) => w.id !== id));
  };

  // Enterprise Handlers
  const handleAddBranch = () => {
    if (!newBranchName.trim()) return;
    const b = {
      id: `b-${Date.now()}`,
      name: newBranchName.trim(),
      city: newBranchCity.trim() || city || "İl Girilmedi",
      district: newBranchDistrict.trim() || district || "İlçe Girilmedi",
      neighborhood: newBranchNeighborhood.trim() || undefined,
      street: newBranchStreet.trim() || undefined,
      is_main: false,
    };
    setBranches((prev) => [...prev, b]);
    setNewBranchName("");
    setNewBranchCity("");
    setNewBranchDistrict("");
    setNewBranchNeighborhood("");
    setNewBranchStreet("");
  };

  const handleRemoveBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSetMainBranch = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => ({
        ...b,
        is_main: b.id === id,
      }))
    );
  };

  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) return;
    const randomHex = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      key: `gd_live_${randomHex}`,
      created_at: new Date().toISOString().split("T")[0],
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const getSMSPreview = (s: BusinessSector) => {
    switch (s) {
      case "beauty":
        return "✨ Selam Elif! Senin için ayrılan o çok özel medikal cilt bakımı saatinin koruyucusuyuz. Yarın 14:00'te gelirken ruhunu dinlendirmeyi unutma... Onaylıyor musun? (EVET/HAYIR)";
      case "spa":
        return "🌿 Merhaba Zeynep Hanım! Anti-aging terapi seansınız yarın 14:00'te hazırlanıyor. Doğal ışıltınıza kavuşmak için onayınızı bekliyoruz. (EVET/İPTAL)";
      case "clinic":
        return "🩺 Sayın Merve Şahin, Uzm. Dermatolog randevunuz yarın 14:00'tedir. Klinik takvimini kesinleştirmek için yanıtınızı bekliyoruz. (EVET/DEĞİŞTİR)";
      default:
        return "✨ Selam Elif! Randevu saatiniz yarın 14:00'te. Onaylıyor musun? (EVET/HAYIR)";
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavedSuccess(false);

    try {
      const tenantId = session?.tenantId || "tenant-demo-1";
      const { apiRequest } = await import("@/lib/api-client");

      await apiRequest(`/tenants/${tenantId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: tenantName,
          phone,
          city,
          district,
          neighborhood,
          street: address,
          address,
          sector,
          description,
          logo_url: logoUrl,
          cover_image: coverImage,
          gallery_images: galleryImages,
        }),
      });

      const settingsData = {
        tenantName,
        phone,
        address,
        city,
        district,
        neighborhood,
        sector,
        openTime,
        closeTime,
        closedDay,
        lunch_break: {
          enabled: lunchEnabled,
          start: lunchStart,
          end: lunchEnd,
        },
        sms_sender_header: smsSenderHeader,
        branches,
        api_keys: apiKeys,
        webhook_url: webhookUrl,
        workstations,
        onboardingCompleted: true,
      };

      localStorage.setItem("glowdesk_tenant_settings", JSON.stringify(settingsData));

      if (session) {
        const updatedPayload = {
          ...session,
          businessName: tenantName,
          sector,
          phone,
        };
        const token = createSession(updatedPayload);
        setSessionCookie(token);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Settings save error:", err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-30">
        <div>
          <h1 className="text-2xl font-extrabold font-display text-[#1E1B4B]">
            {verticalConfig?.settingsTitle || "İşletme Ayarları"}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">İşletmenizin profilini, detaylı adres bilgilerini ve çalışma saatlerini düzenleyin.</p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
              <span>✓</span>
              <span>Değişiklikler Kaydedildi!</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => handleSave()}
            className="btn-cyan text-xs py-2.5 px-5 font-extrabold shadow-sm flex items-center gap-2"
          >
            <span>💾</span>
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>

      {/* Abonelik & Plan Yönetimi Bento Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${planConfig.badgeClass}`}>
              {planConfig.badgeLabel}
            </span>
            <span className="text-xs text-slate-400 font-medium">Aktif İşletme Paketiniz</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-white">
            {planConfig.name}
          </h2>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            {planConfig.description}
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
            <span>Maks. Şube: <strong className="text-white">{planConfig.limits.maxBranches === Infinity ? "Sınırsız" : planConfig.limits.maxBranches}</strong></span>
            <span>•</span>
            <span>Maks. Personel: <strong className="text-white">{planConfig.limits.maxStaff === Infinity ? "Sınırsız" : planConfig.limits.maxStaff}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => openUpgradeModal()}
            className="w-full sm:w-auto py-3 px-6 rounded-2xl text-xs font-extrabold bg-[#0066FF] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>⚡ Plan Değiştir & Yükselt</span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sol Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="brand-card p-6 space-y-6 bg-white">
            <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-slate-200 pb-2">Genel & İletişim Bilgileri</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">İşletme Adı *</label>
                <input
                  type="text"
                  required
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="input-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Sektör Tipi *</label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as BusinessSector)}
                  className="input-dark bg-white font-bold"
                >
                  <option value="legal">⚖️ Hukuk Bürosu & Danışmanlık</option>
                  <option value="clinic">🩺 Klinik & Poliklinik</option>
                  <option value="beauty">💄 Güzellik & Bakım Salonu</option>
                  <option value="barber">💈 Berber & Erkek Kuaförü</option>
                  <option value="spa">💆 Spa & Masaj Salonu</option>
                  <option value="auto">🚗 Oto Servis & Detailing</option>
                  <option value="fitness">💪 Fitness & Pilates Stüdyosu</option>
                  <option value="vet">🐾 Veteriner Kliniği & Pet Grooming</option>
                  <option value="coaching">📚 Özel Ders & Psikolojik Danışmanlık</option>
                  <option value="photo">📸 Fotoğraf Stüdyosu & Kiralama</option>
                  <option value="coworking">🏢 Toplantı Odası & Coworking</option>
                  <option value="driving">🚘 Sürücü Kursu & Direksiyon</option>
                  <option value="restoran">🍽️ Restoran & Kafe</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Telefon Numarası *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Şehir (İl) *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-dark bg-white font-bold"
                >
                  <option value="">İl Seçin...</option>
                  {TURKEY_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">İlçe *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="input-dark"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Mahalle</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Çalışma Saatleri</label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="input-dark bg-white"
                  />
                  <span className="self-center text-xs font-bold text-slate-400">-</span>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="input-dark bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Açık Adres</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-dark h-20 resize-none"
              />
            </div>

            {/* 🖼️ Görsel ve Galeri Yönetimi */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase text-[#1E1B4B] tracking-wider flex items-center gap-1.5">
                  🖼️ Görsel & Salon Galerisi (Halka Açık Profil Fotoğrafları)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  İşletmenizin logosu, kapak resmi ve salon içi çalışma görsellerini ayarlayın. Müşterileriniz profil sayfanızda (`/isletme/${session?.tenantId || 'demo-salon'}`) bu fotoğrafları görecektir.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">İşletme Hakkında Açıklama Metni</label>
                <textarea
                  placeholder="İşletmeniz hakkında müşterilerinize sunmak istediğiniz tanıtım yazısı..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-dark h-20 resize-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Logo URL / Fotoğrafı</label>
                  <input
                    type="url"
                    placeholder="https://... (Logo Bağlantısı)"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="input-dark text-xs"
                  />
                  {logoUrl && (
                    <div className="mt-2 w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={logoUrl} alt="Logo Önizleme" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Kapak Fotoğrafı (Banner) URL</label>
                  <input
                    type="url"
                    placeholder="https://... (Kapak Görseli)"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="input-dark text-xs"
                  />
                  {coverImage && (
                    <div className="mt-2 h-16 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                      <img src={coverImage} alt="Kapak Önizleme" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Salon Galeri Fotoğrafları */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase text-slate-600">Salon İçi Çalışma Fotoğrafları (Galeri)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                      <img src={imgUrl} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setGalleryImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center opacity-90 hover:opacity-100 shadow-md cursor-pointer"
                        title="Fotoğrafı Sil"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="url"
                    placeholder="Yeni salon fotoğrafı URL'si ekleyin (https://...)"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="input-dark text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newGalleryUrl.trim()) return;
                      setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
                      setNewGalleryUrl("");
                    }}
                    className="btn-cyan text-xs py-2 px-4 shadow-xs font-extrabold"
                  >
                    + Galeriye Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Öğle Molası Ayarları */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                    ☕ Öğle Molası (Mola Saatleri)
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                    Mola saatlerinde müşterilere randevu slotu kapalı görünür ("☕ Mola" rozetiyle).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setLunchEnabled(!lunchEnabled)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                    lunchEnabled
                      ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                      : "bg-white text-slate-500 border-slate-300"
                  }`}
                >
                  {lunchEnabled ? "✓ Molalı Çalışma" : "Molasız"}
                </button>
              </div>

              {lunchEnabled && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-amber-800 mb-1">Mola Başlangıç</label>
                    <input
                      type="time"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="input-dark bg-white text-xs py-2"
                    />
                  </div>
                  <span className="self-end pb-2 font-bold text-amber-700 text-xs">-</span>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-amber-800 mb-1">Mola Bitiş</label>
                    <input
                      type="time"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="input-dark bg-white text-xs py-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Koltuk / Masa / Oda Yönetimi */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase text-[#1E1B4B] tracking-wider">
                  🪑 Koltuk / Masa / Oda Yönetimi (Çalışan İstasyonları)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Salonunuzdaki aktif koltuk, masaları veya bakım odalarını ayarlayın. Müşteriler randevu alırken bu koltukları seçebilir.
                </p>
              </div>

              <div className="space-y-2">
                {workstations.map((ws) => (
                  <div key={ws.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <span className="font-bold text-[#1E1B4B]">{ws.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleWorkstation(ws.id)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all ${
                          ws.is_active
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-slate-200 text-slate-600 border border-slate-300"
                        }`}
                      >
                        {ws.is_active ? "✓ Aktif" : "Pasif"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveWorkstation(ws.id)}
                        className="px-2.5 py-1 rounded-lg font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all text-[11px]"
                      >
                        Sil 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Yeni Koltuk / Oda Ekle (ör. 3. Koltuk veya VİP Oda)"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="input-dark text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddWorkstation}
                  className="btn-secondary text-xs py-2 px-4 shadow-xs"
                >
                  + Ekle
                </button>
              </div>
            </div>

            {/* 🏢 ENTERPRISE: Çoklu Şube Yönetimi */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                    🏢 Çoklu Şube Yönetimi (Enterprise)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farklı şehir ve ilçelerdeki şubelerinizi ekleyin. Müşterileriniz doğrudan şube seçerek randevu alabilir.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
                  Enterprise
                </span>
              </div>

              <div className="space-y-2">
                {branches.map((b) => {
                  const locParts = [b.city, b.district, b.neighborhood, b.street].filter(Boolean);
                  const locationString = locParts.length > 0 ? locParts.join(" / ") : "Konum Belirtilmedi";

                  return (
                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl text-xs gap-2">
                      <div>
                        <span className="font-extrabold text-[#1E1B4B] block">{b.name}</span>
                        <span className="text-[11px] text-slate-600 font-semibold">{locationString} {b.is_main && "• (Merkez Şube)"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {b.is_main ? (
                          <span className="px-2.5 py-1 rounded-lg font-extrabold bg-amber-100 text-amber-900 border border-amber-200 text-[10px]">
                            ⭐ Merkez Şube
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSetMainBranch(b.id)}
                              className="px-2.5 py-1 rounded-lg font-bold bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 transition-all text-[10px]"
                            >
                              ⭐ Merkez Yap
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBranch(b.id)}
                              className="px-2.5 py-1 rounded-lg font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all text-[10px]"
                            >
                              Sil 🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 bg-purple-50/30 p-3 rounded-xl border border-purple-100">
                <span className="block text-[11px] font-extrabold text-purple-900">➕ Yeni Ek Şube Tanımla</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Şube Adı (ör. Kızılay Şubesi)"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="input-dark text-xs"
                  />
                  <select
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    className="input-dark bg-white text-xs font-bold"
                  >
                    <option value="">İl Seçin...</option>
                    {TURKEY_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="İlçe (ör. Çankaya)"
                    value={newBranchDistrict}
                    onChange={(e) => setNewBranchDistrict(e.target.value)}
                    className="input-dark text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Mahalle (ör. Dikmen Mah.)"
                    value={newBranchNeighborhood}
                    onChange={(e) => setNewBranchNeighborhood(e.target.value)}
                    className="input-dark text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Sokak/Cadde"
                      value={newBranchStreet}
                      onChange={(e) => setNewBranchStreet(e.target.value)}
                      className="input-dark text-xs flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddBranch}
                      className="btn-cyan text-xs py-2 px-4 shadow-xs shrink-0 font-extrabold"
                    >
                      + Şube Ekle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 📱 ENTERPRISE: Özel Alfanumerik SMS Başlığı */}
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                    📱 Özel SMS Gönderici Başlığı (Alfanumerik Header)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Müşterilerinize gönderilen SMS bildirimlerinde görünen gönderici adını belirleyin (Max 11 Karakter).
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
                  Enterprise
                </span>
              </div>

              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  maxLength={11}
                  value={smsSenderHeader}
                  onChange={(e) => setSmsSenderHeader(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  className="input-dark text-xs font-mono tracking-widest max-w-[200px]"
                  placeholder="ör. GLOWSALON"
                />
                <div className="p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2">
                  <span>💬 Canlı SMS Önizleme Gönderen:</span>
                  <span className="font-mono font-black text-[#1E1B4B] bg-white px-2 py-0.5 rounded border border-slate-300">
                    {smsSenderHeader || "GLOWDESK"}
                  </span>
                </div>
              </div>
            </div>

            {/* 💬 ENTERPRISE: WhatsApp Business Cloud API & No-Show Otomasyon Motoru */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                    💬 WhatsApp Business Cloud API & No-Show Motoru
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Müşterilerinize WhatsApp üzerinden 24 saat ve 2 saat önce interaktif butonlu (Evet Geliyorum / İptal Et) teyit mesajları gönderin.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase bg-[#0066FF] text-white px-3 py-1 rounded-full shadow-xs">
                  👑 Kurumsal VIP (Enterprise)
                </span>
              </div>

              {tenant?.subscription_tier !== "enterprise" ? (
                <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-purple-800/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔒</span>
                    <h5 className="font-extrabold text-xs text-purple-200">WhatsApp Business API Şartı</h5>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Resmi Meta WhatsApp Business Cloud API bağlama ve otomatik No-Show Engelleme Motoru yalnızca **Enterprise VIP (Kurumsal VIP)** paket sahiplerine açıktır.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("GlowDesk Enterprise (Kurumsal VIP) pakete yükseltmek istediğinize emin misiniz?")) {
                        window.location.href = "/admin?tab=tenants";
                      }
                    }}
                    className="py-2.5 px-5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md hover:scale-105 transition-all"
                  >
                    ⚡ Enterprise VIP Pakete Yükselt →
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3 text-xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-950 text-xs">✓ Meta WhatsApp Cloud API Entegrasyon Bilgileri</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ● No-Show Motoru Aktif
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">WhatsApp Phone Number ID *</label>
                      <input
                        type="text"
                        placeholder="ör. 109283749182374"
                        defaultValue="109283749182374"
                        className="input-dark bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">WhatsApp Business Account ID (WABA) *</label>
                      <input
                        type="text"
                        placeholder="ör. 987654321012345"
                        defaultValue="987654321012345"
                        className="input-dark bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Meta Permanent System User Access Token *</label>
                    <input
                      type="password"
                      defaultValue="EAAGm0PX4ZK0BA..."
                      className="input-dark bg-white text-xs font-mono"
                    />
                  </div>

                  <div className="p-3 bg-emerald-950 text-white rounded-xl space-y-1 text-[11px] font-mono">
                    <p className="font-bold text-emerald-400">🤖 No-Show Motoru Canlı Test Modunda:</p>
                    <p>Müşteri randevuya 2 saat kala WhatsApp teyit mesajı alır. Cevap vermezse sıra otomatik bekleme listesindekine aktarılır.</p>
                  </div>
                </div>
              )}
            </div>

            {/* 🔑 ENTERPRISE: API Keys & Webhooks */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase text-purple-900 tracking-wider flex items-center gap-1.5">
                    🔑 Enterprise API & Webhook Paneli
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kendi POS yazılımınız veya web siteniz ile GlowDesk verilerini senkronize edin.
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-200">
                  Enterprise API
                </span>
              </div>

              {/* Webhook URL Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Webhook URL (Randevu Olayları)</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="input-dark text-xs font-mono"
                  placeholder="https://siteniz.com/api/glowdesk-webhook"
                />
              </div>

              {/* API Keys List */}
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Aktif API Anahtarları</label>
                {apiKeys.map((keyItem) => (
                  <div key={keyItem.id} className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-cyan-400 font-bold block text-[11px] font-sans">{keyItem.name}</span>
                      <span className="text-slate-300 text-[11px]">{keyItem.key}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeApiKey(keyItem.id)}
                      className="text-rose-400 font-sans font-bold hover:underline"
                    >
                      İptal Et
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Yeni API Anahtar Adı (ör. Web Sitesi Entegrasyonu)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="input-dark text-xs flex-1"
                />
                <button
                  type="button"
                  onClick={handleGenerateApiKey}
                  className="btn-primary text-xs py-2 px-4 shadow-xs"
                >
                  ⚡ Key Üret
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary text-xs py-3 px-8 shadow-md">
                💾 Ayarları Gerçekten Kaydet
              </button>
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="brand-card p-6 space-y-4 bg-white">
            <h3 className="text-xs font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-slate-200 pb-2">
              🤖 Akıllı Psikolojik Mesaj Dili
            </h3>
            
            <p className="text-slate-500 text-xs leading-relaxed">
              Müşterilerinize randevudan 2 saat önce gönderilecek otomatik WhatsApp/SMS onay mesajı seçtiğiniz sektöre özel şekillenir.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                <span>Aktif Dil Modeli:</span>
                <span className="text-cyan-600 font-bold">{getSectorLabel(sector)}</span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 italic leading-relaxed shadow-xs">
                &ldquo;{getSMSPreview(sector)}&rdquo;
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* 💾 Sabit/Yüzen Kaydetme Barı (Her Ekran Boyutunda Erişilebilir) */}
      <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 z-40 bg-[#1E1B4B]/95 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl border border-indigo-900/60 shadow-2xl flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <span className="text-xl animate-bounce">💾</span>
          <div>
            <h4 className="text-xs font-extrabold font-display">Yaptığınız değişiklikleri kaydetmeyi unutmayın</h4>
            <p className="text-[11px] text-slate-300">Tüm adres, şube, çalışma saatleri ve API ayarlarınız tek tıkla kaydedilir.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800">
              ✓ Kaydedildi!
            </span>
          )}
          <button
            type="button"
            onClick={() => handleSave()}
            className="btn-cyan text-xs py-2.5 px-6 font-black shadow-lg hover:scale-105 transition-all"
          >
            Değişiklikleri Kaydet 💾
          </button>
        </div>
      </div>

    </div>
  );
}
