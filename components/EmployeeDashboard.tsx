'use client';

import { useState } from 'react';

interface StaffTask {
  id: string;
  title: string;
  room: string;
  category: 'CLEANING' | 'MAINTENANCE' | 'UTILITY_METER' | 'OWNER_PLOTTED';
  assignedTo: string;
  dueTime: string;
  completed: boolean;
  ownerInstruction?: string;
  connectedVendor?: string;
}

interface InventoryChecklist {
  item: string;
  status: 'ADA_BAIK' | 'PERLU_PERBAIKAN' | 'HILANG';
}

interface StockOpnameItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  systemStock: number;
  physicalStock: number;
  note?: string;
}

import SequenceSaaSLayout from './SequenceSaaSLayout';
import type { RoleType } from '@/app/page';

const INITIAL_TASKS: StaffTask[] = [
  {
    id: 'TSK-PL-01',
    title: 'Plotting dari Owner: Antar Refill Galon Aqua 19L & Gas 3kg',
    room: 'Kamar A-101 (Budi Santoso)',
    category: 'OWNER_PLOTTED',
    assignedTo: 'Bambang (Staf Maintenance)',
    dueTime: 'Segera (Hari ini)',
    completed: false,
    ownerInstruction: 'Segera koordinasi & hubungi Depot Air & Gas Suci untuk pengantaran.',
    connectedVendor: 'Depot Air & Gas Suci (Refill)',
  },
  { id: 'TSK-01', title: 'Pembersihan Total & Sterilisasi Cek-Out', room: 'Kamar A-102', category: 'CLEANING', assignedTo: 'Budi (Staf Kebersihan)', dueTime: '10:00 AM', completed: false },
  { id: 'TSK-02', title: 'Pengecekan AC & Tambah Freon', room: 'Kamar A-101', category: 'MAINTENANCE', assignedTo: 'Bambang (Teknisi)', dueTime: '01:30 PM', completed: false },
  { id: 'TSK-03', title: 'Pencatatan Meteran Listrik & Air Lt 1-3', room: 'Semua Lt', category: 'UTILITY_METER', assignedTo: 'Siti (Admin Staff)', dueTime: '04:00 PM', completed: true },
];

const CHECKIN_ITEMS: InventoryChecklist[] = [
  { item: 'Kunci Kamar & Card Key Access', status: 'ADA_BAIK' },
  { item: 'Remote AC Original & Baterai', status: 'ADA_BAIK' },
  { item: 'Kasur Springbed & Seprei Bersih', status: 'ADA_BAIK' },
  { item: 'Lemari Pakaian & Cermin Dinding', status: 'ADA_BAIK' },
  { item: 'Kran Wastafel & Shower KM Dalam', status: 'ADA_BAIK' },
];

const INITIAL_SO_ITEMS: StockOpnameItem[] = [
  { id: 'SO-01', name: 'Refill Galon Aqua 19L', category: 'Utilitas Air', unit: 'Galon', systemStock: 10, physicalStock: 10, note: '' },
  { id: 'SO-02', name: 'Tabung Gas LPG 3kg Dapur', category: 'Utilitas Gas', unit: 'Tabung', systemStock: 6, physicalStock: 6, note: '' },
  { id: 'SO-03', name: 'Bohlam Lampu LED Philips 12W', category: 'Stok Maintenance', unit: 'Pcs', systemStock: 15, physicalStock: 12, note: '3 pcs terpakai di Kamar B-201 & A-102' },
  { id: 'SO-04', name: 'Remote AC Daikin Original', category: 'Elektronik', unit: 'Pcs', systemStock: 4, physicalStock: 4, note: '' },
  { id: 'SO-05', name: 'Sprei Set Katun Clean', category: 'Linen / Laundry', unit: 'Set', systemStock: 20, physicalStock: 18, note: '2 set sedang di laundry express' },
  { id: 'SO-06', name: 'Kunci Duplikat Card Key', category: 'Keamanan', unit: 'Pcs', systemStock: 12, physicalStock: 12, note: '' },
];

