import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { Printer, ArrowLeft, Building2 } from "lucide-react"
import { getAssets, getRooms, calculateDepreciation } from "../data/assetsStore"

export default function KirPrintView() {
    const { roomName } = useParams()
    const [searchParams] = useSearchParams()
    const decodedRoomName = decodeURIComponent(roomName || "")
    const navigate = useNavigate()

    const [roomInfo, setRoomInfo] = useState(null)
    const [roomAssets, setRoomAssets] = useState([])

    useEffect(() => {
        const rooms = getRooms()
        const foundRoom = rooms.find(r => r.name.toLowerCase() === decodedRoomName.toLowerCase()) || {
            name: decodedRoomName || "Seluruh Ruangan",
            id: "R-GEN",
            pic: "Penanggung Jawab Ruangan",
            nip: "-"
        }
        setRoomInfo(foundRoom)

        const allAssets = getAssets()
        const assetsInThisRoom = allAssets.filter(
            a => a.lokasi && a.lokasi.trim().toLowerCase() === decodedRoomName.trim().toLowerCase()
        )
        setRoomAssets(assetsInThisRoom)
    }, [decodedRoomName])

    const handlePrint = () => {
        window.print()
    }

    if (!roomInfo) return null

    return (
        <div className="min-h-screen bg-secondary-100 dark:bg-secondary-950 p-4 sm:p-8">
            {/* Header Tindakan Layar (Disembunyikan saat cetak) */}
            <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button
                    type="button"
                    onClick={() => navigate("/assets/inventory")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Inventaris</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-xs text-secondary-500">
                        Format Resmi Sesuai <strong>Permendagri No. 47 Tahun 2021</strong>
                    </span>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold shadow hover:bg-primary-700 transition"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Lembar KIR Ruangan (A4 Landscape)</span>
                    </button>
                </div>
            </div>

            {/* Lembar Dokumen Fisik KIR (A4 Landscape Standar Permendagri) */}
            <div className="max-w-5xl mx-auto bg-white text-black p-8 sm:p-12 shadow-xl rounded-xl border border-secondary-200 print:border-none print:shadow-none print:p-0 print:m-0">
                {/* Kop Surat Dinas */}
                <div className="text-center border-b-2 border-black pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider m-0">
                        PEMERINTAH DAERAH PROVINSI / KABUPATEN / KOTA
                    </h3>
                    <h2 className="text-base font-black uppercase tracking-wide mt-0.5 mb-0">
                        DINAS KOMUNIKASI, INFORMATIKA, STATISTIK DAN PERSANDIAN
                    </h2>
                    <p className="text-[10px] text-gray-700 mt-0.5 mb-0">
                        Sistem Informasi Manajemen Logistik & Penatausahaan Barang Milik Daerah (SIM-TIK)
                    </p>
                </div>

                {/* Judul Dokumen KIR */}
                <div className="text-center mb-4">
                    <h1 className="text-sm font-black uppercase tracking-wider underline mb-0.5">
                        KARTU INVENTARIS RUANGAN (KIR)
                    </h1>
                    <p className="text-[10px] font-mono text-gray-600">
                        Lampiran Format Penatausahaan BMD - Berdasarkan Permendagri Nomor 47 Tahun 2021
                    </p>
                </div>

                {/* Informasi Ruangan */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs mb-4 bg-gray-50 p-3 rounded border border-gray-300">
                    <div className="flex">
                        <span className="w-36 font-semibold">Satuan Kerja (SKPD)</span>
                        <span>: Dinas Komunikasi dan Informatika</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 font-semibold">Nama Ruangan</span>
                        <span>: <strong className="uppercase">{roomInfo.name}</strong></span>
                    </div>
                    <div className="flex">
                        <span className="w-36 font-semibold">Kode Ruangan</span>
                        <span className="font-mono">: {roomInfo.id || "R-01"}</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 font-semibold">Penanggung Jawab</span>
                        <span>: {roomInfo.pic || "-"} (NIP: {roomInfo.nip || "-"})</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 font-semibold">Tahun Anggaran</span>
                        <span>: {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex">
                        <span className="w-36 font-semibold">Tanggal Pemutakhiran</span>
                        <span>: {new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                    </div>
                </div>

                {/* Tabel Inventaris Barang Milik Daerah (KIB B) */}
                <table className="w-full border-collapse border border-black text-[10px] mb-6">
                    <thead>
                        <tr className="bg-gray-100 font-bold border-b border-black text-center">
                            <th className="border-r border-black p-1.5 w-7">No</th>
                            <th className="border-r border-black p-1.5 w-24">Kode Barang</th>
                            <th className="border-r border-black p-1.5 w-12">NUP</th>
                            <th className="border-r border-black p-1.5">Nama / Jenis Barang</th>
                            <th className="border-r border-black p-1.5">Merk / Tipe</th>
                            <th className="border-r border-black p-1.5">Nomor Pabrik (SN)</th>
                            <th className="border-r border-black p-1.5 w-12">Tahun</th>
                            <th className="border-r border-black p-1.5 w-10">Jml</th>
                            <th className="border-r border-black p-1.5 w-14">Kondisi</th>
                            <th className="border-r border-black p-1.5">Nilai Buku</th>
                            <th className="p-1.5">Pemegang / Ket</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roomAssets.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="text-center py-6 text-gray-500 italic">
                                    Belum ada aset terdata yang dialokasikan di ruangan ini.
                                </td>
                            </tr>
                        ) : (
                            roomAssets.map((asset, index) => {
                                const dep = calculateDepreciation(asset)
                                const bookVal = dep ? `Rp ${dep.currentBookValue.toLocaleString("id-ID")}` : `Rp ${asset.harga || "-"}`
                                return (
                                    <tr key={asset.id} className="border-b border-black">
                                        <td className="border-r border-black p-1.5 text-center">{index + 1}</td>
                                        <td className="border-r border-black p-1.5 font-mono text-[9.5px]">{asset.kodeBarang || "-"}</td>
                                        <td className="border-r border-black p-1.5 font-mono text-center">{asset.nup || "0001"}</td>
                                        <td className="border-r border-black p-1.5 font-semibold">{asset.name}</td>
                                        <td className="border-r border-black p-1.5">{asset.merk || "-"} {asset.type || ""}</td>
                                        <td className="border-r border-black p-1.5 font-mono text-[9px]">{asset.noPabrik || "-"}</td>
                                        <td className="border-r border-black p-1.5 text-center">{asset.tahunBeli || "-"}</td>
                                        <td className="border-r border-black p-1.5 text-center">1 Unit</td>
                                        <td className="border-r border-black p-1.5 text-center font-medium">
                                            {asset.kondisi === "Baik" ? "Baik (B)" : asset.kondisi === "Rusak Ringan" ? "RR" : "RB"}
                                        </td>
                                        <td className="border-r border-black p-1.5 text-right font-medium">{bookVal}</td>
                                        <td className="p-1.5">{asset.assignee && asset.assignee !== "-" ? asset.assignee : "Inventaris Ruangan"}</td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>

                {/* Keterangan Status Kondisi */}
                <p className="text-[9px] text-gray-600 mb-6 italic">
                    * Keterangan Kondisi Barang: <strong>B</strong> = Baik, <strong>RR</strong> = Rusak Ringan (Dapat diperbaiki), <strong>RB</strong> = Rusak Berat (Menunggu Usulan Penghapusan).
                </p>

                {/* Kolom Pengesahan Tanda Tangan Sesuai Regulasi */}
                <div className="grid grid-cols-2 gap-12 text-center text-xs mt-6">
                    <div>
                        <p className="mb-0.5">Mengetahui / Mengesahkan,</p>
                        <p className="font-bold uppercase">Pengurus Barang Pengguna</p>
                        <div className="h-16 flex items-center justify-center text-gray-300 italic text-[10px]">
                            ( Tanda Tangan / Paraf )
                        </div>
                        <p className="font-bold underline uppercase">PENGELOLA ASET & LOGISTIK TIK</p>
                        <p className="text-[10px] text-gray-600">NIP. 198506142009021004</p>
                    </div>

                    <div>
                        <p className="mb-0.5">Ditempatkan di Ruangan,</p>
                        <p className="font-bold uppercase">Penanggung Jawab Ruangan</p>
                        <div className="h-16 flex items-center justify-center text-gray-300 italic text-[10px]">
                            ( Tanda Tangan / Paraf )
                        </div>
                        <p className="font-bold underline uppercase">{roomInfo.pic || "......................................."}</p>
                        <p className="text-[10px] text-gray-600">NIP. {roomInfo.nip || "......................................."}</p>
                    </div>
                </div>

                <div className="text-center text-xs mt-6 pt-3 border-t border-gray-200">
                    <p className="text-[10px] text-gray-500">
                        Dokumen Kartu Inventaris Ruangan (KIR) ini sah dan wajib ditempel pada dinding atau bagian dalam pintu ruangan yang bersangkutan.
                    </p>
                </div>
            </div>
        </div>
    )
}
