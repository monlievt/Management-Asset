// src/data/assetsStore.js
// Centralized data store and helper services for Assets & Devices

export const ASSET_STATUSES = [
    { value: "Available", label: "Tersedia di Gudang", badge: "success" },
    { value: "In Use", label: "Sedang Digunakan", badge: "default" },
    { value: "Maintenance", label: "Dalam Perbaikan", badge: "warning" },
    { value: "Damaged", label: "Rusak / Afkir", badge: "destructive" },
    { value: "Disposed", label: "Dihibahkan / Dihapus", badge: "secondary" },
]

export const PHOTO_ANGLES = [
    { key: "front", label: "Tampak Depan", description: "Tampilan fisik bagian depan / layar utama" },
    { key: "back", label: "Tampak Belakang", description: "Tampilan belakang / panel penutup" },
    { key: "right", label: "Sisi Kanan", description: "Tampilan port I/O dan sudut kanan" },
    { key: "left", label: "Sisi Kiri", description: "Tampilan port I/O dan sudut kiri" },
    { key: "top_bottom", label: "Atas / Bawah", description: "Tampilan keyboard / ventilasi bawah" },
    { key: "serial_plate", label: "Plat Nomor Seri", description: "Stiker SN pabrik / barcode manufaktur" },
]

export const MASTER_ROOMS = [
    { id: "R-01", name: "Ruang Server & Data Center Lt. 2", pic: "RUDI HARTONO, S.Kom", nip: "198803152010011005" },
    { id: "R-02", name: "Ruang Bidang Aplikasi Informatika", pic: "Ir. WIJIONO, ST,M.Mkes", nip: "197505122000031002" },
    { id: "R-03", name: "Ruang Media Center & Humas", pic: "SIGIT PRASETYO,S.IP.MAP", nip: "198207182008011009" },
    { id: "R-04", name: "Gudang Logistik TIK Lt. 1", pic: "PENGELOLA ASET TIK", nip: "198506142009021004" },
    { id: "R-05", name: "Ruang Kepala Dinas", pic: "KEPALA DINAS KOMINFO", nip: "197001011995031001" },
    { id: "R-06", name: "Ruang Pelayanan Terpadu Satu Pintu (PTSP)", pic: "KOORDINATOR PELAYANAN", nip: "198402122009012003" }
]

