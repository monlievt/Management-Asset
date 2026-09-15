// server/routes/authRoutes.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import { db, recordAuditLog } from '../database.js';
import { signToken, verifyPassword, hashPassword, requireAuth } from '../auth.js';

const router = express.Router();

// Rate limiter khusus endpoint login untuk mencegah serangan Brute-Force (AGENTS.md)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10, // Maksimal 10 percobaan per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Terlalu banyak percobaan masuk yang gagal. Harap tunggu 15 menit sebelum mencoba kembali.'
    }
});

/**
 * POST /api/auth/login
 * Masuk ke sistem dengan Email atau NIP dan Kata Sandi
 */
router.post('/login', loginLimiter, (req, res) => {
    try {
        const { username, password } = req.body; // username bisa email atau NIP
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Silakan masukkan Email/NIP dan Kata Sandi.'
            });
        }

        // Cari berdasarkan email atau NIP
        const user = db.prepare(`
            SELECT * FROM users 
            WHERE (email = ? OR nip = ?) AND is_active = 1
        `).get(username.trim().toLowerCase(), username.trim());

        if (!user || !verifyPassword(password, user.password_hash)) {
            // Catat upaya login gagal di audit log
            recordAuditLog({
                userName: username,
                action: 'LOGIN_FAILED',
                entity: 'AUTH',
                ip,
                userAgent: req.headers['user-agent'],
                details: { reason: 'Email/NIP atau Kata Sandi Salah' }
            });

            return res.status(401).json({
                success: false,
                message: 'Email/NIP atau Kata Sandi yang Anda masukkan salah.'
            });
        }

        // Buat token JWT
        const token = signToken(user);

        // Simpan di HttpOnly Cookie (AGENTS.md requirement)
        res.cookie('simtik_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 8 * 60 * 60 * 1000 // 8 jam
        });

        // Catat jejak audit login berhasil
        recordAuditLog({
            userId: user.id,
            userName: user.name,
            userNip: user.nip,
            role: user.role,
            action: 'LOGIN_SUCCESS',
            entity: 'AUTH',
            ip,
            userAgent: req.headers['user-agent'],
            details: { email: user.email, role: user.role }
        });

        const { password_hash, ...safeUser } = user;

        return res.json({
            success: true,
            message: `Selamat datang kembali, ${user.name}!`,
            token,
            user: safeUser
        });
    } catch (err) {
        console.error('[AUTH_LOGIN_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server saat autentikasi.' });
    }
});

/**
 * POST /api/auth/logout
 * Keluar dari sistem dan bersihkan sesi
 */
router.post('/logout', (req, res) => {
    try {
        const token = req.cookies?.simtik_token;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        res.clearCookie('simtik_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        if (req.user) {
            recordAuditLog({
                userId: req.user.id,
                userName: req.user.name,
                userNip: req.user.nip,
                role: req.user.role,
                action: 'LOGOUT',
                entity: 'AUTH',
                ip,
                userAgent: req.headers['user-agent']
            });
        }

        return res.json({ success: true, message: 'Anda telah berhasil keluar dari sistem.' });
    } catch (err) {
        return res.json({ success: true, message: 'Logout berhasil.' });
    }
});

/**
 * GET /api/auth/me
 * Periksa identitas pengguna yang sedang aktif
 */
router.get('/me', requireAuth, (req, res) => {
    const user = db.prepare('SELECT id, nip, name, email, role, position, department, phone, is_active FROM users WHERE id = ?').get(req.user.id);
    return res.json({ success: true, user });
});

/**
 * PUT /api/auth/profile
 * Perbarui profil dan/atau ubah kata sandi
 */
router.put('/profile', requireAuth, (req, res) => {
    try {
        const { name, phone, oldPassword, newPassword } = req.body;
        const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

        if (newPassword) {
            if (!oldPassword || !verifyPassword(oldPassword, currentUser.password_hash)) {
                return res.status(400).json({
                    success: false,
                    message: 'Kata sandi lama yang Anda masukkan tidak cocok.'
                });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Kata sandi baru minimal harus 8 karakter.'
                });
            }
            const newHash = hashPassword(newPassword);
            db.prepare('UPDATE users SET password_hash = ?, updated_at = datetime("now", "localtime") WHERE id = ?').run(newHash, req.user.id);
        }

        if (name || phone !== undefined) {
            db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), updated_at = datetime("now", "localtime") WHERE id = ?').run(name || null, phone || null, req.user.id);
        }

        const updated = db.prepare('SELECT id, nip, name, email, role, position, department, phone FROM users WHERE id = ?').get(req.user.id);

        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'UPDATE_PROFILE',
            entity: 'USER',
            entityId: String(req.user.id),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { changedPassword: Boolean(newPassword), updatedName: name }
        });

        return res.json({ success: true, message: 'Profil Anda berhasil diperbarui.', user: updated });
    } catch (err) {
        console.error('[PROFILE_UPDATE_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
    }
});

export default router;
