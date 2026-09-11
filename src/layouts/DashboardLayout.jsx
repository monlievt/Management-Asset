import { Outlet, useNavigate } from "react-router-dom"
import { Sidebar } from "../components/layout/Sidebar"
import { Header } from "../components/layout/Header"
import { useEffect, useState } from "react"

export default function DashboardLayout() {
    const navigate = useNavigate()
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    useEffect(() => {
        // Cek token di sessionStorage
        const token = sessionStorage.getItem('simtik_auth_token')
        if (!token) {
            navigate('/login')
        }
    }, [navigate])

    return (
        <div className="flex min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100 transition-colors duration-200">
            {/* Sidebar Desktop & Mobile Drawer */}
            <div className="print:hidden">
                <Sidebar
                    isMobileOpen={isMobileSidebarOpen}
                    onCloseMobile={() => setIsMobileSidebarOpen(false)}
                />
            </div>

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="print:hidden">
                    <Header
                        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
                    />
                </div>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto print:p-0 print:overflow-visible">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
