import { useState, useEffect } from "react"
import { ArrowLeft, Trash2, Printer } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"

export default function StockHistory() {
    const navigate = useNavigate()
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem("simtik_stock_atk_history")
        return saved ? JSON.parse(saved) : []
    })

    const [stocks, setStocks] = useState(() => {
        const saved = localStorage.getItem("simtik_stock_atk")
        return saved ? JSON.parse(saved) : []
    })

    const [selectedIds, setSelectedIds] = useState([])

    // Update localStorage whenever history changes
    useEffect(() => {
        localStorage.setItem("simtik_stock_atk_history", JSON.stringify(history))
    }, [history])

    // Update localStorage whenever stocks changes (due to rollback)
    useEffect(() => {
        localStorage.setItem("simtik_stock_atk", JSON.stringify(stocks))
    }, [stocks])

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(history.map(h => h.id))
        } else {
            setSelectedIds([])
        }
    }

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return
        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} catatan riwayat mutasi? Tindakan ini akan MENGEMBALIKAN (merollback) kembali jumlah stok barang terkait!`)) return

        // Process deletions and stock updates
        let updatedStocks = [...stocks]

        selectedIds.forEach(id => {
            const record = history.find(h => h.id === id)
            if (!record) return

            // Find matching stock item by name (best guess linking)
            const stockIndex = updatedStocks.findIndex(s => s.name === record.itemName)

            if (stockIndex !== -1) {
                const stockItem = updatedStocks[stockIndex]
                let newQuantity = parseInt(stockItem.quantity)

                // REVERSE LOGIC:
                // If record was IN (added stock), we remove it.
                // If record was OUT (removed stock), we add it back.
                if (record.type === 'IN') {
                    newQuantity -= parseInt(record.quantity)
                } else {
                    newQuantity += parseInt(record.quantity)
                }

                // Prevent negative stock during rollback
                if (newQuantity < 0) newQuantity = 0

                updatedStocks[stockIndex] = {
                    ...stockItem,
                    quantity: newQuantity,
                    lastUpdate: new Date().toISOString().split('T')[0] // Update timestamp of change
                }
            }
        })

        setStocks(updatedStocks)
        setHistory(history.filter(h => !selectedIds.includes(h.id)))
        setSelectedIds([])
    }

    const printReport = (period) => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        const filteredHistory = history.filter(item => {
            const itemDate = new Date(item.id) // Assuming ID is timestamp
            if (period === 'monthly') {
                return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
            } else if (period === 'yearly') {
                return itemDate.getFullYear() === currentYear
            }
            return true
        })

        if (filteredHistory.length === 0) {
            alert(`Tidak ditemukan catatan riwayat mutasi untuk periode ${period === 'monthly' ? 'bulan' : 'tahun'} ini.`)
            return
        }

        const reportTitle = period === 'monthly'
            ? `Laporan Mutasi Keluar-Masuk ATK - ${now.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`
            : `Laporan Mutasi Keluar-Masuk ATK - Tahun ${currentYear}`

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
                    .in { background-color: #dcfce7; color: #166534; }
                    .out { background-color: #fee2e2; color: #991b1b; }
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
                            <th style="width: 18%">Tanggal & Waktu</th>
                            <th style="width: 12%">Jenis Mutasi</th>
                            <th style="width: 25%">Nama Barang</th>
                            <th style="width: 15%">Jumlah</th>
                            <th style="width: 15%">Penerima / Pengambil</th>
                            <th style="width: 15%">Keperluan / Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredHistory.map(log => `
                            <tr>
                                <td>${log.date}</td>
                                <td style="text-align: center;"><span class="badge ${log.type === 'IN' ? 'in' : 'out'}">${log.type === 'IN' ? 'MASUK' : 'KELUAR'}</span></td>
                                <td>${log.itemName}</td>
                                <td style="text-align: center;">${log.quantity} ${log.unit}</td>
                                <td>${log.taker}</td>
                                <td>${log.notes}</td>
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/assets/atk")}
                        title="Kembali ke Stok Opname ATK"
                        className="hover:bg-secondary-100 dark:hover:bg-secondary-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">Riwayat Mutasi ATK</h2>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                            Log pencatatan mutasi barang persediaan masuk dan barang keluar secara kronologis.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={() => printReport('monthly')}>
                        <Printer className="mr-2 h-4 w-4" />
                        Laporan Bulanan
                    </Button>
                    <Button variant="outline" onClick={() => printReport('yearly')}>
                        <Printer className="mr-2 h-4 w-4" />
                        Laporan Tahunan
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button variant="danger" onClick={handleDeleteSelected}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Terpilih ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Log Keluar Masuk Persediaan ATK</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={history.length > 0 && selectedIds.length === history.length}
                                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                    />
                                </TableHead>
                                <TableHead>Tanggal & Waktu</TableHead>
                                <TableHead>Jenis Mutasi</TableHead>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Jumlah</TableHead>
                                <TableHead>Penerima / Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? (
                                history.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(log.id)}
                                                onChange={() => handleSelectOne(log.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                                            />
                                        </TableCell>
                                        <TableCell className="text-xs text-secondary-500 font-mono">{log.date}</TableCell>
                                        <TableCell>
                                            <Badge variant={log.type === 'IN' ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0 font-bold">
                                                {log.type === 'IN' ? 'MASUK' : 'KELUAR'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-secondary-900 dark:text-white">{log.itemName}</TableCell>
                                        <TableCell className="font-mono font-bold">{log.quantity} {log.unit}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {log.taker !== '-' && <span className="font-medium text-xs text-secondary-900 dark:text-white">{log.taker}</span>}
                                                <span className="text-xs text-secondary-500 dark:text-secondary-400 italic">{log.notes}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-secondary-500 dark:text-secondary-400 py-8">
                                        Belum ada riwayat aktivitas mutasi persediaan ATK yang tercatat.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
