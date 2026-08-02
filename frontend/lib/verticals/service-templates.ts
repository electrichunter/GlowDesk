import type { VerticalKey } from './types';

export interface SectorServiceTemplate {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  price: number;
  description: string;
}

export const SECTOR_SERVICE_TEMPLATES: Record<VerticalKey, SectorServiceTemplate[]> = {
  // 1. Güzellik Salonu
  salon: [
    { id: 's-1', name: 'Medikal Cilt Bakımı & Kolajen', category: 'Cilt Bakımı', duration_minutes: 60, price: 850, description: 'Derinlemesine gözenek temizliği, hydrafacial ve kolajen serum uygulaması.' },
    { id: 's-2', name: 'Lazer Epilasyon Tüm Vücut', category: 'Lazer', duration_minutes: 45, price: 1200, description: 'Buz başlık diyot lazer epilasyon seansı.' },
    { id: 's-3', name: 'Protez Tırnak & Kalıcı Oje', category: 'Tırnak', duration_minutes: 60, price: 650, description: 'Jel tırnak uzatma, nail art ve kalıcı oje uygulaması.' },
    { id: 's-4', name: 'Profesyonel Gelin / Gece Makyajı', category: 'Makyaj', duration_minutes: 45, price: 950, description: 'Porselen makyaj ve ipek kirpik uygulaması.' },
  ],

  // 2. Berber & Erkek Kuaförü
  barber: [
    { id: 'b-1', name: 'Saç Kesimi & Yıkama & Şekillendirme', category: 'Saç', duration_minutes: 30, price: 350, description: 'Kafa yapısına uygun modern fön ve makas kesimi.' },
    { id: 'b-2', name: 'Sakal Tıraşı & Sıcak Havlu Bakımı', category: 'Sakal', duration_minutes: 20, price: 200, description: 'Ustura tıraşı, sakal şekillendirme ve buharlı sıcak havlu maskesi.' },
    { id: 'b-3', name: 'Saç Boyama & Beyaz Kapama', category: 'Renklendirme', duration_minutes: 45, price: 500, description: 'Organik saç boyası ile amonyaksız beyaz kapama.' },
    { id: 'b-4', name: 'Keratin & Saç Botoksu', category: 'Bakım', duration_minutes: 60, price: 800, description: 'Yıpranmış saçlar için düzleştirici keratin bakımı.' },
  ],

  // 3. Diş & Sağlık Kliniği
  clinic: [
    { id: 'c-1', name: 'Diş Taşı Temizliği & Detertraj', category: 'Ağız Bakımı', duration_minutes: 45, price: 1100, description: 'Ultrasonik tartar temizliği ve polisaj diş parlatma.' },
    { id: 'c-2', name: 'Diş Beyazlatma (Office Bleaching)', category: 'Estetik Diş', duration_minutes: 60, price: 2500, description: 'Lazer aktifli klinik tipi diş beyazlatma seansı.' },
    { id: 'c-3', name: 'Zirkonyum Kaplama Muayenesi', category: 'Protez', duration_minutes: 30, price: 600, description: 'Dijital gülüş tasarımı ve ölçü alımı.' },
    { id: 'c-4', name: 'İmplant Ön Değerlendirme & Panoramik Film', category: 'Cerrahi', duration_minutes: 30, price: 800, description: 'Çene röntgeni incelemesi ve implant planlaması.' },
  ],

  // 4. Oto Servis & Detailing
  auto: [
    { id: 'a-1', name: 'Periyodik Yağ & Filtre Değişim Bakımı', category: 'Mekanik Bakım', duration_minutes: 60, price: 1800, description: 'Motor yağı, hava, yağ ve polen filtresi değişimi + 21 nokta kontrolü.' },
    { id: 'a-2', name: 'Seramik Kaplama & Pasta Cila', category: 'Detailing', duration_minutes: 180, price: 6500, description: '9H çizik giderici pasta cila ve hidrofobik seramik kaplama.' },
    { id: 'a-3', name: 'Detaylı İç Temizlik & Koltuk Yıkama', category: 'İç Temizlik', duration_minutes: 120, price: 2200, description: 'Buharlı koltuk, tavan, taban ve bagaj dezenfeksiyonu.' },
    { id: 'a-4', name: 'Fren Balata & Disk Değişimi', category: 'Fren Sistemi', duration_minutes: 60, price: 1400, description: 'Ön/arka fren balata değişimi ve disk tornalama.' },
  ],

  // 5. Fitness & Pilates Stüdyosu
  fitness: [
    { id: 'f-1', name: 'Birebir Reformer Pilates Özel Ders', category: 'Reformer', duration_minutes: 50, price: 750, description: 'Aletli pilates ile omurga sağlığı ve sıkılaşma seansı.' },
    { id: 'f-2', name: 'Personal Training (PT) Ölçüm & Analiz', category: 'Özel Koçluk', duration_minutes: 60, price: 900, description: 'Tanita vücut yağ/kas analizi ve kişiye özel antrenman programı.' },
    { id: 'f-3', name: 'Grup Mat Pilates Seansı', category: 'Grup Dersi', duration_minutes: 50, price: 350, description: 'Maksimum 6 kişilik grupta mat pilates ve esnetme.' },
    { id: 'f-4', name: 'Postür Analizi & Fizyo-Egzersiz', category: 'Rehabilitasyon', duration_minutes: 45, price: 800, description: 'Skolyoz ve duruş bozukluğu düzeltici omurga egzersizi.' },
  ],

  // 6. Veteriner Kliniği & Pet Oteli
  vet: [
    { id: 'v-1', name: 'Karma Aşı & Genel Muayene', category: 'Koruyucu Hekimlik', duration_minutes: 25, price: 650, description: 'Kedi/köpek karma aşı uygulaması ve genel fiziksel muayene.' },
    { id: 'v-2', name: 'İç & Dış Parazit Uygulaması', category: 'Aşı & Parazit', duration_minutes: 15, price: 350, description: 'Damla ve tablet parrazit koruma tedavisi.' },
    { id: 'v-3', name: 'Pet Grooming & Medikal Tıraş', category: 'Pet Kuaför', duration_minutes: 60, price: 700, description: 'Banyolu, tırnak kesimli ve kulak temizlikli pet tıraşı.' },
    { id: 'v-4', name: 'Pet Otel Konaklama (Gecelik Delüks Oda)', category: 'Pet Otel', duration_minutes: 1440, price: 850, description: 'Kamera takipli, klimalı ve 3 öğün mamalı gecelik pet konaklama.' },
  ],

  // 7. Danışmanlık & Koçluk
  coaching: [
    { id: 'ck-1', name: 'Bireysel Psikolojik Danışmanlık Seansı', category: 'Terapi', duration_minutes: 50, price: 1500, description: 'Bilişsel davranışçı psikoterapi ve bireysel seans.' },
    { id: 'ck-2', name: 'Çift & Aile Terapisi', category: 'İlişki Terapisi', duration_minutes: 75, price: 2200, description: 'İletişim problemleri ve evlilik danışmanlığı.' },
    { id: 'ck-3', name: 'Kariyer & Yönetici Koçluğu', category: 'Koçluk', duration_minutes: 60, price: 2000, description: 'Liderlik gelişimi, kariyer hedefleme ve performans koçluğu.' },
    { id: 'ck-4', name: 'Öğrenci & Sınav Stresi Koçluğu', category: 'Eğitim Koçluğu', duration_minutes: 45, price: 1200, description: 'YKS/LGS sınav kaygısı yönetimi ve verimli ders çalışma planı.' },
  ],

  // 8. Hukuk Bürosu
  legal: [
    { id: 'l-1', name: 'Sözleşme İnceleme & Hukuki Danışmanlık', category: 'Danışmanlık', duration_minutes: 60, price: 3000, description: 'Ticari ve bireysel sözleşmelerin hukuki analizi ve mütalaa.' },
    { id: 'l-2', name: 'İş Hukuku İşe İade & Tazminat Görüşmesi', category: 'İş Hukuku', duration_minutes: 45, price: 2500, description: 'Kıdem, ihbar ve işe iade davası ön hazırlık görüşmesi.' },
    { id: 'l-3', name: 'Şirketler Hukuku Genel Kurul Hazırlığı', category: 'Şirketler Hukuku', duration_minutes: 90, price: 5000, description: 'Anonim/Limited şirket esas sözleşme ve tescil işlemleri.' },
    { id: 'l-4', name: 'Gayrimenkul & Tapu İptal Dava Danışmanlığı', category: 'Gayrimenkul', duration_minutes: 60, price: 3500, description: 'Kamulaştırma, izale-i şuyu ve tapu davaları hukuki danışmanlığı.' },
  ],
  hukuk: [
    { id: 'l-1', name: 'Sözleşme İnceleme & Hukuki Danışmanlık', category: 'Danışmanlık', duration_minutes: 60, price: 3000, description: 'Ticari ve bireysel sözleşmelerin hukuki analizi ve mütalaa.' },
    { id: 'l-2', name: 'İş Hukuku İşe İade & Tazminat Görüşmesi', category: 'İş Hukuku', duration_minutes: 45, price: 2500, description: 'Kıdem, ihbar ve işe iade davası ön hazırlık görüşmesi.' },
    { id: 'l-3', name: 'Şirketler Hukuku Genel Kurul Hazırlığı', category: 'Şirketler Hukuku', duration_minutes: 90, price: 5000, description: 'Anonim/Limited şirket esas sözleşme ve tescil işlemleri.' },
    { id: 'l-4', name: 'Gayrimenkul & Tapu İptal Dava Danışmanlığı', category: 'Gayrimenkul', duration_minutes: 60, price: 3500, description: 'Kamulaştırma, izale-i şuyu ve tapu davaları hukuki danışmanlığı.' },
  ],

  // 9. Fotoğraf Stüdyosu
  photo: [
    { id: 'p-1', name: 'Dış Mekan / Plato Düğün Çekimi', category: 'Düğün Çekimi', duration_minutes: 180, price: 8500, description: 'Save the date, plato çekimi ve albüm teslimli dış çekim.' },
    { id: 'p-2', name: 'Ürün & Katalog Fotoğraf Çekimi (Saati)', category: 'E-Ticaret Çekimi', duration_minutes: 60, price: 2500, description: 'E-ticaret ve Amazon uyumlu beyaz fon ürün çekimi.' },
    { id: 'p-3', name: 'Biyometrik & Pasaport Vesikalık', category: 'Stüdyo Çekimi', duration_minutes: 15, price: 250, description: 'Vize ve pasaport uyumlu anında baskılı vesikalık.' },
    { id: 'p-4', name: 'Moda & Model Başvuru Portfolyo Çekimi', category: 'Portre Çekimi', duration_minutes: 90, price: 4500, description: 'Cast ve ajans başvurusu için profesyonel ışık sistemli kompozit çekim.' },
  ],

  // 10. Spa & Wellness
  spa: [
    { id: 'sp-1', name: 'İsveç & Aromaterapi Tüm Vücut Masajı', category: 'Masaj', duration_minutes: 60, price: 1200, description: 'Bitkisel uçucu yağlar ile rahatlatıcı gerginlik giderici masaj.' },
    { id: 'sp-2', name: 'Geleneksel Türk Hamamı & Kese Köpük', category: 'Hamam', duration_minutes: 45, price: 950, description: 'Mermer göbek taşında ipek kese ve zeytinyağlı köpük masajı.' },
    { id: 'sp-3', name: 'Sıcak Volkanik Taş Terapisi', category: 'Terapi', duration_minutes: 75, price: 1500, description: 'Isıtılmış volkanik taşlarla kas gevşetici vücut terapisi.' },
    { id: 'sp-4', name: 'Derin Doku Bali Masajı', category: 'Uzak Doğu', duration_minutes: 60, price: 1400, description: 'Balili terapistler eşliğinde akupresür noktalarına baskılı masaj.' },
  ],

  // 11. Coworking & Toplantı
  coworking: [
    { id: 'cw-1', name: '8 Kişilik VIP Toplantı Odası (Saatlik)', category: 'Toplantı Odası', duration_minutes: 60, price: 600, description: '4K projeksiyon, akıllı tahta ve ikramlı VIP toplantı alanı.' },
    { id: 'cw-2', name: 'Hazır Ofis & Sabit Masa (Aylık)', category: 'Ofis Kiralama', duration_minutes: 1440, price: 4500, description: '7/24 kartlı giriş, yüksek hızlı fiber internet ve kahve barı.' },
    { id: 'cw-3', name: 'Etkinlik & Seminer Salonu (Saatlik)', category: 'Etkinlik', duration_minutes: 60, price: 1800, description: '50 kişilik amfi düzeni ses ve ışık sistemli seminer alanı.' },
    { id: 'cw-4', name: 'Sanal Ofis Yasal Adres Hizmeti (Aylık)', category: 'Sanal Ofis', duration_minutes: 1440, price: 1200, description: 'Yasal şirket adresi, posta/kargo karşılama ve sekreterya.' },
  ],

  // 12. Sürücü Kursu
  driving: [
    { id: 'dr-1', name: 'B Sınıfı Otomobil Direksiyon Dersi', category: 'Direksiyon Eğitimi', duration_minutes: 50, price: 600, description: 'Akan trafikte simülatörlü ve klimalı araçla özel ders.' },
    { id: 'dr-2', name: 'A2 Motosiklet Pratik Sürüş Eğitimi', category: 'Motosiklet', duration_minutes: 50, price: 550, description: 'Kukalar arası slaloma ve fren parkuruna yönelik motor eğitimi.' },
    { id: 'dr-3', name: 'Sınav Öncesi Paralel & L Park Çalışması', category: 'Sınav Parkuru', duration_minutes: 50, price: 700, description: 'Direksiyon sınav güzergahında birebir geri park çalışması.' },
    { id: 'dr-4', name: 'Manuel / Otomatik Vites Özel Sürüş', category: 'Özel Dersi', duration_minutes: 60, price: 800, description: 'Ehliyeti olup trafikte pratik yapmak isteyenlere özel ders.' },
  ],

  // 13. Restoran & Masa
  restoran: [
    { id: 'r-1', name: 'Şefin Özel Tadım Menüsü Rezervasyonu', category: 'A La Carte', duration_minutes: 120, price: 1500, description: '5 amuse-bouche ve özel içecek eşleşmeli gurme tadım menüsü.' },
    { id: 'r-2', name: 'Teras Manzaralı VIP Masa Rezervasyonu', category: 'Masa Rezervasyonu', duration_minutes: 90, price: 500, description: 'Boğaz manzaralı ön sıra VIP masa garantisi.' },
    { id: 'r-3', name: 'Doğum Günü & Kutlama Organizasyon Masası', category: 'Organizasyon', duration_minutes: 180, price: 2500, description: 'Özel süslemeli, pastalı ve şampanya ikramlı kutlama masası.' },
    { id: 'r-4', name: 'İş Yemeği 6 Kişilik Grup Masası', category: 'Grup Yemeği', duration_minutes: 90, price: 1000, description: 'Sessiz ve özel servisi olan iş yemeği masası.' },
  ],
};

export function getSectorServiceTemplates(vertical: VerticalKey): SectorServiceTemplate[] {
  return SECTOR_SERVICE_TEMPLATES[vertical] || SECTOR_SERVICE_TEMPLATES.salon;
}
