# 🚀 GlowDesk — Modüler & Tek Komutla Yönetilebilir Docker Platformu

GlowDesk; tüm servislerin tek bir komutla açılıp kapanabildiği, **Next.js**, **FastAPI**, **PhpMyAdmin**, **MySQL 8.0**, **MinIO S3**, **Celery + Redis**, **Nginx** ve **Dozzle Log Monitor** bileşenlerinden oluşan fully-dockerized modüler bir sistemdir.

---

## 📦 Tüm Servis Listesi ve Konteyner İsimleri

Sistemdeki tüm konteynerler isimlendirilmiş olup tek bir orkestrasyon altındadır:

| # | Servis Adı | Konteyner İsim (`container_name`) | Port / Erişim Adresi | Açıklama |
| --- | --- | --- | --- | --- |
| **1** | **Reverse Proxy** | `glowdesk_proxy` | `80`, `443` -> `http://localhost` | Nginx Yönlendirici & Proxy |
| **2** | **Frontend App** | `glowdesk_frontend` | `3000` -> `http://localhost:3000` | Next.js App Router UI |
| **3** | **Core API** | `glowdesk_backend` | `http://localhost/api/docs` | FastAPI REST API & Swagger |
| **4** | **Async Worker** | `glowdesk_celery_worker` | Internal Queue | Celery Asenkron Görev Yöneticisi |
| **5** | **Veritabanı** | `glowdesk_mysql` | `3306` | MySQL 8.0 İlişkisel Veritabanı |
| **6** | **DB Yönetim (GUI)** | `glowdesk_phpmyadmin` | `http://localhost:8080` | PhpMyAdmin Veritabanı Arayüzü |
| **7** | **Önbellek & Kuyruk** | `glowdesk_redis` | `6379` | Redis Cache & Celery Broker |
| **8** | **Object Storage** | `glowdesk_minio` | `http://localhost:9001` | MinIO S3 Dashboard Panel |
| **9** | **Log Monitoring** | `glowdesk_dozzle` | `http://localhost:8888` | Dozzle Canlı Docker Log İzleyici |

---

## ⚡ Tek Komutla Çalıştırma (Kök Dizin)

Tüm sistemi tek bir yerden açıp kapatabilirsiniz. **`devops/` parametresi belirtmenize gerek kalmadan** doğrudan proje ana dizininde:

### 1. Sistemi Başlatma (Build & Up)

```bash
docker compose up -d --build
```

*(Eski Docker Compose sürümleri için: `docker-compose up -d --build`)*

### 2. Durum ve Çalışan Servisleri Görme

```bash
docker compose ps
```

### 3. Tüm Logları Canlı İzleme

```bash
docker compose logs -f
```

### 4. Sistemi Tek Komutla Durdurma

```bash
docker compose down
```

### 5. Verileri Sıfırlayarak Durdurma (Volume Cleanup)

```bash
docker compose down -v
```

---

## 🔑 Dashboard & Yönetim Arayüzleri

- 🐬 **PhpMyAdmin (MySQL GUI)**: `http://localhost:8080`
  - **Server**: `mysql`
  - **Username**: `root`
  - **Password**: `glowdesk_secret`

- 🗄️ **MinIO S3 Dashboard**: `http://localhost:9001`
  - **Username**: `minioadmin`
  - **Password**: `minioadmin`

- ⚡ **FastAPI Swagger API Docs**: `http://localhost/api/docs`

- 📊 **Dozzle Live Log Monitor**: `http://localhost:8888`
