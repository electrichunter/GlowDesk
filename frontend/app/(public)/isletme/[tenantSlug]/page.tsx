"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { apiRequest } from "@/lib/api-client";

interface PublicTenantProfile {
  id: string;
  name: string;
  slug: string;
  sector: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  rating?: number;
  review_count?: number;
  description?: string;
  logo_url?: string;
  cover_image?: string;
  gallery_images?: string[];
}

interface ServiceItem {
  id: string;
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

import { getSectorAsset } from "@/lib/sector-assets";

export default function PublicBusinessProfilePage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = (params?.tenantSlug as string) || "demo-salon";

  const sectorAsset = getSectorAsset(tenantSlug);

  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<PublicTenantProfile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Tenant data
        const resTenant = await apiRequest<PublicTenantProfile>(`/tenants/public/by-slug/${tenantSlug}`);
        if (resTenant.data) {
          setTenant(resTenant.data);
          const tId = resTenant.data.id;
          const currentSectorAsset = getSectorAsset(resTenant.data.sector || tenantSlug);

          // 2. Fetch Services
          const resServices = await apiRequest<ServiceItem[]>(`/services/public/${tId}`);
          if (resServices.data && Array.isArray(resServices.data) && resServices.data.length > 0) {
            setServices(
              resServices.data.map((s: any) => ({
                id: s.id,
                name: s.name,
                price: parseFloat(s.price || 0),
                duration_minutes: s.duration_minutes || 30,
                description: s.description,
                category: s.category || "Genel Hizmetler",
              }))
            );
          } else {
            setServices(currentSectorAsset.defaultServices);
          }

          // 3. Fetch Staff
          const resStaff = await apiRequest<StaffItem[]>(`/staff/public/${tId}`);
          if (resStaff.data && Array.isArray(resStaff.data) && resStaff.data.length > 0) {
            setStaffList(resStaff.data);
          } else {
            setStaffList(currentSectorAsset.defaultStaff);
          }
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">İşletme Profili Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
        <Navbar />
        <main className="pt-32 pb-20 max-w-xl mx-auto px-6 text-center space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-black text-slate-900 font-display">İşletme Bulunamadı</h1>
          <p className="text-slate-500 text-xs">Aradığınız salon veya işletme adresi değişmiş olabilir.</p>
          <Link href="/explore" className="btn-primary-blue text-xs py-3 px-6 inline-block">
            🔍 Tüm İşletmeleri Keşfet →
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const activeSectorAsset = getSectorAsset(tenant.sector || tenantSlug);

  const galleryList = tenant.gallery_images && tenant.gallery_images.length > 0
    ? tenant.gallery_images
    : activeSectorAsset.galleryImages;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="pt-24 pb-28">
        
        {/* ── HERO BANNER & LOGO OVERLAY ── */}
        <section className="relative">
          {/* Cover Photo */}
          <div className="h-64 sm:h-96 w-full overflow-hidden bg-slate-900 relative">
            <img
              src={tenant.cover_image || activeSectorAsset.coverImage}
              alt={tenant.name}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />
          </div>

          {/* Profile Header Info Overlay */}
          <div className="max-w-7xl mx-auto px-6 relative -mt-16 sm:-mt-20 z-10">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-layered flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Logo Badge */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100 shrink-0">
                  <img
                    src={tenant.logo_url || activeSectorAsset.logoImage}
                    alt={`${tenant.name} Logo`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border flex items-center gap-1 ${activeSectorAsset.badgeBg}`}>
                      <span>{activeSectorAsset.icon}</span>
                      <span>{activeSectorAsset.label}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                      <span>🟢</span> <span>Şimdi Açık (09:00 - 20:00)</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
                    {tenant.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1 text-amber-500 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      ★ {tenant.rating || 4.9} ({tenant.review_count || 28} Değerlendirme)
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {tenant.address || `${tenant.district || 'Merkez'}, ${tenant.city || 'İstanbul'}`}
                    </span>
                    <span className="flex items-center gap-1">
                      📞 {tenant.phone || "+90 555 123 4567"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <a
                  href={`tel:${tenant.phone || '+905551234567'}`}
                  className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors text-center"
                >
                  📞 Ara / İletişim
                </a>
                <Link
                  href={`/book/${tenant.slug}`}
                  className="btn-primary-blue text-xs py-3.5 px-8 font-black shadow-lg shadow-blue-500/25 hover:scale-105 transition-all text-center"
                >
                  📅 Online Randevu Al ➔
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT GRID ── */}
        <section className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center 2 Columns: Description, Gallery, Services */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Description Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-layered space-y-3">
              <h2 className="text-xs font-extrabold uppercase text-[#0066FF] tracking-wider">İşletme Tanıtımı</h2>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {tenant.description}
              </p>
            </div>

            {/* Salon Gallery Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-layered space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-extrabold text-slate-900 font-display">
                  🖼️ Salon & Çalışma Galerisi
                </h2>
                <span className="text-xs font-bold text-slate-400">{galleryList.length} Fotoğraf</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {galleryList.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="h-28 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group relative shadow-xs"
                  >
                    <img
                      src={img}
                      alt={`${tenant.name} Galeri ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      🔍 Büyüt
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services & Prices Categorized List */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-layered space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-display">
                    ✂️ Hizmetler ve Fiyat Listesi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Almak istediğiniz randevu seansını seçin.</p>
                </div>
                <Link
                  href={`/book/${tenant.slug}`}
                  className="btn-primary-blue text-xs py-2.5 px-5 font-bold shadow-xs"
                >
                  Takvimi Gör ➔
                </Link>
              </div>

              <div className="space-y-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base font-display group-hover:text-[#0066FF] transition-colors">
                          {svc.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0066FF] text-[10px] font-bold">
                          {svc.category}
                        </span>
                      </div>
                      {svc.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">{svc.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                        <span>⏱ {svc.duration_minutes} Dakika</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">✨ Anında Onaylı</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span className="text-lg font-black font-mono text-emerald-600">₺{svc.price}</span>
                      <Link
                        href={`/book/${tenant.slug}`}
                        className="px-4 py-2.5 rounded-xl bg-[#0066FF] text-white font-extrabold text-xs shadow-sm hover:bg-blue-600 transition-all"
                      >
                        Randevu Al ➔
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff / Uzman Kadro Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-layered space-y-4">
              <h2 className="text-xl font-extrabold text-slate-900 font-display">
                👤 Uzman Kadro & Ekip
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {staffList.map((stf) => (
                  <div key={stf.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-[#0066FF] text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md">
                      👤
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm font-display">{stf.fullName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{stf.title || "İşletme Uzmanı"}</p>
                    </div>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                      ● Müsait
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Working Hours, Location, Contact */}
          <div className="space-y-6">
            
            {/* Working Hours Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-[#0066FF] tracking-wider flex items-center gap-2">
                <span>⏰</span> <span>Çalışma Saatleri</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Pazartesi - Cumartesi:</span>
                  <strong className="text-slate-900 font-bold">09:00 - 20:00</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Öğle Molası:</span>
                  <strong className="text-amber-700 font-bold">12:30 - 13:30</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span>Pazar:</span>
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">Kapalı</span>
                </div>
              </div>
            </div>

            {/* Address & Contact Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-[#0066FF] tracking-wider flex items-center gap-2">
                <span>📍</span> <span>Konum & İletişim</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Açık Adres</span>
                  <p className="text-slate-800 font-semibold mt-0.5 leading-relaxed">
                    {tenant.address}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">Telefon</span>
                  <p className="text-[#0066FF] font-mono font-bold mt-0.5">{tenant.phone || "+90 555 123 4567"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[10px]">E-Posta</span>
                  <p className="text-slate-700 font-mono mt-0.5">{tenant.email || "info@isletme.com"}</p>
                </div>
              </div>
            </div>

            {/* Sticky Booking CTA Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white shadow-xl space-y-4">
              <h3 className="text-lg font-black font-display text-white">Online Randevunuzu Oluşturun</h3>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                Üyelik şartı olmadan 30 saniyede takvimden saatinizi seçin ve onayınızı alın.
              </p>
              <Link
                href={`/book/${tenant.slug}`}
                className="w-full py-3.5 rounded-2xl bg-[#0066FF] hover:bg-blue-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition-all text-center block"
              >
                📅 Randevu Takvimine Git ➔
              </Link>
            </div>

          </div>

        </section>

        {/* Lightbox Image Preview Modal */}
        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer animate-in fade-in duration-200"
          >
            <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-700 shadow-2xl">
              <img src={selectedImage} alt="Galeri Büyütülmüş Görsel" className="w-full h-full object-contain" />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 text-white font-bold text-lg flex items-center justify-center border border-slate-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
