// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Multi-Vertical Type Definitions
// Tüm sektörel tip tanımları bu dosyada merkezi olarak yönetilir.
// ─────────────────────────────────────────────────────────────────────────────

/** Desteklenen üst sektör kategorileri */
export type VerticalKey = 'salon' | 'hukuk' | 'restoran';

/**
 * Mevcut BusinessSector → VerticalKey eşleme haritası.
 * Eski 'sector' alanından (beauty, spa, barber...) yeni 'vertical' alanına geçiş.
 */
export const SECTOR_TO_VERTICAL: Record<string, VerticalKey> = {
  beauty:   'salon',
  spa:      'salon',
  barber:   'salon',
  massage:  'salon',
  clinic:   'salon', // Klinik ilerleyen sprintte ayrı dikey olabilir
  salon:    'salon',
  hukuk:    'hukuk',
  restoran: 'restoran',
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
  accentColor: 'cyan' | 'violet' | 'amber';
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

/** Salon'a özel rezervasyon verisi */
export interface SalonBookingMetadata {
  serviceId: string;
  serviceName: string;
  staffId?: string;
  staffName?: string;
  workstationId?: string;
}

/** Hukuk bürosuna özel rezervasyon verisi */
export interface HukukBookingMetadata {
  caseTypeId: string;
  caseTypeName: string;
  documentUrls: string[];
  depositPaid: boolean;
  depositAmount: number;
  paymentRef?: string;
}

/** Restorana özel rezervasyon verisi */
export interface RestoranBookingMetadata {
  guestCount: number;
  tableId: string;
  tableLabel: string;
  depositPaid: boolean;
  depositAmount: number;
  specialRequests?: string;
}

/** Polimorfik rezervasyon form state — V tipiyle daraltılır */
export type BookingMetadata<V extends VerticalKey> =
  V extends 'salon'    ? SalonBookingMetadata :
  V extends 'hukuk'   ? HukukBookingMetadata :
  RestoranBookingMetadata;

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
