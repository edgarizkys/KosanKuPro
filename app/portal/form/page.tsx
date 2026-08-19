'use client';

import React, { useState, useEffect } from 'react';

export default function MobileFormPortal() {
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
      if (type === 'CHECK_IN' || type === 'CEKIN') setFormType('CHECK_IN');
      if (type === 'CHECK_OUT' || type === 'CEKOUT') setFormType('CHECK_OUT');
      if (type === 'EXPENSE' || type === 'DANA') setFormType('EXPENSE');
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
      <div className="min-h-screen bg-[#0d1117] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#161b22] border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Form Berhasil Terkirim!</h2>
            <p className="text-xs text-slate-400">
              Data laporan Anda telah tersimpan secara otomatis di Database Server KosanKu Pro dan notifikasi telah dikirim ke Dashboard Owner.
            </p>
          </div>
          <button
            onClick={() => window.close()}
            className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-sm transition-all cursor-pointer"
          >
            Tutup Halaman & Kembali ke WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-lg w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-1 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
            <i className="fa-brands fa-whatsapp text-sm" /> KosanKu Pro Instant Mobile Form
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {formType === 'SO' ? '📋 Form Audit Stock Opname' : formType === 'CHECK_IN' ? '🚪 Form Laporan Cek-In' : formType === 'CHECK_OUT' ? '📦 Form Laporan Cek-Out' : '✍️ Form Pengajuan Dana Staf'}
          </h1>
          <p className="text-xs text-slate-400">
            {property} &bull; Petugas: <span className="text-emerald-400 font-bold">{staffName}</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          {[
            { id: 'SO', label: '📦 SO' },
            { id: 'CHECK_IN', label: '🚪 Cek-In' },
            { id: 'CHECK_OUT', label: '📤 Cek-Out' },
            { id: 'EXPENSE', label: '💵 Dana' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFormType(t.id as any)}
              className={`py-2 rounded-xl font-bold transition-all text-center cursor-pointer ${
                formType === t.id
                  ? 'bg-emerald-500 text-black shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-slate-800 shadow-2xl space-y-5">
          {/* TYPE 1: STOCK OPNAME */}
          {formType === 'SO' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                  Hitung Fisik Stok Gudang
                </label>

                {/* Galon Counter */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg">
                      💧
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Galon Aqua 19L</div>
                      <div className="text-[10px] text-slate-400">Refill air minum</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSoGalon(Math.max(0, soGalon - 1))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black text-emerald-400 font-mono">{soGalon}</span>
                    <button
                      type="button"
                      onClick={() => setSoGalon(soGalon + 1)}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Gas Counter */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">
                      🔥
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Gas LPG 3kg / 12kg</div>
                      <div className="text-[10px] text-slate-400">Dapur bersama</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSoGas(Math.max(0, soGas - 1))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black text-emerald-400 font-mono">{soGas}</span>
                    <button
                      type="button"
                      onClick={() => setSoGas(soGas + 1)}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sprei Counter */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
                      🛏️
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Set Sprei Bersih</div>
                      <div className="text-[10px] text-slate-400">Siap pasang</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSoSprei(Math.max(0, soSprei - 1))}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-black text-emerald-400 font-mono">{soSprei}</span>
                    <button
                      type="button"
                      onClick={() => setSoSprei(soSprei + 1)}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Catatan Staf (Opsional)</label>
                <textarea
                  value={soNotes}
                  onChange={(e) => setSoNotes(e.target.value)}
                  placeholder="Kondisi gudang rapi, stok galon aman untuk 4 hari..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TYPE 2: CHECK IN / OUT */}
          {(formType === 'CHECK_IN' || formType === 'CHECK_OUT') && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nomor Kamar</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Nama Penghuni</label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                  Checklist Fisik Fasilitas
                </label>
                {[
                  { label: 'Kunci Fisik & Kartu Akses Smart Lock', state: keyOk, setState: setKeyOk },
                  { label: 'AC Dingin & Remote Berfungsi', state: acOk, setState: setAcOk },
                  { label: 'Kasur Springbed & Bantal Bersih', state: bedOk, setState: setBedOk },
                  { label: 'Kamar Mandi Bersih & Kran Air Lancar', state: cleanOk, setState: setCleanOk },
                ].map((item, i) => (
                  <label
                    key={i}
                    onClick={() => item.setState(!item.state)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700"
                  >
                    <span className="text-xs text-slate-200">{item.label}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${item.state ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'}`}>
                      {item.state ? 'OK / BAGUS' : 'RUSAK / MINUS'}
                    </span>
                  </label>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Catatan Inspeksi</label>
                <textarea
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TYPE 3: STAFF EXPENSE */}
          {formType === 'EXPENSE' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nama Keperluan / Barang</label>
                <input
                  type="text"
                  placeholder="Beli Sapu, Pel & Sabun Pembersih Lantai"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nominal Dana (Rp)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Alasan Pengajuan ke Owner</label>
                <textarea
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  placeholder="Peralatan pel lama patah, dibutuhkan untuk pembersihan lorong lantai 2..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Mengirim Data ke Database...</span>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" /> Kirim Form ke Sistem
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
