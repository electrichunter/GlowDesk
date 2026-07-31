"use client";

import { useTenant } from "@/contexts/TenantContext";
import type { FeatureKey } from "@/lib/plans";

interface PlanFeatureGateProps {
  feature: FeatureKey;
  featureTitle: string;
  featureDescription?: string;
  requiredTier?: "pro" | "enterprise";
  children: React.ReactNode;
}

export default function PlanFeatureGate({
  feature,
  featureTitle,
  featureDescription,
  requiredTier = "pro",
  children,
}: PlanFeatureGateProps) {
  const { hasFeature, openUpgradeModal } = useTenant();

  const isEnabled = hasFeature(feature);

  if (isEnabled) {
    return <>{children}</>;
  }

  const badgeText = requiredTier === "enterprise" ? "👑 Enterprise" : "⚡ Pro";
  const badgeColor =
    requiredTier === "enterprise"
      ? "bg-amber-100 text-amber-900 border-amber-300"
      : "bg-indigo-100 text-indigo-900 border-indigo-300";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Blurred Background Content Mock */}
      <div className="pointer-events-none select-none filter blur-[3px] opacity-40">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm text-center">
        <div
          className="max-w-md w-full p-6 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xl space-y-4"
          style={{
            boxShadow:
              "0 20px 25px -5px rgba(15, 23, 42, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.9)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
            🔒
          </div>

          <div className="space-y-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeColor}`}
            >
              {badgeText} Paket Özelliği
            </span>
            <h4 className="text-lg font-extrabold text-slate-900 font-display">
              {featureTitle} Özelliği Kilitli
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {featureDescription ||
                `Bu modülü kullanabilmek için işletme paketinizin ${badgeText} seviyesine yükseltilmesi gerekmektedir.`}
            </p>
          </div>

          <button
            onClick={() => openUpgradeModal(featureTitle)}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-[#0066FF] hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Paketi Yükselt ve Kilidi Aç</span>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
