'use client';
import React, { useState, useEffect } from 'react';

export default function CostSimulatorPortal() {
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [roomType, setRoomType] = useState('EKSEKUTIF');
  const [duration, setDuration] = useState(12);
  const [withLaundry, setWithLaundry] = useState(true);
  const [withGalon, setWithGalon] = useState(true);
  const [withMakan, setWithMakan] = useState(false);
  const [withParking, setWithParking] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('property')) setProperty(p.get('property')!);
    if (p.get('room')) {
      const r = p.get('room')!.toUpperCase();
      if (r.includes('EKS') || r.includes('EKSEKUTIF')) setRoomType('EKSEKUTIF');
      else if (r.includes('VIP') || r.includes('PV')) setRoomType('VIP');
      else if (r.includes('RES') || r.includes('KOAS') || r.includes('EKONOMI')) setRoomType('EKONOMI');
      else setRoomType('STANDARD');
    }
  }, []);

  const roomPrices: Record<string, { label: string; price: number; icon: string }> = {
    EKSEKUTIF: { label: 'Eksekutif Dokter', price: 1500000, icon: '🏥' },
    STANDARD: { label: 'Nyaman Comfort', price: 1200000, icon: '🏠' },
    VIP: { label: 'Paviliun VIP Suite', price: 2600000, icon: '⭐' },
    EKONOMI: { label: 'Residen Koas', price: 950000, icon: '🎓' },
  };

  const addons = [
    { key: 'withLaundry', icon: '👕', label: 'Laundry Kiloan', sub: '5kg/minggu', price: 280000, state: withLaundry, setter: setWithLaundry },
    { key: 'withGalon', icon: '💧', label: 'Refill Galon Rutin', sub: '4x/bulan', price: 80000, state: withGalon, setter: setWithGalon },
    { key: 'withMakan', icon: '🍳', label: 'Katering Makan Siang', sub: '22 hari kerja/bln', price: 440000, state: withMakan, setter: setWithMakan },
    { key: 'withParking', icon: '🚗', label: 'Parkir Motor', sub: '1 motor bulanan', price: 75000, state: withParking, setter: setWithParking },
  ];

  const room = roomPrices[roomType];
  const addonTotal = addons.filter(a => a.state).reduce((acc, a) => acc + a.price, 0);
  const monthlyTotal = room.price + addonTotal;
  const contractTotal = monthlyTotal * duration;
  const dp = Math.round(room.price * 0.5);
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-calculator text-xs" /><span>SIMULASI BIAYA KOSAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Hitung Estimasi Biaya</h1>
          <p className="text-xs text-slate-400 mt-1">{property}</p>
        </div>

        {/* Room Type Selector */}
        <div className="neu-card rounded-3xl p-5 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">1. Pilih Tipe Kamar</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(roomPrices).map(([key, val]) => (
              <button key={key} onClick={() => setRoomType(key)}
                className={`p-3 rounded-2xl text-left cursor-pointer transition-all ${roomType === key ? 'neu-card border border-emerald-500/25' : 'neu-inset'}`}>
                <div className="text-xl mb-1">{val.icon}</div>
                <div className={`text-xs font-black ${roomType === key ? 'text-[#047857]' : 'text-slate-600 dark:text-slate-300'}`}>{val.label}</div>
                <div className="text-sm font-black font-mono text-slate-800 dark:text-white">{fmt(val.price)}</div>
                <div className="text-[10px] text-slate-400">/bulan</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="neu-card rounded-3xl p-5 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">2. Durasi Kontrak</p>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 6, 12, 24].map(m => (
              <button key={m} onClick={() => setDuration(m)}
                className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${duration === m ? 'neu-card text-[#047857] border border-emerald-500/25' : 'neu-inset text-slate-500'}`}>
                {m} Bln
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="neu-card rounded-3xl p-5 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">3. Layanan Tambahan (Opsional)</p>
          {addons.map(addon => (
            <label key={addon.key} className="flex items-center justify-between p-3 rounded-2xl neu-inset cursor-pointer" onClick={() => addon.setter(!addon.state)}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{addon.icon}</span>
                <div>
                  <div className="text-xs font-black text-slate-700 dark:text-slate-200">{addon.label}</div>
                  <div className="text-[10px] text-slate-400">{addon.sub} • {fmt(addon.price)}/bln</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all ${addon.state ? 'bg-[#047857]' : 'neu-card'}`}>
                {addon.state && <i className="fa-solid fa-check text-white text-[10px]" />}
              </div>
            </label>
          ))}
        </div>

        {/* Result */}
        <div className="neu-card rounded-3xl p-5 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">💡 Estimasi Biaya Total</p>

          {/* Monthly */}
          <div className="p-4 rounded-2xl neu-inset space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-400">Sewa Kamar {room.label}</span><span className="font-bold text-slate-700 dark:text-slate-200">{fmt(room.price)}/bln</span></div>
            {addons.filter(a => a.state).map(a => (
              <div key={a.key} className="flex justify-between"><span className="text-slate-400">+ {a.label}</span><span className="font-bold text-slate-700 dark:text-slate-200">{fmt(a.price)}/bln</span></div>
            ))}
            <div className="border-t border-slate-200/50 dark:border-white/5 pt-2 flex justify-between">
              <span className="font-black text-slate-600 dark:text-slate-300">Total per Bulan</span>
              <span className="font-black text-[#047857]">{fmt(monthlyTotal)}</span>
            </div>
          </div>

          {/* Big Number */}
          <div className="text-center p-4 rounded-2xl bg-[#047857] text-white">
            <div className="text-xs font-bold opacity-80">TOTAL BIAYA {duration} BULAN</div>
            <div className="text-3xl font-black font-mono mt-1">{fmt(contractTotal)}</div>
            <div className="text-xs opacity-70 mt-1">Bayar DP awal: {fmt(dp)}</div>
          </div>

          {/* Savings note for longer duration */}
          {duration >= 12 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <i className="fa-solid fa-piggy-bank text-[#047857] text-sm" />
              <span className="text-xs text-[#047857] font-bold">Kontrak 12+ bulan = bebas biaya admin tahunan!</span>
            </div>
          )}

          <button onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20saya%20ingin%20booking%20kamar%20${encodeURIComponent(room.label)}%20durasi%20${duration}%20bulan`, '_blank')}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95">
            <i className="fa-brands fa-whatsapp" /> Konsultasi & Booking Sekarang
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 pb-4">*Estimasi belum termasuk deposit & biaya listrik bulanan</p>
      </div>
    </div>
  );
}
