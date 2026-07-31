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
const standardSteps: BookingStep[] = [
  {
    id: 'service',
    label: 'Hizmet & Detay',
    isComplete: (state) => Boolean((state.metadata as { serviceId?: string }).serviceId || true),
  },
  {
    id: 'datetime',
    label: 'Tarih & Saat',
    isComplete: (state) => Boolean(state.dateTime.date && state.dateTime.startTime),
  },
  {
    id: 'customer',
    label: 'Bilgiler',
    isComplete: (state) => Boolean(state.customerInfo.fullName && state.customerInfo.phone),
  },
  {
    id: 'confirm',
    label: 'Onay',
    isComplete: () => false,
  },
];

export const VERTICAL_BOOKING_STEPS: Record<VerticalKey, BookingStep[]> = {
  salon: [
    {
      id: 'service-staff',
      label: 'Hizmet & Personel',
      isComplete: (state) => Boolean((state.metadata as { serviceId?: string }).serviceId),
    },
    {
      id: 'datetime',
      label: 'Tarih & Saat',
      isComplete: (state) => Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id: 'customer',
      label: 'Bilgiler',
      isComplete: (state) => Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id: 'confirm',
      label: 'Onay',
      isComplete: () => false,
    },
  ],

  clinic: standardSteps,
  auto: standardSteps,
  fitness: standardSteps,
  vet: standardSteps,
  coaching: standardSteps,

  legal: [
    {
      id: 'case-type',
      label: 'Dava Türü',
      isComplete: (state) => Boolean((state.metadata as { caseTypeId?: string }).caseTypeId || true),
    },
    {
      id: 'datetime',
      label: 'Randevu',
      isComplete: (state) => Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id: 'customer',
      label: 'Bilgiler',
      isComplete: (state) => Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id: 'confirm',
      label: 'Onay',
      isComplete: () => false,
    },
  ],
  hukuk: [
    {
      id: 'case-type',
      label: 'Dava Türü',
      isComplete: (state) => Boolean((state.metadata as { caseTypeId?: string }).caseTypeId || true),
    },
    {
      id: 'datetime',
      label: 'Randevu',
      isComplete: (state) => Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id: 'customer',
      label: 'Bilgiler',
      isComplete: (state) => Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id: 'confirm',
      label: 'Onay',
      isComplete: () => false,
    },
  ],

  photo: standardSteps,
  spa: standardSteps,
  coworking: standardSteps,
  driving: standardSteps,

  restoran: [
    {
      id: 'guest-count',
      label: 'Kişi Sayısı',
      isComplete: (state) => {
        const meta = state.metadata as { guestCount?: number };
        return typeof meta.guestCount === 'number' && meta.guestCount > 0;
      },
    },
    {
      id: 'datetime',
      label: 'Tarih & Saat',
      isComplete: (state) => Boolean(state.dateTime.date && state.dateTime.startTime),
    },
    {
      id: 'customer',
      label: 'Bilgiler',
      isComplete: (state) => Boolean(state.customerInfo.fullName && state.customerInfo.phone),
    },
    {
      id: 'confirm',
      label: 'Onay',
      isComplete: () => false,
    },
  ],
};

