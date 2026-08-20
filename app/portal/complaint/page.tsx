'use client';

import React, { useState, useEffect } from 'react';

export default function DamageDiagnosticPortal() {
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [selectedSpot, setSelectedSpot] = useState<string>('ac');
  const [description, setDescription] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const damageSpots = [
    { id: 'ac', name: 'AC & Pendingin', icon: 'fa-snowflake', defaultDesc: 'AC kurang dingin / ada tetesan air di bawah indoor unit.' },
    { id: 'plumbing', name: 'Kran & Pipa Air', icon: 'fa-droplet', defaultDesc: 'Kran wastafel / shower bocor atau air tersumbat pelan.' },
    { id: 'electrical', name: 'Lampu & Listrik', icon: 'fa-bolt', defaultDesc: 'Lampu utama redup / stopkontak tidak mengalirkan arus.' },
    { id: 'smartlock', name: 'Smart Lock & Pintu', icon: 'fa-key', defaultDesc: 'Baterai smart lock lemah / gagang pintu agak seret.' },
    { id: 'furniture', name: 'Kasur & Lemari', icon: 'fa-couch', defaultDesc: 'Engsel pintu lemari lepas / kaki meja agak goyang.' },
    { id: 'wifi', name: 'WiFi & Jaringan', icon: 'fa-wifi', defaultDesc: 'Sinyal WiFi kamar tiba-tiba lambat atau putus nyambung.' },
  ];

  const currentSpot = damageSpots.find((s) => s.id === selectedSpot) || damageSpots[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) setRoomNumber(params.get('room')!);
      if (params.get('tenant')) setTenantName(params.get('tenant')!);
    }
  }, []);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const ticketId = `CMP-${Date.now().toString().slice(-4)}`;
    const finalDesc = description || currentSpot.defaultDesc;

    try {
      await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ticketId,
          tenantName,
          roomNumber,
          title: `Kerusakan ${currentSpot.name}: ${finalDesc}`,
          description: finalDesc,
        }),
      });

      // Trigger webhook recording
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '082217415131',
          message: `Komplain: ${currentSpot.name} ${finalDesc}`,
        }),
      });

      setSubmittedTicket(ticketId);
    } catch {
      setSubmittedTicket(ticketId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 dark:text-amber-400 text-xs font-black">
            <i className="fa-solid fa-screwdriver-wrench text-xs" />
            <span>DIAGNOSTIK KERUSAKAN KAMAR</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            Kamar {roomNumber}
          </span>
        </div>

        {submittedTicket ? (
          <div className="neu-card rounded-3xl p-6 text-center space-y-4 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-check" />
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white">
              Tiket Perbaikan #{submittedTicket} Diterbitkan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Laporan kerusakan {currentSpot.name} di Kamar {roomNumber} telah diteruskan ke Staf Lapangan & Owner KosanKu Pro.
            </p>
            <div className="p-3 rounded-2xl neu-inset text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Status:</span> <strong className="text-amber-600 dark:text-amber-400">OPEN (Antrean Teknisi)</strong>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Pelapor:</span> <strong className="text-slate-800 dark:text-white">{tenantName}</strong>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitComplaint} className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
            {/* Location & Tenant Info */}
            <div className="flex items-start justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  LOKASI KERUSAKAN
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-[#047857] dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                    Kamar {roomNumber}
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-white">{tenantName}</span>
                </div>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PILIH BAGIAN YANG MENGALAMI KERUSAKAN:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {damageSpots.map((spot) => (
                  <button
                    type="button"
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot.id)}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      selectedSpot === spot.id
                        ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-bold'
                        : 'neu-inset text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <i className={`fa-solid ${spot.icon} text-xs block mb-1`} />
                    <span className="text-xs block font-bold text-slate-800 dark:text-white">
                      {spot.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DETAIL KENDALA / GEJALA:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={currentSpot.defaultDesc}
                className="w-full rounded-2xl neu-inset px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane text-xs" />
                  <span>Kirim Laporan Kerusakan ke Staf</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Sistem Tiket Pemeliharaan Real-Time KosanKu Pro
        </p>
      </div>
    </div>
  );
}
