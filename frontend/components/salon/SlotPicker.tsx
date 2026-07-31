"use client";

import { useState } from "react";
import type { Workstation, LunchBreak } from "@/lib/types";

interface SlotPickerProps {
  durationMinutes: number;
  workstations?: Workstation[];
  lunchBreak?: LunchBreak;
  bookedSlots?: string[];
  onSelectSlot: (time: string, workstation?: string) => void;
  selectedSlot: string | null;
}

export default function SlotPicker({
  durationMinutes,
  workstations = [
    { id: "ws-1", name: "1. Koltuk / Masa", is_active: true },
    { id: "ws-2", name: "2. Koltuk / Masa", is_active: true },
  ],
  lunchBreak = { enabled: true, start: "12:30", end: "13:30" },
  bookedSlots = [],
  onSelectSlot,
  selectedSlot,
}: SlotPickerProps) {
  const activeWorkstations = workstations.filter((w) => w.is_active);
  const [selectedWs, setSelectedWs] = useState<string>(
    activeWorkstations[0]?.name || "1. Koltuk / Masa"
  );

  // Standart 09:00 - 19:00 arası 30 dakikalık tüm slotlar
  const allTimeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30"
  ];

  // Slotun mola saatine gelip gelmediğini kontrol et
  const isLunchTime = (time: string): boolean => {
    if (!lunchBreak?.enabled) return false;
    const { start, end } = lunchBreak;
    return time >= start && time < end;
  };

  return (
    <div className="space-y-4">
      {/* Koltuk / Masa / Oda Seçimi */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#1E1B4B] uppercase tracking-wider">
          🪑 Koltuk / Oda / Çalışan İstasyonu Seçimi
        </label>
        <div className="flex flex-wrap gap-2">
          {activeWorkstations.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => setSelectedWs(ws.name)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                selectedWs === ws.name
                  ? "bg-[#1E1B4B] text-white border-[#1E1B4B] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {ws.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center text-xs text-slate-500 font-medium pt-1 gap-2">
        <span>⏱ Hizmet Süresi: {durationMinutes} Dakika</span>
        <div className="flex gap-2.5 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300 block" />
            <span>Boş</span>
          </div>
          {lunchBreak?.enabled && (
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 block" />
              <span>☕ Mola</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-slate-200 border border-slate-300 block" />
            <span className="line-through">Dolu</span>
          </div>
        </div>
      </div>

      {/* Saat Slotları */}
      <div className="grid grid-cols-4 gap-2">
        {allTimeSlots.map((time) => {
          const isLunch = isLunchTime(time);
          const isBooked = bookedSlots.includes(time);
          const isSelected = selectedSlot === time;

          if (isLunch) {
            return (
              <div
                key={time}
                className="py-2 px-1 text-[11px] font-bold rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-center flex flex-col items-center justify-center cursor-not-allowed select-none"
              >
                <span>{time}</span>
                <span className="text-[9px] text-amber-600 font-normal">☕ Mola</span>
              </div>
            );
          }

          if (isBooked) {
            return (
              <button
                key={time}
                type="button"
                disabled
                className="py-2.5 text-xs font-bold rounded-xl bg-slate-100 border border-slate-200 text-slate-400 line-through cursor-not-allowed text-center"
              >
                {time}
              </button>
            );
          }

          return (
            <button
              key={time}
              type="button"
              onClick={() => onSelectSlot(time, selectedWs)}
              className={`py-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-cyan-600 border-cyan-600 text-white shadow-md ring-2 ring-cyan-300"
                  : "bg-white border-slate-200 text-slate-800 hover:border-cyan-500 hover:text-cyan-600 shadow-2xs"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
