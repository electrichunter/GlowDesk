/**
 * GlowDesk — Randevu Veri Dönüşüm Yardımcıları
 *
 * Single Source of Truth: Backend API yanıtlarını frontend Appointment tipine dönüştürür.
 */

import type { Appointment, AppointmentStatus } from '@/lib/types';

export const VALID_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'pending',
];

/** Safe Type Guard for AppointmentStatus */
export function isValidAppointmentStatus(status: any): status is AppointmentStatus {
  return typeof status === 'string' && VALID_APPOINTMENT_STATUSES.includes(status as AppointmentStatus);
}

/** Backend'den dönen ham randevu verisi */
export interface RawApiAppointment {
  id: string;
  tenant_id: string;
  customer_id?: string;
  service_id?: string;
  staff_id?: string;
  customer_name?: string;
  customer_phone?: string;
  service_name?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  notes?: string;
  total_price?: number | string;
  duration_minutes?: number;
  created_at?: string;
}

function buildLocalDateTime(dateStr: string, timeStr: string | undefined, fallbackTime: string): string {
  if (!timeStr) {
    return `${dateStr}T${fallbackTime}`;
  }

  if (timeStr.includes('T')) {
    return timeStr.replace(/[Z]$/i, '').replace(/[+-]\d{2}:\d{2}$/, '');
  }

  return `${dateStr}T${timeStr}`;
}

/**
 * Başlangıç saatine hizmet süresini ekleyerek bitiş saati hesaplar.
 * Gece yarısı aşımını (midnight rollover) tarih nesnesi ile doğru hesaplar.
 */
function calculateEndTime(startTimeIso: string, durationMinutes: number): string {
  const [datePart, timePart] = startTimeIso.split('T');
  const [h, m] = (timePart || '10:00:00').split(':').map(Number);
  
  const startDate = new Date(`${datePart}T${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`);
  if (isNaN(startDate.getTime())) {
    return `${datePart}T11:00:00`;
  }

  startDate.setMinutes(startDate.getMinutes() + durationMinutes);
  
  const endYear = startDate.getFullYear();
  const endMonth = String(startDate.getMonth() + 1).padStart(2, '0');
  const endDate = String(startDate.getDate()).padStart(2, '0');
  const endH = String(startDate.getHours()).padStart(2, '0');
  const endM = String(startDate.getMinutes()).padStart(2, '0');

  return `${endYear}-${endMonth}-${endDate}T${endH}:${endM}:00`;
}

export function mapApiAppointment(a: RawApiAppointment): Appointment {
  const dateStr = a.appointment_date || new Date().toISOString().split('T')[0];
  const durationMin = a.duration_minutes || 30;
  const rawPrice = typeof a.total_price === 'string' ? parseFloat(a.total_price) : (a.total_price || 0);

  const startTime = buildLocalDateTime(dateStr, a.start_time, '10:00:00');

  let endTime: string;
  if (a.end_time) {
    endTime = buildLocalDateTime(dateStr, a.end_time, '11:00:00');
  } else {
    endTime = calculateEndTime(startTime, durationMin);
  }

  const safeStatus: AppointmentStatus = isValidAppointmentStatus(a.status) ? a.status : 'scheduled';

  return {
    id: a.id,
    tenant_id: a.tenant_id,
    customer_id: a.customer_id || '',
    service_id: a.service_id || undefined,
    start_time: startTime,
    end_time: endTime,
    status: safeStatus,
    notes: a.notes || undefined,
    created_at: a.created_at || new Date().toISOString(),
    customer: {
      id: a.customer_id || '',
      tenant_id: a.tenant_id || 'global',
      full_name: a.customer_name || 'Müşteri',
      phone: a.customer_phone || undefined,
      created_at: a.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    service: {
      id: a.service_id || '',
      tenant_id: a.tenant_id || 'global',
      name: a.service_name || 'Genel Hizmet',
      duration_minutes: durationMin,
      price: rawPrice,
      created_at: new Date().toISOString(),
    },
  };
}

export function getDateFromIso(isoStr: string): string {
  if (!isoStr) return new Date().toISOString().split('T')[0];
  return isoStr.split('T')[0];
}

export function getTimeFromIso(isoStr: string): string {
  if (!isoStr) return '10:00';
  const parts = isoStr.split('T');
  if (parts.length < 2) return '10:00';
  return parts[1].slice(0, 5);
}

export function computeEndTimeStr(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = (h || 0) * 60 + (m || 0) + durationMinutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
}
