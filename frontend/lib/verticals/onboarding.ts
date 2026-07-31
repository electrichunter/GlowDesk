// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Sektöre Göre Onboarding Adım Tanımları
// Her sektörün kurulum rehberi ayrı adımlardan oluşur.
// ─────────────────────────────────────────────────────────────────────────────

import type { OnboardingStepDef, VerticalKey } from './types';

export const VERTICAL_ONBOARDING: Record<VerticalKey, OnboardingStepDef[]> = {
  // ── Güzellik Salonu Onboarding Adımları ───────────────────────────────────
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

  // ── Hukuk Bürosu Onboarding Adımları ─────────────────────────────────────
  hukuk: [
    {
      id:          'office-info',
      title:       'Büro Bilgilerini Girin',
      description: 'Büro adı, adres ve iletişim bilgilerini ayarlayın.',
      settingsKey: 'businessInfoCompleted',
    },
    {
      id:          'case-types',
      title:       'Danışmanlık Türlerini Tanımlayın',
      description: 'Verdiğiniz hukuki danışmanlık türlerini, sürelerini ve ücretlerini ekleyin.',
      settingsKey: 'servicesSetupCompleted',
    },
    {
      id:          'payment-setup',
      title:       'Ön Ödeme Ayarları',
      description: 'Danışmanlık öncesi alınan depozito tutarını ve ödeme yöntemini belirleyin.',
      settingsKey: 'paymentSetupCompleted',
    },
    {
      id:          'document-settings',
      title:       'Belge Yükleme Ayarları',
      description: 'Müvekkillerin randevu öncesi yükleyeceği belge türlerini yapılandırın.',
      settingsKey: 'documentSettingsCompleted',
    },
    {
      id:          'onboarding-done',
      title:       'Büronuz Hazır! ⚖️',
      description: 'Artık online danışmanlık randevusu alabilirsiniz.',
      settingsKey: 'onboardingCompleted',
    },
  ],

  // ── Restoran Onboarding Adımları ──────────────────────────────────────────
  restoran: [
    {
      id:          'restaurant-info',
      title:       'Restoran Bilgilerini Girin',
      description: 'Restoran adı, adres, çalışma saatleri ve mutfak türünü ekleyin.',
      settingsKey: 'businessInfoCompleted',
    },
    {
      id:          'table-setup',
      title:       'Masa Düzeninizi Oluşturun',
      description: 'Masalarınızı, kapasitelerini ve konumlarını (iç mekan, teras vb.) tanımlayın.',
      settingsKey: 'tableSetupCompleted',
    },
    {
      id:          'deposit-setup',
      title:       'Depozito Kuralları',
      description: 'Rezervasyon için alınacak depozito tutarını ve iade politikasını belirleyin.',
      settingsKey: 'depositSetupCompleted',
    },
    {
      id:          'booking-settings',
      title:       'Rezervasyon Kuralları',
      description: 'Minimum kişi sayısı, maksimum önceden rezervasyon süresi ve iptal politikasını ayarlayın.',
      settingsKey: 'bookingSettingsCompleted',
    },
    {
      id:          'onboarding-done',
      title:       'Restoranınız Hazır! 🍽️',
      description: 'Artık online masa rezervasyonu alabilirsiniz.',
      settingsKey: 'onboardingCompleted',
    },
  ],
};
