import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Plus, Search, Filter, Edit, Trash, Eye, Printer, Layers, FileText, Download, Building2 } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { CanDo } from "../lib/rbac"
import { getAssets, deleteAsset, calculateDepreciation, getRooms } from "../data/assetsStore"

export default function Assets({ title = "Inventaris Aset" }) {
    const navigate = useNavigate()
    const [assets, setAssets] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [assetToDelete, setAssetToDelete] = useState(null)
    const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false)

    // State untuk Modal Cetak KIR
    const [isKirModalOpen, setIsKirModalOpen] = useState(false)
    const [availableRooms, setAvailableRooms] = useState([])
    const [selectedRoom, setSelectedRoom] = useState("")

    const loadAssets = () => {
        setAssets(getAssets())
        const rooms = getRooms()
        setAvailableRooms(rooms)
        if (rooms.length > 0 && !selectedRoom) {
            setSelectedRoom(rooms[0].name)
        }
    }

    useEffect(() => {
        loadAssets()
    }, [])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Available': return 'success'
            case 'In Use': return 'default'
            case 'Maintenance': return 'warning'
            case 'Damaged': return 'destructive'
            case 'Disposed': return 'secondary'
            default: return 'outline'
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Available': return 'Tersedia'
            case 'In Use': return 'Digunakan'
            case 'Maintenance': return 'Servis'
            case 'Damaged': return 'Afkir'
            case 'Disposed': return 'Dihapus'
            default: return status || 'Tersedia'
        }
    }

    // Fungsi Ekspor Data ke Format CSV / Excel
    const handleExportCsv = () => {
        if (filteredAssets.length === 0) {
            alert("Tidak ada data aset untuk diekspor.")
            return
        }

        const headers = [
            "No",
            "Kode Barang",
            "NUP",
            "Nama Aset",
            "Kategori",
            "Merk",
            "Tipe",
            "Nomor Seri (SN)",
            "Tahun Perolehan",
            "Kondisi",
            "Status",
            "Pemegang Aset",
            "NIP Pemegang",
            "Unit Kerja",
            "Lokasi Ruangan",
            "Asal Usul",
            "Harga Perolehan (Rp)",
            "Akumulasi Penyusutan (Rp)",
            "Nilai Buku Saat Ini (Rp)"
        ]

        const rows = filteredAssets.map((asset, idx) => {
            const dep = calculateDepreciation(asset)
            const rawPrice = String(asset.harga || "0").replace(/[^0-9]/g, "")
            const accDep = dep ? dep.accumulatedDepreciation : 0
            const bookVal = dep ? dep.currentBookValue : rawPrice

            return [
                idx + 1,
                `"${asset.kodeBarang || '-'}"`,
                `"${asset.nup || '0001'}"`,
                `"${(asset.name || '').replace(/"/g, '""')}"`,
                `"${asset.category || '-'}"`,
                `"${asset.merk || '-'}"`,
                `"${asset.type || '-'}"`,
                `"${asset.noPabrik || '-'}"`,
                asset.tahunBeli || "-",
                `"${asset.kondisi || 'Baik'}"`,
                `"${getStatusLabel(asset.status)}"`,
                `"${(asset.assignee || '-').replace(/"/g, '""')}"`,
                `"${asset.assigneeNip || '-'}"`,
                `"${asset.assigneeDept || '-'}"`,
                `"${(asset.lokasi || '-').replace(/"/g, '""')}"`,
                `"${(asset.asalUsul || '-').replace(/"/g, '""')}"`,
                rawPrice,
                accDep,
                bookVal
            ].join(",")
        })

        // Prefix BOM (\uFEFF) agar Microsoft Excel membaca encoding UTF-8 dengan benar
        const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `Rekapitulasi_Aset_SIMTIK_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const printAssetReport = (period) => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        let filteredReportAssets = assets.filter(item => {
            const itemDate = new Date(item.purchaseDate || `${item.tahunBeli}-01-01`)
            if (period === 'monthly') {
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
            }
            return true
        })

        filteredReportAssets.sort((a, b) => new Date(a.purchaseDate || 0) - new Date(b.purchaseDate || 0))

        const reportTitle = period === 'monthly'
            ? `Laporan Aset Bulanan (Akusisi) - ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`
            : `Laporan Rekapitulasi Buku Aset SIM-TIK`

        const printWindow = window.open('', '', 'width=900,height=700')
        if (!printWindow) return

        const rowsHtml = filteredReportAssets.map((asset, index) => {
            const dep = calculateDepreciation(asset)
            const bookVal = dep ? `Rp ${dep.currentBookValue.toLocaleString("id-ID")}` : `Rp ${asset.harga || "-"}`
            return `
                <tr>
                    <td style="text-align:center;">${index + 1}</td>
                    <td><strong>${asset.kodeBarang || "-"}</strong></td>
                    <td style="text-align:center;">${asset.nup || "0001"}</td>
                    <td>${asset.name}</td>
                    <td>${asset.category || "-"}</td>
                    <td>${asset.merk || "-"} ${asset.type || ""}</td>
                    <td style="text-align:center;">${asset.tahunBeli || "-"}</td>
                    <td>${asset.kondisi || "Baik"}</td>
                    <td>${getStatusLabel(asset.status)}</td>
                    <td>${asset.assignee || "-"}</td>
                    <td style="text-align:right;">Rp ${asset.harga || "0"}</td>
                    <td style="text-align:right; font-weight:bold;">${bookVal}</td>
                </tr>
            `
        }).join("")

        printWindow.document.write(`
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 25px; color: #111; }
                    @page { size: landscape; margin: 15mm; }
                    .header-container { text-align: center; margin-bottom: 20px; border-bottom: 3px double black; padding-bottom: 12px; }
                    .header-title-1 { font-size: 15px; font-weight: bold; text-transform: uppercase; }
                    .header-title-2 { font-size: 18px; font-weight: bold; margin: 4px 0; text-transform: uppercase; }
                    .header-address { font-size: 11px; font-style: italic; color: #444; }
                    h1 { text-align: center; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; text-decoration: underline; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
                    th, td { border: 1px solid #333; padding: 5px 6px; }
                    th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
                    .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
                </style>
            </head>
            <body onload="window.print();">
                <div class="header-container">
                    <div class="header-title-1">Pemerintah Kabupaten Trenggalek</div>
                    <div class="header-title-2">Inspektorat Daerah</div>
                    <div class="header-address">Jl. KH. Wachid Hasyim No.5 Trenggalek 66311 Telp. 0355-791472 | SIM-TIK Inspektorat</div>
                </div>

                <h1>${reportTitle}</h1>
                <p style="font-size:10px; margin-bottom:8px;">Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>

                <table>
                    <thead>
                        <tr>
                            <th style="width:30px;">No</th>
                            <th>Kode Register</th>
                            <th>NUP</th>
                            <th>Nama Aset</th>
                            <th>Kategori</th>
                            <th>Merk / Tipe</th>
                            <th>Tahun</th>
                            <th>Kondisi</th>
                            <th>Status</th>
                            <th>Pemegang</th>
                            <th>Nilai Perolehan</th>
                            <th>Nilai Buku</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <div class="footer" style="margin-top: 40px; text-align: right;">
                    <div>
                        <p>Mengetahui,</p>
                        <p style="font-weight:bold; margin-top:50px; text-decoration:underline;">Pengelola Aset & Logistik TIK</p>
                        <p style="font-size:10px; color:#555;">NIP. 198506142009021004</p>
                    </div>
                </div>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.kodeBarang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.nup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.merk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.lokasi?.toLowerCase().includes(searchTerm.toLowerCase())

        if (statusFilter === "ALL") return matchesSearch
        return matchesSearch && asset.status === statusFilter
    })

    const confirmDelete = () => {
        if (assetToDelete) {
            deleteAsset(assetToDelete.id)
            setAssetToDelete(null)
            loadAssets()
        }
    }

    return (
        <div className="space-y-6">
            {/* Header Halaman & Tombol Aksi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                        Penatausahaan KIB B, pencatatan KIR ruangan, mutasi pemegang, dan penyusutan nilai buku.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 relative">
                    {/* Tombol Cetak KIR Ruangan (Permendagri 47/2021) */}
                    <Button
                        variant="outline"
                        onClick={() => setIsKirModalOpen(true)}
                        className="text-xs font-semibold"
                        title="Cetak Kartu Inventaris Ruangan (KIR) resmi"
                    >
                        <Building2 className="mr-1.5 h-3.5 w-3.5 text-primary-600" />
                        <span>Cetak KIR Ruangan</span>
                    </Button>

                    {/* Tombol Ekspor CSV / Excel */}
                    <Button
                        variant="outline"
                        onClick={handleExportCsv}
                        className="text-xs font-semibold"
                        title="Unduh data dalam format CSV / Excel"
                    >
                        <Download className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                        <span>Ekspor Excel/CSV</span>
                    </Button>

                    {/* Menu Cetak Laporan Rekap */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                            className="text-xs font-semibold"
                        >
                            <Printer className="mr-1.5 h-3.5 w-3.5" />
                            <span>Cetak Laporan</span>
                        </Button>

                        {isPrintMenuOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl shadow-xl z-50 py-1">
                                <button
                                    className="block w-full text-left px-4 py-2 text-xs text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                                    onClick={() => {
                                        printAssetReport('monthly')
                                        setIsPrintMenuOpen(false)
                                    }}
                                >
                                    Laporan Akusisi Bulanan
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-xs text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 border-t border-secondary-100 dark:border-secondary-800"
                                    onClick={() => {
                                        printAssetReport('yearly')
                                        setIsPrintMenuOpen(false)
                                    }}
                                >
                                    Rekapitulasi Buku Aset
                                </button>
                            </div>
                        )}
                        {isPrintMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsPrintMenuOpen(false)} />}
                    </div>

                    {/* Tombol Tambah Aset Baru */}
                    <CanDo permission="assets.create">
                        <Button
                            onClick={() => navigate("/assets/inventory/new")}
                            className="text-xs font-semibold shadow-sm"
                        >
                            <Plus className="mr-1.5 h-4 w-4" />
                            <span>Tambah Aset Baru</span>
                        </Button>
                    </CanDo>
                </div>
            </div>

            {/* Kartu Tabel Utama */}
            <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 pb-4">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-secondary-900 dark:text-white">
                            Daftar Seluruh Aset ({filteredAssets.length})
                        </CardTitle>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Filter Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-800 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="Available">Tersedia di Gudang</option>
                            <option value="In Use">Sedang Digunakan</option>
                            <option value="Maintenance">Dalam Perbaikan</option>
                            <option value="Damaged">Rusak / Afkir</option>
                        </select>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-secondary-400" />
                            <Input
                                placeholder="Cari aset, register, NUP, merk, lokasi..."
                                className="pl-8 text-xs w-full sm:w-[260px] dark:bg-secondary-800 dark:border-secondary-700 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-secondary-800">
                                    <TableHead className="w-[45px]">No</TableHead>
                                    <TableHead className="min-w-[110px]">Kode Barang</TableHead>
                                    <TableHead className="w-[60px] text-center">NUP</TableHead>
                                    <TableHead className="min-w-[180px]">Nama Aset</TableHead>
                                    <TableHead className="min-w-[110px]">Kategori</TableHead>
                                    <TableHead className="min-w-[120px]">Merk & Tipe</TableHead>
                                    <TableHead className="min-w-[95px]">Status</TableHead>
                                    <TableHead className="min-w-[150px]">Pemegang</TableHead>
                                    <TableHead className="min-w-[120px]">Lokasi Ruangan</TableHead>
                                    <TableHead className="min-w-[110px] text-right">Nilai Buku</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-white dark:bg-secondary-900 shadow-sm min-w-[110px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-10 text-secondary-500">
                                            Tidak ada data aset yang cocok dengan pencarian.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssets.map((asset, index) => {
                                        const dep = calculateDepreciation(asset)
                                        const bookValueFormatted = dep
                                            ? `Rp ${dep.currentBookValue.toLocaleString("id-ID")}`
                                            : `Rp ${asset.harga || "0"}`

                                        return (
                                            <TableRow
                                                key={asset.id}
                                                className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 dark:border-secondary-800 cursor-pointer"
                                                onClick={() => navigate(`/assets/inventory/${asset.id}`)}
                                            >
                                                <TableCell className="text-xs">{index + 1}</TableCell>
                                                <TableCell className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                                                    {asset.kodeBarang || "-"}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-center font-bold text-secondary-700 dark:text-secondary-300">
                                                    {asset.nup || "0001"}
                                                </TableCell>
                                                <TableCell className="font-medium text-xs text-secondary-900 dark:text-white">
                                                    {asset.name}
                                                </TableCell>
                                                <TableCell className="text-xs text-secondary-600 dark:text-secondary-300">
                                                    {asset.category || "-"}
                                                </TableCell>
                                                <TableCell className="text-xs text-secondary-600 dark:text-secondary-300">
                                                    {asset.merk || "-"} {asset.type || ""}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadge(asset.status)}>
                                                        {getStatusLabel(asset.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs font-medium text-secondary-800 dark:text-secondary-200">
                                                    {asset.assignee && asset.assignee !== "-" ? (
                                                        <span className="truncate max-w-[140px] inline-block" title={asset.assignee}>
                                                            {asset.assignee}
                                                        </span>
                                                    ) : (
                                                        <span className="text-secondary-400 italic">Gudang</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-secondary-500 dark:text-secondary-400">
                                                    {asset.lokasi || "-"}
                                                </TableCell>
                                                <TableCell className="text-xs font-bold text-right text-secondary-900 dark:text-white">
                                                    {bookValueFormatted}
                                                </TableCell>

                                                {/* Tombol Aksi Mandiri */}
                                                <TableCell
                                                    className="text-right sticky right-0 bg-white dark:bg-secondary-900"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="flex justify-end space-x-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                            title="Lihat Detail & Riwayat Mutasi"
                                                            onClick={() => navigate(`/assets/inventory/${asset.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>

                                                        <CanDo permission="assets.edit">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                                title="Ubah Data Aset"
                                                                onClick={() => navigate(`/assets/inventory/${asset.id}/edit`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </CanDo>

                                                        <CanDo permission="assets.delete">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                                title="Hapus Aset"
                                                                onClick={() => setAssetToDelete(asset)}
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </CanDo>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* MODAL: Pilihan Ruangan untuk Cetak KIR */}
            <Modal
                isOpen={isKirModalOpen}
                onClose={() => setIsKirModalOpen(false)}
                title="Cetak Kartu Inventaris Ruangan (KIR)"
                className="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-xs text-secondary-500">
                        Sesuai <strong>Permendagri No. 47 Tahun 2021</strong>, setiap ruangan kantor wajib memiliki dokumen fisik KIR yang memuat daftar aset di ruangan tersebut dan ditandatangani oleh penanggung jawab ruangan.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold uppercase text-secondary-700 dark:text-secondary-300 mb-1">
                            Pilih Lokasi Ruangan:
                        </label>
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500"
                        >
                            {availableRooms.map(room => (
                                <option key={room.name} value={room.name}>
                                    {room.name} (PIC: {room.pic || 'Belum ada'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                        Format cetak otomatis disusun dalam tata letak A4 Landscape lengkap dengan kolom tanda tangan Pengurus Barang Pengguna dan Penanggung Jawab Ruangan.
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                        <Button variant="outline" onClick={() => setIsKirModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            onClick={() => {
                                setIsKirModalOpen(false)
                                navigate(`/kir/${encodeURIComponent(selectedRoom)}`)
                            }}
                            className="bg-primary-600 text-white hover:bg-primary-700 font-semibold"
                        >
                            Buka Lembar Cetak KIR
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                isOpen={!!assetToDelete}
                onClose={() => setAssetToDelete(null)}
                title="Konfirmasi Hapus Aset"
                className="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-secondary-800 dark:text-secondary-200">
                        Apakah Anda yakin ingin menghapus data aset <strong className="font-semibold text-secondary-900 dark:text-white">{assetToDelete?.name}</strong> ({assetToDelete?.kodeBarang})?
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        Tindakan ini tidak dapat dibatalkan. Riwayat mutasi dan servis terkait aset ini akan dihapus dari sistem.
                    </p>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setAssetToDelete(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Hapus Aset
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
