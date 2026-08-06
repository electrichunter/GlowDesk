// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — 3-Tier Subscription Plans & Feature Matrix
// Starter (Başlangıç) | Pro (Profesyonel) | Enterprise (Kurumsal VIP)
// ─────────────────────────────────────────────────────────────────────────────

import type { SubscriptionTier } from './types';

export type FeatureKey =
  | 'ai_assistant'
  | 'webhooks_api'
  | 'multi_branch'
  | 'sms_automation'
  | 'unlimited_staff'
  | 'export_reports'
  | 'custom_sms_header'
  | 'audit_logs'
  | 'noshow_engine';

export type LimitKey = 'maxBranches' | 'maxStaff' | 'smsMonthlyQuota';

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  badgeLabel: string;
  badgeClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  monthlyPrice: number; // TL
  yearlyPriceMonthly: number; // TL (yıllık ödemede aylık tutar)
  description: string;
  popular?: boolean;
  limits: {
    maxBranches: number; // Infinity for enterprise
    maxStaff: number;
    smsMonthlyQuota: number;
  };
  features: Record<FeatureKey, boolean>;
  featureList: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Starter (Başlangıç)',
    badgeLabel: '🌱 STARTER',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    monthlyPrice: 0,
    yearlyPriceMonthly: 0,
    description: 'Tek lokasyonlu ve temel randevu takibi yapmak isteyen küçük işletmeler için.',
    limits: {
      maxBranches: 1,
      maxStaff: 3,
      smsMonthlyQuota: 50,
    },
    features: {
      ai_assistant: false,
      webhooks_api: false,
      multi_branch: false,
      sms_automation: false,
      unlimited_staff: false,
      export_reports: false,
      custom_sms_header: false,
      audit_logs: false,
      noshow_engine: true,
    },
    featureList: [
      'Maksimum 1 Şube',
      'Maksimum 3 Personel',
      'Temel Randevu Takvimi',
      'Müşteri Kayıt Defteri',
      'No-Show Bekleme Listesi (Temel)',
      'Aylık 50 SMS',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro (Profesyonel)',
    badgeLabel: '⚡ PRO',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-xs',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    monthlyPrice: 499,
    yearlyPriceMonthly: 399,
    popular: true,
    description: 'Büyüyen işletmeler ve ekipler için gelişmiş otomasyon ve çoklu şube desteği.',
    limits: {
      maxBranches: 3,
      maxStaff: 15,
      smsMonthlyQuota: 500,
    },
    features: {
      ai_assistant: false,
      webhooks_api: true,
      multi_branch: true,
      sms_automation: true,
      unlimited_staff: false,
      export_reports: true,
      custom_sms_header: false,
      audit_logs: false,
      noshow_engine: true,
    },
    featureList: [
      '3 Şubeye Kadar Yönetim',
      '15 Personel Kapasitesi',
      'Otomatik SMS Hatırlatmalar',
      'No-Show Akıllı Eşleştirme Motoru',
      'Gelişmiş CSV/Excel Rapor Dışa Aktarım',
      'Geliştirici API Entegrasyonu',
      'Öncelikli E-posta Desteği',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise (Kurumsal VIP)',
    badgeLabel: '👑 ENTERPRISE',
    badgeClass: 'bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 text-amber-900 border-amber-300/60 shadow-xs',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    monthlyPrice: 1499,
    yearlyPriceMonthly: 1199,
    description: 'Franchise markalar, büyük klinikler ve yapay zeka ile tam otomasyon arayan işletmeler.',
    limits: {
      maxBranches: Infinity,
      maxStaff: Infinity,
      smsMonthlyQuota: 5000,
    },
    features: {
      ai_assistant: true,
      webhooks_api: true,
      multi_branch: true,
      sms_automation: true,
      unlimited_staff: true,
      export_reports: true,
      custom_sms_header: true,
      audit_logs: true,
      noshow_engine: true,
    },
    featureList: [
      'Sınırsız Şube & Franchise Yönetimi',
      'Sınırsız Personel Hesabı',
      'AI Asistanı & Akıllı İş Önerileri Motoru',
      'Özel Alfanumerik SMS Gönderici Başlığı',
      'Özel Webhook & Sınırsız API Anahtarları',
      'Detaylı Sistem Audit Logları',
      '7/24 VIP Telefon & Canlı Destek',
    ],
  },
};

/** Normalizes 'starter' / 'free' tier keys */
export function normalizeTier(tier?: string | null): SubscriptionTier {
  if (!tier) return 'free';
  if (tier === 'starter') return 'free';
  if (tier === 'pro' || tier === 'enterprise') return tier;
  return 'free';
}

/** Check if active plan has a feature enabled */
export function hasFeature(tier: SubscriptionTier | string | undefined, feature: FeatureKey): boolean {
  const normalized = normalizeTier(tier);
  return SUBSCRIPTION_PLANS[normalized]?.features[feature] ?? false;
}

/** Check limit bounds */
export function checkLimit(
  tier: SubscriptionTier | string | undefined,
  limitKey: LimitKey,
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const normalized = normalizeTier(tier);
  const limit = SUBSCRIPTION_PLANS[normalized]?.limits[limitKey] ?? 0;
  if (limit === Infinity) {
    return { allowed: true, limit: Infinity, remaining: Infinity };
  }
  const remaining = Math.max(0, limit - currentCount);
  return {
    allowed: currentCount < limit,
    limit,
    remaining,
  };
}

/** Returns plan details object */
export function getPlanDetails(tier: SubscriptionTier | string | undefined): PlanConfig {
  const normalized = normalizeTier(tier);
  return SUBSCRIPTION_PLANS[normalized] ?? SUBSCRIPTION_PLANS.free;
}
