import { useState } from "react"
import { Button } from "../components/ui/Button"
import { updateUserPasswordHash, getUserByEmail } from "../data/users"
import { hashPassword, verifyPassword } from "../lib/crypto"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/Card"
import { User, Lock, Eye, EyeOff } from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../context/UserContext"

export default function Settings() {
    const { user, updateUser } = useUser()
    const [activeTab, setActiveTab] = useState("profile")
    const [displayName, setDisplayName] = useState(user.name)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Lock },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-secondary-900">Settings</h2>
                <p className="text-secondary-500">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary-100",
                                    activeTab === tab.id ? "bg-secondary-100 text-primary-600" : "text-secondary-900"
                                )}
                            >
                                <tab.icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 lg:max-w-2xl">
                    {activeTab === "profile" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700">Display Name</label>
                                    <Input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700">Email</label>
                                    <Input defaultValue={user.email} disabled />
                                    <p className="text-[0.8rem] text-secondary-500">Contact IT to change your email.</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    disabled={displayName === user.name}
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {activeTab === "security" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {securityMessage.text && (
                                    <div className={`px-3 py-2 rounded-md text-sm ${securityMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {securityMessage.text}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none text-secondary-700">Current Password</label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 focus:outline-none"
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
                                    <label className="text-sm font-medium leading-none text-secondary-700">New Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 focus:outline-none"
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
                                    <label className="text-sm font-medium leading-none text-secondary-700">Confirm Password <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-700 focus:outline-none"
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
                                <Button onClick={handleUpdatePassword}>Update Password</Button>
                            </CardFooter>
                        </Card>
                    )}


                </div>
            </div>
        </div>
    )
}
