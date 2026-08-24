'use client';

import { useEffect } from 'react';

export default function PdfStatementPage() {
  useEffect(() => {
    // Auto-trigger print dialog after render
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const annualFixedItems = [
    {
      no: 1,
      name: '1. Enterprise Cloud VPS Server & Multi-Tenant Database Storage',
      provider: 'High-Availability Cloud VPS Node (4 vCPU, 8GB RAM, 160GB SSD)',
      billed: 4500000,
      desc: 'Server Komputasi Node.js 24/7, Storage Database PostgreSQL Terisolasi, Automated Backups & Microservices Engine (1 Tahun)',
    },
    {
      no: 2,
      name: '2. Domain Utama, Wildcard SSL Encryption & Managed Security',
      provider: 'Cloudflare Enterprise & Namecheap Security Suite (.cloud)',
      billed: 750000,
      desc: 'Lisensi Domain kosankupro.cloud, Enkripsi Finansial 256-Bit SSL, Cloudflare DDoS Protection Shield & Managed Security (1 Tahun)',
    },
  ];

  const monthlyVariableItems = [
    {
      no: 1,
      name: '1. WhatsApp Official Gateway (BSP Meta)',
      provider: 'Twilio WhatsApp Cloud API',
      rate: 'Rp 850 / WA',
      desc: 'Pengingat Tagihan H-3, Kwitansi Lunas Instan & Chat Bot Auto-Reply 24 Jam',
    },
    {
      no: 2,
      name: '2. Smart Kosan Proper AI Agent Engine',
      provider: 'OpenRouter LLM Token Inference',
      rate: 'Rp 350 / 1k Tokens',
      desc: 'AI CS 24 Jam, Inferensi Shorthand Stock Opname & Laporan Keuangan Cerdas',
    },
    {
      no: 3,
      name: '3. Payment Gateway Settlement API',
      provider: 'Duitku / Midtrans Settlement Engine',
      rate: 'Rp 15.000 / Transaksi',
      desc: 'Settlement Pembayaran QRIS Nasional & Virtual Account Multi-Bank Real-Time',
    },
  ];

  const totalAnnualBilled = annualFixedItems.reduce((acc, i) => acc + i.billed, 0);

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-8 print:p-0 print:bg-white selection:bg-emerald-500 selection:text-white">
      
      {/* Floating Top Control Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-xl print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-black text-xs">Dokumen Resmi Laporan Investor • Tab Baru</span>
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
                SaaS Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-600 font-bold">Multi-Property Co-Living Management Infrastructure</p>
            <p className="text-[10px] text-slate-400 font-mono">Pengembang Platform: PT. BERKAH JASA ABADI</p>
          </div>

          <div className="text-right space-y-1 font-mono">
            <span className="text-sm font-black text-slate-900 block">INVESTOR RECONCILIATION STATEMENT</span>
            <span className="text-xs text-emerald-700 font-bold block">REF NO: KSK-STATEMENT-2026-08</span>
            <span className="text-[10px] text-slate-500 block">Tanggal Terbit: {todayStr}</span>
          </div>
        </div>

        {/* Client & Target Allocation Overview */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Klien / Mitra Penerima Laporan:
            </span>
            <p className="font-black text-base text-slate-900">Investor</p>
            <p className="text-slate-700 font-bold text-xs mt-0.5">Pihak Penerima: Investor Properti Kosan</p>
            <p className="text-slate-500 text-[10px] mt-0.5">Skema: Fixed Annual Infrastructure + Variable Traffic Metered</p>
          </div>

          <div className="text-right space-y-1 font-mono">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Ringkasan Nilai Kontrak:
            </span>
            <p className="text-sm font-black text-emerald-700">A. Kontrak Fixed Tahunan: {formatIDR(totalAnnualBilled)}</p>
            <p className="text-xs font-bold text-blue-600">B. Variable Traffic Bulanan: Real-Time Metered (Awal: Rp 0)</p>
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
                <th className="py-2.5 px-3">NO</th>
                <th className="py-2.5 px-3">KOMPONEN MODUL INFRASTRUKTUR</th>
                <th className="py-2.5 px-3">PROVIDER / SPESIFIKASI</th>
                <th className="py-2.5 px-3 text-right">BIAYA SEWA TAHUNAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {annualFixedItems.map((item) => (
                <tr key={item.no}>
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">{item.no}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5">{item.desc}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700">{item.provider}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700 font-black text-sm">{formatIDR(item.billed)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-black border-t-2 border-slate-300 text-xs">
                <td colSpan={3} className="py-3 px-3 uppercase text-slate-800">
                  TOTAL KONTRAK SEWA INFRASTRUKTUR TAHUNAN (PAS)
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">{formatIDR(totalAnnualBilled)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Section B: Monthly Variable */}
        <div className="space-y-3 pt-4">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center justify-between">
            <span>B. SKEMA TAGIHAN TRAFFIC VARIABLE BULANAN (REAL-TIME METERED)</span>
            <span className="text-blue-600 font-mono">DITAGIHKAN SESUAI PEMAKAIAN</span>
          </h4>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">NO</th>
                <th className="py-2.5 px-3">KOMPONEN TRAFFIC BULANAN</th>
                <th className="py-2.5 px-3">PROVIDER API</th>
                <th className="py-2.5 px-3 text-right">TARIF LISENSI SATUAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {monthlyVariableItems.map((item) => (
                <tr key={item.no}>
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">{item.no}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-700">{item.provider}</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-600 font-black">{item.rate}</td>
                </tr>
              ))}
            </tbody>
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
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Disetujui Oleh (Investor / Klien):</span>
            <div className="space-y-1">
              <p className="font-black text-slate-900 underline">Investor</p>
              <p className="text-[10px] text-slate-500 font-mono">Management Properti Kosan</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
