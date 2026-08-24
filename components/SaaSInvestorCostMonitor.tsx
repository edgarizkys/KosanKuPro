'use client';

import { useState, useEffect } from 'react';

export type ViewMode = 'INVESTOR_PORTAL' | 'DEVELOPER_INTERNAL';

export interface AnnualFixedItem {
  id: string;
  name: string;
  provider: string;
  realCogsAnnual: number;
  billedInvestorAnnual: number;
  netMarginAnnual: number;
  notes: string;
}

// 📌 CLEAN ENTERPRISE INFRASTRUCTURE BREAKDOWN (TOTAL PAS RP 5.250.000 / TAHUN)
const ANNUAL_FIXED_ITEMS: AnnualFixedItem[] = [
  {
    id: 'FIX-SRV-01',
    name: '1. Enterprise Cloud VPS Server & Multi-Tenant Database Storage',
    provider: 'High-Availability Cloud VPS Node (4 vCPU, 8GB RAM, 160GB SSD)',
    realCogsAnnual: 1440000,
    billedInvestorAnnual: 4500000,
    netMarginAnnual: 3060000,
    notes: 'Server Komputasi Node.js 24/7, Storage Database PostgreSQL Terisolasi, Automated Backups & Microservices Engine (1 Tahun)',
  },
  {
    id: 'FIX-DOM-02',
    name: '2. Domain Utama, Wildcard SSL Encryption & Managed Security',
    provider: 'Cloudflare Enterprise & Namecheap Security Suite (.cloud)',
    realCogsAnnual: 215000,
    billedInvestorAnnual: 750000,
    netMarginAnnual: 535000,
    notes: 'Lisensi Domain kosankupro.cloud, Enkripsi Finansial 256-Bit SSL, Cloudflare DDoS Protection Shield & Managed Security (1 Tahun)',
  },
];

