"use client";

import React, { useState } from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function DepositStep() {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;
  const guestCount = meta.guestCount || 2;
  const depositNeeded = guestCount >= 4; // 4 kişi ve üzeri depozito şart
  const depositAmount = guestCount * 100; // Kişi başı 100 TL depozito
  const isPaid = meta.depositPaid || false;
  const [processing, setProcessing] = useState(false);

  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      updateMetadata({
        depositPaid: true,
        depositAmount: depositAmount,
        paymentRef: `rest_dep_${Math.random().toString(36).substring(2, 9)}`,
      });
      setProcessing(false);
    }, 1000);
  };

  if (!depositNeeded) {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          ✓
        </div>
        <h3 className="text-base font-bold text-slate-800">Depozito Gerekmiyor</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {guestCount} kişilik rezervasyonunuz için ön ödeme gereksinimi bulunmamaktadır. Randevu onayına geçebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Masa Rezervasyon Depozitosu</h3>
        <p className="text-xs text-slate-500">
          4 kişi ve üzeri gruplarda no-show koruması amacıyla depozito alınmaktadır. Hesaptan düşülecektir.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-800 block">{guestCount} Kişilik Masa Depozitosu</span>
            <span className="text-[10px] text-slate-400">Kişi başı ₺100</span>
          </div>
          <span className="text-lg font-black text-amber-600">₺{depositAmount}.00</span>
        </div>

        {isPaid ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
            <span>✅ Depozito Ödendi</span>
            <span className="text-[10px] text-emerald-600 font-mono">Ref: {meta.paymentRef}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ödeme Alınıyor...
              </>
            ) : (
              `💳 ₺${depositAmount} Depozito Öde (Stripe/Iyzico)`
            )}
          </button>
        )}
      </div>
    </div>
  );
}
