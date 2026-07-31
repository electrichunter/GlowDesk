// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Dashboard Sidebar Menü Tanımları
// ─────────────────────────────────────────────────────────────────────────────

import type { MenuItem, VerticalKey } from './types';

/** Sektöre özel sidebar menü listeleri */
export const VERTICAL_MENU_ITEMS: Record<VerticalKey, MenuItem[]> = {
  // ── Güzellik Salonu Menüsü ─────────────────────────────────────────────────
  salon: [
    {
      href:     '/dashboard',
      label:    'Bugün Kimler Var?',
      iconKey:  'IconHome',
      minRole:  'staff',
    },
    {
      href:     '/appointments',
      label:    'Randevu Takvimi',
      iconKey:  'IconCalendar',
      minRole:  'staff',
    },
    {
      href:     '/waitlist',
      label:    'No-Show Motoru',
      iconKey:  'IconInbox',
      minRole:  'staff',
    },
    {
      href:     '/customers',
      label:    'Müşteriler',
      iconKey:  'IconUsers',
      minRole:  'owner',
    },
    {
      href:     '/services',
      label:    'Hizmetler',
      iconKey:  'IconSparkles',
      minRole:  'owner',
    },
    {
      href:     '/settings',
      label:    'Salon Ayarları',
      iconKey:  'IconSettings',
      minRole:  'owner',
    },
  ],

  // ── Hukuk Bürosu Menüsü ───────────────────────────────────────────────────
  hukuk: [
    {
      href:     '/dashboard',
      label:    'Günlük Görüşmeler',
      iconKey:  'IconHome',
      minRole:  'staff',
    },
    {
      href:     '/appointments',
      label:    'Dava Takvimi',
      iconKey:  'IconCalendar',
      minRole:  'staff',
    },
    {
      href:     '/customers',
      label:    'Müvekkiller',
      iconKey:  'IconUsers',
      minRole:  'owner',
    },
    {
      href:     '/documents',
      label:    'Belgeler',
      iconKey:  'IconFolder',
      minRole:  'staff',
    },
    {
      href:     '/billing',
      label:    'Ön Ödemeler',
      iconKey:  'IconCreditCard',
      minRole:  'owner',
    },
    {
      href:     '/waitlist',
      label:    'Bekleme Listesi',
      iconKey:  'IconInbox',
      minRole:  'staff',
    },
    {
      href:     '/settings',
      label:    'Büro Ayarları',
      iconKey:  'IconSettings',
      minRole:  'owner',
    },
  ],

  // ── Restoran Menüsü ───────────────────────────────────────────────────────
  restoran: [
    {
      href:     '/dashboard',
      label:    'Masa Haritası',
      iconKey:  'IconGrid',
      minRole:  'staff',
    },
    {
      href:     '/appointments',
      label:    'Rezervasyonlar',
      iconKey:  'IconCalendar',
      minRole:  'staff',
    },
    {
      href:     '/customers',
      label:    'Misafirler',
      iconKey:  'IconUsers',
      minRole:  'owner',
    },
    {
      href:     '/tables',
      label:    'Masa Yönetimi',
      iconKey:  'IconLayout',
      minRole:  'owner',
    },
    {
      href:     '/waitlist',
      label:    'Bekleme Listesi',
      iconKey:  'IconInbox',
      minRole:  'staff',
    },
    {
      href:     '/settings',
      label:    'Restoran Ayarları',
      iconKey:  'IconSettings',
      minRole:  'owner',
    },
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
