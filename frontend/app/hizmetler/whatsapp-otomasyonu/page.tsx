"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function WhatsAppAutomationPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      <Navbar />

      <main className="pt-32 pb-24">
        {/* ── HERO SECTION ── */}
        <section className="max-w-7xl mx-auto px-6 mb-20">
          <div className="bg-gradient-to-br from-[#064E3B] via-[#022C22] to-[#090D16] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl border border-emerald-800">
            {/* Ambient Lighting Mesh */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold tracking-wider uppercase inline-flex items-center gap-2">
                <span>💬</span> <span>WhatsApp Otomasyonu & Bildirim Servisi</span>
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
                Müşterilerinizle 7/24 Kesintisiz <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  WhatsApp Üzerinden İletişim Kurun
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-lg leading-relaxed font-medium max-w-2xl">
                Manuel SMS mesajları göndermeyi bırakın. GlowDesk WhatsApp Otomasyonu ile randevu onayları, hatırlatmalar ve memnuniyet anketleri müşterinizin cebine anında iletilsin.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/register/business"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm py-4 px-8 rounded-2xl shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all text-center"
                >
                  💬 WhatsApp Entegrasyonunu Deneyin
                </Link>
                <Link
                  href="/#pricing"
                  className="px-6 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-bold transition-all text-center"
                >
                  💳 Paket ve Tarifeler
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="max-w-7xl mx-auto px-6 mb-24 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Otomasyon Senaryoları</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-display">
              Hangi Mesajlar Otomatik Gönderilir?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Müşteri deneyimini üst seviyeye çıkaran akıllı ve kişiselleştirilmiş şablonlar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-3 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 text-xl flex items-center justify-center font-bold">
                ✅
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">Anında Teyit Mesajı</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Randevu oluşturulduğu saniyede müşteriye tarih, saat, uzman adı ve konum bilgilerini içeren şık onay kartı iletilir.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-3 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 text-xl flex items-center justify-center font-bold">
                ⏰
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">24s & 2s Kala Hatırlatma</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Randevu zamanı yaklaşırken hatırlatma mesajı atılır. Müşteri "Geliyorum" veya "Ertele" butonuna tek tıkla basabilir.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-3 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 text-xl flex items-center justify-center font-bold">
                ⭐
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">Hizmet Sonrası Değerlendirme</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Seans tamamlandıktan 1 saat sonra müşteriye yıldızlı puanlama ve Google Haritalar yorum linki otomatik iletilir.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-layered space-y-3 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#1E1B4B]/10 text-[#1E1B4B] text-xl flex items-center justify-center font-bold">
                🎁
              </div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">Yeniden Hatırlatma & Kampanya</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                30 gündür randevu almamış müşterilere "Sizi Özledik" özel indirim mesajı gönderilerek tekrar randevu teşvik edilir.
              </p>
            </div>
          </div>
        </section>

        {/* ── SAMPLE WHATSAPP CHAT MOCKUP ── */}
        <section className="max-w-4xl mx-auto px-6 mb-24">
          <div className="bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl text-white space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Canlı Önizleme</span>
              <h2 className="text-2xl font-black font-display">Müşteriniz Neler Görecek?</h2>
            </div>

            {/* Chat Container */}
            <div className="max-w-md mx-auto bg-[#075E54] p-4 rounded-2xl space-y-3 shadow-inner">
              {/* Message from Business */}
              <div className="bg-[#DCF8C6] text-slate-900 p-3.5 rounded-2xl rounded-tl-none max-w-[88%] text-xs space-y-2 shadow-sm font-sans">
                <p className="font-bold text-emerald-950">
                  Sayın Ahmet Yılmaz, <strong>Zelza Güzellik Salonu</strong> randevunuz oluşturuldu! 🌟
                </p>
                <div className="bg-white/80 p-2 rounded-xl text-[11px] space-y-1">
                  <div>🗓 <strong>Tarih:</strong> 12 Ağustos 2026</div>
                  <div>⏰ <strong>Saat:</strong> 14:30</div>
                  <div>✂️ <strong>Hizmet:</strong> Saç Kesim & Bakım</div>
                  <div>👤 <strong>Uzman:</strong> Elif Demir</div>
                </div>
                <p className="text-[10px] text-slate-500 text-right">14:30 ✓✓</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 max-w-[88%]">
                <span className="px-3 py-1.5 bg-white text-[#075E54] font-extrabold text-[11px] rounded-xl border shadow-sm">
                  👍 Geliyorum
                </span>
                <span className="px-3 py-1.5 bg-white text-rose-600 font-extrabold text-[11px] rounded-xl border shadow-sm">
                  ❌ İptal Et / Değiştir
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
