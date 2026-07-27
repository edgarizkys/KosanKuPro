'use client';

import { useEffect, useRef, useState } from 'react';

interface RoomItem {
  id: string;
  number: string;
  type: string;
  price: number;
  status: string;
  floor: number;
  facilities?: string[];
  imageUrl?: string | null;
}

const FALLBACK_ROOMS: RoomItem[] = [
  { id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000, status: 'OCCUPIED', floor: 1, imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80' },
  { id: '2', number: 'A-102', type: 'Deluxe Studio Smart', price: 1500000, status: 'AVAILABLE', floor: 1, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80' },
  { id: '3', number: 'B-201', type: 'VIP Balcony Resort', price: 2000000, status: 'OCCUPIED', floor: 2, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  { id: '4', number: 'B-202', type: 'VIP Balcony Resort', price: 2000000, status: 'MAINTENANCE', floor: 2, imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80' },
  { id: '5', number: 'C-301', type: 'Standard Smart Suite', price: 1200000, status: 'AVAILABLE', floor: 3, imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80' },
  { id: '6', number: 'C-302', type: 'Standard Smart Suite', price: 1200000, status: 'OCCUPIED', floor: 3, imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80' },
];

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

function statusColor(status: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-500/90 text-white';
  if (status === 'OCCUPIED') return 'bg-rose-500/90 text-white';
  return 'bg-amber-500/90 text-orchid-dark';
}

export default function RoomsSection({ onLogin }: { onLogin: () => void }) {
  const swiperRef = useRef<HTMLDivElement>(null);
  const swiperInstance = useRef<any>(null);
  const [rooms, setRooms] = useState<RoomItem[]>(FALLBACK_ROOMS);
  const [filter, setFilter] = useState<string>('all');
  const [detailRoom, setDetailRoom] = useState<RoomItem | null>(null);
  const [bookingSent, setBookingSent] = useState(false);

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.length) setRooms(json.data);
      })
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.status === filter);
  const available = rooms.filter((r) => r.status === 'AVAILABLE');
  const top3 = available.slice(0, 3).map((r, i) => ({
    ...r,
    badge: i === 0 ? '👑 #1 Best' : i === 1 ? '⭐ #2' : '🔥 #3',
    badgeClass: i === 0 ? 'bg-orchid-gold text-orchid-dark' : 'bg-orchid-violet text-white',
  }));

  useEffect(() => {
    if (!swiperRef.current || typeof window === 'undefined') return;
    const SwiperLib = (window as any).Swiper;
    if (!SwiperLib) return;

    // Destroy previous instance before re-creating
    if (swiperInstance.current) {
      swiperInstance.current.destroy(true, true);
      swiperInstance.current = null;
    }

    // Wait for DOM to settle after React re-render
    const timer = setTimeout(() => {
      if (!swiperRef.current) return;
      swiperInstance.current = new SwiperLib('.swiperRooms', {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: filtered.length > 3,
        autoplay: { delay: 3500, disableOnInteraction: false },
        pagination: { el: '.swiperRooms .swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiperRooms .swiper-button-next', prevEl: '.swiperRooms .swiper-button-prev' },
        breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [rooms, filter]);

  return (
    <section id="rooms-section" className="space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 reveal px-1 sm:px-0">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-orchid-gold">Katalog Kamar</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-1.5 sm:mt-2">Pilihan Unit Terbaik</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 sm:mt-2">{rooms.length} unit premium dengan fasilitas kelas atas di jantung Dago</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 self-start overflow-x-auto scrollbar-none">
          {['all', 'AVAILABLE', 'OCCUPIED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-bold transition-all border whitespace-nowrap flex-shrink-0 ${
              filter === f ? 'bg-white text-orchid-dark border-white' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}>
              {f === 'all' ? 'Semua' : f === 'AVAILABLE' ? 'Tersedia' : 'Terisi'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 cards */}
      {top3.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((room, idx) => (
          <div key={room.id} className={`glass-card rounded-2xl sm:rounded-3xl overflow-hidden group card-premium spotlight-card border-gradient-animated`} style={{ animationDelay: `${idx * 0.12}s` }}>
            <div className="relative h-40 sm:h-52 overflow-hidden bg-orchid-surface">
              <img src={room.imageUrl || DEFAULT_IMG} alt={room.type} loading="lazy" className="w-full h-full object-cover img-zoom" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-orchid-dark/80 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm">Available</span>
              <span className={`absolute top-4 right-4 px-3 py-1.5 ${room.badgeClass} text-[10px] font-black uppercase rounded-full shadow-lg`}>{room.badge}</span>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-extrabold text-white">{room.type}</h3>
                <p className="text-[11px] text-slate-300">Kamar {room.number} • Lantai {room.floor}</p>
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {room.facilities.slice(0, 4).map((f) => (
                    <span key={f} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] text-slate-300 font-medium">{f}</span>
                  ))}
                  {room.facilities.length > 4 && <span className="text-[9px] text-slate-500">+{room.facilities.length - 4}</span>}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-white">Rp {(room.price / 1000000).toFixed(1)}<span className="text-sm font-bold text-slate-400">jt</span></span>
                  <span className="text-[10px] text-slate-500 block">/bulan</span>
                </div>
                <button onClick={() => { setDetailRoom(room); setBookingSent(false); }} className="px-5 py-2.5 bg-white text-orchid-dark text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 hover:scale-105 transition-all duration-300">Detail</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Swiper carousel */}
      <div className="reveal delay-2" ref={swiperRef}>
        <div className="swiper swiperRooms">
          <div className="swiper-wrapper">
            {filtered.map((room) => (
              <div key={room.id} className="swiper-slide">
                <div className="glass-card rounded-xl sm:rounded-2xl overflow-hidden group h-full">
                  <div className="relative h-36 sm:h-44 overflow-hidden">
                    <img src={room.imageUrl || DEFAULT_IMG} alt={room.number} loading="lazy" className="w-full h-full object-cover img-zoom" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-orchid-dark/70 to-transparent" />
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 ${statusColor(room.status)} text-[9px] font-bold uppercase rounded-full`}>{room.status}</span>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-sm font-bold text-white">{room.type}</h3>
                      <p className="text-[10px] text-slate-300">Kamar {room.number} • Lt {room.floor}</p>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 space-y-2">
                    {room.facilities && room.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {room.facilities.slice(0, 3).map((f) => (
                          <span key={f} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] text-slate-400">{f}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-orchid-tint">{formatPrice(room.price)}</span>
                      <button onClick={() => { setDetailRoom(room); setBookingSent(false); }} className="px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all">Detail</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-pagination mt-5 sm:mt-8" />
          <div className="swiper-button-next hidden sm:flex" />
          <div className="swiper-button-prev hidden sm:flex" />
        </div>
      </div>

      {/* Room Detail Modal */}
      {detailRoom && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetailRoom(null)}>
          <div className="bg-[#1a1025] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56">
              <img src={detailRoom.imageUrl || DEFAULT_IMG} alt={detailRoom.type} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1025] via-transparent to-transparent" />
              <button onClick={() => setDetailRoom(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all">
                <i className="fa-solid fa-xmark" />
              </button>
              <span className={`absolute top-4 left-4 px-3 py-1 ${statusColor(detailRoom.status)} text-[10px] font-bold uppercase rounded-full`}>{detailRoom.status}</span>
              <div className="absolute bottom-4 left-5">
                <h3 className="text-xl font-black text-white">{detailRoom.type}</h3>
                <p className="text-xs text-slate-300">Kamar {detailRoom.number} • Lantai {detailRoom.floor}</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-white">{formatPrice(detailRoom.price)}</span>
                  <span className="text-xs text-slate-500 block">/bulan</span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <p><i className="fa-solid fa-ruler-combined mr-1 text-orchid-tint" /> Lt {detailRoom.floor}</p>
                  <p className="mt-1"><i className="fa-solid fa-hashtag mr-1 text-orchid-tint" /> {detailRoom.number}</p>
                </div>
              </div>
              {detailRoom.facilities && detailRoom.facilities.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fasilitas</h4>
                  <div className="flex flex-wrap gap-2">
                    {detailRoom.facilities.map((f) => (
                      <span key={f} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-slate-300 font-medium">
                        <i className="fa-solid fa-check text-emerald-400 mr-1.5 text-[8px]" />{f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-3 border-t border-white/5 space-y-3">
                {detailRoom.status === 'AVAILABLE' ? (
                  bookingSent ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mx-auto mb-3"><i className="fa-solid fa-check" /></div>
                      <p className="text-sm font-bold text-white">Permintaan Booking Terkirim!</p>
                      <p className="text-[11px] text-slate-400 mt-1">Admin akan menghubungi kamu via WhatsApp untuk konfirmasi DP.</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/whatsapp/send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ message: `Halo, saya tertarik booking kamar ${detailRoom.number} (${detailRoom.type}) - ${formatPrice(detailRoom.price)}/bln. Mohon info DP-nya.`, target: '' }),
                            });
                          } catch {}
                          setBookingSent(true);
                        }}
                        className="w-full py-3.5 bg-white text-orchid-dark font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all"
                      >
                        <i className="fa-solid fa-calendar-check mr-2" />Booking Sekarang
                      </button>
                      <p className="text-center text-[10px] text-slate-500">Gratis • Admin akan konfirmasi via WhatsApp</p>
                    </>
                  )
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm font-bold text-slate-400"><i className="fa-solid fa-lock mr-2" />Kamar sedang {detailRoom.status === 'OCCUPIED' ? 'terisi' : 'maintenance'}</p>
                    <button onClick={onLogin} className="mt-3 px-5 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all">Hubungi Admin</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
