# GlowDesk Sektör Analizleri ve Ürün Stratejileri Önerileri

## 1. Özel Sağlık Klinikleri (Diş, Fizik Tedavi, Dermatoloji, Psikiyatri)

### Problem Tespiti
- **Senkronizasyon felci:** Resepsiyonun hasta, hekim takvimi, görüntüleme cihazı (MR, röntgen) ve operasyon odası gibi 4 farklı kaynağı manuel eşleştirmeye çalışması. Çakışma ve atıl kapasite kaçınılmazdır.
- **Klinik iş akışı kopukluğu:** Hasta geldiğinde dosyasının bulunamaması, geçmiş tetkiklerin dijital olmaması ve anamnez formunun her seferinde kağıtla toplanması, hekimin hasta başında geçirdiği değerli saniyeleri çalar.

### Kritik Modüller (Radikal Kolaylaştırıcılar)
- **Akıllı Kaynak Blok Zinciri (Smart Resource Orchestrator):** Hekim için `time_slot` tablosu, cihaz için `asset_availability` tablosu, oda için `room_schedule` tablosu. Bir "dolgu" randevusu yaratırken sistem, `service_id` altında tanımlı `required_resources: [dentist_sk: "dr_x", device: "panoramic_xray", room: "op_3", assistant: "nurse_y"]` listesini atomik transaction içinde sorgulayıp eşzamanlı rezerve eder. Manuel çakışmayı sıfıra indirir.
- **Dinamik Akıllı Form Motoru (Smart Intake Engine):** Hastanın geldiği branşa, yaşına ve geçmiş tanısına göre `json_schema` ile tanımlı anamnez formları, bekleme salonunda tabletle doldurtulur. Formdaki alanlar (`al_cholestorol_level`, `pregnancy_status`) anlık olarak HL7/FHIR standardında bir Observation kaydına dönüşüp PACS/EHR sistemine yazılır. Hekimin ekranında hasta gelmeden önce risk işaretleri (kırmızı bayrak) belirir.
- **Protokol Bazlı Yeniden Çağırma (Protocol-Driven Recall):** `treatment_plan` tablosundaki "4 seans fizik tedavi" veya "6 aylık perio kontrolü" protokollerine bağlı, kalan seansları takip eden ve uygun zaman penceresi açıldığında otomatik SMS/WhatsApp hatırlatıcı gönderen motor. Sadece boşluğu doldurmaz, tedavi uyumunu (compliance) artırır.

### Hook Mekanizmaları (Vazgeçilmezlik)
- **Klinik Karar Destek Verisi (Data Lock-in):** Sistem, sadece randevuyu değil, hastanın tüm dijital dosyasını (formlar, ödeme geçmişi, doktor notları SOAP formatında) barındırır. Başka bir yazılıma geçiş, binlerce hastanın yapılandırılmış sağlık verisini manuel aktarmak anlamına gelir; bu imkansızdır.
- **Sabah Tetikleyicisi (Daily Huddle View):** Hekim her sabah paneli açtığında kişiselleştirilmiş "Bugünkü Özet" ile karşılaşır: "13:00'teki hastanız Ayşe Yılmaz'ın tansiyon değerleri son 3 ziyarette yükselme trendinde (grafik). Dün eklenen MR raporu beklemede. Onaylamanız gereken 2 reçete var." Bu, bir randevu listesi değil, bir klinik komuta merkezidir.

### B2B2C ve No-Show Çözümü
- **Depozitolu Akıllı Randevu:** Son kullanıcıya, randevu öncesi cüzdanına işleyen bir ön onay blokesi konur. "Randevuya gelirseniz iade edilecek, gelmezseniz kesilecek 250 TL provizyon" mesajı ile no-show oranı dramatik düşer. Ödeme, Stripe/PayTR üzerinden pre-auth ile yapılır, capture işlemi gelmeme durumunda otomatik tetiklenir.
- **Konum Bazlı Check-in:** Son kullanıcı kliniğin 200 metre yakınına geldiğinde uygulamadan push notification: "Hoşgeldiniz, check-in yapmak için tıklayın." Check-in yapınca resepsiyon uyarısı düşer, hasta içeri girmeden dosyası hazırdır. Bekleme süresi sıfırlanır.

### Monetizasyon Modeli
- **Hasta Kazanım Komisyonu:** Platformda çalışan "boş randevu" API'ı, anlaşmalı kurumsal şirketlerin çalışan yan hakları (wellness programı) uygulamalarına entegre edilir. Platformdan gelen her yeni hasta için klinikten %5-10 komisyon alınır.
- **Yapay Zeka Asistanı (Upsell):** Hekime, hastanın form ve geçmiş verilerine dayanarak muhtemel ek seans veya estetik talepleri öneren "Next Best Action" modülü aylık abonelikle satılır.

---

## 2. Oto Kuaför, Detailing & Hızlı Tamir Servisleri

### Problem Tespiti
- **Bayi Stok ve Kaynak Kördüğümleri:** Gelen araç için "20dk yıkama + 40dk pasta cila" işi tanımlanırken, ustanın müsaitliği ve pasta cila malzemesinin stokta olup olmadığı eşlenemez.
- **Fiyatlandırma Kaosu:** Aracın modeli, büyüklüğü (sedan/SUV) ve kirlilik derecesine göre fiyatın manuel belirlenmesi, müşteriyle tartışmaya ve güven kaybına yol açar.

