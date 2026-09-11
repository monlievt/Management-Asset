import { useEffect, useState, useRef } from "react"
import QRCode from "qrcode"
import { Printer, Download, QrCode as QrIcon } from "lucide-react"

export function AssetQrCode({ asset }) {
    const [qrDataUrl, setQrDataUrl] = useState("")
    const printAreaRef = useRef(null)

    useEffect(() => {
        if (!asset) return

        // Data yang dikodekan ke QR Code (URL detail atau JSON ringkas)
        const qrPayload = JSON.stringify({
            id: asset.id,
            kode: asset.kodeBarang,
            nup: asset.nup || "0001",
            nama: asset.name,
            sn: asset.noPabrik || "-",
            pemegang: asset.assignee || "-"
        })

        QRCode.toDataURL(qrPayload, {
            width: 250,
            margin: 2,
            color: {
                dark: "#0f172a",
                light: "#ffffff"
            }
        })
            .then(url => setQrDataUrl(url))
            .catch(err => console.error("Error generating QR code:", err))
    }, [asset])

    const handlePrintSticker = () => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const stickerHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Label Stiker Aset - ${asset.kodeBarang}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 10px;
                        display: flex;
                        justify-content: center;
                    }
                    .sticker {
                        width: 75mm;
                        height: 40mm;
                        border: 2px solid #000;
                        border-radius: 6px;
                        padding: 8px;
                        display: flex;
                        box-sizing: border-box;
                        background: #fff;
                    }
                    .qr-section {
                        width: 32mm;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }
                    .qr-section img {
                        width: 28mm;
                        height: 28mm;
                    }
                    .info-section {
                        flex: 1;
                        padding-left: 8px;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        border-left: 1.5px solid #ccc;
                    }
                    .header-title {
                        font-size: 8pt;
                        font-weight: bold;
                        text-transform: uppercase;
                        color: #333;
                    }
                    .asset-name {
                        font-size: 9pt;
                        font-weight: bold;
                        margin: 2px 0;
                        line-height: 1.2;
                    }
                    .meta-row {
                        font-size: 7.5pt;
                        color: #444;
                        margin: 1px 0;
                    }
                    .barcode-label {
                        font-family: monospace;
                        font-size: 8pt;
                        font-weight: bold;
                        background: #eee;
                        padding: 2px 4px;
                        text-align: center;
                        border-radius: 3px;
                    }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                <div class="sticker">
                    <div class="qr-section">
                        <img src="${qrDataUrl}" alt="QR" />
                        <span style="font-size: 6.5pt; color: #666; margin-top: 2px;">SIM-TIK ASSET</span>
                    </div>
                    <div class="info-section">
                        <div>
                            <div class="header-title">INVENTARIS BARANG MILIK NEGARA / DAERAH</div>
                            <div class="barcode-label">${asset.kodeBarang || "TIK-ASSET"} • NUP: ${asset.nup || "0001"}</div>
                            <div class="asset-name">${asset.name}</div>
                        </div>
                        <div>
                            <div class="meta-row"><strong>SN:</strong> ${asset.noPabrik || "-"}</div>
                            <div class="meta-row"><strong>Thn:</strong> ${asset.tahunBeli || "-"} | <strong>Lok:</strong> ${asset.lokasi || "-"}</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `

        printWindow.document.open()
        printWindow.document.write(stickerHtml)
        printWindow.document.close()
    }

    if (!asset) return null

    return (
        <div className="bg-white dark:bg-secondary-800/60 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="bg-white p-3 rounded-xl border border-secondary-200 shadow-sm shrink-0">
                {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code Aset" className="w-40 h-40 object-contain" />
                ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-secondary-400">
                        <QrIcon className="h-10 w-10 animate-pulse" />
                    </div>
                )}
            </div>

            <div className="space-y-3 flex-1 text-center md:text-left">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300">
                        Label Stiker Fisik Terverifikasi
                    </span>
                    <h4 className="text-lg font-bold text-secondary-900 dark:text-white mt-1">
                        {asset.kodeBarang}
                    </h4>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        Pindai QR Code menggunakan kamera ponsel untuk langsung menampilkan identitas dan riwayat pemegang aset di lapangan.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1">
                    <button
                        type="button"
                        onClick={handlePrintSticker}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Stiker Label Aset</span>
                    </button>

                    {qrDataUrl && (
                        <a
                            href={qrDataUrl}
                            download={`QR-${asset.kodeBarang || asset.id}.png`}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition"
                        >
                            <Download className="h-4 w-4" />
                            <span>Unduh File QR</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    )
}
