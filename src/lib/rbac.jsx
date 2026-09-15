/**
 * Role-Based Access Control (RBAC) untuk SIM-TIK.
 *
 * Role yang tersedia:
 * - admin  : Akses penuh (CRUD semua modul, Settings)
 * - staff  : Bisa melihat dan input data, tidak bisa hapus
 * - leader : Hanya bisa melihat dashboard dan laporan (read-only)
 */

import { useUser } from "../context/UserContext"

/**
 * Definisi hak akses per role.
 * Tambahkan permission baru di sini sesuai kebutuhan.
 */
const ROLE_PERMISSIONS = {
    superadmin: [
        "dashboard.view",
        "assets.view", "assets.create", "assets.edit", "assets.delete",
        "devices.view", "devices.create", "devices.edit", "devices.delete",
        "atk.view", "atk.create", "atk.edit", "atk.delete",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit", "helpdesk.delete",
        "employees.view", "employees.create", "employees.edit", "employees.delete",
        "audit.view",
        "settings.view", "settings.edit",
    ],
    admin: [
        "dashboard.view",
        "assets.view", "assets.create", "assets.edit", "assets.delete",
        "devices.view", "devices.create", "devices.edit", "devices.delete",
        "atk.view", "atk.create", "atk.edit", "atk.delete",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit", "helpdesk.delete",
        "employees.view", "employees.create", "employees.edit", "employees.delete",
        "audit.view",
        "settings.view", "settings.edit",
    ],
    pengurus_barang: [
        "dashboard.view",
        "assets.view", "assets.create", "assets.edit", "assets.delete",
        "devices.view", "devices.create", "devices.edit", "devices.delete",
        "atk.view", "atk.create", "atk.edit", "atk.delete",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit", "helpdesk.delete",
        "employees.view", "employees.create", "employees.edit",
        "audit.view",
        "settings.view", "settings.edit",
    ],
    staff: [
        "dashboard.view",
        "assets.view", "assets.create", "assets.edit",
        "devices.view", "devices.create", "devices.edit",
        "atk.view", "atk.create", "atk.edit",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit",
        "employees.view", "employees.create", "employees.edit",
        "audit.view",
        "settings.view",
    ],
    auditor: [
        "dashboard.view",
        "assets.view",
        "devices.view",
        "atk.view",
        "helpdesk.view",
        "employees.view",
        "audit.view",
    ],
    p2upd: [
        "dashboard.view",
        "assets.view",
        "devices.view",
        "atk.view",
        "helpdesk.view",
        "employees.view",
        "audit.view",
    ],
    teknisi: [
        "dashboard.view",
        "assets.view",
        "devices.view", "devices.edit",
        "atk.view",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit",
        "employees.view",
    ],
    leader: [
        "dashboard.view",
        "assets.view",
        "devices.view",
        "atk.view",
        "helpdesk.view",
        "employees.view",
        "audit.view",
    ],
    user: [
        "dashboard.view",
        "assets.view",
        "devices.view",
        "helpdesk.view", "helpdesk.create",
        "employees.view",
    ]
}

/**
 * Hook untuk mengecek apakah user saat ini memiliki permission tertentu.
 */
export function usePermission(permission) {
    const { user } = useUser()
    const role = (user?.role || "admin").toLowerCase()
    if (role === "superadmin") return true // superadmin selalu memiliki izin penuh
    const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS["admin"] || []
    return permissions.includes(permission)
}

/**
 * Komponen pembungkus untuk menampilkan children hanya jika user punya permission.
 */
export function CanDo({ permission, children, fallback = null }) {
    const hasPermission = usePermission(permission)
    return hasPermission ? children : fallback
}

/**
 * Daftar route yang tersedia per role (untuk sidebar visibility).
 */
export const ROLE_ROUTES = {
    superadmin: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/assets/atk/history", "/employees", "/audit-trail", "/helpdesk", "/settings"],
    admin: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/assets/atk/history", "/employees", "/audit-trail", "/helpdesk", "/settings"],
    pengurus_barang: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/assets/atk/history", "/employees", "/audit-trail", "/helpdesk", "/settings"],
    staff: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/assets/atk/history", "/employees", "/audit-trail", "/helpdesk", "/settings"],
    auditor: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/employees", "/audit-trail", "/helpdesk"],
    p2upd: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/employees", "/audit-trail", "/helpdesk"],
    teknisi: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/employees", "/helpdesk"],
    leader: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/employees", "/audit-trail", "/helpdesk"],
    user: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/employees", "/helpdesk"],
}
