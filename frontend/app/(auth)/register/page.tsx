"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-hero-radial flex items-center justify-center px-4 py-16 font-sans">
      <div className="max-w-4xl w-full space-y-10">

        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-3xl font-extrabold font-display tracking-tight text-slate-900">
              Glow<span className="text-[#0066FF]">Desk</span>
            </span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 font-display">Nasıl üye olmak istiyorsunuz?</h1>
          <p className="text-slate-500 text-sm">
            Kişisel randevu takibi veya salon işletmeniz için uygun hesabı seçin.
          </p>
        </div>

        {/* İki Kart Seçimi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Kullanıcı (Müşteri) Kartı */}
          <Link
            href="/register/customer"
            className="group block bg-white border border-slate-200 hover:border-[#0066FF] rounded-3xl p-8 shadow-layered hover:shadow-layered-hover transition-all duration-300"
          >
            <div className="flex flex-col items-start gap-5 h-full">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#0066FF] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-slate-900 mb-2 font-display">Kullanıcı Hesabı</h2>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Randevu almak, güzellik salonu veya berber bulmak istiyorsanız kişisel hesap oluşturun. Online randevu takibi ve favori salonlarınız tek bir yerde.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 w-full font-medium">
                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Online randevu alın</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Yakınınızdaki salonları keşfedin</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500 font-bold">✓</span> Randevu geçmişinizi takip edin</li>
              </ul>
              <span className="w-full block text-center btn-secondary-white text-xs font-bold py-3 rounded-2xl mt-2 group-hover:border-[#0066FF]">
                Kullanıcı Hesabı Oluştur →
              </span>
            </div>
          </Link>

          {/* İşletme Hesabı (Highlight Corporate Card) */}
          <Link
            href="/register/business"
            className="group block bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0066FF] rounded-3xl p-8 shadow-layered hover:shadow-layered-hover transition-all duration-300 text-white relative overflow-hidden"
          >
            <div className="flex flex-col items-start gap-5 h-full relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-blue-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                💼
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-extrabold text-white font-display">İşletme Hesabı</h2>
                  <span className="px-2.5 py-0.5 bg-blue-400/20 border border-blue-400/40 text-blue-300 text-[10px] font-bold rounded-full">1 AY ÜCRETSİZ</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Berber, güzellik salonu, spa veya klinik işletiyorsanız — online randevu sistemi, müşteri CRM, personel yönetimi ve No-Show koruması ile salon hesabı açın.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-200 w-full font-medium">
                <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Akıllı randevu takvimi</li>
                <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> No-show koruması (Bekleme Listesi)</li>
                <li className="flex items-center gap-2"><span className="text-blue-400 font-bold">✓</span> Otomatik WhatsApp bildirimleri</li>
              </ul>
              <span className="w-full block text-center bg-white text-slate-900 text-xs font-extrabold py-3.5 rounded-2xl hover:bg-blue-50 transition-colors mt-2">
                1 Ay Ücretsiz Başla →
              </span>
            </div>
          </Link>

        </div>

        <p className="text-center text-xs text-slate-500 font-medium">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-extrabold text-[#0066FF] hover:underline">
            Giriş Yapın
          </Link>
        </p>
      </div>
    </div>
  );
}
