// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Dashboard İstatistik Kart Tanımları
// Her sektör kendi anlamlı metriklerini gösterir.
// ─────────────────────────────────────────────────────────────────────────────

import type { StatsCardDef, VerticalKey } from './types';

export const VERTICAL_STATS: Record<VerticalKey, StatsCardDef[]> = {
  salon: [
    { key: 'today_appointments', label: 'Bugünkü Randevular', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Ciro', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'no_show_rate', label: 'No-Show Oranı', iconKey: 'IconAlertTriangle', format: 'percent', colorKey: 'amber' },
    { key: 'waitlist_count', label: 'Bekleme Listesi', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  barber: [
    { key: 'today_appointments', label: 'Sıradaki Müşteriler', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Tıraş Cirosu', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'chair_occupancy', label: 'Koltuk Doluluk Oranı', iconKey: 'IconGrid', format: 'percent', colorKey: 'amber' },
    { key: 'waitlist_count', label: 'Bekleyenler', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  clinic: [
    { key: 'today_appointments', label: 'Bugünkü Hastalar', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Tedavi Cirosu', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'lab_orders_pending', label: 'Bekleyen Lab İşleri', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'amber' },
    { key: 'recalled_patients', label: 'Periyodik Kontroller', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  auto: [
    { key: 'today_appointments', label: 'Servisteki Araçlar', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Servis Cirosu', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'bay_occupancy', label: 'Lift Doluluk Oranı', iconKey: 'IconGrid', format: 'percent', colorKey: 'amber' },
    { key: 'storage_bins_used', label: 'Saklanan Lastik Takımları', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  fitness: [
    { key: 'today_appointments', label: 'Bugünkü Ders Katılımı', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'active_members', label: 'Aktif Üye Sayısı', iconKey: 'IconUsers', format: 'number', colorKey: 'green' },
    { key: 'class_occupancy', label: 'Ders Doluluk Oranı', iconKey: 'IconAlertTriangle', format: 'percent', colorKey: 'amber' },
    { key: 'waitlist_count', label: 'Waitlist Bekleyenler', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  vet: [
    { key: 'today_appointments', label: 'Günün Hastaları', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Klinik Geliri', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'vaccines_due', label: 'Zamanı Gelen Aşılar', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'amber' },
    { key: 'pet_hotel_occupancy', label: 'Pet Otel Doluluğu', iconKey: 'IconGrid', format: 'percent', colorKey: 'violet' },
  ],

  coaching: [
    { key: 'today_appointments', label: 'Bugünkü Seanslar', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Danışmanlık Cirosu', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'assignments_pending', label: 'İncelenecek Ödevler', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'amber' },
    { key: 'active_students', label: 'Aktif Danışan / Öğrenci', iconKey: 'IconUsers', format: 'number', colorKey: 'violet' },
  ],

  legal: [
    { key: 'today_appointments', label: 'Günlük Görüşmeler', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Danışmanlık Geliri', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'deposit_pending', label: 'Bekleyen Ön Ödemeler', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'amber' },
    { key: 'open_cases', label: 'Aktif Davalar', iconKey: 'IconFolder', format: 'number', colorKey: 'violet' },
  ],
  hukuk: [
    { key: 'today_appointments', label: 'Günlük Görüşmeler', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Danışmanlık Geliri', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'deposit_pending', label: 'Bekleyen Ön Ödemeler', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'amber' },
    { key: 'open_cases', label: 'Aktif Davalar', iconKey: 'IconFolder', format: 'number', colorKey: 'violet' },
  ],

  photo: [
    { key: 'today_appointments', label: 'Bugünkü Çekimler', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Çekim Cirosu', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'gallery_reviews_pending', label: 'Onay Bekleyen Galeriler', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'amber' },
    { key: 'rented_equipment', label: 'Kiradaki Ekipmanlar', iconKey: 'IconGrid', format: 'number', colorKey: 'violet' },
  ],

  spa: [
    { key: 'today_appointments', label: 'Bugünkü Terapiler', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Spa Cirosu', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'vip_room_occupancy', label: 'VIP Suit Doluluğu', iconKey: 'IconGrid', format: 'percent', colorKey: 'amber' },
    { key: 'vouchers_sold', label: 'Satılan Hediye Çekleri', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  coworking: [
    { key: 'today_appointments', label: 'Oda Rezervasyonları', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'monthly_revenue', label: 'Aylık Oda Geliri', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'green' },
    { key: 'room_occupancy', label: 'Toplantı Oda Doluluğu', iconKey: 'IconGrid', format: 'percent', colorKey: 'amber' },
    { key: 'corporate_credits_used', label: 'Kullanılan Kurumsal Kredi', iconKey: 'IconClock', format: 'number', colorKey: 'violet' },
  ],

  driving: [
    { key: 'today_appointments', label: 'Bugünkü Direksiyon Dersleri', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'active_students', label: 'Aktif Kursiyer Sayısı', iconKey: 'IconUsers', format: 'number', colorKey: 'green' },
    { key: 'completed_hours', label: 'Tamamlanan Yasal Ders (Saat)', iconKey: 'IconClock', format: 'number', colorKey: 'amber' },
    { key: 'exam_candidates', label: 'Sınavı Yaklaşan Adaylar', iconKey: 'IconAlertTriangle', format: 'number', colorKey: 'violet' },
  ],

  restoran: [
    { key: 'today_appointments', label: 'Bugünkü Rezervasyonlar', iconKey: 'IconCalendar', format: 'number', colorKey: 'blue' },
    { key: 'total_guests', label: 'Toplam Misafir', iconKey: 'IconUsers', format: 'number', colorKey: 'green' },
    { key: 'table_occupancy', label: 'Masa Doluluk Oranı', iconKey: 'IconGrid', format: 'percent', colorKey: 'amber' },
    { key: 'monthly_revenue', label: 'Aylık Ciro', iconKey: 'IconTrendingUp', format: 'currency', colorKey: 'violet' },
  ],
};
