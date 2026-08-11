'use client';

import { useState } from 'react';

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

export default function VendorDashboard({
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const [activeBranch, setActiveBranch] = useState('all');
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_VENDOR_ORDERS);
  const [toast, setToast] = useState<string | null>(null);

  // Add-On Modal state
  const [selectedOrderForAddOn, setSelectedOrderForAddOn] = useState<VendorOrder | null>(null);
  const [addOnNote, setAddOnNote] = useState('');
  const [addOnCost, setAddOnCost] = useState('');

  const updateOrderStatus = (id: string, newStatus: 'PROCESSING' | 'DELIVERED' | 'SETTLED') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
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

    // Save to window / localStorage for instant sync with TenantDashboard!
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

    setToast(
      `✅ Add-On BIAYA KELEBIHAN Rp ${cost.toLocaleString('id-ID')} (${note}) BERHASIL DITAMBAHKAN KE TAGIHAN BULANAN TENANT [${selectedOrderForAddOn.tenantName} - Kamar ${selectedOrderForAddOn.roomNumber}]!`
    );
    setSelectedOrderForAddOn(null);
    setAddOnNote('');
    setAddOnCost('');
    setTimeout(() => setToast(null), 4500);
  };

  const totalMonthlyPayout = orders
    .filter((o) => o.status === 'DELIVERED' || o.status === 'SETTLED')
    .reduce((s, o) => s + o.amount, 0);

  return (
    <SequenceSaaSLayout
      role="vendor"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab="tenant_requests"
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
      {/* Vendor Partner Banner (Soft Raised Neumorphic Card) */}
      <div className="neu-card p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1.5">
              <i className="fa-solid fa-store text-emerald-500 text-[9px]" /> Mitra Vendor Resmi Kosan
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Automatic Add-On Billing Enabled</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Portal Mitra Vendor KosanKu Pro
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Terima pesanan kebutuhan tenant (Galon, Gas, Laundry Kiloan, Makanan), timbang kelebihan kuota, dan **secara otomatis akumulasikan biaya kelebihan sebagai Add-On tagihan bulanan tenant**.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 neu-card-sm rounded-2xl text-center">
            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Rekap Pencairan Bulan Ini</span>
            <span className="text-lg font-black text-emerald-800 dark:text-emerald-300">{formatIDR(totalMonthlyPayout)}</span>
          </div>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-truck-ramp-box text-emerald-600 dark:text-emerald-400" />
              Pesanan Masuk &amp; Penimbangan Kelebihan Kuota ({orders.length} Order)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Biaya kelebihan laundry/galon otomatis di-charge ke tagihan sewa tenant</p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="neu-card-sm rounded-2xl p-5 space-y-4 transition-all hover:scale-[1.01]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-mono text-[10px] font-bold">
                    #{order.id}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-bold text-[10px]">
                    Kamar {order.roomNumber} ({order.tenantName})
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{order.item}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {order.addOnBilled ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                      💳 Add-On Masuk Tagihan Tenant
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                      ⏳ Belum Di-charge
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 neu-inset rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 block">
                    Waktu Pesan: <strong className="text-slate-900 dark:text-white">{order.orderTime}</strong> • Staf: <strong className="text-emerald-600 dark:text-emerald-400">{order.assignedStaff}</strong>
                  </span>
                  {order.extraDetails && (
                    <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold block mt-1">
                      📌 Catatan Kelebihan: {order.extraDetails}
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  Biaya Kelebihan: <span className="text-emerald-600 dark:text-emerald-400">{formatIDR(order.amount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                {!order.addOnBilled && (
                  <button
                    onClick={() => {
                      setSelectedOrderForAddOn(order);
                      setAddOnCost(String(order.amount));
                      setAddOnNote(order.extraDetails || '');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-plus-circle" />
                    <span>➕ Masukkan Add-On ke Tagihan Bulanan Tenant</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {order.status === 'NEW' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                    >
                      Proses Pesanan
                    </button>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-circle-check" /> Selesai Diantar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add-On Billing Modal Dialog */}
      {selectedOrderForAddOn && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedOrderForAddOn(null)}>
          <div className="neu-card rounded-3xl p-6 sm:p-7 w-full max-w-md space-y-5 animate-scale-in text-slate-900 dark:text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Tambah Add-On ke Tagihan Tenant</h3>
              <button onClick={() => setSelectedOrderForAddOn(null)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">✕</button>
            </div>

            <div className="p-3.5 neu-inset rounded-2xl text-xs space-y-1">
              <span className="font-bold block text-purple-900 dark:text-purple-300">Penerima Tagihan:</span>
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
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer">Akumulasikan ke Tagihan</button>
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
    </SequenceSaaSLayout>
  );
}
