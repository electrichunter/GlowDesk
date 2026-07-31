"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — TenantContext
// Oturum açmış kullanıcının kiracı (tenant) ve sektör bilgisini uygulama
// genelinde tüm dashboard bileşenlerine sağlar.
//
// Kullanım:
//   const { tenant, vertical, verticalConfig } = useTenant();
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import {
  type VerticalKey,
  type VerticalDefinition,
  SECTOR_TO_VERTICAL,
} from '@/lib/verticals/types';

import { VERTICAL_CONFIG } from '@/lib/verticals/config';
import type { Tenant, SubscriptionTier } from '@/lib/types';
import type { SessionPayload } from '@/lib/session';
import {
  hasFeature,
  checkLimit,
  getPlanDetails,
  normalizeTier,
  type FeatureKey,
  type LimitKey,
  type PlanConfig,
} from '@/lib/plans';

// ─── Context Value Tipi ───────────────────────────────────────────────────────

interface TenantContextValue {
  /** Oturum açmış kullanıcının tenant kaydı (Admin için null olabilir) */
  tenant: Tenant | null;
  /** Aktif dikey sektör anahtarı */
  vertical: VerticalKey;
  /** Aktif sektörün tam konfigürasyon objesi */
  verticalConfig: VerticalDefinition;
  /** Oturum payload'ı */
  session: SessionPayload | null;
  /** Aktif abonelik planı */
  activePlan: SubscriptionTier;
  /** Aktif plan konfigürasyon detayları */
  planConfig: PlanConfig;
  /** Plan yükseltme / değiştirme işlemi */
  setSubscriptionTier: (newTier: SubscriptionTier) => void;
  /** Özellik erişim kontrolü */
  hasFeature: (feature: FeatureKey) => boolean;
  /** Limit kontrolü */
  checkLimit: (limitKey: LimitKey, currentCount: number) => { allowed: boolean; limit: number; remaining: number };
  /** Plan Yükseltme Modalı görünürlüğü */
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (targetFeature?: string) => void;
  closeUpgradeModal: () => void;
  upgradeModalTargetFeature: string | null;
}

// ─── Context Oluşturma ────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextValue | null>(null);

// ─── Provider Bileşeni ────────────────────────────────────────────────────────

interface TenantProviderProps {
  children: ReactNode;
  tenant: Tenant | null;
  session: SessionPayload | null;
}

/**
 * Dashboard layout'una sarılır. Tenant ve session bilgisi server-side'dan
 * props olarak geçirilir — canlı plan değişikliği ve modal tetikleyicisi destekler.
 */
export function TenantProvider({
  children,
  tenant: initialTenant,
  session,
}: TenantProviderProps) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(initialTenant);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeModalTargetFeature, setUpgradeModalTargetFeature] = useState<string | null>(null);

  const rawSector = currentTenant?.sector ?? 'beauty';
  const vertical: VerticalKey = SECTOR_TO_VERTICAL[rawSector] ?? 'salon';
  const verticalConfig = VERTICAL_CONFIG[vertical];

  const activePlan = normalizeTier(currentTenant?.subscription_tier ?? 'pro');
  const planConfig = getPlanDetails(activePlan);

  const setSubscriptionTier = (newTier: SubscriptionTier) => {
    if (currentTenant) {
      setCurrentTenant({
        ...currentTenant,
        subscription_tier: newTier,
      });
    }
  };

  const openUpgradeModal = (targetFeature?: string) => {
    setUpgradeModalTargetFeature(targetFeature || null);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeModalTargetFeature(null);
  };

  const value: TenantContextValue = {
    tenant: currentTenant,
    vertical,
    verticalConfig,
    session,
    activePlan,
    planConfig,
    setSubscriptionTier,
    hasFeature: (feature: FeatureKey) => hasFeature(activePlan, feature),
    checkLimit: (limitKey: LimitKey, currentCount: number) => checkLimit(activePlan, limitKey, currentCount),
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    upgradeModalTargetFeature,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * TenantContext'e erişen hook.
 * Bu hook yalnızca TenantProvider içindeki client bileşenlerinde kullanılabilir.
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error(
      'useTenant() hook\'u TenantProvider dışında kullanıldı. ' +
      'Bu hook yalnızca (dashboard) layout\'u altındaki bileşenlerde çalışır.'
    );
  }
  return context;
}

