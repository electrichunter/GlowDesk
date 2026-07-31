"use client";

import React, { useState } from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

interface DateTimeStepProps {
  tenantId?: string;
}

const SAMPLE_TIMES = ['09:00', '10:00', '11:30', '13:00', '14:30', '16:00', '17:30'];

export default function DateTimeStep({ tenantId }: DateTimeStepProps) {
  const { state, updateDateTime } = useBookingEngine();
  const selectedDate = state.dateTime.date || new Date().toISOString().split('T')[0];
  const selectedTime = state.dateTime.startTime || '';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Tarih ve Saat Seçimi</h3>
        <p className="text-xs text-slate-500">Size uygun olan gün ve saati belirleyin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tarih</label>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => updateDateTime({ date: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Müsait Saatler</label>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLE_TIMES.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() =>
                    updateDateTime({
                      date: selectedDate,
                      startTime: time,
                      endTime: `${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1]}`,
                    })
                  }
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#1E1B4B] text-cyan-400 border-[#1E1B4B] shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
