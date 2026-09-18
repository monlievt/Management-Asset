import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        setIsLoading(true)
        // Fitur reset password via email belum diaktifkan.
        // Tampilkan instruksi untuk menghubungi admin.
        setTimeout(() => {
            setIsSubmitted(true)
            setIsLoading(false)
        }, 500)
    }

    return (
        <Card className="border-secondary-200 shadow-xl w-full max-w-sm">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 p-3">
                    {isSubmitted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                        <Mail className="h-6 w-6 text-primary-600" />
                    )}
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-secondary-900">
                    {isSubmitted ? "Periksa Email Anda" : "Lupa Kata Sandi?"}
                </CardTitle>
                <p className="text-sm text-secondary-500">
                    {isSubmitted
                        ? "Petunjuk pemulihan akses telah dikirimkan ke alamat email kedinasan Anda."
                        : "Masukkan alamat email kedinasan Anda untuk memproses pemulihan kata sandi akun SIM-TIK."}
                </p>
            </CardHeader>
            <CardContent>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none text-secondary-700" htmlFor="email">
                                Alamat Email Kedinasan
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="pegawai@inspektorat.trenggalekkab.go.id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" type="submit" isLoading={isLoading}>
                            Kirim Tautan Pemulihan
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-secondary-700 font-medium">
                            Fitur reset kata sandi otomatis via email belum diaktifkan.
                        </p>
                        <p className="text-sm text-secondary-600">
                            Silakan hubungi <strong>Administrator TIK / Subbagian Umum</strong> untuk mereset kata sandi akun Anda.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-left text-sm text-blue-800">
                            <p className="font-medium mb-1">Alur pemulihan kata sandi:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Hubungi Petugas TIK / Pengelola Barang</li>
                                <li>Verifikasi identitas dan NIP Anda</li>
                                <li>Gunakan kata sandi sementara yang diterbitkan</li>
                                <li>Ubah kata sandi pada menu Pengaturan Akun setelah berhasil masuk</li>
                            </ol>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Kembali
                        </Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="justify-center">
                <Link to="/login" className="flex items-center text-sm font-medium text-secondary-600 hover:text-secondary-900">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Halaman Masuk
                </Link>
            </CardFooter>
        </Card>
    )
}
