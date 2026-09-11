/**
 * Utility untuk hashing password menggunakan Web Crypto API (SHA-256).
 * Digunakan untuk perbandingan password di client-side karena aplikasi
 * ini belum memiliki backend. Ini LEBIH AMAN daripada plaintext,
 * namun solusi ideal tetap backend + bcrypt/Argon2.
 */

/**
 * Mengubah password menjadi hash SHA-256 dalam format hex string.
 * @param {string} password - Password asli
 * @returns {Promise<string>} - Hash hex string
 */
export async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Membandingkan password input dengan hash yang tersimpan.
 * @param {string} inputPassword - Password yang dimasukkan user
 * @param {string} storedHash - Hash yang tersimpan
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(inputPassword, storedHash) {
    const inputHash = await hashPassword(inputPassword)
    return inputHash === storedHash
}
