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

  const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));
  const maxExpenses = Math.max(...MONTHLY_DATA.map((d) => d.expenses));

  // Category summary breakdown for Revenue
  const sewaTotal = revenues.filter((r) => r.category === 'SEWA').reduce((a, b) => a + b.amount, 0) || 28500000;
  const depositTotal = revenues.filter((r) => r.category === 'DEPOSIT').reduce((a, b) => a + b.amount, 0) || 3200000;
  const addonTotal = revenues.filter((r) => r.category === 'VENDOR_ADDON').reduce((a, b) => a + b.amount, 0) || 1800000;
  const parkirTotal = revenues.filter((r) => r.category === 'PARKIR' || r.category === 'LATE_FEE').reduce((a, b) => a + b.amount, 0) || 1000000;

  return (
    <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors animate-fade-in">
      
      {/* OCR Upload Card */}
      <OCRUpload />

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

      {/* ===== DYNAMIC ANIMATED GRAPH CHART COMPONENT ===== */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-emerald-500" />
              <span>Grafik Analitik Tren Keuangan &amp; Okupansi (Interactive AI Chart)</span>
            </h3>
            <p className="text-xs text-slate-500">Visualisasi data berkala dengan perbandingan tren bulanan</p>
          </div>

          <div className="flex items-center gap-2 neu-inset p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveChartTab('revenue')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeChartTab === 'revenue' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Revenue vs Expense
            </button>
            <button
              onClick={() => setActiveChartTab('profit')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeChartTab === 'profit' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tren Laba Bersih
            </button>
            <button
              onClick={() => setActiveChartTab('occupancy')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeChartTab === 'occupancy' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Okupansi (%)
            </button>
          </div>
        </div>

        {/* Animated Bar & Line Chart Container */}
        <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-4 px-2 sm:px-6 relative">
          
          {/* Background Grid Lines */}
          <div className="absolute inset-x-0 top-0 border-b border-slate-200/50 dark:border-white/5 text-[9px] text-slate-400 font-mono pl-2">Rp 40jt</div>
          <div className="absolute inset-x-0 top-1/3 border-b border-slate-200/50 dark:border-white/5 text-[9px] text-slate-400 font-mono pl-2">Rp 25jt</div>
          <div className="absolute inset-x-0 top-2/3 border-b border-slate-200/50 dark:border-white/5 text-[9px] text-slate-400 font-mono pl-2">Rp 10jt</div>

          {MONTHLY_DATA.map((d, i) => {
            const revHeight = Math.round((d.revenue / maxRevenue) * 100);
            const expHeight = Math.round((d.expenses / maxRevenue) * 100);
            const profit = d.revenue - d.expenses;
            const profitHeight = Math.round((profit / maxRevenue) * 100);

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group z-10">
                
                {/* Tooltip Hover Capsule */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-2xl pointer-events-none z-30 flex flex-col items-center">
                  <span>{d.month}</span>
                  <span className="text-emerald-400">Revenue: {formatShort(d.revenue)}</span>
                  <span className="text-rose-400">Expense: {formatShort(d.expenses)}</span>
                  <span className="text-amber-400">Profit: {formatShort(profit)}</span>
                </div>

                {/* Animated Bars */}
                {activeChartTab === 'revenue' && (
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-xl transition-all duration-700 ease-out group-hover:brightness-110 shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-1/2 bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-xl transition-all duration-700 ease-out group-hover:brightness-110 shadow-lg"
                    />
                  </div>
                )}

                {activeChartTab === 'profit' && (
                  <div
                    style={{ height: `${profitHeight}%` }}
                    className="w-3/4 bg-gradient-to-t from-emerald-700 via-teal-500 to-emerald-400 rounded-t-2xl transition-all duration-700 ease-out group-hover:brightness-110 shadow-xl relative overflow-hidden"
                  >
                    <span className="absolute top-1 inset-x-0 text-center text-[9px] font-black text-white">{formatShort(profit)}</span>
                  </div>
                )}

                {activeChartTab === 'occupancy' && (
                  <div
                    style={{ height: `${d.occupancy}%` }}
                    className="w-3/4 bg-gradient-to-t from-purple-700 to-indigo-500 rounded-t-2xl transition-all duration-700 ease-out group-hover:brightness-110 shadow-xl relative"
                  >
                    <span className="absolute top-1 inset-x-0 text-center text-[9px] font-black text-white">{d.occupancy}%</span>
                  </div>
                )}

                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{d.month.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-200 dark:border-white/10 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Revenue Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Expense Outflow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Okupansi Kamar</span>
          </div>
        </div>
      </div>

      {/* ===== RINCIAN LENGKAP PENDAPATAN (DETAILED REVENUE INFLOWS) ===== */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                💰 Revenue Inflow Breakdown
              </span>
              <span className="text-xs text-slate-500 font-bold">Audit Asal Mula Pendapatan Kosan</span>
            </div>
            <h3 className="text-xl font-black mt-1">Rincian Lengkap Sumber Penerimaan Kosan</h3>
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

        {/* Categories Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="neu-card-sm p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Sewa Kamar Base</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatIDR(sewaTotal)}</p>
            <span className="text-[9px] text-slate-400">82.6% Inflow Utama</span>
          </div>

          <div className="neu-card-sm p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Deposit Garansi</span>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400">{formatIDR(depositTotal)}</p>
            <span className="text-[9px] text-slate-400">9.3% Retainage</span>
          </div>

          <div className="neu-card-sm p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Komisi Add-On Vendor</span>
            <p className="text-lg font-black text-purple-600 dark:text-purple-400">{formatIDR(addonTotal)}</p>
            <span className="text-[9px] text-slate-400">5.2% Aqua &amp; Laundry</span>
          </div>

          <div className="neu-card-sm p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Parkir &amp; Late Fee</span>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{formatIDR(parkirTotal)}</p>
            <span className="text-[9px] text-slate-400">2.9% Extra Charges</span>
          </div>
        </div>

        {/* Detailed Inflow Table */}
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
    </div>
  );
}
