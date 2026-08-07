# 🛡️ GlowDesk — Acımasız QA & Güvenlik Denetim Raporu

**Tarih:** 7 Ağustos 2026  
**Denetleyen:** Lead QA & Security Audit Specialist (Antigravity AI)  
**Hedef Sistem:** GlowDesk Multi-Tenant Hizmet & Randevu Platformu (Next.js Frontend + FastAPI Backend + PostgreSQL Database)

---

## 📋 Yönetici Özeti (Executive Summary)

GlowDesk mimarisi üzerinde yürütülen acımasız ve derinlemesine Kalite Güvence (QA), Güvenlik ve Mimari denetimler sonucunda; **Fonksiyonel Mantık**, **Veritabanı / Eşzamanlılık**, **API Güvenliği / Yetkilendirme** ve **UI/UX / İstemci Yönetimi** katmanlarında kritik açıklar ve tasarım hataları tespit edilmiştir.

Özellikle backend API uç noktalarının ezici çoğunluğunda **Yetkilendirme (Auth/RBAC) kontrollerinin bulunmaması**, **Yarış Durumu (Race Condition)** korumasının SQLAlchemy seviyesinde kilit (`FOR UPDATE`) içermemesi ve `ResourceBooking` tablosundaki **Tarih (`date`) alanı eksikliği** sistemin canlı ortamda veri kaybına ve finansal suistimale açık olduğunu göstermektedir.

Aşağıda tespit edilen tüm hatalar, istenen kesin formatta ve yeniden üretilebilir adımlarla raporlanmıştır.

---

## 1. Katman: Fonksiyonel ve İş Mantığı Testleri

### [BUG-FUN-001: Yetkisiz Randevu Oluşturma ve Manipülasyonu] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. Postman veya `curl` ile `POST http://localhost:8000/api/appointments/` adresine yetkisiz (Authorization header olmadan) bir HTTP isteği gönderin.
  2. Gönderilen body: `{"tenant_id": "hedef-isletme-uuid", "customer_name": "Saldırgan", "customer_phone": "05550000000", "appointment_date": "2026-08-10", "start_time": "14:00:00", "end_time": "15:00:00", "total_price": 0.0}`.
  3. İsteğin `200 OK` dönerek hedef işletmenin takvimine randevuyu kaydettiğini gözlemleyin.
- **Teknik Çözüm Önerisi:** `backend/app/api/appointments.py` içerisindeki tüm `POST`, `PATCH`, `DELETE` uç noktalarına `current_user = Depends(get_current_active_user)` bağımlılığı eklenmeli ve istek atan kullanıcının ilgili `tenant_id`'ye erişim yetkisi (RBAC) doğrulanmalıdır.

---

### [BUG-FUN-002: Geçmiş Tarihe ve Mantıksız Saat Aralığına Randevu Kaydı] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `POST /api/appointments/` endpoint'ine `appointment_date: "1999-01-01"`, `start_time: "17:00:00"`, `end_time: "10:00:00"` (bitiş saati başlangıçtan önce) payload'ı gönderin.
  2. Backend'in tarihi ve saat mantığını doğrulamadan kaydı başarıyla veritabanına eklediğini doğrulayın.
- **Teknik Çözüm Önerisi:** `backend/app/schemas/appointment.py` içindeki `AppointmentCreate` Pydantic modeline `@field_validator` eklenerek `appointment_date >= date.today()` ve `end_time > start_time` kuralları zorunlu tutulmalıdır.

---

### [BUG-FUN-003: Geçersiz Hizmet ve Personel ID'lerinde Sessiz Null Atama (Silent Fallback)] - [Etki Derecesi: Orta] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `POST /api/appointments/` isteğinde `service_id: "var-olmayan-uuid"` veya `staff_id: "invalid-uuid"` parametresi gönderin.
  2. Endpoint, veritabanında bu ID'leri bulamayınca istemciye hata döndürmek yerine `valid_service_id = None` ve `valid_staff_id = None` atayarak `200 OK` yanıtı vermektedir.
