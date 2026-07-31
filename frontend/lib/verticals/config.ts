// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — Merkezi Sektör Konfigürasyon Deposu (VERTICAL_CONFIG Registry)
// Her sektörün SEO, UI ve dashboard metadata'sını tek yerden yönetir.
// ─────────────────────────────────────────────────────────────────────────────

import type { VerticalDefinition, VerticalKey } from './types';

export const VERTICAL_CONFIG: Record<VerticalKey, VerticalDefinition> = {
  // ── Güzellik & Bakım Salonları ─────────────────────────────────────────────
  salon: {
    slug: 'salon',
    label: 'Güzellik Salonu',
    displayName: 'Salon Yönetimi',
    seoTitle: 'Güzellik Salonu Yönetim Yazılımı | GlowDesk',
    seoDescription:
      'Randevu, personel, hizmet ve müşteri yönetimini tek ekrandan yapın. No-show koruması, SMS hatırlatma ve gelir raporları ile salonunuzu büyütün.',
    ogDescription:
      'Türkiye\'nin en akıllı güzellik salonu yönetim platformu.',
    heroHeadline: 'Salonunuzu Akıllıca Yönetin, Büyütün',
    heroSubline:
      'Randevu çakışması yok. No-show kaybı yok. Sadece mutlu müşteriler ve büyüyen ciro.',
    accentColor: 'cyan',
    icon: '✂️',
    customerLabel: 'Müşteri',
    appointmentLabel: 'Randevu',
    serviceLabel: 'Hizmet',
    pricingBadge: 'Personel & Koltuk Bazlı SaaS',
    pricingModelDescription: 'Aylık sabit abonelik paketi. Sınırsız müşteri ve SMS bildirim desteği.',
  },

  // ── Hukuk Büroları ─────────────────────────────────────────────────────────
  hukuk: {
    slug: 'hukuk',
    label: 'Hukuk Bürosu',
    displayName: 'Hukuk Bürosu Yönetimi',
    seoTitle: 'Hukuk Bürosu Randevu ve Dava Yönetimi | GlowDesk',
    seoDescription:
      'Danışmanlık randevularını, ön ödemeleri ve müvekkil belgelerini dijitalleştirin. Stripe/Iyzico entegrasyonuyla güvenli tahsilat yapın.',
    ogDescription:
      'Avukatlar için akıllı takvim, müvekkil ve ödeme yönetimi platformu.',
    heroHeadline: 'Hukuki Danışmanlığı Profesyonelce Yönetin',
    heroSubline:
      'Randevu, belge ve ödeme yönetimini tek platformda birleştirin. Müvekkillerinize daha fazla zaman ayırın.',
    accentColor: 'violet',
    icon: '⚖️',
    customerLabel: 'Müvekkil',
    appointmentLabel: 'Görüşme',
    serviceLabel: 'Danışmanlık Türü',
    pricingBadge: 'Güvenli Tahsilat + Premium SaaS',
    pricingModelDescription: 'Müvekkil ön ödemelerinde düşük %2 işlem ücreti + Kurumsal Danışmanlık Paketi.',
  },

  // ── Restoranlar ────────────────────────────────────────────────────────────
  restoran: {
    slug: 'restoran',
    label: 'Restoran',
    displayName: 'Restoran Yönetimi',
    seoTitle: 'Restoran Rezervasyon ve Masa Yönetimi | GlowDesk',
    seoDescription:
      'Online masa rezervasyonu, kişi sayısı kontrolü ve depozito yönetimiyle restoranınızın doluluk oranını artırın. No-show kayıplarını minimize edin.',
    ogDescription:
      'Restoranlar için akıllı rezervasyon, masa ve misafir yönetim platformu.',
    heroHeadline: 'Rezervasyonları Akıllıca Yönetin, No-Show\'u Bitirin',
    heroSubline:
      'Masa kapasitesi, depozito ve misafir sayısı otomatik kontrolü ile her akşamı tam kapasite geçirin.',
    accentColor: 'amber',
    icon: '🍽️',
    customerLabel: 'Misafir',
    appointmentLabel: 'Rezervasyon',
    serviceLabel: 'Menü Kategorisi',
    pricingBadge: 'Sınırsız Rezervasyon • %0 Komisyon',
    pricingModelDescription: 'Rezervasyon başı sıfır komisyon! Aylık tek ve sabit fiyat garantisi.',
  },
};

/** Tüm sektör slug'larını listeler — generateStaticParams için */
export const VERTICAL_SLUGS = Object.keys(VERTICAL_CONFIG) as VerticalKey[];

export function getVerticalConfig(slug: string): VerticalDefinition | null {
  return VERTICAL_CONFIG[slug as VerticalKey] ?? null;
}

export { SECTOR_TO_VERTICAL } from './types';
