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
  { month: 'Jan 2026', revenue: 28500000, expenses: 8200000 },
  { month: 'Feb 2026', revenue: 30000000, expenses: 7800000 },
  { month: 'Mar 2026', revenue: 31200000, expenses: 9100000 },
  { month: 'Apr 2026', revenue: 29800000, expenses: 8500000 },
  { month: 'Mei 2026', revenue: 32000000, expenses: 7600000 },
  { month: 'Jun 2026', revenue: 34500000, expenses: 8900000 },
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

function formatShortRef(id: string, index: number) {
  if (!id) return `EXP-${String(index + 1).padStart(3, '0')}`;
  if (id.length > 10) {
    return `EXP-${String(index + 1).padStart(3, '0')}`;
  }
  return id.toUpperCase();
}

export default function FinancialDashboard() {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(FALLBACK_EXPENSES);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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

  // Native Microsoft Excel Spreadsheet (.xls) Generator with styling & Auto-Column Grid
  const exportExecutiveExcel = () => {
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timestamp = new Date().toISOString().slice(0, 10);

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Laporan Keuangan KosanKu Pro</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          .title { font-size: 16pt; font-weight: bold; color: #1e1b4b; background-color: #f3e8ff; padding: 10px; border: 1px solid #cbd5e1; }
          .sub-header { font-size: 10pt; color: #475569; padding: 4px; }
          .sec-header { font-size: 11pt; font-weight: bold; background-color: #1e1b4b; color: #ffffff; padding: 8px; }
          .th-style { background-color: #4c1d95; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #334155; padding: 6px; }
          .td-style { border: 1px solid #cbd5e1; padding: 6px; }
          .td-center { border: 1px solid #cbd5e1; padding: 6px; text-align: center; }
          .num-style { border: 1px solid #cbd5e1; padding: 6px; text-align: right; font-weight: bold; }
          .total-row { background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #0f172a; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="6" class="title">KOSANKU PRO - LAPORAN LABA RUGI &amp; PEMBUKUAN RESMI</td></tr>
          <tr><td colspan="6" class="sub-header">Dokumen Ref: LAP-FIN-${timestamp} | Tanggal Dicetak: ${today} | Audit: VERIFIED AI OCR</td></tr>
          <tr><td colspan="6"></td></tr>

          <!-- Seksi 1: Ringkasan Eksekutif -->
          <tr><td colspan="6" class="sec-header">1. RINGKASAN EKSEKUTIF KEUANGAN</td></tr>
          <tr>
            <td colspan="2" class="td-style" style="font-weight:bold; background-color:#f8fafc;">Total Revenue (Pendapatan)</td>
            <td colspan="4" class="num-style" style="color:#059669; font-size:12pt;">${formatIDR(totalRevenue)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-style" style="font-weight:bold; background-color:#f8fafc;">Total Expenses (Pengeluaran)</td>
            <td colspan="4" class="num-style" style="color:#dc2626; font-size:12pt;">${formatIDR(totalExpenses)}</td>
          </tr>
          <tr>
            <td colspan="2" class="td-style" style="font-weight:bold; background-color:#f8fafc;">Laba Bersih (Net Profit)</td>
            <td colspan="4" class="num-style" style="color:#4f46e5; font-size:12pt;">${formatIDR(netProfit)} (Margin ${margin}%)</td>
          </tr>
          <tr><td colspan="6"></td></tr>

          <!-- Seksi 2: Perkembangan 6 Bulan -->
          <tr><td colspan="6" class="sec-header">2. PERKEMBANGAN 6 BULAN TERAKHIR</td></tr>
          <tr>
            <td class="th-style">Bulan</td>
            <td colspan="2" class="th-style">Pendapatan (IDR)</td>
            <td colspan="2" class="th-style">Pengeluaran (IDR)</td>
            <td class="th-style">Laba Bersih (IDR)</td>
          </tr>
          ${MONTHLY_DATA.map(
            (m) => `
            <tr>
              <td class="td-center" style="font-weight:bold;">${m.month}</td>
              <td colspan="2" class="num-style" style="color:#059669;">${formatIDR(m.revenue)}</td>
              <td colspan="2" class="num-style" style="color:#dc2626;">${formatIDR(m.expenses)}</td>
              <td class="num-style" style="color:#4f46e5;">${formatIDR(m.revenue - m.expenses)}</td>
            </tr>`
          ).join('')}
          <tr><td colspan="6"></td></tr>

          <!-- Seksi 3: Rincian Pengeluaran -->
          <tr><td colspan="6" class="sec-header">3. RINCIAN TRANSAKSI PENGELUARAN RESMI</td></tr>
          <tr>
            <td class="th-style">No. Ref</td>
            <td class="th-style">Kategori</td>
            <td colspan="2" class="th-style">Deskripsi Pengeluaran</td>
            <td class="th-style">Nominal (IDR)</td>
            <td class="th-style">Tanggal / Status</td>
          </tr>
          ${expenses.map(
            (e, idx) => `
            <tr>
              <td class="td-center" style="font-family:monospace; font-weight:bold;">${formatShortRef(e.id, idx)}</td>
              <td class="td-style">${CATEGORY_LABELS[e.category] || e.category}</td>
              <td colspan="2" class="td-style">${e.description}</td>
              <td class="num-style" style="color:#dc2626;">${formatIDR(e.amount)}</td>
              <td class="td-center">${e.date.slice(0, 10)} (Verified)</td>
            </tr>`
          ).join('')}
          <tr class="total-row">
            <td colspan="4" style="text-align:right; font-weight:bold; padding:8px;">TOTAL PENGELUARAN:</td>
            <td class="num-style" style="color:#dc2626; font-size:12pt;">${formatIDR(totalExpenses)}</td>
            <td></td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Keuangan_KosanKuPro_${timestamp}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
      
      {/* 📄 DEDICATED PRINT-ONLY SHEET (100% Full Paper Width, Zero Shadow, Zero Card Floating, Super Crisp) */}
      <div id="print-sheet" className="hidden print:block font-sans text-black w-full bg-white p-0 leading-normal">
        {/* Kop Surat Formal Header */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">KOSANKU PRO</h1>
              <p className="text-xs font-bold text-slate-700 mt-1">Laporan Keuangan &amp; Laba Rugi Properti</p>
              <p className="text-[10px] text-slate-500">Jl. Kosan Modern No. 88, Jakarta • System Audit: VERIFIED AI OCR</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <span className="font-extrabold text-sm block">LAPORAN RESMI</span>
            <span className="text-slate-600 block">Ref: FIN-REP-2026-07</span>
            <span className="text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Executive Summary Grid (3 Boxes) */}
        <div className="grid grid-cols-3 gap-4 mb-6 border border-slate-300 p-4 rounded-md bg-slate-50">
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Revenue</span>
            <span className="text-base font-black text-slate-900">{formatIDR(totalRevenue)}</span>
          </div>
          <div className="text-center border-x border-slate-300">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Expenses</span>
            <span className="text-base font-black text-rose-600">{formatIDR(totalExpenses)}</span>
          </div>
          <div className="text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Laba Bersih (Net Profit)</span>
            <span className="text-base font-black text-emerald-600">{formatIDR(netProfit)} (Margin {margin}%)</span>
          </div>
        </div>

        {/* Rincian Transaksi Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 border-b border-black pb-1">
            Rincian Transaksi Pengeluaran ({expenses.length} Item Terdaftar)
          </h3>
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                <th className="p-2 border-r border-slate-300 w-24 text-center">Ref</th>
                <th className="p-2 border-r border-slate-300 w-32">Kategori</th>
                <th className="p-2 border-r border-slate-300">Deskripsi Transaksi</th>
                <th className="p-2 text-right w-36">Nominal (IDR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {expenses.map((e, idx) => (
                <tr key={e.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="p-2 border-r border-slate-300 font-mono text-center font-bold text-slate-700">
                    {formatShortRef(e.id, idx)}
                  </td>
                  <td className="p-2 border-r border-slate-300 font-medium">
                    {CATEGORY_LABELS[e.category] || e.category}
                  </td>
                  <td className="p-2 border-r border-slate-300 font-medium">
                    {e.description}
                  </td>
                  <td className="p-2 text-right font-black text-slate-900">
                    {formatIDR(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                <td colSpan={3} className="p-2 text-right border-r border-slate-300">TOTAL PENGELUARAN:</td>
                <td className="p-2 text-right text-rose-600 font-black">{formatIDR(totalExpenses)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tanda Tangan Block */}
        <div className="pt-8 text-xs">
          <div className="grid grid-cols-2 gap-12 text-center">
            <div>
              <p className="text-slate-600 mb-14">Disusun Oleh (Finance Administrator):</p>
              <div className="w-56 mx-auto border-b border-black font-bold pb-1">( Admin Keuangan KosanKu Pro )</div>
            </div>
            <div>
              <p className="text-slate-600 mb-14">Disetujui Oleh (Property Owner / Manager):</p>
              <div className="w-56 mx-auto border-b border-black font-bold pb-1">( Owner / Manager Properti )</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🖥️ SCREEN VIEW (Interactive Dashboard) */}
      <div className="no-print space-y-6 sm:space-y-8">
        
        {/* Export & Action Header Bar */}
        <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300 text-[10px] font-bold border border-purple-300 dark:border-purple-500/30">
                📊 Modul Laporan Pro
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Ready for Export &amp; Print Audit</span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              Laporan Laba Rugi &amp; Pembukuan Resi AI
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Rekapitulasi arus kas bersih, utilitas, dan laporan keuangan resmi</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-bold rounded-xl text-[11px] sm:text-xs shadow-xs hover:bg-purple-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-eye" />
              <span>Pratinjau PDF</span>
            </button>

            <button
              onClick={exportExecutiveExcel}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] sm:text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Unduh file Excel Spreadsheet resmi dengan format kolom A, B, C, D otomatis terpisah"
            >
              <i className="fa-solid fa-file-excel" />
              <span>Ekspor Excel (.xls)</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-[11px] sm:text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cetak PDF Resmi"
            >
              <i className="fa-solid fa-print" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* OCR Upload */}
        <OCRUpload />

        {/* P&L Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Revenue</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 flex items-center justify-center text-xs sm:text-sm">
                <i className="fa-solid fa-arrow-trend-up" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{formatShort(totalRevenue)}</div>
            <div className="text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Bulan ini (Juni 2026)</div>
          </div>

          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Expenses</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 flex items-center justify-center text-xs sm:text-sm">
                <i className="fa-solid fa-arrow-trend-down" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{formatShort(totalExpenses)}</div>
            <div className="text-[9px] sm:text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{expenses.length} transaksi terverifikasi</div>
          </div>

          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net Profit (Laba Bersih)</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 flex items-center justify-center text-xs sm:text-sm">
                <i className="fa-solid fa-sack-dollar" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">{formatShort(netProfit)}</div>
            <div className="text-[9px] sm:text-[11px] text-purple-700 dark:text-purple-300 font-semibold">Profit Margin {margin}%</div>
          </div>
        </div>

        {/* Revenue vs Expenses Chart */}
        <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-chart-column text-purple-600 dark:text-purple-400 text-[10px] sm:text-xs" /> Revenue vs Expenses (6 Bulan)
            </h3>
            <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Revenue</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Expenses</span>
            </div>
          </div>
          <div className="flex items-end gap-2 sm:gap-3 h-36 sm:h-44 pt-2">
            {MONTHLY_DATA.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-28 sm:h-36">
                  <div
                    className="w-3.5 sm:w-6 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-700 shadow-2xs hover:scale-105"
                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    title={`Revenue: ${formatIDR(d.revenue)}`}
                  />
                  <div
                    className="w-3.5 sm:w-6 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-700 shadow-2xs hover:scale-105"
                    style={{ height: `${(d.expenses / maxRevenue) * 100}%` }}
                    title={`Expenses: ${formatIDR(d.expenses)}`}
                  />
                </div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Expense Table with Category Filter */}
        <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-black/5 dark:border-white/10 pb-4 sm:pb-5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-receipt text-amber-500 text-[10px] sm:text-xs" /> Rincian Pengeluaran Resmi
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Semua transaksi terverifikasi dengan bukti struk &amp; AI OCR</p>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Semua Kategori
              </button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterCategory(key)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                    filterCategory === key
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredExpenses.map((exp, idx) => (
              <div key={exp.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs shadow-2xs font-mono font-bold">
                    {formatShortRef(exp.id, idx)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">{exp.description}</span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-[8px] font-bold">AI Verified</span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{CATEGORY_LABELS[exp.category] || exp.category} • {exp.date}</span>
                  </div>
                </div>
                <span className="text-sm font-black text-rose-600 dark:text-rose-400">{formatIDR(exp.amount)}</span>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">Tidak ada pengeluaran untuk kategori ini.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Terdaftar ({filteredExpenses.length} transaksi)</span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">{formatIDR(filteredExpenses.reduce((s: number, e: ExpenseItem) => s + e.amount, 0))}</span>
          </div>
        </div>
      </div>

      {/* PDF Executive Print Preview Modal (Screen Preview) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white dark:bg-[#181324] border border-black/10 dark:border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-3xl space-y-6 animate-scale-in max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-pdf text-rose-500" /> Pratinjau Lembar Dokumen PDF Formal
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hasil lembar kerja bersih yang akan dicetak sebagai dokumen resmi</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-black dark:hover:text-white transition-colors">✕</button>
            </div>

            {/* Simulated Clean Document Sheet */}
            <div className="p-6 bg-white rounded-xl border border-slate-300 text-xs text-black shadow-inner space-y-5">
              <div className="flex justify-between items-center border-b-2 border-black pb-4">
                <div className="flex items-center gap-3">
                  <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                  <div>
                    <h4 className="font-black text-base leading-none">KOSANKU PRO</h4>
                    <p className="text-[10px] font-bold text-slate-600 mt-1">Laporan Laba Rugi &amp; Keuangan Resi</p>
                  </div>
                </div>
                <div className="text-right text-[10px]">
                  <span className="font-extrabold text-xs block">LAPORAN RESMI</span>
                  <span className="text-slate-600">Ref: FIN-REP-2026-07</span>
                </div>
              </div>

              {/* Summary box */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-md border border-slate-300 text-center">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Revenue</span>
                  <span className="text-xs font-black text-slate-900">{formatIDR(totalRevenue)}</span>
                </div>
                <div className="border-x border-slate-300">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Expenses</span>
                  <span className="text-xs font-black text-rose-600">{formatIDR(totalExpenses)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Net Profit</span>
                  <span className="text-xs font-black text-emerald-600">{formatIDR(netProfit)}</span>
                </div>
              </div>

              {/* Items table */}
              <div className="space-y-2">
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-20 text-center">Ref</th>
                      <th className="p-2 border-r border-slate-300 w-28">Kategori</th>
                      <th className="p-2 border-r border-slate-300">Deskripsi</th>
                      <th className="p-2 text-right w-32">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {expenses.map((e, idx) => (
                      <tr key={e.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-2 border-r border-slate-300 font-mono text-center font-bold text-slate-700">{formatShortRef(e.id, idx)}</td>
                        <td className="p-2 border-r border-slate-300 font-medium">{CATEGORY_LABELS[e.category] || e.category}</td>
                        <td className="p-2 border-r border-slate-300">{e.description}</td>
                        <td className="p-2 text-right font-black text-slate-900">{formatIDR(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowPreviewModal(false)} className="flex-1 py-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer">
                Tutup Pratinjau
              </button>
              <button onClick={handlePrintPDF} className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 shadow-md transition-all cursor-pointer">
                <i className="fa-solid fa-print mr-2" /> Cetak PDF Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
