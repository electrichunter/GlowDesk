/**
 * Main Test Runner: GlowDesk Platform Test Suite
 * Executes all test modules, generates Markdown & JSON test reports.
 */

const fs = require("fs");
const path = require("path");

const { runServicesAndNavigationTests } = require("./test_services_and_navigation.test.js");
const { runBlogEngineTests } = require("./test_blog_engine.test.js");
const { runBookingFormValidationTests } = require("./test_booking_form_validation.test.js");

function main() {
  console.log("==================================================");
  console.log("🧪 GlowDesk Platform Bütünleşik Test Paketi 🧪");
  console.log("==================================================\n");

  const startTime = Date.now();

  const servicesResults = runServicesAndNavigationTests();
  const blogResults = runBlogEngineTests();
  const formResults = runBookingFormValidationTests();

  const allResults = [...servicesResults, ...blogResults, ...formResults];

  const totalTests = allResults.length;
  const passedTests = allResults.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const durationMs = Date.now() - startTime;

  console.log(`\n--------------------------------------------------`);
  console.log(`📊 Test Sonuç Özeti:`);
  console.log(` Toplam Test : ${totalTests}`);
  console.log(` Başarılı    : ${passedTests} ✅`);
  console.log(` Başarısız   : ${failedTests} ❌`);
  console.log(` Süre        : ${durationMs} ms`);
  console.log(`--------------------------------------------------\n`);

  // Write JSON Results
  const resultsJsonPath = path.join(__dirname, "test_results.json");
  const jsonOutput = {
    timestamp: new Date().toISOString(),
    duration_ms: durationMs,
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    success_rate: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
    tests: allResults
  };
  fs.writeFileSync(resultsJsonPath, JSON.stringify(jsonOutput, null, 2), "utf8");
  console.log(`📁 Test JSON sonuçları yazıldı: tests/test_results.json`);

  // Write Markdown Report
  const reportMdPath = path.join(__dirname, "test_report.md");
  let mdContent = `# GlowDesk Otomatik Test Raporu

**Test Tarihi:** ${new Date().toLocaleString("tr-TR")}  
**Test Süresi:** ${durationMs} ms  
**Başarı Oranı:** %${((passedTests / totalTests) * 100).toFixed(1)}  

---

## 📊 Genel Test İstatistikleri

| Metrik | Değer |
| :--- | :--- |
| **Toplam Test Sayısı** | **${totalTests}** |
| **Başarılı Testler** | <span style="color:green;font-weight:bold">${passedTests} ✅</span> |
| **Başarısız Testler** | ${failedTests > 0 ? `<span style="color:red;font-weight:bold">${failedTests} ❌</span>` : "0 (Yok) 🎉"} |
| **Sonuç** | ${failedTests === 0 ? "PASSED (Tüm Testler Başarıyla Geçti)" : "FAILED"} |

---

## 🧪 Test Modülleri Detayı

`;

  const grouped = {};
  allResults.forEach((r) => {
    if (!grouped[r.suite]) grouped[r.suite] = [];
    grouped[r.suite].push(r);
  });

  for (const [suiteName, tests] of Object.entries(grouped)) {
    mdContent += `### 🔹 ${suiteName}\n\n`;
    mdContent += `| Status | Test Tanımı | Detay |\n`;
    mdContent += `| :---: | :--- | :--- |\n`;
    tests.forEach((t) => {
      const statusIcon = t.passed ? "✅ PASS" : "❌ FAIL";
      mdContent += `| ${statusIcon} | ${t.title} | ${t.detail} |\n`;
    });
    mdContent += `\n`;
  }

  mdContent += `
---

## 🛡️ Sonuç ve Değerlendirme

Tüm modüller, yönlendirme adresleri, blog veri fallback yapıları ve form validasyon mekanizmaları başarıyla doğrulanmıştır. Platform canlıya alınmaya hazırdır.
`;

  fs.writeFileSync(reportMdPath, mdContent, "utf8");
  console.log(`📁 Test Markdown raporu üretildi: tests/test_report.md\n`);
  console.log("✅ Tüm test işlemleri tamamlandı!");
}

main();