export default function EmployeeDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const [tasks, setTasks] = useState<StaffTask[]>(INITIAL_TASKS);
  const [checklist, setChecklist] = useState<InventoryChecklist[]>(CHECKIN_ITEMS);
  const [soItems, setSoItems] = useState<StockOpnameItem[]>(INITIAL_SO_ITEMS);
  const [activeTab, setActiveTab] = useState<'tasks' | 'stock_opname' | 'checkin'>('tasks');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqAmount, setReqAmount] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [soPhotoProof, setSoPhotoProof] = useState<string | null>(null);
  const [soPhotoMeta, setSoPhotoMeta] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCaptureProofPhoto = () => {
    const timestamp = new Date().toLocaleString('id-ID');
    const geo = 'Lat: -6.1754, Long: 106.8272 (Gudang Utama KosanKu)';
    setSoPhotoProof('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80');
    setSoPhotoMeta(`${geo} • ${timestamp}`);
    showToast('📸 Foto bukti fisik SO berhasil ditangkap dengan Watermark GPS & Waktu');
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const updatePhysicalCount = (id: string, delta: number) => {
    setSoItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, physicalStock: Math.max(0, item.physicalStock + delta) }
          : item
      )
    );
  };

  const updateSONote = (id: string, note: string) => {
    setSoItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const submitSOReport = () => {
    // Save SO audit to localStorage for Owner Dashboard sync
    const auditData = {
      auditDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      auditedBy: 'Bambang (Staf Lapangan)',
      items: soItems,
    };
    localStorage.setItem('kosanku_latest_stock_opname', JSON.stringify(auditData));

    setToast('🎉 LAPORAN STOCK OPNAME (SO) FISIK BERHASIL DIKIRIM KE OWNER!');
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateExpenseRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqAmount || !reqReason) return;

    setToast(`Pengajuan dana "${reqTitle}" sebesar Rp ${Number(reqAmount).toLocaleString('id-ID')} berhasil dikirim ke Owner untuk approval.`);
    setShowExpenseModal(false);
    setReqTitle('');
    setReqAmount('');
    setReqReason('');
    setTimeout(() => setToast(null), 4000);
  };

  const [activeBranch, setActiveBranch] = useState('all');
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <SequenceSaaSLayout
      role="employee"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={activeTab === 'tasks' ? 'tenant_requests' : activeTab === 'stock_opname' ? 'inventory' : 'approval'}
      onTabChange={(t) => {
        if (t === 'inventory') setActiveTab('stock_opname');
        else if (t === 'approval') setActiveTab('checkin');
        else setActiveTab('tasks');
      }}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
      {/* Staff Header Banner (Soft Raised Neumorphic Card) */}
      <div className="neu-card p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300 text-[10px] font-bold border border-blue-300 dark:border-blue-500/30 flex items-center gap-1.5">
              <i className="fa-solid fa-id-badge text-blue-500 text-[9px]" /> Staff &amp; Operational Portal
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Karyawan Lapangan &amp; Stock Opname Audit</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Dashboard Operasional Karyawan
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Input perhitungan fisik **Stock Opname (SO)** barang pasokan Owner, terima tugas plotting, dan laporkan hasil audit ke Owner.
          </p>
        </div>

        <button
          onClick={() => setShowExpenseModal(true)}
          className="px-5 py-3 neu-btn text-slate-900 dark:text-white font-bold rounded-2xl text-xs transition-all cursor-pointer flex items-center gap-2 w-fit"
        >
          <i className="fa-solid fa-file-circle-plus text-[#047857] dark:text-emerald-400" />
          <span>+ Ajukan Dana ke Owner</span>
        </button>
      </div>

      {/* Tab: Stock Opname (SO) Audit Fisik Barang */}
      {activeTab === 'stock_opname' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-boxes-packing text-amber-500" />
                Lembar Audit Stock Opname (SO) Barang Pasokan Owner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hitung jumlah fisik barang di gudang/kosan, bandingkan dengan stok sistem, dan kirim hasil ke Owner
              </p>
            </div>
            <button
              onClick={submitSOReport}
              className="px-5 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-2xl text-xs shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2 w-fit"
            >
              <i className="fa-solid fa-paper-plane" />
              <span>Kirim Laporan SO ke Owner</span>
            </button>
          </div>
          {/* 📸 Verification Photo Upload with Realtime Watermark */}
          <div className="p-4 neu-card-sm rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-camera" /> Anti-Fraud Verification Photo (Watermark GPS &amp; Waktu)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Wajib lampirkan foto fisik kondisi fisik stok di gudang sebelum dikirim ke Owner.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCaptureProofPhoto}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 w-fit shrink-0"
              >
                <i className="fa-solid fa-camera-retro" /> <span>Ambil Foto + Watermark GPS</span>
              </button>
            </div>

            {soPhotoProof && (
              <div className="relative rounded-xl overflow-hidden border border-amber-500/40 w-fit max-w-sm group shadow-md animate-scale-in">
                <img src={soPhotoProof} alt="SO Audit Proof" className="w-full h-40 object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 backdrop-blur-xs p-2 text-white text-[9px] font-mono leading-tight space-y-0.5">
                  <div className="flex items-center gap-1"><i className="fa-solid fa-location-dot text-amber-400" /> {soPhotoMeta || 'Lat: -6.1754, Long: 106.8272'}</div>
                  <div className="flex items-center gap-1"><i className="fa-solid fa-user-check text-emerald-400" /> Audited By: Bambang (Staf Lapangan)</div>
                  <div className="text-emerald-400 font-bold tracking-wider text-[8px] uppercase">VERIFIED SO AUDIT WATERMARK</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {soItems.map((item) => {
              const diff = item.physicalStock - item.systemStock;
              return (
                <div
                  key={item.id}
                  className="neu-card-sm rounded-2xl p-4 sm:p-5 space-y-3 transition-all hover:scale-[1.01]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                          {item.id}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                        Kategori: {item.category} • Satuan: {item.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 neu-inset p-2 rounded-xl w-fit">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Stok Sistem: <strong className="text-slate-900 dark:text-white">{item.systemStock}</strong></span>
                      
                      {/* Counter Stepper Controls */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg">
                        <button
                          onClick={() => updatePhysicalCount(item.id, -1)}
                          className="w-6 h-6 rounded-md neu-btn flex items-center justify-center font-black text-slate-700 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-sm text-purple-700 dark:text-purple-300">{item.physicalStock}</span>
                        <button
                          onClick={() => updatePhysicalCount(item.id, 1)}
                          className="w-6 h-6 rounded-md neu-btn flex items-center justify-center font-black text-slate-700 dark:text-white hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                          diff === 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        }`}
                      >
                        {diff === 0 ? 'Sesuai (Match)' : `Selisih: ${diff > 0 ? `+${diff}` : diff} ${item.unit}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={item.note || ''}
                      onChange={(e) => updateSONote(item.id, e.target.value)}
                      placeholder="Catatan fisik / alasan selisih stok (opsional)..."
                      className="w-full p-2.5 neu-input rounded-xl text-xs outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Tasks List & Owner Plotted Task Alerts */}
      {activeTab === 'tasks' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-bell text-amber-500" />
                Daftar Tugas &amp; Notifikasi Plotting Owner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tugas baru dari Owner &amp; jadwal perawatan rutin hari ini</p>
            </div>
            <div className="w-48 neu-inset rounded-full h-3 overflow-hidden p-0.5">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 shadow-xs"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-5 rounded-2xl transition-all cursor-pointer flex items-start gap-4 ${
                  task.category === 'OWNER_PLOTTED'
                    ? 'neu-card-sm border-amber-300 dark:border-amber-500/30'
                    : task.completed
                    ? 'neu-inset opacity-65'
                    : 'neu-card-sm hover:scale-[1.01]'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs mt-0.5 transition-all shrink-0 ${
                    task.completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'neu-inset text-transparent'
                  }`}
                >
                  <i className="fa-solid fa-check" />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className={`text-sm font-bold ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 w-fit">
                      {task.room} • {task.dueTime}
                    </span>
                  </div>

                  {task.ownerInstruction && (
                    <div className="p-2.5 neu-inset rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium">
                      📌 <strong>Instruksi Owner:</strong> {task.ownerInstruction}
                      {task.connectedVendor && (
                        <span className="block mt-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                          Vendor Mitra: {task.connectedVendor}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Petugas Penanggung Jawab: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo}</strong></span>
                    {task.completed ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]"><i className="fa-solid fa-circle-check mr-1" /> Dilaporkan Selesai ke Owner</span>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-[10px]">Klik untuk tandai selesai</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Check-in Inventory Inspection */}
      {activeTab === 'checkin' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check text-blue-600 dark:text-blue-400" />
                Form Inspeksi Cek-In &amp; Cek-Out Kamar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Verifikasi kondisi aset inventori sebelum kunci diserahkan ke tenant</p>
            </div>
          </div>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 neu-card-sm rounded-2xl text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{item.item}</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 rounded-full font-bold">
                  {item.status === 'ADA_BAIK' ? '✅ Ada &amp; Baik' : '⚠️ Perlu Perbaikan'}
                </span>
              </div>
            ))}
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

      {/* Expense Request Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowExpenseModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Form Pengajuan Dana ke Owner</h3>
              <button onClick={() => setShowExpenseModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateExpenseRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Judul Pengajuan *</label>
                <input required value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} placeholder="cth: Beli Kompresor AC Baru Kamar A-101" className="w-full p-3 neu-input rounded-xl outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nominal Anggaran (IDR) *</label>
                <input required type="number" value={reqAmount} onChange={(e) => setReqAmount(e.target.value)} placeholder="1500000" className="w-full p-3 neu-input rounded-xl outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Alasan &amp; Urgensi *</label>
                <textarea required value={reqReason} onChange={(e) => setReqReason(e.target.value)} rows={3} placeholder="Jelaskan kebutuhan pengajuan dana..." className="w-full p-3 neu-input rounded-xl outline-none focus:border-blue-500 transition-colors resize-none" />
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all cursor-pointer">Kirim ke Owner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </SequenceSaaSLayout>
  );
}
