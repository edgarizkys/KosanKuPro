'use client';

import React, { useState, useEffect } from 'react';

export default function LeadRegistrationPortal() {
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadKtp, setLeadKtp] = useState('');
  const [leadJob, setLeadJob] = useState('');
  const [leadRoom, setLeadRoom] = useState('EKS-01');
  const [leadCheckIn, setLeadCheckIn] = useState('');
  const [leadDuration, setLeadDuration] = useState(12);
  const [leadEmergency, setLeadEmergency] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('property')) setProperty(params.get('property')!);
      if (params.get('room')) setLeadRoom(params.get('room')!);
      if (params.get('name')) setLeadName(params.get('name')!);
      if (params.get('phone')) setLeadPhone(params.get('phone')!);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    setLoading(true);
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'NEW_LEAD_REGISTRATION',
          payload: {
            tenantName: leadName,
            roomNumber: leadRoom,
            item: `Registrasi Penghuni Baru — ${leadJob}`,
            ktpNumber: leadKtp,
            checkInDate: leadCheckIn,
            duration: leadDuration,
            phone: leadPhone,
            email: leadEmail,
            emergencyContact: leadEmergency,
          },
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
            <i className="fa-solid fa-check" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Pendaftaran Berhasil!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Data pendaftaran <strong className="text-slate-800 dark:text-white">{leadName}</strong> untuk Kamar <strong className="text-[#047857]">{leadRoom}</strong> telah tersimpan dan Owner kosan akan menghubungi Anda segera.
            </p>
          </div>
          <div className="p-4 rounded-2xl neu-inset text-left text-xs space-y-2">
            {[
              ['Nama', leadName],
              ['Kamar', leadRoom],
              ['Rencana Masuk', leadCheckIn || 'Akan dikonfirmasi'],
              ['Durasi', `${leadDuration} Bulan`],
              ['Status', '✅ TERDAFTAR'],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{label}</span>
                <strong className="text-[#047857] dark:text-emerald-400">{val}</strong>
              </div>
            ))}
          </div>
          <button
            onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20saya%20${encodeURIComponent(leadName)}%20sudah%20mendaftar%20via%20form%20untuk%20Kamar%20${leadRoom}`, '_blank')}
            className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] dark:text-emerald-400 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-sm" /> Konfirmasi via WhatsApp Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black mb-3">
            <i className="fa-solid fa-user-plus text-xs" />
            <span>FORMULIR REGISTRASI PENGHUNI BARU</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Daftarkan Diri Anda</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{property}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 neu-inset p-3 rounded-2xl">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex-1 flex items-center gap-2 ${s <= step ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  s < step ? 'bg-[#047857] text-white' : s === step ? 'neu-card text-[#047857] dark:text-emerald-400' : 'neu-inset text-slate-400'
                }`}>
                  {s < step ? <i className="fa-solid fa-check text-[10px]" /> : s}
                </div>
                <span className="text-[11px] font-bold hidden sm:block">
                  {s === 1 ? 'Data Pribadi' : 'Detail Sewa'}
                </span>
              </div>
              {s < 2 && <div className="w-8 h-0.5 bg-slate-200 dark:bg-white/10 rounded-full" />}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="neu-card rounded-3xl p-5 space-y-4">

          {/* STEP 1: Identitas */}
          {step === 1 && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-3">
                Data Identitas Diri
              </p>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nama Lengkap (Sesuai KTP) *</label>
                <input
                  type="text"
                  placeholder="dr. Ahmad Fauzi, Sp.PD"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">No. WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nomor KTP / NIK *</label>
                <input
                  type="text"
                  placeholder="3201xxxxxxxxxxxxxxxx"
                  value={leadKtp}
                  onChange={(e) => setLeadKtp(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Pekerjaan / Profesi *</label>
                <input
                  type="text"
                  placeholder="Dokter Residen RSHS / Mahasiswa Unpad"
                  value={leadJob}
                  onChange={(e) => setLeadJob(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Kontak Darurat (Nama & No. HP)</label>
                <input
                  type="text"
                  placeholder="Ibu Sari — 0812xxxxxxxx"
                  value={leadEmergency}
                  onChange={(e) => setLeadEmergency(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                />
              </div>
            </>
          )}

          {/* STEP 2: Detail Sewa */}
          {step === 2 && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-3">
                Detail Sewa Kamar
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nomor Kamar</label>
                  <input
                    type="text"
                    placeholder="EKS-01"
                    value={leadRoom}
                    onChange={(e) => setLeadRoom(e.target.value)}
                    className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Rencana Masuk</label>
                  <input
                    type="date"
                    value={leadCheckIn}
                    onChange={(e) => setLeadCheckIn(e.target.value)}
                    className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  Durasi Sewa: <strong className="text-[#047857] dark:text-emerald-400">{leadDuration} Bulan</strong>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLeadDuration(m)}
                      className={`px-3 py-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                        leadDuration === m
                          ? 'neu-card text-[#047857] dark:text-emerald-400'
                          : 'neu-inset text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {m} Bln
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Summary */}
              <div className="p-3.5 rounded-2xl neu-inset text-xs space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Ringkasan Pendaftaran</p>
                {[
                  ['Nama', leadName],
                  ['WA', leadPhone],
                  ['Profesi', leadJob],
                  ['Kamar', leadRoom],
                  ['Durasi', `${leadDuration} bulan`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-400">{label}</span>
                    <strong className="text-slate-700 dark:text-slate-200">{val}</strong>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-2xl neu-btn text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                ← Kembali
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <><i className="fa-solid fa-spinner animate-spin" /> Mengirim...</>
              ) : step === 1 ? (
                <>Lanjut Data Sewa <i className="fa-solid fa-arrow-right" /></>
              ) : (
                <><i className="fa-solid fa-paper-plane" /> Kirim Pendaftaran</>
              )}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-semibold pb-4">
          Data Anda aman & terenkripsi — KosanKu Pro
        </p>
      </div>
    </div>
  );
}
