'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function ProofUploadPortal() {
  const [task, setTask] = useState('CMP-101');
  const [taskTitle, setTaskTitle] = useState('Servis AC Kamar EKS-02 Kurang Dingin');
  const [staff, setStaff] = useState('Bambang Prasetyo');
  const [room, setRoom] = useState('EKS-02');
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('task')) setTask(p.get('task')!);
    if (p.get('title')) setTaskTitle(p.get('title')!);
    if (p.get('staff')) setStaff(p.get('staff')!);
    if (p.get('room')) setRoom(p.get('room')!);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setPhotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    try {
      await fetch('/api/activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'WORK_COMPLETED_WITH_PROOF',
          payload: { item: `${task}: ${taskTitle}`, roomNumber: room, item2: `Foto bukti: ${photos.length} foto`, notes, completedBy: staff },
        }),
      });
    } catch {}
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
          <i className="fa-solid fa-camera-rotate" />
        </div>
        <div><h2 className="text-xl font-black text-slate-800 dark:text-white">Bukti Pekerjaan Terkirim!</h2>
          <p className="text-xs text-slate-500 mt-2"><strong>{photos.length} foto</strong> bukti pekerjaan <strong className="text-[#047857]">{task}</strong> telah diterima oleh Owner dan dicatat di Dashboard.</p></div>
        <div className="flex flex-wrap justify-center gap-2">
          {photos.map((p, i) => <img key={i} src={p} alt={`Bukti ${i + 1}`} className="w-16 h-16 rounded-xl object-cover neu-card" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 text-xs font-black mb-3">
            <i className="fa-solid fa-camera text-xs" /><span>UPLOAD FOTO BUKTI PEKERJAAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Bukti Pekerjaan Selesai</h1>
          <p className="text-xs text-slate-400 mt-1">{staff} • Tiket #{task}</p>
        </div>

        {/* Task Info */}
        <div className="neu-card rounded-2xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-lg flex-shrink-0">🔧</div>
          <div>
            <div className="text-xs font-black text-slate-800 dark:text-white">{taskTitle}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Kamar {room} • Tiket #{task}</div>
          </div>
        </div>

        <div className="neu-card rounded-3xl p-5 space-y-4">
          {/* Photo Upload */}
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Foto Bukti Pekerjaan</p>
            <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleFile} className="hidden" />
            <button onClick={() => fileRef.current?.click()}
              className="w-full py-8 rounded-2xl neu-inset border-2 border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center gap-2 cursor-pointer hover:border-[#047857]/40 transition-all">
              <i className="fa-solid fa-camera text-2xl text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Klik untuk ambil / pilih foto</span>
              <span className="text-[10px] text-slate-400">Bisa pilih lebih dari 1 foto</span>
            </button>
          </div>

          {/* Photo Preview */}
          {photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{photos.length} Foto Dipilih</span>
                <button onClick={() => setPhotos([])} className="text-[10px] text-rose-500 font-bold cursor-pointer">Hapus Semua</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded-xl neu-card" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center cursor-pointer">✕</button>
                  </div>
                ))}
                <button onClick={() => fileRef.current?.click()}
                  className="h-24 rounded-xl neu-inset flex items-center justify-center text-slate-400 cursor-pointer hover:text-[#047857] transition-all">
                  <i className="fa-solid fa-plus text-xl" />
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Catatan Penyelesaian</label>
            <textarea rows={3} placeholder="Freon AC sudah diisi ulang, filter dibersihkan. AC kembali normal dingin..." value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white outline-none bg-transparent placeholder-slate-400 resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={photos.length === 0 || loading}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40">
            {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Mengirim ke Owner...</> : <><i className="fa-solid fa-paper-plane" /> Laporkan Pekerjaan Selesai ({photos.length} Foto)</>}
          </button>
        </div>
      </div>
    </div>
  );
}
