'use client';

import React, { useState, useEffect } from 'react';

interface Room {
  id: string;
  number: string;
  name: string;
  price: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  floor: number;
  type: string;
  facilities: string[];
  desc: string;
}

export default function RoomBookingPortal() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [payType, setPayType] = useState<'DP_50' | 'FULL'>('DP_50');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [filterType, setFilterType] = useState('SEMUA');
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');

  // Fallback rooms jika API kosong
  const fallbackRooms: Room[] = [
    { id: 'eks-01', number: 'EKS-01', name: 'Eksekutif Dokter', price: 1500000, status: 'AVAILABLE', floor: 1, type: 'EKSEKUTIF', facilities: ['AC Inverter', 'Smart Lock', 'Kamar Mandi Dalam', 'WiFi 100Mbps', 'Free Laundry 5kg'], desc: 'Kamar privat tenang 2 mnt dari RSHS, dirancang khusus untuk dokter & koas.' },
    { id: 'eks-02', number: 'EKS-02', name: 'Eksekutif Dokter', price: 1500000, status: 'OCCUPIED', floor: 1, type: 'EKSEKUTIF', facilities: ['AC Inverter', 'Smart Lock', 'Kamar Mandi Dalam', 'WiFi 100Mbps'], desc: 'Kamar privat tenang 2 mnt dari RSHS, dirancang khusus untuk dokter & koas.' },
    { id: 'eks-03', number: 'EKS-03', name: 'Eksekutif Dokter', price: 1500000, status: 'AVAILABLE', floor: 1, type: 'EKSEKUTIF', facilities: ['AC Inverter', 'Smart Lock', 'Kamar Mandi Dalam', 'WiFi 100Mbps'], desc: 'Kamar privat tenang 2 mnt dari RSHS, dirancang khusus untuk dokter & koas.' },
    { id: 'nym-01', number: 'NYM-01', name: 'Nyaman Comfort', price: 1200000, status: 'AVAILABLE', floor: 2, type: 'STANDARD', facilities: ['AC 0.5PK', 'Meja Belajar', 'Kamar Mandi Luar', 'WiFi 100Mbps'], desc: 'Pilihan hemat nyaman, meja belajar luas, ventilasi alami.' },
    { id: 'nym-02', number: 'NYM-02', name: 'Nyaman Comfort', price: 1200000, status: 'AVAILABLE', floor: 2, type: 'STANDARD', facilities: ['AC 0.5PK', 'Meja Belajar', 'Kamar Mandi Luar', 'WiFi 100Mbps'], desc: 'Pilihan hemat nyaman, meja belajar luas, ventilasi alami.' },
    { id: 'nym-03', number: 'NYM-03', name: 'Nyaman Comfort', price: 1200000, status: 'OCCUPIED', floor: 2, type: 'STANDARD', facilities: ['AC 0.5PK', 'Meja Belajar', 'Kamar Mandi Luar', 'WiFi 100Mbps'], desc: 'Pilihan hemat nyaman, meja belajar luas, ventilasi alami.' },
    { id: 'nym-04', number: 'NYM-04', name: 'Nyaman Comfort', price: 1200000, status: 'AVAILABLE', floor: 3, type: 'STANDARD', facilities: ['AC 0.5PK', 'Meja Belajar', 'Kamar Mandi Luar', 'WiFi 100Mbps'], desc: 'Pilihan hemat nyaman di lantai 3, view kota.' },
    { id: 'pv-01', number: 'PV-01', name: 'Paviliun VIP Suite', price: 2600000, status: 'AVAILABLE', floor: 1, type: 'VIP', facilities: ['Dapur Pribadi', 'Smart TV 43"', 'Kulkas 2 Pintu', 'Free Laundry 10kg', 'Balkon', 'WiFi 100Mbps'], desc: 'Suite mewah dengan dapur pribadi, Smart TV, dan balkon santai.' },
    { id: 'pv-02', number: 'PV-02', name: 'Paviliun VIP Suite', price: 2600000, status: 'MAINTENANCE', floor: 1, type: 'VIP', facilities: ['Dapur Pribadi', 'Smart TV 43"', 'Kulkas 2 Pintu', 'Free Laundry 10kg', 'Balkon'], desc: 'Suite mewah dengan dapur pribadi, Smart TV, dan balkon santai.' },
    { id: 'res-01', number: 'RES-01', name: 'Residen Koas', price: 950000, status: 'AVAILABLE', floor: 3, type: 'EKONOMI', facilities: ['AC 0.5PK', 'Meja Belajar', 'WiFi 100Mbps'], desc: 'Kamar ekonomis khusus koas & mahasiswa, dekat gerbang belakang RSHS.' },
    { id: 'res-02', number: 'RES-02', name: 'Residen Koas', price: 950000, status: 'AVAILABLE', floor: 3, type: 'EKONOMI', facilities: ['AC 0.5PK', 'Meja Belajar', 'WiFi 100Mbps'], desc: 'Kamar ekonomis khusus koas & mahasiswa, dekat gerbang belakang RSHS.' },
    { id: 'res-03', number: 'RES-03', name: 'Residen Koas', price: 950000, status: 'OCCUPIED', floor: 3, type: 'EKONOMI', facilities: ['AC 0.5PK', 'Meja Belajar', 'WiFi 100Mbps'], desc: 'Kamar ekonomis khusus koas & mahasiswa, dekat gerbang belakang RSHS.' },
  ];

  useEffect(() => {
    loadRooms();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('property')) setProperty(params.get('property')!);
      if (params.get('name')) setTenantName(params.get('name')!);
      if (params.get('phone')) setTenantPhone(params.get('phone')!);
    }
  }, []);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      const dbRooms: Room[] = (data.data || []).map((r: any) => ({
        id: r.id,
        number: r.number,
        name: r.name || r.type,
        price: r.monthlyRent || r.price || 0,
        status: r.status === 'VACANT' ? 'AVAILABLE' : r.status === 'OCCUPIED' ? 'OCCUPIED' : r.status || 'AVAILABLE',
        floor: r.floor || 1,
        type: r.type || 'STANDARD',
        facilities: r.facilities || [],
        desc: r.description || '',
      }));
      setRooms(dbRooms.length > 0 ? dbRooms : fallbackRooms);
    } catch {
      setRooms(fallbackRooms);
    } finally {
      setLoadingRooms(false);
    }
  };

  const roomTypes = ['SEMUA', ...Array.from(new Set(rooms.map((r) => r.type)))];
  const filteredRooms = filterType === 'SEMUA' ? rooms : rooms.filter((r) => r.type === filterType);
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const dueAmount = selectedRoom ? (payType === 'DP_50' ? selectedRoom.price * 0.5 : selectedRoom.price) : 0;

  const handlePay = async () => {
    if (!tenantName.trim() || !selectedRoom) return;
    setLoading(true);
    setTimeout(async () => {
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: 'NEW_TENANT_ORDER',
            payload: { tenantName, roomNumber: selectedRoom.number, item: `Booking ${selectedRoom.name} (${payType === 'DP_50' ? 'DP 50%' : 'Lunas'})` },
          }),
        });
      } catch {}
      setIsPaid(true);
      setLoading(false);
    }, 1400);
  };

  const statusBadge = (s: string) => {
    if (s === 'AVAILABLE') return { label: 'Tersedia', cls: 'bg-emerald-500/15 text-[#047857] border-emerald-500/25' };
    if (s === 'OCCUPIED') return { label: 'Terisi', cls: 'bg-slate-200 text-slate-500 border-slate-300 dark:bg-white/10 dark:text-slate-400 dark:border-white/10' };
    return { label: 'Renovasi', cls: 'bg-amber-500/15 text-amber-600 border-amber-500/25' };
  };

  // ======= SUCCESS STATE =======
  if (isPaid && selectedRoom) {
    return (
      <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full neu-card rounded-3xl p-6 text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">🎉</div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">Booking Berhasil!</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kamar <strong className="text-[#047857]">{selectedRoom.number}</strong> resmi di-booking atas nama <strong className="text-slate-800 dark:text-white">{tenantName}</strong>.
            </p>
          </div>
          <div className="p-4 rounded-2xl neu-inset text-left text-xs space-y-2">
            {[
              ['Booking ID', `BKG-${Date.now().toString().slice(-6)}`],
              ['Kamar', `${selectedRoom.number} — ${selectedRoom.name}`],
              ['Nominal', `Rp ${dueAmount.toLocaleString('id-ID')}`],
              ['Check-In', checkInDate || 'Akan dikonfirmasi'],
              ['Status', '✅ CONFIRMED'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-slate-400">{l}</span>
                <strong className="text-[#047857] dark:text-emerald-400">{v}</strong>
              </div>
            ))}
          </div>
          <button
            onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20saya%20sudah%20bayar%20DP%20Kamar%20${selectedRoom.number}`, '_blank')}
            className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] dark:text-emerald-400 flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-sm" /> Dapatkan Kunci Smart Lock
          </button>
        </div>
      </div>
    );
  }

  // ======= BOOKING FORM (after room selected) =======
  if (selectedRoom) {
    return (
      <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
        <div className="max-w-md w-full space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedRoom(null)} className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-slate-500 cursor-pointer">
              <i className="fa-solid fa-arrow-left text-sm" />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-800 dark:text-white">Booking Kamar {selectedRoom.number}</h1>
              <p className="text-xs text-slate-400">{selectedRoom.name} • Rp {selectedRoom.price.toLocaleString('id-ID')}/bln</p>
            </div>
          </div>

          {/* Room Summary */}
          <div className="neu-card rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-xl flex-shrink-0">
                {selectedRoom.type === 'VIP' ? '⭐' : selectedRoom.type === 'EKSEKUTIF' ? '🏥' : selectedRoom.type === 'EKONOMI' ? '🎓' : '🏠'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-black text-slate-800 dark:text-white">{selectedRoom.number}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${statusBadge(selectedRoom.status).cls}`}>{statusBadge(selectedRoom.status).label}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{selectedRoom.desc}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRoom.facilities.slice(0, 3).map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg neu-inset text-[10px] text-slate-500 dark:text-slate-400 font-semibold">✓ {f}</span>
                  ))}
                  {selectedRoom.facilities.length > 3 && (
                    <span className="px-2 py-0.5 rounded-lg neu-inset text-[10px] text-slate-400 font-semibold">+{selectedRoom.facilities.length - 3} lagi</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="neu-card rounded-3xl p-5 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Data Pemesan</p>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Nama Lengkap *</label>
              <input type="text" placeholder="dr. Ahmad Fauzi / Siti Sarah" value={tenantName} onChange={(e) => setTenantName(e.target.value)}
                className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">No. WhatsApp</label>
                <input type="tel" placeholder="08123456789" value={tenantPhone} onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent placeholder-slate-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Tanggal Masuk</label>
                <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full p-3 rounded-xl neu-inset text-xs text-slate-800 dark:text-white font-bold outline-none bg-transparent" />
              </div>
            </div>

            {/* Payment Choice */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Skema Pembayaran</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'DP_50' as const, label: 'Kunci DP 50%', amount: selectedRoom.price * 0.5, sub: 'Sisa dibayar saat masuk' },
                  { type: 'FULL' as const, label: 'Bayar Lunas', amount: selectedRoom.price, sub: 'Langsung aktif sebulan' },
                ].map((opt) => (
                  <button key={opt.type} type="button" onClick={() => setPayType(opt.type)}
                    className={`p-3 rounded-2xl text-left cursor-pointer transition-all ${payType === opt.type ? 'neu-card border border-emerald-500/25' : 'neu-inset'}`}>
                    <div className={`text-xs font-bold mb-1 ${payType === opt.type ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-500'}`}>{opt.label}</div>
                    <div className={`text-sm font-black font-mono ${payType === opt.type ? 'text-slate-800 dark:text-white' : 'text-slate-600'}`}>Rp {opt.amount.toLocaleString('id-ID')}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handlePay} disabled={loading || !tenantName.trim()}
              className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50">
              {loading ? <><i className="fa-solid fa-spinner animate-spin" /> Memproses...</> : <><i className="fa-solid fa-qrcode" /> Bayar Rp {dueAmount.toLocaleString('id-ID')} (QRIS / VA)</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======= ROOM LISTING =======
  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-lg w-full space-y-5">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black mb-3">
            <i className="fa-solid fa-house-chimney text-xs" />
            <span>VIRTUAL SHOWROOM & INSTANT BOOKING</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Pilih Kamar Kosan</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{property}</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: 'fa-door-open', label: 'Tersedia', val: availableCount, color: 'text-[#047857] dark:text-emerald-400' },
            { icon: 'fa-door-closed', label: 'Terisi', val: rooms.filter(r => r.status === 'OCCUPIED').length, color: 'text-slate-500' },
            { icon: 'fa-home', label: 'Total Kamar', val: rooms.length, color: 'text-slate-700 dark:text-slate-200' },
          ].map((s) => (
            <div key={s.label} className="neu-inset rounded-2xl p-3 text-center">
              <i className={`fa-solid ${s.icon} text-base ${s.color} mb-1 block`} />
              <div className={`text-lg font-black font-mono ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-slate-400 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {roomTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                filterType === t ? 'neu-card text-[#047857] dark:text-emerald-400' : 'neu-inset text-slate-500 dark:text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Room List */}
        {loadingRooms ? (
          <div className="neu-card rounded-3xl p-10 text-center">
            <i className="fa-solid fa-spinner animate-spin text-2xl text-[#047857] dark:text-emerald-400 mb-3 block" />
            <p className="text-xs text-slate-400 font-semibold">Memuat daftar kamar...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room) => {
              const badge = statusBadge(room.status);
              const isAvailable = room.status === 'AVAILABLE';
              return (
                <div key={room.id} className="neu-card rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl ${isAvailable ? 'neu-inset' : 'neu-inset opacity-50'}`}>
                      {room.type === 'VIP' ? '⭐' : room.type === 'EKSEKUTIF' ? '🏥' : room.type === 'EKONOMI' ? '🎓' : '🏠'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-black text-slate-800 dark:text-white">{room.number}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${badge.cls}`}>{badge.label}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Lantai {room.floor}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">{room.desc}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {room.facilities.slice(0, 3).map((f, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded-lg neu-inset text-[10px] text-slate-400 font-semibold">{f}</span>
                        ))}
                        {room.facilities.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded-lg neu-inset text-[10px] text-slate-400">+{room.facilities.length - 3}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-base font-black text-[#047857] dark:text-emerald-400 font-mono">
                            Rp {room.price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">/bln</span>
                        </div>
                        {isAvailable ? (
                          <button
                            onClick={() => setSelectedRoom(room)}
                            className="px-4 py-2 rounded-xl neu-btn-primary text-xs font-black cursor-pointer active:scale-95 flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-lock-open text-[10px]" /> Booking
                          </button>
                        ) : (
                          <span className="px-4 py-2 rounded-xl neu-inset text-xs font-bold text-slate-400">
                            {room.status === 'OCCUPIED' ? 'Terisi' : 'Renovasi'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400 font-semibold pb-4">
          Powered by KosanKu Pro — Sistem Manajemen Kos Digital
        </p>
      </div>
    </div>
  );
}
