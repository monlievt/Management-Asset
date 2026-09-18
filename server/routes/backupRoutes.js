// server/routes/backupRoutes.js
// Rute API Manajemen Cadangan Data & Integrasi Telegram/WAHA
// Inspektorat Daerah Kabupaten Trenggalek
import express from 'express';
import fs from 'fs';
import path from 'path';
import { requireAuth, requireRole } from '../auth.js';
import {
    getDatabaseStats,
    updateBackupConfig,
    createDatabaseSnapshot,
    runFullBackup,
    sendTelegramMessage,
    sendWahaMessage
} from '../services/backupService.js';

const router = express.Router();

/**
 * 1. GET /api/backup/config
 * Mengambil ringkasan data, kapasitas memori, dan konfigurasi saat ini
 */
router.get('/config', requireAuth, requireRole(['superadmin']), async (req, res) => {
    try {
        const stats = getDatabaseStats();
        return res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('[GET_BACKUP_CONFIG_ERROR]', err);
        return res.status(500).json({
            success: false,
            message: 'Gagal memuat konfigurasi pencadangan data: ' + err.message
        });
    }
});

/**
 * 2. POST /api/backup/config
 * Menyimpan pembaruan konfigurasi jadwal dan kredensial Telegram/WAHA
 */
router.post('/config', requireAuth, requireRole(['superadmin']), async (req, res) => {
    try {
        const updated = updateBackupConfig(req.body);
        return res.json({
            success: true,
            message: 'Pengaturan pencadangan berhasil disimpan.',
            data: updated
        });
    } catch (err) {
        console.error('[SAVE_BACKUP_CONFIG_ERROR]', err);
        return res.status(500).json({
            success: false,
            message: 'Gagal menyimpan pengaturan: ' + err.message
        });
    }
});

/**
 * 3. POST /api/backup/run
 * Memicu eksekusi pencadangan manual segera dan pengiriman ke saluran aktif
 */
router.post('/run', requireAuth, requireRole(['superadmin']), async (req, res) => {
    try {
        const result = await runFullBackup(true);
        return res.json({
            success: true,
            message: result.message,
            data: result
        });
    } catch (err) {
        console.error('[RUN_MANUAL_BACKUP_ERROR]', err);
        return res.status(500).json({
            success: false,
            message: 'Pencadangan gagal dieksekusi: ' + err.message
        });
    }
});

/**
 * 4. POST /api/backup/test-telegram
 * Uji kirim pesan teks percobaan ke Telegram Bot
 */
router.post('/test-telegram', requireAuth, requireRole(['superadmin']), async (req, res) => {
    try {
        const { botToken, chatId } = req.body;
        if (!botToken || !chatId) {
            return res.status(400).json({
                success: false,
                message: 'Bot Token dan Chat ID Telegram wajib diisi untuk pengujian.'
            });
        }

        const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Jakarta' });
        const testMessage = [
            `🔔 *UJI KONEKSI NOTIFIKASI TELEGRAM*`,
            `🏛️ *SIM-TIK Inspektorat Kabupaten Trenggalek*`,
            `📅 *Waktu*: ${nowStr} WIB`,
            ``,
            `✅ Bot Telegram berhasil terhubung dengan server SIM-TIK! Notifikasi dan berkas cadangan database siap dikirimkan ke saluran ini secara otomatis.`
        ].join('\n');

        const result = await sendTelegramMessage(botToken, chatId, testMessage);
        return res.json({
            success: true,
            message: 'Pesan pengujian berhasil dikirimkan ke Telegram!',
            data: result
        });
    } catch (err) {
        console.error('[TEST_TELEGRAM_ERROR]', err);
        return res.status(400).json({
            success: false,
            message: 'Uji kirim Telegram gagal: ' + err.message
        });
    }
});

/**
 * 5. POST /api/backup/test-waha
 * Uji kirim pesan teks percobaan via WAHA WhatsApp API
 */
router.post('/test-waha', requireAuth, requireRole(['superadmin']), async (req, res) => {
    try {
        const { apiUrl, session, targetNumber } = req.body;
        if (!apiUrl || !targetNumber) {
            return res.status(400).json({
                success: false,
                message: 'URL Server WAHA dan Nomor WhatsApp tujuan wajib diisi untuk pengujian.'
            });
        }

        const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Jakarta' });
        const testMessage = [
            `🔔 *UJI KONEKSI NOTIFIKASI WHATSAPP (WAHA)*`,
            `🏛️ *SIM-TIK Inspektorat Kabupaten Trenggalek*`,
            `📅 *Waktu*: ${nowStr} WIB`,
            ``,
            `✅ Server WAHA berhasil terhubung dengan SIM-TIK! Notifikasi status cadangan data siap dikirimkan secara otomatis.`
        ].join('\n');

        const result = await sendWahaMessage(apiUrl, session, targetNumber, testMessage);
        return res.json({
            success: true,
            message: 'Pesan pengujian berhasil dikirimkan ke WhatsApp via WAHA!',
            data: result
        });
    } catch (err) {
        console.error('[TEST_WAHA_ERROR]', err);
        return res.status(400).json({
            success: false,
            message: 'Uji kirim WAHA gagal: ' + err.message
        });
    }
});

/**
 * 6. GET /api/backup/download
 * Mengunduh snapshot database terkini langsung ke peramban komputer
 */
router.get('/download', requireAuth, requireRole(['superadmin']), async (req, res) => {
    try {
        // Buat snapshot instan
        const snapshot = await createDatabaseSnapshot();
        if (!fs.existsSync(snapshot.filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Berkas cadangan tidak ditemukan.'
            });
        }

        res.setHeader('Content-Type', 'application/x-sqlite3');
        res.setHeader('Content-Disposition', `attachment; filename="${snapshot.fileName}"`);
        res.setHeader('Content-Length', snapshot.fileSize);

        const fileStream = fs.createReadStream(snapshot.filePath);
        fileStream.pipe(res);
    } catch (err) {
        console.error('[DOWNLOAD_BACKUP_ERROR]', err);
        return res.status(500).json({
            success: false,
            message: 'Gagal mengunduh cadangan database: ' + err.message
        });
    }
});

export default router;
