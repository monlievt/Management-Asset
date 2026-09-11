import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
    ArrowLeft, Edit3, Trash2, UserCheck, Wrench, DollarSign,
    Layers, QrCode, FileText, CheckCircle2, Clock, Calendar,
    Building2, ShieldCheck, Tag, Box, AlertTriangle, Printer,
    ArrowRightLeft, LogIn, ChevronRight, Eye
} from "lucide-react"
import {
    getAssetById,
    assignAssetToEmployee,
    returnAssetToWarehouse,
    addMaintenanceRecord,
    calculateDepreciation,
    deleteAsset,
    PHOTO_ANGLES
} from "../data/assetsStore"
import { EMPLOYEE_LIST } from "../data/employees"
import { AssetQrCode } from "../components/assets/AssetQrCode"
import { Modal } from "../components/ui/Modal"

export default function AssetDetailView() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [asset, setAsset] = useState(null)
    const [activeTab, setActiveTab] = useState("specs")
    const [lightboxImage, setLightboxImage] = useState(null)

    // State Modals
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Form states for modals
    const [assignPayload, setAssignPayload] = useState({
        employeeName: "",
        nip: "",
        department: "",
        assignedDate: new Date().toISOString().split("T")[0],
        conditionOnAssign: "Baik",
        notes: "",
        bastNumber: ""
    })

    const [returnPayload, setReturnPayload] = useState({
        returnDate: new Date().toISOString().split("T")[0],
        conditionOnReturn: "Baik",
        notes: ""
    })

    const [maintenancePayload, setMaintenancePayload] = useState({
        date: new Date().toISOString().split("T")[0],
        issue: "",
        action: "",
        vendor: "",
        cost: "",
        technician: "",
        isCapitalized: false,
        status: "Selesai"
    })

    const loadAsset = () => {
        const found = getAssetById(id)
        if (found) {
            setAsset(found)
        }
    }

    useEffect(() => {
        loadAsset()
    }, [id])

    if (!asset) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
                <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Aset Tidak Ditemukan</h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Aset dengan ID {id} tidak ditemukan di sistem.
                </p>
                <Link
                    to="/assets/inventory"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white"
                >
                    Kembali ke Daftar Aset
                </Link>
            </div>
        )
    }

    const depreciation = calculateDepreciation(asset)

    const formatCurrency = (val) => {
        if (!val && val !== 0) return "Rp 0"
        return "Rp " + Number(val).toLocaleString("id-ID")
    }

    const handleAssignSelect = (e) => {
        const empName = e.target.value
        const found = EMPLOYEE_LIST.find(emp => emp.name === empName)
        setAssignPayload(prev => ({
            ...prev,
            employeeName: empName,
            nip: found ? found.nip : "",
            department: found ? found.department : "",
            bastNumber: `BAST/TIK/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`
        }))
    }

    const submitAssign = (e) => {
        e.preventDefault()
        if (!assignPayload.employeeName) {
            alert("Pilih nama pegawai penerima!")
            return
        }
        assignAssetToEmployee(asset.id, assignPayload)
        setIsAssignModalOpen(false)
        loadAsset()
    }

    const submitReturn = (e) => {
        e.preventDefault()
        returnAssetToWarehouse(asset.id, returnPayload)
        setIsReturnModalOpen(false)
        loadAsset()
    }

    const submitMaintenance = (e) => {
        e.preventDefault()
        if (!maintenancePayload.issue.trim()) {
            alert("Harap masukkan keluhan / jenis servis!")
            return
        }
        addMaintenanceRecord(asset.id, maintenancePayload)
        setIsMaintenanceModalOpen(false)
        setMaintenancePayload({
            date: new Date().toISOString().split("T")[0],
            issue: "",
            action: "",
            vendor: "",
            cost: "",
            technician: "",
            isCapitalized: false,
            status: "Selesai"
        })
        loadAsset()
    }

    const confirmDelete = () => {
        deleteAsset(asset.id)
        navigate("/assets/inventory")
    }

    const photos = asset.photos || {}
    const custodyHistory = asset.custodyHistory || []
    const maintenanceHistory = asset.maintenanceHistory || []

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Navigasi Breadcrumbs & Tombol Aksi Atas */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary-200 dark:border-secondary-800 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/assets/inventory")}
                        className="p-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                            <Link to="/assets/inventory" className="hover:underline">Inventaris Aset</Link>
                            <span>/</span>
                            <span className="font-mono font-semibold">{asset.kodeBarang}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-primary-600 dark:text-primary-400">NUP: {asset.nup || '0001'}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
                            <span>{asset.name}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAssignModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        <span>Mutasi / Serah Terima</span>
                    </button>

                    {asset.status === "In Use" && (
                        <button
                            type="button"
                            onClick={() => setIsReturnModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 shadow-sm transition"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Tarik ke Gudang</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsMaintenanceModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition"
                    >
                        <Wrench className="h-4 w-4" />
                        <span>Catat Servis</span>
                    </button>

                    <Link
                        to={`/assets/inventory/${asset.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 shadow-sm transition"
                    >
                        <Edit3 className="h-4 w-4" />
                        <span>Ubah Data</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Kartu Ringkasan Status Cepat */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-secondary-800/80 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Status Ketersediaan</span>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            asset.status === "Available"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : asset.status === "In Use"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : asset.status === "Maintenance"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}>
                            {asset.status === "Available" ? "Tersedia di Gudang" :
                             asset.status === "In Use" ? "Sedang Digunakan" :
                             asset.status === "Maintenance" ? "Dalam Perbaikan" :
                             asset.status === "Damaged" ? "Rusak / Afkir" : asset.status}
                        </span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-secondary-800/80 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Pemegang Aset Saat Ini</span>
                    <p className="text-sm font-bold text-secondary-900 dark:text-white mt-1 truncate">
                        {asset.assignee && asset.assignee !== "-" ? asset.assignee : "Tersimpan di Gudang"}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">{asset.assigneeDept || "-"}</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-secondary-800/80 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Kondisi Fisik</span>
                    <p className="text-sm font-bold text-secondary-900 dark:text-white mt-1">
                        {asset.kondisi || "Baik"}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">Lokasi: {asset.lokasi || "-"}</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-secondary-800/80 border border-secondary-200 dark:border-secondary-700 shadow-sm">
                    <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Nilai Buku Saat Ini</span>
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
                        {depreciation ? formatCurrency(depreciation.currentBookValue) : `Rp ${asset.harga || "0"}`}
                    </p>
                    <p className="text-xs text-secondary-500">Harga Perolehan: Rp {asset.harga || "0"}</p>
                </div>
            </div>

            {/* Navigasi Tab */}
            <div className="flex border-b border-secondary-200 dark:border-secondary-800 gap-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab("specs")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "specs"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <Layers className="h-4 w-4" />
                    <span>Spesifikasi & Foto Sudut</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("custody")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "custody"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <UserCheck className="h-4 w-4" />
                    <span>Riwayat Pemegang ({custodyHistory.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("maintenance")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "maintenance"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <Wrench className="h-4 w-4" />
                    <span>Riwayat Perbaikan ({maintenanceHistory.length})</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("finance")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "finance"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <DollarSign className="h-4 w-4" />
                    <span>Nilai & Depresiasi</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("qrcode")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "qrcode"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <QrCode className="h-4 w-4" />
                    <span>Stiker Label & QR</span>
                </button>
            </div>

            {/* TAB CONTENT */}

            {/* TAB 1: Spesifikasi & Multi-Foto Sudut */}
            {activeTab === "specs" && (
                <div className="space-y-6">
                    {/* Galeri Multi-Foto Sudut */}
                    <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-secondary-900 dark:text-white">
                                    Dokumentasi Multi-Sudut Kondisi Fisik
                                </h3>
                                <p className="text-xs text-secondary-500 dark:text-secondary-400">
                                    Klik pada gambar sudut mana saja untuk memperbesar (inspeksi fisik).
                                </p>
                            </div>
                            <Link
                                to={`/assets/inventory/${asset.id}/edit`}
                                className="text-xs font-semibold text-primary-600 hover:underline"
                            >
                                Kelola / Tambah Foto
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {PHOTO_ANGLES.map(angle => {
                                const photoUrl = photos[angle.key]
                                return (
                                    <div
                                        key={angle.key}
                                        className="relative group rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/60 overflow-hidden flex flex-col items-center justify-center p-2 text-center transition hover:border-primary-500"
                                    >
                                        <div className="w-full h-28 flex items-center justify-center overflow-hidden rounded-lg bg-black/5 dark:bg-black/20">
                                            {photoUrl ? (
                                                <img
                                                    src={photoUrl}
                                                    alt={angle.label}
                                                    onClick={() => setLightboxImage(photoUrl)}
                                                    className="w-full h-full object-contain cursor-pointer transition group-hover:scale-105"
                                                />
                                            ) : (
                                                <span className="text-[11px] text-secondary-400">Belum ada foto</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-secondary-800 dark:text-secondary-200 mt-2 truncate w-full">
                                            {angle.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Tabel Spesifikasi Teknis */}
                    <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 shadow-sm">
                        <h3 className="text-base font-bold text-secondary-900 dark:text-white mb-4">
                            Informasi Spesifikasi Teknis & Pabrikan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Kode Barang / Register</span>
                                <span className="font-mono font-semibold text-secondary-900 dark:text-white">{asset.kodeBarang || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Nomor Urut Pendaftaran (NUP)</span>
                                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{asset.nup || "0001"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Kategori</span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{asset.category || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Merk / Brand</span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{asset.merk || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Model / Type</span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{asset.type || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Nomor Seri (Serial Number)</span>
                                <span className="font-mono font-semibold text-secondary-900 dark:text-white">{asset.noPabrik || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Bahan / Material</span>
                                <span className="text-secondary-900 dark:text-white">{asset.bahan || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Ukuran / Dimensi</span>
                                <span className="text-secondary-900 dark:text-white">{asset.ukuran || "-"}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Lokasi Fisik Ruangan (KIR)</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-secondary-900 dark:text-white font-medium">{asset.lokasi || "-"}</span>
                                    {asset.lokasi && (
                                        <Link
                                            to={`/kir/${encodeURIComponent(asset.lokasi)}`}
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 hover:underline"
                                            title="Buka Kartu Inventaris Ruangan"
                                        >
                                            Cetak KIR
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Asal Usul Pengadaan</span>
                                <span className="text-secondary-900 dark:text-white">{asset.asalUsul || "-"}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <span className="text-secondary-500 dark:text-secondary-400">Tahun Perolehan</span>
                                <span className="text-secondary-900 dark:text-white">{asset.tahunBeli || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: Riwayat Pemegang Inventaris (Custody / Assignment Timeline) */}
            {activeTab === "custody" && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary-100 dark:border-secondary-800 pb-4 mb-6">
                            <div>
                                <h3 className="text-base font-bold text-secondary-900 dark:text-white">
                                    Kronologi Perpindahan Tangan Pemegang Inventaris
                                </h3>
                                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                    Pelacakan historis siapa saja yang pernah memegang aset ini dari masa pengadaan awal hingga saat ini.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAssignModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm self-start sm:self-auto"
                            >
                                <ArrowRightLeft className="h-4 w-4" />
                                <span>Mutasi ke Pegawai Lain</span>
                            </button>
                        </div>

                        {custodyHistory.length === 0 ? (
                            <div className="text-center py-10 text-secondary-500">
                                <p>Belum ada catatan mutasi pemegang inventaris.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-primary-200 dark:border-primary-900 ml-4 pl-6 space-y-8">
                                {custodyHistory.map((item, index) => {
                                    const isCurrentHolder = !item.returnedDate
                                    return (
                                        <div key={item.id || index} className="relative group">
                                            {/* Bullet icon */}
                                            <div className={`absolute -left-[35px] top-1.5 h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                                                isCurrentHolder
                                                    ? "bg-primary-600 border-white dark:border-secondary-900 text-white shadow-md shadow-primary-500/30"
                                                    : "bg-secondary-200 dark:bg-secondary-700 border-white dark:border-secondary-900 text-secondary-600"
                                            }`}>
                                                <UserCheck className="h-3 w-3" />
                                            </div>

                                            <div className="bg-secondary-50 dark:bg-secondary-800/60 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-secondary-200/60 dark:border-secondary-700/60 pb-3 mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-sm font-bold text-secondary-900 dark:text-white">
                                                                {item.employeeName}
                                                            </h4>
                                                            {isCurrentHolder && (
                                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                                    Pemegang Aktif Saat Ini
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-secondary-500">
                                                            NIP: {item.nip || "-"} • Unit: {item.department || "-"}
                                                        </p>
                                                    </div>

                                                    <Link
                                                        to={`/bast/${asset.id}/${item.id}`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-secondary-600 text-xs font-semibold text-secondary-700 dark:text-secondary-200 hover:bg-white dark:hover:bg-secondary-700 shadow-sm"
                                                    >
                                                        <Printer className="h-3.5 w-3.5" />
                                                        <span>Cetak BAST</span>
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                                    <div>
                                                        <span className="text-secondary-500 block">Periode Pemakaian</span>
                                                        <span className="font-semibold text-secondary-800 dark:text-secondary-200">
                                                            {item.assignedDate} s/d {item.returnedDate || "Sekarang (Masih Aktif)"}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="text-secondary-500 block">Kondisi Fisik</span>
                                                        <span className="text-secondary-800 dark:text-secondary-200">
                                                            Serah: <strong>{item.conditionOnAssign || "Baik"}</strong>
                                                            {item.conditionOnReturn && ` • Kembali: ${item.conditionOnReturn}`}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <span className="text-secondary-500 block">Nomor BAST</span>
                                                        <span className="font-mono text-secondary-800 dark:text-secondary-200">
                                                            {item.bastNumber || "-"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {item.notes && (
                                                    <p className="text-xs text-secondary-600 dark:text-secondary-300 mt-2 bg-white dark:bg-secondary-900/60 p-2 rounded-lg border border-secondary-200/40">
                                                        <strong>Catatan:</strong> {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: Riwayat Perbaikan, Upgrade & Pertambahan Nilai */}
            {activeTab === "maintenance" && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary-100 dark:border-secondary-800 pb-4 mb-6">
                            <div>
                                <h3 className="text-base font-bold text-secondary-900 dark:text-white">
                                    Log Servis, Pemeliharaan & Kapitalisasi Nilai
                                </h3>
                                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                    Mencatat setiap perbaikan teknis, biaya perbaikan, serta upgrade spesifikasi yang menambah nilai buku aset.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMaintenanceModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm self-start sm:self-auto"
                            >
                                <Wrench className="h-4 w-4" />
                                <span>Catat Servis / Upgrade Baru</span>
                            </button>
                        </div>

                        {maintenanceHistory.length === 0 ? (
                            <div className="text-center py-10 text-secondary-500">
                                <p>Belum ada catatan servis atau pemeliharaan untuk aset ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {maintenanceHistory.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        className="rounded-xl border border-secondary-200 dark:border-secondary-800 p-4 bg-secondary-50/50 dark:bg-secondary-800/40 space-y-3"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-secondary-200/60 dark:border-secondary-700/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-secondary-900 dark:text-white">
                                                    {item.issue}
                                                </span>
                                                {item.isCapitalized && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                        + Menambah Nilai Aset (Kapitalisasi)
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-secondary-500">
                                                Tanggal: {item.date}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                            <div className="sm:col-span-2">
                                                <span className="text-secondary-500 block">Tindakan / Suku Cadang</span>
                                                <span className="font-medium text-secondary-800 dark:text-secondary-200">
                                                    {item.action || "-"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-secondary-500 block">Vendor / Teknisi</span>
                                                <span className="text-secondary-800 dark:text-secondary-200">
                                                    {item.vendor || "-"} ({item.technician || "-"})
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-secondary-500 block">Biaya Servis</span>
                                                <span className="font-bold text-amber-700 dark:text-amber-400">
                                                    Rp {item.cost || "0"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 4: Nilai & Depresiasi (Penyusutan Garis Lurus) */}
            {activeTab === "finance" && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 shadow-sm">
                        <div className="border-b border-secondary-100 dark:border-secondary-800 pb-4 mb-6">
                            <h3 className="text-base font-bold text-secondary-900 dark:text-white">
                                Analisis Finansial & Kalkulator Penyusutan Nilai
                            </h3>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                                Perhitungan otomatis nilai buku aset menggunakan metode <strong>Garis Lurus (Straight-Line Depreciation)</strong> sesuai standar akuntansi aset pemerintah dan korporasi.
                            </p>
                        </div>

                        {depreciation && (
                            <div className="space-y-6">
                                {/* Baris Statistik Finansial */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
                                        <span className="text-xs text-secondary-500 dark:text-secondary-400">Harga Perolehan Awal</span>
                                        <p className="text-lg font-bold text-secondary-900 dark:text-white mt-1">
                                            {formatCurrency(depreciation.acquisitionPrice)}
                                        </p>
                                        <p className="text-[11px] text-secondary-500">Tahun Beli: {asset.tahunBeli || "-"}</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                                        <span className="text-xs text-emerald-700 dark:text-emerald-400">Kapitalisasi Nilai (Upgrade)</span>
                                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                                            +{formatCurrency(depreciation.capitalizedAdditions)}
                                        </p>
                                        <p className="text-[11px] text-emerald-600">Dari riwayat perbaikan/upgrade</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                                        <span className="text-xs text-red-700 dark:text-red-400">Akumulasi Penyusutan</span>
                                        <p className="text-lg font-bold text-red-800 dark:text-red-300 mt-1">
                                            -{formatCurrency(depreciation.accumulatedDepreciation)}
                                        </p>
                                        <p className="text-[11px] text-red-600">{depreciation.percentDepreciated}% dari total nilai</p>
                                    </div>

                                    <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800">
                                        <span className="text-xs text-primary-700 dark:text-primary-300 font-semibold">Nilai Buku Saat Ini (Book Value)</span>
                                        <p className="text-xl font-black text-primary-700 dark:text-primary-300 mt-1">
                                            {formatCurrency(depreciation.currentBookValue)}
                                        </p>
                                        <p className="text-[11px] text-primary-600">Nilai sisa: {formatCurrency(depreciation.salvageValue)}</p>
                                    </div>
                                </div>

                                {/* Progress Bar Penyusutan */}
                                <div className="p-5 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50/40 dark:bg-secondary-800/30 space-y-2">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-secondary-700 dark:text-secondary-300">
                                            Progres Penyusutan Masa Manfaat ({depreciation.ageInMonths} dari {depreciation.usefulLifeYears * 12} Bulan)
                                        </span>
                                        <span className="text-primary-600 dark:text-primary-400">
                                            {depreciation.percentDepreciated}% Terdepresiasi
                                        </span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-secondary-200 dark:bg-secondary-700 overflow-hidden">
                                        <div
                                            className="h-full bg-primary-600 transition-all duration-500 rounded-full"
                                            style={{ width: `${depreciation.percentDepreciated}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[11px] text-secondary-500">
                                        <span>Penyusutan Bulanan: {formatCurrency(depreciation.monthlyDepreciation)} / bulan</span>
                                        <span>{depreciation.isFullyDepreciated ? "Masa manfaat telah habis (Residu)" : `Sisa Masa Manfaat: ${Math.max(0, depreciation.usefulLifeYears * 12 - depreciation.ageInMonths)} Bulan`}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 5: Stiker Label & QR Code */}
            {activeTab === "qrcode" && (
                <div className="space-y-6">
                    <AssetQrCode asset={asset} />
                </div>
            )}

            {/* MODAL: Mutasi / Serah Terima ke Pegawai Lain */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title="Formulir Mutasi / Serah Terima Aset"
            >
                <form onSubmit={submitAssign} className="space-y-4 pt-2">
                    <p className="text-xs text-secondary-500">
                        Memindahkan tanggung jawab penggunaan aset <strong>{asset.name}</strong> ({asset.kodeBarang}) kepada pegawai lain.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Pilih Pegawai Penerima <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={assignPayload.employeeName}
                            onChange={handleAssignSelect}
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">-- Pilih Pegawai --</option>
                            {EMPLOYEE_LIST.map((emp) => (
                                <option key={emp.nip} value={emp.name}>
                                    {emp.name} ({emp.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                NIP Pegawai
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={assignPayload.nip}
                                className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-100 dark:bg-secondary-800 text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Unit Kerja / Bidang
                            </label>
                            <input
                                type="text"
                                readOnly
                                value={assignPayload.department}
                                className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-100 dark:bg-secondary-800 text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Tanggal Serah Terima
                            </label>
                            <input
                                type="date"
                                value={assignPayload.assignedDate}
                                onChange={(e) => setAssignPayload(p => ({ ...p, assignedDate: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Kondisi Saat Serah
                            </label>
                            <select
                                value={assignPayload.conditionOnAssign}
                                onChange={(e) => setAssignPayload(p => ({ ...p, conditionOnAssign: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                            >
                                <option value="Baik">Baik</option>
                                <option value="Rusak Ringan">Rusak Ringan</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Catatan / Keperluan Dinas
                        </label>
                        <textarea
                            rows="2"
                            value={assignPayload.notes}
                            onChange={(e) => setAssignPayload(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Contoh: Digunakan untuk dinas luar kota dan administrasi rapat"
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                        <button
                            type="button"
                            onClick={() => setIsAssignModalOpen(false)}
                            className="px-4 py-2 text-sm rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                        >
                            Konfirmasi Serah Terima
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Tarik ke Gudang */}
            <Modal
                isOpen={isReturnModalOpen}
                onClose={() => setIsReturnModalOpen(false)}
                title="Tarik Aset Kembali ke Gudang"
            >
                <form onSubmit={submitReturn} className="space-y-4 pt-2">
                    <p className="text-xs text-secondary-500">
                        Pengembalian aset dari <strong>{asset.assignee}</strong> ke dalam gudang inventaris TIK.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Tanggal Pengembalian
                        </label>
                        <input
                            type="date"
                            value={returnPayload.returnDate}
                            onChange={(e) => setReturnPayload(p => ({ ...p, returnDate: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Kondisi Fisik Saat Kembali
                        </label>
                        <select
                            value={returnPayload.conditionOnReturn}
                            onChange={(e) => setReturnPayload(p => ({ ...p, conditionOnReturn: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                        >
                            <option value="Baik">Baik (Normal)</option>
                            <option value="Rusak Ringan">Rusak Ringan (Perlu Servis)</option>
                            <option value="Rusak Berat">Rusak Berat (Tidak Menyala)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Alasan Pengembalian / Catatan
                        </label>
                        <textarea
                            rows="2"
                            value={returnPayload.notes}
                            onChange={(e) => setReturnPayload(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Contoh: Pegawai mutasi ke dinas lain / purna tugas"
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                        <button
                            type="button"
                            onClick={() => setIsReturnModalOpen(false)}
                            className="px-4 py-2 text-sm rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow"
                        >
                            Simpan ke Gudang
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Catat Servis / Upgrade Nilai */}
            <Modal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                title="Catat Servis, Perbaikan atau Upgrade Nilai"
            >
                <form onSubmit={submitMaintenance} className="space-y-4 pt-2">
                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Keluhan / Jenis Kerusakan <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={maintenancePayload.issue}
                            onChange={(e) => setMaintenancePayload(p => ({ ...p, issue: e.target.value }))}
                            placeholder="Contoh: Upgrade SSD NVMe 1TB & Ganti Pasta Fan"
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Tanggal Servis
                            </label>
                            <input
                                type="date"
                                value={maintenancePayload.date}
                                onChange={(e) => setMaintenancePayload(p => ({ ...p, date: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Biaya Servis / Part (Rp)
                            </label>
                            <input
                                type="text"
                                value={maintenancePayload.cost}
                                onChange={(e) => setMaintenancePayload(p => ({ ...p, cost: e.target.value }))}
                                placeholder="850.000"
                                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Tindakan / Suku Cadang yang Diganti
                        </label>
                        <textarea
                            rows="2"
                            value={maintenancePayload.action}
                            onChange={(e) => setMaintenancePayload(p => ({ ...p, action: e.target.value }))}
                            placeholder="Contoh: Pemasangan SSD Kingston NV2 1TB + Instalasi OS"
                            className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Bengkel / Vendor Rekanan
                            </label>
                            <input
                                type="text"
                                value={maintenancePayload.vendor}
                                onChange={(e) => setMaintenancePayload(p => ({ ...p, vendor: e.target.value }))}
                                placeholder="CV. Mitra IT Mandiri"
                                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                                Nama Teknisi
                            </label>
                            <input
                                type="text"
                                value={maintenancePayload.technician}
                                onChange={(e) => setMaintenancePayload(p => ({ ...p, technician: e.target.value }))}
                                placeholder="Bambang"
                                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm"
                            />
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isCap"
                            checked={maintenancePayload.isCapitalized}
                            onChange={(e) => setMaintenancePayload(p => ({ ...p, isCapitalized: e.target.checked }))}
                            className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="isCap" className="text-xs text-amber-900 dark:text-amber-200 cursor-pointer">
                            <strong>Kapitalisasi Nilai (Upgrade):</strong> Centang jika biaya ini meningkatkan kapasitas/umur aset dan perlu ditambahkan ke nilai buku aset.
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                        <button
                            type="button"
                            onClick={() => setIsMaintenanceModalOpen(false)}
                            className="px-4 py-2 text-sm rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow"
                        >
                            Simpan Log Servis
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL: Konfirmasi Hapus Aset */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Konfirmasi Hapus Aset"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                        Apakah Anda yakin ingin menghapus data aset <strong>{asset.name}</strong> ({asset.kodeBarang})?
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        Seluruh riwayat pemegang dan log servis aset ini akan ikut terhapus dari sistem. Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="px-5 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 shadow"
                        >
                            Ya, Hapus Aset
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Lightbox Zoom Foto */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-secondary-900 p-2 rounded-2xl shadow-2xl">
                        <img
                            src={lightboxImage}
                            alt="Zoom Inspeksi Fisik"
                            className="max-w-full max-h-[82vh] object-contain rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={() => setLightboxImage(null)}
                            className="absolute -top-3 -right-3 p-1.5 bg-secondary-900 text-white rounded-full hover:bg-secondary-700 shadow"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
