"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GlowDesk — DynamicStatsCards
// Sektöre göre farklı metrik kartlarını render eder.
// Veri yokken skeleton gösterir — gelecekte API fetch buraya eklenir.
// ─────────────────────────────────────────────────────────────────────────────

import { useTenant } from '@/contexts/TenantContext';
import { VERTICAL_STATS } from '@/lib/verticals/stats-cards';
import type { StatsCardDef } from '@/lib/verticals/types';

// ─── İkon Haritası ───────────────────────────────────────────────────────────

const STAT_ICONS: Record<string, React.ReactNode> = {
  IconCalendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  IconTrendingUp: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  IconAlertTriangle: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  IconClock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  IconUsers: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  IconFolder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  ),
  IconGrid: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};

// ─── Renk Haritası ────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; icon: string; text: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   text: 'text-blue-800'   },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  text: 'text-green-800'  },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  text: 'text-amber-800'  },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    text: 'text-red-800'    },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', text: 'text-violet-800' },
};

// ─── Değer Formatlayıcı ───────────────────────────────────────────────────────

function formatValue(
  value: number | undefined,
  format: StatsCardDef['format']
): string {
  if (value === undefined) return '—';
  switch (format) {
    case 'currency': return `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`;
    case 'percent':  return `%${value.toFixed(1)}`;
    case 'number':   return value.toLocaleString('tr-TR');
  }
}

// ─── Tek Kart Bileşeni ────────────────────────────────────────────────────────

interface StatsCardProps {
  def: StatsCardDef;
  value?: number;
  isLoading?: boolean;
}

function StatsCard({ def, value, isLoading }: StatsCardProps) {
  const colors = COLOR_MAP[def.colorKey] ?? COLOR_MAP.blue;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.bg} ${colors.icon}`}>
        {STAT_ICONS[def.iconKey] ?? <span className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{def.label}</p>
        {isLoading ? (
          <div className="mt-1 h-7 w-20 bg-slate-100 rounded animate-pulse" />
        ) : (
          <p className={`text-2xl font-black ${colors.text} leading-tight mt-0.5`}>
            {formatValue(value, def.format)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────

interface DynamicStatsCardsProps {
  /** API'den gelen stats verisi — key: StatsCardDef.key, value: sayı */
  stats?: Record<string, number>;
  isLoading?: boolean;
}

export default function DynamicStatsCards({
  stats,
  isLoading = false,
}: DynamicStatsCardsProps) {
  const { vertical } = useTenant();
  const cardDefs = VERTICAL_STATS[vertical] ?? VERTICAL_STATS.salon;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cardDefs.map((def) => (
        <StatsCard
          key={def.key}
          def={def}
          value={stats?.[def.key]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
