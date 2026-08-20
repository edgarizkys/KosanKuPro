'use client';

import React, { useState, useEffect } from 'react';

export default function LiveOrderTrackerPortal() {
  const [orderId, setOrderId] = useState('REQ-3278');
  const [item, setItem] = useState('Refill Air Galon Aqua 19L (1x)');
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [vendorName, setVendorName] = useState('Depot Air & Gas Suci');
  const [status, setStatus] = useState<'RECEIVED' | 'PROCESSING' | 'DELIVERING' | 'COMPLETED'>('DELIVERING');
  const [etaMinutes, setEtaMinutes] = useState(3);
  const [copiedToast, setCopiedToast] = useState(false);

  // Driver details in Gojek / Grab style
  const driverName = 'Pak Joko Susilo';
  const driverRating = '4.9';
  const driverVehicle = 'Honda Vario • D 4921 ABC';
  const driverPhone = '085712345678';

  useEffect(() => {
    async function loadLiveTracking() {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 'REQ-3278';
        setOrderId(id);
        if (params.get('item')) setItem(params.get('item')!);
        if (params.get('room')) setRoomNumber(params.get('room')!);
        if (params.get('tenant')) setTenantName(params.get('tenant')!);
        if (params.get('vendor')) setVendorName(params.get('vendor')!);

        const st = params.get('status')?.toUpperCase();
        if (st === 'PROCESSING') setStatus('PROCESSING');
        if (st === 'DELIVERING' || st === 'DIANTAR') setStatus('DELIVERING');
        if (st === 'COMPLETED' || st === 'DELIVERED' || st === 'SELESAI') setStatus('COMPLETED');

        // Live fetch from database API
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

  const handleShareTracking = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://rshs.kosankupro.cloud/portal/track?id=${orderId}`;
    const text = encodeURIComponent(`🛵 *Lacak Pesanan KosanKu Pro Secara Live*\nItem: ${item}\nTujuan: Kamar ${roomNumber} (${tenantName})\n\n📍 *Buka Radar Pelacakan Real-Time:*\n${shareUrl}`);
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3500);

    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const steps = [
    { id: 'RECEIVED', label: 'Pesanan Dikonfirmasi', desc: 'Diterima oleh sistem & vendor', done: true },
    { id: 'PROCESSING', label: 'Disiapkan di Depot / Warung', desc: 'Item dicek & siap diantar', done: status !== 'RECEIVED' },
    { id: 'DELIVERING', label: 'Kurir Sedang Mengantar', desc: 'Menuju lantai & pintu kamar Anda', done: status === 'DELIVERING' || status === 'COMPLETED', active: status === 'DELIVERING' },
    { id: 'COMPLETED', label: 'Tiba di Depan Pintu Kamar', desc: 'Pesanan selesai diserahkan', done: status === 'COMPLETED', active: status === 'COMPLETED' },
  ];

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Top Floating Badge & Share Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE SHARE TRACKING</span>
          </div>

          <button
            type="button"
            onClick={handleShareTracking}
            className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#047857] dark:hover:text-emerald-400 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <i className="fa-solid fa-share-nodes text-xs" />
            <span>Bagikan</span>
          </button>
        </div>

        {/* Copy Toast Alert */}
        {copiedToast && (
          <div className="p-3 rounded-2xl bg-[#047857] text-white text-xs font-bold shadow-md flex items-center gap-2 animate-scale-in">
            <i className="fa-solid fa-circle-check text-sm" />
            <span>Link pelacakan live berhasil disalin & siap dibagikan!</span>
          </div>
        )}

        {/* Main Card (Gojek / Grab Style) */}
        <div className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Simulated Animated GPS Map Banner */}
          <div className="relative h-40 rounded-2xl neu-inset p-4 overflow-hidden flex flex-col justify-between">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#047857_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Info inside Map */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-[#047857] dark:text-emerald-400 border border-emerald-500/20">
                Juragan Kost Pasteur (Depan RSHS)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                #{orderId}
              </span>
            </div>

            {/* Visual Route Illustration (Depot -> Moving Motor -> Room) */}
            <div className="relative z-10 flex items-center justify-between px-4 py-2">
              {/* Start Point */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl neu-card-sm flex items-center justify-center text-sm text-[#047857] dark:text-emerald-400">
                  <i className="fa-solid fa-store" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 max-w-[65px] truncate text-center">
                  Depot Suci
                </span>
              </div>

              {/* Path Line with Moving Courier */}
              <div className="flex-1 mx-3 relative flex items-center">
                <div className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-full" />
                <div
                  className={`absolute transition-all duration-1000 ${
                    status === 'COMPLETED'
                      ? 'right-0'
                      : status === 'DELIVERING'
                      ? 'left-1/2 -translate-x-1/2'
                      : 'left-0'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#047857] text-white flex items-center justify-center text-xs shadow-lg animate-bounce">
                    <i className="fa-solid fa-motorcycle" />
                  </div>
                </div>
              </div>

              {/* Destination Point */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl neu-card-sm border border-emerald-500/30 flex items-center justify-center text-sm text-emerald-600 dark:text-emerald-400">
                  <i className="fa-solid fa-door-open" />
                </div>
                <span className="text-[9px] font-bold text-[#047857] dark:text-emerald-400 mt-1">
                  Kamar {roomNumber}
                </span>
              </div>
            </div>

            {/* Bottom ETA bar inside map */}
            <div className="relative z-10 flex items-center justify-between text-xs">
              <span className="font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                <i className="fa-solid fa-location-dot text-[#047857] dark:text-emerald-400 text-xs" />
                {status === 'COMPLETED'
                  ? 'Pesanan Telah Tiba di Kamar'
                  : 'Kurir Sedang Menuju Kamarmu'}
              </span>
              {status === 'DELIVERING' && (
                <span className="text-xs font-black text-[#047857] dark:text-emerald-400">
                  ~{etaMinutes} Menit
                </span>
              )}
            </div>
          </div>

          {/* Gojek/Grab Style Driver Card */}
          <div className="p-4 rounded-2xl neu-card-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-lg text-slate-600 dark:text-slate-300 font-black">
                <i className="fa-solid fa-helmet-safety text-[#047857] dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {driverName}
                  </span>
                  <span className="text-[10px] font-bold text-amber-500 flex items-center">
                    ★ {driverRating}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{driverVehicle}</p>
                <p className="text-[10px] text-[#047857] dark:text-emerald-400 font-bold">
                  Mitra Resmi KosanKu Pro
                </p>
              </div>
            </div>

            {/* Contact Driver Action */}
            <a
              href={`https://wa.me/62${driverPhone.slice(1)}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl neu-btn text-[#047857] dark:text-emerald-400 flex items-center justify-center cursor-pointer transition-all active:scale-95"
            >
              <i className="fa-brands fa-whatsapp text-base text-emerald-600" />
            </a>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl neu-inset space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Rincian Pesanan:</span>
              <span className="text-[#047857] dark:text-emerald-400 font-bold text-[10px]">LUNAS</span>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white">{item}</p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Pemesan: <strong className="text-slate-700 dark:text-slate-200">{tenantName}</strong></span>
              <span>Unit: <strong className="text-slate-700 dark:text-slate-200">Kamar {roomNumber}</strong></span>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              PROGRES PENGANTARAN:
            </span>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                    step.active
                      ? 'neu-card-sm border-2 border-[#047857]'
                      : step.done
                      ? 'neu-card-sm opacity-95'
                      : 'neu-inset opacity-45'
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
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Pelacakan Posisi GPS &amp; Status Real-Time KosanKu Pro
        </p>
      </div>
    </div>
  );
}
