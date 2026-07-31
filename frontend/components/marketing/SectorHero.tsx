import React from 'react';
import type { VerticalDefinition } from '@/lib/verticals/types';
import Link from 'next/link';

interface SectorHeroProps {
  config: VerticalDefinition;
}

export function SectorHero({ config }: SectorHeroProps) {
  const accentClassesMap: Record<string, string> = {
    cyan:    'bg-cyan-500 text-slate-900',
    violet:  'bg-violet-600 text-white',
    amber:   'bg-amber-500 text-slate-900',
    emerald: 'bg-emerald-600 text-white',
    orange:  'bg-orange-600 text-white',
    lime:    'bg-lime-500 text-slate-900',
    teal:    'bg-teal-600 text-white',
    indigo:  'bg-indigo-600 text-white',
    rose:    'bg-rose-600 text-white',
    purple:  'bg-purple-600 text-white',
    sky:     'bg-sky-500 text-slate-900',
    yellow:  'bg-yellow-400 text-slate-900',
  };
  const accentClasses = accentClassesMap[config.accentColor || 'cyan'] ?? accentClassesMap.cyan;


  return (
    <section className="relative py-20 px-6 max-w-6xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 mb-6">
        <span>{config.icon}</span>
        <span>GlowDesk {config.label} Çözümü</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-[#1E1B4B] tracking-tight leading-tight max-w-4xl mx-auto">
        {config.heroHeadline}
      </h1>

      <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
        {config.heroSubline}
      </p>

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/register?vertical=${config.slug}`}
          className={`px-8 py-4 rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 transition-all ${accentClasses}`}
        >
          Ücretsiz Denemeyi Başlat 🚀
        </Link>
        <Link
          href="#demo"
          className="px-8 py-4 rounded-2xl font-bold text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
        >
          Canlı Demo İncele
        </Link>
      </div>
    </section>
  );
}
