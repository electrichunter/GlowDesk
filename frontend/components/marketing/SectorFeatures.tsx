import React from 'react';
import type { VerticalDefinition } from '@/lib/verticals/types';

interface SectorFeaturesProps {
  config: VerticalDefinition;
}

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

export function SectorFeatures({ config }: SectorFeaturesProps) {
  const featureMap: Record<string, FeatureItem[]> = {
    salon: [
      { icon: '📅', title: 'Çakışmasız Takvim', desc: 'Personel ve koltuk bazlı eşzamanlı takvim yönetimi.' },
      { icon: '🛡️', title: 'No-Show Koruması', desc: 'SMS hatırlatmalar ve otomatik kaparo alma mekanizması.' },
      { icon: '📊', title: 'Gelir Raporları', desc: 'Hizmet ve personel bazlı detaylı ciro analizi.' },
    ],
    clinic: [
      { icon: '🦷', title: 'Odontogram & Anamnez', desc: 'Görsel diş şeması ve hasta sağlık geçmişi takibi.' },
      { icon: '🔒', title: '3\'lü Kaynak Kilitletme', desc: 'Hekim, koltuk ve asistanın atomik rezervasyonu.' },
      { icon: '🧪', title: 'Laboratuvar Takibi', desc: 'Protez ve imalat iş emirlerinin canlı durumu.' },
    ],
    auto: [
      { icon: '🚗', title: 'Lift & Bay Yönetimi', desc: 'Servisteki liftlerin ve yıkama pedlerinin anlık doluluğu.' },
      { icon: '📱', title: 'Canlı Takip Linki', desc: 'Müşteriye WhatsApp üzerinden ilerleme durumu sunma.' },
      { icon: '🛠️', title: 'Plaka Servis Karnesi', desc: 'Geçmiş parça ve bakım işlemlerinin plakaya kaydı.' },
    ],
    fitness: [
      { icon: '💪', title: 'Waitlist & Kontenjan', desc: 'Dolu derslerde otomatik sıra devretme motoru.' },
      { icon: '💳', title: 'Kredi Muhasebesi', desc: 'Çift taraflı kayıt defteri ile seans düşümü.' },
      { icon: '🔥', title: 'Late-Cancel Burn', desc: 'Son dakika iptallerinde otomatik kredi cezası.' },
    ],
    vet: [
      { icon: '🐾', title: 'Aşı Karnesi & Takvimi', desc: 'Yasal aşı günlerinde otomatik SMS/WhatsApp uyarısı.' },
      { icon: '🐶', title: 'Pet Mizaç Notları', desc: 'Irk ve ağırlığa göre otomatik süre genişletici.' },
      { icon: '🏨', title: 'Pet Otel Takvimi', desc: 'Saatsel grooming ve gecelik konaklama hibrit takvimi.' },
    ],
    coaching: [
      { icon: '📚', title: 'Şifreli Seans Notları', desc: 'AES-256 uçtan uca şifreli danışan geçmişi.' },
      { icon: '🎯', title: 'Müfredat Takibi', desc: 'Adım adım ders ve ödev ilerleme çarkı.' },
      { icon: '📹', title: 'Otomatik Zoom Linki', desc: 'Online randevularda benzersiz video odası.' },
    ],
    legal: [
      { icon: '⚖️', title: 'Danışmanlık Randevuları', desc: 'Müvekkil görüşmelerini ve vaka türlerini düzenleme.' },
      { icon: '📁', title: 'Belge Ön Yükleme', desc: 'Görüşme öncesi dosya ve döküman toplama.' },
      { icon: '💳', title: 'Ön Ödeme Güvencesi', desc: 'Iyzico & Stripe ile danışmanlık ücretini tahsil etme.' },
    ],
    hukuk: [
      { icon: '⚖️', title: 'Danışmanlık Randevuları', desc: 'Müvekkil görüşmelerini ve vaka türlerini düzenleme.' },
      { icon: '📁', title: 'Belge Ön Yükleme', desc: 'Görüşme öncesi dosya ve döküman toplama.' },
      { icon: '💳', title: 'Ön Ödeme Güvencesi', desc: 'Iyzico & Stripe ile danışmanlık ücretini tahsil etme.' },
    ],
    photo: [
      { icon: '📸', title: 'Plato & Ekipman Paketi', desc: 'Stüdyo, kamera ve ışık setinin tek tıkla kiralanması.' },
      { icon: '🖼️', title: 'Müşteri Galeri Seçki', desc: 'Su geçirmez filigranlı fotoğraf onay merkezi.' },
      { icon: '🔒', title: 'Kart Teminat Blokesi', desc: 'Kiralama öncesi ön otorizasyon güvencesi.' },
    ],
    spa: [
      { icon: '🧖', title: 'VIP Suit & Masaj Odaları', desc: 'Çift masajı ve termal istasyon rotaları.' },
      { icon: '🎁', title: 'Dijital Hediye Çeki', desc: 'Kupon ve hediye kartı e-ticaret otomasyonu.' },
      { icon: '🌿', title: 'Sağlık Formu Uyarısı', desc: 'Aromaterapi ve bası şiddeti tercihlerinin saklanması.' },
    ],
    coworking: [
      { icon: '🏢', title: 'Toplantı Oda Paketleri', desc: 'Oda, projektör ve ikramın atomik rezervasyonu.' },
      { icon: '🔑', title: 'IoT Akıllı Kapı Kilit', desc: 'Rezervasyon anında süreli QR kapı şifresi.' },
      { icon: '👛', title: 'Kurumsal Kredi Cüzdanı', desc: 'Dakikalık tüketim ve şirket bütçelemesi.' },
    ],
    driving: [
      { icon: '🚗', title: 'Yasal 14 Ders Sayaç', desc: 'MEB mevzuatına uygun direksiyon saat takibi.' },
      { icon: '⚙️', title: 'Vites & Araç Kuralı', desc: 'Manuel/otomatik ehliyet tipine göre araç filosu.' },
      { icon: '📍', title: 'Haritada Biniş Noktası', desc: 'Adayın ders başlangıç durağını seçebilmesi.' },
    ],
    restoran: [
      { icon: '🪑', title: 'Masa Düzen Yönetimi', desc: 'İç mekan, teras ve VIP masa kapasite kontrolü.' },
      { icon: '👥', title: 'Kişi Sayısı Doğrulama', desc: 'Grup rezervasyonlarında anlık masa eşleme.' },
      { icon: '🔒', title: 'Depozito Güvencesi', desc: 'Kalabalık masalar için ön depozito tahsilatı.' },
    ],
  };

  const features = featureMap[config.slug] || featureMap.salon;


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
