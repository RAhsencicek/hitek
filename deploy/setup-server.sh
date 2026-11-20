#!/usr/bin/env bash
# ==============================================================================
# HiServis AI — Tek Tıkla Canlı Ubuntu Sunucu Kurulum Scripti
# Hedef Sunucu: Ubuntu 22.04 / 24.04 (IP: 70.40.138.174)
# Alan Adı: hitek.hayatisleri.com.tr
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 HiServis AI Prodüksiyon Kurulumu Başlatılıyor..."
echo "=========================================================="

# 1. Paket Güncellemesi
sudo apt update && sudo apt upgrade -y

# 2. Gerekli Temel Paketlerin Kurulumu (Git, Curl, Nginx, Certbot)
sudo apt install -y git curl ufw nginx certbot python3-certbot-nginx

# 3. Docker ve Docker Compose Kurulumu
if ! command -v docker &> /dev/null; then
    echo "📦 Docker kuruluyor..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

sudo apt install -y docker-compose-plugin

# 4. Proje Dizinini Hazırlama
APP_DIR="/opt/hiservis"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

if [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Proje dizini mevcut, güncelleniyor (git pull)..."
    cd $APP_DIR
    git pull origin main
else
    echo "📥 Proje GitHub'dan klonlanıyor..."
    git clone https://github.com/RAhsencicek/hitek.git $APP_DIR
    cd $APP_DIR
fi

# 5. Docker Konteynerlerini Başlatma
echo "🐳 Docker konteynerleri (PostgreSQL 17, .NET 10 API, Next.js) derleniyor ve başlatılıyor..."
sudo docker compose -f docker-compose.prod.yml up -d --build

# 6. Nginx Yapılandırması
echo "🌐 Nginx yapılandırması kopyalanıyor..."
sudo cp deploy/nginx/hitek.conf /etc/nginx/sites-available/hitek.conf
sudo ln -sf /etc/nginx/sites-available/hitek.conf /etc/nginx/sites-enabled/hitek.conf

# Test nginx config and reload
sudo nginx -t
sudo systemctl reload nginx

# 7. Güvenlik Duvarı (UFW)
sudo ufw allow 22/tcp || true
sudo ufw allow 80/tcp || true
sudo ufw allow 443/tcp || true

echo "=========================================================="
echo "✅ Kurulum Tamamlandı!"
echo "Uygulama: http://hitek.hayatisleri.com.tr"
echo ""
echo "Ücretsiz SSL (HTTPS) kurmak için şu komutu çalıştırabilirsiniz:"
echo "sudo certbot --nginx -d hitek.hayatisleri.com.tr"
echo "=========================================================="
