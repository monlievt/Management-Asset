// server/auth.js
// Authentication & RBAC middleware for SIM-TIK Inspektorat Trenggalek
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'simtik_dev_secret_key_inspektorat_trenggalek_2026_random_dev_only';
const SESSION_EXPIRES_IN = process.env.SESSION_EXPIRES_IN || '8h';

/**
 * Generate token JWT untuk sesi pengguna
 */
export function signToken(user) {
    return jwt.sign(
        {
            id: user.id,
            nip: user.nip,
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position,
            department: user.department
        },
        JWT_SECRET,
        { expiresIn: SESSION_EXPIRES_IN }
    );
}

/**
 * Verifikasi kata sandi
 */
export function verifyPassword(plainPassword, passwordHash) {
    return bcrypt.compareSync(plainPassword, passwordHash);
}

/**
 * Hash kata sandi baru
 */
export function hashPassword(plainPassword) {
    return bcrypt.hashSync(plainPassword, 10);
}

/**
 * Middleware: Wajib Login (Require Authentication)
 * Membaca token dari Cookie HttpOnly atau Header Authorization: Bearer <token>
 */
export function requireAuth(req, res, next) {
    let token = null;

    if (req.cookies && req.cookies.simtik_token) {
        token = req.cookies.simtik_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Akses ditolak: Silakan masuk (login) terlebih dahulu.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Pastikan user masih aktif di database
        const user = db.prepare('SELECT id, nip, name, email, role, position, department, is_active FROM users WHERE id = ?').get(decoded.id);
        
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Akun Anda tidak aktif atau tidak terdaftar. Hubungi Administrator.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Sesi kedaluwarsa atau token tidak valid. Silakan login kembali.'
        });
    }
}

/**
 * Middleware: Pembatasan Peran (Role-Based Access Control)
 */
export function requireRole(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
        }

        // Superadmin memiliki akses ke seluruh fitur
        if (req.user.role === 'superadmin' || allowedRoles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: `Akses dilarang: Peran Anda (${req.user.role}) tidak memiliki wewenang untuk tindakan ini.`
        });
    };
}
