"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Zaten kapatıldıysa gösterme
    const isDismissedSession = sessionStorage.getItem("glowdesk_exit_dismissed");
    if (isDismissedSession) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setIsVisible(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [dismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setDismissed(true);
    sessionStorage.setItem("glowdesk_exit_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-indigo-100 p-6 md:p-8 text-center space-y-6">
        
        {/* Kapat Butonu */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm transition-colors"
          aria-label="Kapat"
        >
          ✕
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800">
          🎁 Özel Fırsat — Çıkmadan Önce Deneyin
        </div>

        {/* Başlık */}
        <h3 className="text-2xl font-extrabold text-[#1E1B4B] font-display leading-snug">
          Gelmeyen Randevular Yüzünden Ciro Kaybetmeye Son Verin!
        </h3>

        {/* Açıklama */}
        <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
          GlowDesk&apos;in <strong>Akıllı No-Show Kurtarma Motoru</strong> ile randevu saatlerinizi otomatik doldurun. 1 ay boyunca tamamen ücretsiz deneyin.
        </p>

        {/* Vurgu Kutusu */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700 font-medium text-left">
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <span>✓</span> Kredi Kartı Bilgisi Gerekmez
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <span>✓</span> 2 Dakikada Hızlı Kurulum
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <span>✓</span> 30 Gün Ciro Artış Garantisi
          </div>
        </div>

        {/* CTA Butonları */}
        <div className="space-y-3 pt-2">
          <Link
            href="/register"
            onClick={handleClose}
            className="btn-primary w-full justify-center py-3.5 text-sm shadow-lg"
          >
            1 Ay Ücretsiz Denememi Başlat
          </Link>
          <button
            onClick={handleClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium block mx-auto underline"
          >
            Hayır teşekkürler, doluluk kaybetmeye devam etmek istiyorum
          </button>
        </div>

      </div>
    </div>
  );
}
