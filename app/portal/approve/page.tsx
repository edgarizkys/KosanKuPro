'use client';

import React, { useState, useEffect } from 'react';

export default function ExecutiveApprovalPortal() {
  const [appId, setAppId] = useState('APP-2152');
  const [title, setTitle] = useState('Pembelian 12 Galon Air Mineral & Gas Dapur');
  const [amount, setAmount] = useState(240000);
  const [requester, setRequester] = useState('Bambang Prasetyo (Staf Lapangan)');
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [reason, setReason] = useState('Stok galon air minum di dispenser lantai 1 & 2 tersisa 1 galon, perlu restock untuk kebutuhan 3 hari ke depan.');
  const [category, setCategory] = useState('OPERASIONAL');
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('id')) setAppId(params.get('id')!);
      if (params.get('title')) setTitle(params.get('title')!);
      if (params.get('amount')) setAmount(Number(params.get('amount')) || 240000);
      if (params.get('staff')) setRequester(params.get('staff')!);
      if (params.get('reason')) setReason(params.get('reason')!);
      if (params.get('property')) setProperty(params.get('property')!);
    }
  }, []);

  // Biometric Hold Simulation
  useEffect(() => {
    let interval: any;
    if (isHolding && status === 'PENDING') {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            handleDecision('APPROVED');
            setIsHolding(false);
            return 100;
          }
          return prev + 10;
        });
      }, 70);
    } else if (!isHolding && holdProgress < 100) {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, status]);

  const handleDecision = async (dec: 'APPROVED' | 'REJECTED') => {
    setStatus(dec);
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'DECIDE_EXPENSE',
          payload: { id: appId, status: dec },
        }),
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#090d13] text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-wider uppercase">
            👑 EXECUTIVE APPROVAL STAMP
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Otorisasi Pengeluaran Dana</h1>
          <p className="text-xs text-slate-400">{property}</p>
        </div>

        {/* Executive Card */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-amber-500/30 shadow-2xl space-y-5 overflow-hidden">
          {/* Watermark Seal */}
          <div className="absolute -right-6 -bottom-6 text-9xl text-amber-500/5 select-none pointer-events-none">
            <i className="fa-solid fa-stamp" />
          </div>

          {/* Top Info */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">NO. PENGAJUAN</span>
              <div className="text-xs font-mono font-black text-amber-400">{appId}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
              {category}
            </span>
          </div>

          {/* Title & Amount */}
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-black text-white">{title}</h2>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              Rp {amount.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Details */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Pemohon:</span>
              <span className="font-bold text-slate-200">{requester}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-slate-400">Keperluan &amp; Alasan:</span>
              <p className="text-slate-300 italic text-[11px] bg-slate-800/40 p-2 rounded-xl border border-slate-700/50">
                "{reason}"
              </p>
            </div>
          </div>

          {/* STAMP RESULT IF APPROVED */}
          {status === 'APPROVED' && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500 text-center space-y-2 animate-scale-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/40">
                <i className="fa-solid fa-stamp" /> TELAH DISETUJUI (APPROVED)
              </div>
              <p className="text-[11px] text-emerald-300">
                Dana sebesar Rp {amount.toLocaleString('id-ID')} telah disahkan dan otomatis tercatat di Buku Kas Database PostgreSQL.
              </p>
            </div>
          )}

          {/* STAMP RESULT IF REJECTED */}
          {status === 'REJECTED' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-500 text-center space-y-2 animate-scale-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/40">
                ✕ PENGAJUAN DITOLAK
              </div>
              <p className="text-[11px] text-rose-300">
                Pengajuan ditolak oleh Owner. Notifikasi pembatalan telah diteruskan ke staf pemohon.
              </p>
            </div>
          )}

          {/* BIOMETRIC HOLD BUTTON (If Pending) */}
          {status === 'PENDING' && (
            <div className="space-y-4 pt-2">
              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-400">
                  Tahan Tombol Sidik Jari untuk Menyetujui Secara Sah:
                </span>
              </div>

              {/* Glowing Fingerprint Hold Area */}
              <div className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  onMouseDown={() => setIsHolding(true)}
                  onMouseUp={() => setIsHolding(false)}
                  onTouchStart={() => setIsHolding(true)}
                  onTouchEnd={() => setIsHolding(false)}
                  className={`relative w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all cursor-pointer select-none active:scale-95 ${
                    isHolding
                      ? 'bg-gradient-to-tr from-amber-500 to-emerald-400 text-black shadow-2xl shadow-emerald-500/50 scale-105'
                      : 'bg-slate-900 border-2 border-amber-500/40 text-amber-400 hover:border-amber-400 shadow-xl'
                  }`}
                >
                  {/* Circular Progress Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      className="stroke-slate-800"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      className="stroke-emerald-400 transition-all duration-75"
                      strokeWidth="6"
                      strokeDasharray={289}
                      strokeDashoffset={289 - (289 * holdProgress) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <i className={`fa-solid fa-fingerprint ${isHolding ? 'animate-pulse' : ''}`} />
                </button>
                <span className="text-[10px] font-mono text-slate-400 mt-2">
                  {isHolding ? `Memvalidasi Stempel... ${holdProgress}%` : 'Tekan & Tahan 1 Detik'}
                </span>
              </div>

              {/* Secondary Quick Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleDecision('APPROVED')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-black transition-all cursor-pointer"
                >
                  ✓ 1-Klik Setujui
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('REJECTED')}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-black transition-all cursor-pointer"
                >
                  ✕ Tolak Pengajuan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
