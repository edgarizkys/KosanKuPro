'use client';

import { useState, useEffect } from 'react';

interface VendorOrder {
  id: string;
  tenantName: string;
  roomNumber: string;
  item: string;
  category: 'LAUNDRY' | 'WATER_GAS' | 'WARUNG';
  amount: number;
  assignedStaff: string;
  status: 'NEW' | 'PROCESSING' | 'DELIVERED' | 'SETTLED';
  orderTime: string;
  addOnBilled?: boolean;
  extraDetails?: string;
}

const INITIAL_VENDOR_ORDERS: VendorOrder[] = [
  {
    id: 'V-101',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    item: 'Laundry Cuci Kiloan 7.5 Kg (Kuota Kos: 5.0 Kg)',
    category: 'LAUNDRY',
    amount: 20000, // 2.5kg extra @ 8000
    assignedStaff: 'Bambang (Staf Laundry)',
    status: 'PROCESSING',
    orderTime: '15 menit lalu',
    addOnBilled: false,
    extraDetails: 'Kelebihan 2.5 kg laundry dari jatah 5 kg bulanan',
  },
  {
    id: 'V-102',
    tenantName: 'Siti Rahma',
    roomNumber: 'B-201',
    item: 'Refill Galon Aqua 19L + Gas LPG 3kg',
    category: 'WATER_GAS',
    amount: 42000,
    assignedStaff: 'Bambang (Dispatched by Owner)',
    status: 'NEW',
    orderTime: '45 menit lalu',
    addOnBilled: false,
  },
  {
    id: 'V-103',
    tenantName: 'Rian Pratama',
    roomNumber: 'C-302',
    item: 'Nasi Goreng Spesial + Es Teh (Warung Kos)',
    category: 'WARUNG',
    amount: 25000,
    assignedStaff: 'Budi (Kurir Warung)',
    status: 'DELIVERED',
    orderTime: '3 jam lalu',
    addOnBilled: true,
  },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

import SequenceSaaSLayout from './SequenceSaaSLayout';
import type { RoleType } from '@/app/page';

// --- Delivery tracking data ---
const DELIVERY_TRACKING = [
  { id: 'V-101', tenantName: 'Budi Santoso', roomNumber: 'A-101', item: 'Laundry Cuci Kiloan 7.5 Kg', courier: 'Bambang', status: 'PROCESSING', eta: '30 menit', updatedAt: '15 menit lalu' },
  { id: 'V-102', tenantName: 'Siti Rahma', roomNumber: 'B-201', item: 'Refill Galon Aqua 19L + Gas LPG 3kg', courier: 'Bambang', status: 'NEW', eta: '1 jam', updatedAt: '45 menit lalu' },
  { id: 'V-103', tenantName: 'Rian Pratama', roomNumber: 'C-302', item: 'Nasi Goreng Spesial + Es Teh', courier: 'Budi', status: 'DELIVERED', eta: '-', updatedAt: '3 jam lalu' },
];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  NEW:        { label: 'Menunggu Pickup',   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  PROCESSING: { label: 'Dalam Pengantaran', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  DELIVERED:  { label: 'Sudah Diterima',    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  SETTLED:    { label: 'Lunas',             color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

export default function VendorDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const [activeBranch, setActiveBranch] = useState('all');
  const [activeTab, setActiveTab] = useState('tenant_requests');
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_VENDOR_ORDERS);
  const [toast, setToast] = useState<string | null>(null);

  // Add-On Modal state
  const [selectedOrderForAddOn, setSelectedOrderForAddOn] = useState<VendorOrder | null>(null);
  const [addOnNote, setAddOnNote] = useState('');
  const [addOnCost, setAddOnCost] = useState('');

  const updateOrderStatus = async (id: string, newStatus: 'PROCESSING' | 'DELIVERED' | 'SETTLED') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );

    // Sync to Server API live
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {}

    const order = orders.find((o) => o.id === id);
    const statusMsg =
      newStatus === 'PROCESSING'
        ? 'Pesanan sedang diproses vendor'
        : newStatus === 'DELIVERED'
        ? 'Pesanan berhasil diantar ke kamar'
        : 'Pesanan telah dilunasi Kosan';
    setToast(`Status order #${id} (${order?.item}) diperbarui: ${statusMsg}`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddOnBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForAddOn) return;

    const cost = Number(addOnCost) || selectedOrderForAddOn.amount;
    const note = addOnNote || selectedOrderForAddOn.extraDetails || selectedOrderForAddOn.item;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForAddOn.id
          ? { ...o, addOnBilled: true, amount: cost, extraDetails: note }
          : o
      )
    );

    const existingAddons = JSON.parse(localStorage.getItem('kosanku_tenant_addons') || '[]');
    existingAddons.push({
      id: selectedOrderForAddOn.id,
      tenantName: selectedOrderForAddOn.tenantName,
      roomNumber: selectedOrderForAddOn.roomNumber,
      description: `${selectedOrderForAddOn.item} (${note})`,
      amount: cost,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    });
    localStorage.setItem('kosanku_tenant_addons', JSON.stringify(existingAddons));

    setToast(`✅ Add-On Rp ${cost.toLocaleString('id-ID')} berhasil masuk tagihan ${selectedOrderForAddOn.tenantName}!`);
    setSelectedOrderForAddOn(null);
    setAddOnNote('');
    setAddOnCost('');
    setTimeout(() => setToast(null), 4500);
  };

  const totalMonthlyPayout = orders
    .filter((o) => o.status === 'DELIVERED' || o.status === 'SETTLED')
    .reduce((s, o) => s + o.amount, 0);

  const billedOrders = orders.filter((o) => o.addOnBilled);
  const unbilledOrders = orders.filter((o) => !o.addOnBilled);

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.length) {
            const mappedOrders = json.data.map((item: any) => ({
              id: item.id,
              tenantName: item.tenantName,
              roomNumber: item.roomNumber,
              item: item.item,
              category: item.category === 'GALON' ? 'WATER_GAS' : item.category === 'LAUNDRY' ? 'LAUNDRY' : 'WARUNG',
              amount: 25000,
              assignedStaff: 'Bambang',
              status: item.status === 'PENDING_DISPATCH' ? 'NEW' : item.status,
              orderTime: 'Baru saja',
              extraDetails: item.notes,
            }));

            setOrders((prev) => {
              const existingIds = new Set(prev.map((o) => o.id));
              const newItems = mappedOrders.filter((o: any) => !existingIds.has(o.id));
              if (newItems.length > 0) {
                setToast(`🔔 ${newItems.length} PESANAN BARU DITUGASKAN OLEH OWNER!`);
                setTimeout(() => setToast(null), 4000);
              }
              // Merge status updates for existing orders
              return prev.map((oldOrder) => {
                const updated = mappedOrders.find((m: any) => m.id === oldOrder.id);
                return updated ? { ...oldOrder, status: updated.status } : oldOrder;
              }).concat(newItems);
            });
          }
        }
      } catch (err) {}
    };

    fetchVendorOrders();
    const interval = setInterval(fetchVendorOrders, 2500);

    const handleSwitchTab = (e: any) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
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
      role="vendor"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">

        {/* ── Banner ── */}
        <div className="neu-card p-5 sm:p-7 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Portal Mitra Vendor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeTab === 'tenant_requests' && 'Kelola dan proses order pesanan masuk dari tenant.'}
              {activeTab === 'inventory' && 'Pantau status pengantaran kurir secara real-time.'}
              {activeTab === 'invoices' && 'Rekap biaya kelebihan yang telah ditagihkan ke tenant.'}
            </p>
          </div>
          <div className="p-4 neu-card-sm rounded-2xl text-center shrink-0">
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Pencairan Bulan Ini</span>
            <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">{formatIDR(totalMonthlyPayout)}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB 1: ORDER PESANAN MASUK (tenant_requests)
        ══════════════════════════════════════════════════ */}
        {activeTab === 'tenant_requests' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-truck-ramp-box text-emerald-600 dark:text-emerald-400" />
                Order Pesanan Masuk ({orders.length} Order)
              </h3>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="neu-card-sm rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.01]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-mono text-[10px] font-bold">
                        #{order.id}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg neu-inset text-[#047857] dark:text-emerald-400 font-bold text-[10px]">
                        Kamar {order.roomNumber} · {order.tenantName}
                      </span>
                    </div>
                    <div>
                      {order.addOnBilled ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                          💳 Tagihan Masuk
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                          ⏳ Belum Di-charge
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-white">{order.item}</p>

                  <div className="p-3.5 neu-inset rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 block">
                        Waktu: <strong className="text-slate-900 dark:text-white">{order.orderTime}</strong> · Staf: <strong className="text-emerald-600 dark:text-emerald-400">{order.assignedStaff}</strong>
                      </span>
                      {order.extraDetails && (
                        <span className="text-[11px] text-[#047857] dark:text-emerald-400 font-bold block mt-1">
                          📌 {order.extraDetails}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="text-emerald-600 dark:text-emerald-400">{formatIDR(order.amount)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {!order.addOnBilled && (
                      <button
                        onClick={() => {
                          setSelectedOrderForAddOn(order);
                          setAddOnCost(String(order.amount));
                          setAddOnNote(order.extraDetails || '');
                        }}
                        className="px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-2xl text-xs shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                      >
                        <i className="fa-solid fa-plus-circle" />
                        <span>Add-On ke Tagihan Tenant</span>
                      </button>
                    )}
                    <div className="flex items-center gap-2 ml-auto">
                      {/* Vendor: hanya bisa Siapkan & Antar. Konfirmasi Selesai ada di sisi Tenant */}
                      {order.status === 'NEW' && (
                        <button onClick={() => updateOrderStatus(order.id, 'PROCESSING')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5">
                          <i className="fa-solid fa-box-open" /> Siapkan
                        </button>
                      )}
                      {order.status === 'PROCESSING' && (
                        <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5">
                          <i className="fa-solid fa-motorcycle" /> Sudah Diantar
                        </button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <span className="px-4 py-2 rounded-xl text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1.5">
                          <i className="fa-solid fa-clock-rotate-left" /> Menunggu Konfirmasi Tenant
                        </span>
                      )}
                      {order.status === 'SETTLED' && (
                        <span className="px-4 py-2 rounded-xl text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center gap-1.5">
                          <i className="fa-solid fa-circle-check" /> Diterima Tenant
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: STATUS PENGANTARAN KURIR (inventory)
        ══════════════════════════════════════════════════ */}
        {activeTab === 'inventory' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="border-b border-slate-200/60 dark:border-white/5 pb-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-truck-fast text-emerald-600 dark:text-emerald-400" />
                Status Pengantaran Kurir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tracking pengiriman realtime — seperti Grab/Gojek.</p>
            </div>

            <div className="space-y-5">
              {DELIVERY_TRACKING.map((delivery) => {
                // step index: 0=NEW, 1=PROCESSING, 2=DELIVERED/SETTLED
                const stepIndex = delivery.status === 'NEW' ? 0 : delivery.status === 'PROCESSING' ? 1 : 2;
                const steps = [
                  { key: 'NEW',       label: 'Disiapkan', icon: 'fa-solid fa-box-open',       desc: 'Vendor sedang menyiapkan pesanan' },
                  { key: 'PROCESSING',label: 'Diantar',   icon: 'fa-solid fa-motorcycle',      desc: `Kurir: ${delivery.courier}` },
                  { key: 'DELIVERED', label: 'Selesai',   icon: 'fa-solid fa-circle-check',    desc: 'Pesanan sudah diterima' },
                ];

                return (
                  <div key={delivery.id} className="neu-card-sm rounded-2xl p-5 space-y-4">
                    {/* Order header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            #{delivery.id}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Kamar <strong className="text-slate-800 dark:text-slate-200">{delivery.roomNumber}</strong> · {delivery.tenantName}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{delivery.item}</p>
                      </div>
                      {delivery.status !== 'DELIVERED' && delivery.status !== 'SETTLED' && (
                        <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 shrink-0">
                          <i className="fa-solid fa-clock" /> ETA {delivery.eta}
                        </div>
                      )}
                    </div>

                    {/* ── Gojek/Grab Progress Tracker ── */}
                    <div className="flex items-center w-full gap-0">
                      {steps.map((step, idx) => {
                        const isDone    = idx <= stepIndex;
                        const isActive  = idx === stepIndex;
                        const isLast    = idx === steps.length - 1;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            {/* Step node */}
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-500 ${
                                isDone
                                  ? 'bg-[#047857] text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                              }`}>
                                <i className={`${step.icon} text-sm`} />
                                {isActive && delivery.status !== 'DELIVERED' && delivery.status !== 'SETTLED' && (
                                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-ping" />
                                )}
                                {isActive && delivery.status !== 'DELIVERED' && delivery.status !== 'SETTLED' && (
                                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                                )}
                              </div>
                              <div className="text-center" style={{ minWidth: '60px' }}>
                                <span className={`text-[10px] font-black block leading-tight ${
                                  isActive ? 'text-[#047857] dark:text-emerald-400' : isDone ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                                }`}>{step.label}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight block">{step.desc}</span>
                              </div>
                            </div>
                            {/* Connector line */}
                            {!isLast && (
                              <div className="flex-1 mx-1 h-1 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative -translate-y-4">
                                <div
                                  className="h-full rounded-full bg-[#047857] transition-all duration-700"
                                  style={{ width: idx < stepIndex ? '100%' : '0%' }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Update time footer */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-right">
                      Terakhir diperbarui: <span className="font-bold">{delivery.updatedAt}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: ADD-ON BILLING TENANT (invoices)
        ══════════════════════════════════════════════════ */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="neu-card p-4 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Tagihan</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{orders.length}</span>
              </div>
              <div className="neu-card p-4 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-emerald-600 uppercase block">Sudah Di-charge</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{billedOrders.length}</span>
              </div>
              <div className="neu-card p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase block">Belum Di-charge</span>
                <span className="text-lg font-black text-amber-700 dark:text-amber-400">{unbilledOrders.length}</span>
              </div>
            </div>

            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="border-b border-slate-200/60 dark:border-white/5 pb-5">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-receipt text-emerald-600 dark:text-emerald-400" />
                  Add-On Billing Tenant ({orders.length} Item)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekap biaya kelebihan yang akan / sudah masuk tagihan tenant.</p>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="neu-card-sm rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:scale-[1.005] transition-all">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">#{order.id}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Kamar {order.roomNumber} · {order.tenantName}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{order.item}</p>
                      {order.extraDetails && <p className="text-[11px] text-slate-500 dark:text-slate-400">{order.extraDetails}</p>}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">{formatIDR(order.amount)}</span>
                      {order.addOnBilled ? (
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                          ✅ Tertagih
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrderForAddOn(order);
                            setAddOnCost(String(order.amount));
                            setAddOnNote(order.extraDetails || '');
                          }}
                          className="px-3 py-1.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl text-[10px] shadow-sm transition-all cursor-pointer whitespace-nowrap"
                        >
                          + Charge Sekarang
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add-On Billing Modal Dialog */}
        {selectedOrderForAddOn && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/5 dark:bg-black/20 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setSelectedOrderForAddOn(null)}>
            <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Add-On ke Tagihan Tenant</h3>
                <button onClick={() => setSelectedOrderForAddOn(null)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold hover:text-red-500 transition-colors cursor-pointer" title="Tutup Modal">✕</button>
              </div>

              <div className="p-3.5 neu-inset rounded-2xl text-xs space-y-1">
                <span className="font-bold block text-[#047857] dark:text-emerald-400">Penerima Tagihan:</span>
                <p className="text-slate-900 dark:text-white font-black text-sm">{selectedOrderForAddOn.tenantName} (Kamar {selectedOrderForAddOn.roomNumber})</p>
                <p className="text-slate-600 dark:text-slate-300">{selectedOrderForAddOn.item}</p>
              </div>

              <form onSubmit={handleAddOnBilling} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Nominal Biaya Kelebihan (IDR) *</label>
                  <input required type="number" value={addOnCost} onChange={(e) => setAddOnCost(e.target.value)} placeholder="20000" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Rincian Kelebihan / Catatan *</label>
                  <input required value={addOnNote} onChange={(e) => setAddOnNote(e.target.value)} placeholder="cth: Over-limit Laundry +2.5kg @ Rp 8.000" className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white" />
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-200/60 dark:border-white/10">
                  <button type="button" onClick={() => setSelectedOrderForAddOn(null)} className="flex-1 py-3 neu-btn text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer">Akumulasikan ke Tagihan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notification (Bottom Right - Fixed 2 Lines Container) */}
        {toast && (
          <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-xs font-bold neu-card text-emerald-900 dark:text-emerald-200 border border-emerald-500/40 shadow-2xl animate-scale-in flex items-start gap-2.5">
            <i className="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-sm shrink-0 mt-0.5" />
            <span
              className="leading-snug flex-1"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                wordBreak: 'break-word',
              }}
            >
              {toast}
            </span>
          </div>
        )}
      </div>
    </SequenceSaaSLayout>
  );
}
