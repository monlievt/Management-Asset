import { useState, useEffect } from "react"
import {
    Building2, DoorOpen, Tag, FileSignature, Plus, Edit3,
    Trash2, Save, CheckCircle2, AlertTriangle, Users, Info
} from "lucide-react"
import {
    getDepartments, addDepartment, updateDepartment, deleteDepartment,
    getMasterRooms, addMasterRoom, updateMasterRoom, deleteMasterRoom,
    getAssetCategories, addAssetCategory, updateAssetCategory, deleteAssetCategory,
    getSigners, saveSigners
} from "../../data/masterDataStore"
import { getEmployees } from "../../data/employees"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { Badge } from "../ui/Badge"
import { Modal } from "../ui/Modal"

export function MasterDataSettings({ initialSubTab = "departments" }) {
    const [subTab, setSubTab] = useState(initialSubTab)

    // Data states
    const [departments, setDepartments] = useState([])
    const [rooms, setRooms] = useState([])
    const [categories, setCategories] = useState([])
    const [signers, setSigners] = useState(null)
    const [employees, setEmployees] = useState([])

    // Notification
    const [alertMessage, setAlertMessage] = useState({ type: "", text: "" })

    // Department Modal
    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
    const [editingDept, setEditingDept] = useState(null)
    const [deptForm, setDeptForm] = useState({ code: "", name: "", description: "" })

    // Room Modal
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState(null)
    const [roomForm, setRoomForm] = useState({ id: "", name: "", pic_name: "", pic_nip: "", floor: "Lantai 1" })

    // Category Modal
    const [isCatModalOpen, setIsCatModalOpen] = useState(false)
    const [editingCat, setEditingCat] = useState(null)
    const [catForm, setCatForm] = useState({ name: "", description: "" })

    const loadAllMasterData = () => {
        setDepartments(getDepartments())
        setRooms(getMasterRooms())
        setCategories(getAssetCategories())
        setSigners(getSigners())
        setEmployees(getEmployees())
    }

    useEffect(() => {
        loadAllMasterData()
        const handleStorage = () => loadAllMasterData()
        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [])

    useEffect(() => {
        if (initialSubTab) {
            setSubTab(initialSubTab)
        }
    }, [initialSubTab])

    const showNotif = (text, type = "success") => {
        setAlertMessage({ type, text })
        setTimeout(() => setAlertMessage({ type: "", text: "" }), 4000)
    }

    // ==========================================
    // 1. HANDLERS UNIT KERJA / DEPARTMENTS
    // ==========================================
    const handleOpenAddDept = () => {
        setEditingDept(null)
        setDeptForm({ code: "", name: "", description: "" })
        setIsDeptModalOpen(true)
    }

    const handleOpenEditDept = (dept) => {
        setEditingDept(dept)
        setDeptForm({ code: dept.code || "", name: dept.name, description: dept.description || "" })
        setIsDeptModalOpen(true)
    }

    const handleSaveDept = async (e) => {
        e.preventDefault()
        try {
            if (editingDept) {
                await updateDepartment(editingDept.id, deptForm)
                showNotif(`Unit kerja "${deptForm.name}" berhasil diperbarui.`)
            } else {
                await addDepartment(deptForm)
                showNotif(`Unit kerja "${deptForm.name}" berhasil ditambahkan.`)
            }
            setIsDeptModalOpen(false)
            loadAllMasterData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteDept = async (dept) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus unit kerja "${dept.name}"?`)) return
        try {
            await deleteDepartment(dept.id)
            showNotif(`Unit kerja "${dept.name}" berhasil dihapus.`)
            loadAllMasterData()
        } catch (err) {
            alert(err.message)
        }
    }

    // ==========================================
    // 2. HANDLERS MASTER RUANGAN (KIR)
    // ==========================================
    const handleOpenAddRoom = () => {
        setEditingRoom(null)
        setRoomForm({ id: "", name: "", pic_name: "", pic_nip: "", floor: "Lantai 1" })
        setIsRoomModalOpen(true)
    }

    const handleOpenEditRoom = (room) => {
        setEditingRoom(room)
        setRoomForm({
            id: room.id,
            name: room.name,
            pic_name: room.pic_name || room.pic || "",
            pic_nip: room.pic_nip || room.nip || "",
            floor: room.floor || "Lantai 1"
        })
        setIsRoomModalOpen(true)
    }

    const handleSelectPicEmployee = (empName) => {
        const emp = employees.find(e => e.name === empName)
        setRoomForm(prev => ({
            ...prev,
            pic_name: empName,
            pic_nip: emp ? emp.nip : "-"
        }))
    }

    const handleSaveRoom = async (e) => {
        e.preventDefault()
        try {
            if (editingRoom) {
                await updateMasterRoom(editingRoom.id, roomForm)
                showNotif(`Master ruangan "${roomForm.name}" berhasil diperbarui.`)
            } else {
                await addMasterRoom(roomForm)
                showNotif(`Master ruangan "${roomForm.name}" berhasil ditambahkan.`)
            }
            setIsRoomModalOpen(false)
            loadAllMasterData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteRoom = async (room) => {
        if (!confirm(`Hapus master ruangan "${room.name}"?`)) return
        try {
            await deleteMasterRoom(room.id)
            showNotif(`Ruangan "${room.name}" berhasil dihapus.`)
            loadAllMasterData()
        } catch (err) {
            alert(err.message)
        }
    }

    // ==========================================
    // 3. HANDLERS KATEGORI ASET TIK
    // ==========================================
    const handleOpenAddCat = () => {
        setEditingCat(null)
        setCatForm({ name: "", description: "" })
        setIsCatModalOpen(true)
    }

    const handleOpenEditCat = (cat) => {
        setEditingCat(cat)
        setCatForm({ name: cat.name, description: cat.description || "" })
        setIsCatModalOpen(true)
    }

    const handleSaveCat = (e) => {
        e.preventDefault()
        try {
            if (editingCat) {
                updateAssetCategory(editingCat.id, catForm)
                showNotif(`Kategori "${catForm.name}" berhasil diperbarui.`)
            } else {
                addAssetCategory(catForm)
                showNotif(`Kategori "${catForm.name}" berhasil ditambahkan.`)
            }
            setIsCatModalOpen(false)
            loadAllMasterData()
        } catch (err) {
            alert(err.message)
        }
    }

    const handleDeleteCat = (cat) => {
        if (!confirm(`Hapus kategori "${cat.name}"?`)) return
        try {
            deleteAssetCategory(cat.id)
            showNotif(`Kategori "${cat.name}" berhasil dihapus.`)
            loadAllMasterData()
        } catch (err) {
            alert(err.message)
        }
    }

    // ==========================================
    // 4. HANDLERS PEJABAT PENANDATANGAN DOKUMEN
    // ==========================================
    const handleSaveSignersForm = (e) => {
        e.preventDefault()
        saveSigners(signers)
        showNotif("Identitas pejabat penandatangan dokumen berhasil disimpan. Seluruh cetakan BAST dan KIR otomatis terupdate.")
    }

    const subTabsList = [
        { id: "departments", label: "Unit Kerja / Bidang", icon: Building2, count: departments.length },
        { id: "rooms", label: "Master Ruangan (KIR)", icon: DoorOpen, count: rooms.length },
        { id: "categories", label: "Kategori Aset TIK", icon: Tag, count: categories.length },
        { id: "signers", label: "Pejabat Penandatangan", icon: FileSignature },
    ]

    return (
        <div className="space-y-6">
            {/* Navigasi Sub-Tab Master Data */}
            <div className="flex flex-wrap gap-2 pb-2 border-b border-secondary-200 dark:border-secondary-800">
                {subTabsList.map(t => {
                    const isActive = subTab === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => setSubTab(t.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                isActive
                                    ? "bg-primary-600 text-white shadow-sm"
                                    : "bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                            }`}
                        >
                            <t.icon className="h-4 w-4" />
                            <span>{t.label}</span>
                            {t.count !== undefined && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                                    isActive ? "bg-white/20 text-white" : "bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400"
                                }`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Alert Notification */}
            {alertMessage.text && (
                <div className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
                    alertMessage.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
                }`}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{alertMessage.text}</span>
                </div>
            )}

            {/* ==================================================== */}
            {/* 1. PANEL UNIT KERJA / BIDANG */}
            {/* ==================================================== */}
            {subTab === "departments" && (
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary-600" />
                                Master Unit Kerja & Bidang Organisasi
                            </CardTitle>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Mengatur struktur bagian, seksi, dan Inspektur Pembantu pada Inspektorat Kabupaten Trenggalek.
                            </p>
                        </div>
                        <Button onClick={handleOpenAddDept} size="sm" className="flex items-center gap-1.5">
                            <Plus className="h-4 w-4" />
                            Tambah Unit Kerja
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Kode</TableHead>
                                    <TableHead>Nama Unit Kerja / Bidang</TableHead>
                                    <TableHead>Deskripsi Fungsi</TableHead>
                                    <TableHead className="text-center">Jumlah Pegawai</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.map((dept) => (
                                    <TableRow key={dept.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40">
                                        <TableCell className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                                            {dept.code || "-"}
                                        </TableCell>
                                        <TableCell className="font-semibold text-secondary-900 dark:text-white">
                                            {dept.name}
                                        </TableCell>
                                        <TableCell className="text-xs text-secondary-500 dark:text-secondary-400">
                                            {dept.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-xs font-medium">
                                                {dept.employeeCount} Pegawai
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-secondary-800"
                                                    onClick={() => handleOpenEditDept(dept)}
                                                    title="Ubah Unit Kerja"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-secondary-800"
                                                    onClick={() => handleDeleteDept(dept)}
                                                    title="Hapus Unit Kerja"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* ==================================================== */}
            {/* 2. PANEL MASTER RUANGAN (KIR) */}
            {/* ==================================================== */}
            {subTab === "rooms" && (
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <DoorOpen className="h-5 w-5 text-primary-600" />
                                Master Ruangan Dinas (KIR - Permendagri 47/2021)
                            </CardTitle>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Menentukan lokasi ruangan dan Pejabat Penanggung Jawab Ruangan (PIC & NIP) untuk dokumen cetak KIR.
                            </p>
                        </div>
                        <Button onClick={handleOpenAddRoom} size="sm" className="flex items-center gap-1.5">
                            <Plus className="h-4 w-4" />
                            Tambah Ruangan Baru
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Kode</TableHead>
                                    <TableHead>Nama Ruangan Dinas</TableHead>
                                    <TableHead>Lantai</TableHead>
                                    <TableHead>Penanggung Jawab Ruangan (PIC & NIP)</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map((room) => (
                                    <TableRow key={room.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40">
                                        <TableCell className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400">
                                            {room.id}
                                        </TableCell>
                                        <TableCell className="font-semibold text-secondary-900 dark:text-white">
                                            {room.name}
                                        </TableCell>
                                        <TableCell className="text-xs text-secondary-600 dark:text-secondary-400">
                                            {room.floor || "Lantai 1"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-xs text-secondary-900 dark:text-white">
                                                {room.pic_name || room.pic || "PENANGGUNG JAWAB"}
                                            </div>
                                            <div className="text-[11px] font-mono text-secondary-500 dark:text-secondary-400">
                                                NIP. {room.pic_nip || room.nip || "-"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-secondary-800"
                                                    onClick={() => handleOpenEditRoom(room)}
                                                    title="Ubah Ruangan"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-secondary-800"
                                                    onClick={() => handleDeleteRoom(room)}
                                                    title="Hapus Ruangan"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* ==================================================== */}
            {/* 3. PANEL KATEGORI ASET TIK */}
            {/* ==================================================== */}
            {subTab === "categories" && (
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary-600" />
                                Master Kategori Aset TIK (KIB B)
                            </CardTitle>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Penggolongan kelompok jenis aset untuk formulir pendaftaran dan penyusutan akuntansi.
                            </p>
                        </div>
                        <Button onClick={handleOpenAddCat} size="sm" className="flex items-center gap-1.5">
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">No</TableHead>
                                    <TableHead>Nama Kategori Aset</TableHead>
                                    <TableHead>Deskripsi & Contoh Perangkat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat, index) => (
                                    <TableRow key={cat.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40">
                                        <TableCell className="font-mono text-xs text-secondary-500">{index + 1}</TableCell>
                                        <TableCell className="font-semibold text-secondary-900 dark:text-white">
                                            {cat.name}
                                        </TableCell>
                                        <TableCell className="text-xs text-secondary-500 dark:text-secondary-400">
                                            {cat.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-secondary-800"
                                                    onClick={() => handleOpenEditCat(cat)}
                                                    title="Ubah Kategori"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-secondary-800"
                                                    onClick={() => handleDeleteCat(cat)}
                                                    title="Hapus Kategori"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* ==================================================== */}
            {/* 4. PANEL PEJABAT PENANDATANGAN DOKUMEN RESMI */}
            {/* ==================================================== */}
            {subTab === "signers" && signers && (
                <form onSubmit={handleSaveSignersForm} className="space-y-6">
                    {/* A. Pejabat Pengesahan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kepala SKPD */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <FileSignature className="h-4 w-4 text-primary-600" />
                                    Kepala SKPD / Inspektur Daerah (Mengetahui)
                                </CardTitle>
                                <p className="text-xs text-secondary-500">Pejabat tertinggi yang menandatangani KIR, BAST, dan Laporan Tahunan.</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Nama Lengkap & Gelar</label>
                                    <Input
                                        value={signers.kepalaSkpd?.name || ""}
                                        onChange={(e) => setSigners({ ...signers, kepalaSkpd: { ...signers.kepalaSkpd, name: e.target.value } })}
                                        placeholder="Contoh: Ir. WIJIONO, S.T., M.MKes."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">NIP Pejabat</label>
                                    <Input
                                        value={signers.kepalaSkpd?.nip || ""}
                                        onChange={(e) => setSigners({ ...signers, kepalaSkpd: { ...signers.kepalaSkpd, nip: e.target.value } })}
                                        placeholder="Contoh: 197308051997031007"
                                        className="font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Jabatan Resmi</label>
                                        <Input
                                            value={signers.kepalaSkpd?.position || ""}
                                            onChange={(e) => setSigners({ ...signers, kepalaSkpd: { ...signers.kepalaSkpd, position: e.target.value } })}
                                            placeholder="Plt. INSPEKTUR DAERAH"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Pangkat & Golongan</label>
                                        <Input
                                            value={signers.kepalaSkpd?.rank || ""}
                                            onChange={(e) => setSigners({ ...signers, kepalaSkpd: { ...signers.kepalaSkpd, rank: e.target.value } })}
                                            placeholder="PEMBINA (IV/a)"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pengurus Barang Pengguna */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <FileSignature className="h-4 w-4 text-emerald-600" />
                                    Pengurus Barang Pengguna (Pihak I BAST)
                                </CardTitle>
                                <p className="text-xs text-secondary-500">Pejabat pengelola penatausahaan aset yang menyerahkan barang dinas.</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Nama Lengkap & Gelar</label>
                                    <Input
                                        value={signers.pengurusBarang?.name || ""}
                                        onChange={(e) => setSigners({ ...signers, pengurusBarang: { ...signers.pengurusBarang, name: e.target.value } })}
                                        placeholder="Contoh: SIGIT PRASETYO,S.IP.,MAP"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">NIP Pejabat</label>
                                    <Input
                                        value={signers.pengurusBarang?.nip || ""}
                                        onChange={(e) => setSigners({ ...signers, pengurusBarang: { ...signers.pengurusBarang, nip: e.target.value } })}
                                        placeholder="Contoh: 197310211993101001"
                                        className="font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Jabatan Resmi</label>
                                        <Input
                                            value={signers.pengurusBarang?.position || ""}
                                            onChange={(e) => setSigners({ ...signers, pengurusBarang: { ...signers.pengurusBarang, position: e.target.value } })}
                                            placeholder="PENGURUS BARANG PENGGUNA"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Pangkat & Golongan</label>
                                        <Input
                                            value={signers.pengurusBarang?.rank || ""}
                                            onChange={(e) => setSigners({ ...signers, pengurusBarang: { ...signers.pengurusBarang, rank: e.target.value } })}
                                            placeholder="PEMBINA TINGKAT I (IV/b)"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* B. Identitas Kop Surat Kedinasan */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-600" />
                                Identitas Instansi & Header Kop Dokumen Resmi
                            </CardTitle>
                            <p className="text-xs text-secondary-500">Header yang otomatis tertera pada cetak dokumen BAST, KIR, dan Helpdesk.</p>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Pemerintah Daerah</label>
                                <Input
                                    value={signers.instansi?.pemerintah || ""}
                                    onChange={(e) => setSigners({ ...signers, instansi: { ...signers.instansi, pemerintah: e.target.value } })}
                                    placeholder="PEMERINTAH KABUPATEN TRENGGALEK"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Nama SKPD / Lembaga</label>
                                <Input
                                    value={signers.instansi?.skpd || ""}
                                    onChange={(e) => setSigners({ ...signers, instansi: { ...signers.instansi, skpd: e.target.value } })}
                                    placeholder="INSPEKTORAT"
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Alamat Kantor Resmi</label>
                                <Input
                                    value={signers.instansi?.alamat || ""}
                                    onChange={(e) => setSigners({ ...signers, instansi: { ...signers.instansi, alamat: e.target.value } })}
                                    placeholder="Jl. KH. Wachid Hasyim No.5, Kode Pos 66311"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Nomor Telepon / Kontak</label>
                                <Input
                                    value={signers.instansi?.telepon || ""}
                                    onChange={(e) => setSigners({ ...signers, instansi: { ...signers.instansi, telepon: e.target.value } })}
                                    placeholder="0355-791472"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">Alamat Website Kedinasan</label>
                                <Input
                                    value={signers.instansi?.website || ""}
                                    onChange={(e) => setSigners({ ...signers, instansi: { ...signers.instansi, website: e.target.value } })}
                                    placeholder="https://inspektorat.trenggalekkab.go.id"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Simpan Seluruh Pengaturan Pejabat & Kop
                        </Button>
                    </div>
                </form>
            )}

            {/* ==================================================== */}
            {/* MODAL FORM UNIT KERJA */}
            {/* ==================================================== */}
            <Modal
                isOpen={isDeptModalOpen}
                onClose={() => setIsDeptModalOpen(false)}
                title={editingDept ? "Ubah Unit Kerja / Bidang" : "Tambah Unit Kerja Baru"}
                className="max-w-md"
            >
                <form onSubmit={handleSaveDept} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Nama Unit Kerja / Bidang <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={deptForm.name}
                            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                            placeholder="Contoh: SUBBAG PERENCANAAN & EVALUASI"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Kode Singkatan Unit Kerja
                        </label>
                        <Input
                            value={deptForm.code}
                            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                            placeholder="Contoh: SUBBAG-REN"
                            className="font-mono uppercase"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Deskripsi / Tanggung Jawab Kerja
                        </label>
                        <Input
                            value={deptForm.description}
                            onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                            placeholder="Uraian ringkas tugas..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-secondary-200 dark:border-secondary-800">
                        <Button type="button" variant="outline" onClick={() => setIsDeptModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingDept ? "Simpan Perubahan" : "Tambah Unit Kerja"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ==================================================== */}
            {/* MODAL FORM MASTER RUANGAN */}
            {/* ==================================================== */}
            <Modal
                isOpen={isRoomModalOpen}
                onClose={() => setIsRoomModalOpen(false)}
                title={editingRoom ? "Ubah Master Ruangan Dinas" : "Tambah Master Ruangan Baru"}
                className="max-w-lg"
            >
                <form onSubmit={handleSaveRoom} className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Kode Ruangan <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={roomForm.id}
                                onChange={(e) => setRoomForm({ ...roomForm, id: e.target.value })}
                                placeholder="Contoh: R-08"
                                className="font-mono uppercase"
                                required
                                disabled={!!editingRoom}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Lokasi Lantai
                            </label>
                            <select
                                value={roomForm.floor}
                                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            >
                                <option value="Lantai 1">Lantai 1</option>
                                <option value="Lantai 2">Lantai 2</option>
                                <option value="Lantai 3">Lantai 3</option>
                                <option value="Lantai Dasar / Basement">Lantai Dasar / Basement</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Nama Ruangan Dinas <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={roomForm.name}
                            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                            placeholder="Contoh: Ruang Konsultasi & Pengawasan APIP"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Pilih Penanggung Jawab Ruangan (PIC Pegawai)
                        </label>
                        <select
                            value={roomForm.pic_name}
                            onChange={(e) => handleSelectPicEmployee(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            <option value="">-- Pilih dari Master Pegawai --</option>
                            {employees.map(emp => (
                                <option key={emp.nip} value={emp.name}>
                                    {emp.name} ({emp.department})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                Nama PIC Terpilih
                            </label>
                            <Input
                                value={roomForm.pic_name}
                                onChange={(e) => setRoomForm({ ...roomForm, pic_name: e.target.value })}
                                placeholder="Nama Lengkap & Gelar"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                NIP PIC Terpilih
                            </label>
                            <Input
                                value={roomForm.pic_nip}
                                onChange={(e) => setRoomForm({ ...roomForm, pic_nip: e.target.value })}
                                placeholder="NIP Pegawai"
                                className="font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-secondary-200 dark:border-secondary-800">
                        <Button type="button" variant="outline" onClick={() => setIsRoomModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingRoom ? "Simpan Perubahan" : "Tambah Ruangan"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ==================================================== */}
            {/* MODAL FORM KATEGORI ASET */}
            {/* ==================================================== */}
            <Modal
                isOpen={isCatModalOpen}
                onClose={() => setIsCatModalOpen(false)}
                title={editingCat ? "Ubah Kategori Aset TIK" : "Tambah Kategori Aset Baru"}
                className="max-w-md"
            >
                <form onSubmit={handleSaveCat} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Nama Kategori Aset <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={catForm.name}
                            onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                            placeholder="Contoh: Drone Pengawasan & Kamera"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                            Deskripsi & Contoh Barang
                        </label>
                        <Input
                            value={catForm.description}
                            onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                            placeholder="Contoh: Perangkat pemantauan visual udara..."
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t border-secondary-200 dark:border-secondary-800">
                        <Button type="button" variant="outline" onClick={() => setIsCatModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingCat ? "Simpan Perubahan" : "Tambah Kategori"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
