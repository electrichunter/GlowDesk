"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function ConfirmationStep() {
  const { state } = useBookingEngine();
  const { customerInfo, dateTime, metadata, vertical } = state;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Rezervasyon Özeti</h3>
        <p className="text-xs text-slate-500">Lütfen bilgilerinizi son kez kontrol edip onaylayın.</p>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3 text-xs">
        <div className="flex justify-between pb-2 border-b border-slate-200/60">
          <span className="text-slate-500">Sektör</span>
          <span className="font-bold text-slate-800 capitalize">{vertical}</span>
        </div>

        <div className="flex justify-between pb-2 border-b border-slate-200/60">
          <span className="text-slate-500">Ad Soyad</span>
          <span className="font-bold text-slate-800">{customerInfo.fullName || '—'}</span>
        </div>

        <div className="flex justify-between pb-2 border-b border-slate-200/60">
          <span className="text-slate-500">Telefon</span>
          <span className="font-bold text-slate-800">{customerInfo.phone || '—'}</span>
        </div>

        <div className="flex justify-between pb-2 border-b border-slate-200/60">
          <span className="text-slate-500">Tarih & Saat</span>
          <span className="font-bold text-indigo-700">
            {dateTime.date} | {dateTime.startTime}
          </span>
        </div>

        {/* Dynamic Sector Specific Summary */}
        {vertical === 'salon' && (
          <div className="flex justify-between">
            <span className="text-slate-500">Hizmet</span>
            <span className="font-bold text-slate-800">
              {(metadata as any).serviceName || 'Genel Bakım'}
            </span>
          </div>
        )}

        {vertical === 'hukuk' && (
          <>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Dava / Danışmanlık Türü</span>
              <span className="font-bold text-slate-800">
                {(metadata as any).caseTypeName || 'Danışmanlık'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ön Ödeme Durumu</span>
              <span className={`font-bold ${(metadata as any).depositPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                {(metadata as any).depositPaid ? 'Tamamlandı (₺500)' : 'Yerinde Ödeme'}
              </span>
            </div>
          </>
        )}

        {vertical === 'restoran' && (
          <>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-500">Kişi Sayısı</span>
              <span className="font-bold text-slate-800">
                {(metadata as any).guestCount || 2} Kişi
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Masa</span>
              <span className="font-bold text-slate-800">
                {(metadata as any).tableLabel || 'Standart Masa'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
