'use client';

import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { getStoredUserProfiles, saveStoredUserProfiles, type UserProfile } from '@/lib/userProfiles';
import UserManagementView from './UserManagementView';

interface PropertySettings {
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  allowanceLaundryKg: number;
}

interface InventoryMaster {
  id: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
}

interface ExpenseCategoryMaster {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface VendorMaster {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
}

interface EmployeeMaster {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface OwnerMaster {
  id: string;
  name: string;
  email: string;
  phone: string;
  sharePercent: number;
  bankAccount: string;
}

interface FacilityMaster {
  id: string;
  name: string;
  category: 'KAMAR' | 'BANGUNAN' | 'LAYANAN_ADDON';
  icon: string;
  isIncludedInRent: boolean;
  additionalMonthlyFee: number;
  description: string;
}

const INITIAL_PROPERTY: PropertySettings = {
  propertyName: 'KosanKu Pro Premium Residence',
  propertyAddress: 'Jl. Kosan Modern No. 88, Jakarta Selatan',
  propertyPhone: '0812-3456-7890',
  bankName: 'BCA (Bank Central Asia)',
  bankAccount: '8830-1928-44',
  bankHolder: 'PT KosanKu Pro Indonesia',
  allowanceLaundryKg: 5,
};

const INITIAL_INVENTORY_MASTER: InventoryMaster[] = [
  { id: 'MST-INV-01', name: 'Refill Galon Aqua 19L', category: 'Utilitas Air', unit: 'Galon', minStock: 3 },
  { id: 'MST-INV-02', name: 'Tabung Gas LPG 3kg', category: 'Utilitas Gas', unit: 'Tabung', minStock: 2 },
  { id: 'MST-INV-03', name: 'Bohlam Lampu LED 12W', category: 'Maintenance', unit: 'Pcs', minStock: 5 },
  { id: 'MST-INV-04', name: 'Remote AC Original', category: 'Elektronik', unit: 'Pcs', minStock: 2 },
  { id: 'MST-INV-05', name: 'Sprei Set Clean', category: 'Linen / Laundry', unit: 'Set', minStock: 4 },
  { id: 'MST-INV-06', name: 'Kunci Duplikat Card Key', category: 'Keamanan', unit: 'Pcs', minStock: 5 },
];

const INITIAL_EXPENSE_CATEGORIES: ExpenseCategoryMaster[] = [
  { id: 'CAT-01', code: 'listrik', name: 'Listrik & PLN', description: 'Tagihan listrik gedung & token kamar' },
  { id: 'CAT-02', code: 'air', name: 'Air PDAM & Pompa', description: 'Tagihan air PDAM dan perawatan pompa' },
  { id: 'CAT-03', code: 'internet', name: 'Wi-Fi & Internet', description: 'Langganan internet bandwith tinggi' },
  { id: 'CAT-04', code: 'perbaikan', name: 'Perbaikan & Maintenance', description: 'Servis AC, pompa, perabotan, pengecatan' },
  { id: 'CAT-05', code: 'lain_lain', name: 'Lain-lain & Kebersihan', description: 'Iuran kebersihan, plastik sampah, perlengkapan' },
];

const INITIAL_VENDORS: VendorMaster[] = [
  { id: 'VND-01', name: 'Depot Air & Gas Suci', type: 'Refill Galon & Gas', phone: '0812-9988-7711', address: 'Jl. Pemuda No. 12' },
  { id: 'VND-02', name: 'Laundry Express Kosan', type: 'Jasa Laundry Kiloan', phone: '0813-4455-6677', address: 'Jl. Anggrek No. 45' },
  { id: 'VND-03', name: 'Toko Bangunan Subur Teknik', type: 'Supplier Maintenance', phone: '0815-1122-3344', address: 'Jl. Raya Kosan No. 8' },
];

const INITIAL_EMPLOYEES: EmployeeMaster[] = [
  { id: 'EMP-01', name: 'Bambang Prasetyo', email: 'staf@kosanku.com', phone: '0813-5544-3322', position: 'Teknisi & Maintenance', salary: 3500000, status: 'ACTIVE' },
  { id: 'EMP-02', name: 'Siti Aminah', email: 'siti@kosanku.com', phone: '0812-4433-2211', position: 'Admin Operasional', salary: 3800000, status: 'ACTIVE' },
  { id: 'EMP-03', name: 'Rudi Hartono', email: 'rudi@kosanku.com', phone: '0815-9988-7766', position: 'Staf Kebersihan & Kurir', salary: 3000000, status: 'ACTIVE' },
];

const INITIAL_OWNERS: OwnerMaster[] = [
  { id: 'OWN-01', name: 'Ibu Dewi Tri Oktariani (Owner Utama)', email: 'owner@kosanku.pro', phone: '0811-9988-7766', sharePercent: 70, bankAccount: 'BCA 8830-1928-44' },
  { id: 'OWN-02', name: 'Ibu Rina (Co-Owner / Investor)', email: 'rina@kosanku.com', phone: '0811-2233-4455', sharePercent: 30, bankAccount: 'Mandiri 127-00-998877' },
];

const INITIAL_FACILITIES: FacilityMaster[] = [
  { id: 'FAC-01', name: 'AC 1 PK (Inverter)', category: 'KAMAR', icon: '❄️', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'AC Daikin Inverter 1 PK per kamar, service rutin 3 bulan sekali' },
  { id: 'FAC-02', name: 'Wi-Fi Internet Dedicated', category: 'BANGUNAN', icon: '📶', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Bandwidth 100Mbps dedicated untuk seluruh penghuni' },
  { id: 'FAC-03', name: 'Kamar Mandi Dalam (Shower)', category: 'KAMAR', icon: '🚿', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'KM dalam dengan shower, water heater & exhaust fan' },
  { id: 'FAC-04', name: 'Parkir Motor / Mobil', category: 'BANGUNAN', icon: '🏍️', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Area parkir terlindung CCTV 24 jam' },
  { id: 'FAC-05', name: 'Jasa Laundry Kiloan', category: 'LAYANAN_ADDON', icon: '👕', isIncludedInRent: false, additionalMonthlyFee: 0, description: 'Kuota 5kg/bulan gratis, kelebihan Rp 5.000/kg via vendor Laundry Express' },
  { id: 'FAC-06', name: 'Refill Galon Air Minum', category: 'LAYANAN_ADDON', icon: '💧', isIncludedInRent: false, additionalMonthlyFee: 0, description: 'Refill galon Aqua 19L via Depot Suci, Rp 10.000/galon' },
  { id: 'FAC-07', name: 'Smart Door Lock (NFC/PIN)', category: 'KAMAR', icon: '🔐', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Kunci digital NFC & PIN dinamis, dapat diubah sendiri via aplikasi' },
  { id: 'FAC-08', name: 'CCTV 24 Jam Seluruh Area', category: 'BANGUNAN', icon: '📷', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Kamera CCTV full HD di lorong, tangga, dan area parkir' },
  { id: 'FAC-09', name: 'Kasur Springbed + Lemari', category: 'KAMAR', icon: '🛏️', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Kasur springbed 120x200cm, lemari 2 pintu, meja kerja & kursi' },
  { id: 'FAC-10', name: 'Refill Gas LPG 3kg', category: 'LAYANAN_ADDON', icon: '🔥', isIncludedInRent: false, additionalMonthlyFee: 0, description: 'Refill gas LPG 3kg via Depot Suci, Rp 25.000/tabung' },
];

export interface InspectionItemMaster {
  id: string;
  name: string;
  category: 'KUNCI' | 'ELEKTRONIK' | 'FURNITUR' | 'SANITASI' | 'DINDING_LANTAI' | 'LAINNYA';
  icon: string;
  description: string;
}

export const INITIAL_INSPECTION_ITEMS: InspectionItemMaster[] = [
  { id: 'CHK-01', name: 'Kunci Kamar & Card Key Access (RFID)', category: 'KUNCI', icon: '🔑', description: 'Kelengkapan 2 kunci fisik dan 1 card key RFID' },
  { id: 'CHK-02', name: 'Remote AC Original & Baterai Dingin Normal', category: 'ELEKTRONIK', icon: '❄️', description: 'Remote berfungsi, display menyala, AC dingin normal' },
  { id: 'CHK-03', name: 'Kasur Springbed, Bantal & Seprei Bersih', category: 'FURNITUR', icon: '🛏️', description: 'Kondisi busa/per utuh, sarung bantal & sprei bersih tanpa noda' },
  { id: 'CHK-04', name: 'Lemari Pakaian & Cermin Dinding Mulus', category: 'FURNITUR', icon: '🚪', description: 'Pintu lemari lancar, kunci lemari ada, cermin tidak retak' },
  { id: 'CHK-05', name: 'Kran Wastafel, Shower & Water Heater Normal', category: 'SANITASI', icon: '🚿', description: 'Debit air kencang, tidak ada kebocoran, air panas menyala' },
  { id: 'CHK-06', name: 'Smart TV & Remote TV Berfungsi', category: 'ELEKTRONIK', icon: '📺', description: 'Layar jernih, remote TV ada baterai, koneksi WiFi smart TV stabil' },
  { id: 'CHK-07', name: 'Cat Dinding & Kebersihan Lantai Ruangan', category: 'DINDING_LANTAI', icon: '🧹', description: 'Dinding bersih tanpa coretan/paku berlebih, lantai disapu & dipel' },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function MasterDataSettings() {
  const [property, setProperty] = useState<PropertySettings>(INITIAL_PROPERTY);
  const [inventoryMaster, setInventoryMaster] = useState<InventoryMaster[]>(INITIAL_INVENTORY_MASTER);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryMaster[]>(INITIAL_EXPENSE_CATEGORIES);
  const [vendors, setVendors] = useState<VendorMaster[]>(INITIAL_VENDORS);
  const [employees, setEmployees] = useState<EmployeeMaster[]>(INITIAL_EMPLOYEES);
  const [owners, setOwners] = useState<OwnerMaster[]>(INITIAL_OWNERS);
  
  const [facilities, setFacilities] = useState<FacilityMaster[]>(INITIAL_FACILITIES);
  const [inspectionItems, setInspectionItems] = useState<InspectionItemMaster[]>(INITIAL_INSPECTION_ITEMS);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'property' | 'employees' | 'owners' | 'inventory' | 'vendors' | 'categories' | 'facilities' | 'checkin_items'>('users');

  // Inspection Checklist Form State
  const [showAddChkModal, setShowAddChkModal] = useState(false);
  const [newChkName, setNewChkName] = useState('');
  const [newChkCategory, setNewChkCategory] = useState<InspectionItemMaster['category']>('FURNITUR');
  const [newChkIcon, setNewChkIcon] = useState('📋');
  const [newChkDesc, setNewChkDesc] = useState('');

  useEffect(() => {
    setUserProfiles(getStoredUserProfiles());
    const savedChk = localStorage.getItem('kosanku_master_inspection_items');
    if (savedChk) {
      try {
        const parsed = JSON.parse(savedChk);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInspectionItems(parsed);
        }
      } catch {}
    }
  }, []);

  // Facility form states
  const [showAddFacModal, setShowAddFacModal] = useState(false);
  const [newFacName, setNewFacName] = useState('');
  const [newFacCategory, setNewFacCategory] = useState<'KAMAR' | 'BANGUNAN' | 'LAYANAN_ADDON'>('KAMAR');
  const [newFacIcon, setNewFacIcon] = useState('🏠');
  const [newFacIncluded, setNewFacIncluded] = useState(true);
  const [newFacFee, setNewFacFee] = useState('0');
  const [newFacDesc, setNewFacDesc] = useState('');

  // Modals & Form states
  const [showAddInvModal, setShowAddInvModal] = useState(false);
  const [newInvName, setNewInvName] = useState('');
  const [newInvCat, setNewInvCat] = useState('');
  const [newInvUnit, setNewInvUnit] = useState('Pcs');
  const [newInvMinStock, setNewInvMinStock] = useState('3');

  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVndName, setNewVndName] = useState('');
  const [newVndType, setNewVndType] = useState('');
  const [newVndPhone, setNewVndPhone] = useState('');

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpPos, setNewEmpPos] = useState('Teknisi Maintenance');
  const [newEmpSalary, setNewEmpSalary] = useState('3500000');

  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false);
  const [newOwnName, setNewOwnName] = useState('');
  const [newOwnEmail, setNewOwnEmail] = useState('');
  const [newOwnPhone, setNewOwnPhone] = useState('');
  const [newOwnShare, setNewOwnShare] = useState('50');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      const savedProperty = localStorage.getItem('kosanku_master_property');
      if (savedProperty) setProperty(JSON.parse(savedProperty));
    } catch {}
  }, []);

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('kosanku_master_property', JSON.stringify(property));
    setToast('✅ PENGATURAN MASTER PROPERTI BERHASIL DISIMPAN!');
    setTimeout(() => setToast(null), 3500);
  };

