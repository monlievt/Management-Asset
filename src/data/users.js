/**
 * Data pengguna sistem SIM-TIK.
 * 
 * CATATAN KEAMANAN:
 * - Password disimpan sebagai hash SHA-256, bukan plaintext.
 * - Untuk menghasilkan hash baru: node -e "const c=require('crypto'); console.log(c.createHash('sha256').update('PASSWORD_BARU').digest('hex'))"
 * - Solusi ideal untuk produksi: pindahkan ke backend API + bcrypt/Argon2.
 * 
 * Hash default untuk password "inspektorat":
 * 2c4d8b56524823ce9de11579da843cef0b4bb40f013ca22cb9d4407a94ad1e0d
 */

const USERS_STORAGE_KEY = 'simtik_users_db'

// Password disimpan sebagai SHA-256 hash (bukan plaintext)
export const MOCK_USERS = [
    {
        email: "admin@inspektorat.example.com",
        name: "Admin Inspektorat",
        role: "admin",
        // hash dari: "inspektorat"
        passwordHash: "2c4d8b56524823ce9de11579da843cef0b4bb40f013ca22cb9d4407a94ad1e0d"
    },
    {
        email: "staff@inspektorat.example.com",
        name: "Staff Inspektorat",
        role: "staff",
        passwordHash: "2c4d8b56524823ce9de11579da843cef0b4bb40f013ca22cb9d4407a94ad1e0d"
    },
    {
        email: "pimpinan@inspektorat.example.com",
        name: "Pimpinan",
        role: "leader",
        passwordHash: "2c4d8b56524823ce9de11579da843cef0b4bb40f013ca22cb9d4407a94ad1e0d"
    },
    {
        email: "fryzamashuri@gmail.com",
        name: "Fryza Mashuri",
        role: "admin",
        passwordHash: "2c4d8b56524823ce9de11579da843cef0b4bb40f013ca22cb9d4407a94ad1e0d"
    },
    {
        email: "inspektorat.trenggalek@gmail.com",
        name: "Inspektorat Trenggalek",
        role: "admin",
        passwordHash: "2c4d8b56524823ce9de11579da843cef0b4bb40f013ca22cb9d4407a94ad1e0d"
    }
]

// Initialize users in localStorage jika belum ada
const initializeUsers = () => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (!stored) {
        // Simpan versi tanpa passwordHash untuk keamanan di localStorage
        const publicUsers = MOCK_USERS.map(({ passwordHash, ...rest }) => ({
            ...rest,
            passwordHash // tetap simpan hash, bukan plaintext
        }))
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(publicUsers))
        return MOCK_USERS
    }

    // Migrasi: jika ada user lama dengan 'password' plaintext, hapus
    const users = JSON.parse(stored)
    const needsMigration = users.some(u => u.password !== undefined)
    if (needsMigration) {
        const migratedUsers = users.map(u => {
            if (u.password !== undefined) {
                // Cari dari MOCK_USERS berdasarkan email
                const mock = MOCK_USERS.find(m => m.email === u.email)
                const { password, ...rest } = u
                return { ...rest, passwordHash: mock?.passwordHash || "" }
            }
            return u
        })
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(migratedUsers))
        return migratedUsers
    }

    return users
}

export const getUserByEmail = (email) => {
    const users = initializeUsers()
    return users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

/**
 * Update hash password user di localStorage.
 * @param {string} email
 * @param {string} newPasswordHash - Hash SHA-256 dari password baru
 */
export const updateUserPasswordHash = (email, newPasswordHash) => {
    const users = initializeUsers()
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase())

    if (userIndex !== -1) {
        users[userIndex].passwordHash = newPasswordHash
        // Bersihkan field 'password' lama jika ada
        delete users[userIndex].password
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
        return true
    }
    return false
}

/**
 * @deprecated Gunakan updateUserPasswordHash
 * Alias untuk backward compatibility sementara selama refactor
 */
export const updateUserPassword = updateUserPasswordHash
