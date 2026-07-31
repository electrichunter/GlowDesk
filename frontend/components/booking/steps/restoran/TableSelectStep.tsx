"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

interface TableSelectStepProps {
  tenantId?: string;
}

const SAMPLE_TABLES = [
  { id: 'tbl-1', label: 'Teras VIP 1', capacity: 4, location: 'Teras' },
  { id: 'tbl-2', label: 'Pencere Kenarı 2', capacity: 2, location: 'İç Mekan' },
  { id: 'tbl-3', label: 'Orta Salon 5', capacity: 6, location: 'İç Mekan' },
  { id: 'tbl-4', label: 'Bahçe Local 3', capacity: 8, location: 'Bahçe' },
];

export default function TableSelectStep({ tenantId }: TableSelectStepProps) {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;
  const guestCount = meta.guestCount || 2;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Masa Seçimi</h3>
        <p className="text-xs text-slate-500">
          {guestCount} kişilik grubunuza uygun müsait masalar listelenmiştir.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SAMPLE_TABLES.map((tbl) => {
          const isSelected = meta.tableId === tbl.id;
          const isCapacityEnough = tbl.capacity >= guestCount;

          return (
            <button
              key={tbl.id}
              type="button"
              disabled={!isCapacityEnough}
              onClick={() =>
                updateMetadata({
                  tableId: tbl.id,
                  tableLabel: tbl.label,
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-200'
                  : isCapacityEnough
                  ? 'border-slate-200 hover:border-slate-300 bg-white'
                  : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-xs text-slate-800">{tbl.label}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {tbl.location}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                🪑 Maksimum {tbl.capacity} Kişi
              </span>
              {!isCapacityEnough && (
                <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                  ⚠️ Kapasite yetersiz
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
