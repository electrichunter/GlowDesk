const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.join(__dirname, 'doc', 'gorsel');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const SECTOR_ACCOUNTS = [
  { file: '01_guzellik_salonu_dashboard.png', email: 'salon@glowdesk.com', title: 'Güzellik Salonu Dashboard' },
  { file: '02_berber_erkek_kuaforu_dashboard.png', email: 'barber@glowdesk.com', title: 'Berber Dashboard' },
  { file: '03_dis_ve_saglik_klinigi_dashboard.png', email: 'clinic@glowdesk.com', title: 'Diş Kliniği Dashboard' },
  { file: '04_oto_servis_detailing_dashboard.png', email: 'auto@glowdesk.com', title: 'Oto Servis Dashboard' },
  { file: '05_fitness_pilates_studyo_dashboard.png', email: 'fitness@glowdesk.com', title: 'Fitness Stüdyo Dashboard' },
  { file: '06_veteriner_pet_otel_dashboard.png', email: 'vet@glowdesk.com', title: 'Veteriner & Pet Otel Dashboard' },
  { file: '07_psikolojik_danismanlik_dashboard.png', email: 'coaching@glowdesk.com', title: 'Danışmanlık Dashboard' },
  { file: '08_hukuk_burosu_dashboard.png', email: 'legal@glowdesk.com', title: 'Hukuk Bürosu Dashboard' },
  { file: '09_fotograf_studyo_dashboard.png', email: 'photo@glowdesk.com', title: 'Fotoğraf Stüdyosu Dashboard' },
  { file: '10_spa_wellness_dashboard.png', email: 'spa@glowdesk.com', title: 'Spa & Wellness Dashboard' },
  { file: '11_coworking_toplanti_dashboard.png', email: 'coworking@glowdesk.com', title: 'Coworking Dashboard' },
  { file: '12_surucu_kursu_dashboard.png', email: 'driving@glowdesk.com', title: 'Sürücü Kursu Dashboard' },
  { file: '13_restoran_masa_dashboard.png', email: 'restoran@glowdesk.com', title: 'Restoran Dashboard' },
];

