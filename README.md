# SIM-TIK v2.5.0 Enterprise Edition
### Sistem Informasi Manajemen Aset & Logistik TIK
**Inspektorat Daerah Kabupaten Trenggalek**

[![Version](https://img.shields.io/badge/Version-v2.5.0--Enterprise-blue.svg)](https://github.com/monlievt/Management-Asset)
[![Standard](https://img.shields.io/badge/Standard-Permendagri%20No.%2047%2F2021-emerald.svg)](https://peraturan.bpk.go.id/)
[![Accounting](https://img.shields.io/badge/Accounting-PSAP%20No.%2007-orange.svg)](http://www.ksap.org/)
[![Database](https://img.shields.io/badge/Database-SQLite%20WAL-purple.svg)](https://sqlite.org/)
[![Audit](https://img.shields.io/badge/Audit-APIP%20Forensic%20Trail-red.svg)](docs/SKENARIO_PENGUJIAN_UAT.md)

---

## 📌 Ringkasan Sistem

**SIM-TIK (Sistem Informasi Manajemen Aset & Logistik TIK)** adalah aplikasi tingkat enterprise yang dirancang khusus untuk penatausahaan barang milik daerah (BMD), inventaris perangkat keras TIK, stok logistik habis pakai (ATK), layanan pengaduan helpdesk, serta pengawasan intern APIP pada lingkungan **Inspektorat Kabupaten Trenggalek**.

Sistem ini mematuhi standar hukum tertinggi:
- **Permendagri No. 47 Tahun 2021**: Tata Cara Pelaksanaan Pembukuan, Inventarisasi, dan Pelaporan BMD.
- **PSAP No. 07 (Pernyataan Standar Akuntansi Pemerintahan)**: Akuntansi Aset Tetap dan Penyusutan Garis Lurus (*Straight-Line Depreciation*).
- **Standar Audit Forensik APIP & BPK**: *Immutable Audit Trail* untuk akuntabilitas penatausahaan barang dinas.

---

## 🚀 Fitur-Fitur Utama Versi Terupdate (v2.5.0 Enterprise)

### 1. 🏢 Pusat Data Master Sistem (Master Data Hub)
- **Editor Unit Kerja / Bidang (CRUD)**: Penambahan, pengeditan, dan penghapusan unit kerja dinas dengan *auto-cascade* pembaruan ke seluruh pegawai serta proteksi integritas relasi.
- **Master Ruangan Dinas (KIR)**: Pengelolaan ruangan dinas beserta penunjukan Penanggung Jawab Ruangan (PIC & NIP) dari daftar pegawai aktif.
- **Master Kategori Aset TIK**: Standarisasi klasifikasi perangkat keras dinas.
- **Pejabat Penandatangan Dokumen Resmi**: Konfigurasi nama, NIP, dan jabatan Kepala SKPD/Inspektur, Pengurus Barang Pengguna, Kasubbag Umum, serta Kop Surat Resmi dinas untuk pencetakan dokumen BAST dan KIR dinamis.

### 2. 👥 Manajemen Data Pegawai (CRUD ASN)
- Integrasi **70 data ASN resmi Inspektorat Trenggalek (PNS & PPPK)**.
- Operasi CRUD lengkap dengan validasi integritas NIP unik.
- **Proteksi Integritas Aset**: Sistem mengunci tindakan penghapusan jika pegawai masih tercatat memegang aset dinas aktif (*Status: In Use*).
- **Ekspor CSV UTF-8 with BOM (`\uFEFF`)**: Unduhan tabel data pegawai rapi tanpa karakter rusak di Microsoft Excel.
- Tombol shortcut cepat **"Kelola Unit Kerja"** langsung dari toolbar atas.

### 3. 🛡️ Arsitektur Fullstack & SQLite WAL
- **Backend API Node.js Express** (Port 5001) dengan proteksi keamanan *helmet*, CORS terisolasi, dan *rate limiting*.
- **SQLite Engine Write-Ahead Logging (WAL)**: Performa baca kilat (< 10 ms), aman dari *crash*, dan sangat hemat memori server VPS (< 60 MB RAM).
- **Jejak Audit APIP (Audit Trail)**: Rekaman log otomatis tidak dapat diubah yang mendokumentasikan setiap aksi mutasi aset, pengguna, dan data master.
- **Proteksi Berkas Sensitif**: Konfigurasi Apache `.htaccess` memblokir akses langsung ke berkas rahasia `.env` dan `simtik.db` (HTTP 403 Forbidden).

### 4. 📦 Modul Operasional BMD Lainnya
- **Inventaris Aset & KIB B**: Dokumentasi multi-sudut foto fisik aset, register NUP, dan pelacakan anggaran APBD (±Rp 10 Miliar).
- **Mutasi Aset & Dokumen BAST**: Alur serah terima perangkat (*check-out*) dan penarikan ke gudang (*check-in*) dengan cetak lembar BAST format A4 resmi.
- **Kartu Inventaris Ruangan (KIR)**: Format cetak fisik A4 Landscape resmi Permendagri No. 47/2021.
- **Perangkat TIK & Generator QR Code**: Pembuatan dan pencetakan stiker label QR Code fisik untuk inventarisasi lapangan.
- **Stok Opname ATK & Logistik**: Pencatatan barang masuk/keluar serta pelacakan sisa stok persediaan habis pakai.
- **Layanan Helpdesk TIK**: Pembuatan tiket gangguan teknis dan cetak laporan rekapitulasi layanan berkala.

### 5. 🌓 Antarmuka Modern & Dark Mode Konsisten
- Tampilan ramah mata dengan kontras tinggi standar WCAG AA di seluruh halaman tanpa teks redup/gelap.
- Desain sepenuhnya responsif untuk perangkat ponsel cerdas, tablet, dan monitor desktop.
- Modal interaktif **"Catatan Rilis & Fitur Terupdate"** di Header dan Sidebar footer.

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- Node.js versi 18.x atau 20.x LTS
- Git

### Langkah Instalasi
```bash
# Clone repositori
git clone https://github.com/monlievt/Management-Asset.git
cd Management-Asset

# Pasang dependensi
npm install

# Jalankan server backend (Port 5001) & Vite dev server (Port 5173)
npm run server &
npm run dev
```

Buka peramban di `http://localhost:5173`.

---

## 🌐 Deployment ke Server VPS Produksi (Virtualmin / Webmin)

Aplikasi telah dilengkapi skrip deployment terotomasi untuk VPS Linux:
```bash
# Masuk ke folder aplikasi di VPS
cd /home/inspektorat/domains/simtik.inspektorat.trenggalekkab.go.id/simtik

# Jalankan skrip deployment terpadu
bash deploy-virtualmin.sh
```

Skrip di atas secara otomatis akan:
1. Menarik commit terbaru dari GitHub branch `main`.
2. Memasang dependensi Node.js produksi.
3. Menjalankan migrasi database SQLite WAL.
4. Membangun bundle produksi Vite (`npm run build`).
5. Menyalin bundle ke direktori `public_html/`.
6. Memastikan daemon backend Node.js berjalan lancar di port 5001.

---

## 📚 Dokumentasi Terkait
- [Buku Panduan Pengguna (User Manual)](docs/BUKU_PANDUAN_PENGGUNA.md) — Panduan lengkap 14 Bab operasional sistem.
- [Skenario Pengujian UAT](docs/SKENARIO_PENGUJIAN_UAT.md) — 17 Modul UAT dengan 56 kasus uji (100% Passed).
- [Catatan Rilis Resmi v2.5.0](docs/RELEASE_NOTES.md) — Rincian teknis rilis versi terupdate.

---
**Hak Cipta © 2026 Inspektorat Daerah Kabupaten Trenggalek.**  
*Sistem Penatausahaan Barang Milik Daerah Terpadu & Akuntabel.*