- **Teknik Çözüm Önerisi:** `backend/app/api/appointments.py` (satır 16-25) içinde verilen `service_id` veya `staff_id` veritabanında bulunamadığı takdirde `HTTP 404 Not Found` veya `HTTP 400 Bad Request` hatası fırlatılmalıdır.

---

### [BUG-FUN-004: Negatif Toplam Tutar (Negative Total Price) Enjeksiyonu] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `POST /api/appointments/` veya `/orchestrated` isteğinde `total_price: -9999.99` gönderin.
  2. Endpoint `total_price = payload.total_price or 0.0` kontrolü yaptığı için negatif sayı mantıksal olarak `True` değerlendirilir ve veritabanına `-9999.99 TL` olarak yazılır.
- **Teknik Çözüm Önerisi:** Pydantic şemasında `total_price: Field(ge=0, default=0.0)` tanımlanmalı, negatif fiyat girişleri Pydantic seviyesinde reddedilmelidir.

---

### [BUG-FUN-005: Bitiş Saatinin Gece Yarısını (Midnight Wrap) Aşmasında Saat Hesabı Çökmesi] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `frontend/lib/appointment-utils.ts` içindeki `calculateEndTime` fonksiyonuna `startTime: "2026-08-07T23:30:00"` ve `durationMinutes: 60` verin.
  2. Modülo 24 hesabı (`Math.floor(totalMinutes / 60) % 24`) saat kısmını `00:30` yapar ancak gün kısmını arttırmaz (`2026-08-07T00:30:00`).
  3. Randevu başlangıcı 23:30, bitişi ise aynı günün 00:30'u (23 saat öncesi) olarak hesaplanır ve zaman çakışması mantığı tamamen çöker.
- **Teknik Çözüm Önerisi:** Tarih ve saat matematiksel dize manipülasyonu yerine `date-fns` veya JavaScript `Date` nesnesi üzerinden ertesi güne geçiş (date rollover) hesaplanarak yapılmalıdır.

---

### [BUG-FUN-006: Geçersiz / Serbest Metin Randevu Durumu Enjeksiyonu] - [Etki Derecesi: Orta] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `PATCH /api/appointments/{id}/status?status=<script>alert(1)</script>` veya `status=invalid_enum` isteği atın.
  2. Backend hiçbir enum kontrolü yapmadan veritabanında `status` kolonuna bu string'i yazar.
- **Teknik Çözüm Önerisi:** Status parametresi `AppointmentStatus` Enum tipi ile kısıtlanmalı, geçersiz durumlar `400 Bad Request` ile engellenmelidir.

---

## 2. Katman: Veri Tabanı ve Eşzamanlılık (Concurrency)

### [BUG-DB-001: `ResourceBooking` Tablosunda Tarih (`date`) Alanı Eksikliği ve Kalıcı Zaman Kilidi Hata Mimarisi] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/models/resource_booking.py` (satır 43-66) incelendiğinde tablonun sadece `start_time` ve `end_time` (Time tipi) içerdiği, `booking_date` (Date) alanının **bulunmadığı** görülür.
  2. Tablodaki Unique Constraint: `UniqueConstraint("resource_id", "start_time", "end_time")`.
  3. Bir kaynak (ör. ODA-1) Pazartesi saat 10:00-11:00 için rezerve edildiğinde, veritabanı kısıtlaması nedeniyle Salı veya gelecekteki **HİÇBİR GÜN** saat 10:00-11:00 arasında aynı kaynağa randevu alınamaz!
- **Teknik Çözüm Önerisi:** `ResourceBooking` modeline `booking_date = Column(Date, nullable=False)` alanı eklenmeli ve Unique Constraint `("resource_id", "booking_date", "start_time", "end_time")` olarak güncellenmelidir.

---

