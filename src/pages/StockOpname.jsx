import { useState, useEffect } from "react"
import {
    Plus, Search, Filter, MoreHorizontal, Edit, Trash, Eye,
    ArrowDown, ArrowUp, History, Printer, ShoppingCart, QrCode, Monitor
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { EMPLOYEE_LIST } from "../data/employees"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import {
    getAtkStocks, saveAtkStocks, getAtkHistory, saveAtkHistory
} from "../data/atkStore"

// Custom Combobox for Item Selection
const ItemCombobox = ({ value, onChange, options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState(value)

    useEffect(() => {
        setSearch(value)
    }, [value])

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative">
            <div className="relative flex items-center">
                <Input
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        onChange(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Pilih atau ketik nama barang persediaan..."
                    className="w-full pr-10"
                    autoComplete="off"
                />
                <div className="absolute right-3 flex items-center space-x-1">
                    {search && filteredOptions.length === 0 ? (
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                            BARU
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            tabIndex="-1"
                        >
                            <ArrowDown className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {isOpen && search && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, i) => (
                            <div
                                key={i}
                                className="px-4 py-2 text-sm hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-900 dark:text-secondary-100 cursor-pointer flex justify-between items-center"
                                onClick={() => {
                                    setSearch(opt.name)
                                    onChange(opt.name)
                                    onSelect(opt)
                                    setIsOpen(false)
                                }}
                            >
                                <span>{opt.name}</span>
                                <span className="text-secondary-400 dark:text-secondary-500 text-xs">{opt.brand}</span>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-secondary-500 dark:text-secondary-400 italic">
                            Tekan Enter untuk membuat "{search}"
                        </div>
                    )}
                </div>
            )}
            {/* Overlay to close when clicking outside */}
            {isOpen && <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />}
        </div>
    )
}

// Gunakan daftar pegawai terpusat dari src/data/employees.js
const TAKER_LIST = EMPLOYEE_LIST

const StockForm = ({ initialData, onCancel, onSubmit, type = 'incoming', existingItems = [] }) => {
    const [formData, setFormData] = useState(initialData || {
        code: "",
        name: "",
        category: "ATK",
        brand: "",
        quantity: 0,
        unit: "Pcs",
        status: "Available",
        taker: "", // Nama Pengambil
        notes: ""  // Keterangan
    })

    const isOutgoing = type === 'outgoing'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleNameChange = (newName) => {
        setFormData(prev => {
            const newState = { ...prev, name: newName }

            // Auto-fill logic for exact name matches
            if (!isOutgoing) {
                const match = existingItems.find(item => item.name.toLowerCase() === newName.toLowerCase())
                if (match) {
                    // Only auto-fill if the fields are empty or default to allow user override
                    if (!newState.brand) newState.brand = match.brand
                    if (newState.category === "ATK") newState.category = match.category
                    if (newState.unit === "Pcs") newState.unit = match.unit
                }
            } else {
                // For outgoing, also auto-fill to show details, but don't overwrite if not needed? 
                // Actually yes, we want to show what they selected.
                const match = existingItems.find(item => item.name.toLowerCase() === newName.toLowerCase())
                if (match) {
                    newState.brand = match.brand
                    newState.category = match.category
                    newState.unit = match.unit
                }
            }
            return newState
        })
    }

    const handleExistingSelect = (item) => {
        setFormData(prev => ({
            ...prev,
            name: item.name,
            brand: item.brand,
            category: item.category,
            unit: item.unit,
            // Don't overwrite quantity
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData, type)
    }

    // Get unique existing items for suggested dropdown
    const uniqueItems = Array.from(new Map(existingItems.map(item => [item.name, item])).values())

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative z-20 space-y-2">
                <label className="text-sm font-medium">Nama Barang</label>
                <ItemCombobox
                    value={formData.name}
                    onChange={handleNameChange}
                    onSelect={handleExistingSelect}
                    options={uniqueItems}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Merek / Produsen</label>
                    <Input name="brand" value={formData.brand} onChange={handleChange} disabled={isOutgoing} className={isOutgoing ? "bg-gray-100 dark:bg-secondary-800" : ""} placeholder="contoh: PaperOne, Pilot..." />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori ATK</label>
                    <Input name="category" value={formData.category} onChange={handleChange} disabled={isOutgoing} className={isOutgoing ? "bg-gray-100 dark:bg-secondary-800" : ""} placeholder="contoh: Kertas, Alat Tulis..." />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">{isOutgoing ? "Jumlah Barang Keluar" : "Jumlah Barang Masuk"}</label>
                    <Input name="quantity" type="number" min="1" value={formData.quantity} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Satuan Barang</label>
                    <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        disabled={isOutgoing}
                        className={`flex h-10 w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white ${isOutgoing ? "bg-gray-100 dark:bg-secondary-800" : ""}`}
                    >
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                        <option value="Rim">Rim</option>
                        <option value="Pack">Pack</option>
                        <option value="Unit">Unit</option>
                        <option value="Botol">Botol</option>
                        <option value="Set">Set</option>
                    </select>
                </div>
            </div>

            {isOutgoing && (
                <>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nama Pengambil / Pemakai</label>
                        <Input
                            list="taker-list"
                            name="taker"
                            value={formData.taker}
                            onChange={handleChange}
                            placeholder="Pilih atau ketik nama ASN pengambil..."
                            required
                        />
                        <datalist id="taker-list">
                            {TAKER_LIST.map((emp, i) => (
                                <option key={i} value={typeof emp === 'object' ? emp.name : emp} />
                            ))}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Keperluan / Keterangan</label>
                        <Input name="notes" value={formData.notes} onChange={handleChange} placeholder="contoh: Tugas Pengawasan, Audit Lapangan, Penyusunan LHP..." />
                    </div>
                </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit" variant={isOutgoing ? "danger" : "primary"}>
                    {isOutgoing ? "Konfirmasi Barang Keluar" : "Simpan Barang Masuk"}
                </Button>
            </div>
        </form>
    )
}

const initialStock = [
    { id: 1, code: "ATK-001", name: "Kertas A4", category: "ATK", brand: "PaperOne", quantity: 50, unit: "Rim", status: "Available", lastUpdate: "2024-01-15" },
    { id: 2, code: "ATK-002", name: "Pulpen Hitam", category: "ATK", brand: "Pilot", quantity: 100, unit: "Pcs", status: "Available", lastUpdate: "2023-11-20" },
    { id: 3, code: "ATK-003", name: "Tinta Printer Hitam", category: "Consumable", brand: "Epson", quantity: 10, unit: "Botol", status: "Limited", lastUpdate: "2024-03-10" },
]

export default function StockOpname() {
    const navigate = useNavigate()
    const [stocks, setStocks] = useState(() => getAtkStocks())
    const [history, setHistory] = useState(() => getAtkHistory())

    // Sinkronisasi otomatis jika ada transaksi dari Kios Mandiri / Mobile QR pada tab/jendela lain
    useEffect(() => {
        const handleStorage = (e) => {
            if (e && e.key && e.key !== "simtik_stock_atk" && e.key !== "simtik_stock_atk_history") {
                return
            }
            setStocks(getAtkStocks())
            setHistory(getAtkHistory())
        }
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [modalType, setModalType] = useState('incoming') // 'incoming' or 'outgoing'

    const generateCode = () => {
        const nextId = stocks.length + 1
        return `ATK-${String(nextId).padStart(3, '0')}`
    }

    const handleSave = (data, type) => {
        const today = new Date().toISOString().split('T')[0]
        const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

        let updatedStocksList = [...stocks]

        // 1. Transaction Logic (Update Stock)
        if (selectedItem && selectedItem.id) {
            // EDIT EXISTING RECORD DIRECTLY
            const newQuantity = type === 'outgoing'
                ? parseInt(selectedItem.quantity) - parseInt(data.quantity)
                : parseInt(data.quantity) // Direct quantity edit/overwrite

            let updatedItem = {
                ...selectedItem,
                ...data,
                quantity: type === 'outgoing' ? newQuantity : data.quantity,
                lastUpdate: today
            }

            if (updatedItem.quantity < 0) {
                alert("Kesalahan: Jumlah stok tidak boleh bernilai negatif!")
                return
            }

            updatedStocksList = stocks.map(s => s.id === selectedItem.id ? updatedItem : s)
        } else {
            // NEW INCOMING TRANSACTION
            // Check if item with same name and brand already exists
            const existingItem = stocks.find(s =>
                s.name.toLowerCase() === data.name.toLowerCase() &&
                s.brand.toLowerCase() === data.brand.toLowerCase()
            )

            if (existingItem) {
                // Update existing item quantity
                let updatedQuantity;
                if (type === 'outgoing') {
                    updatedQuantity = parseInt(existingItem.quantity) - parseInt(data.quantity);
                    if (updatedQuantity < 0) {
                        alert("Kesalahan: Stok persediaan tidak mencukupi! Jumlah yang diambil melebihi stok yang ada di gudang.");
                        return;
                    }
                } else {
                    updatedQuantity = parseInt(existingItem.quantity) + parseInt(data.quantity);
                }

                const updatedItem = {
                    ...existingItem,
                    quantity: updatedQuantity,
                    lastUpdate: today,
                }
                updatedStocksList = stocks.map(s => s.id === existingItem.id ? updatedItem : s)
            } else {
                if (type === 'outgoing') {
                    alert("Kesalahan: Barang tidak ditemukan! Tidak dapat mencatat pengeluaran untuk barang yang belum terdaftar di master persediaan.");
                    return;
                }
                // Completely New Item
                const newCode = generateCode()
                updatedStocksList = [...stocks, {
                    id: Date.now(),
                    ...data,
                    code: newCode,
                    lastUpdate: today
                }]
            }
        }

        // 2. History Recording Logic
        const newRecord = {
            id: Date.now(),
            date: timestamp,
            type: type === 'outgoing' ? 'OUT' : 'IN',
            itemName: data.name,
            quantity: data.quantity,
            unit: data.unit,
            taker: type === 'outgoing' ? data.taker : '-',
            notes: type === 'outgoing' ? data.notes : (selectedItem ? 'Pembaruan Stok' : 'Pemasukan Stok Baru'),
            user: "Admin"
        }
        const updatedHistoryList = [newRecord, ...history]

        // Simpan langsung ke localStorage dan sinkronkan state lokal
        saveAtkStocks(updatedStocksList)
        saveAtkHistory(updatedHistoryList)
        setStocks(updatedStocksList)
        setHistory(updatedHistoryList)

        setIsModalOpen(false)
        setSelectedItem(null)
    }

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus barang ini dari daftar persediaan ATK?")) {
            const updated = stocks.filter(s => s.id !== id)
            saveAtkStocks(updated)
            setStocks(updated)
        }
    }

    const printStockReport = () => {
        const now = new Date()
        const reportTitle = `Laporan Stok Opname ATK - ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`

        const printWindow = window.open('', '', 'width=800,height=600')
        printWindow.document.write(`
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header-container { text-align: center; margin-bottom: 20px; border-bottom: 3px double black; padding-bottom: 15px; }
                    .header-title-1 { font-size: 18px; font-weight: bold; }
                    .header-title-2 { font-size: 22px; font-weight: bold; margin: 5px 0; }
                    .header-address { font-size: 12px; font-style: italic; }
                    
                    h1 { text-align: center; font-size: 16px; margin-bottom: 20px; text-transform: uppercase; text-decoration: underline; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #000; padding: 6px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; text-align: center; }
                    .badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 10px; }
                    /* Status colors for print */
                    .status-available { color: #166534; font-weight: bold; }
                    .status-limited { color: #b45309; font-weight: bold; }
                    
                    .footer { margin-top: 30px; text-align: right; font-size: 12px; }
                    
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        th { background-color: #f2f2f2 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="header-container">
                    <div class="header-title-1">PEMERINTAH KABUPATEN TRENGGALEK</div>
                    <div class="header-title-2">INSPEKTORAT DAERAH</div>
                    <div class="header-address">Jl. KH. Wachid Hasyim No.5 Trenggalek 66311 Telp. 0355-791472</div>
                    <div class="header-address">https://inspektorat.trenggalekkab.go.id</div>
                </div>

                <h1>${reportTitle}</h1>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%">No</th>
                            <th style="width: 35%">Nama Barang</th>
                            <th style="width: 20%">Merek / Brand</th>
                            <th style="width: 15%">Jumlah Stok</th>
                            <th style="width: 15%">Satuan</th>
                            <th style="width: 10%">Status Stok</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredStocks.map((item, index) => `
                            <tr>
                                <td style="text-align: center;">${index + 1}</td>
                                <td>${item.name}</td>
                                <td>${item.brand}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: center;">${item.unit}</td>
                                <td style="text-align: center;" class="${item.quantity > 5 ? 'status-available' : 'status-limited'}">
                                    ${item.quantity > 5 ? 'Tersedia' : 'Menipis'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="footer">
                    <p>Trenggalek, ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>Pengurus Barang Pengguna</p>
                </div>
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    const handleOpenModal = (type, item = null) => {
        setModalType(type)
        setSelectedItem(item)
        setIsModalOpen(true)
    }

    const filteredStocks = stocks.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
                        Stok Opname Logistik ATK
                    </h2>
                    <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        Pencatatan barang habis pakai, mutasi keluar-masuk persediaan, dan cetak berita acara stok.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/assets/atk/checkout")}
                        className="text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 font-bold"
                    >
                        <ShoppingCart className="mr-2 h-4 w-4 text-emerald-600" /> Kios Ambil Mandiri
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/assets/atk/poster-qr")}
                        className="text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800"
                    >
                        <QrCode className="mr-2 h-4 w-4 text-primary-600" /> Poster QR Ruangan
                    </Button>
                    <Button variant="outline" onClick={printStockReport}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/assets/atk/history")}
                    >
                        <History className="mr-2 h-4 w-4" /> Riwayat Mutasi
                    </Button>
                    <Button variant="danger" onClick={() => handleOpenModal('outgoing')}>
                        <ArrowUp className="mr-2 h-4 w-4" /> Catat Barang Keluar
                    </Button>
                    <Button variant="primary" onClick={() => handleOpenModal('incoming')}>
                        <Plus className="mr-2 h-4 w-4" /> Catat Barang Masuk
                    </Button>
                </div>
            </div>

            {/* Banner Akses Mandiri Ruangan ATK (Kombinasi Opsi 1-2-3) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary-500/10 to-indigo-500/10 border border-emerald-200 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                            Akses Mandiri Ruangan ATK (Self-Checkout Pegawai)
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                                Opsi 1-2-3 Aktif
                            </span>
                        </h4>
                        <p className="text-xs text-secondary-600 dark:text-secondary-300 mt-0.5 max-w-2xl leading-relaxed">
                            Ruangan ATK bebas diakses semua pegawai? Pegawai dapat mencatat pengambilan barang dalam 5 detik via HP (Scan QR Code) atau melalui tablet layar sentuh di meja ruangan.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/assets/atk/poster-qr")}
                        className="text-xs"
                    >
                        <Printer className="h-3.5 w-3.5 mr-1.5" />
                        Cetak Poster QR
                    </Button>
                    <Button
                        size="sm"
                        variant="success"
                        onClick={() => navigate("/atk/ambil?mode=kiosk")}
                    >
                        <Monitor className="h-3.5 w-3.5 mr-1.5" />
                        Buka Kios Tablet
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-semibold">Daftar Seluruh Persediaan ATK</CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-400" />
                            <Input
                                placeholder="Cari nama barang atau kode..."
                                className="pl-8 w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Merek / Brand</TableHead>
                                <TableHead>Jumlah Stok</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead>Pembaruan Terakhir</TableHead>
                                <TableHead>Status Stok</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStocks.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-semibold text-secondary-900 dark:text-white">{item.name}</TableCell>
                                    <TableCell>{item.brand}</TableCell>
                                    <TableCell className="font-mono font-bold">{item.quantity}</TableCell>
                                    <TableCell>{item.unit}</TableCell>
                                    <TableCell className="font-mono text-xs text-secondary-500 dark:text-secondary-400">{item.lastUpdate}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.quantity > 5 ? 'success' : 'warning'}>
                                            {item.quantity > 5 ? 'Tersedia' : 'Stok Menipis'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40" onClick={() => handleOpenModal('incoming', item)} title="Ubah Stok">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => handleDelete(item.id)} title="Hapus Barang">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedItem(null)
                }}
                title={modalType === 'outgoing' ? "Catat Pengeluaran Barang (ATK Keluar)" : (selectedItem ? "Ubah Data Barang Masuk" : "Catat Pemasukan Barang (ATK Masuk)")}
            >
                <StockForm
                    initialData={selectedItem}
                    type={modalType}
                    existingItems={stocks}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedItem(null)
                    }}
                    onSubmit={handleSave}
                />
            </Modal>
        </div>
    )
}
