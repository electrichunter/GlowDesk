"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ExitIntentModal from "@/components/modals/ExitIntentModal";
import LiveChatWidget from "@/components/marketing/LiveChatWidget";
import Interactive3DScrollFlow from "@/components/marketing/Interactive3DScrollFlow";

// ─── SEKTÖRLER (12 Sektör) ──────────────────────────────────────────────────────
const SECTORS = [
  { key: "beauty",    icon: "💄", label: "Güzellik" },
  { key: "barber",    icon: "💈", label: "Berber" },
  { key: "massage",   icon: "💆", label: "Masaj" },
  { key: "spa",       icon: "🌿", label: "Spa" },
  { key: "clinic",    icon: "🩺", label: "Klinik" },
  { key: "auto",      icon: "🚗", label: "Oto Bakım" },
  { key: "fitness",   icon: "🏋️", label: "Fitness" },
  { key: "vet",       icon: "🐾", label: "Veteriner" },
  { key: "coaching",  icon: "🎓", label: "Koçluk" },
  { key: "legal",     icon: "⚖️", label: "Hukuk" },
  { key: "photo",     icon: "📸", label: "Fotoğraf" },
  { key: "coworking", icon: "🏢", label: "Coworking" },
  { key: "restoran",  icon: "🍽️", label: "Restoran" },
] as const;

type SectorKey = "beauty" | "barber" | "massage" | "spa" | "clinic" | "auto" | "fitness" | "vet" | "coaching" | "legal" | "photo" | "coworking" | "restoran";

