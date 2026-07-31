"use client";

import React, { useState } from 'react';
import { useBookingEngine } from '../engine/BookingEngine';
import StepIndicator from './StepIndicator';

// Step bileşenleri
import CustomerInfoStep from '../steps/shared/CustomerInfoStep';
import DateTimeStep from '../steps/shared/DateTimeStep';
import ConfirmationStep from '../steps/shared/ConfirmationStep';
import ServiceStaffStep from '../steps/salon/ServiceStaffStep';
import CaseTypeStep from '../steps/hukuk/CaseTypeStep';
import DocumentUploadStep from '../steps/hukuk/DocumentUploadStep';
import HukukDepositStep from '../steps/hukuk/DepositStep';
import GuestCountStep from '../steps/restoran/GuestCountStep';
import TableSelectStep from '../steps/restoran/TableSelectStep';
import RestoranDepositStep from '../steps/restoran/DepositStep';

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
      // Shared
      case 'customer':
        return <CustomerInfoStep />;
      case 'datetime':
        return <DateTimeStep tenantId={tenantId} />;
      case 'confirm':
        return <ConfirmationStep />;

      // Salon
      case 'service-staff':
        return <ServiceStaffStep tenantId={tenantId} />;

      // Hukuk
      case 'case-type':
        return <CaseTypeStep tenantId={tenantId} />;
      case 'document':
        return <DocumentUploadStep />;
      case 'deposit':
        return state.vertical === 'hukuk' ? <HukukDepositStep /> : <RestoranDepositStep />;

      // Restoran
      case 'guest-count':
        return <GuestCountStep />;
      case 'table':
        return <TableSelectStep tenantId={tenantId} />;

      default:
        return <div>Bileşen bulunamadı: {currentStep.id}</div>;
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

      {/* Alt Butonlar */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={isFirstStep || isSubmitting}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
            isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
          }`}
        >
          ← Geri
        </button>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
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
            onClick={nextStep}
            disabled={!canNext}
            className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${
              canNext
                ? 'bg-[#1E1B4B] text-cyan-400 hover:bg-[#2A2663] shadow-md'
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
