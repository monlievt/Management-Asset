import { useState, useEffect } from "react"
import { getUserByEmail } from "../data/users"
import { verifyPassword } from "../lib/crypto"
import { useNavigate, Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { Lock, Eye, EyeOff } from "lucide-react"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { updateUser } = useUser()

    useEffect(() => {
        const token = sessionStorage.getItem('simtik_auth_token')
        if (token) {
            navigate('/')
        }
    }, [navigate])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const user = getUserByEmail(email)

            if (!user) {
                setError("Email atau password tidak valid.")
                setIsLoading(false)
                return
            }

            // Verifikasi password menggunakan SHA-256 hash comparison
            const isValid = await verifyPassword(password, user.passwordHash)

            if (isValid) {
                // Buat session token unik menggunakan crypto.randomUUID()
                const sessionToken = crypto.randomUUID()

                // Simpan di sessionStorage (bukan localStorage) agar sesi habis saat browser ditutup
                sessionStorage.setItem('simtik_auth_token', sessionToken)

                // Simpan data user publik (tanpa passwordHash) ke sessionStorage
                const { passwordHash, ...publicUser } = user
                sessionStorage.setItem('simtik_user_details', JSON.stringify(publicUser))

                // Update global context
                updateUser(publicUser)

                navigate("/")
            } else {
                setError("Email atau password tidak valid.")
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("Terjadi kesalahan sistem. Silakan coba lagi.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="border-secondary-200 shadow-xl">
            <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 p-3">
                    <Lock className="h-6 w-6 text-primary-600" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight text-secondary-900">
                    Masuk ke Akun Anda
                </CardTitle>
                <p className="text-sm text-secondary-500">
                    Masukkan email dan password untuk mengakses SIM-TIK
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none text-secondary-700" htmlFor="email">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nama@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium leading-none text-secondary-700" htmlFor="password">
                                Password
                            </label>
                            <Link to="/login/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                                Lupa password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 focus:outline-none"
                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                    <Button className="w-full" type="submit" isLoading={isLoading}>
                        Masuk
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="justify-center text-sm text-secondary-500">
                Belum punya akun? Hubungi Admin
            </CardFooter>
        </Card>
    )
}
