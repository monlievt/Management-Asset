import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"
import {
    LayoutDashboard, Monitor, LifeBuoy, Settings, ChevronDown,
    ChevronRight, Layers, Archive, X, Laptop, ShieldCheck, Users,
    Sparkles, ShoppingCart
} from "lucide-react"
import { useState } from "react"
import { ReleaseNotesModal } from "../common/ReleaseNotesModal"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dasbor Utama", href: "/" },
    {
        icon: Monitor,
        label: "Manajemen Aset",
        href: "/assets",
        subItems: [
            { icon: Laptop, label: "Perangkat TIK", href: "/assets/devices" },
            { icon: Layers, label: "Inventaris Umum", href: "/assets/inventory" },
            { icon: Archive, label: "Stok Opname ATK", href: "/assets/atk" },
            { icon: ShoppingCart, label: "Ambil ATK Mandiri", href: "/atk/ambil" },
        ]
    },
    { icon: Users, label: "Manajemen Pegawai", href: "/employees" },
    { icon: ShieldCheck, label: "Jejak Audit APIP", href: "/audit-trail" },
    { icon: LifeBuoy, label: "Layanan Helpdesk", href: "/helpdesk" },
    { icon: Settings, label: "Pengaturan Sistem", href: "/settings" }
]

export function Sidebar({ className, isMobileOpen = false, onCloseMobile = () => {} }) {
    const location = useLocation()
    const [openMenus, setOpenMenus] = useState({ "/assets": true })
    const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false)

    const toggleMenu = (href) => {
        setOpenMenus(prev => ({ ...prev, [href]: !prev[href] }))
    }

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 transition-colors duration-200">
            {/* Header Brand */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-secondary-100 dark:border-secondary-800">
                <Link to="/" className="flex items-center gap-2.5" onClick={onCloseMobile}>
                    <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        ST
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-secondary-900 dark:text-white leading-none">
                            SIM-TIK
                        </h2>
                        <span className="text-[10px] text-secondary-500 font-medium">Manajemen Aset TIK</span>
                    </div>
                </Link>

                {/* Tombol Tutup pada Mobile */}
                <button
                    type="button"
                    onClick={onCloseMobile}
                    className="p-1.5 rounded-lg text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 lg:hidden"
                    aria-label="Tutup Menu"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Menu Navigasi */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-secondary-400 dark:text-secondary-500">
                    Menu Navigasi
                </div>

                {sidebarItems.map((item) => (
                    <div key={item.label}>
                        {item.subItems ? (
                            <div>
                                <button
                                    type="button"
                                    onClick={() => toggleMenu(item.href)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
                                        location.pathname.startsWith(item.href)
                                            ? "bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300"
                                            : "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800/60 hover:text-secondary-900 dark:hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center">
                                        <item.icon className="mr-2.5 h-4 w-4" />
                                        <span>{item.label}</span>
                                    </div>
                                    {openMenus[item.href] ? (
                                        <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                                    )}
                                </button>

                                {openMenus[item.href] && (
                                    <div className="ml-4 mt-1 space-y-1 border-l border-secondary-200 dark:border-secondary-800 pl-3">
                                        {item.subItems.map((subItem) => {
                                            const isActive = location.pathname === subItem.href
                                            return (
                                                <Link
                                                    key={subItem.href}
                                                    to={subItem.href}
                                                    onClick={onCloseMobile}
                                                    className={cn(
                                                        "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                                                        isActive
                                                            ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
                                                            : "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 hover:text-secondary-900 dark:hover:text-white"
                                                    )}
                                                >
                                                    {subItem.icon && <subItem.icon className="mr-2 h-3.5 w-3.5" />}
                                                    <span>{subItem.label}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={item.href}
                                onClick={onCloseMobile}
                                className={cn(
                                    "flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
                                    location.pathname === item.href
                                        ? "bg-primary-600 text-white shadow-sm shadow-primary-600/20"
                                        : "text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800/60 hover:text-secondary-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className="mr-2.5 h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-secondary-100 dark:border-secondary-800">
                <button
                    type="button"
                    onClick={() => setIsReleaseModalOpen(true)}
                    className="w-full text-left p-3 rounded-xl bg-secondary-50 hover:bg-secondary-100 dark:bg-secondary-800/50 dark:hover:bg-secondary-800/80 border border-secondary-200/70 dark:border-secondary-700/60 transition group cursor-pointer"
                    title="Klik untuk melihat Catatan Rilis & Fitur Terbaru"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            SIM-TIK v2.5 Enterprise
                        </p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                            Terupdate
                        </span>
                    </div>
                    <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1 flex items-center justify-between">
                        <span>Lihat Fitur & Rilis</span>
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar (Fixed width) */}
            <aside className={cn("hidden lg:block w-64 h-screen sticky top-0 shrink-0", className)}>
                {sidebarContent}
            </aside>

            {/* Mobile Drawer (Overlay + Slide-out) */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={onCloseMobile}
                    />

                    {/* Drawer container */}
                    <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </div>
                </div>
            )}

            {/* Modal Catatan Rilis Versi Terupdate */}
            <ReleaseNotesModal
                isOpen={isReleaseModalOpen}
                onClose={() => setIsReleaseModalOpen(false)}
            />
        </>
    )
}
