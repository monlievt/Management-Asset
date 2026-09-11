import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Plus, Search, Filter, Edit, Trash, Eye, Printer, Laptop } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { getAssets, deleteAsset } from "../data/assetsStore"

export default function Devices({ title = "Perangkat TIK" }) {
    const navigate = useNavigate()
    const [devices, setDevices] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [deviceToDelete, setDeviceToDelete] = useState(null)
    const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false)

    const loadDevices = () => {
        // Ambil semua aset dan filter kategori perangkat TIK
        const allAssets = getAssets()
        const itCategories = ["Laptop", "PC Desktop", "Server", "Networking", "Printer", "Peripheral"]
        const itDevices = allAssets.filter(a => itCategories.includes(a.category) || !a.category)
        setDevices(itDevices.length > 0 ? itDevices : allAssets)
    }

    useEffect(() => {
        loadDevices()
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
            case 'Maintenance': return 'Perbaikan'
            case 'Damaged': return 'Afkir'
            default: return status || 'Tersedia'
        }
    }

    const printDeviceReport = (period) => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        let filtered = devices.filter(item => {
            const itemDate = new Date(item.purchaseDate || `${item.tahunBeli}-01-01`)
            if (period === 'monthly') {
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
            }
            return true
        })

        const reportTitle = period === 'monthly'
            ? `Laporan Perangkat TIK Bulanan - ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`
            : `Laporan Rekapitulasi Perangkat TIK Dinas`

        const printWindow = window.open('', '', 'width=900,height=700')
        if (!printWindow) return

        const rows = filtered.map((d, i) => `
            <tr>
                <td style="text-align:center;">${i + 1}</td>
                <td><strong>${d.kodeBarang || "-"}</strong></td>
                <td>${d.name}</td>
                <td>${d.category || "-"}</td>
                <td>${d.merk || d.brand || "-"}</td>
                <td>${d.noPabrik || d.serial || "-"}</td>
                <td>${getStatusLabel(d.status)}</td>
                <td>${d.assignee || "-"}</td>
                <td style="text-align:center;">${d.purchaseDate || d.tahunBeli || "-"}</td>
            </tr>
        `).join("")

        printWindow.document.write(`
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 25px; }
                    @page { size: landscape; }
                    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
                    th, td { border: 1px solid #333; padding: 5px; }
                    th { background: #f2f2f2; }
                </style>
            </head>
            <body onload="window.print();">
                <div class="header">
                    <h2>DINAS KOMUNIKASI DAN INFORMATIKA</h2>
                    <h3>${reportTitle}</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Kode Register</th>
                            <th>Nama Perangkat</th>
                            <th>Kategori</th>
                            <th>Merk / Brand</th>
                            <th>Nomor Seri</th>
                            <th>Status</th>
                            <th>Pemegang</th>
                            <th>Tgl Beli</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </body>
            </html>
        `)
        printWindow.document.close()
    }

    const filteredDevices = devices.filter(device =>
        device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.merk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.noPabrik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const confirmDelete = () => {
        if (deviceToDelete) {
            deleteAsset(deviceToDelete.id)
            setDeviceToDelete(null)
            loadDevices()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">{title}</h2>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                        Manajemen inventaris perangkat keras komputer, laptop dinas, printer, dan server.
                    </p>
                </div>

                <div className="flex items-center space-x-2 relative">
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
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl shadow-xl z-50 py-1">
                                <button
                                    className="block w-full text-left px-4 py-2 text-xs text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800"
                                    onClick={() => {
                                        printDeviceReport('monthly')
                                        setIsPrintMenuOpen(false)
                                    }}
                                >
                                    Laporan Bulanan
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-xs text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 border-t border-secondary-100 dark:border-secondary-800"
                                    onClick={() => {
                                        printDeviceReport('yearly')
                                        setIsPrintMenuOpen(false)
                                    }}
                                >
                                    Rekapitulasi Tahunan
                                </button>
                            </div>
                        )}
                        {isPrintMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsPrintMenuOpen(false)} />}
                    </div>

                    {/* Navigasi ke Halaman Tambah Baru Mandiri (Bukan Modal/Popup) */}
                    <Button
                        onClick={() => navigate("/assets/devices/new")}
                        className="text-xs font-semibold shadow-sm"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        <span>Tambah Perangkat Baru</span>
                    </Button>
                </div>
            </div>

            <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4">
                    <CardTitle className="text-base font-bold text-secondary-900 dark:text-white">
                        Daftar Seluruh Perangkat ({filteredDevices.length})
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-secondary-400" />
                            <Input
                                placeholder="Cari perangkat TIK, serial, merk..."
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
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead className="min-w-[160px]">Nama Perangkat</TableHead>
                                    <TableHead className="min-w-[110px]">Kategori</TableHead>
                                    <TableHead className="min-w-[110px]">Merk</TableHead>
                                    <TableHead className="min-w-[130px]">Nomor Seri</TableHead>
                                    <TableHead className="min-w-[100px]">Status</TableHead>
                                    <TableHead className="min-w-[160px]">Pemegang Inventaris</TableHead>
                                    <TableHead className="min-w-[100px]">Tgl Beli</TableHead>
                                    <TableHead className="text-right sticky right-0 bg-white dark:bg-secondary-900 min-w-[110px]">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDevices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-10 text-secondary-500">
                                            Tidak ada data perangkat yang cocok.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDevices.map((device, index) => (
                                        <TableRow
                                            key={device.id}
                                            className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 dark:border-secondary-800 cursor-pointer"
                                            onClick={() => navigate(`/assets/devices/${device.id}`)}
                                        >
                                            <TableCell className="text-xs">{index + 1}</TableCell>
                                            <TableCell className="font-medium text-xs text-secondary-900 dark:text-white">
                                                {device.name}
                                            </TableCell>
                                            <TableCell className="text-xs text-secondary-600 dark:text-secondary-300">
                                                {device.category}
                                            </TableCell>
                                            <TableCell className="text-xs text-secondary-600 dark:text-secondary-300">
                                                {device.brand || device.merk || "-"}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-primary-600 dark:text-primary-400">
                                                {device.serial || device.noPabrik || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(device.status)}>
                                                    {getStatusLabel(device.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-secondary-800 dark:text-secondary-200">
                                                {device.assignee && device.assignee !== "-" ? (
                                                    <span className="truncate max-w-[150px] inline-block">
                                                        {device.assignee}
                                                    </span>
                                                ) : (
                                                    <span className="text-secondary-400 italic">Gudang</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-secondary-500">
                                                {device.purchaseDate || device.tahunBeli || "-"}
                                            </TableCell>

                                            <TableCell
                                                className="text-right sticky right-0 bg-white dark:bg-secondary-900"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex justify-end space-x-1">
                                                    {/* Lihat Detail -> Halaman Baru */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                                        title="Lihat Detail & Riwayat Mutasi"
                                                        onClick={() => navigate(`/assets/devices/${device.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    {/* Ubah Data -> Halaman Baru */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                        title="Ubah Data Perangkat"
                                                        onClick={() => navigate(`/assets/devices/${device.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    {/* Hapus Data */}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        title="Hapus Perangkat"
                                                        onClick={() => setDeviceToDelete(device)}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal Konfirmasi Hapus Perangkat */}
            <Modal
                isOpen={!!deviceToDelete}
                onClose={() => setDeviceToDelete(null)}
                title="Konfirmasi Hapus Perangkat"
                className="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    <p className="text-sm text-secondary-800 dark:text-secondary-200">
                        Apakah Anda yakin ingin menghapus data perangkat <strong className="font-semibold text-secondary-900 dark:text-white">{deviceToDelete?.name}</strong>?
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setDeviceToDelete(null)}>
                            Batal
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            Hapus Perangkat
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
