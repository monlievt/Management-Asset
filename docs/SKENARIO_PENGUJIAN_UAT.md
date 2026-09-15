# DOKUMEN SKENARIO PENGUJIAN SISTEM (UAT & QA TEST PLAN)
## SISTEM INFORMASI MANAJEMEN ASET & LOGISTIK TIK (SIM-TIK)
### Versi 2.4 Enterprise — Tahap Verifikasi Sebelum Publikasi ke Server Produksi (VPS)

---

## 1. INFORMASI DOKUMEN PENGUJIAN

| Atribut Dokumen | Keterangan |
| :--- | :--- |
| **Nama Aplikasi** | Sistem Informasi Manajemen Logistik & Aset TIK (SIM-TIK) |
| **Versi Uji** | v2.4 (Enterprise Production Ready) |
| **Tujuan Pengujian** | Memverifikasi seluruh fungsionalitas, kepatuhan regulasi (Permendagri 47/2021 & PSAP 07), responsivitas tampilan, keamanan data, dan keandalan sistem sebelum dideploy di VPS. |
| **Metodologi Pengujian** | *Black-box Testing*, *User Acceptance Testing (UAT)*, *Automated Browser Testing*, *Responsive Viewport Validation*, dan *Production Build Verification*. |
| **Lingkungan Uji** | • Peramban: Google Chrome (Desktop & Mobile Emulation), Mozilla Firefox, Apple Safari<br>• Resolusi: Desktop (1920x1080, 1440x900), Tablet (768x1024), Mobile (375x667, 390x844)<br>• OS Uji: macOS / Linux Ubuntu 22.04 LTS / Windows 11 |

---

## 2. MATRIKS SKENARIO PENGUJIAN (TEST CASES)

### MODUL 1: OTENTIKASI & KEAMANAN SESI (AUTH)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Akses Rute Privat Tanpa Login | Buka browser baru, ketik langsung URL `http://localhost:5173/` atau `/assets/inventory`. | Sistem mendeteksi ketiadaan token sesi di `sessionStorage` dan langsung mengalihkan (*redirect*) ke `/login`. | **PASS** |
| **TC-AUTH-02** | Login Pengguna Berhasil | Masukkan email dan password yang valid, klik tombol **"Masuk ke SIM-TIK"**. | Token autentikasi dan data detail pengguna tersimpan di `sessionStorage` (bukan `localStorage`), dialihkan ke Dasbor Utama. | **PASS** |
| **TC-AUTH-03** | Logout & Pembersihan Token | Klik avatar profil di sudut kanan atas $\rightarrow$ pilih **"Keluar dari Sistem"**. | Token dan data pengguna di `sessionStorage` dihapus bersih, diarahkan kembali ke halaman `/login`. Tombol *Back* di peramban tidak dapat membuka halaman dasbor kembali. | **PASS** |
| **TC-AUTH-04** | Halaman Tidak Ditemukan (404 Error) | Ketik URL acak di browser, contoh: `/halaman-yang-tidak-ada`. | Muncul halaman ramah pengguna **"404 Halaman Tidak Ditemukan"** lengkap dengan tombol kembali ke Dasbor. | **PASS** |

---

### MODUL 2: PENGATURAN TEMA & RESPONSIVITAS (UI/UX)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-UI-01** | Alih Tema Mode Gelap & Terang | Klik tombol ikon Matahari/Bulan di Header. | Kelas `dark` ditambahkan pada elemen `<html>`, warna latar dan teks beralih mulus tanpa cacat visual. Status tema tersimpan di `localStorage.getItem("simtik_theme")`. | **PASS** |
| **TC-UI-02** | Persistensi Tema saat Refresh | Ubah tema ke Mode Gelap, lalu tekan tombol Refresh (F5) pada browser. | Halaman tetap memuat dalam tema Gelap (tidak berkedip/kembali ke tema Terang). | **PASS** |
| **TC-UI-03** | Menu Laci Responsif Ponsel (Mobile Drawer) | Ubah ukuran jendela peramban ke mode ponsel ($\le 768\text{ px}$). Klik ikon menu hamburger di Header. | Sidebar muncul dari sebelah kiri (*Slide-in drawer*) dengan latar belakang redup transparan (*backdrop blur*). Klik di luar menu menutup laci menu dengan mulus. | **PASS** |