### Kritik Modüller
- **Dinamik İş Emri & Bayi Kaynak Atama:** Bir `job_template` (örn: premium kuaför) altında `sub_tasks: [yıkama, vakum, cilalama, kurulama]` ve her alt görev için `duration`, `required_bay: true`, `required_skill: "detailing_lvl3"` tanımlıdır. Rezervasyon anında sistem, bu alt görevleri paralel veya seri olarak uygun baylere ve technicianlara otomatik atar, bitiş saati anlık hesaplanır.
- **Görsel Hasar Tespiti ve Fiyat Şelalesi:** Müşteri uygulamadan aracının plakasını okutup dış/interior fotoğraflarını yükler. Yapay zeka, boyut ve kirlilik skoru (`soil_score: 0.8`) çıkarır. Bu skor, `pricing_table`'daki bir matrise girer: `(sedan & soil_score>0.7) => base_price * 1.25`. Fiyat randevu gelmeden netleşir, sürtüşme biter.
- **Parça ve Sarf Malzeme Bağlantısı:** Her hizmet kalıbı bir `bill_of_materials` listesiyle ilişkilidir. Pasta cila servisi randevusu alındığında, sistem stoktan `sku: "compound_500ml"` miktarını düşer. Kritik stok seviyesinde `purchase_order` tetiklenir. Usta işe başlarken malzeme yoksa iş durmaz.

### Hook Mekanizmaları
- **Araç Sağlık Karnesi (Data Lock-in):** Sistem, plaka bazında aracın tüm geçmişini (hangi tarihte hangi cila yapıldı, ne zaman fren hidroliği değişti) `vehicle_health_record` tablosunda tutar. İşletme, bu geçmiş olmadan yeni bir araca proaktif "önümüzdeki ay balata değişimi gerekir" uyarısı satamaz.
- **Sabah Tetikleyicisi:** "Bay 2'deki lift'in yıllık bakımı bugün, 14:00'teki SUV randevusu öncesi yapılmalı." Şeklinde lojistik uyarı paneli. Aynı zamanda "Dün eksilen pasta cila için tedarikçi siparişi teslimata yaklaştı" bildirimi.

### B2B2C ve No-Show Çözümü
- **Canlı Takip Linki (Frictionless):** Müşteriye WhatsApp üzerinden gelen linkte, aracının hangi aşamada olduğunu (yıkama, cila, kurutma) progress bar olarak görür. "Tahmini bitiş: 15:10" ve "Aracınızı almak için yola çıkın" uyarısı alır. No-show oranı bu şeffaflıkla düşer, çünkü müşteri sürece bağlanır.
- **Temassız Teslimat:** Servis bittiğinde sistem müşteriye "Anahtarınız 7 nolu kilitli dolapta, kodu: 4456" SMS'i atar. Müşteri mesai sonrası bile aracını alabilir. Bu, işletmenin çalışma saatlerini sanal olarak uzatır.

### Monetizasyon Modeli
- **Parça ve Sarf Pazaryeri Komisyonu:** İşletmeler, entegre tedarikçi modülü üzerinden pasta cila, filtre vb. siparişi verdiğinde platforma %3-5 komisyon bırakır.
- **Dinamik Fiyatlandırma Modülü (Upsell):** Hava durumu API'ına bağlı olarak (yarın sağanak yağış var) "hydrofobik cam kaplama" ek hizmetini otomatik öneren ve fiyatı talep yoğunluğuna göre ayarlayan ek modül primli satılır.

---

## 3. Butik Fitness ve Yoga Stüdyoları

### Problem Tespiti
- **Kontenjan ve Ekipman Kaosu:** "Sıcak Yoga" dersinin 20 kişilik kontenjanı, mat ve havluların yetersiz olmasından bağımsız yönetilemez. Kayıt anında ekipman rezervasyonu yapılmazsa ders başında kaos çıkar.
- **Üye Sadakati ve Dondurma Yönetimi:** Üyelerin ders paketleri, dondurma talepleri, misafir hakları Excel'de takip edildiğinde hatalı paket düşümleri ve gelir sızıntısı olur.

