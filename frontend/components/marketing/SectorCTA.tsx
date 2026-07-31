import React from 'react';
import type { VerticalDefinition } from '@/lib/verticals/types';
import Link from 'next/link';

interface SectorCTAProps {
  config: VerticalDefinition;
}

export function SectorCTA({ config }: SectorCTAProps) {
  return (
    <section className="py-20 px-6 max-w-5xl mx-auto text-center">
      <div className="bg-[#1E1B4B] text-white rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <span className="text-4xl">{config.icon}</span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight">
            {config.label} Dijitalleşmesine Bugün Başlayın
          </h2>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto">
            14 gün boyunca kredi kartı olmadan deneyin. Tüm özellikler aktif.
          </p>
          <Link
            href={`/register?vertical=${config.slug}`}
            className="inline-block px-8 py-4 bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg hover:bg-cyan-300 transition-all"
          >
            Hemen Ücretsiz Hesabınızı Açın →
          </Link>
        </div>
      </div>
    </section>
  );
}