export const initialAssetsData = [
    {
        id: 1,
        name: "Dell Latitude 5420 Core i7",
        kodeBarang: "1.3.2.06.01.02",
        nup: "0001",
        category: "Laptop",
        jenisBarang: "Laptop Operasional",
        merk: "Dell",
        type: "Latitude 5420",
        ukuran: "14 Inci",
        bahan: "Magnesium Alloy / Polikarbonat",
        tahunBeli: 2021,
        purchaseDate: "2021-04-12",
        noPabrik: "DL5420-SN-887192",
        noRangka: "-",
        noMesin: "-",
        noPolisi: "-",
        noBpkb: "-",
        asalUsul: "Pengadaan APBD 2021",
        harga: "18.500.000",
        usefulLifeYears: 4, // 4 tahun masa manfaat standar TIK
        salvageValue: "1.000.000",
        kondisi: "Baik",
        status: "In Use",
        lokasi: "Ruang Bidang Aplikasi Informatika",
        assignee: "Ir. WIJIONO, ST,M.Mkes",
        assigneeNip: "197505122000031002",
        assigneeDept: "Bidang Informatika",
        photos: {
            front: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
            back: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
            right: "",
            left: "",
            top_bottom: "",
            serial_plate: ""
        },
        // Riwayat Pemegang Inventaris (Custody / Assignment Log)
        custodyHistory: [
            {
                id: "CUST-001",
                employeeName: "RUDI HARTONO, S.Kom",
                nip: "198803152010011005",
                department: "Seksi Infrastruktur Jaringan",
                assignedDate: "2021-04-15",
                returnedDate: "2022-08-30",
                conditionOnAssign: "Baik (Baru)",
                conditionOnReturn: "Baik (Lecet Halus Pemakaian)",
                notes: "Diserahkan untuk kebutuhan remote server & konfigurasi router",
                bastNumber: "BAST/TIK/2021/04/019"
            },
            {
                id: "CUST-002",
                employeeName: "Ir. WIJIONO, ST,M.Mkes",
                nip: "197505122000031002",
                department: "Bidang Informatika",
                assignedDate: "2022-09-01",
                returnedDate: null, // Masih dipegang sekarang
                conditionOnAssign: "Baik",
                conditionOnReturn: null,
                notes: "Mutasi pemegang inventaris untuk operasional Kepala Bidang",
                bastNumber: "BAST/TIK/2022/09/088"
            }
        ],
        // Riwayat Perbaikan & Pemeliharaan (Maintenance Log)
        maintenanceHistory: [
            {
                id: "MNT-001",
                date: "2023-03-10",
                issue: "Upgrade RAM 8GB ke 16GB dan penggantian pasta thermal pendingin",
                action: "Pemasangan SODIMM DDR4 8GB Kingston Original + Cleaning fan",
                vendor: "CV. Putra Mandiri IT Solution",
                cost: "850.000",
                isCapitalized: true, // Menambah nilai aset
                technician: "Bambang Sugito",
                status: "Selesai"
            },
            {
                id: "MNT-002",
                date: "2024-02-18",
                issue: "Baterai drop tidak tahan lebih dari 30 menit",
                action: "Penggantian modul baterai original Dell 4-cell 63Wh",
                vendor: "Dell Official Service Center",
                cost: "1.250.000",
                isCapitalized: false,
                technician: "Rian (Dell SC)",
                status: "Selesai"
            }
        ]
    },
    {
        id: 2,
        name: "HP LaserJet Pro MFP M428fdw",
        kodeBarang: "1.3.2.06.01.05",
        nup: "0001",
        category: "Printer",
        jenisBarang: "Printer Laser Monokrom Multifungsi",
        merk: "HP",
        type: "LaserJet Pro M428fdw",
        ukuran: "A4 / F4 Heavy Duty",
        bahan: "Moulded Plastic & Logam",
        tahunBeli: 2022,
        purchaseDate: "2022-06-20",
        noPabrik: "HP-M428-998877",
        noRangka: "-",
        noMesin: "-",
        noPolisi: "-",
        noBpkb: "-",
        asalUsul: "Pengadaan Reguler Dinas",
        harga: "8.750.000",
        usefulLifeYears: 5,
        salvageValue: "500.000",
        kondisi: "Baik",
        status: "Available",
        lokasi: "Gudang Logistik TIK Lt. 1",
        assignee: "-",
        assigneeNip: "-",
        assigneeDept: "-",
        photos: {
            front: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80",
            back: "",
            right: "",
            left: "",
            top_bottom: "",
            serial_plate: ""
        },
        custodyHistory: [
            {
                id: "CUST-003",
                employeeName: "Unit Pelayanan Terpadu Satu Pintu",
                nip: "-",
                department: "Pelayanan Publik",
                assignedDate: "2022-07-01",
                returnedDate: "2024-05-10",
                conditionOnAssign: "Baik (Baru)",
                conditionOnReturn: "Baik (Roller sedikit aus)",
                notes: "Ditarik kembali ke gudang TIK setelah peremajaan printer dinas",
                bastNumber: "BAST/TIK/2022/07/003"
            }
        ],
        maintenanceHistory: [
            {
                id: "MNT-003",
                date: "2023-11-05",
                issue: "Paper jam berulang pada feeder scanner atas",
                action: "Pembersihan pickup roller ADF dan pelumasan gear mekanik",
                vendor: "Mitra Toner & Print Service",
                cost: "350.000",
                isCapitalized: false,
                technician: "Supriadi",
                status: "Selesai"
            }
        ]
    },
    {
        id: 3,
        name: "Apple MacBook Air M2 13-inch",
        kodeBarang: "1.3.2.06.01.02",
        nup: "0002",
        category: "Laptop",
        jenisBarang: "Laptop Desain Grafis & Multimedia",
        merk: "Apple",
        type: "MacBook Air M2 256GB Midnight",
        ukuran: "13.6 Inci Liquid Retina",
        bahan: "100% Recycled Aluminum",
        tahunBeli: 2023,
        purchaseDate: "2023-08-15",
        noPabrik: "C02G9988MD6M",
        noRangka: "-",
        noMesin: "-",
        noPolisi: "-",
        noBpkb: "-",
        asalUsul: "Pengadaan Sub Bagian Humas & Dokumentasi",
        harga: "17.999.000",
        usefulLifeYears: 4,
        salvageValue: "2.500.000",
        kondisi: "Baik",
        status: "In Use",
        lokasi: "Ruang Media Center & Humas",
        assignee: "SIGIT PRASETYO,S.IP.MAP",
        assigneeNip: "198207182008011009",
        assigneeDept: "Humas & Dokumentasi Pimpinan",
        photos: {
            front: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            back: "",
            right: "",
            left: "",
            top_bottom: "",
            serial_plate: ""
        },
        custodyHistory: [
            {
                id: "CUST-004",
                employeeName: "SIGIT PRASETYO,S.IP.MAP",
                nip: "198207182008011009",
                department: "Humas & Dokumentasi Pimpinan",
                assignedDate: "2023-08-20",
                returnedDate: null,
                conditionOnAssign: "Baik (Segel Baru)",
                conditionOnReturn: null,
                notes: "Digunakan untuk rendering video liputan kegiatan dinas",
                bastNumber: "BAST/TIK/2023/08/045"
            }
        ],
        maintenanceHistory: []
    }
]