const sectorData: Record<SectorKey, {
  title: string;
  badge: string;
  sms: string;
  metric: string;
}> = {
  beauty: {
    title: "Zelza Güzellik Studio",
    badge: "Duygusal & Lüks Dil",
    sms: "✨ Selam Elif! Senin için ayrılan cilt bakımı saatinin koruyucusuyuz. Yarın 14:00'te gelirken ruhunu dinlendirmeyi unutma... Onaylıyor musun? (EVET/HAYIR)",
    metric: "Ayda 14 No-Show İptali Engellendi",
  },
  barber: {
    title: "Maestro Erkek Kuaförü",
    badge: "Net & Samimi Dil",
    sms: "💈 Abi merhaba! Yarın saat 11:00'de saç kesimi + sakal tıraşı var. Gelecek misin? Koltuk sana ayrıldı. (EVET / HAYIR)",
    metric: "Bekleme Listesiyle ₺12.000 Gelir Kurtarıldı",
  },
  massage: {
    title: "Serenity Wellness & Masaj",
    badge: "Huzurlu & Özel Dil",
    sms: "💆 Merhaba Kemal Bey! Yarın 14:00'teki 90 dk. derin doku terapiniz hazır. Gerginliğinizi sıfırlamak için onay verin. (EVET/İPTAL)",
    metric: "Doluluk Oranı %96'ya Çıktı",
  },
  spa: {
    title: "Lotus Cilt Bakımı & Spa",
    badge: "Prestijli & Özel Dil",
    sms: "🌿 Merhaba Zeynep Hanım! Anti-aging terapi seansınız yarın 14:00'te hazırlanıyor. Doğal ışıltınıza kavuşmak için onayınızı bekliyoruz. (EVET/İPTAL)",
    metric: "Otomatik Teyit ile 0 Müşteri Kaybı",
  },
  clinic: {
    title: "Elit Estetik & Dermatoloji",
    badge: "Kurumsal & Medikal Dil",
    sms: "🩺 Sayın Merve Şahin, Uzm. Dermatolog randevunuz yarın 14:00'tedir. Klinik takvimi kesinleştirmek için yanıtınızı bekliyoruz. (EVET/DEĞİŞTİR)",
    metric: "Zaman Kaybı %85 Azaldı",
  },
  auto: {
    title: "Apex Detailing & Oto Servis",
    badge: "Hızlı & Teknik Dil",
    sms: "🚗 Sayın Ahmet Bey! Seramik kaplama ve periyodik bakım randevunuz yarın 09:00'dadır. Liftiniz hazır. Onaylıyor musunuz? (EVET/İPTAL)",
    metric: "Lift Doluluk Oranı %98",
  },
  fitness: {
    title: "Pulse Pilates & Functional",
    badge: "Motive Edici & Dinamik Dil",
    sms: "🏋️ Harika bir antrenmana hazır mısın Elif? Yarın 18:00 Reformer Pilates dersin onay bekliyor. Hedefine ulaşmak için teyit ver! (EVET/DEĞİŞTİR)",
    metric: "Ders İptalleri %90 Engellendi",
  },
  vet: {
    title: "Paws & Care Veteriner Kliniği",
    badge: "Şefkatli & Hassas Dil",
    sms: "🐾 Merhaba Ali Bey! Pamuk'un aşı ve sağlık kontrolü randevusu yarın 15:30'dadır. Minik dostumuzu bekliyoruz! (EVET/İPTAL)",
    metric: "Aşı Takip Başarısı %100",
  },
  coaching: {
    title: "VipAkademi Özel Ders",
    badge: "Disiplinli & Akademik Dil",
    sms: "🎓 Sayın Velimiz, Can'ın YKS Matematik özel dersi yarın 16:00'dadır. Eğitmenimiz hazır. Onaylıyor musunuz? (EVET/HAYIR)",
    metric: "Ders Saati Kaybı 0",
  },
  legal: {
    title: "Yılmaz & Partners Hukuk Bürosu",
    badge: "Resmi & Hukuki Dil",
    sms: "⚖️ Sayın Mehmet Yılmaz, duruşma ve hukuki danışmanlık randevunuz yarın 11:00'dedir. Avukatınız hazır. (EVET/İPTAL)",
    metric: "Duruşma Çakışması %0",
  },
  photo: {
    title: "Studio Flash Fotoğrafçılık",
    badge: "Kreatif & İlham Verici Dil",
    sms: "📸 Selam Zeynep! Plato A ve ışık ekibiniz yarın 13:00 çekimi için hazır. Kreatif çekiminize onay verin. (EVET/İPTAL)",
    metric: "Plato Kullanım Verimi %95",
  },
  coworking: {
    title: "HubSpace Coworking & Plaza",
    badge: "Profesyonel & İş Odaklı Dil",
    sms: "🏢 Sayın Burak Bey, VIP Toplantı Odası (8 Kişilik) rezervasyonunuz yarın 10:00'dadır. Sunum ekipmanları hazır. (EVET/İPTAL)",
    metric: "Oda Kiralama Verimi %97",
  },
  restoran: {
    title: "Venedik Bistro & Restoran",
    badge: "Lezzetli & Misafirperver Dil",
    sms: "🍽️ Sayın Caner Bey, 4 kişilik bahçe masa rezervasyonunuz yarın 20:00 için ayrılmıştır. Şefimiz sizi bekliyor! (EVET/İPTAL)",
    metric: "Masa Boş Kalma Oranı %0",
  },
};

// ─── MÜŞTERİ YORUMLARI ────────────────────────────────────────────────────────
const testimonials = [
  {
    name: "Ahmet Kaya",
    business: "Maestro Erkek Kuaförü • Şişli",
    rating: 5,
    text: "GlowDesk'ten önce haftada 5-6 no-show vardı. Şimdi sıfır. Bekleme listesi motoru boş slotu anında dolduruyor. Ayda ₺12.000 kayıp geliri kurtarıyoruz.",
  },
  {
    name: "Selin Arslan",
    business: "Lotus Cilt Bakımı & Spa • Beşiktaş",
    rating: 5,
    text: "Müşterilerim WhatsApp'tan tek tıkla onay verince randevu kesinleşiyor. İptal oranım %80 azaldı. Harika bir esnaf otomasyonu.",
  },
  {
    name: "Kemal Doğan",
    business: "ZenTouch Masaj Terapisi • Kadıköy",
    rating: 5,
    text: "60 dakikalık masaj seansları için gelmeyen müşteri çok büyük zarardı. GlowDesk sayesinde gelmeyen kalkıyor, sıradaki bekleme listesi müşterisi otomatik alınıyor.",
  },
];

