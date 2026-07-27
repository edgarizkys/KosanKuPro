'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FinancialDashboard from './FinancialDashboard';

interface RoomData {
  id: string;
  number: string;
  type: string;
  price: number;
  status: string;
  floor: number;
  facilities?: string[];
  imageUrl?: string | null;
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

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    OCCUPIED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    MAINTENANCE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    SETTLED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  return map[status] || '';
}

export default function AdminDashboard() {
  const [rooms, setRooms] = useState<RoomData[]>(FALLBACK_ROOMS);
  const [invoices, setInvoices] = useState<InvoiceData[]>(FALLBACK_INVOICES);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tab, setTab] = useState<'overview' | 'financial' | 'tenants'>('overview');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Add Room form
  const [roomForm, setRoomForm] = useState({ number: '', type: '', price: '', floor: '1', facilities: [] as string[], imageUrl: '' });
  const roomFileRef = useRef<HTMLInputElement>(null);
  // Add Invoice form
  const [invForm, setInvForm] = useState({ userId: '', roomId: '', amount: '', dueDate: '' });
  // Add Tenant form
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: '', email: '', phone: '', password: '', roomId: '' });
  // AI Pricing
  const [pricingData, setPricingData] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, invRes, tenantsRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/invoices'),
        fetch('/api/tenants'),
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
    } catch {
      // API not available, use fallback data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        setRoomForm({ number: '', type: '', price: '', floor: '1', facilities: [], imageUrl: '' });
        if (roomFileRef.current) roomFileRef.current.value = '';
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
        fetchData(); // refresh rooms (status may change)
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

  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const occupancyPct = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;
  const pendingInvoices = invoices.filter((i) => i.paymentStatus === 'PENDING');
  const totalRevenue = invoices.filter((i) => i.paymentStatus === 'SETTLED').reduce((s: number, i: InvoiceData) => s + i.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Tab switcher */}
      <div className="flex gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/5 rounded-xl border border-white/10 w-full sm:w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab('overview')}
          className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${tab === 'overview' ? 'active-tab' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fa-solid fa-gauge-high mr-1 sm:mr-1.5" /> Overview
        </button>
        <button
          onClick={() => setTab('financial')}
          className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${tab === 'financial' ? 'active-tab' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fa-solid fa-chart-line mr-1 sm:mr-1.5" /> Keuangan
        </button>
        <button
          onClick={() => setTab('tenants')}
          className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${tab === 'tenants' ? 'active-tab' : 'text-slate-400 hover:text-white'}`}
        >
          <i className="fa-solid fa-users mr-1.5" /> Penyewa
        </button>
      </div>

      {tab === 'tenants' ? (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <h2 className="text-lg font-black text-white">Manajemen Penyewa</h2>
              <p className="text-xs text-slate-400 mt-0.5">Kelola data penyewa aktif</p>
            </div>
            <button onClick={() => setShowAddTenant(true)} className="px-4 py-2.5 bg-white text-orchid-dark font-bold rounded-xl text-xs hover:shadow-lg hover:shadow-white/20 transition-all">+ Tambah Penyewa</button>
          </div>
          <div className="space-y-3">
            {tenants.length === 0 && <p className="text-center text-xs text-slate-500 py-8">Belum ada data penyewa.</p>}
            {tenants.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orchid-tint/10 text-orchid-tint flex items-center justify-center text-sm font-black">
                    {t.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{t.name}</span>
                    <span className="text-[10px] text-slate-500">{t.email} • {t.phone || '-'}</span>
                  </div>
                </div>
                <div className="text-right">
                  {t.rooms?.length > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-400">{t.rooms[0].number}</span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Belum ada kamar</span>
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
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 stagger-children">
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orchid-tint/10 text-orchid-tint flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-wallet" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{formatIDR(totalRevenue)}</div>
          <div className="text-[9px] sm:text-[11px] text-emerald-400 font-semibold flex items-center gap-1"><i className="fa-solid fa-arrow-trend-up text-[8px] sm:text-[9px]" /> Terkumpul</div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Okupansi</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-bed" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{occupancyPct}%</div>
          <div className="w-full bg-white/5 rounded-full h-1 sm:h-1.5"><div className="bg-gradient-to-r from-orchid-tint to-orchid-violet h-1 sm:h-1.5 rounded-full transition-all duration-700" style={{ width: `${occupancyPct}%` }} /></div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-clock" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{pendingInvoices.length} <span className="text-xs sm:text-sm font-bold text-slate-400">Invoice</span></div>
          <div className="text-[9px] sm:text-[11px] text-amber-400 font-semibold">{formatIDR(pendingInvoices.reduce((s: number, i: InvoiceData) => s + i.totalAmount, 0))} tunggakan</div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Kamar</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-door-open" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{rooms.length} <span className="text-xs sm:text-sm font-bold text-slate-400">Unit</span></div>
          <div className="text-[9px] sm:text-[11px] text-rose-400 font-semibold">{rooms.filter((r) => r.status === 'AVAILABLE').length} tersedia</div>
        </div>
      </div>

      {/* Room management */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5 pb-4 sm:pb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">Manajemen Kamar</h2>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Kelola status &amp; penghuni real-time</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddInvoice(true)} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 text-white font-bold rounded-xl text-[10px] sm:text-xs border border-white/10 hover:bg-white/15 transition-all">+ Invoice</button>
            <button onClick={() => setShowAddRoom(true)} className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-orchid-dark font-bold rounded-xl text-[10px] sm:text-xs hover:shadow-lg hover:shadow-white/20 transition-all">+ Tambah</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div key={room.id} className="glass-card p-5 rounded-2xl space-y-3 overflow-hidden">
              {room.imageUrl && (
                <div className="-mx-5 -mt-5 mb-3 h-32 overflow-hidden">
                  <img src={room.imageUrl} alt={`Kamar ${room.number}`} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white">{room.number}</span>
                <span className={`px-2.5 py-1 border rounded-full text-[9px] font-bold uppercase ${statusBadge(room.status)}`}>{room.status}</span>
              </div>
              <div className="text-[11px] text-slate-400">{room.type} • Lt {room.floor}</div>
              <div className="text-xs font-bold text-orchid-gold">{formatIDR(room.price)}/bln</div>
              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {room.facilities.map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-medium">{f}</span>
                  ))}
                </div>
              )}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">{room.tenant ? `👤 ${room.tenant.name}` : 'Kosong'}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(room.id)} className="text-orchid-tint font-bold hover:underline">Ubah</button>
                  <button onClick={() => deleteRoom(room.id)} className="text-rose-400 font-bold hover:underline">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Utilities & Payment tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="glass-panel p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><i className="fa-solid fa-bolt text-orchid-gold text-[10px] sm:text-xs" /> Rekap Utilitas</h3>
          <div className="space-y-2 sm:space-y-2.5 text-[10px] sm:text-xs">
            <div className="p-2.5 sm:p-3 bg-white/3 rounded-xl border border-white/5 flex justify-between items-center"><span className="text-slate-300">Listrik PLN</span><span className="font-bold text-rose-400">Rp 4.2jt</span></div>
            <div className="p-2.5 sm:p-3 bg-white/3 rounded-xl border border-white/5 flex justify-between items-center"><span className="text-slate-300">Air PDAM</span><span className="font-bold text-rose-400">Rp 850rb</span></div>
            <div className="p-2.5 sm:p-3 bg-white/3 rounded-xl border border-white/5 flex justify-between items-center"><span className="text-slate-300">Internet</span><span className="font-bold text-rose-400">Rp 1.2jt</span></div>
          </div>
        </div>
        <div className="glass-panel p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 lg:col-span-2">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><i className="fa-solid fa-receipt text-orchid-gold text-[10px] sm:text-xs" /> Payment Tracker</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Invoice</th>
                  <th className="py-3 px-3">Penyewa</th>
                  <th className="py-3 px-3">Nominal</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {invoices.map((t) => (
                  <tr key={t.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-[11px] font-bold text-orchid-tint">{t.invoiceNumber}</td>
                    <td className="py-3.5 px-3 font-semibold text-white text-[11px]">{t.user?.name || '-'}</td>
                    <td className="py-3.5 px-3 font-bold text-[11px]">{formatIDR(t.totalAmount)}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${statusBadge(t.paymentStatus)}`}>{t.paymentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Dynamic Pricing */}
      <div className="glass-panel p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><i className="fa-solid fa-robot text-orchid-tint text-[10px] sm:text-xs" /> AI Dynamic Pricing</h3>
          <button onClick={fetchAIPricing} disabled={pricingLoading} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orchid-tint to-orchid-violet text-white font-bold rounded-xl text-[9px] sm:text-[10px] hover:shadow-lg hover:shadow-orchid-violet/20 transition-all disabled:opacity-50 flex-shrink-0">
            {pricingLoading ? <><i className="fa-solid fa-spinner fa-spin mr-1.5" />Menganalisis...</> : <><i className="fa-solid fa-wand-magic-sparkles mr-1.5" />Analisis Harga</>}
          </button>
        </div>
        {pricingData && (
          <div className="space-y-4 animate-scale-in">
            {pricingData.insights && (
              <div className="p-4 bg-white/3 rounded-xl border border-white/5">
                <p className="text-xs text-slate-300 leading-relaxed"><i className="fa-solid fa-lightbulb text-orchid-gold mr-2" />{pricingData.insights}</p>
              </div>
            )}
            {pricingData.recommendations?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pricingData.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="p-4 bg-white/3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white">{rec.roomType}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${rec.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' : rec.confidence === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-500/10 text-slate-400'}`}>{rec.confidence}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 line-through">{formatIDR(rec.currentPrice)}</span>
                      <i className="fa-solid fa-arrow-right text-[8px] text-orchid-tint" />
                      <span className="font-black text-orchid-tint">{formatIDR(rec.suggestedPrice)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{rec.reason}</p>
                  </div>
                ))}
              </div>
            )}
            {pricingData.occupancyTrend && (
              <p className="text-[10px] text-slate-500"><i className="fa-solid fa-chart-line mr-1" />Tren okupansi: <span className={`font-bold ${pricingData.occupancyTrend === 'naik' ? 'text-emerald-400' : pricingData.occupancyTrend === 'turun' ? 'text-rose-400' : 'text-amber-400'}`}>{pricingData.occupancyTrend}</span></p>
            )}
          </div>
        )}
        {!pricingData && !pricingLoading && (
          <p className="text-[11px] text-slate-500">Klik "Analisis Harga" untuk mendapat rekomendasi harga optimal dari AI berdasarkan okupansi & tren.</p>
        )}
      </div>
      </>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-xs font-bold shadow-2xl animate-scale-in ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          <i className={`fa-solid ${toast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} mr-2`} />
          {toast.msg}
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddRoom(false)}>
          <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-black text-white">Tambah Kamar Baru</h3>
            <form onSubmit={addRoom} className="space-y-4">
              {/* Photo upload */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Foto Kamar</label>
                <input ref={roomFileRef} type="file" accept="image/*" onChange={handleRoomPhoto} className="hidden" id="roomPhotoInput" />
                {roomForm.imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={roomForm.imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                    <button type="button" onClick={() => { setRoomForm((p) => ({ ...p, imageUrl: '' })); if (roomFileRef.current) roomFileRef.current.value = ''; }} className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-black/80 transition-all">
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="roomPhotoInput" className="block cursor-pointer border-2 border-dashed border-white/10 hover:border-orchid-tint/40 rounded-xl p-6 text-center transition-all hover:bg-white/3">
                    <div className="w-10 h-10 rounded-xl bg-orchid-tint/10 text-orchid-tint flex items-center justify-center text-base mx-auto mb-2"><i className="fa-solid fa-camera" /></div>
                    <p className="text-[10px] text-slate-500">Klik untuk upload foto kamar</p>
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Nomor Kamar *</label>
                  <input required value={roomForm.number} onChange={(e) => setRoomForm({ ...roomForm, number: e.target.value })} placeholder="cth: D-401" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Tipe Kamar *</label>
                  <input required value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} placeholder="cth: Deluxe Studio" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Harga/bulan *</label>
                  <input required type="number" value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} placeholder="1500000" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Lantai</label>
                  <input type="number" value={roomForm.floor} onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors" />
                </div>
              </div>
              {/* Facilities */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-2">Fasilitas Kamar</label>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_OPTIONS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        roomForm.facilities.includes(f)
                          ? 'bg-orchid-tint/15 text-orchid-tint border-orchid-tint/30'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {roomForm.facilities.includes(f) && <i className="fa-solid fa-check mr-1 text-[8px]" />}{f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddRoom(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 font-bold text-xs rounded-xl hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-white text-orchid-dark font-bold text-xs rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                  {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Simpan Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddTenant && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddTenant(false)}>
          <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-black text-white">Tambah Penyewa Baru</h3>
            <form onSubmit={addTenant} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Nama Lengkap *</label>
                <input required value={tenantForm.name} onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })} placeholder="cth: Budi Santoso" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Email *</label>
                  <input required type="email" value={tenantForm.email} onChange={(e) => setTenantForm({ ...tenantForm, email: e.target.value })} placeholder="email@contoh.com" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">No. WhatsApp *</label>
                  <input required value={tenantForm.phone} onChange={(e) => setTenantForm({ ...tenantForm, phone: e.target.value })} placeholder="0812xxxx" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Password</label>
                <input type="password" value={tenantForm.password} onChange={(e) => setTenantForm({ ...tenantForm, password: e.target.value })} placeholder="Password login tenant" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Assign Kamar (opsional)</label>
                <select value={tenantForm.roomId} onChange={(e) => setTenantForm({ ...tenantForm, roomId: e.target.value })} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors">
                  <option value="" className="bg-[#1a1025]">Tanpa kamar</option>
                  {rooms.filter((r) => r.status === 'AVAILABLE').map((r) => <option key={r.id} value={r.id} className="bg-[#1a1025]">{r.number} - {r.type} ({formatIDR(r.price)})</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTenant(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 font-bold text-xs rounded-xl hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-white text-orchid-dark font-bold text-xs rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                  {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Simpan Penyewa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddInvoice(false)}>
          <div className="bg-[#1a1025] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-black text-white">Buat Invoice Baru</h3>
            <form onSubmit={addInvoice} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Penyewa *</label>
                <select required value={invForm.userId} onChange={(e) => setInvForm({ ...invForm, userId: e.target.value })} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors">
                  <option value="" className="bg-[#1a1025]">Pilih penyewa...</option>
                  {tenants.map((t) => <option key={t.id} value={t.id} className="bg-[#1a1025]">{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Kamar *</label>
                <select required value={invForm.roomId} onChange={(e) => {
                  const room = rooms.find((r) => r.id === e.target.value);
                  setInvForm({ ...invForm, roomId: e.target.value, amount: room ? String(room.price) : invForm.amount });
                }} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors">
                  <option value="" className="bg-[#1a1025]">Pilih kamar...</option>
                  {rooms.map((r) => <option key={r.id} value={r.id} className="bg-[#1a1025]">{r.number} - {r.type}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Nominal *</label>
                  <input required type="number" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} placeholder="1500000" className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-600" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">Jatuh Tempo *</label>
                  <input required type="date" value={invForm.dueDate} onChange={(e) => setInvForm({ ...invForm, dueDate: e.target.value })} className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-orchid-tint/40 transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddInvoice(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 font-bold text-xs rounded-xl hover:bg-white/10 transition-all">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-white text-orchid-dark font-bold text-xs rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                  {saving ? <i className="fa-solid fa-spinner fa-spin" /> : 'Buat Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
