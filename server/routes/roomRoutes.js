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
 * POST /api/rooms
 * Tambah Master Ruangan Baru
 */
router.post('/', (req, res) => {
    try {
        const { id, name, pic_name, pic_nip, floor } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama ruangan wajib diisi.' });
        }

        const roomId = id ? id.trim().toUpperCase() : `R-${Date.now().toString().slice(-3)}`;

        db.prepare(`
            INSERT INTO rooms (id, name, pic_name, pic_nip, floor)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                pic_name = excluded.pic_name,
                pic_nip = excluded.pic_nip,
                floor = excluded.floor
        `).run(roomId, name.trim(), pic_name ? pic_name.trim() : 'PENANGGUNG JAWAB', pic_nip || '-', floor || 'Lantai 1');

        return res.status(201).json({ success: true, message: 'Ruangan berhasil disimpan.', data: { id: roomId, name, pic_name, pic_nip, floor } });
    } catch (err) {
        console.error('[POST_ROOM_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menambah ruangan: ' + err.message });
    }
});

/**
 * PUT /api/rooms/:id
 * Ubah Master Ruangan
 */
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, pic_name, pic_nip, floor } = req.body;

        db.prepare(`
            UPDATE rooms SET
                name = COALESCE(?, name),
                pic_name = COALESCE(?, pic_name),
                pic_nip = COALESCE(?, pic_nip),
                floor = COALESCE(?, floor)
            WHERE id = ?
        `).run(name ? name.trim() : null, pic_name ? pic_name.trim() : null, pic_nip ? pic_nip.trim() : null, floor || null, id);

        return res.json({ success: true, message: 'Ruangan berhasil diperbarui.' });
    } catch (err) {
        console.error('[PUT_ROOM_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui ruangan.' });
    }
});

/**
 * DELETE /api/rooms/:id
 * Hapus Master Ruangan
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const room = db.prepare('SELECT name FROM rooms WHERE id = ?').get(id);

        if (room) {
            const count = db.prepare('SELECT COUNT(*) as c FROM assets WHERE lokasi = ?').get(room.name).c;
            if (count > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Tidak dapat menghapus. Masih ada ${count} aset di ${room.name}.`
                });
            }
        }

        db.prepare('DELETE FROM rooms WHERE id = ?').run(id);
        return res.json({ success: true, message: 'Ruangan berhasil dihapus.' });
    } catch (err) {
        console.error('[DEL_ROOM_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menghapus ruangan.' });
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
