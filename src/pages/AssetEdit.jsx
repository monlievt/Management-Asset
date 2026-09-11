import { useState, useEffect } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, Save, ShieldCheck, DollarSign, Image as ImageIcon, Laptop, CheckCircle2, AlertCircle } from "lucide-react"
import { getAssetById, saveAsset, MASTER_ROOMS } from "../data/assetsStore"
import { MultiAnglePhotoUpload } from "../components/assets/MultiAnglePhotoUpload"

export default function AssetEdit() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("general")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [notFound, setNotFound] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        kodeBarang: "",
        nup: "0001",
        category: "Laptop",
        jenisBarang: "",
        merk: "",
        type: "",
        ukuran: "",
        bahan: "",
        tahunBeli: new Date().getFullYear(),
        purchaseDate: "",
        noPabrik: "",
        noRangka: "-",
        noMesin: "-",
        noPolisi: "-",
        noBpkb: "-",
        asalUsul: "",
        harga: "",
        usefulLifeYears: 4,
        salvageValue: "0",
        kondisi: "Baik",
        status: "Available",
        lokasi: "",
        assignee: "-",
        assigneeNip: "-",
        assigneeDept: "-",
        photos: {
            front: "",
            back: "",
            right: "",
            left: "",
            top_bottom: "",
            serial_plate: ""
        }
    })

    useEffect(() => {
        const asset = getAssetById(id)
        if (asset) {
            setFormData({
                ...asset,
                photos: asset.photos || {
                    front: "",
                    back: "",
                    right: "",
                    left: "",
                    top_bottom: "",
                    serial_plate: ""
                }
            })
        } else {
            setNotFound(true)
        }
    }, [id])

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

        saveAsset(formData)

        setSuccessMessage("Perubahan data aset berhasil disimpan!")
        setTimeout(() => {
            navigate(`/assets/inventory/${id}`)
        }, 1000)
    }

    if (notFound) {
        return (
            <div className="max-w-xl mx-auto py-16 text-center space-y-4">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Aset Tidak Ditemukan</h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Aset dengan ID {id} tidak ditemukan atau telah dihapus.
                </p>
                <Link
                    to="/assets/inventory"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white"
                >
                    Kembali ke Daftar Aset
                </Link>
            </div>
        )
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
                            <Link to={`/assets/inventory/${id}`} className="hover:underline">{formData.name || "Detail"}</Link>
                            <span>/</span>
                            <span>Ubah Data</span>
                        </div>
                        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                            Ubah Data Aset: {formData.name}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(`/assets/inventory/${id}`)}
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
                        <span>{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
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
                                        value={formData.nup || "0001"}
                                        onChange={handleChange}
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
                                    Merk / Brand
                                </label>
                                <input
                                    type="text"
                                    name="merk"
                                    value={formData.merk}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Model / Type
                                </label>
                                <input
                                    type="text"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
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
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Ukuran / Dimensi
                                </label>
                                <input
                                    type="text"
                                    name="ukuran"
                                    value={formData.ukuran}
                                    onChange={handleChange}
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
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Lokasi Fisik Ruangan (KIR)
                                </label>
                                <input
                                    type="text"
                                    name="lokasi"
                                    list="rooms-list"
                                    value={formData.lokasi}
                                    onChange={handleChange}
                                    placeholder="Pilih atau ketik nama ruangan..."
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                                <datalist id="rooms-list">
                                    {MASTER_ROOMS.map(r => (
                                        <option key={r.id} value={r.name} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Kondisi Fisik Saat Ini
                                </label>
                                <select
                                    name="kondisi"
                                    value={formData.kondisi}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Baik">Baik (Normal Berfungsi)</option>
                                    <option value="Rusak Ringan">Rusak Ringan (Perlu Perawatan Minor)</option>
                                    <option value="Rusak Berat">Rusak Berat (Tidak Berfungsi)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Status Ketersediaan
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                >
                                    <option value="Available">Tersedia di Gudang (Ready to Deploy)</option>
                                    <option value="In Use">Sedang Digunakan Pegawai</option>
                                    <option value="Maintenance">Dalam Perbaikan / Servis</option>
                                    <option value="Damaged">Rusak / Menunggu Afkir</option>
                                    <option value="Disposed">Dihibahkan / Dihapus</option>
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
                                Mengubah harga perolehan atau masa manfaat akan secara otomatis memperbarui kalkulasi depresiasi dan nilai buku pada modul finansial.
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
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-700 dark:text-secondary-300 mb-1">
                                    Tanggal Pembelian / Perolehan
                                </label>
                                <input
                                    type="date"
                                    name="purchaseDate"
                                    value={formData.purchaseDate || ""}
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
                                    value={formData.usefulLifeYears || 4}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
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
                                        value={formData.salvageValue || "0"}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: Dokumentasi Multi-Foto Sudut */}
                {activeTab === "photos" && (
                    <div className="space-y-4">
                        <div className="border-b border-secondary-100 dark:border-secondary-800 pb-3">
                            <h3 className="text-base font-semibold text-secondary-900 dark:text-white">
                                Dokumentasi Multi-Sudut Foto Fisik
                            </h3>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                                Perbarui atau tambahkan foto kondisi fisik aset per sudut pandang.
                            </p>
                        </div>

                        <MultiAnglePhotoUpload
                            photos={formData.photos}
                            onChange={handlePhotosChange}
                        />
                    </div>
                )}

                {/* Footer Tombol Aksi */}
                <div className="flex items-center justify-between pt-8 border-t border-secondary-100 dark:border-secondary-800 mt-6">
                    <button
                        type="button"
                        onClick={() => navigate(`/assets/inventory/${id}`)}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20"
                    >
                        <Save className="h-4 w-4" />
                        <span>Simpan Perubahan Aset</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
