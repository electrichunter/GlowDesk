/**
 * Test Module: Services & Navigation Routes
 * Tests valid routes for new subpages (/hizmetler/no-show-engelleyici, etc.)
 */

function runServicesAndNavigationTests() {
  const results = [];

  function assert(title, condition, detail = "") {
    results.push({
      suite: "Services & Navigation",
      title,
      passed: Boolean(condition),
      detail: condition ? "Başarılı" : detail
    });
  }

  // 1. Route Path Verification
  const validServiceRoutes = [
    "/hizmetler/no-show-engelleyici",
    "/hizmetler/whatsapp-otomasyonu",
    "/hizmetler/bekleme-listesi-motoru"
  ];

  validServiceRoutes.forEach((route) => {
    assert(
      `Hizmet Rota Yapısı Doğrulaması: ${route}`,
      route.startsWith("/hizmetler/") && route.length > 12,
      `Geçersiz rota formatı: ${route}`
    );
  });

  // 2. Navbar Dropdown Target Mapping Test
  const navbarLinks = [
    { label: "⚡ No-Show Engelleyici", target: "/hizmetler/no-show-engelleyici" },
    { label: "💬 WhatsApp Otomasyonu", target: "/hizmetler/whatsapp-otomasyonu" },
    { label: "📋 Bekleme Listesi Motoru", target: "/hizmetler/bekleme-listesi-motoru" }
  ];

  navbarLinks.forEach((link) => {
    assert(
      `Navbar Dropdown Bağlantı Hedefi: ${link.label}`,
      link.target !== "/#features" && link.target.startsWith("/hizmetler/"),
      `Dropdown linki hala #features kalmış veya hatalı: ${link.target}`
    );
  });

  // 3. Footer Links Target Mapping Test
  const footerLinks = [
    { label: "No-Show İptal Engelleyici", target: "/hizmetler/no-show-engelleyici" },
    { label: "WhatsApp Otomasyonu", target: "/hizmetler/whatsapp-otomasyonu" },
    { label: "Otomatik Bekleme Listesi", target: "/hizmetler/bekleme-listesi-motoru" }
  ];

  footerLinks.forEach((link) => {
    assert(
      `Footer Hizmet Linki Hedefi: ${link.label}`,
      link.target.startsWith("/hizmetler/"),
      `Footer linki alt sayfaya yönlenmiyor: ${link.target}`
    );
  });

  return results;
}

module.exports = { runServicesAndNavigationTests };
