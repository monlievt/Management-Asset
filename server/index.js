// server/index.js
// Main Express Application for SIM-TIK Inspektorat Kabupaten Trenggalek
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Muat variabel lingkungan
dotenv.config();

import { initDatabase } from './database.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inisialisasi Database SQLite WAL
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// 1. Security Headers (AGENTS.md)
app.use(helmet({
    contentSecurityPolicy: false, // Ditangani oleh Nginx di production
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Allowlist (AGENTS.md)
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// 4. Static Uploads Serving
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir, {
    maxAge: '1d',
    setHeaders: (res) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
}));

// 5. Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'SIM-TIK Backend API',
        agency: 'Inspektorat Kabupaten Trenggalek',
        version: '2.4.0-enterprise',
        database: 'SQLite WAL Mode',
        timestamp: new Date().toISOString()
    });
});

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// 7. Global Error Handler (AGENTS.md: Never leak stack traces to client)
app.use((err, req, res, next) => {
    console.error('[UNHANDLED_ERROR]', err);
    return res.status(500).json({
        success: false,
        error: 'Terjadi kesalahan internal pada server.',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Silakan hubungi Administrator TIK.'
    });
});

// Jalankan Server jika dieksekusi langsung
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 SIM-TIK Backend Enterprise Aktif di Port: ${PORT}`);
        console.log(`🏛️  Instansi : Inspektorat Kabupaten Trenggalek`);
        console.log(`💾 Database : SQLite WAL (data/simtik.db)`);
        console.log(`🛡️  Keamanan : HttpOnly Session, Helmet, Rate Limiting`);
        console.log(`====================================================`);
    });
}

export default app;