const STORAGE_KEY = "simtik_master_assets"

/** Ambil seluruh aset dari localStorage dengan fallback */
export function getAssets() {
    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (data) {
            const parsed = JSON.parse(data)
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
    } catch (e) {
        console.error("Gagal membaca aset dari penyimpanan lokal:", e)
    }
    // Simpan data awal jika belum ada
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAssetsData))
    return initialAssetsData
}

/** Ambil satu aset berdasarkan ID */
export function getAssetById(id) {
    const assets = getAssets()
    return assets.find(a => String(a.id) === String(id)) || null
}

/** Simpan atau perbarui aset */
export function saveAsset(assetData) {
    const assets = getAssets()
    let updatedAssets = []

    if (assetData.id) {
        // Edit
        updatedAssets = assets.map(a => {
            if (String(a.id) === String(assetData.id)) {
                return {
                    ...a,
                    ...assetData,
                    custodyHistory: assetData.custodyHistory || a.custodyHistory || [],
                    maintenanceHistory: assetData.maintenanceHistory || a.maintenanceHistory || [],
                    photos: assetData.photos || a.photos || {}
                }
            }
            return a
        })
    } else {
        // Tambah baru
        const newAsset = {
            ...assetData,
            id: Date.now(),
            custodyHistory: assetData.custodyHistory || [],
            maintenanceHistory: assetData.maintenanceHistory || [],
            photos: assetData.photos || {}
        }
        updatedAssets = [newAsset, ...assets]
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAssets))
    // Sinkronkan juga ke simtik_assets untuk kompatibilitas kode lama jika ada
    localStorage.setItem("simtik_assets", JSON.stringify(updatedAssets))
    return updatedAssets
}

/** Hapus aset berdasarkan ID */
export function deleteAsset(id) {
    const assets = getAssets()
    const filtered = assets.filter(a => String(a.id) !== String(id))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    localStorage.setItem("simtik_assets", JSON.stringify(filtered))
    return filtered
}

