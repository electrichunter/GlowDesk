"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — DynamicOnboarding
// Sektöre göre doğru onboarding adımlarını render eder.
// Mevcut OnboardingWizard'ın yerini alır — ama aynı CSS sınıflarını kullanır.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { VERTICAL_ONBOARDING } from '@/lib/verticals/onboarding';
import { safeJsonParse } from '@/lib/sanitize';

const SETTINGS_KEY = 'glowdesk_tenant_settings';

export default function DynamicOnboarding() {
  const { session, vertical, verticalConfig } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Onboarding açılış kontrolü
  useEffect(() => {
    if (session?.role !== 'owner') return;

    const saved = localStorage.getItem(SETTINGS_KEY);
    const settings = safeJsonParse<Record<string, unknown>>(saved, {});
    const isComplete = settings?.onboardingCompleted === true;
    const isNew      = session.isNewUser === true;

    if (isNew || !isComplete) {
      setIsOpen(true);
    }
  }, [session]);

  if (!isOpen) return null;

  const steps = VERTICAL_ONBOARDING[vertical] ?? VERTICAL_ONBOARDING.salon;
  const step  = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Onboarding tamamlandı olarak işaretle
      const existing = safeJsonParse<Record<string, unknown>>(
        localStorage.getItem(SETTINGS_KEY),
        {}
      );
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...existing, onboardingCompleted: true })
      );
      setIsOpen(false);
    } else {
      setCurrentStep((p) => p + 1);
    }
  };

  const handleSkip = () => {
    const existing = safeJsonParse<Record<string, unknown>>(
      localStorage.getItem(SETTINGS_KEY),
      {}
    );
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...existing, onboardingCompleted: true })
    );
    setIsOpen(false);
  };

  const accentClass = {
    cyan:   'bg-cyan-600 hover:bg-cyan-700',
    violet: 'bg-violet-600 hover:bg-violet-700',
    amber:  'bg-amber-500 hover:bg-amber-600',
  }[verticalConfig?.accentColor ?? 'cyan'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Üst bant */}
        <div className={`px-6 py-4 ${accentClass.split(' ')[0]}`}>
          <div className="flex items-center justify-between">
            <span className="text-white text-2xl">{verticalConfig?.icon}</span>
            <span className="text-white/80 text-xs font-semibold">
              Adım {currentStep + 1} / {steps.length}
            </span>
          </div>
          {/* İlerleme çubuğu */}
          <div className="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* İçerik */}
        <div className="px-6 py-5">
          <h2 className="text-lg font-black text-slate-800">{step?.title}</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step?.description}</p>
        </div>

        {/* Adım göstergesi (nokta) */}
        <div className="px-6 pb-2 flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep
                  ? 'w-5 bg-slate-700'
                  : i < currentStep
                  ? 'bg-slate-400'
                  : 'bg-slate-200'
              }`}
              aria-label={`Adım ${i + 1}`}
            />
          ))}
        </div>

        {/* 1-Click Demo Injector (Aha! Moment) */}
        <div className="px-6 pb-2">
          <button
            onClick={async () => {
              if (session?.tenantId) {
                try {
                  const { apiRequest } = await import('@/lib/api-client');
                  await apiRequest(`/tenants/${session.tenantId}/seed-demo?sector=${vertical}`, { method: 'POST' });
                  window.location.reload();
                } catch (e) {
                  console.error("Demo seeding error:", e);
                }
              }
            }}
            className="w-full py-2.5 px-4 text-xs font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>✨</span>
            <span>Tek Tıkla Canlı Demo Verileri Yükle (60 Randevu & Ciro)</span>
          </button>
        </div>

        {/* Aksiyonlar */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline-offset-2 hover:underline"
          >
            Kurulumu Atla
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((p) => p - 1)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Geri
              </button>
            )}
            <button
              onClick={handleNext}
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl transition-colors ${accentClass}`}
            >
              {isLastStep ? 'Başla 🚀' : 'İleri →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
