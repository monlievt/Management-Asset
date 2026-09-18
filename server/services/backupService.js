// server/services/backupService.js
// Layanan Pencadangan Database (SQLite WAL) & Integrasi Telegram/WAHA
// Inspektorat Daerah Kabupaten Trenggalek
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/simtik.db');
const backupsDir = path.resolve(path.dirname(dbPath), 'backups');

if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

/**
 * Format ukuran byte ke format terbaca manusia (KB / MB)
 */
export function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Mengambil konfigurasi backup saat ini dari database
 */
export function getBackupConfig() {
    const row = db.prepare('SELECT * FROM backup_configs WHERE id = 1').get();
    return row || {
        id: 1,
        schedule: 'daily',
        time_wib: '00:00',
        telegram_enabled: 0,
        telegram_bot_token: '',
        telegram_chat_id: '',
        waha_enabled: 0,
        waha_api_url: '',
        waha_session: 'default',
        waha_target_number: '',
        last_backup_time: null,
        last_backup_status: null,
        last_backup_message: null
    };
}

/**
 * Menyimpan konfigurasi backup ke database
 */
export function updateBackupConfig(data) {
    const stmt = db.prepare(`
        UPDATE backup_configs SET
            schedule = COALESCE(?, schedule),
            time_wib = COALESCE(?, time_wib),
            telegram_enabled = COALESCE(?, telegram_enabled),
            telegram_bot_token = COALESCE(?, telegram_bot_token),
            telegram_chat_id = COALESCE(?, telegram_chat_id),
            waha_enabled = COALESCE(?, waha_enabled),
            waha_api_url = COALESCE(?, waha_api_url),
            waha_session = COALESCE(?, waha_session),
            waha_target_number = COALESCE(?, waha_target_number),
            updated_at = datetime('now', 'localtime')
        WHERE id = 1
    `);

    stmt.run(
        data.schedule,
        data.time_wib,
        data.telegram_enabled !== undefined ? (data.telegram_enabled ? 1 : 0) : null,
        data.telegram_bot_token !== undefined ? data.telegram_bot_token.trim() : null,
        data.telegram_chat_id !== undefined ? data.telegram_chat_id.trim() : null,
        data.waha_enabled !== undefined ? (data.waha_enabled ? 1 : 0) : null,
        data.waha_api_url !== undefined ? data.waha_api_url.trim().replace(/\/+$/, '') : null,
        data.waha_session !== undefined ? (data.waha_session.trim() || 'default') : null,
        data.waha_target_number !== undefined ? data.waha_target_number.trim() : null
    );

    return getBackupConfig();
}

/**
 * Mengambil ringkasan statistik database & file fisik
 */
export function getDatabaseStats() {
    let dbSize = 0;
    try {
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            dbSize = stats.size;
        }
    } catch (e) {
        console.error('Gagal membaca ukuran database:', e);
    }

    const totalAssets = db.prepare('SELECT COUNT(*) as count FROM assets').get()?.count || 0;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get()?.count || 0;
    const totalAuditLogs = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get()?.count || 0;
    const totalAtkItems = db.prepare('SELECT COUNT(*) as count FROM atk_items').get()?.count || 0;

    // Hitung jumlah file arsip yang tersimpan
    let backupFilesCount = 0;
    try {
        if (fs.existsSync(backupsDir)) {
            backupFilesCount = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db')).length;
        }
    } catch (e) {
        // ignore
    }

    const config = getBackupConfig();

    return {
        dbPath,
        dbSize,
        dbSizeFormatted: formatBytes(dbSize),
        counts: {
            assets: totalAssets,
            users: totalUsers,
            auditLogs: totalAuditLogs,
            atkItems: totalAtkItems,
            storedBackups: backupFilesCount
        },
        config
    };
}

/**
 * Menghasilkan snapshot database SQLite WAL yang aman dan bebas corrupt
 */
export async function createDatabaseSnapshot() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const fileName = `simtik_backup_${dateStr}_${timeStr}.db`;
    const filePath = path.join(backupsDir, fileName);

    // Gunakan fitur native backup better-sqlite3 untuk integritas WAL
    await db.backup(filePath);

    const stats = fs.statSync(filePath);
    return {
        filePath,
        fileName,
        fileSize: stats.size,
        fileSizeFormatted: formatBytes(stats.size),
        timestamp: now.toISOString()
    };
}

/**
 * Mengirim pesan / dokumen ke Telegram Bot
 */
