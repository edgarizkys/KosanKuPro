'use client';
import React, { useState, useEffect } from 'react';

export default function TenantStatementPortal() {
  const [tenant, setTenant] = useState('dr. Rizky Pratama, Sp.A');
  const [room, setRoom] = useState('EKS-01');
  const [month, setMonth] = useState('2026-08');
  const [loading, setLoading] = useState(true);

  const monthLabel = new Date(month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenant(p.get('tenant')!);
    if (p.get('room')) setRoom(p.get('room')!);
    if (p.get('month')) setMonth(p.get('month')!);
    setTimeout(() => setLoading(false), 600);
  }, []);

  const transactions = [
    { date: '01 Agu', cat: 'SEWA', icon: '🏠', label: 'Pembayaran Sewa Kamar', amount: 1500000, type: 'out' },
    { date: '05 Agu', cat: 'GALON', icon: '💧', label: 'Refill Galon Aqua 2x', amount: 40000, type: 'out' },
    { date: '08 Agu', cat: 'LAUNDRY', icon: '👕', label: 'Laundry Kiloan 5kg', amount: 35000, type: 'out' },
    { date: '12 Agu', cat: 'WARUNG', icon: '🍳', label: 'Nasi Goreng & Kopi 3x', amount: 54000, type: 'out' },
    { date: '15 Agu', cat: 'GALON', icon: '💧', label: 'Refill Galon Aqua 2x', amount: 40000, type: 'out' },
    { date: '19 Agu', cat: 'LAUNDRY', icon: '👔', label: 'Laundry Express 3 Jam', amount: 50000, type: 'out' },
    { date: '22 Agu', cat: 'WARUNG', icon: '🍗', label: 'Nasi Ayam & Mie Goreng', amount: 37000, type: 'out' },
    { date: '25 Agu', cat: 'GALON', icon: '💧', label: 'Refill Galon Aqua 2x', amount: 40000, type: 'out' },
  ];

  const catTotals = [
    { icon: '🏠', label: 'Sewa Kamar', total: 1500000, color: 'text-slate-800 dark:text-white' },
    { icon: '💧', label: 'Air & Galon', total: 120000, color: 'text-blue-600' },
    { icon: '👕', label: 'Laundry', total: 85000, color: 'text-purple-500' },
    { icon: '🍳', label: 'Katering & Warung', total: 91000, color: 'text-orange-500' },
  ];

  const grandTotal = catTotals.reduce((a, c) => a + c.total, 0);

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-chart-pie text-xs" /><span>REKAP PENGELUARAN BULANAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Rekap {monthLabel}</h1>
          <p className="text-xs text-slate-400 mt-1">{tenant} • Kamar {room}</p>
        </div>

        {/* Month selector */}
        <div className="flex flex-wrap gap-2">
          {['2026-06', '2026-07', '2026-08'].map(m => (
            <button key={m} onClick={() => setMonth(m)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${month === m ? 'neu-card text-[#047857]' : 'neu-inset text-slate-500'}`}>
              {new Date(m + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </button>
          ))}
        </div>

        {/* Grand Total */}
        <div className="neu-card rounded-3xl p-5">
          <div className="text-center mb-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Pengeluaran {monthLabel}</div>
            <div className="text-3xl font-black font-mono text-[#047857] mt-1">{fmt(grandTotal)}</div>
          </div>

          {/* Donut-like breakdown */}
          <div className="space-y-2">
            {catTotals.map(cat => (
              <div key={cat.label} className="flex items-center gap-3 p-2.5 rounded-xl neu-inset">
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">{cat.label}</span>
                    <span className={`font-black ${cat.color}`}>{fmt(cat.total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#047857]" style={{ width: `${Math.round((cat.total / grandTotal) * 100)}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{Math.round((cat.total / grandTotal) * 100)}% dari total</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="neu-card rounded-3xl p-5 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riwayat Transaksi</p>
          {loading ? (
            <div className="text-center py-6"><i className="fa-solid fa-spinner animate-spin text-[#047857] text-xl" /></div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl neu-inset">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{t.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.label}</div>
                      <div className="text-[10px] text-slate-400">{t.date} Agustus 2026</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-rose-500">−{fmt(t.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => window.print()}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-solid fa-file-pdf" /> Unduh Rekap PDF
        </button>
        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Rekap Pengeluaran Digital</p>
      </div>
    </div>
  );
}
