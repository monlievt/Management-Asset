// server/routes/employeeRoutes.js
// CRUD Router untuk Manajemen Pegawai Inspektorat Kabupaten Trenggalek
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/**
 * Helper: Catat Jejak Audit APIP
 */
function recordAudit(req, action, entityId, targetName, oldData, newData) {
    try {
        const adminNip = req.cookies?.user_nip || '198506142009021004';
        const adminName = req.cookies?.user_name || 'NANDITO MONLIEV PASSA,S.Kom';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'SIM-TIK Web Client';

        const insertLog = db.prepare(`
            INSERT INTO audit_logs (
                action_type, entity_type, entity_id, target_name,
                performed_by_nip, performed_by_name, role,
                old_values, new_values, ip_address, user_agent, details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertLog.run(
            action,
            'EMPLOYEE',
            String(entityId),
            targetName,
            adminNip,
            adminName,
            'superadmin',
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            ipAddress,
            userAgent,
            `Aktivitas pegawai: ${action} pada ${targetName}`
        );
    } catch (err) {
        console.warn('[AUDIT_LOG_WARNING]', err.message);
    }
}

/**
 * GET /api/employees
 * Mengambil daftar pegawai (mendukung search dan filter bidang)
 */
router.get('/', (req, res) => {
    try {
        const { search, department } = req.query;

        let query = `
            SELECT id, nip, name, name_without_degree, email, role, position, department, phone,
                   rank, class_grade, birth_place, birth_date, is_active, created_at
            FROM users 
            WHERE is_active = 1
        `;
        const params = [];

        if (search) {
            query += ` AND (name LIKE ? OR nip LIKE ? OR position LIKE ? OR email LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        if (department && department !== 'all') {
            query += ` AND department = ?`;
            params.push(department);
        }

        query += ` ORDER BY name ASC`;

        const rows = db.prepare(query).all(...params);

        const formatted = rows.map((u, idx) => ({
            id: u.id,
            no: idx + 1,
            name: u.name,
            nameWithoutDegree: u.name_without_degree || u.name,
            nip: u.nip || '-',
            phone: u.phone || '-',
            birthPlace: u.birth_place || '-',
            birthDate: u.birth_date || '-',
            rank: u.rank || '-',
            department: u.department || 'SEKRETARIAT',
            classGrade: u.class_grade || '-',
            position: u.position || '-',
            email: u.email || '-',
            role: u.role || 'user'
        }));

        return res.json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (err) {
        console.error('[GET_EMPLOYEES_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat daftar pegawai.' });
    }
});

/**
 * GET /api/employees/:id
 * Mengambil detail 1 pegawai beserta daftar aset dinas yang dipegang
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const employee = db.prepare(`
            SELECT id, nip, name, name_without_degree, email, role, position, department, phone,
                   rank, class_grade, birth_place, birth_date, is_active, created_at
            FROM users 
            WHERE id = ? AND is_active = 1
        `).get(id);

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan.' });
        }

        // Ambil aset yang saat ini dipegang oleh pegawai ini
        const assignedAssets = db.prepare(`
            SELECT id, kode_barang, nup, name, category, merk, type, kondisi, status, lokasi
            FROM assets
            WHERE (current_assignee_id = ? OR assignee_nip = ? OR assignee_name = ?)
              AND status = 'In Use'
        `).all(employee.id, employee.nip, employee.name);

        return res.json({
            success: true,
            data: {
                ...employee,
                assignedAssets,
                totalAssignedAssets: assignedAssets.length
            }
        });
    } catch (err) {
        console.error('[GET_EMPLOYEE_DETAIL_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mengambil detail pegawai.' });
    }
});

/**
 * POST /api/employees
 * Menambah pegawai baru (Create)
 */
router.post('/', (req, res) => {
    try {
        const {
            name, nameWithoutDegree, nip, phone, birthPlace, birthDate,
            rank, department, classGrade, position, email, role = 'user'
        } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama lengkap pegawai wajib diisi.' });
        }

        const cleanNip = nip && nip.trim() !== '' ? nip.trim() : '-';

        // Cek NIP jika bukan '-'
        if (cleanNip !== '-') {
            const existing = db.prepare('SELECT id FROM users WHERE nip = ? AND is_active = 1').get(cleanNip);
            if (existing) {
                return res.status(400).json({ success: false, message: `Pegawai dengan NIP ${cleanNip} sudah terdaftar.` });
            }
        }

        const insert = db.prepare(`
            INSERT INTO users (
                name, name_without_degree, nip, phone, birth_place, birth_date,
                rank, department, class_grade, position, email, role, password_hash, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `);

        // Default hashed password (simtik123)
        const defaultHash = '$2a$10$w8T9Vv4vJ7YwP5iA6L5.8O7g3K2g2f9k7H0t6x1l3q5a8m2b4c6e';

        const info = insert.run(
            name.trim(),
            nameWithoutDegree ? nameWithoutDegree.trim() : name.trim(),
            cleanNip,
            phone ? phone.trim() : '-',
            birthPlace ? birthPlace.trim() : '-',
            birthDate ? birthDate.trim() : '-',
            rank ? rank.trim() : '-',
            department ? department.trim() : 'SEKRETARIAT',
            classGrade ? classGrade.trim() : '-',
            position ? position.trim() : '-',
            email ? email.trim() : '-',
            role,
            defaultHash
        );

        const newId = info.lastInsertRowid;
        const newRecord = { id: newId, name, nip: cleanNip, department, position, email };

        // Catat di Jejak Audit Forensik APIP
        recordAudit(req, 'ADD_EMPLOYEE', newId, name, null, newRecord);

        return res.status(201).json({
            success: true,
            message: 'Pegawai berhasil ditambahkan.',
            data: { id: newId, ...req.body }
        });
    } catch (err) {
        console.error('[ADD_EMPLOYEE_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menambahkan pegawai: ' + err.message });
    }
});

