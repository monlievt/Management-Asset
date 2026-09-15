// server/routes/departmentRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Buat tabel departments jika belum ada
db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
`);

/**
 * GET /api/departments
 */
router.get('/', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT d.id, d.code, d.name, d.description,
                   COUNT(u.id) as employeeCount
            FROM departments d
            LEFT JOIN users u ON UPPER(TRIM(u.department)) = UPPER(TRIM(d.name)) AND u.is_active = 1
            GROUP BY d.id
            ORDER BY d.code ASC
        `).all();
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error('[GET_DEPTS_ERR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat unit kerja.' });
    }
});

/**
 * POST /api/departments
 */
router.post('/', (req, res) => {
    try {
        const { id, code, name, description } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama unit kerja wajib diisi.' });
        }

        const deptId = id || `dept-${Date.now()}`;
        const deptCode = code ? code.trim().toUpperCase() : `D-${Date.now().toString().slice(-3)}`;

        db.prepare(`
            INSERT INTO departments (id, code, name, description)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(name) DO UPDATE SET
                code = excluded.code,
                description = excluded.description
        `).run(deptId, deptCode, name.trim(), description || '');

        return res.status(201).json({ success: true, message: 'Unit kerja berhasil disimpan.' });
    } catch (err) {
        console.error('[POST_DEPT_ERR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menambah unit kerja: ' + err.message });
    }
});

/**
 * PUT /api/departments/:id
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, oldName } = req.body;

        db.prepare(`
            UPDATE departments SET
                name = COALESCE(?, name),
                code = COALESCE(?, code),
                description = COALESCE(?, description)
            WHERE id = ?
        `).run(name ? name.trim() : null, code ? code.trim().toUpperCase() : null, description, id);

        // Jika nama berubah, update di tabel users
        if (name && oldName && name.trim() !== oldName.trim()) {
            db.prepare(`
                UPDATE users SET department = ? WHERE UPPER(TRIM(department)) = UPPER(TRIM(?))
            `).run(name.trim(), oldName.trim());
        }

        return res.json({ success: true, message: 'Unit kerja berhasil diperbarui.' });
    } catch (err) {
        console.error('[PUT_DEPT_ERR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mengubah unit kerja: ' + err.message });
    }
});

/**
 * DELETE /api/departments/:id
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dept = db.prepare('SELECT name FROM departments WHERE id = ?').get(id);

        if (dept) {
            const count = db.prepare('SELECT COUNT(*) as c FROM users WHERE UPPER(TRIM(department)) = UPPER(TRIM(?)) AND is_active = 1').get(dept.name).c;
            if (count > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Tidak dapat menghapus. Masih ada ${count} pegawai di unit kerja ini.`
                });
            }
        }

        db.prepare('DELETE FROM departments WHERE id = ?').run(id);
        return res.json({ success: true, message: 'Unit kerja berhasil dihapus.' });
    } catch (err) {
        console.error('[DEL_DEPT_ERR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menghapus unit kerja.' });
    }
});

export default router;
