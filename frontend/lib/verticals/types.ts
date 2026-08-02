// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Multi-Vertical Type Definitions
// Tüm sektörel tip tanımları bu dosyada merkezi olarak yönetilir.
// ─────────────────────────────────────────────────────────────────────────────

/** Desteklenen dikey sektör kategorileri */
export type VerticalKey =
  | 'salon'     // Güzellik, Kuaför, Estetik
  | 'clinic'    // Diş, Dermatoloji, Fizik Tedavi, Poliklinik
  | 'auto'      // Oto Kuaför, Detailing, Lastik, Servis
  | 'fitness'   // Butik Fitness, Pilates, Yoga, PT
  | 'vet'       // Veteriner, Pet Grooming, Pet Otel
  | 'coaching'  // Özel Ders, Psikolojik Danışmanlık, Koçluk
  | 'legal'     // Hukuk Bürosu, Mali Müşavirlik
  | 'photo'     // Fotoğraf Stüdyosu, Ekipman Kiralama
  | 'spa'       // Spa, Masaj, Wellness, Termal
  | 'coworking' // Toplantı Odası, Ortak Çalışma Alanı
  | 'driving'   // Sürücü Kursu, Direksiyon Eğitimi
  | 'restoran'  // Restoran, Masa Rezervasyonu
  | 'hukuk';    // Legacy alias for legal

/**
 * Mevcut BusinessSector → VerticalKey eşleme haritası.
 */
export const SECTOR_TO_VERTICAL: Record<string, VerticalKey> = {
  beauty:     'salon',
  barber:     'salon',
  salon:      'salon',
  massage:    'spa',
  spa:        'spa',
  clinic:     'clinic',
  dental:     'clinic',
  auto:       'auto',
  detailing:  'auto',
  fitness:    'fitness',
  pilates:    'fitness',
  vet:        'vet',
  grooming:   'vet',
  coaching:   'coaching',
  consulting: 'coaching',
  legal:      'legal',
  hukuk:      'legal',
  photo:      'photo',
  coworking:  'coworking',
  driving:    'driving',
  restoran:   'restoran',
};

/** Bir sektörün tam tanım yapısı (SEO, UI, dashboard metadata) */
export interface VerticalDefinition {
  /** URL slug: /sektorler/[slug] */
  slug: VerticalKey;
  /** Türkçe görünen ad */
  label: string;
  /** Dashboard'da kullanıcıya gösterilen sektör adı */
  displayName: string;
  /** Browser tab başlığı */
  seoTitle: string;
  /** Meta description */
  seoDescription: string;
  /** OG Description (sosyal paylaşım) */
  ogDescription: string;
  /** Hero bölümü başlık */
  heroHeadline: string;
  /** Hero bölümü alt başlık */
  heroSubline: string;
  /** Tasarım aksanı rengi (Tailwind sınıf adı) */
  accentColor: 'cyan' | 'violet' | 'amber' | 'emerald' | 'orange' | 'lime' | 'teal' | 'indigo' | 'rose' | 'purple' | 'sky' | 'yellow';
  /** Emoji/ikon temsili */
  icon: string;
  /** Dashboard'da "Müşteri" yerine geçen terminoloji */
  customerLabel: string;
  /** Dashboard'da "Randevu" yerine geçen terminoloji */
  appointmentLabel: string;
  /** Dashboard'da "Hizmet" yerine geçen terminoloji */
  serviceLabel: string;
  /** Sektöre özel asimetrik fiyatlandırma rozeti */
  pricingBadge: string;
  /** Sektöre özel fiyatlandırma modeli açıklaması */
  pricingModelDescription: string;
  /** Ayarlar sayfasında gösterilen özelleştirilmiş başlık (örn. Bürosu Ayarları, Klinik Ayarları) */
  settingsTitle?: string;
}

// ─── Rezervasyon Formu Tipleri ────────────────────────────────────────────────

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface DateTimeSelection {
  date: string;       // ISO: "2024-03-15"
  startTime: string;  // "14:30"
  endTime: string;    // "15:30"
}

/** Generic / Sektörel rezervasyon verisi */
export interface GenericBookingMetadata {
  serviceId?: string;
  serviceName?: string;
  staffId?: string;
  staffName?: string;
  resourceIds?: string[];
  depositPaid?: boolean;
  depositAmount?: number;
  specialRequests?: string;
  sectorExtraJson?: string;

  // Sektöre özel opsiyonel alanlar
  guestCount?: number;
  tableId?: string;
  tableLabel?: string;
  caseTypeId?: string;
  caseTypeName?: string;
  documentUrls?: string[];
}


export type BookingMetadata<V extends VerticalKey> = GenericBookingMetadata;


export interface BookingFormState<V extends VerticalKey = VerticalKey> {
  vertical: V;
  currentStepIndex: number;
  isSubmitting: boolean;
  customerInfo: Partial<CustomerInfo>;
  dateTime: Partial<DateTimeSelection>;
  metadata: Partial<BookingMetadata<V>>;
}

/** Tek bir form adımının tanımı */
export interface BookingStep {
  id: string;
  label: string;
  /** Adımın tamamlanıp tamamlanmadığını kontrol eden fonksiyon */
  isComplete: (state: BookingFormState<VerticalKey>) => boolean;
}

// ─── Dashboard Tipleri ────────────────────────────────────────────────────────

export interface MenuItem {
  href: string;
  label: string;
  /** Icon bileşen adı (string key — DynamicSidebar resolve eder) */
  iconKey: string;
  /** Erişim için gereken minimum rol */
  minRole: 'customer' | 'staff' | 'owner' | 'admin';
  /** Sadece bu sektörde göster (undefined = tüm sektörler) */
  verticalOnly?: VerticalKey;
  /** URL'e eklenen tab query parametresi */
  tabKey?: string;
}

export interface StatsCardDef {
  /** Stats veri anahtarı */
  key: string;
  label: string;
  iconKey: string;
  /** Değerin nasıl formatlanacağı */
  format: 'number' | 'currency' | 'percent';
  /** Renk tonu */
  colorKey: 'blue' | 'green' | 'amber' | 'red' | 'violet';
}

export interface OnboardingStepDef {
  id: string;
  title: string;
  description: string;
  /** Tamamlandı mı kontrolü için settings key'i */
  settingsKey: string;
}
