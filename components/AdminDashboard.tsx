'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FinancialDashboard from './FinancialDashboard';
import MasterDataSettings from './MasterDataSettings';

interface RoomData {
  id: string;
  number: string;
  type: string;
  price: number;
  status: string;
  floor: number;
  facilities?: string[];
  imageUrl?: string | null;
  videoUrl?: string | null;
  tenant: { name: string } | null;
}

const FACILITY_OPTIONS = ['AC', 'WiFi', 'KM Dalam', 'TV', 'Kasur', 'Lemari', 'Meja', 'Kipas'];

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentStatus: string;
  user: { name: string };
}

interface TenantOption {
  id: string;
  name: string;
}

interface ComplaintTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string };
  room?: { number: string };
  adminNote?: string;
}

const FALLBACK_ROOMS: RoomData[] = [
  { id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000, status: 'OCCUPIED', floor: 1, tenant: { name: 'Budi Santoso' } },
  { id: '2', number: 'A-102', type: 'Deluxe Studio Smart', price: 1500000, status: 'AVAILABLE', floor: 1, tenant: null },
  { id: '3', number: 'B-201', type: 'VIP Balcony Resort', price: 2000000, status: 'OCCUPIED', floor: 2, tenant: { name: 'Siti Rahma' } },
  { id: '4', number: 'B-202', type: 'VIP Balcony Resort', price: 2000000, status: 'MAINTENANCE', floor: 2, tenant: null },
  { id: '5', number: 'C-301', type: 'Standard Smart Suite', price: 1200000, status: 'AVAILABLE', floor: 3, tenant: null },
  { id: '6', number: 'C-302', type: 'Standard Smart Suite', price: 1200000, status: 'OCCUPIED', floor: 3, tenant: { name: 'Rian Pratama' } },
];

const FALLBACK_INVOICES: InvoiceData[] = [
  { id: '1', invoiceNumber: 'INV-2026-0701', totalAmount: 1604500, paymentStatus: 'PENDING', user: { name: 'Budi Santoso' } },
  { id: '2', invoiceNumber: 'INV-2026-0601', totalAmount: 2000000, paymentStatus: 'SETTLED', user: { name: 'Siti Rahma' } },
  { id: '3', invoiceNumber: 'INV-2026-0602', totalAmount: 1200000, paymentStatus: 'SETTLED', user: { name: 'Rian Pratama' } },
];

const FALLBACK_COMPLAINTS: ComplaintTicket[] = [
  {
    id: 'c1',
    title: 'AC Kamar A-101 Kurang Dingin',
    description: 'Freon tampaknya perlu ditambah karena udara hanya keluar angin saja sejak kemarin sore.',
    status: 'OPEN',
    createdAt: '2026-07-06 14:20',
    user: { name: 'Budi Santoso', email: 'budi@example.com' },
    room: { number: 'A-101' },
    adminNote: '',
  },
  {
    id: 'c2',
    title: 'Kran Air Kamar Mandi Bocor Halus',
    description: 'Ada tetesan air dari kran wasteland bawah.',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-05 09:15',
    user: { name: 'Siti Rahma', email: 'siti@example.com' },
    room: { number: 'B-201' },
    adminNote: 'Teknisi dijadwalkan datang besok jam 10:00.',
  },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

import SaaSLayout from './SaaSLayout';

function statusBadge(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    OCCUPIED: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
    BOOKING: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-400/15 dark:text-amber-400 dark:border-amber-400/30',
    MAINTENANCE: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    SETTLED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    OPEN: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
  };
  return map[status] || '';
}

import SequenceSaaSLayout from './SequenceSaaSLayout';
import type { RoleType } from '@/app/page';

