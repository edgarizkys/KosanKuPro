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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('id')) setOrderId(params.get('id')!);
      if (params.get('item')) setItem(params.get('item')!);
      if (params.get('room')) setRoomNumber(params.get('room')!);
      if (params.get('tenant')) setTenantName(params.get('tenant')!);
      if (params.get('vendor')) setVendorName(params.get('vendor')!);
      const st = params.get('status')?.toUpperCase();
      if (st === 'PROCESSING') setStatus('PROCESSING');
      if (st === 'DELIVERING' || st === 'DIANTAR') setStatus('DELIVERING');
      if (st === 'COMPLETED' || st === 'SELESAI') setStatus('COMPLETED');
    }

    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { id: 'RECEIVED', label: 'Pesanan Diterima', desc: 'Diterima oleh Depot/Warung', icon: 'fa-receipt', done: true },
    { id: 'PROCESSING', label: 'Sedang Disiapkan', desc: 'Item disiapkan & dikemas', icon: 'fa-box-open', done: status !== 'RECEIVED' },
    { id: 'DELIVERING', label: 'Kurir Sedang Mengantar', desc: 'Menuju lantai & kamar Anda', icon: 'fa-motorcycle', done: status === 'DELIVERING' || status === 'COMPLETED', active: status === 'DELIVERING' },
    { id: 'COMPLETED', label: 'Tiba di Depan Kamar', desc: 'Pesanan selesai diserahterimakan', icon: 'fa-circle-check', done: status === 'COMPLETED', active: status === 'COMPLETED' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-md w-full space-y-5">
        {/* Top Floating Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE DELIVERY RADAR
          </div>
          <span className="text-xs font-mono text-slate-400">Order #{orderId}</span>
        </div>

        {/* Animated Delivery Map / Radar Card */}
        <div className="relative h-48 rounded-3xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-slate-800 p-4 overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Radar Circles Animation */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-64 h-64 rounded-full border border-emerald-500 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="w-44 h-44 rounded-full border border-emerald-500" />
            <div className="w-24 h-24 rounded-full border border-emerald-500" />
          </div>

          {/* Animated Route Line */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-4">
            {/* Vendor Depot Icon */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-lg shadow-lg">
                <i className="fa-solid fa-store" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 max-w-[70px] truncate text-center">{vendorName.split(' ')[0]}</span>
            </div>

            {/* Moving Courier Icon Animation */}
            <div className="flex-1 px-4 relative flex items-center justify-center">
              <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 transition-all duration-1000"
                  style={{ width: status === 'DELIVERING' ? '75%' : status === 'COMPLETED' ? '100%' : '35%' }}
                />
              </div>

              {/* Animated Bouncing Motor Icon */}
              <div
                className={`absolute -top-4 w-9 h-9 rounded-full bg-emerald-500 text-black flex items-center justify-center text-sm font-bold shadow-lg shadow-emerald-500/50 transition-all duration-1000 ${
                  status === 'DELIVERING' ? 'animate-bounce' : ''
                }`}
                style={{ left: status === 'DELIVERING' ? '65%' : status === 'COMPLETED' ? '88%' : '25%' }}
              >
                <i className="fa-solid fa-motorcycle" />
              </div>
            </div>

            {/* Room Destination Icon */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg shadow-lg">
                <i className="fa-solid fa-door-closed" />
              </div>
              <span className="text-[10px] font-black text-white">{roomNumber}</span>
            </div>
          </div>

          {/* Live ETA Banner */}
          <div className="relative z-10 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              <div>
                <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Estimasi Tiba (ETA)</div>
                <div className="text-xs font-black text-emerald-400">
                  {status === 'COMPLETED' ? 'Sudah Tiba di Kamar' : `Sekitar ~${etaMinutes} Menit Lagi`}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {status === 'DELIVERING' ? '🚚 OTW Kamar' : status === 'COMPLETED' ? '✅ Selesai' : '⏳ Disiapkan'}
            </span>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 space-y-4 shadow-xl">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white">{item}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Penerima: <span className="text-slate-200 font-bold">{tenantName}</span> (Kamar {roomNumber})
            </div>
          </div>

          {/* Stepper */}
          <div className="space-y-4 pt-1">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-start gap-3 relative">
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-8 w-0.5 h-7 transition-colors ${
                      s.done ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 transition-all ${
                    s.done
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  } ${s.active ? 'ring-4 ring-emerald-500/20 animate-pulse' : ''}`}
                >
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                <div className="pt-0.5">
                  <div className={`text-xs font-bold ${s.done ? 'text-white' : 'text-slate-500'}`}>
                    {s.label}
                  </div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Vendor CTA */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white">{vendorName}</div>
            <div className="text-[10px] text-slate-400">Mitra Resmi KosanKu Pro</div>
          </div>
          <button
            onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20Vendor%20terkait%20pesanan%20${orderId}`, '_blank')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <i className="fa-brands fa-whatsapp text-sm" /> Chat Vendor
          </button>
        </div>
      </div>
    </div>
  );
}
