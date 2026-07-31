// GlowDesk — Mock Data (Tüm Sahte Salonlar Temizlenmiştir)

import type {
  Tenant,
  Customer,
  Service,
  Appointment,
  WaitlistEntry,
  DashboardStats,
  Notification,
} from '@/lib/types';

// ─── TÜM SAHTE SALON VE MOCK VERİLER TEMİZLENDİ ─────────────────────────────────

export const mockTenants: Tenant[] = [];
export const mockCustomers: Customer[] = [];
export const mockServices: Service[] = [];
export const mockAppointments: Appointment[] = [];
export const mockWaitlistEntries: WaitlistEntry[] = [];
export const mockNotifications: Notification[] = [];

export const mockDashboardStats: DashboardStats = {
  today_appointments: 0,
  today_confirmed: 0,
  today_no_show: 0,
  today_empty_slots: 10,
  monthly_revenue: 0,
  monthly_appointments: 0,
  no_show_rate: 0,
  waitlist_count: 0,
};

export const defaultServiceTemplates: Record<string, Array<{ id: string; name: string; duration_minutes: number; price: number; sector: string }>> = {
  beauty: [
    { id: 'tpl-1', name: 'Saç Kesimi & Şekillendirme', duration_minutes: 45, price: 350, sector: 'beauty' },
    { id: 'tpl-2', name: 'Medikal Cilt Bakımı', duration_minutes: 60, price: 750, sector: 'beauty' },
  ],
  barber: [
    { id: 'tpl-3', name: 'Sakal Tıraşı & Bakım', duration_minutes: 30, price: 200, sector: 'barber' },
  ],
  spa: [],
  massage: [],
  clinic: [],
};

export function getTodayAppointments(): Appointment[] {
  return [];
}

export function getTenantBySlug(slug: string): Tenant | null {
  return null;
}

export function getServicesByTenant(tenantId: string): Service[] {
  return [];
}

export function getSectorLabel(sector: string): string {
  switch (sector) {
    case 'barber':
      return 'Berber & Erkek Kuaförü';
    case 'beauty':
      return 'Güzellik Salonu';
    case 'spa':
      return 'Cilt Bakımı & Spa';
    case 'massage':
      return 'Masaj & Wellness';
    case 'clinic':
      return 'Klinik & Özel Terapi';
    default:
      return 'Güzellik & Bakım';
  }
}

export function getSectorIcon(sector: string): string {
  switch (sector) {
    case 'barber':
      return '💈';
    case 'beauty':
      return '💄';
    case 'spa':
      return '🌿';
    case 'massage':
      return '💆';
    case 'clinic':
      return '🩺';
    default:
      return '🏢';
  }
}

export function getSectorColor(sector: string): { bg: string; text: string; border: string } {
  switch (sector) {
    case 'barber':
      return { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-200' };
    case 'beauty':
      return { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-200' };
    case 'spa':
      return { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-200' };
    case 'massage':
      return { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-200' };
    case 'clinic':
      return { bg: 'bg-cyan-100', text: 'text-cyan-900', border: 'border-cyan-200' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-200' };
  }
}

export function getStatusLabel(status: Appointment['status']): string {
  switch (status) {
    case 'confirmed':
      return 'Onaylandı';
    case 'pending':
      return 'Beklemede';
    case 'cancelled':
      return 'İptal Edildi';
    case 'completed':
      return 'Tamamlandı';
    case 'no_show':
      return 'Gelmedi (No-Show)';
    default:
      return status;
  }
}

export function formatPrice(price: number, currency = 'TRY'): string {
  const symbol = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€';
  return `${symbol}${price.toLocaleString('tr-TR')}`;
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr;
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
