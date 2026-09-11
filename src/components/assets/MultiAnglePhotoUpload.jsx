import { useState, useRef } from "react"
import { Camera, Trash2, Eye, Upload, Image as ImageIcon, AlertCircle } from "lucide-react"
import { PHOTO_ANGLES } from "../../data/assetsStore"

export function MultiAnglePhotoUpload({ photos = {}, onChange }) {
    const [selectedAngle, setSelectedAngle] = useState("front")
    const [previewModalImage, setPreviewModalImage] = useState(null)
    const [uploadError, setUploadError] = useState("")
    const fileInputRef = useRef(null)

    // Kompres gambar otomatis menggunakan Canvas agar ringan di browser storage
    const processAndCompressFile = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("File tidak ditemukan"))
            if (!file.type.startsWith("image/")) return reject(new Error("File harus berupa gambar (JPG, PNG, WebP)"))

            // Batasi jika file mentah > 5MB
            if (file.size > 5 * 1024 * 1024) {
                return reject(new Error("Ukuran foto maksimal 5MB"))
            }

            const reader = new FileReader()
            reader.onload = (event) => {
                const img = new Image()
                img.onload = () => {
                    const canvas = document.createElement("canvas")
                    const MAX_WIDTH = 1000
                    const MAX_HEIGHT = 1000
                    let width = img.width
                    let height = img.height

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width
                            width = MAX_WIDTH
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height
                            height = MAX_HEIGHT
                        }
                    }

                    canvas.width = width
                    canvas.height = height
                    const ctx = canvas.getContext("2d")
                    ctx.drawImage(img, 0, 0, width, height)

                    // Kompresi JPEG kualitas 0.75
                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75)
                    resolve(compressedBase64)
                }
                img.onerror = () => reject(new Error("Gagal membaca file gambar"))
                img.src = event.target.result
            }
            reader.onerror = () => reject(new Error("Gagal memuat file"))
            reader.readAsDataURL(file)
        })
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        setUploadError("")
        if (!file) return

        try {
            const base64 = await processAndCompressFile(file)
            const updated = {
                ...photos,
                [selectedAngle]: base64
            }
            onChange(updated)
        } catch (err) {
            setUploadError(err.message || "Gagal mengunggah foto")
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemovePhoto = (angleKey, e) => {
        e.stopPropagation()
        const updated = {
            ...photos,
            [angleKey]: ""
        }
        onChange(updated)
    }

    const currentPhoto = photos[selectedAngle] || ""
    const activeAngleInfo = PHOTO_ANGLES.find(a => a.key === selectedAngle) || PHOTO_ANGLES[0]

    return (
        <div className="space-y-4">
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Selector Sudut Foto */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-600 dark:text-secondary-300 mb-2">
                    Pilih Sudut Kondisi Fisik:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {PHOTO_ANGLES.map(angle => {
                        const hasImage = Boolean(photos[angle.key])
                        const isSelected = selectedAngle === angle.key

                        return (
                            <button
                                key={angle.key}
                                type="button"
                                onClick={() => setSelectedAngle(angle.key)}
                                className={`relative flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all ${
                                    isSelected
                                        ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:border-primary-500 dark:text-primary-300 ring-2 ring-primary-500/20"
                                        : "border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:border-secondary-300 dark:hover:border-secondary-600"
                                }`}
                            >
                                <div className="flex items-center gap-1 mb-1">
                                    <Camera className={`h-3.5 w-3.5 ${isSelected ? "text-primary-600 dark:text-primary-400" : "text-secondary-400"}`} />
                                    {hasImage && (
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-secondary-800" title="Foto terisi" />
                                    )}
                                </div>
                                <span className="truncate w-full text-center">{angle.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Error Message */}
            {uploadError && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                </div>
            )}

            {/* Area Preview & Upload untuk Sudut yang Dipilih */}
            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/40 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                        <h5 className="text-sm font-semibold text-secondary-900 dark:text-white flex items-center gap-2">
                            <span>{activeAngleInfo.label}</span>
                            {currentPhoto ? (
                                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Foto Terpasang
                                </span>
                            ) : (
                                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-secondary-200 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300">
                                    Belum Ada Foto
                                </span>
                            )}
                        </h5>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                            {activeAngleInfo.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors"
                        >
                            <Upload className="h-3.5 w-3.5" />
                            <span>{currentPhoto ? "Ganti Foto" : "Unggah Foto"}</span>
                        </button>

                        {currentPhoto && (
                            <button
                                type="button"
                                onClick={(e) => handleRemovePhoto(selectedAngle, e)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 dark:border-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Hapus</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview Box */}
                {currentPhoto ? (
                    <div className="relative group rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700 bg-black/5 dark:bg-black/20 flex items-center justify-center max-h-72">
                        <img
                            src={currentPhoto}
                            alt={activeAngleInfo.label}
                            className="w-full h-72 object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setPreviewModalImage(currentPhoto)}
                                className="p-2 rounded-full bg-white/90 text-secondary-800 hover:bg-white transition-colors"
                                title="Perbesar Foto"
                            >
                                <Eye className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/20 dark:hover:border-primary-500 dark:hover:bg-primary-950/20 transition-all"
                    >
                        <ImageIcon className="mx-auto h-10 w-10 text-secondary-400 dark:text-secondary-500 mb-2" />
                        <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                            Klik di sini untuk mengunggah foto ({activeAngleInfo.label})
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            Format JPG, PNG, atau WebP (maks. 5MB). Foto akan dioptimasi otomatis.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Perbesar Foto (Lightbox) */}
            {previewModalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setPreviewModalImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-secondary-900 p-2 rounded-xl shadow-2xl">
                        <img
                            src={previewModalImage}
                            alt="Preview Inspeksi Fisik"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewModalImage(null)}
                            className="absolute -top-3 -right-3 p-1.5 bg-secondary-900 text-white rounded-full hover:bg-secondary-700 shadow"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
