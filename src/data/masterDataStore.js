/**
 * src/data/masterDataStore.js
 * Manajemen Terpusat Data Master SIM-TIK Inspektorat Kabupaten Trenggalek:
 * 1. Unit Kerja / Bidang (Departments)
 * 2. Master Ruangan Dinas (KIR - Permendagri 47/2021)
 * 3. Kategori Aset TIK
 * 4. Pejabat Penandatangan Dokumen Resmi (BAST, KIR, Helpdesk)
 */

import { getEmployees } from "./employees"

// =========================================================================
// 1. UNIT KERJA / BIDANG (DEPARTMENTS)
// =========================================================================
const DEFAULT_DEPARTMENTS = [
    { id: "dept-1", code: "SEKR", name: "SEKRETARIAT", description: "Subbag Umum, Keuangan, Kepegawaian & Perencanaan" },
    { id: "dept-2", code: "IRBAN-1", name: "INSPEKTUR PEMBANTU I", description: "Pengawasan Wilayah I (Kecamatan & OPD Terkait)" },
    { id: "dept-3", code: "IRBAN-2", name: "INSPEKTUR PEMBANTU II", description: "Pengawasan Wilayah II" },
    { id: "dept-4", code: "IRBAN-3", name: "INSPEKTUR PEMBANTU III", description: "Pengawasan Wilayah III" },
    { id: "dept-5", code: "IRBAN-4", name: "INSPEKTUR PEMBANTU IV", description: "Pengawasan Wilayah IV" },
    { id: "dept-6", code: "IRBAN-KHUSUS", name: "IRBAN KHUSUS / INVESTIGASI", description: "Pemeriksaan Khusus, Investigasi Fraud & Dumas" },
    { id: "dept-7", code: "SUBBAG-UK", name: "KEPALA SUB BAGIAN UMUM DAN KEPEGAWAIAN", description: "Pengelolaan Aset & Tata Usaha Kepegawaian" },
]

export function getDepartments() {
    try {
        const stored = localStorage.getItem("simtik_master_departments")
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
                return enrichDepartmentsWithCount(parsed)
            }
        }
    } catch (e) {
        console.error("Gagal membaca master departments:", e)
    }
    saveDepartments(DEFAULT_DEPARTMENTS)
    return enrichDepartmentsWithCount(DEFAULT_DEPARTMENTS)
}

function enrichDepartmentsWithCount(depts) {
    const employees = getEmployees()
    return depts.map(d => {
        const count = employees.filter(e =>
            (e.department || "").toUpperCase().trim() === d.name.toUpperCase().trim()
        ).length
        return { ...d, employeeCount: count }
    })
}

export function saveDepartments(depts) {
    try {
        localStorage.setItem("simtik_master_departments", JSON.stringify(depts))
        window.dispatchEvent(new Event("storage"))
    } catch (e) {
        console.error("Gagal menyimpan master departments:", e)
    }
}

export async function addDepartment({ name, code, description }) {
    const list = getDepartments()
    const trimmed = name.trim()
    if (list.some(d => d.name.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error(`Unit kerja "${trimmed}" sudah terdaftar.`)
    }
    const newDept = {
        id: `dept-${Date.now()}`,
        code: code ? code.trim().toUpperCase() : `D-${Date.now().toString().slice(-3)}`,
        name: trimmed,
        description: description ? description.trim() : ""
    }
    const updated = [...list.map(({ employeeCount, ...rest }) => rest), newDept]
    saveDepartments(updated)

    // Sync to backend if available
    try {
        await fetch("/api/departments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDept)
        })
    } catch (err) {
        console.warn("Backend API departments offline:", err)
    }

    return newDept
}

