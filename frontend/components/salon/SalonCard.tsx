import Link from "next/link";
import Image from "next/image";
import type { Tenant } from "@/lib/types";
import { getSectorLabel, getSectorIcon, getSectorColor } from "@/__mocks__/mock-data";
import { Card } from "@/components/ui/Card";

interface SalonCardProps {
  tenant: Tenant;
}

export default function SalonCard({ tenant }: SalonCardProps) {
  const settings = tenant.settings;

  // Sektöre uygun kapak görseli
  const getIllustration = (sector: string) => {
    switch (sector) {
      case "spa":     return "/ilitrasyon/maske.jpg";
      case "clinic":  return "/ilitrasyon/sackesimi.png";
      case "barber":  return "/ilitrasyon/sackesimi.png";
      case "massage": return "/ilitrasyon/maske.jpg";
      default:        return "/ilitrasyon/Makyaj.png";
    }
  };

  // Sektöre göre renk teması
  const sectorColor = getSectorColor(tenant.sector);
  const sectorIcon  = getSectorIcon(tenant.sector);
  const sectorLabel = getSectorLabel(tenant.sector);

  // Premium badge etiketi sektöre göre
  const getPremiumLabel = (sector: string) => {
    const labels: Record<string, string> = {
      beauty:  "💎 Kurumsal Güzellik Salonu",
      spa:     "🌿 Premium Spa & Wellness",
      clinic:  "🩺 Uzman Klinik",
      barber:  "💈 Profesyonel Berber",
      massage: "💆 Wellness Merkezi",
    };
    return labels[sector] || "💎 Premium İşletme";
  };

  return (
    <Card variant="interactive" className="overflow-hidden flex flex-col justify-between group h-full bg-white border-slate-200">
      <div>
        {/* Görsel Alan */}
        <div
          className="h-48 relative p-4 flex items-center justify-center border-b border-slate-100 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${sectorColor.bg} 0%, #F8FAFC 100%)` }}
        >
          <div className="relative w-full h-full max-h-40">
            <Image
              src={getIllustration(tenant.sector)}
              alt={tenant.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-extrabold text-[#1E1B4B] border border-slate-200 shadow-xs">
            {settings.review_count && settings.review_count > 0 ? (
              <span>★ {settings.rating} ({settings.review_count})</span>
            ) : (
              <span className="text-cyan-700">🆕 Yeni Salon</span>
            )}
          </div>

          {/* Sektör Badge */}
          <div
            className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider shadow-xs flex items-center gap-1"
            style={{ backgroundColor: sectorColor.text, color: "#FFFFFF" }}
          >
            {sectorIcon} {sectorLabel}
          </div>

          {/* Gender Focus Badge (Berber için) */}
          {settings.gender_focus === "male" && (
            <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
              ♂ Erkek
            </div>
          )}
          {settings.gender_focus === "unisex" && (
            <div className="absolute top-3 left-3 bg-teal-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide">
              Unisex
            </div>
          )}
        </div>

        {/* Bilgi Bölümü */}
        <div className="p-5 space-y-3">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold" style={{ color: sectorColor.text }}>
                {tenant.subscription_tier === "pro" ? getPremiumLabel(tenant.sector) : "Standart"}
              </span>
              {settings.staff_count && (
                <span className="text-slate-400 text-[10px]">
                  {settings.staff_count} uzman
                </span>
              )}
            </div>

            <h3 className="text-lg font-extrabold text-[#1E1B4B] group-hover:text-cyan-600 transition-colors">
              {tenant.name}
            </h3>
          </div>

          {/* Konum Detayı */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span>📍</span>
              <span>{settings.district}, {settings.city}</span>
            </div>
            {(settings.neighborhood || settings.street) && (
              <p className="text-[11px] text-slate-500 pl-5 leading-normal">
                {settings.neighborhood} {settings.street} {settings.address ? `(${settings.address})` : ""}
              </p>
            )}
          </div>

          {/* Extra: Park / Instagram */}
          {(settings.parking_available || settings.instagram) && (
            <div className="flex flex-wrap gap-2">
              {settings.parking_available && (
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                  🅿️ Otopark
                </span>
              )}
              {settings.instagram && (
                <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-semibold">
                  📸 {settings.instagram}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {settings.description || "Profesyonel hizmet ve sektör uzmanlığıyla hizmetinizdeyiz."}
          </p>
        </div>
      </div>

      {/* Aksiyon Butonu */}
      <div className="p-5 pt-0">
        <Link
          href={`/salon/${tenant.slug}`}
          className="w-full text-center text-xs font-bold text-[#1E1B4B] bg-slate-100 group-hover:bg-[#1E1B4B] group-hover:text-white py-3 rounded-xl border border-slate-200 transition-all block shadow-xs"
        >
          Randevu Saatlerini İncele →
        </Link>
      </div>
    </Card>
  );
}
