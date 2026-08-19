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
    { id: 'ac', name: 'AC & Pendingin', icon: 'fa-snowflake', severity: 'HIGH', eta: '3-5 Jam', defaultDesc: 'AC kurang dingin / ada tetesan air di bawah indoor unit.' },
    { id: 'plumbing', name: 'Kran & Pipa Air', icon: 'fa-droplet', severity: 'MEDIUM', eta: '2-4 Jam', defaultDesc: 'Kran wastafel / shower bocor atau air tersumbat pelan.' },
    { id: 'electrical', name: 'Lampu & Listrik', icon: 'fa-bolt', severity: 'HIGH', eta: '1-3 Jam', defaultDesc: 'Lampu utama redup / stopkontak tidak mengalirkan arus.' },
    { id: 'smartlock', name: 'Smart Lock & Pintu', icon: 'fa-key', severity: 'CRITICAL', eta: '1-2 Jam', defaultDesc: 'Baterai smart lock lemah / gagang pintu agak seret.' },
    { id: 'furniture', name: 'Kasur & Lemari', icon: 'fa-couch', severity: 'LOW', eta: '1-2 Hari', defaultDesc: 'Engsel pintu lemari lepas / kaki meja agak goyang.' },
    { id: 'wifi', name: 'WiFi & Jaringan', icon: 'fa-wifi', severity: 'MEDIUM', eta: '1-3 Jam', defaultDesc: 'Sinyal WiFi kamar tiba-tiba lambat atau putus nyambung.' },
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

      setSubmittedTicket(ticketId);
    } catch {
      alert('Gagal mengirim keluhan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b11] text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-lg w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black tracking-wider uppercase">
            🛠️ AI DAMAGE DIAGNOSTIC WIZARD
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Lapor Kendala &amp; Kerusakan Kamar</h1>
          <p className="text-xs text-slate-400">
            Penghuni: <span className="text-white font-bold">{tenantName}</span> &bull; Unit: <span className="text-emerald-400 font-bold">{roomNumber}</span>
          </p>
        </div>

        {submittedTicket ? (
          /* SUCCESS TICKET CARD */
          <div className="p-6 rounded-3xl bg-[#161b22] border-2 border-emerald-500 text-center space-y-4 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/30">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Tiket #{submittedTicket} Dibuat!</h2>
              <p className="text-xs text-slate-400">
                Laporan kerusakan <b>{currentSpot.name}</b> telah masuk ke Dashboard Owner &amp; Staf Lapangan (*Bambang*).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimasi Penanganan:</span>
                <span className="font-bold text-amber-400">{currentSpot.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tingkat Urgensi:</span>
                <span className="font-bold text-rose-400">{currentSpot.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Saat Ini:</span>
                <span className="font-bold text-emerald-400">OPEN (Menunggu Teknisi)</span>
              </div>
            </div>

            <button
              onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20Admin,%20saya%20sudah%20membuat%20tiket%20${submittedTicket}%20untuk%20Kamar%20${roomNumber}`, '_blank')}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <i className="fa-brands fa-whatsapp text-sm" /> Pantau Progres Perbaikan di WhatsApp
            </button>
          </div>
        ) : (
          /* DIAGNOSTIC FORM */
          <form onSubmit={handleSubmitComplaint} className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-slate-800 shadow-2xl space-y-5">
            <div>
              <label className="text-xs font-black text-slate-300 block uppercase tracking-wider mb-2.5">
                1. Pilih Titik Lokasi Kendala:
              </label>

              {/* Damage Category Grid */}
              <div className="grid grid-cols-3 gap-2">
                {damageSpots.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpot(spot.id);
                      if (!description) setDescription(spot.defaultDesc);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                      selectedSpot === spot.id
                        ? 'bg-rose-500/20 border-2 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20 scale-[1.02]'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className={`fa-solid ${spot.icon} text-lg`} />
                    <span className="text-[11px] font-bold block truncate max-w-full">{spot.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Diagnostics Meter */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tingkat Urgensi Kerusakan:</span>
                <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                  currentSpot.severity === 'CRITICAL' ? 'bg-rose-500 text-white animate-pulse' : currentSpot.severity === 'HIGH' ? 'bg-orange-500 text-black' : 'bg-amber-500 text-black'
                }`}>
                  {currentSpot.severity}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Target Waktu Teknisi Tiba:</span>
                <span className="font-bold text-emerald-400">{currentSpot.eta}</span>
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                2. Uraikan Gejala Kerusakan:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={currentSpot.defaultDesc}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-rose-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-rose-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Mendaftarkan Tiket Perbaikan...</span>
              ) : (
                <>
                  <i className="fa-solid fa-triangle-exclamation" /> Kirim Laporan Tiket Perbaikan
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
