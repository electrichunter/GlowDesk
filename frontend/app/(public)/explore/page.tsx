"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { apiRequest } from "@/lib/api-client";

interface PublicTenant {
  id: string;
  name: string;
  slug: string;
  sector: string;
  phone?: string;
  address?: string;
  city: string;
  district: string;
  rating?: number;
  review_count?: number;
}

const SECTORS = [
  { key: "all", label: "Tüm Sektörler", icon: "✨" },
  { key: "beauty", label: "Güzellik", icon: "💄" },
  { key: "barber", label: "Berber", icon: "💈" },
  { key: "massage", label: "Masaj", icon: "💆" },
  { key: "spa", label: "Spa", icon: "🌿" },
  { key: "clinic", label: "Klinik", icon: "🩺" },
  { key: "auto", label: "Oto Bakım", icon: "🚗" },
  { key: "fitness", label: "Fitness", icon: "🏋️" },
  { key: "vet", label: "Veteriner", icon: "🐾" },
  { key: "coaching", label: "Koçluk", icon: "🎓" },
  { key: "legal", label: "Hukuk", icon: "⚖️" },
  { key: "photo", label: "Fotoğraf", icon: "📸" },
  { key: "coworking", label: "Coworking", icon: "🏢" },
  { key: "restoran", label: "Restoran", icon: "🍽️" },
];

const CITIES = ["Tüm Şehirler", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Kocaeli"];

export default function ExploreTenantsPage() {
  const [tenants, setTenants] = useState<PublicTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedCity, setSelectedCity] = useState("Tüm Şehirler");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTenants = async () => {
      setLoading(true);
      try {
        let url = "/tenants/public";
        const params = new URLSearchParams();
        if (selectedSector !== "all") params.append("sector", selectedSector);
        if (selectedCity !== "Tüm Şehirler") params.append("city", selectedCity);
        if (searchQuery.trim()) params.append("query", searchQuery.trim());

        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;

        const res = await apiRequest<PublicTenant[]>(url);
        if (res.data && Array.isArray(res.data)) {
          setTenants(res.data);
        } else {
          setTenants([]);
        }
      } catch (err) {
        console.error("Fetch tenants error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTenants, 250);
    return () => clearTimeout(timer);
  }, [selectedSector, selectedCity, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-6 w-full flex-1">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <span className="badge-blue-soft">🔍 Canlı İşletme Rehberi</span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display">
            İşletmeleri Keşfet & <span className="text-[#0066FF]">Online Randevu Al</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            GlowDesk kullanan seçkin salon, klinik ve işletmelerden üye olma şartı olmadan saniyeler içinde randevunuzu oluşturun.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-6 mb-10">
          
          {/* Top Bar: Search Input & City Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="İşletme adı veya hizmet ara (Örn: Zelza Güzellik, Avukat Ahmet)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all"
              />
              <span className="absolute left-4 top-3.5 text-slate-400 text-lg">🔍</span>
            </div>

            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#0066FF] focus:bg-white transition-all cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    📍 {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sector Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SECTORS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSelectedSector(s.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedSector === s.key
                    ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/25 scale-105"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tenant Grid List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-48 rounded-3xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : tenants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((t) => {
              const secObj = SECTORS.find((s) => s.key === t.sector) || SECTORS[1];
              return (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-layered hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0066FF] border border-blue-100 text-xs font-bold flex items-center gap-1">
                        <span>{secObj.icon}</span>
                        <span>{secObj.label}</span>
                      </span>
                      <div className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <span>★</span>
                        <span>{t.rating || 4.9}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 font-display group-hover:text-[#0066FF] transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span>📍</span>
                        <span>{t.district || "Merkez"}, {t.city || "İstanbul"}</span>
                      </p>
                    </div>

                    {t.address && (
                      <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                        {t.address}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">
                      📞 {t.phone || "+90 (555) 000 00 00"}
                    </span>
                    <Link
                      href={`/book/${t.slug}`}
                      className="btn-primary-blue text-xs py-2.5 px-5 shadow-sm group-hover:scale-105 transition-transform"
                    >
                      Randevu Al →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-xl mx-auto">
            <span className="text-5xl">🏪</span>
            <h3 className="text-xl font-extrabold text-slate-900 font-display">Aramanıza Uygun İşletme Bulunamadı</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Seçilen sektör veya şehirde henüz kayıtlı işletme bulunmuyor. Farklı filtreler deneyebilir veya kendi işletmenizi kaydedebilirsiniz.
            </p>
            <div className="pt-2">
              <Link href="/register/business" className="btn-primary-blue text-xs py-3 px-6">
                🚀 Kendi İşletmenizi Ücretsiz Kaydedin
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
