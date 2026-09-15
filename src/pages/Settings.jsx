import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { updateUserPasswordHash, getUserByEmail } from "../data/users"
import { hashPassword, verifyPassword } from "../lib/crypto"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card"
import { User, Lock, Eye, EyeOff, Database } from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../context/UserContext"
import { usePermission } from "../lib/rbac"
import { MasterDataSettings } from "../components/settings/MasterDataSettings"

export default function Settings() {
    const { user, updateUser } = useUser()
    const [searchParams, setSearchParams] = useSearchParams()
    const canManageMaster = usePermission("settings.edit")

    const tabParam = searchParams.get("tab")
    const subParam = searchParams.get("sub") || "departments"

    const [activeTab, setActiveTab] = useState(
        tabParam === "master" && canManageMaster ? "master" : (tabParam || "profile")
    )
    const [displayName, setDisplayName] = useState(user.name)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        if (tabParam === "master" && canManageMaster) {
            setActiveTab("master")
        } else if (tabParam && tabParam !== "master") {
            setActiveTab(tabParam)
        }
    }, [tabParam, canManageMaster])

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" })

    const handleUpdatePassword = async () => {
        setSecurityMessage({ type: "", text: "" })

        if (!currentPassword || !newPassword || !confirmPassword) {
            setSecurityMessage({ type: "error", text: "Semua field wajib diisi." })
            return
        }

        if (newPassword.length < 8) {
            setSecurityMessage({ type: "error", text: "Password baru minimal 8 karakter." })
            return
        }

        if (newPassword !== confirmPassword) {
            setSecurityMessage({ type: "error", text: "Password baru dan konfirmasi tidak cocok." })
            return
        }

        // Validasi password lama menggunakan hash comparison
        const userRecord = getUserByEmail(user.email)
        if (!userRecord) {
            setSecurityMessage({ type: "error", text: "Sesi tidak valid. Silakan login ulang." })
            return
        }

        const isCurrentValid = await verifyPassword(currentPassword, userRecord.passwordHash)
        if (!isCurrentValid) {
            setSecurityMessage({ type: "error", text: "Password lama tidak benar." })
            return
        }

        // Hash password baru sebelum disimpan
        const newHash = await hashPassword(newPassword)
        const success = updateUserPasswordHash(user.email, newHash)

        if (success) {
            setSecurityMessage({ type: "success", text: "Password berhasil diubah. Gunakan password baru saat login berikutnya." })
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } else {
            setSecurityMessage({ type: "error", text: "Gagal mengubah password. Coba lagi." })
        }
    }

    const handleSave = () => {
        updateUser({ name: displayName })
    }

    const tabs = [
        { id: "profile", label: "Profil Pengguna", icon: User },
        { id: "security", label: "Keamanan & Kata Sandi", icon: Lock },
        ...(canManageMaster ? [{ id: "master", label: "Data Master Sistem", icon: Database }] : [])
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
                    {activeTab === "master" ? "Pusat Data Master Sistem" : "Pengaturan Akun"}
                </h2>
                <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    {activeTab === "master"
                        ? "Kelola data referensi Unit Kerja, Master Ruangan Dinas (KIR), Kategori Aset, dan Pejabat Penandatangan Dokumen."
                        : "Kelola identitas profil, email, dan keamanan akses kata sandi SIM-TIK."}
                </p>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
                <aside className="-mx-4 lg:w-56 shrink-0">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                    if (tab.id === "master") {
                                        setSearchParams({ tab: "master", sub: subParam })
                                    } else {
                                        setSearchParams({ tab: tab.id })
                                    }
                                }}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
                                    activeTab === tab.id
                                        ? "bg-secondary-100 text-primary-600 dark:bg-secondary-800 dark:text-primary-400 font-semibold shadow-xs"
                                        : "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800/60 hover:text-secondary-900 dark:hover:text-white"
                                )}
                            >
                                <tab.icon className="mr-2.5 h-4 w-4 shrink-0" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className={cn("flex-1 min-w-0", activeTab === "master" ? "w-full" : "lg:max-w-2xl")}>
                    {activeTab === "profile" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Identitas Pegawai</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700 dark:text-secondary-300">Nama Lengkap & Gelar</label>
                                    <Input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700 dark:text-secondary-300">Alamat Email Kedinasan</label>
                                    <Input defaultValue={user.email} disabled className="opacity-70 cursor-not-allowed" />
                                    <p className="text-[0.8rem] text-secondary-500 dark:text-secondary-400">Hubungi Administrator TIK untuk mengubah email terdaftar.</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    disabled={displayName === user.name}
                                    onClick={handleSave}
                                >
                                    Simpan Perubahan
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Keamanan & Perubahan Kata Sandi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {securityMessage.text && (
                                    <div className={`px-3 py-2 rounded-md text-sm ${securityMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300' : 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-300'}`}>
                                        {securityMessage.text}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700 dark:text-secondary-300">Kata Sandi Saat Ini</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Masukkan kata sandi lama..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 focus:outline-none"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700 dark:text-secondary-300">Kata Sandi Baru <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimal 8 karakter..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 focus:outline-none"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700 dark:text-secondary-300">Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi kata sandi baru..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 focus:outline-none"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleUpdatePassword}>Perbarui Kata Sandi</Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "master" && canManageMaster && (
                        <MasterDataSettings initialSubTab={subParam} />
                    )}
                </div>
            </div>
        </div>
    )
}
