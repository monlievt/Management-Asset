import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "./layouts/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Assets from "./pages/Assets"
import Devices from "./pages/Devices"
import Helpdesk from "./pages/Helpdesk"
import Login from "./pages/Login"
import ForgotPassword from "./pages/ForgotPassword"
import AuthLayout from "./layouts/AuthLayout"
import Settings from "./pages/Settings"
import StockOpname from "./pages/StockOpname"
import StockHistory from "./pages/StockHistory"
import NotFound from "./pages/NotFound"

// Halaman Baru Sesuai Permintaan Pengguna (Dedicated Pages, bukan popup)
import AssetNew from "./pages/AssetNew"
import AssetEdit from "./pages/AssetEdit"
import AssetDetailView from "./pages/AssetDetailView"
import BastPrintView from "./pages/BastPrintView"
import KirPrintView from "./pages/KirPrintView"
import AuditTrailView from "./pages/AuditTrailView"

function App() {
  return (
    <Routes>
      {/* Rute Otentikasi */}
      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Rute Cetak Dokumen Resmi (Full Page / Print Friendly) */}
      <Route path="/bast/:assetId/:custodyId" element={<BastPrintView />} />
      <Route path="/kir/:roomName" element={<KirPrintView />} />

      {/* Rute Utama Aplikasi dalam Dashboard Layout */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        {/* Modul Inventaris Aset (Dedicated Pages) */}
        <Route path="assets/inventory" element={<Assets title="Inventaris Aset" />} />
        <Route path="assets/inventory/new" element={<AssetNew />} />
        <Route path="assets/inventory/:id" element={<AssetDetailView />} />
        <Route path="assets/inventory/:id/edit" element={<AssetEdit />} />

        {/* Alias rute /assets langsung ke /assets/inventory */}
        <Route path="assets" element={<Navigate to="/assets/inventory" replace />} />
        <Route path="assets/new" element={<AssetNew />} />
        <Route path="assets/:id" element={<AssetDetailView />} />
        <Route path="assets/:id/edit" element={<AssetEdit />} />

        {/* Modul Perangkat TIK */}
        <Route path="assets/devices" element={<Devices title="Perangkat TIK" />} />
        <Route path="assets/devices/new" element={<AssetNew />} />
        <Route path="assets/devices/:id" element={<AssetDetailView />} />
        <Route path="assets/devices/:id/edit" element={<AssetEdit />} />

        {/* Modul Stok Opname ATK */}
        <Route path="assets/atk" element={<StockOpname />} />
        <Route path="assets/atk/history" element={<StockHistory />} />

        {/* Modul Helpdesk, Audit Trail & Pengaturan */}
        <Route path="helpdesk" element={<Helpdesk />} />
        <Route path="audit-trail" element={<AuditTrailView />} />
        <Route path="settings" element={<Settings />} />

        {/* Catch-all route untuk halaman tidak ditemukan di dalam dashboard */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Catch-all global */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