export async function sendTelegramMessage(botToken, chatId, messageText, filePath = null) {
    if (!botToken || !chatId) {
        throw new Error('Bot Token dan Chat ID Telegram wajib diisi!');
    }

    if (filePath && fs.existsSync(filePath)) {
        // Kirim dokumen via multipart/form-data
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', messageText);
        formData.append('parse_mode', 'Markdown');
        
        const blob = new Blob([fileBuffer], { type: 'application/x-sqlite3' });
        formData.append('document', blob, fileName);

        const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
        const res = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!data.ok) {
            throw new Error(data.description || 'Gagal mengirim berkas ke Telegram.');
        }
        return data;
    } else {
        // Kirim pesan teks saja
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });

        const data = await res.json();
        if (!data.ok) {
            throw new Error(data.description || 'Gagal mengirim pesan ke Telegram.');
        }
        return data;
    }
}

/**
 * Mengirim pesan / dokumen via WAHA (WhatsApp HTTP API)
 */
export async function sendWahaMessage(apiUrl, session, targetNumber, messageText, filePath = null) {
    if (!apiUrl || !targetNumber) {
        throw new Error('URL Server WAHA dan Nomor Tujuan WhatsApp wajib diisi!');
    }

    const cleanBaseUrl = apiUrl.trim().replace(/\/+$/, '');
    const cleanSession = session ? session.trim() : 'default';
    
    // Normalisasi chatId: pastikan ada @c.us atau @g.us
    let cleanChatId = targetNumber.trim().replace(/[^0-9@a-zA-Z._-]/g, '');
    if (!cleanChatId.includes('@')) {
        // Jika berawalan 0, ubah ke 62
        if (cleanChatId.startsWith('0')) {
            cleanChatId = '62' + cleanChatId.slice(1);
        }
        cleanChatId = `${cleanChatId}@c.us`;
    }

    if (filePath && fs.existsSync(filePath)) {
        // Kirim berkas via WAHA /api/sendFile
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const formData = new FormData();
        formData.append('session', cleanSession);
        formData.append('chatId', cleanChatId);
        formData.append('caption', messageText);

        const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
        formData.append('file', blob, fileName);

        const url = `${cleanBaseUrl}/api/sendFile`;
        const res = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`WAHA Server Error (${res.status}): ${errText}`);
        }

        return await res.json().catch(() => ({ success: true }));
    } else {
        // Kirim pesan teks via WAHA /api/sendText
        const url = `${cleanBaseUrl}/api/sendText`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session: cleanSession,
                chatId: cleanChatId,
                text: messageText
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`WAHA Server Error (${res.status}): ${errText}`);
        }

        return await res.json().catch(() => ({ success: true }));
    }
}

/**
 * Membersihkan cadangan lama (hanya menyimpan 10 arsip terbaru)
 */
function pruneOldBackups() {
    try {
        if (!fs.existsSync(backupsDir)) return;
        const files = fs.readdirSync(backupsDir)
            .filter(f => f.startsWith('simtik_backup_') && f.endsWith('.db'))
            .map(f => {
                const fullPath = path.join(backupsDir, f);
                return {
                    file: f,
                    path: fullPath,
                    mtime: fs.statSync(fullPath).mtime.getTime()
                };
            })
            .sort((a, b) => b.mtime - a.mtime); // descending (terbaru di atas)

        // Hapus file yang melebihi batas 10 file
        if (files.length > 10) {
            const toDelete = files.slice(10);
            for (const item of toDelete) {
                try {
                    fs.unlinkSync(item.path);
                } catch (e) {
                    // ignore
                }
            }
        }
    } catch (err) {
        console.error('Gagal merapikan arsip cadangan lama:', err);
    }
}

/**
 * Eksekusi Lengkap Pencadangan (Snapshot + Notifikasi Saluran Aktif)
 */
