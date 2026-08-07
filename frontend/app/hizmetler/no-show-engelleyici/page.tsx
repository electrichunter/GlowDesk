"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NoShowProtectionPage() {
  const [monthlyAppointments, setMonthlyAppointments] = useState<number>(200);
  const [averagePrice, setAveragePrice] = useState<number>(600);
  const [currentNoShowRate, setCurrentNoShowRate] = useState<number>(20);

  // Math calculations for loss vs savings
  const totalMonthlyRevenuePossible = monthlyAppointments * averagePrice;
  const currentLostRevenue = Math.round(totalMonthlyRevenuePossible * (currentNoShowRate / 100));
  // GlowDesk reduces no-show by up to 88-90%
  const recoveredRevenue = Math.round(currentLostRevenue * 0.88);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#090D16] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Ambient Lighting Mesh */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-extrabold tracking-wider uppercase inline-flex items-center gap-2">
                <span>⚡</span> <span>No-Show Engelleyici Motoru</span>
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
                Gelmeyen Müşterilere Son: <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                  %90 Oranında Gelir Kaybını Önleyin
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-lg leading-relaxed font-medium max-w-2xl">
                GlowDesk No-Show Engelleyici Motoru; otomatik kapara (depozito) tahsilatı, kredi kartı provizyonu ve akıllı WhatsApp onay adımlarıyla boş kalan koltukları geçmişte bırakır.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register/business"
                  className="btn-primary-blue text-sm py-4 px-8 font-black shadow-xl shadow-blue-500/30 hover:scale-105 transition-all text-center"
                >
                  🚀 1 Ay Ücretsiz Deneyin
                </Link>
                <Link
                  href="/#pricing"
                  className="px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-bold transition-all text-center"
                >
                  💳 Paketleri İncele
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CORE ADVANTAGES GRID ── */}
        <section className="max-w-7xl mx-auto px-6 mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-[#0066FF] uppercase tracking-wider">Nasıl Çalışır?</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              3 Kademeli Akıllı Koruma Kalkanı
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              İşletmenizin boş zaman dilimlerini tam doluluk oranına ulaştıran teknolojik altyapı.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-layered hover:shadow-2xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066FF] text-2xl flex items-center justify-center font-bold border border-blue-100 group-hover:scale-110 transition-transform">
                💳
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">Akıllı Kapara & Provizyon</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Yüksek tutarlı işlemlerde müşteriden randevu anında kapara tahsil edin veya kredi kartına no-show provizyonu koyun. Gelinmediği takdirde iptal ücreti otomatik aktarılır.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-layered hover:shadow-2xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 text-2xl flex items-center justify-center font-bold border border-cyan-100 group-hover:scale-110 transition-transform">
                📲
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">WhatsApp Çift Yönlü Teyit</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Randevudan 24 saat ve 2 saat önce müşteriye giden WhatsApp mesajındaki "Geliyorum" veya "İptal Et" butonları ile takvim anında güncellenir.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-layered hover:shadow-2xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#1E1B4B]/10 text-[#1E1B4B] text-2xl flex items-center justify-center font-bold border border-[#1E1B4B]/20 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">Müşteri Sadakat & Güven Skoru</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Daha önce randevusuna gelmemiş müşteriler sistem tarafından otomatik etiketlenir ve sonraki randevularında ön ödeme şartı zorunlu tutulur.
              </p>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE NO-SHOW CALCULATOR ── */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-layered space-y-8">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-extrabold rounded-full border border-amber-200">
                💰 Kazanç Hesaplama Aracı
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                No-Show Nedeniyle Ne Kadar Kaybediyorsunuz?
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Aşağıdaki kaydırıcıları ayarlayarak GlowDesk'in işletmenize geri kazandıracağı aylık geliri hesaplayın.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Slider 1 */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Aylık Randevu Sayısı:</span>
                  <span className="text-[#0066FF] font-extrabold text-sm">{monthlyAppointments} Randevu</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={monthlyAppointments}
                  onChange={(e) => setMonthlyAppointments(Number(e.target.value))}
                  className="w-full accent-[#0066FF] cursor-pointer"
                />
              </div>

              {/* Slider 2 */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Ortalama İşlem Tutarı:</span>
                  <span className="text-[#0066FF] font-extrabold text-sm">₺{averagePrice}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(Number(e.target.value))}
                  className="w-full accent-[#0066FF] cursor-pointer"
                />
              </div>

              {/* Slider 3 */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Gelmedi (No-Show) Oranı:</span>
                  <span className="text-rose-600 font-extrabold text-sm">%{currentNoShowRate}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={currentNoShowRate}
                  onChange={(e) => setCurrentNoShowRate(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block text-rose-600">Mevcut Tahmini Aylık Kayıp</span>
                <span className="text-2xl sm:text-3xl font-black font-mono">₺{currentLostRevenue.toLocaleString("tr-TR")}</span>
                <p className="text-[11px] text-rose-700">İptal veya bildirimsiz gelmeme kaynaklı kaybolan ciro.</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block text-emerald-600">GlowDesk İle Kazanacağınız Ciro</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">+₺{recoveredRevenue.toLocaleString("tr-TR")} / Ay</span>
                <p className="text-[11px] text-emerald-700">No-Show engelleyici motoru sayesinde cebinizde kalan net tutar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ SECTION ── */}
        <section className="max-w-4xl mx-auto px-6 mb-20 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Sıkça Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">Müşterilerim kapara ödemekten çekinir mi?</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                İşletmeler opsiyonel olarak kapara miktarını sembolik bir tutar (ör. %10-%20) belirleyebilir veya sadece ilk defa gelen yeni müşterilere kapara kuralı koyabilir. Bu işlem müşteri sadakatini artırır.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-base">Kredi kartı provizyon ödemeleri güvenli mi?</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Tüm ödeme altyapısı BDDK lisanslı ve 256-bit SSL güvenlikli altyapılar ile işlenir. GlowDesk kart bilgilerini saklamaz.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