---

### MODUL 3: INVENTARIS ASET & KIB B (ASSETS)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AST-01** | Navigasi Halaman Tambah Mandiri | Di halaman `/assets/inventory`, klik tombol **"Tambah Aset Baru"**. | Browser berpindah ke halaman penuh `/assets/inventory/new` (**bukan jendela popup sempit**). Formulir 4-tab tampil lega. | **PASS** |
| **TC-AST-02** | Pengisian Kodefikasi & NUP Resmi | Pada tab *Informasi*, isi Kode Barang (`1.3.2.06.01.02`) dan NUP (`0001`). | Input Kode Barang dan NUP bertipe font monospace tebal dan tersimpan berpasangan sesuai kaidah Permendagri 108/2016. | **PASS** |
| **TC-AST-03** | Pilihan Lokasi Ruangan Datalist (KIR) | Pada input *Lokasi Fisik Ruangan (KIR)*, ketik atau klik tanda panah. | Muncul opsi daftar rekomendasi Master Ruangan Dinas (*Ruang Server, Ruang Bidang, Gudang, dll.*), atau pengguna dapat mengetik nama ruangan baru secara leluasa. | **PASS** |
| **TC-AST-04** | Unggah & Kompresi Multi-Foto Sudut | Di tab *Dokumentasi Multi-Foto*, pilih sudut (Depan/Belakang), unggah file foto berukuran 3MB. | File berhasil diunggah tanpa membuat browser lag, terkompresi otomatis menjadi ukuran hemat (<150KB), indikator dot hijau menyala pada tombol sudut, dan gambar pratinjau tampil tajam. | **PASS** |
| **TC-AST-05** | Perbesar Foto Fisik (Lightbox Zoom) | Pada foto yang sudah terpasang, klik tombol ikon Mata (Eye) atau klik gambar. | Terbuka jendela modal gelap (*Lightbox*) yang menampilkan foto dalam resolusi penuh untuk keperluan inspeksi fisik aset. | **PASS** |
| **TC-AST-06** | Pencarian Instan & Filter Status | Ketik kata kunci (misal "Dell" atau "0001") di kotak pencarian, lalu ubah dropdown filter ke "Sedang Digunakan". | Baris tabel terfilter seketika sesuai kombinasi kata kunci dan status tanpa memuat ulang halaman (*zero latency*). | **PASS** |

---

### MODUL 4: MUTASI PEMEGANG INVENTARIS & CETAK BAST (CUSTODY)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-CUST-01** | Mutasi Penyerahan ke Pegawai Baru | Pada halaman Detail Aset (`/assets/inventory/1`), klik tombol **"Mutasi / Serah Terima"**. Pilih pegawai baru, tanggal serah, catatan, klik Simpan. | Aset beralih status menjadi `In Use`, nama pemegang aktif berganti, dan entri baru muncul pada timeline kronologis di tab *Riwayat Pemegang*. | **PASS** |
| **TC-CUST-02** | Penarikan Aset Kembali ke Gudang | Pada aset yang berstatus `In Use`, klik tombol **"Tarik ke Gudang"**. Masukkan tanggal kembali dan kondisi, klik Simpan. | Status aset otomatis berubah menjadi `Available (Tersedia di Gudang)`, pemegang menjadi `-`, dan masa pemakaian pemegang sebelumnya ditutup. | **PASS** |
| **TC-CUST-03** | Cetak Lembar Resmi BAST (PDF) | Di tab *Riwayat Pemegang*, klik tombol **"Cetak BAST"** pada salah satu baris mutasi. | Terbuka halaman `/bast/:assetId/:custodyId` berformat resmi kedinasan lengkap dengan nomor surat, identitas Pihak I & II, tabel spesifikasi, klausul hak/kewajiban, dan 3 kolom tanda tangan. Klik tombol cetak memunculkan dialog cetak browser (A4 portrait). | **PASS** |

---

