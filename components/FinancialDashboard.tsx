'use client';

import { useState, useEffect } from 'react';
import OCRUpload from './OCRUpload';
import { useProperty } from '@/lib/PropertyContext';

interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface RevenueItem {
  id: string;
  source: string;
  tenantName: string;
  roomNumber: string;
  category: 'SEWA' | 'DEPOSIT' | 'LATE_FEE' | 'VENDOR_ADDON' | 'PARKIR';
  amount: number;
  method: 'QRIS Midtrans' | 'BCA VA' | 'Mandiri VA' | 'Manual Transfer';
  date: string;
  status: 'SETTLED' | 'PENDING';
}

const DEFAULT_MONTHLY_DATA = [
  { month: 'Jan 2026', revenue: 28500000, expenses: 8200000, occupancy: 85 },
  { month: 'Feb 2026', revenue: 30000000, expenses: 7800000, occupancy: 90 },
  { month: 'Mar 2026', revenue: 31200000, expenses: 9100000, occupancy: 92 },
  { month: 'Apr 2026', revenue: 29800000, expenses: 8500000, occupancy: 88 },
  { month: 'Mei 2026', revenue: 32000000, expenses: 7600000, occupancy: 95 },
  { month: 'Jun 2026', revenue: 34500000, expenses: 8900000, occupancy: 100 },
];

const DEFAULT_REVENUE_LOGS: RevenueItem[] = [
  { id: 'REV-2026-001', source: 'Sewa Bulanan Kamar Deluxe', tenantName: 'Budi Santoso', roomNumber: 'A-101', category: 'SEWA', amount: 2500000, method: 'QRIS Midtrans', date: '2026-08-01 10:15', status: 'SETTLED' },
  { id: 'REV-2026-002', source: 'Deposit Garansi Kerusakan', tenantName: 'Rian Pratama', roomNumber: 'C-302', category: 'DEPOSIT', amount: 1000000, method: 'BCA VA', date: '2026-08-02 14:30', status: 'SETTLED' },
  { id: 'REV-2026-003', source: 'Sewa Bulanan VIP Balcony', tenantName: 'Siti Rahma', roomNumber: 'B-201', category: 'SEWA', amount: 3000000, method: 'Mandiri VA', date: '2026-08-03 09:00', status: 'SETTLED' },
  { id: 'REV-2026-004', source: 'Add-On Laundry & Air Galon Aqua', tenantName: 'Budi Santoso', roomNumber: 'A-101', category: 'VENDOR_ADDON', amount: 150000, method: 'QRIS Midtrans', date: '2026-08-05 16:45', status: 'SETTLED' },
  { id: 'REV-2026-005', source: 'Biaya Denda Keterlambatan (Late Fee)', tenantName: 'Andi Wijaya', roomNumber: 'A-103', category: 'LATE_FEE', amount: 100000, method: 'QRIS Midtrans', date: '2026-08-07 11:20', status: 'SETTLED' },
  { id: 'REV-2026-006', source: 'Sewa Parkir Mobil Bulanan', tenantName: 'Deni Setiawan', roomNumber: 'B-203', category: 'PARKIR', amount: 250000, method: 'Manual Transfer', date: '2026-08-08 13:10', status: 'SETTLED' },
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: '185d98ac-6f08', category: 'listrik', description: 'Token PLN Juli 2026', amount: 4200000, date: '2026-07-01' },
  { id: '899fefb0-d221', category: 'air', description: 'Tagihan Air PDAM Juli 2026', amount: 850000, date: '2026-07-02' },
  { id: 'db5fdc64-c289', category: 'internet', description: 'Langganan Wi-Fi IndiHome 100Mbps', amount: 1200000, date: '2026-07-03' },
  { id: '44073b40-c680', category: 'perbaikan', description: 'Ganti kran kamar B-202', amount: 350000, date: '2026-07-05' },
  { id: 'f724c40a-c1a2', category: 'lain_lain', description: 'Kebersihan & sampah Juli', amount: 500000, date: '2026-07-06' },
];