export async function runFullBackup(isManual = false) {
    const startTime = new Date();
    const config = getBackupConfig();

    try {
        // 1. Ambil snapshot SQLite
        const snapshot = await createDatabaseSnapshot();
        const stats = getDatabaseStats();

        const timeStrWib = startTime.toLocaleString('id-ID', {
            dateStyle: 'full',
            timeStyle: 'medium',
            timeZone: 'Asia/Jakarta'
        });

        const reportCaption = [
            `💾 *LAPORAN CADANGAN BASIS DATA (BACKUP) SIM-TIK*`,
            `🏛️ *Instansi*: Inspektorat Daerah Kabupaten Trenggalek`,
            `📅 *Waktu*: ${timeStrWib} WIB`,
            `📁 *Berkas*: \`${snapshot.fileName}\``,
            `📦 *Ukuran*: ${snapshot.fileSizeFormatted}`,
            `⚙️ *Tipe*: ${isManual ? 'Manual oleh Administrator' : 'Otomatis Terjadwal'}`,
            ``,
            `📊 *Statistik Data Terkini*:`,
            `• Inventaris Aset Tetap: ${stats.counts.assets} unit`,
            `• Pegawai / ASN Aktif: ${stats.counts.users} pegawai`,
            `• Log Audit Keamanan: ${stats.counts.auditLogs} entri`,
            `• Persediaan ATK Logistik: ${stats.counts.atkItems} item`,
            ``,
            `✅ *Status*: Berhasil dibuat dengan integritas WAL SQLite.`
        ].join('\n');

        const channelsUsed = [];

        // 2. Kirim ke Telegram jika aktif
        if (config.telegram_enabled && config.telegram_bot_token && config.telegram_chat_id) {
            try {
                await sendTelegramMessage(
                    config.telegram_bot_token,
                    config.telegram_chat_id,
                    reportCaption,
                    snapshot.filePath
                );
                channelsUsed.push('Telegram Bot');
            } catch (tgErr) {
                console.error('[BACKUP_TELEGRAM_ERROR]', tgErr.message);
                channelsUsed.push(`Telegram Gagal (${tgErr.message})`);
            }
        }

        // 3. Kirim ke WAHA jika aktif
        if (config.waha_enabled && config.waha_api_url && config.waha_target_number) {
            try {
                await sendWahaMessage(
                    config.waha_api_url,
                    config.waha_session,
                    config.waha_target_number,
                    reportCaption,
                    snapshot.filePath
                );
                channelsUsed.push('WhatsApp (WAHA)');
            } catch (waErr) {
                console.error('[BACKUP_WAHA_ERROR]', waErr.message);
                channelsUsed.push(`WAHA Gagal (${waErr.message})`);
            }
        }

        // 4. Bersihkan file arsip lama
        pruneOldBackups();

        const channelSummary = channelsUsed.length > 0 ? channelsUsed.join(', ') : 'Arsip Lokal Saja';
        const successMessage = `Cadangan berhasil dibuat (${snapshot.fileName}). Saluran: ${channelSummary}.`;

        // 5. Perbarui status di tabel backup_configs
        db.prepare(`
            UPDATE backup_configs SET
                last_backup_time = datetime('now', 'localtime'),
                last_backup_status = 'Sukses',
                last_backup_message = ?
            WHERE id = 1
        `).run(successMessage);

        return {
            success: true,
            snapshot,
            message: successMessage,
            channels: channelsUsed
        };
    } catch (err) {
        console.error('[RUN_BACKUP_FATAL]', err);
        const errorMessage = `Gagal membuat cadangan: ${err.message}`;

        db.prepare(`
            UPDATE backup_configs SET
                last_backup_time = datetime('now', 'localtime'),
                last_backup_status = 'Gagal',
                last_backup_message = ?
            WHERE id = 1
        `).run(errorMessage);

        throw err;
    }
}

/**
 * Background Scheduler Otomatis
 * Memeriksa jadwal setiap 60 detik tanpa dependensi eksternal
 */
let schedulerIntervalId = null;
let lastExecutedDate = null;

export function initBackupScheduler() {
    if (schedulerIntervalId) {
        clearInterval(schedulerIntervalId);
    }

    schedulerIntervalId = setInterval(async () => {
        try {
            const config = getBackupConfig();
            if (!config || config.schedule === 'off') return;

            const now = new Date();
            // Waktu lokal dalam jam & menit WIB
            const currentHours = String(now.getHours()).padStart(2, '0');
            const currentMinutes = String(now.getMinutes()).padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;
            const targetTimeStr = config.time_wib || '00:00';

            const todayStr = now.toISOString().split('T')[0];

            // Cek apakah waktu saat ini sesuai target waktu
            if (currentTimeStr === targetTimeStr && lastExecutedDate !== todayStr) {
                const dayOfWeek = now.getDay(); // 0 = Minggu
                const dateOfMonth = now.getDate(); // 1-31

                let shouldRun = false;
                if (config.schedule === 'daily') {
                    shouldRun = true;
                } else if (config.schedule === 'weekly' && dayOfWeek === 0) { // Setiap Minggu
                    shouldRun = true;
                } else if (config.schedule === 'monthly' && dateOfMonth === 1) { // Tanggal 1 setiap bulan
                    shouldRun = true;
                }

                if (shouldRun) {
                    lastExecutedDate = todayStr;
                    console.log(`[BACKUP_SCHEDULER] Menjalankan pencadangan terjadwal (${config.schedule}) pada ${currentTimeStr} WIB...`);
                    await runFullBackup(false);
                }
            }
        } catch (e) {
            console.error('[BACKUP_SCHEDULER_ERROR]', e.message);
        }
    }, 60000); // 60 detik

    console.log('⏰ SIM-TIK Backup Scheduler aktif.');
}