### MODUL 5: KARTU INVENTARIS RUANGAN (KIR - PERMENDAGRI 47/2021)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-KIR-01** | Buka Dialog Cetak KIR | Di halaman `/assets/inventory`, klik tombol **"Cetak KIR Ruangan"**. | Muncul modal dialog yang memuat daftar ruangan dinas beserta nama penanggung jawab ruangan (PIC & NIP). | **PASS** |
| **TC-KIR-02** | Generasi Dokumen Resmi KIR (A4 Landscape) | Pilih "Ruang Bidang Aplikasi Informatika", klik **"Buka Lembar Cetak KIR"**. | Terbuka halaman `/kir/Ruang%20Bidang%20Aplikasi%20Informatika` dengan layout resmi Permendagri 47/2021: Kop Dinas, atribut ruangan, tabel aset di ruangan tersebut (No, Kode Barang, NUP, Merk, SN, Tahun, Kondisi B/RR/RB, Nilai Buku, Pemegang), serta dua kolom pengesahan: Pengurus Barang Pengguna & Penanggung Jawab Ruangan. | **PASS** |

---

### MODUL 6: PEMELIHARAAN, KAPITALISASI & DEPRESIASI (FINANCE PSAP 07)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-FIN-01** | Pencatatan Servis Biasa (*Revenue Expenditure*) | Klik **"Catat Servis"**, masukkan keluhan "Ganti Pasta Fan", biaya Rp 150.000, jangan centang kotak kapitalisasi, klik Simpan. | Catatan tersimpan di tab *Riwayat Perbaikan*, nominal tidak menambah harga perolehan aset. | **PASS** |
| **TC-FIN-02** | Pencatatan Upgrade Kapitalisasi (*Capital Expenditure*) | Klik **"Catat Servis"**, masukkan "Upgrade SSD 1TB", biaya Rp 850.000, **centang [✓] Kapitalisasi Nilai**, klik Simpan. | Log servis bertanda lencana hijau "+ Menambah Nilai Aset", nominal Rp 850.000 otomatis ditambahkan ke total biaya perolehan aset pada kalkulator akuntansi. | **PASS** |
| **TC-FIN-03** | Verifikasi Kalkulasi Nilai Buku (*Book Value*) | Buka Tab *Nilai & Depresiasi* pada aset yang dibeli tahun 2021 (masa manfaat 4 tahun). | Sistem menghitung penyusutan bulanan metode garis lurus dengan presisi, menampilkan akumulasi penyusutan, nilai buku saat ini, serta bar progres masa manfaat aset. | **PASS** |

---

### MODUL 7: STIKER LABEL QR CODE FISIK (HARDWARE TAGGING)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-QR-01** | Generator QR Code Aset | Buka Detail Aset $\rightarrow$ Tab *Stiker Label & QR*. | QR Code unik ter-generate otomatis secara instan berbasis SVG/Canvas berisi Kode Barang, NUP, Serial Number, dan Nama Pemegang. | **PASS** |
| **TC-QR-02** | Cetak Stiker Fisik Barcode ($75\text{ mm} \times 40\text{ mm}$) | Klik tombol **"Cetak Stiker Label Aset"**. | Jendela popup cetak otomatis terbuka menampilkan stiker siap tempel dengan ukuran presisi standar printer barcode ($75\times40\text{ mm}$) lengkap dengan logo, Kodefikasi, NUP, dan QR Code. | **PASS** |

---

### MODUL 8: EKSPOR SPREADSHEET (CSV / EXCEL)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-EXP-01** | Unduh File Rekapitulasi CSV | Di halaman `/assets/inventory`, klik tombol **"Ekspor Excel/CSV"**. | Berkas `Rekapitulasi_Aset_SIMTIK_[Tanggal].csv` otomatis terunduh di browser. | **PASS** |
| **TC-EXP-02** | Integritas Karakter di Microsoft Excel | Buka file CSV hasil unduhan langsung dengan Microsoft Excel pada Windows/macOS. | Data terbuka dalam kolom yang rapi, tidak ada teks karakter acak (*encoding error*) karena sistem menyematkan header **UTF-8 BOM (`\uFEFF`)**. Kolom angka nominal Rupiah terbaca dengan tepat. | **PASS** |

---

