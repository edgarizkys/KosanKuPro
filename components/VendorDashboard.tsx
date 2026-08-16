'use client';

import { useState, useEffect } from 'react';
import SequenceSaaSLayout from './SequenceSaaSLayout';
import ToastNotification from './ToastNotification';
import type { RoleType } from '@/app/page';

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

const INITIAL_VENDOR_ORDERS: VendorOrder[] = [];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// --- Delivery tracking data ---
const DELIVERY_TRACKING: any[] = [];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  NEW:        { label: 'Menunggu Pickup',   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  PROCESSING: { label: 'Dalam Pengantaran', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  DELIVERED:  { label: 'Sudah Diterima',    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  SETTLED:    { label: 'Lunas',             color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
};

import { useProperty } from '@/lib/PropertyContext';

export default function VendorDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';

  const [activeBranch, setActiveBranch] = useState(property.name || 'all');
  const [activeTab, setActiveTab] = useState('tenant_requests');
  const [orders, setOrders] = useState<VendorOrder[]>([]);
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

  const handleAddOnBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForAddOn) return;

    const cost = Number(addOnCost) || selectedOrderForAddOn.amount;
    const note = addOnNote || selectedOrderForAddOn.extraDetails || selectedOrderForAddOn.item;

    // 1. Update local orders state
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrderForAddOn.id
          ? { ...o, addOnBilled: true, amount: cost, extraDetails: note }
          : o
      )
    );

    // 2. Add to shared Add-On ledger for Tenant & Owner
    const existingAddons = JSON.parse(localStorage.getItem('kosanku_tenant_addons') || '[]');
    const newAddonEntry = {
      id: selectedOrderForAddOn.id,
      tenantName: selectedOrderForAddOn.tenantName,
      roomNumber: selectedOrderForAddOn.roomNumber,
      description: `${selectedOrderForAddOn.item} (${note})`,
      amount: cost,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      vendorName: 'Mitra Vendor Kosan',
    };
    
    // Check if already exists, update or push
    const filteredAddons = existingAddons.filter((a: any) => a.id !== selectedOrderForAddOn.id);
    filteredAddons.push(newAddonEntry);
    localStorage.setItem('kosanku_tenant_addons', JSON.stringify(filteredAddons));

    // 3. Broadcast to all open tabs (Tenant & Owner)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('kosanku_order_channel');
        bc.postMessage({ type: 'ADDON_BILLED', addon: newAddonEntry });
        bc.close();
      } catch {}
    }

    // 4. Send PUT to server to record status & trigger in-app notification to Tenant
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrderForAddOn.id,
          status: 'SETTLED',
          vendorName: 'Mitra Vendor',
          addOnBilled: true,
        }),
      });
    } catch {}

    setToast(`✅ Add-On Rp ${cost.toLocaleString('id-ID')} berhasil masuk tagihan ${selectedOrderForAddOn.tenantName}!`);
    setSelectedOrderForAddOn(null);
    setAddOnNote('');
    setAddOnCost('');
    setTimeout(() => setToast(null), 4500);
  };

  const totalMonthlyPayout = orders
    .filter((o) => o.status === 'DELIVERED' || o.status === 'SETTLED' || o.addOnBilled)
    .reduce((s, o) => s + o.amount, 0);

  // Active orders: orders that are NOT yet completed + billed (i.e. still in workflow)
  const activeOrders = orders.filter((o) => !(o.status === 'SETTLED' && o.addOnBilled));
  const completedOrders = orders.filter((o) => o.status === 'SETTLED' && o.addOnBilled);

  const billedOrders = orders.filter((o) => o.addOnBilled);
  const unbilledOrders = orders.filter((o) => !o.addOnBilled);

  useEffect(() => {
    const fetchVendorOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        let serverData: any[] = [];
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            serverData = json.data;
          }
        }

        let localData: any[] = [];
        const savedTenantReqs = localStorage.getItem('kosanku_shared_supply_requests');
        if (savedTenantReqs) {
          try {
            localData = JSON.parse(savedTenantReqs);
          } catch {}
        }

        const combined = [...serverData];
        localData.forEach((l) => {
          if (!combined.some((c) => c.id === l.id)) {
            combined.push(l);
          }
        });

        if (combined.length > 0) {
          const storedAddons = JSON.parse(localStorage.getItem('kosanku_tenant_addons') || '[]');
          const billedIdSet = new Set(storedAddons.map((a: any) => a.id));

          const mappedOrders = combined.map((item: any) => {
            const isBilled = item.addOnBilled || billedIdSet.has(item.id);
            return {
              id: item.id,
              tenantName: item.tenantName || 'Rian Pratama',
              roomNumber: item.roomNumber || 'A-101',
              item: item.item || item.requestItem || 'Refill Air Galon Aqua 19L',
              category: item.category === 'GALON' ? 'WATER_GAS' : item.category === 'LAUNDRY' ? 'LAUNDRY' : 'WARUNG',
              amount: item.category === 'LAUNDRY' ? 35000 : item.category === 'GAS' ? 110000 : 20000,
              assignedStaff: item.assignedStaff || item.vendorName || 'Kurir Kos',
              status: item.status === 'PROCESSING' ? 'PROCESSING' : item.status === 'DELIVERED' ? 'DELIVERED' : item.status === 'SETTLED' ? 'SETTLED' : (item.status === 'PENDING_DISPATCH' || item.status === 'PENDING') ? 'NEW' : 'NEW',
              orderTime: 'Baru saja',
              extraDetails: item.notes,
              addOnBilled: isBilled,
            };
          });

          setOrders(mappedOrders as VendorOrder[]);
        } else {
          setOrders([]);
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
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[#047857] dark:text-emerald-400 font-extrabold text-[10px] uppercase">
                Mitra Resmi Terverifikasi
              </span>
            </div>
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
                Order Pesanan Aktif ({activeOrders.length} Antrean)
              </h3>
              {activeOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setOrders([]);
                    localStorage.removeItem('kosanku_shared_supply_requests');
                    setToast('🧹 Seluruh antrean order vendor berhasil dibersihkan!');
                    setTimeout(() => setToast(null), 3000);
                  }}
                  className="px-3.5 py-1.5 neu-btn text-[11px] font-bold text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Kosongkan daftar order"
                >
                  <i className="fa-solid fa-trash-can text-[10px]" />
                  <span>Clear Testing Orders</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {activeOrders.map((order) => (
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
                    {!order.addOnBilled ? (
                      order.status === 'SETTLED' ? (
                        <button
                          onClick={() => {
                            setSelectedOrderForAddOn(order);
                            setAddOnCost(String(order.amount));
                            setAddOnNote(order.extraDetails || '');
                          }}
                          className="px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-2xl text-xs shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
                        >
                          <i className="fa-solid fa-plus-circle" />
                          <span>Add-On ke Tagihan Tenant (Konfirmasi Diterima ✅)</span>
                        </button>
                      ) : (
                        <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                          <i className="fa-solid fa-lock text-xs" />
                          <span>Add-On Terkunci (Menunggu Tenant Konfirmasi Terima Pesanan)</span>
                        </div>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        ✅ Add-On Sudah Masuk Tagihan Tenant
                      </span>
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

              {activeOrders.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <div className="w-12 h-12 rounded-2xl neu-inset mx-auto flex items-center justify-center text-emerald-500 text-lg">
                    <i className="fa-solid fa-circle-check" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Semua Pesanan Telah Selesai &amp; Ditagihkan!</p>
                  <p className="text-xs text-slate-500">Tidak ada antrean pesanan aktif saat ini. Anda dapat melihat riwayat lengkap di menu <strong>Riwayat Pesanan Selesai</strong>.</p>
                </div>
              )}
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
                Status Pengantaran Kurir ({isCustomOrNewKos ? 0 : orders.length} Pesanan)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tracking pengiriman realtime — tersinkronisasi langsung dengan Tenant &amp; Owner.</p>
            </div>

            <div className="space-y-5">
              {!(isCustomOrNewKos) && orders.map((delivery) => {
                // step index: 0=NEW, 1=PROCESSING, 2=DELIVERED/SETTLED
                const stepIndex = delivery.status === 'NEW' ? 0 : delivery.status === 'PROCESSING' ? 1 : 2;
                const steps = [
                  { key: 'NEW',       label: 'Disiapkan', icon: 'fa-solid fa-box-open',       desc: 'Vendor menyiapkan' },
                  { key: 'PROCESSING',label: 'Diantar',   icon: 'fa-solid fa-motorcycle',      desc: `Kurir: ${delivery.assignedStaff || 'Kurir Kos'}` },
                  { key: 'DELIVERED', label: 'Selesai',   icon: 'fa-solid fa-circle-check',    desc: 'Pesanan diterima' },
                ];

                return (
                  <div key={delivery.id} className="neu-card-sm rounded-2xl p-5 space-y-4">
                    {/* Order header */}
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            #{delivery.id ? (delivery.id.includes('-') ? `ORD-${delivery.id.split('-').pop()?.slice(-4).toUpperCase()}` : delivery.id) : 'ORD'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Kamar <strong className="text-slate-800 dark:text-slate-200">{delivery.roomNumber}</strong> · {delivery.tenantName}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{delivery.item}</p>
                      </div>
                      {delivery.status !== 'DELIVERED' && delivery.status !== 'SETTLED' && (
                        <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 shrink-0">
                          <i className="fa-solid fa-clock" /> {delivery.status === 'PROCESSING' ? 'Sedang Diantar' : 'Menunggu Pickup'}
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
                              <div className="flex-1 min-w-[28px] sm:min-w-[48px] mx-1 h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 relative -translate-y-3.5">
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

                    {/* Action buttons to advance delivery status */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Waktu order: <span className="font-bold">{delivery.orderTime}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        {delivery.status === 'NEW' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(delivery.id, 'PROCESSING')}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-motorcycle" />
                            <span>Mulai Pengantaran Kurir</span>
                          </button>
                        )}
                        {delivery.status === 'PROCESSING' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(delivery.id, 'DELIVERED')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-check" />
                            <span>Selesaikan Pengantaran (Tiba di Kamar)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {orders.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <div className="w-12 h-12 rounded-2xl neu-inset mx-auto flex items-center justify-center text-slate-400 text-lg">
                    <i className="fa-solid fa-truck-ramp-box" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum ada pesanan aktif</p>
                  <p className="text-[10px] text-slate-400">Pesanan dari tenant yang di-plotting owner akan otomatis muncul di sini secara real-time.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: ADD-ON BILLING TENANT (invoices)
        ══════════════════════════════════════════════════ */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-fade-in">
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
                        <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">#{order.id ? (order.id.includes('-') ? `ORD-${order.id.split('-').pop()?.slice(-4).toUpperCase()}` : order.id) : 'ORD'}</span>
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
                      ) : order.status === 'SETTLED' ? (
                        <button
                          onClick={() => {
                            setSelectedOrderForAddOn(order);
                            setAddOnCost(String(order.amount));
                            setAddOnNote(order.extraDetails || '');
                          }}
                          className="px-3 py-1.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-xl text-[10px] shadow-sm transition-all cursor-pointer whitespace-nowrap"
                        >
                          + Charge Sekarang (Tenant Verified ✅)
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold whitespace-nowrap">
                          🔒 Menunggu Konfirmasi Tenant
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: RIWAYAT PESANAN SELESAI VENDOR (order_history)
        ══════════════════════════════════════════════════ */}
        {activeTab === 'order_history' && (
          <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-emerald-600 dark:text-emerald-400" />
                  Arsip Riwayat Pengantaran &amp; Transaksi Selesai
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Daftar seluruh pesanan yang telah dikirim dan diselesaikan oleh vendor.</p>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                Total Arsip: {orders.length} Transaksi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-3 px-3">Kode Order</th>
                    <th className="py-3 px-3">Penghuni &amp; Kamar</th>
                    <th className="py-3 px-3">Item Pesanan</th>
                    <th className="py-3 px-3">Kurir Penanggung Jawab</th>
                    <th className="py-3 px-3">Nominal Transaksi</th>
                    <th className="py-3 px-3 text-right">Status Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        #{o.id ? (o.id.includes('-') ? `ORD-${o.id.split('-').pop()?.slice(-4).toUpperCase()}` : o.id) : 'ORD'}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                        {o.tenantName} <span className="text-slate-400 font-normal">(Kamar {o.roomNumber})</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{o.item}</td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">{o.assignedStaff || 'Kurir Kos'}</td>
                      <td className="py-3.5 px-3 font-black text-emerald-700 dark:text-emerald-400">{formatIDR(o.amount)}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          o.status === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : o.status === 'DELIVERED'
                            ? 'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300'
                        }`}>
                          {o.status === 'SETTLED' ? '✅ SELESAI & LUNAS' : o.status === 'DELIVERED' ? '📦 TIBA DI KAMAR' : '🚚 SEDANG DIANTAR'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada arsip riwayat pesanan selesai
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

        {/* Toast Notification (All-Device Friendly) */}
        {toast && (
          <ToastNotification
            msg={toast}
            type="success"
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </SequenceSaaSLayout>
  );
}
