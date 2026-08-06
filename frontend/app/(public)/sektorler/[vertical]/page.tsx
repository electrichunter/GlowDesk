import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LiveChatWidget from "@/components/marketing/LiveChatWidget";

interface SectorConfig {
  slug: string;
  badgeLabel: string;
  title: string;
  highlightText: string;
  subtitle: string;
  icon: string;
  metrics: { value: string; label: string }[];
  smsPreview: {
    salonName: string;
    text: string;
    badge: string;
  };
  features: { title: string; desc: string; icon: string }[];
}

const SECTOR_CONFIGS: Record<string, SectorConfig> = {
  guzellik: {
    slug: "guzellik",
    badgeLabel: "Güzellik Salonu",
    title: "Güzellik Salonları İçin Akıllı",
    highlightText: "No-Show & Randevu",
    subtitle: "Cilt bakımı, lazer epilasyon ve makyaj seanslarında boş geçen saatlere son verin. Otomatik WhatsApp onay mesajı ile salon doluluğunuzu %96'ya çıkarın.",
    icon: "💄",
    metrics: [
      { value: "₺14.500", label: "Aylık Kurtarılan Kayıp Gelir" },
      { value: "%94", label: "No-Show İptal Engelleyici Başarısı" },
      { value: "10 Dk", label: "Ortalama Bekleme Listesi Dolma Süresi" },
    ],
    smsPreview: {
      salonName: "Zelza Güzellik & Estetik Studio",
      badge: "Duygusal & Lüks Dil Tonu",
      text: "✨ Selam Elif Hanım! Yarın saat 14:00'deki cilt bakımı ve terapi seansınız için koltuğunuz hazırlandı. Seansınızı onaylamak için yanıt verin. (EVET / HAYIR)",
    },
    features: [
      { icon: "💄", title: "Uzman & Seans Odası Yönetimi", desc: "Estetisyenleriniz ve cilt bakım odalarınız için çakışmasız randevu takvimi." },
      { icon: "💬", title: "WhatsApp Teyit & Hatırlatma", desc: "Randevudan 2 saat önce otomatik giden lüks dilli onay mesajları." },
      { icon: "💳", title: "Ön Ödemeli Kapora Tahsilatı", desc: "Uzun seanslar öncesinde online iZico depozitosu alarak randevunuzu garantiye alın." },
    ],
  },
  salon: {
    slug: "salon",
    badgeLabel: "Güzellik Salonu",
    title: "Güzellik Salonları İçin Akıllı",
    highlightText: "No-Show & Randevu",
    subtitle: "Cilt bakımı, lazer epilasyon ve makyaj seanslarında boş geçen saatlere son verin. Otomatik WhatsApp onay mesajı ile salon doluluğunuzu %96'ya çıkarın.",
    icon: "💄",
    metrics: [
      { value: "₺14.500", label: "Aylık Kurtarılan Kayıp Gelir" },
      { value: "%94", label: "No-Show İptal Engelleyici Başarısı" },
      { value: "10 Dk", label: "Ortalama Bekleme Listesi Dolma Süresi" },
    ],
    smsPreview: {
      salonName: "Zelza Güzellik & Estetik Studio",
      badge: "Duygusal & Lüks Dil Tonu",
      text: "✨ Selam Elif Hanım! Yarın saat 14:00'deki cilt bakımı ve terapi seansınız için koltuğunuz hazırlandı. Seansınızı onaylamak için yanıt verin. (EVET / HAYIR)",
    },
    features: [
      { icon: "💄", title: "Uzman & Seans Odası Yönetimi", desc: "Estetisyenleriniz ve cilt bakım odalarınız için çakışmasız randevu takvimi." },
      { icon: "💬", title: "WhatsApp Teyit & Hatırlatma", desc: "Randevudan 2 saat önce otomatik giden lüks dilli onay mesajları." },
      { icon: "💳", title: "Ön Ödemeli Kapora Tahsilatı", desc: "Uzun seanslar öncesinde online iZico depozitosu alarak randevunuzu garantiye alın." },
    ],
  },
  berber: {
    slug: "berber",
    badgeLabel: "Berber & Kuaför",
    title: "Berber ve Erkek Kuaförleri İçin",
    highlightText: "Koltuk Otomasyonu",
    subtitle: "Cuma ve Cumartesi günleri boş koltuk beklemeden, saatlik saç-sakal kesim randevularınızı otomatik doluluk ile yönetin.",
    icon: "💈",
    metrics: [
      { value: "₺12.000", label: "Aylık Kurtarılan Koltuk Geliri" },
      { value: "0 Adet", label: "No-Show Boş Kalan Saat" },
      { value: "5 Dk", label: "Bekleme Sırasından Dolum" },
    ],
    smsPreview: {
      salonName: "Maestro Erkek Kuaförü & Barber",
      badge: "Samimi & Net Berber Dili",
      text: "💈 Abi selam! Yarın 11:00'deki Saç Kesimi + Sakal Tıraşı randevun hazır. Koltuk sana ayrıldı, gelecek misin? (EVET / HAYIR)",
    },
    features: [
      { icon: "💈", title: "Koltuk & Berber Sıra Yönetimi", desc: "Hangi berberde hangi koltuğun ne zaman boşalacağını anlık görün." },
      { icon: "⏳", title: "Otomatik Sıra Doldurucu", desc: "Gelmeyen müşterinin saati bekleme listesindeki müşteriye otomatik teklif edilir." },
      { icon: "📱", title: "Tek Tıkla WhatsApp Teyit", desc: "Müşterilerinizin telefona gerek kalmadan WhatsApp'tan onay vermesini sağlayın." },
    ],
  },
  masaj: {
    slug: "masaj",
    badgeLabel: "Masaj & Spa",
    title: "Masaj & Terapi Salonları İçin",
    highlightText: "Zaman ve Oda Takibi",
    subtitle: "60 ve 90 dakikalık masaj seanslarında son dakika iptallerini otomatik bekleme listesiyle anında yedekleyin.",
    icon: "💆",
    metrics: [
      { value: "%98", label: "Oda Doluluk Oranı" },
      { value: "₺18.200", label: "Aylık Kurtarılan Terapi Geliri" },
      { value: "24/7", label: "Kesintisiz Online Randevu" },
    ],
    smsPreview: {
      salonName: "Serenity Spa & Terapi Merkezi",
      badge: "Huzurlu & Özel Terapi Dili",
      text: "💆 Merhaba Kemal Bey! Yarın 14:00'teki 90 dakikalık Derin Doku Masajı terapiniz hazır. Gerginliğinizi sıfırlamak için onay verin. (EVET / İPTAL)",
    },
    features: [
      { icon: "💆", title: "Terapi Odası & Terapist Eşleme", desc: "Masaj türüne göre uygun terapi odası ve sertifikalı terapist ataması." },
      { icon: "⏱️", title: "Süre Bazlı Otomatik Takvim", desc: "30, 60, 90 dakikalık terapi sürelerine özel otomatik dinlenme araları." },
      { icon: "🌿", title: "Müşteri Tercih & CRM Geçmişi", desc: "Müşterinizin önceki masaj tercihlerini ve özel notlarını anında görün." },
    ],
  },
  klinik: {
    slug: "klinik",
    badgeLabel: "Klinik & Estetik",
    title: "Dermatoloji & Estetik Klinikler İçin",
    highlightText: "Hasta Takvim Otomasyonu",
    subtitle: "Uzman doktor ve hasta görüşme sürelerini en yüksek verimle planlayın, klinik randevu kayıplarını sıfıra indirin.",
    icon: "🩺",
    metrics: [
      { value: "%85", label: "Hasta Zaman Kaybı Azalması" },
      { value: "₺24.000", label: "Kurtarılan Klinik Seans Geliri" },
      { value: "%100", label: "KVKK Uyumlu Medikal Altyapı" },
    ],
    smsPreview: {
      salonName: "Elit Estetik & Dermatoloji Kliniği",
      badge: "Kurumsal & Medikal Doktor Dili",
      text: "🩺 Sayın Merve Şahin, Uzm. Dermatolog randevunuz yarın 14:00'tedir. Klinik doktor takvimini kesinleştirmek için yanıt verin. (EVET / DEĞİŞTİR)",
    },
    features: [
      { icon: "🩺", title: "Doktor & Randevu Takvimi", desc: "Hekim ve dermatolog görüşmelerini uzman bazlı yönetin." },
      { icon: "📋", title: "Klinik Ön Değerlendirme", desc: "Hasta randevu alırken şikayet ve tercih formu doldurabilir." },
      { icon: "🔒", title: "KVKK Uyumlu Güvenli Altyapı", desc: "Hasta verileri ve randevu geçmişi %100 şifreli saklanır." },
    ],
  },
  spa: {
    slug: "spa",
    badgeLabel: "Spa & Wellness",
    title: "Spa & Wellness Merkezleri İçin",
    highlightText: "Terapi & VIP Paket Yönetimi",
    subtitle: "Anti-aging, sauna, cilt bakımı ve terapi seanslarında lüks müşteri teyidi sağlayın. İptal riskini sıfıra indirin.",
    icon: "🌿",
    metrics: [
      { value: "%99", label: "VIP Müşteri Memnuniyeti" },
      { value: "₺22.000", label: "Aylık Kurtarılan Terapi Geliri" },
      { value: "0 Adet", label: "Gelmeyen Müşteri Kaybı" },
    ],
    smsPreview: {
      salonName: "Lotus Cilt Bakımı & Spa",
      badge: "Prestijli & Özel Dil Tonu",
      text: "🌿 Merhaba Zeynep Hanım! Anti-aging terapi seansınız yarın 14:00'te hazırlanıyor. Doğal ışıltınıza kavuşmak için onayınızı bekliyoruz. (EVET / İPTAL)",
    },
    features: [
      { icon: "🌿", title: "VIP Seans & Paket Yönetimi", desc: "Seanslı paketlerinizi ve VIP terapi odalarınızı saatlik planlayın." },
      { icon: "💬", title: "Lüks Dilli WhatsApp Onayı", desc: "Müşterilerinize özel prestijli onay mesajları ile teyit alın." },
      { icon: "💳", title: "Online Depozito & Paket Satışı", desc: "Ön ödeme alarak spa odalarınızı %100 dolulukla işletin." },
    ],
  },
  auto: {
    slug: "auto",
    badgeLabel: "Oto Bakım & Detailing",
    title: "Oto Servis & Detailing Merkezleri İçin",
    highlightText: "Lift & Kulvar Takvimi",
    subtitle: "Periyodik bakım, seramik kaplama ve yıkama kulvarlarında zaman kaybını önleyin. Randevuları ve lift kapasitesini saatlik planlayın.",
    icon: "🚗",
    metrics: [
      { value: "%98", label: "Lift Doluluk Oranı" },
      { value: "₺28.000", label: "Kurtarılan Servis Geliri" },
      { value: "0 Adet", label: "Boş Kalan Lift Saati" },
    ],
    smsPreview: {
      salonName: "Apex Detailing & Oto Servis",
      badge: "Hızlı & Teknik Dil Tonu",
      text: "🚗 Sayın Ahmet Bey! Seramik kaplama ve periyodik bakım randevunuz yarın 09:00'dadır. Liftiniz hazır. Onaylıyor musunuz? (EVET / İPTAL)",
    },
    features: [
      { icon: "🚗", title: "Lift & Kulvar Yönetimi", desc: "Hangi liftin hangi araç için kaç saat ayrıldığını anlık takip edin." },
      { icon: "⏱️", title: "Servis Süre Otomasyonu", desc: "Bakım, yıkama ve seramik sürelerine göre çakışmasız randevu takvimi." },
      { icon: "📱", title: "WhatsApp Araç Teslim Bilgisi", desc: "İşlemi tamamlanan araç sahiplerine otomatik bildirim gönderin." },
    ],
  },
  fitness: {
    slug: "fitness",
    badgeLabel: "Fitness & Pilates",
    title: "Fitness & Pilates Stüdyoları İçin",
    highlightText: "Ders & Mat Otomasyonu",
    subtitle: "Grup dersleri ve Reformer Pilates saatlerinde gelmeyen danışanlara son verin. Otomatik WhatsApp teyidi ile seans doluluğunuzu %98'e çıkarın.",
    icon: "🏋️",
    metrics: [
      { value: "%98", label: "Ders Katılım Başarısı" },
      { value: "₺16.500", label: "Aylık Kurtarılan Paket Geliri" },
      { value: "5 Dk", label: "Yedek Listeden Ders Dolum Süresi" },
    ],
    smsPreview: {
      salonName: "Pulse Pilates & Functional Studio",
      badge: "Motive Edici & Dinamik Dil",
      text: "🏋️ Harika bir antrenmana hazır mısın Elif? Yarın 18:00 Reformer Pilates dersin onay bekliyor. Hedefine ulaşmak için teyit ver! (EVET / DEĞİŞTİR)",
    },
    features: [
      { icon: "🏋️", title: "Reformer & Ekipman Kilitli Takvim", desc: "Kişi sayısı ve Reformer aleti kapasitesine göre otomatik kontenjan." },
      { icon: "📦", title: "Seanslı Paket & Kredi Takibi", desc: "Danışanlarınızın kalan ders haklarını ve paket son kullanma tarihlerini izleyin." },
      { icon: "🔔", title: "Yedek Kontenjan Bildirimi", desc: "İptal edilen pilates dersinin yerine bekleme listesindeki üyeyi anında alın." },
    ],
  },
  vet: {
    slug: "vet",
    badgeLabel: "Veteriner & Pet Care",
    title: "Veteriner Klinikleri & Pet Bakım İçin",
    highlightText: "Aşı & Muayene Takvimi",
    subtitle: "Minik dostlarımızın aşı takip, tıraş ve genel muayene randevularını aksatmadan yönetin. Otomatik SMS/WhatsApp hatırlatmalarıyla no-show riskini sıfırlayın.",
    icon: "🐾",
    metrics: [
      { value: "%100", label: "Aşı Takip Başarısı" },
      { value: "%92", label: "Düzenli Hasta Sadakati" },
      { value: "0 Adet", label: "Aksatılan Muayene Saati" },
    ],
    smsPreview: {
      salonName: "Paws & Care Veteriner Kliniği",
      badge: "Şefkatli & Hassas Hasta Dili",
      text: "🐾 Merhaba Ali Bey! Pamuk'un aşı ve sağlık kontrolü randevusu yarın 15:30'dadır. Minik dostumuzu bekliyoruz! (EVET / İPTAL)",
    },
    features: [
      { icon: "🐾", title: "Hasta & Pet Profili Kaydı", desc: "Evcil hayvanların aşı geçmişi, kilo ve sağlık notlarını saklayın." },
      { icon: "💉", title: "Otomatik Aşı Günü Hatırlatıcısı", desc: "Günü yaklaşan periyodik aşılar için hayvan sahibine otomatik WhatsApp mesajı." },
      { icon: "✂️", title: "Grooming & Tıraş Randevuları", desc: "Pet kuaför ve banyo randevularını oda bazlı planlayın." },
    ],
  },
  coaching: {
    slug: "coaching",
    badgeLabel: "Özel Ders & Koçluk",
    title: "Eğitmen & Eğitim Koçları İçin",
    highlightText: "Ders Saati Otomasyonu",
    subtitle: "YKS, LGS, dil eğitimi ve spor koçluğunda ders saati iptallerini anında yedekleyin. Veli ve öğrenci onaylarını otomatik alın.",
    icon: "🎓",
    metrics: [
      { value: "0 Adet", label: "Boş Geçen Ders Saati" },
      { value: "%96", label: "Veli Onay Oranı" },
      { value: "₺15.000", label: "Kurtarılan Eğitim Geliri" },
    ],
    smsPreview: {
      salonName: "VipAkademi Özel Ders & Koçluk",
      badge: "Disiplinli & Akademik Dil",
      text: "🎓 Sayın Velimiz, Can'ın YKS Matematik özel dersi yarın 16:00'dadır. Eğitmenimiz hazır. Onaylıyor musunuz? (EVET / HAYIR)",
    },
    features: [
      { icon: "🎓", title: "Eğitmen & Derslik Planlama", desc: "Öğretmenlerinizin ders saatlerini ve etüt odalarını çakışmasız yönetin." },
      { icon: "👨‍👩‍👦", title: "Veli Bilgilendirme Sistemi", desc: "Ders öncesi velilere otomatik teyit ve yoklama bildirimi gönderin." },
      { icon: "📚", title: "Saatlik Kredi & Paket Hesabı", desc: "Öğrencinin kalan özel ders paket saatlerini anlık hesaplayın." },
    ],
  },
  hukuk: {
    slug: "hukuk",
    badgeLabel: "Hukuk & Danışmanlık",
    title: "Hukuk Büroları & Avukatlar İçin",
    highlightText: "Duruşma & Müvekkil Takvimi",
    subtitle: "Duruşma saatleri, müvekkil görüşmeleri ve hukuki danışmanlık randevularını çakışmasız yönetin.",
    icon: "⚖️",
    metrics: [
      { value: "%100", label: "Duruşma Takip Başarısı" },
      { value: "0 Adet", label: "Çakışan Müvekkil Seansı" },
      { value: "24/7", label: "Gizli & KVKK Uyumlu" },
    ],
    smsPreview: {
      salonName: "Yılmaz & Partners Hukuk Bürosu",
      badge: "Resmi & Hukuki Dil Tonu",
      text: "⚖️ Sayın Mehmet Yılmaz, duruşma ve hukuki danışmanlık randevunuz yarın 11:00'dedir. Avukatınız hazır. (EVET / İPTAL)",
    },
    features: [
      { icon: "⚖️", title: "Duruşma & Görüşme Takvimi", desc: "Avukatların adliye duruşma saatleri ve ofis görüşmelerini senkronize edin." },
      { icon: "📁", title: "Dava Dosyası & Müvekkil CRM", desc: "Esas numarası ve dava detaylarını randevu ile ilişkilendirin." },
      { icon: "💳", title: "Danışmanlık Avans Tahsilatı", desc: "Görüşme öncesinde online danışmanlık ücreti tahsil edin." },
    ],
  },
  legal: {
    slug: "legal",
    badgeLabel: "Hukuk & Danışmanlık",
    title: "Hukuk Büroları & Avukatlar İçin",
    highlightText: "Duruşma & Müvekkil Takvimi",
    subtitle: "Duruşma saatleri, müvekkil görüşmeleri ve hukuki danışmanlık randevularını çakışmasız yönetin.",
    icon: "⚖️",
    metrics: [
      { value: "%100", label: "Duruşma Takip Başarısı" },
      { value: "0 Adet", label: "Çakışan Müvekkil Seansı" },
      { value: "24/7", label: "Gizli & KVKK Uyumlu" },
    ],
    smsPreview: {
      salonName: "Yılmaz & Partners Hukuk Bürosu",
      badge: "Resmi & Hukuki Dil Tonu",
      text: "⚖️ Sayın Mehmet Yılmaz, duruşma ve hukuki danışmanlık randevunuz yarın 11:00'dedir. Avukatınız hazır. (EVET / İPTAL)",
    },
    features: [
      { icon: "⚖️", title: "Duruşma & Görüşme Takvimi", desc: "Avukatların adliye duruşma saatleri ve ofis görüşmelerini senkronize edin." },
      { icon: "📁", title: "Dava Dosyası & Müvekkil CRM", desc: "Esas numarası ve dava detaylarını randevu ile ilişkilendirin." },
      { icon: "💳", title: "Danışmanlık Avans Tahsilatı", desc: "Görüşme öncesinde online danışmanlık ücreti tahsil edin." },
    ],
  },
  photo: {
    slug: "photo",
    badgeLabel: "Fotoğraf Stüdyosu",
    title: "Fotoğraf Stüdyoları & Platolar İçin",
    highlightText: "Plato & Ekipman Kiralama",
    subtitle: "Çekim platoları, ışık sistemleri ve fotoğrafçı takvimini saatlik periyotlarla çakışmasız yönetin.",
    icon: "📸",
    metrics: [
      { value: "%95", label: "Plato Kullanım Verimi" },
      { value: "₺20.000", label: "Kurtarılan Çekim Geliri" },
      { value: "0 Adet", label: "Çakışan Çekim Seansı" },
    ],
    smsPreview: {
      salonName: "Studio Flash Fotoğrafçılık",
      badge: "Kreatif & İlham Verici Dil",
      text: "📸 Selam Zeynep! Plato A ve ışık ekibiniz yarın 13:00 çekimi için hazır. Kreatif çekiminize onay verin. (EVET / İPTAL)",
    },
    features: [
      { icon: "📸", title: "Plato & Stüdyo Odası Takibi", desc: "Hangi platonun hangi moda/ürün çekimine ayrıldığını saatlik görün." },
      { icon: "💡", title: "Ekipman & Işık Seti Tahsisi", desc: "Kamera ve ışık setlerini çekim saatine göre kilitleyin." },
      { icon: "💳", title: "Saatlik Plato Depozitosu", desc: "Çekim öncesi kapora alarak rezervasyonu garantiye alın." },
    ],
  },
  coworking: {
    slug: "coworking",
    badgeLabel: "Coworking & Ofis",
    title: "Toplantı Odaları & Coworking İçin",
    highlightText: "Oda & Masa Kiralama",
    subtitle: "Saatlik toplantı odası, özel ofis ve sunum alanı rezervasyonlarını tek ekrandan yönetin.",
    icon: "🏢",
    metrics: [
      { value: "%97", label: "Toplantı Odası Verimi" },
      { value: "₺25.000", label: "Aylık Oda Kiralama Geliri" },
      { value: "0 Dk", label: "Çakışma Bekleme Süresi" },
    ],
    smsPreview: {
      salonName: "HubSpace Coworking & Plaza",
      badge: "Profesyonel & İş Odaklı Dil",
      text: "🏢 Sayın Burak Bey, VIP Toplantı Odası (8 Kişilik) rezervasyonunuz yarın 10:00'dadır. Sunum ekipmanları hazır. (EVET / İPTAL)",
    },
    features: [
      { icon: "🏢", title: "Toplantı Odası Rezervasyonu", desc: "Projeksiyonlu, tahtalı ve VIP odaları saatlik olarak kiralatın." },
      { icon: "⏳", title: "Kredi & Üyelik Paketi Hesabı", desc: "Kurumsal üyelerin aylık ücretsiz toplantı saat haklarını düşün." },
      { icon: "🔑", title: "Otomatik Odaya Giriş Kodu", desc: "Onaylanan rezervasyon sahibine kapı şifresini otomatik iletin." },
    ],
  },
  restoran: {
    slug: "restoran",
    badgeLabel: "Restoran & Kafe",
    title: "Restoran & Kafeler İçin",
    highlightText: "Masa Rezervasyonu",
    subtitle: "Bahçe, iç mekan ve VIP masalar için zamanlı rezervasyon kabul edin. Gelmeyen müşteriler için otomatik teyit yapın.",
    icon: "🍽️",
    metrics: [
      { value: "%0", label: "Boş Kalan Masa Saati" },
      { value: "%95", label: "Masa Teyit Başarısı" },
      { value: "₺30.000", label: "Kurtarılan Masa Cirosu" },
    ],
    smsPreview: {
      salonName: "Venedik Bistro & Restoran",
      badge: "Lezzetli & Misafirperver Dil",
      text: "🍽️ Sayın Caner Bey, 4 kişilik bahçe masa rezervasyonunuz yarın 20:00 için ayrılmıştır. Şefimiz sizi bekliyor! (EVET / İPTAL)",
    },
    features: [
      { icon: "🍽️", title: "Bahçe & İç Mekan Masa Düzeni", desc: "Masa numarasına ve kişi sayısına göre dinamik rezervasyon." },
      { icon: "🍷", title: "Özel Gün & Ön Sipariş", desc: "Doğum günü veya davet masaları için ön menü ve not alımı." },
      { icon: "📱", title: "Gelmeyen Masa Engelleyici", desc: "Rezervasyona 1 saat kala teyit verilmeyen masayı bekleme listesine devredin." },
    ],
  },
};

