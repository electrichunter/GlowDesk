// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Rezervasyon Form Adım Dizileri
// Her sektörün form akışı farklı sıraya ve farklı adımlara sahiptir.
// ─────────────────────────────────────────────────────────────────────────────

import type { BookingStep, VerticalKey } from './types';

/**
 * Her vertical için sıralı form adımları.
 * Bileşen referansları lazy import ile çözülür — booking engine tarafından yüklenir.
 * isComplete: o adımın tamamlanıp tamamlanmadığını kontrol eden saf fonksiyon.
 */
export const VERTICAL_BOOKING_STEPS: Record<VerticalKey, BookingStep[]> = {
  // ── Salon Rezervasyon Adımları ─────────────────────────────────────────────
  salon: [
    {
      id:         'service-staff',
      label:      'Hizmet & Personel',
      isComplete: (state) =>
        Boolean(
          (state.metadata as { serviceId?: string }).serviceId
        ),
    },
    {
      id:         'datetime',
      label:      'Tarih & Saat',
      isComplete: (state) =>
        Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id:         'customer',
      label:      'Bilgiler',
      isComplete: (state) =>
        Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id:         'confirm',
      label:      'Onay',
      isComplete: () => false, // Son adım — submit ile tamamlanır
    },
  ],

  // ── Hukuk Bürosu Rezervasyon Adımları ────────────────────────────────────
  hukuk: [
    {
      id:         'case-type',
      label:      'Dava Türü',
      isComplete: (state) =>
        Boolean(
          (state.metadata as { caseTypeId?: string }).caseTypeId
        ),
    },
    {
      id:         'document',
      label:      'Belgeler',
      isComplete: (state) => {
        const meta = state.metadata as { documentUrls?: string[] };
        // Belge yükleme isteğe bağlı — her durumda geçebilir
        return Array.isArray(meta.documentUrls);
      },
    },
    {
      id:         'datetime',
      label:      'Randevu',
      isComplete: (state) =>
        Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id:         'deposit',
      label:      'Ön Ödeme',
      isComplete: (state) =>
        Boolean(
          (state.metadata as { depositPaid?: boolean }).depositPaid
        ),
    },
    {
      id:         'customer',
      label:      'Bilgiler',
      isComplete: (state) =>
        Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id:         'confirm',
      label:      'Onay',
      isComplete: () => false,
    },
  ],

  // ── Restoran Rezervasyon Adımları ─────────────────────────────────────────
  restoran: [
    {
      id:         'guest-count',
      label:      'Kişi Sayısı',
      isComplete: (state) => {
        const meta = state.metadata as { guestCount?: number };
        return typeof meta.guestCount === 'number' && meta.guestCount > 0;
      },
    },
    {
      id:         'table',
      label:      'Masa',
      isComplete: (state) =>
        Boolean(
          (state.metadata as { tableId?: string }).tableId
        ),
    },
    {
      id:         'datetime',
      label:      'Tarih & Saat',
      isComplete: (state) =>
        Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id:         'deposit',
      label:      'Depozito',
      isComplete: (state) => {
        const meta = state.metadata as { depositPaid?: boolean };
        // Depozito yoksa (tutar 0) otomatik tamamlanmış sayılır
        return meta.depositPaid === true || meta.depositPaid === false;
      },
    },
    {
      id:         'customer',
      label:      'Bilgiler',
      isComplete: (state) =>
        Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id:         'confirm',
      label:      'Onay',
      isComplete: () => false,
    },
  ],
};
