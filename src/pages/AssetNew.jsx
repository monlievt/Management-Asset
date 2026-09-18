import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Save, ShieldCheck, DollarSign, Image as ImageIcon, Laptop, UserCheck, CheckCircle2 } from "lucide-react"
import { saveAsset, MASTER_ROOMS } from "../data/assetsStore"
import { EMPLOYEE_LIST } from "../data/employees"
import { MultiAnglePhotoUpload } from "../components/assets/MultiAnglePhotoUpload"

export default function AssetNew() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("general")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        kodeBarang: "1.3.2.06.01.02",
        nup: "0001",
        category: "Laptop",
        jenisBarang: "Laptop Operasional",
        merk: "",
        type: "",
        ukuran: "",
        bahan: "",
        tahunBeli: new Date().getFullYear(),
        purchaseDate: new Date().toISOString().split("T")[0],
        noPabrik: "",
        noRangka: "-",
        noMesin: "-",
        noPolisi: "-",
        noBpkb: "-",
        asalUsul: "Pengadaan APBD",
        harga: "",
        usefulLifeYears: 4,
        salvageValue: "0",
        kondisi: "Baik",
        status: "Available",
        lokasi: "Gudang TIK",
        assignee: "-",
        assigneeNip: "-",
        assigneeDept: "-",
        notes: "",
        photos: {
            front: "",
            back: "",
            right: "",
            left: "",
            top_bottom: "",
            serial_plate: ""
        }
    })

    const formatRupiah = (value) => {
        if (!value) return ""
        const numberString = String(value).replace(/[^,\d]/g, "")
        const split = numberString.split(",")
        const sisa = split[0].length % 3
        let rupiah = split[0].substr(0, sisa)
        const ribuan = split[0].substr(sisa).match(/\d{3}/gi)

        if (ribuan) {
            const separator = sisa ? "." : ""
            rupiah += separator + ribuan.join(".")
        }

        return split[1] !== undefined ? rupiah + "," + split[1] : rupiah
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === "harga" || name === "salvageValue") {
            setFormData(prev => ({ ...prev, [name]: formatRupiah(value) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleEmployeeSelect = (e) => {
        const empName = e.target.value
        if (!empName || empName === "-") {
            setFormData(prev => ({
                ...prev,
                assignee: "-",
                assigneeNip: "-",
                assigneeDept: "-",
                status: "Available"
            }))
            return
        }

        const found = EMPLOYEE_LIST.find(emp => emp.name === empName)
        setFormData(prev => ({
            ...prev,
            assignee: empName,
            assigneeNip: found ? found.nip : "-",
            assigneeDept: found ? found.department : "-",
            status: "In Use"
        }))
    }

    const handlePhotosChange = (updatedPhotos) => {
        setFormData(prev => ({
            ...prev,
            photos: updatedPhotos
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.name.trim()) {
            alert("Harap masukkan Nama Aset!")
            setActiveTab("general")
            return
        }

        setIsSubmitting(true)

        // Buat riwayat kepemilikan awal jika ada pemegang
        const initialCustody = []
        if (formData.assignee && formData.assignee !== "-") {
            initialCustody.push({
                id: `CUST-${Date.now().toString().slice(-4)}`,
                employeeName: formData.assignee,
                nip: formData.assigneeNip || "-",
                department: formData.assigneeDept || "-",
                assignedDate: formData.purchaseDate || new Date().toISOString().split("T")[0],
                returnedDate: null,
                conditionOnAssign: formData.kondisi || "Baik",
                conditionOnReturn: null,
                notes: "Pemberian aset pertama kali saat registrasi sistem",
                bastNumber: `BAST/TIK/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`
            })
        }

        const payload = {
            ...formData,
            custodyHistory: initialCustody,
            maintenanceHistory: []
        }

        saveAsset(payload)

        setSuccessMessage("Aset berhasil didaftarkan ke sistem!")
        setTimeout(() => {
            navigate("/assets/inventory")
        }, 1200)
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-16">
            {/* Header Navigasi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-secondary-200 dark:border-secondary-800 pb-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                            <Link to="/assets/inventory" className="hover:underline">Inventaris Aset</Link>
                            <span>/</span>
                            <span>Tambah Baru</span>
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                            Formulir Pendaftaran Aset Baru
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/assets/inventory")}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        <span>{isSubmitting ? "Menyimpan..." : "Simpan Aset"}</span>
                    </button>
                </div>
            </div>

            {/* Banner Sukses */}
            {successMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{successMessage}</span>
                </div>
            )}

            {/* Navigasi Tab Formulir */}
            <div className="flex border-b border-secondary-200 dark:border-secondary-800 gap-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setActiveTab("general")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "general"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <Laptop className="h-4 w-4" />
                    <span>Informasi & Spesifikasi</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("finance")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "finance"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <DollarSign className="h-4 w-4" />
                    <span>Pengadaan & Nilai Aset</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("photos")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "photos"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <ImageIcon className="h-4 w-4" />
                    <span>Dokumentasi Multi-Foto Sudut</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("custody")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                        activeTab === "custody"
                            ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                            : "border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400"
                    }`}
                >
                    <UserCheck className="h-4 w-4" />
                    <span>Pemegang Inventaris Awal</span>
                </button>
            </div>

            {/* Konten Tab */}
            <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-6 shadow-sm">
                {/* TAB 1: General & Specs */}
                {activeTab === "general" && (
                    <div className="space-y-6">
                        <h3 className="text-base font-semibold text-secondary-900 dark:text-white border-b border-secondary-100 dark:border-secondary-800 pb-2">
                            Identitas & Kategori Aset
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Nama Aset / Perangkat <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Contoh: Laptop Dell Latitude 5420 Core i7"
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                        Kode Barang (Permendagri 108)
                                    </label>
                                    <input
                                        type="text"
                                        name="kodeBarang"
                                        value={formData.kodeBarang}
                                        onChange={handleChange}
                                        placeholder="1.3.2.06.01.02"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                        NUP
                                    </label>
                                    <input
                                        type="text"
                                        name="nup"
                                        value={formData.nup}
                                        onChange={handleChange}
                                        placeholder="0001"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-center font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Kategori
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Laptop">Laptop / Notebook</option>
                                    <option value="PC Desktop">PC Desktop / Workstation</option>
                                    <option value="Server">Server & Storage</option>
                                    <option value="Networking">Switch / Router / Access Point</option>
                                    <option value="Printer">Printer / Scanner</option>
                                    <option value="Peripheral">Peripheral / Aksesoris</option>
                                    <option value="Kendaraan">Kendaraan Operasional</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Jenis / Klasifikasi Barang
                                </label>
                                <input
                                    type="text"
                                    name="jenisBarang"
                                    value={formData.jenisBarang}
                                    onChange={handleChange}
                                    placeholder="Contoh: Laptop Pejabat Eselon III"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <h3 className="text-base font-semibold text-secondary-900 dark:text-white border-b border-secondary-100 dark:border-secondary-800 pb-2 pt-4">
                            Spesifikasi Teknis & Pabrikan
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Merek / Pabrikan
                                </label>
                                <input
                                    type="text"
                                    name="merk"
                                    value={formData.merk}
                                    onChange={handleChange}
                                    placeholder="Dell, HP, Lenovo, Cisco, dll"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Tipe / Model
                                </label>
                                <input
                                    type="text"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    placeholder="Latitude 5420 / LaserJet M428"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Nomor Seri Pabrik (Serial Number)
                                </label>
                                <input
                                    type="text"
                                    name="noPabrik"
                                    value={formData.noPabrik}
                                    onChange={handleChange}
                                    placeholder="SN-123456789"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Ukuran / Dimensi Fisik
                                </label>
                                <input
                                    type="text"
                                    name="ukuran"
                                    value={formData.ukuran}
                                    onChange={handleChange}
                                    placeholder="14 Inci / 2U Rackmount"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Bahan Material
                                </label>
                                <input
                                    type="text"
                                    name="bahan"
                                    value={formData.bahan}
                                    onChange={handleChange}
                                    placeholder="Aluminium / Logam / Plastik"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Lokasi Ruangan (KIR) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    list="rooms-list"
                                    name="lokasi"
                                    value={formData.lokasi}
                                    onChange={handleChange}
                                    placeholder="Pilih atau ketik nama ruangan..."
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                <datalist id="rooms-list">
                                    {MASTER_ROOMS.map(r => (
                                        <option key={r.id} value={r.name} />
                                    ))}
                                </datalist>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Kondisi Fisik Barang <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="kondisi"
                                    value={formData.kondisi}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Baik">Baik (Bisa Digunakan Normal)</option>
                                    <option value="Kurang Baik">Kurang Baik / Rusak Ringan</option>
                                    <option value="Rusak Berat">Rusak Berat (Tidak Berfungsi)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Status Ketersediaan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Available">Tersedia di Gudang (Siap Pakai)</option>
                                    <option value="In Use">Sedang Digunakan Pegawai</option>
                                    <option value="Maintenance">Dalam Perbaikan / Servis</option>
                                    <option value="Damaged">Rusak / Menunggu Afkir</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: Pengadaan & Nilai Aset */}
                {activeTab === "finance" && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-100 dark:border-primary-900 text-primary-800 dark:text-primary-300 text-sm">
                            <ShieldCheck className="h-5 w-5 shrink-0" />
                            <span>
                                Data perolehan ini akan digunakan oleh sistem untuk <strong>kalkulasi otomatis nilai penyusutan (depresiasi garis lurus)</strong> dan nilai buku aset dari tahun ke tahun.
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Asal Usul / Sumber Perolehan
                                </label>
                                <input
                                    type="text"
                                    name="asalUsul"
                                    value={formData.asalUsul}
                                    onChange={handleChange}
                                    placeholder="Contoh: Pengadaan DAK / APBD Tahun 2024 / Hibah"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Tanggal Pembelian / BAST Perolehan
                                </label>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={formData.purchaseDate}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Harga Beli / Perolehan Awal (Rp)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-secondary-400">Rp</span>
                                    <input
                                        type="text"
                                        name="harga"
                                        value={formData.harga}
                                        onChange={handleChange}
                                        placeholder="15.000.000"
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Tahun Penganggaran
                                </label>
                                <input
                                    type="number"
                                    name="tahunBeli"
                                    value={formData.tahunBeli}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Estimasi Masa Manfaat (Tahun)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    name="usefulLifeYears"
                                    value={formData.usefulLifeYears}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                <p className="text-xs text-secondary-500 mt-1">Standar perangkat komputer & elektronik adalah 4 - 5 tahun.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Estimasi Nilai Residu / Sisa (Rp)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-secondary-400">Rp</span>
                                    <input
                                        type="text"
                                        name="salvageValue"
                                        value={formData.salvageValue}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                                <p className="text-xs text-secondary-500 mt-1">Nilai sisa aset saat masa manfaatnya habis.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: Dokumentasi Multi-Foto Sudut */}
                {activeTab === "photos" && (
                    <div className="space-y-4">
                        <div className="border-b border-secondary-100 dark:border-secondary-800 pb-3">
                            <h3 className="text-base font-semibold text-secondary-900 dark:text-white">
                                Unggah Multi-Sudut Foto Fisik Aset
                            </h3>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Dokumentasikan kondisi fisik dari berbagai sudut untuk keperluan audit berkala dan kejelasan verifikasi saat serah terima.
                            </p>
                        </div>

                        <MultiAnglePhotoUpload
                            photos={formData.photos}
                            onChange={handlePhotosChange}
                        />
                    </div>
                )}

                {/* TAB 4: Pemegang Inventaris Awal */}
                {activeTab === "custody" && (
                    <div className="space-y-5">
                        <div className="border-b border-secondary-100 dark:border-secondary-800 pb-3">
                            <h3 className="text-base font-semibold text-secondary-900 dark:text-white">
                                Penyerahan Aset Awal (Opsional)
                            </h3>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Jika barang langsung diserahkan kepada pegawai saat didaftarkan, pilih pegawai di bawah ini. Sistem akan langsung menginisiasi log riwayat pemegang inventaris.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Pilih Pegawai Penerima
                                </label>
                                <select
                                    value={formData.assignee}
                                    onChange={handleEmployeeSelect}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="-">-- Belum Diserahkan (Tersimpan di Gudang) --</option>
                                    {EMPLOYEE_LIST.map((emp) => (
                                        <option key={emp.nip} value={emp.name}>
                                            {emp.name} ({emp.department})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    NIP Pegawai
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.assigneeNip || "-"}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Unit Kerja / Bidang
                                </label>
                                <input
                                    type="text"
                                    readOnly
                                    value={formData.assigneeDept || "-"}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Catatan Serah Terima
                                </label>
                                <input
                                    type="text"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Keperluan dinas / proyek khusus"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Tombol Aksi */}
                <div className="flex items-center justify-between pt-8 border-t border-secondary-100 dark:border-secondary-800 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/assets/inventory")}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white"
                    >
                        Batal
                    </button>

                    <div className="flex gap-2">
                        {activeTab !== "general" && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === "finance") setActiveTab("general")
                                    else if (activeTab === "photos") setActiveTab("finance")
                                    else if (activeTab === "custody") setActiveTab("photos")
                                }}
                                className="px-4 py-2 text-sm font-medium rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800"
                            >
                                Kembali
                            </button>
                        )}

                        {activeTab !== "custody" ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === "general") setActiveTab("finance")
                                    else if (activeTab === "finance") setActiveTab("photos")
                                    else if (activeTab === "photos") setActiveTab("custody")
                                }}
                                className="px-5 py-2 text-sm font-semibold rounded-lg bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 hover:bg-secondary-800 dark:hover:bg-secondary-100"
                            >
                                Lanjut
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20"
                            >
                                <Save className="h-4 w-4" />
                                <span>Simpan Seluruh Data Aset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
