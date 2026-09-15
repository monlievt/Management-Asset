import { X } from "lucide-react"
import { Button } from "../ui/Button"

export function DeviceDetail({ asset, onClose }) {
    if (!asset) return null

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Available':
                return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Tersedia di Gudang</span>
            case 'In Use':
                return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Sedang Digunakan</span>
            case 'Maintenance':
                return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Dalam Perbaikan</span>
            default:
                return <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-300">Afkir / Dihapus</span>
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div>
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Nama Perangkat</h4>
                    <p className="text-lg font-semibold text-secondary-900 dark:text-white">{asset.name}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Kategori</h4>
                    <p className="text-base text-secondary-900 dark:text-white">{asset.category}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Merek / Brand</h4>
                    <p className="text-base text-secondary-900 dark:text-white">{asset.brand}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Nomor Seri / Serial Number</h4>
                    <p className="text-base text-secondary-900 dark:text-white font-mono">{asset.serial}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Tanggal Pengadaan</h4>
                    <p className="text-base text-secondary-900 dark:text-white">{asset.purchaseDate}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Status Perangkat</h4>
                    <div className="mt-1">
                        {getStatusBadge(asset.status)}
                    </div>
                </div>
                <div className="col-span-2">
                    <h4 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Pegawai Penanggung Jawab</h4>
                    <p className="text-base font-medium text-secondary-900 dark:text-white">{asset.assignee || "-"}</p>
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-secondary-100 dark:border-secondary-800">
                <Button variant="outline" onClick={onClose}>Tutup</Button>
            </div>
        </div>
    )
}
