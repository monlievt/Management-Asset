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
    admin: [
        "dashboard.view",
        "assets.view", "assets.create", "assets.edit", "assets.delete",
        "devices.view", "devices.create", "devices.edit", "devices.delete",
        "atk.view", "atk.create", "atk.edit", "atk.delete",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit", "helpdesk.delete",
        "settings.view", "settings.edit",
    ],
    staff: [
        "dashboard.view",
        "assets.view", "assets.create", "assets.edit",
        "devices.view", "devices.create", "devices.edit",
        "atk.view", "atk.create", "atk.edit",
        "helpdesk.view", "helpdesk.create", "helpdesk.edit",
        "settings.view",
    ],
    leader: [
        "dashboard.view",
        "assets.view",
        "devices.view",
        "atk.view",
        "helpdesk.view",
    ],
}

/**
 * Hook untuk mengecek apakah user saat ini memiliki permission tertentu.
 *
 * @example
 * const canDelete = usePermission("assets.delete")
 * {canDelete && <Button onClick={handleDelete}>Hapus</Button>}
 *
 * @param {string} permission - Nama permission (lihat ROLE_PERMISSIONS)
 * @returns {boolean}
 */
export function usePermission(permission) {
    const { user } = useUser()
    const role = user?.role || "leader" // default ke role paling terbatas
    const permissions = ROLE_PERMISSIONS[role] || []
    return permissions.includes(permission)
}

/**
 * Komponen pembungkus untuk menampilkan children hanya jika user punya permission.
 *
 * @example
 * <CanDo permission="assets.delete">
 *   <Button variant="danger">Hapus</Button>
 * </CanDo>
 */
export function CanDo({ permission, children, fallback = null }) {
    const hasPermission = usePermission(permission)
    return hasPermission ? children : fallback
}

/**
 * Daftar route yang tersedia per role (untuk sidebar visibility).
 */
export const ROLE_ROUTES = {
    admin: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/assets/atk/history", "/helpdesk", "/settings"],
    staff: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/assets/atk/history", "/helpdesk", "/settings"],
    leader: ["/", "/assets/devices", "/assets/inventory", "/assets/atk", "/helpdesk"],
}
