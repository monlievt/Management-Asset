// server/routes/uploadRoutes.js
// Secure File Upload Handler complying with AGENTS.md
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { requireAuth } from '../auth.js';

const router = express.Router();

const UPLOAD_BASE = path.resolve(process.cwd(), 'uploads');
const PHOTOS_DIR = path.join(UPLOAD_BASE, 'photos');
const DOCS_DIR = path.join(UPLOAD_BASE, 'documents');

if (!fs.existsSync(PHOTOS_DIR)) fs.mkdirSync(PHOTOS_DIR, { recursive: true });
if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

// Allowed MIME types
const ALLOWED_MIME = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf'
};

// Multer in-memory storage to validate magic bytes before writing to disk
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * Validasi Magic Bytes File (AGENTS.md Requirement)
 */
function validateMagicBytes(buffer, mimetype) {
    if (!buffer || buffer.length < 4) return false;

    // JPEG: FF D8 FF
    if (mimetype === 'image/jpeg') {
        return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
    }
    // PNG: 89 50 4E 47
    if (mimetype === 'image/png') {
        return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    }
    // WEBP: RIFF .... WEBP
    if (mimetype === 'image/webp') {
        const header = buffer.toString('ascii', 0, 4);
        const format = buffer.toString('ascii', 8, 12);
        return header === 'RIFF' && format === 'WEBP';
    }
    // PDF: %PDF
    if (mimetype === 'application/pdf') {
        return buffer.toString('ascii', 0, 4) === '%PDF';
    }

    return false;
}

/**
 * POST /api/upload
 * Unggah berkas gambar aset atau scan PDF dokumen SP2D
 */
router.post('/', requireAuth, upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Tidak ada berkas yang diunggah.' });
        }

        const { mimetype, buffer, originalname } = req.file;

        // 1. Cek tipe MIME yang diizinkan
        if (!ALLOWED_MIME[mimetype]) {
            return res.status(400).json({
                success: false,
                message: 'Format berkas tidak diizinkan. Hanya menerima JPG, PNG, WEBP, atau PDF.'
            });
        }

        // 2. Cek integritas Magic Bytes fisik berkas
        if (!validateMagicBytes(buffer, mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Integritas berkas tidak valid atau rusak (MIME spoofing detected).'
            });
        }

        // 3. Rename ke UUID acak (Mencegah Path Traversal & Penimpaan File)
        const ext = ALLOWED_MIME[mimetype];
        const uuidName = `${crypto.randomUUID()}${ext}`;
        const isPdf = mimetype === 'application/pdf';
        const targetDir = isPdf ? DOCS_DIR : PHOTOS_DIR;
        const relativeUrl = `/uploads/${isPdf ? 'documents' : 'photos'}/${uuidName}`;
        const targetPath = path.join(targetDir, uuidName);

        // Tulis berkas ke disk
        fs.writeFileSync(targetPath, buffer);

        return res.json({
            success: true,
            message: 'Berkas berhasil diunggah dengan aman.',
            fileName: uuidName,
            originalName: originalname,
            fileUrl: relativeUrl,
            fileSize: buffer.length,
            mimeType: mimetype
        });
    } catch (err) {
        console.error('[UPLOAD_FILE_ERROR]', err);
        return res.status(500).json({ success: false, message: 'Gagal mengunggah berkas.' });
    }
});

export default router;
