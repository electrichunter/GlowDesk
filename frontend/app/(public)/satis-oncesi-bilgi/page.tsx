"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveChatWidget from "@/components/marketing/LiveChatWidget";

export default function SatisOncesiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-5xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="badge-blue-soft">💬 Satış Öncesi Destek &amp; Rehber</span>
          <h1 className="text-4xl font-extrabold text-slate-900 font-display">
            GlowDesk Hakkında Tüm Merak Edilenler
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Salonunuz için GlowDesk tercih etmeden önce paketlerimiz, komisyonsuz çalışma modelimiz ve ücretsiz deneme süreci hakkında tüm sorularınızın yanıtı burada.
          </p>
        </div>

        {/* Bilgilendirme Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              ✨
            </div>
            <h2 className="text-xl font-bold text-slate-900">1 Ay Ücretsiz Deneme Nasıl Çalışır?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kayıt olurken kredi kartı bilgisi vermeniz gerekmez. 1 ay boyunca sistemin tüm No-Show engelleme, WhatsApp teyit mesajları ve randevu takvimi özelliklerini tamamen ücretsiz kullanabilirsiniz.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              💰
            </div>
            <h2 className="text-xl font-bold text-slate-900">%0 Komisyon Garantisi Nedir?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Diğer platformlar randevu başına %15-%20 ciro kesintisi yaparken, GlowDesk sadece sabit aylık paket ücreti alır. Randevu sayınız veya cironuz ne kadar artarsa artsın komisyon ödemezsiniz.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              ⚙️
            </div>
            <h2 className="text-xl font-bold text-slate-900">Kurulum Ne Kadar Sürer?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Kurulum tamamen otomatik ve 2 dakikada tamamlanır. Salon adınızı, uzmanlarınızı ve çalışma saatlerinizi girdiğiniz an randevu linkiniz hazır olur. Hiçbir teknik bilgi gerekmez.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              📱
            </div>
            <h2 className="text-xl font-bold text-slate-900">Müşterilerimin Uygulama İndirmesi Gerekir mi?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Hayır! Müşterileriniz doğrudan WhatsApp linkine veya web sayfanıza tıklayarak 15 saniyede randevusunu alır ve onaylar.
            </p>
          </div>

        </div>

        {/* CTA Box */}
        <div className="bg-[#0066FF] rounded-3xl p-10 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-2xl font-extrabold font-display">Halen aklınıza takılan bir soru mu var?</h2>
          <p className="text-xs text-blue-100 max-w-xl mx-auto font-medium">
            Sağ alttaki canlı destek botumuzdan anında temsilciye bağlanabilir veya 1 ay ücretsiz denemeyi başlatabilirsiniz.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register/business" className="btn-secondary-white text-xs py-3 px-8">
              1 Ay Ücretsiz Başla →
            </Link>
          </div>
        </div>
      </main>

      <LiveChatWidget />
      <Footer />
    </div>
  );
}