/** Tambah catatan mutasi / serah terima pemegang baru */
export function assignAssetToEmployee(assetId, custodyPayload) {
    const assets = getAssets()
    const updated = assets.map(asset => {
        if (String(asset.id) === String(assetId)) {
            const currentHistory = asset.custodyHistory || []
            // Tutup tanggal pemegang sebelumnya jika ada yang aktif
            const updatedHistory = currentHistory.map(item => {
                if (!item.returnedDate) {
                    return {
                        ...item,
                        returnedDate: custodyPayload.assignedDate || new Date().toISOString().split("T")[0],
                        conditionOnReturn: custodyPayload.previousReturnCondition || "Baik"
                    }
                }
                return item
            })

            const newCustodyEntry = {
                id: `CUST-${Date.now().toString().slice(-4)}`,
                employeeName: custodyPayload.employeeName,
                nip: custodyPayload.nip || "-",
                department: custodyPayload.department || "-",
                assignedDate: custodyPayload.assignedDate || new Date().toISOString().split("T")[0],
                returnedDate: null,
                conditionOnAssign: custodyPayload.conditionOnAssign || "Baik",
                conditionOnReturn: null,
                notes: custodyPayload.notes || "",
                bastNumber: custodyPayload.bastNumber || `BAST/TIK/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`
            }

            return {
                ...asset,
                status: "In Use",
                assignee: custodyPayload.employeeName,
                assigneeNip: custodyPayload.nip || "-",
                assigneeDept: custodyPayload.department || "-",
                custodyHistory: [...updatedHistory, newCustodyEntry]
            }
        }
        return asset
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem("simtik_assets", JSON.stringify(updated))
    return updated
}

/** Kembalikan aset ke gudang (Check-in) */
export function returnAssetToWarehouse(assetId, returnPayload) {
    const assets = getAssets()
    const updated = assets.map(asset => {
        if (String(asset.id) === String(assetId)) {
            const currentHistory = asset.custodyHistory || []
            const updatedHistory = currentHistory.map(item => {
                if (!item.returnedDate) {
                    return {
                        ...item,
                        returnedDate: returnPayload.returnDate || new Date().toISOString().split("T")[0],
                        conditionOnReturn: returnPayload.conditionOnReturn || "Baik",
                        notes: item.notes ? `${item.notes} | Pengembalian: ${returnPayload.notes || '-'}` : returnPayload.notes
                    }
                }
                return item
            })

            return {
                ...asset,
                status: "Available",
                assignee: "-",
                assigneeNip: "-",
                assigneeDept: "-",
                kondisi: returnPayload.conditionOnReturn || asset.kondisi,
                custodyHistory: updatedHistory
            }
        }
        return asset
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem("simtik_assets", JSON.stringify(updated))
    return updated
}

/** Tambah catatan perawatan/servis (Maintenance Log) */
export function addMaintenanceRecord(assetId, maintenancePayload) {
    const assets = getAssets()
    const updated = assets.map(asset => {
        if (String(asset.id) === String(assetId)) {
            const currentMnt = asset.maintenanceHistory || []
            const newMntEntry = {
                id: `MNT-${Date.now().toString().slice(-4)}`,
                date: maintenancePayload.date || new Date().toISOString().split("T")[0],
                issue: maintenancePayload.issue,
                action: maintenancePayload.action,
                vendor: maintenancePayload.vendor || "-",
                cost: maintenancePayload.cost || "0",
                isCapitalized: Boolean(maintenancePayload.isCapitalized),
                technician: maintenancePayload.technician || "-",
                status: maintenancePayload.status || "Selesai"
            }

            return {
                ...asset,
                maintenanceHistory: [newMntEntry, ...currentMnt]
            }
        }
        return asset
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem("simtik_assets", JSON.stringify(updated))
    return updated
}

/** Hitung nilai depresiasi metode garis lurus (Straight-line) */
export function calculateDepreciation(asset) {
    if (!asset) return null

    // Parse harga beli
    const rawPrice = String(asset.harga || "0").replace(/[^0-9]/g, "")
    const acquisitionPrice = Number(rawPrice) || 0

    // Parse nilai sisa (salvage value)
    const rawSalvage = String(asset.salvageValue || "0").replace(/[^0-9]/g, "")
    const salvageValue = Number(rawSalvage) || 0

    // Masa manfaat (default 4 tahun untuk TIK)
    const usefulLifeYears = Number(asset.usefulLifeYears) || 4

    // Hitung total penambahan nilai dari upgrade (kapitalisasi)
    const capitalizedAdditions = (asset.maintenanceHistory || [])
        .filter(m => m.isCapitalized)
        .reduce((sum, item) => {
            const num = Number(String(item.cost || "0").replace(/[^0-9]/g, "")) || 0
            return sum + num
        }, 0)

    const totalAssetCost = acquisitionPrice + capitalizedAdditions

    // Hitung usia aset dari tanggal beli / tahun beli
    let purchaseYear = asset.tahunBeli || new Date().getFullYear()
    let purchaseMonth = 1
    if (asset.purchaseDate) {
        const pDate = new Date(asset.purchaseDate)
        if (!isNaN(pDate.getTime())) {
            purchaseYear = pDate.getFullYear()
            purchaseMonth = pDate.getMonth() + 1
        }
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const ageInMonths = Math.max(0, (currentYear - purchaseYear) * 12 + (currentMonth - purchaseMonth))
    const totalUsefulMonths = usefulLifeYears * 12

    // Depresiasi bulanan: (Nilai Perolehan - Nilai Sisa) / Total Bulan Masa Manfaat
    const depreciableBase = Math.max(0, totalAssetCost - salvageValue)
    const monthlyDepreciation = totalUsefulMonths > 0 ? depreciableBase / totalUsefulMonths : 0

    // Akumulasi penyusutan tidak boleh melebihi depreciableBase
    const accumulatedDepreciation = Math.min(depreciableBase, monthlyDepreciation * ageInMonths)

    // Nilai buku saat ini = Total Biaya Aset - Akumulasi Penyusutan
    const currentBookValue = Math.max(salvageValue, totalAssetCost - accumulatedDepreciation)

    const percentDepreciated = totalAssetCost > 0 ? Math.min(100, Math.round((accumulatedDepreciation / totalAssetCost) * 100)) : 0

    return {
        acquisitionPrice,
        capitalizedAdditions,
        totalAssetCost,
        salvageValue,
        usefulLifeYears,
        ageInMonths,
        monthlyDepreciation: Math.round(monthlyDepreciation),
        accumulatedDepreciation: Math.round(accumulatedDepreciation),
        currentBookValue: Math.round(currentBookValue),
        percentDepreciated,
        isFullyDepreciated: ageInMonths >= totalUsefulMonths
    }
}

/** Ambil daftar ruangan gabungan dari master dan data aset */
export function getRooms() {
    const assets = getAssets()
    const roomSet = new Map()

    // Masukkan master ruangan terlebih dahulu
    MASTER_ROOMS.forEach(r => {
        roomSet.set(r.name, r)
    })

    // Masukkan lokasi dari aset yang ada jika belum terdaftar
    assets.forEach(a => {
        if (a.lokasi && !roomSet.has(a.lokasi)) {
            roomSet.set(a.lokasi, {
                id: `R-${Date.now().toString().slice(-3)}`,
                name: a.lokasi,
                pic: a.assignee && a.assignee !== "-" ? a.assignee : "Pengelola Ruangan",
                nip: a.assigneeNip || "-"
            })
        }
    })

    return Array.from(roomSet.values())
}

/** Ambil seluruh aset dalam satu ruangan tertentu */
export function getAssetsByRoom(roomName) {
    if (!roomName) return []
    const assets = getAssets()
    return assets.filter(a => a.lokasi && a.lokasi.trim().toLowerCase() === roomName.trim().toLowerCase())
}