const CATEGORY_LABELS: Record<string, string> = {
  listrik: 'Listrik',
  air: 'Air',
  internet: 'Internet',
  perbaikan: 'Perbaikan',
  lain_lain: 'Lain-lain',
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
  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [revenueFilter, setRevenueFilter] = useState<string>('all');
  const [ledgerTab, setLedgerTab] = useState<'all' | 'revenue' | 'expense'>('all');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(isCustomOrNewKos ? [] : DEFAULT_EXPENSES);
  const [revenues, setRevenues] = useState<RevenueItem[]>(isCustomOrNewKos ? [] : DEFAULT_REVENUE_LOGS);
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'profit' | 'occupancy'>('revenue');

  useEffect(() => {
    if (!isCustomOrNewKos) {
      fetch('/api/expenses', {
        headers: { 'x-user-role': 'owner' },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data?.length) setExpenses(json.data);
        })
        .catch(() => {});
    } else {
      // Clean start for newly plotted Kosan property
      setExpenses([]);
      setRevenues([]);
    }
  }, [isCustomOrNewKos]);

  const monthlyData = isCustomOrNewKos
    ? [{ month: 'Agt 2026', revenue: 0, expenses: 0, occupancy: 0 }]
    : DEFAULT_MONTHLY_DATA;

  const currentMonth = monthlyData[monthlyData.length - 1];
  const totalRevenue = isCustomOrNewKos
    ? revenues.reduce((s: number, r: RevenueItem) => s + r.amount, 0)
    : currentMonth.revenue;
  const totalExpenses = expenses.reduce((s: number, e: ExpenseItem) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const filteredRevenues = revenueFilter === 'all'
    ? revenues
    : revenues.filter((r) => r.category === revenueFilter);

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  // Combined transactions for 'all' tab
  const combinedTransactions = [
    ...filteredRevenues.map((r) => ({
      id: r.id,
      type: 'INFLOW' as const,
      title: r.source,
      subtitle: `${r.tenantName} (${r.roomNumber})`,
      category: r.category,
      method: r.method,
      amount: r.amount,
      date: r.date,
    })),
    ...filteredExpenses.map((e, idx) => ({
      id: e.id || `EXP-00${idx + 1}`,
      type: 'OUTFLOW' as const,
      title: e.description,
      subtitle: CATEGORY_LABELS[e.category] || e.category,
      category: e.category,
      method: 'Operasional Kas',
      amount: e.amount,
      date: e.date,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5 text-slate-900 dark:text-white transition-colors animate-fade-in">
      
      {/* P&L Executive Summary Cards (2-column compact on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="neu-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Inflow</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
              <i className="fa-solid fa-arrow-trend-up" />
            </div>
          </div>
          <div className="text-sm sm:text-2xl font-black text-slate-900 dark:text-white truncate">{formatShort(totalRevenue)}</div>
          <div className="text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            {revenues.length} transaksi penerimaan
          </div>
        </div>

        <div className="neu-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2 transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Outflow</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl neu-inset text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black shrink-0">
              <i className="fa-solid fa-arrow-trend-down" />
            </div>
          </div>
          <div className="text-sm sm:text-2xl font-black text-slate-900 dark:text-white truncate">{formatShort(totalExpenses)}</div>
          <div className="text-[9px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            {expenses.length} transaksi pengeluaran
          </div>
        </div>

        <div className="neu-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2 transition-all hover:-translate-y-0.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Net Profit (Laba Bersih)</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">
              <i className="fa-solid fa-coins" />
            </div>
          </div>
          <div className="text-sm sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">{formatShort(netProfit)}</div>
          <div className="text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
            Margin: <strong>{margin}%</strong> dari Turnover
          </div>
        </div>
      </div>

      {/* ===== MODERN CLEAN SAAS DASHBOARD ANALYTICS CARD ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Main Chart Card (2 Cols) */}
        <div className="lg:col-span-2 neu-card p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">P&amp;L Analytics</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Arus Kas Bulanan</h3>
            </div>

            <div className="flex items-center gap-2 neu-inset p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveChartTab('revenue')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeChartTab === 'revenue' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveChartTab('profit')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  activeChartTab === 'profit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Net Profit
              </button>
            </div>
          </div>

          {/* Clean Curved Sparkline Area Graph */}
          <div className="h-44 w-full relative pt-2 flex flex-col justify-between">
            <svg className="w-full h-32 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cleanInflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />

              <path
                d="M 0,90 C 100,70 150,85 240,60 C 330,35 450,45 600,15 L 600,160 L 0,160 Z"
                fill="url(#cleanInflowGrad)"
              />
              <path
                d="M 0,90 C 100,70 150,85 240,60 C 330,35 450,45 600,15"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              <circle cx="0" cy="90" r="4" fill="#10b981" />
              <circle cx="120" cy="75" r="4" fill="#10b981" />
              <circle cx="240" cy="60" r="4" fill="#10b981" />
              <circle cx="360" cy="40" r="4" fill="#10b981" />
              <circle cx="480" cy="30" r="4" fill="#10b981" />
              <circle cx="600" cy="15" r="6" fill="#34d399" className="animate-ping" />
              <circle cx="600" cy="15" r="5" fill="#059669" />
            </svg>

            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono pt-1">
              {monthlyData.map((d: any, idx: number) => (
                <span key={idx} className="hover:text-emerald-500 cursor-pointer transition-colors">{d.month}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-white/5">
            <span className="text-slate-500 font-medium">Status Arus Kas: <strong className="text-emerald-600 dark:text-emerald-400">Surplus +74%</strong></span>
            <span className="text-[10px] text-slate-400">Diperbarui realtime via AI Ledger</span>
          </div>
        </div>

        {/* Side KPI Card (1 Col) */}
        <div className="neu-card p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-200">Performa Okupansi</span>
            <h3 className="text-xl font-black">Target Terpenuhi</h3>
            <p className="text-xs text-emerald-100/80">Rata-rata keterisian kamar periode 2026</p>
          </div>

          <div className="flex items-center justify-between my-1">
            <div>
              <div className="text-3xl font-black tracking-tight">95.4%</div>
              <span className="text-[11px] text-emerald-200 font-bold flex items-center gap-1 mt-1">
                <i className="fa-solid fa-arrow-up text-emerald-300" /> +12.5% dibanding bulan lalu
              </span>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-emerald-300/30 border-t-emerald-300 flex items-center justify-center font-black text-xs">
              95%
            </div>
          </div>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-xs space-y-1">
            <div className="flex justify-between font-bold text-emerald-100 text-[11px]">
              <span>Kamar Terisi:</span>
              <span>19 / 20 Unit</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-300 rounded-full w-[95%]" />
            </div>
          </div>
        </div>

      </div>

      {/* ===== UNIFIED TABBED TRANSACTIONS LEDGER (STREAMLINED P&L TABLE) ===== */}
      <div className="neu-card p-5 sm:p-6 rounded-3xl space-y-4">
        
        {/* Header & Ledger Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                📊 Financial Ledger
              </span>
              <span className="text-xs text-slate-500 font-bold">Jurnal P&amp;L Terintegrasi</span>
            </div>
            <h3 className="text-lg font-black mt-1">Rincian Transaksi Keuangan Kosan</h3>
          </div>

          {/* Main Ledger Mode Tabs */}
          <div className="flex items-center gap-1 neu-inset p-1 rounded-2xl text-xs font-bold self-start md:self-auto">
            <button
              onClick={() => setLedgerTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                ledgerTab === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua Arus Kas
            </button>
            <button
              onClick={() => setLedgerTab('revenue')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                ledgerTab === 'revenue' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Penerimaan ({revenues.length})
            </button>
            <button
              onClick={() => setLedgerTab('expense')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                ledgerTab === 'expense' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Pengeluaran ({expenses.length})
            </button>
          </div>
        </div>

        {/* Sub-Category Filter Bar (Shown depending on active tab) */}
        {ledgerTab === 'revenue' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider mr-1">Filter Sub-Kategori:</span>
            {['all', 'SEWA', 'DEPOSIT', 'VENDOR_ADDON'].map((cat) => (
              <button
                key={cat}
                onClick={() => setRevenueFilter(cat)}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] ${
                  revenueFilter === cat ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-extrabold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? 'Semua Status' : cat === 'SEWA' ? 'Sewa Kamar' : cat === 'DEPOSIT' ? 'Deposit & Fee' : 'Vendor Add-On'}
              </button>
            ))}
          </div>
        )}

        {ledgerTab === 'expense' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-[10px] uppercase text-slate-400 tracking-wider mr-1">Filter Pos Pengeluaran:</span>
            {['all', 'listrik', 'air', 'internet'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] ${
                  filterCategory === cat ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-extrabold' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {cat === 'all' ? 'Semua Biaya' : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Compact Ledger Table Container (Max Height 380px) */}
        <div className="overflow-x-auto max-h-80 sm:max-h-96 overflow-y-auto pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 shadow-sm z-10">
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">TIPE &amp; REF</th>
                <th className="py-2.5 px-3">DESKRIPSI TRANSAKSI</th>
                <th className="py-2.5 px-3">KATEGORI &amp; METODE</th>
                <th className="py-2.5 px-3">TANGGAL</th>
                <th className="py-2.5 px-3 text-right">NOMINAL (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
              
              {/* TAB: SEMUA ARUS KAS (ALL) */}
              {ledgerTab === 'all' &&
                combinedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                          tx.type === 'INFLOW' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          <i className={`fa-solid ${tx.type === 'INFLOW' ? 'fa-plus' : 'fa-minus'}`} />
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{tx.id}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{tx.title}</span>
                      <span className="text-[10px] text-slate-500">{tx.subtitle}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        tx.type === 'INFLOW' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.category}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tx.method}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{tx.date}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-mono font-black text-sm ${
                        tx.type === 'INFLOW' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'INFLOW' ? '+' : '-'}{formatIDR(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))}

              {/* TAB: PENERIMAN (REVENUE) */}
              {ledgerTab === 'revenue' &&
                filteredRevenues.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{rev.id}</span>
                      <span className="text-[10px] text-slate-500">{rev.date}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{rev.source}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">{rev.tenantName} ({rev.roomNumber})</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase">
                        {rev.category}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{rev.method}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{rev.date}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+{formatIDR(rev.amount)}</span>
                    </td>
                  </tr>
                ))}

              {/* TAB: PENGELUARAN (EXPENSE) */}
              {ledgerTab === 'expense' &&
                filteredExpenses.map((exp, idx) => (
                  <tr key={exp.id || idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">EXP-00{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">{exp.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-[9px] uppercase">
                        {CATEGORY_LABELS[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{exp.date.slice(0, 10)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">-{formatIDR(exp.amount)}</span>
                    </td>
                  </tr>
                ))}

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

