import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Monitor, Box, Activity, ArrowUpRight, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { getAssets } from "../data/assetsStore"

export default function Dashboard() {
    const [assetStats, setAssetStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        retired: 0
    })

    const [deviceStats, setDeviceStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        retired: 0
    })

    const [atkStats, setAtkStats] = useState({
        total: 0,
        available: 0,
        lowStock: 0
    })

    const [ticketStats, setTicketStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
    })

    const [recentActivity, setRecentActivity] = useState([])
    const [monthlyTicketData, setMonthlyTicketData] = useState([])

    /**
     * Hitung tren tiket per bulan dari data real localStorage.
     */
    const buildMonthlyTicketChart = useCallback((tickets) => {
        const now = new Date()
        const months = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            months.push({
                name: d.toLocaleString('id-ID', { month: 'short' }),
                year: d.getFullYear(),
                month: d.getMonth(),
                tickets: 0
            })
        }

        tickets.forEach(ticket => {
            const ticketDate = new Date(ticket.date)
            const idx = months.findIndex(
                m => m.month === ticketDate.getMonth() && m.year === ticketDate.getFullYear()
            )
            if (idx !== -1) months[idx].tickets += 1
        })

        return months.map(({ name, tickets }) => ({ name, tickets }))
    }, [])

    const loadStats = useCallback(() => {
        const activities = []

        // Load Assets dari data store
        const assets = getAssets()
        setAssetStats({
            total: assets.length,
            available: assets.filter(a => a.status === 'Available').length,
            inUse: assets.filter(a => a.status === 'In Use').length,
            maintenance: assets.filter(a => a.status === 'Maintenance').length,
            retired: assets.filter(a => a.status === 'Damaged' || a.status === 'Disposed').length
        })

        assets.slice(0, 5).forEach(asset => {
            activities.push({
                type: 'Asset',
                title: `Aset: ${asset.name}`,
                desc: `${asset.category || "Aset"} • ${asset.assignee && asset.assignee !== '-' ? `Dipegang oleh ${asset.assignee}` : 'Tersedia di Gudang'}`,
                date: new Date(asset.purchaseDate || Date.now()),
                id: `asset-${asset.id}`
            })
        })

        // Load Devices
        const itCategories = ["Laptop", "PC Desktop", "Server", "Networking", "Printer", "Peripheral"]
        const devices = assets.filter(a => itCategories.includes(a.category))
        setDeviceStats({
            total: devices.length,
            available: devices.filter(d => d.status === 'Available').length,
            inUse: devices.filter(d => d.status === 'In Use').length,
            maintenance: devices.filter(d => d.status === 'Maintenance').length,
            retired: devices.filter(d => d.status === 'Damaged' || d.status === 'Disposed').length
        })

        // Load ATK
        const savedAtk = localStorage.getItem("simtik_stock_atk")
        if (savedAtk) {
            try {
                const atks = JSON.parse(savedAtk)
                if (Array.isArray(atks)) {
                    setAtkStats({
                        total: atks.length,
                        available: atks.filter(a => Number(a.quantity) > 5).length,
                        lowStock: atks.filter(a => Number(a.quantity) <= 5).length
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }

        // Load Tickets
        const savedTickets = localStorage.getItem("simtik_tickets")
        if (savedTickets) {
            try {
                const tickets = JSON.parse(savedTickets)
                if (Array.isArray(tickets)) {
                    setTicketStats({
                        total: tickets.length,
                        open: tickets.filter(t => t.status === 'Open').length,
                        inProgress: tickets.filter(t => t.status === 'In Progress').length,
                        resolved: tickets.filter(t => t.status === 'Resolved').length,
                        closed: tickets.filter(t => t.status === 'Closed').length
                    })

                    setMonthlyTicketData(buildMonthlyTicketChart(tickets))

                    tickets.slice(0, 3).forEach(ticket => {
                        activities.push({
                            type: 'Ticket',
                            title: `Tiket: ${ticket.subject}`,
                            desc: `Prioritas ${ticket.priority} • Pemohon: ${ticket.requester || '-'}`,
                            date: new Date(ticket.date),
                            id: `ticket-${ticket.id}`
                        })
                    })
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            setMonthlyTicketData(buildMonthlyTicketChart([]))
        }

        activities.sort((a, b) => b.date - a.date)
        setRecentActivity(activities.slice(0, 6))
    }, [buildMonthlyTicketChart])

    useEffect(() => {
        loadStats()
        const handleStorageChange = () => loadStats()
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [loadStats])

    return (
        <div className="space-y-6">
            {/* Header Selamat Datang */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
                        Dasbor Ringkasan Logistik & Aset TIK
                    </h2>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                        Pantau status inventaris, mutasi pemegang perangkat, dan tiket helpdesk secara langsung.
                    </p>
                </div>
            </div>

            {/* Statistik Kartu Utama */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {/* 1. Perangkat TIK */}
                <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                            Perangkat TIK (Hardware)
                        </CardTitle>
                        <Monitor className="h-4 w-4 text-primary-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold text-secondary-900 dark:text-white">{deviceStats.total}</div>
                            <Link to="/assets/devices" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 font-medium">
                                <span>Lihat</span>
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Tersedia di Gudang
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{deviceStats.available}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Sedang Digunakan
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{deviceStats.inUse}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div> Dalam Perbaikan
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{deviceStats.maintenance}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-secondary-400 mr-2"></div> Afkir / Dihapus
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{deviceStats.retired}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Inventaris Aset Umum */}
                <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                            Inventaris Aset Umum
                        </CardTitle>
                        <Box className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold text-secondary-900 dark:text-white">{assetStats.total}</div>
                            <Link to="/assets/inventory" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 font-medium">
                                <span>Lihat</span>
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Tersedia di Gudang
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{assetStats.available}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Sedang Digunakan
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{assetStats.inUse}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div> Dalam Perbaikan
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{assetStats.maintenance}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-secondary-400 mr-2"></div> Afkir / Dihapus
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{assetStats.retired}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Stok Opname ATK */}
                <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                            Stok Opname ATK
                        </CardTitle>
                        <Box className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                                {atkStats.total} <span className="text-xs font-normal text-secondary-500">Item</span>
                            </div>
                            <Link to="/assets/atk" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 font-medium">
                                <span>Lihat</span>
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Stok Aman
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{atkStats.available}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> Stok Menipis / Kritis
                                </span>
                                <span className="font-semibold text-red-600 dark:text-red-400">{atkStats.lowStock}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Layanan Helpdesk */}
                <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">
                            Tiket Layanan Helpdesk
                        </CardTitle>
                        <Activity className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline justify-between">
                            <div className="text-2xl font-bold text-secondary-900 dark:text-white">{ticketStats.total}</div>
                            <Link to="/helpdesk" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 font-medium">
                                <span>Lihat</span>
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="mt-4 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> Terbuka (Open)
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{ticketStats.open}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div> Sedang Diproses
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{ticketStats.inProgress}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="flex items-center text-secondary-600 dark:text-secondary-300">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Selesai (Resolved)
                                </span>
                                <span className="font-semibold text-secondary-900 dark:text-white">{ticketStats.resolved}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tren Tiket Bulanan */}
            <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary-600" />
                        <span>Tren Laporan Gangguan & Tiket Helpdesk (6 Bulan Terakhir)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTicketData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff',
                                        border: 'none',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value) => [`${value} Tiket`, 'Jumlah Masuk']}
                                />
                                <Bar dataKey="tickets" fill="#0284c7" radius={[6, 6, 0, 0]} name="Tiket" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Distribusi Status */}
            <div className="grid gap-5 md:grid-cols-2">
                {/* Distribusi Perangkat */}
                <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold text-secondary-900 dark:text-white">
                            Distribusi Ketersediaan Perangkat TIK
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[260px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Tersedia', value: deviceStats.available },
                                            { name: 'Digunakan', value: deviceStats.inUse },
                                            { name: 'Perbaikan', value: deviceStats.maintenance },
                                            { name: 'Afkir', value: deviceStats.retired }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#3b82f6" />
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#64748b" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Aktivitas Terkini */}
                <Card className="border border-secondary-200 dark:border-secondary-800 dark:bg-secondary-900">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold text-secondary-900 dark:text-white">
                            Aktivitas & Mutasi Terkini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3.5">
                            {recentActivity.length > 0 ? (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800/60 transition-colors">
                                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                            activity.type === 'Asset'
                                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300'
                                        }`}>
                                            {activity.type === 'Asset' ? <Monitor className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-secondary-900 dark:text-white truncate">
                                                {activity.title}
                                            </p>
                                            <p className="text-[11px] text-secondary-500 dark:text-secondary-400 truncate">
                                                {activity.desc}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-secondary-400 whitespace-nowrap">
                                            {activity.date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-secondary-500 text-center py-6">Belum ada aktivitas tercatat.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