### [BUG-DB-002: Kaynak Rezervasyonunda Yarış Durumu (Race Condition - No Pessimistic Row Locking)] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `ResourceOrchestrator.check_and_lock_resources` ve `ResourceRepository.get_bookings_in_slot` dosyalarında kod yazılı dokümantasyonda `SELECT ... FOR UPDATE` denmesine rağmen sorguda `.with_for_update()` **kullanılmamıştır**.
  2. İki farklı kullanıcı eşzamanlı (aynı milisaniyede) aynı personel veya cihaz için randevu isteği gönderdiğinde; her iki istek de DB sorgusundan çakışma olmadığını okur.
  3. İki istek de aynı kaynağa kayıt atarak **Çifte Rezervasyona (Double Booking)** yol açar.
- **Teknik Çözüm Önerisi:** `ResourceRepository.get_bookings_in_slot` sorgusuna `.with_for_update()` eklenerek pestimistik kilit uygulanmalı ve işlem bitene kadar diğer transaction'ların beklemesi sağlanmalıdır.

---

### [BUG-DB-003: Asenkron Celery Hatırlatıcı Görevlerinde Olmayan Veri İle Task Tetikleme] - [Etki Derecesi: Orta] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/api/appointments.py` (satır 45-50 ve 100-105) kısmında randevu kaydedildikten hemen sonra `send_appointment_reminder.delay(...)` çağrılır.
  2. Ancak veritabanı `commit()` yapılmış olsa da Celery işçisi (worker) veritabanı transaction'ının henüz tam olarak sonlanmadığı veya yetkisiz/silinmiş müşterilere SMS gönderilmeye çalışıldığı durumlarda işçi çökmesi (worker crash) yaşar.
- **Teknik Çözüm Önerisi:** Celery task tetiklemeleri SQLAlchemy `after_commit` event hook'una bağlanmalı ve `customer_phone` boş veya geçersizse task fırlatılmamalıdır.

---

### [BUG-DB-004: Multi-Tenant İzolasyon İhlali ve Veritabanı Cascade Tehlikesi] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/api/appointments.py` içerisindeki `list_appointments` fonksiyonunda `tenant_id` opsiyoneldir.
  2. `GET /api/appointments/` isteği atıldığında (tenant_id vermeden), sistem tüm tenant'ların (işletmelerin) Müşteri isimlerini, telefonlarını ve randevu detaylarını tek bir listede dışarı sızdırır.
- **Teknik Çözüm Önerisi:** Multi-tenant mimaride `tenant_id` filtresi zorunlu kılınmalı ve JWT içerisindeki `tenant_id` claims'i ile eşleşmeyen sorgular kesinlikle engellenmelidir.

---

## 3. Katman: API ve Entegrasyon Katmanı

### [BUG-API-001: Pydantic Şemalarında Gevşek Doğrulama ve Dize Boyut Sınırı Eksikliği] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `POST /api/appointments/` payload'ına `customer_name: ""` (boş dize) veya 100.000 karakterlik rastgele metin gönderin.
  2. `customer_phone: "invalid-phone-string"` gönderin.
  3. Pydantic şemasında `min_length=1`, `max_length=255` veya Regex doğrulayıcı (Pattern) olmadığı için istek kabul edilir.
- **Teknik Çözüm Önerisi:** `AppointmentCreate` Pydantic modelinde `Field(min_length=2, max_length=100)`, `customer_phone` için `Field(pattern=r"^\+?[0-9\s\-]{10,15}$")` zorunlulukları tanımlanmalıdır.

---

### [BUG-API-002: Tüm Yönetim ve İşletme API Uç Noktalarında RBAC Kontrolü Eksikliği] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/api/customers.py`, `services.py`, `staff.py`, `invoices.py` ve `tenants.py` incelediğinde hiçbirinde `Depends(get_current_user)` veya rol kontrolü (Owner/Admin) bulunmamaktadır.
  2. Herhangi bir anonim internet kullanıcısı `DELETE /api/services/{id}` veya `GET /api/invoices/` atarak tüm faturaları görebilir veya hizmetleri silebilir.
