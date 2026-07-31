// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Onboarding Adım Tanımları
// Her sektörün kurulum rehberi ayrı adımlardan oluşur.
// ─────────────────────────────────────────────────────────────────────────────

import type { OnboardingStepDef, VerticalKey } from './types';

const standardOnboarding: OnboardingStepDef[] = [
  {
    id: 'business-info',
    title: 'İşletme Bilgilerinizi Girin',
    description: 'İşletme adı, adres ve çalışma saatlerinizi ayarlayın.',
    settingsKey: 'businessInfoCompleted',
  },
  {
    id: 'services-setup',
    title: 'Hizmet & Kaynak Kataloğunu Oluşturun',
    description: 'Sunduğunuz hizmetleri, sürelerini ve fiziki kaynaklarınızı ekleyin.',
    settingsKey: 'servicesSetupCompleted',
  },
  {
    id: 'booking-settings',
    title: 'Online Rezervasyon Ayarları',
    description: 'Randevu alma kurallarını, kapara ve bildirim tercihlerini belirleyin.',
    settingsKey: 'bookingSettingsCompleted',
  },
  {
    id: 'onboarding-done',
    title: 'Hazırsınız! 🎉',
    description: 'İşletmeniz artık online rezervasyon almaya hazır.',
    settingsKey: 'onboardingCompleted',
  },
];

export const VERTICAL_ONBOARDING: Record<VerticalKey, OnboardingStepDef[]> = {
  salon: [
    {
      id:          'business-info',
      title:       'İşletme Bilgilerinizi Girin',
      description: 'Salon adı, adres ve çalışma saatlerinizi ayarlayın.',
      settingsKey: 'businessInfoCompleted',
    },
    {
      id:          'services-setup',
      title:       'Hizmet Kataloğunu Oluşturun',
      description: 'Sunduğunuz hizmetleri, sürelerini ve fiyatlarını ekleyin.',
      settingsKey: 'servicesSetupCompleted',
    },
    {
      id:          'staff-setup',
      title:       'Personel Ekleyin',
      description: 'Çalışanlarınızı ve uzmanlık alanlarını tanımlayın.',
      settingsKey: 'staffSetupCompleted',
    },
    {
      id:          'booking-settings',
      title:       'Online Randevu Ayarları',
      description: 'Randevu alma kurallarını ve bildirim tercihlerini belirleyin.',
      settingsKey: 'bookingSettingsCompleted',
    },
    {
      id:          'onboarding-done',
      title:       'Hazırsınız! 🎉',
      description: 'Salonunuz artık online rezervasyon almaya hazır.',
      settingsKey: 'onboardingCompleted',
    },
  ],

  clinic: standardOnboarding,
  auto: standardOnboarding,
  fitness: standardOnboarding,
  vet: standardOnboarding,
  coaching: standardOnboarding,

  legal: [
    {
      id: 'office-info',
      title: 'Büro Bilgilerini Girin',
      description: 'Büro adı, adres ve iletişim bilgilerini ayarlayın.',
      settingsKey: 'businessInfoCompleted',
    },
    {
      id: 'case-types',
      title: 'Danışmanlık Türlerini Tanımlayın',
      description: 'Verdiğiniz hukuki danışmanlık türlerini, sürelerini ve ücretlerini ekleyin.',
      settingsKey: 'servicesSetupCompleted',
    },
    {
      id: 'payment-setup',
      title: 'Ön Ödeme Ayarları',
      description: 'Danışmanlık öncesi alınan depozito tutarını ve ödeme yöntemini belirleyin.',
      settingsKey: 'paymentSetupCompleted',
    },
    {
      id: 'onboarding-done',
      title: 'Büronuz Hazır! ⚖️',
      description: 'Artık online danışmanlık randevusu alabilirsiniz.',
      settingsKey: 'onboardingCompleted',
    },
  ],
  hukuk: [
    {
      id: 'office-info',
      title: 'Büro Bilgilerini Girin',
      description: 'Büro adı, adres ve iletişim bilgilerini ayarlayın.',
      settingsKey: 'businessInfoCompleted',
    },
    {
      id: 'case-types',
      title: 'Danışmanlık Türlerini Tanımlayın',
      description: 'Verdiğiniz hukuki danışmanlık türlerini, sürelerini ve ücretlerini ekleyin.',
      settingsKey: 'servicesSetupCompleted',
    },
    {
      id: 'payment-setup',
      title: 'Ön Ödeme Ayarları',
      description: 'Danışmanlık öncesi alınan depozito tutarını ve ödeme yöntemini belirleyin.',
      settingsKey: 'paymentSetupCompleted',
    },
    {
      id: 'onboarding-done',
      title: 'Büronuz Hazır! ⚖️',
      description: 'Artık online danışmanlık randevusu alabilirsiniz.',
      settingsKey: 'onboardingCompleted',
    },
  ],

  photo: standardOnboarding,
  spa: standardOnboarding,
  coworking: standardOnboarding,
  driving: standardOnboarding,

  restoran: [
    {
      id: 'restaurant-info',
      title: 'Restoran Bilgilerini Girin',
      description: 'Restoran adı, adres, çalışma saatleri ve mutfak türünü ekleyin.',
      settingsKey: 'businessInfoCompleted',
    },
    {
      id: 'table-setup',
      title: 'Masa Düzeninizi Oluşturun',
      description: 'Masalarınızı, kapasitelerini ve konumlarını tanımlayın.',
      settingsKey: 'tableSetupCompleted',
    },
    {
      id: 'onboarding-done',
      title: 'Restoranınız Hazır! 🍽️',
      description: 'Artık masa rezervasyonu almaya hazır.',
      settingsKey: 'onboardingCompleted',
    },
  ],
};
