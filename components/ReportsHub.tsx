'use client';

import { useState } from 'react';

interface ReportsHubProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  expenses: any[];
  revenues: any[];
}

export default function ReportsHub({
  totalRevenue,
  totalExpenses,
  netProfit,
  margin,
  expenses,
  revenues,
}: ReportsHubProps) {
  const [activeReportTab, setActiveReportTab] = useState<'financial' | 'incomes' | 'expenses' | 'inventory'>('financial');

  function formatIDR(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  }

  const exportExecutiveExcel = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>
      <body>
        <h2>LAPORAN KEUANGAN & AUDIT KOSANKU PRO (${timestamp})</h2>
        <p>Total Revenue: ${formatIDR(totalRevenue)} | Total Pengeluaran: ${formatIDR(totalExpenses)} | Net Profit: ${formatIDR(netProfit)}</p>
      </body>
      </html>
    `;
    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Eksekutif_KosanKuPro_${timestamp}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-900 dark:text-white">
      {/* Top Controls Banner */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              📊 Master Executive Reports Hub
            </span>
            <span className="text-xs text-slate-500">Pusat Laporan Konsolidasi &amp; Ekspor</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Laporan Lengkap Properti &amp; Keuangan</h2>
          <p className="text-xs text-slate-500">Satu pintu untuk laporan P&L, rincian pengeluaran, penerimaan, dan inventori SO</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportExecutiveExcel}
            className="px-4 py-2.5 neu-btn border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
          >
            <i className="fa-solid fa-file-excel" />
            <span>Ekspor Excel (.xls)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <i className="fa-solid fa-print" />
            <span>Cetak Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Report Category Switcher Tabs */}
      <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('financial')}
          className={`flex-1 min-w-[140px] py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeReportTab === 'financial' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-chart-pie" />
          <span>Laporan P&amp;L Eksekutif</span>
        </button>

        <button
          onClick={() => setActiveReportTab('incomes')}
          className={`flex-1 min-w-[140px] py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeReportTab === 'incomes' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-circle-arrow-down" />
          <span>Rincian Penerimaan ({revenues.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`flex-1 min-w-[140px] py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeReportTab === 'expenses' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-circle-arrow-up" />
          <span>Rincian Pengeluaran ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`flex-1 min-w-[140px] py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeReportTab === 'inventory' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-boxes-packing" />
          <span>Audit Stok Inventori</span>
        </button>
      </div>

      {/* Tab 1: P&L Summary */}
      {activeReportTab === 'financial' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
          <div className="neu-card p-6 rounded-3xl space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Turnover Inflow</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatIDR(totalRevenue)}</p>
            <p className="text-[10px] text-slate-400">Termasuk Sewa Base, Deposit &amp; Add-On</p>
          </div>
          <div className="neu-card p-6 rounded-3xl space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Operasional Outflow</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatIDR(totalExpenses)}</p>
            <p className="text-[10px] text-slate-400">Listrik, Air, Wi-Fi &amp; Maintenance</p>
          </div>
          <div className="neu-card p-6 rounded-3xl space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Laba Bersih (Net Margin)</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatIDR(netProfit)}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Margin Laba: {margin}%</p>
          </div>
        </div>
      )}

      {/* Tab 2: Incomes Breakdown */}
      {activeReportTab === 'incomes' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-4 animate-fade-in">
          <h3 className="text-base font-black flex items-center gap-2">
            <i className="fa-solid fa-[#047857] fa-sack-dollar text-[#047857]" /> Laporan Transaksi Penerimaan Masuk
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">REF &amp; TANGGAL</th>
                  <th className="py-3 px-4">PENGHUNI &amp; KAMAR</th>
                  <th className="py-3 px-4">SUMBER PENERIMAAN</th>
                  <th className="py-3 px-4">METODE PEMBAYARAN</th>
                  <th className="py-3 px-4 text-right">NOMINAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {revenues.map((rev) => (
                  <tr key={rev.id}>
                    <td className="py-3.5 px-4 font-mono">{rev.id}<span className="block text-[10px] text-slate-400">{rev.date}</span></td>
                    <td className="py-3.5 px-4 font-bold">{rev.tenantName}<span className="block text-[10px] text-purple-500">Kamar {rev.roomNumber}</span></td>
                    <td className="py-3.5 px-4">{rev.source}</td>
                    <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-bold">{rev.method}</span></td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">+{formatIDR(rev.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expenses Breakdown */}
      {activeReportTab === 'expenses' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-4 animate-fade-in">
          <h3 className="text-base font-black flex items-center gap-2">
            <i className="fa-solid fa-receipt text-rose-500" /> Laporan Transaksi Pengeluaran Terverifikasi
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">NO. REF</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-4">DESKRIPSI PENGELUARAN</th>
                  <th className="py-3 px-4">TANGGAL</th>
                  <th className="py-3 px-4 text-right">NOMINAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {expenses.map((exp, idx) => (
                  <tr key={exp.id || idx}>
                    <td className="py-3.5 px-4 font-mono font-bold">EXP-00{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold uppercase text-purple-600 dark:text-purple-400">{exp.category}</td>
                    <td className="py-3.5 px-4">{exp.description}</td>
                    <td className="py-3.5 px-4">{exp.date.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 font-mono">-{formatIDR(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Inventory Audit */}
      {activeReportTab === 'inventory' && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-4 animate-fade-in">
          <h3 className="text-base font-black flex items-center gap-2">
            <i className="fa-solid fa-boxes-packing text-amber-500" /> Laporan Audit Fisik Stok Inventori Kosan
          </h3>
          <div className="p-4 neu-inset rounded-2xl text-xs space-y-1">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">Status Audit Fisik Terakhir:</span>
            <p className="text-slate-600 dark:text-slate-300">Diaudit oleh Staf Operasional pada 11 Agustus 2026. Seluruh barang inventori (Sprei, Galon Aqua, LPG, AC Remote) verified 100% klop.</p>
          </div>
        </div>
      )}
    </div>
  );
}
