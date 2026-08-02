#!/bin/bash
# GlowDesk Git Main Auto-Deploy Loop
# Git 'main' dalını takip eder, commit geldiğinde sıfır kesintiyle otomatik günceller.

INTERVAL=${CHECK_INTERVAL:-30} # Varsayılan her 30 saniyede bir kontrol et

echo "🔄 GlowDesk Auto-Deployer Başlatıldı!"
echo "📡 Takip Edilen Dal: origin/main"
echo "⏱️  Kontrol Aralığı: ${INTERVAL} saniye"

while true; do
    # Git origin/main durumunu kontrol et
    git fetch origin main > /dev/null 2>&1 || true
    LOCAL=$(git rev-parse HEAD 2>/dev/null || echo "1")
    REMOTE=$(git rev-parse origin/main 2>/dev/null || echo "2")

    if [ "$LOCAL" != "$REMOTE" ] && [ "$REMOTE" != "2" ]; then
        echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Git 'main' dalında yeni commit tespit edildi!"
        echo "📥 Kodlar çekiliyor ve Docker imajları yeniden derleniyor..."

        git pull origin main
        docker compose up -d --build --remove-orphans

        echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Otomatik canlıya alma başarıyla tamamlandı!"
    fi

    sleep $INTERVAL
done
