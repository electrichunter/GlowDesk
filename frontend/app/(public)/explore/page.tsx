"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SalonCard from "@/components/salon/SalonCard";
import { safeJsonParse } from "@/lib/sanitize";
import { TURKEY_CITIES } from "@/lib/cities";
import type { Tenant } from "@/lib/types";

export default function ExplorePage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("all");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    const fetchRealTenants = async () => {
      try {
        const { apiRequest } = await import("@/lib/api-client");
        const { data, error } = await apiRequest<Tenant[]>("/tenants");
        if (data && Array.isArray(data)) {
          setTenants(data);
        } else {
          setTenants([]);
        }
      } catch (err) {
        console.error("FastAPI explore fetch error:", err);
        setTenants([]);
      }
    };

    fetchRealTenants();
  }, []);

  // Mevcut ilçeler ve mahalleler
  const availableDistricts = Array.from(
    new Set(tenants.map((t) => t.settings.district).filter(Boolean))
  ) as string[];

  const availableNeighborhoods = Array.from(
    new Set(
      tenants
        .filter((t) => selectedDistrict === "all" || t.settings.district === selectedDistrict)
        .map((t) => t.settings.neighborhood)
        .filter(Boolean)
    )
  ) as string[];

  // Geolocation fonksiyonu
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setGeoLoading(true);
    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
      },
      () => {
        // Konum izni verilmezse Nişantaşı/Şişli varsayılan merkez alalım
        setUserCoords({ lat: 41.0469, lng: 28.9931 });
        setGeoLoading(false);
      }
    );
  };

  // İki koordinat arası mesafe hesabı (Haversine formülü - km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Filtreleme & Mesafe Sıralaması
  const filteredTenants = tenants
    .map((tenant) => {
      let distance: string | null = null;
      if (userCoords && tenant.settings.lat && tenant.settings.lng) {
        distance = calculateDistance(
          userCoords.lat,
          userCoords.lng,
          tenant.settings.lat,
          tenant.settings.lng
        );
      }
      return { ...tenant, distance };
    })
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.settings.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.settings.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.settings.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.settings.street?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCity = selectedCity === "all" || t.settings.city === selectedCity;
      const matchesSector = selectedSector === "all" || t.sector === selectedSector;
      const matchesDistrict = selectedDistrict === "all" || t.settings.district === selectedDistrict;
      const matchesNeighborhood =
        selectedNeighborhood === "all" || t.settings.neighborhood === selectedNeighborhood;

      return matchesSearch && matchesCity && matchesSector && matchesDistrict && matchesNeighborhood;
    })
    .sort((a, b) => {
      if (a.distance && b.distance) {
        return parseFloat(a.distance) - parseFloat(b.distance);
      }
      return 0;
    });

  return (
    <div className="bg-[#F1F5F9] text-[#334155] min-h-screen flex flex-col pt-20 font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        
        {/* Header & Konum Butonu */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest block mb-1">
              Güzellik • Berber • Masaj • Spa • Klinik
            </span>
            <h1 className="text-3xl font-extrabold text-[#1E1B4B] font-display">
              Konumunuza En Yakın Salonu Keşfedin
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Güzellik salonu, berber, masaj merkezi, spa veya klinik — il, ilce veya isim aratarak çevrenizdeki işletmeleri inceleyin ve aninda online randevunuzu alın.
            </p>
          </div>

          <button
            onClick={handleGetLocation}
            disabled={geoLoading}
            className="btn-cyan text-xs py-3 px-5 shadow-md self-start md:self-auto flex items-center gap-2"
          >
            {geoLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>📍 Konumumu Kullan (Yakınları Sırala)</span>
            )}
          </button>
        </div>

        {userCoords && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <span>✅ Konumunuz algılandı. Salonlar en yakından uzaza doğru sıralandı!</span>
            <button onClick={() => setUserCoords(null)} className="text-emerald-900 font-bold hover:underline">
              Sıralamayı Sıfırla
            </button>
          </div>
        )}

        {geoError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            ⚠️ {geoError}
          </div>
        )}

        {/* Detaylı Konum & Sektör Filtreleme Paneli */}
        <div className="brand-card p-5 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">
            <span>Filtreleme Seçenekleri</span>
            <span className="text-slate-400 font-normal">81 İl, İlçe ve Mahalle Düzeyinde Detaylı Arama</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metin Arama */}
            <div className="relative">
              <input
                type="text"
                placeholder="Salon adı, mahalle veya sokak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-dark !pl-10"
              />
              <span className="absolute left-3 top-3.5 text-slate-400 text-xs pointer-events-none">🔍</span>
            </div>

            {/* İl (Şehir) */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedDistrict("all");
                setSelectedNeighborhood("all");
              }}
              className="input-dark bg-white font-bold"
            >
              <option value="all">Tüm Şehirler (81 İl)</option>
              {TURKEY_CITIES.map((c) => (
                <option key={c} value={c}>
                  📍 {c}
                </option>
              ))}
            </select>

            {/* Sektör */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="input-dark bg-white"
            >
              <option value="all">Tüm Hizmet Sektörleri</option>
              <option value="beauty">💄 Güzellik Salonu</option>
              <option value="spa">🌿 Cilt Bakımı & Spa</option>
              <option value="clinic">🩺 Klinik & Özel Terapi</option>
              <option value="barber">💈 Berber & Erkek Kuaförü</option>
              <option value="massage">💆 Masaj & Wellness</option>
            </select>

            {/* İlçe */}
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedNeighborhood("all");
              }}
              className="input-dark bg-white"
            >
              <option value="all">Tüm İlçeler (İstanbul)</option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>

            {/* Mahalle */}
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="input-dark bg-white"
            >
              <option value="all">Tüm Mahalleler</option>
              {availableNeighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sonuç Listesi */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bulunan Salonlar ({filteredTenants.length})
            </span>
          </div>

          {filteredTenants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => (
                <div key={tenant.id} className="relative">
                  {tenant.distance && (
                    <div className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-md bg-[#1E1B4B] text-white text-[10px] font-bold shadow-md">
                      📏 ~{tenant.distance} km uzakta
                    </div>
                  )}
                  <SalonCard tenant={tenant} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 brand-card space-y-4 bg-white border border-slate-200">
              <span className="text-4xl block">🏪</span>
              <h3 className="text-lg font-black text-[#1E1B4B]">Henüz Kayıtlı Salon Bulunmuyor</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                Seçilen filtrelerde veya henüz sistemde açılmış gerçek salon bulunmuyor. Kendi berber, güzellik salonu veya spa işletmenizi 1 dakikada kaydedip müşterilerinizi kabul etmeye başlayabilirsiniz!
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCity("all");
                    setSelectedSector("all");
                    setSelectedDistrict("all");
                    setSelectedNeighborhood("all");
                  }}
                  className="btn-secondary text-xs px-4 py-2.5"
                >
                  Filtreleri Temizle
                </button>
                <Link
                  href="/register"
                  className="btn-cyan text-xs py-2.5 px-5 font-extrabold shadow-sm"
                >
                  ➕ İlk İşletmeyi Kaydet
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
}
