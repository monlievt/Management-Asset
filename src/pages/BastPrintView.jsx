import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Printer, ArrowLeft, ShieldCheck } from "lucide-react"
import { getAssetById } from "../data/assetsStore"
import { getSigners } from "../data/masterDataStore"

export default function BastPrintView() {
    const { assetId, custodyId } = useParams()
    const navigate = useNavigate()
    const [asset, setAsset] = useState(null)
    const [custody, setCustody] = useState(null)
    const [signers, setSigners] = useState(() => getSigners())

    useEffect(() => {
        setSigners(getSigners())
        const foundAsset = getAssetById(assetId)
        if (foundAsset) {
            setAsset(foundAsset)
            const history = foundAsset.custodyHistory || []
            const foundCustody = history.find(c => String(c.id) === String(custodyId)) || history[history.length - 1]
            setCustody(foundCustody)
        }
    }, [assetId, custodyId])

    const handlePrint = () => {
        window.print()
    }

    if (!asset || !custody) {
        return (
            <div className="p-8 text-center text-secondary-600">
                <p>Memuat dokumen BAST...</p>
            </div>
        )
    }

    const todayDateFormatted = new Date(custody.assignedDate || Date.now()).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    })

    return (
        <div className="min-h-screen bg-secondary-100 dark:bg-secondary-950 p-4 sm:p-8">
            {/* Tombol Aksi Layar (Disembunyikan saat cetak) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Detail Aset</span>
                </button>

                <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow hover:bg-primary-700 transition"
                >
                    <Printer className="h-4 w-4" />
                    <span>Cetak Dokumen BAST (PDF)</span>
                </button>
            </div>

            {/* Lembar Dokumen BAST Standar A4 */}
            <div className="max-w-4xl mx-auto bg-white text-black p-10 sm:p-14 shadow-xl rounded-xl border border-secondary-200 print:border-none print:shadow-none print:p-0 print:m-0">
                {/* Kop Dokumen Resmi */}
                <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                    <h3 className="text-sm font-bold tracking-wider uppercase m-0">
                        {signers?.kop?.governmentName || "PEMERINTAH KABUPATEN TRENGGALEK"}
                    </h3>
                    <h2 className="text-lg font-black tracking-wide uppercase mt-1 mb-0">
                        {signers?.kop?.agencyName || "INSPEKTORAT DAERAH"}
                    </h2>
                    <p className="text-xs text-gray-700 mt-1 mb-0">
                        {signers?.kop?.address || "Jl. Brigjen Soetran No. 9, Trenggalek"} {signers?.kop?.phone ? `| Telp: ${signers?.kop?.phone}` : ""}
                    </p>
                </div>

                {/* Judul Surat */}
                <div className="text-center mb-6">
                    <h1 className="text-base font-bold uppercase underline tracking-wider mb-1">
                        BERITA ACARA SERAH TERIMA OPERASIONAL ASET TIK (BAST)
                    </h1>
                    <p className="text-xs font-mono font-medium">
                        Nomor: {custody.bastNumber || `BAST/TIK/${new Date().getFullYear()}/${custody.id}`}
                    </p>
                </div>

                {/* Pembukaan Surat */}
                <p className="text-xs leading-relaxed text-justify mb-4">
                    Pada hari ini, tanggal <strong>{todayDateFormatted}</strong>, bertempat di Kantor {signers?.kop?.agencyName || "Inspektorat Daerah"}, kami yang bertanda tangan di bawah ini:
                </p>

                {/* Pihak Pertama & Kedua */}
                <div className="space-y-3 mb-5 text-xs">
                    <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3 font-semibold">1. Nama Petugas</div>
                        <div className="col-span-9">: <strong>{signers?.pengurus_barang?.name || "ARIS WIDODO, S.Kom"}</strong></div>
                        <div className="col-span-3 font-semibold">   Jabatan</div>
                        <div className="col-span-9">: {signers?.pengurus_barang?.title || "Pengurus Barang Pengguna"}</div>
                        <div className="col-span-3 font-semibold">   NIP</div>
                        <div className="col-span-9">: {signers?.pengurus_barang?.nip || "198506142009021004"}</div>
                        <div className="col-span-12 italic text-gray-600 pl-4">
                            Selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong> (Yang Menyerahkan).
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 pt-2 border-t border-gray-200">
                        <div className="col-span-3 font-semibold">2. Nama Pegawai</div>
                        <div className="col-span-9">: <strong>{custody.employeeName}</strong></div>
                        <div className="col-span-3 font-semibold">   NIP / Identitas</div>
                        <div className="col-span-9">: {custody.nip || "-"}</div>
                        <div className="col-span-3 font-semibold">   Unit Kerja / Bidang</div>
                        <div className="col-span-9">: {custody.department || "-"}</div>
                        <div className="col-span-12 italic text-gray-600 pl-4">
                            Selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong> (Yang Menerima).
                        </div>
                    </div>
                </div>

                {/* Isi Penyerahan Barang */}
                <p className="text-xs leading-relaxed text-justify mb-3">
                    PIHAK PERTAMA telah menyerahkan kepada PIHAK KEDUA, dan PIHAK KEDUA telah menerima dengan baik barang inventaris milik dinas dengan rincian spesifikasi sebagai berikut:
                </p>

                {/* Tabel Spesifikasi Aset */}
                <table className="w-full border-collapse border border-black text-xs mb-5">
                    <tbody>
                        <tr className="border-b border-black bg-gray-100 font-bold">
                            <td className="border-r border-black p-2 w-1/3">Parameter Inventaris</td>
                            <td className="p-2">Keterangan Spesifikasi Fisik</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-black p-2 font-medium">Nama Perangkat</td>
                            <td className="p-2 font-bold">{asset.name}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-black p-2 font-medium">Kode Barang / Register</td>
                            <td className="p-2 font-mono font-semibold">{asset.kodeBarang}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-black p-2 font-medium">Merk / Tipe</td>
                            <td className="p-2">{asset.merk || "-"} / {asset.type || "-"}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-black p-2 font-medium">Nomor Seri (Serial Number)</td>
                            <td className="p-2 font-mono">{asset.noPabrik || "-"}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-black p-2 font-medium">Kondisi Fisik Saat Serah Terima</td>
                            <td className="p-2 font-semibold text-emerald-700">{custody.conditionOnAssign || asset.kondisi || "Baik"}</td>
                        </tr>
                        <tr>
                            <td className="border-r border-black p-2 font-medium">Catatan / Kelengkapan</td>
                            <td className="p-2">{custody.notes || "Unit perangkat lengkap beserta charger dan aksesoris bawaan."}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Klausul Ketentuan */}
                <div className="text-[11px] leading-relaxed text-justify space-y-1.5 mb-8">
                    <p className="font-semibold">Ketentuan Penggunaan & Pemeliharaan:</p>
                    <ol className="list-decimal pl-5 space-y-1 text-gray-800">
                        <li>Barang inventaris ini diserahkan untuk mendukung kelancaran pelaksanaan tugas kedinasan dan tidak diperkenankan untuk dipinjamkan atau dipindahtangankan kepada pihak lain tanpa izin tertulis dari Pengelola Aset.</li>
                        <li>PIHAK KEDUA berkewajiban merawat, menjaga keamanan, dan menggunakan perangkat dengan penuh tanggung jawab sesuai prosedur operasional standar.</li>
                        <li>Apabila terjadi kerusakan atau kendala teknis, PIHAK KEDUA wajib melaporkannya melalui unit Layanan Helpdesk TIK.</li>
                        <li>Apabila pegawai berpindah tugas (mutasi) atau purna tugas (pensiun), barang inventaris wajib diserahkan kembali kepada Pengelola Aset TIK dalam kondisi baik.</li>
                    </ol>
                </div>

                {/* Kolom Tanda Tangan */}
                <div className="grid grid-cols-2 gap-8 text-center text-xs mt-10 pt-4">
                    <div>
                        <p className="mb-1">Yang Menyerahkan,</p>
                        <p className="font-bold uppercase">PIHAK PERTAMA</p>
                        <div className="h-20 flex items-center justify-center text-gray-300 italic">
                            ( Tanda Tangan / Paraf )
                        </div>
                        <p className="font-bold underline uppercase">{signers?.pengurus_barang?.name || "ARIS WIDODO, S.Kom"}</p>
                        <p className="text-[11px] text-gray-600">NIP. {signers?.pengurus_barang?.nip || "198506142009021004"}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{signers?.pengurus_barang?.title || "Pengurus Barang Pengguna"}</p>
                    </div>

                    <div>
                        <p className="mb-1">Yang Menerima,</p>
                        <p className="font-bold uppercase">PIHAK KEDUA</p>
                        <div className="h-20 flex items-center justify-center text-gray-300 italic">
                            ( Tanda Tangan / Paraf )
                        </div>
                        <p className="font-bold underline uppercase">{custody.employeeName}</p>
                        <p className="text-[11px] text-gray-600">NIP. {custody.nip || "......................................."}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{custody.position || custody.department || "Penerima Manfaat"}</p>
                    </div>
                </div>

                {/* Mengetahui Pejabat Berwenang */}
                <div className="text-center text-xs mt-8 pt-4">
                    <p className="mb-1">Mengetahui,</p>
                    <p className="font-bold uppercase">{signers?.kepala_skpd?.title || "Inspektur Kabupaten Trenggalek"}</p>
                    <div className="h-16 flex items-center justify-center text-gray-300 italic">
                        ( Cap Dinas & Tanda Tangan )
                    </div>
                    <p className="font-bold underline uppercase">{signers?.kepala_skpd?.name || "Drs. EKO SUSANTO, M.Si"}</p>
                    <p className="text-[11px] text-gray-600">NIP. {signers?.kepala_skpd?.nip || "196805121994031005"}</p>
                    {signers?.kepala_skpd?.rank && (
                        <p className="text-[10px] text-gray-500">{signers.kepala_skpd.rank}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