  // 1. WIPE / RESET ALL MASTER DATA (Untuk Kosan Baru)
  const handleWipeAllData = () => {
    const confirmWipe = window.confirm(
      '⚠️ PERINGATAN:\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA MASTER KOSAN?\n\nSemua master kamar, inventori, karyawan, vendor, checklist, dan profil pengguna akan dikosongkan agar Anda dapat menginput data kosan baru dari nol atau via Excel.'
    );
    if (!confirmWipe) return;

    // Reset states to empty
    const blankProperty: PropertySettings = {
      propertyName: 'Kosan Baru (Belum Disetting)',
      propertyAddress: 'Alamat Kosan Baru',
      propertyPhone: '0812-0000-0000',
      bankName: 'BCA',
      bankAccount: '-',
      bankHolder: '-',
      allowanceLaundryKg: 0,
    };
    setProperty(blankProperty);
    setInventoryMaster([]);
    setExpenseCategories([]);
    setVendors([]);
    setEmployees([]);
    setOwners([]);
    setFacilities([]);
    setInspectionItems([]);
    setUserProfiles([]);

    // Clear from localStorage
    localStorage.removeItem('kosanku_master_property');
    localStorage.removeItem('kosanku_master_inspection_items');
    localStorage.setItem('kosanku_user_profiles_v2', JSON.stringify([]));

    setToast('🗑️ SEMUA DATA MASTER KOSAN LAMA BERHASIL DIKOSONGKAN! Siap untuk data baru.');
    setTimeout(() => setToast(null), 4000);
  };

