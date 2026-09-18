// server/database.js
// SQLite WAL Mode Database initialization for SIM-TIK Inspektorat Kabupaten Trenggalek
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../data/simtik.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Inisialisasi Database SQLite
export const db = new Database(dbPath, {
    // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Aktifkan WAL (Write-Ahead Logging) & Foreign Keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

/**
 * Inisialisasi Skema Tabel Relasional
 */
export function initDatabase() {
    db.exec(`
        -- 1. TABEL PENGGUNA & HAK AKSES (RBAC)
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nip TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            name_without_degree TEXT,
            email TEXT,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user', -- superadmin, pengurus_barang, auditor, p2upd, teknisi, user
            position TEXT,                     -- Jabatan: Inspektur, Sekretaris, Irban, Auditor Madya, dll
            department TEXT,                   -- Bidang: Irban I, Irban II, Irban III, Irban IV, Irban Investigasi, Sekretariat
            phone TEXT,
            birth_place TEXT,
            birth_date TEXT,
            rank TEXT,
            class_grade TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 2. TABEL MASTER RUANGAN DINAS (KIR - Permendagri 47/2021)
        CREATE TABLE IF NOT EXISTS rooms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            pic_name TEXT NOT NULL,
            pic_nip TEXT,
            floor TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 3. TABEL INVENTARIS ASET TETAP (KIB B - Peralatan & Mesin TIK)
        CREATE TABLE IF NOT EXISTS assets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kode_barang TEXT NOT NULL,         -- Permendagri 108/2016 (contoh: 1.3.2.06.01.02)
            nup TEXT NOT NULL,                 -- Nomor Urut Pendaftaran (0001, dst)
            name TEXT NOT NULL,
            category TEXT NOT NULL,            -- Laptop, PC Desktop, Server, Jaringan, Printer, dll
            jenis_barang TEXT,
            merk TEXT,
            type TEXT,
            ukuran TEXT,
            bahan TEXT,
            tahun_beli INTEGER,
            purchase_date TEXT,
            no_pabrik TEXT,
            no_rangka TEXT DEFAULT '-',
            no_mesin TEXT DEFAULT '-',
            no_polisi TEXT DEFAULT '-',
            no_bpkb TEXT DEFAULT '-',
            asal_usul TEXT,
            harga REAL NOT NULL DEFAULT 0,
            useful_life_years INTEGER NOT NULL DEFAULT 4,
            salvage_value REAL NOT NULL DEFAULT 0,
            kondisi TEXT NOT NULL DEFAULT 'Baik', -- Baik, Rusak Ringan, Rusak Berat
            status TEXT NOT NULL DEFAULT 'Available', -- Available, In Use, Maintenance, Damaged, Disposed
            lokasi TEXT,
            current_assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            assignee_name TEXT,
            assignee_nip TEXT,
            assignee_dept TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 4. TABEL MULTI-FOTO DOKUMENTASI FISIK ASET
        CREATE TABLE IF NOT EXISTS asset_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            angle TEXT NOT NULL, -- front, back, right, left, top_bottom, serial_plate
            file_url TEXT NOT NULL,
            file_path TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            UNIQUE(asset_id, angle)
        );

        -- 5. TABEL KETERKAITAN KEUANGAN & DOKUMEN SP2D APBD (Dana 10M)
        CREATE TABLE IF NOT EXISTS asset_financials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER UNIQUE NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            dpa_number TEXT,                   -- No. DPA Inspektorat (misal: DPA/A.1/1.02.../2024)
            sub_activity TEXT,                 -- Nama Sub-Kegiatan DPA
            account_code TEXT,                 -- Kode Rekening Belanja Modal (misal: 5.2.02.10.01.0002)
            sp2d_number TEXT,                  -- No. SP2D BPKAD Trenggalek
            sp2d_date TEXT,
            spm_number TEXT,
            contract_number TEXT,              -- No. Kontrak/SPK/Faktur E-Katalog
            contract_date TEXT,
            vendor_name TEXT,
            vendor_npwp TEXT,
            budget_source TEXT DEFAULT 'APBD Kabupaten Trenggalek',
            notes TEXT
        );

        -- 6. TABEL ARSIP BERKAS PDF BUKTI PEROLEHAN
        CREATE TABLE IF NOT EXISTS asset_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            doc_type TEXT NOT NULL, -- sp2d, faktur, bast_fisik, garansi, sertifikat
            title TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_url TEXT NOT NULL,
            file_size_bytes INTEGER,
            uploaded_by TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 7. TABEL RIWAYAT MUTASI & PEMEGANG ASET (BAST LOG)
        CREATE TABLE IF NOT EXISTS custody_history (
            id TEXT PRIMARY KEY,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            employee_name TEXT NOT NULL,
            nip TEXT,
            department TEXT,
            assigned_date TEXT NOT NULL,
            returned_date TEXT,
            condition_on_assign TEXT,
            condition_on_return TEXT,
            notes TEXT,
            bast_number TEXT,
            created_by TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 8. TABEL RIWAYAT PEMELIHARAAN & KAPITALISASI NILAI (PSAP 07)
        CREATE TABLE IF NOT EXISTS maintenance_records (
            id TEXT PRIMARY KEY,
            asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
            maintenance_date TEXT NOT NULL,
            service_type TEXT NOT NULL,
            cost REAL NOT NULL DEFAULT 0,
            vendor TEXT,
            is_capitalized INTEGER NOT NULL DEFAULT 0,
            capital_addition REAL NOT NULL DEFAULT 0,
            description TEXT,
            recorded_by TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 9. TABEL JEJAK AUDIT FORENSIK (IMMUTABLE AUDIT TRAIL APIP)
        -- Data pada tabel ini tidak boleh diubah atau dihapus oleh siapapun
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            user_id INTEGER,
            user_name TEXT NOT NULL,
            user_nip TEXT,
            role TEXT,
            action TEXT NOT NULL, -- LOGIN, LOGOUT, CREATE_ASSET, UPDATE_ASSET, DELETE_ASSET, MUTATE, RETURN, SERVICE, EXPORT
            entity TEXT NOT NULL, -- ASSET, CUSTODY, MAINTENANCE, USER, SYSTEM
            entity_id TEXT,
            ip_address TEXT,
            user_agent TEXT,
            details_json TEXT
        );

        -- 10. TABEL TIKET LAYANAN HELPDESK TIK
        CREATE TABLE IF NOT EXISTS helpdesk_tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_number TEXT UNIQUE NOT NULL,
            reporter_name TEXT NOT NULL,
            reporter_nip TEXT,
            device_name TEXT,
            issue TEXT NOT NULL,
            priority TEXT NOT NULL DEFAULT 'Sedang', -- Rendah, Sedang, Tinggi, Darurat
            status TEXT NOT NULL DEFAULT 'Menunggu', -- Menunggu, Dalam Proses, Selesai, Ditolak
            technician_name TEXT,
            resolution TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 11. TABEL PERSEDIAAN BARANG HABIS PAKAI (ATK & LOGISTIK)
        CREATE TABLE IF NOT EXISTS atk_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            unit TEXT NOT NULL, -- Rim, Box, Pcs, Buah
            category TEXT NOT NULL,
            min_stock INTEGER NOT NULL DEFAULT 5,
            current_stock INTEGER NOT NULL DEFAULT 0,
            unit_price REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- 12. TABEL PENGATURAN CADANGAN OTOMATIS (BACKUP & NOTIFIKASI TELEGRAM / WAHA)
        CREATE TABLE IF NOT EXISTS backup_configs (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            schedule TEXT DEFAULT 'daily', -- 'off', 'daily', 'weekly', 'monthly'
            time_wib TEXT DEFAULT '00:00',
            telegram_enabled INTEGER DEFAULT 0,
            telegram_bot_token TEXT DEFAULT '',
            telegram_chat_id TEXT DEFAULT '',
            waha_enabled INTEGER DEFAULT 0,
            waha_api_url TEXT DEFAULT '',
            waha_session TEXT DEFAULT 'default',
            waha_target_number TEXT DEFAULT '',
            last_backup_time TEXT,
            last_backup_status TEXT,
            last_backup_message TEXT,
            updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
        );

        -- Indeks untuk mempercepat pencarian
        CREATE INDEX IF NOT EXISTS idx_assets_nup ON assets(nup);
        CREATE INDEX IF NOT EXISTS idx_assets_kode ON assets(kode_barang);
        CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
        CREATE INDEX IF NOT EXISTS idx_assets_lokasi ON assets(lokasi);
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_nip);
    `);

    // Inisialisasi baris konfigurasi backup bawaan jika belum ada
    db.prepare(`
        INSERT OR IGNORE INTO backup_configs (id, schedule, time_wib, telegram_enabled, waha_enabled)
        VALUES (1, 'daily', '00:00', 0, 0)
    `).run();

    // Migrasi kolom tabel users secara aman
    const userCols = db.pragma('table_info(users)').map(c => c.name);
    if (!userCols.includes('name_without_degree')) db.exec('ALTER TABLE users ADD COLUMN name_without_degree TEXT');
    if (!userCols.includes('birth_place')) db.exec('ALTER TABLE users ADD COLUMN birth_place TEXT');
    if (!userCols.includes('birth_date')) db.exec('ALTER TABLE users ADD COLUMN birth_date TEXT');
    if (!userCols.includes('rank')) db.exec('ALTER TABLE users ADD COLUMN rank TEXT');
    if (!userCols.includes('class_grade')) db.exec('ALTER TABLE users ADD COLUMN class_grade TEXT');

    // Sinkronisasi data master pegawai dari employees.json
    syncMasterEmployees();

    seedInitialData();
}

/**
 * Sinkronisasi Master Pegawai Resmi dari berkas employees.json
 */
function syncMasterEmployees() {
    try {
        const jsonPath = path.resolve(__dirname, '../src/data/employees.json');
        if (!fs.existsSync(jsonPath)) return;

        const employees = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const defaultPasswordHash = bcrypt.hashSync('Inspektorat2026!', 10);

        const upsert = db.prepare(`
            INSERT INTO users (
                nip, name, name_without_degree, email, password_hash, role,
                position, department, phone, birth_place, birth_date, rank, class_grade, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(nip) DO UPDATE SET
                name = excluded.name,
                name_without_degree = excluded.name_without_degree,
                email = CASE WHEN excluded.email != '-' THEN excluded.email ELSE users.email END,
                position = excluded.position,
                department = excluded.department,
                phone = CASE WHEN excluded.phone != '-' THEN excluded.phone ELSE users.phone END,
                birth_place = excluded.birth_place,
                birth_date = excluded.birth_date,
                rank = excluded.rank,
                class_grade = excluded.class_grade,
                is_active = 1
        `);

        for (const emp of employees) {
            if (emp.nip && emp.nip !== '-') {
                let role = 'auditor';
                if (emp.name.toLowerCase().includes('nandito')) role = 'superadmin';
                else if (emp.name.toLowerCase().includes('sigit prasetyo')) role = 'pengurus_barang';
                else if (emp.position && emp.position.toLowerCase().includes('ppupd')) role = 'p2upd';
                else if (emp.position && emp.position.toLowerCase().includes('komputer')) role = 'teknisi';

                upsert.run(
                    emp.nip,
                    emp.name,
                    emp.nameWithoutDegree || emp.name,
                    emp.email || `${emp.nip}@inspektorat.trenggalekkab.go.id`,
                    defaultPasswordHash,
                    role,
                    emp.position,
                    emp.department,
                    emp.phone,
                    emp.birthPlace,
                    emp.birthDate,
                    emp.rank,
                    emp.classGrade
                );
            }
        }
    } catch (e) {
        console.warn('[SYNC_EMPLOYEES_WARN]', e.message);
    }
}

/**
 * Seeding Data Awal (Organisasi Inspektorat Trenggalek & Master Ruangan & Aset Awal)
 */
function seedInitialData() {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount > 0) return; // Sudah terisi

    console.log('[DB] Menginisialisasi data awal Inspektorat Kabupaten Trenggalek...');

    // Hash kata sandi default: "Inspektorat2026!"
    const defaultPasswordHash = bcrypt.hashSync('Inspektorat2026!', 10);
    const adminPasswordHash = bcrypt.hashSync('AdminTrenggalek2026!', 10);

    // 1. Akun Admin Pengurus Barang & Administrator Sistem
    const insertUser = db.prepare(`
        INSERT INTO users (nip, name, email, password_hash, role, position, department, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
        '198506142009021004',
        'NANDITO MONLIEV PASSA,S.Kom',
        'admin@inspektorat.trenggalekkab.go.id',
        adminPasswordHash,
        'superadmin',
        'Pengelola Aset & TIK / Administrator SIM-TIK',
        'Sekretariat - Subbag Umum & Keuangan',
        '081234567890'
    );

    insertUser.run(
        '197505122000031002',
        'Ir. WIJIONO, ST,M.Mkes',
        'wijiono@inspektorat.trenggalekkab.go.id',
        defaultPasswordHash,
        'auditor',
        'Inspektur Pembantu Wilayah I (Irban I)',
        'Inspektorat Pembantu Wilayah I',
        '081234567891'
    );

    insertUser.run(
        '198207182008011009',
        'SIGIT PRASETYO,S.IP.MAP',
        'sigit@inspektorat.trenggalekkab.go.id',
        defaultPasswordHash,
        'pengurus_barang',
        'Kasubag Umum dan Keuangan / Pengurus Barang Pengguna',
        'Sekretariat',
        '081234567892'
    );

    // Tambah 68 Pegawai lainnya dari daftar resmi Inspektorat Trenggalek
    const RAW_EMPLOYEES = [
        "SUYATNO,SH", "DIDIK AGIT W, SE.MAP", "NUGRAHENI RAHAYU S, SE,M.Si",
        "DIDIK SUPRIYANTO,S.Sos.M.Si", "EKO DARMINTO,SE.M.Si", "Ir. AGUNG SRIYONO", "DJOKO PURNOMO,SE", "AGUNG YUDYANA, S.H., M.H.",
        "DWI SUCI RAHAYU, SE.", "Ir. BENNO HERA T.", "TOTOK SUBIANTO, SE", "BASORI, ST", "RIKE ARSHINTA MAYASARI,  ST,M.A.P",
        "WINDU SETIYADI, ST", "NIKEN SRI PALUPI,SE", "HAPPY RAHMAWATI,SE", "ENI SUMAWATI, SE", "UTARI PRASETYANI,SE",
        "FENY RATNAWATI,SE", "UMROTUL MAHFUDHOH,  S.Ak.", "SIGIH SETIONO,  S.Ak.", "SULIKAH,S.TP.,M.A.P",
        "PUSPANAGARI PUTRI RIDANTI,S.Ak", "CHOIRUNNISA,S.A.", "FEREN FEBRIYANTI,S.Ak", "ANANDA SEPTA WILLYANDA,S.E.", "ADHI TRIYANTO, S.Tr.I.P",
        "FERYAL NADA AZIZAH,A.Md.Ak", "NADIAH FIRDAUSSINTA D,A.Md.Ak", "CHRIS TRYANTO MARTA P P,A,Md.Ak", "DESTY AYU SAPUTRI,A.Md.Ak", "MUHAMAD IQBAL MAULIDI,A.Md.Ak",
        "ABYADH NURUTTIMAMI FR, A.Md.Ak", "ANINDYA FAUZIYAH BASUKI,A.Md.Ak", "ANDIKA PUTRA HARDYANSYAH,A,Md.Ak", "MUHAMMAD IDHAM FIRDAUS,A.Md.Ak", "CAHYA FITRIA ARDIANI, A. Md",
        "ROEKAN, ST", "SULIS SETYAWATI, SE", "YENI KRISTUTI", "KATIRAN", "KUSNUL KOTIMAH",
        "HARYADI", "DYAH WIDI MRANANI, SE", "NANANG MARDIANTORO, S.Pd", "NUVENTIN ASNA PUTRI, S.Ak", "PUTRI PATRISIA FERNANDA, S.M.",
        "IRMALA PRASISTYA CAHYANING P, S.Ak", "KUKUH ARI FIRMANSYAH, S.H", "ZAKIATUL MUFARRIHAH, ST", "ERNI AGUSTINA, S.H.", "INDAH NABILLA HASNA, S.T.",
        "DIAH AJENG MELIASARI, S.H", "MOH. MUHADHIR SYAFAAT, S.T.", "KARTIKA KUSUMA DEWI, S.E.", "AJI SURYA SAKSAMA, S.T", "MELA ENDRIANI, S.E.",
        "YOPI ADI PRAYOGA, S.T.", "DEVI SELVIA, S.E.", "MUHAMMAD ADITYA K, S.E", "RORO PUTRI SETIANINGAYU,S.Tr.E", "TOMMY KURNIAWAN, S.E",
        "FELLIS ENRICHA PUTRI, S.Ak.", "FRYZA RACHMANIA M, A.Md.Kom", "HARMINTO", "SUPRIYADI", "APRILIYAN SUSANTO"
    ];

    RAW_EMPLOYEES.forEach((name, idx) => {
        const dummyNip = `198${(70 + (idx % 25)).toString().padStart(2, '0')}${(1 + (idx % 12)).toString().padStart(2, '0')}${(1 + (idx % 28)).toString().padStart(2, '0')}201001${(1001 + idx)}`;
        const cleanName = name.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, 10);
        const email = `${cleanName || 'pegawai' + idx}@inspektorat.trenggalekkab.go.id`;
        
        let dept = 'Inspektorat Pembantu Wilayah I';
        if (idx % 5 === 0) dept = 'Inspektorat Pembantu Investigasi';
        else if (idx % 4 === 0) dept = 'Inspektorat Pembantu Wilayah IV';
        else if (idx % 3 === 0) dept = 'Inspektorat Pembantu Wilayah III';
        else if (idx % 2 === 0) dept = 'Inspektorat Pembantu Wilayah II';

        let role = 'auditor';
        if (name.includes('A.Md') || name.includes('Kom')) role = 'teknisi';
        else if (idx > 50) role = 'p2upd';

        insertUser.run(
            dummyNip,
            name,
            email,
            defaultPasswordHash,
            role,
            'Auditor / Tim Pemeriksa APIP',
            dept,
            `08123456${(1000 + idx)}`
        );
    });

    // 2. Master Ruangan Dinas (Permendagri 47/2021)
    const insertRoom = db.prepare(`
        INSERT INTO rooms (id, name, pic_name, pic_nip, floor)
        VALUES (?, ?, ?, ?, ?)
    `);

    const rooms = [
        { id: "R-01", name: "Ruang Server & Pengolahan Data Elektronik", pic: "NANDITO MONLIEV PASSA,S.Kom", nip: "198506142009021004", floor: "Lantai 2" },
        { id: "R-02", name: "Ruang Sekretariat & Subbag Umum Keuangan", pic: "SIGIT PRASETYO,S.IP.MAP", nip: "198207182008011009", floor: "Lantai 1" },
        { id: "R-03", name: "Ruang Inspektur Pembantu Wilayah I & II", pic: "Ir. WIJIONO, ST,M.Mkes", nip: "197505122000031002", floor: "Lantai 2" },
        { id: "R-04", name: "Ruang Inspektur Pembantu Wilayah III & IV", pic: "SUYATNO,SH", nip: "197808202005011003", floor: "Lantai 2" },
        { id: "R-05", name: "Ruang Inspektur Pembantu Investigasi", pic: "DIDIK AGIT W, SE.MAP", nip: "198003152006041008", floor: "Lantai 2" },
        { id: "R-06", name: "Ruang Rapat Gelar Pengawasan / Ekspose", pic: "SIGIT PRASETYO,S.IP.MAP", nip: "198207182008011009", floor: "Lantai 2" },
        { id: "R-07", name: "Gudang Logistik & Arsip Pengawasan", pic: "NANDITO MONLIEV PASSA,S.Kom", nip: "198506142009021004", floor: "Lantai 1" }
    ];

    for (const r of rooms) {
        insertRoom.run(r.id, r.name, r.pic, r.nip, r.floor);
    }

    // 3. Aset Awal Lengkap (KIB B TIK)
    const insertAsset = db.prepare(`
        INSERT INTO assets (
            kode_barang, nup, name, category, jenis_barang, merk, type, ukuran, bahan,
            tahun_beli, purchase_date, no_pabrik, asal_usul, harga, useful_life_years,
            salvage_value, kondisi, status, lokasi, assignee_name, assignee_nip, assignee_dept
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertFinancial = db.prepare(`
        INSERT INTO asset_financials (
            asset_id, dpa_number, sub_activity, account_code, sp2d_number, sp2d_date,
            contract_number, vendor_name, budget_source, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertPhoto = db.prepare(`
        INSERT INTO asset_photos (asset_id, angle, file_url)
        VALUES (?, ?, ?)
    `);

    const insertCustody = db.prepare(`
        INSERT INTO custody_history (
            id, asset_id, employee_name, nip, department, assigned_date, returned_date,
            condition_on_assign, notes, bast_number, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMaintenance = db.prepare(`
        INSERT INTO maintenance_records (
            id, asset_id, maintenance_date, service_type, cost, vendor, is_capitalized,
            capital_addition, description, recorded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Aset 1: Laptop Dell Latitude 5420
    const a1 = insertAsset.run(
        "1.3.2.06.01.02", "0001", "Dell Latitude 5420 Core i7", "Laptop", "Laptop Pemeriksa APIP",
        "Dell", "Latitude 5420", "14 Inci", "Magnesium Alloy / Polikarbonat",
        2021, "2021-04-12", "DL5420-SN-887192", "Pengadaan APBD Inspektorat T.A 2021",
        18500000, 4, 1000000, "Baik", "In Use", "Ruang Inspektur Pembantu Wilayah I & II",
        "Ir. WIJIONO, ST,M.Mkes", "197505122000031002", "Inspektorat Pembantu Wilayah I"
    );
    const a1Id = a1.lastInsertRowid;

    insertFinancial.run(
        a1Id,
        "DPA/A.1/1.02.0.00.0.00.01.0000/001/2021",
        "Pengadaan Peralatan dan Perlengkapan Kantor Inspektorat",
        "5.2.02.10.01.0002",
        "SP2D/04512/BUD/2021",
        "2021-04-15",
        "027/08/SPK-KOMP/INSP/2021",
        "CV. MITRA TEKNOLOGI TRENGGALEK",
        "APBD Kabupaten Trenggalek",
        "Pengadaan melalui E-Katalog LKPP"
    );

    insertPhoto.run(a1Id, 'front', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80');

    insertCustody.run(
        "CUST-001", a1Id, "Ir. WIJIONO, ST,M.Mkes", "197505122000031002",
        "Inspektorat Pembantu Wilayah I", "2021-04-15", null,
        "Baik (Kondisi Baru)", "Kendaraan operasional audit fisik & penyusunan LHP",
        "BAST/INSP/2021/04/012", "NANDITO MONLIEV PASSA,S.Kom"
    );

    insertMaintenance.run(
        "SRV-001", a1Id, "2023-05-10", "Upgrade RAM 16GB & SSD NVMe 1TB",
        1250000, "Sentra Komputer Trenggalek", 1, 1250000,
        "Penambahan memori dan SSD untuk percepatan audit data besar (Kapitalisasi)",
        "NANDITO MONLIEV PASSA,S.Kom"
    );

    // Aset 2: Server Rack Dell PowerEdge R740
    const a2 = insertAsset.run(
        "1.3.2.06.01.01", "0001", "Dell PowerEdge R740 Rack Server 2U", "Server", "Server Database Pengawasan",
        "Dell", "PowerEdge R740", "Rackmount 2U", "Baja Cold-Rolled",
        2020, "2020-08-15", "PE-R740-TRG-0991", "Pengadaan APBD Inspektorat T.A 2020",
        65000000, 5, 5000000, "Baik", "In Use", "Ruang Server & Pengolahan Data Elektronik",
        "NANDITO MONLIEV PASSA,S.Kom", "198506142009021004", "Sekretariat - Pengelola Data"
    );
    const a2Id = a2.lastInsertRowid;

    insertFinancial.run(
        a2Id,
        "DPA/A.1/1.02.0.00.0.00.01.0000/001/2020",
        "Pengembangan Sistem Informasi Pengawasan Internal",
        "5.2.02.10.01.0001",
        "SP2D/08821/BUD/2020",
        "2020-08-20",
        "027/14/KTR-SERVER/INSP/2020",
        "PT. MULTI INTI DATA SURABAYA",
        "APBD Kabupaten Trenggalek",
        "Server hosting aplikasi pengawasan SIM-TIK & SIMA-APIP"
    );

    insertPhoto.run(a2Id, 'front', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80');

    insertCustody.run(
        "CUST-002", a2Id, "NANDITO MONLIEV PASSA,S.Kom", "198506142009021004",
        "Pengelola Data & SIM-TIK", "2020-08-20", null,
        "Baik (Segel Pabrik)", "Ditempatkan di Rack Server Lt. 2 dengan UPS Terpusat",
        "BAST/INSP/2020/08/005", "SIGIT PRASETYO,S.IP.MAP"
    );

    // Aset 3: Laptop Lenovo ThinkPad T14
    const a3 = insertAsset.run(
        "1.3.2.06.01.02", "0002", "Lenovo ThinkPad T14 Gen 2", "Laptop", "Laptop Auditor Investigasi",
        "Lenovo", "ThinkPad T14 Gen 2", "14 Inci", "Carbon Fiber Hybrid",
        2022, "2022-03-10", "PF28K991-LNV-01", "Pengadaan APBD Inspektorat T.A 2022",
        21000000, 4, 1500000, "Baik", "In Use", "Ruang Inspektur Pembantu Investigasi",
        "DIDIK AGIT W, SE.MAP", "198003152006041008", "Inspektorat Pembantu Investigasi"
    );
    const a3Id = a3.lastInsertRowid;

    insertFinancial.run(
        a3Id,
        "DPA/A.1/1.02.0.00.0.00.01.0000/001/2022",
        "Dukungan Pengawasan Khusus dan Investigasi",
        "5.2.02.10.01.0002",
        "SP2D/02319/BUD/2022",
        "2022-03-15",
        "027/05/SPK-KOMP/INSP/2022",
        "CV. PRIMA ELEKTRONIKA",
        "APBD Kabupaten Trenggalek",
        "Dilengkapi modul enkripsi bitlocker untuk keamanan dokumen pemeriksaan investigasi"
    );

    insertPhoto.run(a3Id, 'front', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80');

    insertCustody.run(
        "CUST-003", a3Id, "DIDIK AGIT W, SE.MAP", "198003152006041008",
        "Inspektorat Pembantu Investigasi", "2022-03-15", null,
        "Baik", "Penyusunan Berita Acara Klarifikasi & Laporan Hasil Investigasi",
        "BAST/INSP/2022/03/018", "NANDITO MONLIEV PASSA,S.Kom"
    );

    // 4. ATK Items Awal
    const insertAtk = db.prepare(`
        INSERT INTO atk_items (code, name, unit, category, min_stock, current_stock, unit_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAtk.run("ATK-001", "Kertas HVS A4 80gr Sinar Dunia", "Rim", "Kertas Cetak", 20, 85, 54000);
    insertAtk.run("ATK-002", "Kertas HVS F4 / Folio 80gr PaperOne", "Rim", "Kertas Cetak", 15, 60, 58000);
    insertAtk.run("ATK-003", "Toner Cartridge HP LaserJet CF276A (76A)", "Pcs", "Toner Printer", 3, 8, 1450000);
    insertAtk.run("ATK-004", "Map Ordner Bantex F4 7cm Biru", "Pcs", "Pengarsipan", 10, 45, 32000);
    insertAtk.run("ATK-005", "Flashdisk SanDisk Ultra 64GB USB 3.0", "Buah", "Media Penyimpanan", 5, 14, 95000);

    // 5. Audit Log Inisialisasi Sistem
    const insertAudit = db.prepare(`
        INSERT INTO audit_logs (user_name, user_nip, role, action, entity, entity_id, ip_address, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
        "SYSTEM INITIALIZER",
        "000000000000000000",
        "system",
        "INITIALIZE_DATABASE",
        "SYSTEM",
        "1",
        "127.0.0.1",
        JSON.stringify({ message: "Inisialisasi Database SQLite WAL SIM-TIK Inspektorat Trenggalek Sukses." })
    );

    console.log('[DB] Seeding data Inspektorat Kabupaten Trenggalek selesai.');
}

/**
 * Catat Jejak Audit Forensik (Wajib untuk setiap mutasi data)
 */
export function recordAuditLog({ userId, userName, userNip, role, action, entity, entityId, ip, userAgent, details }) {
    try {
        const stmt = db.prepare(`
            INSERT INTO audit_logs (user_id, user_name, user_nip, role, action, entity, entity_id, ip_address, user_agent, details_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            userId || null,
            userName || 'Pengguna Anonim',
            userNip || '-',
            role || 'user',
            action,
            entity,
            entityId ? String(entityId) : null,
            ip || '127.0.0.1',
            userAgent || '-',
            details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null
        );
    } catch (err) {
        console.error('[AUDIT_LOG_ERROR] Gagal mencatat jejak audit:', err);
    }
}
