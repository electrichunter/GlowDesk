// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Merkezi Sektör Konfigürasyon Deposu (VERTICAL_CONFIG Registry)
// Her sektörün SEO, UI ve dashboard metadata'sını tek yerden yönetir.
// ─────────────────────────────────────────────────────────────────────────────

import type { VerticalDefinition, VerticalKey } from './types';

export const VERTICAL_CONFIG: Record<VerticalKey, VerticalDefinition> = {
  // ── 1. Güzellik & Bakım Salonları ─────────────────────────────────────────────
  salon: {
    slug: 'salon',
    label: 'Güzellik Salonu',
    displayName: 'Salon Yönetimi',
    seoTitle: 'Güzellik Salonu Yönetim Yazılımı | GlowDesk',
    seoDescription: 'Randevu, personel, hizmet ve müşteri yönetimini tek ekrandan yapın. No-show koruması, SMS hatırlatma ve gelir raporları ile salonunuzu büyütün.',
    ogDescription: 'Türkiye\'nin en akıllı güzellik salonu yönetim platformu.',
    heroHeadline: 'Salonunuzu Akıllıca Yönetin, Büyütün',
    heroSubline: 'Randevu çakışması yok. No-show kaybı yok. Sadece mutlu müşteriler ve büyüyen ciro.',
    accentColor: 'cyan',
    icon: '✂️',
    customerLabel: 'Müşteri',
    appointmentLabel: 'Randevu',
    serviceLabel: 'Hizmet',
    pricingBadge: 'Personel & Koltuk Bazlı SaaS',
    pricingModelDescription: 'Aylık sabit abonelik paketi. Sınırsız müşteri ve SMS bildirim desteği.',
  },

  // ── 2. Diş Klinikleri ve Poliklinikler ──────────────────────────────────────
  clinic: {
    slug: 'clinic',
    label: 'Özel Sağlık & Diş Kliniği',
    displayName: 'Klinik Yönetimi',
    seoTitle: 'Diş Kliniği ve Poliklinik Yönetim Yazılımı | GlowDesk',
    seoDescription: 'Odontogram, hasta anamnez formları, hekim-koltuk-asistan üçlü takvim kilitleme ve laboratuvar iş emri takibi.',
    ogDescription: 'Diş klinikleri ve sağlık merkezleri için akıllı dijital klinik yönetim platformu.',
    heroHeadline: 'Klinik İş Akışınızı Dijitalleştirin',
    heroSubline: 'Hasta anamnezi, 3\'lü kaynak eşleştirme ve laboratuvar takibi tek ekranda.',
    accentColor: 'emerald',
    icon: '🦷',
    customerLabel: 'Hasta',
    appointmentLabel: 'Muayene / Tedavi',
    serviceLabel: 'İşlem / Protokol',
    pricingBadge: 'Koltuk / Ünit Bazlı SaaS',
    pricingModelDescription: 'Klinik koltuk sayısına göre ölçeklenen kurumsal paket.',
  },

  // ── 3. Oto Servis & Detaylı Temizlik ───────────────────────────────────────
  auto: {
    slug: 'auto',
    label: 'Oto Bakım & Detailing Servisi',
    displayName: 'Servis & Lift Yönetimi',
    seoTitle: 'Oto Servis & Detailing Randevu Yazılımı | GlowDesk',
    seoDescription: 'Lift ve bay kapasite yönetimi, dijital araç kabul hasar tespiti, yedek parça iş emri ve canlı takip linki.',
    ogDescription: 'Oto servis ve yıkama merkezleri için kapasite ve iş emri yönetim yazılımı.',
    heroHeadline: 'Lift Sınırına Takılmadan Servis Yönetin',
    heroSubline: 'Plaka bazlı servis geçmişi, dijital araç kabul ve canlı WhatsApp takip linki.',
    accentColor: 'orange',
    icon: '🚗',
    customerLabel: 'Araç Sahibi',
    appointmentLabel: 'Servis Randevusu',
    serviceLabel: 'Hizmet / İş Emri',
    pricingBadge: 'Sınırsız Plaka • Sabit Fiyat',
    pricingModelDescription: 'Aylık sabit ücret, yedek parça pazaryeri entegrasyonu.',
  },

  // ── 4. Fitness, Pilates & Yoga Stüdyoları ──────────────────────────────────
  fitness: {
    slug: 'fitness',
    label: 'Butik Fitness & Pilates Stüdyosu',
    displayName: 'Stüdyo & Üyelik Yönetimi',
    seoTitle: 'Pilates & Fitness Stüdyosu Yönetim Yazılımı | GlowDesk',
    seoDescription: 'Kontenjan ve asenkron bekleme listesi, kredi/paket düşüm defteri, late-cancellation burn kuralı ve eğitmen hakediş.',
    ogDescription: 'Butik stüdyolar için ders, üyelik ve eğitmen prim yönetim platformu.',
    heroHeadline: 'Ders Kontenjanlarını %100 Dolulukla Yönetin',
    heroSubline: 'Otomatik waitlist sırası, ders kredisi düşümü ve şeffaf eğitmen hakediş tablosu.',
    accentColor: 'lime',
    icon: '💪',
    customerLabel: 'Üye',
    appointmentLabel: 'Ders / Seans',
    serviceLabel: 'Ders Türü',
    pricingBadge: 'Üye Kredi + White-label POS',
    pricingModelDescription: 'Paket satışlarında düşük POS komisyonu ve sınırsız üyelik takibi.',
  },

  // ── 5. Veteriner Klinikleri & Pet Grooming ──────────────────────────────────
  vet: {
    slug: 'vet',
    label: 'Veteriner Kliniği & Pet Grooming',
    displayName: 'Pet & Klinik Yönetimi',
    seoTitle: 'Veteriner & Pet Grooming Randevu Yazılımı | GlowDesk',
    seoDescription: 'Yasal aşı takvimi, pet ırk ve mizaç bazlı süre hesaplayıcı, pet otel ve grooming saatsel/gecelik hibrit takvim.',
    ogDescription: 'Veteriner ve pet bakım merkezleri için sağlık karnesi ve otel rezervasyon platformu.',
    heroHeadline: 'Pet Dostlarımızın Sağlığını ve Randevularını Yönetin',
    heroSubline: 'Otomatik aşı hatırlatma, pet mizaç notları ve grooming medya galerisi.',
    accentColor: 'teal',
    icon: '🐾',
    customerLabel: 'Hasta Sahibi',
    appointmentLabel: 'Muayene / Grooming',
    serviceLabel: 'Sağlık / Bakım İşlemi',
    pricingBadge: 'Aşı SMS Pass-Through + SaaS',
    pricingModelDescription: 'Aylık lisanslama + SMS/WhatsApp aşı duyuru paketleri.',
  },

  // ── 6. Özel Ders, Psikolojik Danışmanlık & Koçluk ─────────────────────────
  coaching: {
    slug: 'coaching',
    label: 'Özel Ders & Danışmanlık',
    displayName: 'Seans & Müfredat Yönetimi',
    seoTitle: 'Psikolojik Danışmanlık & Özel Ders Randevu Yazılımı | GlowDesk',
    seoDescription: 'AES-256 şifreli seans notları, müfredat ve hedef takip çarkı, tekrarlayan slot kilitletme ve otomatik Zoom linki.',
    ogDescription: 'Danışmanlar ve eğitmenler için şifreli seans ve müfredat yönetim platformu.',
    heroHeadline: 'Danışan Seanslarını ve İlerlemeyi Dijitalleştirin',
    heroSubline: 'Uçtan uca şifreli seans notları, otomatik video konferans oda üretimi.',
    accentColor: 'indigo',
    icon: '📚',
    customerLabel: 'Öğrenci / Danışan',
    appointmentLabel: 'Seans / Ders',
    serviceLabel: 'Müfredat / Ders Türü',
    pricingBadge: 'Seans Tahsilat Payı + SaaS',
    pricingModelDescription: 'Online ödemelerde %1.5 komisyon payı + Sınırsız danışan arşivi.',
  },

  // ── 7. Hukuk Büroları & Mali Müşavirlik ────────────────────────────────────
  legal: {
    slug: 'legal',
    label: 'Hukuk & Mali Müşavirlik Ofisi',
    displayName: 'Müvekkil & Dava Yönetimi',
    seoTitle: 'Hukuk Bürosu & Avukat Randevu Yazılımı | GlowDesk',
    seoDescription: 'Ön ödemeli danışmanlık paywall, duruşma ve delil takvimi, avans bakiyesi uyarısı ve UYAP entegrasyonu.',
    ogDescription: 'Avukatlar ve mali müşavirler için ön ödemeli randevu ve müvekkil yönetim platformu.',
    heroHeadline: 'Faturalandırılabilir Süreyi ve Müvekkil Avansını Koruyun',
    heroSubline: 'Ön ödemeli paywall, duruşma bağlantılı takvim ve avans bakiye uyarısı.',
    accentColor: 'violet',
    icon: '⚖️',
    customerLabel: 'Müvekkil',
    appointmentLabel: 'Görüşme / Duruşma',
    serviceLabel: 'Danışmanlık Türü',
    pricingBadge: 'Güvenli Tahsilat + Premium SaaS',
    pricingModelDescription: 'Müvekkil ön ödemelerinde düşük %2 işlem ücreti.',
  },
  hukuk: {
    slug: 'hukuk',
    label: 'Hukuk Bürosu',
    displayName: 'Hukuk Bürosu Yönetimi',
    seoTitle: 'Hukuk Bürosu Randevu ve Dava Yönetimi | GlowDesk',
    seoDescription: 'Danışmanlık randevularını, ön ödemeleri ve müvekkil belgelerini dijitalleştirin.',
    ogDescription: 'Avukatlar için akıllı takvim, müvekkil ve ödeme yönetimi platformu.',
    heroHeadline: 'Hukuki Danışmanlığı Profesyonelce Yönetin',
    heroSubline: 'Randevu, belge ve ödeme yönetimini tek platformda birleştirin.',
    accentColor: 'violet',
    icon: '⚖️',
    customerLabel: 'Müvekkil',
    appointmentLabel: 'Görüşme',
    serviceLabel: 'Danışmanlık Türü',
    pricingBadge: 'Güvenli Tahsilat + Premium SaaS',
    pricingModelDescription: 'Müvekkil ön ödemelerinde düşük %2 işlem ücreti.',
  },

  // ── 8. Fotoğraf Stüdyoları & Ekipman Kiralama ──────────────────────────────
  photo: {
    slug: 'photo',
    label: 'Fotoğraf Stüdyosu & Kiralama',
    displayName: 'Stüdyo & Ekipman Yönetimi',
    seoTitle: 'Fotoğraf Stüdyosu & Kiralama Yazılımı | GlowDesk',
    seoDescription: 'Plato + kamera + ışık seti paket rezervasyonu, su geçirmez galeri seçki merkezi ve teminat blokesi.',
    ogDescription: 'Stüdyolar için ekipman envanteri ve kiralama yönetim platformu.',
    heroHeadline: 'Stüdyo Platolarını ve Ekipman Kiralama Akışını Yönetin',
    heroSubline: 'Çoklu varlık paketi, müşteri galeri seçki merkezi ve kart teminat blokesi.',
    accentColor: 'rose',
    icon: '📸',
    customerLabel: 'Müşteri',
    appointmentLabel: 'Çekim / Kiralama',
    serviceLabel: 'Çekim Türü / Paket',
    pricingBadge: 'Teminat Bloke Komisyonu + SaaS',
    pricingModelDescription: 'Kart ön otorizasyon blokelerinde düşük komisyon.',
  },

  // ── 9. Spa, Masaj & Wellness Merkezleri ────────────────────────────────────
  spa: {
    slug: 'spa',
    label: 'Spa, Masaj & Wellness Tesisleri',
    displayName: 'Spa & Terapi Yönetimi',
    seoTitle: 'Spa & Masaj Salonu Yönetim Yazılımı | GlowDesk',
    seoDescription: 'Termal rota planlayıcı, VIP suit eşzamanlı rezervasyon motoru, dijital hediye çeki otomasyonu ve sağlık kısıt uyarıları.',
    ogDescription: 'Spa ve masaj merkezleri için VIP oda ve hediye çeki yönetim platformu.',
    heroHeadline: 'Kesintisiz Rahatlama Deneyimi Sunun',
    heroSubline: 'Çift masajı senkronizasyonu, dijital hediye çeki ve oda içi terapi tercihleri.',
    accentColor: 'purple',
    icon: '🧖',
    customerLabel: 'Misafir',
    appointmentLabel: 'Seans / Terapi',
    serviceLabel: 'Masaj / Bakım Türü',
    pricingBadge: 'Hediye Çeki Komisyonu + SaaS',
    pricingModelDescription: 'Hediye kupon satışlarında %3 komisyon payı.',
  },

  // ── 10. Toplantı Odası & Coworking Alanları ─────────────────────────────────
  coworking: {
    slug: 'coworking',
    label: 'Toplantı Odası & Coworking',
    displayName: 'Alan & Kredi Yönetimi',
    seoTitle: 'Coworking & Toplantı Odası Rezervasyon Yazılımı | GlowDesk',
    seoDescription: 'Oda + projektör + ikram paket rezervasyonu, IoT akıllı kilit entegrasyonu, kurumsal kredi cüzdanı.',
    ogDescription: 'Ortak çalışma alanları ve plaza toplantı odaları için akıllı rezervasyon platformu.',
    heroHeadline: 'Toplantı Odalarını ve Şirket Kredilerini Yönetin',
    heroSubline: 'IoT akıllı kapı kilidi entegrasyonu, dakikalık kredi cüzdanı ve davetli QR check-in.',
    accentColor: 'sky',
    icon: '🏢',
    customerLabel: 'Üye / Şirket',
    appointmentLabel: 'Oda Rezervasyonu',
    serviceLabel: 'Toplantı Paketi',
    pricingBadge: 'Anlık Ofis Upsell + SaaS',
    pricingModelDescription: 'Aylık sabit abonelik ve kurumsal portal desteği.',
  },

  // ── 11. Sürücü Kursları & Özel Direksiyon Eğitimi ──────────────────────────
  driving: {
    slug: 'driving',
    label: 'Sürücü Kursu & Direksiyon Eğitimi',
    displayName: 'Kurs & Ders Yönetimi',
    seoTitle: 'Sürücü Kursu Direksiyon Randevu Yazılımı | GlowDesk',
    seoDescription: 'Yasal 14 ders saati sayacı, araç vites tipi (manuel/otomatik) kural motoru ve dinamik harita biniş noktası seçici.',
    ogDescription: 'Sürücü kursları için MEB mevzuat uyumlu direksiyon ders takip yazılımı.',
    heroHeadline: 'Direksiyon Ders Saatlerini ve Araç Eşleşmesini Yönetin',
    heroSubline: 'MEB yasal ders saati sayacı, vites/araç kural motoru ve haritada biniş noktası.',
    accentColor: 'yellow',
    icon: '🚗',
    customerLabel: 'Sürücü Adayı',
    appointmentLabel: 'Direksiyon Dersi',
    serviceLabel: 'Ders Seviyesi',
    pricingBadge: 'Ek Ders POS Modülü + SaaS',
    pricingModelDescription: 'Kursiyer ek ders satışlarında otomatik POS ve SMS paketi.',
  },

  // ── 12. Restoranlar ────────────────────────────────────────────────────────
  restoran: {
    slug: 'restoran',
    label: 'Restoran',
    displayName: 'Restoran Yönetimi',
    seoTitle: 'Restoran Rezervasyon ve Masa Yönetimi | GlowDesk',
    seoDescription: 'Online masa rezervasyonu, kişi sayısı kontrolü ve depozito yönetimiyle restoranınızın doluluk oranını artırın.',
    ogDescription: 'Restoranlar için akıllı rezervasyon, masa ve misafir yönetim platformu.',
    heroHeadline: 'Rezervasyonları Akıllıca Yönetin, No-Show\'u Bitirin',
    heroSubline: 'Masa kapasitesi, depozito ve misafir sayısı otomatik kontrolü ile tam kapasite.',
    accentColor: 'amber',
    icon: '🍽️',
    customerLabel: 'Misafir',
    appointmentLabel: 'Rezervasyon',
    serviceLabel: 'Menü Kategorisi',
    pricingBadge: 'Sınırsız Rezervasyon • %0 Komisyon',
    pricingModelDescription: 'Rezervasyon başı sıfır komisyon! Aylık tek ve sabit fiyat garantisi.',
  },
};

/** Tüm sektör slug'larını listeler — generateStaticParams için */
export const VERTICAL_SLUGS = Object.keys(VERTICAL_CONFIG) as VerticalKey[];

export function getVerticalConfig(slug: string): VerticalDefinition | null {
  return VERTICAL_CONFIG[slug as VerticalKey] ?? null;
}

export { SECTOR_TO_VERTICAL } from './types';
