"use client";

import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-4xl shadow-inner animate-bounce">
        🔍
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-slate-900 font-display">
          Aradığınız Panel Sayfası Bulunamadı
        </h2>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Ulaşmaya çalıştığınız modül veya yetki alanı bulunamadı. Yan menüden diğer sektör sayfalarına hızlıca geçiş yapabilirsiniz.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="btn-cyan py-2.5 px-5 text-xs font-black shadow-md flex items-center gap-2"
        >
          <span>📊</span> <span>Özet Panele Dön</span>
        </Link>
        <Link
          href="/appointments"
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
        >
          <span>📅</span> <span>Takvime Git</span>
        </Link>
      </div>
    </div>
  );
}
