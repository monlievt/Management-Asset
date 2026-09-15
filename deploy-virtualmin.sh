#!/bin/bash
# ==============================================================================
# Skrip Otomasi Deployment SIM-TIK Enterprise di Webmin / Virtualmin
# Inspektorat Kabupaten Trenggalek
# ==============================================================================

set -e

echo "=========================================================="
echo "🚀 Memulai Deployment SIM-TIK Enterprise di Virtualmin..."
echo "=========================================================="

# Deteksi lokasi folder public_html
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$APP_DIR")"
PUBLIC_HTML="$PARENT_DIR/public_html"

if [ ! -d "$PUBLIC_HTML" ]; then
    echo "⚠️ Folder $PUBLIC_HTML tidak ditemukan secara otomatis."
    read -p "Masukkan path absolut folder public_html Anda (contoh: /home/namauser/public_html): " PUBLIC_HTML
fi

echo "📁 Lokasi Aplikasi Backend : $APP_DIR"
echo "🌐 Lokasi Web public_html   : $PUBLIC_HTML"
echo ""

# 1. Pastikan file .env ada
if [ ! -f "$APP_DIR/.env" ]; then
    echo "📄 Membuat berkas .env dari template..."
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    # Generate random secret key
    RANDOM_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    sed -i "s/replace_with_a_secure_random_64_char_secret_key_in_production/$RANDOM_SECRET/g" "$APP_DIR/.env" 2>/dev/null || true
fi

# 2. Ambil update terbaru dari GitHub
echo "📥 Mengambil pembaruan terbaru dari GitHub (git pull)..."
cd "$APP_DIR"
git pull origin main

# 3. Install dependensi Node.js
echo "📦 Menginstal dependensi Node.js..."
npm install --production=false

# 3. Build frontend statis Vite
echo "⚙️ Membangun (build) berkas frontend produksi..."
npm run build

# 4. Salin hasil build (dist/*) ke public_html
echo "📤 Menyalin berkas dist/ ke $PUBLIC_HTML..."
mkdir -p "$PUBLIC_HTML"
cp -r "$APP_DIR/dist/"* "$PUBLIC_HTML/"

# Pastikan .htaccess tersalin
if [ -f "$APP_DIR/dist/.htaccess" ]; then
    cp "$APP_DIR/dist/.htaccess" "$PUBLIC_HTML/.htaccess"
fi

# 5. Jalankan Backend Server menggunakan PM2
echo "🔄 Mengonfigurasi proses PM2 untuk Backend API..."
if ! command -v pm2 &> /dev/null; then
    echo "📦 Menginstal PM2 Process Manager secara global..."
    npm install -g pm2
fi

# Restart atau start proses PM2
if pm2 list | grep -q "simtik-api"; then
    echo "♻️ Me-restart service simtik-api..."
    pm2 restart simtik-api
else
    echo "▶️ Memulai service simtik-api..."
    pm2 start "$APP_DIR/server/index.js" --name "simtik-api"
fi

pm2 save

echo ""
echo "=========================================================="
echo "✅ DEPLOYMENT SIM-TIK DI VIRTUALMIN SELESAI!"
echo "=========================================================="
echo "1. Frontend tersimpan di : $PUBLIC_HTML"
echo "2. Backend berjalan di   : 127.0.0.1:5001 (PM2: simtik-api)"
echo "3. Database tersimpan di : $APP_DIR/data/simtik.db (Aman di luar public_html)"
echo "=========================================================="
