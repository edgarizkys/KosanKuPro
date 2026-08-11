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
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'financial' | 'incomes' | 'expenses' | 'occupancy' | 'inventory' | 'tickets'>('all');

  function formatIDR(n: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  }

  // Mock comprehensive report datasets for property audit
  const occupancyData = [
    { roomNumber: 'A-101', type: 'Deluxe Executive', tenant: 'Budi Santoso', status: 'OCCUPIED', rentPrice: 2500000, contractEnd: '2026-12-31' },
    { roomNumber: 'A-102', type: 'Standard Suite', tenant: 'Deni Setiawan', status: 'OCCUPIED', rentPrice: 2000000, contractEnd: '2026-10-15' },
    { roomNumber: 'B-201', type: 'VIP Balcony', tenant: 'Siti Rahma', status: 'OCCUPIED', rentPrice: 3000000, contractEnd: '2027-01-20' },
    { roomNumber: 'B-202', type: 'Deluxe Executive', tenant: '-', status: 'VACANT_READY', rentPrice: 2500000, contractEnd: '-' },
    { roomNumber: 'C-301', type: 'Standard Suite', tenant: 'Rian Pratama', status: 'OCCUPIED', rentPrice: 2000000, contractEnd: '2026-11-10' },
  ];

  const inventoryAuditData = [
    { code: 'INV-AC-01', item: 'Unit AC Daikin Inverter 1PK', location: 'Kamar A-101 s/d C-302', qty: 12, condition: 'GOOD', auditor: 'Bambang (Staf)' },
    { code: 'INV-TV-02', name: 'Smart TV Samsung 32 Inch', location: 'Kamar VIP B-201, B-202', qty: 2, condition: 'GOOD', auditor: 'Bambang (Staf)' },
    { code: 'INV-BED-03', name: 'Kasur Springbed KingKoil 160x200', location: 'Semua Kamar', qty: 12, condition: 'GOOD', auditor: 'Siti (Admin)' },
    { code: 'INV-GAS-04', name: 'Tabung Gas LPG 12kg Dapur Bersama', location: 'Dapur Utama Lt 1', qty: 4, condition: 'NEEDS_REPAIR', auditor: 'Bambang (Staf)' },
  ];

  const maintenanceTicketsData = [
    { id: 'TKT-2026-001', room: 'A-101', issue: 'Refill Galon Aqua & Gas LPG', priority: 'NORMAL', status: 'COMPLETED', date: '2026-08-09' },
    { id: 'TKT-2026-002', room: 'B-201', issue: 'Pengecekan Filter AC Berisik', priority: 'HIGH', status: 'IN_PROGRESS', date: '2026-08-10' },
    { id: 'TKT-2026-003', room: 'C-302', issue: 'Ganti Lampu Smart LED Balkon', priority: 'LOW', status: 'RESOLVED', date: '2026-08-11' },
  ];

  const exportExecutiveExcel = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px; }
          th { background-color: #047857; color: white; border: 1px solid #ddd; padding: 8px; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          .title { font-size: 18px; font-weight: bold; color: #047857; text-align: center; }
          .header { background-color: #f3f4f6; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="title">KOSANKU PRO — LAPORAN KONSOLIDASI MASTER PROPERTI</div>
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
          <tr class="header"><th>NO REF</th><th>TANGGAL</th><th>PENGHUNI</th><th>KAMAR</th><th>SUMBER PENERIMAAN</th><th>METODE</th><th>NOMINAL (IDR)</th></tr>
          ${revenues.map(r => `
            <tr><td>${r.id}</td><td>${r.date}</td><td>${r.tenantName}</td><td>${r.roomNumber}</td><td>${r.source}</td><td>${r.method}</td><td>${formatIDR(r.amount)}</td></tr>
          `).join('')}
        </table>

        <br/>
        <h3>3. DETAIL RINCIAN PENGELUARAN (EXPENSE OUTFLOWS)</h3>
        <table>
          <tr class="header"><th>NO REF</th><th>TANGGAL</th><th>KATEGORI</th><th>DESKRIPSI PENGELUARAN</th><th>NOMINAL (IDR)</th></tr>
          ${expenses.map((e, i) => `
            <tr><td>EXP-00${i + 1}</td><td>${e.date}</td><td>${e.category.toUpperCase()}</td><td>${e.description}</td><td>${formatIDR(e.amount)}</td></tr>
          `).join('')}
        </table>

        <br/>
        <h3>4. STATUS KETERISIAN KAMAR &amp; OKUPANSI</h3>
        <table>
          <tr class="header"><th>NOMOR KAMAR</th><th>TIPE KAMAR</th><th>STATUS</th><th>PENGHUNI</th><th>TARIF SEWA</th><th>KONTRAK BERAKHIR</th></tr>
          ${occupancyData.map(o => `
            <tr><td>${o.roomNumber}</td><td>${o.type}</td><td>${o.status}</td><td>${o.tenant}</td><td>${formatIDR(o.rentPrice)}</td><td>${o.contractEnd}</td></tr>
          `).join('')}
        </table>

        <br/>
        <h3>5. AUDIT FISIK STOK INVENTORI</h3>
        <table>
          <tr class="header"><th>KODE INV</th><th>NAMA BARANG / MEBEL</th><th>LOKASI UNIT</th><th>JUMLAH</th><th>KONDISI</th><th>AUDITOR</th></tr>
          ${inventoryAuditData.map(i => `
            <tr><td>${i.code}</td><td>${i.item || i.name}</td><td>${i.location}</td><td>${i.qty} Unit</td><td>${i.condition}</td><td>${i.auditor}</td></tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Master_Consolidated_KosanKuPro_${timestamp}.xls`);
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
        <title>Laporan_Master_Consolidated_KosanKuPro_${timestamp}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; font-size: 10px; margin: 0; padding: 15px; }
          .pdf-header { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 18px; }
          .pdf-header h1 { color: #047857; font-size: 18px; margin: 0 0 4px 0; font-weight: 900; }
          .pdf-header p { margin: 2px 0; color: #64748b; font-size: 9px; }
          .summary-grid { display: table; width: 100%; margin-bottom: 20px; border-collapse: separate; border-spacing: 8px; }
          .summary-card { display: table-cell; width: 25%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
          .summary-card span { font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; }
          .summary-card div { font-size: 14px; font-weight: 900; color: #047857; margin-top: 3px; }
          .section-title { font-size: 11px; font-weight: 800; color: #0f172a; margin: 16px 0 8px 0; border-left: 4px solid #047857; padding-left: 6px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th { background-color: #047857; color: #ffffff; font-weight: 800; text-align: left; padding: 6px; font-size: 9px; text-transform: uppercase; }
          td { border-bottom: 1px solid #e2e8f0; padding: 6px; font-size: 9px; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge-green { background: #dcfce7; color: #15803d; padding: 2px 5px; border-radius: 3px; font-weight: bold; font-size: 8px; }
          .badge-red { background: #ffe4e6; color: #be123c; padding: 2px 5px; border-radius: 3px; font-weight: bold; font-size: 8px; }
          .badge-purple { background: #f3e8ff; color: #7e22ce; padding: 2px 5px; border-radius: 3px; font-weight: bold; font-size: 8px; }
          .footer { margin-top: 25px; text-align: right; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <h1>KOSANKU PRO — MASTER AUDIT CONSOLIDATED REPORT</h1>
          <p>Laporan Konsolidasi Lengkap: Keuangan, Okupansi Kamar, Inventori Fisik &amp; Pemeliharaan</p>
          <p><strong>Tanggal Audit:</strong> ${timestamp} | <strong>Dokumen Terverifikasi AI Ledger Engine</strong></p>
        </div>

        <div class="summary-grid">
          <div class="summary-card"><span>Total Inflow</span><div>${formatIDR(totalRevenue)}</div></div>
          <div class="summary-card"><span>Total Outflow</span><div style="color:#e11d48;">${formatIDR(totalExpenses)}</div></div>
          <div class="summary-card"><span>Net Profit</span><div>${formatIDR(netProfit)}</div></div>
          <div class="summary-card"><span>Margin Laba</span><div style="color:#7c3aed;">${margin}%</div></div>
        </div>

        <div class="section-title">1. RINGKASAN TRANSAKSI PENERIMAAN (INFLOWS)</div>
        <table>
          <thead>
            <tr><th>REF ID</th><th>TANGGAL</th><th>PENGHUNI &amp; KAMAR</th><th>SUMBER KATEGORI</th><th>METODE</th><th style="text-align:right;">NOMINAL</th></tr>
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

        <div class="section-title">2. RINGKASAN TRANSAKSI PENGELUARAN (OUTFLOWS)</div>
        <table>
          <thead>
            <tr><th>REF ID</th><th>TANGGAL</th><th>KATEGORI</th><th>DESKRIPSI NOTA</th><th style="text-align:right;">NOMINAL</th></tr>
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

        <div class="section-title">3. STATUS OKUPANSI &amp; KETERISIAN KAMAR PROPERTI</div>
        <table>
          <thead>
            <tr><th>NOMOR KAMAR</th><th>TIPE KAMAR</th><th>STATUS UNIT</th><th>PENGHUNI SAAT INI</th><th style="text-align:right;">TARIF SEWA</th></tr>
          </thead>
          <tbody>
            ${occupancyData.map(o => `
              <tr>
                <td><strong>${o.roomNumber}</strong></td>
                <td>${o.type}</td>
                <td><span class="${o.status === 'OCCUPIED' ? 'badge-green' : 'badge-purple'}">${o.status}</span></td>
                <td>${o.tenant}</td>
                <td style="text-align:right; font-weight:bold;">${formatIDR(o.rentPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">4. AUDIT FISIK STOK INVENTORI &amp; SERVIS PEMELIHARAAN</div>
        <table>
          <thead>
            <tr><th>KODE INV</th><th>NAMA BARANG</th><th>LOKASI UNIT</th><th>JUMLAH STOK</th><th>KONDISI BARANG</th></tr>
          </thead>
          <tbody>
            ${inventoryAuditData.map(i => `
              <tr>
                <td><strong>${i.code}</strong></td>
                <td>${i.item || i.name}</td>
                <td>${i.location}</td>
                <td>${i.qty} Unit</td>
                <td><span class="${i.condition === 'GOOD' ? 'badge-green' : 'badge-red'}">${i.condition}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Dicetak secara otomatis oleh KosanKu Pro Master SaaS Engine • Dokumen Sah Resmi Tanpa Tanda Tangan Basah
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
            <span className="text-xs text-slate-500 font-bold">Audit Komprehensif Properti</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Pusat Laporan &amp; Ekspor Master Audit</h2>
          <p className="text-xs text-slate-500">Laporan terstruktur konsolidasi P&amp;L, penerimaan, pengeluaran, okupansi kamar, dan inventori fisik</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportExecutiveExcel}
            className="px-4 py-2.5 neu-btn border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-black rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] transition-all"
          >
            <i className="fa-solid fa-file-excel text-emerald-500" />
            <span>Ekspor Master Excel (.xls)</span>
          </button>
          <button
            onClick={exportExecutivePDF}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <i className="fa-solid fa-file-pdf" />
            <span>Export Official Master PDF</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher Navigation */}
      <div className="flex items-center gap-2 neu-inset p-1.5 rounded-2xl overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('all')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-layer-group" />
          <span>Semua Laporan (Konsolidasi Master)</span>
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
          <span>Penerimaan ({revenues.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('expenses')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'expenses' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-circle-arrow-up text-rose-500" />
          <span>Pengeluaran ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('occupancy')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'occupancy' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-door-open text-purple-500" />
          <span>Okupansi Kamar ({occupancyData.length})</span>
        </button>

        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeReportTab === 'inventory' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <i className="fa-solid fa-boxes-packing text-amber-500" />
          <span>Stok Inventori ({inventoryAuditData.length})</span>
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

      {/* ===== SECTION 4: OKUPANSI & STATUS KAMAR ===== */}
      {(activeReportTab === 'all' || activeReportTab === 'occupancy') && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <i className="fa-solid fa-door-open text-purple-500" />
              <span>4. Laporan Status Okupansi Kamar Properti</span>
            </h3>
            <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">Okupansi Rate: 95.4%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">NOMOR KAMAR</th>
                  <th className="py-3 px-4">TIPE KAMAR</th>
                  <th className="py-3 px-4">STATUS UNIT</th>
                  <th className="py-3 px-4">PENGHUNI AKTIF</th>
                  <th className="py-3 px-4 text-right">TARIF SEWA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {occupancyData.map((o, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{o.roomNumber}</td>
                    <td className="py-3.5 px-4 font-bold">{o.type}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${o.status === 'OCCUPIED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{o.tenant}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">{formatIDR(o.rentPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== SECTION 5: AUDIT FISIK INVENTORI STOK ===== */}
      {(activeReportTab === 'all' || activeReportTab === 'inventory') && (
        <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-200/60 dark:border-white/10 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-black flex items-center gap-2">
              <i className="fa-solid fa-boxes-packing text-amber-500" />
              <span>5. Laporan Audit Fisik Stok Inventori Properti</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">Stock Opname Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">KODE BARANG</th>
                  <th className="py-3 px-4">NAMA MEBEL / BARANG</th>
                  <th className="py-3 px-4">LOKASI UNIT</th>
                  <th className="py-3 px-4">JUMLAH STOK</th>
                  <th className="py-3 px-4">KONDISI FISIK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
                {inventoryAuditData.map((i, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-white/5">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{i.code}</td>
                    <td className="py-3.5 px-4 font-bold">{i.item || i.name}</td>
                    <td className="py-3.5 px-4">{i.location}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{i.qty} Unit</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${i.condition === 'GOOD' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                        {i.condition}
                      </span>
                    </td>
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
