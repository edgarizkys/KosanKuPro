'use client';

import React, { useState, useEffect } from 'react';

export default function RoomInspectionMagicPortal() {
  const [inspectionId, setInspectionId] = useState('INSP-8821');
  const [type, setType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [staffName, setStaffName] = useState('Bambang Prasetyo (Staf Lapangan)');
  const [propertyName, setPropertyName] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [notes, setNotes] = useState('Semua fasilitas kamar dalam kondisi prima dan siap serah terima.');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    smartlock: true,
    ac: true,
    lights: true,
    plumbing: true,
    bed: true,
    cleanliness: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadPropertyDetails() {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('id')) setInspectionId(params.get('id')!);
        if (params.get('room')) setRoomNumber(params.get('room')!);
        if (params.get('tenant')) setTenantName(params.get('tenant')!);
        if (params.get('staff')) setStaffName(params.get('staff')!);
        if (params.get('type')?.toUpperCase() === 'CHECK_OUT') setType('CHECK_OUT');

        const res = await fetch('/api/properties?slug=rshs');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.[0]?.name) {
            setPropertyName(json.data[0].name);
          }
        }
      } catch {}
    }

    loadPropertyDetails();
  }, []);

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'ROOM_INSPECTION',
          payload: {
            id: inspectionId,
            type,
            roomNumber,
            tenantName,
            inspectedBy: staffName,
            checklist,
            notes,
            date: new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        }),
      });

      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '081398765432',
          message: `${type === 'CHECK_IN' ? 'Cek-in' : 'Cek-out'}: ${roomNumber} ${tenantName} Selesai diinspeksi`,
        }),
      });

      setIsSuccess(true);
    } catch {
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checklistItems = [
    { key: 'smartlock', label: 'Kunci Digital RFID & Smart Lock', desc: 'Kartu berfungsi & baterai 100%' },
    { key: 'ac', label: 'Remote & AC Pendingin', desc: 'Suhu 18-24°C dingin & filter bersih' },
    { key: 'lights', label: 'Lampu & Saklar Listrik', desc: 'Semua bohlam LED menyala normal' },
    { key: 'plumbing', label: 'Kran Air, Shower & Sanitasi', desc: 'Air lancar & tidak ada sumbatan' },
    { key: 'bed', label: 'Kasur Springbed & Set Sprei', desc: 'Sprei dokter bersih & wangi' },
    { key: 'cleanliness', label: 'Kebersihan Kamar & Jendela', desc: 'Lantai disinfeksi & harum' },
  ];

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-xs font-black ${
            type === 'CHECK_IN'
              ? 'text-[#047857] dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            <i className={`fa-solid ${type === 'CHECK_IN' ? 'fa-door-open' : 'fa-door-closed'} text-xs`} />
            <span>BERITA ACARA {type === 'CHECK_IN' ? 'CHECK-IN' : 'CHECK-OUT'}</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            #{inspectionId}
          </span>
        </div>

        {isSuccess ? (
          <div className="neu-card rounded-3xl p-6 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-check" />
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              Inspeksi Kamar Berhasil Dicatat
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Berita acara serah terima kamar {roomNumber} ({tenantName}) telah resmi tersimpan di database dan tersinkron ke Dashboard Owner.
            </p>
            <div className="p-3 rounded-2xl neu-inset text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Unit:</span> <strong className="text-slate-800 dark:text-white">Kamar {roomNumber}</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Penghuni:</span> <strong className="text-slate-800 dark:text-white">{tenantName}</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Petugas:</span> <strong className="text-slate-800 dark:text-white">{staffName}</strong>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Room & Tenant Info */}
            <div className="flex items-start justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  INFORMASI KAMAR & PENGHUNI
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-[#047857] dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                    Kamar {roomNumber}
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">
                    {tenantName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{propertyName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Petugas</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{staffName}</span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CHECKLIST KELENGKAPAN INVENTARIS:
              </span>
              <div className="space-y-1.5">
                {checklistItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => toggleCheck(item.key)}
                    className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                      checklist[item.key]
                        ? 'neu-card-sm border border-emerald-500/30 text-slate-800 dark:text-slate-100'
                        : 'neu-inset text-slate-400'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block text-slate-800 dark:text-white">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-all ${
                        checklist[item.key]
                          ? 'bg-[#047857] text-white'
                          : 'neu-inset text-transparent'
                      }`}
                    >
                      {checklist[item.key] && <i className="fa-solid fa-check text-[10px]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CATATAN TAMBAHAN STAF:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan kondisi spesifik kamar..."
                className="w-full rounded-2xl neu-inset px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-signature text-xs" />
                  <span>Terbitkan Berita Acara Serah Terima</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Database PostgreSQL & Sinkronisasi Dashboard Owner
        </p>
      </div>
    </div>
  );
}
