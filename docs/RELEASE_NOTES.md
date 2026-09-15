# CATATAN RILIS RESMI (OFFICIAL RELEASE NOTES)
## SIM-TIK v2.5.0 Enterprise Edition
**Sistem Informasi Manajemen Aset & Logistik TIK — Inspektorat Kabupaten Trenggalek**  
*Tanggal Rilis: 15 September 2026*  
*Basis Regulasi: Permendagri No. 47 Tahun 2021 & PSAP No. 07*

---

### RINGKASAN PEMBARUAN VERSI 2.5.0

Versi **2.5.0 Enterprise** merupakan rilis besar (*major release*) yang menghadirkan **Pusat Data Master Sistem (Master Data Hub)** terpusat, integrasi menyeluruh **Manajemen Data Pegawai ASN (CRUD)**, peningkatan ke **Arsitektur Fullstack SQLite WAL**, penyempurnaan **Konsistensi Mode Gelap (High-Contrast Dark Mode)**, serta otomatisasi dokumen resmi pemerintah daerah.

---

### DAFTAR FITUR-FITUR UTAMA VERSI TERUPDATE (v2.5.0):

#### 1. 🏢 PUSAT DATA MASTER SISTEM (MASTER DATA HUB)
- **Editor Unit Kerja / Bidang (CRUD)**:
  - Penambahan, pengeditan nama/kode, dan penghapusan divisi/bidang kerja dinas (Sekretariat, Irban I s/d V, Irban Investigasi Khusus, dsb.).
  - **Auto-Cascade Sinkronisasi**: Mengubah nama unit kerja otomatis menyinkronkan nama bidang seluruh pegawai yang bernaung di dalamnya.
  - **Proteksi Hapus Berelasi**: Mencegah penghapusan unit kerja yang masih memiliki pegawai aktif.
- **Master Ruangan Dinas (KIR Permendagri No. 47/2021)**:
  - Pengelolaan data fisik ruangan kantor dinas (Kode Ruangan, Nama Ruangan, Lantai Gedung).
  - Penunjukan Penanggung Jawab Ruangan (PIC & NIP) terintegrasi langsung dengan master data pegawai.
  - Proteksi pencegahan penghapusan ruangan yang masih ditempati aset inventaris.
  - Terhubung otomatis dengan lembar cetak fisik Kartu Inventaris Ruangan (KIR).
- **Master Kategori Aset TIK**:
  - Standarisasi kelompok barang (*Laptop & PC*, *Server & Jaringan*, *Printer/Scanner*, *Display Multimedia*, dsb.).
- **Konfigurasi Pejabat Penandatangan Dokumen Resmi & Kop Instansi**:
  - Konfigurasi nama, NIP, pangkat/golongan, dan jabatan untuk:
    - **Inspektur Daerah / Kepala SKPD**: Pengesah BAST & Laporan Inventaris.
    - **Pengurus Barang Pengguna**: Pihak Pertama BAST & Pengesah KIR.
    - **Kasubbag Umum & Keuangan**: Verifikator administrasi inventaris.
  - Format Kop Surat Dinas (*PEMERINTAH KABUPATEN TRENGGALEK*, *INSPEKTORAT DAERAH*, Alamat Kantor, Telp, Email).
  - Lembar resmi **BAST** dan **KIR** otomatis menyematkan kop dan tanda tangan pejabat terbaru.

#### 2. 👥 MANAJEMEN DATA PEGAWAI (CRUD ASN INSPEKTORAT)
- **Master Data 70 Pegawai Resmi**: Terintegrasi langsung dengan database kepegawaian Inspektorat Kabupaten Trenggalek (PNS & PPPK).
- **Operasi CRUD Lengkap**: Tambah Pegawai Baru, Ubah Data Pegawai, dan Hapus Pegawai.
- **Proteksi Integritas Aset Dinas**: Tombol hapus pegawai dikunci jika pegawai masih tercatat memegang barang inventaris dinas (*Status: In Use*).
- **Sinkronisasi Pemegang Aset**: Mengubah nama atau NIP pegawai otomatis memperbarui status pemegang pada aset dinas terkait.
- **Ekspor Spreadsheet CSV (UTF-8 with BOM)**: Unduh 12 kolom master data ASN rapi tanpa karakter rusak di Microsoft Excel.
- **Shortcut Cepat**: Tombol **"Kelola Unit Kerja"** di bilah aksi atas halaman Pegawai langsung membuka editor unit kerja di pengaturan.

#### 3. 🛡️ ARSITEKTUR FULLSTACK & SQLITE WAL ENGINE
- **Backend REST API Node.js Express**: Berjalan di port 5001 dengan middleware keamanan ketat (`helmet`, `cors`, `express-rate-limit`).
- **Database SQLite Mode WAL (Write-Ahead Logging)**: Berada di `data/simtik.db` dengan kecepatan baca < 10 ms dan performa *non-blocking concurrent write*.
- **Jejak Audit Forensik APIP (Audit Trail)**: Rekaman log aktivitas yang tidak dapat diubah (*immutable*) mencakup alamat IP, peran pengguna, aksi, timestamp, dan diff data lama vs baru.
- **Proteksi Berkas Rahasia Server**: Aturan rewrite Apache `.htaccess` memblokir akses publik ke `.env`, `simtik.db`, dan berkas konfigurasi sensitif (HTTP 403 Forbidden).

#### 4. 📄 KEPATUHAN REGULASI PENATAUSAHAAN BMD PEMERINTAH
- **Berita Acara Serah Terima (BAST)**: Format hukum operasional aset TIK standar pemerintah daerah.
- **Kartu Inventaris Ruangan (KIR)**: Cetak dokumen fisik A4 Landscape resmi Permendagri No. 47 Tahun 2021.
- **Kalkulator Depresiasi Nilai (PSAP No. 07)**: Perhitungan penyusutan aset metode garis lurus (*straight-line*).
- **Pelacakan Belanja Modal APBD**: Penatausahaan aset berbasis DPA, SP2D, nomor kontrak, dan pagu anggaran APBD (±Rp 10 Miliar).

#### 5. 🌓 KONSISTENSI HIGH-CONTRAST DARK MODE & UI/UX
- Konsistensi 100% pada seluruh modul: Stok Opname ATK, Helpdesk, Jejak Audit, Pengaturan Akun, Manajemen Pegawai, dan Pusat Data Master.
- Standar aksesibilitas WCAG AA tanpa teks gelap di atas latar belakang hitam.
- Antarmuka responsif ramah layar ponsel cerdas, tablet, dan monitor desktop.
- Modal interaktif **"Catatan Rilis & Fitur Terupdate"** yang dapat diakses langsung dari Header dan Sidebar footer.

---

### PETUNJUK PEMBARUAN DI SERVER PRODUKSI (VPS VIRTUALMIN):

Untuk menerapkan seluruh pembaruan versi 2.5.0 pada server VPS:
```bash
cd /home/inspektorat/domains/simtik.inspektorat.trenggalekkab.go.id/simtik
bash deploy-virtualmin.sh
```

---
*Dikembangkan untuk Inspektorat Daerah Kabupaten Trenggalek.*
