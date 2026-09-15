// server/routes/assetRoutes.js
import express from 'express';
import { db, recordAuditLog } from '../database.js';
import { requireAuth, requireRole } from '../auth.js';

const router = express.Router();

/**
 * Helper: Hitung Penyusutan Garis Lurus (PSAP 07)
 */
function calculateAssetDepreciation(asset) {
    const cost = Number(asset.harga) || 0;
    const salvage = Number(asset.salvage_value) || 0;
    const usefulLife = Number(asset.useful_life_years) || 4;
    const depreciableAmount = Math.max(0, cost - salvage);
    const annualDepreciation = usefulLife > 0 ? depreciableAmount / usefulLife : 0;
    const monthlyDepreciation = annualDepreciation / 12;

    const purchaseDate = asset.purchase_date ? new Date(asset.purchase_date) : new Date(asset.tahun_beli ? `${asset.tahun_beli}-01-01` : Date.now());
    const now = new Date();

    const diffYears = now.getFullYear() - purchaseDate.getFullYear();
    const diffMonths = (diffYears * 12) + (now.getMonth() - purchaseDate.getMonth());
    const monthsElapsed = Math.max(0, diffMonths);
    const totalUsefulMonths = usefulLife * 12;

    const accumulatedDepreciation = Math.min(depreciableAmount, monthsElapsed * monthlyDepreciation);
    const bookValue = Math.max(salvage, cost - accumulatedDepreciation);
    const remainingMonths = Math.max(0, totalUsefulMonths - monthsElapsed);
    const progressPercent = Math.min(100, Math.round((monthsElapsed / totalUsefulMonths) * 100));

    return {
        cost,
        salvage,
        depreciableAmount,
        usefulLifeYears: usefulLife,
        annualDepreciation: Math.round(annualDepreciation),
        monthlyDepreciation: Math.round(monthlyDepreciation),
        monthsElapsed,
        remainingMonths,
        accumulatedDepreciation: Math.round(accumulatedDepreciation),
        bookValue: Math.round(bookValue),
        progressPercent,
        isFullyDepreciated: monthsElapsed >= totalUsefulMonths
    };
}

/**
 * Format asset record lengkap dengan relasi (photos, financials, custody, maintenance)
 */
function formatAsset(row) {
    if (!row) return null;

    // Ambil foto
    const photosRows = db.prepare('SELECT angle, file_url FROM asset_photos WHERE asset_id = ?').all(row.id);
    const photos = {
        front: '', back: '', right: '', left: '', top_bottom: '', serial_plate: ''
    };
    for (const p of photosRows) {
        photos[p.angle] = p.file_url;
    }

    // Ambil data keuangan APBD
    const financial = db.prepare('SELECT * FROM asset_financials WHERE asset_id = ?').get(row.id) || null;

    // Ambil riwayat pemegang (custody)
    const custodyHistory = db.prepare(`
        SELECT id, employee_name as employeeName, nip, department, assigned_date as assignedDate,
               returned_date as returnedDate, condition_on_assign as conditionOnAssign,
               condition_on_return as conditionOnReturn, notes, bast_number as bastNumber,
               created_by as createdBy, created_at as createdAt
        FROM custody_history
        WHERE asset_id = ?
        ORDER BY assigned_date DESC, id DESC
    `).all(row.id);

    // Ambil riwayat servis (maintenance)
    const maintenanceHistory = db.prepare(`
        SELECT id, maintenance_date as date, service_type as title, cost, vendor,
               is_capitalized as isCapitalized, capital_addition as capitalAddition,
               description as notes, recorded_by as recordedBy, created_at as createdAt
        FROM maintenance_records
        WHERE asset_id = ?
        ORDER BY maintenance_date DESC, id DESC
    `).all(row.id);

    // Hitung depresiasi
    const depreciation = calculateAssetDepreciation(row);

    return {
        id: row.id,
        kodeBarang: row.kode_barang,
        nup: row.nup,
        name: row.name,
        category: row.category,
        jenisBarang: row.jenis_barang || row.category,
        merk: row.merk,
        type: row.type,
        ukuran: row.ukuran,
        bahan: row.bahan,
        tahunBeli: row.tahun_beli,
        purchaseDate: row.purchase_date,
        noPabrik: row.no_pabrik,
        noRangka: row.no_rangka,
        noMesin: row.no_mesin,
        noPolisi: row.no_polisi,
        noBpkb: row.no_bpkb,
        asalUsul: row.asal_usul,
        harga: String(row.harga),
        usefulLifeYears: row.useful_life_years,
        salvageValue: String(row.salvage_value),
        kondisi: row.kondisi,
        status: row.status,
        lokasi: row.lokasi,
        assignee: row.assignee_name || '-',
        assigneeNip: row.assignee_nip || '',
        assigneeDept: row.assignee_dept || '',
        photos,
        financial,
        custodyHistory,
        maintenanceHistory,
        depreciation,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * GET /api/assets
 * Ambil seluruh aset dengan filter pencarian, status, dan ruangan
 */
router.get('/', (req, res) => {
    try {
        const { search, status, category, lokasi } = req.query;
        let query = 'SELECT * FROM assets WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (lokasi) {
            query += ' AND lokasi = ?';
            params.push(lokasi);
        }
        if (search) {
            query += ` AND (
                name LIKE ? OR nup LIKE ? OR kode_barang LIKE ? OR 
                merk LIKE ? OR no_pabrik LIKE ? OR assignee_name LIKE ?
            )`;
            const term = `%${search.trim()}%`;
            params.push(term, term, term, term, term, term);
        }

        query += ' ORDER BY id DESC';

        const rows = db.prepare(query).all(...params);
        const assets = rows.map(formatAsset);

        return res.json({ success: true, count: assets.length, data: assets });
    } catch (err) {
        console.error('[GET_ASSETS_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mengambil data aset.' });
    }
});

