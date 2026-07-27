'use client';

import { useState, useEffect } from 'react';
import OCRUpload from './OCRUpload';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const MONTHLY_DATA = [
  { month: 'Jan', revenue: 28500000, expenses: 8200000 },
  { month: 'Feb', revenue: 30000000, expenses: 7800000 },
  { month: 'Mar', revenue: 31200000, expenses: 9100000 },
  { month: 'Apr', revenue: 29800000, expenses: 8500000 },
  { month: 'Mei', revenue: 32000000, expenses: 7600000 },
  { month: 'Jun', revenue: 34500000, expenses: 8900000 },
];

const FALLBACK_EXPENSES: ExpenseItem[] = [
  { id: '1', category: 'listrik', description: 'Token PLN Juli', amount: 4200000, date: '2026-07-01' },
  { id: '2', category: 'air', description: 'PDAM Juli', amount: 850000, date: '2026-07-02' },
  { id: '3', category: 'internet', description: 'IndiHome 100Mbps', amount: 1200000, date: '2026-07-03' },
  { id: '4', category: 'perbaikan', description: 'Ganti kran kamar B-202', amount: 350000, date: '2026-07-05' },
  { id: '5', category: 'lain_lain', description: 'Kebersihan & sampah', amount: 500000, date: '2026-07-06' },
];

const CATEGORY_LABELS: Record<string, string> = {
  listrik: '⚡ Listrik',
  air: '💧 Air',
  internet: '🌐 Internet',
  perbaikan: '🔧 Perbaikan',
  lain_lain: '📦 Lain-lain',
};

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatShort(n: number) {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
  return formatIDR(n);
}

export default function FinancialDashboard() {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(FALLBACK_EXPENSES);

  useEffect(() => {
    fetch('/api/expenses')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.length) setExpenses(json.data);
      })
      .catch(() => {});
  }, []);

  const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const totalRevenue = currentMonth.revenue;
  const totalExpenses = expenses.reduce((s: number, e: ExpenseItem) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

  return (
    <div className="space-y-8">
      {/* OCR Upload */}
      <OCRUpload />

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 stagger-children">
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Revenue</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-arrow-trend-up" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{formatShort(totalRevenue)}</div>
          <div className="text-[9px] sm:text-[11px] text-emerald-400 font-semibold">Bulan ini (Juni 2026)</div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Expenses</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-arrow-trend-down" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{formatShort(totalExpenses)}</div>
          <div className="text-[9px] sm:text-[11px] text-rose-400 font-semibold">{expenses.length} transaksi</div>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Profit</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-orchid-tint/10 text-orchid-tint flex items-center justify-center text-xs sm:text-sm"><i className="fa-solid fa-sack-dollar" /></div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-white">{formatShort(netProfit)}</div>
          <div className="text-[9px] sm:text-[11px] text-orchid-tint font-semibold">Margin {margin}%</div>
        </div>
      </div>

      {/* Revenue vs Expenses Chart (bar chart via CSS) */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><i className="fa-solid fa-chart-column text-orchid-tint text-[10px] sm:text-xs" /> Revenue vs Expenses (6 Bulan)</h3>
          <div className="flex items-center gap-3 sm:gap-4 text-[8px] sm:text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-400" /> Expenses</span>
          </div>
        </div>
        <div className="flex items-end gap-2 sm:gap-3 h-36 sm:h-44">
          {MONTHLY_DATA.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-28 sm:h-36">
                <div
                  className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-700"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                  title={formatIDR(d.revenue)}
                />
                <div
                  className="w-3 sm:w-5 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-700"
                  style={{ height: `${(d.expenses / maxRevenue) * 100}%` }}
                  title={formatIDR(d.expenses)}
                />
              </div>
              <span className="text-[9px] text-slate-500 font-semibold">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expense List with Category Filter */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-white/5 pb-4 sm:pb-5">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><i className="fa-solid fa-receipt text-orchid-gold text-[10px] sm:text-xs" /> Daftar Pengeluaran</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Scan struk via AI OCR untuk input otomatis</p>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterCategory === 'all' ? 'bg-white text-orchid-dark' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
            >
              Semua
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterCategory === key ? 'bg-white text-orchid-dark' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filteredExpenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs">
                  <i className={`fa-solid ${exp.category === 'listrik' ? 'fa-bolt' : exp.category === 'air' ? 'fa-droplet' : exp.category === 'internet' ? 'fa-wifi' : exp.category === 'perbaikan' ? 'fa-wrench' : 'fa-box'}`} />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{exp.description}</span>
                  <span className="text-[10px] text-slate-500">{CATEGORY_LABELS[exp.category]} • {exp.date}</span>
                </div>
              </div>
              <span className="text-sm font-black text-rose-400">{formatIDR(exp.amount)}</span>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-8">Tidak ada pengeluaran untuk kategori ini.</p>
          )}
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">Total ({filteredExpenses.length} item)</span>
          <span className="text-sm font-black text-white">{formatIDR(filteredExpenses.reduce((s: number, e: ExpenseItem) => s + e.amount, 0))}</span>
        </div>
      </div>

      {/* Occupancy Summary */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-5 sm:space-y-6">
        <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2"><i className="fa-solid fa-chart-pie text-orchid-tint text-[10px] sm:text-xs" /> Okupansi & Aging Rent</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {/* Occupancy donut (CSS) */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#occGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${85 * 2.51} ${100 * 2.51}`} />
                <defs>
                  <linearGradient id="occGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E2D9E2" />
                    <stop offset="100%" stopColor="#8E6E95" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-white">85%</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orchid-tint" /><span className="text-slate-300">Terisi: 10 kamar</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20" /><span className="text-slate-300">Kosong: 2 kamar</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-slate-300">Maintenance: 1 kamar</span></div>
            </div>
          </div>
          {/* Aging rent */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aging Rent (Tunggakan)</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 text-xs">
                <span className="text-slate-300">1-7 hari</span>
                <span className="font-bold text-amber-400">1 invoice • Rp 1.6jt</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 text-xs">
                <span className="text-slate-300">8-30 hari</span>
                <span className="font-bold text-orange-400">1 invoice • Rp 2.0jt</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 text-xs">
                <span className="text-slate-300">&gt; 30 hari</span>
                <span className="font-bold text-rose-400">0 invoice</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