async function captureAllOnboardingAndDashboards() {
  console.log('🚀 Chrome başlatılıyor — Onboarding aşamaları ve temiz dashboard görselleri alınıyor...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    viewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // FAZ 1: Onboarding Kurulum Aşamalarının Ekran Görüntüleri
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📋 Onboarding Kurulum Aşamaları Çekiliyor...');
    const context1 = await browser.createBrowserContext();
    const page1 = await context1.newPage();
    await page1.setViewport({ width: 1440, height: 900 });

    await page1.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page1.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page1.type('input[type="email"]', 'salon@glowdesk.com');
    await page1.type('input[type="password"]', '123456');
    await Promise.all([
      page1.click('button[type="submit"]'),
      page1.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
    ]);

    // Go to dashboard (Onboarding modal will trigger)
    await page1.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));

    // Aşama 1: İşletme Bilgileri
    await page1.screenshot({ path: path.join(OUTPUT_DIR, 'onboarding_adim_1_isletme_bilgileri.png') });
    console.log('📸 ÇEKİLDİ: onboarding_adim_1_isletme_bilgileri.png (Aşama 1)');

    // Click İleri -> Aşama 2
    const nextBtn1 = await page1.$('button:has-text("İleri →")').catch(() => null);
    if (nextBtn1) {
      await nextBtn1.click();
    } else {
      // Fallback click on primary button in modal
      const btns = await page1.$$('button');
      for (const btn of btns) {
        const text = await page1.evaluate(el => el.textContent, btn);
        if (text && text.includes('İleri')) {
          await btn.click();
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page1.screenshot({ path: path.join(OUTPUT_DIR, 'onboarding_adim_2_hizmetler.png') });
    console.log('📸 ÇEKİLDİ: onboarding_adim_2_hizmetler.png (Aşama 2)');

    // Click İleri -> Aşama 3
    const btns2 = await page1.$$('button');
    for (const btn of btns2) {
      const text = await page1.evaluate(el => el.textContent, btn);
      if (text && text.includes('İleri')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await page1.screenshot({ path: path.join(OUTPUT_DIR, 'onboarding_adim_3_calisma_saatleri.png') });
    console.log('📸 ÇEKİLDİ: onboarding_adim_3_calisma_saatleri.png (Aşama 3)');

    await context1.close();

    // ─────────────────────────────────────────────────────────────────────────
    // FAZ 2: Temiz, Onboarding Tamamlanmış Canlı Dashboard Görselleri (13 Sektör)
    // ─────────────────────────────────────────────────────────────────────────
    for (const acc of SECTOR_ACCOUNTS) {
      console.log(`🔑 Sektör Çekiliyor: ${acc.email} (${acc.title})...`);

      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setViewport({ width: 1440, height: 900 });

      await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.type('input[type="email"]', acc.email);
      await page.type('input[type="password"]', '123456');

      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
      ]);

      // Set onboardingCompleted: true in localStorage so dashboard is clean
      await page.evaluate(() => {
        localStorage.setItem('glowdesk_tenant_settings', JSON.stringify({ onboardingCompleted: true }));
      });

      await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1500));

      const outPath = path.join(OUTPUT_DIR, acc.file);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`📸 CANLI DOKUNULMAMIŞ DASHBOARD ÇEKİLDİ: ${acc.file}`);

      await context.close();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FAZ 3: Pet Otel & Sektörel Kaynaklar, Müşteri Portalı
    // ─────────────────────────────────────────────────────────────────────────
    // 14. Pet Otel & Odalar / Resources
    console.log('🏨 Pet Otel Odaları & Kaynaklar Sayfası Çekiliyor...');
    const ctxRes = await browser.createBrowserContext();
    const pageRes = await ctxRes.newPage();
    await pageRes.setViewport({ width: 1440, height: 900 });
    await pageRes.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await pageRes.waitForSelector('input[type="email"]', { timeout: 5000 });
    await pageRes.type('input[type="email"]', 'vet@glowdesk.com');
    await pageRes.type('input[type="password"]', '123456');
    await Promise.all([
      pageRes.click('button[type="submit"]'),
      pageRes.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
    ]);
    await pageRes.evaluate(() => {
      localStorage.setItem('glowdesk_tenant_settings', JSON.stringify({ onboardingCompleted: true }));
    });
    await pageRes.goto('http://localhost:3000/resources', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await pageRes.screenshot({ path: path.join(OUTPUT_DIR, '14_pet_otel_odalar_kaynaklar.png') });
    console.log('📸 ÇEKİLDİ: 14_pet_otel_odalar_kaynaklar.png');
    await ctxRes.close();

    // 15. Müşteri Portalı — Explore
    console.log('🔍 Müşteri Portalı (Explore & Online Randevu) Çekiliyor...');
    const ctxExp = await browser.createBrowserContext();
    const pageExp = await ctxExp.newPage();
    await pageExp.setViewport({ width: 1440, height: 900 });
    await pageExp.goto('http://localhost:3000/explore', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await pageExp.screenshot({ path: path.join(OUTPUT_DIR, '15_musteri_online_randevu_kesfet.png') });
    console.log('📸 ÇEKİLDİ: 15_musteri_online_randevu_kesfet.png');
    await ctxExp.close();

    // 16. Müşteri Portalı — Randevularım
    console.log('📋 Müşteri Portalı (Randevularım) Çekiliyor...');
    const ctxApt = await browser.createBrowserContext();
    const pageApt = await ctxApt.newPage();
    await pageApt.setViewport({ width: 1440, height: 900 });
    await pageApt.goto('http://localhost:3000/my-appointments', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await pageApt.screenshot({ path: path.join(OUTPUT_DIR, '16_musteri_randevularim.png') });
    console.log('📸 ÇEKİLDİ: 16_musteri_randevularim.png');
    await ctxApt.close();

    // 17. Müşteri Portalı — Profil Ayarları
    console.log('👤 Müşteri Portalı (Profil Ayarları) Çekiliyor...');
    const ctxProf = await browser.createBrowserContext();
    const pageProf = await ctxProf.newPage();
    await pageProf.setViewport({ width: 1440, height: 900 });
    await pageProf.goto('http://localhost:3000/profile', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await pageProf.screenshot({ path: path.join(OUTPUT_DIR, '17_musteri_profil_ayarlari.png') });
    console.log('📸 ÇEKİLDİ: 17_musteri_profil_ayarlari.png');
    await ctxProf.close();

    console.log('✅ HEM ONBOARDING ADIMLARI HEM DE TEMİZ DASHBOARD SONUÇ GÖRSELLERİ TAMAMLANDI!');
  } catch (err) {
    console.error('❌ Hata:', err);
  } finally {
    await browser.close();
  }
}

captureAllOnboardingAndDashboards();
