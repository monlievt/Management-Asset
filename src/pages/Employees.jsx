import { useState, useEffect, useMemo } from "react"
import {
    Users, Plus, Search, Edit3, Trash2, Download,
    Shield, Briefcase, Phone, Mail, Award, CheckCircle2,
    AlertTriangle, Building2, UserCheck, RefreshCw
} from "lucide-react"
import {
    getEmployees, addEmployee, updateEmployee, deleteEmployee,
    DEPARTMENT_LIST, GOLONGAN_LIST
} from "../data/employees"
import { getAssets } from "../data/assetsStore"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Modal } from "../components/ui/Modal"
import { CanDo } from "../lib/rbac"

export default function Employees() {
    const [employees, setEmployees] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDept, setSelectedDept] = useState("all")
    const [isLoading, setIsLoading] = useState(false)

    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [employeeToDelete, setEmployeeToDelete] = useState(null)
    const [heldAssetsWarning, setHeldAssetsWarning] = useState([])

    // Form data state
    const initialFormState = {
        name: "",
        nameWithoutDegree: "",
        nip: "",
        phone: "",
        birthPlace: "",
        birthDate: "",
        rank: "",
        department: "SEKRETARIAT",
        classGrade: "III/a",
        position: "",
        email: ""
    }
    const [formData, setFormData] = useState(initialFormState)
    const [formError, setFormError] = useState("")

    // Muat data pegawai
    const loadEmployeesData = () => {
        setIsLoading(true)
        try {
            const data = getEmployees()
            setEmployees(data)
        } catch (err) {
            console.error("Gagal memuat data pegawai:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadEmployeesData()
        const handleStorage = () => loadEmployeesData()
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    // Filter data berdasarkan search dan departemen
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch =
                (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.nip || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.position || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (emp.department || "").toLowerCase().includes(searchQuery.toLowerCase())

            const matchesDept =
                selectedDept === "all" ||
                (emp.department || "").toUpperCase().includes(selectedDept.toUpperCase())

            return matchesSearch && matchesDept
        })
    }, [employees, searchQuery, selectedDept])

    // Statistik Pegawai
    const stats = useMemo(() => {
        const total = employees.length
        const auditorPpupd = employees.filter(e =>
            (e.position || "").toLowerCase().includes("auditor") ||
            (e.position || "").toLowerCase().includes("ppupd")
        ).length
        const struktural = employees.filter(e =>
            (e.position || "").toLowerCase().includes("irban") ||
            (e.position || "").toLowerCase().includes("inspektur") ||
            (e.position || "").toLowerCase().includes("kasubbag") ||
            (e.position || "").toLowerCase().includes("sekretaris")
        ).length
        const operasional = total - auditorPpupd - struktural

        return { total, auditorPpupd, struktural, operasional: operasional > 0 ? operasional : 0 }
    }, [employees])

    // Handler Buka Form Tambah
    const handleOpenAddModal = () => {
        setEditingEmployee(null)
        setFormData(initialFormState)
        setFormError("")
        setIsFormModalOpen(true)
    }

    // Handler Buka Form Edit
    const handleOpenEditModal = (emp) => {
        setEditingEmployee(emp)
        setFormData({
            name: emp.name || "",
            nameWithoutDegree: emp.nameWithoutDegree || "",
            nip: emp.nip && emp.nip !== "-" ? emp.nip : "",
            phone: emp.phone && emp.phone !== "-" ? emp.phone : "",
            birthPlace: emp.birthPlace && emp.birthPlace !== "-" ? emp.birthPlace : "",
            birthDate: emp.birthDate && emp.birthDate !== "-" ? emp.birthDate : "",
            rank: emp.rank && emp.rank !== "-" ? emp.rank : "",
            department: emp.department || "SEKRETARIAT",
            classGrade: emp.classGrade && emp.classGrade !== "-" ? emp.classGrade : "III/a",
            position: emp.position && emp.position !== "-" ? emp.position : "",
            email: emp.email && emp.email !== "-" ? emp.email : ""
        })
        setFormError("")
        setIsFormModalOpen(true)
    }

    // Handler Submit Tambah / Ubah
    const handleSubmitForm = async (e) => {
        e.preventDefault()
        setFormError("")

        if (!formData.name.trim()) {
            setFormError("Nama lengkap pegawai beserta gelar wajib diisi.")
            return
        }

        try {
            if (editingEmployee) {
                await updateEmployee(editingEmployee.id, formData)
            } else {
                await addEmployee(formData)
            }
            loadEmployeesData()
            setIsFormModalOpen(false)
        } catch (err) {
            setFormError(err.message || "Gagal menyimpan data pegawai.")
        }
    }

    // Handler Konfirmasi Hapus
    const handleOpenDeleteModal = (emp) => {
        setEmployeeToDelete(emp)
        // Cek aset yang sedang dipegang
        const allAssets = getAssets()
        const held = allAssets.filter(a =>
            a.status === "In Use" &&
            (a.assignee === emp.name || a.assigneeNip === emp.nip)
        )
        setHeldAssetsWarning(held)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return
        if (heldAssetsWarning.length > 0) return // Dilarang hapus

        try {
            await deleteEmployee(employeeToDelete.id)
            loadEmployeesData()
            setIsDeleteModalOpen(false)
            setEmployeeToDelete(null)
        } catch (err) {
            alert("Gagal menghapus pegawai: " + err.message)
        }
    }

    // Ekspor CSV
    const handleExportCSV = () => {
        const headers = [
            "No", "NIP", "Nama Lengkap & Gelar", "Nama Tanpa Gelar",
            "Bidang / Inspektorat Pembantu", "Jabatan", "Pangkat", "Golongan",
            "Tempat Lahir", "Tanggal Lahir", "Nomor WhatsApp", "Alamat Email"
        ]

        const rows = filteredEmployees.map((emp, i) => [
            i + 1,
            `'${emp.nip}`,
            `"${emp.name.replace(/"/g, '""')}"`,
            `"${(emp.nameWithoutDegree || emp.name).replace(/"/g, '""')}"`,
            `"${(emp.department || "-").replace(/"/g, '""')}"`,
            `"${(emp.position || "-").replace(/"/g, '""')}"`,
            `"${(emp.rank || "-").replace(/"/g, '""')}"`,
            `"${(emp.classGrade || "-").replace(/"/g, '""')}"`,
            `"${(emp.birthPlace || "-").replace(/"/g, '""')}"`,
            `"${(emp.birthDate || "-").replace(/"/g, '""')}"`,
            `'${emp.phone}`,
            `"${(emp.email || "-").replace(/"/g, '""')}"`
        ])

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `Data_Pegawai_Inspektorat_Trenggalek_${new Date().toISOString().split("T")[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900 dark:text-white flex items-center gap-2.5">
                        <Users className="h-7 w-7 text-primary-600 dark:text-primary-400" />
                        Manajemen Data Pegawai
                    </h2>
                    <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        Pengelolaan master data aparatur sipil negara (ASN) & staf pada Inspektorat Kabupaten Trenggalek.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExportCSV}
                        className="flex items-center gap-2"
                        title="Unduh data dalam format CSV Excel"
                    >
                        <Download className="h-4 w-4" />
                        Ekspor CSV
                    </Button>
                    <CanDo permission="employees.create">
                        <Button
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pegawai Baru
                        </Button>
                    </CanDo>
                </div>
            </div>

            {/* Statistik Kartu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Total Seluruh Pegawai</p>
                            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">{stats.total}</h3>
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">Master Data Terverifikasi</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                            <Users className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Auditor & PPUPD</p>
                            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">{stats.auditorPpupd}</h3>
                            <p className="text-[11px] text-secondary-500 mt-0.5">Fungsional Pemeriksa APIP</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Shield className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Pejabat Struktural</p>
                            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">{stats.struktural}</h3>
                            <p className="text-[11px] text-secondary-500 mt-0.5">Inspektur & Pembantu Wilayah</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Building2 className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Sekretariat & Operasional</p>
                            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">{stats.operasional}</h3>
                            <p className="text-[11px] text-secondary-500 mt-0.5">Penunjang Layanan & TIK</p>
                        </div>
                        <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Briefcase className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter & Data Table */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 pb-4">
                    <div>
                        <CardTitle className="text-base font-semibold">Daftar Pegawai Inspektorat ({filteredEmployees.length})</CardTitle>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                            Menampilkan pegawai aktif yang berhak memegang aset inventaris dinas.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-400" />
                            <Input
                                placeholder="Cari nama, NIP, atau jabatan..."
                                className="pl-8 w-full sm:w-[260px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filter Department */}
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="h-10 px-3 rounded-md border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            <option value="all">Semua Bidang / Seksi</option>
                            <option value="SEKRETARIAT">Sekretariat</option>
                            <option value="IRBAN I">Irban Wilayah I</option>
                            <option value="IRBAN II">Irban Wilayah II</option>
                            <option value="IRBAN III">Irban Wilayah III</option>
                            <option value="IRBAN IV">Irban Wilayah IV</option>
                            <option value="KHUSUS">Irban Khusus / Investigasi</option>
                        </select>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">No</TableHead>
                                    <TableHead>Nama Pegawai & NIP</TableHead>
                                    <TableHead>Bidang / Unit Kerja</TableHead>
                                    <TableHead>Jabatan & Golongan</TableHead>
                                    <TableHead>Kontak Kedinasan</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-secondary-500">
                                            Tidak ada data pegawai yang sesuai dengan kata kunci pencarian.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredEmployees.map((emp, index) => (
                                        <TableRow key={emp.id || emp.nip || index} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40 transition-colors">
                                            <TableCell className="text-center font-mono text-xs text-secondary-500">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-secondary-900 dark:text-white">
                                                    {emp.name}
                                                </div>
                                                <div className="text-xs font-mono text-secondary-500 dark:text-secondary-400 mt-0.5">
                                                    NIP. {emp.nip || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-medium">
                                                    {emp.department || "SEKRETARIAT"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-medium text-secondary-800 dark:text-secondary-200">
                                                    {emp.position || "-"}
                                                </div>
                                                <div className="text-[11px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                                                    {emp.rank && emp.rank !== "-" ? `${emp.rank} (${emp.classGrade})` : emp.classGrade || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    {emp.phone && emp.phone !== "-" ? (
                                                        <a
                                                            href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline"
                                                            title="Hubungi via WhatsApp"
                                                        >
                                                            <Phone className="h-3 w-3" />
                                                            {emp.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-secondary-400 text-xs">-</span>
                                                    )}
                                                    {emp.email && emp.email !== "-" && (
                                                        <span className="flex items-center gap-1.5 text-secondary-500 dark:text-secondary-400 text-[11px] truncate max-w-[180px]">
                                                            <Mail className="h-3 w-3" />
                                                            {emp.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <CanDo permission="employees.edit">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-secondary-800"
                                                            onClick={() => handleOpenEditModal(emp)}
                                                            title="Ubah Data Pegawai"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                    </CanDo>
                                                    <CanDo permission="employees.delete">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-secondary-800"
                                                            onClick={() => handleOpenDeleteModal(emp)}
                                                            title="Hapus Pegawai"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </CanDo>
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

            {/* MODAL FORM TAMBAH / UBAH PEGAWAI */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                title={editingEmployee ? "Ubah Data Pegawai" : "Tambah Pegawai Baru"}
                className="max-w-2xl"
            >
                <form onSubmit={handleSubmitForm} className="space-y-4 pt-1">
                    {formError && (
                        <div className="p-3 text-xs bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Nama Lengkap dengan Gelar <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Ir. WIJIONO, S.T., M.MKes."
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Nama Tanpa Gelar
                            </label>
                            <Input
                                value={formData.nameWithoutDegree}
                                onChange={(e) => setFormData({ ...formData, nameWithoutDegree: e.target.value })}
                                placeholder="Contoh: WIJIONO"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                NIP (Nomor Induk Pegawai)
                            </label>
                            <Input
                                value={formData.nip}
                                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                                placeholder="Contoh: 197308051997031007"
                                className="font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Bidang / Unit Kerja <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                                {DEPARTMENT_LIST.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Jabatan Dinas
                            </label>
                            <Input
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                placeholder="Contoh: Auditor Ahli Madya / Plt. Inspektur"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Pangkat ASN
                            </label>
                            <Input
                                value={formData.rank}
                                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                                placeholder="Contoh: PEMBINA TINGKAT I"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Golongan Ruang
                            </label>
                            <select
                                value={formData.classGrade}
                                onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                                {GOLONGAN_LIST.map((gol) => (
                                    <option key={gol} value={gol}>{gol}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Nomor HP / WhatsApp Aktif
                            </label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Contoh: 6281335xxxxxx"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Alamat Email Kedinasan
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="pegawai@inspektorat.trenggalekkab.go.id"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-secondary-200 dark:border-secondary-800">
                        <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingEmployee ? "Simpan Perubahan" : "Tambah Pegawai"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL KONFIRMASI HAPUS PEGAWAI */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Konfirmasi Hapus Data Pegawai"
                className="max-w-md"
            >
                <div className="space-y-4 pt-2">
                    {heldAssetsWarning.length > 0 ? (
                        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 space-y-2">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold text-xs">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>Peringatan: Pegawai Masih Memegang Aset!</span>
                            </div>
                            <p className="text-xs text-red-600 dark:text-red-300">
                                <strong>{employeeToDelete?.name}</strong> saat ini tercatat masih memegang{" "}
                                <strong>{heldAssetsWarning.length} aset inventaris aktif</strong>:
                            </p>
                            <ul className="text-xs text-red-600 dark:text-red-300 list-disc list-inside space-y-0.5">
                                {heldAssetsWarning.map(a => (
                                    <li key={a.id}>{a.name} (NUP: {a.nup})</li>
                                ))}
                            </ul>
                            <p className="text-[11px] text-red-500 pt-1">
                                Data pegawai tidak dapat dihapus sebelum aset dimutasi atau ditarik kembali ke gudang logistik.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-secondary-700 dark:text-secondary-300">
                                Apakah Anda yakin ingin menghapus data pegawai:
                            </p>
                            <p className="text-base font-bold text-secondary-900 dark:text-white mt-1">
                                {employeeToDelete?.name}
                            </p>
                            <p className="text-xs font-mono text-secondary-500 mt-0.5">
                                NIP: {employeeToDelete?.nip || "-"}
                            </p>
                            <p className="text-xs text-secondary-500 mt-3">
                                Data yang dihapus akan dinonaktifkan dari sistem penatausahaan aset.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-3 border-t border-secondary-200 dark:border-secondary-800">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            {heldAssetsWarning.length > 0 ? "Tutup" : "Batal"}
                        </Button>
                        {heldAssetsWarning.length === 0 && (
                            <Button variant="danger" onClick={handleConfirmDelete}>
                                Ya, Hapus Pegawai
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
