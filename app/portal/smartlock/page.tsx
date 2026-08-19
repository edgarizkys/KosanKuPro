'use client';

import React, { useState, useEffect } from 'react';

export default function SmartLockPortal() {
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [isLocked, setIsLocked] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [unlockTimer, setUnlockTimer] = useState<number | null>(null);
  const [passcode, setPasscode] = useState('849201');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) setRoomNumber(params.get('room')!);
      if (params.get('tenant')) setTenantName(params.get('tenant')!);
      if (params.get('property')) setProperty(params.get('property')!);
    }
  }, []);

  const handleTapToUnlock = () => {
    if (!isLocked || isScanning) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setIsLocked(false);
      setUnlockTimer(6);
    }, 1200);
  };

  useEffect(() => {
    let interval: any;
    if (unlockTimer !== null && unlockTimer > 0) {
      interval = setInterval(() => {
        setUnlockTimer((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    } else if (unlockTimer === null && !isLocked) {
      setIsLocked(true);
    }
    return () => clearInterval(interval);
  }, [unlockTimer, isLocked]);

  const generateNewPasscode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setPasscode(newCode);
  };

  return (
    <div className="min-h-screen bg-[#070b11] text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-wider uppercase">
            <i className="fa-solid fa-key text-xs" /> KOSANKU SMART LOCK IOT
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Digital Keycard &amp; Door Access</h1>
          <p className="text-xs text-slate-400">{property}</p>
        </div>

        {/* 3D Holographic NFC Keycard */}
        <div
          onClick={handleTapToUnlock}
          className="relative h-56 sm:h-60 rounded-3xl p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between"
          style={{
            boxShadow: isScanning
              ? '0 0 50px rgba(6, 182, 212, 0.4)'
              : !isLocked
              ? '0 0 50px rgba(16, 185, 129, 0.4)'
              : '0 20px 40px -15px rgba(0,0,0,0.8)',
          }}
        >
          {/* Holographic Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

          {/* Laser Scan Beam Animation */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scan_1.2s_ease-in-out_infinite]" />
          )}

          {/* Card Top */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-base">
                <i className="fa-solid fa-bolt" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">SMART KEYCARD</span>
                <span className="text-xs font-black text-white">KosanKu Pro NFC</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono font-bold text-cyan-300">
              <i className="fa-solid fa-wifi rotate-90 text-xs" /> NFC READY
            </div>
          </div>

          {/* Card Center: Unit Big Number */}
          <div className="relative z-10 text-center py-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">UNIT KAMAR</span>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              Kamar {roomNumber}
            </span>
          </div>

          {/* Card Bottom */}
          <div className="flex items-end justify-between relative z-10 border-t border-white/10 pt-3 text-xs">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">PENGHUNI RESMI</span>
              <span className="font-extrabold text-white block">{tenantName}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">STATUS KUNCI</span>
              <span className={`font-black text-xs ${!isLocked ? 'text-emerald-400' : 'text-cyan-400'}`}>
                {isScanning ? 'MEMINDAI...' : !isLocked ? `TERBUKA (${unlockTimer}s)` : 'TERKUNCI 🔒'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button & Lock Status */}
        <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 text-center shadow-xl">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                !isLocked
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/30'
                  : isScanning
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              <i className={`fa-solid ${!isLocked ? 'fa-lock-open' : 'fa-lock'}`} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-400">Status Smart Lock Pintu:</div>
              <div className={`text-base font-black ${!isLocked ? 'text-emerald-400' : 'text-white'}`}>
                {!isLocked ? 'Kunci Pintu Terbuka (Unlocked)' : 'Pintu Terkunci Rapat (Secured)'}
              </div>
            </div>
          </div>

          <button
            onClick={handleTapToUnlock}
            disabled={!isLocked || isScanning}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl ${
              !isLocked
                ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                : isScanning
                ? 'bg-cyan-500 text-black animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/30 active:scale-95'
            }`}
          >
            <i className="fa-solid fa-fingerprint text-lg" />
            {isScanning
              ? 'Memverifikasi Akses Enkripsi NFC...'
              : !isLocked
              ? `Pintu Terbuka! Otomatis Mengunci dalam ${unlockTimer}s`
              : 'Sentuh untuk Buka Pintu Kamar (Tap to Unlock)'}
          </button>

          {/* Backup Passcode Generator */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="text-left">
              <span className="text-[10px] block">PIN Darurat Keypad Pintu:</span>
              <code className="text-sm font-mono font-black text-amber-400 tracking-widest">{passcode}</code>
            </div>
            <button
              onClick={generateNewPasscode}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer transition-all"
            >
              🔄 Buat PIN Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