export async function updateDepartment(id, { name, code, description }) {
    const list = getDepartments()
    const index = list.findIndex(d => d.id === id)
    if (index === -1) throw new Error("Unit kerja tidak ditemukan.")

    const oldName = list[index].name
    const newName = name.trim()

    list[index] = {
        ...list[index],
        code: code ? code.trim().toUpperCase() : list[index].code,
        name: newName,
        description: description ? description.trim() : list[index].description
    }

    const clean = list.map(({ employeeCount, ...rest }) => rest)
    saveDepartments(clean)

    // Jika nama berubah, perbarui juga data pegawai yang berada di unit kerja tersebut
    if (oldName !== newName) {
        try {
            const employees = getEmployees()
            const updatedEmployees = employees.map(emp => {
                if ((emp.department || "").toUpperCase().trim() === oldName.toUpperCase().trim()) {
                    return { ...emp, department: newName }
                }
                return emp
            })
            localStorage.setItem("simtik_employees", JSON.stringify(updatedEmployees))
            window.dispatchEvent(new Event("storage"))
        } catch (e) {
            console.error("Gagal sinkronisasi nama departemen ke pegawai:", e)
        }
    }

    try {
        await fetch(`/api/departments/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName, code, description, oldName })
        })
    } catch (err) {
        console.warn("Backend API departments offline:", err)
    }

    return list[index]
}

export async function deleteDepartment(id) {
    const list = getDepartments()
    const target = list.find(d => d.id === id)
    if (!target) throw new Error("Unit kerja tidak ditemukan.")

    if (target.employeeCount > 0) {
        throw new Error(`Tidak dapat menghapus "${target.name}". Masih ada ${target.employeeCount} pegawai di unit kerja ini. Mutasikan pegawai terlebih dahulu.`)
    }

    const filtered = list.filter(d => d.id !== id).map(({ employeeCount, ...rest }) => rest)
    saveDepartments(filtered)

    try {
        await fetch(`/api/departments/${id}`, { method: "DELETE" })
    } catch (err) {
        console.warn("Backend API departments offline:", err)
    }

    return target
}


// =========================================================================
// 2. MASTER RUANGAN DINAS (KIR - PERMENDAGRI 47/2021)
// =========================================================================
const DEFAULT_ROOMS = [
    { id: "R-01", name: "Ruang Server & Pengolahan Data Elektronik", pic_name: "NANDITO MONLIEV PASSA,S.Kom", pic_nip: "198506142009021004", floor: "Lantai 2" },
    { id: "R-02", name: "Ruang Sekretariat & Subbag Umum Keuangan", pic: "SIGIT PRASETYO,S.IP.MAP", pic_nip: "198207182008011009", floor: "Lantai 1" },
    { id: "R-03", name: "Ruang Inspektur Pembantu Wilayah I & II", pic: "Ir. WIJIONO, ST,M.Mkes", pic_nip: "197505122000031002", floor: "Lantai 2" },
    { id: "R-04", name: "Ruang Inspektur Pembantu Wilayah III & IV", pic: "SUYATNO,SH", pic_nip: "197808202005011003", floor: "Lantai 2" },
    { id: "R-05", name: "Ruang Inspektur Pembantu Investigasi", pic: "DIDIK AGIT W, SE.MAP", pic_nip: "198003152006041008", floor: "Lantai 2" },
    { id: "R-06", name: "Ruang Rapat Gelar Pengawasan / Ekspose", pic: "SIGIT PRASETYO,S.IP.MAP", pic_nip: "198207182008011009", floor: "Lantai 2" },
    { id: "R-07", name: "Gudang Logistik & Arsip Pengawasan", pic: "NANDITO MONLIEV PASSA,S.Kom", pic_nip: "198506142009021004", floor: "Lantai 1" }
]

export function getMasterRooms() {
    try {
        const stored = localStorage.getItem("simtik_master_rooms")
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch (e) {
        console.error("Gagal membaca master rooms:", e)
    }
    saveMasterRooms(DEFAULT_ROOMS)
    return DEFAULT_ROOMS
}

export function saveMasterRooms(rooms) {
    try {
        localStorage.setItem("simtik_master_rooms", JSON.stringify(rooms))
        window.dispatchEvent(new Event("storage"))
    } catch (e) {
        console.error("Gagal menyimpan master rooms:", e)
    }
}

export async function addMasterRoom(roomData) {
    const list = getMasterRooms()
    const newRoom = {
        id: roomData.id ? roomData.id.trim().toUpperCase() : `R-${(list.length + 1).toString().padStart(2, '0')}`,
        name: roomData.name.trim(),
        pic_name: roomData.pic_name.trim(),
        pic_nip: roomData.pic_nip ? roomData.pic_nip.trim() : "-",
        floor: roomData.floor ? roomData.floor.trim() : "Lantai 1"
    }

    if (list.some(r => r.id === newRoom.id || r.name.toLowerCase() === newRoom.name.toLowerCase())) {
        throw new Error(`Ruangan dengan kode "${newRoom.id}" atau nama "${newRoom.name}" sudah ada.`)
    }

    const updated = [...list, newRoom]
    saveMasterRooms(updated)

    try {
        await fetch("/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRoom)
        })
    } catch (err) {
        console.warn("Backend API rooms offline:", err)
    }

    return newRoom
}

export async function updateMasterRoom(id, roomData) {
    const list = getMasterRooms()
    const index = list.findIndex(r => r.id === id)
    if (index === -1) throw new Error("Ruangan tidak ditemukan.")

    const updated = {
        ...list[index],
        name: roomData.name ? roomData.name.trim() : list[index].name,
        pic_name: roomData.pic_name ? roomData.pic_name.trim() : list[index].pic_name,
        pic_nip: roomData.pic_nip ? roomData.pic_nip.trim() : list[index].pic_nip,
        floor: roomData.floor ? roomData.floor.trim() : list[index].floor
    }

    list[index] = updated
    saveMasterRooms(list)

    try {
        await fetch(`/api/rooms/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        })
    } catch (err) {
        console.warn("Backend API rooms offline:", err)
    }

    return updated
}

