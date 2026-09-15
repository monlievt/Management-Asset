import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Printer, ArrowLeft, QrCode, Sparkles, ShieldCheck } from "lucide-react"
import QRCode from "qrcode"
import { getSigners } from "../data/masterDataStore"

export default function AtkQrPoster() {
    const navigate = useNavigate()
    const [qrDataUrl, setQrDataUrl] = useState("")
    const [signers, setSigners] = useState(() => getSigners())

    const checkoutUrl = `${window.location.origin}/atk/ambil?source=qr`

    useEffect(() => {
        setSigners(getSigners())

        // Generate high-resolution QR Code
        QRCode.toDataURL(checkoutUrl, {
            width: 320,
            margin: 2,
            color: {
                dark: "#0f172a",
                light: "#ffffff"
            }
        }).then(url => {
            setQrDataUrl(url)
        }).catch(err => {
            console.error("Gagal membuat QR Code:", err)
        })
    }, [checkoutUrl])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-secondary-100 dark:bg-secondary-950 p-4 sm:p-8">
            {/* Action Bar (Disembunyikan saat cetak) */}
            <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 shadow-xs"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-secondary-500 hidden sm:inline">
                        Format Cetak Standar A4 Portret (Untuk Ditempel di Pintu / Rak ATK)
                    </span>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-md transition"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Lembar Poster (Print)</span>
                    </button>
                </div>
            </div>

            {/* Lembar Dokumen Poster Resmi A4 */}
            <div className="max-w-3xl mx-auto bg-white text-black p-10 sm:p-14 shadow-2xl rounded-2xl border border-secondary-200 print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none">

                {/* Kop Instansi Resmi */}
                <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                    <h3 className="text-sm font-bold tracking-wider uppercase m-0">
                        {signers?.kop?.governmentName || "PEMERINTAH KABUPATEN TRENGGALEK"}
                    </h3>
                    <h1 className="text-xl font-black tracking-wide uppercase mt-1 mb-0">
                        {signers?.kop?.agencyName || "INSPEKTORAT DAERAH"}
                    </h1>
                    <p className="text-xs text-gray-700 mt-1 mb-0">
                        {signers?.kop?.address || "Jl. Brigjen Soetran No. 9, Trenggalek, Jawa Timur"} {signers?.kop?.phone ? `| Telp: ${signers?.kop?.phone}` : ""}
                    </p>
                </div>

                {/* Judul Poster */}
                <div className="text-center mb-6">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs tracking-wider uppercase mb-2 border border-emerald-300">
                        Akses Mandiri Ruangan ATK
                    </span>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-gray-950">
                        PENGAMBILAN ATK & LOGISTIK MANDIRI
                    </h2>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                        Sistem Informasi Manajemen Aset & Logistik TIK (SIM-TIK v2.5 Enterprise)
                    </p>
                </div>

                {/* Kotak Utama QR Code */}
                <div className="my-6 p-6 rounded-2xl border-2 border-dashed border-gray-400 bg-gray-50 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
                        <QrCode className="h-4 w-4 text-primary-700" />
                        Arahkan Kamera HP Anda ke QR Code di Bawah Ini
                    </p>

                    {qrDataUrl ? (
                        <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200">
                            <img
                                src={qrDataUrl}
                                alt="QR Code Ambil ATK Mandiri"
                                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                            />
                        </div>
                    ) : (
                        <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                            Membuat QR Code...
                        </div>
                    )}

                    <p className="text-[11px] font-mono text-gray-600 mt-3 break-all max-w-md">
                        URL: <strong>{checkoutUrl}</strong>
                    </p>
                </div>

                {/* 3 Langkah Mudah Mengambil ATK */}
                <div className="mt-8 pt-4 border-t border-gray-300">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-800 text-center mb-4">
                        3 Langkah Mudah Ambil ATK (Hanya Butuh Waktu 5 Detik):
                    </h4>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-xl border border-gray-200 bg-white">
                            <div className="h-8 w-8 rounded-full bg-primary-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                                1
                            </div>
                            <h5 className="font-bold text-xs text-gray-900">Scan QR Code</h5>
                            <p className="text-[10px] text-gray-600 mt-1 leading-snug">
                                Buka kamera HP Anda dan tap tautan yang muncul di layar.
                            </p>
                        </div>

                        <div className="p-3 rounded-xl border border-gray-200 bg-white">
                            <div className="h-8 w-8 rounded-full bg-primary-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                                2
                            </div>
                            <h5 className="font-bold text-xs text-gray-900">Pilih Nama Anda</h5>
                            <p className="text-[10px] text-gray-600 mt-1 leading-snug">
                                Pilih nama Anda sekali. HP akan mengingat identitas Anda untuk seterusnya.
                            </p>
                        </div>

                        <div className="p-3 rounded-xl border border-gray-200 bg-white">
                            <div className="h-8 w-8 rounded-full bg-primary-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-2">
                                3
                            </div>
                            <h5 className="font-bold text-xs text-gray-900">Pilih Barang & Selesai</h5>
                            <p className="text-[10px] text-gray-600 mt-1 leading-snug">
                                Tap barang yang diambil, tentukan jumlah, lalu tekan Konfirmasi.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Kepatuhan */}
                <div className="mt-8 pt-4 border-t-2 border-black flex items-center justify-between text-[10px] text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        <span>Sesuai Standar Akuntabilitas Penatausahaan BMD — Permendagri No. 47 Tahun 2021</span>
                    </div>
                    <span className="italic">
                        Dikeluarkan oleh Pengurus Barang Pengguna
                    </span>
                </div>

            </div>
        </div>
    )
}
