// server/routes/employeeRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/**
 * GET /api/employees
 * Mengambil daftar 70 pegawai Inspektorat Kabupaten Trenggalek
 */
router.get('/', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT id, nip, name, email, role, position, department, phone, is_active
            FROM users 
            WHERE is_active = 1
            ORDER BY name ASC
        `).all();

        const names = rows.map(u => u.name);

        return res.json({
            success: true,
            count: rows.length,
            names,
            data: rows
        });
    } catch (err) {
        console.error('[GET_EMPLOYEES_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat daftar pegawai.' });
    }
});

export default router;
