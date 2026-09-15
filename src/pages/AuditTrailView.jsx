// src/pages/AuditTrailView.jsx
// Halaman Jejak Audit Forensik (Immutable Audit Trail) untuk Inspektorat Kabupaten Trenggalek
import { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, RefreshCw, FileText, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { fetchAuditLogsApi } from '../data/assetsStore';

export default function AuditTrailView() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [totalCount, setTotalCount] = useState(0);

    const loadAuditLogs = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (actionFilter !== 'ALL') params.action = actionFilter;
            const res = await fetchAuditLogsApi(params);
            if (res && res.data) {
                setLogs(res.data);
                setTotalCount(res.total || res.data.length);
            }
        } catch (err) {
            console.error('Gagal mengambil audit log:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAuditLogs();
    }, [actionFilter]);

    const filteredLogs = logs.filter(log => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            (log.userName && log.userName.toLowerCase().includes(term)) ||
            (log.userNip && log.userNip.includes(term)) ||
            (log.action && log.action.toLowerCase().includes(term)) ||
            (log.entity && log.entity.toLowerCase().includes(term)) ||
            (log.ipAddress && log.ipAddress.includes(term))
        );
    });

    const getActionBadge = (action) => {
        switch (action) {
            case 'LOGIN_SUCCESS':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Masuk (Login)</span>;
            case 'LOGOUT':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Keluar (Logout)</span>;
            case 'CREATE_ASSET':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">+ Tambah Aset</span>;
            case 'UPDATE_ASSET':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">✎ Ubah Aset</span>;
            case 'DELETE_ASSET':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">✕ Hapus Aset</span>;
            case 'MUTATE_CUSTODY':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">↔ Serah Terima / BAST</span>;
            case 'RETURN_CUSTODY':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">↓ Tarik ke Gudang</span>;
            case 'ADD_MAINTENANCE':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">⚙ Servis / Kapitalisasi</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{action}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Informasi */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Jejak Audit Forensik (*Audit Trail*) APIP
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Catatan audit permanen tak terhapus (*immutable log*) seluruh mutasi data aset, otentikasi pegawai, dan dokumen BAST pada Inspektorat Kabupaten Trenggalek.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={loadAuditLogs} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Segarkan
                    </Button>
                </div>
            </div>

            {/* Banner Kepatuhan Pengawasan */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-200">
                        <span className="font-semibold">Standar Kepatuhan Aparat Pengawasan Intern Pemerintah (APIP) & BPK:</span>
                        <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">
                            Setiap perubahan data inventaris, alokasi pegawai, dan penghapusan aset dicatat otomatis secara *real-time* ke dalam database SQLite WAL terenkripsi lengkap dengan alamat IP, stempel waktu, dan detail pembeda (*before vs after*).
                        </p>
                    </div>
                </div>
            </div>

            {/* Kontrol Pencarian & Filter */}
            <Card className="border-secondary-200 dark:border-secondary-800">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                            <Input
                                type="text"
                                placeholder="Cari nama pegawai, NIP, aksi, atau IP address..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-secondary-400 shrink-0" />
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="rounded-lg border border-secondary-300 bg-white px-3 py-2 text-sm text-secondary-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-100"
                            >
                                <option value="ALL">Semua Jenis Aktivitas</option>
                                <option value="CREATE_ASSET">Tambah Aset Baru</option>
                                <option value="UPDATE_ASSET">Ubah Data Aset</option>
                                <option value="DELETE_ASSET">Hapus Aset</option>
                                <option value="MUTATE_CUSTODY">Mutasi / BAST</option>
                                <option value="RETURN_CUSTODY">Penarikan ke Gudang</option>
                                <option value="ADD_MAINTENANCE">Servis / Kapitalisasi</option>
                                <option value="LOGIN_SUCCESS">Masuk Akun</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabel Jejak Audit */}
            <Card className="border-secondary-200 dark:border-secondary-800 overflow-hidden">
                <CardHeader className="border-b border-secondary-100 pb-3 dark:border-secondary-800">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-secondary-900 dark:text-white">
                            Riwayat Aktivitas Tercatat ({filteredLogs.length} dari {totalCount} log)
                        </CardTitle>
                        <span className="text-xs font-mono text-secondary-500 dark:text-secondary-400">
                            Storage: SQLite WAL Immutable
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-secondary-600 dark:text-secondary-300">
                            <thead className="border-b border-secondary-200 bg-secondary-50 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:border-secondary-800 dark:bg-secondary-800/60 dark:text-secondary-400">
                                <tr>
                                    <th className="px-4 py-3">Waktu (WIB)</th>
                                    <th className="px-4 py-3">Pelaksana (Auditor / Staf)</th>
                                    <th className="px-4 py-3">Jenis Aktivitas</th>
                                    <th className="px-4 py-3">Entitas / Target</th>
                                    <th className="px-4 py-3">Alamat IP & Klien</th>
                                    <th className="px-4 py-3">Rincian Perubahan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-secondary-500 dark:text-secondary-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="h-5 w-5 animate-spin text-primary-600" />
                                                Memuat jejak audit forensik dari database...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-secondary-500 dark:text-secondary-400">
                                            Tidak ada riwayat aktivitas yang sesuai dengan kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-secondary-50/80 dark:hover:bg-secondary-800/40 transition-colors">
                                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-secondary-500 dark:text-secondary-400">
                                                {log.timestamp}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-secondary-900 dark:text-white">
                                                    {log.userName}
                                                </div>
                                                <div className="text-xs text-secondary-400 font-mono">
                                                    NIP: {log.userNip || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getActionBadge(log.action)}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                <span className="font-semibold text-secondary-800 dark:text-secondary-200">
                                                    {log.entity}
                                                </span>
                                                {log.entityId && (
                                                    <span className="text-secondary-400"> #{log.entityId}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-secondary-500 dark:text-secondary-400">
                                                <div>{log.ipAddress}</div>
                                                <div className="truncate max-w-[150px] text-[10px] text-secondary-400" title={log.userAgent}>
                                                    {log.userAgent}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {log.details ? (
                                                    <pre className="max-w-xs overflow-x-auto rounded bg-secondary-100 border border-secondary-200 dark:border-secondary-800 p-2 font-mono text-[11px] text-secondary-800 dark:bg-secondary-950 dark:text-secondary-200">
                                                        {JSON.stringify(log.details, null, 1)}
                                                    </pre>
                                                ) : (
                                                    <span className="text-secondary-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
