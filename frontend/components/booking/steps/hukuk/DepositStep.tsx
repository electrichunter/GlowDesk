"use client";

import React, { useState } from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function DepositStep() {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;
  const isPaid = meta.depositPaid || false;
  const [processing, setProcessing] = useState(false);

  const handleSimulatePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      updateMetadata({
        depositPaid: true,
        depositAmount: 500,
        paymentRef: `iyzi_${Math.random().toString(36).substring(2, 9)}`,
      });
      setProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Danışmanlık Ön Ödemesi</h3>
        <p className="text-xs text-slate-500">
          Randevu saatinizin rezerve edilmesi için ₺500 tutarında danışmanlık ön ödemesi alınmaktadır. (Iyzico / Stripe Güvenli Ödeme)
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-800 block">Danışmanlık Depozitosu</span>
            <span className="text-[10px] text-slate-400">Görüşme ücretinden düşülecektir</span>
          </div>
          <span className="text-lg font-black text-violet-700">₺500.00</span>
        </div>

        {isPaid ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
            <span>✅ Ön Ödeme Onaylandı</span>
            <span className="text-[10px] text-emerald-600 font-mono">Ref: {meta.paymentRef}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ödeme Sayfasına Yönlendiriliyor...
              </>
            ) : (
              '💳 ₺500 Ön Ödeme Yap (Stripe/Iyzico)'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
