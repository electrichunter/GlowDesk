"use client";

import React from 'react';
import { useBookingEngine } from '../../engine/BookingEngine';

interface ServiceStaffStepProps {
  tenantId?: string;
}

const SAMPLE_SERVICES = [
  { id: 'svc-1', name: 'Saç Kesim & Fön', duration: 45, price: 350 },
  { id: 'svc-2', name: 'Sakal Tıraşı & Bakım', duration: 30, price: 200 },
  { id: 'svc-3', name: 'Cilt Bakımı & Maske', duration: 60, price: 600 },
  { id: 'svc-4', name: 'Manikür & Pedikür', duration: 50, price: 450 },
];

export default function ServiceStaffStep({ tenantId }: ServiceStaffStepProps) {
  const { state, updateMetadata } = useBookingEngine();
  const meta = state.metadata as any;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#1E1B4B]">Hizmet Seçimi</h3>
        <p className="text-xs text-slate-500">Almak istediğiniz hizmeti listeden seçin.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SAMPLE_SERVICES.map((svc) => {
          const isSelected = meta.serviceId === svc.id;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() =>
                updateMetadata({
                  serviceId: svc.id,
                  serviceName: svc.name,
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-200'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-xs text-slate-800">{svc.name}</span>
                <span className="font-extrabold text-xs text-cyan-600">₺{svc.price}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">⏳ {svc.duration} dk</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
