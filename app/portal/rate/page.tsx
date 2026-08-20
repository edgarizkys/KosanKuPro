'use client';
import React, { useState, useEffect } from 'react';

export default function RatePortal() {
  const [tenant, setTenant] = useState('dr. Rizky Pratama, Sp.A');
  const [task, setTask] = useState('CMP-101');
  const [taskTitle, setTaskTitle] = useState('Servis AC Kamar Kurang Dingin');
  const [staff, setStaff] = useState('Bambang Prasetyo');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [aspects, setAspects] = useState({ kecepatan: 0, keramahan: 0, kerapian: 0, tuntas: 0 });
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenant(p.get('tenant')!);
    if (p.get('task')) setTask(p.get('task')!);
    if (p.get('title')) setTaskTitle(p.get('title')!);
    if (p.get('staff')) setStaff(p.get('staff')!);
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SERVICE_RATED',
          payload: { tenantName: tenant, item: `Rating untuk ${task}: ${taskTitle}`, rating, staff, comment, aspects },
        }),
      });
    } catch {}
    setSubmitted(true);
    setLoading(false);
  };

  const ratingLabels = ['', 'Mengecewakan', 'Kurang Memuaskan', 'Cukup Baik', 'Memuaskan', 'Luar Biasa!'];
  const aspectLabels = { kecepatan: '⚡ Kecepatan Respon', keramahan: '😊 Keramahan Staf', kerapian: '✨ Kerapian Kerja', tuntas: '✅ Tuntas & Bersih' };

  if (submitted) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">⭐</div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Terima Kasih!</h2>
          <p className="text-xs text-slate-500 mt-2">Rating <strong className="text-amber-500">{'★'.repeat(rating)}</strong> untuk {staff} telah diterima dan akan meningkatkan kualitas layanan kami.</p>
        </div>
        <div className="text-4xl">{'⭐'.repeat(rating)}</div>
        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{ratingLabels[rating]}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 text-xs font-black mb-3">
            <i className="fa-solid fa-star text-xs" /><span>RATING & ULASAN LAYANAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Beri Penilaian</h1>
          <p className="text-xs text-slate-400 mt-1">Tiket #{task} — {taskTitle}</p>
        </div>

        <div className="neu-card rounded-3xl p-5 space-y-6">
          {/* Staff Info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl neu-inset">
            <div className="w-12 h-12 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-xl font-black">{staff.charAt(0)}</div>
            <div>
              <div className="text-sm font-black text-slate-800 dark:text-white">{staff}</div>
              <div className="text-xs text-slate-400">Staf Lapangan KosanKu Pro</div>
            </div>
          </div>

          {/* Overall Star Rating */}
          <div className="text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Rating Keseluruhan</p>
            <div className="flex justify-center gap-2 mb-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  className="text-3xl cursor-pointer transition-all active:scale-125">
                  <span className={(hover || rating) >= s ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}>★</span>
                </button>
              ))}
            </div>
            {(hover || rating) > 0 && <p className="text-sm font-black text-amber-500">{ratingLabels[hover || rating]}</p>}
          </div>

          {/* Aspect Ratings */}
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Penilaian Detail</p>
            <div className="space-y-3">
              {(Object.keys(aspectLabels) as Array<keyof typeof aspectLabels>).map(key => (
                <div key={key} className="p-3 rounded-2xl neu-inset">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{aspectLabels[key]}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setAspects(prev => ({ ...prev, [key]: s }))}
                          className={`text-sm cursor-pointer transition-all ${aspects[key] >= s ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}>★</button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Komentar / Saran (Opsional)</label>
            <textarea rows={3} placeholder="Bamabang sangat sigap dan bersih pekerjaannya..." value={comment} onChange={e => setComment(e.target.value)}
              className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white outline-none bg-transparent placeholder-slate-400 resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={rating === 0 || loading}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40">
            {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Mengirim...</> : <><i className="fa-solid fa-star" /> Kirim Rating & Ulasan</>}
          </button>
        </div>
      </div>
    </div>
  );
}
