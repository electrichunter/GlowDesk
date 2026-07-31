# GlowDesk Geliştirme, Mimari ve Tasarım Kuralları

## 1. Karar Hiyerarşisi
Birbiriyle çelişen optimizasyon kararları gerektiğinde, aşağıdaki sıralama tavizsiz uygulanacaktır:
**Erişilebilirlik (A11y) > Doğruluk (Correctness) > Güvenlik > Performans > Animasyon > Geliştirici Deneyimi (DX)**
*Neden:* Klavye erişimi ve işlevsellik, görsel şölenlerden ve kodu yazan kişinin rahatlığından her zaman daha kritiktir.

## 2. Ölçülebilir Performans Bütçeleri
Tüm kod üretimleri aşağıdaki Web Vitals ve performans sınırlarına uygun optimize edilecektir:
- **Web Vitals:** TTI < 3.5s (3G mobil), LCP < 2.5s, INP < 200ms, CLS < 0.1.
- **JS Bundle Bütçesi:** İlk yüklemede < 200 kB (sıkıştırılmamış). Aşılırsa alternatif paketler aranacaktır.
- **Font Yükleme:** `font-display: swap` zorunludur. Kritik fontlar için subset ve preload uygulanacaktır. *Neden:* Metnin anında görünür olmasını sağlayarak CLS ve LCP'yi korumak için.
- **Görsel Medya:** `<img>` etiketi yerine `next/image` kullanılacak. `placeholder="blur"`, `loading="lazy"` ve ekranın üst kısmındaki (above the fold) görseller için `priority` etiketleri stratejik olarak atanacaktır.

## 3. Deterministik Karar Eşikleri
Sistem durumlarına göre arayüzün vereceği tepkiler rastgele olamaz. Kesin eşikler:
- **Koleksiyon/Liste:** 100'den fazla öğe listeleniyorsa DOM şişmesini önlemek için `react-virtual` / `react-window` ile sanallaştırma (virtualization) uygulanacaktır.
- **Filtre/Kontrol:** Bir görünümde 6'dan fazla filtre varsa, Kademeli İfşa (Progressive Disclosure) uygulanacak ve geri kalanı "Gelişmiş" paneline taşınacaktır.
- **Ağ Gecikmesi:** 300 ms'den uzun süren veri isteklerinde Skeleton ekran gösterilecektir. 200 ms'den kısa süren isteklerde Skeleton gösterilmeyecek, ani yanıp sönme (flicker) engellenecektir.
- **Hata Toleransı:** Kullanıcı aynı işlemde 3 kez ardışık hata alırsa, sistem alternatif bir akış (örn. "Farklı bir yöntem dene" butonu) sunacaktır.
- **Debounce/Throttle:** Arama girişleri kesin olarak 300 ms, scroll/resize olayları ise 150 ms debounce edilecektir.

## 4. Next.js & React Mimari Kuralları
Modern React/Next.js ekosisteminin kuralları arayüze doğrudan entegre edilecektir:
- **RSC (React Server Components):** Veri çekme işlemleri istisnasız sunucu bileşenlerinde yapılacak, client bileşenler yalnızca etkileşim (click, state) için ayrılacaktır.
- **İş Mantığı İzolasyonu:** Bileşenler sadece prop alıp render etmelidir. Supabase veya dış API'lerden veri çeken bileşenler ile UI çizen bileşenler ayrılacaktır.
- **Server Actions & Optimistic UI:** Form gönderimleri için Server Actions tercih edilecek ve arayüz anında güncellenerek (İyimser UI) API hatasında sessizce geri alma (rollback) uygulanacaktır.
- **Memory Leak ve Cleanup:** `useEffect` içindeki tüm asenkron fetch işlemleri `AbortController` ile iptal edilecek, component unmount olduğunda cleanup zorunlu tutulacaktır.
- **Error Boundary Hiyerarşisi:** Sayfa, layout ve bağımsız widget'lar kendi Error Boundary'leri ile sarmalanacaktır. *Neden:* Kısmi bir hata durumunda sayfanın çökmesini engellemek için.
- **Request Deduplication:** Aynı veriyi hedefleyen eşzamanlı istekler SWR veya React Query ile tekilleştirilecektir.