/**
 * GET /api/assets/:id
 * Detail lengkap satu aset
 */
router.get('/:id', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
        if (!row) {
            return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
        }
        return res.json({ success: true, data: formatAsset(row) });
    } catch (err) {
        console.error('[GET_ASSET_DETAIL_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mengambil detail aset.' });
    }
});

/**
 * POST /api/assets
 * Tambah Aset Baru (Memerlukan Hak Akses Pengurus Barang / Superadmin)
 */
router.post('/', requireAuth, requireRole(['superadmin', 'pengurus_barang']), (req, res) => {
    try {
        const d = req.body;

        if (!d.name || !d.kodeBarang || !d.nup) {
            return res.status(400).json({
                success: false,
                message: 'Nama Barang, Kodefikasi Barang, dan NUP wajib diisi.'
            });
        }

        const hargaNum = parseFloat(String(d.harga || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const salvageNum = parseFloat(String(d.salvageValue || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const usefulLife = parseInt(d.usefulLifeYears || '4', 10) || 4;

        const insertStmt = db.prepare(`
            INSERT INTO assets (
                kode_barang, nup, name, category, jenis_barang, merk, type, ukuran, bahan,
                tahun_beli, purchase_date, no_pabrik, no_rangka, no_mesin, no_polisi, no_bpkb,
                asal_usul, harga, useful_life_years, salvage_value, kondisi, status, lokasi,
                assignee_name, assignee_nip, assignee_dept
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = insertStmt.run(
            d.kodeBarang.trim(),
            d.nup.trim(),
            d.name.trim(),
            d.category || 'Laptop',
            d.jenisBarang || d.category || 'Aset TIK',
            d.merk || '',
            d.type || '',
            d.ukuran || '',
            d.bahan || '',
            d.tahunBeli ? parseInt(d.tahunBeli, 10) : new Date().getFullYear(),
            d.purchaseDate || new Date().toISOString().split('T')[0],
            d.noPabrik || '',
            d.noRangka || '-',
            d.noMesin || '-',
            d.noPolisi || '-',
            d.noBpkb || '-',
            d.asalUsul || 'Pengadaan APBD Inspektorat Trenggalek',
            hargaNum,
            usefulLife,
            salvageNum,
            d.kondisi || 'Baik',
            d.status || (d.assignee && d.assignee !== '-' ? 'In Use' : 'Available'),
            d.lokasi || 'Ruang Sekretariat',
            d.assignee || '-',
            d.assigneeNip || '',
            d.assigneeDept || ''
        );

        const assetId = result.lastInsertRowid;

        // Simpan foto multi-sudut jika ada
        if (d.photos && typeof d.photos === 'object') {
            const insertPhoto = db.prepare('INSERT INTO asset_photos (asset_id, angle, file_url) VALUES (?, ?, ?)');
            for (const [angle, url] of Object.entries(d.photos)) {
                if (url && typeof url === 'string') {
                    insertPhoto.run(assetId, angle, url);
                }
            }
        }

        // Simpan data keuangan APBD jika ada
        if (d.financial && typeof d.financial === 'object') {
            const f = d.financial;
            db.prepare(`
                INSERT INTO asset_financials (
                    asset_id, dpa_number, sub_activity, account_code, sp2d_number,
                    sp2d_date, spm_number, contract_number, contract_date, vendor_name,
                    budget_source, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                assetId,
                f.dpa_number || '',
                f.sub_activity || '',
                f.account_code || '',
                f.sp2d_number || '',
                f.sp2d_date || '',
                f.spm_number || '',
                f.contract_number || '',
                f.contract_date || '',
                f.vendor_name || '',
                f.budget_source || 'APBD Kabupaten Trenggalek',
                f.notes || ''
            );
        }

        // Catat pemegang awal jika langsung dialokasikan ke pegawai
        if (d.assignee && d.assignee !== '-') {
            const custodyId = `CUST-${Date.now().toString().slice(-6)}`;
            db.prepare(`
                INSERT INTO custody_history (
                    id, asset_id, employee_name, nip, department, assigned_date,
                    condition_on_assign, notes, bast_number, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                custodyId,
                assetId,
                d.assignee,
                d.assigneeNip || '',
                d.assigneeDept || '',
                d.purchaseDate || new Date().toISOString().split('T')[0],
                d.kondisi || 'Baik',
                'Penyerahan awal saat pengadaan barang',
                `BAST/TIK/${new Date().getFullYear()}/${custodyId}`,
                req.user.name
            );
        }

        // Catat Audit Log
        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'CREATE_ASSET',
            entity: 'ASSET',
            entityId: String(assetId),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { name: d.name, kodeBarang: d.kodeBarang, nup: d.nup, harga: hargaNum }
        });

        const created = db.prepare('SELECT * FROM assets WHERE id = ?').get(assetId);
        return res.status(201).json({
            success: true,
            message: `Aset ${d.name} (NUP: ${d.nup}) berhasil didaftarkan ke sistem.`,
            data: formatAsset(created)
        });
    } catch (err) {
        console.error('[CREATE_ASSET_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mendaftarkan aset baru.' });
    }
});

/**
 * PUT /api/assets/:id
 * Perbarui Data Aset
 */
router.put('/:id', requireAuth, requireRole(['superadmin', 'pengurus_barang']), (req, res) => {
    try {
        const id = req.params.id;
        const d = req.body;
        const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
        }

        const hargaNum = d.harga !== undefined ? parseFloat(String(d.harga).replace(/[^0-9.-]+/g, '')) : existing.harga;
        const salvageNum = d.salvageValue !== undefined ? parseFloat(String(d.salvageValue).replace(/[^0-9.-]+/g, '')) : existing.salvage_value;
        const usefulLife = d.usefulLifeYears !== undefined ? parseInt(d.usefulLifeYears, 10) : existing.useful_life_years;

        db.prepare(`
            UPDATE assets SET
                kode_barang = COALESCE(?, kode_barang),
                nup = COALESCE(?, nup),
                name = COALESCE(?, name),
                category = COALESCE(?, category),
                jenis_barang = COALESCE(?, jenis_barang),
                merk = COALESCE(?, merk),
                type = COALESCE(?, type),
                ukuran = COALESCE(?, ukuran),
                bahan = COALESCE(?, bahan),
                tahun_beli = COALESCE(?, tahun_beli),
                purchase_date = COALESCE(?, purchase_date),
                no_pabrik = COALESCE(?, no_pabrik),
                no_rangka = COALESCE(?, no_rangka),
                no_mesin = COALESCE(?, no_mesin),
                no_polisi = COALESCE(?, no_polisi),
                no_bpkb = COALESCE(?, no_bpkb),
                asal_usul = COALESCE(?, asal_usul),
                harga = ?,
                useful_life_years = ?,
                salvage_value = ?,
                kondisi = COALESCE(?, kondisi),
                status = COALESCE(?, status),
                lokasi = COALESCE(?, lokasi),
                assignee_name = COALESCE(?, assignee_name),
                assignee_nip = COALESCE(?, assignee_nip),
                assignee_dept = COALESCE(?, assignee_dept),
                updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `).run(
            d.kodeBarang, d.nup, d.name, d.category, d.jenisBarang, d.merk, d.type,
            d.ukuran, d.bahan, d.tahunBeli, d.purchaseDate, d.noPabrik, d.noRangka,
            d.noMesin, d.noPolisi, d.noBpkb, d.asalUsul, hargaNum, usefulLife,
            salvageNum, d.kondisi, d.status, d.lokasi, d.assignee, d.assigneeNip,
            d.assigneeDept, id
        );

        // Update foto jika ada
        if (d.photos && typeof d.photos === 'object') {
            for (const [angle, url] of Object.entries(d.photos)) {
                if (url) {
                    db.prepare(`
                        INSERT INTO asset_photos (asset_id, angle, file_url)
                        VALUES (?, ?, ?)
                        ON CONFLICT(asset_id, angle) DO UPDATE SET file_url = excluded.file_url
                    `).run(id, angle, url);
                }
            }
        }

        // Update keuangan jika ada
        if (d.financial && typeof d.financial === 'object') {
            const f = d.financial;
            db.prepare(`
                INSERT INTO asset_financials (
                    asset_id, dpa_number, sub_activity, account_code, sp2d_number,
                    sp2d_date, spm_number, contract_number, contract_date, vendor_name,
                    budget_source, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(asset_id) DO UPDATE SET
                    dpa_number = excluded.dpa_number,
                    sub_activity = excluded.sub_activity,
                    account_code = excluded.account_code,
                    sp2d_number = excluded.sp2d_number,
                    sp2d_date = excluded.sp2d_date,
                    spm_number = excluded.spm_number,
                    contract_number = excluded.contract_number,
                    contract_date = excluded.contract_date,
                    vendor_name = excluded.vendor_name,
                    budget_source = excluded.budget_source,
                    notes = excluded.notes
            `).run(
                id, f.dpa_number || '', f.sub_activity || '', f.account_code || '',
                f.sp2d_number || '', f.sp2d_date || '', f.spm_number || '',
                f.contract_number || '', f.contract_date || '', f.vendor_name || '',
                f.budget_source || 'APBD Kabupaten Trenggalek', f.notes || ''
            );
        }

        // Catat Audit Log
        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'UPDATE_ASSET',
            entity: 'ASSET',
            entityId: String(id),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { updatedFields: Object.keys(d) }
        });

        const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        return res.json({
            success: true,
            message: 'Data aset berhasil diperbarui.',
            data: formatAsset(updated)
        });
    } catch (err) {
        console.error('[UPDATE_ASSET_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui data aset.' });
    }
});

/**
 * DELETE /api/assets/:id
 * Hapus Aset (Superadmin saja)
 */
router.delete('/:id', requireAuth, requireRole(['superadmin']), (req, res) => {
    try {
        const id = req.params.id;
        const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });
        }

        db.prepare('DELETE FROM assets WHERE id = ?').run(id);

        // Audit Log penghapusan
        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'DELETE_ASSET',
            entity: 'ASSET',
            entityId: String(id),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { deletedAsset: existing.name, kodeBarang: existing.kode_barang, nup: existing.nup }
        });

        return res.json({ success: true, message: `Aset ${existing.name} telah berhasil dihapus.` });
    } catch (err) {
        console.error('[DELETE_ASSET_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menghapus aset.' });
    }
});

/**
 * POST /api/assets/:id/custody
 * Mutasi / Serah Terima Aset ke Pegawai Baru (Check-out)
 */
router.post('/:id/custody', requireAuth, requireRole(['superadmin', 'pengurus_barang']), (req, res) => {
    try {
        const id = req.params.id;
        const { employeeName, nip, department, assignedDate, conditionOnAssign, notes, bastNumber } = req.body;

        const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        if (!asset) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });

        // Tutup riwayat pemegang sebelumnya jika masih aktif
        db.prepare(`
            UPDATE custody_history 
            SET returned_date = ?, condition_on_return = 'Bermutasi ke Pegawai Baru'
            WHERE asset_id = ? AND returned_date IS NULL
        `).run(assignedDate || new Date().toISOString().split('T')[0], id);

        // Tambah entri pemegang baru
        const custodyId = `CUST-${Date.now().toString().slice(-6)}`;
        const bastNum = bastNumber || `BAST/INSP/${new Date().getFullYear()}/${custodyId}`;

        db.prepare(`
            INSERT INTO custody_history (
                id, asset_id, employee_name, nip, department, assigned_date,
                condition_on_assign, notes, bast_number, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            custodyId, id, employeeName, nip || '', department || '',
            assignedDate || new Date().toISOString().split('T')[0],
            conditionOnAssign || 'Baik', notes || '', bastNum, req.user.name
        );

        // Perbarui status aset di tabel master
        db.prepare(`
            UPDATE assets SET
                status = 'In Use',
                assignee_name = ?,
                assignee_nip = ?,
                assignee_dept = ?,
                updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `).run(employeeName, nip || '', department || '', id);

        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'MUTATE_CUSTODY',
            entity: 'ASSET',
            entityId: String(id),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { assetName: asset.name, newHolder: employeeName, bastNumber: bastNum }
        });

        const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        return res.json({
            success: true,
            message: `Aset berhasil diserahkan ke ${employeeName}. BAST: ${bastNum}`,
            data: formatAsset(updated)
        });
    } catch (err) {
        console.error('[MUTATE_CUSTODY_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal memproses mutasi serah terima.' });
    }
});

/**
 * POST /api/assets/:id/return
 * Penarikan Aset Kembali ke Gudang (Check-in)
 */
router.post('/:id/return', requireAuth, requireRole(['superadmin', 'pengurus_barang']), (req, res) => {
    try {
        const id = req.params.id;
        const { returnedDate, conditionOnReturn, notes } = req.body;

        const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        if (!asset) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });

        const retDate = returnedDate || new Date().toISOString().split('T')[0];
        const retCondition = conditionOnReturn || 'Baik';

        // Tutup riwayat pemegang aktif
        db.prepare(`
            UPDATE custody_history 
            SET returned_date = ?, condition_on_return = ?, notes = COALESCE(notes || ' | ' || ?, notes)
            WHERE asset_id = ? AND returned_date IS NULL
        `).run(retDate, retCondition, notes || 'Ditarik ke Gudang', id);

        // Perbarui master aset ke Gudang
        db.prepare(`
            UPDATE assets SET
                status = 'Available',
                assignee_name = '-',
                assignee_nip = '',
                assignee_dept = '',
                kondisi = ?,
                lokasi = 'Gudang Logistik & Arsip Pengawasan',
                updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `).run(retCondition, id);

        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'RETURN_CUSTODY',
            entity: 'ASSET',
            entityId: String(id),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { assetName: asset.name, conditionOnReturn: retCondition }
        });

        const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        return res.json({
            success: true,
            message: 'Aset berhasil ditarik dan kembali tersedia di Gudang.',
            data: formatAsset(updated)
        });
    } catch (err) {
        console.error('[RETURN_CUSTODY_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal menarik aset ke gudang.' });
    }
});

