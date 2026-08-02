// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Dashboard Sidebar Menü Tanımları
// ─────────────────────────────────────────────────────────────────────────────

import type { MenuItem, VerticalKey } from './types';

/** Sektöre özel sidebar menü listeleri */
export const VERTICAL_MENU_ITEMS: Record<VerticalKey, MenuItem[]> = {
  // ── 1. Güzellik Salonu ─────────────────────────────────────────────────────
  salon: [
    { href: '/dashboard', label: 'Bugün Kimler Var?', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Randevu Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/notifications', label: 'Bildirim Logları', iconKey: 'IconInbox', minRole: 'owner' },
    { href: '/waitlist', label: 'No-Show Motoru', iconKey: 'IconInbox', minRole: 'staff' },
    { href: '/customers', label: 'Müşteriler', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/services', label: 'Hizmetler', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/finance', label: 'Gelir & Gider Kasa', iconKey: 'IconCreditCard', minRole: 'owner' },
    { href: '/settings', label: 'Salon Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 2. Diş Kliniği & Poliklinik ──────────────────────────────────────────
  clinic: [
    { href: '/dashboard', label: 'Sabah Özeti', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Hasta Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Hasta Kartları & Anamnez', iconKey: 'IconUsers', minRole: 'staff' },
    { href: '/resources', label: 'Koltuk & Cihazlar', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/waitlist', label: 'Acil Bekleme Listesi', iconKey: 'IconInbox', minRole: 'staff' },
    { href: '/services', label: 'Tedavi Protokolleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Klinik Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 3. Oto Servis & Detailing ──────────────────────────────────────────────
  auto: [
    { href: '/dashboard', label: 'Lift & Bay Durumu', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Servis Randevuları', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Plaka & Müşteri Kayıt', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/resources', label: 'Lift & Yıkama Pedi', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/services', label: 'Servis & Bakım Paketleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Servis Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 4. Butik Fitness & Pilates ─────────────────────────────────────────────
  fitness: [
    { href: '/dashboard', label: 'Günlük Ders Programı', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Ders & Takvim', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Üye Paketleri & Krediler', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/waitlist', label: 'Ders Bekleme Sırası', iconKey: 'IconInbox', minRole: 'staff' },
    { href: '/services', label: 'Ders Paketleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Stüdyo Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 5. Veteriner & Pet Grooming ────────────────────────────────────────────
  vet: [
    { href: '/dashboard', label: 'Günün Muayeneleri', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Aşı & Bakım Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Pet & Sahip Profilleri', iconKey: 'IconUsers', minRole: 'staff' },
    { href: '/resources', label: 'Pet Otel & Odalar', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/services', label: 'Aşı & Grooming İşlemleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Klinik Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 6. Özel Ders & Psikolojik Danışmanlık ──────────────────────────────────
  coaching: [
    { href: '/dashboard', label: 'Bugünkü Seanslar', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Seans Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Öğrenci / Danışanlar', iconKey: 'IconUsers', minRole: 'staff' },
    { href: '/services', label: 'Müfredat & Seans Türleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Ofis / Profil Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 7. Hukuk & Mali Müşavirlik ─────────────────────────────────────────────
  legal: [
    { href: '/dashboard', label: 'Günlük Görüşmeler', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Dava Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Müvekkiller', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/services', label: 'Danışmanlık Paketleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/finance', label: 'Gelir & Gider Kasa', iconKey: 'IconCreditCard', minRole: 'owner' },
    { href: '/settings', label: 'Büro Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],
  hukuk: [
    { href: '/dashboard', label: 'Günlük Görüşmeler', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Dava Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Müvekkiller', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/services', label: 'Danışmanlık Paketleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/finance', label: 'Gelir & Gider Kasa', iconKey: 'IconCreditCard', minRole: 'owner' },
    { href: '/settings', label: 'Büro Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 8. Fotoğraf Stüdyosu & Kiralama ────────────────────────────────────────
  photo: [
    { href: '/dashboard', label: 'Günlük Çekimler', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Çekim Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Müşteri Galerisi', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/resources', label: 'Plato & Ekipmanlar', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/services', label: 'Çekim & Kiralama Paketleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Stüdyo Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 9. Spa, Masaj & Wellness ───────────────────────────────────────────────
  spa: [
    { href: '/dashboard', label: 'Terapi Takvimi', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Seans Rezervasyonları', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Terapi Geçmişi & Misafirler', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/resources', label: 'VIP Suit & Masaj Odaları', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/services', label: 'Spa Paketleri & Hediye Çekleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Tesis Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 10. Toplantı Odası & Coworking ──────────────────────────────────────────
  coworking: [
    { href: '/dashboard', label: 'Oda Doluluk Haritası', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Oda Rezervasyonları', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Kurumsal Üyeler & Cüzdanlar', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/resources', label: 'Toplantı Odaları & IoT', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/services', label: 'Oda & İkram Paketleri', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Plaza Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 11. Sürücü Kursları ────────────────────────────────────────────────────
  driving: [
    { href: '/dashboard', label: 'Bugünün Direksiyon Dersleri', iconKey: 'IconHome', minRole: 'staff' },
    { href: '/appointments', label: 'Ders Takvimi', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Sürücü Adayları & 14 Ders', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/resources', label: 'Eğitim Araçları', iconKey: 'IconGrid', minRole: 'owner' },
    { href: '/services', label: 'Ehliyet Sınıfları & Ek Ders', iconKey: 'IconSparkles', minRole: 'owner' },
    { href: '/settings', label: 'Kurs Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],

  // ── 12. Restoran ───────────────────────────────────────────────────────────
  restoran: [
    { href: '/dashboard', label: 'Masa Haritası', iconKey: 'IconGrid', minRole: 'staff' },
    { href: '/appointments', label: 'Rezervasyonlar', iconKey: 'IconCalendar', minRole: 'staff' },
    { href: '/customers', label: 'Misafirler', iconKey: 'IconUsers', minRole: 'owner' },
    { href: '/waitlist', label: 'Bekleme Listesi', iconKey: 'IconInbox', minRole: 'staff' },
    { href: '/settings', label: 'Restoran Ayarları', iconKey: 'IconSettings', minRole: 'owner' },
  ],
};

/** Super Admin menüsü (sektörden bağımsız) */
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { href: '/admin?tab=support',    label: 'Acil Destek Talepleri',    iconKey: 'IconInbox',      minRole: 'admin', tabKey: 'support' },
  { href: '/admin?tab=tenants',    label: 'Kayıtlı İşletmeler',        iconKey: 'IconCrown',      minRole: 'admin', tabKey: 'tenants' },
  { href: '/admin?tab=users',      label: 'Kullanıcı Yönetimi',       iconKey: 'IconUsers',      minRole: 'admin', tabKey: 'users' },
  { href: '/admin?tab=blog',       label: 'Blog & Makale Yönetimi',   iconKey: 'IconSparkles',   minRole: 'admin', tabKey: 'blog' },
  { href: '/admin?tab=financials', label: 'Ödeme & Abonelikler',      iconKey: 'IconCreditCard', minRole: 'admin', tabKey: 'financials' },
  { href: '/admin?tab=templates',  label: 'Global Hizmet Kataloğu',   iconKey: 'IconGrid',       minRole: 'admin', tabKey: 'templates' },
  { href: '/admin?tab=audit',      label: 'Sistem Audit Logları',     iconKey: 'IconSettings',   minRole: 'admin', tabKey: 'audit' },
];

/** Müşteri menüsü (sektörden bağımsız) */
export const CUSTOMER_MENU_ITEMS: MenuItem[] = [
  { href: '/my-appointments', label: '📋 Randevularım',    iconKey: 'IconCalendar', minRole: 'customer' },
  { href: '/explore',         label: '🔍 Salonları Keşfet', iconKey: 'IconHome',     minRole: 'customer' },
  { href: '/profile',         label: '⚙️ Profil Ayarlarım', iconKey: 'IconSettings', minRole: 'customer' },
];
