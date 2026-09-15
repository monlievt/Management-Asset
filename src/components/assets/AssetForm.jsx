import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { useState } from "react"
import { EMPLOYEE_LIST } from "../../data/employees"
import { AlertTriangle } from "lucide-react"

/** Hitung estimasi sisa kapasitas localStorage dalam KB */
function getLocalStorageUsageKB() {
    let total = 0
    for (const key in localStorage) {
        if (!localStorage.hasOwnProperty(key)) continue
        total += (localStorage[key].length + key.length) * 2 // UTF-16
    }
    return Math.round(total / 1024)
}


export function AssetForm({ onCancel, onSubmit, initialData, suggestions = {} }) {
    const [formData, setFormData] = useState(initialData || {
        name: "",
        kodeBarang: "",
        lokasi: "",
        jenisBarang: "",
        merk: "",
        type: "",
        ukuran: "",
        bahan: "",
        tahunBeli: new Date().getFullYear(),
        noPabrik: "",
        noRangka: "",
        noMesin: "",
        noPolisi: "",
        noBpkb: "",
        asalUsul: "",
        harga: "",
        kondisi: "Baik",
        foto: "",
        qrCode: "",
        assignee: "",
        status: "Available",
    })
    const [imageError, setImageError] = useState("")
    const [storageWarning, setStorageWarning] = useState("")

    const formatRupiah = (value) => {
        if (!value) return ""
        const numberString = value.replace(/[^,\d]/g, "").toString()
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
        if (name === "harga") {
            setFormData(prev => ({ ...prev, [name]: formatRupiah(value) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        setImageError("")
        setStorageWarning("")

        if (!file) return

        // Batasi ukuran file maks 2MB sebelum kompresi
        const MAX_FILE_SIZE_MB = 2
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setImageError(`Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)}MB). Maksimal ${MAX_FILE_SIZE_MB}MB.`)
            e.target.value = ""
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            // Resize + kompresi agresif untuk menghemat localStorage (max 5MB)
            const img = new Image()
            img.src = reader.result
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                // Kompres ke maks 600px lebar dan quality 0.5 (lebih hemat dari sebelumnya 800px/0.7)
                const MAX_WIDTH = 600
                const scaleSize = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1
                canvas.width = Math.round(img.width * scaleSize)
                canvas.height = Math.round(img.height * scaleSize)
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5)

                // Periksa sisa kapasitas localStorage setelah kompresi
                const base64SizeKB = Math.round(compressedBase64.length * 0.75 / 1024)
                const usedKB = getLocalStorageUsageKB()
                const LIMIT_KB = 4096 // ~4MB buffer dari 5MB limit

                if (usedKB + base64SizeKB > LIMIT_KB) {
                    setImageError(`Penyimpanan hampir penuh (${usedKB}KB/${LIMIT_KB}KB). Hapus beberapa aset lama atau foto yang ada sebelum menambah foto baru.`)
                    e.target.value = ""
                    return
                }

                if (usedKB > LIMIT_KB * 0.75) {
                    setStorageWarning(`⚠️ Penyimpanan terpakai ${usedKB}KB dari ~${LIMIT_KB}KB. Segera backup data dan hubungi admin untuk migrasi ke database.`)
                }

                setFormData(prev => ({ ...prev, foto: compressedBase64 }))
            }
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                {/* Row 1: Identity */}
                <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium">Asset Name <span className="text-red-500">*</span></label>
                    <Input list="names-list" name="name" value={formData.name} onChange={handleChange} placeholder="Nama Aset" required className="h-8 text-sm" />
                    <datalist id="names-list">
                        {suggestions.names?.map((item, i) => <option key={i} value={item} />)}
                    </datalist>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Kode Barang <span className="text-red-500">*</span></label>
                    <Input name="kodeBarang" value={formData.kodeBarang} onChange={handleChange} placeholder="Kode" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Lokasi <span className="text-red-500">*</span></label>
                    <Input list="lokasis-list" name="lokasi" value={formData.lokasi} onChange={handleChange} placeholder="Lokasi" required className="h-8 text-sm" />
                    <datalist id="lokasis-list">
                        {suggestions.lokasis?.map((item, i) => <option key={i} value={item} />)}
                    </datalist>
                </div>

                {/* Row 2: Specs A */}
                <div className="space-y-1">
                    <label className="text-xs font-medium">Jenis Barang <span className="text-red-500">*</span></label>
                    <Input list="jenisBarangs-list" name="jenisBarang" value={formData.jenisBarang} onChange={handleChange} placeholder="Jenis" required className="h-8 text-sm" />
                    <datalist id="jenisBarangs-list">
                        {suggestions.jenisBarangs?.map((item, i) => <option key={i} value={item} />)}
                    </datalist>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Merk <span className="text-red-500">*</span></label>
                    <Input list="merks-list" name="merk" value={formData.merk} onChange={handleChange} placeholder="Merk" required className="h-8 text-sm" />
                    <datalist id="merks-list">
                        {suggestions.merks?.map((item, i) => <option key={i} value={item} />)}
                    </datalist>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Type <span className="text-red-500">*</span></label>
                    <Input list="types-list" name="type" value={formData.type} onChange={handleChange} placeholder="Type" required className="h-8 text-sm" />
                    <datalist id="types-list">
                        {suggestions.types?.map((item, i) => <option key={i} value={item} />)}
                    </datalist>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Tahun Beli <span className="text-red-500">*</span></label>
                    <Input type="number" name="tahunBeli" value={formData.tahunBeli} onChange={handleChange} placeholder="YYYY" required className="h-8 text-sm" />
                </div>

                {/* Row 3: Specs B */}
                <div className="space-y-1">
                    <label className="text-xs font-medium">Ukuran <span className="text-red-500">*</span></label>
                    <Input name="ukuran" value={formData.ukuran} onChange={handleChange} placeholder="Ukuran" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Bahan <span className="text-red-500">*</span></label>
                    <Input list="bahans-list" name="bahan" value={formData.bahan} onChange={handleChange} placeholder="Bahan" required className="h-8 text-sm" />
                    <datalist id="bahans-list">
                        {suggestions.bahans?.map((item, i) => <option key={i} value={item} />)}
                    </datalist>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Harga (Rp) <span className="text-red-500">*</span></label>
                    <Input name="harga" value={formData.harga} onChange={handleChange} placeholder="Rp" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Asal Usul <span className="text-red-500">*</span></label>
                    <Input name="asalUsul" value={formData.asalUsul} onChange={handleChange} placeholder="Asal Usul" required className="h-8 text-sm" />
                </div>

                {/* Row 4: Numbers */}
                <div className="space-y-1">
                    <label className="text-xs font-medium">No. Pabrik <span className="text-red-500">*</span></label>
                    <Input name="noPabrik" value={formData.noPabrik} onChange={handleChange} placeholder="No Pabrik" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">No. Rangka <span className="text-red-500">*</span></label>
                    <Input name="noRangka" value={formData.noRangka} onChange={handleChange} placeholder="No Rangka" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">No. Mesin <span className="text-red-500">*</span></label>
                    <Input name="noMesin" value={formData.noMesin} onChange={handleChange} placeholder="No Mesin" required className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">No. Polisi/BPKB <span className="text-red-500">*</span></label>
                    <Input name="noPolisi" value={formData.noPolisi} onChange={handleChange} placeholder="Nopol / BPKB" required className="h-8 text-sm" />
                </div>

                {/* Row 5: Status & User */}
                <div className="space-y-1">
                    <label className="text-xs font-medium">Kondisi <span className="text-red-500">*</span></label>
                    <select
                        name="kondisi"
                        value={formData.kondisi}
                        onChange={handleChange}
                        required
                        className="flex h-8 w-full rounded-md border border-secondary-200 bg-white px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                        <option value="Baik">Baik</option>
                        <option value="Kurang Baik">Kurang Baik</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Status <span className="text-red-500">*</span></label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="flex h-8 w-full rounded-md border border-secondary-200 bg-white px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                        <option value="Available">Available</option>
                        <option value="In Use">In Use</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Retired">Retired</option>
                    </select>
                </div>
                <div className="col-span-2 space-y-1">
                    <label className="text-xs font-medium">Pengguna <span className="text-red-500">*</span></label>
                    <Input
                        list="employee-list"
                        name="assignee"
                        value={formData.assignee}
                        onChange={handleChange}
                        placeholder="Pilih Pegawai..."
                        required
                        className="h-8 text-sm"
                    />
                    <datalist id="employee-list">
                        {EMPLOYEE_LIST.map((emp, i) => (
                            <option key={i} value={typeof emp === 'object' ? emp.name : emp} />
                        ))}
                    </datalist>
                </div>

                {/* Row 6: Photo */}
                <div className="col-span-4 space-y-1">
                    <label className="text-xs font-medium">Foto Aset <span className="text-red-500">*</span></label>
                    <p className="text-xs text-secondary-400">Maks 2MB. File akan dikompres otomatis (≤600px, JPEG 50%).</p>
                    <div className="flex gap-2">
                        <Input type="file" accept="image/*" onChange={handleImageUpload} required={!formData.foto} className="h-8 text-sm w-full" />
                        {formData.foto && (
                            <div className="h-8 w-8 relative flex-shrink-0">
                                <img src={formData.foto} alt="Preview" className="h-full w-full object-cover rounded" />
                            </div>
                        )}
                    </div>
                    {imageError && (
                        <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-1">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span>{imageError}</span>
                        </div>
                    )}
                    {storageWarning && !imageError && (
                        <div className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-1">
                            <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span>{storageWarning}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel} size="sm">Cancel</Button>
                <Button type="submit" size="sm">Save Asset</Button>
            </div>
        </form>
    )
}