- **Teknik Çözüm Önerisi:** Tüm yönlendiriciler (routers) `dependencies=[Depends(require_role(["owner", "admin"]))]` ile koruma altına alınmalıdır.

---

### [BUG-API-003: Hassas İşletme Güncelleme Uç Noktasında Şemasız JSON Payload Kabulü] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `PUT /api/tenants/{tenant_id}` uç noktası `payload: dict` almaktadır (Pydantic modeli yok).
  2. Yetkisiz bir kullanıcı `{"subscription_tier": "enterprise", "status": "suspended"}` göndererek işletmenin abonelik seviyesini değiştirebilir veya hesabını dondurabilir.
- **Teknik Çözüm Önerisi:** `TenantUpdate` Pydantic şeması oluşturulmalı, sadece izin verilen alanlar güncellenebilmeli ve Yetkilendirme kontrolü eklenmelidir.

---

### [BUG-API-004: İade (`POST /payments/refund/{tx_id}`) API'sinde Kimlik Doğrulamasız Finansal İşlem Yetkisi] - [Etki Derecesi: Kritik] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/api/v1/payments.py` (satır 47-49) `refund_payment` fonksiyonu yetkisiz dış erişime açıktır.
  2. `POST /api/v1/payments/refund/tx_12345?amount=5000` isteği atılarak veritabanında veya sanal POS'ta yetkisiz iade işlemi tetiklenebilir.
- **Teknik Çözüm Önerisi:** İade işlemleri strictly `role == 'admin'` olan doğrulanmış kullanıcılara kısıtlanmalı ve Finansal Yetkilendirme Middleware'i eklenmelidir.

---

### [BUG-API-005: Rate Limiting (Slowapi) Mantığında Decorator Eksikliği ve Brute-Force Açığı] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/middleware/rate_limiter.py` içinde `limiter` tanımlanmış ve `main.py`'ye eklenmiştir.
  2. Ancak `auth.py` (`POST /auth/login`) veya `appointments.py` fonksiyonlarının üzerinde `@limiter.limit("5/minute")` decorator'ü **bulunmamaktadır**.
  3. `POST /api/auth/login` uç noktasına dakikada 10.000 adet parola deneme isteği (Brute-Force) atılabilir.
- **Teknik Çözüm Önerisi:** Hassas uç noktalara (`/auth/login`, `/register`, `/payments/process`) `@limiter.limit("5/minute")` decorator'leri eklenmelidir.

---

## 4. Katman: UI/UX ve İstemci (Client) Yönetimi

### [BUG-UI-001: Status Güncellemesinde Başarısız API Çağrısında Rollback (Geri Alma) Eksikliği] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `frontend/app/(dashboard)/appointments/page.tsx` (satır 120-132) `handleUpdateStatus` fonksiyonunda state iyimser olarak güncellenir (`setAppointments(updated)`).
  2. İnternet bağlantısını kesin veya backend sunucusunu durdurun.
  3. Randevu durumunu "Tamamlandı" olarak değiştirin. UI durumu değiştirecek ve `localStorage`'a yazacaktır. Ancak API çağrısı catch bloğuna düşecek ve UI'daki değişiklik geri alınmayacaktır (State Desync).
- **Teknik Çözüm Önerisi:** `try/catch` bloğunda API hatası alındığında `setAppointments(previousAppointments)` yapılarak UI eski durumuna geri döndürülmelidir (Optimistic UI Rollback).

---

### [BUG-UI-002: Backend Ham Hata Loglarının (`str(exc)`) Kullanıcı Arayüzüne Sızdırılması] - [Etki Derecesi: Yüksek] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `backend/app/core/exceptions.py` (satır 57) `global_exception_handler` içerisinde `"details": str(exc)` dönmektedir.
  2. Bir veritabanı kısıtlama hatası oluştuğunda backend `psycopg2.errors.UniqueViolation: duplicate key value violates unique constraint "uq_resource_time_slot" DETAIL: Key (resource_id)=(...)...` döndürür.
  3. Frontend `DashboardAppointmentFlow.tsx` veya `SelfBookingPage` bu hatayı doğrudan `alert(error)` veya `setErrorMessage(error)` ile kullanıcı ekranına basar. Tablo isimleri ve DB yapısı kullanıcıya sızar.
