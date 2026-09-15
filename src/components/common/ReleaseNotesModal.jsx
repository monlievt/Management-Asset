import { useState } from "react"
import {
    Sparkles, CheckCircle2, Building2, Users, ShieldCheck,
    Database, FileText, Moon, Layers, ExternalLink, X, Laptop,
    Sliders, Printer, Shield, Check
} from "lucide-react"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"

export function ReleaseNotesModal({ isOpen, onClose }) {
    const [activeSection, setActiveSection] = useState("all")

    const features = [
        {
            category: "master",
            icon: Building2,
            title: "Pusat Data Master Sistem (Master Data Hub)",
            badge: "Fitur Baru",
            badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
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
            badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
            description: "Peningkatan arsitektur dari frontend murni menjadi sistem Fullstack terintegrasi server backend dan database berkecepatan tinggi.",
            points: [
                "Server Backend Node.js Express terpusat di port 5001 dengan rate-limiting dan proteksi helmet.",
                "Database SQLite mode WAL (Write-Ahead Logging) di folder aman data/simtik.db (non-blocking write, concurrent read < 10ms).",
                "Jejak Audit Forensik APIP (Audit Trail) otomatis dan tidak dapat diubah (immutable).",
                "Proteksi berkas rahasia via Apache .htaccess di server Virtualmin (403 Forbidden untuk .env dan database)."
            ]
        },
        {
            category: "documents",
            icon: FileText,
            title: "Standar Hukum Dokumen Penatausahaan BMD",
            badge: "Kepatuhan Regulasi",
            badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
            description: "Seluruh format dokumen cetak resmi diselaraskan dengan regulasi penatausahaan barang milik daerah yang berlaku.",
            points: [
                "BAST Serah Terima Aset TIK dinamis memuat Kop Dinas & Pejabat Penandatangan terbaru.",
                "Lembar Kartu Inventaris Ruangan (KIR) format cetak A4 Landscape sesuai Permendagri No. 47 Tahun 2021.",
                "Kalkulator Depresiasi Nilai Barang Garis Lurus (Straight-Line Method) sesuai PSAP No. 07.",
                "Pelacakan pengadaan belanja modal berbasis DPA, SP2D, dan anggaran APBD (±Rp 10 Miliar)."
            ]
        },
        {
            category: "ui",
            icon: Moon,
            title: "Konsistensi Mode Gelap (High-Contrast Dark Mode)",
            badge: "UI/UX Polished",
            badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
            description: "Penyempurnaan tampilan antarmuka ramah mata tanpa ada teks gelap di atas latar belakang hitam.",
            points: [
                "Konsistensi 100% pada seluruh halaman: Stok Opname ATK, Helpdesk, Audit Trail, Pengaturan, dan Data Pegawai.",
                "Kontras warna standar WCAG AA dengan border elegan dark:border-secondary-800.",
                "Dukungan penuh antarmuka responsif untuk perangkat mobile, tablet, hingga desktop resolusi tinggi."
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
                                Versi Terupdate 2.5.0 Enterprise
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-medium text-xs border border-emerald-400/30">
                                Rilis Resmi September 2026
                            </span>
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight">
                            SIM-TIK Inspektorat Kabupaten Trenggalek
                        </h3>
                        <p className="mt-1 text-xs text-primary-100 max-w-2xl leading-relaxed">
                            Aplikasi penatausahaan aset TIK, stok logistik ATK, helpdesk, dan jejak audit APIP dengan arsitektur Fullstack SQLite WAL berstandar Permendagri No. 47 Tahun 2021 & PSAP No. 07.
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
                    <button
                        type="button"
                        onClick={() => setActiveSection("backend")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "backend"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Fullstack & Keamanan
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSection("documents")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSection === "documents"
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"
                        }`}
                    >
                        Regulasi & BAST
                    </button>
                </div>

                {/* Daftar Fitur Terperinci */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredFeatures.map((feat, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 shadow-xs space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-lg bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                                        <feat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-secondary-900 dark:text-white">
                                            {feat.title}
                                        </h4>
                                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                            {feat.description}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${feat.badgeColor}`}>
                                    {feat.badge}
                                </span>
                            </div>

                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-secondary-100 dark:border-secondary-800/80">
                                {feat.points.map((pt, pIdx) => (
                                    <li key={pIdx} className="flex items-start gap-2 text-xs text-secondary-700 dark:text-secondary-300">
                                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <span>{pt}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer Modal */}
                <div className="pt-4 border-t border-secondary-200 dark:border-secondary-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-secondary-500">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary-600" />
                        <span>Sistem Siap Operasi Produksi pada VPS Virtualmin / Webmin</span>
                    </div>
                    <Button onClick={onClose}>
                        Tutup & Mengerti
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
