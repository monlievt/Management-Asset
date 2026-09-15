// server/routes/roomRoutes.js
import express from 'express';
import { db } from '../database.js';

const router = express.Router();

/**
 * GET /api/rooms
 * Daftar seluruh Master Ruangan Dinas (Permendagri 47/2021)
 */
router.get('/', (req, res) => {
    try {
        const rooms = db.prepare('SELECT * FROM rooms ORDER BY id ASC').all();
        return res.json({ success: true, data: rooms });
    } catch (err) {
        console.error('[GET_ROOMS_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat daftar ruangan.' });
    }
});

/**
 * GET /api/rooms/:name/assets
 * Mengambil daftar aset yang ditempatkan di ruangan tertentu untuk lembar cetak KIR
 */
router.get('/:name/assets', (req, res) => {
    try {
        const roomName = decodeURIComponent(req.params.name);
        const roomInfo = db.prepare('SELECT * FROM rooms WHERE name = ?').get(roomName) || {
            name: roomName,
            pic_name: 'PENANGGUNG JAWAB RUANGAN',
            pic_nip: '-'
        };

        const assets = db.prepare(`
            SELECT id, kode_barang as kodeBarang, nup, name, merk, type, no_pabrik as noPabrik,
                   tahun_beli as tahunBeli, kondisi, harga, salvage_value, useful_life_years,
                   purchase_date, assignee_name as assignee, status, lokasi
            FROM assets 
            WHERE lokasi = ?
            ORDER BY nup ASC, kode_barang ASC
        `).all(roomName);

        // Hitung nilai buku per aset
        const assetsWithBookValue = assets.map(a => {
            const cost = Number(a.harga) || 0;
            const salvage = Number(a.salvage_value) || 0;
            const usefulLife = Number(a.useful_life_years) || 4;
            const depreciable = Math.max(0, cost - salvage);
            const monthlyDep = (depreciable / usefulLife) / 12;

            const purchaseDate = a.purchase_date ? new Date(a.purchase_date) : new Date(a.tahunBeli ? `${a.tahunBeli}-01-01` : Date.now());
            const now = new Date();
            const diffMonths = Math.max(0, ((now.getFullYear() - purchaseDate.getFullYear()) * 12) + (now.getMonth() - purchaseDate.getMonth()));
            const accDep = Math.min(depreciable, diffMonths * monthlyDep);
            const bookValue = Math.max(salvage, cost - accDep);

            return {
                ...a,
                bookValue: Math.round(bookValue)
            };
        });

        return res.json({
            success: true,
            room: roomInfo,
            count: assetsWithBookValue.length,
            data: assetsWithBookValue
        });
    } catch (err) {
        console.error('[GET_ROOM_ASSETS_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memuat aset ruangan.' });
    }
});

export default router;
