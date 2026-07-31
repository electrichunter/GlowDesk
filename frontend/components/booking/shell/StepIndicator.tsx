"use client";

import React from 'react';
import { useBookingEngine } from '../engine/BookingEngine';

export default function StepIndicator() {
  const { steps, state } = useBookingEngine();

  return (
    <div className="w-full py-4 mb-6 border-b border-slate-100">
      <div className="flex items-center justify-between max-w-xl mx-auto px-4">
        {steps.map((step, idx) => {
          const isActive = idx === state.currentStepIndex;
          const isCompleted = idx < state.currentStepIndex;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#1E1B4B] text-cyan-400 ring-4 ring-cyan-100 scale-110'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] mt-1.5 font-medium truncate max-w-[70px] text-center ${
                  isActive ? 'text-[#1E1B4B] font-bold' : 'text-slate-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-4 transition-all ${
                    idx < state.currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
