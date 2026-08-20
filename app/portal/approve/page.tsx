'use client';

import React, { useState, useEffect } from 'react';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ExecutiveApprovalPortal() {
  const [appId, setAppId] = useState('APP-2152');
  const [title, setTitle] = useState('Pembelian 12 Galon Air Mineral & Gas Dapur');
  const [amount, setAmount] = useState(240000);
  const [requester, setRequester] = useState('Bambang Prasetyo (Staf Lapangan)');
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [reason, setReason] = useState('Stok galon air minum tersisa 1 unit, perlu restock operasional.');
  const [category, setCategory] = useState('OPERASIONAL');
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadApprovalData() {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 'APP-2152';
        setAppId(id);
        if (params.get('title')) setTitle(params.get('title')!);
        if (params.get('amount')) setAmount(Number(params.get('amount')) || 240000);
        if (params.get('staff')) setRequester(params.get('staff')!);
        if (params.get('reason')) setReason(params.get('reason')!);
        if (params.get('property')) setProperty(params.get('property')!);
        if (params.get('category')) setCategory(params.get('category')!);

        // Fetch real property
        try {
          const res = await fetch('/api/properties?slug=rshs');
          if (res.ok) {
            const json = await res.json();
            if (json?.data?.[0]?.name) {
              setProperty(json.data[0].name);
            }
          }
        } catch {}
      }
    }

    loadApprovalData();
  }, []);

  const handleDecision = async (dec: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true);
    setStatus(dec);
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'DECIDE_EXPENSE',
          payload: { id: appId, status: dec, amount, title, requester },
        }),
      });

      // Also trigger webhook recording
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '082217415131',
          message: dec === 'APPROVED' ? `ACC ${appId}` : `Tolak ${appId}`,
        }),
      });
    } catch {
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 dark:text-amber-400 text-xs font-black">
            <i className="fa-solid fa-stamp text-xs" />
            <span>OTORISASI PENGELUARAN DANA</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            #{appId}
          </span>
        </div>

        {/* Main Card */}
        <div className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Property & Request info */}
          <div className="border-b border-slate-200/50 dark:border-white/5 pb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              CABANG PROPERTI
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mt-0.5">
              {property}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Pemohon: <strong className="text-slate-700 dark:text-slate-200">{requester}</strong>
            </p>
          </div>

          {/* Amount Display */}
          <div className="p-5 rounded-2xl neu-inset text-center space-y-1">
            <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              NOMINAL PENGAJUAN:
            </span>
            <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {formatIDR(amount)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Kategori: {category}
            </span>
          </div>

          {/* Keperluan & Alasan */}
          <div className="p-4 rounded-2xl neu-card-sm space-y-1 text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Keperluan:</span>
            <p className="text-xs font-black text-slate-800 dark:text-white">{title}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-white/5">
              &quot;{reason}&quot;
            </p>
          </div>

          {/* Decision Results or Buttons */}
          {status === 'APPROVED' ? (
            <div className="p-4 rounded-2xl neu-inset text-center space-y-2 animate-scale-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#047857] text-white text-xs font-bold shadow-md">
                <i className="fa-solid fa-circle-check text-xs" />
                <span>DISETUJUI (APPROVED)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pengeluaran sebesar <strong>{formatIDR(amount)}</strong> telah disahkan dan otomatis tercatat di Buku Kas Database PostgreSQL.
              </p>
            </div>
          ) : status === 'REJECTED' ? (
            <div className="p-4 rounded-2xl neu-inset text-center space-y-2 animate-scale-in">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md">
                <i className="fa-solid fa-circle-xmark text-xs" />
                <span>PENGAJUAN DITOLAK</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Pengajuan ditolak oleh Owner. Notifikasi pembatalan telah diteruskan ke staf pemohon.
              </p>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDecision('REJECTED')}
                className="flex-1 py-3 px-3 rounded-2xl neu-btn text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <i className="fa-solid fa-xmark text-xs" />
                <span>Tolak</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDecision('APPROVED')}
                className="flex-1 py-3 px-3 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <i className="fa-solid fa-spinner animate-spin" />
                ) : (
                  <>
                    <i className="fa-solid fa-check text-xs" />
                    <span>Setujui (ACC)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Ledger Real-Time Database KosanKu Pro
        </p>
      </div>
    </div>
  );
}
