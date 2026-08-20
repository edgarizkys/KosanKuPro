'use client';
import React, { useState, useEffect } from 'react';

export default function VendorStatsPortal() {
  const [vendor, setVendor] = useState('Depot Air & Gas Suci');
  const [month, setMonth] = useState('2026-08');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('vendor')) setVendor(p.get('vendor')!);
    if (p.get('month')) setMonth(p.get('month')!);
    setTimeout(() => setLoading(false), 700);
  }, []);

  const monthLabel = new Date(month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const orders = [
    { date: '1 Agu', item: 'Galon Aqua 19L (12x)', status: 'SELESAI', amount: 240000 },
    { date: '4 Agu', item: 'Gas LPG 3Kg (2x)', status: 'SELESAI', amount: 50000 },
    { date: '8 Agu', item: 'Galon Aqua 19L (8x)', status: 'SELESAI', amount: 160000 },
    { date: '12 Agu', item: 'Gas LPG 12Kg (1x)', status: 'SELESAI', amount: 165000 },
    { date: '15 Agu', item: 'Galon Aqua 19L (12x)', status: 'SELESAI', amount: 240000 },
    { date: '19 Agu', item: 'Galon Aqua 19L (6x)', status: 'PROSES', amount: 120000 },
    { date: '22 Agu', item: 'Gas LPG 3Kg (3x)', status: 'PROSES', amount: 75000 },
  ];

  const totalOrders = orders.length;
  const done = orders.filter(o => o.status === 'SELESAI').length;
  const totalEarned = orders.filter(o => o.status === 'SELESAI').reduce((a, o) => a + o.amount, 0);
  const pendingSettlement = orders.filter(o => o.status === 'PROSES').reduce((a, o) => a + o.amount, 0);

  const statusConfig: Record<string, string> = {
    SELESAI: 'bg-emerald-500/15 text-[#047857] border-emerald-500/20',
    PROSES: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-truck-fast text-xs" /><span>STATISTIK MITRA VENDOR</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Dashboard Vendor</h1>
          <p className="text-xs text-slate-400 mt-1">{vendor} • {monthLabel}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Order', val: `${totalOrders}x`, icon: 'fa-boxes-stacked', color: 'text-blue-600' },
            { label: 'Selesai', val: `${done}x`, icon: 'fa-check-circle', color: 'text-[#047857]' },
            { label: 'Sudah Cair', val: fmt(totalEarned), icon: 'fa-coins', color: 'text-[#047857]' },
            { label: 'Menunggu Cair', val: fmt(pendingSettlement), icon: 'fa-clock', color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="neu-card rounded-2xl p-4">
              <i className={`fa-solid ${s.icon} text-lg ${s.color} mb-2 block`} />
              <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="neu-card rounded-2xl p-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-bold text-slate-600 dark:text-slate-300">Tingkat Penyelesaian</span>
            <span className="font-black text-[#047857]">{Math.round((done / totalOrders) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full neu-inset overflow-hidden">
            <div className="h-full rounded-full bg-[#047857] transition-all" style={{ width: `${Math.round((done / totalOrders) * 100)}%` }} />
          </div>
        </div>

        {/* Pending Settlement */}
        {pendingSettlement > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <i className="fa-solid fa-wallet text-amber-500 text-xl" />
            <div>
              <div className="text-xs font-black text-amber-600">Dana Menunggu Pencairan</div>
              <div className="text-lg font-black text-amber-600 font-mono">{fmt(pendingSettlement)}</div>
              <div className="text-[10px] text-amber-500">Akan dicairkan tanggal 25 {monthLabel}</div>
            </div>
          </div>
        )}

        {/* Order List */}
        <div className="neu-card rounded-3xl p-5 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riwayat Order {monthLabel}</p>
          {loading ? (
            <div className="text-center py-6"><i className="fa-solid fa-spinner animate-spin text-[#047857] text-xl" /></div>
          ) : (
            <div className="space-y-2">
              {orders.map((o, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl neu-inset">
                  <div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{o.item}</div>
                    <div className="text-[10px] text-slate-400">{o.date} 2026</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border block mb-1 ${statusConfig[o.status]}`}>{o.status}</span>
                    <span className="text-xs font-black text-[#047857] font-mono">{fmt(o.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20saya%20mitra%20${encodeURIComponent(vendor)}%20ingin%20konfirmasi%20pencairan%20dana%20${monthLabel}`, '_blank')}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-brands fa-whatsapp" /> Konfirmasi Pencairan via WhatsApp
        </button>
        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Dashboard Mitra Vendor</p>
      </div>
    </div>
  );
}
