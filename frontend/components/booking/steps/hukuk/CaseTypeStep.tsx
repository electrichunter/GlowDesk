"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

interface CaseTypeStepProps {
  tenantId?: string;
}

const SAMPLE_CASE_TYPES = [
  { id: 'case-1', name: 'İş Hukuku Danışmanlığı', fee: 1000, desc: 'Kıdem, ihbar, işe iade ve alacak davaları.' },
  { id: 'case-2', name: 'Aile Hukuku & Boşanma', fee: 1200, desc: 'Anlaşmalı / çekişmeli boşanma, nafaka, velayet.' },
  { id: 'case-3', name: 'Ticaret & Şirket Hukuku', fee: 1500, desc: 'Sözleşme hazırlığı, şirket danışmanlığı.' },
  { id: 'case-4', name: 'Ceza Hukuku', fee: 2000, desc: 'Soruşturma, kovuşturma ve savunma danışmanlığı.' },
];

export default function CaseTypeStep({ tenantId }: CaseTypeStepProps) {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Vaka / Danışmanlık Türü Seçimi</h3>
        <p className="text-xs text-slate-500">Hangi konuda hukuki danışmanlık almak istediğinizi belirtin.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SAMPLE_CASE_TYPES.map((ct) => {
          const isSelected = meta.caseTypeId === ct.id;
          return (
            <button
              key={ct.id}
              type="button"
              onClick={() =>
                updateMetadata({
                  caseTypeId: ct.id,
                  caseTypeName: ct.name,
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-violet-500 bg-violet-50/50 ring-2 ring-violet-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-800">{ct.name}</span>
                <span className="font-extrabold text-xs text-violet-700">Ön Görüşme: ₺{ct.fee}</span>
              </div>
              <p className="text-[11px] text-slate-500">{ct.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
