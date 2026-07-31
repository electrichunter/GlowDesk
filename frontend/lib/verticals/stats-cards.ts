// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Dashboard İstatistik Kart Tanımları
// Her sektör kendi anlamlı metriklerini gösterir.
// ─────────────────────────────────────────────────────────────────────────────

import type { StatsCardDef, VerticalKey } from './types';

export const VERTICAL_STATS: Record<VerticalKey, StatsCardDef[]> = {
  // ── Güzellik Salonu Metrikleri ─────────────────────────────────────────────
  salon: [
    {
      key:      'today_appointments',
      label:    'Bugünkü Randevular',
      iconKey:  'IconCalendar',
      format:   'number',
      colorKey: 'blue',
    },
    {
      key:      'monthly_revenue',
      label:    'Aylık Ciro',
      iconKey:  'IconTrendingUp',
      format:   'currency',
      colorKey: 'green',
    },
    {
      key:      'no_show_rate',
      label:    'No-Show Oranı',
      iconKey:  'IconAlertTriangle',
      format:   'percent',
      colorKey: 'amber',
    },
    {
      key:      'waitlist_count',
      label:    'Bekleme Listesi',
      iconKey:  'IconClock',
      format:   'number',
      colorKey: 'violet',
    },
  ],

  // ── Hukuk Bürosu Metrikleri ───────────────────────────────────────────────
  hukuk: [
    {
      key:      'today_appointments',
      label:    'Günlük Görüşmeler',
      iconKey:  'IconCalendar',
      format:   'number',
      colorKey: 'blue',
    },
    {
      key:      'monthly_revenue',
      label:    'Aylık Danışmanlık Geliri',
      iconKey:  'IconTrendingUp',
      format:   'currency',
      colorKey: 'green',
    },
    {
      key:      'deposit_pending',
      label:    'Bekleyen Ön Ödemeler',
      iconKey:  'IconAlertTriangle',
      format:   'number',
      colorKey: 'amber',
    },
    {
      key:      'open_cases',
      label:    'Aktif Davalar',
      iconKey:  'IconFolder',
      format:   'number',
      colorKey: 'violet',
    },
  ],

  // ── Restoran Metrikleri ───────────────────────────────────────────────────
  restoran: [
    {
      key:      'today_appointments',
      label:    'Bugünkü Rezervasyonlar',
      iconKey:  'IconCalendar',
      format:   'number',
      colorKey: 'blue',
    },
    {
      key:      'total_guests',
      label:    'Toplam Misafir',
      iconKey:  'IconUsers',
      format:   'number',
      colorKey: 'green',
    },
    {
      key:      'table_occupancy',
      label:    'Masa Doluluk Oranı',
      iconKey:  'IconGrid',
      format:   'percent',
      colorKey: 'amber',
    },
    {
      key:      'monthly_revenue',
      label:    'Aylık Ciro',
      iconKey:  'IconTrendingUp',
      format:   'currency',
      colorKey: 'violet',
    },
  ],
};
