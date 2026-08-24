'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PdfStatementContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    // Auto-trigger print dialog after render
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const mode = searchParams.get('mode') || 'INVESTOR_PORTAL';
  const isDevMode = mode === 'DEVELOPER_INTERNAL';

  // Live Meter Counts (default 0)
  const waCount = Number(searchParams.get('wa') || '0');
  const aiTokens = Number(searchParams.get('ai') || '0');
  const pgTxCount = Number(searchParams.get('pg') || '0');

  // Rates
  const waCogsRate = Number(searchParams.get('waCogs') || '390');
  const waBilledRate = Number(searchParams.get('waBilled') || '850');

  const aiCogsRate1k = Number(searchParams.get('aiCogs') || '120');
  const aiBilledRate1k = Number(searchParams.get('aiBilled') || '350');

  const pgCogsRate = Number(searchParams.get('pgCogs') || '10500');
  const pgBilledRate = Number(searchParams.get('pgBilled') || '15000');

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const annualFixedItems = [
    {
      no: 1,
      name: 'Enterprise Cloud VPS Server & Multi-Tenant Database Storage',
      provider: 'High-Availability Cloud VPS Node (4 vCPU, 8GB RAM, 160GB SSD)',
      cogs: 1440000,
      billed: 4500000,
      margin: 3060000,
      desc: 'Server Komputasi Node.js 24/7, Storage Database PostgreSQL Terisolasi, Automated Backups & Microservices Engine (1 Tahun)',
    },
    {
      no: 2,
      name: 'Domain Utama, Wildcard SSL Encryption & Managed Security',
      provider: 'Cloudflare Enterprise & Namecheap Security Suite (.cloud)',
      cogs: 215000,
      billed: 750000,
      margin: 535000,
      desc: 'Lisensi Domain kosankupro.cloud, Enkripsi Finansial 256-Bit SSL, Cloudflare DDoS Protection Shield & Managed Security (1 Tahun)',
    },
  ];

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

  const totalAnnualBilled = annualFixedItems.reduce((acc, i) => acc + i.billed, 0);
  const totalAnnualCogs = annualFixedItems.reduce((acc, i) => acc + i.cogs, 0);
  const totalAnnualMargin = totalAnnualBilled - totalAnnualCogs;

  const totalMonthlyBilled = waBilled + aiBilled + pgBilled;
  const totalMonthlyCogs = waRealCogs + aiRealCogs + pgRealCogs;
  const totalMonthlyMargin = totalMonthlyBilled - totalMonthlyCogs;

  // Deterministic Formatter (Fixes Server vs Client Hydration Mismatch)
  const formatNumberID = (val: number) =>
    val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const formatIDR = (val: number) => `Rp ${formatNumberID(val)}`;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <div className="text-center font-bold text-slate-600 animate-pulse">
          Memuat Dokumen Laporan PDF Statement...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-8 print:p-0 print:bg-white selection:bg-emerald-500 selection:text-white">
      
      {/* Floating Top Control Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-xl print:hidden">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isDevMode ? 'bg-rose-500' : 'bg-emerald-500'} animate-ping`} />
          <span className="font-black text-xs">
            {isDevMode ? '🔒 Dokumen Laporan Internal Developer (Real Cost Data)' : '💼 Dokumen Resmi Investor Statement'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <i className="fa-solid fa-print" />
            <span>Cetak / Save PDF (Ctrl+P)</span>
          </button>

          <button
            onClick={() => window.close()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Tutup Tab
          </button>
        </div>
      </div>

      {/* Printable A4 Executive Sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 space-y-8 font-sans">
        
        {/* Kop Surat Header */}
        <div className="flex items-start justify-between border-b-2 border-emerald-600 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-black text-3xl text-emerald-700 tracking-tight">KosanKu Pro</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                {isDevMode ? 'Internal Dev Statement' : 'SaaS Enterprise'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold">Multi-Property Co-Living Management Infrastructure</p>
            <p className="text-[10px] text-slate-400 font-mono">Pengembang Platform: PT. BERKAH JASA ABADI</p>
          </div>

          <div className="text-right space-y-1 font-mono">
            <span className="text-sm font-black text-slate-900 block">
              {isDevMode ? 'INTERNAL DEVELOPER RECONCILIATION STATEMENT' : 'INVESTOR RECONCILIATION STATEMENT'}
            </span>
            <span className="text-xs text-emerald-700 font-bold block">REF NO: KSK-STATEMENT-2026-08</span>
            <span className="text-[10px] text-slate-500 block">Tanggal Terbit: {todayStr}</span>
          </div>
        </div>

        {/* Client & Target Allocation Overview */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {isDevMode ? 'Subjek Laporan:' : 'Klien / Mitra Penerima Laporan:'}
            </span>
            <p className="font-black text-base text-slate-900">
              {isDevMode ? 'Laporan Internal Developer & Rekapitulasi COGS' : 'Investor'}
            </p>
            <p className="text-slate-700 font-bold text-xs mt-0.5">
              {isDevMode ? 'Target Sistem: KosanKu Pro Enterprise Platform' : 'Pihak Penerima: Investor Properti Kosan'}
            </p>
            <p className="text-slate-500 text-[10px] mt-0.5">Skema: Fixed Annual Infrastructure + Variable Traffic Metered</p>
          </div>

          <div className="text-right space-y-1 font-mono">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ringkasan Nilai Kontrak:
            </span>
            <p className="text-sm font-black text-emerald-700">A. Kontrak Fixed Tahunan: {formatIDR(totalAnnualBilled)}</p>
            <p className="text-xs font-bold text-blue-600">
              B. Variable Traffic Bulanan: {formatIDR(totalMonthlyBilled)} / bln
            </p>
            {isDevMode && (
              <p className="text-xs font-bold text-amber-600 border-t border-slate-200 pt-1">
                Total Profit Margin Anda: +{formatIDR(totalAnnualMargin + totalMonthlyMargin)}
              </p>
            )}
          </div>
        </div>

        {/* Section A: Annual Fixed */}
        <div className="space-y-3">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between">
            <span>A. SKEMA BIAYA SEWA INFRASTRUKTUR TAHUNAN (FIXED CONTRACT)</span>
            <span className="text-emerald-700 font-mono">PAS {formatIDR(totalAnnualBilled)} / TAHUN</span>
          </h4>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 text-center w-10">NO</th>
                <th className="py-2.5 px-3">KOMPONEN MODUL INFRASTRUKTUR</th>
                <th className="py-2.5 px-3">PROVIDER / SPESIFIKASI</th>
                {isDevMode && <th className="py-2.5 px-3 text-right">MODAL REAL (COGS)</th>}
                <th className="py-2.5 px-3 text-right">BIAYA SEWA TAHUNAN</th>
                {isDevMode && <th className="py-2.5 px-3 text-right">PROFIT MARGIN</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {annualFixedItems.map((item) => (
                <tr key={item.no}>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">{item.no}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5">{item.desc}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{item.provider}</td>
                  {isDevMode && (
                    <td className="py-3 px-3 text-right font-mono text-rose-600 font-bold">{formatIDR(item.cogs)}</td>
                  )}
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 font-black text-sm">{formatIDR(item.billed)}</td>
                  {isDevMode && (
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 font-black">+{formatIDR(item.margin)}</td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black border-t-2 border-slate-300 text-xs">
                <td colSpan={3} className="py-3 px-3 uppercase text-slate-800">
                  TOTAL KONTRAK SEWA INFRASTRUKTUR TAHUNAN (PAS)
                </td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-rose-600">{formatIDR(totalAnnualCogs)}</td>
                )}
                <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">{formatIDR(totalAnnualBilled)}</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">+{formatIDR(totalAnnualMargin)}</td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section B: Monthly Variable Dynamic */}
        <div className="space-y-3 pt-4">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between">
            <span>B. SKEMA TAGIHAN TRAFFIC VARIABLE BULANAN (REAL-TIME METERED)</span>
            <span className="text-blue-600 font-mono">
              TOTAL REAL: {formatIDR(totalMonthlyBilled)} / BULAN
            </span>
          </h4>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3 text-center w-10">NO</th>
                <th className="py-2.5 px-3">KOMPONEN TRAFFIC BULANAN</th>
                <th className="py-2.5 px-3 text-center">VOLUME REAL</th>
                <th className="py-2.5 px-3 text-right">TARIF SATUAN</th>
                {isDevMode && <th className="py-2.5 px-3 text-right">MODAL REAL</th>}
                <th className="py-2.5 px-3 text-right">TAGIHAN BULANAN</th>
                {isDevMode && <th className="py-2.5 px-3 text-right">MARGIN</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              
              {/* WA Twilio */}
              <tr>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">1</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-900 block">WhatsApp Twilio Official Gateway</span>
                  <span className="text-[10px] text-slate-500">Pengingat Tagihan H-3, Kwitansi Lunas &amp; Bot Auto-Reply</span>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">{formatNumberID(waCount)} Pesan WA</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">Rp {formatNumberID(waBilledRate)} / WA</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-rose-600 font-bold">{formatIDR(waRealCogs)}</td>
                )}
                <td className="py-3 px-3 text-right font-mono text-blue-600 font-black">{formatIDR(waBilled)}</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-purple-600 font-black">+{formatIDR(waMargin)}</td>
                )}
              </tr>

              {/* AI Token Engine */}
              <tr>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">2</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-900 block">Smart Kosan Proper AI Agent Engine</span>
                  <span className="text-[10px] text-slate-500">AI CS 24 Jam, Shorthand Stock Opname &amp; Financial Analysis</span>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-purple-700">{formatNumberID(aiTokens)} Tokens</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">Rp {formatNumberID(aiBilledRate1k)} / 1k Tokens</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-rose-600 font-bold">{formatIDR(aiRealCogs)}</td>
                )}
                <td className="py-3 px-3 text-right font-mono text-blue-600 font-black">{formatIDR(aiBilled)}</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-purple-600 font-black">+{formatIDR(aiMargin)}</td>
                )}
              </tr>

              {/* Payment Gateway */}
              <tr>
                <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">3</td>
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-900 block">Payment Gateway Settlement API</span>
                  <span className="text-[10px] text-slate-500">Settlement QRIS Nasional &amp; Virtual Account Multi-Bank</span>
                </td>
                <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">{formatNumberID(pgTxCount)} Transaksi</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">Rp {formatNumberID(pgBilledRate)} / Tx</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-rose-600 font-bold">{formatIDR(pgRealCogs)}</td>
                )}
                <td className="py-3 px-3 text-right font-mono text-blue-600 font-black">{formatIDR(pgBilled)}</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-purple-600 font-black">+{formatIDR(pgMargin)}</td>
                )}
              </tr>

            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black border-t-2 border-slate-300 text-xs">
                <td colSpan={4} className="py-3 px-3 uppercase text-slate-800">
                  TOTAL TAGIHAN VARIABLE BULANAN (REAL-TIME)
                </td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-rose-600">{formatIDR(totalMonthlyCogs)}</td>
                )}
                <td className="py-3 px-3 text-right font-mono text-blue-600 text-sm">{formatIDR(totalMonthlyBilled)}</td>
                {isDevMode && (
                  <td className="py-3 px-3 text-right font-mono text-purple-600 text-sm">+{formatIDR(totalMonthlyMargin)}</td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Executive Signatures Section */}
        <div className="pt-12 border-t border-slate-200 flex justify-between items-end text-xs">
          <div className="text-center space-y-12">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Disiapkan Oleh (SaaS Platform Lead):</span>
            <div className="space-y-1">
              <p className="font-black text-slate-900 underline">PT. BERKAH JASA ABADI</p>
              <p className="text-[10px] text-slate-500 font-mono">KosanKu Pro Technology Lead</p>
            </div>
          </div>

          <div className="text-center space-y-12">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
              {isDevMode ? 'Diverifikasi Oleh (Platform Master):' : 'Disetujui Oleh (Investor / Klien):'}
            </span>
            <div className="space-y-1">
              <p className="font-black text-slate-900 underline">{isDevMode ? 'Platform Lead Master' : 'Investor'}</p>
              <p className="text-[10px] text-slate-500 font-mono">
                {isDevMode ? 'Internal Developer Audited' : 'Management Properti Kosan'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PdfStatementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold">Loading PDF Statement...</div>}>
      <PdfStatementContent />
    </Suspense>
  );
}