export default function SaaSInvestorCostMonitor() {
  const [viewMode, setViewMode] = useState<ViewMode>('INVESTOR_PORTAL');
  const [showDevPinModal, setShowDevPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [annualItems] = useState<AnnualFixedItem[]>(ANNUAL_FIXED_ITEMS);

  // 🎯 DYNAMIC PER-TRANSACTION METERED COUNTERS (REAL-TIME USAGE: STARTS AT 0)
  const [waCount, setWaCount] = useState<number>(0);        // Total WA Messages Sent (Default 0)
  const [aiTokens, setAiTokens] = useState<number>(0);       // Total AI LLM Tokens Used (Default 0)
  const [pgTxCount, setPgTxCount] = useState<number>(0);     // Total Payment Gateway Settlements (Default 0)

  // 🏷️ CUSTOMIZABLE MARKUP RATES (MODAL VS TAGIHAN INVESTOR)
  const [waCogsRate, setWaCogsRate] = useState<number>(390);        // Modal Twilio per WA
  const [waBilledRate, setWaBilledRate] = useState<number>(850);    // Tagihan Investor per WA

  const [aiCogsRate1k, setAiCogsRate1k] = useState<number>(120);    // Modal AI per 1k Tokens
  const [aiBilledRate1k, setAiBilledRate1k] = useState<number>(350);// Tagihan Investor per 1k Tokens

  const [pgCogsRate, setPgCogsRate] = useState<number>(10500);      // Modal PG QRIS Fee (0.7% x 1.5jt)
  const [pgBilledRate, setPgBilledRate] = useState<number>(15000);  // Tagihan Investor per PG Tx

  // Fetch Live Meter Counts on Mount
  useEffect(() => {
    fetch('/api/saas-cost-monitor/live-meter')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setWaCount(res.data.waMessages || 0);
          setAiTokens(res.data.aiTokens || 0);
          setPgTxCount(res.data.pgSettlements || 0);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic Variable Calculations
  const waRealCogs = waCount * waCogsRate;
  const waBilled = waCount * waBilledRate;
  const waMargin = waBilled - waRealCogs;

  const aiRealCogs = Math.round((aiTokens / 1000) * aiCogsRate1k);
  const aiBilled = Math.round((aiTokens / 1000) * aiBilledRate1k);
  const aiMargin = aiBilled - aiRealCogs;

  const pgRealCogs = pgTxCount * pgCogsRate;
  const pgBilled = pgTxCount * pgBilledRate;
  const pgMargin = pgBilled - pgRealCogs;

  // Totals Annual Fixed
  const totalAnnualCogs = annualItems.reduce((acc, i) => acc + i.realCogsAnnual, 0);
  const totalAnnualBilled = annualItems.reduce((acc, i) => acc + i.billedInvestorAnnual, 0);
  const totalAnnualMargin = totalAnnualBilled - totalAnnualCogs;

  // Totals Monthly Dynamic Variable
  const totalMonthlyCogs = waRealCogs + aiRealCogs + pgRealCogs;
  const totalMonthlyBilled = waBilled + aiBilled + pgBilled;
  const totalMonthlyMargin = totalMonthlyBilled - totalMonthlyCogs;

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleOpenPdfTab = () => {
    const query = new URLSearchParams({
      mode: viewMode,
      wa: waCount.toString(),
      ai: aiTokens.toString(),
      pg: pgTxCount.toString(),
      waCogs: waCogsRate.toString(),
      waBilled: waBilledRate.toString(),
      aiCogs: aiCogsRate1k.toString(),
      aiBilled: aiBilledRate1k.toString(),
      pgCogs: pgCogsRate.toString(),
      pgBilled: pgBilledRate.toString(),
    }).toString();
    window.open(`/portal/pdf-statement?${query}`, '_blank');
  };

  const handleVerifyDevPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026' || pinInput === 'demo123' || pinInput === 'admin') {
      setViewMode('DEVELOPER_INTERNAL');
      setShowDevPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'ID Item / Layanan',
      'Komponen Operasional',
      'Volume Transaksi Real-Time',
      'Tagihan Investor (IDR)',
    ];

    const annualRows = annualItems.map((item) => [
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      'TAHUNAN (FIXED CONTRACT)',
      item.billedInvestorAnnual,
    ]);

    const variableRows = [
      ['VAR-WA-01', 'WhatsApp Twilio Official Gateway', `${waCount} Pesan WA Terkirim`, waBilled],
      ['VAR-AI-02', 'Smart Kosan Proper AI Agent Engine', `${aiTokens.toLocaleString()} Tokens Terpakai`, aiBilled],
      ['VAR-PG-03', 'Payment Gateway QRIS/VA Settlement', `${pgTxCount} Transaksi Settled`, pgBilled],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [
        `LAPORAN RESMI REKONSILIASI BIAYA SAAS KOSANKU PRO`,
        `Tanggal Rekapitulasi: ${new Date().toLocaleDateString('id-ID')}`,
        'Ditujukan Kepada: Investor',
        '',
        headers.join(','),
        ...annualRows.map((e) => e.join(',')),
        ...variableRows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KosanKuPro_Investor_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-900 dark:text-white">
      
      {/* 🧭 OFFICIAL INVESTOR PORTAL HEADER BANNER */}
      <div className="neu-card rounded-3xl p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-[#0e1628] to-[#131d35] border border-slate-700/60 shadow-2xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
              <i className="fa-solid fa-file-invoice-dollar" />
              <span>OFFICIAL ENTERPRISE SAAS STATEMENT • KOSANKU PRO (PT. BERKAH JASA ABADI)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{viewMode === 'INVESTOR_PORTAL' ? '💼 Portal Laporan Resmi Sewa Infrastructure SaaS' : '🔒 Internal Developer Portal (Secret Access)'}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl font-medium leading-relaxed">
              {viewMode === 'INVESTOR_PORTAL'
                ? 'Laporan resmi rekonsiliasi lisensi server &amp; operasional KosanKu Pro. Kontrak TAHUNAN Server VPS &amp; Security Shield serta Tagihan Dinamis BULANAN per transaksi.'
                : 'Laporan rahasia Internal Developer: Menampilkan modal murni provider, alokasi profit bersih murni Anda, &amp; pengaturan tarif API.'}
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            {/* View Mode Switcher / Developer Lock */}
            {viewMode === 'DEVELOPER_INTERNAL' ? (
              <button
                onClick={() => setViewMode('INVESTOR_PORTAL')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <i className="fa-solid fa-eye" />
                <span>Kembali ke Investor Portal</span>
              </button>
            ) : (
              <button
                onClick={() => setShowDevPinModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-slate-700/50 transition-all cursor-pointer"
                title="Buka Akses Rahasia Developer"
              >
                <i className="fa-solid fa-lock text-emerald-400" />
                <span>Secret Dev</span>
              </button>
            )}

            {/* Export Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                title="Export Data ke Excel (.csv)"
              >
                <i className="fa-solid fa-file-excel" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>

              <button
                onClick={handleOpenPdfTab}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-md cursor-pointer"
                title="Buka Dokumen PDF Resmi di Tab Baru"
              >
                <i className="fa-solid fa-file-pdf text-rose-400" />
                <span className="hidden sm:inline">Export PDF (Tab Baru)</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 📊 EXECUTIVE METRIC CARDS SUMMARY (CLEAN INVESTOR VIEW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Annual Fixed Billed */}
        <div className="neu-card rounded-3xl p-5 border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Kontrak Tahunan (Cloud VPS + Security)</span>
            <i className="fa-solid fa-server text-emerald-500 text-sm" />
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block font-mono">
            {formatIDR(totalAnnualBilled)} / thn
          </span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            Lisensi Sewa Infrastruktur Server 1 Tahun (PAS)
          </span>
        </div>

        {/* Monthly Variable Dynamic Billed */}
        <div className="neu-card rounded-3xl p-5 border border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider">Tagihan Variable Bulanan</span>
            <i className="fa-solid fa-chart-line text-blue-500 text-sm" />
          </div>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block font-mono">
            {formatIDR(totalMonthlyBilled)} / bln
          </span>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">
            Berubah Otomatis Sesuai Transaksi Real (Saat ini: 0)
          </span>
        </div>

        {/* Developer Internal Profit Metric (ONLY VISIBLE IN INTERNAL DEV MODE) */}
        {viewMode === 'DEVELOPER_INTERNAL' ? (
          <div className="neu-card rounded-3xl p-5 border border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider">Profit Bersih Rahasia Anda (Tahunan)</span>
              <i className="fa-solid fa-sack-dollar text-amber-500 text-sm" />
            </div>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block font-mono">
              +{formatIDR(totalAnnualMargin)}
            </span>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">
              Modal Real Server: {formatIDR(totalAnnualCogs)}
            </span>
          </div>
        ) : (
          <div className="neu-card rounded-3xl p-5 border border-slate-500/20 bg-slate-500/5">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider">Status Lisensi SaaS</span>
              <i className="fa-solid fa-shield-check text-emerald-500 text-sm" />
            </div>
            <span className="text-xl font-black text-slate-800 dark:text-white block font-mono">
              ENTERPRISE ACTIVE
            </span>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">
              Multi-Tenant Isolated Co-Living Architecture
            </span>
          </div>
        )}
      </div>

      {/* 🎛️ SIMULATOR & MARKUP RATE CONFIGURATOR (ONLY VISIBLE IN DEVELOPER INTERNAL MODE) */}
      {viewMode === 'DEVELOPER_INTERNAL' && (
        <div className="neu-card rounded-3xl p-6 space-y-6 bg-slate-900 text-white border border-slate-800 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2 text-rose-400">
                <i className="fa-solid fa-user-lock" />
                <span>Panel Rahasia Developer: Pengaturan Modal API &amp; Markup Rate</span>
              </h3>
              <p className="text-xs text-slate-400">Atur modal provider asli &amp; persentase markup margin murni Anda di sini</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* WA Config */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>💬 WA Twilio Official</span>
                <span className="font-mono">{waCount} Pesan</span>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold block">Simulator Volume Pesan</label>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={waCount}
                  onChange={(e) => setWaCount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">Modal Twilio/WA</label>
                  <input
                    type="number"
                    value={waCogsRate}
                    onChange={(e) => setWaCogsRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-rose-300 focus:text-white font-mono font-black text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block">Tagih Investor</label>
                  <input
                    type="number"
                    value={waBilledRate}
                    onChange={(e) => setWaBilledRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-blue-300 focus:text-white font-mono font-black text-xs"
                  />
                </div>
              </div>
            </div>

            {/* AI Tokens Config */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                <span>🤖 AI Token Inference</span>
                <span className="font-mono">{aiTokens.toLocaleString()} Tokens</span>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold block">Simulator Volume Tokens</label>
                <input
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={aiTokens}
                  onChange={(e) => setAiTokens(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">Modal/1k Tokens</label>
                  <input
                    type="number"
                    value={aiCogsRate1k}
                    onChange={(e) => setAiCogsRate1k(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-rose-300 focus:text-white font-mono font-black text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block">Tagih Investor/1k</label>
                  <input
                    type="number"
                    value={aiBilledRate1k}
                    onChange={(e) => setAiBilledRate1k(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-blue-300 focus:text-white font-mono font-black text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Payment Gateway Config */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                <span>💳 Payment Gateway Fee</span>
                <span className="font-mono">{pgTxCount} Transaksi</span>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-slate-400 font-bold block">Simulator Volume Transaksi</label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="5"
                  value={pgTxCount}
                  onChange={(e) => setPgTxCount(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block">Modal PG Fee/Tx</label>
                  <input
                    type="number"
                    value={pgCogsRate}
                    onChange={(e) => setPgCogsRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-rose-300 focus:text-white font-mono font-black text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block">Tagih Investor/Tx</label>
                  <input
                    type="number"
                    value={pgBilledRate}
                    onChange={(e) => setPgBilledRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-blue-300 focus:text-white font-mono font-black text-xs"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🏢 A. SKEMA BIAYA TAHUNAN (CLEAN INVESTOR ENTERPRISE TABLE) */}
      <div className="neu-card rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-calendar-days text-emerald-500" />
              <span>A. Skema Sewa Infrastruktur Server Tahunan (Fixed Contract)</span>
            </h3>
            <p className="text-xs text-slate-500">Lisensi Sewa Cloud VPS Server, Multi-Tenant Database Storage &amp; Managed Security Infrastructure (1 Tahun)</p>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20 font-mono">
            TOTAL KONTRAK TAHUNAN: PAS {formatIDR(totalAnnualBilled)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">KOMPONEN INFRASTRUKTUR SAAS TAHUNAN</th>
                <th className="py-3.5 px-4">SPESIFIKASI &amp; PROVIDER INFRASTRUKTUR</th>
                {viewMode === 'DEVELOPER_INTERNAL' && <th className="py-3.5 px-4 text-right">MODAL REAL (COGS)</th>}
                <th className="py-3.5 px-4 text-right">BIYA SEWA TAHUNAN</th>
                {viewMode === 'DEVELOPER_INTERNAL' && <th className="py-3.5 px-4 text-right">PROFIT MARGIN</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
              {annualItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4">
                    <span className="font-black text-slate-900 dark:text-white block text-xs">{item.name}</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5">{item.notes}</span>
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {item.provider}
                  </td>

                  {viewMode === 'DEVELOPER_INTERNAL' && (
                    <td className="py-4 px-4 text-right font-mono text-rose-500 font-bold">
                      {formatIDR(item.realCogsAnnual)}
                    </td>
                  )}

                  <td className="py-4 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-black text-sm">
                    {formatIDR(item.billedInvestorAnnual)}
                  </td>

                  {viewMode === 'DEVELOPER_INTERNAL' && (
                    <td className="py-4 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-black">
                      +{formatIDR(item.netMarginAnnual)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-900/80 font-black border-t-2 border-slate-300 dark:border-slate-700 text-xs">
                <td colSpan={viewMode === 'DEVELOPER_INTERNAL' ? 2 : 2} className="py-4 px-4 uppercase text-slate-700 dark:text-slate-200">
                  TOTAL BIAYA SEWA INFRASTRUKTUR TAHUNAN (PAS)
                </td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-rose-600">{formatIDR(totalAnnualCogs)}</td>
                )}
                <td className="py-4 px-4 text-right font-mono text-emerald-600 text-base">{formatIDR(totalAnnualBilled)}</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-emerald-600 text-sm">+{formatIDR(totalAnnualMargin)}</td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 💬 B. RINCIAN BIAYA DINAMIS BULANAN (DYNAMIC PER-TRANSACTION) */}
      <div className="neu-card rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-blue-500" />
              <span>B. Skema Tagihan Traffic Bulanan (Variable Metered Usage)</span>
            </h3>
            <p className="text-xs text-slate-500">Tagihan bulanan bergerak otomatis mengikuti volume pemakaian real WhatsApp Twilio, AI Token, &amp; Payment Gateway</p>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs border border-blue-500/20 font-mono">
            TAGIHAN BULANAN REAL-TIME: {formatIDR(totalMonthlyBilled)} / BLN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">LAYANAN VARIABLE TRAFFIC</th>
                <th className="py-3.5 px-4">VOLUME TRANSAKSI REAL</th>
                <th className="py-3.5 px-4 text-right">TARIF SATUAN LISENSI</th>
                {viewMode === 'DEVELOPER_INTERNAL' && <th className="py-3.5 px-4 text-right">MODAL REAL (COGS)</th>}
                <th className="py-3.5 px-4 text-right">TAGIHAN INVESTOR</th>
                {viewMode === 'DEVELOPER_INTERNAL' && <th className="py-3.5 px-4 text-right">PROFIT MARGIN</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
              
              {/* WhatsApp Twilio Row */}
              <tr className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-black text-slate-900 dark:text-white block text-xs">1. WhatsApp Twilio Official Gateway</span>
                  <span className="text-[10px] text-slate-500">Pengingat Tagihan H-3, Kwitansi Lunas &amp; Bot Auto-Reply</span>
                </td>
                <td className="py-4 px-4 font-mono font-bold text-emerald-600">{waCount} Pesan WA</td>
                <td className="py-4 px-4 font-mono text-right text-slate-600">Rp {waBilledRate} / WA</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-rose-500 font-bold">{formatIDR(waRealCogs)}</td>
                )}
                <td className="py-4 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">{formatIDR(waBilled)}</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-purple-600 dark:text-purple-400 font-black">+{formatIDR(waMargin)}</td>
                )}
              </tr>

              {/* AI Token Row */}
              <tr className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-black text-slate-900 dark:text-white block text-xs">2. Smart Kosan Proper AI Agent Engine</span>
                  <span className="text-[10px] text-slate-500">AI CS 24 Jam, Shorthand Stock Opname &amp; Financial Analysis</span>
                </td>
                <td className="py-4 px-4 font-mono font-bold text-purple-600">{aiTokens.toLocaleString()} Tokens</td>
                <td className="py-4 px-4 font-mono text-right text-slate-600">Rp {aiBilledRate1k} / 1k Tokens</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-rose-500 font-bold">{formatIDR(aiRealCogs)}</td>
                )}
                <td className="py-4 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">{formatIDR(aiBilled)}</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-purple-600 dark:text-purple-400 font-black">+{formatIDR(aiMargin)}</td>
                )}
              </tr>

              {/* Payment Gateway Row */}
              <tr className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <span className="font-black text-slate-900 dark:text-white block text-xs">3. Payment Gateway Settlement API</span>
                  <span className="text-[10px] text-slate-500">Settlement QRIS Nasional &amp; Virtual Account Multi-Bank</span>
                </td>
                <td className="py-4 px-4 font-mono font-bold text-blue-600">{pgTxCount} Transaksi</td>
                <td className="py-4 px-4 font-mono text-right text-slate-600">Rp {pgBilledRate.toLocaleString()} / Tx</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-rose-500 font-bold">{formatIDR(pgRealCogs)}</td>
                )}
                <td className="py-4 px-4 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">{formatIDR(pgBilled)}</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-purple-600 dark:text-purple-400 font-black">+{formatIDR(pgMargin)}</td>
                )}
              </tr>

            </tbody>
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-900/80 font-black border-t-2 border-slate-300 dark:border-slate-700 text-xs">
                <td colSpan={3} className="py-4 px-4 uppercase text-slate-700 dark:text-slate-200">
                  TOTAL TAGIHAN VARIABLE BULANAN (REAL-TIME METERED)
                </td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-rose-600">{formatIDR(totalMonthlyCogs)}</td>
                )}
                <td className="py-4 px-4 text-right font-mono text-blue-600 text-sm">{formatIDR(totalMonthlyBilled)}</td>
                {viewMode === 'DEVELOPER_INTERNAL' && (
                  <td className="py-4 px-4 text-right font-mono text-purple-600 text-sm">+{formatIDR(totalMonthlyMargin)}</td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 🔐 SECRET DEVELOPER PIN MODAL */}
      {showDevPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold border border-rose-500/30">
                <i className="fa-solid fa-lock" />
              </div>
              <h3 className="text-lg font-black tracking-tight">Akses Rahasia Developer</h3>
              <p className="text-xs text-slate-400">Masukkan PIN Rahasia Developer untuk membuka Laporan Modal Real &amp; Margin Kontrol</p>
            </div>

            <form onSubmit={handleVerifyDevPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Masukkan PIN Rahasia..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-lg text-white focus:outline-none focus:border-rose-500"
                  autoFocus
                />
                {pinError && <p className="text-rose-400 text-[11px] font-bold text-center mt-1">PIN Salah! Coba `2026` atau `demo123`</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDevPinModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg cursor-pointer"
                >
                  Buka Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
