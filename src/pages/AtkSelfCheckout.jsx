import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import {
    ShoppingCart, CheckCircle2, Search, Plus, Minus, Trash2,
    ArrowLeft, QrCode, Monitor, Sparkles, Building2, User,
    FileText, Check, AlertTriangle, RefreshCw, X, Shield, Clock
} from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent } from "../components/ui/Card"
import {
    getAtkStocks, selfCheckoutAtk, getRememberedTaker,
    setRememberedTaker, ATK_CATEGORIES
} from "../data/atkStore"
import { getEmployees } from "../data/employees"
import { useUser } from "../context/UserContext"

const PURPOSE_PRESETS = [
    { id: "audit", label: "Tugas Pengawasan / Audit Lapangan", icon: "📋" },
    { id: "lhp", label: "Penyusunan & Penggandaan LHP", icon: "📑" },
    { id: "sekretariat", label: "Operasional Rutin Sekretariat", icon: "🏢" },
    { id: "rapat", label: "Rapat / Ekspose Dinas", icon: "📊" },
    { id: "umum", label: "Penunjang Kerja Harian", icon: "✏️" }
]

export default function AtkSelfCheckout() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useUser()

    // Mode Kios (Standby di tablet meja ruangan) vs Mode Standar
    const [isKioskMode, setIsKioskMode] = useState(searchParams.get("mode") === "kiosk")
    const isFromQr = searchParams.get("source") === "qr"

    // Data State
    const [stocks, setStocks] = useState([])
    const [employees, setEmployees] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")

    // Form Pengambil
    const [takerSearch, setTakerSearch] = useState("")
    const [selectedTaker, setSelectedTaker] = useState(null)
    const [isTakerDropdownOpen, setIsTakerDropdownOpen] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)

    // Keranjang Pengambilan (Cart)
    const [cart, setCart] = useState({}) // { [itemId]: quantity }
    const [selectedPurpose, setSelectedPurpose] = useState(PURPOSE_PRESETS[0].label)
    const [customNotes, setCustomNotes] = useState("")

    // Status Transaksi
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [successData, setSuccessData] = useState(null)
    const [countdown, setCountdown] = useState(5)
    const countdownTimerRef = useRef(null)

    // Load Data Awal
    useEffect(() => {
        setStocks(getAtkStocks())
        const empList = getEmployees()
        setEmployees(empList)

        // Cek apakah ada profil tersimpan dari HP ini
        const remembered = getRememberedTaker()
        if (remembered && remembered.name) {
            setSelectedTaker(remembered)
            setTakerSearch(remembered.name)
        } else if (user && user.name && user.name !== "Administrator TIK") {
            // Cocokkan dengan akun login jika ada
            const matched = empList.find(e =>
                e.name.toLowerCase().includes(user.name.toLowerCase()) ||
                (e.email && e.email.toLowerCase() === user.email.toLowerCase())
            )
            if (matched) {
                setSelectedTaker(matched)
                setTakerSearch(matched.name)
            }
        }
    }, [user])

    // Filter Barang
    const filteredStocks = useMemo(() => {
        return stocks.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.code.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesCat = selectedCategory === "all" || item.category === selectedCategory

            return matchesSearch && matchesCat
        })
    }, [stocks, searchQuery, selectedCategory])

    // Filter Pegawai untuk Auto-complete
    const filteredEmployees = useMemo(() => {
        if (!takerSearch.trim()) return employees.slice(0, 8)
        const q = takerSearch.toLowerCase()
        return employees.filter(e =>
            e.name.toLowerCase().includes(q) ||
            (e.nip && e.nip.includes(q)) ||
            (e.department && e.department.toLowerCase().includes(q))
        ).slice(0, 10)
    }, [employees, takerSearch])

    // Handler Keranjang
    const handleAddToCart = (item) => {
        setCart(prev => {
            const currentQty = prev[item.id] || 0
            if (currentQty >= item.quantity) {
                return prev // Tidak boleh melebihi stok yang tersedia
            }
            return { ...prev, [item.id]: currentQty + 1 }
        })
    }

    const handleRemoveFromCart = (item) => {
        setCart(prev => {
            const currentQty = prev[item.id] || 0
            if (currentQty <= 1) {
                const next = { ...prev }
                delete next[item.id]
                return next
            }
            return { ...prev, [item.id]: currentQty - 1 }
        })
    }

    const handleClearCartItem = (itemId) => {
        setCart(prev => {
            const next = { ...prev }
            delete next[itemId]
            return next
        })
    }

    // Hitung Total Item
    const totalCartItemsCount = Object.values(cart).reduce((sum, q) => sum + q, 0)
    const cartItemsList = useMemo(() => {
        return Object.entries(cart).map(([id, qty]) => {
            const item = stocks.find(s => s.id === Number(id))
            return item ? { ...item, cartQty: qty } : null
        }).filter(Boolean)
    }, [cart, stocks])

    // Reset Form untuk Transaksi Berikutnya
    const handleResetAll = () => {
        setCart({})
        setCustomNotes("")
        setSuccessData(null)
        setErrorMessage("")
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current)
        }
        setStocks(getAtkStocks()) // Refresh stok
    }

    // Handler Submit Checkout
    const handleConfirmCheckout = () => {
        setErrorMessage("")

        if (!selectedTaker || !selectedTaker.name) {
            setErrorMessage("Silakan pilih identitas pegawai pengambil terlebih dahulu.")
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }

        if (cartItemsList.length === 0) {
            setErrorMessage("Pilih minimal 1 barang yang ingin diambil.")
            return
        }

        setIsSubmitting(true)
        try {
            const checkoutPayload = {
                takerName: selectedTaker.name,
                takerNip: selectedTaker.nip || "-",
                department: selectedTaker.department || "INSPEKTORAT",
                purpose: selectedPurpose,
                notes: customNotes,
                cartItems: cartItemsList.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.cartQty,
                    unit: item.unit
                })),
                source: isKioskMode ? "kiosk" : (isFromQr ? "qr_mobile" : "web_header"),
                remember: rememberMe
            }

            const res = selfCheckoutAtk(checkoutPayload)
            setSuccessData(res)
            setCart({})

            // Jika dalam Mode Kios Tablet, mulai hitung mundur auto-reset
            if (isKioskMode) {
                setCountdown(5)
                countdownTimerRef.current = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdownTimerRef.current)
                            handleResetAll()
                            setSelectedTaker(null)
                            setTakerSearch("")
                            return 5
                        }
                        return prev - 1
                    })
                }, 1000)
            }
        } catch (err) {
            setErrorMessage(err.message || "Gagal memproses pengambilan ATK.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Tampilan Sukses Pengambilan
    if (successData) {
        return (
            <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 p-4 sm:p-8 flex items-center justify-center">
                <div className="max-w-xl w-full bg-white dark:bg-secondary-900 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-800 p-6 sm:p-10 text-center space-y-6 animate-in zoom-in-95 duration-200">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-secondary-900 dark:text-white">
                            Pengambilan ATK Berhasil!
                        </h2>
                        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-300">
                            Stok persediaan telah terpotong dan mutasi barang keluar telah dicatat.
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/60 border border-secondary-200 dark:border-secondary-700 text-left space-y-2 text-xs">
                        <div className="flex justify-between border-b border-secondary-200 dark:border-secondary-700 pb-2">
                            <span className="text-secondary-500">Nama Pegawai:</span>
                            <span className="font-bold text-secondary-900 dark:text-white">{successData.takerName}</span>
                        </div>
                        <div className="flex justify-between border-b border-secondary-200 dark:border-secondary-700 pb-2">
                            <span className="text-secondary-500">Unit Kerja / Bidang:</span>
                            <span className="font-semibold text-secondary-800 dark:text-secondary-200">{successData.department}</span>
                        </div>
                        <div className="flex justify-between border-b border-secondary-200 dark:border-secondary-700 pb-2">
                            <span className="text-secondary-500">Keperluan:</span>
                            <span className="font-semibold text-primary-600 dark:text-primary-400">{successData.purpose}</span>
                        </div>
                        <div className="pt-1">
                            <span className="text-secondary-500 block mb-1">Rincian Barang yang Diambil:</span>
                            <ul className="list-disc pl-4 space-y-1 font-medium text-secondary-800 dark:text-secondary-200">
                                {successData.summary.map((s, idx) => (
                                    <li key={idx}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {isKioskMode && (
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center gap-2">
                            <Clock className="h-4 w-4 animate-spin" />
                            <span>Layar tablet akan reset otomatis untuk pegawai berikutnya dalam <strong>{countdown} detik</strong>...</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            onClick={handleResetAll}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Ambil Barang Lagi
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate("/assets/atk")}
                            className="flex-1"
                        >
                            Lihat Stok Persediaan
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-white ${isKioskMode ? 'p-3 sm:p-6' : 'p-4 sm:p-8'}`}>
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Bar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-secondary-200 dark:border-secondary-800">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 transition shadow-xs"
                            title="Kembali"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-secondary-900 dark:text-white flex items-center gap-2">
                                    <ShoppingCart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    Ambil ATK Mandiri (Self-Checkout)
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    Akses Bebas Ruangan
                                </span>
                            </div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Inspektorat Daerah Kabupaten Trenggalek — Catat pengambilan barang hanya dalam 5 detik.
                            </p>
                        </div>
                    </div>

                    {/* Aksi Tambahan: Toggle Kios & Cetak QR */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/atk/poster-qr")}
                            className="text-xs flex items-center gap-1.5"
                            title="Cetak lembar poster QR Code untuk ditempel di pintu/rak ruang ATK"
                        >
                            <QrCode className="h-4 w-4 text-primary-600" />
                            <span className="hidden sm:inline">Cetak Poster QR Ruangan</span>
                        </Button>

                        <Button
                            variant={isKioskMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsKioskMode(!isKioskMode)}
                            className={`text-xs flex items-center gap-1.5 ${isKioskMode ? 'bg-primary-600 text-white' : ''}`}
                            title="Beralih ke mode tablet layar sentuh meja ruangan ATK"
                        >
                            <Monitor className="h-4 w-4" />
                            <span>{isKioskMode ? "Keluar Mode Kios" : "Mode Kios Tablet"}</span>
                        </Button>
                    </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Main Content: 2 Kolom (Kiri Katalog, Kanan Identitas & Keranjang) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* KOLOM KIRI: KATALOG BARANG ATK (8 Kolom) */}
                    <div className="lg:col-span-8 space-y-4">

                        {/* Search & Kategori Pills */}
                        <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-xs space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
                                <Input
                                    placeholder="Cari kertas, pulpen, tinta printer, map, clip..."
                                    className="pl-9 w-full bg-secondary-50 dark:bg-secondary-800/50 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-2.5 text-secondary-400 hover:text-secondary-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Category Pills Slider */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCategory("all")}
                                    className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                                        selectedCategory === "all"
                                            ? "bg-primary-600 text-white shadow-xs"
                                            : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700"
                                    }`}
                                >
                                    Semua Kategori ({stocks.length})
                                </button>
                                {ATK_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                                            selectedCategory === cat
                                                ? "bg-primary-600 text-white shadow-xs"
                                                : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Grid Kartu Barang ATK */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-3.5">
                            {filteredStocks.map(item => {
                                const qtyInCart = cart[item.id] || 0
                                const isOutOfStock = item.quantity <= 0
                                const isMaxInCart = qtyInCart >= item.quantity

                                return (
                                    <div
                                        key={item.id}
                                        className={`group relative rounded-2xl p-4 transition-all duration-150 border flex flex-col justify-between ${
                                            qtyInCart > 0
                                                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm"
                                                : "bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800 hover:border-primary-300 dark:hover:border-secondary-700 shadow-xs"
                                        } ${isOutOfStock ? "opacity-50 grayscale pointer-events-none" : ""}`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-1 mb-2">
                                                <span className="text-[10px] font-mono font-bold text-secondary-400 dark:text-secondary-500">
                                                    {item.code}
                                                </span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                    item.quantity <= (item.minStock || 5)
                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                                        : "bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-300"
                                                }`}>
                                                    Sisa {item.quantity} {item.unit}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-sm text-secondary-900 dark:text-white line-clamp-2 leading-tight">
                                                {item.name}
                                            </h3>
                                            <p className="text-[11px] text-secondary-500 dark:text-secondary-400 mt-1">
                                                {item.brand} • <span className="italic">{item.category}</span>
                                            </p>
                                        </div>

                                        {/* Stepper Kontrol Jumlah */}
                                        <div className="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-800/80 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-secondary-500">
                                                {item.unit}
                                            </span>

                                            {qtyInCart > 0 ? (
                                                <div className="flex items-center gap-1.5 bg-white dark:bg-secondary-800 p-1 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFromCart(item)}
                                                        className="h-7 w-7 rounded-lg bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 text-secondary-700 dark:text-secondary-200 flex items-center justify-center transition active:scale-95"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-6 text-center font-black text-sm text-emerald-600 dark:text-emerald-400">
                                                        {qtyInCart}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        disabled={isMaxInCart}
                                                        onClick={() => handleAddToCart(item)}
                                                        className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition active:scale-95"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isOutOfStock}
                                                    onClick={() => handleAddToCart(item)}
                                                    className="h-8 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Ambil
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {filteredStocks.length === 0 && (
                            <div className="p-12 text-center bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800">
                                <FileText className="h-10 w-10 text-secondary-400 mx-auto mb-2" />
                                <h4 className="font-bold text-sm text-secondary-800 dark:text-secondary-200">Barang Tidak Ditemukan</h4>
                                <p className="text-xs text-secondary-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
                            </div>
                        )}
                    </div>

                    {/* KOLOM KANAN: IDENTITAS PENGAMBIL & KERANJANG (4 Kolom) */}
                    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-4">

                        {/* STEP 1: IDENTITAS PEGAWAI */}
                        <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-primary-600" />
                                    1. Identitas Pengambil
                                </span>
                                {selectedTaker && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedTaker(null)
                                            setTakerSearch("")
                                            setRememberedTaker(null)
                                        }}
                                        className="text-[11px] text-red-500 hover:underline"
                                    >
                                        Ganti
                                    </button>
                                )}
                            </div>

                            {selectedTaker ? (
                                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
                                    <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                        ✓
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100 truncate">
                                            {selectedTaker.name}
                                        </h4>
                                        <p className="text-[11px] text-emerald-800 dark:text-emerald-300 truncate">
                                            {selectedTaker.department || "INSPEKTORAT"} • {selectedTaker.position || "Pegawai"}
                                        </p>
                                        <p className="text-[10px] text-emerald-700/70 font-mono mt-0.5">
                                            NIP: {selectedTaker.nip || "-"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        placeholder="Ketik nama atau NIP Anda..."
                                        value={takerSearch}
                                        onChange={(e) => {
                                            setTakerSearch(e.target.value)
                                            setIsTakerDropdownOpen(true)
                                        }}
                                        onFocus={() => setIsTakerDropdownOpen(true)}
                                        className="text-xs"
                                    />

                                    {/* Dropdown Hasil Pencarian Pegawai */}
                                    {isTakerDropdownOpen && (
                                        <div className="absolute z-30 left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-xl shadow-xl divide-y divide-secondary-100 dark:divide-secondary-800">
                                            {filteredEmployees.map(emp => (
                                                <button
                                                    key={emp.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedTaker(emp)
                                                        setTakerSearch(emp.name)
                                                        setIsTakerDropdownOpen(false)
                                                    }}
                                                    className="w-full text-left p-2.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition flex flex-col"
                                                >
                                                    <span className="text-xs font-bold text-secondary-900 dark:text-white truncate">
                                                        {emp.name}
                                                    </span>
                                                    <span className="text-[10px] text-secondary-500">
                                                        {emp.department} • NIP: {emp.nip}
                                                    </span>
                                                </button>
                                            ))}
                                            {filteredEmployees.length === 0 && (
                                                <div className="p-3 text-center text-xs text-secondary-400">
                                                    Pegawai tidak ditemukan.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Opsi Ingat di HP */}
                            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-secondary-600 dark:text-secondary-400 pt-1">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span>Ingat identitas saya di perangkat/HP ini</span>
                            </label>
                        </div>

                        {/* STEP 2: KEPERLUAN CEPAT (1-KLIK PRESET) */}
                        <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-xs space-y-2.5">
                            <span className="text-xs font-black uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5 text-primary-600" />
                                2. Keperluan Pengambilan
                            </span>

                            <div className="grid grid-cols-1 gap-1.5">
                                {PURPOSE_PRESETS.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelectedPurpose(p.label)}
                                        className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-2 ${
                                            selectedPurpose === p.label
                                                ? "bg-primary-50 dark:bg-primary-950/50 border-primary-500 text-primary-700 dark:text-primary-300 shadow-xs"
                                                : "bg-secondary-50 dark:bg-secondary-800/40 border-secondary-200 dark:border-secondary-700/60 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100"
                                        }`}
                                    >
                                        <span className="text-sm">{p.icon}</span>
                                        <span className="truncate">{p.label}</span>
                                    </button>
                                ))}
                            </div>

                            <Input
                                placeholder="Catatan tugas (opsional, misal: PKPT Desa X)..."
                                value={customNotes}
                                onChange={(e) => setCustomNotes(e.target.value)}
                                className="text-xs mt-1"
                            />
                        </div>

                        {/* STEP 3: RINGKASAN KERANJANG & KONFIRMASI */}
                        <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                                    <ShoppingCart className="h-3.5 w-3.5 text-primary-600" />
                                    3. Keranjang ({totalCartItemsCount})
                                </span>
                                {cartItemsList.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setCart({})}
                                        className="text-[11px] text-red-500 hover:underline"
                                    >
                                        Kosongkan
                                    </button>
                                )}
                            </div>

                            {cartItemsList.length > 0 ? (
                                <div className="divide-y divide-secondary-100 dark:divide-secondary-800 max-h-48 overflow-y-auto pr-1">
                                    {cartItemsList.map(item => (
                                        <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-secondary-900 dark:text-white truncate">{item.name}</p>
                                                <p className="text-[10px] text-secondary-400">{item.brand}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                                                    {item.cartQty} {item.unit}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleClearCartItem(item.id)}
                                                    className="p-1 text-secondary-400 hover:text-red-500"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-xs text-secondary-400 italic">
                                    Keranjang masih kosong. Klik tombol "Ambil" pada barang di sebelah kiri.
                                </div>
                            )}

                            {/* Tombol Konfirmasi Besar */}
                            <Button
                                disabled={cartItemsList.length === 0 || !selectedTaker || isSubmitting}
                                onClick={handleConfirmCheckout}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition active:scale-98 rounded-xl flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Menyimpan Pengambilan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        <span>Konfirmasi Ambil ATK ({totalCartItemsCount} Item)</span>
                                    </>
                                )}
                            </Button>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}