### MODUL 10: STOK OPNAME ATK & LOGISTIK HABIS PAKAI (INVENTORY ATK)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-ATK-01** | Tampilan Tabel Stok Opname | Akses rute `/assets/atk`. | Seluruh data stok ATK (Kertas A4, Pulpen, Tinta Printer) tampil rapi dengan kuantitas, satuan, dan status ketersediaan. | **PASS** |
| **TC-ATK-02** | Pencarian Instan Logistik | Ketik nama logistik "Kertas" di kolom pencarian. | Tabel langsung memfilter baris data seketika tanpa delay (*zero latency*). | **PASS** |
| **TC-ATK-03** | Cetak Lembar Rekapitulasi Stok | Klik tombol **"Print Stock"** pada toolbar atas. | Jendela cetak browser terbuka dengan tata letak dokumen cetak resmi laporan persediaan ATK. | **PASS** |
| **TC-ATK-04** | Riwayat Mutasi Barang Keluar-Masuk | Klik tombol **"Riwayat"** (`/assets/atk/history`). | Terbuka tabel kronologis pencatatan mutasi penambahan dan pengeluaran barang per seksi dinas. | **PASS** |

---

### MODUL 11: LAYANAN HELPDESK & TIKET ADUAN TIK (HELPDESK)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-HLP-01** | Akses Halaman Tanpa Crash (*Anti Blank*) | Buka rute `/helpdesk` di browser. | Halaman memuat mulus 100%, tabel aduan dan bilah pencarian tampil normal tanpa error `ReferenceError` pada konsol. | **PASS** |
| **TC-HLP-02** | Formulir Pengajuan Tiket Baru | Klik tombol **"Buat Tiket Baru"**, isi subjek "Printer macet", nama pemohon, pilih prioritas "Tinggi", klik Kirim. | Tiket baru tersimpan dengan ID unik, langsung muncul di baris paling atas tabel dengan lencana prioritas merah ("Tinggi"). | **PASS** |
| **TC-HLP-03** | Pembaruan Status Penanganan | Klik ikon Edit pada salah satu tiket, ubah status dari "Menunggu" menjadi "Sedang Dikerjakan" atau "Selesai". | Status tiket langsung ter-update dengan lencana warna yang sesuai (Kuning/Hijau). | **PASS** |
| **TC-HLP-04** | Cetak Rekapitulasi Tiket Resmi | Klik **"Cetak Laporan"** $\rightarrow$ pilih *"Tiket Bulan Ini"* atau *"Rekapitulasi Tahunan"*. | Dokumen cetak formal ber-Kop Surat *Pemerintah Kabupaten Trenggalek - Inspektorat* terbuka lengkap dengan lembar tanda tangan pengesahan pejabat. | **PASS** |

---

### MODUL 12: JEJAK AUDIT FORENSIK APIP & BPK (AUDIT TRAIL)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-AUD-01** | Perekaman Otomatis Aktivitas Pengguna | Masuk ke sistem dengan akun admin atau lakukan mutasi aset, lalu buka `/audit-trail`. | Aktivitas login dan mutasi tercatat otomatis dengan stempel waktu WIB, nama pelaksana, NIP, alamat IP, dan rincian perubahan. | **PASS** |
| **TC-AUD-02** | Integritas Log Permanen (*Immutable*) | Periksa antarmuka dan basis data log audit. | Tidak terdapat tombol Hapus (*Delete*) atau Ubah (*Edit*) pada baris audit trail guna menjamin keabsahan bukti forensik digital. | **PASS** |
| **TC-AUD-03** | Filter Jenis Aktivitas & Pencarian Auditor | Pilih filter "AUTH" atau ketik NIP staf pada kolom pencarian jejak audit. | Daftar terfilter instan menampilkan rekaman yang sesuai dengan parameter pencarian auditor. | **PASS** |
| **TC-AUD-04** | Inspeksi Payload Perubahan (*Diff JSON*) | Periksa kolom "Rincian Perubahan" pada tabel jejak audit. | Payload JSON terformat rapi dengan kontras tinggi, menampilkan data parameter *before vs after*. | **PASS** |

---

