'use client';

import { useState, useEffect } from 'react';
import SequenceSaaSLayout from './SequenceSaaSLayout';
import ToastNotification from './ToastNotification';
import type { RoleType } from '@/app/page';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  rooms?: { id: string; number: string; type: string; price: number }[];
}

interface AddOnBillItem {
  id: string;
  tenantName: string;
  roomNumber: string;
  description: string;
  amount: number;
  date: string;
}

const FALLBACK_INVOICE = {
  id: 'INV-2026-0701',
  amount: 1604500,
  dueDate: '28 Agustus 2026',
  daysLeft: 3,
};

const INITIAL_ADDONS: AddOnBillItem[] = [
  {
    id: 'V-101',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    description: 'Kelebihan Laundry 2.5 kg dari Kuota 5 kg bulanan',
    amount: 20000,
    date: '10 Ags 2026',
  },
];

interface Ticket {
  id: number;
  title: string;
  desc: string;
  status: string;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

import { useProperty } from '@/lib/PropertyContext';

export default function TenantDashboard({
  user,
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  user: TenantUser | null;
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';

  const [activeBranch, setActiveBranch] = useState(property.name || 'all');
  const [activeTab, setActiveTab] = useState('invoices');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoice, setInvoice] = useState(isCustomOrNewKos ? null : FALLBACK_INVOICE);
  const [addOns, setAddOns] = useState<AddOnBillItem[]>(isCustomOrNewKos ? [] : INITIAL_ADDONS);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Tenant-side order tracking state (DELIVERED → tenant confirms → SETTLED)
  const [tenantOrders, setTenantOrders] = useState<any[]>([]);

  // Order Form Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderCategory, setOrderCategory] = useState<'GALON' | 'LAUNDRY' | 'GAS' | 'CUSTOM'>('GALON');
  const [orderTitle, setOrderTitle] = useState('Refill Air Galon Aqua 19L');
  const [orderQty, setOrderQty] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const confirmReceived = async (id: string) => {
    // 1. Optimistic UI update
    setTenantOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'SETTLED', updatedAt: 'Baru saja' } : o))
    );

    // 2. Persist to server API live (so next poll remains SETTLED)
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'SETTLED' }),
      });
    } catch (err) {
      console.warn('Failed to sync SETTLED status to server:', err);
    }

    // 3. Update localStorage fallback
    try {
      const savedTenantReqs = localStorage.getItem('kosanku_shared_supply_requests');
      if (savedTenantReqs) {
        const parsed = JSON.parse(savedTenantReqs);
        const updated = parsed.map((item: any) =>
          item.id === id ? { ...item, status: 'SETTLED' } : item
        );
        localStorage.setItem('kosanku_shared_supply_requests', JSON.stringify(updated));
      }
    } catch {}

    setToastMsg('🎉 Terima kasih! Konfirmasi pesanan telah diteruskan ke Vendor & Pengelola Kos.');
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenOrder = (cat: 'GALON' | 'LAUNDRY' | 'GAS' | 'CUSTOM', defaultName: string) => {
    setOrderCategory(cat);
    setOrderTitle(defaultName);
    setOrderQty(1);
    setOrderNotes('');
    setShowOrderModal(true);
  };

  const handleSendOrderToOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderId = `REQ-${Date.now().toString().slice(-4)}`;
    const customNotes = orderNotes.trim();
    const newOrderObj = {
      id: newOrderId,
      tenantName: tenantName,
      roomNumber: roomInfo?.number || 'A-101',
      category: orderCategory,
      item: `${orderTitle} (${orderQty}x)`,
      notes: customNotes || 'Tidak ada catatan tambahan',
      status: 'PENDING_DISPATCH',
      property: property?.slug || 'default',
      createdAt: 'Baru saja',
    };

    // 1. Send to Server API (Production Multi-Device Ready)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderObj),
      });

      // Push to central activity notifications for Owner, Admin & Vendor
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'DISPATCH_ORDER',
          payload: {
            order: newOrderObj,
            status: 'NEW',
          },
        }),
      });
    } catch (err) {
      console.error('Failed to sync order to server:', err);
    }

    // 2. Save to shared localStorage & BroadcastChannel for local speed
    const existingReqs = JSON.parse(localStorage.getItem('kosanku_shared_supply_requests') || '[]');
    localStorage.setItem('kosanku_shared_supply_requests', JSON.stringify([newOrderObj, ...existingReqs]));

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('kosanku_order_channel');
        bc.postMessage({ type: 'NEW_TENANT_ORDER', order: newOrderObj });
        bc.close();
      } catch (err) {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notifs_updated'));
    }

    // 3. Add to tenant's tracking timeline UI
    setTenantOrders((prev) => [
      {
        id: newOrderId,
        item: `${orderTitle} (${orderQty}x)`,
        status: 'NEW',
        courier: 'Dipilih Owner',
        eta: 'Menunggu Dispatch Owner',
        updatedAt: 'Baru saja',
      },
      ...prev,
    ]);

    setShowOrderModal(false);
    setToastMsg(`✅ Pesanan "${orderTitle}" berhasil dikirim ke Owner & Server!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const tenantName = user?.name || 'Budi Santoso';
  const roomInfo = user?.rooms?.[0];

  useEffect(() => {
    const syncTenantData = async () => {
      try {
        const savedAddons = localStorage.getItem('kosanku_tenant_addons');
        if (savedAddons) {
          const parsed = JSON.parse(savedAddons);
          if (Array.isArray(parsed) && parsed.length) {
            setAddOns(parsed);
          }
        }

        // Fetch live server order status & load any plotted/new orders automatically
        const res = await fetch('/api/orders');
        let serverOrders: any[] = [];
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
            serverOrders = json.data;
          }
        }

        // Also check local shared requests for instant fallback
        let localOrders: any[] = [];
        const savedTenantReqs = localStorage.getItem('kosanku_shared_supply_requests');
        if (savedTenantReqs) {
          try {
            localOrders = JSON.parse(savedTenantReqs);
          } catch {}
        }

        const combined = [...serverOrders];
        localOrders.forEach((l) => {
          if (!combined.some((c) => c.id === l.id)) {
            combined.push(l);
          }
        });

        const mappedOrders = combined.map((s: any) => ({
          id: s.id,
          item: s.item || 'Pesanan Suplai',
          status: (s.status === 'PENDING_DISPATCH' || s.status === 'PENDING') ? 'NEW' : s.status,
          courier: s.assignedStaff || s.vendorName || 'Dipilih Owner',
          eta: s.status === 'PROCESSING' ? 'Sedang Diantar' : s.status === 'DELIVERED' ? 'Tiba di Kamar' : s.status === 'SETTLED' ? 'Sudah Diterima ✅' : 'Menunggu Dispatch Owner',
          updatedAt: 'Baru saja',
        }));
        setTenantOrders(mappedOrders);
      } catch {}
    };

    syncTenantData();
    const interval = setInterval(syncTenantData, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalAddons = addOns.reduce((acc, item) => acc + item.amount, 0);
  const baseAmount = invoice ? invoice.amount : 0;
  const grandTotalPayment = baseAmount + totalAddons;

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'demo_user',
          tenantName: tenantName,
          roomNumber: roomInfo?.number || 'A-101',
          title,
          description: desc,
          property: property?.slug || 'default',
        }),
      });
      if (res.ok) {
        setTickets((prev) => [{ id: Date.now(), title, desc, status: 'OPEN' }, ...prev]);
        setTitle('');
        setDesc('');
        alert('✅ Tiket kendala berhasil dikirim ke Pengelola Kos!');
      } else {
        alert('Gagal mengirim keluhan.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayMidtrans = async () => {
    if (!invoice && totalAddons === 0) {
      alert('Belum ada tagihan berjalan.');
      return;
    }
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch('/api/midtrans/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `${invoice?.id || 'INV-CUST'}-${Date.now()}`,
          amount: grandTotalPayment,
          customerName: tenantName,
          customerEmail: user?.email || 'tenant@kosanku.com',
          itemDetails: [
            ...(invoice ? [{ id: 'RENT', name: 'Sewa Kamar + Utilitas Base', price: invoice.amount, quantity: 1 }] : []),
            ...addOns.map((a, i) => ({ id: `ADDON-${i}`, name: a.description, price: a.amount, quantity: 1 })),
          ],
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.token) {
        throw new Error(json.error || 'Gagal mendapatkan token Midtrans');
      }

      const snapToken = json.token;
      const redirectUrl = json.redirectUrl;

      const targetSnapScriptUrl = json.snapScriptUrl || (redirectUrl?.includes('sandbox') ? 'https://app.sandbox.midtrans.com/snap/snap.js' : 'https://app.midtrans.com/snap/snap.js');

      // Ensure snap.js script matching token environment is loaded in window
      if (typeof window !== 'undefined') {
        const existingScript = document.getElementById('midtrans-snap-script') as HTMLScriptElement | null;
        if (!existingScript || existingScript.src !== targetSnapScriptUrl) {
          if (existingScript) existingScript.remove();
          delete (window as any).snap;
          const snapScript = document.createElement('script');
          snapScript.id = 'midtrans-snap-script';
          snapScript.src = targetSnapScriptUrl;
          snapScript.setAttribute('data-client-key', json.clientKey || 'Mid-client-8f3eXqGDNIR_WoDE');
          document.body.appendChild(snapScript);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      if (typeof window !== 'undefined' && (window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function () {
            alert('🎉 Pembayaran sewa & add-on berhasil! Terima kasih.');
            if (invoice) {
              setInvoice({ ...invoice, daysLeft: 30 });
            }
            setPaying(false);
          },
          onPending: function () {
            alert('Menunggu penyelesaian pembayaran via QRIS / VA.');
            setPaying(false);
          },
          onError: function () {
            alert('Pembayaran gagal. Silakan coba kembali.');
            setPaying(false);
          },
          onClose: function () {
            setPaying(false);
          },
        });
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        alert(`Token Midtrans: ${snapToken}\nSilakan selesaikan pembayaran via Snap.`);
        setPaying(false);
      }
    } catch (err: any) {
      setPayError(err.message || 'Gagal memproses pembayaran');
      setPaying(false);
    }
  };

  return (
    <SequenceSaaSLayout
      role="tenant"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t)}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
        
        {/* Welcome Banner */}
        <div className="neu-card p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Selamat Datang, {tenantName}! 👋
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Penghuni Kamar <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{roomInfo?.number || 'A-101'}</strong> ({roomInfo?.type || 'Deluxe Studio Smart'})
            </p>
          </div>
        </div>

        {/* ===== TAB 1: KAMAR SAYA & SMART LOCK ===== */}
        {activeTab === 'rooms_ai' && (
          <div className="space-y-6 animate-fade-in">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    🚪 Smart Key &amp; Access Control
                  </span>
                  <h3 className="text-xl font-black mt-1">Kamar {roomInfo?.number || 'A-101'} — {roomInfo?.type || 'Deluxe Studio Smart'}</h3>
                  <p className="text-xs text-slate-500">Lantai 1 • KosanKu Pro Residence Bandung</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-lock" /> Smart Lock Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white space-y-4 shadow-xl neu-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">KUNCI DIGITAL KAMAR</span>
                    <i className="fa-solid fa-key text-emerald-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">Buka Pintu Kamar A-101</h4>
                    <p className="text-xs text-slate-300 mt-1">Tekan tombol di bawah untuk membuka pintu pintar via IoT Smart Lock.</p>
                  </div>
                  <button
                    onClick={() => alert('🔓 PIN Kunci Digital Dikirim: Pintu Kamar A-101 BERHASIL DIBUKA!')}
                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm tracking-wide shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-lock-open text-lg" />
                    <span>BUKA PINTU KAMAR (1-KLIK)</span>
                  </button>
                </div>

                <div className="neu-inset p-6 rounded-3xl space-y-3 text-xs">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-emerald-500" /> Fasilitas Kamar Anda
                  </h4>
                  <ul className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-snowflake text-blue-500" /> AC Studio 1 PK</li>
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-wifi text-emerald-500" /> High-Speed Wi-Fi 6</li>
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-shower text-teal-500" /> KM Dalam &amp; Water Heater</li>
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-tv text-purple-500" /> Smart TV 43 Inch</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 2: ADD-ON REFILL & SERVICES ===== */}
        {activeTab === 'tenant_requests' && (
          <div className="space-y-6 animate-fade-in">
            {/* Order cards */}
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-xl font-black">Pesan Suplai & Layanan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Order diantar langsung ke kamar oleh Vendor Mitra Kosan</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="neu-card-sm p-5 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-bottle-water" />
                  </div>
                  <h4 className="font-black text-sm">Refill Air Galon Aqua</h4>
                  <p className="text-xs text-slate-500">Rp 20.000 / Galon (Termasuk Antar)</p>
                  <button
                    onClick={() => handleOpenOrder('GALON', 'Refill Air Galon Aqua 19L')}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-cart-plus" /> Pesan Air Galon
                  </button>
                </div>

                <div className="neu-card-sm p-5 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-shirt" />
                  </div>
                  <h4 className="font-black text-sm">Laundry Cuci Kiloan</h4>
                  <p className="text-xs text-slate-500">Rp 8.000 / Kg (Antar-Jemput Kamar)</p>
                  <button
                    onClick={() => handleOpenOrder('LAUNDRY', 'Laundry Cuci Kiloan')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-cart-plus" /> Jemput Laundry
                  </button>
                </div>

                <div className="neu-card-sm p-5 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-fire" />
                  </div>
                  <h4 className="font-black text-sm">Refill Gas LPG 3 Kg</h4>
                  <p className="text-xs text-slate-500">Rp 25.000 / Tabung</p>
                  <button
                    onClick={() => handleOpenOrder('GAS', 'Refill Gas LPG 3kg')}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-solid fa-cart-plus" /> Pesan Gas
                  </button>
                </div>
              </div>
            </div>

            {/* ── Tracking Status Pesanan Aktif (Gojek/Grab Style) ── */}
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-route text-teal-500" />
                    Status Pesanan Saya
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pantau status pengiriman pesanan Anda secara realtime.</p>
                </div>
                {tenantOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTenantOrders([]);
                      localStorage.removeItem('kosanku_shared_supply_requests');
                      setToastMsg('🧹 Riwayat pesanan Anda berhasil dibersihkan!');
                      setTimeout(() => setToastMsg(null), 3000);
                    }}
                    className="px-3 py-1.5 neu-btn text-[11px] font-bold text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Kosongkan riwayat pesanan"
                  >
                    <i className="fa-solid fa-trash-can text-[10px]" />
                    <span>Bersihkan Riwayat</span>
                  </button>
                )}
              </div>

              {tenantOrders.map((order) => {
                const stepIndex = order.status === 'NEW' ? 0 : order.status === 'PROCESSING' ? 1 : 2;
                const steps = [
                  { key: 'NEW',        label: 'Disiapkan', icon: 'fa-solid fa-box-open',     desc: 'Vendor menyiapkan' },
                  { key: 'PROCESSING', label: 'Diantar',   icon: 'fa-solid fa-motorcycle',   desc: `Kurir: ${order.courier}` },
                  { key: 'DELIVERED',  label: 'Selesai',   icon: 'fa-solid fa-circle-check', desc: order.status === 'SETTLED' ? 'Sudah diterima ✅' : 'Konfirmasi Anda' },
                ];
                return (
                  <div key={order.id} className="neu-card-sm rounded-2xl p-5 space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 mr-2">
                          #{order.id ? (order.id.includes('-') ? `ORD-${order.id.split('-').pop()?.slice(-4).toUpperCase()}` : order.id) : 'ORD'}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{order.item}</p>
                      </div>
                      {order.status !== 'DELIVERED' && order.status !== 'SETTLED' && (
                        <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 shrink-0">
                          <i className="fa-solid fa-clock" /> ETA {order.eta}
                        </div>
                      )}
                    </div>

                    {/* Progress steps */}
                    <div className="flex items-center w-full gap-0">
                      {steps.map((step, idx) => {
                        const isDone   = idx <= stepIndex;
                        const isActive = idx === stepIndex;
                        const isLast   = idx === steps.length - 1;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                                isDone
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                              }`}>
                                <i className={`${step.icon} text-sm`} />
                                {isActive && order.status !== 'DELIVERED' && order.status !== 'SETTLED' && (
                                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-white dark:border-slate-900 animate-ping" />
                                )}
                                {isActive && order.status !== 'DELIVERED' && order.status !== 'SETTLED' && (
                                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal-400 border-2 border-white dark:border-slate-900" />
                                )}
                              </div>
                              <div className="text-center" style={{ minWidth: '60px' }}>
                                <span className={`text-[10px] font-black block leading-tight ${
                                  isActive ? 'text-teal-600 dark:text-teal-400' : isDone ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                                }`}>{step.label}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight block">{step.desc}</span>
                              </div>
                            </div>
                            {!isLast && (
                              <div className="flex-1 min-w-[28px] sm:min-w-[48px] mx-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative -translate-y-3.5">
                                <div
                                  className="h-full rounded-full bg-teal-500 transition-all duration-700"
                                  style={{ width: idx < stepIndex ? '100%' : '0%' }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Tenant: Konfirmasi Diterima — hanya muncul saat Vendor sudah antar (DELIVERED) */}
                    {order.status === 'DELIVERED' && (
                      <button
                        onClick={() => confirmReceived(order.id)}
                        className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-circle-check" /> Konfirmasi Pesanan Diterima
                      </button>
                    )}
                    {order.status === 'SETTLED' && (
                      <div className="w-full py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-600/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                        <i className="fa-solid fa-circle-check" /> Pesanan Diterima — Terima Kasih!
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-right">
                      Diperbarui: <span className="font-bold">{order.updatedAt}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== TAB: RIWAYAT PESANAN LENGKAP TENANT ===== */}
        {activeTab === 'order_history' && (
          <div className="space-y-6 animate-fade-in">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-slate-200 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-clock-rotate-left text-teal-600 dark:text-teal-400" />
                    Riwayat Transaksi &amp; Pesanan Suplai
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Arsip seluruh pesanan galon, laundry, dan gas kamar Anda yang tercatat di sistem.</p>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                  Total: {tenantOrders.length} Pesanan
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-3 px-3">Kode Order</th>
                      <th className="py-3 px-3">Item Pesanan</th>
                      <th className="py-3 px-3">Petugas / Vendor</th>
                      <th className="py-3 px-3">Waktu Order</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {tenantOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                          #{o.id ? (o.id.includes('-') ? `ORD-${o.id.split('-').pop()?.slice(-4).toUpperCase()}` : o.id) : 'ORD'}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">{o.item}</td>
                        <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{o.courier}</td>
                        <td className="py-3.5 px-3 text-slate-400">{o.updatedAt}</td>
                        <td className="py-3.5 px-3 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            o.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : o.status === 'PROCESSING' || o.status === 'DELIVERED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                          }`}>
                            {o.status === 'SETTLED' ? '✅ SELESAI' : o.status === 'PROCESSING' ? '🚚 DIANTAR' : o.status === 'DELIVERED' ? '📦 TIBA' : '⏳ DIPROSES'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tenantOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Belum ada riwayat pesanan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 3: TAGIHAN SEWA & MIDTRANS ===== */}
        {(activeTab === 'invoices' || !activeTab) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
                {invoice ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">INVOICE SEWA TERBIT</span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{invoice.id}</h3>
                      </div>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-extrabold rounded-full text-xs animate-pulse">
                        Jatuh Tempo: {invoice.dueDate}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-slate-200/50 dark:border-white/5 font-medium">
                        <span className="text-slate-600 dark:text-slate-400">Sewa Kamar {roomInfo?.number || 'A-101'} (Bulan Ini)</span>
                        <span className="font-black text-slate-900 dark:text-white">{formatIDR(invoice.amount)}</span>
                      </div>

                      {addOns.map((add) => (
                        <div key={add.id} className="flex justify-between py-2 border-b border-slate-200/50 dark:border-white/5 font-medium text-purple-700 dark:text-purple-300">
                          <span>+ {add.description}</span>
                          <span className="font-bold">{formatIDR(add.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl neu-inset mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">
                      <i className="fa-solid fa-receipt" />
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Belum Ada Tagihan Berjalan</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Tagihan sewa bulanan dan pesanan suplai akan otomatis muncul di sini setelah diterbitkan pengelola.</p>
                  </div>
                )}

                <div className="p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                  <div>
                    <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">Total Pembayaran Gabungan</span>
                    <span className="text-xl sm:text-2xl font-black text-white">{formatIDR(grandTotalPayment)}</span>
                    <span className="text-[10px] text-purple-300 block">Termasuk Sewa Base + {addOns.length} Item Add-On</span>
                  </div>
                  <button
                    onClick={handlePayMidtrans}
                    disabled={paying}
                    className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs shadow-lg hover:scale-105 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {paying ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-bolt" />}
                    <span>Bayar 1-Klik via Midtrans Snap</span>
                  </button>
                </div>

                {payError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 text-center">{payError}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="neu-card p-6 rounded-3xl space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-headset text-rose-500" /> Form Lapor Kendala Kamar
                </h3>
                <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Keluhan *</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="cth: Kran Air Bocor / AC Berisik"
                      className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Deskripsi Kendala *</label>
                    <textarea
                      required
                      rows={3}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Jelaskan kendala fasilitas di kamar Anda..."
                      className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Laporan Keluhan'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 4: TIKET KELUHAN DEDICATED PAGE ===== */}
        {activeTab === 'complaints' && (
          <div className="space-y-6 animate-fade-in">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-headset text-purple-500" /> Riwayat &amp; Pengajuan Tiket Kendala Kamar
              </h3>
              
              <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs neu-inset p-5 rounded-2xl">
                <div>
                  <label className="font-bold block mb-1">Judul Keluhan Baru *</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="cth: Lampu Kamar Mandi Mati"
                    className="w-full p-3 neu-input rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Rincian Kendala *</label>
                  <textarea
                    required
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Tuliskan lokasi & detail masalah..."
                    className="w-full p-3 neu-input rounded-xl outline-none resize-none"
                  />
                </div>
                <button type="submit" disabled={submitting} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  Kirim Tiket Perbaikan
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Daftar Tiket Terdaftar</h4>
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 neu-card-sm rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="font-black text-sm">{t.title}</h5>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Order Form Modal Dialog ── */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowOrderModal(false)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-cart-shopping text-teal-600 dark:text-teal-400" /> Form Order Suplai Tenant
              </h3>
              <button onClick={() => setShowOrderModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSendOrderToOwner} className="space-y-4 text-xs">
              <div className="p-3 neu-inset rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Pemesan</span>
                <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{tenantName} · Kamar {roomInfo?.number || 'A-101'}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Item / Suplai *</label>
                <input required value={orderTitle} onChange={(e) => setOrderTitle(e.target.value)} className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Pilih Kategori Pesanan</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'GALON', label: 'Air Galon', icon: 'fa-bottle-water' },
                    { id: 'LAUNDRY', label: 'Laundry Kiloan', icon: 'fa-shirt' },
                    { id: 'GAS', label: 'Tabung Gas', icon: 'fa-fire-burner' },
                    { id: 'CUSTOM', label: 'Lainnya', icon: 'fa-box' },
                  ].map((cat) => {
                    const isSel = orderCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setOrderCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSel
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'neu-btn text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <i className={`fa-solid ${cat.icon}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jumlah Pesanan *</label>
                <input required type="number" min={1} max={10} value={orderQty} onChange={(e) => setOrderQty(Number(e.target.value))} className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white" />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Catatan Tambahan untuk Owner/Vendor</label>
                <textarea rows={2} value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} placeholder="cth: Mohon diantar sebelum jam 5 sore, atau jemput laundry di depan pintu." className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-200/60 dark:border-white/10">
                <button type="button" onClick={() => setShowOrderModal(false)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <i className="fa-solid fa-paper-plane" /> Kirim ke Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification (All-Device Friendly) */}
      {toastMsg && (
        <ToastNotification
          msg={toastMsg}
          type="success"
          onClose={() => setToastMsg(null)}
        />
      )}
    </SequenceSaaSLayout>
  );
}