export async function generateStaticParams() {
  return [
    { vertical: "guzellik" },
    { vertical: "salon" },
    { vertical: "berber" },
    { vertical: "masaj" },
    { vertical: "spa" },
    { vertical: "klinik" },
    { vertical: "hukuk" },
    { vertical: "legal" },
    { vertical: "restoran" },
    { vertical: "auto" },
    { vertical: "fitness" },
    { vertical: "vet" },
    { vertical: "coaching" },
    { vertical: "photo" },
    { vertical: "coworking" },
  ];
}

export default async function SectorPage({ params }: { params: Promise<{ vertical: string }> }) {
  const resolvedParams = await params;
  const vertical = resolvedParams.vertical;
  const config = SECTOR_CONFIGS[vertical] || SECTOR_CONFIGS["guzellik"];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* ── SUB-BRANDED HERO SECTION ── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 bg-hero-radial border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Sub-brand Header Badge (Matching User Upload Screenshot Style: GlowDesk [Güzellik Salonu]) */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#0066FF] text-white font-extrabold text-base flex items-center justify-center shadow-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                Glow<span className="text-[#0066FF]">Desk</span>
              </span>
            </Link>

            {/* Pill Tag for Sector */}
            <span className="px-3.5 py-1 rounded-full bg-blue-100 text-[#0066FF] border border-blue-200 text-xs font-extrabold tracking-wide uppercase shadow-2xs flex items-center gap-1.5">
              <span>{config.icon}</span>
              <span>{config.badgeLabel}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-blue-soft">
                  {config.icon} {config.badgeLabel} Özel Çözüm
                </span>
                <span className="badge-blue-soft">
                  ⚡ 2 Dakikada Kurulum
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15]">
                {config.title}{" "}
                <span className="text-underline-highlight">{config.highlightText}</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
                {config.subtitle}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-200/80">
                {config.metrics.map((m) => (
                  <div key={m.label} className="stat-card">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#0066FF]">{m.value}</div>
                    <div className="text-[11px] font-bold text-slate-500 mt-0.5 leading-snug">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link href="/register/business" className="btn-primary-blue text-sm py-3.5 px-8">
                  {config.badgeLabel} İçin 1 Ay Ücretsiz Başla →
                </Link>
                <Link href="/#pricing" className="btn-secondary-white text-sm py-3 px-6">
                  Paketleri İncele
                </Link>
              </div>
            </div>

            {/* Right Showcase Box: Live SMS Simulation */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 shadow-layered border border-slate-200/90 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{config.smsPreview.salonName}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">● Otomasyon Aktif</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-[#0066FF] px-2.5 py-1 rounded-full border border-blue-200">
                    {config.smsPreview.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Otomatik WhatsApp Mesajı:</span>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                    {config.smsPreview.text}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span>Müşteri Yanıtı: &quot;EVET&quot;</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">Randevu Kesinleşti ✓</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. SEKTÖREL ÖZELLİKLER ── */}
      <section className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="badge-blue-soft">{config.icon} Modüller</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              {config.badgeLabel} İçin Özel Geliştirilen 3 Temel Güç
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.features.map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-layered space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#0066FF] flex items-center justify-center font-extrabold text-2xl border border-slate-200">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">{f.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FİYATLANDIRMA CTA ── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-6 text-center bg-white rounded-3xl p-10 border border-slate-200 shadow-layered space-y-6">
          <span className="badge-blue-soft">🚀 Taahhütsüz & Komisyonsuz</span>
          <h2 className="text-3xl font-extrabold text-slate-900 font-display">
            {config.badgeLabel} Salonunuzu Bugün Dijitalleştirin
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            1 ay ücretsiz deneyin. Kredi kartı gerekmez, kurulum 2 dakikada tamamlanır.
          </p>
          <div className="pt-2">
            <Link href="/register/business" className="btn-primary-blue text-sm py-3.5 px-8">
              1 Ay Ücretsiz Denemeyi Başlatın →
            </Link>
          </div>
        </div>
      </section>

      <LiveChatWidget />
      <Footer />
    </div>
  );
}
