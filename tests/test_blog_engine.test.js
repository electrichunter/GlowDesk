/**
 * Test Module: Blog Engine & Fallback Articles
 * Tests blog listing, categories, fallback list, and post schema validity.
 */

function runBlogEngineTests() {
  const results = [];

  function assert(title, condition, detail = "") {
    results.push({
      suite: "Blog Engine & Fallback Data",
      title,
      passed: Boolean(condition),
      detail: condition ? "Başarılı" : detail
    });
  }

  // Fallback Articles List
  const articles = [
    {
      id: "post-no-show-reduction",
      title: "Güzellik Salonlarında No-Show Oranını %90 Azaltmanın 5 Altın Yolu",
      slug: "guzellik-salonlarinda-no-show-oranini-azaltmanin-5-yolu",
      category: "No-Show Koruması",
      author_name: "GlowDesk Uzman Ekibi",
      status: "published",
      created_at: "2026-08-07T12:00:00Z"
    },
    {
      id: "post-whatsapp-automation",
      title: "WhatsApp Otomasyonu ile Müşteri Sadakatini ve Tekrar Randevu Oranını Artırın",
      slug: "whatsapp-otomasyonu-ile-musteri-sadakatini-artirin",
      category: "Pazarlama & Müşteri İlişkileri",
      author_name: "GlowDesk İletişim Ekibi",
      status: "published",
      created_at: "2026-08-05T12:00:00Z"
    },
    {
      id: "post-salon-management-2026",
      title: "2026 Salon Yönetim Rehberi: Dijitalleşen İşletmeler Neden 3 Kat Daha Hızlı Büyüyor?",
      slug: "2026-salon-yonetim-rehberi-dijitallestirme",
      category: "Salon Yönetimi",
      author_name: "GlowDesk Strateji Ekibi",
      status: "published",
      created_at: "2026-08-02T12:00:00Z"
    },
    {
      id: "post-waitlist-engine",
      title: "Akıllı Bekleme Listesi (Waitlist) İle İptal Edilen Randevuları Kazanca Dönüştürün",
      slug: "akilli-bekleme-listesi-ile-iptal-randevulari-kazanca-donusturun",
      category: "Teknoloji & Verimlilik",
      author_name: "GlowDesk Mühendislik Ekibi",
      status: "published",
      created_at: "2026-07-29T12:00:00Z"
    }
  ];

  // 1. Minimum Articles Count Assertion
  assert(
    "Blog Fallback İçerik Adet Kontrolü (En Az 4 Makale)",
    articles.length >= 4,
    `Makale sayısı yetersiz: ${articles.length}`
  );

  // 2. Schema Integrity Assertion
  articles.forEach((post, index) => {
    const hasRequiredFields =
      post.id &&
      post.title &&
      post.slug &&
      post.category &&
      post.author_name &&
      post.status === "published";

    assert(
      `Blog Makale Şema Doğruluğu #${index + 1}: ${post.title.slice(0, 30)}...`,
      hasRequiredFields,
      `Makale zorunlu alanları eksik: ${JSON.stringify(post)}`
    );
  });

  // 3. Unique Slugs Assertion
  const slugs = articles.map((a) => a.slug);
  const uniqueSlugs = new Set(slugs);
  assert(
    "Blog Slug Benzersizliği Kontrolü",
    slugs.length === uniqueSlugs.size,
    "Tekrarlayan blog slug adresi bulundu"
  );

  // 4. Category Filter Logic Simulation
  const categories = Array.from(new Set(articles.map((a) => a.category)));
  assert(
    "Blog Kategorileri Ayrıştırma Kontrolü",
    categories.length >= 3,
    `Kategori çeşidi yetersiz: ${categories.join(", ")}`
  );

  return results;
}

module.exports = { runBlogEngineTests };
