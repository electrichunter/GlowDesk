import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0066FF] text-white font-extrabold text-sm flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold text-white font-display tracking-tight">
                Glow<span className="text-[#0066FF]">Desk</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Güzellik salonları, berberler ve estetik klinikleri için geliştirilmiş Türkiye&apos;nin en hızlı No-Show kurtarma ve randevu yönetim otomasyonu.
            </p>
          </div>

          {/* Ürün & Hizmetler */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Hizmetler</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/#features", label: "No-Show İptal Engelleyici" },
                { href: "/#features", label: "Otomatik Bekleme Listesi" },
                { href: "/#pricing", label: "Komisyonsuz Fiyatlandırma" },
                { href: "/register", label: "1 Ay Ücretsiz Başla" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-slate-400 hover:text-[#0066FF] transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sektörler */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Sektörler</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li className="hover:text-white transition-colors cursor-pointer">💄 Güzellik & Estetik Merkezleri</li>
              <li className="hover:text-white transition-colors cursor-pointer">💈 Berber & Erkek Kuaförleri</li>
              <li className="hover:text-white transition-colors cursor-pointer">💆 Masaj & Terapi Salonları</li>
              <li className="hover:text-white transition-colors cursor-pointer">🌿 Spa & Wellness Stüdyoları</li>
              <li className="hover:text-white transition-colors cursor-pointer">🩺 Dermatoloji & Klinikler</li>
            </ul>
          </div>

          {/* İletişim & Güvence */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">İletişim</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>✉️ destek@glowdesk.com.tr</li>
              <li>📞 +90 850 300 0000</li>
              <li>📍 Maslak, İstanbul / Türkiye</li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <p className="text-[11px] text-[#0066FF] font-bold">
                ⚡ %100 Taahhütsüz & Güvenli Esnaf Dostu Sistem
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800/80 text-xs text-slate-500 font-medium">
          <p>© {year} GlowDesk Randevu Teknolojileri A.Ş. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Gizlilik Sözleşmesi</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Kullanım Şartları</a>
            <a href="#" className="hover:text-slate-300 transition-colors">KVKK Aydınlatma Metni</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
