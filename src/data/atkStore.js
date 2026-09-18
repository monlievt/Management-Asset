/**
 * Central Store untuk Modul Persediaan Barang Habis Pakai (ATK & Logistik)
 * SIM-TIK Inspektorat Kabupaten Trenggalek
 *
 * Mendukung sinkronisasi antara:
 * 1. Manajemen Stok Opname (Admin)
 * 2. Kios Pengambilan Mandiri (Self-Checkout Pegawai)
 * 3. Riwayat Mutasi Barang Masuk & Keluar
 */

export const ATK_CATEGORIES = [
    "Kertas & Cetak",
    "Alat Tulis",
    "Map & Arsip",
    "Tinta Printer",
    "Perlengkapan Meja",
    "Media & Elektronik"
]

export const DEFAULT_ATK_ITEMS = [
    {
        id: 1,
        code: "ATK-001",
        name: "Kertas HVS A4 80gr",
        category: "Kertas & Cetak",
        brand: "PaperOne",
        quantity: 48,
        unit: "Rim",
        minStock: 10,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 2,
        code: "ATK-002",
        name: "Kertas HVS F4 / Folio 75gr",
        category: "Kertas & Cetak",
        brand: "Sinar Dunia",
        quantity: 35,
        unit: "Rim",
        minStock: 10,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 3,
        code: "ATK-003",
        name: "Pulpen Pilot G-2 0.5 Hitam",
        category: "Alat Tulis",
        brand: "Pilot",
        quantity: 85,
        unit: "Pcs",
        minStock: 15,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 4,
        code: "ATK-004",
        name: "Pulpen Pilot G-2 0.5 Biru",
        category: "Alat Tulis",
        brand: "Pilot",
        quantity: 60,
        unit: "Pcs",
        minStock: 15,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 5,
        code: "ATK-005",
        name: "Pulpen Gel Snowman V-1 Hitam",
        category: "Alat Tulis",
        brand: "Snowman",
        quantity: 40,
        unit: "Pcs",
        minStock: 12,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 6,
        code: "ATK-006",
        name: "Map Snelhecter Plastik Biru",
        category: "Map & Arsip",
        brand: "Folder One",
        quantity: 120,
        unit: "Pcs",
        minStock: 25,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 7,
        code: "ATK-007",
        name: "Map Kertas Buffalo Kuning (LHP)",
        category: "Map & Arsip",
        brand: "Buffalo",
        quantity: 150,
        unit: "Pcs",
        minStock: 30,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 8,
        code: "ATK-008",
        name: "Map Ordner Bantex F4 7cm",
        category: "Map & Arsip",
        brand: "Bantex",
        quantity: 24,
        unit: "Pcs",
        minStock: 5,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 9,
        code: "ATK-009",
        name: "Tinta Printer Epson 003 Hitam",
        category: "Tinta Printer",
        brand: "Epson Original",
        quantity: 8,
        unit: "Botol",
        minStock: 3,
        status: "Limited",
        lastUpdate: "2026-09-15"
    },
    {
        id: 10,
        code: "ATK-010",
        name: "Tinta Printer Epson 003 Warna (Set)",
        category: "Tinta Printer",
        brand: "Epson Original",
        quantity: 6,
        unit: "Set",
        minStock: 2,
        status: "Limited",
        lastUpdate: "2026-09-15"
    },
    {
        id: 11,
        code: "ATK-011",
        name: "Binder Clip No. 107 (Kecil)",
        category: "Perlengkapan Meja",
        brand: "Kenko",
        quantity: 30,
        unit: "Kotak",
        minStock: 5,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 12,
        code: "ATK-012",
        name: "Binder Clip No. 111 (Sedang)",
        category: "Perlengkapan Meja",
        brand: "Kenko",
        quantity: 25,
        unit: "Kotak",
        minStock: 5,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 13,
        code: "ATK-013",
        name: "Sticky Notes / Post-It 3x3",
        category: "Perlengkapan Meja",
        brand: "Pronto / 3M",
        quantity: 45,
        unit: "Pad",
        minStock: 10,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 14,
        code: "ATK-014",
        name: "Spidol Whiteboard Snowman Hitam",
        category: "Alat Tulis",
        brand: "Snowman",
        quantity: 28,
        unit: "Pcs",
        minStock: 6,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 15,
        code: "ATK-015",
        name: "Tip-Ex Roll / Correction Tape",
        category: "Alat Tulis",
        brand: "Joyko / Kenko",
        quantity: 35,
        unit: "Pcs",
        minStock: 8,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 16,
        code: "ATK-016",
        name: "Baterai Alkaline AA (Isi 2)",
        category: "Media & Elektronik",
        brand: "ABC Alkaline",
        quantity: 18,
        unit: "Pasang",
        minStock: 4,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 17,
        code: "ATK-017",
        name: "Amplop Coklat Dinas Bertali Folio",
        category: "Map & Arsip",
        brand: "Merpati",
        quantity: 180,
        unit: "Lembar",
        minStock: 50,
        status: "Available",
        lastUpdate: "2026-09-15"
    },
    {
        id: 18,
        code: "ATK-018",
        name: "Flashdisk 32GB Pengawasan",
        category: "Media & Elektronik",
        brand: "SanDisk Cruzer",
        quantity: 12,
        unit: "Unit",
        minStock: 3,
        status: "Available",
        lastUpdate: "2026-09-15"
    }
]

