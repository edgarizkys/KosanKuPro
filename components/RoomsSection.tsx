'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BookingModal from './BookingModal';
import { useProperty } from '@/lib/PropertyContext';

import { RSHS_ROOMS_DATA } from '@/lib/rshsRoomsData';

export interface RoomItem {
  id: string;
  number: string;
  type: string;
  price: number;
  status: string;
  floor: number;
  size?: string;
  bedType?: string;
  electricity?: string;
  view?: string;
  capacity?: string;
  videoUrl?: string;
  gallery?: string[];
  facilities?: string[];
  categorizedFacilities?: {
    kamar: string[];
    kamarMandi: string[];
    smart: string[];
    bersama: string[];
  };
  imageUrl?: string | null;
}

const FALLBACK_ROOMS: RoomItem[] = [
  {
    id: '1',
    number: 'A-101',
    type: 'Deluxe Studio Smart',
    price: 1500000,
    status: 'OCCUPIED',
    floor: 1,
    size: '4 x 5 m (20 m²)',
    bedType: 'Queen Bed (160x200)',
    electricity: 'Token Mandiri 1300W',
    view: 'Inner Garden Courtyard',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-apartment-living-room-42861-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['Springbed Queen', 'Smart TV 43"', 'AC 1 PK Daikin', 'Water Heater', 'Smart Lock', 'WiFi 100Mbps'],
    categorizedFacilities: {
      kamar: ['Springbed Queen Comfort', 'AC 1 PK Daikin Inverter', 'Smart TV 43" 4K HDR', 'Lemari 3 Pintu Cermin', 'Meja Kerja & Kursi Ergonomis', 'Gorden Blackout Premium'],
      kamarMandi: ['Kamar Mandi Dalam', 'Water Heater Ariston 24 Jam', 'Rain Shower Modern', 'Kloset Duduk Toto Eco Washer', 'Wastafel Marmer & Cermin LED'],
      smart: ['Smart Door Lock (Fingerprint & PIN)', 'Dedicated WiFi Router 100Mbps', 'Smart Lighting Control', 'Intercom Unit ke Resepsionis'],
      bersama: ['Dapur Bersama Lengkap + Kulkas', 'Dispenser Air RO Hot & Cold', 'Mesin Cuci Otomatis Gratis', 'Rooftop Lounge & Co-Working Space'],
    },
  },
  {
    id: '2',
    number: 'A-102',
    type: 'Deluxe Studio Smart',
    price: 1500000,
    status: 'AVAILABLE',
    floor: 1,
    size: '4 x 5 m (20 m²)',
    bedType: 'Queen Bed (160x200)',
    electricity: 'Token Mandiri 1300W',
    view: 'Inner Garden Courtyard',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-hotel-room-with-a-king-bed-42862-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['Springbed Queen', 'Smart TV 43"', 'AC 1 PK Daikin', 'Water Heater', 'Smart Lock', 'WiFi 100Mbps'],
    categorizedFacilities: {
      kamar: ['Springbed Queen Comfort', 'AC 1 PK Daikin Inverter', 'Smart TV 43" 4K', 'Lemari 3 Pintu', 'Meja Kerja & Kursi Ergonomis'],
      kamarMandi: ['Kamar Mandi Dalam', 'Water Heater Ariston 24 Jam', 'Rain Shower', 'Kloset Duduk Toto', 'Wastafel Marmer'],
      smart: ['Smart Door Lock (Fingerprint & PIN)', 'Dedicated WiFi Router 100Mbps', 'Smart Lighting Motion'],
      bersama: ['Dapur Bersama Lengkap', 'Dispenser Air RO', 'Mesin Cuci Gratis', 'Rooftop Lounge'],
    },
  },
  {
    id: '3',
    number: 'B-201',
    type: 'VIP Balcony Resort',
    price: 2000000,
    status: 'OCCUPIED',
    floor: 2,
    size: '5 x 6 m (30 m²)',
    bedType: 'King Size (180x200)',
    electricity: 'Token Mandiri 2200W',
    view: 'Balkon Pribadi City & Mountain View',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-apartment-living-room-42861-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['King Bed 180x200', 'Balkon Pribadi', 'Smart TV 50" 4K', 'Kulkas 2 Pintu', 'AC 1.5 PK Daikin', 'Bathtub / Jacuzzi'],
    categorizedFacilities: {
      kamar: ['King Size Bed 180x200 Orthopedic', 'Balkon Luas Pribadi + Meja Santai', 'Smart TV 50" 4K HDR', 'AC 1.5 PK Daikin Flash Inverter', 'Kulkas 2 Pintu Pribadi', 'Walk-in Closet Mewah'],
      kamarMandi: ['Kamar Mandi Dalam Luas', 'Bathtub & Rain Shower Terpisah', 'Water Heater Ariston Digital 24 Jam', 'Kloset Smart Bidet Toto', 'Double Vanity Wastafel'],
      smart: ['Smart Door Lock (Face Recognition & PIN)', 'High Speed WiFi 150Mbps Dedicated', 'Google Home Smart Assistant', 'Automated Curtain Control'],
      bersama: ['Akses Eksklusif Rooftop VIP Lounge', 'Dapur Bersama Chef-Grade', 'Area Parkir Mobil Terdedikasi', 'Free Laundry 3x Seminggu'],
    },
  },
  {
    id: '4',
    number: 'B-202',
    type: 'VIP Balcony Resort',
    price: 2000000,
    status: 'MAINTENANCE',
    floor: 2,
    size: '5 x 6 m (30 m²)',
    bedType: 'King Size (180x200)',
    electricity: 'Token Mandiri 2200W',
    view: 'Balkon Pribadi Garden View',
    capacity: '1 - 2 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-hotel-room-with-a-king-bed-42862-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['King Bed 180x200', 'Balkon Pribadi', 'Smart TV 50" 4K', 'Kulkas 2 Pintu', 'AC 1.5 PK Daikin'],
    categorizedFacilities: {
      kamar: ['King Size Bed 180x200', 'Balkon Pribadi', 'Smart TV 50" 4K', 'AC 1.5 PK Daikin Inverter', 'Kulkas 2 Pintu'],
      kamarMandi: ['Kamar Mandi Dalam', 'Water Heater Ariston 24 Jam', 'Rain Shower', 'Kloset Toto'],
      smart: ['Smart Door Lock Fingerprint', 'Dedicated WiFi 150Mbps'],
      bersama: ['Akses Rooftop VIP Lounge', 'Dapur Bersama', 'Parkir Mobil'],
    },
  },
  {
    id: '5',
    number: 'C-301',
    type: 'Standard Smart Suite',
    price: 1200000,
    status: 'AVAILABLE',
    floor: 3,
    size: '3.5 x 4 m (14 m²)',
    bedType: 'Single Bed (120x200)',
    electricity: 'Token Mandiri 900W',
    view: 'Skyline Dago Bandung',
    capacity: '1 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-luxury-apartment-living-room-42861-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['Single Bed 120x200', 'AC 0.75 PK', 'Water Heater', 'Smart Lock', 'WiFi 100Mbps', 'Meja Belajar'],
    categorizedFacilities: {
      kamar: ['Single Bed 120x200 Comfort', 'AC 0.75 PK Hemat Energi', 'Meja Belajar & Rak Buku', 'Lemari 2 Pintu'],
      kamarMandi: ['Kamar Mandi Dalam', 'Water Heater 24 Jam', 'Shower & Kloset Duduk Toto'],
      smart: ['Smart Lock PIN Access', 'WiFi 100Mbps Cepat & Stabil'],
      bersama: ['Dapur Bersama', 'Dispenser Air Minum', 'Mesin Cuci Gratis'],
    },
  },
  {
    id: '6',
    number: 'C-302',
    type: 'Standard Smart Suite',
    price: 1200000,
    status: 'OCCUPIED',
    floor: 3,
    size: '3.5 x 4 m (14 m²)',
    bedType: 'Single Bed (120x200)',
    electricity: 'Token Mandiri 900W',
    view: 'Skyline Dago Bandung',
    capacity: '1 Orang',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-hotel-room-with-a-king-bed-42862-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
    ],
    facilities: ['Single Bed 120x200', 'AC 0.75 PK', 'Water Heater', 'Smart Lock', 'WiFi 100Mbps'],
    categorizedFacilities: {
      kamar: ['Single Bed 120x200', 'AC 0.75 PK', 'Meja Belajar', 'Lemari 2 Pintu'],
      kamarMandi: ['Kamar Mandi Dalam', 'Water Heater', 'Shower & Kloset Duduk'],
      smart: ['Smart Lock PIN', 'WiFi 100Mbps'],
      bersama: ['Dapur Bersama', 'Dispenser RO', 'Mesin Cuci'],
    },
  },
];

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