### Kritik Modüller
- **Hibrit Kaynak Rezervasyon Çekirdeği:** Bir `class_slot` yaratırken, `virtual_capacity: 25` ve `physical_resources: [{item: "mat", qty: 25}, {item: "heart_rate_monitor", qty: 10}]` tanımlanır. Üye online'dan yer ayırttığında, fiziksel kaynaklar da atomik olarak rezerve edilir. "Mat tükendi" uyarısı verilip waitlist'e atar.
- **Esnek Kredi ve Üyelik Muhasebesi:** `member_ledger` çift taraflı kayıt tablosu. Her paket satın alımı credit (10'luk paket), her ders check-in'i debit (1 ders), dondurma işlemi ise `expiry_date`'i öteleyen bir adjustment transaction'ıdır. Herhangi bir andaki kredi bakiyesi anlık hesaplanır, mali denetim için tek gerçek kaynaktır.
- **Topluluk ve Gamification Duvarı:** Stüdyo içi bir sosyal akış. "Bugün 30 kişiyle enerji patlaması", "Ayşe 50. dersini tamamladı" gibi otomatik postlar. Check-in yapan üye puan kazanır, puanlarla bir sonraki ay %10 indirim veya misafir hakkı açar. Bu modül, Excel'in asla sağlayamayacağı duygusal bağı kurar.

### Hook Mekanizmaları
- **Biyometrik Check-in Bağımlılığı:** İşletme, girişte tabletten parmak izi veya yüz tanıma ile check-in yaptırır. Bu sistem, üyenin kredi defterine anlık işler. Başka yazılıma geçmek, tüm üyelerin biyometrik verisini silip yeni sistemde yeniden kaydetmek demektir; operasyonel intihar.
- **Sabah Tetikleyicisi:** Stüdyo sahibinin açılış ekranı: "Bugün 3 ders var. 09:30 Hatha Yoga'da 2 kişi waitlist'te, yan stüdyodaki 09:30 Pilates'te ise 4 boş yer var. Ayşe'ye Pilates önerisi SMS'i gönderilsin mi? [Tek Tıkla Gönder]". Bu bir yönetim asistanıdır, pasif liste değil.

### B2B2C ve No-Show Çözümü
- **Ceza-Kredi Döngüsü:** No-show yapan üyenin kredisinden otomatik 1 ders düşülür ve "Kredinizden düşüldü. Kaybettiğin krediyi geri kazanmak için yarınki derse katıl!" push'ı atılır. Yerine waitlist'ten bir başkası 15dk önce otomatik upgrade edilir.
- **Sosyal Kanıt ve Sıralama:** Uygulama, derse 3 saat kala "Bakın başka kimler geliyor?" bildirimi gönderir. Arkadaşını listede gören üye iptal etmekten vazgeçer.

### Monetizasyon Modeli
- **Kurumsal Wellness Paket Komisyonu:** Şirketlere özel bir dashboard ile çalışanlarının stüdyo kullanım raporları satılır. Şirketten alınan toplu ödemeden %10 platform komisyonu kesilir.
- **AI Kişisel Antrenör (Upsell):** Üyenin check-in geçmişine ve kalp atış verisine (giyilebilir entegrasyonu) bakarak, yapay zekanın kişiye özel ev egzersizleri ve beslenme önerileri oluşturduğu, stüdyonun kendi markasıyla son kullanıcıya satabileceği beyaz etiketli (white-label) bir mikro SaaS modülü.

---

## 4. Evcil Hayvan Grooming ve Veteriner Klinikleri

### Problem Tespiti
- **Irk ve Davranış Bazlı Süre Hesaplama:** İran kedisi ile Golden Retriever tıraş süresi aynı değildir. Manuel randevu defterinde "1 saat" standart slot açılır, Golden Retriever için süre yetmez, günün sonu kaosa döner.
- **Aşı ve Sağlık Kontrolü Eksikliği:** Grooming'e gelen köpeğin kuduz aşısı geçmişse, diğer hayvanları riske atar. Resepsiyon bunu manuel kontrol edemediği için salgın riski oluşur.

### Kritik Modüller
- **Irk-İşlem Matrisine Dayalı Dinamik Takvim:** `pet_profile` tablosunda `breed: "golden_retriever"`, `weight: 32kg`, `behavior_tag: "agresif_kurulama"` tutulur. `service_catalog`'da "Golden Retriever + Tıraş" işlemi için `base_duration: 90dk` ve `buffer_time: 15dk` tanımlıdır. Müşteri cinsi seçtiğinde takvim otomatik olarak uygun uzunluktaki slotları gösterir, kısa slotları griye boyar.
- **Dijital Aşı Kartı ve Karantina Kilidi:** Evcil hayvanın profilinde `vaccine_record` tablosu ve her aşı için `expiry_date` alanı bulunur. Grooming randevusu alınırken sistem `kuduz.expiry_date > appointment_date` sorgusu yapar; aşısız hayvan için ödeme sayfası açılmaz, "Lütfen önce aşıyı yenileyin" uyarısı verir. Veteriner klinikleriyle entegre aşı verisi çekilir.
- **İşlem Öncesi/Sonrası Medya Galerisi ve Notlar:** Groomer, işlem öncesi hayvanın durumunu (keçe, yara) fotoğraflayıp `grooming_session_log`'a ekler. İşlem sonrası çekilen fotoğraf otomatik olarak sahibine "Kuaförden çıktık 🐶" push'ıyla gider. Bu, işletmenin kendini olası "hayvanımı yaralamışsınız" suçlamalarından koruması için vazgeçilmez bir hukuki kanıttır.

### Hook Mekanizmaları
- **Sağlık ve Cins Verisinin Derinliği (Data Lock-in):** 5 yıllık aşı, kilo takibi, alerji notları ve cins bazlı tıraş deseni geçmişi sistemde birikir. Bu veriyi başka bir platforma taşımak imkansızdır; rakip sisteme geçişte tüm bu zengin profil kaybolur.
- **Sabah Tetikleyicisi:** "Bugün 3 agresif etiketli köpek var (Max, Buddy, Karabaş). Max için özel ağızlık gerekiyor, Buddy'nin sahibine sakinleştirici uygulandı mı sorulacak. Karabaş için çift kişi çalışılacak." Personel sabah iş bölümünü ve riskleri bu ekrandan görür, işe hazır başlar.

### B2B2C ve No-Show Çözümü
- **Ön Ödemeli Paket ve Sadakat:** 5'li grooming paketi satın alan son kullanıcı, %15 indirim kazanır ve randevu anında ek ödeme yapmaz. Paket bitmeden 1 işlem kala "Paketin bitiyor, aynı fiyattan yenilemek ister misin?" push'ı ile churn önlenir.
- **SMS ile Aşı Hatırlatma:** Son kullanıcının takvimine bir sonraki aşı tarihi otomatik kaydedilir. Bu, sadece kliniğin değil, evcil hayvan sahibinin de bağlı kaldığı bir döngüdür.

### Monetizasyon Modeli
- **Mama ve İlaç Aboneliği (Embedded Commerce):** Kilo ve ırk verisini kullanan sistem, "Max'in Royal Canin maması bitmek üzere, sepete eklensin mi?" önerisi yapar. Satın alımda platforma %8 komisyon.
- **Beyaz Etiketli Mobil Uygulama (Upsell):** Kliniğe kendi logosuyla bir mobil uygulama sunulur (üyelik kartı, dijital aşı karnesi, push mesajları). Aylık 99$'dan satılır.

---

## 5. Hukuk Büroları & Mali Müşavirlik Ofisleri

### Problem Tespiti
- **Faturalandırılabilir Süre Kaçağı:** Avukatın danışanla yaptığı telefon görüşmesi, dosya inceleme gibi randevu dışı zamanlar manuel kayıt altına alınamadığı için faturalandırılamaz. Ciro direkt kayıptır.
- **Dava ve Evrak Yaşam Döngüsü:** Danışan randevusu "boşanma davası" kapsamında bir kilometre taşıdır, ancak randevu sistemi, duruşma tarihi, tebligat son tarihleri ve müvekkil belge yükleme durumlarıyla ilişkilendirilmez.

### Kritik Modüller
- **Zaman Yakalayıcı ve Proje Bütçeleme Entegratörü:** Profesyonel, masaüstünde veya mobilde tek tıkla bir kronometre başlatır. "Müvekkil Ahmet Yılmaz - Dava No: 2024/123 - Telefon Görüşmesi" etiketiyle süre tutulur. Bu süre, `timesheet` tablosuna yazılır ve danışanın `retainer_balance` (avans bakiyesi) hesabından otomatik olarak saatlik ücret üzerinden düşülür. Bakiye %20'nin altına düşünce hem danışana hem avukata "avans yenileme" uyarısı gider.
- **Dosya Yaşam Döngüsü ve Randevu Bağlantısı:** Randevular, takvimde bağımsız değil, bir `legal_matter` üst objesine bağlıdır. "Duruşma" randevusu yaratıldığında, sistem otomatik olarak duruşmadan 7 gün önce "delil listesi sunma", 1 gün önce "dosya hazırlık kontrol listesi" alt görevlerini tetikler. Danışanın panelinde "Duruşmanıza 3 gün kaldı, eksik belgeniz: son 3 aylık banka dekontu" uyarısı belirir.
- **Güvenli İstemci Portalı ve e-İmza Entegrasyonu:** Randevu sonrası oluşturulan vekaletname veya sözleşme, danışanın uygulamasına anında düşer. Danışan e-Devlet/e-İmza ile onaylar. Belgeler `document_repository`'de zaman damgalı ve SHA-256 hash'li olarak saklanır. Bu, fiziksel imza için yeniden randevu alma ihtiyacını ortadan kaldırır.

### Hook Mekanizmaları
- **Güven Muhasebesi Defteri (Finansal Lock-in):** Sistem, müvekkil avansları, mahkeme masrafları ve ofis işletme hesabını ayrı `trust_account`'larda yönetir. Bu çift taraflı kayıt defteri, baro denetimlerinde anlık raporlama sağlar. Bir hukuk bürosunu bu defterden ayırmak, 5 yıllık mali denetim riskini almak demektir; imkansıza yakındır.
- **Sabah Tetikleyicisi:** Avukatın sabah karşılaştığı ekran: "Bugün 2 duruşmanız var. 10:00'deki duruşma için eksik delil yok. 14:00'teki Ahmet Yılmaz duruşması öncesi avans bakiyesi sıfırlanmış! Müvekkile otomatik ödeme linki gönderildi. Ayrıca bugün 4.2 saatlik faturalandırılabilir iş potansiyeliniz var." Bu bir ajanda değil, kişiselleştirilmiş icra asistanıdır.

### B2B2C ve No-Show Çözümü
- **Avans Blokesi ve İptal Politikası:** Son kullanıcı, randevu alırken kredi kartından bir avans tutarı (örneğin 1 saatlik ücret) blokeler. 24 saatten az kala iptalde bu tutar otomatik çekilir ve avukatın faturasına işlenir. Bu, "önemsiz danışanı" filtreler.
- **Online Check-in ve Bekleme Salonu:** Danışan, randevuya 5 dakika kala telefonuna gelen linkle avukata "hazırım" bildirimi gönderir. Avukat müsait olduğunda sanal bekleme odasından müvekkili video konferansa alır. Bekleme süresi danışanın faturalandırılabilir süresine yansımaz; şeffaflık sağlanır.

### Monetizasyon Modeli
- **e-İmza ve Saklama Kotası (Upsell):** Aylık 10 belgeye kadar ücretsiz e-imza, üzeri paket olarak satılır. Benzer şekilde, yasal saklama süreleri boyunca (10 yıl) yedekli arşiv depolama alanı GB başına fiyatlandırılır.
- **İcra ve Arabuluculuk API Entegrasyonu:** UYAP, UETS gibi devlet sistemleriyle entegrasyon premium modül olarak sunulur. Mahkeme duruşma tarihleri otomatik takvime çekilir, tebligatlar sisteme düşer. Bu modül olmadan ofis yarı manuel kalır, dolayısıyla alınması zorunludur.

---

## 6. Özel Ders ve Kariyer Danışmanlığı (1:1 Koçluk)

### Problem Tespiti
- **Gündem ve Ödev Takip Boşluğu:** Her dersin bağımsız bir olay olarak görülmesi. Bir önceki derste verilen ödevlerin, izlenen müfredat modülünün ve öğrencinin zayıf konularının, bir sonraki ders randevusuna yansımaması.
- **Esnek Paket ve Grup Dersi Çakışması:** Aynı eğitmenin hem birebir hem de grup dersi vermesi, farklı fiyatlandırma ve kontenjan yapıları tek bir takvimde yönetilemez.

### Kritik Modüller
- **Müfredat ve Hedef Takip Çarkı (Progress-Linked Booking):** Eğitmen, bir `learning_path` tanımlar (örn: "IELTS 7.0'a Hazırlık - 20 Saat"). Bu yol, `modules` dizisinden oluşur. Öğrenci randevu alırken sistem, bir sonraki işlenmemiş modülü otomatik seçer. Eğitmenin panelinde "Ahmet ile bugün Modül 5: Writing Task 2 yapılacak. Öğrencinin geçen haftaki deneme sınav skoru 6.0 (Grammar zayıf)" görünür. Bu, dersin verimini %40 artırır.
- **Akıllı Kredi ve Çoklu Ders Tipi Motoru:** `instructor_profile` altında iki farklı `service_entity` tanımlanabilir: `[1:1_45dk: 500TL, group_90dk: 300TL]`. Eğitmen tek bir takvim bloğunu "grup dersi" olarak açar ve `max_capacity: 12` verir. Aynı eğitmenin 1:1 dersleri, grup dersi slotlarıyla çakışmaz; çünkü sistem kapasite aşımını `service_type` bazında kontrol eder.
- **Entegre Sanal Sınıf ve Ders Kayıt Arşivi:** Rezervasyon onaylandığında otomatik bir Zoom/Google Meet linki oluşturulur ve `session_log`'a yazılır. Ders bittiğinde bulut kaydı, otomatik olarak öğrencinin "Geçmiş Dersler" arşivine, yapay zeka tarafından oluşturulmuş bir özet ve "izlenmesi gereken anlar" indeksiyle birlikte eklenir.

### Hook Mekanizmaları
- **Öğrenim Verisi Geçmişi (Data Lock-in):** Bir öğrencinin 40 saatlik IELTS hazırlık sürecindeki tüm ödevleri, deneme sınav sonuçları, eksik konu listesi ve ders kayıtları sistemdedir. Eğitmenin bu veriyi kaybetmesi, öğrenciye verdiği değerin %70'ini yok eder. Başka bir CRM'e geçmek pedagojik intihardır.
- **Sabah Tetikleyicisi:** Eğitmenin sabah ekranı: "Bugün 4 dersin var. 15:00'teki öğrencin Elif, dün gece Writing Task 2 ödevini yükledi (beklemede, puanlaman lazım). 17:00'teki grup dersine 2 kişi son anda kaydoldu, kontenjan 1 kişi kaldı." Eğitmen, yapay zekanın verdiği ön puanı görür ve derse hazırlıklı girer.

### B2B2C ve No-Show Çözümü
- **Ödevli Randevu (Frictionless Lock-in):** Son kullanıcı, bir sonraki randevuyu alabilmek için bir önceki dersin ödevini sisteme yüklemek zorundadır (eğitmen ayarına bağlı). Ödev yükleme, öğrencinin derse gelme motivasyonunu içselleştirir, no-show'u düşürür.
- **Kalan Kredi Uyarısı ve Otomatik Satın Alma:** Öğrencinin panelinde "2 ders krediniz kaldı, bu hafta %10 indirimle 5 kredi daha alın" fırsatı çıkar. Kredi bitince ders rezervasyonu bloke olmaz, ancak manuel ödeme ekranına yönlendirilir; bu sürtüşme anında paket satın alma oranını artırır.

### Monetizasyon Modeli
- **Eğitmen Havuzu ve Eşleştirme Komisyonu:** Platform, eğitmenlerin boş takvimlerini bir pazaryerinde listeler. Dışarıdan gelen öğrenci için yapılan her eşleştirmeden ilk paket tutarı üzerinden %15-20 komisyon.
- **Yapay Zeka ile Ödev Değerlendirme (Upsell):** Eğitmene, yüklenen essay ve speaking kayıtlarını otomatik puanlayıp detaylı geri bildirim raporu sunan premium modül. Eğitmen, bu raporu 1 dakikada gözden geçirip öğrenciye iletir; zamandan inanılmaz tasarruf sağlar.

---

## 7. Lüks Spa, Masaj ve Termal Tesisler

### Problem Tespiti
- **Rota ve Akış Yönetimi:** Müşteri 3 aşamalı bir paket alır: Sauna -> Vücut Maskesi -> Masaj. Bu istasyonlar arası geçiş süreleri ve görevli personel (masör, spa terapisti) eşleşmezse müşteri havluyla ortada kalır.
- **Cinsiyet ve Sağlık Kısıtları:** Hamam, sauna gibi ortak alanlarda kadın/erkek seansları vardır. Müşterinin tansiyon, hamilelik gibi durumları bazı uygulamalara engeldir. Manuel kontrol atlandığında sağlık riski doğar.

### Kritik Modüller
- **Termal Rota Planlayıcı (Journey Orchestrator):** Bir `spa_package` (örn: Detoks Paketi) içinde `stations: [ {name: "Fin Saunası", duration: 15, staff: null}, {name: "Köpük Masajı", duration: 30, staff: "masor_1", buffer: 5}, {name: "Dinlenme Odası", duration: 20} ]` tanımlıdır. Müşteri rezervasyon yaptığında sistem, bu istasyonları ardışık ve personel uygunluğuna göre 10:00-10:15 Sauna, 10:20-10:50 Masaj şeklinde çizelgeleyerek bir `journey_ticket` oluşturur.
- **Sağlık Kontrol Listesi ve Dinamik Kısıt Motoru:** Online check-in'de doldurulan formda `pregnant: true` seçilirse, sistem otomatik olarak aromaterapi ve sıcak taş masajı seçeneklerini griye boyar, sadece hamile masajını açar. Tesis içi tablette de personelin göreceği şekilde `alert: "Yüksek tansiyon, sauna önerilmez"` uyarısı kırmızı bant olarak belirir.
- **Sessiz İletişim ve Oda İçi Kontrol Butonu:** Müşterinin masaj odasında, dokunmatik ekrandan "Oda sıcaklığını artır", "Su isterim" gibi istekleri masöre bildirim olarak düşer. Seans biterken ekranda "Uzatma ister misin? (15dk - 300TL)" upsell'ı çıkar, tek tıkla ödeme alınır. Bu, kesintisiz bir rahatlama deneyimi sağlar.

### Hook Mekanizmaları
- **Müşteri Terapi Geçmişi ve Tercihleri:** Sistem, müşterinin sevdiği masaj yağından (lavanta), masör tercihinden (Ayşe Hanım), ideal oda sıcaklığına kadar tüm `preference_tags`'i tutar. İşletme, bu kişiselleştirme kabiliyeti olmadan 5 yıldızlı hizmet veremez hale gelir.
- **Sabah Tetikleyicisi:** "Bugün 12 müşteri var. Ahmet Bey'in doğum günü, hoş geldin şampanyası hazırlansın. Elif Hanım'ın geçen sefer bel ağrısı vardı, masör Ayşe'ye not iletildi. 14:00'teki çift masajı odası için gül yaprakları mutfağa sipariş düşüldü." Ekranı, tesisin duygusal zekasıdır.

### B2B2C ve No-Show Çözümü
- **Tam Ön Ödemeli Rezervasyon:** Lüks segmentte rezervasyon anında %100 ödeme alınır. İptal politikası: 48 saat kala %50 iade, 24 saat kala iade yok. Bu, son kullanıcıyı finansal olarak bağlar.
- **Dijital Detoks Başlatıcı:** Son kullanıcıya varışta "Telefonunuzu kasaya kilitleyip spa moduna geçin" diyen bir QR kod verilir. Akıllı saat entegrasyonu ile su içme hatırlatmaları ve geçiş süreleri (masaja 10dk kaldı) saate titreşimle gelir. Deneyim sürtünmesiz aktığı için no-show değil, "tekrar gelme" oranı artar.

### Monetizasyon Modeli
- **Perakende Entegrasyonu (Upsell):** Müşterinin çıkış anında "Bugün kullanılan Lavanta yağını satın al" önerisi. Platform, satılan her üründen komisyon alır.
- **Dinamik Fiyatlandırma ve Hediye Kartı:** Yoğun hafta sonları fiyatı otomatik %20 artıran modül primli. Kurumsal hediye kartı satışlarından platforma %10 komisyon.

---

## 8. Araç Lastik ve Mevsimsel Bakım Servisleri

### Problem Tespiti
- **Mevsimsel Sıkışma ve Stok:** Kış lastiği sezonunda 2 haftalık yoğunlukta santral kilitlenir. Müşteri, randevu alırken kendi aracına uygun lastik ebadının stokta olup olmadığını bilemez.
- **Depolama Lojistiği:** "Yaz lastiklerimi sizde saklayın" hizmeti Excel'le yönetilemez. Hangi lastiğin hangi müşteriye ait olduğu, raf numarası ve emanet fişi takibi karmaşası yaşanır.

### Kritik Modüller
- **Plaka Bazlı Stok Rezervasyon Motoru:** Müşteri uygulamada plakasını okutur. Sistem, aracın ruhsat bilgilerinden orijinal lastik ebatlarını (225/45 R17) çeker. `inventory` tablosunda bu ebattan kaç adet kış lastiği olduğunu (`available_qty: 4`) ve hangi rafta olduğunu gösterir. Müşteri randevuyu aldığı anda, o ebattan 4 adet stok rezerve edilir (`reserved_qty: 4`), satışa kapatılır. Bu, "geldim ama lastik yok" felaketini bitirir.
- **Emanet Depo Yönetim Sistemi (WMS Lite):** Her müşteriye özel bir `storage_bin` atanır ve karekod ile etiketlenir. Müşteri "saklansın" dediği an, sistem depodaki boş `bin`'i tahsis eder ve lastik giriş işlemi yapılır. Müşteri, uygulamasından "Lastiklerim 14-B rafında, durumu: iyi" bilgisini canlı görür. Mevsim değişiminde tek tıkla "Lastiklerimi değiştir" butonu, eski ve yeni takımın depo rotasyonunu otomatik planlar.
- **Sezon Öncesi Proaktif Kampanya Tetikleyici:** `vehicle_history` tablosunda geçen yıl kasım ayında kış lastiği takmış müşterilere, Eylül ayında "Erken randevu alana %10 indirim" kampanyası ile otomatik SMS gönderilir ve randevu sayfasına deep link verilir. Yoğunluk talebi zamana yayılır.

### Hook Mekanizmaları
- **Araç ve Depo Veri Bütünlüğü:** Müşterinin hangi marka/model lastik aldığı, kaç yıldır saklandığı, diş derinliği ölçümleri sistemdedir. Başka bir yere gitmek, bu garantili depo zincirini ve satın alma geçmişini bırakmak demektir.
- **Sabah Tetikleyicisi:** "Bugün 18 lastik değişim randevusu var. Stokta sadece 2 adet 205/55 R16 kaldı, 3 işlem sonrası tükenecek! Öğleden sonraki randevular için tedarikçiye acil sipariş oluşturuldu (Takip No: 4532). Ayrıca depoda 4 müşterinin lastiğini teslim alma zamanı geldi, iletişime geç."

### B2B2C ve No-Show Çözümü
- **Garantili Slot ve Bekleme Süresi Sayacı:** Son kullanıcıya randevu onayında "Max 45 dakikada lastikleriniz hazır" garantisi verilir. Usta işe başlayınca uygulamada bir kronometre başlar. Süre garantisi aşılırsa, sistem otomatik olarak bir sonraki hizmet için indirim kuponu tanımlar. Bu, güveni inşa eder ve no-show'u anlamsız kılar.
- **Temassız Anahtar Teslim Kutusu:** Müşteri mesai dışı aracı bırakıp anahtarı kilitli kutuya atar. Servis sabah kutudan alır, işlemi yapar, bitince anahtarı tekrar kutuya koyar ve müşteriye yeni şifre gider. Sürtünme sıfırdır.

### Monetizasyon Modeli
- **Lastik Tedarikçisi Entegrasyonu (Komisyon):** Servisin kendi stoğu yoksa, sistem anlaşmalı toptancıya otomatik sipariş geçer ve servise özel indirimli fiyattan satın alır. Platform, toptancıdan hacim bazlı komisyon alır.
- **Filo Yönetim Paneli (Upsell):** Kurumsal araç filosu olan şirketlere, tüm araçların lastik ömrü, mevsimsel değişim takvimi ve harcama raporlarını veren beyaz etiketli bir panel satılır.

---

## 9. Düğün ve Portre Fotoğrafçılığı Stüdyoları

### Problem Tespiti
- **Çekim İş Akışı ve İşlem Sonrası (Post-Prodüksiyon) Boşluğu:** Stüdyo dış mekan çekimi, stüdyo çekimi ve kurgu montaj teslimi gibi aşamaları manuel takip eder. Müşteriye "fotoğraflar ne zaman hazır" sorusunun cevabı net değildir.
- **Müşteri Seçim ve Onay Döngüsü:** Çekilen 2000 kare arasından müşterinin seçim yapması, fotoğrafçının da rötuşları teslim etmesi, e-mail ve WhatsApp karmaşasında kaybolur. Revizyon sayısı ve kapsamı net değildir.

### Kritik Modüller
- **İş Emri ve Post-Prodüksiyon Kanban Panosu:** Stüdyo sahibi `shoot_type: "düğün"` için bir proje şablonu oluşturur. Şablon `stages: [{"Pre-Production", due: -7 days}, {"Shoot Day", due: 0}, {"Culling & Selection", duration: 3 days}, {"Editing", duration: 10 days}, {"Client Review", duration: 5 days}, {"Delivery"}]` içerir. Randevu (çekim günü) onaylandığı an, geriye dönük bir takvim oluşur ve her aşamanın sorumlusu atanır. Müşterinin panelinde ilerleme çubuğu görünür.
- **Müşteri Seçki ve Revizyon Merkezi:** Fotoğrafçı düşük çözünürlüklü ön izlemeleri su geçirmez (watermark) bir galeriye yükler. Müşteri, belirlenen paket hakkı kadar fotoğrafı (örn: 300 adet) "beğen" butonuyla seçer. Sistem sadece beğenilenleri yüksek çözünürlüklü işleme kuyruğuna alır. Müşteri ek revizyon isteklerini fotoğraf üzerine çizim yaparak belirtir. Her revizyon bir `revision_task` olarak açılır, paket hakkının dışında ise sistem "Ek revizyon 150 TL" bildirimi çıkarır ve tek tıkla tahsil eder.
- **Dijital Sözleşme ve Çekim Brief Anketi:** Rezervasyon anında müşteriye özel bir anket (çekim mekanı, istenen pozlar, ailevi hassasiyetler) gönderilir. Sözleşme e-imza ile onaylanır. Anket verisi `shoot_brief`'e dönüşür ve çekim günü fotoğrafçının mobil uygulamasında check-list olarak belirir. "Gelinin tek başına merdiven pozu → çekildi" işaretlenir. Eksik poz kalmaz.

### Hook Mekanizmaları
- **Dijital Negatif Arşivi (Data Lock-in):** Tüm ham ve işlenmiş görseller, müşterinin özel galerisinde, bulutta yıllık arşivlenir. Müşteri için bu galeri, düğününün tek dijital kopyasıdır. Başka sisteme geçmek, yıllar içinde biriken bu dev arşivi ve seçki geçmişini kaybetmek demektir.
- **Sabah Tetikleyicisi:** "Bugün 2 düğün çekimi var. Ahmet-Yasemin düğünü için brief'te 'gün batımı pozu' özellikle istenmiş; hava durumu: güneşli, batım 17:45, program buna göre ayarlandı. Kurgudaki Mehmet'e de bildirim gitti: bugün teslim edilmesi gereken 3 albüm var, 1'i gecikti (kırmızı uyarı)."

### B2B2C ve No-Show Çözümü
- **Aşamalı Ödeme ve Takvim Kilidi:** Çekim günü öncesi %30, çekimden 1 hafta önce %40, ham seçki tesliminde %30 ödeme alınır. Her ödemede müşterinin panelinde kilitli aşamalar açılır. Bu oyunlaştırma, sürece bağlılığı artırır ve no-show'u sıfırlar.
- **Yapay Zeka ile Ön Eleme (Culling):** Son kullanıcıya "Yapay zeka en iyi 500 kareyi seçti, kapalı gözler ve flulaşanlar elendi. Şimdi bunlar arasından seçim yapın" deneyimi sunulur. Seçim süresini %70 kısaltır, müşteri memnuniyetini patlatır.

### Monetizasyon Modeli
- **Baskı ve Albüm Entegrasyonu (Embedded Fulfillment):** Müşteri galeriden seçtiği fotoğrafları tek tıkla canvas tablo veya albüm olarak sipariş eder. Platform, anlaşmalı baskı laboratuvarına işi iletir ve ciro üzerinden %20 komisyon alır.
- **Foto AI Asistanı (Upsell):** Stüdyo sahibine, seçilen fotoğrafları topluca düzenleyen (cilt yumuşatma, gökyüzü değiştirme) "AI Batch Edit" modülü kredi bazlı satılır. Fotoğrafçı, saatler süren düzenlemeyi dakikalar içinde yapar.

---

## 10. Kurumsal Toplantı Odası ve Ortak Çalışma Alanları (Coworking)

### Problem Tespiti
- **Farklı Kaynakların Paket Halinde Rezervasyonu:** Müşteri bir toplantı odası, bir projektör, ikram (kahve-kurabiye) ve resepsiyonda misafir karşılama hizmetini aynı anda ayarlamak ister. Her biri farklı sorumluda ve Excel'de takip edilince aksar.
- **Anlık Faturalandırma ve Kredi Yönetimi:** Günlük ofis kullanıcısı, sanal ofis üyesi, saatlik toplantı odası kullanıcısı gibi farklı profillerin anlık tüketimini ve bakiye yönetimini manuel yapmak imkansızdır.

### Kritik Modüller
- **Çok Kaynaklı Toplantı Paket Oluşturucu:** Yönetici bir `meeting_package` tanımlar: `resources: [room_id: "b12", capacity: 8], addons: [{item: "projektör", qty: 1}, {item: "ikram_paketi_kahve", qty: 8}, {item: "resepsiyon_karsilama", start_offset: -15dk}]`. Müşteri rezervasyon yaptığında tüm bu kaynaklar atomik bloke edilir ve ilgili sorumlulara (teknik ekip, mutfak, resepsiyon) anlık iş emri düşer.
- **Kullanıcı Bazlı Kredi Cüzdanı ve Otomatik Check-in/out:** Her üye ve kurumsal hesap için bir `wallet` vardır. Üye uygulama veya QR ile giriş yaptığında session başlar, çıkış yaptığında süre hesaplanır ve cüzdandan debit yapılır. Bakiye sıfıra yaklaşırsa otomatik top-up tetiklenir. Toplantı odası için oda içi tabletten check-out yapıldığında, fazla kalınan süre anlık olarak kredi kartından çekilir.
- **IoT ile Oda Yönetimi:** Rezervasyon anında oda kapısındaki akıllı kilit, misafirin telefonuna gelen geçici bir şifreyle programlanır. Check-in zamanı gelince şifre aktifleşir, bitişte pasifleşir. İçerideki sensörler, oda boşaldığında otomatik "hızlı temizlik" görevi oluşturarak bir sonraki rezervasyon için odayı hazırlar.

### Hook Mekanizmaları
- **Misafir ve Toplantı Veri Tabanı:** Şirketler, tüm misafir kayıtlarını, katılımcı listelerini ve toplantı geçmişini burada tutar. Kurumsal gizlilik ve NDA (gizlilik sözleşmesi) kayıtları bu sistemle entegredir. Başka bir sisteme geçmek, güvenlik protokolünü sıfırlamak anlamına gelir.
- **Sabah Tetikleyicisi:** "Bugün 12 toplantı odası rezervasyonu var. A Blok 4. kat resepsiyonu 10:00'teki misafirleri için bilgilendirildi. Mutfak, 11:00'deki 20 kişilik ikram için hazır. D Blok toplantı odasının projektör lambası kritik ömür seviyesinde, değişim için iş emri oluşturuldu."

### B2B2C ve No-Show Çözümü
- **Kurumsal Politika Motoru:** Şirket yöneticisi, çalışanları için kural tanımlar: "Toplantı odası no-show olursa, çalışanın kredisinden 2 katı düşülsün." Bu, iç müşterinin sorumluluğunu artırır.
- **Davetli Check-in Kolaylığı:** Toplantı sahibi, misafirlerine otomatik olarak "toplantı linki, kat planı, Wi-Fi şifresi ve QR giriş kodu" içeren bir e-posta/mesaj gönderir. Misafir resepsiyonda bu QR'ı okutarak saniyeler içinde içeri girer, kimlik bekleme sürtünmesi ortadan kalkar.

### Monetizasyon Modeli
- **Dinamik Fiyatlandırma ve "Anlık Ofis" (Upsell):** Yoğun saatlerde toplantı odası fiyatlarının otomatik arttığı modül. Kullanılmayan özel ofisleri saatlik kiralanabilir alanlara çeviren "Instant Office" özelliği, işletmeye ekstra gelir olarak döner ve platforma %15 komisyon bırakır.
- **Karbon Ayak İzi Raporlaması (Upsell):** Kurumsal firmalara, ofis ve toplantı odası kullanımına bağlı enerji tüketimi ve karbon ayak izi raporu sunan sürdürülebilirlik modülü primli satılır.