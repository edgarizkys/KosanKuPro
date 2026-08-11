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

const MONTHLY_DATA = [
  { month: 'Jan 2026', revenue: 28500000, expenses: 8200000, occupancy: 85 },
  { month: 'Feb 2026', revenue: 30000000, expenses: 7800000, occupancy: 90 },
  { month: 'Mar 2026', revenue: 31200000, expenses: 9100000, occupancy: 92 },
  { month: 'Apr 2026', revenue: 29800000, expenses: 8500000, occupancy: 88 },
  { month: 'Mei 2026', revenue: 32000000, expenses: 7600000, occupancy: 95 },
  { month: 'Jun 2026', revenue: 34500000, expenses: 8900000, occupancy: 100 },
];

const DETAILED_REVENUE_LOGS: RevenueItem[] = [
  { id: 'REV-2026-001', source: 'Sewa Bulanan Kamar Deluxe', tenantName: 'Budi Santoso', roomNumber: 'A-101', category: 'SEWA', amount: 2500000, method: 'QRIS Midtrans', date: '2026-08-01 10:15', status: 'SETTLED' },
  { id: 'REV-2026-002', source: 'Deposit Garansi Kerusakan', tenantName: 'Rian Pratama', roomNumber: 'C-302', category: 'DEPOSIT', amount: 1000000, method: 'BCA VA', date: '2026-08-02 14:30', status: 'SETTLED' },
  { id: 'REV-2026-003', source: 'Sewa Bulanan VIP Balcony', tenantName: 'Siti Rahma', roomNumber: 'B-201', category: 'SEWA', amount: 3000000, method: 'Mandiri VA', date: '2026-08-03 09:00', status: 'SETTLED' },
  { id: 'REV-2026-004', source: 'Add-On Laundry & Air Galon Aqua', tenantName: 'Budi Santoso', roomNumber: 'A-101', category: 'VENDOR_ADDON', amount: 150000, method: 'QRIS Midtrans', date: '2026-08-05 16:45', status: 'SETTLED' },
  { id: 'REV-2026-005', source: 'Biaya Denda Keterlambatan (Late Fee)', tenantName: 'Andi Wijaya', roomNumber: 'A-103', category: 'LATE_FEE', amount: 100000, method: 'QRIS Midtrans', date: '2026-08-07 11:20', status: 'SETTLED' },
  { id: 'REV-2026-006', source: 'Sewa Parkir Mobil Bulanan', tenantName: 'Deni Setiawan', roomNumber: 'B-203', category: 'PARKIR', amount: 250000, method: 'Manual Transfer', date: '2026-08-08 13:10', status: 'SETTLED' },
];

