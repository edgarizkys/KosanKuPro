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
    async function loadSmartLockData() {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('room')) setRoomNumber(params.get('room')!);
        if (params.get('tenant')) setTenantName(params.get('tenant')!);
        if (params.get('property')) setProperty(params.get('property')!);

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

    loadSmartLockData();
  }, []);

  const handleTapToUnlock = () => {
    if (!isLocked || isScanning) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setIsLocked(false);
      setUnlockTimer(6);
    }, 1000);
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
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black">
            <i className="fa-solid fa-key text-xs" />
            <span>KOSANKU SMART LOCK IOT</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            Kamar {roomNumber}
          </span>
        </div>

        {/* Main Card */}
        <div className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Location & Tenant Info */}
          <div className="border-b border-slate-200/50 dark:border-white/5 pb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PINTU AKSES KAMAR
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-[#047857] dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                Kamar {roomNumber}
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-white">{tenantName}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{property}</p>
          </div>

          {/* Smart Lock Status Widget */}
          <div className="p-6 rounded-2xl neu-inset text-center space-y-3">
            <div
              onClick={handleTapToUnlock}
              className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl cursor-pointer transition-all ${
                isScanning
                  ? 'neu-card animate-pulse text-amber-500'
                  : isLocked
                  ? 'neu-btn text-slate-600 dark:text-slate-300 hover:text-[#047857] dark:hover:text-emerald-400'
                  : 'bg-[#047857] text-white shadow-lg'
              }`}
            >
              {isScanning ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : isLocked ? (
                <i className="fa-solid fa-lock" />
              ) : (
                <i className="fa-solid fa-lock-open" />
              )}
            </div>

            <div>
              <span className="text-sm font-black block text-slate-800 dark:text-white">
                {isScanning
                  ? 'Memverifikasi Akses...'
                  : isLocked
                  ? 'Sentuh Tombol untuk Membuka'
                  : `Pintu Terbuka (${unlockTimer}s)`}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {isLocked ? 'Status: Terkunci Rapat' : 'Pintu akan otomatis mengunci kembali'}
              </span>
            </div>
          </div>

          {/* Passcode Backup */}
          <div className="p-4 rounded-2xl neu-card-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                PIN Darurat Keypad
              </span>
              <span className="text-lg font-mono font-black text-slate-800 dark:text-white tracking-widest block">
                {passcode}
              </span>
            </div>
            <button
              type="button"
              onClick={generateNewPasscode}
              className="p-2.5 rounded-xl neu-btn text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#047857] dark:hover:text-emerald-400 transition-all cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-arrows-rotate text-xs" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Sistem Smart Lock Terenkripsi IoT KosanKu Pro
        </p>
      </div>
    </div>
  );
}