/**
 * POST /api/assets/:id/maintenance
 * Pencatatan Riwayat Servis / Kapitalisasi Nilai (PSAP 07)
 */
router.post('/:id/maintenance', requireAuth, (req, res) => {
    try {
        const id = req.params.id;
        const { date, serviceType, cost, vendor, isCapitalized, notes } = req.body;

        const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        if (!asset) return res.status(404).json({ success: false, message: 'Aset tidak ditemukan.' });

        const srvId = `SRV-${Date.now().toString().slice(-6)}`;
        const costNum = parseFloat(String(cost || '0').replace(/[^0-9.-]+/g, '')) || 0;
        const capitalized = Boolean(isCapitalized) ? 1 : 0;
        const capitalAddition = capitalized ? costNum : 0;

        db.prepare(`
            INSERT INTO maintenance_records (
                id, asset_id, maintenance_date, service_type, cost, vendor,
                is_capitalized, capital_addition, description, recorded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            srvId, id, date || new Date().toISOString().split('T')[0],
            serviceType || 'Pemeliharaan Rutin', costNum, vendor || '-',
            capitalized, capitalAddition, notes || '', req.user.name
        );

        // Jika dikapitalisasi, tambahkan ke harga perolehan master aset (PSAP 07)
        if (capitalized && costNum > 0) {
            db.prepare(`
                UPDATE assets SET
                    harga = harga + ?,
                    updated_at = datetime('now', 'localtime')
                WHERE id = ?
            `).run(costNum, id);
        }

        recordAuditLog({
            userId: req.user.id,
            userName: req.user.name,
            userNip: req.user.nip,
            role: req.user.role,
            action: 'ADD_MAINTENANCE',
            entity: 'ASSET',
            entityId: String(id),
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            details: { assetName: asset.name, serviceType, cost: costNum, isCapitalized: capitalized }
        });

        const updated = db.prepare('SELECT * FROM assets WHERE id = ?').get(id);
        return res.json({
            success: true,
            message: `Catatan servis berhasil disimpan.${capitalized ? ' Nilai perolehan aset telah bertambah (Kapitalisasi PSAP 07).' : ''}`,
            data: formatAsset(updated)
        });
    } catch (err) {
        console.error('[ADD_MAINTENANCE_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mencatat pemeliharaan aset.' });
    }
});

export default router;
