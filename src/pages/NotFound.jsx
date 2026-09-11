import { Link } from "react-router-dom"
import { Home, AlertTriangle } from "lucide-react"
import { Button } from "../components/ui/Button"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-secondary-900">404</h1>
                    <h2 className="text-2xl font-semibold text-secondary-700">Halaman Tidak Ditemukan</h2>
                    <p className="text-secondary-500">
                        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
                    </p>
                </div>
                <Link to="/">
                    <Button className="inline-flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Kembali ke Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    )
}