- **Teknik Çözüm Önerisi:** `global_exception_handler` üretim (production) ortamında iç hata detaylarını gizlemeli ve jenerik `"Bir sistem hatası oluştu"` mesajı dönmelidir.

---

### [BUG-UI-003: TypeScript Tip Dönüşümlerinde Unsafe Type Cast (`as AppointmentStatus`) ve Runtime Çökmesi] - [Etki Derecesi: Orta] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `frontend/lib/appointment-utils.ts` (satır 101): `status: (a.status || 'scheduled') as AppointmentStatus`.
  2. Backend veritabanından bilinmeyen veya eski bir durum string'i (ör. `"cancelled_by_admin"`) döndüğünde, TypeScript bunu geçerli kabul eder.
  3. Frontend bileşeninde `statusConfig[apt.status]` çağrıldığında `undefined` okur ve `Cannot read properties of undefined` hatası ile sayfa çöker (White Screen of Death).
- **Teknik Çözüm Önerisi:** `as AppointmentStatus` dökümü yerine bir Type Guard fonksiyonu (`isValidStatus(status)`) yazılmalı ve bilinmeyen durumlar varsayılan `'scheduled'` durumuna güvenli biçimde düşürülmelidir.

---

### [BUG-UI-004: Takvim ve Liste Görünümü Arasında Gerçek Zamanlı Senkronizasyon Yokluğu (Stale Data)] - [Etki Derecesi: Orta] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. İki farklı sekmede veya cihazda `http://localhost:3000/appointments` sayfasını açın.
  2. Birinci sekmeden yeni bir randevu ekleyin.
  3. İkinci sekmedeki takvim görünümünün otomatik yenilenmediğini, eski (stale) veriyi göstermeye devam ettiğini gözlemleyin.
- **Teknik Çözüm Önerisi:** Veri çekme katmanı `SWR` veya `React Query` ile sarmalanmalı, `revalidateOnFocus` ve polling / WebSocket entegrasyonu sağlanmalıdır.

---

### [BUG-UI-005: Müşteri Tarafı Referans Kodu (`Math.random()`) Veritabanı İle Uyumsuzluğu ve Takip Edilemezlik] - [Etki Derecesi: Orta] - [Yeniden Üretme Adımları (Reproduction Steps)] - [Teknik Çözüm Önerisi]
- **Yeniden Üretme Adımları:**
  1. `frontend/app/(public)/book/[tenantSlug]/page.tsx` (satır 213) `const refCode = 'GLOW-' + Math.floor(100000 + Math.random() * 900000);` üretmektedir.
  2. Bu referans kodu veritabanında index'li ayrı bir sütunda tutulmaz, sadece serbest metin `notes` kolonuna yapıştırılır.
  3. Müşteri destek ekibi bu referans kodu ile veritabanında hızlı arama yapamaz.
- **Teknik Çözüm Önerisi:** Referans kodu sunucu tarafında (Backend) üretilmeli ve `appointments` tablosunda `reference_code VARCHAR(20) UNIQUE INDEX` sütunu olarak saklanmalıdır.

---

## 🏁 Sonuç ve Kodlama Öncesi Önemli Notlar

GlowDesk projesindeki tüm bu zafiyetler ve hatalar projenin mimari bütünlüğünü tehdit etmektedir. Kodlama denetimi öncesinde hazırlanan bu rapor, projeye `.md` formatında dahil edilmiş olup tespit edilen **18 kritik/yüksek/orta düzey hata** için teknik çözüm haritası sunmaktadır.
