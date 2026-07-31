import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, subtext, icon, trend }: StatsCardProps) {
  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-3xl p-6 shadow-layered hover:shadow-layered-hover transition-all duration-300 overflow-hidden">
      {/* Subtle Electric Radial Mesh Background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest font-display">
            {title}
          </span>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {value}
          </div>
          {subtext && (
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {subtext}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end justify-between h-full space-y-3">
          {icon && (
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100/80 text-[#0066FF] text-xl flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
          {trend && (
            <span
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs ${
                trend.isPositive
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
