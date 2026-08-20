'use client';
import React, { useState, useEffect } from 'react';

export default function TenantStatementPortal() {
  const [tenant, setTenant] = useState('dr. Rizky Pratama, Sp.A');
  const [room, setRoom] = useState('EKS-01');
  const [month, setMonth] = useState('2026-08');
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [bankDestination, setBankDestination] = useState('BCA');

  const monthLabel = new Date(month + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenant(p.get('tenant')!);
    if (p.get('room')) setRoom(p.get('room')!);
    if (p.get('month')) setMonth(p.get('month')!);
    setTimeout(() => setLoading(false), 500);
  }, []);

  const transactions = [
    { date: '01 Agu', cat: 'SEWA', icon: '🏠', label: 'Pembayaran Sewa Kamar', amount: 1500000, type: 'out', status: 'VERIFIED' },
    { date: '05 Agu', cat: 'GALON', icon: '💧', label: 'Refill Galon Aqua 2x', amount: 40000, type: 'out', status: 'VERIFIED' },
    { date: '08 Agu', cat: 'LAUNDRY', icon: '👕', label: 'Laundry Kiloan 5kg', amount: 35000, type: 'out', status: 'VERIFIED' },
    { date: '12 Agu', cat: 'WARUNG', icon: '🍳', label: 'Nasi Goreng & Kopi 3x', amount: 54000, type: 'out', status: 'VERIFIED' },
    { date: '15 Agu', cat: 'GALON', icon: '💧', label: 'Refill Galon Aqua 2x', amount: 40000, type: 'out', status: 'VERIFIED' },
    { date: '19 Agu', cat: 'LAUNDRY', icon: '👔', label: 'Laundry Express 3 Jam', amount: 50000, type: 'out', status: 'VERIFIED' },
    { date: '22 Agu', cat: 'WARUNG', icon: '🍗', label: 'Nasi Ayam & Mie Goreng', amount: 37000, type: 'out', status: 'VERIFIED' },
    { date: '25 Agu', cat: 'GALON', icon: '💧', label: 'Refill Galon Aqua 2x', amount: 40000, type: 'out', status: 'VERIFIED' },
  ];

  const catTotals = [
    { icon: '🏠', label: 'Sewa Kamar', total: 1500000, color: 'text-slate-800 dark:text-white' },
    { icon: '💧', label: 'Air & Galon', total: 120000, color: 'text-blue-600' },
    { icon: '👕', label: 'Laundry', total: 85000, color: 'text-purple-500' },
    { icon: '🍳', label: 'Katering & Warung', total: 91000, color: 'text-orange-500' },
  ];

  const grandTotal = catTotals.reduce((a, c) => a + c.total, 0);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setUploadSuccess(false);
      setSelectedFile(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        
        {/* Top Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-card-sm text-[#047857] text-xs font-black mb-3 border border-emerald-500/20">
            <i className="fa-solid fa-chart-pie text-xs" />
            <span>REKAP PENGELUARAN &amp; TAGIHAN</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">Rekap {monthLabel}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tenant} • Kamar {room}</p>
        </div>

        {/* Month Selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {['2026-06', '2026-07', '2026-08'].map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`px-4 py-2 rounded-2xl text-xs font-black cursor-pointer transition-all ${
                month === m
                  ? 'neu-card text-[#047857] border border-emerald-500/30'
                  : 'neu-inset text-slate-500'
              }`}
            >
              {new Date(m + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
            </button>
          ))}
        </div>

        {/* Grand Total Card */}
        <div className="neu-card rounded-3xl p-5 border border-white/80 dark:border-white/10 shadow-xl">
          <div className="text-center mb-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Pengeluaran {monthLabel}</div>
            <div className="text-3xl font-black font-mono text-[#047857] mt-1">{fmt(grandTotal)}</div>
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              <i className="fa-solid fa-circle-check text-[9px]" /> Tagihan Lunas Terverifikasi
            </span>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-2">
            {catTotals.map((cat) => (
              <div key={cat.label} className="flex items-center gap-3 p-2.5 rounded-2xl neu-inset">
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">{cat.label}</span>
                    <span className={`font-black ${cat.color}`}>{fmt(cat.total)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#047857]" style={{ width: `${Math.round((cat.total / grandTotal) * 100)}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{Math.round((cat.total / grandTotal) * 100)}% dari total</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MANUAL PAYMENT CTA CARD (Offline Bank Transfer & Struk Upload) */}
        <div className="neu-card rounded-3xl p-5 border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
                <i className="fa-solid fa-receipt" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">Bayar Manual / Upload Struk</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Transfer Bank atau QRIS Statis Kosan</p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#047857] text-white text-[11px] font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Upload Struk
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="neu-card rounded-3xl p-5 space-y-3 border border-white/80 dark:border-white/10 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Riwayat Transaksi</p>
            <span className="text-[10px] text-slate-500">{transactions.length} Item</span>
          </div>

          {loading ? (
            <div className="text-center py-6"><i className="fa-solid fa-spinner animate-spin text-[#047857] text-xl" /></div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl neu-inset">
                  <div className="flex items-center gap-3">
                    <span className="text-base">{t.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.label}</div>
                      <div className="text-[10px] text-slate-400">{t.date} 2026 • Terverifikasi</div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-rose-500">−{fmt(t.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.print()}
            className="py-3.5 rounded-2xl neu-btn font-black text-xs text-[#047857] flex items-center justify-center gap-2 cursor-pointer border border-white/80 dark:border-white/10 shadow-md"
          >
            <i className="fa-solid fa-file-pdf" />
            <span>Cetak PDF</span>
          </button>
          <a
            href="https://wa.me/6282114242634?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20sudah%20transfer%20dan%20ingin%20konfirmasi%20pembayaran"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3.5 rounded-2xl bg-[#047857] text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-102 transition-all"
          >
            <i className="fa-brands fa-whatsapp text-sm" />
            <span>Konfirmasi WA</span>
          </a>
        </div>

        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Rekap Pengeluaran &amp; Kuitansi Digital</p>
      </div>

      {/* UPLOAD STRUK MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm neu-card rounded-3xl p-5 border border-white/80 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Upload Bukti Transfer Bank</h3>
              <button onClick={() => setShowUploadModal(false)} className="w-7 h-7 rounded-full neu-btn flex items-center justify-center text-xs text-slate-400">✕</button>
            </div>

            {uploadSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-center space-y-2">
                <i className="fa-solid fa-circle-check text-3xl text-emerald-500" />
                <h4 className="text-xs font-black">Bukti Transfer Berhasil Diunggah!</h4>
                <p className="text-[10px] text-slate-500">Admin akan memverifikasi pembayaran Anda dalam 15 menit.</p>
              </div>
            ) : (
              <form onSubmit={handleSimulateUpload} className="space-y-3">
                <div className="p-3 rounded-2xl neu-inset space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Rekening Tujuan</label>
                  <select
                    value={bankDestination}
                    onChange={(e) => setBankDestination(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="BCA" className="bg-white dark:bg-slate-900">BCA: 777-019-8234 (a.n KosanKu Pro)</option>
                    <option value="MANDIRI" className="bg-white dark:bg-slate-900">Mandiri: 132-00-987654 (a.n KosanKu Pro)</option>
                    <option value="BRI" className="bg-white dark:bg-slate-900">BRI: 0021-01-098765 (a.n KosanKu Pro)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 text-center space-y-2 cursor-pointer hover:border-emerald-500 transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0]?.name || null)}
                    className="hidden"
                    id="receiptInput"
                  />
                  <label htmlFor="receiptInput" className="cursor-pointer block">
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-emerald-600 mb-1" />
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {selectedFile ? selectedFile : 'Pilih Foto Struk / Screenshot Transfer'}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">JPG, PNG atau PDF (Maks. 5MB)</div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!selectedFile}
                  className="w-full py-3 rounded-2xl bg-[#047857] hover:bg-[#065f46] disabled:opacity-40 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Kirim Bukti Pembayaran
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
