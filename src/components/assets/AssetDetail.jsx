import { Badge } from "../ui/Badge"
import { Button } from "../ui/Button"

export function AssetDetail({ asset, onClose }) {
    if (!asset) return null

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Available': return 'Tersedia di Gudang'
            case 'In Use': return 'Sedang Digunakan'
            case 'Maintenance': return 'Dalam Perbaikan'
            default: return 'Afkir / Dihapus'
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Nama Aset</h4>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-white">{asset.name}</p>
                </div>
                <div className="col-span-2">
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Status Aset</h4>
                    <Badge className="mt-1" variant={
                        asset.status === 'Available' ? 'success' :
                            asset.status === 'In Use' ? 'default' :
                                asset.status === 'Maintenance' ? 'warning' : 'secondary'
                    }>
                        {getStatusLabel(asset.status)}
                    </Badge>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Kode Barang</h4>
                    <p className="text-sm text-secondary-900 dark:text-white font-mono">{asset.kodeBarang || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Lokasi Ruangan</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.lokasi || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Kondisi Fisik</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.kondisi || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Jenis Barang</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.jenisBarang || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Merek / Brand</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.merk || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Tipe / Model</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.type || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Ukuran</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.ukuran || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Bahan</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.bahan || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Tahun Perolehan</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.tahunBeli || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Harga Perolehan</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.harga ? `Rp ${asset.harga}` : "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Asal Usul</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.asalUsul || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">No. Pabrik</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.noPabrik || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">No. Rangka</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.noRangka || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">No. Mesin</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.noMesin || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">No. Polisi</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.noPolisi || "-"}</p>
                </div>
                <div>
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">No. BPKB</h4>
                    <p className="text-sm text-secondary-900 dark:text-white">{asset.noBpkb || "-"}</p>
                </div>
                <div className="col-span-4">
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Foto Dokumentasi</h4>
                    {asset.foto ? (
                        <div className="mt-1 h-32 w-auto border border-secondary-200 dark:border-secondary-800 rounded overflow-hidden">
                            <img src={asset.foto} alt="Asset" className="h-full w-auto object-contain" />
                        </div>
                    ) : (
                        <p className="text-sm text-secondary-900 dark:text-white">-</p>
                    )}
                </div>
                <div className="col-span-4 border-t border-secondary-100 dark:border-secondary-800 pt-2">
                    <h4 className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Pemegang Aset Saat Ini (Penanggung Jawab)</h4>
                    <p className="text-base font-medium text-secondary-900 dark:text-white">{asset.assignee || "-"}</p>
                </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-secondary-100 dark:border-secondary-800">
                <Button variant="outline" onClick={onClose}>Tutup</Button>
            </div>
        </div>
    )
}
