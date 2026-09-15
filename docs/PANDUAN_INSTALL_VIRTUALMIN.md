# PANDUAN INSTALASI SIM-TIK DI WEBMIN / VIRTUALMIN
## Inspektorat Kabupaten Trenggalek
### Arsitektur Fullstack: Frontend React (Vite) + Backend Node.js Express (Port 5001) + SQLite WAL

---

## 1. JAWABAN UTAMA: DI MANA HARUS DI-INSTALL?

> [!CAUTION]
> **JANGAN meletakkan seluruh folder proyek langsung di dalam `public_html`!**
> Jika seluruh proyek (termasuk folder `server/`, berkas `.env`, dan `data/simtik.db`) ditaruh di dalam `public_html`, siapa pun di internet bisa mengunduh database Anda melalui browser dengan mengetik: `http://domain-anda.go.id/data/simtik.db` atau `http://domain-anda.go.id/.env`.

### Struktur Folder yang Benar & Aman di Virtualmin:

Di Virtualmin, setiap akun domain memiliki folder home, misalnya: `/home/simtik/` atau `/home/inspektorat/`.

Gunakan struktur berikut:
```text
/home/namauser/
│
├── simtik/                     <-- [DI SINI CLONE PROYEK GITHUB] (Aman di luar web root)
│   ├── server/                 <-- Backend Node.js Express
│   ├── data/simtik.db          <-- Database SQLite WAL (TERLINDUNGI DARI AKSES PUBLIK)
│   ├── uploads/                <-- Folder berkas foto & dokumen SP2D
│   ├── .env                    <-- Rahasia JWT & konfigurasi server
│   ├── dist/                   <-- Berkas frontend hasil build
│   └── package.json
│
└── public_html/                <-- [HANYA BERISI HASIL BUILD dist/* DAN .htaccess]
    ├── index.html
    ├── .htaccess               <-- Proxy /api ke port 5001 & SPA fallback
    └── assets/
        ├── index-xxx.js
        └── index-xxx.css
```

---

## 2. LANGKAH-LANGKAH INSTALASI CEPAT (3 LANGKAH)

### Langkah 1: Masuk ke Terminal VPS (SSH atau Webmin Terminal)
Buka Terminal via SSH atau melalui panel Webmin (*Webmin -> Tools -> Command Shell* atau *Terminal*).
Masuk ke direktori home akun Virtualmin Anda:
```bash
cd /home/namauser
```
*(Ganti `namauser` dengan username virtual server domain Anda di Virtualmin).*

---

### Langkah 2: Clone Repositori GitHub
Unduh source code dari repositori GitHub Anda ke folder `simtik`:
```bash
git clone https://github.com/monlievt/Management-Asset.git simtik
cd simtik
```

---

### Langkah 3: Jalankan Skrip Otomasi Deployment
Kami telah menyediakan skrip otomatis 1-klik untuk Virtualmin:
```bash
chmod +x deploy-virtualmin.sh
./deploy-virtualmin.sh
```

Skrip ini otomatis melakukan:
1. Membuat berkas `.env` dengan *JWT Secret Key* acak yang aman.
2. Menginstal seluruh dependensi Node.js.
3. Melakukan kompilasi produksi frontend (`npm run build`).
4. Menyalin berkas `dist/*` dan `.htaccess` ke folder `public_html`.
5. Mengaktifkan backend service dengan **PM2** di port 5001 agar otomatis hidup kembali saat VPS direstart.

---

## 3. KONFIGURASI WEB SERVER DI VIRTUALMIN

### KASUS A: Virtualmin Anda Menggunakan APACHE (Paling Umum / Default)

Aplikasi sudah menyertakan berkas `.htaccess` di dalam `public_html` yang otomatis mem-proxy request `/api` dan `/uploads` ke Node.js di port 5001.

**Syarat Penting Apache:**
Pastikan modul `proxy` dan `proxy_http` aktif di Apache VPS Anda.
Jalankan perintah ini di SSH jika belum aktif:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2   # atau: sudo systemctl restart httpd
```

---

### KASUS B: Virtualmin Anda Menggunakan NGINX

Jika Virtual Server Anda dikonfigurasi menggunakan Nginx:
1. Buka panel Virtualmin di browser (`https://ip-vps:10000`).
2. Pilih Virtual Server domain Anda.
3. Masuk ke menu: **Server Configuration** $\rightarrow$ **Edit Nginx Website**.
4. Di dalam blok `server { ... }`, tambahkan konfigurasi reverse proxy berikut:
   ```nginx
   # Reverse proxy ke Backend Node.js
   location /api {
       proxy_pass http://127.0.0.1:5001;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }

   # Akses folder uploads foto & dokumen
   location /uploads {
       alias /home/namauser/simtik/uploads;
       expires 30d;
       add_header X-Content-Type-Options "nosniff";
   }

   # SPA fallback untuk React Router
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
5. Klik **Save and Apply**.

---

## 4. PERINTAH PENTING UNTUK PEMELIHARAAN (PM2)

Backend aplikasi dikelola oleh PM2 agar selalu aktif di latar belakang:

- **Melihat status service:**
  ```bash
  pm2 status
  ```
- **Melihat log aktivitas / error:**
  ```bash
  pm2 logs simtik-api
  ```
- **Me-restart aplikasi:**
  ```bash
  pm2 restart simtik-api
  ```
- **Memastikan PM2 otomatis jalan saat VPS reboot:**
  ```bash
  pm2 startup
  pm2 save
  ```

---

## 5. CARA MEMPERBARUI APLIKASI DI KEMUDIAN HARI (UPDATE)

Jika di kemudian hari ada pembaruan kode di GitHub, Anda cukup menjalankan perintah ini di folder `/home/namauser/simtik`:
```bash
cd /home/namauser/simtik
git pull origin main
./deploy-virtualmin.sh
```
Seluruh pembaruan akan langsung diterapkan tanpa mengganggu data inventaris di `data/simtik.db`.
