import { type BlogPost } from "@/lib/types";

export const FALLBACK_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-no-show-reduction",
    title: "Güzellik Salonlarında No-Show Oranını %90 Azaltmanın 5 Altın Yolu",
    slug: "guzellik-salonlarinda-no-show-oranini-azaltmanin-5-yolu",
    category: "No-Show Koruması",
    author_name: "GlowDesk Uzman Ekibi",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    excerpt: "Randevularına gelmeyen müşteriler nedeniyle yaşanan ciro kaybını engellemenin ve salon doluluk oranını zirveye taşımanın en etkili 5 stratejisi.",
    cover_image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    content: `
      <h2>No-Show Sorunu Salon Cironuzu Nasıl Etkiler?</h2>
      <p>Güzellik salonları, kuaförler ve spa merkezlerinde en sık karşılaşılan finansal kayıp nedeni <strong>"gelmeyen müşteriler" (No-Show)</strong> durumudur. Bir müşterinin randevusuna gelmemesi, sadece o saatlik geliri düşürmekle kalmaz, aynı zamanda çalışan personelin boş beklemesine ve o saat dilimini talep eden diğer potansiyel müşterilerin kaçırılmasına yol açar.</p>
      
      <h3>1. Çift Yönlü WhatsApp Randevu Onayı Kullanın</h3>
      <p>Geleneksel SMS mesajları günümüzde %20 civarında okunma oranına sahipken, WhatsApp mesajları %98 oranında okunmaktadır. Randevudan 24 saat önce müşterinize iletilen tek tıkla onaylama butonu, unutma vakalarını %60 oranında engeller.</p>
      
      <h3>2. Online Kapara ve Depozito Altyapısını Devreye Alın</h3>
      <p>Yüksek tutarlı seanslarda (örneğin saç boyama, ombré veya cilt bakımı) küçük bir kapara ücreti talep etmek, müşterinin randevu saatine uyma sorumluluğunu 4 katına çıkarmaktadır.</p>

      <h3>3. Bekleme Listesi (Waitlist) ile İptalleri Doldurun</h3>
      <p>İptal edilen bir randevu saatini boş bırakmak yerine, aynı güne sıra bekleyen yedek müşterilerinize otomatik bildirim göndererek boş seansı 5 dakika içinde doldurabilirsiniz.</p>

      <h3>4. Müşteri Sadakat & Güven Skoru Oluşturun</h3>
      <p>Geçmişte haber vermeksizin randevusuna gelmemiş müşterilerinizi GlowDesk sisteminde etiketleyin. Sonraki randevularında ön ödeme şartı koyarak riskinizi sıfırlayın.</p>

      <h3>5. Randevu Şartları Sözleşmesini Şeffaf Şekilde Sunun</h3>
      <p>Randevu alırken iptal politikanızı (örneğin: "Son 4 saat kala yapılan iptallerde kapara iade edilmez") şeffafça açıklamak profesyonellik algısını ve randevu disiplinini pekiştirir.</p>
    `
  },
  {
    id: "post-whatsapp-automation",
    title: "WhatsApp Otomasyonu ile Müşteri Sadakatini ve Tekrar Randevu Oranını Artırın",
    slug: "whatsapp-otomasyonu-ile-musteri-sadakatini-artirin",
    category: "Pazarlama & Müşteri İlişkileri",
    author_name: "GlowDesk İletişim Ekibi",
    status: "published",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    excerpt: "Tek tıklamayla randevu teyidi alma, seans sonrası değerlendirme toplama ve otomatik kampanya mesajları ile müşteri sadakatini katlama yöntemleri.",
    cover_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    content: `
      <h2>Müşteri İletişiminde Otomasyonun Gücü</h2>
      <p>Günümüz müşterileri telefonla arayarak randevu almak yerine mesajlaşarak anında onay almayı tercih etmektedir. WhatsApp API entegrasyonu sunan modern yazılımlar sayesinde salonunuz 7/24 kesintisiz iletişim kurabilir.</p>

      <h3>Otomatik Teyit Mesajlarının Avantajları</h3>
      <ul>
        <li>Telefon trafiğini %80 azaltır, resepsiyon yükünü hafifletir.</li>
        <li>Müşteriye konum, adres ve ulaşımla ilgili görsel rehber ulaştırır.</li>
        <li>Hizmet sonrası otomatik değerlendirme linki ile Google yorum sayısını artırır.</li>
      </ul>

      <h3>"Sizi Özledik" Otomatik Hatırlatmaları</h3>
      <p>30 veya 60 gündür salona uğramamış müşterilerinize sistem tarafından otomatik olarak gönderilen "Uzun zamandır görüşemedik, size özel %15 indirim fırsatı" mesajları geri dönüş oranını %35 artırmaktadır.</p>
    `
  },
  {
    id: "post-salon-management-2026",
    title: "2026 Salon Yönetim Rehberi: Dijitalleşen İşletmeler Neden 3 Kat Daha Hızlı Büyüyor?",
    slug: "2026-salon-yonetim-rehberi-dijitallestirme",
    category: "Salon Yönetimi",
    author_name: "GlowDesk Strateji Ekibi",
    status: "published",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    excerpt: "Defterle randevu tutma devri sona erdi. Bulut tabanlı yazılımlarla personel performansı, finansal takvim ve müşteri veritabanı nasıl yönetilir?",
    cover_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
    content: `
      <h2>Kâğıt Defterlerden Bulut Takvimine Geçiş</h2>
      <p>Geleneksel defter tutma yöntemleri karışıklığa, çifte randevu yazılmasına ve geçmiş verilerin kaybolmasına sebep olur. 2026 vizyonunda dijitalleşen işletmeler her an her yerden salon cirosunu ve randevu durumunu izleyebilir.</p>

      <h3>Dijital Yönetimin Kazandırdığı 3 Ana Başlık</h3>
      <ol>
        <li><strong>Canlı Ciro & Finansal Raporlama:</strong> Günlük, haftalık ve aylık bazda hangi personelin ne kadar ciro getirdiğini anında görün.</li>
        <li><strong>Personel Prim ve Vardiya Yönetimi:</strong> Uzman kadronun komisyon hesaplamalarını tek tıkla otomatikleştirin.</li>
        <li><strong>7/24 Online Randevu Alabilme:</strong> Gece saatlerinde bile müşterilerinizin online link üzerinden kendi randevularını oluşturmasına imkan tanıyın.</li>
      </ol>
    `
  },
  {
    id: "post-waitlist-engine",
    title: "Akıllı Bekleme Listesi (Waitlist) İle İptal Edilen Randevuları Kazanca Dönüştürün",
    slug: "akilli-bekleme-listesi-ile-iptal-randevulari-kazanca-donusturun",
    category: "Teknoloji & Verimlilik",
    author_name: "GlowDesk Mühendislik Ekibi",
    status: "published",
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    excerpt: "Son dakika iptallerinde boş kalan seansları yedek bekleme listesindeki müşterilere anında eşleştirerek cironuzu koruyun.",
    cover_image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
    content: `
      <h2>Akıllı Bekleme Listesi (Waitlist) Nedir?</h2>
      <p>Özellikle Cuma, Cumartesi ve Pazar gibi yoğun günlerde salonda boş yer kalmadığında randevu alamayan müşteriler genellikle alternatif salonlara yönelir. Bekleme Listesi Motoru bu kayıp talepleri toplar ve bir iptal yaşandığı anda yedek müşteriye fırsat sunar.</p>

      <h3>Waitlist Algoritmasının Çalışma Mantığı</h3>
      <p>Müşteri online randevu ekranında istediği saatin dolu olduğunu gördüğünde <em>"Bu saat boşalırsa bana haber ver"</em> seçeneğini işaretler. İptal gerçekleştiğinde sıradaki ilk müşteriye otomatik bildirim iletilir ve seans anında doldurulur.</p>
    `
  }
];
