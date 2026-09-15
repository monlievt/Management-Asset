import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

const EMPLOYEE_LIST = [
    "Ir. WIJIONO, ST,M.Mkes",
    "SIGIT PRASETYO,S.IP.MAP",
    "SUYATNO,SH",
    "DIDIK AGIT W, SE.MAP",
    "NUGRAHENI RAHAYU S, SE,M.Si",
    "DIDIK SUPRIYANTO,S.Sos.M.Si",
    "EKO DARMINTO,SE.M.Si",
    "Ir. AGUNG SRIYONO",
    "DJOKO PURNOMO,SE",
    "AGUNG YUDYANA, S.H., M.H.",
    "DWI SUCI RAHAYU, SE.",
    "Ir. BENNO HERA T.",
    "TOTOK SUBIANTO, SE",
    "BASORI, ST",
    "RIKE ARSHINTA MAYASARI,  ST,M.A.P",
    "WINDU SETIYADI, ST",
    "NIKEN SRI PALUPI,SE",
    "HAPPY RAHMAWATI,SE",
    "ENI SUMAWATI, SE",
    "UTARI PRASETYANI,SE",
    "FENY RATNAWATI,SE",
    "UMROTUL MAHFUDHOH,  S.Ak.",
    "SIGIH SETIONO,  S.Ak.",
    "NANDITO MONLIEV PASSA,S.Kom",
    "SULIKAH,S.TP.,M.A.P",
    "PUSPANAGARI PUTRI RIDANTI,S.Ak",
    "CHOIRUNNISA,S.A.",
    "FEREN FEBRIYANTI,S.Ak",
    "ANANDA SEPTA WILLYANDA,S.E.",
    "ADHI TRIYANTO, S.Tr.I.P",
    "FERYAL NADA AZIZAH,A.Md.Ak",
    "NADIAH FIRDAUSSINTA D,A.Md.Ak",
    "CHRIS TRYANTO MARTA P P,A,Md.Ak",
    "DESTY AYU SAPUTRI,A.Md.Ak",
    "MUHAMAD IQBAL MAULIDI,A.Md.Ak",
    "ABYADH NURUTTIMAMI FR, A.Md.Ak",
    "ANINDYA FAUZIYAH BASUKI,A.Md.Ak",
    "ANDIKA PUTRA HARDYANSYAH,A,Md.Ak",
    "MUHAMMAD IDHAM FIRDAUS,A.Md.Ak",
    "CAHYA FITRIA ARDIANI, A. Md",
    "ROEKAN, ST",
    "SULIS SETYAWATI, SE",
    "YENI KRISTUTI",
    "KATIRAN",
    "KUSNUL KOTIMAH",
    "HARYADI",
    "DYAH WIDI MRANANI, SE",
    "NANANG MARDIANTORO, S.Pd",
    "NUVENTIN ASNA PUTRI, S.Ak",
    "PUTRI PATRISIA FERNANDA, S.M.",
    "IRMALA PRASISTYA CAHYANING P, S.Ak",
    "KUKUH ARI FIRMANSYAH, S.H",
    "ZAKIATUL MUFARRIHAH, ST",
    "ERNI AGUSTINA, S.H.",
    "INDAH NABILLA HASNA, S.T.",
    "DIAH AJENG MELIASARI, S.H",
    "MOH. MUHADHIR SYAFAAT, S.T.",
    "KARTIKA KUSUMA DEWI, S.E.",
    "AJI SURYA SAKSAMA, S.T",
    "MELA ENDRIANI, S.E.",
    "YOPI ADI PRAYOGA, S.T.",
    "DEVI SELVIA, S.E.",
    "MUHAMMAD ADITYA K, S.E",
    "RORO PUTRI SETIANINGAYU,S.Tr.E",
    "TOMMY KURNIAWAN, S.E",
    "FELLIS ENRICHA PUTRI, S.Ak.",
    "FRYZA RACHMANIA M, A.Md.Kom",
    "HARMINTO",
    "SUPRIYADI",
    "APRILIYAN SUSANTO"
].sort()

export function DeviceForm({ initialData, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        brand: "",
        serial: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        status: "Available",
        assignee: "",
    })

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        }
    }, [initialData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Perangkat <span className="text-red-500">*</span></label>
                    <Input name="name" value={formData.name} onChange={handleChange} placeholder="contoh: Laptop Dell Latitude 5420" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori <span className="text-red-500">*</span></label>
                    <Input name="category" value={formData.category} onChange={handleChange} placeholder="contoh: Laptop, PC, Server, Printer" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Merek / Brand <span className="text-red-500">*</span></label>
                    <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="contoh: Dell, Lenovo, HP, Asus" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Seri / Serial Number <span className="text-red-500">*</span></label>
                    <Input name="serial" value={formData.serial} onChange={handleChange} placeholder="contoh: DL-5420-SN12345" required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tanggal Pengadaan <span className="text-red-500">*</span></label>
                    <Input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Status Perangkat <span className="text-red-500">*</span></label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="flex h-10 w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                    >
                        <option value="Available">Tersedia di Gudang (Available)</option>
                        <option value="In Use">Sedang Digunakan (In Use)</option>
                        <option value="Maintenance">Dalam Perbaikan (Maintenance)</option>
                        <option value="Retired">Afkir / Dihapus (Retired)</option>
                    </select>
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Pegawai Penanggung Jawab <span className="text-red-500">*</span></label>
                    <Input
                        list="employee-list"
                        name="assignee"
                        value={formData.assignee}
                        onChange={handleChange}
                        placeholder="Pilih atau ketik nama ASN penanggung jawab..."
                        required
                    />
                    <datalist id="employee-list">
                        {EMPLOYEE_LIST.map((name, i) => (
                            <option key={i} value={name} />
                        ))}
                    </datalist>
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit">Simpan Perangkat</Button>
            </div>
        </form>
    )
}
