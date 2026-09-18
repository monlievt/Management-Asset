import { useState } from "react"
import {
    Sparkles, CheckCircle2, Building2, Users, ShieldCheck,
    Database, FileText, Moon, Layers, ExternalLink, X, Laptop,
    Sliders, Printer, Shield, Check, HardDrive, ShoppingCart
} from "lucide-react"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"

export function ReleaseNotesModal({ isOpen, onClose }) {
    const [activeSection, setActiveSection] = useState("all")

    const features = [
        {
            category: "backup",
            icon: HardDrive,
            title: "Pencadangan Basis Data Otomatis & Notifikasi (Telegram & WAHA)",
            badge: "Unggulan v2.6",
            badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
            description: "Sistem snapshot SQLite WAL otomatis dengan integrasi bot Telegram dan WhatsApp HTTP API (WAHA).",
            points: [
                "Snapshot aman tanpa henti layanan menggunakan native db.backup SQLite WAL.",
                "Pengiriman berkas .db dan ringkasan statistik otomatis ke Bot / Channel Telegram.",
                "Integrasi gateway WhatsApp (WAHA) untuk notifikasi ringkasan cadangan ke nomor pimpinan/admin.",
                "Tombol unduh fisik berkas .db instan langsung ke komputer pengguna.",
                "Background scheduler internal otomatis (Harian, Mingguan, Bulanan) pada jam WIB yang ditentukan.",
                "Pembersihan otomatis cadangan lama dengan mempertahankan 10 arsip terbaru."
            ]
        },
        {
            category: "atk",
            icon: ShoppingCart,
            title: "Akses Mandiri Pengambilan ATK (Self-Checkout 5 Detik)",
            badge: "Inovasi v2.6",
            badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
            description: "Solusi ruangan ATK bebas akses dengan pencatatan mutasi super cepat bagi seluruh pegawai dinas.",
            points: [
                "Kios Layanan Mandiri Tablet Layar Sentuh dengan mode fullscreen.",
                "Poster QR Code Ruangan untuk pemindaian instan via HP tanpa perlu login rumit.",
                "Verifikasi NIP / Nama 70 ASN resmi Inspektorat Trenggalek.",
                "Sinkronisasi otomatis mutasi barang keluar dan sisa stok persediaan."
            ]
        },
        {
            category: "ui",
            icon: Sliders,
            title: "Standardisasi Bahasa & Button Design System",
            badge: "Penyempurnaan",
            badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
            description: "Penyempurnaan bahasa Indonesia baku kedinasan 100% dan unifikasi estetika tombol antarmuka.",
            points: [
                "Pembersihan seluruh istilah campuran bahasa Inggris pada formulir dan modul aplikasi.",
                "Unifikasi bentuk border-radius rounded-lg (8px) dan varian warna success emerald.",
                "Penyelesaian masalah infinite re-render loop pada navigasi stok opname."
            ]
        },
        {
            category: "master",
            icon: Building2,
            title: "Pusat Data Master Sistem (Master Data Hub)",
            badge: "Fitur Enterprise",
            badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
            description: "Panel terpusat untuk mengelola seluruh data referensi organisasi secara dinamis tanpa mengubah kode sumber.",
            points: [
                "Editor Unit Kerja / Bidang (CRUD lengkap) dengan Auto-Cascade ke data pegawai.",
                "Shortcut cepat 'Kelola Unit Kerja' langsung dari halaman Manajemen Pegawai.",
                "Proteksi penghapusan berelasi: Unit kerja yang masih memiliki pegawai dikunci dari penghapusan.",
                "Master Ruangan Dinas (KIR Permendagri No. 47/2021) lengkap dengan penunjukan PIC & NIP dari daftar pegawai.",
                "Master Kategori Aset TIK terstandarisasi untuk klasifikasi inventaris dinas.",
                "Konfigurasi Pejabat Penandatangan Dokumen Resmi (Kepala SKPD/Inspektur, Pengurus Barang, Kasubbag Umum) & Kop Surat Instansi."
            ]
        },
        {
            category: "employees",
            icon: Users,
            title: "Manajemen Data Pegawai (CRUD ASN Inspektorat)",
            badge: "Enterprise",
            badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
            description: "Modul pengelolaan master data aparatur sipil negara (ASN) dan staf pada Inspektorat Kabupaten Trenggalek.",
            points: [
                "Integrasi 70 data pegawai resmi (PNS & PPPK) dari data kepegawaian dinas.",
                "Operasi CRUD lengkap: Tambah Pegawai Baru, Ubah Data, dan Hapus Pegawai.",
                "Proteksi integritas aset: Sistem mengunci tombol hapus jika pegawai masih memegang aset dinas aktif (Status: In Use).",
                "Sinkronisasi otomatis nama pemegang aset dinas saat data pegawai diperbarui.",
                "Ekspor Master Data Pegawai ke Spreadsheet Excel/CSV (UTF-8 with BOM \\uFEFF) rapi tanpa karakter rusak."
            ]
        },
        {
            category: "backend",
            icon: Database,
            title: "Arsitektur Fullstack & SQLite WAL Engine",
            badge: "Performa Tinggi",
            badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
            description: "Peningkatan arsitektur dari frontend murni menjadi sistem Fullstack terintegrasi server backend dan database berkecepatan tinggi.",
            points: [
                "Server Backend Node.js Express terpusat di port 5001 dengan rate-limiting dan proteksi helmet.",
                "Database SQLite mode WAL (Write-Ahead Logging) di folder aman data/simtik.db (non-blocking write, concurrent read < 10ms).",
                "Jejak Audit Forensik APIP (Audit Trail) otomatis dan tidak dapat diubah (immutable).",
                "Proteksi berkas rahasia via Apache .htaccess di server Virtualmin (403 Forbidden untuk .env dan database)."
            ]
        }
    ]

    const filteredFeatures = activeSection === "all"
        ? features
        : features.filter(f => f.category === activeSection)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Catatan Rilis & Fitur Terupdate SIM-TIK"
            size="xl"
        >
            <div className="space-y-6">
                {/* Banner Versi Terupdate */}
                <div className="rounded-xl p-5 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-800 text-white shadow-md relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold text-xs">
                                Versi Terupdate 2.6.0 Enterprise
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-medium text-xs border border-emerald-400/30">
                                Rilis Resmi September 2026
                            </span>
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight">
                            SIM-TIK Inspektorat Kabupaten Trenggalek
                        </h3>
                        <p className="mt-1 text-xs text-primary-100 max-w-2xl leading-relaxed">
                            Aplikasi penatausahaan aset TIK, stok logistik ATK, helpdesk, jejak audit APIP, dan cadangan otomatis Telegram/WAHA dengan arsitektur Fullstack SQLite WAL berstandar Permendagri No. 47 Tahun 2021 & PSAP No. 07.
                        </p>
                    </div>
                </div>

                {/* Filter Kategori Fitur */}
                <div className="flex flex-wrap gap-2 pb-1 border-b border-secondary-200 dark:border-secondary-800">
                    <button
                        type="button"
                        onClick={() => setActiveSection("all")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "all"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Semua Fitur ({features.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection("backup")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "backup"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Backup & Notifikasi
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection("atk")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "atk"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Ambil ATK Mandiri
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection("master")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "master"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Pusat Data Master
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection("employees")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "employees"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Pegawai ASN
                    </button>
                </div>

                {/* Daftar Fitur Terperinci */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredFeatures.map((f, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 shadow-xs hover:border-primary-300 dark:hover:border-primary-700 transition"
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                                        <f.icon className="h-4 w-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-secondary-900 dark:text-white">
                                        {f.title}
                                    </h4>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${f.badgeColor}`}>
                                    {f.badge}
                                </span>
                            </div>

                            <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-3 leading-relaxed">
                                {f.description}
                            </p>

                            <div className="space-y-1.5 border-t border-secondary-100 dark:border-secondary-800/80 pt-2.5">
                                {f.points.map((pt, pIdx) => (
                                    <div key={pIdx} className="flex items-start gap-2 text-xs text-secondary-700 dark:text-secondary-300">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{pt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Modal */}
                <div className="flex items-center justify-between pt-2 border-t border-secondary-100 dark:border-secondary-800">
                    <p className="text-[11px] text-secondary-500 dark:text-secondary-400">
                        SIM-TIK Versi 2.6.0 Enterprise • Inspektorat Trenggalek
                    </p>
                    <Button onClick={onClose} size="sm">
                        Tutup Catatan Rilis
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
