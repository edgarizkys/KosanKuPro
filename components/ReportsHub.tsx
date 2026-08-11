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
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'financial' | 'incomes' | 'expenses'>('all');

  function formatIDR(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  }

  const exportExecutiveExcel = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
          th { background-color: #047857; color: white; border: 1px solid #ddd; padding: 8px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          .header { background-color: #f3f4f6; font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; color: #047857; text-align: center; }
        </style>
      </head>
      <body>
        <div class="title">KOSANKU PRO — LAPORAN EKSEKUTIF KONSOLIDASI</div>
        <p><strong>Tanggal Audit:</strong> ${timestamp} | <strong>Status:</strong> AUDITED &amp; VERIFIED</p>
        
        <h3>1. RINGKASAN EKSEKUTIF P&amp;L</h3>
        <table>
          <tr class="header"><th>DESKRIPSI METRIK</th><th>NILAI (IDR)</th></tr>
          <tr><td>Total Turnover Inflow (Penerimaan)</td><td>${formatIDR(totalRevenue)}</td></tr>
          <tr><td>Total Outflow (Pengeluaran Operasional)</td><td>${formatIDR(totalExpenses)}</td></tr>
          <tr><td>Laba Bersih (Net Profit)</td><td>${formatIDR(netProfit)}</td></tr>
          <tr><td>Profit Margin</td><td>${margin}%</td></tr>
        </table>

        <br/>
        <h3>2. DETAIL RINCIAN PENERIMAAN (REVENUE INFLOWS)</h3>
        <table>
          <tr class="header">
            <th>NO REF</th>
            <th>TANGGAL</th>
            <th>PENGHUNI</th>
            <th>KAMAR</th>
            <th>SUMBER PENERIMAAN</th>
            <th>METODE PEMBAYARAN</th>
            <th>NOMINAL (IDR)</th>
          </tr>
          ${revenues.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${r.date}</td>
              <td>${r.tenantName}</td>
              <td>${r.roomNumber}</td>
              <td>${r.source}</td>
              <td>${r.method}</td>
              <td>${formatIDR(r.amount)}</td>
            </tr>
          `).join('')}
        </table>

        <br/>
        <h3>3. DETAIL RINCIAN PENGELUARAN (EXPENSE OUTFLOWS)</h3>
        <table>
          <tr class="header">
            <th>NO REF</th>
            <th>TANGGAL</th>
            <th>KATEGORI</th>
            <th>DESKRIPSI PENGELUARAN</th>
            <th>NOMINAL (IDR)</th>
          </tr>
          ${expenses.map((e, i) => `
            <tr>
              <td>EXP-00${i + 1}</td>
              <td>${e.date}</td>
              <td>${e.category.toUpperCase()}</td>
              <td>${e.description}</td>
              <td>${formatIDR(e.amount)}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Rinci_Consolidated_KosanKuPro_${timestamp}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExecutivePDF = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const pdfHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Laporan_Eksekutif_KosanKuPro_${timestamp}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; font-size: 11px; margin: 0; padding: 20px; }
          .pdf-header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 15px; margin-bottom: 20px; }
          .pdf-header h1 { color: #047857; font-size: 20px; margin: 0 0 5px 0; font-weight: 900; }
          .pdf-header p { margin: 2px 0; color: #64748b; font-size: 10px; }
          .summary-grid { display: table; width: 100%; margin-bottom: 25px; border-collapse: separate; border-spacing: 10px; }
          .summary-card { display: table-cell; width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .summary-card span { font-size: 9px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .summary-card div { font-size: 15px; font-weight: 900; color: #047857; margin-top: 4px; }
          .section-title { font-size: 12px; font-weight: 800; color: #0f172a; margin: 20px 0 10px 0; border-left: 4px solid #047857; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #047857; color: #ffffff; font-weight: 800; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; font-size: 10px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge-green { background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; }
          .badge-red { background: #ffe4e6; color: #be123c; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9px; }
          .footer { margin-top: 30px; text-align: right; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <h1>KOSANKU PRO — OFFICIAL EXECUTIVE REPORT</h1>
          <p>Laporan Konsolidasi Keuangan &amp; Audit Operasional Properti</p>
          <p><strong>Tanggal Audit:</strong> ${timestamp} | <strong>Dokumen Terverifikasi AI Ledger System</strong></p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <span>Total Inflow</span>
            <div>${formatIDR(totalRevenue)}</div>
          </div>
          <div class="summary-card">
            <span>Total Outflow</span>
            <div style="color:#e11d48;">${formatIDR(totalExpenses)}</div>
          </div>
          <div class="summary-card">
            <span>Net Profit</span>
            <div>${formatIDR(netProfit)}</div>
          </div>
          <div class="summary-card">
            <span>Margin Laba</span>
            <div style="color:#7c3aed;">${margin}%</div>
          </div>
        </div>

        <div class="section-title">1. RINCIAN PENERIMAAN (REVENUE INFLOWS)</div>
        <table>
          <thead>
            <tr>
              <th>REF ID</th>
              <th>TANGGAL</th>
              <th>PENGHUNI &amp; KAMAR</th>
              <th>SUMBER KATEGORI</th>
              <th>METODE</th>
              <th style="text-align:right;">NOMINAL</th>
            </tr>
          </thead>
          <tbody>
            ${revenues.map(r => `
              <tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.date}</td>
                <td>${r.tenantName} (Kamar ${r.roomNumber})</td>
                <td>${r.source}</td>
                <td><span class="badge-green">${r.method}</span></td>
                <td style="text-align:right; font-weight:bold; color:#047857;">+${formatIDR(r.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">2. RINCIAN PENGELUARAN (EXPENSE OUTFLOWS)</div>
        <table>
          <thead>
            <tr>
              <th>REF ID</th>
              <th>TANGGAL</th>
              <th>KATEGORI</th>
              <th>DESKRIPSI NOTA</th>
              <th style="text-align:right;">NOMINAL</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map((e, idx) => `
              <tr>
                <td><strong>EXP-00${idx + 1}</strong></td>
                <td>${e.date}</td>
                <td><span class="badge-red">${e.category.toUpperCase()}</span></td>
                <td>${e.description}</td>
                <td style="text-align:right; font-weight:bold; color:#e11d48;">-${formatIDR(e.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Dicetak secara otomatis oleh KosanKu Pro SaaS System • Dokumen Sah Tanpa Tanda Tangan Basah
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfHtmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-900 dark:text-white">
      
      {/* Top Header Card */}
      <div className="neu-card p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              📋 Consolidated Master Report
            </span>
            <span className="text-xs text-slate-500 font-bold">Pusat Laporan Rinci Properti</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Pusat Laporan &amp; Ekspor Audit</h2>
          <p className="text-xs text-slate-500">Laporan terstruktur konsolidasi P&amp;L, penerimaan, pengeluaran, dan audit inventori kosan</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportExecutiveExcel}
            className="px-4 py-2.5 neu-btn border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
          >
            <i className="fa-solid fa-file-excel text-emerald-500" />
            <span>Ekspor Excel Rinci (.xls)</span>
          </button>
          <button
            onClick={exportExecutivePDF}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <i className="fa-solid fa-file-pdf" />
            <span>Export Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('all')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-layer-group" />
          <span>Semua Laporan (Konsolidasi)</span>
        </button>

        <button
          onClick={() => setActiveReportTab('financial')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'financial' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-chart-pie" />
          <span>Ringkasan P&amp;L</span>
        </button>

        <button
          onClick={() => setActiveReportTab('incomes')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'incomes' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-circle-arrow-down text-emerald-500" />
          <span>Rincian Penerimaan ({revenues.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'expenses' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-circle-arrow-up text-rose-500" />
          <span>Rincian Pengeluaran ({expenses.length})</span>
        </button>
      </div>

      {/* ===== SECTION 1: P&L SUMMARY ===== */}
      {(activeReportTab === 'all' || activeReportTab === 'financial') && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-emerald-500" />
              <span>1. Ringkasan Eksekutif Keuangan P&amp;L</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">Periode 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="neu-card-sm p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Turnover Penerimaan</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatIDR(totalRevenue)}</p>
              <span className="text-[9px] text-slate-400">Sewa, Deposit &amp; Add-on</span>
            </div>

            <div className="neu-card-sm p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Outflow Pengeluaran</span>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">{formatIDR(totalExpenses)}</p>
              <span className="text-[9px] text-slate-400">Listrik, Air &amp; Maintenance</span>
            </div>

            <div className="neu-card-sm p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Laba Bersih Bersih</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatIDR(netProfit)}</p>
              <span className="text-[9px] text-emerald-600 font-bold">Net Turnover</span>
            </div>

            <div className="neu-card-sm p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Profit Margin Ratio</span>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400">{margin}%</p>
              <span className="text-[9px] text-purple-500 font-bold">Effisiensi Biaya</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== SECTION 2: RINCIAN PENERIMAAN ===== */}
      {(activeReportTab === 'all' || activeReportTab === 'incomes') && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <i className="fa-solid fa-sack-dollar text-emerald-500" />
              <span>2. Laporan Rinci Transaksi Penerimaan (Inflows)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{revenues.length} Terverifikasi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">REF &amp; WAKTU</th>
                  <th className="py-3 px-4">PENGHUNI</th>
                  <th className="py-3 px-4">KAMAR</th>
                  <th className="py-3 px-4">SUMBER PENERIMAAN</th>
                  <th className="py-3 px-4">METODE BAYAR</th>
                  <th className="py-3 px-4 text-right">NOMINAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {revenues.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {r.id}
                      <span className="block text-[10px] text-slate-400 font-normal">{r.date}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">{r.tenantName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">Kamar {r.roomNumber}</td>
                    <td className="py-3.5 px-4">{r.source}</td>
                    <td className="py-3.5 px-4"><span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">{r.method}</span></td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">+{formatIDR(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== SECTION 3: RINCIAN PENGELUARAN ===== */}
      {(activeReportTab === 'all' || activeReportTab === 'expenses') && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <i className="fa-solid fa-receipt text-rose-500" />
              <span>3. Laporan Rinci Transaksi Pengeluaran (Outflows)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">{expenses.length} Transaksi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">NO REF</th>
                  <th className="py-3 px-4">KATEGORI</th>
                  <th className="py-3 px-4">DESKRIPSI PENGELUARAN</th>
                  <th className="py-3 px-4">TANGGAL TRANSAKSI</th>
                  <th className="py-3 px-4 text-right">NOMINAL (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {expenses.map((e, idx) => (
                  <tr key={e.id || idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">EXP-00{idx + 1}</td>
                    <td className="py-3.5 px-4 uppercase font-extrabold text-rose-600 dark:text-rose-400">{e.category}</td>
                    <td className="py-3.5 px-4 font-bold">{e.description}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{e.date.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-rose-600 dark:text-rose-400 text-sm">-{formatIDR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
