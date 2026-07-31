"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

export default function CustomerInfoStep() {
  const { state, updateCustomer } = useBookingEngine();
  const info = state.customerInfo;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">İletişim Bilgileriniz</h3>
        <p className="text-xs text-slate-500">Randevu onay ve hatırlatma detayları bu bilgilere gönderilecektir.</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Ad Soyad *</label>
          <input
            type="text"
            value={info.fullName || ''}
            onChange={(e) => updateCustomer({ fullName: e.target.value })}
            placeholder="örn: Ahmet Yılmaz"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon Numarası *</label>
          <input
            type="tel"
            value={info.phone || ''}
            onChange={(e) => updateCustomer({ phone: e.target.value })}
            placeholder="05xx xxx xx xx"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta Adresi (İsteğe Bağlı)</label>
          <input
            type="email"
            value={info.email || ''}
            onChange={(e) => updateCustomer({ email: e.target.value })}
            placeholder="ahmet@example.com"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Not / Özel İstekler (İsteğe Bağlı)</label>
          <textarea
            value={info.notes || ''}
            onChange={(e) => updateCustomer({ notes: e.target.value })}
            rows={2}
            placeholder="Belirtmek istediğiniz ek notlar..."
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
