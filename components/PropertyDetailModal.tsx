'use client';

import { useState, useEffect } from 'react';
import { MultiPropertyRoomItem, ALL_MULTI_PROPERTY_ROOMS } from '@/lib/multiPropertyRoomsData';

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

interface PropertyDetailModalProps {
  room?: MultiPropertyRoomItem | null;
  building?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: (room: any) => void;
  onOpenSurvey: (room: any) => void;
}

export default function PropertyDetailModal({
  room: initialRoom,
  building,
  isOpen,
  onClose,
  onOpenBooking,
  onOpenSurvey,
}: PropertyDetailModalProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);

  // Available room types in this building
  const buildingSlug = initialRoom?.propertySlug || building?.slug || 'rshs';
  const availableRoomsInBuilding = ALL_MULTI_PROPERTY_ROOMS.filter(
    (r) => r.propertySlug === buildingSlug
  );

  const [activeRoom, setActiveRoom] = useState<MultiPropertyRoomItem | null>(
    initialRoom || availableRoomsInBuilding[0] || null
  );

  useEffect(() => {
    if (initialRoom) {
      setActiveRoom(initialRoom);
    } else if (building) {
      const match = ALL_MULTI_PROPERTY_ROOMS.find((r) => r.propertySlug === building.slug);
      if (match) setActiveRoom(match);
    }
  }, [initialRoom, building]);

  if (!isOpen || (!activeRoom && !building)) return null;

  // Normalized Display Data
  const title = activeRoom ? `${activeRoom.type} — Kamar ${activeRoom.number}` : building.name;
  const subtitle = activeRoom ? `${activeRoom.propertyName} • Lt ${activeRoom.floor}` : building.area;
  const address = activeRoom ? activeRoom.propertyAddress : building.area;
  const price = activeRoom ? activeRoom.price : building.priceStart;
  const dailyPrice = activeRoom ? activeRoom.dailyPrice : building.dailyPriceStart;
  const rating = activeRoom?.rating || building?.rating || 4.9;
  const reviewCount = activeRoom?.reviewCount || building?.reviewCount || 48;
  const mapLat = buildingSlug === 'rshs' ? -6.897368 : buildingSlug === 'dago-heritage' ? -6.883333 : buildingSlug === 'bsd-foresta' ? -6.302324 : -6.89312;
  const mapLng = buildingSlug === 'rshs' ? 107.598642 : buildingSlug === 'dago-heritage' ? 107.615 : buildingSlug === 'bsd-foresta' ? 106.65271 : 107.61635;

  const images: string[] = activeRoom?.gallery && activeRoom.gallery.length > 0
    ? activeRoom.gallery
    : activeRoom?.imageUrl
    ? [activeRoom.imageUrl, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80']
    : building?.images || [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const amenities = [
    { icon: 'fa-solid fa-snowflake', label: 'AC Daikin Inverter' },
    { icon: 'fa-solid fa-wifi', label: 'WiFi 100Mbps Fiber' },
    { icon: 'fa-solid fa-shower', label: 'Water Heater Pribadi' },
    { icon: 'fa-solid fa-tv', label: 'Smart TV 43" 4K Netflix' },
    { icon: 'fa-solid fa-shirt', label: 'Free Laundry 5kg/bln' },
    { icon: 'fa-solid fa-broom', label: 'Cleaning Service Rutin' },
    { icon: 'fa-solid fa-key', label: 'Smart Keyless PIN Lock' },
    { icon: 'fa-solid fa-square-parking', label: 'Parkir Motor/Mobil' },
    { icon: 'fa-solid fa-kitchen-set', label: 'Dapur Bersama Lengkap' },
    { icon: 'fa-solid fa-shield-halved', label: 'CCTV & Satpam 24 Jam' },
    { icon: 'fa-solid fa-mug-saucer', label: 'Rooftop Co-Working Lounge' },
    { icon: 'fa-solid fa-couch', label: 'Ruang Tamu Eksekutif' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto scrollbar-none">
      
      {/* Full Page Showcase Modal Container */}
      <div className="relative w-full max-w-7xl h-[94vh] max-h-[960px] bg-white dark:bg-[#0e0b16] rounded-[2rem] sm:rounded-[2.8rem] border border-white/80 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col lg:flex-row my-auto">
        
        {/* ═══════════════════════════════════════════════════════════
            LEFT COLUMN (Visual Showcase: Full-Height Photo Gallery)
            ═══════════════════════════════════════════════════════════ */}
        <div className="relative w-full lg:w-[50%] xl:w-[52%] h-72 sm:h-96 lg:h-full bg-slate-950 overflow-hidden flex flex-col justify-between shrink-0">
          
          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white text-sm flex items-center justify-center shadow-lg"
          >
            ✕
          </button>

          {/* High-Res Image Showcase */}
          <div className="relative w-full h-full">
            <img
              src={images[selectedPhotoIndex] || images[0]}
              alt={title}
              className="w-full h-full object-cover transition-all duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />

            {/* Thumbnail Strip Controls (Top Right) */}
            {images.length > 1 && (
              <div className="absolute top-4 sm:top-6 right-4 sm:right-6 hidden sm:flex items-center gap-2 z-20">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shadow-md ${
                      selectedPhotoIndex === idx
                        ? 'border-amber-400 scale-110 shadow-amber-400/30'
                        : 'border-white/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Left Rent Price Box */}
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 z-20 pointer-events-none">
              <div className="text-[11px] sm:text-xs font-bold text-white/80 uppercase tracking-widest leading-none mb-1">
                Rent price
              </div>
              <div className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                {formatPrice(price)}
                <span className="text-sm sm:text-base font-normal text-white/75 ml-1">/bulan</span>
              </div>
              {dailyPrice && (
                <div className="text-xs sm:text-sm font-semibold text-amber-300 mt-0.5 drop-shadow">
                  Tersedia Sewa Harian: {formatPrice(dailyPrice)}/hari
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════
            RIGHT COLUMN (Editorial Content, Specs, Amenities, Booking)
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 h-full overflow-y-auto scrollbar-none p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 bg-white dark:bg-[#0e0b16] text-slate-900 dark:text-white">
          
          {/* Top Action Row: Like, Share, Booking Pill, Close Button */}
          <div className="flex items-center justify-between gap-3">
            
            {/* Left Action Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`w-10 h-10 rounded-full neu-btn flex items-center justify-center transition-all ${
                  isLiked ? 'text-rose-500 neu-inset' : 'text-slate-600 dark:text-slate-300'
                }`}
                title="Simpan Favorit"
              >
                <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart text-sm`} />
              </button>

              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full neu-btn flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all"
                title="Salin Link Bagikan"
              >
                <i className="fa-solid fa-arrow-up-from-bracket text-sm" />
              </button>

              {copied && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
                  Link tersalin!
                </span>
              )}
            </div>

            {/* Right Top Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking(activeRoom || building);
                }}
                className="px-5 sm:px-6 py-2.5 rounded-2xl neu-btn-amber font-black text-xs flex items-center justify-center transition-all"
              >
                Rent Unit
              </button>

              <button
                onClick={onClose}
                className="hidden lg:flex w-10 h-10 rounded-2xl neu-btn items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white active:neu-inset transition-all text-sm font-bold"
                title="Tutup Modal"
              >
                ✕
              </button>
            </div>

          </div>

          {/* Title & Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <i className="fa-solid fa-star text-[11px]" />
              <span>{rating}</span>
              <span className="text-slate-400">({reviewCount} ulasan penghuni)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
              <i className="fa-solid fa-location-dot text-amber-500 text-xs" />
              <span>{subtitle}</span>
            </p>
          </div>

          {/* Editorial Description */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Nikmati kenyamanan hunian co-living modern dengan konsep arsitektur mewah terintegrasi. Kamar dirancang dengan pencahayaan alami optimal, ventilasi segar, kasur orthopedic berkualitas tinggi, dan fasilitas kamar mandi dalam marmer water heater.
              {isReadMore && (
                <span className="block pt-2 text-slate-500 dark:text-slate-400">
                  Didukung dengan keamanan 24 jam smart keyless access, akses internet cepat 100Mbps dedicated fiber, free laundry berkala, serta layanan resepsionis dan kebersihan rutin tanpa biaya tersembunyi.
                </span>
              )}
            </p>
            <button
              onClick={() => setIsReadMore(!isReadMore)}
              className="text-xs font-black text-slate-900 dark:text-white underline hover:text-amber-500 transition-colors"
            >
              {isReadMore ? 'Tutup Deskripsi' : 'Read more'}
            </button>
          </div>

          {/* Core Metrics Row (Exact 4 beds / 3 baths / sqft layout) */}
          <div className="flex items-baseline gap-6 sm:gap-10 py-3 border-y border-slate-100 dark:border-white/10">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">1</span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium ml-1.5">bed</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">1</span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium ml-1.5">bath (KM Dalam)</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">16</span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium ml-1.5">m² (4x4m)</span>
            </div>
          </div>

          {/* Amenities & Fasilitas Section (Compact, Sleek Flex-Wrap Badges) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Amenities &amp; Fasilitas</span>
              </h3>
              <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400">12 Fasilitas Lengkap</span>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 rounded-xl neu-card border border-white/80 dark:border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:border-amber-500/40 hover:text-amber-500 transition-all cursor-default"
                >
                  <i className={`${item.icon} text-amber-500 text-[10px] shrink-0`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map Section (Peta & Lingkungan Sekitar Langsung Terbuka) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Peta Lokasi &amp; Sekitar
              </h3>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Buka Google Maps</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
              </a>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-location-dot text-amber-500 text-xs shrink-0" />
              <span>{address}</span>
            </p>

            <div className="w-full h-56 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden neu-card border border-white/80 dark:border-white/10 shadow-md relative">
              <iframe
                title="Property Location Map"
                src={`https://maps.google.com/maps?q=${mapLat},${mapLng}&hl=id&z=16&output=embed`}
                className="w-full h-full border-0 filter dark:contrast-125 dark:brightness-90"
                loading="lazy"
              />
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenSurvey(activeRoom || building);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl neu-btn text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center active:neu-inset transition-all"
            >
              Jadwalkan Survei
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenBooking(activeRoom || building);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl neu-btn-amber font-black text-xs flex items-center justify-center transition-all"
            >
              Booking (DP 50%)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
