import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Code splitting: pisahkan vendor, charts, dan router ke chunk terpisah
    // Ini mengurangi ukuran bundle utama dari ~694KB menjadi ~200KB per chunk
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-pdf': ['jspdf', 'html2canvas'],
          'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
        }
      }
    },
    // Naikkan batas warning chunk ke 600KB (default 500KB)
    chunkSizeWarningLimit: 600,
  }
})
