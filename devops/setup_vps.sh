#!/bin/bash
set -e

echo "🚀 GlowDesk Canlı VPS Kurulum & Optimizasyon Sihirbazı Başlatılıyor..."

# 1. 4 GB SWAP ALANI OLUŞTURMA (OOM Koruması)
if [ ! -f /swapfile ]; then
    echo "⚡ 1/3: 4 GB Swap Alanı Oluşturuluyor..."
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "✅ 4 GB Swap başarıyla aktif edildi!"
else
    echo "ℹ️ Swap alanı zaten mevcut."
fi

# 2. DOCKER & DOCKER COMPOSE KONTROLÜ
echo "📦 2/3: Docker ve Orkestrasyon Kontrol Ediliyor..."
if ! command -v docker &> /dev/null; then
    echo "Docker kuruluyor..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# 3. GLOWDESK DOCKER STACK BAŞLATMA
echo "🔥 3/3: GlowDesk Docker Servisleri Başlatılıyor..."
docker compose up -d --build

echo ""
echo "=========================================================="
echo "🎉 GLOWDESK CANLI SİSTEM BAŞARIYLA BAŞLATILDI!"
echo "=========================================================="
echo ""
echo "🌐 1. Ana Uygulama (Nginx Proxy):      http://<SUNUCU_IP> (Port 80/443)"
echo "🛠️ 2. Portainer (Web Docker & Terminal): http://<SUNUCU_IP>:9002 (veya HTTPS: 9443)"
echo "🔐 3. WireGuard VPN (Web Kontrol Paneli):http://<SUNUCU_IP>:51821"
echo "📊 4. Dozzle (Canlı Docker Loglar):    http://<SUNUCU_IP>:8888"
echo "🐬 4. PhpMyAdmin (Veritabanı GUI):    http://<SUNUCU_IP>:8080"
echo "🗄️ 5. MinIO S3 (Dosya Depolama GUI):   http://<SUNUCU_IP>:9001"
echo "⚡ 6. FastAPI Swagger API Docs:        http://<SUNUCU_IP>/api/docs"
echo "🌸 7. Celery Flower (Kuyruk Takibi):   http://<SUNUCU_IP>:5555"
echo ""
echo "🤖 GITOPS & BULUT AUTOMATION (GitHub Actions):"
echo "Arka plan sunucu yükü %0! Siz 'git push origin main' yaptığınızda"
echo "GitHub Actions otomatik sunucunuza bağlanıp güncellemeyi canlıda yapacaktır."
echo "=========================================================="
