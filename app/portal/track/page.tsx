'use client';

import React, { useState, useEffect } from 'react';

export default function LiveOrderTrackerPortal() {
  const [orderId, setOrderId] = useState('REQ-9901');
  const [item, setItem] = useState('Refill Air Galon Aqua 19L (1x)');
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [vendorName, setVendorName] = useState('Depot Air & Gas Suci');
  const [status, setStatus] = useState<'RECEIVED' | 'PROCESSING' | 'DELIVERING' | 'COMPLETED'>('DELIVERING');
  const [etaMinutes, setEtaMinutes] = useState(4);

  useEffect(() => {
    async function loadLiveTracking() {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 'REQ-9901';
        setOrderId(id);
        if (params.get('item')) setItem(params.get('item')!);
        if (params.get('room')) setRoomNumber(params.get('room')!);
        if (params.get('tenant')) setTenantName(params.get('tenant')!);
        if (params.get('vendor')) setVendorName(params.get('vendor')!);

        const st = params.get('status')?.toUpperCase();
        if (st === 'PROCESSING') setStatus('PROCESSING');
        if (st === 'DELIVERING' || st === 'DIANTAR') setStatus('DELIVERING');
        if (st === 'COMPLETED' || st === 'DELIVERED' || st === 'SELESAI') setStatus('COMPLETED');

        // Fetch live order from API
        try {
          const res = await fetch('/api/orders');
          if (res.ok) {
            const json = await res.json();
            if (json?.data && Array.isArray(json.data)) {
              const found = json.data.find((o: any) => o.id.toLowerCase() === id.toLowerCase());
              if (found) {
                setItem(found.item || item);
                setRoomNumber(found.roomNumber || roomNumber);
                setTenantName(found.tenantName || tenantName);
                setVendorName(found.vendorName || vendorName);
                if (found.status === 'DELIVERED') setStatus('COMPLETED');
                else if (found.status === 'PROCESSING') setStatus('DELIVERING');
                else if (found.status === 'PENDING_DISPATCH') setStatus('PROCESSING');
              }
            }
          }
        } catch {}
      }
    }

    loadLiveTracking();

    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);
    return () => clearInterval(timer);
  }, [item, roomNumber, tenantName, vendorName]);

  const steps = [
    { id: 'RECEIVED', label: 'Pesanan Diterima', desc: 'Diterima oleh Depot/Warung', done: true },
    { id: 'PROCESSING', label: 'Sedang Disiapkan', desc: 'Item disiapkan & dikemas', done: status !== 'RECEIVED' },
    { id: 'DELIVERING', label: 'Kurir Sedang Mengantar', desc: 'Menuju lantai & kamar Anda', done: status === 'DELIVERING' || status === 'COMPLETED', active: status === 'DELIVERING' },
    { id: 'COMPLETED', label: 'Tiba di Depan Kamar', desc: 'Pesanan selesai diserahterimakan', done: status === 'COMPLETED', active: status === 'COMPLETED' },
  ];

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RADAR PELACAKAN KURIR</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            #{orderId}
          </span>
        </div>

        {/* Animated Radar Card */}
        <div className="neu-card rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-[#047857] dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                Kamar {roomNumber}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white">{tenantName}</span>
            </div>
            {status === 'DELIVERING' && (
              <span className="text-xs font-black text-[#047857] dark:text-emerald-400 animate-pulse">
                ETA: ~{etaMinutes} Menit
              </span>
            )}
          </div>

          {/* Item details */}
          <div className="p-3 rounded-2xl neu-inset">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pesanan</span>
            <p className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{item}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Mitra: {vendorName}</p>
          </div>

          {/* Progress Timeline */}
          <div className="space-y-2 pt-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                  step.active
                    ? 'neu-card-sm border-2 border-[#047857]'
                    : step.done
                    ? 'neu-card-sm opacity-90'
                    : 'neu-inset opacity-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block text-slate-800 dark:text-white">
                    {idx + 1}. {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{step.desc}</span>
                </div>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                    step.done
                      ? 'bg-[#047857] text-white'
                      : 'neu-inset text-transparent'
                  }`}
                >
                  {step.done && <i className="fa-solid fa-check text-[10px]" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Pelacakan Posisi Real-Time KosanKu Pro
        </p>
      </div>
    </div>
  );
}
