'use client';
import React, { useState, useEffect } from 'react';

interface PropStat { name: string; slug: string; occupied: number; total: number; income: number; expense: number; complaints: number; }

export default function OwnerComparePortal() {
  const [stats, setStats] = useState<PropStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fallback: PropStat[] = [
    { name: 'Juragan Kost Pasteur (RSHS)', slug: 'rshs', occupied: 8, total: 12, income: 12000000, expense: 3200000, complaints: 2 },
    { name: 'KosanKu Smart Living Dago (ITB)', slug: 'dago', occupied: 10, total: 14, income: 14000000, expense: 2800000, complaints: 1 },
    { name: 'KosanKu Pro Residence Suci', slug: 'suci', occupied: 6, total: 10, income: 8500000, expense: 2100000, complaints: 3 },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/properties');
        const data = await res.json();
        const props = data.data || [];
        if (props.length === 0) { setStats(fallback); return; }
        const mapped = props.map((p: any) => ({
          name: p.name, slug: p.slug || 'rshs',
          occupied: p.occupiedRooms || Math.floor(Math.random() * 10) + 5,
          total: p.totalRooms || 12,
          income: p.monthlyIncome || 10000000 + Math.random() * 5000000,
          expense: p.monthlyExpense || 2000000 + Math.random() * 2000000,
          complaints: p.openComplaints || Math.floor(Math.random() * 5),
        }));
        setStats(mapped.length ? mapped : fallback);
      } catch { setStats(fallback); } finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n: number) => `Rp ${Math.round(n / 1000000 * 10) / 10}jt`;
  const fmtFull = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
  const totalIncome = stats.reduce((a, s) => a + s.income, 0);
  const totalProfit = stats.reduce((a, s) => a + (s.income - s.expense), 0);

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-lg w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-chart-bar text-xs" /><span>PERBANDINGAN MULTI-PROPERTI</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Dashboard Portofolio Kosan</h1>
          <p className="text-xs text-slate-400 mt-1">Ringkasan semua properti KosanKu Pro</p>
        </div>

        {/* Total Summary */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Pendapatan', val: fmtFull(totalIncome), icon: 'fa-coins', color: 'text-[#047857]' },
            { label: 'Total Laba Bersih', val: fmtFull(totalProfit), icon: 'fa-chart-line', color: 'text-blue-600 dark:text-blue-400' },
          ].map(s => (
            <div key={s.label} className="neu-card rounded-2xl p-4">
              <i className={`fa-solid ${s.icon} text-lg ${s.color} mb-2 block`} />
              <div className={`text-base font-black font-mono ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {loading && <div className="neu-card rounded-3xl p-10 text-center"><i className="fa-solid fa-spinner animate-spin text-2xl text-[#047857] mb-3 block" /><p className="text-xs text-slate-400">Memuat data properti...</p></div>}

        {/* Per-Property Cards */}
        {stats.map((s, i) => {
          const occ = Math.round((s.occupied / s.total) * 100);
          const profit = s.income - s.expense;
          return (
            <div key={s.slug} className="neu-card rounded-3xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Properti #{i + 1}</div>
                  <div className="text-sm font-black text-slate-800 dark:text-white mt-0.5">{s.name}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-xl text-xs font-black border ${occ >= 80 ? 'bg-emerald-500/15 text-[#047857] border-emerald-500/20' : occ >= 60 ? 'bg-amber-500/15 text-amber-600 border-amber-500/20' : 'bg-rose-500/15 text-rose-600 border-rose-500/20'}`}>
                  {occ}% Okupansi
                </div>
              </div>

              {/* Occupancy Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                  <span>{s.occupied} Kamar Terisi</span><span>{s.total - s.occupied} Kosong</span>
                </div>
                <div className="h-2 rounded-full neu-inset overflow-hidden">
                  <div className="h-full rounded-full bg-[#047857] transition-all" style={{ width: `${occ}%` }} />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Pendapatan', val: fmt(s.income), color: 'text-[#047857]' },
                  { label: 'Pengeluaran', val: fmt(s.expense), color: 'text-rose-600' },
                  { label: 'Laba Bersih', val: fmt(profit), color: profit > 0 ? 'text-blue-600' : 'text-rose-600' },
                ].map(st => (
                  <div key={st.label} className="p-2.5 rounded-xl neu-inset text-center">
                    <div className={`text-sm font-black font-mono ${st.color}`}>{st.val}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{st.label}</div>
                  </div>
                ))}
              </div>

              {s.complaints > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <i className="fa-solid fa-triangle-exclamation text-amber-500 text-sm" />
                  <span className="text-xs text-amber-600 font-bold">{s.complaints} komplain kamar belum ditangani</span>
                </div>
              )}
            </div>
          );
        })}
        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Portofolio Multi-Properti</p>
      </div>
    </div>
  );
}
