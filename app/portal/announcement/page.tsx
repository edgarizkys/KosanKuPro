'use client';
import React, { useState, useEffect } from 'react';

export default function AnnouncementPortal() {
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [ownerName, setOwnerName] = useState('Owner KosanKu Pro');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'INFO' | 'PENTING' | 'DARURAT'>('INFO');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('property')) setProperty(p.get('property')!);
    if (p.get('owner')) setOwnerName(p.get('owner')!);
  }, []);

  const templates = [
    { icon: '🚰', label: 'Mati Air', msg: 'Pemberitahuan: Akan ada pemadaman air bersih pada hari [TANGGAL] mulai pukul 08.00 - 16.00 WIB untuk perbaikan jaringan PDAM. Mohon persiapkan cadangan air secukupnya.' },
    { icon: '💡', label: 'Mati Listrik', msg: 'Info PLN: Akan ada pemadaman listrik terencana pada [TANGGAL] pukul 09.00 - 13.00 WIB. Mohon simpan pekerjaan digital Anda sebelum waktu tersebut.' },
    { icon: '🧹', label: 'Jadwal Bersih', msg: 'Pengumuman jadwal bersih-bersih kamar mandi bersama & area umum: setiap Sabtu pukul 08.00 WIB. Mohon kerja sama seluruh penghuni.' },
    { icon: '🔧', label: 'Renovasi', msg: 'Akan ada pekerjaan renovasi/perbaikan di [LOKASI] selama [DURASI]. Mohon maaf atas ketidaknyamanan yang ditimbulkan.' },
    { icon: '🎉', label: 'Event Kosan', msg: 'Halo penghuni! Kami mengundang Anda ke acara Gathering Penghuni KosanKu Pro pada [TANGGAL] pukul 19.00 WIB di Area Bersama Lantai 1.' },
  ];

  const urgencyConfig = {
    INFO: { color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20', label: 'ℹ️ Info Umum' },
    PENTING: { color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/20', label: '⚠️ Penting' },
    DARURAT: { color: 'text-rose-600', bg: 'bg-rose-500/10 border-rose-500/20', label: '🚨 Darurat' },
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'OWNER_BROADCAST',
          payload: { title, message, urgency, property, sentBy: ownerName },
        }),
      });
    } catch {}
    setSent(true);
    setLoading(false);
  };

  if (sent) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
          <i className="fa-solid fa-bullhorn" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Pengumuman Terkirim!</h2>
          <p className="text-xs text-slate-500 mt-2">Pengumuman <strong className="text-[#047857]">"{title}"</strong> telah diteruskan ke seluruh penghuni {property} dan tercatat di Dashboard.</p>
        </div>
        <button onClick={() => { setSent(false); setTitle(''); setMessage(''); }}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] cursor-pointer">
          Buat Pengumuman Baru
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-bullhorn text-xs" /><span>BROADCAST PENGUMUMAN OWNER</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Kirim Pengumuman</h1>
          <p className="text-xs text-slate-400 mt-1">{property}</p>
        </div>

        {/* Urgency Selector */}
        <div className="neu-inset rounded-2xl p-1.5 flex gap-1.5">
          {(['INFO', 'PENTING', 'DARURAT'] as const).map(u => (
            <button key={u} onClick={() => setUrgency(u)}
              className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${urgency === u ? 'neu-card ' + urgencyConfig[u].color : 'text-slate-400'}`}>
              {urgencyConfig[u].label}
            </button>
          ))}
        </div>

        <div className="neu-card rounded-3xl p-5 space-y-4">
          {/* Templates */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Template Cepat</p>
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <button key={t.label} onClick={() => { setTitle(t.label); setMessage(t.msg); }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl neu-inset text-xs font-bold text-slate-500 cursor-pointer hover:text-[#047857] transition-all whitespace-nowrap">
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Judul Pengumuman *</label>
            <input type="text" placeholder="Pemberitahuan Pemadaman Air" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Isi Pengumuman *</label>
            <textarea rows={5} placeholder="Tuliskan isi pengumuman yang akan dikirim ke seluruh penghuni kosan..." value={message} onChange={e => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-semibold outline-none bg-transparent placeholder-slate-400 resize-none" />
          </div>

          {/* Preview */}
          {title && message && (
            <div className={`p-3.5 rounded-2xl border ${urgencyConfig[urgency].bg}`}>
              <div className={`text-xs font-black ${urgencyConfig[urgency].color} mb-1`}>{urgencyConfig[urgency].label} — {title}</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
              <div className="text-[10px] text-slate-400 mt-2">Dari: {ownerName} • {property}</div>
            </div>
          )}

          <button onClick={handleSend} disabled={!title.trim() || !message.trim() || loading}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40">
            {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Mengirim ke Semua Penghuni...</> : <><i className="fa-solid fa-paper-plane" /> Kirim ke Seluruh Penghuni {property.split(' ')[0]}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
