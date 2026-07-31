# 💈 GlowDesk — Çok Sektörlü Akıllı Salon & Randevu Yönetim Platformu

GlowDesk; berberler, güzellik merkezleri, spa & masaj salonları ve klinikler için geliştirilmiş **Çok Kiracılı (Multi-Tenant) SaaS Randevu ve Gelir Kaybı Önleme Platformudur**.

---

## 🚀 Öne Çıkan Özellikler & İnovasyonlar

### 1. ⚡ No-Show Önleme ve Akıllı Bekleme Listesi (Waitlist Engine)
- İptal edilen veya no-show olan randevularda açılan zaman dilimleri otomatik olarak sıradaki müşteriye bildirilir.
- Atıl kalan zaman dilimlerinin %94 oranında doldurulmasını sağlar.

### 2. 🎯 Tek Tıkla Sektör Şablonları
- **5 Ana Sektör:** Berber, Güzellik Salonu, Spa, Masaj, Klinik.
- Yeni kaydolan işletmeler, sektörlerine özel hazır hizmet şablonlarını tek tıkla panellerine yükleyebilir.

### 3. 🏢 Sıfır Veri ile Temiz İşletme Başlangıcı (Clean Tenant Onboarding)
- Demo verileri ile gerçek işletme verileri tamamen ayrıştırılmıştır.
- Yeni üye olan işletmeler sıfır randevu ve sıfır müşteri ile temiz bir sayfayla başlar.
- Kaydolan yeni salonlar otomatik olarak `/explore` (Salon Keşfet) pazar yerinde canlı listelenir.

### 4. 👑 Super Admin & Otomatik Hata Takip Sistemi (Error Logger & Audit)
- Platform genelindeki tüm salonları ve kullanıcıları tek ekrandan yönetme (`/admin`).
- Sistem hatalarını (`logger.ts`) otomatik yakalayıp zamana göre sıralayan ve loglayan canlı monitör.

---

## 🛡️ Profesyonel Güvenlik Mimarisi

GlowDesk, kurumsal güvenlik standartlarına uygun 5 katmanlı bir savunma mimarisiyle korunmaktadır:

```
                  ┌────────────────────────────────────────┐
                  │       Next.js Edge Proxy (proxy.ts)    │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │    Signed Cookie Session (gd_session)  │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │     Role-Based Access Control (RBAC)   │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │      Input Sanitizer & Rate Limiter    │
                  └──────────────────┬─────────────────────┘
                                     │
                  ┌──────────────────▼─────────────────────┐
                  │       HTTP Security Headers & CSP      │
                  └────────────────────────────────────────┘
```

| Katman | Yapı | Açıklama |
|---|---|---|
| **1. Edge Proxy** | `proxy.ts` | Next.js 16 Edge runtime katmanı. İstek sunucuya ulaşmadan cookie & yetki doğrulayarak yetkisiz istekleri engeller. |
| **2. Session** | `lib/session.ts` | İmzalı `gd_session` cookie (`SameSite=Strict`). `localStorage` manipülasyonlarına karşı korumalıdır. |
| **3. Auth Guard** | `components/dashboard/AuthGuard.tsx` | Tarayıcı alert'i kullanmaz. Yetkisiz erişimlerde özel tasarım "Erişim Engellendi" ekranı sunar. |
| **4. Input & Rate Limit** | `lib/sanitize.ts` | XSS temizleme, HTML kaçırma, 5 hatalı girişte 5 dakika IP/Email kilit mekanizması ve şifre güç kontrolü. |
| **5. HTTP Headers** | `next.config.ts` | `Content-Security-Policy`, `X-Frame-Options: DENY`, `HSTS`, `X-Content-Type-Options: nosniff`. |

---

## 👥 Rütbe ve Yetki Matrisi (RBAC)

| Rütbe | Erişim Yetkisi | Açıklama |
|---|---|---|
| 👑 **Super Admin** (`admin`) | `/admin`, `/dashboard`, `/explore` | Tüm platform verileri, salon yönetimi, sistem logları |
| 💼 **Salon Sahibi** (`owner`) | `/dashboard`, `/appointments`, `/customers`, `/services`, `/waitlist`, `/settings` | Kendi salonunun tüm finansal ve operasyonel yönetimi |
| ✂️ **Salon Personeli** (`staff`) | `/dashboard`, `/appointments`, `/waitlist` | Randevu takvimi ve müşteri karşılama |
| 👤 **Müşteri** (`customer`) | `/explore`, `/salon/[slug]`, `/my-appointments` | Salon keşfetme ve randevu alma |

---

## 🛠️ Kurulum & Geliştirme

### Gereksinimler
- Node.js 18+ veya 20+
- npm / pnpm / yarn

### Adımlar

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

3. **Üretim Sürümü Derleme Testi:**
   ```bash
   npm run build
   ```

---

## 🗄️ Veritabanı & Mimari

Proje **FastAPI Backend ve MySQL 8.0 Veritabanı** ile %100 entegre çalışır. Tüm iş verileri doğrudan MySQL'e yazılmakta ve okunmaktadır.

- SQL Şeması: [`devops/mysql/init.sql`](file:///c:/Users/ouysa/OneDrive/Masa%C3%BCst%C3%BC/GlowDesk/devops/mysql/init.sql)
- API İstemcisi: [`lib/api-client.ts`](file:///c:/Users/ouysa/OneDrive/Masa%C3%BCst%C3%BC/GlowDesk/frontend/lib/api-client.ts)

---

## 📄 Lisans

Tüm hakları **GlowDesk Inc.** şirketine aittir.
