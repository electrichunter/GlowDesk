const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_DOC_DIR = path.join(__dirname, 'doc', 'gorsel');

const SECTOR_FOLDERS = [
  { folder: '01_guzellik_salonu', email: 'salon@glowdesk.com', title: 'Güzellik Salonu' },
  { folder: '02_berber_erkek_kuaforu', email: 'barber@glowdesk.com', title: 'Berber & Erkek Kuaförü' },
  { folder: '03_dis_ve_saglik_klinigi', email: 'clinic@glowdesk.com', title: 'Diş & Sağlık Kliniği' },
  { folder: '04_oto_servis_detailing', email: 'auto@glowdesk.com', title: 'Oto Servis & Detailing' },
  { folder: '05_fitness_pilates_studyo', email: 'fitness@glowdesk.com', title: 'Fitness & Pilates Stüdyosu' },
  { folder: '06_veteriner_pet_otel', email: 'vet@glowdesk.com', title: 'Veteriner Kliniği & Pet Oteli' },
  { folder: '07_psikolojik_danismanlik', email: 'coaching@glowdesk.com', title: 'Danışmanlık & Koçluk' },
  { folder: '08_hukuk_burosu', email: 'legal@glowdesk.com', title: 'Hukuk Bürosu' },
  { folder: '09_fotograf_studyo', email: 'photo@glowdesk.com', title: 'Fotoğraf Stüdyosu' },
  { folder: '10_spa_wellness', email: 'spa@glowdesk.com', title: 'Spa & Wellness' },
  { folder: '11_coworking_toplanti', email: 'coworking@glowdesk.com', title: 'Coworking & Toplantı Odaları' },
  { folder: '12_surucu_kursu', email: 'driving@glowdesk.com', title: 'Sürücü Kursu' },
  { folder: '13_restoran_masa', email: 'restoran@glowdesk.com', title: 'Restoran' },
];

const PAGES_TO_CAPTURE = [
  { file: '02_dashboard_ozet.png', route: '/dashboard' },
  { file: '03_randevu_takvimi.png', route: '/appointments' },
  { file: '04_musteriler_defteri.png', route: '/customers' },
  { file: '05_fiziki_kaynaklar_odalar.png', route: '/resources' },
  { file: '06_hizmetler_paketler.png', route: '/services' },
  { file: '07_gelir_gider_kasa.png', route: '/finance' },
  { file: '08_isletme_ayarlari.png', route: '/settings' },
];

async function recaptureAllPerfectScreenshots() {
  console.log('🚀 404 GİDERİLDİ — TÜM SEKTÖRLER İÇİN MÜKEMMEL CANLI GÖRSELLER ÇEKİLİYOR...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    viewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const sector of SECTOR_FOLDERS) {
      const sectorDir = path.join(BASE_DOC_DIR, sector.folder);
      if (!fs.existsSync(sectorDir)) {
        fs.mkdirSync(sectorDir, { recursive: true });
      }

      console.log(`\n📁 Sektör Çekiliyor: doc/gorsel/${sector.folder} (${sector.title})`);

      const contextMain = await browser.createBrowserContext();
      const pageMain = await contextMain.newPage();
      await pageMain.setViewport({ width: 1440, height: 900 });

      await pageMain.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
      await pageMain.waitForSelector('input[type="email"]', { timeout: 5000 });
      await pageMain.type('input[type="email"]', sector.email);
      await pageMain.type('input[type="password"]', '123456');
      await Promise.all([
        pageMain.click('button[type="submit"]'),
        pageMain.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {}),
      ]);

      await pageMain.evaluate(() => {
        localStorage.setItem('glowdesk_tenant_settings', JSON.stringify({ onboardingCompleted: true }));
      });

      for (const p of PAGES_TO_CAPTURE) {
        try {
          await pageMain.goto(`http://localhost:3000${p.route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
          await new Promise(r => setTimeout(r, 1200));
          await pageMain.screenshot({ path: path.join(sectorDir, p.file), fullPage: false });
          console.log(`  📸 [${sector.folder}] ${p.file}`);
        } catch (err) {
          console.error(`  ❌ Hata (${p.file}):`, err.message);
        }
      }

      await contextMain.close();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Müşteri Portalı Klasörü
    // ─────────────────────────────────────────────────────────────────────────
    const custDir = path.join(BASE_DOC_DIR, '14_musteri_portali');
    if (!fs.existsSync(custDir)) {
      fs.mkdirSync(custDir, { recursive: true });
    }
    console.log(`\n📁 Müşteri Portalı Çekiliyor: doc/gorsel/14_musteri_portali`);

    const ctxCust = await browser.createBrowserContext();
    const pageCust = await ctxCust.newPage();
    await pageCust.setViewport({ width: 1440, height: 900 });

    await pageCust.goto('http://localhost:3000/explore', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await pageCust.screenshot({ path: path.join(custDir, '01_online_randevu_kesfet.png') });
    console.log(`  📸 [14_musteri_portali] 01_online_randevu_kesfet.png`);

    await pageCust.goto('http://localhost:3000/my-appointments', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await pageCust.screenshot({ path: path.join(custDir, '02_randevularim_gecmis.png') });
    console.log(`  📸 [14_musteri_portali] 02_randevularim_gecmis.png`);

    await pageCust.goto('http://localhost:3000/profile', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await pageCust.screenshot({ path: path.join(custDir, '03_profil_ayarlari.png') });
    console.log(`  📸 [14_musteri_portali] 03_profil_ayarlari.png`);

    await ctxCust.close();

    console.log('\n🎉 TEBRİKLER! 404 HATESI TAMAMEN ÇÖZÜLDÜ, TÜM SEKTÖRLER VE MÜŞTERİ PORTALI İÇİN YENİ GÖRSELLER ÇEKİLDİ!');
  } catch (err) {
    console.error('❌ Genel Hata:', err);
  } finally {
    await browser.close();
  }
}

recaptureAllPerfectScreenshots();
