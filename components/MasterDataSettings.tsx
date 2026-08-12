'use client';

import { useState, useEffect } from 'react';
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
  { id: 'OWN-01', name: 'Bapak Hendra (Owner Utama)', email: 'owner@kosanku.com', phone: '0811-9988-7766', sharePercent: 70, bankAccount: 'BCA 8830-1928-44' },
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
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'property' | 'employees' | 'owners' | 'inventory' | 'vendors' | 'categories' | 'facilities'>('users');

  useEffect(() => {
    setUserProfiles(getStoredUserProfiles());
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
        <div>
          <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            Master Data &amp; Pengaturan
          </h3>
        </div>
      </div>

      {/* Sub Tabs — 2-col grid on mobile, horizontal row on sm+ */}
      <div className="my-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2 text-xs font-bold">
        {[
          { id: 'users',      icon: '👤', label: 'Akun Pengguna',  count: userProfiles.length },
          { id: 'property',   icon: '🏨', label: 'Identitas Kosan',count: null },
          { id: 'employees',  icon: '🪪', label: 'Karyawan',       count: employees.length },
          { id: 'owners',     icon: '👑', label: 'Owner',           count: owners.length },
          { id: 'inventory',  icon: '📦', label: 'Inventori',       count: inventoryMaster.length },
          { id: 'vendors',    icon: '🏪', label: 'Vendor',          count: vendors.length },
          { id: 'categories', icon: '🏷️', label: 'Kategori',       count: null },
          { id: 'facilities', icon: '🛎️', label: 'Fasilitas',      count: facilities.length },
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
                <label className="font-bold block mb-1">Jabatan / Role *</label>
                <select value={newEmpPos} onChange={(e) => setNewEmpPos(e.target.value)} className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white font-bold cursor-pointer">
                  <option value="Teknisi Maintenance">Teknisi Maintenance</option>
                  <option value="Admin Operasional">Admin Operasional</option>
                  <option value="Staf Kebersihan & Kurir">Staf Kebersihan &amp; Kurir</option>
                  <option value="Keamanan / Security">Keamanan / Security</option>
                </select>
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
                  <label className="font-bold block mb-1">Kategori *</label>
                  <select value={newFacCategory} onChange={e => setNewFacCategory(e.target.value as any)} className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white">
                    <option value="KAMAR">🛏️ Fasilitas Kamar</option>
                    <option value="BANGUNAN">🏢 Fasilitas Bangunan</option>
                    <option value="LAYANAN_ADDON">➕ Layanan Add-On</option>
                  </select>
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
