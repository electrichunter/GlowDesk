"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveChatWidget from "@/components/marketing/LiveChatWidget";

export default function UrunDestekPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 pt-36 pb-24 max-w-5xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="badge-blue-soft">🛠️ Mevcut Ürün & Kullanım Desteği</span>
          <h1 className="text-4xl font-extrabold text-slate-900 font-display">
            GlowDesk Ürün Kullanım Kılavuzu
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto">
            Salon panelinizi en yüksek verimle kullanmanız için hazırlanan adım adım ayarlar, entegrasyon kılavuzları ve sık karşılaşılan durumlar.
          </p>
        </div>

        {/* Kılavuz Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bekleme Listesi (Waitlist) Nasıl Çalışır?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Randevu takviminizdeki bir saat iptal edildiğinde veya teyit edilmediğinde, sistem bekleme sırasındaki ilk müşteriye otomatik WhatsApp randevu teklifi gönderir. Kabul edildiğinde koltuk anında dolar.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              💬
            </div>
            <h2 className="text-xl font-bold text-slate-900">WhatsApp Teyit Mesajı Saatleri Nasıl Ayarlanır?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Salon Yönetim Paneli -&gt; Ayarlar sekmesinden teyit mesajının randevudan kaç saat önce (ör. 2 saat, 12 saat, 24 saat) gönderileceğini belirleyebilirsiniz.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              💳
            </div>
            <h2 className="text-xl font-bold text-slate-900">iZico Ön Ödemeli Kapora Nasıl Bağlanır?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Ayarlar -&gt; Ödeme Entegrasyonu alanından iZico API anahtarlarınızı girerek randevu alma esnasında belirlediğiniz tutarda kapora alabilirsiniz.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
              👥
            </div>
            <h2 className="text-xl font-bold text-slate-900">Yeni Personel ve Koltuk Nasıl Eklenir?</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Dashboard -&gt; Personel Yönetimi bölümünden yeni çalışan ekleyebilir, çalışma günlerini ve uzmanlık alanlarını (kuaför, cilt bakımı vb.) özelleştirebilirsiniz.
            </p>
          </div>

        </div>

        {/* CTA Box */}
        <div className="bg-slate-900 rounded-3xl p-10 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-2xl font-extrabold font-display">Teknik bir sorun mu yaşıyorsunuz?</h2>
          <p className="text-xs text-slate-300 max-w-xl mx-auto font-medium">
            Sağ alttaki canlı destek balonundan **&quot;ACİL DESTEK&quot;** seçeneğine tıklayarak Nöbetçi Destek ekibimize anında bildirim düşürebilirsiniz.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard" className="btn-primary-blue text-xs py-3 px-8">
              Salon Paneline Git →
            </Link>
          </div>
        </div>
      </main>

      <LiveChatWidget />
      <Footer />
    </div>
  );
}