const STORAGE_KEY_STOCKS = "simtik_stock_atk"
const STORAGE_KEY_HISTORY = "simtik_stock_atk_history"
const STORAGE_KEY_LAST_TAKER = "simtik_self_service_last_taker"

/**
 * Mengambil daftar stok persediaan ATK
 */
export function getAtkStocks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_STOCKS)
        if (!saved) {
            localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(DEFAULT_ATK_ITEMS))
            return DEFAULT_ATK_ITEMS
        }
        const parsed = JSON.parse(saved)
        // Jika data sebelumnya hanya berisi 3 item sampel lama, gabungkan katalog kaya
        if (parsed.length < 5) {
            const merged = [...DEFAULT_ATK_ITEMS]
            parsed.forEach(p => {
                const idx = merged.findIndex(m => m.name.toLowerCase() === p.name.toLowerCase())
                if (idx !== -1) merged[idx] = { ...merged[idx], ...p }
                else merged.push(p)
            })
            localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(merged))
            return merged
        }
        return parsed
    } catch (err) {
        console.error("Gagal membaca stok ATK:", err)
        return DEFAULT_ATK_ITEMS
    }
}

/**
 * Menyimpan seluruh data stok ATK
 */
export function saveAtkStocks(stocks) {
    try {
        localStorage.setItem(STORAGE_KEY_STOCKS, JSON.stringify(stocks))
    } catch (err) {
        console.error("Gagal menyimpan stok ATK:", err)
    }
}

/**
 * Mengambil seluruh riwayat mutasi masuk & keluar ATK
 */
export function getAtkHistory() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY)
        return saved ? JSON.parse(saved) : []
    } catch (err) {
        console.error("Gagal membaca riwayat mutasi ATK:", err)
        return []
    }
}

/**
 * Menyimpan seluruh riwayat mutasi ATK
 */
export function saveAtkHistory(history) {
    try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history))
    } catch (err) {
        console.error("Gagal menyimpan riwayat mutasi ATK:", err)
    }
}

/**
 * Mengambil identitas pegawai yang terakhir kali checkout di HP ini
 */
export function getRememberedTaker() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_LAST_TAKER)
        return saved ? JSON.parse(saved) : null
    } catch {
        return null
    }
}

/**
 * Menyimpan identitas pegawai di browser HP untuk percepatan checkout berikutnya
 */
export function setRememberedTaker(takerInfo) {
    if (takerInfo) {
        localStorage.setItem(STORAGE_KEY_LAST_TAKER, JSON.stringify(takerInfo))
    } else {
        localStorage.removeItem(STORAGE_KEY_LAST_TAKER)
    }
}

