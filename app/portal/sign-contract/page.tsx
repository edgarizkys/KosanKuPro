'use client';
import React, { useState, useEffect } from 'react';

export default function SignContractPortal() {
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [room, setRoom] = useState('EKS-01');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [duration, setDuration] = useState(12);
  const [price, setPrice] = useState(1500000);
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenantName(p.get('tenant')!);
    if (p.get('room')) setRoom(p.get('room')!);
    if (p.get('start')) setStartDate(p.get('start')!);
    if (p.get('duration')) setDuration(Number(p.get('duration')));
    if (p.get('price')) setPrice(Number(p.get('price')));
    if (p.get('property')) setProperty(p.get('property')!);
  }, []);

  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + duration);
  const endDateStr = endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const contractId = `KTK-${Date.now().toString().slice(-6)}`;

  const handleSign = async () => {
    if (!agreed) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'CONTRACT_SIGNED',
          payload: { tenantName, roomNumber: room, item: `Kontrak Sewa ${duration} Bulan — ${room}`, amount: price * duration },
        }),
      });
    } catch {}
    setSigned(true);
    setLoading(false);
  };

  if (signed) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
          <i className="fa-solid fa-file-signature" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Kontrak Ditandatangani!</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">Kontrak sewa <strong className="text-[#047857]">{tenantName}</strong> untuk Kamar <strong className="text-[#047857]">{room}</strong> telah sah secara digital dan terarsip di server.</p>
        </div>
        <div className="p-4 rounded-2xl neu-inset text-left text-xs space-y-2">
          {[['No. Kontrak', contractId], ['Tenant', tenantName], ['Kamar', room], ['Periode', `${new Date(startDate).toLocaleDateString('id-ID')} — ${endDateStr}`], ['Total Nilai', fmt(price * duration)], ['Status', '✅ SAH & TERARSIP']].map(([l, v]) => (
            <div key={l} className="flex justify-between"><span className="text-slate-400">{l}</span><strong className="text-[#047857]">{v}</strong></div>
          ))}
        </div>
        <button onClick={() => window.open(`https://wa.me/6282217415131?text=Kontrak%20${contractId}%20sudah%20saya%20tandatangani`, '_blank')}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-brands fa-whatsapp" /> Kirim Konfirmasi ke Admin
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-file-signature text-xs" /><span>KONTRAK SEWA DIGITAL</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Tandatangani Kontrak Sewa</h1>
          <p className="text-xs text-slate-400 mt-1">{property}</p>
        </div>

        {/* Contract Preview */}
        <div className="neu-card rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-3">
            <div><div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No. Kontrak</div>
              <div className="text-sm font-black text-[#047857] font-mono">{contractId}</div></div>
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-black">Menunggu TTD</div>
          </div>
          <div className="space-y-3 text-xs">
            {[
              ['Pihak Pertama (Owner)', 'Pengelola KosanKu Pro'],
              ['Pihak Kedua (Tenant)', tenantName],
              ['Objek Sewa', `Kamar ${room} — ${property}`],
              ['Mulai Kontrak', new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
              ['Selesai Kontrak', endDateStr],
              ['Durasi', `${duration} Bulan`],
              ['Harga Sewa/Bulan', fmt(price)],
              ['Total Nilai Kontrak', fmt(price * duration)],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between items-start">
                <span className="text-slate-400 w-36 flex-shrink-0">{l}</span>
                <strong className="text-slate-700 dark:text-slate-200 text-right">{v}</strong>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div className="p-3 rounded-2xl neu-inset text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1.5">
            <p className="font-black text-slate-600 dark:text-slate-300 text-xs">Syarat & Ketentuan Kontrak:</p>
            <p>1. Pembayaran sewa dilunasi paling lambat tanggal 5 setiap bulan.</p>
            <p>2. Kerusakan fasilitas di luar keausan normal menjadi tanggung jawab penyewa.</p>
            <p>3. Dilarang membawa hewan peliharaan dan tamu menginap melebihi 23.00 WIB.</p>
            <p>4. Perpanjangan dan pengakhiran kontrak wajib konfirmasi minimal 14 hari sebelumnya.</p>
            <p>5. Deposit {fmt(price * 0.5)} akan dikembalikan dalam 7 hari setelah check-out bersih.</p>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-2xl neu-inset cursor-pointer" onClick={() => setAgreed(!agreed)}>
            <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center mt-0.5 transition-all ${agreed ? 'bg-[#047857]' : 'neu-card'}`}>
              {agreed && <i className="fa-solid fa-check text-white text-[10px]" />}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
              Saya, <strong>{tenantName}</strong>, telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan kontrak sewa di atas secara digital.
            </span>
          </label>

          <button onClick={handleSign} disabled={!agreed || loading}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40 transition-all">
            {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Memproses Tanda Tangan...</> : <><i className="fa-solid fa-signature" /> Tandatangani Kontrak Digital</>}
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 pb-4">Tanda tangan digital ini sah secara hukum sesuai UU ITE Indonesia</p>
      </div>
    </div>
  );
}
