#!/bin/bash

# ====================================================================
# SCRIPT DEPLOYMENT OTOMATIS VPS - KOSANKU PRO (BEBAS BENTROK)
# ====================================================================

echo "🚀 [1/5] Memulai Inisialisasi Deployment KosanKu Pro di VPS..."

# 1. Update Repository
echo "📥 [2/5] Mengambil Kodingan Terbaru dari Git..."
git pull origin main

# 2. Setup Environment Variable (.env)
if [ ! -f .env ]; then
  echo "⚙️ Creating .env configuration file..."
  cat <<EOT > .env
DATABASE_URL="postgresql://kosanku_admin:KosanKuPro2026SecurePass!@localhost:5433/kosanku_pro_db?schema=public"
JWT_SECRET="KosanKuPro_Super_Secret_Key_2026_Jwt_Secure"
PORT=4000
NODE_ENV=production
EOT
fi

# 3. Biild & Start Docker Container (Port 4000 & DB 5433)
echo "📦 [3/5] Membangun Docker Image & Database PostgreSQL (Port 5433)..."
docker-compose up -d --build

# 4. Run Migration & Seeding Data Demo Dinamis
echo "🗄️ [4/5] Menjalankan Migrasi Database & Seeder Data Demo Multi-Role..."
docker exec -it kosanku-pro-app npx prisma db push
docker exec -it kosanku-pro-app npm run db:seed

# 5. Informasi Nginx Setup
echo "----------------------------------------------------------------"
echo "✅ DEPLOYMENT BERHASIL!"
echo "----------------------------------------------------------------"
echo "📌 KosanKu Pro Web App berjalan di Port  : 4000 (http://localhost:4000)"
echo "📌 PostgreSQL Database terisolasi di Port : 5433"
echo ""
echo "💡 PETUNJUK SETUP NGINX (AGAR BISA DIAKSES VIA DOMAIN):"
echo "Tambahkan konfigurasi berikut ke /etc/nginx/sites-available/kosanku.conf:"
echo ""
echo "server {"
echo "    server_name kosanku.pro app.kosankubro.com; # Ganti domain Anda"
echo "    location / {"
echo "        proxy_pass http://127.0.0.1:4000;"
echo "        proxy_http_version 1.1;"
echo "        proxy_set_header Upgrade \$http_upgrade;"
echo "        proxy_set_header Connection 'upgrade';"
echo "        proxy_set_header Host \$host;"
echo "        proxy_cache_bypass \$http_upgrade;"
echo "    }"
echo "}"
echo ""
echo "Jalankan: sudo ln -s /etc/nginx/sites-available/kosanku.conf /etc/nginx/sites-enabled/ && sudo systemctl reload nginx"
echo "================================================================"
