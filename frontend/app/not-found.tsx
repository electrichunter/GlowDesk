"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative overflow-hidden pt-32 pb-24 px-6">
        
        {/* Background Glowing Circles & Animation */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-400/20 via-cyan-400/10 to-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-layered">
          
          {/* Animated 3D Floating Graphic */}
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-100/80 animate-ping opacity-75" />
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#0066FF] to-blue-600 text-white font-black text-4xl flex items-center justify-center shadow-xl shadow-blue-500/30 transform hover:rotate-12 transition-transform duration-300">
              🚀 404
            </div>
          </div>

          {/* Animated Rozet */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0066FF] text-xs font-extrabold tracking-wider uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
            <span>Sayfa Bulunamadı veya Geliştirme Aşamasında</span>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 font-display">
              Bu Sayfa Henüz Hazır Değil 🛠️
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-medium">
              Ulaşmaya çalıştığınız bağlantı silinmiş, adı değişmiş veya yeni sürüm güncellemesi kapsamında geliştirme aşamasında olabilir.
            </p>
          </div>

          {/* Hızlı Eylem Butonları */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="btn-primary-blue text-xs py-3.5 px-6 font-extrabold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>🏠</span> <span>Ana Sayfaya Dön</span>
            </Link>

            <Link
              href="/explore"
              className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>🔍</span> <span>İşletmeleri Keşfet</span>
            </Link>

            <Link
              href="/plan-upgrade"
              className="px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-extrabold text-xs rounded-2xl border border-indigo-200 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>⚡</span> <span>Paket & Plan Yükselt</span>
            </Link>
          </div>

          {/* Destek Kartı */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
            <span>❓ Bir sorun mu var? Canlı destek ekibimize hemen bildirin:</span>
            <Link href="/urun-destek" className="text-[#0066FF] hover:underline font-extrabold">
              💬 Canlı Destek Al →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
