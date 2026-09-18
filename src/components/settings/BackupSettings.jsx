import React, { useState, useEffect } from "react"
import {
    Database, HardDrive, Download, Send, CheckCircle2, AlertCircle,
    Clock, Shield, RefreshCw, Eye, EyeOff, Bot, MessageSquare,
    FileCode, Server, Check, ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/Card"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

export function BackupSettings() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isRunningBackup, setIsRunningBackup] = useState(false)
    const [isTestingTelegram, setIsTestingTelegram] = useState(false)
    const [isTestingWaha, setIsTestingWaha] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const [alertMessage, setAlertMessage] = useState({ type: "", text: "" })
    const [testResultTg, setTestResultTg] = useState(null)
    const [testResultWaha, setTestResultWaha] = useState(null)

    const [showTgToken, setShowTgToken] = useState(false)

    // Data Statistik & Konfigurasi
    const [stats, setStats] = useState({
        dbPath: "",
        dbSizeFormatted: "0 MB",
        counts: {
            assets: 0,
            users: 0,
            auditLogs: 0,
            atkItems: 0,
            storedBackups: 0
        }
    })

    const [formData, setFormData] = useState({
        schedule: "daily",
        time_wib: "00:00",
        telegram_enabled: false,
        telegram_bot_token: "",
        telegram_chat_id: "",
        waha_enabled: false,
        waha_api_url: "",
        waha_session: "default",
        waha_target_number: "",
        last_backup_time: null,
        last_backup_status: null,
        last_backup_message: null
    })

    const loadConfig = async () => {
        setIsLoading(true)
        setAlertMessage({ type: "", text: "" })
        try {
            const token = sessionStorage.getItem("simtik_auth_token")
            const res = await fetch("/api/backup/config", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })
            const result = await res.json()

            if (result.success && result.data) {
                setStats({
                    dbPath: result.data.dbPath || "",
                    dbSizeFormatted: result.data.dbSizeFormatted || "0 MB",
                    counts: result.data.counts || {
                        assets: 0,
                        users: 0,
                        auditLogs: 0,
                        atkItems: 0,
                        storedBackups: 0
                    }
                })

                const cfg = result.data.config || {}
                setFormData({
                    schedule: cfg.schedule || "daily",
                    time_wib: cfg.time_wib || "00:00",
                    telegram_enabled: Boolean(cfg.telegram_enabled),
                    telegram_bot_token: cfg.telegram_bot_token || "",
                    telegram_chat_id: cfg.telegram_chat_id || "",
                    waha_enabled: Boolean(cfg.waha_enabled),
                    waha_api_url: cfg.waha_api_url || "",
                    waha_session: cfg.waha_session || "default",
                    waha_target_number: cfg.waha_target_number || "",
                    last_backup_time: cfg.last_backup_time,
                    last_backup_status: cfg.last_backup_status,
                    last_backup_message: cfg.last_backup_message
                })
            } else {
                setAlertMessage({ type: "error", text: result.message || "Gagal memuat konfigurasi backup." })
            }
        } catch (err) {
            console.error(err)
            setAlertMessage({ type: "error", text: "Terjadi kesalahan jaringan saat mengambil data backup." })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadConfig()
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleSaveConfig = async (e) => {
        if (e) e.preventDefault()
        setIsSaving(true)
        setAlertMessage({ type: "", text: "" })

        try {
            const token = sessionStorage.getItem("simtik_auth_token")
            const res = await fetch("/api/backup/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(formData)
            })
            const result = await res.json()

            if (result.success) {
                setAlertMessage({ type: "success", text: "Pengaturan pencadangan & integrasi berhasil disimpan!" })
                loadConfig()
            } else {
                setAlertMessage({ type: "error", text: result.message || "Gagal menyimpan pengaturan." })
            }
        } catch (err) {
            console.error(err)
            setAlertMessage({ type: "error", text: "Gagal menyimpan: periksa koneksi server." })
        } finally {
            setIsSaving(false)
        }
    }

    // Eksekusi Backup Manual On-Demand
    const handleRunBackupNow = async () => {
        if (!window.confirm("Jalankan pencadangan basis data sekarang? Saluran notifikasi yang aktif (Telegram / WhatsApp) akan menerima salinan cadangan ini.")) {
            return
        }

        setIsRunningBackup(true)
        setAlertMessage({ type: "", text: "" })

        try {
            const token = sessionStorage.getItem("simtik_auth_token")
            const res = await fetch("/api/backup/run", {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })
            const result = await res.json()

            if (result.success) {
                setAlertMessage({ type: "success", text: result.message || "Pencadangan berhasil dieksekusi!" })
                loadConfig()
            } else {
                setAlertMessage({ type: "error", text: result.message || "Pencadangan gagal dieksekusi." })
            }
        } catch (err) {
            console.error(err)
            setAlertMessage({ type: "error", text: "Terjadi kesalahan saat memicu pencadangan." })
        } finally {
            setIsRunningBackup(false)
        }
    }

    // Uji Kirim Pesan Telegram
    const handleTestTelegram = async () => {
        if (!formData.telegram_bot_token || !formData.telegram_chat_id) {
            alert("Harap masukkan Bot Token dan Chat ID Telegram terlebih dahulu!")
            return
        }

        setIsTestingTelegram(true)
        setTestResultTg(null)

        try {
            const token = sessionStorage.getItem("simtik_auth_token")
            const res = await fetch("/api/backup/test-telegram", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    botToken: formData.telegram_bot_token,
                    chatId: formData.telegram_chat_id
                })
            })
            const result = await res.json()

            if (result.success) {
                setTestResultTg({ ok: true, message: "Sukses! Pesan verifikasi terkirim ke Telegram." })
            } else {
                setTestResultTg({ ok: false, message: result.message || "Gagal menghubungi Telegram." })
            }
        } catch (err) {
            setTestResultTg({ ok: false, message: "Koneksi gagal: " + err.message })
        } finally {
            setIsTestingTelegram(false)
        }
    }

    // Uji Kirim Pesan WAHA (WhatsApp)
    const handleTestWaha = async () => {
        if (!formData.waha_api_url || !formData.waha_target_number) {
            alert("Harap masukkan URL Server WAHA dan Nomor WhatsApp tujuan terlebih dahulu!")
            return
        }

        setIsTestingWaha(true)
        setTestResultWaha(null)

        try {
            const token = sessionStorage.getItem("simtik_auth_token")
            const res = await fetch("/api/backup/test-waha", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    apiUrl: formData.waha_api_url,
                    session: formData.waha_session,
                    targetNumber: formData.waha_target_number
                })
            })
            const result = await res.json()

            if (result.success) {
                setTestResultWaha({ ok: true, message: "Sukses! Pesan verifikasi terkirim ke WhatsApp via WAHA." })
            } else {
                setTestResultWaha({ ok: false, message: result.message || "Gagal menghubungi server WAHA." })
            }
        } catch (err) {
            setTestResultWaha({ ok: false, message: "Koneksi gagal: " + err.message })
        } finally {
            setIsTestingWaha(false)
        }
    }

    // Unduh File Database SQLite Secara Instan
    const handleDownloadSnapshot = async () => {
        setIsDownloading(true)
        try {
            const token = sessionStorage.getItem("simtik_auth_token")
            const res = await fetch("/api/backup/download", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })

            if (!res.ok) {
                throw new Error("Gagal mengunduh file cadangan dari server.")
            }

            const blob = await res.blob()
            const disposition = res.headers.get("Content-Disposition")
            let fileName = `simtik_backup_${new Date().toISOString().split("T")[0]}.db`
            if (disposition && disposition.includes("filename=")) {
                const match = disposition.match(/filename="?([^"]+)"?/)
                if (match && match[1]) fileName = match[1]
            }

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            alert(err.message)
        } finally {
            setIsDownloading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="h-6 w-6 animate-spin text-primary-600 mr-2" />
                <span className="text-sm font-medium text-secondary-600">Memuat status basis data & cadangan...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Banner Status & Notifikasi Feedback */}
            {alertMessage.text && (
                <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
                    alertMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-800"
                }`}>
                    {alertMessage.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                    )}
                    <div>
                        <p className="font-semibold">{alertMessage.type === "success" ? "Berhasil" : "Perhatian"}</p>
                        <p className="mt-0.5 text-xs sm:text-sm">{alertMessage.text}</p>
                    </div>
                </div>
            )}

            {/* 1. KARTU STATUS KESEHATAN DATABASE & AKSI CEPAT */}
            <Card className="border border-secondary-200 dark:border-secondary-800 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 p-6 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                                <Database className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Pusat Cadangan Basis Data (SQLite WAL)</h3>
                                <p className="text-xs text-primary-100 mt-0.5">
                                    Inspektorat Daerah Kabupaten Trenggalek • Snapshot Aman Tanpa Gangguan Akses
                                </p>
                            </div>
                        </div>

                        {/* Tombol Aksi Cepat */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleDownloadSnapshot}
                                isLoading={isDownloading}
                                className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-xs font-semibold"
                                title="Unduh snapshot database .db langsung ke komputer Anda"
                            >
                                <Download className="h-4 w-4 mr-1.5" />
                                Unduh File Database (.db)
                            </Button>

                            <Button
                                variant="success"
                                onClick={handleRunBackupNow}
                                isLoading={isRunningBackup}
                                className="text-xs font-bold shadow-md"
                                title="Jalankan pencadangan dan kirim berkas ke Telegram / WhatsApp sekarang"
                            >
                                <Send className="h-4 w-4 mr-1.5" />
                                Cadangkan & Kirim Sekarang
                            </Button>
                        </div>
                    </div>

                    {/* Ringkasan Metrik Data */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-white/15">
                        <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Kapasitas DB</span>
                            <p className="text-lg font-extrabold text-white mt-0.5">{stats.dbSizeFormatted}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Aset Tetap</span>
                            <p className="text-lg font-extrabold text-white mt-0.5">{stats.counts.assets} unit</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Pegawai / ASN</span>
                            <p className="text-lg font-extrabold text-white mt-0.5">{stats.counts.users} orang</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs">
                            <span className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Jejak Audit</span>
                            <p className="text-lg font-extrabold text-white mt-0.5">{stats.counts.auditLogs} log</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 backdrop-blur-xs col-span-2 sm:col-span-1">
                            <span className="text-[10px] uppercase font-bold text-primary-200 tracking-wider">Arsip Tersimpan</span>
                            <p className="text-lg font-extrabold text-white mt-0.5">{stats.counts.storedBackups} berkas</p>
                        </div>
                    </div>
                </div>

                <CardContent className="p-4 bg-secondary-50 dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800 text-xs text-secondary-600 dark:text-secondary-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                            Status Terakhir: <strong>{formData.last_backup_status || "Belum ada riwayat"}</strong>
                            {formData.last_backup_time && ` (${formData.last_backup_time})`}
                        </span>
                    </div>
                    {formData.last_backup_message && (
                        <span className="italic truncate max-w-md" title={formData.last_backup_message}>
                            "{formData.last_backup_message}"
                        </span>
                    )}
                </CardContent>
            </Card>

            <form onSubmit={handleSaveConfig} className="space-y-6">
                {/* 2. FORM PENJADWALAN OTOMATIS */}
                <Card className="border border-secondary-200 dark:border-secondary-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary-600" />
                            <CardTitle className="text-base font-bold">Jadwal Pencadangan Otomatis</CardTitle>
                        </div>
                        <p className="text-xs text-secondary-500 mt-1">
                            Atur frekuensi pencadangan otomatis background scheduler pada server SIM-TIK.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    Frekuensi Pencadangan
                                </label>
                                <select
                                    name="schedule"
                                    value={formData.schedule}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-xs sm:text-sm text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="off">Nonaktif (Hanya Cadangan Manual)</option>
                                    <option value="daily">Setiap Hari (Rekomendasi)</option>
                                    <option value="weekly">Setiap Minggu (Hari Minggu)</option>
                                    <option value="monthly">Setiap Bulan (Tanggal 1)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    Waktu Eksekusi (WIB)
                                </label>
                                <Input
                                    type="time"
                                    name="time_wib"
                                    value={formData.time_wib}
                                    onChange={handleChange}
                                    disabled={formData.schedule === "off"}
                                    className="h-10 text-xs sm:text-sm"
                                />
                                <span className="text-[11px] text-secondary-400">
                                    Disarankan dieksekusi saat jam kerja selesai (misal: 00:00 atau 23:00 WIB).
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. INTEGRASI SALURAN TELEGRAM */}
                <Card className="border border-secondary-200 dark:border-secondary-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-sky-500" />
                                <div>
                                    <CardTitle className="text-base font-bold">Integrasi Telegram Bot</CardTitle>
                                    <p className="text-xs text-secondary-500 mt-0.5">
                                        Kirim berkas basis data (.db) dan notifikasi statistik langsung ke Bot / Channel Telegram.
                                    </p>
                                </div>
                            </div>

                            {/* Switch Aktif Telegram */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="telegram_enabled"
                                    checked={formData.telegram_enabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    Bot Token Telegram <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showTgToken ? "text" : "password"}
                                        name="telegram_bot_token"
                                        value={formData.telegram_bot_token}
                                        onChange={handleChange}
                                        placeholder="Contoh: 7123456789:AAHxxxxxxxxxxxxxxxx"
                                        disabled={!formData.telegram_enabled}
                                        className="pr-10 text-xs sm:text-sm font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowTgToken(!showTgToken)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 focus:outline-none"
                                        title={showTgToken ? "Sembunyikan Token" : "Tampilkan Token"}
                                    >
                                        {showTgToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <span className="text-[11px] text-secondary-400">
                                    Dibuat melalui obrolan dengan <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">@BotFather</a> di Telegram.
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    Chat ID / Channel ID Tujuan <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="telegram_chat_id"
                                    value={formData.telegram_chat_id}
                                    onChange={handleChange}
                                    placeholder="Contoh: -100123456789 atau @channel_simtik"
                                    disabled={!formData.telegram_enabled}
                                    className="text-xs sm:text-sm font-mono"
                                />
                                <span className="text-[11px] text-secondary-400">
                                    Gunakan ID obrolan pribadi, ID grup dengan prefix tanda minus, atau username channel publik.
                                </span>
                            </div>
                        </div>

                        {/* Hasil Uji Telegram */}
                        {testResultTg && (
                            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                                testResultTg.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                            }`}>
                                {testResultTg.ok ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
                                <span>{testResultTg.message}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTestTelegram}
                                isLoading={isTestingTelegram}
                                disabled={!formData.telegram_enabled || !formData.telegram_bot_token || !formData.telegram_chat_id}
                                className="text-xs"
                            >
                                <Send className="h-3.5 w-3.5 mr-1.5 text-sky-500" />
                                Uji Kirim Pesan Telegram
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. INTEGRASI SALURAN WHATSAPP (WAHA) */}
                <Card className="border border-secondary-200 dark:border-secondary-800">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-emerald-500" />
                                <div>
                                    <CardTitle className="text-base font-bold">Integrasi WhatsApp (WAHA HTTP API)</CardTitle>
                                    <p className="text-xs text-secondary-500 mt-0.5">
                                        Kirim notifikasi ringkasan cadangan data ke nomor WhatsApp Administrator / Pimpinan melalui gateway WAHA.
                                    </p>
                                </div>
                            </div>

                            {/* Switch Aktif WAHA */}
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="waha_enabled"
                                    checked={formData.waha_enabled}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    URL Server WAHA <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="waha_api_url"
                                    value={formData.waha_api_url}
                                    onChange={handleChange}
                                    placeholder="http://localhost:3000 atau https://waha.domain"
                                    disabled={!formData.waha_enabled}
                                    className="text-xs sm:text-sm font-mono"
                                />
                                <span className="text-[11px] text-secondary-400">Endpoint API instance WAHA aktif.</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    Nama Sesi WAHA (Session)
                                </label>
                                <Input
                                    type="text"
                                    name="waha_session"
                                    value={formData.waha_session}
                                    onChange={handleChange}
                                    placeholder="default"
                                    disabled={!formData.waha_enabled}
                                    className="text-xs sm:text-sm"
                                />
                                <span className="text-[11px] text-secondary-400">Nama sesi WhatsApp terhubung (bawaan: default).</span>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    Nomor WhatsApp Tujuan <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    name="waha_target_number"
                                    value={formData.waha_target_number}
                                    onChange={handleChange}
                                    placeholder="6281335xxxxxx atau ID Grup"
                                    disabled={!formData.waha_enabled}
                                    className="text-xs sm:text-sm font-mono"
                                />
                                <span className="text-[11px] text-secondary-400">Gunakan format internasional (diawali 62).</span>
                            </div>
                        </div>

                        {/* Hasil Uji WAHA */}
                        {testResultWaha && (
                            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                                testResultWaha.ok ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                            }`}>
                                {testResultWaha.ok ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />}
                                <span>{testResultWaha.message}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleTestWaha}
                                isLoading={isTestingWaha}
                                disabled={!formData.waha_enabled || !formData.waha_api_url || !formData.waha_target_number}
                                className="text-xs"
                            >
                                <Send className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                                Uji Kirim WhatsApp (WAHA)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tombol Simpan Konfigurasi Keseluruhan */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        isLoading={isSaving}
                        className="px-6 font-bold text-xs sm:text-sm"
                    >
                        Simpan Seluruh Pengaturan Pencadangan
                    </Button>
                </div>
            </form>
        </div>
    )
}
