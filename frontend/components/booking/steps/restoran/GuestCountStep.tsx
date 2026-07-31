"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function GuestCountStep() {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;
  const currentCount = meta.guestCount || 2;

  const setCount = (val: number) => {
    if (val < 1 || val > 20) return;
    updateMetadata({ guestCount: val });
  };

  return (
    <div className="space-y-6 text-center py-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Kişi Sayısı Seçimi</h3>
        <p className="text-xs text-slate-500">Masa kapasitesi doğrulaması için gelecek kişi sayısını seçin.</p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setCount(currentCount - 1)}
          disabled={currentCount <= 1}
          className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xl flex items-center justify-center transition-all disabled:opacity-30"
        >
          -
        </button>

        <div className="text-center">
          <span className="text-4xl font-black text-amber-600 block">{currentCount}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Misafir</span>
        </div>

        <button
          type="button"
          onClick={() => setCount(currentCount + 1)}
          disabled={currentCount >= 20}
          className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xl flex items-center justify-center transition-all"
        >
          +
        </button>
      </div>

      {currentCount > 8 && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
          ℹ️ 8 üzeri kalabalık gruplar için depozito gerekliliği doğabilir.
        </div>
      )}
    </div>
  );
}
