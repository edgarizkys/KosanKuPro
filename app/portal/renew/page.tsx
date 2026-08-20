'use client';
import React, { useState, useEffect } from 'react';

export default function RenewContractPortal() {
  const [tenant, setTenant] = useState('dr. Rizky Pratama, Sp.A');
  const [room, setRoom] = useState('EKS-01');
  const [price, setPrice] = useState(1500000);
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [duration, setDuration] = useState(12);
  const [startDate, setStartDate] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenant(p.get('tenant')!);
    if (p.get('room')) setRoom(p.get('room')!);
    if (p.get('price')) setPrice(Number(p.get('price')));
    if (p.get('property')) setProperty(p.get('property')!);
    // Default start date = today
    setStartDate(new Date().toISOString().slice(0, 10));
  }, []);

  const endDate = new Date(startDate || Date.now());
  endDate.setMonth(endDate.getMonth() + duration);
  const dp = Math.round(price * 0.5);
  const total = price * duration;
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'CONTRACT_RENEWED',
          payload: { tenantName: tenant, roomNumber: room, item: `Perpanjang Kontrak ${duration} Bulan — ${room}`, amount: dp },
        }),
      });
    } catch {}
    setConfirmed(true);
    setLoading(false);
  };

  const fmtDate = (d: Date) => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (confirmed) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">🔄</div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Perpanjangan Dikonfirmasi!</h2>
          <p className="text-xs text-slate-500 mt-2">Kontrak Kamar <strong className="text-[#047857]">{room}</strong> untuk <strong className="text-[#047857]">{tenant}</strong> berhasil diperpanjang {duration} bulan.</p>
        </div>
        <div className="p-4 rounded-2xl neu-inset text-left text-xs space-y-2">
          {[['Kamar', room], ['Mulai Baru', fmtDate(new Date(startDate))], ['Selesai', fmtDate(endDate)], ['Durasi', `${duration} Bulan`], ['Total Kontrak', fmt(total)], ['DP Dibayar', fmt(dp)]].map(([l, v]) => (
            <div key={l} className="flex justify-between"><span className="text-slate-400">{l}</span><strong className="text-[#047857]">{v}</strong></div>
          ))}
        </div>
        <button onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20saya%20${encodeURIComponent(tenant)}%20sudah%20konfirmasi%20perpanjangan%20Kamar%20${room}`, '_blank')}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-brands fa-whatsapp" /> Konfirmasi via WhatsApp Admin
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-rotate text-xs" /><span>PERPANJANG KONTRAK SEWA</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Perpanjangan Sewa Kamar</h1>
          <p className="text-xs text-slate-400 mt-1">{tenant} • Kamar {room}</p>
        </div>

        {/* Current Contract Info */}
        <div className="neu-card rounded-3xl p-5 space-y-4">
          <div className="p-3 rounded-2xl neu-inset flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#047857] text-white flex items-center justify-center text-lg flex-shrink-0">🏠</div>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">Kamar {room}</div>
              <div className="text-[10px] text-slate-400">{property}</div>
              <div className="text-xs font-black text-[#047857] font-mono">{fmt(price)}<span className="text-slate-400 font-normal">/bulan</span></div>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Durasi Perpanjangan</label>
            <div className="flex flex-wrap gap-2">
              {[1, 3, 6, 12, 24].map(m => (
                <button key={m} onClick={() => setDuration(m)}
                  className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${duration === m ? 'neu-card text-[#047857] border border-emerald-500/25' : 'neu-inset text-slate-500'}`}>
                  {m} Bulan
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Mulai Perpanjangan</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent" />
          </div>

          {/* Summary */}
          <div className="p-4 rounded-2xl neu-inset space-y-2 text-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Ringkasan Perpanjangan</p>
            {[
              ['Periode Baru', `${fmtDate(new Date(startDate || Date.now()))} — ${fmtDate(endDate)}`],
              ['Durasi', `${duration} Bulan`],
              ['Harga/Bulan', fmt(price)],
              ['Total Nilai', fmt(total)],
              ['DP Awal (50%)', fmt(dp)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-slate-400">{l}</span>
                <strong className={l === 'DP Awal (50%)' ? 'text-[#047857]' : 'text-slate-700 dark:text-slate-200'}>{v}</strong>
              </div>
            ))}
            <div className="border-t border-slate-200/50 dark:border-white/5 pt-2 flex justify-between">
              <span className="font-black text-slate-700 dark:text-slate-200">Bayar Sekarang (DP)</span>
              <span className="text-lg font-black text-[#047857] font-mono">{fmt(dp)}</span>
            </div>
          </div>

          <button onClick={handleConfirm} disabled={loading}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50">
            {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Memproses...</> : <><i className="fa-solid fa-rotate" /> Konfirmasi Perpanjangan & Bayar DP</>}
          </button>
        </div>
      </div>
    </div>
  );
}