export async function deleteMasterRoom(id) {
    const list = getMasterRooms()
    const target = list.find(r => r.id === id)
    if (!target) throw new Error("Ruangan tidak ditemukan.")

    const filtered = list.filter(r => r.id !== id)
    saveMasterRooms(filtered)

    try {
        await fetch(`/api/rooms/${id}`, { method: "DELETE" })
    } catch (err) {
        console.warn("Backend API rooms offline:", err)
    }

    return target
}


// =========================================================================
// 3. KATEGORI ASET TIK
// =========================================================================
const DEFAULT_CATEGORIES = [
    { id: "cat-1", name: "Laptop", description: "Komputer jinjing operasional staf & auditor" },
    { id: "cat-2", name: "PC Desktop", description: "Personal computer workstation unit kerja" },
    { id: "cat-3", name: "Server", description: "Perangkat server database & pengolahan data" },
    { id: "cat-4", name: "Perangkat Jaringan", description: "Router, Switch, Access Point WiFi, Firewall" },
    { id: "cat-5", name: "Printer & Scanner", description: "Mesin pencetak dokumen dinas & scanner arsip" },
    { id: "cat-6", name: "Peralatan TIK Lainnya", description: "Proyektor, UPS, Harddisk Eksternal, Drone" },
]

export function getAssetCategories() {
    try {
        const stored = localStorage.getItem("simtik_master_categories")
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch (e) {
        console.error("Gagal membaca master categories:", e)
    }
    saveAssetCategories(DEFAULT_CATEGORIES)
    return DEFAULT_CATEGORIES
}

export function saveAssetCategories(cats) {
    try {
        localStorage.setItem("simtik_master_categories", JSON.stringify(cats))
        window.dispatchEvent(new Event("storage"))
    } catch (e) {
        console.error("Gagal menyimpan master categories:", e)
    }
}

export function addAssetCategory({ name, description }) {
    const list = getAssetCategories()
    const trimmed = name.trim()
    if (list.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error(`Kategori "${trimmed}" sudah terdaftar.`)
    }
    const newCat = {
        id: `cat-${Date.now()}`,
        name: trimmed,
        description: description ? description.trim() : ""
    }
    const updated = [...list, newCat]
    saveAssetCategories(updated)
    return newCat
}

export function updateAssetCategory(id, { name, description }) {
    const list = getAssetCategories()
    const index = list.findIndex(c => c.id === id)
    if (index === -1) throw new Error("Kategori tidak ditemukan.")

    list[index] = {
        ...list[index],
        name: name.trim(),
        description: description ? description.trim() : list[index].description
    }
    saveAssetCategories(list)
    return list[index]
}

export function deleteAssetCategory(id) {
    const list = getAssetCategories()
    const filtered = list.filter(c => c.id !== id)
    saveAssetCategories(filtered)
    return true
}


// =========================================================================
// 4. PEJABAT PENANDATANGAN DOKUMEN RESMI (KOP BAST & KIR)
// =========================================================================
const DEFAULT_SIGNERS = {
    // Kepala SKPD / Pengguna Barang (Mengetahui)
    kepalaSkpd: {
        name: "Ir. WIJIONO, S.T., M.MKes.",
        nip: "197308051997031007",
        position: "Plt. INSPEKTUR DAERAH",
        rank: "PEMBINA (IV/a)"
    },
    // Pengurus Barang Pengguna (Pihak Pertama BAST)
    pengurusBarang: {
        name: "SIGIT PRASETYO,S.IP.,MAP",
        nip: "197310211993101001",
        position: "PENGURUS BARANG PENGGUNA",
        rank: "PEMBINA TINGKAT I (IV/b)"
    },
    // Kasubbag Umum & Kepegawaian
    kasubbagUmum: {
        name: "NUGRAHENI RAHAYU S, SE,M.Si",
        nip: "197211141994022001",
        position: "KASUBBAG. UMUM DAN KEPEGAWAIAN",
        rank: "PEMBINA (IV/a)"
    },
    // Kop Surat Dinas
    instansi: {
        pemerintah: "PEMERINTAH KABUPATEN TRENGGALEK",
        skpd: "INSPEKTORAT",
        alamat: "Jl. KH. Wachid Hasyim No.5, Kode Pos 66311",
        telepon: "0355-791472",
        website: "https://inspektorat.trenggalekkab.go.id",
        email: "inspektorat@trenggalekkab.go.id"
    }
}

export function getSigners() {
    try {
        const stored = localStorage.getItem("simtik_official_signers")
        if (stored) {
            const parsed = JSON.parse(stored)
            return { ...DEFAULT_SIGNERS, ...parsed }
        }
    } catch (e) {
        console.error("Gagal membaca master signers:", e)
    }
    saveSigners(DEFAULT_SIGNERS)
    return DEFAULT_SIGNERS
}

export function saveSigners(signersData) {
    try {
        localStorage.setItem("simtik_official_signers", JSON.stringify(signersData))
        window.dispatchEvent(new Event("storage"))
    } catch (e) {
        console.error("Gagal menyimpan master signers:", e)
    }
}
