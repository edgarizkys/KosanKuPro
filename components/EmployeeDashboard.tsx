'use client';

import { useState, useEffect } from 'react';
import SequenceSaaSLayout from './SequenceSaaSLayout';
import ToastNotification from './ToastNotification';
import type { RoleType } from '@/app/page';
import { useProperty } from '@/lib/PropertyContext';

interface StaffTask {
  id: string;
  title: string;
  room: string;
  tenantName?: string;
  category: string;
  assignedTo: string;
  dueTime: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  completed: boolean;
  ownerInstruction?: string;
  connectedVendor?: string;
  source?: 'complaint' | 'order';
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

const INITIAL_TASKS: StaffTask[] = [];

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
  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';

  const [tasks, setTasks] = useState<StaffTask[]>(isCustomOrNewKos ? [] : INITIAL_TASKS);
  const [checklist, setChecklist] = useState<InventoryChecklist[]>(CHECKIN_ITEMS);
  const [soItems, setSoItems] = useState<StockOpnameItem[]>(isCustomOrNewKos ? [] : INITIAL_SO_ITEMS);
  const [activeTab, setActiveTab] = useState<'tasks' | 'stock_opname' | 'checkin' | 'expense_history'>('tasks');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqAmount, setReqAmount] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [soPhotoProof, setSoPhotoProof] = useState<string | null>(null);
  const [soPhotoMeta, setSoPhotoMeta] = useState<string | null>(null);
  const [myExpenseRequests, setMyExpenseRequests] = useState<any[]>([]);

  // Room Check-in / Check-out Inspection State
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('A-101');
  const [tenantNameForInspection, setTenantNameForInspection] = useState('Rian Pratama');
  const [inspectionType, setInspectionType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionItems, setInspectionItems] = useState<InventoryChecklist[]>([]);

  // Load Inspection items dynamically from Admin Master Data
  useEffect(() => {
    try {
      const savedMaster = localStorage.getItem('kosanku_master_inspection_items');
      if (savedMaster) {
        const parsed = JSON.parse(savedMaster);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInspectionItems(parsed.map((p: any) => ({ item: p.name || p.item, status: 'ADA_BAIK' })));
          return;
        }
      }
    } catch {}

    // Default fallback if not yet set in Master Data
    setInspectionItems([
      { item: 'Kunci Kamar & Card Key Access (RFID)', status: 'ADA_BAIK' },
      { item: 'Remote AC Original & Baterai Dingin Normal', status: 'ADA_BAIK' },
      { item: 'Kasur Springbed, Bantal & Seprei Bersih', status: 'ADA_BAIK' },
      { item: 'Lemari Pakaian & Cermin Dinding Mulus', status: 'ADA_BAIK' },
      { item: 'Kran Wastafel, Shower & Water Heater Normal', status: 'ADA_BAIK' },
      { item: 'Smart TV & Remote TV Berfungsi', status: 'ADA_BAIK' },
      { item: 'Cat Dinding & Kebersihan Lantai Ruangan', status: 'ADA_BAIK' },
    ]);
  }, []);

  const updateInspectionItemStatus = (idx: number, status: 'ADA_BAIK' | 'PERLU_PERBAIKAN' | 'HILANG') => {
    setInspectionItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, status } : it))
    );
  };

  const handleSubmitInspectionReport = async () => {
    const reportEntry = {
      id: `INSP-${Date.now().toString().slice(-4)}`,
      roomNumber: selectedRoomNumber,
      tenantName: tenantNameForInspection || 'Penghuni Kosan',
      type: inspectionType, // CHECK_IN or CHECK_OUT
      inspectedBy: 'Bambang Prasetyo (Staf Lapangan)',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: inspectionItems,
      notes: inspectionNotes || (inspectionType === 'CHECK_IN' ? 'Kamar siap huni & kunci diserahkan.' : 'Kamar selesai dihuni, kunci dikembalikan.'),
    };

    // 1. Post directly to Production Server API
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'ROOM_INSPECTION', payload: reportEntry }),
      });
    } catch {}

    // 2. Save report to localStorage for Owner sync
    try {
      const existing = JSON.parse(localStorage.getItem('kosanku_room_inspections') || '[]');
      const updated = [reportEntry, ...existing];
      localStorage.setItem('kosanku_room_inspections', JSON.stringify(updated));
    } catch {}

    // 3. Broadcast to Owner in real-time across tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('kosanku_order_channel');
        bc.postMessage({
          type: 'ROOM_INSPECTION_SUBMITTED',
          report: reportEntry,
        });
        bc.close();
      } catch {}
    }

    // 4. Dispatch window events for instant same-tab/same-session responsiveness
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifs_updated'));
      window.dispatchEvent(new CustomEvent('room_inspections_updated', { detail: { report: reportEntry } }));
    }

    const typeLabel = inspectionType === 'CHECK_IN' ? 'CEK-IN' : 'CEK-OUT';
    showToast(`📋 LAPORAN ${typeLabel} KAMAR ${selectedRoomNumber} (${tenantNameForInspection}): BERHASIL DIKIRIM KE OWNER!`);
    setInspectionNotes('');
  };

  const loadMyExpenseRequests = async () => {
    try {
      const res = await fetch('/api/activity?type=approvals');
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setMyExpenseRequests(json.data);
          return;
        }
      }
      const saved = JSON.parse(localStorage.getItem('kosanku_staff_approvals') || '[]');
      if (Array.isArray(saved)) {
        setMyExpenseRequests(saved);
      }
    } catch {}
  };

  useEffect(() => {
    loadMyExpenseRequests();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'kosanku_staff_approvals') {
        loadMyExpenseRequests();
      }
    };
    window.addEventListener('storage', handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('kosanku_order_channel');
      bc.onmessage = (msg) => {
        if (msg.data?.type === 'STAFF_EXPENSE_DECIDED') {
          loadMyExpenseRequests();
          const { title, status, amount } = msg.data;
          if (status === 'APPROVED') {
            showToast(`🎉 KABAR BAIK: Pengajuan "${title}" (Rp ${Number(amount).toLocaleString('id-ID')}) telah DISETUJUI Owner! Dana siap dicairkan.`);
          } else {
            showToast(`⚠️ PEMBERITAHUAN: Pengajuan "${title}" DITOLAK oleh Owner.`);
          }
        }
      };
    }

    const interval = setInterval(loadMyExpenseRequests, 2500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

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

  const submitSOReport = async () => {
    const auditData = {
      auditDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      auditedBy: 'Bambang Prasetyo (Staf Lapangan)',
      items: soItems,
      photoProof: soPhotoProof,
      photoMeta: soPhotoMeta,
    };

    // 1. Post to Server API
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'STOCK_OPNAME',
          payload: auditData,
        }),
      });
    } catch {}

    // 2. Save SO audit to localStorage for Owner Dashboard sync
    localStorage.setItem('kosanku_latest_stock_opname', JSON.stringify(auditData));

    // 3. Broadcast to Owner across tabs
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('kosanku_order_channel');
        bc.postMessage({
          type: 'STOCK_OPNAME_SUBMITTED',
          audit: auditData,
        });
        bc.close();
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifs_updated'));
      window.dispatchEvent(new CustomEvent('so_audit_updated', { detail: { audit: auditData } }));
    }

    showToast('🎉 LAPORAN STOCK OPNAME (SO) FISIK BERHASIL DIKIRIM KE OWNER!');
  };

  const handleCreateExpenseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqAmount || !reqReason) return;

    const amountNum = Number(reqAmount);
    const newReqId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApproval = {
      id: newReqId,
      title: reqTitle,
      category: 'OPERATIONAL',
      amount: amountNum,
      requestedBy: 'Bambang Prasetyo (Staf Lapangan)',
      requestDate: 'Baru saja',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      reason: reqReason,
      status: 'PENDING',
    };

    // 1. Post directly to Production Server API
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'STAFF_EXPENSE', payload: newApproval }),
      });
      await fetch('/api/operational-reserves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newReqId,
          title: reqTitle,
          category: 'KAS_KECIL',
          amount: amountNum,
          requestedBy: 'Bambang Prasetyo (Staf Lapangan)',
          notes: reqReason,
          property: property.slug || 'default',
        }),
      });
    } catch {}

    // 2. Save to shared localStorage for Owner sync
    try {
      const existing = JSON.parse(localStorage.getItem('kosanku_staff_approvals') || '[]');
      const updated = [newApproval, ...existing];
      localStorage.setItem('kosanku_staff_approvals', JSON.stringify(updated));
      setMyExpenseRequests(updated);
    } catch {}

    // 3. Broadcast to Owner via BroadcastChannel across tabs/windows
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('kosanku_order_channel');
        bc.postMessage({ type: 'NEW_STAFF_EXPENSE', approval: newApproval });
        bc.close();
      } catch {}
    }

    // 4. Dispatch window events for instant same-tab/same-session responsiveness
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifs_updated'));
      window.dispatchEvent(new CustomEvent('staff_expense_updated', { detail: { approval: newApproval } }));
    }

    showToast(`Pengajuan dana "${reqTitle}" sebesar Rp ${amountNum.toLocaleString('id-ID')} berhasil dikirim ke Owner untuk approval.`);
    setShowExpenseModal(false);
    setReqTitle('');
    setReqAmount('');
    setReqReason('');
  };

  const [activeBranch, setActiveBranch] = useState('all');
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({});
  const completedCount = tasks.filter((t) => t.completed).length;

  const updateTaskStatus = async (taskId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED', notes?: string) => {
    // 1. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              completed: newStatus === 'RESOLVED',
              ownerInstruction: notes ? `${t.ownerInstruction || ''} (Catatan: ${notes})` : t.ownerInstruction,
            }
          : t
      )
    );

    const statusLabel = newStatus === 'RESOLVED' ? 'SELESAI (RESOLVED) & TERSINKRONISASI KE OWNER' : 'SEDANG DIKERJAKAN (IN PROGRESS)';
    showToast(`✅ Tugas #${taskId} diperbarui: ${statusLabel}`);

    // 2. Push mutation to API
    const targetTask = tasks.find((t) => t.id === taskId);
    if (targetTask?.source === 'order') {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: newStatus === 'RESOLVED' ? 'DELIVERED' : 'PROCESSING',
        }),
      }).catch(() => {});
    } else {
      await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          resolutionNotes: notes,
        }),
      }).catch(() => {});
    }
  };

  const toggleTask = (taskId: string) => {
    const t = tasks.find((item) => item.id === taskId);
    if (!t) return;
    const nextStatus = t.status === 'RESOLVED' ? 'OPEN' : 'RESOLVED';
    updateTaskStatus(taskId, nextStatus);
  };

  useEffect(() => {
    const fetchEmployeeTasks = async () => {
      try {
        const [complaintsRes, ordersRes] = await Promise.all([
          fetch('/api/complaints'),
          fetch('/api/orders')
        ]);

        const combined: StaffTask[] = [];

        if (complaintsRes.ok) {
          const cJson = await complaintsRes.json();
          if (cJson?.data && Array.isArray(cJson.data)) {
            cJson.data.forEach((c: any) => {
              combined.push({
                id: c.id,
                title: c.title || 'Perbaikan / Keluhan Kamar',
                room: `Kamar ${c.roomNumber || 'EKS-01'}`,
                tenantName: c.tenantName,
                category: c.category || 'MAINTENANCE',
                assignedTo: c.assignedStaff || 'Bambang Prasetyo (Staf Lapangan)',
                dueTime: 'Hari Ini',
                status: c.status === 'RESOLVED' ? 'RESOLVED' : c.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'OPEN',
                completed: c.status === 'RESOLVED',
                ownerInstruction: c.description || 'Segera tangani keluhan di kamar ini.',
                source: 'complaint',
              });
            });
          }
        }

        if (ordersRes.ok) {
          const oJson = await ordersRes.json();
          if (oJson?.data && Array.isArray(oJson.data)) {
            oJson.data.forEach((o: any) => {
              combined.push({
                id: o.id,
                title: `Plotting Pengantaran: ${o.item}`,
                room: `Kamar ${o.roomNumber || 'EKS-01'}`,
                tenantName: o.tenantName,
                category: 'LOGISTICS',
                assignedTo: 'Bambang (Staf)',
                dueTime: 'Segera',
                status: o.status === 'DELIVERED' || o.status === 'COMPLETED' ? 'RESOLVED' : o.status === 'PROCESSING' ? 'IN_PROGRESS' : 'OPEN',
                completed: o.status === 'DELIVERED' || o.status === 'COMPLETED',
                ownerInstruction: o.notes || 'Bantu verifikasi penerimaan barang ke kamar.',
                connectedVendor: o.vendorName,
                source: 'order',
              });
            });
          }
        }

        if (combined.length > 0) {
          setTasks(combined);
        }
      } catch (err) {}
    };

    fetchEmployeeTasks();
    const interval = setInterval(fetchEmployeeTasks, 3000);

    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        if (e.detail.tab === 'complaints' || e.detail.tab === 'tenant_requests') setActiveTab('tasks');
        else if (e.detail.tab === 'inventory') setActiveTab('stock_opname');
        else if (e.detail.tab === 'approval') setActiveTab('checkin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('switch_dashboard_tab', handleSwitchTab);

    return () => {
      clearInterval(interval);
      window.removeEventListener('switch_dashboard_tab', handleSwitchTab);
    };
  }, []);

  return (
    <SequenceSaaSLayout
      role="employee"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={activeTab === 'tasks' ? 'tenant_requests' : activeTab === 'stock_opname' ? 'inventory' : activeTab === 'expense_history' ? 'expense_history' : 'approval'}
      onTabChange={(t) => {
        if (t === 'inventory') setActiveTab('stock_opname');
        else if (t === 'expense_history') setActiveTab('expense_history');
        else if (t === 'approval') setActiveTab('checkin');
        else setActiveTab('tasks');
      }}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
      {/* Staff Header Banner (Soft Raised Neumorphic Card) */}
      <div className="neu-card p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Dashboard Operasional Karyawan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pelaksanaan tugas lapangan, inspeksi kamar masuk/keluar, dan audit berkala stok pasokan kosan.
          </p>
        </div>
      </div>

      {/* Tab: Stock Opname (SO) Audit Fisik Barang */}
      {activeTab === 'stock_opname' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          {/* 📅 End-of-Month Audit Schedule & Reminder Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30 shadow-lg">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg shrink-0 border border-emerald-500/40">
                <i className="fa-solid fa-calendar-check" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Jadwal Wajib Akhir Bulan
                  </span>
                  <span className="text-emerald-400 text-xs font-bold font-mono">
                    Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
                  Audit Fisik Berkala Tutup Buku (Akhir Bulan)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  ⏰ Sistem Auto-Pilot KosanKu otomatis mengaktifkan reminder tanggal 27-31 setiap bulan untuk memastikan akurasi stok fisik vs sistem.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-300 font-extrabold text-xs border border-white/10 flex items-center gap-1.5">
                <i className="fa-solid fa-circle-check text-emerald-400" /> Reminder Aktif
              </span>
            </div>
          </div>

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

          <div className="space-y-4">
            {tasks.map((task) => {
              const isResolved = task.status === 'RESOLVED' || task.completed;
              const isInProgress = task.status === 'IN_PROGRESS';
              const isOpen = task.status === 'OPEN' && !task.completed;

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl transition-all space-y-3.5 ${
                    isResolved
                      ? 'neu-inset opacity-80'
                      : isInProgress
                      ? 'neu-card-sm border-2 border-amber-500/50 bg-amber-500/5'
                      : 'neu-card-sm border border-slate-200/60 dark:border-white/10 hover:scale-[1.005]'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg neu-inset font-mono text-[10px] font-black text-slate-700 dark:text-slate-200">
                        #{task.id}
                      </span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 w-fit">
                        {task.room}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : isInProgress
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 animate-pulse'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        }`}
                      >
                        {isResolved
                          ? '✅ SELESAI'
                          : isInProgress
                          ? '🟡 SEDANG DIKERJAKAN'
                          : '⏳ MENUNGGU PENANGANAN'}
                      </span>
                    </div>
                  </div>

                  {/* Instruction / Details Box */}
                  {task.ownerInstruction && (
                    <div className="p-3 neu-inset rounded-xl text-xs space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                      <div>
                        📌 <strong>Instruksi &amp; Uraian:</strong> {task.ownerInstruction}
                      </div>
                      {task.connectedVendor && (
                        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          Mitra Vendor: {task.connectedVendor}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note Input for Progress / Resolution */}
                  {!isResolved && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={taskNotes[task.id] || ''}
                        onChange={(e) =>
                          setTaskNotes((prev) => ({ ...prev, [task.id]: e.target.value }))
                        }
                        placeholder="Catatan pengerjaan lapangan / bukti servis (opsional)..."
                        className="flex-1 p-2.5 neu-input rounded-xl text-xs outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {/* Footer & Action Stepper Buttons */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Petugas: <strong className="text-slate-700 dark:text-slate-300">{task.assignedTo}</strong>
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 1-Click Magic Link Sheet */}
                      <a
                        href={`/portal/staff-task?id=${task.id}&staff=${encodeURIComponent(task.assignedTo)}&room=${encodeURIComponent(task.room)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 rounded-xl neu-btn text-slate-600 dark:text-slate-300 hover:text-[#047857] text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                        <span>Magic Link</span>
                      </a>

                      {/* Button: Mulai Kerjakan (if OPEN) */}
                      {isOpen && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS', taskNotes[task.id])}
                          className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                        >
                          <i className="fa-solid fa-play text-[10px]" />
                          <span>Mulai Kerjakan</span>
                        </button>
                      )}

                      {/* Button: Tandai Selesai (if OPEN or IN_PROGRESS) */}
                      {!isResolved && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, 'RESOLVED', taskNotes[task.id])}
                          className="py-1.5 px-3 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs"
                        >
                          <i className="fa-solid fa-circle-check text-[10px]" />
                          <span>Tandai Selesai &amp; Lapor ke Owner</span>
                        </button>
                      )}

                      {/* Button: Buka Kembali (if RESOLVED) */}
                      {isResolved && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, 'OPEN')}
                          className="py-1.5 px-3 rounded-xl neu-btn text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-[11px] cursor-pointer"
                        >
                          <i className="fa-solid fa-rotate-left text-[10px] mr-1" />
                          Buka Kembali
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs neu-inset rounded-2xl">
                <i className="fa-solid fa-list-check text-2xl text-emerald-500 mb-2 block" />
                Belum ada tugas atau keluhan aktif yang perlu dikerjakan hari ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Check-in & Check-Out Inventory Inspection (Interactive Room Inspection) */}
      {activeTab === 'checkin' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check text-blue-600 dark:text-blue-400" />
                Inspeksi Cek-In &amp; Cek-Out Kamar Penghuni
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pilih kamar dan tipe inspeksi (Penghuni Baru Masuk vs Penghuni Keluar/Selesai Sewa) untuk dilaporkan ke Owner.
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold text-xs">
              Staf: Bambang Prasetyo
            </span>
          </div>

          {/* 1. Selector Kamar & Tipe Inspeksi */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Pilih Kamar yang Diinspeksi *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { number: 'A-101', type: 'Deluxe Studio', tenant: 'Rian Pratama', icon: 'fa-door-closed' },
                  { number: 'A-102', type: 'Standard Room', tenant: 'Budi Santoso', icon: 'fa-door-closed' },
                  { number: 'B-201', type: 'Executive Suite', tenant: 'Siti Rahma', icon: 'fa-door-closed' },
                  { number: 'B-202', type: 'Standard Single', tenant: 'Kosong', icon: 'fa-door-open' },
                  { number: 'C-301', type: 'Studio Balcony', tenant: 'Kosong', icon: 'fa-door-open' },
                ].map((rm) => {
                  const isSelected = selectedRoomNumber === rm.number;
                  return (
                    <button
                      key={rm.number}
                      type="button"
                      onClick={() => {
                        setSelectedRoomNumber(rm.number);
                        setTenantNameForInspection(rm.tenant !== 'Kosong' ? rm.tenant : '');
                      }}
                      className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg scale-[1.02] border-2 border-emerald-400'
                          : 'neu-card-sm text-slate-800 dark:text-slate-200 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black">{rm.number}</span>
                        <i className={`fa-solid ${rm.icon} text-xs ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <span className={`text-[10px] block font-extrabold truncate ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {rm.type}
                        </span>
                        <span className={`text-[9px] block truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {rm.tenant}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nama Penghuni / Tenant</label>
                <input
                  type="text"
                  value={tenantNameForInspection}
                  onChange={(e) => setTenantNameForInspection(e.target.value)}
                  placeholder="cth: Rian Pratama"
                  className="w-full p-3 neu-input rounded-2xl outline-none text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Tipe Aktivitas *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInspectionType('CHECK_IN')}
                    className={`flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      inspectionType === 'CHECK_IN'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'neu-btn text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <i className="fa-solid fa-key" /> Cek-In (Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectionType('CHECK_OUT')}
                    className={`flex-1 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      inspectionType === 'CHECK_OUT'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'neu-btn text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <i className="fa-solid fa-door-open" /> Cek-Out (Keluar)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Interactive Checklist Items */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Checklist Kondisi Fisik &amp; Fasilitas Kamar {selectedRoomNumber}:
            </h4>

            {inspectionItems.map((item, idx) => (
              <div key={idx} className="neu-card-sm p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white block">{item.item}</span>
                  <span className="text-[10px] text-slate-400">Status verifikasi staf:</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateInspectionItemStatus(idx, 'ADA_BAIK')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      item.status === 'ADA_BAIK'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'neu-btn text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                    }`}
                  >
                    <i className="fa-solid fa-circle-check text-[10px]" /> Ada &amp; Baik
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInspectionItemStatus(idx, 'PERLU_PERBAIKAN')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      item.status === 'PERLU_PERBAIKAN'
                        ? 'bg-amber-500 text-slate-900 shadow-xs'
                        : 'neu-btn text-slate-600 dark:text-slate-300 hover:bg-amber-50'
                    }`}
                  >
                    <i className="fa-solid fa-triangle-exclamation text-[10px]" /> Rusak / Perlu Perbaikan
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInspectionItemStatus(idx, 'HILANG')}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                      item.status === 'HILANG'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'neu-btn text-slate-600 dark:text-slate-300 hover:bg-rose-50'
                    }`}
                  >
                    <i className="fa-solid fa-circle-xmark text-[10px]" /> Hilang / Kurang
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Catatan & Tombol Kirim Laporan ke Owner */}
          <div className="space-y-4 pt-3 border-t border-slate-200/60 dark:border-white/5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Catatan Kondisi Kamar &amp; Meteran Listrik/Air (Untuk Laporan Owner)
              </label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                rows={2}
                placeholder="cth: Kamar sudah dibersihkan total, kran air lancar, meteran awal listrik 142 kWh, kunci diserahkan ke tenant."
                className="w-full p-3 neu-input rounded-2xl outline-none text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <i className="fa-solid fa-shield-halved text-emerald-600 mr-1" />
                Laporan ini akan langsung tersinkronisasi ke Dashboard &amp; Notifikasi Owner.
              </div>
              <button
                type="button"
                onClick={handleSubmitInspectionReport}
                className="px-6 py-3.5 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-2xl text-xs shadow-lg hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-paper-plane" />
                <span>Kirim Hasil Inspeksi Kamar {selectedRoomNumber} ke Owner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Status Pengajuan Dana ke Owner (Full Dedicated Tab) */}
      {activeTab === 'expense_history' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-file-invoice-dollar text-purple-600 dark:text-purple-400" />
                Status &amp; Konfirmasi Pengajuan Dana Operasional ke Owner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pantau konfirmasi persetujuan (Approve / Reject) anggaran dari Owner secara real-time.
              </p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 w-fit"
            >
              <i className="fa-solid fa-plus" />
              <span>+ Ajukan Dana Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {myExpenseRequests.map((req: any) => (
              <div key={req.id} className="p-5 neu-card-sm rounded-2xl space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                      #{req.id}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{req.title}</h4>
                  </div>
                  <span className={`px-3.5 py-1 rounded-full text-[10px] font-black uppercase w-fit ${
                    req.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300'
                      : req.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 animate-pulse'
                  }`}>
                    {req.status === 'APPROVED' ? '✅ Disetujui Owner (Siap Cair)' : req.status === 'REJECTED' ? '❌ Ditolak Owner' : '⏳ Menunggu Approval Owner'}
                  </span>
                </div>

                <div className="p-3.5 neu-inset rounded-xl text-slate-700 dark:text-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Kebutuhan / Urgensi:</span>
                  <p className="italic font-medium">&quot;{req.reason}&quot;</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-white/5 text-[11px] text-slate-500">
                  <span>Waktu Pengajuan: <strong>{req.requestDate || req.date || 'Hari ini'}</strong></span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Nominal Anggaran:</span>
                    <span className="font-black text-base text-purple-700 dark:text-purple-400">
                      Rp {Number(req.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {myExpenseRequests.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs neu-inset rounded-2xl">
                Belum ada riwayat pengajuan dana yang dikirim
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification (Luxury Glassmorphism Card) */}
      {toast && (
        <ToastNotification
          msg={toast}
          type="info"
          onClose={() => setToast(null)}
        />
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
