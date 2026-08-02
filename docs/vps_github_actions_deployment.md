# 🚀 GlowDesk Canlı VPS Kurulum & GitHub Actions CD Rehberi

Bu doküman, GlowDesk projesinin VPS sunucusuna canlıya alınması, **4 GB Swap bellek optimizasyonu**, **Portainer remote web yönetimi** ve **GitHub Actions (Sıfır Yüklü Otomatik Canlıya Alma)** adımlarını içerir.

---

## 🔑 1. GitHub Actions Otomatik Canlıya Alma Yapılandırması

Siz kendi bilgisayarınızdan `git push origin main` yaptığınızda GitHub'ın sunucunuza bağlanıp otomatik güncelleyebilmesi için GitHub Deponuzda (**Repository Settings**) tek seferlik 3 gizli anahtar (Secret) tanımlamanız yeterlidir:

1. **GitHub Reponuza Gidin:** `Settings` -> `Secrets and variables` -> `Actions` bölümünü açın.
2. **`New repository secret`** butonuna basıp şu 3 değeri ekleyin:

   - 🟢 **`VPS_HOST`**: Sunucunuzun IP adresi (Örn: `141.95.xx.xx`)
   - 🟢 **`VPS_USER`**: `root`
   - 🟢 **`VPS_SSH_KEY`**: Sunucunuza bağlanırken kullandığınız Private SSH Key (veya şifresiz SSH anahtarı metni)

---

## 🔄 2. Otomatik Canlıya Alma Akışı Nasıl Çalışır?

1. Kendi bilgisayarınızdan geliştirmelerinizi tamamlayıp `git push origin main` komutunu çalıştırırsınız.
2. Sunucunuz hiç yorulmadan beklerken (%0 İşlemci / %0 RAM yükü), **GitHub bulut sunucuları** devrededir.
3. GitHub Actions workflow'u ([.github/workflows/deploy.yml](file:///c:/Users/ouysa/OneDrive/Masaüstü/GlowDesk/.github/workflows/deploy.yml)) otomatik tetiklenir.
4. GitHub, VPS'inize SSH ile bağlanıp `git pull origin main` ve `docker compose up -d --build` komutunu çalıştırır.
5. **Sonuç:** Sunucu kaynağınız %100 oranında sadece kullanıcılarınıza ve GlowDesk uygulamanıza ayrılmış olur!

---

## 🖥️ 3. Sunucuya İlk Kurulum (Tek Komut)

Sunucunuza ilk kez bağlandığınızda `docs` ve `devops` rehberindeki kurulum betiğini çalıştırmanız yeterlidir:

```bash
# 1. Projenizi sunucuya çekin
cd GlowDesk

# 2. Kurulum betiğini çalıştırın (4 GB Swap + Docker + Portainer 9002)
chmod +x devops/setup_vps.sh
sudo ./devops/setup_vps.sh
```

---

## 🌐 4. Canlı Web & Yönetim Portları

Kurulum tamamlandığında aşağıdaki portlar üzerinden sisteminize erişebilirsiniz:

- 🌐 **Ana Uygulama (Nginx Proxy):** `http://<SUNUCU_IP>` *(Port 80/443)*
- 🛠️ **Portainer (Web Docker & Terminal):** `http://<SUNUCU_IP>:9002` *(veya HTTPS: 9443)*
- 📊 **Dozzle (Canlı Docker Loglar):** `http://<SUNUCU_IP>:8888`
- 🐬 **PhpMyAdmin (Veritabanı GUI):** `http://<SUNUCU_IP>:8080`
- 🗄️ **MinIO S3 (Dosya Depolama GUI):** `http://<SUNUCU_IP>:9001`
- ⚡ **FastAPI Swagger API Docs:** `http://<SUNUCU_IP>/api/docs`
