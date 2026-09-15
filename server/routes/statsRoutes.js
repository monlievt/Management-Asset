// server/routes/statsRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/**
 * GET /api/stats/dashboard
 * Ringkasan statistik eksekutif untuk Dasbor Utama SIM-TIK
 */
router.get('/dashboard', (req, res) => {
    try {
        const totalAssets = db.prepare('SELECT COUNT(*) as c FROM assets').get().c;
        const totalValue = db.prepare('SELECT SUM(harga) as s FROM assets').get().s || 0;
        
        const inUse = db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'In Use'").get().c;
        const available = db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'Available'").get().c;
        const maintenance = db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'Maintenance'").get().c;
        const damaged = db.prepare("SELECT COUNT(*) as c FROM assets WHERE status = 'Damaged'").get().c;

        const categoryBreakdown = db.prepare(`
            SELECT category, COUNT(*) as count, SUM(harga) as totalValue
            FROM assets
            GROUP BY category
            ORDER BY count DESC
        `).all();

        const roomBreakdown = db.prepare(`
            SELECT lokasi as room, COUNT(*) as count
            FROM assets
            WHERE lokasi IS NOT NULL AND lokasi != ''
            GROUP BY lokasi
            ORDER BY count DESC
        `).all();

        const recentAudits = db.prepare(`
            SELECT id, timestamp, user_name as userName, action, entity, details_json
            FROM audit_logs
            ORDER BY id DESC LIMIT 5
        `).all();

        return res.json({
            success: true,
            data: {
                totalAssets,
                totalValue,
                statusCounts: {
                    inUse,
                    available,
                    maintenance,
                    damaged
                },
                categoryBreakdown,
                roomBreakdown,
                recentActivities: recentAudits
            }
        });
    } catch (err) {
        console.error('[GET_STATS_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat statistik dasbor.' });
    }
});

export default router;
