import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { useState } from "react"

export function TicketForm({ onCancel, onSubmit, initialData }) {
    const [formData, setFormData] = useState(initialData || {
        subject: "",
        requester: "",
        priority: "Medium",
        description: ""
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-secondary-900 dark:text-secondary-100">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-secondary-900 dark:text-secondary-200">Perihal / Masalah</label>
                <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="Contoh: Printer kantor tidak merespon" required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-secondary-900 dark:text-secondary-200">Nama Pelapor / Pegawai</label>
                <Input name="requester" value={formData.requester} onChange={handleChange} placeholder="Contoh: Irban Wilayah I" required />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-secondary-900 dark:text-secondary-200">Tingkat Prioritas</label>
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-secondary-200 bg-white dark:bg-secondary-900 dark:border-secondary-700 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                    <option value="Low">Rendah</option>
                    <option value="Medium">Sedang</option>
                    <option value="High">Tinggi / Mendesak</option>
                </select>
            </div>
            {initialData && (
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-secondary-900 dark:text-secondary-200">Status Penanganan</label>
                    <select
                        name="status"
                        value={formData.status || "Open"}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-secondary-200 bg-white dark:bg-secondary-900 dark:border-secondary-700 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                        <option value="Open">Menunggu Tindak Lanjut</option>
                        <option value="In Progress">Sedang Dikerjakan</option>
                        <option value="Resolved">Selesai Diperbaiki</option>
                        <option value="Closed">Ditutup / Selesai</option>
                    </select>
                </div>
            )}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-secondary-900 dark:text-secondary-200">Deskripsi Lengkap Kendala</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-secondary-200 bg-white dark:bg-secondary-900 dark:border-secondary-700 dark:text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    placeholder="Tuliskan detail kendala, lokasi ruangan, atau nomor seri perangkat..."
                />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit">{initialData ? "Simpan Perubahan" : "Kirim Tiket"}</Button>
            </div>
        </form>
    )
}
