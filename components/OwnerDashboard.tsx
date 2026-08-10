'use client';

import { useState, useEffect } from 'react';
import FinancialDashboard from './FinancialDashboard';
import MasterDataSettings from './MasterDataSettings';
import SecurityDepositEscrow from './SecurityDepositEscrow';
import SequenceSaaSLayout from './SequenceSaaSLayout';
import type { RoleType } from '@/app/page';

interface ApprovalRequest {
  id: string;
  title: string;
  category: string;
  amount: number;
  requestedBy: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  condition: 'GOOD' | 'NEEDS_REPAIR' | 'REPLACE';
  lastChecked: string;
}

interface TenantSupplyRequest {
  id: string;
  tenantName: string;
  roomNumber: string;
  requestItem: string; // Air galon, Gas LPG, Perbaikan
  requestType: 'WATER_GAS' | 'REPAIR' | 'LAUNDRY';
  requestDate: string;
  status: 'PENDING' | 'PLOTTED' | 'COMPLETED';
  assignedStaff?: string;
  connectedVendor?: string;
  autoRouted?: boolean;
}

interface AutoPilotRule {
  id: string;
  name: string;
  desc: string;
  category: string;
  enabled: boolean;
  triggerCount: number;
}

interface StockOpnameAudit {
  auditDate: string;
  auditedBy: string;
  items: {
    id: string;
    name: string;
    category: string;
    unit: string;
    systemStock: number;
    physicalStock: number;
    note?: string;
  }[];
}

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'REQ-101',
    title: 'Penggantian Unit AC Inverter Kamar B-202',
    category: 'Perbaikan / Asset',
    amount: 3850000,
    requestedBy: 'Bambang (Staf Maintenance)',
    date: '2026-08-09',
    reason: 'Kompresor AC lama sudah aus dan tidak ekonomis untuk diservis lagi.',
    status: 'PENDING',
  },
  {
    id: 'REQ-102',
    title: 'Pengecatan Ulang & Waterproofing Dinding Lt 3',
    category: 'Pemeliharaan Gedung',
    amount: 2400000,
    requestedBy: 'Siti (Admin Operasional)',
    date: '2026-08-08',
    reason: 'Mencegah rembesan air hujan saat musim penghujan mendatang.',
    status: 'PENDING',
  },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'INV-AC-01', name: 'Unit AC Daikin Inverter 1PK', category: 'Elektronik Utama', location: 'Kamar A-101 s/d C-302 (12 Unit)', quantity: 12, condition: 'GOOD', lastChecked: '2026-08-01' },
  { id: 'INV-TV-02', name: 'Smart TV Samsung 32 Inch', category: 'Elektronik', location: 'Kamar VIP B-201, B-202', quantity: 2, condition: 'GOOD', lastChecked: '2026-08-01' },
  { id: 'INV-BED-03', name: 'Kasur Springbed KingKoil 160x200', category: 'Mebel / Furniture', location: 'Semua Kamar (12 Unit)', quantity: 12, condition: 'GOOD', lastChecked: '2026-07-25' },
  { id: 'INV-GAS-04', name: 'Tabung Gas LPG 12kg Dapur Bersama', category: 'Utilitas Gas', location: 'Dapur Utama Lt 1', quantity: 4, condition: 'NEEDS_REPAIR', lastChecked: '2026-08-08' },
  { id: 'INV-DIS-05', name: 'Dispenser Air Gallon Bottom Load', category: 'Utilitas Air', location: 'Lobby & Dapur Lt 1-3', quantity: 3, condition: 'GOOD', lastChecked: '2026-08-05' },
];

const INITIAL_SUPPLY_REQUESTS: TenantSupplyRequest[] = [
  {
    id: 'REQ-SUP-01',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    requestItem: 'Refill Galon Aqua 19L + Gas LPG 3kg',
    requestType: 'WATER_GAS',
    requestDate: 'Hari ini, 09:15',
    status: 'PLOTTED',
    assignedStaff: 'Bambang (Auto-Routed by AI Engine)',
    connectedVendor: 'Depot Air & Gas Suci',
    autoRouted: true,
  },
  {
    id: 'REQ-SUP-02',
    tenantName: 'Siti Rahma',
    roomNumber: 'B-201',
    requestItem: 'Perbaikan Kran Wastafel Bocor Halus',
    requestType: 'REPAIR',
    requestDate: 'Hari ini, 08:30',
    status: 'PENDING',
  },
];

