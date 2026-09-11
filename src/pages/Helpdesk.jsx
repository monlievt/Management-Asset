import { useState, useEffect, useRef } from "react"
import { Plus, Search, Edit, Trash, Printer } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Modal } from "../components/ui/Modal"
import { TicketForm } from "../components/helpdesk/TicketForm"
import { CanDo } from "../lib/rbac"

const initialTickets = [
    { id: 1, subject: "Printer in HR not working", requester: "Sarah Jones", priority: "High", status: "Open", date: new Date().toISOString().split('T')[0] },
    { id: 2, subject: "Need software update", requester: "Mike Brown", priority: "Low", status: "Resolved", date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] }, // 2 days ago
    { id: 3, subject: "Wifi connection issues", requester: "All Staff", priority: "High", status: "In Progress", date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0] }, // 5 days ago
    { id: 4, subject: "Request for new monitor", requester: "Jane Doe", priority: "Medium", status: "Open", date: new Date(Date.now() - 86400000 * 30).toISOString().split('T')[0] }, // 30 days ago (last month potentially)
]

export default function Helpdesk() {
    const [tickets, setTickets] = useState(() => {
        const savedTickets = localStorage.getItem("simtik_tickets")
        return savedTickets ? JSON.parse(savedTickets) : initialTickets
    })

    useEffect(() => {
        localStorage.setItem("simtik_tickets", JSON.stringify(tickets))
    }, [tickets])
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [ticketToDelete, setTicketToDelete] = useState(null)
    const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false)
    const printMenuRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (printMenuRef.current && !printMenuRef.current.contains(event.target)) {
                setIsPrintMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSaveTicket = (ticketData) => {
        if (selectedTicket && selectedTicket.id) {
            setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...ticketData, id: t.id, date: t.date } : t))
        } else {
            // Gunakan Date.now() sebagai ID unik untuk menghindari duplikasi
            setTickets([{ id: Date.now(), ...ticketData, status: "Open", date: new Date().toISOString().split('T')[0] }, ...tickets])
        }
        setIsModalOpen(false)
        setSelectedTicket(null)
    }

    const handleDeleteTicket = (ticket) => {
        setTicketToDelete(ticket)
    }

    const confirmDeleteTicket = () => {
        if (ticketToDelete) {
            setTickets(tickets.filter(t => t.id !== ticketToDelete.id))
            setTicketToDelete(null)
        }
    }

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'Low': return 'success'
            case 'Medium': return 'warning'
            case 'High': return 'danger'
            default: return 'secondary'
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Open': return 'primary'
            case 'In Progress': return 'warning'
            case 'Resolved': return 'success'
            case 'Closed': return 'secondary'
            default: return 'default'
        }
    }

    const filteredTickets = tickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const printTicketReport = (period) => {
        const now = new Date()
        const currentMonthIdx = now.getMonth()
        const currentYear = now.getFullYear()
        const currentMonthName = now.toLocaleString('id-ID', { month: 'long' })

        let reportTitle = ""
        let reportPeriod = ""
        let filteredData = []

        if (period === 'monthly') {
            reportTitle = "LAPORAN HELPDESK & TIKET BULANAN"
            reportPeriod = `PERIODE: ${currentMonthName.toUpperCase()} ${currentYear}`

            filteredData = tickets.filter(ticket => {
                const ticketDate = new Date(ticket.date)
                return ticketDate.getMonth() === currentMonthIdx &&
                    ticketDate.getFullYear() === currentYear
            })
            // Sort by date ascending
            filteredData.sort((a, b) => new Date(a.date) - new Date(b.date))
        } else {
            reportTitle = "LAPORAN HELPDESK & TIKET TAHUNAN"
            reportPeriod = "PERIODE: SEMUA TAHUN (REKAPITULASI)"

            // All tickets for annual overview
            filteredData = [...tickets]
            // Sort by date ascending (oldest to newest) to group by year correctly
            filteredData.sort((a, b) => new Date(a.date) - new Date(b.date))
        }

        let tableContent = ""
        let lastYear = null

        if (period === 'monthly') {
            tableContent = filteredData.map((t, index) => `
                <tr>
                    <td style="text-align: center">${index + 1}</td>
                    <td>${t.date}</td>
                    <td>${t.subject}</td>
                    <td>${t.requester}</td>
                    <td style="text-align: center">${t.priority}</td>
                    <td style="text-align: center">${t.status}</td>
                    <td></td>
                </tr>
            `).join('')
        } else {
            // Group by year for annual report
            filteredData.forEach((t, index) => {
                const ticketDate = new Date(t.date)
                const ticketYear = ticketDate.getFullYear()

                if (ticketYear !== lastYear) {
                    lastYear = ticketYear
                    tableContent += `
                        <tr style="background-color: #f0f0f0; font-weight: bold;">
                            <td colspan="7" style="text-align: center; padding: 10px;">TAHUN ${ticketYear}</td>
                        </tr>
                    `
                }

                tableContent += `
                    <tr>
                        <td style="text-align: center">${index + 1}</td>
                        <td>${t.date}</td>
                        <td>${t.subject}</td>
                        <td>${t.requester}</td>
                        <td style="text-align: center">${t.priority}</td>
                        <td style="text-align: center">${t.status}</td>
                        <td></td>
                    </tr>
                `
            })
        }

        const printContent = `
            <html>
                <head>
                    <title>Laporan Helpdesk - SIM-TIK Inspektorat</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header-container { text-align: center; margin-bottom: 20px; border-bottom: 3px double black; padding-bottom: 15px; }
                        .header-title-1 { font-size: 18px; font-weight: bold; }
                        .header-title-2 { font-size: 22px; font-weight: bold; margin: 5px 0; }
                        .header-address { font-size: 12px; font-style: italic; }
                        .logo { width: 80px; height: auto; position: absolute; left: 20px; top: 20px; }
                        
                        .report-title { text-align: center; margin: 20px 0; font-weight: bold; text-decoration: underline; }
                        .meta-info { margin-bottom: 20px; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
                        th, td { border: 1px solid black; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; text-align: center; }
                        .footer { margin-top: 50px; text-align: right; font-size: 12px; }
                        .signature-box { display: inline-block; text-align: center; margin-top: 20px; margin-right: 50px; }
                        .signature-line { margin-top: 60px; text-decoration: underline; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header-container">
                        <img src="/logo-kabupaten.png" class="logo" onerror="this.style.display='none'"/>
                        <div class="header-title-1">PEMERINTAH KABUPATEN TRENGGALEK</div>
                        <div class="header-title-2">INSPEKTORAT</div>
                        <div class="header-address">Jl. KH. Wachid Hasyim No.5 66311 Telp. 0355-791472</div>
                        <div class="header-address">https://inspektorat.trenggalekkab.go.id</div>
                    </div>

                    <div class="report-title">
                        ${reportTitle}<br>
                        ${reportPeriod}
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%">No</th>
                                <th style="width: 15%">Tanggal</th>
                                <th style="width: 25%">Perihal / Masalah</th>
                                <th style="width: 15%">Pelapor</th>
                                <th style="width: 10%">Prioritas</th>
                                <th style="width: 10%">Status</th>
                                <th style="width: 20%">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableContent}
                        </tbody>
                    </table>

                    <div class="footer">
                        <div class="signature-box">
                            <p>[Kota], ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p>Mengetahui,</p>
                            <p>Kepala Inspektorat Daerah</p>
                            <div class="signature-line">( Nama Kepala Dinas )</div>
                            <p>NIP. 19xxxxxxxxxxxxxx</p>
                        </div>
                    </div>
                </body>
            </html>
        `

        const printWindow = window.open('', '', 'width=800,height=600')
        printWindow.document.write(printContent)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-secondary-900">Helpdesk</h2>
                <div className="flex space-x-2">
                    <div className="relative" ref={printMenuRef}>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                        >
                            <Printer className="h-4 w-4" />
                            Print Report
                        </Button>

                        {isPrintMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        printTicketReport('monthly')
                                        setIsPrintMenuOpen(false)
                                    }}
                                >
                                    Laporan Bulanan
                                </button>
                                <button
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        printTicketReport('yearly')
                                        setIsPrintMenuOpen(false)
                                    }}
                                >
                                    Laporan Tahunan
                                </button>
                            </div>
                        )}
                    </div>
                    <Button onClick={() => {
                        setSelectedTicket(null)
                        setIsModalOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" /> New Ticket
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-medium">All Tickets</CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-500" />
                            <Input
                                placeholder="Search tickets..."
                                className="pl-8 w-[250px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Subject</TableHead>
                                <TableHead>Requester</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center">
                                            <MessageSquare className="mr-2 h-4 w-4 text-secondary-400" />
                                            {ticket.subject}
                                        </div>
                                    </TableCell>
                                    <TableCell>{ticket.requester}</TableCell>
                                    <TableCell>
                                        <Badge variant={getPriorityBadge(ticket.priority)}>{ticket.priority}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            ticket.status === 'Open' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                                ticket.status === 'In Progress' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                    ticket.status === 'Resolved' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : ''
                                        }>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell>{ticket.date}</TableCell>
                                    <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                            <CanDo permission="helpdesk.edit">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => {
                                                    setSelectedTicket(ticket)
                                                    setIsModalOpen(true)
                                                }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </CanDo>
                                            <CanDo permission="helpdesk.delete">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteTicket(ticket)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </CanDo>
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
                    setSelectedTicket(null)
                }}
                title={selectedTicket ? "Edit Ticket" : "Submit Tiket Baru"}
            >
                <TicketForm
                    initialData={selectedTicket}
                    onCancel={() => {
                        setIsModalOpen(false)
                        setSelectedTicket(null)
                    }}
                    onSubmit={handleSaveTicket}
                />
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                isOpen={!!ticketToDelete}
                onClose={() => setTicketToDelete(null)}
                title="Konfirmasi Hapus Tiket"
                className="max-w-sm"
            >
                <div className="space-y-4 pt-2">
                    <p>Apakah Anda yakin ingin menghapus tiket <strong className="font-semibold text-secondary-900">{ticketToDelete?.subject}</strong>?</p>
                    <p className="text-sm text-secondary-500">Tindakan ini tidak dapat dibatalkan.</p>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setTicketToDelete(null)}>Batal</Button>
                        <Button variant="danger" onClick={confirmDeleteTicket}>Hapus Tiket</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