export default function AdminDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const [activeBranch, setActiveBranch] = useState('all');
  const [rooms, setRooms] = useState<RoomData[]>(FALLBACK_ROOMS);
  const [invoices, setInvoices] = useState<InvoiceData[]>(FALLBACK_INVOICES);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>(FALLBACK_COMPLAINTS);
  const [tab, setTab] = useState<'overview' | 'financial' | 'tenants' | 'complaints' | 'master_data'>('overview');
  const [loading, setLoading] = useState(true);

  // Search & Filter state (Fitur 1)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'>('ALL');

  // Modal states
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Add Room form
  const [roomForm, setRoomForm] = useState({ number: '', type: '', price: '', floor: '1', facilities: [] as string[], imageUrl: '', videoUrl: '' });
  const roomFileRef = useRef<HTMLInputElement>(null);
  const roomVideoRef = useRef<HTMLInputElement>(null);
  // Add Invoice form
  const [invForm, setInvForm] = useState({ userId: '', roomId: '', amount: '', dueDate: '' });
  // Add Tenant form
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: '', email: '', phone: '', password: '', roomId: '' });
  // AI Pricing
  const [pricingData, setPricingData] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  // Recent Activity Stream (Fitur 5)
  const [activities, setActivities] = useState([
    { id: 1, icon: 'fa-credit-card', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/15', text: 'Pembayaran INV-2026-0601 diselesaikan via Mobile App QRIS oleh Siti Rahma', time: '5 menit lalu' },
    { id: 2, icon: 'fa-bell', color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/15', text: 'Mobile App Push Notification pengingat tagihan dikirim otomatis ke HP Budi Santoso', time: '12 menit lalu' },
    { id: 3, icon: 'fa-camera-retro', color: 'text-purple-500 bg-purple-100 dark:bg-purple-500/15', text: 'Struk utilitas Listrik PLN Rp 4.200.000 berhasil di-OCR AI', time: '1 jam lalu' },
    { id: 4, icon: 'fa-wrench', color: 'text-rose-500 bg-rose-100 dark:bg-rose-500/15', text: 'Laporan keluhan baru: AC Kamar A-101 kurang dingin', time: '2 jam lalu' },
  ]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, invRes, tenantsRes, complaintsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/invoices'),
        fetch('/api/tenants'),
        fetch('/api/complaints'),
      ]);
      if (roomsRes.ok) {
        const roomsJson = await roomsRes.json();
        if (roomsJson.data?.length) setRooms(roomsJson.data);
      }
      if (invRes.ok) {
        const invJson = await invRes.json();
        if (invJson.data?.length) setInvoices(invJson.data);
      }
      if (tenantsRes.ok) {
        const tJson = await tenantsRes.json();
        if (tJson.data?.length) setTenants(tJson.data);
      }
      if (complaintsRes.ok) {
        const cJson = await complaintsRes.json();
        if (cJson.data?.length) setComplaints(cJson.data);
      }
    } catch {
      // API not available, use fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fitur 2: Push Notification to Mobile App
  const triggerMobilePush = (invoice: InvoiceData) => {
    showToast(`📱 Push Notif terkirim otomatis ke Mobile App tenant [${invoice.user?.name || 'Penyewa'}] untuk ${invoice.invoiceNumber}`);
    setActivities((prev) => [
      {
        id: Date.now(),
        icon: 'fa-bell',
        color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/15',
        text: `Push Notif pengingat tagihan ${invoice.invoiceNumber} dikirim ke Mobile App ${invoice.user?.name || ''}`,
        time: 'Baru saja',
      },
      ...prev,
    ]);
  };

  // Fitur 3: Update Complaint Status
  const updateComplaintStatus = async (id: string, newStatus: string, note?: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, adminNote: note !== undefined ? note : c.adminNote } : c))
    );
    try {
      await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, adminNote: note }),
      });
      showToast(`Status tiket keluhan diperbarui menjadi ${newStatus}`);
    } catch {
      showToast('Gagal memperbarui status keluhan', 'error');
    }
  };

  const toggleStatus = async (id: string) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    const next = room.status === 'AVAILABLE' ? 'OCCUPIED' : room.status === 'OCCUPIED' ? 'MAINTENANCE' : 'AVAILABLE';
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    try {
      await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
    } catch {
      setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status: room.status } : r)));
    }
  };

  const deleteRoom = async (id: string) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    if (!confirm(`Hapus kamar ${room.number}?`)) return;
    try {
      const res = await fetch(`/api/rooms/${id}?hard=true`, { method: 'DELETE' });
      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.id !== id));
        showToast(`Kamar ${room.number} dihapus`);
      } else {
        showToast('Gagal menghapus kamar', 'error');
      }
    } catch {
      showToast('Gagal menghapus kamar', 'error');
    }
  };

  const handleRoomPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRoomForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleRoomVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate: max 50MB, video format
    if (file.size > 50 * 1024 * 1024) {
      showToast('Video terlalu besar! Maksimal 50MB', 'error');
      if (roomVideoRef.current) roomVideoRef.current.value = '';
      return;
    }
    const url = URL.createObjectURL(file);
    setRoomForm((prev) => ({ ...prev, videoUrl: url }));
  };

  const toggleFacility = (f: string) => {
    setRoomForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f) ? prev.facilities.filter((x) => x !== f) : [...prev.facilities, f],
    }));
  };

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomForm),
      });
      const json = await res.json();
      if (res.ok) {
        setRooms((prev) => [...prev, { ...json.data, tenant: null }]);
        setShowAddRoom(false);
        setRoomForm({ number: '', type: '', price: '', floor: '1', facilities: [], imageUrl: '', videoUrl: '' });
        if (roomFileRef.current) roomFileRef.current.value = '';
        if (roomVideoRef.current) roomVideoRef.current.value = '';
        showToast(`Kamar ${json.data.number} ditambahkan`);
      } else {
        showToast(json.error || 'Gagal menambah kamar', 'error');
      }
    } catch {
      showToast('Gagal menambah kamar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm),
      });
      const json = await res.json();
      if (res.ok) {
        setTenants((prev) => [...prev, json.data]);
        setShowAddTenant(false);
        setTenantForm({ name: '', email: '', phone: '', password: '', roomId: '' });
        showToast(`Penyewa ${json.data.name} ditambahkan`);
        fetchData();
      } else {
        showToast(json.error || 'Gagal menambah penyewa', 'error');
      }
    } catch {
      showToast('Gagal menambah penyewa', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invForm),
      });
      const json = await res.json();
      if (res.ok) {
        setInvoices((prev) => [json.data, ...prev]);
        setShowAddInvoice(false);
        setInvForm({ userId: '', roomId: '', amount: '', dueDate: '' });
        showToast('Invoice berhasil dibuat');
      } else {
        showToast(json.error || 'Gagal membuat invoice', 'error');
      }
    } catch {
      showToast('Gagal membuat invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchAIPricing = async () => {
    setPricingLoading(true);
    try {
      const res = await fetch('/api/ai/pricing', { method: 'POST' });
      const json = await res.json();
      if (res.ok) setPricingData(json.data);
      else showToast(json.error || 'Gagal analisis pricing', 'error');
    } catch {
      showToast('Gagal menghubungi AI Pricing', 'error');
    } finally {
      setPricingLoading(false);
    }
  };

  // Filtered rooms for Fitur 1
  const filteredRooms = rooms.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      r.number.toLowerCase().includes(query) ||
      r.type.toLowerCase().includes(query) ||
      (r.tenant?.name || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;
  const pendingInvoices = invoices.filter((i) => i.paymentStatus === 'PENDING');
  const totalRevenue = invoices.filter((i) => i.paymentStatus === 'SETTLED').reduce((s: number, i: InvoiceData) => s + i.totalAmount, 0);

  return (
    <SequenceSaaSLayout
      role="superadmin"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={tab === 'financial' ? 'financial' : tab === 'master_data' ? 'master_data' : tab === 'complaints' ? 'complaints' : 'overview'}
      onTabChange={(t) => {
        if (t === 'financial') setTab('financial');
        else if (t === 'master_data') setTab('master_data');
        else if (t === 'complaints') setTab('complaints');
        else setTab('overview');
      }}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
      {/* SuperAdmin Header Banner (Soft Raised Neumorphic Card) */}
      <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 text-[10px] font-black border border-amber-300 dark:border-amber-500/30 flex items-center gap-1.5">
              <i className="fa-solid fa-bolt text-amber-500 text-[9px]" />
              Super Admin System Control Hub
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">Akses Seluruh Menu &amp; Setting Master Data Multi-Kosan</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">SuperAdmin Platform Master Console</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 neu-card-sm rounded-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <i className="fa-solid fa-sliders text-amber-500" />
            <span>Master Data Config: Active</span>
          </div>
        </div>
      </div>

      {/* Tab: Master Data Settings (SuperAdmin Access) */}
      {tab === 'master_data' ? (
        <MasterDataSettings />
      ) : tab === 'complaints' ? (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-headset text-purple-600 dark:text-purple-400" />
                Pusat Keluhan &amp; Tiket Layanan Tenant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola laporan kendala fasilitas dari penyewa secara real-time</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400 rounded-full font-bold">
                {complaints.filter((c) => c.status === 'OPEN').length} Perlu Penanganan
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">Belum ada tiket keluhan penyewa.</p>
            )}
            {complaints.map((c) => (
              <div key={c.id} className="neu-card-sm rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[10px] font-bold">
                      Kamar {c.room?.number || 'A-101'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 border rounded-full text-[9px] font-bold uppercase w-fit ${statusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed neu-inset p-3 rounded-xl">
                  &quot;{c.description}&quot;
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] pt-2 border-t border-slate-200/60 dark:border-white/10">
                  <span className="text-slate-500 dark:text-slate-400">
                    Pelapor: <strong className="text-slate-900 dark:text-white">{c.user?.name || 'Budi Santoso'}</strong> • {c.createdAt}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Ubah Status:</span>
                    <button
                      onClick={() => updateComplaintStatus(c.id, 'IN_PROGRESS', 'Sedang ditangani oleh teknisi')}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 rounded-lg font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Diproses
                    </button>
                    <button
                      onClick={() => updateComplaintStatus(c.id, 'RESOLVED', 'Selesai diperbaiki')}
                      className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-lg font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
                {c.adminNote && (
                  <div className="p-2.5 neu-inset rounded-xl text-[10px] text-amber-800 dark:text-amber-300">
                    📌 <strong>Catatan Admin:</strong> {c.adminNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'tenants' ? (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Manajemen Penyewa</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola data penyewa kosan aktif (Mobile App Connected)</p>
            </div>
            <button
              onClick={() => setShowAddTenant(true)}
              className="px-4 py-2.5 neu-btn text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              + Tambah Penyewa
            </button>
          </div>
          <div className="space-y-3">
            {tenants.length === 0 && <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">Belum ada data penyewa.</p>}
            {tenants.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-4 neu-card-sm rounded-2xl transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center text-sm font-black shadow-xs">
                    {t.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{t.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t.email} • {t.phone || '-'}</span>
                  </div>
                </div>
                <div className="text-right">
                  {t.rooms?.length > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                      Kamar {t.rooms[0].number}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Belum ada kamar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'financial' ? (
        <FinancialDashboard />
      ) : (
      <>
      {/* Stat cards (Soft Raised Neumorphic Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Stat 1: Revenue */}
        <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Revenue</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl neu-btn text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs sm:text-sm">
              <i className="fa-solid fa-wallet" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">{formatIDR(totalRevenue)}</div>
          <div className="text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <i className="fa-solid fa-arrow-trend-up text-[8px] sm:text-[9px]" /> Terkumpul
          </div>
        </div>

        {/* Stat 2: Okupansi */}
        <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Okupansi</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl neu-btn text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs sm:text-sm">
              <i className="fa-solid fa-bed" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">{occupancyPct}%</div>
          <div className="w-full neu-inset rounded-full h-2 overflow-hidden p-0.5">
            <div className="bg-[#047857] dark:bg-emerald-400 h-1 rounded-full transition-all duration-700 shadow-xs" style={{ width: `${occupancyPct}%` }} />
          </div>
        </div>

        {/* Stat 3: Pending */}
        <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl neu-btn text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs sm:text-sm">
              <i className="fa-solid fa-clock" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
            {pendingInvoices.length} <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Invoice</span>
          </div>
          <div className="text-[9px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold truncate">
            {formatIDR(pendingInvoices.reduce((s: number, i: InvoiceData) => s + i.totalAmount, 0))} tunggakan
          </div>
        </div>

        {/* Stat 4: Total Unit */}
        <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Unit</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl neu-btn text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs sm:text-sm">
              <i className="fa-solid fa-door-open" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
            {rooms.length} <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Unit</span>
          </div>
          <div className="text-[9px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
            {rooms.filter((r) => r.status === 'AVAILABLE').length} unit tersedia
          </div>
        </div>
      </div>

      {/* Room Management with Fitur 1 (Search & Filter System) */}
      <div className="neu-card p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4 sm:pb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Manajemen Kamar</h2>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kelola status unit &amp; penghuni real-time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddInvoice(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 neu-btn text-slate-900 dark:text-white font-bold rounded-xl text-[10px] sm:text-xs transition-all cursor-pointer"
            >
              + Invoice
            </button>
            <button
              onClick={() => setShowAddRoom(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 neu-btn text-slate-900 dark:text-white font-bold rounded-xl text-[10px] sm:text-xs transition-all cursor-pointer"
            >
              + Tambah Kamar
            </button>
          </div>
        </div>

        {/* Fitur 1: Interactive Search & Status Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 neu-inset p-3 sm:p-4 rounded-2xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no. kamar, tipe, atau penyewa..."
              className="w-full pl-9 pr-4 py-2 neu-input rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors placeholder-slate-400"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {(['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#047857] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]'
                    : 'neu-btn text-slate-600 dark:text-slate-300'
                }`}
              >
                {status === 'ALL' ? 'Semua Status' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Room Result Counter */}
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Menampilkan {filteredRooms.length} dari {rooms.length} unit</span>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
              Reset Pencarian
            </button>
          )}
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map((room) => (
            <div key={room.id} className="neu-card-sm p-5 rounded-2xl space-y-3 overflow-hidden hover:scale-[1.01] transition-all">
              {room.imageUrl && (
                <div className="-mx-5 -mt-5 mb-3 h-36 overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img src={room.imageUrl} alt={`Kamar ${room.number}`} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">{room.number}</span>
                <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold uppercase shadow-2xs ${statusBadge(room.status)}`}>{room.status}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{room.type} • Lt {room.floor}</div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">{formatIDR(room.price)}<span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/bln</span></div>
              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {room.facilities.map((f) => (
                    <span key={f} className="px-2 py-0.5 neu-card-sm rounded-md text-[9px] text-slate-700 dark:text-slate-300 font-medium">{f}</span>
                  ))}
                </div>
              )}
              <div className="pt-3 border-t border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{room.tenant ? `👤 ${room.tenant.name}` : 'Kosong'}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleStatus(room.id)} className="text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer">Status</button>
                    <button onClick={() => deleteRoom(room.id)} className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer">Hapus</button>
                  </div>
                </div>
                {room.status === 'BOOKING' && (
                  <div className="neu-inset rounded-xl p-2.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      <i className="fa-solid fa-clock-rotate-left" /> Menunggu Konfirmasi Admin
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, status: 'OCCUPIED' } : r));
                          showToast(`✅ Kamar ${room.number} dikonfirmasi → OCCUPIED`);
                        }}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <i className="fa-solid fa-check" /> Konfirmasi
                      </button>
                      <button
                        onClick={() => {
                          setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, status: 'AVAILABLE' } : r));
                          showToast(`❌ Booking kamar ${room.number} ditolak → AVAILABLE`, 'error');
                        }}
                        className="flex-1 py-1.5 bg-rose-100 dark:bg-rose-500/20 hover:bg-rose-200 text-rose-700 dark:text-rose-400 text-[10px] font-extrabold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <i className="fa-solid fa-xmark" /> Tolak
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Utilities + Payment Tracker with Mobile Push Notification (Fitur 2) + Recent Activity Stream (Fitur 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Fitur 5: Recent Activity Stream */}
        <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-purple-600 dark:text-purple-400 text-[10px] sm:text-xs" />
              Aktivitas Terkini
            </h3>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Live Feed</span>
          </div>
          <div className="space-y-3 text-xs max-h-80 overflow-y-auto">
            {activities.map((act) => (
              <div key={act.id} className="p-3 neu-card-sm rounded-2xl flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 neu-btn ${act.color}`}>
                  <i className={`fa-solid ${act.icon}`} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-800 dark:text-slate-200 font-medium leading-snug">{act.text}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Tracker with Mobile App Push Notification Button (Fitur 2) */}
        <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-receipt text-amber-500 text-[10px] sm:text-xs" /> Payment Tracker &amp; Push Reminder
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Push Notif terkirim otomatis ke Mobile App tenant H-3 &amp; H-1</p>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 rounded-full text-[9px] font-bold w-fit">
              📱 Mobile Push Ready
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Invoice</th>
                  <th className="py-3 px-3">Penyewa</th>
                  <th className="py-3 px-3">Nominal</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Mobile Push</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-200">
                {invoices.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-[11px] font-bold text-purple-700 dark:text-purple-400">{t.invoiceNumber}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white text-[11px]">{t.user?.name || '-'}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white text-[11px]">{formatIDR(t.totalAmount)}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border shadow-2xs ${statusBadge(t.paymentStatus)}`}>
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {t.paymentStatus === 'PENDING' ? (
                        <button
                          onClick={() => triggerMobilePush(t)}
                          className="px-2.5 py-1 neu-btn text-slate-900 dark:text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 ml-auto cursor-pointer"
                          title="Kirim Notifikasi Push ke Mobile App Penyewa"
                        >
                          <i className="fa-solid fa-bell text-[9px] text-amber-500" />
                          <span>Push Notif</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 justify-end">
                          <i className="fa-solid fa-circle-check text-[9px]" /> Lunas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Dynamic Pricing */}
      <div className="neu-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-robot text-purple-600 dark:text-purple-400 text-[10px] sm:text-xs" /> AI Dynamic Pricing
          </h3>
          <button
            onClick={fetchAIPricing}
            disabled={pricingLoading}
            className="px-3.5 sm:px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-2xl text-[9px] sm:text-[10px] shadow-sm hover:scale-[1.02] transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
          >
            {pricingLoading ? <><i className="fa-solid fa-spinner fa-spin mr-1.5" />Menganalisis...</> : <><i className="fa-solid fa-wand-magic-sparkles mr-1.5" />Analisis Harga</>}
          </button>
        </div>
        {pricingData && (
          <div className="space-y-4 animate-scale-in">
            {pricingData.insights && (
              <div className="p-4 neu-inset rounded-2xl">
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  <i className="fa-solid fa-lightbulb text-amber-600 dark:text-amber-400 mr-2" />
                  {pricingData.insights}
                </p>
              </div>
            )}
            {pricingData.recommendations?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pricingData.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-4 neu-card-sm rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white">{rec.roomType}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        rec.confidence === 'high' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400'
                      }`}>
                        {rec.confidence}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 line-through">{formatIDR(rec.currentPrice)}</span>
                      <i className="fa-solid fa-arrow-right text-[8px] text-purple-600 dark:text-purple-400" />
                      <span className="font-black text-purple-700 dark:text-purple-300">{formatIDR(rec.suggestedPrice)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{rec.reason}</p>
                  </div>
                ))}
              </div>
            )}
            {pricingData.occupancyTrend && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                <i className="fa-solid fa-chart-line mr-1" /> Tren okupansi: <span className={`font-bold ${pricingData.occupancyTrend === 'naik' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{pricingData.occupancyTrend}</span>
              </p>
            )}
          </div>
        )}
        {!pricingData && !pricingLoading && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Klik &quot;Analisis Harga&quot; untuk mendapat rekomendasi harga optimal dari AI berdasarkan okupansi &amp; tren.</p>
        )}
      </div>
      </>
      )}

      {/* Toast notification (Bottom Right) */}
      {toast && (
        <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] px-5 py-3 rounded-2xl text-xs font-bold neu-card border shadow-2xl animate-scale-in flex items-center gap-2 ${
          toast.type === 'success' ? 'text-emerald-800 dark:text-emerald-300 border-emerald-500/30' : 'text-rose-800 dark:text-rose-300 border-rose-500/30'
        }`}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check text-emerald-600 dark:text-emerald-400' : 'fa-circle-exclamation text-rose-600 dark:text-rose-400'}`} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddRoom(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-lg space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Kamar Baru</h3>
              <button onClick={() => setShowAddRoom(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={addRoom} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Foto Kamar</label>
                <input ref={roomFileRef} type="file" accept="image/*" onChange={handleRoomPhoto} className="hidden" id="roomPhotoInput" />
                {roomForm.imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10">
                    <img src={roomForm.imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => { setRoomForm((p) => ({ ...p, imageUrl: '' })); if (roomFileRef.current) roomFileRef.current.value = ''; }} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="roomPhotoInput" className="block cursor-pointer neu-inset hover:border-purple-500 rounded-2xl p-6 text-center transition-all group">
                    <div className="w-10 h-10 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 flex items-center justify-center text-base mx-auto mb-2 group-hover:scale-110 transition-transform"><i className="fa-solid fa-camera" /></div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Klik untuk upload foto kamar</p>
                    <p className="text-[9px] text-slate-400">JPG, PNG, atau WebP</p>
                  </label>
                )}
              </div>

              {/* 🎬 Video Tour Kamar */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-video text-[#047857] dark:text-emerald-400" /> Video Tur Kamar <span className="text-[9px] font-normal text-slate-400">(MP4/MOV/WebM · maks. 50MB)</span>
                </label>
                <input
                  ref={roomVideoRef}
                  type="file"
                  accept="video/*"
                  onChange={handleRoomVideo}
                  className="hidden"
                  id="roomVideoInput"
                />
                {roomForm.videoUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 bg-black">
                    <video
                      src={roomForm.videoUrl}
                      controls
                      playsInline
                      className="w-full h-48 object-contain rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setRoomForm((p) => ({ ...p, videoUrl: '' }));
                        if (roomVideoRef.current) roomVideoRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/90 transition-all cursor-pointer"
                      title="Hapus video"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-emerald-400" /> Video siap di-upload
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="roomVideoInput"
                    className="block cursor-pointer neu-inset rounded-2xl p-5 text-center transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 flex items-center justify-center text-base mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-film" />
                    </div>
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Klik untuk upload video tur kamar</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">MP4, MOV, atau WebM · Maks. 50MB</p>
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nomor Kamar *</label>
                  <input required value={roomForm.number} onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })} placeholder="cth: D-401" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Tipe Kamar *</label>
                  <input required value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} placeholder="cth: Deluxe Studio" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Harga/bulan *</label>
                  <input required type="number" value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} placeholder="1500000" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Lantai</label>
                  <input type="number" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">Fasilitas Kamar</label>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        roomForm.facilities.includes(f)
                          ? 'neu-inset text-[#047857] dark:text-emerald-300 font-bold'
                          : 'neu-btn text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {roomForm.facilities.includes(f) && <i className="fa-solid fa-check mr-1 text-[8px]" />}{f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button type="button" onClick={() => setShowAddRoom(false)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer">
                  {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Simpan Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddTenant && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddTenant(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Penyewa Baru</h3>
              <button onClick={() => setShowAddTenant(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={addTenant} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nama Lengkap *</label>
                <input required value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} placeholder="cth: Budi Santoso" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Email *</label>
                  <input required type="email" value={tenantForm.email} onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} placeholder="email@contoh.com" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">No. WhatsApp *</label>
                  <input required value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} placeholder="0812xxxx" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-mono font-bold" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
                <input type="password" value={tenantForm.password} onChange={(e) => setTenantForm({ ...tenantForm, password: e.target.value })} placeholder="Password login tenant" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Assign Kamar (opsional)</label>
                <select value={tenantForm.roomId} onChange={(e) => setTenantForm({ ...tenantForm, roomId: e.target.value })} className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors font-bold cursor-pointer">
                  <option value="" className="bg-white text-slate-900 dark:bg-[#141122] dark:text-white">Tanpa kamar</option>
                  {rooms.filter((r) => r.status === 'AVAILABLE').map((r) => (
                    <option key={r.id} value={r.id} className="bg-white text-slate-900 dark:bg-[#141122] dark:text-white">
                      {r.number} - {r.type} ({formatIDR(r.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button type="button" onClick={() => setShowAddTenant(false)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer">
                  {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Simpan Penyewa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAddInvoice(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Buat Invoice Baru</h3>
              <button onClick={() => setShowAddInvoice(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={addInvoice} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Penyewa *</label>
                <select required value={invForm.userId} onChange={(e) => setInvForm({ ...invForm, userId: e.target.value })} className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors font-bold cursor-pointer">
                  <option value="" className="bg-white text-slate-900 dark:bg-[#141122] dark:text-white">Pilih penyewa...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="bg-white text-slate-900 dark:bg-[#141122] dark:text-white">{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Kamar *</label>
                <select required value={invForm.roomId} onChange={(e) => {
                  const room = rooms.find((r) => r.id === e.target.value);
                  setInvForm({ ...invForm, roomId: e.target.value, amount: room ? String(room.price) : invForm.amount });
                }} className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors font-bold cursor-pointer">
                  <option value="" className="bg-white text-slate-900 dark:bg-[#141122] dark:text-white">Pilih kamar...</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id} className="bg-white text-slate-900 dark:bg-[#141122] dark:text-white">{r.number} - {r.type}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nominal *</label>
                  <input required type="number" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} placeholder="1500000" className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors placeholder-slate-400 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Jatuh Tempo *</label>
                  <input required type="date" value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-emerald-500 transition-colors font-bold" />
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button type="button" onClick={() => setShowAddInvoice(false)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer">
                  {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Buat Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </SequenceSaaSLayout>
  );
}
