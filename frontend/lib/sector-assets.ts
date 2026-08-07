/**
 * GlowDesk — Sektör Bazlı Görsel, İkon ve Varsayılan Varlık Kütüphanesi
 * Her sektör (Veteriner, Berber, Güzellik, Diş, Diyetisyen, Oto Bakım vb.)
 * kendine ait özel görsel, logo, galeri ve rozet ile sergilenir.
 */

export interface SectorAssetInfo {
  key: string;
  label: string;
  icon: string;
  badgeBg: string;
  coverImage: string;
  logoImage: string;
  galleryImages: string[];
  defaultServices: { id: string; name: string; price: number; duration_minutes: number; category: string }[];
  defaultStaff: { id: string; fullName: string; role: string; title: string }[];
}

export const SECTOR_ASSET_MAP: Record<string, SectorAssetInfo> = {
  vet: {
    key: "vet",
    label: "Veteriner & Pet Bakım",
    icon: "🐾",
    badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
    coverImage: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "vet-s1", name: "Genel Muayene & Pet Aşılama Seansı", price: 600, duration_minutes: 45, category: "Sağlık & Muayene" },
      { id: "vet-s2", name: "Kedi & Köpek Hijyenik Tıraş & Banyo", price: 750, duration_minutes: 60, category: "Pet Grooming" },
      { id: "vet-s3", name: "Ultrasonik Diş Taş Temizliği", price: 1100, duration_minutes: 60, category: "Diş & Ağız Sağlığı" },
      { id: "vet-s4", name: "VIP Pet Otel Günlük Konaklama", price: 800, duration_minutes: 1440, category: "Pet Otel" },
    ],
    defaultStaff: [
      { id: "vet-st1", fullName: "Dr. Mehmet Demir", role: "staff", title: "Uzman Veteriner Hekim" },
      { id: "vet-st2", fullName: "Zeynep Arslan", role: "staff", title: "Pet Grooming & Bakım Uzmanı" },
    ],
  },

  berber: {
    key: "berber",
    label: "Erkek Berber & Kuaför",
    icon: "💈",
    badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
    coverImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "brb-s1", name: "Erkek Saç Kesim & Yıkama Şekillendirme", price: 350, duration_minutes: 40, category: "Saç Tasarım" },
      { id: "brb-s2", name: "Sakal Tasarım & Sıcak Havlu Terapi", price: 250, duration_minutes: 30, category: "Sakal Bakımı" },
      { id: "brb-s3", name: "VIP Komple Bakım (Saç + Sakal + Cilt)", price: 750, duration_minutes: 75, category: "VIP Paketler" },
    ],
    defaultStaff: [
      { id: "brb-st1", fullName: "Ahmet Usta", role: "staff", title: "Baş Erkek Berberi" },
      { id: "brb-st2", fullName: "Burak Kaya", role: "staff", title: "Saç & Sakal Tasarımcısı" },
    ],
  },

  dis: {
    key: "dis",
    label: "Diş Kliniği & Ağız Sağlığı",
    icon: "🦷",
    badgeBg: "bg-cyan-50 text-cyan-900 border-cyan-200",
    coverImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "dis-s1", name: "Detaylı Ağız & Diş Sağlığı Muayenesi", price: 500, duration_minutes: 30, category: "Teşhis & Muayene" },
      { id: "dis-s2", name: "Detertraj (Diş Taşı Temizliği)", price: 900, duration_minutes: 45, category: "Hijyen & Temizlik" },
      { id: "dis-s3", name: "Estetik Diş Beyazlatma (Bleaching)", price: 2500, duration_minutes: 60, category: "Estetik Gülüş" },
    ],
    defaultStaff: [
      { id: "dis-st1", fullName: "Dt. Selin Öztürk", role: "staff", title: "Uzman Diş Hekimi" },
      { id: "dis-st2", fullName: "Dt. Can Yıldız", role: "staff", title: "Estetik Diş Hekimi" },
    ],
  },

  diyetisyen: {
    key: "diyetisyen",
    label: "Beslenme & Diyet Klinikleri",
    icon: "🥗",
    badgeBg: "bg-emerald-50 text-emerald-900 border-emerald-200",
    coverImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "dyt-s1", name: "Vücut Analizi (InBody) & İlk Görüşme", price: 650, duration_minutes: 45, category: "Danışmanlık" },
      { id: "dyt-s2", name: "Kişiye Özel Haftalık Beslenme Programı", price: 1200, duration_minutes: 60, category: "Diyet Paketi" },
    ],
    defaultStaff: [
      { id: "dyt-st1", fullName: "Dyt. Merve Çelik", role: "staff", title: "Uzman Diyetisyen" },
    ],
  },

  oto: {
    key: "oto",
    label: "Oto Detailing & Servis",
    icon: "🚗",
    badgeBg: "bg-slate-100 text-slate-900 border-slate-300",
    coverImage: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "oto-s1", name: "Detaylı İç & Dış Cilalı Yıkama", price: 400, duration_minutes: 60, category: "Yıkama" },
      { id: "oto-s2", name: "Pasta Cila & Seramik Kaplama", price: 3500, duration_minutes: 240, category: "Detailing" },
    ],
    defaultStaff: [
      { id: "oto-st1", fullName: "Hakan Usta", role: "staff", title: "Detailing Şefi" },
    ],
  },

  restoran: {
    key: "restoran",
    label: "Restoran & Kafe Masa Rezarvasyonu",
    icon: "🍽️",
    badgeBg: "bg-rose-50 text-rose-900 border-rose-200",
    coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "rst-s1", name: "Standart Masa Rezervasyonu (2-4 Kişi)", price: 0, duration_minutes: 120, category: "Masa Rezervasyonu" },
      { id: "rst-s2", name: "VİP Teras / Özel Kutlama Masası", price: 500, duration_minutes: 180, category: "Özel Etkinlik" },
    ],
    defaultStaff: [
      { id: "rst-st1", fullName: "Maitre D' Kaan", role: "staff", title: "Masa & Karşılama Şefi" },
    ],
  },

  fitness: {
    key: "fitness",
    label: "Fitness & Pilates Stüdyosu",
    icon: "🏋️",
    badgeBg: "bg-indigo-50 text-indigo-900 border-indigo-200",
    coverImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "fit-s1", name: "Birebir Reformer Pilates Özel Seansı", price: 750, duration_minutes: 50, category: "Pilates" },
      { id: "fit-s2", name: "Kişisel Antrenör (PT) Deneme Dersi", price: 600, duration_minutes: 60, category: "Personal Training" },
    ],
    defaultStaff: [
      { id: "fit-st1", fullName: "Gizem Eğitmen", role: "staff", title: "Kıdemli Pilates Eğitmeni" },
    ],
  },

  guzellik: {
    key: "guzellik",
    label: "Güzellik Salonu & Estetik",
    icon: "💄",
    badgeBg: "bg-pink-50 text-pink-900 border-pink-200",
    coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80",
    logoImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
    ],
    defaultServices: [
      { id: "gzk-s1", name: "Kadın Saç Kesim & Şekillendirme", price: 450, duration_minutes: 45, category: "Saç Hizmetleri" },
      { id: "gzk-s2", name: "Profesyonel Manikür & Pedikür Bakım", price: 550, duration_minutes: 60, category: "Tırnak Bakımı" },
      { id: "gzk-s3", name: "Medikal Cilt Bakımı & Serum Yükleme", price: 850, duration_minutes: 90, category: "Cilt Bakımı" },
    ],
    defaultStaff: [
      { id: "gzk-st1", fullName: "Elif Demir", role: "staff", title: "Baş Kuaför & Hair Stylist" },
      { id: "gzk-st2", fullName: "Zeynep Kaya", role: "staff", title: "Estetik & Cilt Uzmanı" },
    ],
  },
};

/**
 * Returns sector assets by sector key or slug prefix
 */
export function getSectorAsset(sectorOrSlug?: string | null): SectorAssetInfo {
  if (!sectorOrSlug) return SECTOR_ASSET_MAP.guzellik;
  const lower = sectorOrSlug.toLowerCase();

  if (lower.includes("vet")) return SECTOR_ASSET_MAP.vet;
  if (lower.includes("berber") || lower.includes("barber")) return SECTOR_ASSET_MAP.berber;
  if (lower.includes("diş") || lower.includes("dis") || lower.includes("dental") || lower.includes("klinik")) return SECTOR_ASSET_MAP.dis;
  if (lower.includes("diyet") || lower.includes("nutrition")) return SECTOR_ASSET_MAP.diyetisyen;
  if (lower.includes("oto") || lower.includes("car")) return SECTOR_ASSET_MAP.oto;
  if (lower.includes("restoran") || lower.includes("restaurant") || lower.includes("cafe")) return SECTOR_ASSET_MAP.restoran;
  if (lower.includes("fit") || lower.includes("pilates") || lower.includes("spu")) return SECTOR_ASSET_MAP.fitness;

  return SECTOR_ASSET_MAP.guzellik;
}