// ─── SSS ─────────────────────────────────────────────────────────────────────
const faqItems = [
  {
    q: "Hangi sektörler için uygun?",
    a: "Güzellik salonu, berber, masaj merkezi, spa ve dermatoloji/estetik klinikleri için tam uyumludur. Sektörünüze özel psikolojik mesaj dili otomatik seçilir.",
  },
  {
    q: "No-Show kurtarma motoru nasıl çalışır?",
    a: "Randevu saatinden önce müşteri WhatsApp onay mesajına yanıt vermezse, sistem bekleme listesindeki ilk uygun müşteriye otomatik teklif gönderip boş koltuğu anında doldurur.",
  },
  {
    q: "Kurulum zor mu veya uygulama indirmek gerekiyor mu?",
    a: "Hayır! 2 dakikada tarayıcı üzerinden kaydolup kullanmaya başlayabilirsiniz. Hiçbir teknik bilgi veya uygulama indirme gerektirmez.",
  },
  {
    q: "Komisyon veya gizli ücret alıyor musunuz?",
    a: "Kesinlikle hayır. Diğer platformlar gibi cironuzdan %15-20 kesinti yapmayız. Yalnızca sabit aylık paket ücreti vardır.",
  },
];

export default function Home() {
  const [activeSector, setActiveSector] = useState<SectorKey>("beauty");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [callSuccess, setCallSuccess] = useState(false);

  const handleCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    setCallSuccess(true);
    setTimeout(() => {
      setCallSuccess(false);
      setCallModalOpen(false);
      setPhoneInput("");
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <ExitIntentModal />

      {/* ──────────────────────────────────────────────────────────────────────────
          1. HERO SECTION (NetVerim Tasarımı Birebir Esas Alınmıştır)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-hero-radial border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* SOL METİN ALANI */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badges / Pill Tags (NetVerim Style) */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="badge-blue-soft shadow-2xs">
                  ⚡ Hızlı Kurulum
                </span>
                <span className="badge-blue-soft shadow-2xs">
                  🛡️ %100 Güvenli
                </span>
                <span className="badge-blue-soft shadow-2xs">
                  ⚙️ Otomatik Otomasyon
                </span>
              </div>

              {/* Headline with Squiggle Underline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15]">
                En Hızlı{" "}
                <span className="text-underline-highlight">Randevu &amp; Salon</span>{" "}
                Hizmeti
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Güzellik salonunuz ya da kuaförünüz şu anda boş koltuk kaygısı mı yaşııyor? GlowDesk ile hızlı, güvenli ve kesintisiz otomatik randevu teyidinin avantajlarından yararlanın, rahat edin. Boş slotları anında doldurun, kayıp yaşamayın.
              </p>

              {/* Tech Badges / Integrations */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  WhatsApp API
                </span>
                <span className="text-slate-500">iZico Pos</span>
                <span className="text-slate-500">Google Takvim</span>
                <span className="text-slate-500">SMS Gateway</span>
              </div>

              {/* CTA Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link href="/#pricing" className="btn-primary-blue text-base py-3.5 px-8">
                  Paketleri İncele →
                </Link>

                {/* Biz sizi arayalım (NetVerim Style Floating Button) */}
                <button
                  type="button"
                  onClick={() => setCallModalOpen(true)}
                  className="btn-secondary-white text-sm py-3 px-6 hover:border-[#0066FF]"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#0066FF" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Biz sizi arayalım
                </button>
              </div>
            </div>

            {/* SAĞ GÖRSEL VE YÜZEN KARTLAR ALANI (NetVerim Style Visual Showcase) */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Uptime / Satisfaction Badge Card (Sol Üst) */}
              <div className="absolute -top-4 -left-2 sm:left-4 z-20 bg-white/95 backdrop-blur-md p-3.5 px-4 rounded-2xl shadow-layered border border-slate-200/80 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200">
                  ⚡
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">%99.9 Memnuniyet</div>
                  <div className="text-[10px] text-slate-500 font-medium">Garantili Otomasyon</div>
                </div>
              </div>

              {/* Ana Görsel Çerçevesi */}
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <Image
                  src="/glowdesk_hero.png"
                  alt="GlowDesk Salon Yönetimi"
                  width={500}
                  height={600}
                  priority
                  className="w-full h-auto object-cover rounded-2xl transform hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          1.5. 3D RANDEVUDAN KASAYA AKIŞ (Scroll Pinning & 3D Perspective Cards)
      ────────────────────────────────────────────────────────────────────────── */}
      <Interactive3DScrollFlow />

      {/* ──────────────────────────────────────────────────────────────────────────
          2. SEKTÖREL ŞABLON HİZMETLERİ (Interactive Sector Tabs)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="badge-blue-soft">Sektörünüze Özel Dil & Psikoloji</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Her Sektörün Müşterisine Özel İkna Dili
            </h2>
            <p className="text-slate-600 text-sm">
              Berber ile estetik kliniğinin müşteri ilişkileri bir değildir. GlowDesk sektörünüze en uygun tonlamayı otomatik uygular.
            </p>
          </div>

          {/* Sector Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {SECTORS.map((sec) => (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSector(sec.key)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeSector === sec.key
                    ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

          {/* Sector Details Box */}
          <div className="max-w-3xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-layered">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  {sectorData[activeSector].title}
                </h3>
                <span className="inline-block mt-1 text-xs font-bold text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  {sectorData[activeSector].badge}
                </span>
              </div>
              <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                🚀 {sectorData[activeSector].metric}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Otomatik Giden WhatsApp Onay Mesajı:
              </label>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 font-medium leading-relaxed shadow-2xs">
                {sectorData[activeSector].sms}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. ÖZELLİKLER (Bento Grid Layout)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[#F8FAFC] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="badge-blue-soft">Esnaf Dostu Teknolojiler</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Salonunuzu Uçuracak 5 Akıllı Modül
            </h2>
            <p className="text-slate-600 text-sm">
              Karmaşık yazılımları unutun. Sadece 5 temel modülle salonunuzun tüm no-show problemlerini ortadan kaldırın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered hover:shadow-layered-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
                💬
              </div>
              <h3 className="text-xl font-bold text-slate-900">Otomatik WhatsApp Teyidi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Randevudan saatler önce müşteriye otomatik WhatsApp mesajı gider. Müşteri yanıt vermezse koltuk boşa düşer.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered hover:shadow-layered-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
                ⏳
              </div>
              <h3 className="text-xl font-bold text-slate-900">Bekleme Listesi Motoru</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                İptal olan veya onaylanmayan saati anında yedek bekleme listesindeki ilk müşteriye otomatik teklif eder.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 card-inset-border shadow-layered hover:shadow-layered-hover transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-extrabold text-xl">
                💳
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ön Ödemeli Depozito</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Riskli veya sık no-show olan müşterilerden randevu alırken online kapora/depozito tahsilatı yapın.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. FİYATLANDIRMA (Pricing Section)
      ────────────────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="badge-blue-soft">Şeffaf &amp; Komisyonsuz</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Sabit Fiyat, Sıfır Komisyon
            </h2>
            <p className="text-slate-600 text-sm">
              Kazancınız arttıkça komisyon ödemeyin. İhtiyacınıza uygun paketi seçin, istediğiniz an taahhütsüz iptal edin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Başlangıç Paket */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Tek Salon</span>
                <h3 className="text-2xl font-bold text-slate-900">Başlangıç</h3>
                <div className="text-4xl font-extrabold text-slate-900">
                  ₺490 <span className="text-xs font-normal text-slate-500">/ ay</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t border-slate-200 pt-4">
                  <li>✓ 1 Uzman / Koltuk Yönetimi</li>
                  <li>✓ Aylık 300 Otomatik SMS/WhatsApp</li>
                  <li>✓ Temel Randevu Takvimi</li>
                </ul>
              </div>
              <Link href="/register" className="btn-secondary-white text-center text-xs justify-center py-3">
                1 Ay Ücretsiz Başla
              </Link>
            </div>

            {/* Pro Paket (Highlighted NetVerim Style) */}
            <div className="bg-white rounded-3xl p-8 border-2 border-[#0066FF] shadow-layered flex flex-col justify-between space-y-6 relative transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0066FF] text-white text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider">
                En Popüler Seçim
              </div>
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0066FF]">Gelişmiş İşletme</span>
                <h3 className="text-2xl font-bold text-slate-900">Pro Paket</h3>
                <div className="text-4xl font-extrabold text-slate-900">
                  ₺890 <span className="text-xs font-normal text-slate-500">/ ay</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700 font-medium border-t border-slate-100 pt-4">
                  <li>✓ Sınırsız Uzman &amp; Koltuk</li>
                  <li>✓ Sınırsız WhatsApp Teyit Mesajı</li>
                  <li>✓ Bekleme Listesi Otomasyonu</li>
                  <li>✓ iZico Depozito Tahsilatı</li>
                  <li>✓ Sektörel Özel Psikoloji Dili</li>
                </ul>
              </div>
              <Link href="/register" className="btn-primary-blue text-center text-xs justify-center py-3">
                1 Ay Ücretsiz Dene →
              </Link>
            </div>

            {/* Kurumsal Paket */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Çoklu Şube</span>
                <h3 className="text-2xl font-bold text-slate-900">Kurumsal</h3>
                <div className="text-4xl font-extrabold text-slate-900">
                  ₺1.490 <span className="text-xs font-normal text-slate-500">/ ay</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 border-t border-slate-200 pt-4">
                  <li>✓ Çoklu Şube Yönetimi</li>
                  <li>✓ Özel Müşteri Temsilcisi</li>
                  <li>✓ ERP &amp; Muhasebe Entegrasyonu</li>
                  <li>✓ Özel API Erişimi</li>
                </ul>
              </div>
              <button onClick={() => setCallModalOpen(true)} className="btn-secondary-white text-center text-xs justify-center py-3">
                Bize Ulaşın
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. MÜŞTERİ YORUMLARI & SSS
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          
          {/* Testimonials */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="badge-blue-soft">Esnaf Görüşleri</span>
              <h2 className="text-3xl font-extrabold text-slate-900 font-display">
                Salon Sahipleri Ne Diyor?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-layered space-y-4">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-bold text-slate-900">{t.name}</div>
                    <div className="text-[11px] text-slate-500">{t.business}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SSS Accordion */}
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 font-display">
                Sıkça Sorulan Sorular
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div
                  key={item.q}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left p-4 px-6 flex items-center justify-between text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <span>{item.q}</span>
                    <span className="text-slate-400 text-base">{openFaq === index ? "−" : "+"}</span>
                  </button>
                  {openFaq === index && (
                    <div className="p-4 px-6 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. "BİZ SİZİ ARAYALIM" MODAL (NetVerim Style Callback Modal)
      ────────────────────────────────────────────────────────────────────────── */}
      {callModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setCallModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>

            {callSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-slate-900">Talebiniz Alındı!</h3>
                <p className="text-xs text-slate-600">
                  Müşteri temsilcimiz en kısa sürede sizi telefonla arayacaktır.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCallSubmit} className="space-y-5">
                <div className="space-y-1">
                  <div className="badge-blue-soft text-[10px]">📞 Ücretsiz Telefon Desteği</div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-display">
                    Biz Sizi Arayalım
                  </h3>
                  <p className="text-xs text-slate-500">
                    Telefon numaranızı bırakın, uzmanımız 5 dakika içinde sizi bilgilendirsin.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Telefon Numaranız:</label>
                  <input
                    type="tel"
                    required
                    placeholder="05XX XXX XX XX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <button type="submit" className="w-full btn-primary-blue justify-center text-sm py-3">
                  Beni Ara →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <LiveChatWidget />
      <Footer />
    </div>
  );
}
