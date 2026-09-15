// server/routes/auditRoutes.js
// Immutable Forensic Audit Trail for APIP / Inspektorat Kabupaten Trenggalek
import express from 'express';
import { db } from '../database.js';
import { requireAuth, requireRole } from '../auth.js';

const router = express.Router();

/**
 * GET /api/audit-logs
 * Mengambil jejak audit forensik (Hanya untuk Superadmin dan Auditor)
 * CATATAN: Tidak ada rute UPDATE atau DELETE untuk tabel ini (Immutable)
 */
router.get('/', requireAuth, requireRole(['superadmin', 'auditor', 'pengurus_barang']), (req, res) => {
    try {
        const { action, entity, userNip, limit = 100, page = 1 } = req.query;
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }
        if (entity) {
            query += ' AND entity = ?';
            params.push(entity);
        }
        if (userNip) {
            query += ' AND user_nip = ?';
            params.push(userNip);
        }

        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        const parsedLimit = Math.min(500, parseInt(limit, 10) || 100);
        const offset = (Math.max(1, parseInt(page, 10) || 1) - 1) * parsedLimit;
        params.push(parsedLimit, offset);

        const rows = db.prepare(query).all(...params);
        const total = db.prepare('SELECT COUNT(*) as c FROM audit_logs').get().c;

        const parsed = rows.map(r => ({
            id: r.id,
            timestamp: r.timestamp,
            userId: r.user_id,
            userName: r.user_name,
            userNip: r.user_nip,
            role: r.role,
            action: r.action,
            entity: r.entity,
            entityId: r.entity_id,
            ipAddress: r.ip_address,
            userAgent: r.user_agent,
            details: r.details_json ? JSON.parse(r.details_json) : null
        }));

        return res.json({
            success: true,
            total,
            count: parsed.length,
            page: parseInt(page, 10) || 1,
            data: parsed
        });
    } catch (err) {
        console.error('[GET_AUDIT_LOGS_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat log audit.' });
    }
});

export default router;
