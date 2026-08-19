'use client';

import React, { useState, useEffect } from 'react';

export default function RoomBookingPortal() {
  const [selectedRoom, setSelectedRoom] = useState('r-101');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-09-01');
  const [payType, setPayType] = useState<'DP_50' | 'FULL'>('DP_50');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const rooms = [
    {
      id: 'r-101',
      number: 'EKS-01',
      name: 'Eksekutif Dokter / Koas',
      price: 1500000,
      property: 'Juragan Kost Pasteur (Depan RSHS)',
      desc: 'Kamar privat tenang 2 menit dari RS Hasan Sadikin, dirancang khusus untuk kenyamanan istirahat dokter, residen & koas.',
      facilities: ['AC Inverter 1PK', 'Smart Lock Akses NFC', 'Kamar Mandi Dalam & Water Heater', 'Free Laundry 5kg/bln', 'WiFi 100Mbps'],
      hotspots: [
        { id: 'ac', label: 'AC Daikin Inverter', desc: 'Suhu stabil & hemat listrik dengan mode hening malam', top: '25%', left: '75%' },
        { id: 'lock', label: 'Smart Lock Card', desc: 'Buka pintu via kartu NFC / Face ID / PIN darurat', top: '55%', left: '15%' },
        { id: 'bed', label: 'Kasur King Koil Springbed', desc: 'Kasur orthopedic empuk 120x200cm + sprei hotel berbintang', top: '65%', left: '55%' },
        { id: 'wifi', label: 'Dedicated WiFi 100Mbps', desc: 'Router access point di setiap lorong untuk koneksi ultra lancar', top: '15%', left: '35%' },
      ],
    },
    {
      id: 'r-102',
      number: 'NYM-01',
      name: 'Nyaman Comfort',
      price: 1200000,
      property: 'Juragan Kost Pasteur (Depan RSHS)',
      desc: 'Pilihan hemat dan nyaman dengan fasilitas lengkap, meja belajar luas, dan ventilasi udara alami.',
      facilities: ['AC 0.5PK', 'Meja Kerja & Kursi Ergonomis', 'Kamar Mandi Luar Bersih (Harian)', 'WiFi 100Mbps'],
      hotspots: [
        { id: 'ac', label: 'AC Sejuk', desc: 'Pendingin ruangan dingin merata', top: '25%', left: '70%' },
        { id: 'desk', label: 'Meja Kerja', desc: 'Area kerja nyaman untuk belajar & laptop', top: '60%', left: '30%' },
      ],
    },
    {
      id: 'r-103',
      number: 'PV-01',
      name: 'Paviliun Spesialis VIP',
      price: 2600000,
      property: 'Juragan Kost Pasteur (Depan RSHS)',
      desc: 'Suite luas mewah dengan dapur pribadi, kulkas 2 pintu, Smart TV 43 inch, dan balkon santai.',
      facilities: ['Dapur Pribadi & Kulkas', 'Smart TV 43" Netflix', 'Free Laundry 10kg/bln', 'Kamar Mandi Dalam Mewah', 'Balkon'],
      hotspots: [
        { id: 'kitchen', label: 'Dapur Pribadi', desc: 'Kompor induksi, sink & kitchen set lengkap', top: '50%', left: '20%' },
        { id: 'tv', label: 'Smart TV 43"', desc: 'Dilengkapi Netflix & YouTube 4K', top: '30%', left: '60%' },
      ],
    },
  ];

  const currentRoom = rooms.find((r) => r.id === selectedRoom) || rooms[0];
  const dueAmount = payType === 'DP_50' ? currentRoom.price * 0.5 : currentRoom.price;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room')) {
        const found = rooms.find((r) => r.number.toLowerCase() === params.get('room')!.toLowerCase() || r.id === params.get('room'));
        if (found) setSelectedRoom(found.id);
      }
      if (params.get('name')) setTenantName(params.get('name')!);
      if (params.get('phone')) setTenantPhone(params.get('phone')!);
    }
  }, []);

  const handleSimulatePayment = async () => {
    setLoading(true);
    setTimeout(async () => {
      setIsPaid(true);
      setLoading(false);

      // Post booking notification to /api/activity
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: 'NEW_TENANT_ORDER',
            payload: {
              tenantName: tenantName || 'Calon Penghuni',
              roomNumber: currentRoom.number,
              item: `Booking ${currentRoom.name} (${payType === 'DP_50' ? 'DP 50%' : 'Lunas'})`,
            },
          }),
        });
      } catch {}
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b11] text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
            ✨ VIRTUAL 360° &amp; INSTANT BOOKING
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Eksplorasi Kamar &amp; Kunci DP 50%</h1>
          <p className="text-xs text-slate-400">{currentRoom.property}</p>
        </div>

        {/* Room Type Switcher Buttons */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
          {rooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoom(r.id)}
              className={`p-2 rounded-xl text-center font-bold transition-all cursor-pointer ${
                selectedRoom === r.id
                  ? 'bg-emerald-500 text-black font-extrabold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="block truncate">{r.name.split(' ')[0]}</span>
              <span className="text-[10px] font-mono block opacity-80">Rp {(r.price / 1000).toLocaleString('id-ID')}k</span>
            </button>
          ))}
        </div>

        {/* Interactive 360° Visual Hotspot Box */}
        <div className="relative h-64 sm:h-72 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/30 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
          {/* Background Room Graphic / Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.15),transparent_70%)]" />

          {/* Hotspot Pins */}
          {currentRoom.hotspots.map((h) => (
            <button
              key={h.id}
              onClick={() => setActiveHotspot(activeHotspot === h.id ? null : h.id)}
              className="absolute z-20 w-8 h-8 -ml-4 -mt-4 rounded-full bg-emerald-500 text-black font-black text-xs flex items-center justify-center shadow-lg shadow-emerald-500/50 hover:scale-125 transition-all cursor-pointer animate-pulse"
              style={{ top: h.top, left: h.left }}
              title={h.label}
            >
              +
            </button>
          ))}

          {/* Hotspot Popup Card */}
          {activeHotspot && (
            <div className="absolute top-4 left-4 right-4 z-30 p-3.5 rounded-2xl bg-[#0d1117]/95 border border-emerald-500 text-xs shadow-2xl animate-scale-in flex items-center justify-between">
              <div>
                <div className="font-black text-emerald-400">
                  {currentRoom.hotspots.find((h) => h.id === activeHotspot)?.label}
                </div>
                <div className="text-[11px] text-slate-300">
                  {currentRoom.hotspots.find((h) => h.id === activeHotspot)?.desc}
                </div>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Badge & Instructions */}
          <div className="flex items-center justify-between relative z-10">
            <span className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-emerald-300">
              🔍 Sentuh Titik Hijau (+) untuk Cek Fasilitas
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase">
              Kamar {currentRoom.number}
            </span>
          </div>

          {/* Room Title in Box */}
          <div className="relative z-10">
            <h3 className="text-lg font-black text-white drop-shadow-md">{currentRoom.name}</h3>
            <p className="text-xs text-slate-300 max-w-sm line-clamp-2">{currentRoom.desc}</p>
          </div>
        </div>

        {/* Facilities Chips */}
        <div className="flex flex-wrap gap-1.5">
          {currentRoom.facilities.map((f, i) => (
            <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-bold">
              ✓ {f}
            </span>
          ))}
        </div>

        {/* SUCCESS RECEIPT IF PAID */}
        {isPaid ? (
          <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500 text-center space-y-4 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/50 animate-bounce">
              🎉
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Pembayaran DP Berhasil Diterima!</h3>
              <p className="text-xs text-emerald-300">
                Kamar <b>{currentRoom.number} ({currentRoom.name})</b> telah resmi di-booking atas nama <b>{tenantName || 'Penghuni'}</b>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/30 text-xs font-mono space-y-1 text-slate-300 text-left">
              <div>• Booking ID: <span className="text-emerald-400 font-bold">BKG-{Date.now().toString().slice(-6)}</span></div>
              <div>• Nominal: <span className="text-emerald-400 font-bold">Rp {dueAmount.toLocaleString('id-ID')}</span> (QRIS Lunas)</div>
              <div>• Rencana Cek-In: <span className="text-white font-bold">{checkInDate}</span></div>
            </div>

            <button
              onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20sudah%20membayar%20DP%20untuk%20Kamar%20${currentRoom.number}`, '_blank')}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-brands fa-whatsapp text-sm" /> Dapatkan Kunci Smart Lock via WhatsApp
            </button>
          </div>
        ) : (
          /* BOOKING & PAYMENT FORM */
          <div className="p-5 sm:p-6 rounded-3xl bg-[#161b22] border border-slate-800 space-y-5 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              1. Lengkapi Data Pemesan
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nama Lengkap Penyewa</label>
                <input
                  type="text"
                  placeholder="dr. Ahmad Fauzi / Siti Sarah"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">No. WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Tanggal Mulai Sewa</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Choice: DP 50% vs Full */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-black text-slate-300 block uppercase tracking-wider">
                2. Pilih Skema Pembayaran
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayType('DP_50')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    payType === 'DP_50'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-black shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Kunci DP 50%</div>
                  <div className="text-sm font-black font-mono mt-0.5">
                    Rp {(currentRoom.price * 0.5).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400">Sisa dibayar saat masuk</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPayType('FULL')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    payType === 'FULL'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-black shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Bayar Lunas 100%</div>
                  <div className="text-sm font-black font-mono mt-0.5">
                    Rp {currentRoom.price.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400">Langsung aktif sebulan</div>
                </button>
              </div>
            </div>

            {/* Instant QRIS Midtrans Button */}
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Memproses Verifikasi QRIS...</span>
              ) : (
                <>
                  <i className="fa-solid fa-qrcode text-lg" />
                  <span>Bayar Instan Rp {dueAmount.toLocaleString('id-ID')} (QRIS / VA)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
