"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function WaitlistEnginePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-purple-600 selection:text-white">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="bg-gradient-to-br from-[#1E1B4B] via-[#2E1065] to-[#090D16] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-purple-800">
            {/* Ambient Lighting Mesh */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-extrabold tracking-wider uppercase inline-flex items-center gap-2">
                <span>📋</span> <span>Bekleme Listesi (Waitlist) Motoru</span>
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
                Son Dakika İptallerinde Bile <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
                  %100 Doluluk Oranına Ulaşın
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-lg leading-relaxed font-medium max-w-2xl">
                Bir müşteri randevusunu iptal ettiğinde panik yapmayın. GlowDesk Bekleme Listesi Motoru, o seansı bekleyen ilk müşteriye anında WhatsApp ve SMS bildirimi göndererek boşluğu saniyeler içinde doldurur.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register/business"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-black text-sm py-4 px-8 rounded-2xl shadow-xl shadow-purple-500/25 hover:scale-105 transition-all text-center"
                >
                  🚀 Bekleme Listesi Motorunu Başlat
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

        {/* ── ADVANTAGES ── */}
        <section className="max-w-7xl mx-auto px-6 mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">Otomatik Boşluk Doldurma</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              İptal Edilen Slotlar Nasıl Kazanca Dönüşür?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Sıfır insan müdahalesi ile tam otomatik çalışan akıllı takvim eşleştirme mantığı.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-layered hover:shadow-2xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 text-2xl flex items-center justify-center font-bold border border-purple-100 group-hover:scale-110 transition-transform">
                📝
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">Müşteri Yedek Talebi</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Dolu bir gün için randevu almak isteyen müşteriler, "Dolu ise beni bekleme listesine ekle" butonuna basarak tercih ettikleri zaman aralığını kaydeder.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-layered hover:shadow-2xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center font-bold border border-indigo-100 group-hover:scale-110 transition-transform">
                ⚡
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">Anlık İptal Yakalama</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Herhangi bir müşteri saatler öncesinde veya son dakikada randevusunu iptal ettiğinde takvimdeki boşluk algılanır.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-layered hover:shadow-2xl transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 text-2xl flex items-center justify-center font-bold border border-pink-100 group-hover:scale-110 transition-transform">
                🎉
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">Otomatik Eşleşme & Tek Tık Onay</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Bekleme listesindeki ilk müşteriye "Bugün 15:00'te yer açıldı, almak ister misiniz?" teklifi iletilir. Müşteri onayladığında slot anında dolmuş olur.
              </p>
            </div>
          </div>
        </section>

        {/* ── METRIC HIGHLIGHT ── */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-layered text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
              "Ayda Ortalama 15-25 Boş Slot Otomatik Doldurulur"
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              GlowDesk kullanan güzellik salonları ve klinikler, iptal edilen randevuları kazanca dönüştürerek ayda ortalama ₺15.000 - ₺45.000 ekstra ciro elde etmektedir.
            </p>
            <div className="pt-2">
              <Link href="/register/business" className="btn-primary-blue text-xs py-3.5 px-8 font-extrabold inline-block">
                🚀 Hemen Ücretsiz Başlayın →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
