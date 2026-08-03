"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. Üst Menü Navigasyonu (Menü Yok Olmaz) */}
      <Navbar />

      {/* 2. Ana 404 Görsel & İçerik Alanı */}
      <main className="flex-1 flex items-center justify-center relative overflow-hidden py-16 px-4">
        {/* Arka Plan Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
          
          {/* Neon 404 Rozeti */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-widest uppercase shadow-lg shadow-cyan-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>404 - Sayfa Bulunamadı</span>
          </div>

          {/* Dev Tipografi */}
          <div className="space-y-3">
            <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 font-display">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Aradığınız Sayfa Başka Bir Boyuta Geçmiş Olabilir 🚀
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-medium">
              Ulaşmaya çalıştığınız bağlantı silinmiş, adresi değişmiş veya hiç var olmamış olabilir. Aşağıdaki hızlı menüyü kullanarak GlowDesk evrenine geri dönebilirsiniz.
            </p>
          </div>

          {/* Hızlı Eylem Butonları */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-xl shadow-cyan-500/20 hover:scale-105 flex items-center gap-2"
            >
              <span>📊</span> <span>İşletme Dashboard'una Git</span>
            </Link>

            <Link
              href="/"
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl border border-slate-700/80 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>🏠</span> <span>Ana Sayfaya Dön</span>
            </Link>

          </div>

          {/* Yardım Kartı */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <span>❓ Bir hata olduğunu mu düşünüyorsunuz?</span>
            </span>
            <Link href="/urun-destek" className="text-cyan-400 hover:underline font-bold">
              7/24 Canlı Destek Al →
            </Link>
          </div>

        </div>
      </main>

      {/* 3. Alt Menü Altbilgisi */}
      <Footer />
    </div>
  );
}
