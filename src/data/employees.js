/**
 * Manajemen Master Data Pegawai Inspektorat Kabupaten Trenggalek.
 * Berbasis data resmi docs/data-pegawai.csv
 */
import initialEmployees from "./employees.json"

const STORAGE_KEY = "simtik_employees"

export const DEPARTMENT_LIST = [
    "SEKRETARIAT",
    "INSPEKTUR PEMBANTU I",
    "INSPEKTUR PEMBANTU II",
    "INSPEKTUR PEMBANTU III",
    "INSPEKTUR PEMBANTU IV",
    "plt IRBAN IV / INSPEKTUR PEMBANTU IV",
    "IRBAN II",
    "IRBAN III",
    "IRBAN KHUSUS / INVESTIGASI",
    "KEPALA SUB BAGIAN UMUM DAN KEPEGAWAIAN"
]

export const GOLONGAN_LIST = [
    "IV/c", "IV/b", "IV/a",
    "III/d", "III/c", "III/b", "III/a",
    "II/d", "II/c", "II/b", "II/a",
    "I"
]

/**
 * Mengambil seluruh data pegawai dari localStorage atau initial data
 */
export function getEmployees() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed
            }
        }
    } catch (e) {
        console.error("Gagal membaca pegawai dari storage:", e)
    }
    // Simpan data awal jika belum ada
    saveEmployees(initialEmployees)
    return initialEmployees
}

/**
 * Menyimpan data pegawai ke localStorage
 */
export function saveEmployees(employees) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
        // Dispatch storage event untuk sinkronisasi antar komponen
        window.dispatchEvent(new Event("storage"))
    } catch (e) {
        console.error("Gagal menyimpan pegawai ke storage:", e)
    }
}

/**
 * Mengambil data 1 pegawai berdasarkan ID
 */
export function getEmployeeById(id) {
    const list = getEmployees()
    return list.find(emp => String(emp.id) === String(id)) || null
}

/**
 * Mengambil data 1 pegawai berdasarkan NIP
 */
export function getEmployeeByNip(nip) {
    const list = getEmployees()
    return list.find(emp => String(emp.nip) === String(nip)) || null
}

/**
 * Menambah pegawai baru (Create)
 */
export async function addEmployee(employeeData) {
    const list = getEmployees()
    
    // Validasi NIP unik
    if (employeeData.nip && employeeData.nip !== "-") {
        const exists = list.some(emp => emp.nip === employeeData.nip)
        if (exists) {
            throw new Error(`Pegawai dengan NIP ${employeeData.nip} sudah terdaftar.`)
        }
    }

    const newId = Date.now()
    const newEmployee = {
        id: newId,
        no: list.length + 1,
        name: employeeData.name.trim(),
        nameWithoutDegree: employeeData.nameWithoutDegree ? employeeData.nameWithoutDegree.trim() : employeeData.name.trim(),
        nip: employeeData.nip ? employeeData.nip.trim() : "-",
        phone: employeeData.phone ? employeeData.phone.trim() : "-",
        birthPlace: employeeData.birthPlace ? employeeData.birthPlace.trim() : "-",
        birthDate: employeeData.birthDate ? employeeData.birthDate.trim() : "-",
        rank: employeeData.rank ? employeeData.rank.trim() : "-",
        department: employeeData.department ? employeeData.department.trim() : "SEKRETARIAT",
        classGrade: employeeData.classGrade ? employeeData.classGrade.trim() : "-",
        position: employeeData.position ? employeeData.position.trim() : "-",
        email: employeeData.email ? employeeData.email.trim() : "-"
    }

    const updatedList = [newEmployee, ...list]
    saveEmployees(updatedList)

    // Coba kirim ke Backend API jika aktif
    try {
        await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newEmployee)
        })
    } catch (err) {
        console.warn("Backend API tidak merespons, data tersimpan lokal:", err)
    }

    return newEmployee
}

/**
 * Memperbarui data pegawai (Update)
 */
export async function updateEmployee(id, updatedData) {
    const list = getEmployees()
    const index = list.findIndex(emp => String(emp.id) === String(id))
    
    if (index === -1) {
        throw new Error("Data pegawai tidak ditemukan.")
    }

    const updated = {
        ...list[index],
        ...updatedData,
        id: list[index].id,
        no: list[index].no
    }

    list[index] = updated
    saveEmployees(list)

    // Coba sinkronisasi ke Backend API jika aktif
    try {
        await fetch(`/api/employees/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        })
    } catch (err) {
        console.warn("Backend API tidak merespons, data diperbarui lokal:", err)
    }

    return updated
}

/**
 * Menghapus data pegawai (Delete)
 */
export async function deleteEmployee(id) {
    const list = getEmployees()
    const target = list.find(emp => String(emp.id) === String(id))
    
    if (!target) {
        throw new Error("Data pegawai tidak ditemukan.")
    }

    const filtered = list.filter(emp => String(emp.id) !== String(id))
    saveEmployees(filtered)

    // Coba hapus di Backend API jika aktif
    try {
        await fetch(`/api/employees/${id}`, {
            method: "DELETE"
        })
    } catch (err) {
        console.warn("Backend API tidak merespons, data dihapus lokal:", err)
    }

    return target
}

/**
 * Ekspor EMPLOYEE_LIST untuk backward compatibility
 */
export const EMPLOYEE_LIST = getEmployees()
