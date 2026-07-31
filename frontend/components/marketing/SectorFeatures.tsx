import React from 'react';
import type { VerticalDefinition } from '@/lib/verticals/types';

interface SectorFeaturesProps {
  config: VerticalDefinition;
}

export function SectorFeatures({ config }: SectorFeaturesProps) {
  const features = {
    salon: [
      { icon: '📅', title: 'Çakışmasız Takvim', desc: 'Personel ve koltuk bazlı eşzamanlı takvim yönetimi.' },
      { icon: '🛡️', title: 'No-Show Koruması', desc: 'SMS hatırlatmalar ve otomatik kaparo alma mekanizması.' },
      { icon: '📊', title: 'Gelir Raporları', desc: 'Hizmet ve personel bazlı detaylı ciro analizi.' },
    ],
    hukuk: [
      { icon: '⚖️', title: 'Danışmanlık Randevuları', desc: 'Müvekkil görüşmelerini ve vaka türlerini düzenleme.' },
      { icon: '📁', title: 'Belge Ön Yükleme', desc: 'Görüşme öncesi dosya ve döküman toplama.' },
      { icon: '💳', title: 'Ön Ödeme Güvencesi', desc: 'Iyzico & Stripe ile danışmanlık ücretini tahsil etme.' },
    ],
    restoran: [
      { icon: '🪑', title: 'Masa Düzen Yönetimi', desc: 'İç mekan, teras ve VIP masa kapasite kontrolü.' },
      { icon: '👥', title: 'Kişi Sayısı Doğrulama', desc: 'Grup rezervasyonlarında anlık masa eşleme.' },
      { icon: '🔒', title: 'Depozito Güvencesi', desc: 'Kalabalık masalar için ön depozito tahsilatı.' },
    ],
  }[config.slug] || [];

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200/60 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1E1B4B]">
            {config.label} İçin Özel Geliştirilmiş Özellikler
          </h2>
          <p className="text-sm text-slate-500 mt-2">İşletmenizin ihtiyacına tam uyan modüler altyapı.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-base font-bold text-[#1E1B4B] mb-2">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
