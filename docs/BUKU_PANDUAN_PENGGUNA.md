# BUKU PANDUAN PENGGUNA (USER MANUAL)
## SISTEM INFORMASI MANAJEMEN ASET & LOGISTIK TIK (SIM-TIK)
### Versi 2.4 Enterprise — Standar Permendagri No. 47 Tahun 2021 & PSAP No. 07

---

## DAFTAR ISI
1. [Pendahuluan](#1-pendahuluan)
2. [Hierarki Hak Akses & Peran Pengguna (RBAC)](#2-hierarki-hak-akses--peran-pengguna-rbac)
3. [Bab 1: Otentikasi & Antarmuka Sistem (UI/UX)](#bab-1-otentikasi--antarmuka-sistem)
   - 1.1 Masuk ke Sistem (Login)
   - 1.2 Lupa Kata Sandi (Forgot Password)
   - 1.3 Pengaturan Profil Pengguna & Kata Sandi
   - 1.4 Mode Gelap Konsisten (*High-Contrast Dark Mode*)
   - 1.5 Tampilan Responsif (Mobile & Tablet)
4. [Bab 2: Dasbor Utama (Executive Dashboard)](#bab-2-dasbor-utama-executive-dashboard)
   - 2.1 Kartu Statistik Ketersediaan Barang
   - 2.2 Tren Tiket Layanan Helpdesk (6 Bulan)
   - 2.3 Distribusi Status Perangkat & Inventaris
   - 2.4 Aktivitas Terkini Sistem
5. [Bab 3: Modul Inventaris Aset & KIB B](#bab-3-modul-inventaris-aset--kib-b)
   - 3.1 Daftar Seluruh Inventaris Aset
   - 3.2 Pencarian Cepat & Filter Status
   - 3.3 Formulir Pendaftaran Aset Baru (Dedicated Page)
   - 3.4 Dokumentasi Multi-Sudut Foto Fisik Aset
   - 3.5 Halaman Detail Komprehensif Aset
6. [Bab 4: Modul Mutasi Kepemilikan & Cetak BAST](#bab-4-modul-mutasi-kepemilikan--cetak-bast)
   - 4.1 Alur Serah Terima / Mutasi Pegawai (Check-out)
   - 4.2 Alur Penarikan Aset ke Gudang (Check-in)
   - 4.3 Cetak Dokumen Resmi BAST (Berita Acara Serah Terima)
7. [Bab 5: Modul Kartu Inventaris Ruangan (KIR - Permendagri 47/2021)](#bab-5-modul-kartu-inventaris-ruangan-kir---permendagri-472021)
   - 5.1 Penempatan Aset Berdasarkan Ruangan
   - 5.2 Cetak Lembar Fisik KIR Ruangan (A4 Landscape)
8. [Bab 6: Modul Pemeliharaan, Servis & Depresiasi Nilai (PSAP 07)](#bab-6-modul-pemeliharaan-servis--depresiasi-nilai-psap-07)
   - 6.1 Pencatatan Log Servis & Penggantian Part
   - 6.2 Kapitalisasi Nilai (Upgrade yang Menambah Nilai Aset)
   - 6.3 Kalkulator Depresiasi Garis Lurus (*Straight-Line*)
9. [Bab 7: Modul Perangkat TIK & Stiker Label QR Code](#bab-7-modul-perangkat-tik--stiker-label-qr-code)
   - 7.1 Manajemen Perangkat Keras TIK
   - 7.2 Generator & Cetak Stiker Label QR Code Fisik
10. [Bab 8: Modul Stok Opname ATK & Logistik Habis Pakai](#bab-8-modul-stok-opname-atk--logistik-habis-pakai)
    - 8.1 Manajemen Stok Logistik ATK
    - 8.2 Transaksi Barang Masuk & Barang Keluar
    - 8.3 Cetak Lembar Stok & Riwayat Mutasi
11. [Bab 9: Modul Layanan Helpdesk & Tiket Aduan TIK](#bab-9-modul-layanan-helpdesk--tiket-aduan-tik)
    - 9.1 Alur Pembuatan Tiket Aduan Baru
    - 9.2 Penanganan & Pembaruan Status Gangguan
    - 9.3 Cetak Laporan Rekapitulasi Tiket Bulanan & Tahunan
12. [Bab 10: Modul Jejak Audit Forensik APIP (Audit Trail)](#bab-10-modul-jejak-audit-forensik-apip-audit-trail)
    - 10.1 Pencatatan Otomatis (*Immutable Audit Log*)
    - 10.2 Standar Kepatuhan Inspektorat & Auditor BPK
    - 10.3 Pencarian Cepat & Inspeksi Detail Perubahan JSON
13. [Bab 11: Arsitektur Fullstack, SQLite WAL & Anggaran APBD](#bab-11-arsitektur-fullstack-sqlite-wal--anggaran-apbd)
    - 11.1 Integrasi Server Backend Node.js & Database SQLite WAL
    - 11.2 Master Data 70 Pegawai Inspektorat Trenggalek
    - 11.3 Pengelolaan Aset Berbasis APBD (±Rp 10 Miliar)
14. [Bab 12: Pelaporan, Ekspor Data & Pemeliharaan Server](#bab-12-pelaporan-ekspor-data--pemeliharaan-server)
    - 12.1 Ekspor Spreadsheet Excel / CSV (UTF-8 BOM)
    - 12.2 Prosedur Pembaruan & Deployment di Virtualmin/Webmin
15. [Bab 13: Modul Manajemen Data Pegawai (CRUD ASN)](#bab-13-modul-manajemen-data-pegawai-crud-asn)
    - 13.1 Master Data 70 Pegawai Inspektorat (PNS & PPPK)
    - 13.2 Tambah Pegawai Baru (Create)
    - 13.3 Pembaruan Data Pegawai (Update)
    - 13.4 Proteksi Hapus Pegawai & Integritas Aset (Delete)
    - 13.5 Ekspor Data Pegawai ke Spreadsheet Excel/CSV

---

## 1. PENDAHULUAN

### 1.1 Tentang SIM-TIK
**SIM-TIK (Sistem Informasi Manajemen Aset & Logistik TIK)** adalah aplikasi berbasis web yang dirancang khusus untuk mengelola siklus hidup aset teknologi informasi dan komunikasi (laptop, komputer, server, perangkat jaringan, printer) serta logistik habis pakai (ATK) pada instansi pemerintah, lembaga publik, maupun korporasi.

### 1.2 Landasan Hukum & Kepatuhan Regulasi
Sistem ini dibangun dengan mengacu pada regulasi penatausahaan aset resmi Republik Indonesia:
1. **PP No. 27 Tahun 2014 jo. PP No. 28 Tahun 2020** tentang Pengelolaan Barang Milik Negara/Daerah (BMN/BMD).
2. **Permendagri No. 47 Tahun 2021** tentang Tata Cara Pelaksanaan Pembukuan, Inventarisasi, dan Pelaporan BMD.
3. **Permendagri No. 108 Tahun 2016** tentang Penggolongan dan Kodefikasi Barang Milik Daerah.
4. **PP No. 71 Tahun 2010 (PSAP No. 07)** tentang Standar Akuntansi Pemerintahan untuk Aset Tetap (Penyusutan Garis Lurus dan Kapitalisasi Nilai).
5. **Perpres No. 16 Tahun 2018 jo. Perpres No. 12 Tahun 2021** tentang Pengadaan Barang/Jasa Pemerintah (Alur BAST & Penyerahan Hasil Pekerjaan).

---

## 2. HIERARKI HAK AKSES & PERAN PENGGUNA (RBAC)

Aplikasi menerapkan sistem kendali akses berbasis peran (*Role-Based Access Control* / RBAC):

| Peran (*Role*) | Deskripsi Tanggung Jawab | Hak Akses Fitur Utama |
| :--- | :--- | :--- |
| **Super Admin / Pengelola Aset** | Pejabat Pengurus Barang Pengguna / BMD | Akses penuh (*Full Control*): Buat, Ubah, Hapus Aset, Mutasi, Cetak BAST, Cetak KIR, Ekspor Data, Manajemen Pengguna. |
| **Operator Logistik / Pengurus ATK** | Staf pengelola persediaan ATK dan inventaris | Tambah & Edit Aset, Pengeluaran/Penerimaan ATK, Stock Opname berkala, Cetak Laporan. |
| **Teknisi Helpdesk** | Tim support teknis TIK | Menangani tiket gangguan, mengubah status perbaikan aset, mencatat servis & suku cadang. |
| **Pegawai Pemakai (Viewer)** | Pengguna akhir perangkat dinas | Melihat profil perangkat yang dipegang, membuat tiket helpdesk aduan kerusakan. |

---

## BAB 1: OTENTIKASI & ANTARMUKA SISTEM

### 1.1 Masuk ke Sistem (Login)
1. Buka peramban (*web browser*) dan akses alamat URL SIM-TIK (misal: `http://localhost:5173/login` atau domain VPS resmi instansi).
2. Masukkan **Alamat Email** dan **Kata Sandi**.
3. Klik tombol **"Masuk ke SIM-TIK"**.
4. Sistem memverifikasi token sesi melalui `sessionStorage` terenkripsi untuk mencegah sesi tertinggal di komputer umum.

### 1.2 Lupa Kata Sandi (Forgot Password)
1. Pada halaman login, klik tautan **"Lupa kata sandi?"**.
2. Masukkan alamat email kedinasan yang terdaftar.
3. Sistem akan mengirimkan instruksi pemulihan atau memandu pengguna menghubungi Administrator Pengelola Barang.

### 1.3 Pengaturan Profil Pengguna & Kata Sandi (`/settings`)
1. Akses melalui avatar profil di sudut kanan atas Header $\rightarrow$ pilih **"Pengaturan Profil"** (atau menu **Pengaturan Sistem** di Sidebar).
2. Terdiri dari dua tab navigasi mandiri:
   - **Tab Profil Pengguna**: Memperbarui Nama Tampilan, Alamat Email Kedinasan, serta foto/inisial avatar.
   - **Tab Keamanan & Kata Sandi**: Mengubah kata sandi akun dengan verifikasi kata sandi saat ini dan konfirmasi sandi baru.
3. Seluruh elemen kartu dan isian formulir telah dioptimalkan dengan antarmuka yang nyaman di mata pada tema terang maupun tema gelap.

### 1.4 Mode Gelap Konsisten (*High-Contrast Dark Mode*)
1. Klik ikon **Matahari / Bulan** di bagian kanan atas Header.
2. Seluruh modul aplikasi (Dasbor, Daftar Inventaris, Stok Opname ATK, Jejak Audit Forensik, Layanan Helpdesk, dan Pengaturan Akun) beralih secara instan dan menyeluruh tanpa adanya tabrakan kartu putih (*white card mismatch*).
3. Menggunakan palet enterprise *Slate Dark* (`#0f172a` / `#020617`) dengan kontras teks tajam yang meminimalkan kelelahan mata (*eye-strain*) saat petugas bekerja di malam hari.
4. Status tema tersimpan secara persisten di penyimpanan peramban (*localStorage*) sehingga tidak akan berubah saat browser di-refresh.

### 1.5 Tampilan Responsif (Mobile & Tablet)
- Pada perangkat ponsel cerdas atau tablet:
  - Header menampilkan tombol menu tiga garis (Hamburger).
  - Mengklik tombol menu akan memunculkan laci navigasi (*Sidebar Drawer*) dari sebelah kiri dengan latar belakang transparan redup (*backdrop blur*).
  - Klik di luar menu atau tombol silang (X) untuk menutup laci menu.

---

## BAB 2: DASBOR UTAMA (EXECUTIVE DASHBOARD)

Halaman Dasbor menyajikan visualisasi data eksekutif secara langsung:
- **Perangkat TIK (Hardware)**: Menampilkan total unit perangkat dan rincian status (*Tersedia, Digunakan, Dalam Perbaikan, Afkir*).
- **Inventaris Aset Umum**: Total aset tetap KIB B di bawah wewenang dinas.
- **Stok Opname ATK**: Total item logistik habis pakai dengan peringatan dini item yang stoknya kritis ($\le 5$).
- **Layanan Helpdesk**: Ringkasan tiket yang masih Terbuka (*Open*), Sedang Diproses (*In Progress*), dan Selesai (*Resolved*).
- **Tren Tiket Helpdesk (6 Bulan Terakhir)**: Grafik batang dinamis yang menghitung volume aduan kerusakan per bulan.
- **Diagram Distribusi**: Visualisasi lingkaran (*Donut Chart*) sebaran ketersediaan aset.
- **Aktivitas Terkini**: Daftar 6 riwayat mutasi atau tiket terbaru secara berurutan waktu (*real-time log*).

---

## BAB 3: MODUL INVENTARIS ASET & KIB B

### 3.1 Daftar Seluruh Inventaris Aset (`/assets/inventory`)
Tabel utama yang menyajikan aset tetap golongan KIB B:
- **Nomor**: Urutan tampilan.
- **Kode Barang**: Kode akun standar aset (Permendagri 108/2016), contoh `1.3.2.06.01.02`.
- **NUP**: Nomor Urut Pendaftaran fisik (misal: `0001`, `0002`).
- **Nama Aset**: Identitas perangkat lengkap.
- **Kategori**: Laptop, PC Desktop, Server, Jaringan, Printer, dll.
- **Merk & Tipe**: Pabrikan dan varian perangkat.
- **Status**: Lencana warna penanda ketersediaan (*Tersedia di Gudang, Sedang Digunakan, Dalam Perbaikan, Rusak/Afkir*).
- **Pemegang**: Nama pegawai/pejabat pemegang aset saat ini.
- **Lokasi Ruangan**: Ruangan fisik penempatan barang.
- **Nilai Buku**: Nilai perolehan setelah dikurangi akumulasi penyusutan per hari ini.
- **Aksi**: Tombol Detail (Mata), Ubah (Pensil), dan Hapus (Tempat Sampah).

### 3.2 Pencarian Cepat & Filter
- **Kolom Pencarian**: Ketik kata kunci apa saja (Nama aset, Kode Register, NUP, Merk, atau Nama Pegawai). Tabel akan memfilter data secara instan tanpa memuat ulang halaman.
- **Dropdown Status**: Filter tampilan untuk melihat hanya aset yang "Tersedia di Gudang", "Sedang Digunakan", atau "Dalam Perbaikan".

### 3.3 Formulir Pendaftaran Aset Baru (`/assets/inventory/new`)
Formulir input mandiri (*Dedicated Full-Page*) yang terbagi dalam 4 tab terstruktur:
1. **Tab 1: Informasi & Spesifikasi Teknis**:
   - Nama Aset, Kode Barang, NUP (Nomor Urut Pendaftaran), Kategori, Jenis Barang.
   - Merk, Model/Tipe, Nomor Seri Pabrik (Serial Number), Ukuran, Bahan Material.
   - Lokasi Fisik Ruangan (dilengkapi rekomendasi daftar master ruangan kantor).
   - Kondisi Fisik Awal (Baik, Rusak Ringan, Rusak Berat).
2. **Tab 2: Pengadaan & Nilai Aset**:
   - Asal Usul Perolehan (APBD / DAK / Hibah).
   - Tanggal Pembelian / BAST Perolehan & Tahun Anggaran.
   - Harga Beli Awal (Rupiah otomatis terformat).
   - Estimasi Masa Manfaat (Tahun, standar 4 tahun untuk TIK).
   - Nilai Residu / Sisa (Rp).
3. **Tab 3: Dokumentasi Multi-Foto Sudut**:
   - Mengunggah foto dari 6 sudut fisik (Depan, Belakang, Sisi Kanan, Sisi Kiri, Atas/Bawah, Plat SN).
4. **Tab 4: Pemegang Inventaris Awal**:
   - Jika aset langsung diserahkan kepada pegawai saat dibeli, pilih nama pegawai dari daftar. Sistem otomatis mencatat NIP, Unit Kerja, dan menginisiasi log riwayat pemegang pertama.

### 3.4 Dokumentasi Multi-Sudut Foto Fisik Aset
Fitur unggulan untuk bukti fisik lapangan sebelum audit:
- Klik tombol sudut yang diinginkan (misal: *Tampak Depan*).
- Klik **"Unggah Foto"** atau klik kotak unggah putus-putus.
- Sistem otomatis melakukan **kompresi cerdas di browser (HTML Canvas)** sehingga resolusi tetap tajam namun ukuran file sangat hemat (di bawah 150KB), mencegah penyimpanan browser penuh.
- Klik tombol **Mata (Eye)** untuk memperbesar foto (*Lightbox Zoom Preview*).

### 3.5 Halaman Detail Komprehensif Aset (`/assets/inventory/:id`)
Menampilkan seluruh profil aset tanpa batas:
- Header Ringkasan: Status ketersediaan, pemegang saat ini, kondisi fisik, nilai buku.
- **Tab 1: Spesifikasi & Foto Sudut**: Menampilkan spesifikasi teknis lengkap dan galeri mini 6 sudut foto.
- **Tab 2: Riwayat Pemegang**: Timeline kronologis perpindahan pemegang inventaris dari tahun ke tahun.
- **Tab 3: Riwayat Perbaikan**: Log pemeliharaan, servis, biaya, dan suku cadang.
- **Tab 4: Nilai & Depresiasi**: Kalkulasi penyusutan nilai buku secara visual.
- **Tab 5: Stiker Label & QR**: Label stiker resmi siap cetak.

---

## BAB 4: MODUL MUTASI KEPEMILIKAN & CETAK BAST

### 4.1 Alur Serah Terima / Mutasi Pegawai (Check-out)
Ketika sebuah laptop atau perangkat berpindah tangan ke pegawai baru:
1. Buka halaman Detail Aset yang bersangkutan.
2. Klik tombol hijau **"Mutasi / Serah Terima"** di kanan atas.
3. Pada jendela dialog:
   - Pilih **Nama Pegawai Penerima** dari dropdown (NIP dan Unit Kerja terisi otomatis).
   - Masukkan **Tanggal Serah Terima**.
   - Pilih **Kondisi Fisik Saat Serah** (Baik / Rusak Ringan).
   - Masukkan **Catatan / Keperluan Dinas**.
4. Klik **"Konfirmasi Serah Terima"**.
5. Sistem secara otomatis:
   - Mengubah status aset menjadi `In Use (Sedang Digunakan)`.
   - Mengubah nama pemegang aktif ke pegawai baru.
   - Menutup masa pemakaian pemegang lama dengan tanggal pengembalian.
   - Menambahkan catatan kronologis baru di Tab *Riwayat Pemegang*.

### 4.2 Alur Penarikan Aset ke Gudang (Check-in)
Jika pegawai mutasi ke luar dinas atau purna tugas (pensiun):
1. Buka halaman Detail Aset.
2. Klik tombol **"Tarik ke Gudang"**.
3. Masukkan Tanggal Pengembalian, Kondisi Fisik Saat Kembali, dan Catatan.
4. Klik **"Simpan ke Gudang"**. Status aset kembali menjadi `Available (Tersedia di Gudang)`.

### 4.3 Cetak Dokumen Resmi BAST (Berita Acara Serah Terima)
1. Pada Tab *Riwayat Pemegang*, klik tombol **"Cetak BAST"** pada salah satu baris riwayat yang diinginkan.
2. Halaman dokumen resmi BAST terbuka secara otomatis dengan format standar kedinasan:
   - Kop Resmi Pemerintah Daerah & Dinas Kominfo.
   - Nomor Registrasi BAST resmi.
   - Identitas **Pihak Pertama** (Pengelola Aset) dan **Pihak Kedua** (Pegawai Penerima).
   - Tabel Spesifikasi Teknis Barang & Kondisi Fisik.
   - 4 Poin Klausul Hak, Kewajiban, dan Tanggung Jawab Pemeliharaan Barang.
   - Tiga Kolom Tanda Tangan: Pihak Pertama, Pihak Kedua, dan Mengetahui Kepala Bidang/Dinas.
3. Klik tombol biru **"Cetak Dokumen BAST (PDF)"** di bagian atas untuk mencetak atau menyimpan sebagai file PDF.

---

## BAB 5: MODUL KARTU INVENTARIS RUANGAN (KIR - PERMENDAGRI 47/2021)

Sesuai ketentuan pasal 18 Permendagri No. 47 Tahun 2021, setiap ruangan dinas wajib memiliki dokumen fisik KIR yang ditempel di dinding/pintu ruangan.

### 5.1 Penempatan Aset Berdasarkan Ruangan
Setiap aset yang didaftarkan atau diedit memiliki atribut **Lokasi Fisik Ruangan (KIR)**. Sistem menyediakan opsi standar ruangan:
- Ruang Server & Data Center Lt. 2
- Ruang Bidang Aplikasi Informatika
- Ruang Media Center & Humas
- Gudang Logistik TIK Lt. 1
- Ruang Kepala Dinas
- Ruang Pelayanan Terpadu Satu Pintu (PTSP)

### 5.2 Cetak Lembar Fisik KIR Ruangan (A4 Landscape)
1. Masuk ke halaman **Inventaris Aset** (`/assets/inventory`).
2. Klik tombol **"Cetak KIR Ruangan"** di bagian atas tabel.
3. Pilih nama ruangan yang ingin dicetak lembar inventarisnya (misal: *Ruang Server & Data Center*).
4. Klik **"Buka Lembar Cetak KIR"**.
5. Sistem menampilkan lembar resmi KIR sesuai format baku Permendagri 47/2021:
   - Nama & Kode Ruangan.
   - Pejabat Penanggung Jawab Ruangan (Nama & NIP).
   - Tabel seluruh barang yang berada di ruangan tersebut (Kode Barang, NUP, Nama Barang, Merk/Tipe, Nomor Seri, Tahun Beli, Kondisi B/RR/RB, Nilai Buku, dan Keterangan Pemegang).
   - Kolom tanda tangan resmi: **Pengurus Barang Pengguna** dan **Penanggung Jawab Ruangan**.
6. Klik tombol cetak untuk mencetak ke kertas A4 Landscape lalu tempelkan di ruangan bersangkutan.

---

## BAB 6: MODUL PEMELIHARAAN, SERVIS & DEPRESIASI NILAI (PSAP 07)

### 6.1 Pencatatan Log Servis & Penggantian Suku Cadang
1. Pada halaman Detail Aset, klik tombol oranye **"Catat Servis"**.
2. Masukkan:
   - Keluhan / Jenis Kerusakan.
   - Tanggal Servis & Biaya Servis (Rp).
   - Tindakan / Suku Cadang yang Diganti.
   - Bengkel / Vendor Rekanan & Nama Teknisi.
3. Klik **"Simpan Log Servis"**.

### 6.2 Kapitalisasi Nilai (Upgrade Spesifikasi)
- Pada formulir catat servis, terdapat kotak centang:
  > **[✓] Kapitalisasi Nilai (Upgrade)**: Centang jika biaya ini meningkatkan kapasitas/umur aset dan perlu ditambahkan ke nilai buku aset (misal: Upgrade RAM 16GB atau Pasang SSD 1TB).
- Jika dicentang, sistem otomatis menambahkan nominal biaya tersebut ke dalam **Total Biaya Aset** pada perhitungan akuntansi.

### 6.3 Kalkulator Depresiasi Garis Lurus (*Straight-Line Depreciation*)
Berdasarkan Standar Akuntansi Pemerintahan (PSAP No. 07), penyusutan dihitung secara matematis:
$$\text{Dasar Penyusutan} = (\text{Harga Perolehan Awal} + \text{Biaya Kapitalisasi}) - \text{Nilai Residu}$$
$$\text{Penyusutan Bulanan} = \frac{\text{Dasar Penyusutan}}{\text{Masa Manfaat (Bulan)}}$$
$$\text{Nilai Buku Saat Ini} = \text{Total Biaya Aset} - \text{Akumulasi Penyusutan}$$

Pada Tab **Nilai & Depresiasi**, pengguna dapat melihat:
- Harga Perolehan Awal
- Penambahan Nilai dari Kapitalisasi Upgrade (+)
- Akumulasi Penyusutan Berjalan (-)
- **Nilai Buku Saat Ini (*Current Book Value*)**
- Indikator Visual Progres Masa Manfaat (Persentase % dan sisa masa manfaat dalam hitungan bulan).

---

## BAB 7: MODUL PERANGKAT TIK & STIKER LABEL QR CODE

### 7.1 Manajemen Perangkat Keras TIK (`/assets/devices`)
Halaman khusus yang memfilter aset kategori perangkat keras komputer dinas (Laptop, PC Workstation, Server, Switch/Router Jaringan, Printer Multifungsi). Memudahkan teknisi TIK melakukan monitoring perangkat operasional.

### 7.2 Generator & Cetak Stiker Label QR Code Fisik
1. Buka Detail Aset $\rightarrow$ Tab **"Stiker Label & QR"**.
2. Sistem otomatis menghasilkan QR Code unik berbasis data aset.
3. Klik tombol **"Cetak Stiker Label Aset"**:
   - Membuka jendela cetak label stiker fisik ukuran standar ($75\text{ mm} \times 40\text{ mm}$).
   - Memuat logo dinas, barcode register, Kode Barang, NUP, Nama Perangkat, Nomor Seri Pabrik, Tahun Beli, dan QR Code terverifikasi.
   - Siap dicetak langsung menggunakan printer label barcode / stiker berperekat dan ditempelkan pada fisik laptop/PC.
4. Kamera ponsel cerdas yang memindai QR Code tersebut akan langsung menampilkan identitas valid barang dan riwayat pemegang di lapangan.

---

## BAB 8: MODUL STOK OPNAME ATK & LOGISTIK HABIS PAKAI

### 8.1 Manajemen Stok Logistik ATK (`/assets/atk`)
- Modul ini mengelola siklus logistik barang habis pakai kedinasan (Kertas HVS A4, tinta printer, pita ribbon, map dokumen, pulpen, flashdisk, dan alat tulis kantor lainnya).
- **Indikator Stok**: Menampilkan nama barang, merek/distributor, kuantitas saat ini, satuan kemasan (*Rim, Kotak, Botol, Pcs*), tanggal pembaruan terakhir, dan status ketersediaan (*Tersedia / Habis*).
- **Tampilan Dark Mode Modern**: Tabel stok opname telah terintegrasi dengan tema gelap berlatar slate yang teduh dan teks berlabel Bahasa Indonesia baku.

### 8.2 Transaksi Barang Masuk & Barang Keluar
1. **Barang Masuk**: Klik tombol **"+ Barang Masuk"** untuk mencatat penerimaan logistik baru dari pengadaan berkala. Kuantitas stok otomatis bertambah.
2. **Barang Keluar**: Klik tombol **"Barang Keluar"** untuk mencatat distribusi ke masing-masing bidang/seksi (contoh: Seksi Irban Wilayah I atau Subbag Keuangan). Kuantitas stok otomatis terpotong.
3. **Pencarian Cepat**: Masukkan nama barang atau kode pada bilah pencarian untuk menemukan ketersediaan stok dalam hitungan milidetik.

### 8.3 Cetak Lembar Stok & Riwayat Mutasi
- Klik **"Print Stock"** untuk mencetak laporan rekapitulasi fisik stok opname langsung ke kertas/PDF.
- Klik **"Riwayat"** (`/assets/atk/history`) untuk meninjau rekaman kronologis perpindahan logistik keluar dan masuk lengkap dengan tanggal dan nomor bukti.

---

## BAB 9: MODUL LAYANAN HELPDESK & TIKET ADUAN TIK

### 9.1 Alur Pembuatan Tiket Aduan Baru (`/helpdesk`)
1. Akses menu **Layanan Helpdesk** dari bilah navigasi sebelah kiri.
2. Klik tombol **"Buat Tiket Baru"**.
3. Lengkapi formulir aduan terpadu:
   - **Perihal / Masalah**: Tuliskan ringkasan kendala (contoh: *"Printer laserjet di Ruang Irban III macet"*).
   - **Nama Pelapor / Pegawai**: Nama staf atau seksi yang mengalami kendala.
   - **Tingkat Prioritas**: Pilih *Rendah (Low)*, *Sedang (Medium)*, atau *Tinggi / Mendesak (High)*.
   - **Deskripsi Lengkap Kendala**: Rincian kendala teknis, tipe perangkat, serta nomor ruangan.
4. Klik **"Kirim Tiket"**. Tiket akan masuk ke antrean helpdesk secara real-time.

### 9.2 Penanganan & Pembaruan Status Gangguan
- Petugas teknisi TIK dapat meninjau seluruh tiket yang masuk pada tabel **Daftar Tiket Aduan & Layanan**.
- Klik ikon **Ubah (Edit)** untuk memperbarui status pengerjaan:
  - **Menunggu (Open)**: Tiket baru diterima dan menunggu teknisi ditugaskan.
  - **Sedang Dikerjakan (In Progress)**: Perangkat sedang dalam proses perbaikan/pengecekan fisik.
  - **Selesai (Resolved)**: Kendala telah teratasi dan perangkat kembali berfungsi normal.
  - **Ditutup (Closed)**: Kasus aduan telah diverifikasi tuntas oleh pelapor.

### 9.3 Cetak Laporan Rekapitulasi Tiket Bulanan & Tahunan
1. Pada toolbar atas, klik tombol **"Cetak Laporan"**.
2. Pilih salah satu format rekapitulasi:
   - **Tiket Bulan Ini**: Menghasilkan dokumen cetak resmi laporan aduan pada bulan berjalan.
   - **Rekapitulasi Tahunan**: Menghasilkan dokumen rekapitulasi gangguan per tahun anggaran.
3. Dokumen tercetak otomatis menyertakan:
   - **Kop Surat Kedinasan**: *Pemerintah Kabupaten Trenggalek - Inspektorat*.
   - **Alamat & Kontak Resmi**: *Jl. KH. Wachid Hasyim No.5 Trenggalek*.
   - **Tabel Rekapitulasi Kasus**: No, Tanggal, Perihal, Pelapor, Prioritas, Status, dan Keterangan.
   - **Area Pengesahan Pejabat**: Mengetahui Kepala Inspektorat Daerah lengkap dengan NIP.

---

## BAB 10: MODUL JEJAK AUDIT FORENSIK APIP (AUDIT TRAIL)

### 10.1 Pencatatan Otomatis (*Immutable Audit Log*) (`/audit-trail`)
- Setiap aktivitas penting dalam sistem dicatat secara otomatis ke dalam tabel database permanen (*immutable database table*) berbasis SQLite WAL.
- Log audit mencatat:
  - **Stempel Waktu Real-Time (WIB)** dengan presisi detik.
  - **Identitas Pelaksana**: Nama lengkap dan NIP pejabat/staf.
  - **Jenis Aktivitas**: *Masuk (Login)*, *Tambah Aset*, *Mutasi Pegawai*, *Hapus Aset*, *Update Spesifikasi*, *BAST Cetak*, dll.
  - **Entitas Target**: ID aset, nomor inventaris, atau modul yang diakses.
  - **Alamat IP & Klien**: IP pengakses (IPv4 / IPv6) serta data browser (*User-Agent*).
  - **Rincian Perubahan JSON**: Struktur data lengkap sebelum vs sesudah perubahan (*diff value*).

### 10.2 Standar Kepatuhan Inspektorat & Auditor BPK
- Modul ini dirancang khusus memenuhi standar pemeriksaan aparat pengawas internal pemerintah (**APIP**) dan Badan Pemeriksa Keuangan (**BPK**).
- Tidak ada tombol hapus (*No Delete Action*) atau tombol manipulasi data pada halaman ini guna menjamin asas keaslian bukti digital (*forensic digital integrity*).

### 10.3 Pencarian Cepat & Inspeksi Detail Perubahan JSON
- Kotak pencarian memungkinkan auditor mencari berdasarkan nama staf, NIP, jenis mutasi, atau alamat IP pengakses.
- Filter dropdown memungkinkan penyaringan khusus aktivitas tertentu (contoh: hanya melihat mutasi aset atau aktivitas otentikasi login).
- Tampilan blok JSON memiliki kontras tinggi dan dapat di-scroll secara horizontal untuk menginspeksi payload perubahan data.

---

## BAB 11: ARSITEKTUR FULLSTACK, SQLITE WAL & ANGGARAN APBD

### 11.1 Integrasi Server Backend Node.js & Database SQLite WAL
- **Backend API**: Berjalan menggunakan Node.js Express terpusat pada port 5001 dengan middleware keamanan ketat (`helmet`, `cors`, `rate-limit`).
- **Database Engine**: Menggunakan **SQLite mode WAL (Write-Ahead Logging)** yang berlokasi di folder terproteksi `data/simtik.db`.
  - Mengizinkan pembacaan (*concurrent read*) berkecepatan tinggi tanpa mengunci proses penulisan (*non-blocking write*).
  - Sangat hemat sumber daya server VPS (RAM < 60 MB) dan tahan terhadap gangguan pemadaman tiba-tiba (*crash resilient*).

### 11.2 Master Data 70 Pegawai Inspektorat Trenggalek
- Sistem telah terintegrasi dengan struktur organisasi riil Inspektorat Kabupaten Trenggalek:
  - Inspektur Daerah & Sekretariat (Subbag Perencanaan, Keuangan, Kepegawaian & Umum).
  - Inspektur Pembantu Wilayah I (Irban I).
  - Inspektur Pembantu Wilayah II (Irban II).
  - Inspektur Pembantu Wilayah III (Irban III).
  - Inspektur Pembantu Wilayah IV (Irban IV).
  - Inspektur Pembantu Bidang Investigasi & Pengaduan Masyarakat.
- Saat proses mutasi atau serah terima, nama dan NIP pegawai dapat dipilih langsung dari master data tanpa risiko salah ketik.

### 11.3 Pengelolaan Aset Berbasis APBD (±Rp 10 Miliar)
- Sistem mendukung pencatatan sumber pendanaan belanja modal:
  - Nomor Dokumen Pelaksanaan Anggaran (DPA).
  - Kode Rekening Belanja Modal TIK (Akun 5.2.02.xx).
  - Nomor Surat Perintah Pencairan Dana (SP2D) dan tanggal realisasi.
  - Nomor Kontrak Kerja Sama Pengadaan dengan Vendor/Penyedia.

---

## BAB 12: PELAPORAN, EKSPOR DATA & PEMELIHARAAN SERVER

### 12.1 Ekspor Spreadsheet Excel / CSV Sekali Klik
1. Buka halaman **Inventaris Aset** (`/assets/inventory`).
2. Klik tombol hijau **"Ekspor Excel/CSV"** di toolbar atas.
3. Berkas `Rekapitulasi_Aset_SIMTIK_[Tanggal].csv` akan otomatis diunduh.
4. Berkas ini menggunakan standar encoding **UTF-8 with BOM (`\uFEFF`)** sehingga saat dibuka pada Microsoft Excel versi berapa pun:
   - Format angka desimal, nominal Rupiah, dan tanggal tidak rusak (*corrupted*).
   - Memuat kolom data lengkap: dari Kode Barang, NUP, Nama Aset, SN, Kondisi, Pemegang, NIP, Ruangan, hingga Nilai Buku Akuntansi.
   - Siap diserahkan kepada auditor BPK atau diimpor ke aplikasi SIPD-BMD / SIMAN.

### 12.2 Prosedur Pembaruan & Deployment di Virtualmin/Webmin
Untuk memperbarui sistem di server VPS Virtualmin setiap ada update dari GitHub:
1. Masuk ke terminal SSH server VPS:
   ```bash
   cd /home/inspektorat/domains/simtik.inspektorat.trenggalekkab.go.id/simtik
   ```
2. Jalankan skrip otomatis yang telah disediakan:
   ```bash
   bash deploy-virtualmin.sh
   ```
   *Skrip ini secara otomatis akan menjalankan `git pull origin main`, `npm run build`, menyalin file produksi ke `../public_html/` (termasuk file konfigurasi `.htaccess`), dan me-restart service backend API PM2.*
3. Lakukan *Hard Refresh* di browser pengguna (`Ctrl + Shift + R` atau `Cmd + Shift + R`).

---

## BAB 13: MODUL MANAJEMEN DATA PEGAWAI (CRUD ASN)

### 13.1 Master Data 70 Pegawai Inspektorat (PNS & PPPK) (`/employees`)
Modul ini mengelola master data aparatur sipil negara (ASN) dan staf pada Inspektorat Kabupaten Trenggalek yang bersumber dari berkas resmi `docs/data-pegawai.csv`:
- **Struktur Kolom**: No, NIP, Nama Lengkap dengan Gelar, Nama Tanpa Gelar, Bidang/Inspektur Pembantu, Jabatan Dinas, Pangkat/Golongan, Tempat & Tanggal Lahir, Nomor WhatsApp, dan Email Aktif.
- **Pencarian Cepat & Filter**: Memungkinkan pencarian instan berdasarkan nama pegawai, NIP (18 digit), atau jabatan, serta filter khusus per bidang/seksi (Irban I, Irban II, Irban III, Irban IV, Irban Khusus/Investigasi, Sekretariat).
- **Statistik ASN**: Kartu ringkasan jumlah total pegawai, fungsional pemeriksa APIP (Auditor & PPUPD), pejabat struktural, serta staf operasional.

### 13.2 Tambah Pegawai Baru (Create)
1. Akses menu **Manajemen Pegawai** dari sidebar navigasi.
2. Klik tombol **"Tambah Pegawai Baru"** di pojok kanan atas.
3. Masukkan data pegawai pada modal formulir:
   - Nama Lengkap dengan Gelar (wajib).
   - NIP (sistem memvalidasi keunikan NIP agar tidak terjadi duplikasi).
   - Bidang / Unit Kerja (pilih dari dropdown).
   - Jabatan, Pangkat, dan Golongan ruang (IV/c s/d I).
   - Tempat & Tanggal Lahir.
   - Nomor WhatsApp aktif (otomatis membentuk tautan chat langsung).
   - Alamat email kedinasan.
4. Klik tombol **"Tambah Pegawai"**. Data baru langsung tersimpan ke database SQLite WAL dan tercatat pada Jejak Audit Forensik APIP (`ADD_EMPLOYEE`).

### 13.3 Pembaruan Data Pegawai (Update)
1. Pada baris pegawai yang ingin diubah, klik tombol ikon pensil **Ubah (Edit)**.
2. Formulir modal akan terisi otomatis dengan data pegawai saat ini.
3. Perbarui informasi yang diperlukan (misal: kenaikan pangkat/golongan, mutasi antar-Irban, atau pergantian nomor HP).
4. Klik **"Simpan Perubahan"**. Sistem memperbarui data pegawai dan secara otomatis menyinkronkan nama pemegang pada aset yang sedang aktif dipinjam oleh pegawai tersebut.
5. Aktivitas tercatat pada Jejak Audit APIP (`UPDATE_EMPLOYEE`) lengkap dengan rekaman data lama vs data baru.

### 13.4 Proteksi Hapus Pegawai & Integritas Aset (Delete)
1. Klik tombol ikon tempat sampah **Hapus (Delete)** pada baris pegawai.
2. **Proteksi Integritas Aset Dinas**:
   - Sistem melakukan pengecekan silang otomatis terhadap inventaris aset (`assets` table).
   - Jika pegawai tercatat **masih memegang aset inventaris** (*Status: In Use*), tombol konfirmasi hapus akan **dikunci (disabled)** dan muncul peringatan merah yang menampilkan rincian barang inventaris beserta nomor NUP yang masih dipegang pegawai tersebut.
   - Petugas diwajibkan melakukan serah terima / mutasi kembali aset ke gudang logistik terlebih dahulu sebelum data pegawai dapat dihapus.
3. Jika pegawai tidak memegang aset, klik **"Ya, Hapus Pegawai"** untuk menonaktifkan data pegawai dari sistem penatausahaan. Aktivitas tercatat pada Jejak Audit (`DELETE_EMPLOYEE`).

### 13.5 Ekspor Data Pegawai ke Spreadsheet Excel/CSV
1. Klik tombol **"Ekspor CSV"** di bilah atas halaman `/employees`.
2. Berkas CSV ber-encoding **UTF-8 with BOM (`\uFEFF`)** akan langsung terunduh secara otomatis.
3. Berkas memuat 12 kolom master data ASN yang rapi dan siap dicetak atau dianalisis langsung menggunakan Microsoft Excel tanpa masalah karakter rusak.

---

## KESIMPULAN & DUKUNGAN TEKNIS
Aplikasi **SIM-TIK v2.4 Enterprise** telah memenuhi seluruh standar regulasi, tata kelola barang milik daerah/negara, keamanan data audit trail forensik, transparansi anggaran APBD, master data kepegawaian ASN terpadu, serta kenyamanan antarmuka modern ramah mata (*consistent dark mode*). Untuk kendala operasional lebih lanjut, silakan hubungi Tim Pengelola Sistem Informasi & Aset TIK Inspektorat Kabupaten Trenggalek.