/**
 * Fungsi Inti: Self-Checkout Pengambilan ATK Mandiri
 *
 * @param {Object} params
 * @param {string} params.takerName - Nama lengkap pengambil
 * @param {string} params.takerNip - NIP pengambil
 * @param {string} params.department - Unit Kerja / Bidang
 * @param {string} params.purpose - Keperluan (preset atau custom)
 * @param {string} params.notes - Catatan tambahan
 * @param {Array<{id: number, quantity: number}>} params.cartItems - Daftar barang yang diambil
 * @param {string} params.source - 'kiosk' | 'qr_mobile' | 'web_header'
 */
export function selfCheckoutAtk({
    takerName,
    takerNip = "-",
    department = "INSPEKTORAT",
    purpose = "Operasional Dinas",
    notes = "",
    cartItems = [],
    source = "web_header",
    remember = false
}) {
    if (!takerName || !takerName.trim()) {
        throw new Error("Nama pegawai pengambil wajib diisi.")
    }
    if (!cartItems || cartItems.length === 0) {
        throw new Error("Keranjang pengambilan ATK masih kosong.")
    }

    const currentStocks = getAtkStocks()
    const currentHistory = getAtkHistory()
    const today = new Date().toISOString().split("T")[0]
    const timestamp = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })

    // 1. Validasi kecukupan seluruh stok barang terlebih dahulu
    for (const item of cartItems) {
        const stockItem = currentStocks.find(s => s.id === item.id)
        if (!stockItem) {
            throw new Error(`Barang "${item.name}" tidak ditemukan dalam sistem.`)
        }
        if (stockItem.quantity < item.quantity) {
            throw new Error(`Stok "${stockItem.name}" tidak mencukupi. Tersedia: ${stockItem.quantity} ${stockItem.unit}, diminta: ${item.quantity} ${stockItem.unit}.`)
        }
    }

    // 2. Lakukan pengurangan stok dan buat record riwayat mutasi
    const updatedStocks = [...currentStocks]
    const newHistoryRecords = []
    const summaryList = []

    for (const item of cartItems) {
        const stockIndex = updatedStocks.findIndex(s => s.id === item.id)
        const stockItem = updatedStocks[stockIndex]
        const newQty = stockItem.quantity - item.quantity

        let newStatus = "Available"
        if (newQty <= 0) newStatus = "Out of Stock"
        else if (newQty <= (stockItem.minStock || 5)) newStatus = "Limited"

        updatedStocks[stockIndex] = {
            ...stockItem,
            quantity: newQty,
            status: newStatus,
            lastUpdate: today
        }

        const historyRecord = {
            id: Date.now() + Math.random(),
            date: timestamp,
            type: "OUT",
            itemName: stockItem.name,
            quantity: item.quantity,
            unit: stockItem.unit,
            taker: takerName,
            department: department,
            purpose: purpose,
            notes: `[Mandiri/${source.toUpperCase()}] ${purpose}${notes ? ` - ${notes}` : ""}`,
            user: "Pegawai Mandiri"
        }
        newHistoryRecords.push(historyRecord)
        summaryList.push(`${stockItem.name} (${item.quantity} ${stockItem.unit})`)
    }

    // 3. Simpan ke localStorage
    saveAtkStocks(updatedStocks)
    saveAtkHistory([...newHistoryRecords, ...currentHistory])

    // 4. Ingat taker jika diminta
    if (remember) {
        setRememberedTaker({ name: takerName, nip: takerNip, department: department })
    }

    // 5. Catat Jejak Audit APIP ke backend secara asynchronous
    try {
        fetch("/api/audit-logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "SELF_CHECKOUT_ATK",
                entity: "ATK_STOCK",
                entityId: `ATK-TX-${Date.now()}`,
                userName: takerName,
                userNip: takerNip,
                role: "pegawai",
                detailsJson: JSON.stringify({
                    department,
                    purpose,
                    items: summaryList
                })
            })
        }).catch(() => {});
    } catch {
        // Abaikan jika offline
    }

    return {
        success: true,
        takerName,
        department,
        purpose,
        timestamp,
        itemsCount: cartItems.length,
        summary: summaryList
    }
}