  // 2. INJECT RSHS PASTEUR MASTER DATA PRESET
  const handleInjectRSHSData = () => {
    const confirmInject = window.confirm(
      '🏥 INJEKSI DATA RSHS:\nApakah Anda ingin mengisi Master Data dengan data khusus "KosanKu Premium RSHS Pasteur Bandung" (16 Kamar Medico, Profil Tim RSHS, Vendor Pasteur, Checklist Dokter)?'
    );
    if (!confirmInject) return;

    const rshsProperty: PropertySettings = {
      propertyName: 'KosanKu Premium RSHS Pasteur Bandung',
      propertyAddress: 'Jl. Pasteur No. 38 (3 Menit Jalan Kaki ke Gate 2 RSHS), Bandung',
      propertyPhone: '0811-2233-4455',
      bankName: 'BCA (Bank Central Asia)',
      bankAccount: '8830-1928-44',
      bankHolder: 'Ibu Dewi Tri Oktariani / Kos RSHS',
      allowanceLaundryKg: 5,
    };
    setProperty(rshsProperty);
    localStorage.setItem('kosanku_master_property', JSON.stringify(rshsProperty));

    const rshsEmployees: EmployeeMaster[] = [
      { id: 'EMP-01', name: 'Bambang Prasetyo', email: 'staf.rshs@kosanku.pro', phone: '0813-5544-3322', position: 'Teknisi Medico & AC', salary: 3600000, status: 'ACTIVE' },
      { id: 'EMP-02', name: 'Siti Aminah', email: 'admin.rshs@kosanku.pro', phone: '0812-4433-2211', position: 'Supervisor Operasional RSHS', salary: 4000000, status: 'ACTIVE' },
    ];
    setEmployees(rshsEmployees);

    const rshsOwners: OwnerMaster[] = [
      { id: 'OWN-01', name: 'Ibu Dewi Tri Oktariani (Owner Utama)', email: 'owner.rshs@kosanku.pro', phone: '0811-2233-4455', sharePercent: 100, bankAccount: 'BCA 8830-1928-44' },
    ];
    setOwners(rshsOwners);

    const rshsVendors: VendorMaster[] = [
      { id: 'VND-01', name: 'Depot Air & Gas Pasteur Suci', type: 'Refill Aqua & BrightGas', phone: '0812-9988-7711', address: 'Jl. Pasteur No. 12' },
      { id: 'VND-02', name: 'Laundry Express Dokter RSHS', type: 'Jasa Cuci Kiloan & Jas Lab', phone: '0813-4455-6677', address: 'Jl. Pasteur No. 45' },
    ];
    setVendors(rshsVendors);

    const rshsFacilities: FacilityMaster[] = [
      { id: 'FAC-01', name: 'AC 1 PK Daikin Inverter (Silent)', category: 'KAMAR', icon: '❄️', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'AC senyap untuk istirahat optimal dokter & koas' },
      { id: 'FAC-02', name: 'Wi-Fi Fiber High Speed 100Mbps Dedicated', category: 'BANGUNAN', icon: '📶', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Koneksi stabil untuk webinar, jurnal & riset medis' },
      { id: 'FAC-03', name: 'Meja Belajar Ergonomis & Kursi Dokter', category: 'KAMAR', icon: '🪑', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Set meja belajar nyaman untuk koas dan dokter jaga' },
      { id: 'FAC-04', name: 'Smart Key & Digital NFC Access 24 Jam', category: 'KAMAR', icon: '🔐', isIncludedInRent: true, additionalMonthlyFee: 0, description: 'Akses masuk bebas 24 jam fleksibel untuk jadwal jaga shift RS' },
    ];
    setFacilities(rshsFacilities);

    setToast('✅ DATA MASTER KOSANKU RSHS BERHASIL DIINJEK & DIAPLIKASIKAN!');
    setTimeout(() => setToast(null), 4000);
  };

  // 3. EXPORT / DOWNLOAD EXCEL TEMPLATE LANGSUNG DARI BROWSER
  const handleDownloadExcel = () => {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Identitas
      const ws1Data = [
        ['PARAMETER / FIELD PENGATURAN', 'NILAI / ISIAN OWNER', 'PETUNJUK & KETERANGAN'],
        ['Nama Properti / Kosan', property.propertyName || 'Kosan RSHS Pasteur Bandung', 'Wajib diisi - Ditampilkan di header web & invoice'],
        ['Alamat Lengkap', property.propertyAddress || 'Jl. Pasteur No. 38, Sukajadi', 'Wajib diisi'],
        ['Kota / Wilayah', 'Bandung', 'Wajib diisi'],
        ['No. WhatsApp Resmi Kosan', property.propertyPhone || '0811-2233-4455', 'Wajib diisi - Digunakan untuk notifikasi & komplain'],
        ['Nama Bank Rekening Pencairan', property.bankName || 'BCA (Bank Central Asia)', 'Wajib diisi - Rekening penerimaan uang sewa'],
        ['Nomor Rekening Bank', property.bankAccount || '8830-1928-44', 'Wajib diisi'],
        ['Nama Pemilik Rekening (Holder)', property.bankHolder || 'Ibu Dewi Tri Oktariani', 'Wajib diisi'],
        ['Batas Tanggal Jatuh Tempo Tagihan', 'Tanggal 1 - 5 setiap bulan', 'Default tanggal penagihan invoice otomatis'],
        ['Jatah Kuota Laundry Free (Kg/Bln)', property.allowanceLaundryKg || 5, 'Isi 0 jika tidak ada fasilitas laundry gratis']
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
      XLSX.utils.book_append_sheet(wb, ws1, '01_Identitas_Kosan');

      // Sheet 2: Master Kamar
      const ws2Data = [
        ['No Kamar*', 'Lantai*', 'Tipe Kamar*', 'Harga Sewa / Bulan (Rp)*', 'Status (AVAILABLE/OCCUPIED/MAINTENANCE)*', 'Ukuran Kamar', 'Fasilitas Kamar', 'Kapasitas (Orang)'],
        ['MED-101', 1, 'Deluxe Doctor Suite', 2200000, 'AVAILABLE', '4 x 5 m (20 m2)', 'AC Daikin, Meja Kerja, KM Dalam Water Heater', 1],
        ['MED-102', 1, 'Deluxe Doctor Suite', 2200000, 'OCCUPIED', '4 x 5 m (20 m2)', 'AC Daikin, Meja Kerja, KM Dalam Water Heater', 1],
        ['MED-201', 2, 'VIP Koas Balcony', 2500000, 'AVAILABLE', '5 x 5 m (25 m2)', 'AC Inverter, Smart TV, Balkon Private, Kulkas Mini', 2],
        ['MED-301', 3, 'Standard Medico Room', 1800000, 'AVAILABLE', '3.5 x 4.5 m (16 m2)', 'AC Inverter, WiFi 100Mbps, Kasur Springbed', 1]
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
      XLSX.utils.book_append_sheet(wb, ws2, '02_Master_Kamar');

      // Sheet 3: Penghuni
      const ws3Data = [
        ['No Kamar*', 'Nama Lengkap Penghuni*', 'No WhatsApp*', 'Email*', 'Tanggal Masuk (DD/MM/YYYY)*', 'Periode Sewa (Bulanan/3 Bulan/Tahunan)', 'Deposit (Rp)', 'No KTP / NIK'],
        ['MED-102', 'dr. Rizky Pratama, Sp.A', '081388776655', 'rizky.pratama@gmail.com', '01/02/2026', 'Bulanan', 500000, '3171012345670001']
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
      XLSX.utils.book_append_sheet(wb, ws3, '03_Penghuni_Aktif');

      // Sheet 4: Karyawan & Vendor
      const ws4Data = [
        ['Tipe (KARYAWAN/VENDOR)*', 'Nama Lengkap / Nama Usaha*', 'Kontak WhatsApp*', 'Email / Bidang Layanan*', 'Gaji / Biaya (Rp)', 'Alamat / Catatan'],
        ['KARYAWAN', 'Bambang Prasetyo', '081355443322', 'staf.maintenance@kosanku.pro', 3500000, 'Teknisi Listrik & AC'],
        ['VENDOR', 'Depot Air & Gas Suci', '081299887711', 'Refill Aqua 19L & Gas LPG', 0, 'Jl. Pemuda No. 12']
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(ws4Data);
      XLSX.utils.book_append_sheet(wb, ws4, '04_Karyawan_Vendor');

      XLSX.writeFile(wb, 'Template_Master_Data_KosanKu_Pro.xlsx');
      setToast('📥 Template Excel berhasil di-download! Siap disodorkan ke Owner / diimpor ke Google Sheets.');
      setTimeout(() => setToast(null), 4500);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback direct link
      window.open('/Template_Master_Data_KosanKu_Pro.xlsx', '_blank');
    }
  };

  // 4. IMPORT FILE EXCEL DARI OWNER
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Parse Sheet 1: Identitas
        if (wb.SheetNames.includes('01_Identitas_Kosan')) {
          const ws = wb.Sheets['01_Identitas_Kosan'];
          const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
          const propMap: Record<string, string> = {};
          data.forEach(row => {
            if (row && row[0] && row[1] !== undefined) {
              propMap[String(row[0]).trim()] = String(row[1]).trim();
            }
          });

          const newProp: PropertySettings = {
            propertyName: propMap['Nama Properti / Kosan'] || property.propertyName,
            propertyAddress: propMap['Alamat Lengkap'] || property.propertyAddress,
            propertyPhone: propMap['No. WhatsApp Resmi Kosan'] || property.propertyPhone,
            bankName: propMap['Nama Bank Rekening Pencairan'] || property.bankName,
            bankAccount: propMap['Nomor Rekening Bank'] || property.bankAccount,
            bankHolder: propMap['Nama Pemilik Rekening (Holder)'] || property.bankHolder,
            allowanceLaundryKg: Number(propMap['Jatah Kuota Laundry Free (Kg/Bln)']) || property.allowanceLaundryKg,
          };
          setProperty(newProp);
          localStorage.setItem('kosanku_master_property', JSON.stringify(newProp));
        }

        setToast('🎉 Berhasil mengimpor data Master Kosan dari Excel Owner!');
        setTimeout(() => setToast(null), 4500);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file sesuai template.');
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail) return;

    const newEmp: EmployeeMaster = {
      id: `EMP-${String(employees.length + 1).padStart(2, '0')}`,
      name: newEmpName,
      email: newEmpEmail,
      phone: newEmpPhone || '0812-0000-1111',
      position: newEmpPos,
      salary: Number(newEmpSalary) || 3000000,
      status: 'ACTIVE',
    };

    setEmployees((prev) => [...prev, newEmp]);
    setShowAddEmpModal(false);
    setNewEmpName('');
    setNewEmpEmail('');
    setToast(`✅ MASTER KARYAWAN "${newEmp.name}" (${newEmp.position}) BERHASIL DITAMBAHKAN!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnName || !newOwnEmail) return;

    const newOwner: OwnerMaster = {
      id: `OWN-${String(owners.length + 1).padStart(2, '0')}`,
      name: newOwnName,
      email: newOwnEmail,
      phone: newOwnPhone || '0811-0000-2222',
      sharePercent: Number(newOwnShare) || 50,
      bankAccount: 'BCA Utama',
    };

    setOwners((prev) => [...prev, newOwner]);
    setShowAddOwnerModal(false);
    setNewOwnName('');
    setNewOwnEmail('');
    setToast(`✅ MASTER OWNER / INVESTOR "${newOwner.name}" BERHASIL DITAMBAHKAN!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddInventoryMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName) return;

    const newItem: InventoryMaster = {
      id: `MST-INV-${String(inventoryMaster.length + 1).padStart(2, '0')}`,
      name: newInvName,
      category: newInvCat || 'Umum',
      unit: newInvUnit,
      minStock: Number(newInvMinStock) || 1,
    };

    setInventoryMaster((prev) => [...prev, newItem]);
    setShowAddInvModal(false);
    setNewInvName('');
    setNewInvCat('');
    setToast(`✅ MASTER BARANG "${newItem.name}" BERHASIL DITAMBAHKAN!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddVendorMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVndName) return;

    const newVendor: VendorMaster = {
      id: `VND-${String(vendors.length + 1).padStart(2, '0')}`,
      name: newVndName,
      type: newVndType || 'General Vendor',
      phone: newVndPhone || '-',
      address: 'Cabang Mitra Kosan',
    };

    setVendors((prev) => [...prev, newVendor]);
    setShowAddVendorModal(false);
    setNewVndName('');
    setNewVndType('');
    setNewVndPhone('');
    setToast(`✅ VENDOR MITRA "${newVendor.name}" BERHASIL DITAMBAHKAN!`);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
        <div>
          <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Master Data &amp; Pengaturan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola identitas properti, tarif kamar, fasilitas, dan sinkronisasi berkas Excel Owner
          </p>
        </div>

        {/* Quick Tools: Excel & Reset Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel */}
          <button
            onClick={handleDownloadExcel}
            className="px-3.5 py-2 neu-btn text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            title="Download Template Excel Multi-Sheet untuk disodorkan ke Owner atau diimpor ke Google Sheets"
          >
            <i className="fa-solid fa-file-excel text-emerald-600 dark:text-emerald-400" />
            <span>Template Excel</span>
          </button>

          {/* Import Excel */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 neu-btn text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            title="Impor Berkas Excel dari Owner langsung ke Master Data"
          >
            <i className="fa-solid fa-file-import text-blue-600 dark:text-blue-400" />
            <span>Impor Excel</span>
          </button>

          {/* Inject Preset RSHS */}
          <button
            onClick={handleInjectRSHSData}
            className="px-3.5 py-2 neu-btn text-sky-700 dark:text-sky-400 hover:bg-sky-500/10 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            title="Injek data default khusus Cabang Kosan RSHS Pasteur Bandung"
          >
            <i className="fa-solid fa-hospital text-sky-600 dark:text-sky-400" />
            <span>Injek Data RSHS</span>
          </button>

          {/* Wipe / Reset All Data */}
          <button
            onClick={handleWipeAllData}
            className="px-3.5 py-2 neu-btn text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            title="Hapus / Kosongkan semua data master lama untuk input kosan baru dari nol"
          >
            <i className="fa-solid fa-trash-can text-rose-600 dark:text-rose-400" />
            <span>Kosongkan Data (Kosan Baru)</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs — 2-col grid on mobile, horizontal row on sm+ */}
      <div className="my-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2 text-xs font-bold">
        {[
          { id: 'users',         icon: '👤', label: 'Akun Pengguna',      count: userProfiles.length },
          { id: 'property',      icon: '🏨', label: 'Identitas Kosan',    count: null },
          { id: 'employees',     icon: '🪪', label: 'Karyawan',           count: employees.length },
          { id: 'owners',        icon: '👑', label: 'Owner',               count: owners.length },
          { id: 'inventory',     icon: '📦', label: 'Inventori',           count: inventoryMaster.length },
          { id: 'vendors',       icon: '🏪', label: 'Vendor',              count: vendors.length },
          { id: 'categories',    icon: '🏷️', label: 'Kategori',           count: null },
          { id: 'facilities',    icon: '🛎️', label: 'Fasilitas',          count: facilities.length },
          { id: 'checkin_items', icon: '📋', label: 'Checklist Cek-In',    count: inspectionItems.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-[#047857] text-white font-black shadow-md'
                : 'neu-btn text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}{tab.count !== null ? ` (${tab.count})` : ''}</span>
          </button>
        ))}
      </div>

      {/* SubTab 0: Manajemen Pengguna & Profil */}
      {activeSubTab === 'users' && (
        <UserManagementView
          users={userProfiles}
          onAddUser={(newUser) => {
            const upd = [newUser, ...userProfiles];
            setUserProfiles(upd);
            saveStoredUserProfiles(upd);
            setToast(`✓ User ${newUser.name} berhasil ditambahkan!`);
          }}
          onUpdateUser={(updatedUser) => {
            const upd = userProfiles.map((u) => (u.id === updatedUser.id ? updatedUser : u));
            setUserProfiles(upd);
            saveStoredUserProfiles(upd);
            setToast(`✓ User ${updatedUser.name} berhasil diperbarui!`);
          }}
          onDeleteUser={(userId) => {
            const upd = userProfiles.filter((u) => u.id !== userId);
            setUserProfiles(upd);
            saveStoredUserProfiles(upd);
            setToast('✓ User berhasil dihapus.');
          }}
        />
      )}

      {/* SubTab 1: Identitas Properti */}
      {activeSubTab === 'property' && (
        <form onSubmit={handleSaveProperty} className="space-y-4 text-xs max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nama Kosan / Properti *</label>
              <input
                required
                value={property.propertyName}
                onChange={(e) => setProperty({ ...property, propertyName: e.target.value })}
                className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">No. Telepon / WhatsApp Resmi *</label>
              <input
                required
                value={property.propertyPhone}
                onChange={(e) => setProperty({ ...property, propertyPhone: e.target.value })}
                className="w-full p-3 neu-input rounded-xl outline-none font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Alamat Lengkap Properti *</label>
            <input
              required
              value={property.propertyAddress}
              onChange={(e) => setProperty({ ...property, propertyAddress: e.target.value })}
              className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="p-5 neu-card-sm rounded-2xl space-y-3">
            <span className="font-black text-[#047857] dark:text-emerald-400 block">💳 Rekening Bank Pencairan Owner &amp; Midtrans Payout</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Nama Bank</label>
                <input
                  value={property.bankName}
                  onChange={(e) => setProperty({ ...property, bankName: e.target.value })}
                  className="w-full p-2.5 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">No. Rekening</label>
                <input
                  value={property.bankAccount}
                  onChange={(e) => setProperty({ ...property, bankAccount: e.target.value })}
                  className="w-full p-2.5 neu-input rounded-xl outline-none font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Atas Nama (Holder)</label>
                <input
                  value={property.bankHolder}
                  onChange={(e) => setProperty({ ...property, bankHolder: e.target.value })}
                  className="w-full p-2.5 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk" />
            <span>Simpan Master Pengaturan Properti</span>
          </button>
        </form>
      )}

      {/* SubTab 2: Master Karyawan / Staf */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Daftar staf karyawan operasional, teknisi maintenance, dan kebersihan yang bertugas</span>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus" />
              <span>+ Tambah Karyawan Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">ID Staf</th>
                  <th className="py-3 px-3">Nama Karyawan</th>
                  <th className="py-3 px-3">Jabatan / Role</th>
                  <th className="py-3 px-3">Email &amp; HP</th>
                  <th className="py-3 px-3">Gaji Pokok (Monthly)</th>
                  <th className="py-3 px-3 text-right">Status Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{emp.id}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{emp.name}</td>
                    <td className="py-3.5 px-3 font-medium text-purple-700 dark:text-purple-300">{emp.position}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">{emp.email} • {emp.phone}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{formatIDR(emp.salary)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-full font-extrabold text-[9px]">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Master Owner / Investor */}
      {activeSubTab === 'owners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Daftar pemilik properti &amp; investor konsorsium pemegang saham kosan</span>
            <button
              onClick={() => setShowAddOwnerModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus" />
              <span>+ Tambah Owner / Investor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {owners.map((own) => (
              <div key={own.id} className="p-5 neu-card-sm rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded neu-inset text-amber-600 dark:text-amber-300">
                    {own.id}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Saham: {own.sharePercent}%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{own.name}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{own.email} • {own.phone}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 text-[11px] text-slate-500">
                  Rekening Pencairan: <strong className="text-slate-900 dark:text-white font-mono">{own.bankAccount}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 4: Master Inventori */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Daftar item inventori yang dapat di-audit fisik oleh karyawan</span>
            <button
              onClick={() => setShowAddInvModal(true)}
              className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus" />
              <span>+ Tambah Master Barang</span>
            </button>
          </div>

          <div className="overflow-x-auto neu-inset rounded-2xl p-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Kode Master</th>
                  <th className="py-3 px-3">Nama Barang</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Satuan</th>
                  <th className="py-3 px-3 text-right">Min. Stok Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/40 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                {inventoryMaster.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{inv.id}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{inv.name}</td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">{inv.category}</td>
                    <td className="py-3.5 px-3 font-bold">{inv.unit}</td>
                    <td className="py-3.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 font-mono">{inv.minStock} {inv.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 5: Vendor Mitra */}
      {activeSubTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">Daftar vendor penyedia galon, gas, laundry, dan toko teknik mitra kos</span>
            <button
              onClick={() => setShowAddVendorModal(true)}
              className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus" />
              <span>+ Tambah Vendor Mitra</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <div key={v.id} className="p-4 neu-card-sm rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded neu-inset text-emerald-800 dark:text-emerald-300">
                    {v.id}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{v.type}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{v.name}</h4>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">📞 {v.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 6: Kategori Pengeluaran */}
      {activeSubTab === 'categories' && (
        <div className="space-y-3">
          <span className="text-xs text-slate-500 font-medium block mb-2">Master kategori pengeluaran kas kosan</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expenseCategories.map((c) => (
              <div key={c.id} className="p-4 neu-card-sm rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">code: &apos;{c.code}&apos;</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Employee */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddEmpModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-4 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black">Tambah Karyawan / Staf Baru</h3>
              <button onClick={() => setShowAddEmpModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Lengkap Karyawan *</label>
                <input required value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} placeholder="cth: Bambang Prasetyo" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Email Login *</label>
                  <input required type="email" value={newEmpEmail} onChange={(e) => setNewEmpEmail(e.target.value)} placeholder="staf@kosanku.com" className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">No. WhatsApp</label>
                  <input value={newEmpPhone} onChange={(e) => setNewEmpPhone(e.target.value)} placeholder="0812-3456-7890" className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1.5">Jabatan / Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Teknisi Maintenance', label: 'Teknisi Maintenance', icon: 'fa-screwdriver-wrench' },
                    { id: 'Admin Operasional', label: 'Admin Operasional', icon: 'fa-clipboard-user' },
                    { id: 'Staf Kebersihan & Kurir', label: 'Kebersihan & Kurir', icon: 'fa-broom' },
                    { id: 'Keamanan / Security', label: 'Keamanan / Security', icon: 'fa-shield-halved' },
                  ].map((pos) => {
                    const isSel = newEmpPos === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setNewEmpPos(pos.id)}
                        className={`p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSel
                            ? 'bg-[#047857] text-white shadow-md'
                            : 'neu-btn text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <i className={`fa-solid ${pos.icon} text-xs`} />
                        <span className="truncate">{pos.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Gaji Pokok Bulanan (IDR)</label>
                <input type="number" value={newEmpSalary} onChange={(e) => setNewEmpSalary(e.target.value)} className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white font-mono" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="flex-1 py-3 neu-btn font-bold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl shadow-md cursor-pointer">Simpan Karyawan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Owner */}
      {showAddOwnerModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddOwnerModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-4 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black">Tambah Owner / Investor Baru</h3>
              <button onClick={() => setShowAddOwnerModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
            </div>
            <form onSubmit={handleAddOwner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Lengkap Pemilik / Investor *</label>
                <input required value={newOwnName} onChange={(e) => setNewOwnName(e.target.value)} placeholder="cth: Ibu Rina (Investor)" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Email Login *</label>
                  <input required type="email" value={newOwnEmail} onChange={(e) => setNewOwnEmail(e.target.value)} placeholder="owner@kosanku.com" className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Persentase Saham (%)</label>
                  <input type="number" value={newOwnShare} onChange={(e) => setNewOwnShare(e.target.value)} placeholder="50" className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddOwnerModal(false)} className="flex-1 py-3 neu-btn font-bold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl shadow-md cursor-pointer">Simpan Owner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Master Inventory */}
      {showAddInvModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddInvModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-4 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black">Tambah Master Barang Inventori</h3>
              <button onClick={() => setShowAddInvModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
            </div>
            <form onSubmit={handleAddInventoryMaster} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Barang *</label>
                <input required value={newInvName} onChange={(e) => setNewInvName(e.target.value)} placeholder="cth: Tabung Gas LPG 5.5kg Bright Gas" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Kategori</label>
                  <input value={newInvCat} onChange={(e) => setNewInvCat(e.target.value)} placeholder="Utilitas Gas" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Satuan</label>
                  <input value={newInvUnit} onChange={(e) => setNewInvUnit(e.target.value)} placeholder="Tabung" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Batas Minimal Stok (Warning Reorder)</label>
                <input type="number" value={newInvMinStock} onChange={(e) => setNewInvMinStock(e.target.value)} className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddInvModal(false)} className="flex-1 py-3 neu-btn font-bold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl shadow-md cursor-pointer">Simpan Barang</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Vendor Master */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddVendorModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-4 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black">Tambah Vendor Mitra Baru</h3>
              <button onClick={() => setShowAddVendorModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
            </div>
            <form onSubmit={handleAddVendorMaster} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">Nama Vendor / Toko Mitra *</label>
                <input required value={newVndName} onChange={(e) => setNewVndName(e.target.value)} placeholder="cth: Depot Air Berkah Suci" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="font-bold block mb-1">Jenis Layanan / Produk</label>
                <input value={newVndType} onChange={(e) => setNewVndType(e.target.value)} placeholder="Refill Galon & Gas LPG" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="font-bold block mb-1">No. WhatsApp / Telp Vendor</label>
                <input value={newVndPhone} onChange={(e) => setNewVndPhone(e.target.value)} placeholder="0812-9988-7700" className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddVendorModal(false)} className="flex-1 py-3 neu-btn font-bold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl shadow-md cursor-pointer">Simpan Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* SubTab: Master Fasilitas Kosan */}
      {activeSubTab === 'facilities' && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-building-user text-emerald-600" />
                Manajemen Master Fasilitas Kosan
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar fasilitas tiap kamar dapat berbeda-beda. Konfigurasi per kosan tanpa ubah kode.
              </p>
            </div>
            <button
              onClick={() => setShowAddFacModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2 w-fit shrink-0"
            >
              <i className="fa-solid fa-plus" /> + Tambah Fasilitas Baru
            </button>
          </div>

          {/* Category Legend */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
              <i className="fa-solid fa-bed" /> KAMAR — Fasilitas standar tiap unit kamar
            </span>
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 flex items-center gap-1">
              <i className="fa-solid fa-building" /> BANGUNAN — Fasilitas umum gedung
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
              <i className="fa-solid fa-plus-circle" /> ADD-ON — Layanan berbayar / opsional
            </span>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Termasuk Sewa', val: facilities.filter(f => f.isIncludedInRent).length, color: 'text-emerald-600', bg: 'neu-inset' },
              { label: 'Layanan Add-On', val: facilities.filter(f => !f.isIncludedInRent).length, color: 'text-amber-600', bg: 'neu-inset' },
              { label: 'Total Fasilitas', val: facilities.length, color: 'text-slate-900 dark:text-white', bg: 'neu-inset' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Facility Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facilities.map((fac) => {
              const catColor = fac.category === 'KAMAR'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                : fac.category === 'BANGUNAN'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300';
              const catLabel = fac.category === 'KAMAR' ? 'Kamar' : fac.category === 'BANGUNAN' ? 'Bangunan' : 'Add-On';

              return (
                <div
                  key={fac.id}
                  className="neu-card-sm rounded-2xl p-4 space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{fac.icon}</span>
                      <div>
                        <span className="font-black text-xs text-slate-900 dark:text-white block">{fac.name}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${catColor}`}>{catLabel}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setFacilities(prev => prev.filter(f => f.id !== fac.id))}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer p-1"
                      title="Hapus Fasilitas"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{fac.description}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-white/10">
                    <span className={`text-[10px] font-extrabold flex items-center gap-1 ${fac.isIncludedInRent ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {fac.isIncludedInRent ? <><i className="fa-solid fa-circle-check" /> Termasuk Sewa</> : <><i className="fa-solid fa-coins" /> Add-On Berbayar</>}
                    </span>
                    <button
                      onClick={() => setFacilities(prev => prev.map(f => f.id === fac.id ? { ...f, isIncludedInRent: !f.isIncludedInRent } : f))}
                      className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                        fac.isIncludedInRent
                          ? 'neu-btn text-amber-800 dark:text-amber-300'
                          : 'neu-btn text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {fac.isIncludedInRent ? '→ Ubah ke Add-On' : '→ Masukkan ke Sewa'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save All Button */}
          <button
            onClick={() => {
              localStorage.setItem('kosanku_facilities', JSON.stringify(facilities));
              setToast('✅ MASTER FASILITAS KOSAN BERHASIL DISIMPAN!');
              setTimeout(() => setToast(null), 3500);
            }}
            className="px-6 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk" /> Simpan Master Fasilitas
          </button>
        </div>
      )}

      {/* SubTab 8: Master Item Checklist Cek-In & Cek-Out */}
      {activeSubTab === 'checkin_items' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                📋 Master Item Pengecekan Cek-In &amp; Cek-Out Kamar
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konfigurasi daftar aset &amp; inventori yang harus diperiksa staf lapangan saat tenant masuk (Cek-In) atau keluar (Cek-Out).
              </p>
            </div>
            <button
              onClick={() => setShowAddChkModal(true)}
              className="px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <i className="fa-solid fa-plus" /> Tambah Item Checklist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inspectionItems.map((chk) => {
              const catBadge =
                chk.category === 'KUNCI' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                chk.category === 'ELEKTRONIK' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                chk.category === 'SANITASI' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' :
                chk.category === 'DINDING_LANTAI' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';

              return (
                <div key={chk.id} className="p-4 rounded-2xl neu-card-sm flex flex-col justify-between gap-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl shrink-0">{chk.icon}</span>
                      <div>
                        <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">{chk.name}</h5>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${catBadge}`}>{chk.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = inspectionItems.filter(item => item.id !== chk.id);
                        setInspectionItems(updated);
                        localStorage.setItem('kosanku_master_inspection_items', JSON.stringify(updated));
                        setToast(`✓ Item "${chk.name}" dihapus`);
                      }}
                      className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer p-1"
                      title="Hapus Item"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    &quot;{chk.description}&quot;
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                    <span>ID: {chk.id}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">● Wajib Diperiksa Staf</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save All Checklist Master Button */}
          <button
            onClick={() => {
              localStorage.setItem('kosanku_master_inspection_items', JSON.stringify(inspectionItems));
              setToast('✅ MASTER ITEM CHECKLIST INSPEKSI BERHASIL DISIMPAN & SINKRON KE STAF!');
              setTimeout(() => setToast(null), 3500);
            }}
            className="px-6 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <i className="fa-solid fa-floppy-disk" /> Simpan &amp; Terapkan ke Staf
          </button>
        </div>
      )}

      {/* Modal: Tambah Item Checklist Inspeksi Baru */}
      {showAddChkModal && (
        <div className="fixed inset-0 z-[999] bg-black/5 dark:bg-black/20 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddChkModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black">Tambah Item Checklist Inspeksi Kamar</h3>
              <button onClick={() => setShowAddChkModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 cursor-pointer">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newChkName) return;
                const newItem: InspectionItemMaster = {
                  id: `CHK-${String(inspectionItems.length + 1).padStart(2, '0')}`,
                  name: newChkName,
                  category: newChkCategory,
                  icon: newChkIcon || '📋',
                  description: newChkDesc || 'Pastikan dalam kondisi baik dan berfungsi normal saat inspeksi.',
                };
                const updated = [...inspectionItems, newItem];
                setInspectionItems(updated);
                localStorage.setItem('kosanku_master_inspection_items', JSON.stringify(updated));
                setShowAddChkModal(false);
                setNewChkName('');
                setNewChkDesc('');
                setToast(`✅ Item Checklist "${newItem.name}" Berhasil Ditambahkan!`);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold block mb-1">Pilih Emoji / Ikon</label>
                <div className="flex gap-2">
                  {['🔑', '❄️', '🛏️', '🚪', '🚿', '📺', '🧹', '💡', '🪟', '🪑'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewChkIcon(emoji)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all cursor-pointer ${newChkIcon === emoji ? 'bg-[#047857] text-white shadow-md' : 'neu-btn'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Kategori Item</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'KUNCI', label: 'Kunci / Akses' },
                    { id: 'ELEKTRONIK', label: 'Elektronik' },
                    { id: 'FURNITUR', label: 'Furnitur' },
                    { id: 'SANITASI', label: 'Sanitasi / KM' },
                    { id: 'DINDING_LANTAI', label: 'Fisik Kamar' },
                    { id: 'LAINNYA', label: 'Lainnya' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewChkCategory(cat.id as any)}
                      className={`p-2 rounded-xl font-bold text-xs cursor-pointer transition-all ${newChkCategory === cat.id ? 'bg-[#047857] text-white shadow' : 'neu-btn text-slate-700 dark:text-slate-300'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Nama Item / Fasilitas *</label>
                <input
                  required
                  value={newChkName}
                  onChange={(e) => setNewChkName(e.target.value)}
                  placeholder="cth: Bohlam Lampu Utama, Exhaust Fan KM..."
                  className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Panduan Standar Pemeriksaan Staf</label>
                <textarea
                  value={newChkDesc}
                  onChange={(e) => setNewChkDesc(e.target.value)}
                  rows={2}
                  placeholder="cth: Pastikan menyala terang, tidak berkedip, saklar berfungsi normal..."
                  className="w-full p-3 neu-input rounded-xl outline-none resize-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddChkModal(false)} className="flex-1 py-3 neu-btn font-bold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl shadow-md cursor-pointer">+ Tambah Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah Fasilitas Baru */}
      {showAddFacModal && (
        <div className="fixed inset-0 z-[999] bg-black/5 dark:bg-black/20 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddFacModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-md space-y-5 text-slate-900 dark:text-white border border-white/80 dark:border-white/10 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black">🏨 Tambah Fasilitas Baru</h3>
              <button onClick={() => setShowAddFacModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newFacName) return;
                const newFac: FacilityMaster = {
                  id: `FAC-${String(facilities.length + 1).padStart(2, '0')}`,
                  name: newFacName,
                  category: newFacCategory,
                  icon: newFacIcon || '🏠',
                  isIncludedInRent: newFacIncluded,
                  additionalMonthlyFee: Number(newFacFee) || 0,
                  description: newFacDesc,
                };
                setFacilities(prev => [...prev, newFac]);
                setShowAddFacModal(false);
                setNewFacName(''); setNewFacDesc(''); setNewFacIcon('🏠'); setNewFacFee('0');
                setToast(`✅ FASILITAS "${newFac.icon} ${newFac.name}" BERHASIL DITAMBAHKAN!`);
                setTimeout(() => setToast(null), 3500);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Ikon Fasilitas (Emoji)</label>
                  <input value={newFacIcon} onChange={e => setNewFacIcon(e.target.value)} placeholder="🏠" className="w-full p-3 neu-input rounded-xl outline-none text-center text-2xl text-slate-900 dark:text-white" />
                </div>
              <div>
                <label className="font-bold block mb-1.5">Kategori Fasilitas *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'KAMAR', label: '🛏️ Kamar' },
                    { id: 'BANGUNAN', label: '🏢 Bangunan' },
                    { id: 'LAYANAN_ADDON', label: '➕ Add-On' },
                  ].map((cat) => {
                    const isSel = newFacCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewFacCategory(cat.id as any)}
                        className={`p-2 rounded-xl font-bold text-[11px] transition-all cursor-pointer truncate ${
                          isSel
                            ? 'bg-[#047857] text-white shadow-md'
                            : 'neu-btn text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Nama Fasilitas *</label>
                <input required value={newFacName} onChange={e => setNewFacName(e.target.value)} placeholder="cth: AC 1 PK Inverter, Smart Lock NFC..." className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="font-bold block mb-1">Deskripsi Fasilitas</label>
                <textarea value={newFacDesc} onChange={e => setNewFacDesc(e.target.value)} rows={2} placeholder="Detail fasilitas, merk, spesifikasi, atau aturan pemakaian..." className="w-full p-3 neu-input rounded-xl outline-none resize-none text-slate-900 dark:text-white" />
              </div>
              <div className="flex items-center justify-between p-3 neu-card-sm rounded-xl">
                <span className="font-bold text-slate-700 dark:text-slate-300">Termasuk dalam Harga Sewa?</span>
                <button
                  type="button"
                  onClick={() => setNewFacIncluded(prev => !prev)}
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex items-center px-0.5 ${newFacIncluded ? 'bg-emerald-500 justify-end' : 'neu-inset justify-start'}`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow" />
                </button>
              </div>
              {!newFacIncluded && (
                <div>
                  <label className="font-bold block mb-1">Biaya Add-On Bulanan (Rp) — 0 = Per Unit/Pakai</label>
                  <input type="number" value={newFacFee} onChange={e => setNewFacFee(e.target.value)} placeholder="0" className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white" />
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddFacModal(false)} className="flex-1 py-3 neu-btn font-bold rounded-xl cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl shadow-md cursor-pointer">+ Tambahkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification (Bottom Right) */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] px-5 py-3 rounded-2xl text-xs font-bold neu-card text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shadow-2xl animate-scale-in flex items-center gap-2">
          <i className="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
