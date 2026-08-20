'use client';
import React, { useState, useEffect } from 'react';

export default function SurveySchedulePortal() {
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [interest, setInterest] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const timeSlots = ['09.00', '10.00', '11.00', '13.00', '14.00', '15.00', '16.00', '17.00', '18.00', '19.00'];
  const rooms = ['Eksekutif Dokter (Rp 1.5jt)', 'Nyaman Comfort (Rp 1.2jt)', 'Paviliun VIP (Rp 2.6jt)', 'Residen Koas (Rp 950rb)', 'Belum tahu, mau lihat dulu'];

  // Build next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { value: d.toISOString().slice(0, 10), label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('property')) setProperty(p.get('property')!);
    if (p.get('name')) setName(p.get('name')!);
    if (p.get('phone')) setPhone(p.get('phone')!);
  }, []);

  const handleConfirm = async () => {
    if (!name || !phone || !selectedDate || !selectedTime) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    try {
      await fetch('/api/activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'SURVEY_SCHEDULED',
          payload: { tenantName: name, item: `Jadwal Survei ${property}`, date: selectedDate, time: selectedTime, interest, phone, job },
        }),
      });
    } catch {}
    setConfirmed(true);
    setLoading(false);
  };

  if (confirmed) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
          <i className="fa-solid fa-calendar-check" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Jadwal Survei Terkonfirmasi!</h2>
          <p className="text-xs text-slate-500 mt-2">Tim KosanKu Pro akan menghubungi <strong className="text-[#047857]">{name}</strong> di <strong>{phone}</strong> untuk konfirmasi.</p>
        </div>
        <div className="p-4 rounded-2xl neu-inset text-left text-xs space-y-2">
          {[['Nama', name], ['Lokasi', property], ['Tanggal', new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })], ['Jam', `${selectedTime} WIB`], ['Minat Kamar', interest || 'Belum ditentukan']].map(([l, v]) => (
            <div key={l} className="flex justify-between"><span className="text-slate-400">{l}</span><strong className="text-[#047857]">{v}</strong></div>
          ))}
        </div>
        <button onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20nama%20saya%20${encodeURIComponent(name)}%20ingin%20konfirmasi%20jadwal%20survei%20tanggal%20${selectedDate}%20jam%20${selectedTime}`, '_blank')}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-brands fa-whatsapp" /> Simpan via WhatsApp
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-calendar-plus text-xs" /><span>JADWAL SURVEI KOSAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Booking Jadwal Survei</h1>
          <p className="text-xs text-slate-400 mt-1">{property}</p>
        </div>

        <div className="neu-card rounded-3xl p-5 space-y-5">
          {/* Data Diri */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-2">Data Diri Calon Penghuni</p>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Nama Lengkap *</label>
              <input type="text" placeholder="dr. Ahmad Fauzi" value={name} onChange={e => setName(e.target.value)} required
                className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">No. WhatsApp *</label>
                <input type="tel" placeholder="08123456789" value={phone} onChange={e => setPhone(e.target.value)} required
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Profesi</label>
                <input type="text" placeholder="Dokter / Mahasiswa" value={job} onChange={e => setJob(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400" />
              </div>
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Pilih Tanggal Survei *</p>
            <div className="grid grid-cols-4 gap-2">
              {next7Days.map(d => (
                <button key={d.value} onClick={() => setSelectedDate(d.value)}
                  className={`flex-shrink-0 px-3 py-2.5 rounded-xl text-center cursor-pointer transition-all ${selectedDate === d.value ? 'neu-card text-[#047857] border border-emerald-500/25' : 'neu-inset text-slate-500'}`}>
                  <div className="text-[10px] font-bold">{d.label.split(' ')[0]}</div>
                  <div className="text-sm font-black">{d.label.split(' ')[1]}</div>
                  <div className="text-[9px] text-slate-400">{d.label.split(' ')[2]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Pilih Jam Survei *</p>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${selectedTime === t ? 'neu-card text-[#047857] border border-emerald-500/25' : 'neu-inset text-slate-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Room Interest */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Minat Kamar (Opsional)</p>
            <div className="space-y-1.5">
              {rooms.map(r => (
                <button key={r} onClick={() => setInterest(r)}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-all ${interest === r ? 'neu-card text-[#047857]' : 'neu-inset text-slate-500'}`}>
                  {interest === r && <i className="fa-solid fa-check mr-2 text-[#047857]" />}{r}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleConfirm} disabled={!name || !phone || !selectedDate || !selectedTime || loading}
            className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40">
            {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Memproses...</> : <><i className="fa-solid fa-calendar-check" /> Konfirmasi Jadwal Survei</>}
          </button>
        </div>

        <div className="neu-inset rounded-2xl p-3 text-center">
          <p className="text-[11px] text-slate-500">⏰ Survei tersedia <strong>Senin – Minggu</strong> pukul 09.00–19.00 WIB</p>
          <p className="text-[11px] text-slate-500 mt-0.5">📍 Tim kami akan menjemput Anda di lobby kosan</p>
        </div>
      </div>
    </div>
  );
}