## 5. Anti-Steril Tasarım ve "İnsan Dokunuşu" (Organik UI)
Yapay zeka varsayılanları yasaktır. Arayüz "işlenmiş derinlik" hissi vermelidir:
- **Alt Tonlu Griler (Tinted Neutrals):** Saf gri (`#808080`, `#ccc`) yasaktır. Tüm griler, projenin ana rengine hafifçe doyurulmuş (tinted) sıcak veya soğuk alt tonlara sahip olacaktır. *Neden:* Doğada saf gri yoktur, renk yansımaları bütünsellik katar.
- **Katmanlı Gölgelendirme (Layered Shadows):** Tek satırlık basit gölge (box-shadow) yasaktır. Gerçekçi alan derinliği için en az 3 katmanlı, yumuşak (smooth) gölge fonksiyonları yazılacaktır.
- **Gerçekçi Animasyon Fiziği (Spring Physics):** Varsayılan ease veya linear geçişleri yasaktır. Hareketler kütle ve sürtünmeyi simüle eden özel cubic-bezier veya spring tabanlı animasyonlarla kurgulanacaktır.
- **Sub-Pixel Kenarlıklar (Inset Borders):** Koyu temalarda derinlik yaratmak için elementin üst kısmına çok düşük opasiteli inset box-shadow eklenecektir. *Neden:* Üstten vuran ışığın köşedeki parlamasını taklit etmek için.
- **Mikro-Gürültü (Subtle Texture):** Tamamen pürüzsüz vektörel arka planlar yerine, sadece gerektiğinde (Hero alanı vb.) %2-%4 arası saydamlıkta SVG gürültü (noise) veya bulanık gradient mesh eklenecektir.
- **Asimetrik Izgara (Bento Box):** Mükemmel simetrik kartlar yerine odak noktalarını dağıtan asimetrik ağırlıklı (span) düzenler kullanılacaktır.

## 6. Düzen, Tipografi ve Alan Yönetimi
- **8-pt Grid Sistemi:** Tüm margin, padding, genişlik ve yükseklik değerleri 8'in katları olmalıdır.
- **Fitts Yasası:** Tüm tıklanabilir alanlar minimum 44x44px boyutunda olmalıdır.
- **Optik Tipografik Hizalama:** Başlıklar negatif harf aralığına (`-0.02em`), tamamen büyük harfli etiketler ise pozitif (`0.05em`) aralığa sahip olacaktır. *Neden:* Büyük puntolardaki varsayılan boşluklar amatör hissettirir.
- **Akışkan Tipografi:** Fontlar breakpoint'lerde sert sıçrama yapmayacak, `clamp()` kullanılarak viewport genişliğine göre orantılı ölçeklenecektir.
- **İç İçe Geçme Matematiği:** Border-radius değerleri `Dış Yarıçap - Padding = İç Yarıçap` formülüne göre hesaplanacaktır.

## 7. Uzman Düzey Erişilebilirlik (A11y)
- **Klavye Odağı Hapsi (Focus Trap):** Açılan modallar kapanana kadar klavye odağı arkadaki sayfaya geçemez. İşlem Esc ile iptal edilebilmelidir.
- **Azaltılmış Hareket (Reduced Motion):** `prefers-reduced-motion` aktifse tüm kompleks animasyonlar derhal devre dışı bırakılacaktır.
- **Aria Etiketleri:** Sadece ikondan oluşan tüm butonlara `aria-label` zorunludur. Ekranda sessizce güncellenen anlık veriler için `aria-live="polite"` eklenecektir.
- **Bağlamsal Bellek ve Öngörücü UX:** Kullanıcının `localStorage` verisi veya mantıksal varsayılanlar ile form alanları önceden doldurulacaktır. Sekmeler arası (Cross-tab) oturum anında senkronize edilecektir.

## 8. Tasarım Sistemi ve Kurallar
- **Görsel Hiyerarşi:** Ekranda tek bir "Primary" eylem butonu bulunmalıdır. Diğerleri ikincil (secondary/ghost) tasarlanacaktır.
- **Tokenizasyon:** Renkler, boşluklar, fontlar ve z-index değerleri (örn: dropdown: 100) sabit değer (hard-coded) olarak değil, CSS değişkenleri/design token olarak tanımlanacaktır.
- **Semantik HTML:** Yapı salt `<div>` ile değil; `<nav>`, `<main>`, `<section>`, `<article>` kullanılarak kurulacaktır.