function statusColor(status: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-500 text-white';
  if (status === 'OCCUPIED') return 'bg-rose-500 text-white';
  if (status === 'BOOKING') return 'bg-amber-400 text-slate-900';
  return 'bg-amber-500 text-slate-900';
}

export default function RoomsSection({
  onLogin,
  onOpenBookingPage,
}: {
  onLogin: () => void;
  onOpenBookingPage?: (roomObj: RoomItem) => void;
}) {
  const { property } = useProperty();
  const isRshs = property.slug === 'rshs';
  const defaultRoomsList = isRshs ? RSHS_ROOMS_DATA : FALLBACK_ROOMS;

  const swiperRef = useRef<HTMLDivElement>(null);
  const swiperInstance = useRef<any>(null);
  const [rooms, setRooms] = useState<RoomItem[]>(isRshs ? RSHS_ROOMS_DATA : FALLBACK_ROOMS);
  const [filter, setFilter] = useState<string>('all');
  const [detailRoom, setDetailRoom] = useState<RoomItem | null>(null);
  const [selectedMediaTab, setSelectedMediaTab] = useState<'photo' | 'video'>('photo');
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [activeFacilityCategory, setActiveFacilityCategory] = useState<'all' | 'kamar' | 'kamarMandi' | 'smart' | 'bersama'>('all');
  const [bookingSent, setBookingSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<RoomItem | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ignore = false;
    const currentSlug = property.slug;
    const activeDefaultList = currentSlug === 'rshs' ? RSHS_ROOMS_DATA : FALLBACK_ROOMS;

    setRooms(activeDefaultList);

    let localCustomRooms: RoomItem[] = [];
    try {
      if (currentSlug !== 'default') {
        localCustomRooms = JSON.parse(localStorage.getItem(`kosanku_custom_rooms_${currentSlug}`) || '[]');
      } else {
        localCustomRooms = JSON.parse(localStorage.getItem('kosanku_custom_rooms') || '[]');
      }
    } catch {}

    fetch(`/api/rooms?property=${currentSlug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (ignore) return;

        const dbList = (json?.data && Array.isArray(json.data)) ? json.data : [];
        const combined = [...dbList];

        // Merge any custom local rooms not yet present in db
        localCustomRooms.forEach((lr) => {
          if (!combined.some((cr: any) => cr.number === lr.number || cr.id === lr.id)) {
            combined.push(lr);
          }
        });

        if (combined.length > 0) {
          const merged: RoomItem[] = combined.map((r: any, idx: number) => {
            const fb = activeDefaultList[idx % activeDefaultList.length];
            const localOverride =
              localStorage.getItem(`kosanku_room_status_${r.id}`) ||
              localStorage.getItem(`kosanku_room_status_${r.number}`);
            return {
              id: r.id || `custom-${idx}`,
              number: r.number,
              type: r.type || fb?.type || 'Standard',
              price: typeof r.price === 'number' ? r.price : parseFloat(r.price) || fb?.price || 1000000,
              status: localOverride || r.status || 'AVAILABLE',
              floor: r.floor || 1,
              imageUrl: r.imageUrl || fb?.imageUrl || DEFAULT_IMG,
              gallery: r.gallery && r.gallery.length ? r.gallery : (fb?.gallery && fb.gallery.length ? fb.gallery : [r.imageUrl || fb?.imageUrl || DEFAULT_IMG]),
              videoUrl: r.videoUrl || fb?.videoUrl,
              size: r.size || fb?.size || '4 x 5 m (20 m²)',
              bedType: r.bedType || fb?.bedType || 'Kasur Comfort',
              electricity: r.electricity || fb?.electricity || 'Token Mandiri',
              view: r.view || fb?.view || 'Area Tenang & Nyaman',
              capacity: r.capacity ? `${r.capacity} Orang` : fb?.capacity || '1 - 2 Orang',
              facilities: r.facilities && r.facilities.length ? r.facilities : fb?.facilities || ['AC', 'WiFi', 'KM Dalam'],
              categorizedFacilities: r.categorizedFacilities || fb?.categorizedFacilities,
            };
          });

          setRooms(merged);
        } else {
          const overriddenDefault = activeDefaultList.map((r) => {
            const localOverride =
              localStorage.getItem(`kosanku_room_status_${r.id}`) ||
              localStorage.getItem(`kosanku_room_status_${r.number}`);
            return localOverride ? { ...r, status: localOverride } : r;
          });
          setRooms(overriddenDefault);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('Failed to load rooms from server, using fallback:', err);
          setRooms(activeDefaultList);
        }
      });

    return () => {
      ignore = true;
    };
  }, [property.slug]);

  // Event listener for live room additions
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('kosanku_room_channel');
      bc.onmessage = (ev) => {
        if (ev.data?.type === 'ROOM_ADDED') {
          // Re-fetch current property rooms
        }
      };
    }

    const handleStatusChanged = (e: any) => {
      const { roomId, roomNumber, status: newStatus } = e.detail || {};
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId || r.number === roomNumber ? { ...r, status: newStatus || 'BOOKED' } : r))
      );
    };

    window.addEventListener('kosanku_room_status_changed', handleStatusChanged);
    window.addEventListener('kosanku_booking_created', handleStatusChanged);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('kosanku_room_status_changed', handleStatusChanged);
      window.removeEventListener('kosanku_booking_created', handleStatusChanged);
    };
  }, [property.slug]);

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.status.toUpperCase() === filter.toUpperCase());
  const available = rooms.filter((r) => r.status.toUpperCase() === 'AVAILABLE');
  const top3 = (filter === 'OCCUPIED' ? filtered : available).slice(0, 3).map((r, i) => ({
    ...r,
    badge: i === 0 ? '👑 #1 Best Choice' : i === 1 ? '⭐ #2 Populer' : '🔥 #3 Favorite',
    badgeClass: i === 0 ? 'bg-amber-400 text-slate-900 font-extrabold' : 'bg-purple-600 text-white font-bold',
  }));

  useEffect(() => {
    if (!swiperRef.current || typeof window === 'undefined') return;
    const SwiperLib = (window as any).Swiper;
    if (!SwiperLib) return;

    if (swiperInstance.current) {
      swiperInstance.current.destroy(true, true);
      swiperInstance.current = null;
    }

    const timer = setTimeout(() => {
      if (!swiperRef.current) return;
      swiperInstance.current = new SwiperLib('.swiperRooms', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: filtered.length > 3,
        autoplay: { delay: 5000, disableOnInteraction: false },
        breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [rooms.length, filter]);

  const openRoomDetail = (room: RoomItem) => {
    setDetailRoom(room);
    setSelectedMediaTab('photo');
    setActivePhotoIdx(0);
    setActiveFacilityCategory('all');
    setBookingSent(false);
  };

  return (
    <>
    <section id="rooms-section" className="space-y-6 sm:space-y-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 reveal">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Katalog Kamar Eksklusif</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-1.5 sm:mt-2 tracking-tight">Pilihan Unit Terbaik</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 sm:mt-2">
            {rooms.length} tipe pilihan kamar siap huni dengan video tour &amp; fasilitas lengkap {isRshs ? 'di depan RS Hasan Sadikin Bandung' : 'di Bandung'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 self-start overflow-x-auto scrollbar-none p-1 neu-inset rounded-2xl">
          {['all', 'AVAILABLE', 'OCCUPIED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                filter === f
                  ? 'bg-[#047857] text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]'
                  : 'neu-btn text-slate-600 dark:text-slate-300'
              }`}
            >
              {f === 'all' ? 'Semua Unit' : f === 'AVAILABLE' ? '🟢 Tersedia' : '🔴 Terisi'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Featured Cards */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {top3.map((room, idx) => (
            <div
              key={room.id}
              className={`reveal delay-${idx + 1} neu-card-sm rounded-2xl sm:rounded-3xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div>
                <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-900">
                  {room.videoUrl ? (
                    <video
                      key={room.videoUrl}
                      src={room.videoUrl}
                      poster={room.imageUrl || DEFAULT_IMG}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <img
                      src={room.imageUrl || DEFAULT_IMG}
                      alt={room.type}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMG;
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className={`px-3 py-1 ${statusColor(room.status)} text-[10px] font-extrabold uppercase rounded-full shadow-md backdrop-blur-xs`}>
                      {room.status}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {room.videoUrl && (
                        <span className="px-2.5 py-1 bg-rose-600 text-white text-[9px] font-bold rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-md">
                          <i className="fa-solid fa-play text-white animate-pulse" /> Video Tour
                        </span>
                      )}
                      <span className={`px-3 py-1 ${room.badgeClass} text-[10px] uppercase rounded-full shadow-lg`}>
                        {room.badge}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Room Headline in photo */}
                  <div className="absolute bottom-3.5 left-4 right-4 text-white z-10 pointer-events-none" style={{ color: '#ffffff' }}>
                    <h3 className="text-lg sm:text-xl font-black text-white !text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]" style={{ color: '#ffffff' }}>{room.type}</h3>
                    <div className="flex items-center gap-2.5 text-[11px] text-white/95 !text-white/95 font-bold mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]" style={{ color: 'rgba(255,255,255,0.95)' }}>
                      <span>Kamar {room.number}</span>
                      <span>•</span>
                      <span>Lt {room.floor}</span>
                      <span>•</span>
                      <span>{room.size || '20 m²'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5">
                  {/* Specification Quick Chips */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5 neu-inset p-2 rounded-xl">
                      <i className="fa-solid fa-bed text-amber-500" />
                      <span className="truncate">{room.bedType || 'Queen Bed'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 neu-inset p-2 rounded-xl">
                      <i className="fa-solid fa-bolt text-amber-500" />
                      <span className="truncate">{room.electricity || 'Token 1300W'}</span>
                    </div>
                  </div>

                  {/* Key Facilities Badges */}
                  {room.facilities && room.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.slice(0, 4).map((f) => (
                        <span key={f} className="px-2.5 py-1 neu-card-sm rounded-lg text-[9px] text-slate-700 dark:text-slate-300 font-medium">
                          {f}
                        </span>
                      ))}
                      {room.facilities.length > 4 && <span className="text-[9px] text-slate-400 font-semibold self-center">+{room.facilities.length - 4} fasilitas</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      Rp {(room.price / 1000000).toFixed(1)}
                      <span className="text-sm font-bold text-slate-500">jt</span>
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">/bulan</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openRoomDetail(room);
                    }}
                    className="relative z-20 cursor-pointer px-5 py-2.5 neu-btn text-[#047857] dark:text-emerald-300 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5"
                  >
                    <span>Lihat Detail</span>
                    <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Paginated Catalog Grid (Clean, Luxurious & Organised for unlimited rooms) */}
      <div className="space-y-6 pt-4 border-t border-slate-200/60 dark:border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-list-check text-[#047857] dark:text-emerald-400" />
              Katalog Seluruh Unit Kamar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Menampilkan {Math.min(visibleCount, filtered.length)} dari {filtered.length} kamar terdaftar
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {filtered.length > 6 && visibleCount < filtered.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + 6)}
                className="px-4 py-2 neu-btn text-xs font-bold text-[#047857] dark:text-emerald-300 rounded-xl cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <span>Muat Lebih Banyak (+6)</span>
                <i className="fa-solid fa-plus text-[10px]" />
              </button>
            )}
            {visibleCount > 6 && (
              <button
                type="button"
                onClick={() => setVisibleCount(6)}
                className="px-3 py-2 neu-btn text-xs font-bold text-slate-600 dark:text-slate-400 rounded-xl cursor-pointer hover:scale-105 transition-all"
              >
                Ciutkan
              </button>
            )}
          </div>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.slice(0, visibleCount).map((room, idx) => (
            <div
              key={room.id || idx}
              className="neu-card-sm rounded-2xl sm:rounded-3xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 sm:h-52 overflow-hidden bg-slate-900">
                  {room.videoUrl ? (
                    <video
                      key={room.videoUrl}
                      src={room.videoUrl}
                      poster={room.imageUrl || DEFAULT_IMG}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <img
                      src={room.imageUrl || DEFAULT_IMG}
                      alt={room.number}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMG;
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                    <span className={`px-3 py-0.5 ${statusColor(room.status)} text-[9px] font-bold uppercase rounded-full shadow-md`}>
                      {room.status}
                    </span>
                    {room.videoUrl && (
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[8px] font-bold rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1 shadow-md">
                        <i className="fa-solid fa-play text-white animate-pulse" /> Video Tour
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white z-10 pointer-events-none" style={{ color: '#ffffff' }}>
                    <h3 className="text-base font-black text-white !text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]" style={{ color: '#ffffff' }}>{room.type}</h3>
                    <p className="text-[11px] text-white/95 !text-white/95 font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]" style={{ color: 'rgba(255,255,255,0.95)' }}>Kamar {room.number} • Lantai {room.floor} • {room.size || '20 m²'}</p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5 neu-inset p-2 rounded-xl">
                      <i className="fa-solid fa-bed text-amber-500" />
                      <span className="truncate">{room.bedType || 'Queen Bed'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 neu-inset p-2 rounded-xl">
                      <i className="fa-solid fa-bolt text-amber-500" />
                      <span className="truncate">{room.electricity || 'Token Mandiri'}</span>
                    </div>
                  </div>

                  {room.facilities && room.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.slice(0, 4).map((f) => (
                        <span key={f} className="px-2.5 py-1 neu-card-sm rounded-lg text-[9px] text-slate-700 dark:text-slate-300 font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0">
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-white/10">
                  <div>
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">{formatPrice(room.price)}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 block">/bulan</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openRoomDetail(room);
                    }}
                    className="relative z-20 cursor-pointer px-4 py-2 neu-btn rounded-xl text-[11px] font-bold text-[#047857] dark:text-emerald-300 transition-all duration-200 flex items-center gap-1.5"
                  >
                    <span>Detail &amp; Booking</span>
                    <i className="fa-solid fa-arrow-right text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Load More Button */}
        {filtered.length > visibleCount && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + 6)}
              className="px-6 py-3 neu-btn text-xs font-black text-[#047857] dark:text-emerald-400 rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-layer-group" />
              <span>Tampilkan {filtered.length - visibleCount} Unit Kamar Lainnya</span>
            </button>
          </div>
        )}
      </div>

      {/* Comprehensive Luxury Room Detail Modal (Photo Gallery + Video Tour + Categorized Facilities) */}
      {mounted && detailRoom && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-5 animate-fade-in overflow-y-auto"
          onClick={() => setDetailRoom(null)}
        >
          <div
            className="neu-card rounded-3xl w-full max-w-2xl overflow-hidden animate-scale-in max-h-[92vh] flex flex-col shadow-2xl text-slate-900 dark:text-white my-auto border border-slate-200/80 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Media (Photo Gallery vs Video Tour Switcher) */}
            <div className="relative bg-black flex-shrink-0">
              {/* Media Switcher Tab Buttons */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/15">
                <button
                  type="button"
                  onClick={() => setSelectedMediaTab('photo')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedMediaTab === 'photo'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-image mr-1.5 text-[11px]" />
                  Foto ({detailRoom.gallery?.length || 1})
                </button>
                {detailRoom.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedMediaTab('video')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedMediaTab === 'video'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-play mr-1.5 text-[11px]" />
                    Video Tour 360°
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDetailRoom(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/70 hover:bg-red-600 text-white font-black rounded-full flex items-center justify-center transition-all shadow-2xl border border-white/40 backdrop-blur-md cursor-pointer hover:scale-105"
                title="Tutup Detail Kamar"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>

              {/* Media Viewport */}
              <div className="h-60 sm:h-72 w-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                {selectedMediaTab === 'photo' ? (
                  <>
                    <img
                      src={(detailRoom.gallery && detailRoom.gallery[activePhotoIdx]) || detailRoom.imageUrl || DEFAULT_IMG}
                      alt={detailRoom.type}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="w-full h-full relative bg-black flex items-center justify-center">
                    {detailRoom.videoUrl && detailRoom.videoUrl.includes('youtube') ? (
                      <iframe
                        src={`${detailRoom.videoUrl}?autoplay=1&mute=1&loop=1&playsinline=1`}
                        title={`Video Tour ${detailRoom.type}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <video
                        src={detailRoom.videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-5 right-5 pointer-events-none">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 ${statusColor(detailRoom.status)} text-[9px] font-black uppercase rounded-full shadow-md`}>
                      {detailRoom.status}
                    </span>
                    <span className="px-2.5 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded-full backdrop-blur-xs border border-white/20">
                      Lantai {detailRoom.floor}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">{detailRoom.type}</h3>
                  <p className="text-xs text-slate-200 drop-shadow">Kamar No. {detailRoom.number} • {detailRoom.view || 'Dago Scenic View'}</p>
                </div>
              </div>

              {/* Photo Thumbnails Strip (Only if Photo tab active & multiple photos) */}
              {selectedMediaTab === 'photo' && detailRoom.gallery && detailRoom.gallery.length > 1 && (
                <div className="bg-slate-950 p-2 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-white/10">
                  {detailRoom.gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhotoIdx(i)}
                      className={`relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                        activePhotoIdx === i ? 'border-amber-400 scale-105 ring-2 ring-amber-400/30' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Pricing & Key Specs Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl neu-inset">
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {formatPrice(detailRoom.price)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium mt-0.5">
                    / bulan (termasuk WiFi 100Mbps &amp; air bersih)
                  </span>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 neu-card-sm px-3 py-1.5 rounded-full inline-block">
                    ✓ Garansi Unit Bersih &amp; Siap Huni
                  </span>
                </div>
              </div>

              {/* Room Specifications Grid */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                  Spesifikasi Kamar
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3.5 rounded-2xl neu-card-sm space-y-1">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-ruler-combined text-amber-500" />
                      <span>Luas Kamar</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">{detailRoom.size || '20 m²'}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl neu-card-sm space-y-1">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-bed text-amber-500" />
                      <span>Tipe Ranjang</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">{detailRoom.bedType || 'Queen Bed'}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl neu-card-sm space-y-1">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-bolt text-amber-500" />
                      <span>Listrik</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">{detailRoom.electricity || 'Token 1300W'}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl neu-card-sm space-y-1">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <i className="fa-solid fa-user-group text-amber-500" />
                      <span>Kapasitas</span>
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">{detailRoom.capacity || '1-2 Orang'}</div>
                  </div>
                </div>
              </div>

              {/* Categorized Facilities Tabs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Fasilitas Lengkap
                  </h4>
                  <div className="flex gap-1 overflow-x-auto scrollbar-none neu-inset p-1 rounded-xl">
                    {[
                      { key: 'all', label: 'Semua' },
                      { key: 'kamar', label: '🛏️ Kamar' },
                      { key: 'kamarMandi', label: '🚿 Kamar Mandi' },
                      { key: 'smart', label: '⚡ Smart & IT' },
                      { key: 'bersama', label: '🏡 Bersama' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveFacilityCategory(tab.key as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          activeFacilityCategory === tab.key
                            ? 'neu-btn text-[#047857] dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtered Facility Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* If categorizedFacilities available */}
                  {detailRoom.categorizedFacilities ? (
                    <>
                      {(activeFacilityCategory === 'all' || activeFacilityCategory === 'kamar') &&
                        detailRoom.categorizedFacilities.kamar?.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 p-2.5 rounded-xl neu-card-sm text-xs font-bold text-slate-800 dark:text-slate-200">
                            <i className="fa-solid fa-bed text-amber-500 text-[11px]" />
                            <span>{f}</span>
                          </div>
                        ))}

                      {(activeFacilityCategory === 'all' || activeFacilityCategory === 'kamarMandi') &&
                        detailRoom.categorizedFacilities.kamarMandi?.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 p-2.5 rounded-xl neu-card-sm text-xs font-bold text-slate-800 dark:text-slate-200">
                            <i className="fa-solid fa-shower text-cyan-500 text-[11px]" />
                            <span>{f}</span>
                          </div>
                        ))}

                      {(activeFacilityCategory === 'all' || activeFacilityCategory === 'smart') &&
                        detailRoom.categorizedFacilities.smart?.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 p-2.5 rounded-xl neu-card-sm text-xs font-bold text-slate-800 dark:text-slate-200">
                            <i className="fa-solid fa-fingerprint text-purple-500 text-[11px]" />
                            <span>{f}</span>
                          </div>
                        ))}

                      {(activeFacilityCategory === 'all' || activeFacilityCategory === 'bersama') &&
                        detailRoom.categorizedFacilities.bersama?.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 p-2.5 rounded-xl neu-card-sm text-xs font-bold text-slate-800 dark:text-slate-200">
                            <i className="fa-solid fa-house-chimney-user text-emerald-500 text-[11px]" />
                            <span>{f}</span>
                          </div>
                        ))}
                    </>
                  ) : (
                    detailRoom.facilities?.map((f) => (
                      <div key={f} className="flex items-center gap-2.5 p-2.5 rounded-xl neu-card-sm text-xs font-bold text-slate-800 dark:text-slate-200">
                        <i className="fa-solid fa-check text-emerald-500 text-[11px]" />
                        <span>{f}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Fixed CTA Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-200/60 dark:border-white/10 neu-card flex-shrink-0">
              {detailRoom.status === 'AVAILABLE' ? (
                bookingSent ? (
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 text-center space-y-1">
                    <i className="fa-solid fa-circle-check text-emerald-500 text-xl" />
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Booking berhasil dikirim!</p>
                    <p className="text-[10px] text-slate-500">Admin akan menghubungi Anda dalam 1×24 jam.</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const targetRoom = detailRoom;
                        setDetailRoom(null);
                        if (onOpenBookingPage && targetRoom) {
                          onOpenBookingPage(targetRoom);
                        } else if ((window as any).__navigateToBookingPage && targetRoom) {
                          (window as any).__navigateToBookingPage(targetRoom);
                        } else {
                          setBookingRoom(targetRoom);
                        }
                      }}
                      className="w-full sm:flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xl hover:scale-[1.01] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-calendar-check" />
                      <span>Pesan Sekarang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetNum = (property.whatsapp || '6282114242634').replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${targetNum}?text=Halo%20Admin%20${encodeURIComponent(property.name)},%20saya%20ingin%20jadwalkan%20survei%20untuk%20Kamar%20${detailRoom.number}%20(${detailRoom.type}).`, '_blank');
                      }}
                      className="w-full sm:w-auto px-5 py-3.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i className="fa-regular fa-calendar" />
                      <span>Jadwal Survei</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-lock text-rose-500" />
                    <span>Kamar sedang {detailRoom.status === 'OCCUPIED' ? 'ditempati penghuni' : 'dalam tahap perawatan'}.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailRoom(null);
                      onLogin();
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Hubungi Admin / Masuk Waiting List
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>

    {/* BookingModal */}
    {bookingRoom && mounted && createPortal(
      <BookingModal
        room={bookingRoom}
        onClose={() => setBookingRoom(null)}
        onBookingSuccess={(roomId) => {
          setRooms((prev) =>
            prev.map((r) => r.id === roomId ? { ...r, status: 'BOOKING' } : r)
          );
          setBookingRoom(null);
        }}
      />,
      document.body
    )}
    </>
  );
}