const FALLBACK_EXPENSES: ExpenseItem[] = [
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
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [revenueFilter, setRevenueFilter] = useState<string>('all');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(FALLBACK_EXPENSES);
  const [revenues, setRevenues] = useState<RevenueItem[]>(DETAILED_REVENUE_LOGS);
  const [activeChartTab, setActiveChartTab] = useState<'revenue' | 'profit' | 'occupancy'>('revenue');

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

  const filteredRevenues = revenueFilter === 'all'
    ? revenues
    : revenues.filter((r) => r.category === revenueFilter);

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));
  const maxExpenses = Math.max(...MONTHLY_DATA.map((d) => d.expenses));

  // Category summary breakdown for Revenue
  const sewaTotal = revenues.filter((r) => r.category === 'SEWA').reduce((a, b) => a + b.amount, 0) || 28500000;
  const depositTotal = revenues.filter((r) => r.category === 'DEPOSIT').reduce((a, b) => a + b.amount, 0) || 3200000;
  const addonTotal = revenues.filter((r) => r.category === 'VENDOR_ADDON').reduce((a, b) => a + b.amount, 0) || 1800000;
  const parkirTotal = revenues.filter((r) => r.category === 'PARKIR' || r.category === 'LATE_FEE').reduce((a, b) => a + b.amount, 0) || 1000000;

  return (
    <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors animate-fade-in">
      
      {/* P&L Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="neu-card p-5 sm:p-6 rounded-3xl space-y-3 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Inflow (Penerimaan)</span>
            <div className="w-10 h-10 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black">
              <i className="fa-solid fa-arrow-trend-up" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{formatShort(totalRevenue)}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            {revenues.length} transaksi penerimaan terdaftar
          </div>
        </div>

        <div className="neu-card p-5 sm:p-6 rounded-3xl space-y-3 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Outflow (Pengeluaran)</span>
            <div className="w-10 h-10 rounded-2xl neu-inset text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-black">
              <i className="fa-solid fa-arrow-trend-down" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{formatShort(totalExpenses)}</div>
          <div className="text-[10px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {expenses.length} transaksi pengeluaran terverifikasi
          </div>
        </div>

        <div className="neu-card p-5 sm:p-6 rounded-3xl space-y-3 transition-all hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net Profit (Laba Bersih)</span>
            <div className="w-10 h-10 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black">
              <i className="fa-solid fa-coins" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatShort(netProfit)}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Profit Margin: <strong>{margin}%</strong> dari Total Turnover
          </div>
        </div>
      </div>

      {/* ===== MODERN CLEAN SAAS DASHBOARD ANALYTICS CARD (INSPIRED BY REFERENCE) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Card (2 Cols) */}
        <div className="lg:col-span-2 neu-card p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">P&amp;L Analytics</span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Arus Kas Bulanan</h3>
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

          {/* Clean Curved Sparkline Area Graph + Glowing Points */}
          <div className="h-56 w-full relative pt-4 flex flex-col justify-between">
            <svg className="w-full h-40 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cleanInflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background Horizontal Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeDasharray="3 3" />

              {/* Smooth Spline Path */}
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

              {/* Interactive Data Dots with Tooltips */}
              <circle cx="0" cy="90" r="4" fill="#10b981" />
              <circle cx="120" cy="75" r="4" fill="#10b981" />
              <circle cx="240" cy="60" r="4" fill="#10b981" />
              <circle cx="360" cy="40" r="4" fill="#10b981" />
              <circle cx="480" cy="30" r="4" fill="#10b981" />
              <circle cx="600" cy="15" r="6" fill="#34d399" className="animate-ping" />
              <circle cx="600" cy="15" r="5" fill="#059669" />
            </svg>

            {/* X-Axis Month Tags */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 font-mono pt-2">
              {MONTHLY_DATA.map((d, idx) => (
                <span key={idx} className="hover:text-emerald-500 cursor-pointer transition-colors">{d.month}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-white/5">
            <span className="text-slate-500 font-medium">Status Arus Kas: <strong className="text-emerald-600 dark:text-emerald-400">Surplus +74%</strong></span>
            <span className="text-[10px] text-slate-400">Diperbarui realtime via AI Ledger</span>
          </div>
        </div>

        {/* Side KPI Card (1 Col) - Inspired by reference card 4 */}
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-200">Performa Okupansi</span>
            <h3 className="text-2xl font-black">Target Terpenuhi</h3>
            <p className="text-xs text-emerald-100/80">Rata-rataketerisian kamar periode 2026</p>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-4xl font-black tracking-tight">95.4%</div>
              <span className="text-xs text-emerald-200 font-bold flex items-center gap-1 mt-1">
                <i className="fa-solid fa-arrow-up text-emerald-300" /> +12.5% dibanding bulan lalu
              </span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-300/30 border-t-emerald-300 flex items-center justify-center font-black text-sm">
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

      {/* ===== RINCIAN LENGKAP PENDAPATAN & PENGELUARAN DIPALING BAWAH LAPORAN P&L ===== */}
      <div className="space-y-6 pt-4">
        
        {/* 1. RINCIAN TERKINI PENERIMAAN (REVENUE INFLOWS) */}
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  💰 Revenue Inflow Breakdown
                </span>
                <span className="text-xs text-slate-500 font-bold">Laporan Penerimaan Masuk</span>
              </div>
              <h3 className="text-xl font-black mt-1">1. Rincian Sumber Penerimaan Kosan</h3>
            </div>

            <div className="flex items-center gap-2 neu-inset p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setRevenueFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${revenueFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
              >
                Semua ({revenues.length})
              </button>
              <button
                onClick={() => setRevenueFilter('SEWA')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${revenueFilter === 'SEWA' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
              >
                Sewa Kamar
              </button>
              <button
                onClick={() => setRevenueFilter('DEPOSIT')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${revenueFilter === 'DEPOSIT' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
              >
                Deposit &amp; Fee
              </button>
              <button
                onClick={() => setRevenueFilter('VENDOR_ADDON')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${revenueFilter === 'VENDOR_ADDON' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}
              >
                Add-On Vendor
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">REF &amp; TANGGAL</th>
                  <th className="py-3 px-4">PENGHUNI &amp; KAMAR</th>
                  <th className="py-3 px-4">SUMBER PENERIMAAN</th>
                  <th className="py-3 px-4">METODE PEMBAYARAN</th>
                  <th className="py-3 px-4 text-right">NOMINAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {filteredRevenues.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{rev.id}</span>
                      <span className="text-[10px] text-slate-500">{rev.date}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">{rev.tenantName}</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Kamar {rev.roomNumber}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{rev.source}</span>
                      <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">{rev.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-white/10 font-bold text-[10px]">
                        <i className="fa-solid fa-credit-card mr-1 text-emerald-500" />
                        {rev.method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+{formatIDR(rev.amount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. RINCIAN TERKINI PENGELUARAN (EXPENSE OUTFLOWS) */}
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                  💸 Expense Outflow Breakdown
                </span>
                <span className="text-xs text-slate-500 font-bold">Laporan Pengeluaran Operasional</span>
              </div>
              <h3 className="text-xl font-black mt-1">2. Rincian Lengkap Pengeluaran Kosan</h3>
            </div>

            <div className="flex items-center gap-2 neu-inset p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterCategory === 'all' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}
              >
                Semua ({expenses.length})
              </button>
              <button
                onClick={() => setFilterCategory('listrik')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterCategory === 'listrik' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}
              >
                Listrik
              </button>
              <button
                onClick={() => setFilterCategory('air')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterCategory === 'air' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}
              >
                Air
              </button>
              <button
                onClick={() => setFilterCategory('internet')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${filterCategory === 'internet' ? 'bg-rose-600 text-white' : 'text-slate-500'}`}
              >
                Wi-Fi
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">NO. REF</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-4">DESKRIPSI PENGELUARAN</th>
                  <th className="py-3 px-4">TANGGAL TRANSAKSI</th>
                  <th className="py-3 px-4 text-right">NOMINAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {filteredExpenses.map((exp, idx) => (
                  <tr key={exp.id || idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">EXP-00{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] uppercase">
                        {CATEGORY_LABELS[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{exp.description}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{exp.date.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">-{formatIDR(exp.amount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
