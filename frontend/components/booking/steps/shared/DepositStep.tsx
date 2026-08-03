"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function DepositStep() {
  const { state, updateMetadata } = useBookingEngine();
  const isDepositPaid = Boolean((state.metadata as any).depositPaid);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Ön Ödeme / Kapora</h3>
        <p className="text-xs text-slate-500">
          Rezervasyonunuzun kesinleşmesi için güvence ödemesi adımı.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Rezervasyon Kaporası</h4>
            <p className="text-xs text-slate-500">Tahsisi kesinleştirmek için ön ödeme tutarı</p>
          </div>
          <span className="text-lg font-black text-emerald-600">₺250.00</span>
        </div>

        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">Ödeme Durumu</span>
          <button
            type="button"
            onClick={() => updateMetadata({ ...state.metadata, depositPaid: !isDepositPaid })}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              isDepositPaid
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isDepositPaid ? '✓ Ön Ödeme Tamamlandı' : 'Ön Ödemeyi Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}
