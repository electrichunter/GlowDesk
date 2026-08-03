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
    id: 'deposit',
    label: 'Ön Ödeme',
    isComplete: (state) => Boolean((state.metadata as { depositPaid?: boolean }).depositPaid),
  },
  {
    id: 'confirm',
    label: 'Onay',
    isComplete: () => false,
  },
];

export const VERTICAL_BOOKING_STEPS: Record<VerticalKey, BookingStep[]> = {
<<<<<<< Updated upstream
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

=======
  salon: standardSteps,
  barber: standardSteps,
>>>>>>> Stashed changes
  clinic: standardSteps,
  auto: standardSteps,
  fitness: standardSteps,
  vet: standardSteps,
  coaching: standardSteps,
  legal: standardSteps,
  hukuk: standardSteps,
  photo: standardSteps,
  spa: standardSteps,
  coworking: standardSteps,
  driving: standardSteps,
  restoran: standardSteps,
};

