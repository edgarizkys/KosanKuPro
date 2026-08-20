'use client';

import React, { useState, useEffect } from 'react';

export default function StaffMobileFormPortal() {
  const [formType, setFormType] = useState<'SO' | 'CHECK_IN' | 'CHECK_OUT' | 'EXPENSE'>('SO');
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [staffName, setStaffName] = useState('Bambang Prasetyo (Staf Lapangan)');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // SO State
  const [soGalon, setSoGalon] = useState(12);
  const [soGas, setSoGas] = useState(2);
  const [soSprei, setSoSprei] = useState(6);
  const [soNotes, setSoNotes] = useState('');

  // Check In/Out State
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [keyOk, setKeyOk] = useState(true);
  const [acOk, setAcOk] = useState(true);
  const [bedOk, setBedOk] = useState(true);
  const [cleanOk, setCleanOk] = useState(true);
  const [inspectionNotes, setInspectionNotes] = useState('Semua fasilitas kamar dalam kondisi prima.');

  // Expense State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type')?.toUpperCase();
      if (type === 'SO' || type === 'STOCK_OPNAME') setFormType('SO');
      else if (type === 'CHECK_IN' || type === 'CEKIN') setFormType('CHECK_IN');
      else if (type === 'CHECK_OUT' || type === 'CEKOUT') setFormType('CHECK_OUT');
      else if (type === 'EXPENSE' || type === 'DANA') setFormType('EXPENSE');
      if (params.get('room')) setRoomNumber(params.get('room')!);
      if (params.get('staff')) setStaffName(params.get('staff')!);
      if (params.get('tenant')) setTenantName(params.get('tenant')!);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formType === 'SO') {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: 'STOCK_OPNAME',
            payload: {
              auditedBy: staffName,
              itemName: `Galon: ${soGalon}, Gas: ${soGas}, Sprei: ${soSprei}`,
              physicalStock: soGalon + soGas + soSprei,
              notes: soNotes || 'Audit fisik via WhatsApp Web Form',
            },
          }),
        });
      } else if (formType === 'CHECK_IN' || formType === 'CHECK_OUT') {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: 'ROOM_INSPECTION',
            payload: {
              roomNumber,
              tenantName,
              type: formType,
              inspectedBy: staffName,
              items: [
                { name: 'Kunci Kamar & Smart Lock', condition: keyOk ? 'GOOD' : 'NEEDS_REPAIR' },
                { name: 'AC & Remote', condition: acOk ? 'GOOD' : 'NEEDS_REPAIR' },
                { name: 'Kasur & Sprei', condition: bedOk ? 'GOOD' : 'NEEDS_REPAIR' },
                { name: 'Kebersihan & Sanitasi', condition: cleanOk ? 'GOOD' : 'NEEDS_REPAIR' },
              ],
              notes: inspectionNotes,
            },
          }),
        });
      } else if (formType === 'EXPENSE') {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: 'STAFF_EXPENSE',
            payload: {
              title: expenseTitle || 'Pengajuan Operasional Staf',
              amount: Number(expenseAmount.replace(/[^0-9]/g, '')) || 50000,
              requestedBy: staffName,
              reason: expenseReason,
            },
          }),
        });
      }
      setSubmitted(true);
    } catch {
      alert('Gagal mengirim form. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
          <div className="w-14 h-14 rounded-2xl neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            <i className="fa-solid fa-check" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Form Berhasil Terkirim!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Data laporan Anda telah tersimpan otomatis ke Database Server KosanKu Pro dan notifikasi telah dikirim ke Dashboard Owner.
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="w-full py-3.5 rounded-2xl neu-btn-primary font-black text-sm cursor-pointer"
          >
            Tutup & Kembali ke WhatsApp
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'SO', icon: 'fa-boxes-stacked', label: 'SO' },
    { id: 'CHECK_IN', icon: 'fa-door-open', label: 'Cek-In' },
    { id: 'CHECK_OUT', icon: 'fa-right-from-bracket', label: 'Cek-Out' },
    { id: 'EXPENSE', icon: 'fa-file-invoice-dollar', label: 'Dana' },
  ];

  const formTitles: Record<string, string> = {
    SO: '📦 Form Audit Stock Opname',
    CHECK_IN: '🚪 Berita Acara Cek-In',
    CHECK_OUT: '📤 Berita Acara Cek-Out',
    EXPENSE: '✍️ Pengajuan Dana Staf',
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 dark:text-amber-400 text-xs font-black mb-3">
            <i className="fa-solid fa-person-digging text-xs" />
            <span>KOSANKU PRO — FORM LAPANGAN STAF</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">{formTitles[formType]}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {property} • Petugas: <strong className="text-[#047857] dark:text-emerald-400">{staffName}</strong>
          </p>
        </div>

        {/* Tab Switcher — 2x2 Grid, no overflow */}
        <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl neu-inset">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setFormType(t.id as typeof formType)}
              className={`py-2.5 px-1 rounded-xl font-bold transition-all text-center cursor-pointer flex flex-col items-center gap-1 ${
                formType === t.id
                  ? 'neu-card text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <i className={`fa-solid ${t.icon} text-sm`} />
              <span className="text-[9px] leading-tight">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="neu-card rounded-3xl p-5 space-y-4">

          {/* ===== STOCK OPNAME ===== */}
          {formType === 'SO' && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-3">
                Hitung Fisik Stok Gudang
              </p>

              {[
                { emoji: '💧', label: 'Galon Aqua 19L', sub: 'Refill air minum', value: soGalon, onMinus: () => setSoGalon(Math.max(0, soGalon - 1)), onPlus: () => setSoGalon(soGalon + 1) },
                { emoji: '🔥', label: 'Gas LPG 3kg / 12kg', sub: 'Dapur bersama', value: soGas, onMinus: () => setSoGas(Math.max(0, soGas - 1)), onPlus: () => setSoGas(soGas + 1) },
                { emoji: '🛏️', label: 'Set Sprei Bersih', sub: 'Siap pasang', value: soSprei, onMinus: () => setSoSprei(Math.max(0, soSprei - 1)), onPlus: () => setSoSprei(soSprei + 1) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3.5 rounded-2xl neu-inset">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl neu-card flex items-center justify-center text-lg">{item.emoji}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={item.onMinus} className="w-8 h-8 rounded-xl neu-btn text-slate-600 dark:text-slate-300 font-black text-base cursor-pointer flex items-center justify-center">−</button>
                    <span className="w-8 text-center text-base font-black text-[#047857] dark:text-emerald-400 font-mono">{item.value}</span>
                    <button type="button" onClick={item.onPlus} className="w-8 h-8 rounded-xl neu-btn text-slate-600 dark:text-slate-300 font-black text-base cursor-pointer flex items-center justify-center">+</button>
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Catatan Staf (Opsional)</label>
                <textarea
                  value={soNotes}
                  onChange={(e) => setSoNotes(e.target.value)}
                  placeholder="Kondisi gudang rapi, stok galon aman untuk 4 hari..."
                  rows={2}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white outline-none bg-transparent placeholder-slate-400 resize-none"
                />
              </div>
            </>
          )}

          {/* ===== CHECK IN / OUT ===== */}
          {(formType === 'CHECK_IN' || formType === 'CHECK_OUT') && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-3">
                Detail Kamar
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nomor Kamar</label>
                  <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nama Penghuni</label>
                  <input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent" />
                </div>
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-3 pt-1">
                Checklist Fisik Fasilitas
              </p>
              {[
                { label: 'Kunci Fisik & Kartu Akses Smart Lock', state: keyOk, setState: setKeyOk },
                { label: 'AC Dingin & Remote Berfungsi', state: acOk, setState: setAcOk },
                { label: 'Kasur Springbed & Bantal Bersih', state: bedOk, setState: setBedOk },
                { label: 'Kamar Mandi Bersih & Kran Air Lancar', state: cleanOk, setState: setCleanOk },
              ].map((item, i) => (
                <label
                  key={i}
                  onClick={() => item.setState(!item.state)}
                  className="flex items-center justify-between p-3 rounded-xl neu-inset cursor-pointer"
                >
                  <span className="text-xs text-slate-700 dark:text-slate-200 font-semibold">{item.label}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${item.state ? 'bg-[#047857] text-white' : 'bg-rose-500 text-white'}`}>
                    {item.state ? 'OK' : 'RUSAK'}
                  </span>
                </label>
              ))}

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Catatan Inspeksi</label>
                <textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white outline-none bg-transparent resize-none"
                />
              </div>
            </>
          )}

          {/* ===== EXPENSE ===== */}
          {formType === 'EXPENSE' && (
            <>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200/50 dark:border-white/5 pb-3">
                Detail Pengajuan Dana
              </p>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nama Keperluan / Barang</label>
                <input
                  type="text"
                  placeholder="Beli Sapu, Pel & Sabun Pembersih Lantai"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nominal Dana (Rp)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-[#047857] dark:text-emerald-400 font-bold outline-none bg-transparent placeholder-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Alasan Pengajuan ke Owner</label>
                <textarea
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  placeholder="Peralatan pel lama patah, dibutuhkan untuk pembersihan lorong lantai 2..."
                  rows={3}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white outline-none bg-transparent placeholder-slate-400 resize-none"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <><i className="fa-solid fa-spinner animate-spin" /> Mengirim ke Database...</>
            ) : (
              <><i className="fa-solid fa-paper-plane" /> Kirim Form ke Sistem KosanKu Pro</>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-semibold pb-4">
          KosanKu Pro — Sistem Manajemen Kos Digital
        </p>
      </div>
    </div>
  );
}