const INITIAL_AUTOPILOT_RULES: AutoPilotRule[] = [
  {
    id: 'RULE-01',
    name: 'Auto-Routing Permintaan Rutin (Galon / Gas / Laundry)',
    desc: 'Permintaan galon & gas otomatis di-plot langsung ke Karyawan & Vendor Suci tanpa tunggu Owner',
    category: 'Auto Dispatching',
    enabled: true,
    triggerCount: 42,
  },
  {
    id: 'RULE-02',
    name: 'Auto-Addon Billing ke Invoice Midtrans',
    desc: 'Kelebihan kuota laundry/utilitas vendor otomatis ditambahkan ke invoice sewa tenant',
    category: 'Billing Automation',
    enabled: true,
    triggerCount: 18,
  },
  {
    id: 'RULE-03',
    name: 'Auto-Reminder Mobile Push & WhatsApp (H-3, H-1)',
    desc: 'Pengingat sewa otomatis terkirim ke HP tenant 3 hari & 1 hari sebelum jatuh tempo',
    category: 'Notification Engine',
    enabled: true,
    triggerCount: 84,
  },
  {
    id: 'RULE-04',
    name: 'Auto-Status Room Clearance Saat Cek-Out',
    desc: 'Status kamar otomatis berubah ke CLEANING → AVAILABLE setelah inspeksi staf selesai',
    category: 'Property Status',
    enabled: true,
    triggerCount: 12,
  },
];

const INITIAL_SO_AUDIT: StockOpnameAudit = {
  auditDate: '10 Agustus 2026, 14:30',
  auditedBy: 'Bambang (Staf Lapangan)',
  items: [
    { id: 'SO-01', name: 'Refill Galon Aqua 19L', category: 'Utilitas Air', unit: 'Galon', systemStock: 10, physicalStock: 10, note: 'Stok fisik sesuai' },
    { id: 'SO-02', name: 'Tabung Gas LPG 3kg Dapur', category: 'Utilitas Gas', unit: 'Tabung', systemStock: 6, physicalStock: 6, note: 'Stok fisik sesuai' },
    { id: 'SO-03', name: 'Bohlam Lampu LED Philips 12W', category: 'Stok Maintenance', unit: 'Pcs', systemStock: 15, physicalStock: 12, note: '3 pcs terpakai di Kamar B-201 & A-102' },
    { id: 'SO-04', name: 'Remote AC Daikin Original', category: 'Elektronik', unit: 'Pcs', systemStock: 4, physicalStock: 4, note: 'Stok fisik sesuai' },
    { id: 'SO-05', name: 'Sprei Set Katun Clean', category: 'Linen / Laundry', unit: 'Set', systemStock: 20, physicalStock: 18, note: '2 set sedang di laundry express' },
  ],
};

