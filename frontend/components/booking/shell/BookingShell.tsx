"use client";

import React, { useState } from 'react';
import { useBookingEngine } from '../engine/BookingEngine';
import StepIndicator from './StepIndicator';

// Step bileşenleri
import CustomerInfoStep from '../steps/shared/CustomerInfoStep';
import DateTimeStep from '../steps/shared/DateTimeStep';
import DepositStep from '../steps/shared/DepositStep';
import ConfirmationStep from '../steps/shared/ConfirmationStep';

interface BookingShellProps {
  tenantId: string;
  onSuccess?: (appointmentId: string) => void;
}

export default function BookingShell({ tenantId, onSuccess }: BookingShellProps) {
  const { state, currentStep, isFirstStep, isLastStep, canNext, nextStep, prevStep, dispatch } = useBookingEngine();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mevcut adımı bileşen ile eşleştir
  const renderStepComponent = () => {
    switch (currentStep.id) {
      case 'datetime':
        return <DateTimeStep tenantId={tenantId} />;
      case 'customer':
        return <CustomerInfoStep />;
      case 'deposit':
        return <DepositStep />;
      case 'confirm':
        return <ConfirmationStep />;
      default:
        return <DateTimeStep tenantId={tenantId} />;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          vertical: state.vertical,
          customerInfo: state.customerInfo,
          dateTime: state.dateTime,
          metadata: state.metadata,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rezervasyon oluşturulamadı');

      if (onSuccess) onSuccess(data.appointmentId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir sorun oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden max-w-2xl mx-auto">
      <StepIndicator />

      <div className="p-6 md:p-8 min-h-[320px]">
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}
        {renderStepComponent()}
      </div>

      {/* Alt Butonlar (Mobil Uyumlu Min 44px Dokunma Alanları) */}
      <div className="p-4 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          disabled={isFirstStep || isSubmitting}
          className={`px-5 py-3 text-xs font-bold rounded-2xl transition-all min-touch ${
            isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95'
          }`}
        >
          ← Geri
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 min-touch active:scale-95"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                İşleniyor...
              </>
            ) : (
              'Rezervasyonu Tamamla 🎉'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canNext}
            className={`flex-1 sm:flex-initial px-6 py-3 text-xs font-bold rounded-2xl transition-all min-touch flex items-center justify-center ${
              canNext
                ? 'bg-[#0066FF] text-white hover:bg-blue-700 shadow-md active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Devam Et →
          </button>
        )}
      </div>
    </div>
  );
}
