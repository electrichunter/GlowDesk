"use client";

import { useEffect, useRef, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { SUBSCRIPTION_PLANS, normalizeTier } from "@/lib/plans";
import type { SubscriptionTier } from "@/lib/types";

export default function PlanUpgradeModal() {
  const {
    isUpgradeModalOpen,
    closeUpgradeModal,
    activePlan,
    setSubscriptionTier,
    upgradeModalTargetFeature,
  } = useTenant();

  const [isYearly, setIsYearly] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Focus trap & ESC key handler
  useEffect(() => {
    if (!isUpgradeModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeUpgradeModal();
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Auto-focus on close button for accessibility
    setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isUpgradeModalOpen, closeUpgradeModal]);

  if (!isUpgradeModalOpen) return null;

  const handlePlanSelect = (tier: SubscriptionTier) => {
    setSubscriptionTier(tier);
    closeUpgradeModal();
  };

  const planTiers: SubscriptionTier[] = ["free", "pro", "enterprise"];

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="upgrade-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden text-slate-800 transition-all duration-300 transform scale-100"
        style={{
          boxShadow:
            "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)",
        }}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-8 sm:px-10 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-700/60">
          <button
            ref={closeBtnRef}
            onClick={closeUpgradeModal}
            aria-label="Modali Kapat"
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-2xl space-y-2">
            {upgradeModalTargetFeature && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <span>🔒</span>
                <span>Gerekli Özellik: {upgradeModalTargetFeature}</span>
              </span>
            )}
            <h2 id="upgrade-modal-title" className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              İşletmeniz İçin En Uygun Planı Seçin
            </h2>
            <p className="text-sm text-slate-300 font-medium">
              Sınırsız şube, AI destekli akıllı ajanda ve otomasyon araçları ile GlowDesk gücünü katlayın.
            </p>
          </div>

          {/* Monthly / Yearly Switch */}
          <div className="mt-6 inline-flex items-center gap-3 p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isYearly ? "bg-[#0066FF] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isYearly ? "bg-[#0066FF] text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-400 text-slate-950 font-black">
                %20 İndirim
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body - Bento Plan Cards */}
        <div className="p-6 sm:p-10 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {planTiers.map((tier) => {
              const plan = SUBSCRIPTION_PLANS[tier];
              const isCurrent = activePlan === tier;
              const price = isYearly ? plan.yearlyPriceMonthly : plan.monthlyPrice;

              return (
                <div
                  key={tier}
                  className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-300 ${
                    plan.popular
                      ? "bg-white border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20"
                      : isCurrent
                      ? "bg-white border-emerald-500/80 shadow-md"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-md"
                  }`}
                  style={{
                    boxShadow: plan.popular
                      ? "0 10px 30px -5px rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 1)"
                      : "0 4px 12px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 1)",
                  }}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-sm">
                      En Popüler Seçenek
                    </span>
                  )}

                  {isCurrent && (
                    <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-sm">
                      Mevcut Planınız
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${plan.badgeClass}`}>
                        {plan.badgeLabel}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-2 font-display">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 min-h-[32px]">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="py-2 border-y border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
                          ₺{price}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">/ ay</span>
                      </div>
                      {isYearly && price > 0 && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                          Yıllık faturalandırılır (₺{price * 12}/yıl)
                        </p>
                      )}
                    </div>

                    {/* Feature Checklist */}
                    <ul className="space-y-2.5 text-xs text-slate-700 font-semibold py-2">
                      {plan.featureList.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6">
                    <button
                      onClick={() => handlePlanSelect(tier)}
                      disabled={isCurrent}
                      className={`w-full py-3 px-4 rounded-2xl text-xs font-extrabold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 ${
                        isCurrent
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : plan.popular
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40"
                          : tier === "enterprise"
                          ? "bg-slate-900 hover:bg-slate-800 text-white"
                          : "bg-[#0066FF] hover:bg-blue-700 text-white shadow-blue-500/20"
                      }`}
                    >
                      {isCurrent ? (
                        "Aktif Planınız"
                      ) : (
                        <>
                          <span>{tier === "free" ? "Starter'a Düşür" : `${plan.name}'a Geç`}</span>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs text-indigo-950">
            <div className="flex items-center gap-3">
              <span className="text-xl">💡</span>
              <p className="font-semibold">
                <strong>Simülasyon Modu:</strong> Plan seçimi yaptığınızda sistem anında yeni plan yetkilerini ve görünümünü canlı olarak uygular.
              </p>
            </div>
            <button
              onClick={closeUpgradeModal}
              className="text-xs font-extrabold text-indigo-700 hover:underline shrink-0"
            >
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