const STAFF_LIST = ['Bambang (Staf Maintenance)', 'Siti (Admin Operasional)', 'Rudi (Staf Kebersihan)'];
const VENDOR_LIST = ['Depot Air & Gas Suci (Refill)', 'Laundry Express Kos', 'Toko Bangunan & Teknik Subur'];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function OwnerDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [supplyRequests, setSupplyRequests] = useState<TenantSupplyRequest[]>(INITIAL_SUPPLY_REQUESTS);
  const [autoRules, setAutoRules] = useState<AutoPilotRule[]>(INITIAL_AUTOPILOT_RULES);
  const [soAudit, setSoAudit] = useState<StockOpnameAudit>(INITIAL_SO_AUDIT);
  const [activeBranch, setActiveBranch] = useState('all');
  const [activeTab, setActiveTab] = useState<
    | 'financial'
    | 'deposit'
    | 'master_data'
    | 'inventory'
    | 'autopilot'
    | 'tenant_requests'
    | 'approval'
    | 'rooms_ai'
    | 'invoices'
    | 'complaints'
  >('financial');
  
  // Plotting Modal State
  const [selectedReq, setSelectedReq] = useState<TenantSupplyRequest | null>(null);
  const [assignedStaff, setAssignedStaff] = useState(STAFF_LIST[0]);
  const [selectedVendor, setSelectedVendor] = useState(VENDOR_LIST[0]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Sync latest Stock Opname from localStorage if submitted by staff
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kosanku_latest_stock_opname');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.items?.length) setSoAudit(parsed);
      }
    } catch {}
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleRule = (id: string) => {
    setAutoRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    const rule = autoRules.find((r) => r.id === id);
    showToast(`Status Otomatisasi "${rule?.name}" diperbarui: ${!rule?.enabled ? 'AKTIF ⚡' : 'NONAKTIF'}`);
  };

  const handleApproval = (id: string, action: 'APPROVED' | 'REJECTED') => {
    setApprovals((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: action } : req))
    );
    const req = approvals.find((a) => a.id === id);
    if (action === 'APPROVED') {
      showToast(`Pengajuan "${req?.title}" telah DISETUJUI oleh Owner.`);
    } else {
      showToast(`Pengajuan "${req?.title}" DITOLAK.`, 'error');
    }
  };

  const handlePlottingTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSupplyRequests((prev) =>
      prev.map((r) =>
        r.id === selectedReq.id
          ? { ...r, status: 'PLOTTED', assignedStaff, connectedVendor: selectedVendor }
          : r
      )
    );

    showToast(
      `Permintaan Kamar ${selectedReq.roomNumber} (${selectedReq.tenantName}) berhasil DI-PLOTTING ke ${assignedStaff} & dihubungkan ke Vendor ${selectedVendor}.`
    );
    setSelectedReq(null);
  };

  const approveSOAudit = () => {
    showToast('✅ LAPORAN AUDIT STOCK OPNAME (SO) DISETUJUI OWNER & STOK SISTEM DIVERIFIKASI!');
  };

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'PENDING').length;
  const pendingRequestsCount = supplyRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <SequenceSaaSLayout
      role="owner"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t as any)}
      pendingRequestsCount={pendingRequestsCount}
      pendingApprovalsCount={pendingApprovalsCount}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
        {/* Active Selected Tab Module Content */}
        {activeTab === 'financial' && <FinancialDashboard />}

        {/* Tab: Deposit Escrow & Late Fee */}
        {activeTab === 'deposit' && <SecurityDepositEscrow />}

        {/* Tab: ⚙️ Master Data & Setting Kosan */}
        {activeTab === 'master_data' && <MasterDataSettings />}

        {/* Tab: Laporan Stock Opname (SO) Audit Fisik Barang */}
        {activeTab === 'inventory' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-boxes-packing text-amber-500" />
                  Laporan Hasil Audit Stock Opname (SO) dari Karyawan Lapangan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Diaudit oleh: <strong className="text-purple-700 dark:text-purple-300">{soAudit.auditedBy}</strong> • Waktu Audit: {soAudit.auditDate}
                </p>
              </div>
              <button
                onClick={approveSOAudit}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 w-fit"
              >
                <i className="fa-solid fa-check-double" />
                <span>Setujui SO &amp; Penyesuaian Stok</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Kode SO</th>
                    <th className="py-3 px-3">Nama Barang Pasokan</th>
                    <th className="py-3 px-3">Stok Sistem</th>
                    <th className="py-3 px-3">Hitungan Fisik Staf</th>
                    <th className="py-3 px-3">Selisih (Discrepancy)</th>
                    <th className="py-3 px-3 text-right">Catatan Discrepancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                  {soAudit.items.map((item) => {
                    const diff = item.physicalStock - item.systemStock;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-400">{item.id}</td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                          {item.name}
                          <span className="block text-[10px] text-slate-500 font-normal">{item.category}</span>
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{item.systemStock} {item.unit}</td>
                        <td className="py-3.5 px-3 font-black text-purple-600 dark:text-purple-400">{item.physicalStock} {item.unit}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              diff === 0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                            }`}
                          >
                            {diff === 0 ? 'Sesuai (Match)' : `Selisih: ${diff > 0 ? `+${diff}` : diff} ${item.unit}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-500 italic">{item.note || 'Tidak ada selisih'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: ⚡ Auto-Pilot Plotting Engine */}
        {activeTab === 'autopilot' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-amber-500" />
                  Mesin Otomatisasi &amp; Auto-Routing Plotting KosanKu AI
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Konfigurasi aturan otomatisasi tanpa perlu Owner intervensi secara manual
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {autoRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3 transition-all hover:border-amber-500/30 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-bold">
                      {rule.category}
                    </span>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                        rule.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 dark:bg-white/20 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rule.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Telah Dieksekusi Sistem: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{rule.triggerCount}x</strong></span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{rule.enabled ? '🟢 Auto-Active' : '⚪ Manual'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Permintaan Tenant & Plotting ke Karyawan/Vendor */}
        {activeTab === 'tenant_requests' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-route text-purple-600 dark:text-purple-400" />
                  Plotting Tugas Karyawan &amp; Hubungkan ke Vendor Mitra
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Infokan &amp; tugaskan kebutuhan tenant (Air Galon, Gas LPG, Perbaikan) ke karyawan kos untuk diteruskan ke vendor
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-300 dark:border-amber-500/30">
                ⚡ Dispatching System
              </span>
            </div>

            <div className="space-y-4">
              {supplyRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 space-y-3 transition-all hover:border-purple-500/30 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-bold text-xs">
                        Kamar {req.roomNumber} ({req.tenantName})
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{req.requestItem}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase w-fit border ${
                        req.status === 'PENDING'
                          ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                      }`}
                    >
                      {req.status === 'PENDING' ? '⏳ Perlu Plotting Owner' : '⚡ Auto-Routed by AI Engine'}
                    </span>
                  </div>

                  {req.status === 'PLOTTED' ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span>Staf Ditugaskan: <strong>{req.assignedStaff}</strong></span>
                      <span>Vendor Terhubung: <strong>{req.connectedVendor}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Masuk: {req.requestDate}</span>
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <i className="fa-solid fa-paper-plane" />
                        <span>Plotting Manual ke Karyawan &amp; Vendor</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Approval Dana */}
        {activeTab === 'approval' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-signature text-purple-600 dark:text-purple-400" />
                  Persetujuan Pengeluaran &amp; Anggaran Dana (Owner Approval)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Verifikasi pengajuan pengeluaran dari karyawan operasional kos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {approvals.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 space-y-4 transition-all hover:border-purple-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-mono text-[10px] font-bold">
                        {req.id}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{req.title}</h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase w-fit border ${
                        req.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          : req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                      }`}
                    >
                      {req.status === 'PENDING' ? '⏳ Menunggu Approval Owner' : req.status === 'APPROVED' ? '✅ Disetujui Owner' : '❌ Ditolak'}
                    </span>
                  </div>

                  <div className="p-4 bg-white dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-2 text-xs">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      &quot;{req.reason}&quot;
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Pemohon: <strong className="text-slate-900 dark:text-white">{req.requestedBy}</strong> • {req.date}</span>
                      <span>Kategori: <strong className="text-purple-700 dark:text-purple-300">{req.category}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">Nominal Pengajuan</span>
                      <span className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400">{formatIDR(req.amount)}</span>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproval(req.id, 'REJECTED')}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Tolak Pengajuan
                        </button>
                        <button
                          onClick={() => handleApproval(req.id, 'APPROVED')}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <i className="fa-solid fa-check text-xs" /> Setujui Anggaran
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Tab: Kamar & Pricing AI */}
        {activeTab === 'rooms_ai' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-door-open text-[#047857]" />
                  Manajemen Kamar &amp; Dynamic Pricing AI Optimizer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analisis harga sewa optimal berdasarkan tingkat okupansi &amp; tren pasar musim liburan
                </p>
              </div>
              <button
                onClick={() => showToast('⚡ [AI Pricing Engine] Mengkalkulasi rekomendasi harga optimal sewa... Selesai!')}
                className="px-5 py-2.5 bg-[#047857] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 w-fit"
              >
                <i className="fa-solid fa-wand-magic-sparkles text-amber-300" />
                <span>Analisis AI Pricing Optimal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { number: 'A-101', type: 'Deluxe AC Inverter', price: 1650000, tenant: 'Budi Santoso', status: 'OCCUPIED' },
                { number: 'B-201', type: 'Executive VIP Balcony', price: 2100000, tenant: 'Siti Rahma', status: 'OCCUPIED' },
                { number: 'C-302', type: 'Standard Clean AC', price: 1350000, tenant: null, status: 'AVAILABLE' },
              ].map((rm) => (
                <div key={rm.number} className="p-5 bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-white">Kamar {rm.number}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                      rm.status === 'OCCUPIED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                    }`}>
                      {rm.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{rm.type}</p>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-[#047857]">{formatIDR(rm.price)}/bln</span>
                    <span className="text-[10px] text-slate-400 font-bold">{rm.tenant ? `Penghuni: ${rm.tenant}` : 'Kosong'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Invoice & Midtrans */}
        {activeTab === 'invoices' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-invoice-dollar text-[#047857]" />
                  Daftar Invoice &amp; Integrasi Midtrans QRIS Snap
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Riwayat tagihan sewa &amp; add-on bulanan tenant
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">No. Invoice</th>
                    <th className="py-3 px-3">Tenant &amp; Kamar</th>
                    <th className="py-3 px-3">Total Nominal</th>
                    <th className="py-3 px-3 text-right">Status Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#047857]">INV-2026-0801</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">Budi Santoso (Kamar A-101)</td>
                    <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">Rp 1.624.500</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#047857] text-[10px] font-extrabold">SETTLED (Midtrans)</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="py-3.5 px-3 font-mono font-bold text-purple-600">INV-2026-0802</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">Siti Rahma (Kamar B-201)</td>
                    <td className="py-3.5 px-3 font-black text-slate-900 dark:text-white">Rp 2.150.000</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">PENDING</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Tiket Keluhan Tenant */}
        {activeTab === 'complaints' && (
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-headset text-[#047857]" />
                  Board Tiket Keluhan &amp; Perbaikan Tenant
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pantau keluhan perbaikan dari penghuni kamar
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">AC Kurang Dingin - Kamar A-101</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold">OPEN</span>
                </div>
                <p className="text-xs text-slate-500">&quot;AC kamar A-101 terasa kurang dingin sejak kemarin sore, perlu pembersihan freon.&quot;</p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Tenant: Budi Santoso</span>
                  <button onClick={() => showToast('Tiket keluhan Kamar A-101 telah ditugaskan ke Teknisi Bambang')} className="px-3 py-1 bg-[#047857] text-white font-bold rounded-lg text-[10px]">Tugaskan Teknisi</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plotting Modal Dialog */}
        {selectedReq && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedReq(null)}>
            <div className="bg-white dark:bg-[#181324] border border-black/10 dark:border-white/15 rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Plotting Karyawan &amp; Hubungkan Vendor</h3>
                <button onClick={() => setSelectedReq(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors">✕</button>
              </div>

              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-500/20 text-xs">
                <span className="font-bold block text-purple-900 dark:text-purple-300 mb-1">Permintaan dari Tenant:</span>
                <p className="text-slate-900 dark:text-white font-black text-sm">Kamar {selectedReq.roomNumber} - {selectedReq.tenantName}</p>
                <p className="text-purple-800 dark:text-purple-300 mt-1 font-medium">&quot;{selectedReq.requestItem}&quot;</p>
              </div>

              <form onSubmit={handlePlottingTask} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Tugaskan Karyawan Kos *</label>
                  <select value={assignedStaff} onChange={(e) => setAssignedStaff(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-[#1f1930] border border-slate-300 dark:border-white/15 rounded-xl outline-none text-slate-900 dark:text-white">
                    {STAFF_LIST.map((s) => (
                      <option key={s} value={s} className="bg-white text-slate-900 dark:bg-[#181324] dark:text-white">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Hubungkan ke Vendor Mitra Kos *</label>
                  <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-[#1f1930] border border-slate-300 dark:border-white/15 rounded-xl outline-none text-slate-900 dark:text-white">
                    {VENDOR_LIST.map((v) => (
                      <option key={v} value={v} className="bg-white text-slate-900 dark:bg-[#181324] dark:text-white">{v}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedReq(null)} className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md transition-all cursor-pointer">Kirim Plotting</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl animate-scale-in flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
            <span>{toast.msg}</span>
          </div>
        )}
      </div>
    </SequenceSaaSLayout>
  );
}