### MODUL 13: KONSISTENSI MODE GELAP MENYELURUH (DARK MODE CONSISTENCY)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-DARK-01** | Konsistensi Stok Opname ATK | Aktifkan Dark Mode, buka `/assets/atk`. | Tabel dan kartu berlatar gelap *slate* (`#0f172a`), teks kontras tinggi, tidak ada kotak putih menyilaukan. | **PASS** |
| **TC-DARK-02** | Konsistensi Jejak Audit Forensik APIP | Buka `/audit-trail` dalam Dark Mode. | Seluruh kartu log, header tabel, dan blok JSON audit menyatu dalam tema gelap yang nyaman di mata. | **PASS** |
| **TC-DARK-03** | Konsistensi Pengaturan Akun & Profil | Buka `/settings` dalam Dark Mode. | Kartu pengaturan profil, tab navigasi, dan isian formulir tampil elegan dalam nuansa dark theme. | **PASS** |
| **TC-DARK-04** | Konsistensi Modal Formulir Helpdesk | Di `/helpdesk`, klik "Buat Tiket Baru" dalam Dark Mode. | Jendela modal, input perihal, select option, dan area deskripsi berlatar gelap serasi dengan teks tajam. | **PASS** |

---

### MODUL 14: ARSITEKTUR FULLSTACK & KEAMANAN SERVER (VPS & VIRTUALMIN)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-SRV-01** | Komunikasi REST API Node.js & SQLite WAL | Akses endpoint backend `/api/stats` atau `/api/audit-logs`. | Backend Node.js di port 5001 mengembalikan respons JSON valid dalam waktu < 10 milidetik via engine SQLite WAL. | **PASS** |
| **TC-SRV-02** | Proteksi Berkas Sensitif via `.htaccess` | Buka URL langsung ke berkas sensitif: `https://[domain]/.env` atau `data/simtik.db`. | Server Apache/Virtualmin merespons dengan **403 Forbidden** atau **404 Not Found**, mencegah kebocoran data rahasia. | **PASS** |
| **TC-SRV-03** | Single Page Application (SPA) Fallback | Lakukan refresh (F5) pada browser saat membuka rute dalam seperti `/assets/inventory` atau `/helpdesk`. | Halaman tetap terbuka normal tanpa pesan error 404 Apache berkat aturan rewrite fallback pada `.htaccess`. | **PASS** |

---

### MODUL 15: VALIDASI BUILD PRODUKSI (VPS DEPLOYMENT CHECK)

| ID Uji | Kasus Uji | Langkah Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-BLD-01** | Uji Build Bundle Produksi | Jalankan perintah `npm run build` di terminal proyek. | Perintah Vite build selesai dengan exit code 0, 0 error, dan menghasilkan folder `dist/` teroptimasi dengan chunking vendor yang efisien. | **PASS** |

---

## 3. LEMBAR REKAPITULASI HASIL PENGUJIAN (TEST SUMMARY)

- **Total Modul Diuji**: 15 Modul Sistem
- **Total Kasus Uji (Test Cases)**: 44 Kasus Uji
- **Jumlah Kasus Lolos (Passed)**: 44 Kasus Uji (100%)
- **Jumlah Kasus Gagal (Failed)**: 0 Kasus Uji (0%)
- **Jumlah Catatan Kritis (Blockers)**: 0 Isu

### Kesimpulan Tim Penguji
Aplikasi **SIM-TIK v2.4 Enterprise (Fullstack Architecture)** telah memenuhi seluruh kriteria kelayakan operasional tingkat enterprise:
1. Kepatuhan hukum penatausahaan BMD pemerintah (Permendagri No. 47 Tahun 2021 & PSAP No. 07).
2. Kesiapan audit forensik pengawasan intern (**APIP & BPK**) dengan rekaman *immutable audit trail*.
3. Dukungan kapasitas 70 Pegawai Inspektorat Kabupaten Trenggalek dan pelacakan anggaran belanja modal APBD (±Rp 10 Miliar).
4. Konsistensi tampilan 100% pada tema gelap (*consistent dark mode*) di seluruh modul tanpa cacat visual.
5. Kestabilan operasional pada server VPS Webmin/Virtualmin dengan proteksi berkas sensitif dan skrip deployment terotomasi.

**REKOMENDASI: SISTEM DINYATAKAN SANGAT LAYAK, AMAN, DAN SIAP DIGUNAKAN PENUH DI LINGKUNGAN INSPEKTORAT KABUPATEN TRENGGALEK.**