/**
 * PUT /api/employees/:id
 * Memperbarui data pegawai (Update)
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const oldEmployee = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

        if (!oldEmployee) {
            return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan.' });
        }

        const {
            name, nameWithoutDegree, nip, phone, birthPlace, birthDate,
            rank, department, classGrade, position, email, role
        } = req.body;

        const update = db.prepare(`
            UPDATE users SET
                name = COALESCE(?, name),
                name_without_degree = COALESCE(?, name_without_degree),
                nip = COALESCE(?, nip),
                phone = COALESCE(?, phone),
                birth_place = COALESCE(?, birth_place),
                birth_date = COALESCE(?, birth_date),
                rank = COALESCE(?, rank),
                department = COALESCE(?, department),
                class_grade = COALESCE(?, class_grade),
                position = COALESCE(?, position),
                email = COALESCE(?, email),
                role = COALESCE(?, role),
                updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `);

        update.run(
            name ? name.trim() : null,
            nameWithoutDegree ? nameWithoutDegree.trim() : null,
            nip ? nip.trim() : null,
            phone ? phone.trim() : null,
            birthPlace ? birthPlace.trim() : null,
            birthDate ? birthDate.trim() : null,
            rank ? rank.trim() : null,
            department ? department.trim() : null,
            classGrade ? classGrade.trim() : null,
            position ? position.trim() : null,
            email ? email.trim() : null,
            role || null,
            id
        );

        // Jika nama atau NIP berubah, sinkronkan juga nama pemegang di tabel assets
        if (name && name !== oldEmployee.name) {
            db.prepare(`
                UPDATE assets 
                SET assignee_name = ?, assignee_nip = COALESCE(?, assignee_nip), assignee_dept = COALESCE(?, assignee_dept)
                WHERE current_assignee_id = ? OR assignee_nip = ?
            `).run(name.trim(), nip || oldEmployee.nip, department || oldEmployee.department, id, oldEmployee.nip);
        }

        const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

        // Catat di Jejak Audit Forensik APIP
        recordAudit(req, 'UPDATE_EMPLOYEE', id, updated.name, oldEmployee, updated);

        return res.json({
            success: true,
            message: 'Data pegawai berhasil diperbarui.',
            data: updated
        });
    } catch (err) {
        console.error('[UPDATE_EMPLOYEE_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui pegawai: ' + err.message });
    }
});

/**
 * DELETE /api/employees/:id
 * Menghapus/Menonaktifkan pegawai (Delete dengan proteksi aset)
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const employee = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan.' });
        }

        // Cek apakah pegawai sedang memegang aset aktif
        const heldAssets = db.prepare(`
            SELECT id, name, nup, kode_barang
            FROM assets 
            WHERE (current_assignee_id = ? OR assignee_nip = ? OR assignee_name = ?)
              AND status = 'In Use'
        `).all(employee.id, employee.nip, employee.name);

        if (heldAssets.length > 0) {
            const assetNames = heldAssets.map(a => `${a.name} (NUP: ${a.nup})`).join(', ');
            return res.status(400).json({
                success: false,
                message: `Tidak dapat menghapus pegawai. ${employee.name} tercatat sedang memegang ${heldAssets.length} aset inventaris: ${assetNames}. Lakukan mutasi/tarik aset ke gudang terlebih dahulu.`
            });
        }

        // Soft delete (is_active = 0) agar riwayat audit trail tetap utuh
        db.prepare('UPDATE users SET is_active = 0, updated_at = datetime(\'now\', \'localtime\') WHERE id = ?').run(id);

        // Catat di Jejak Audit Forensik APIP
        recordAudit(req, 'DELETE_EMPLOYEE', id, employee.name, employee, { is_active: 0 });

        return res.json({
            success: true,
            message: `Data pegawai ${employee.name} berhasil dihapus.`
        });
    } catch (err) {
        console.error('[DELETE_EMPLOYEE_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menghapus pegawai: ' + err.message });
    }
});

export default router;
