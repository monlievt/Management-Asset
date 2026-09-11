import { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Bell, User, LogOut, Settings, ChevronDown, Sun, Moon, Menu } from "lucide-react"
import { Button } from "../ui/Button"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"

export function Header({ onToggleMobileSidebar }) {
    const { user } = useUser()
    const { theme, toggleTheme } = useTheme()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    const handleLogout = () => {
        sessionStorage.removeItem('simtik_auth_token')
        sessionStorage.removeItem('simtik_user_details')
        navigate('/login')
    }

    // Menutup dropdown saat klik di luar area
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className="flex h-16 items-center justify-between border-b border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 px-4 sm:px-6 transition-colors duration-200">
            {/* Bagian Kiri: Tombol Hamburger Mobile & Judul */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onToggleMobileSidebar}
                    className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden focus:outline-none"
                    aria-label="Buka Menu"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div>
                    <h1 className="text-base sm:text-lg font-bold text-secondary-900 dark:text-white tracking-tight">
                        SIM-TIK
                    </h1>
                    <p className="text-[11px] text-secondary-500 dark:text-secondary-400 hidden sm:block">
                        Sistem Informasi Manajemen Aset & Logistik
                    </p>
                </div>
            </div>

            {/* Bagian Kanan: Dark Mode Toggle, Notifikasi, Profil User */}
            <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Tombol Toggle Dark / Light Mode */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none transition-colors"
                    title={theme === "dark" ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5 text-amber-400 hover:rotate-45 transition-transform" />
                    ) : (
                        <Moon className="h-5 w-5 text-secondary-600 hover:-rotate-12 transition-transform" />
                    )}
                </button>

                {/* Notifikasi */}
                <button
                    type="button"
                    className="p-2 rounded-lg text-secondary-500 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:outline-none relative"
                    title="Notifikasi Sistem"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-secondary-900" />
                </button>

                {/* Profil Pengguna */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 focus:outline-none p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-bold text-xs">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-xs font-semibold text-secondary-800 dark:text-secondary-100 truncate max-w-[120px]">
                                {user?.name || "Administrator"}
                            </p>
                            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 capitalize">
                                {user?.role || "Admin"}
                            </p>
                        </div>
                        <ChevronDown className={`h-3.5 w-3.5 text-secondary-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-secondary-900 py-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-secondary-100 dark:border-secondary-800 z-50">
                            <div className="px-4 py-2 border-b border-secondary-100 dark:border-secondary-800">
                                <p className="text-xs font-semibold text-secondary-900 dark:text-white">{user?.name}</p>
                                <p className="text-[11px] text-secondary-500 truncate">{user?.email || "admin@dinas.go.id"}</p>
                            </div>

                            <Link
                                to="/settings"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex w-full items-center px-4 py-2.5 text-xs text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                            >
                                <Settings className="mr-2.5 h-4 w-4 text-secondary-400" />
                                Pengaturan Profil
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border-t border-secondary-100 dark:border-secondary-800 mt-1"
                            >
                                <LogOut className="mr-2.5 h-4 w-4" />
                                Keluar dari Sistem
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
