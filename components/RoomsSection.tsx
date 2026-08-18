'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import BookingModal, { RoomForBooking } from './BookingModal';
import SurveyScheduleModal from './SurveyScheduleModal';
import PropertyDetailModal from './PropertyDetailModal';
import InteractivePropertyMap from './InteractivePropertyMap';
import { useProperty } from '@/lib/PropertyContext';
import {
  ALL_MULTI_PROPERTY_ROOMS,
  PROPERTIES_METADATA,
  MultiPropertyRoomItem,
} from '@/lib/multiPropertyRoomsData';

export interface RoomItem extends MultiPropertyRoomItem {}

function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price);
}

// Property Buildings Data for "Tampilkan: Gedung" View
const PROPERTY_BUILDINGS = [
  {
    slug: 'rshs',
    name: 'Juragan Kost RSHS',
    area: 'Sukajadi, Bandung',
    transit: '🚶 3 menit jalan kaki ke RS Hasan Sadikin & RSHS Campus',
    unitCount: 8,
    badge: 'KOSANKU SIGNATURE',
    priceStart: 1000000,
    dailyPriceStart: 125000,
    rating: 4.9,
    reviewCount: 128,
    mapLat: -6.897368,
    mapLng: 107.598642,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    slug: 'dago-heritage',
    name: 'KosanKu Dago Heritage Co-Living',
    area: 'Dago Atas, Bandung',
    transit: '🎓 5 menit ke Kampus ITB Ganesha & UNPAD Dipatiukur',
    unitCount: 2,
    badge: 'KOSANKU PREMIER',
    priceStart: 2200000,
    dailyPriceStart: 220000,
    rating: 4.9,
    reviewCount: 64,
    mapLat: -6.883333,
    mapLng: 107.615,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    slug: 'bsd-foresta',
    name: 'KosanKu BSD Foresta Smart Suites',
    area: 'BSD City, Tangerang Selatan',
    transit: '🚆 6 menit ke Stasiun Rawa Buntu & ICE BSD',
    unitCount: 2,
    badge: 'KOSANKU EXECUTIVE',
    priceStart: 2400000,
    dailyPriceStart: 240000,
    rating: 4.95,
    reviewCount: 48,
    mapLat: -6.302324,
    mapLng: 106.65271,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    slug: 'dipatiukur-student',
    name: 'KosanKu Dipatiukur Student Living',
    area: 'Lebakgede, Coblong, Bandung',
    transit: '🎓 2 menit jalan kaki ke Gerbang Utama UNPAD Dipatiukur',
    unitCount: 1,
    badge: 'STUDENT LIVING',
    priceStart: 1650000,
    dailyPriceStart: 160000,
    rating: 4.85,
    reviewCount: 36,
    mapLat: -6.89312,
    mapLng: 107.61635,
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

export default function RoomsSection({
  onSelectRoom,
  onLogin,
  onOpenBookingPage,
}: {
  onSelectRoom?: (room: RoomItem) => void;
  onLogin?: () => void;
  onOpenBookingPage?: (room: any) => void;
}) {
  const { property } = useProperty();

  // View Mode: "GEDUNG" vs "TIPE_KAMAR"
  const [viewMode, setViewMode] = useState<'GEDUNG' | 'TIPE_KAMAR'>('GEDUNG');

  // Filters State
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [rentalMode, setRentalMode] = useState<'ALL' | 'MONTHLY' | 'DAILY'>('ALL');
  const [budgetFilter, setBudgetFilter] = useState<'ALL' | 'UNDER_15' | '15_TO_25' | 'ABOVE_25'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedBuildingIndex, setFocusedBuildingIndex] = useState(0);

  // Pagination for room units (4 cards per page)
  const [roomCurrentPage, setRoomCurrentPage] = useState(1);
  const ROOMS_PER_PAGE = 4;

  // Mobile View Switcher: 'LISTING' vs 'MAP'
  const [mobileTab, setMobileTab] = useState<'LISTING' | 'MAP'>('LISTING');

  const handleSetMobileTab = (tab: 'LISTING' | 'MAP') => {
    setMobileTab(tab);
    if (tab === 'MAP') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
      setTimeout(() => window.dispatchEvent(new Event('resize')), 500);
    }
  };

  // Custom Neumorphic Dropdown States & Refs
  const [isKetersediaanOpen, setIsKetersediaanOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const ketersediaanRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  // Carousel photo indices for building cards
  const [buildingPhotoIndices, setBuildingPhotoIndices] = useState<Record<string, number>>({});

  // Modals State
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<RoomForBooking | null>(null);
  const [selectedRoomForSurvey, setSelectedRoomForSurvey] = useState<MultiPropertyRoomItem | null>(null);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<MultiPropertyRoomItem | null>(null);
  const [selectedBuildingForDetail, setSelectedBuildingForDetail] = useState<any | null>(null);
  const [detailModalRoom, setDetailModalRoom] = useState<MultiPropertyRoomItem | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isVideoActive, setIsVideoActive] = useState(false);

  // Dynamic Rooms fetched from Database API
  const [roomsList, setRoomsList] = useState<MultiPropertyRoomItem[]>(ALL_MULTI_PROPERTY_ROOMS);

  // Dynamic Room Statuses overrides
  const [roomStatuses, setRoomStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    // 1. Fetch dynamic rooms from DB API
    const fetchRoomsFromDB = async () => {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const json = await res.json();
          const list = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : null);
          if (list && list.length > 0) {
            setRoomsList(list);
          }
        }
      } catch (err) {
        console.error('Failed to fetch rooms from DB:', err);
      }
    };
    fetchRoomsFromDB();

    try {
      const saved = localStorage.getItem('kosanku_room_statuses');
      if (saved) {
        setRoomStatuses(JSON.parse(saved));
      }
    } catch {}

    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('kosanku_room_statuses');
        if (saved) setRoomStatuses(JSON.parse(saved));
      } catch {}
      fetchRoomsFromDB();
    };

    const handleHeroFilter = (e: any) => {
      if (e.detail) {
        if (e.detail.property !== undefined) setSelectedProperty(e.detail.property);
        if (e.detail.rentalType !== undefined) setRentalMode(e.detail.rentalType);
        if (e.detail.keyword !== undefined) setSearchQuery(e.detail.keyword);
      }
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('room_status_updated', handleUpdate);
    window.addEventListener('hero_filter_changed', handleHeroFilter);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('room_status_updated', handleUpdate);
      window.removeEventListener('hero_filter_changed', handleHeroFilter);
    };
  }, []);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ketersediaanRef.current && !ketersediaanRef.current.contains(e.target as Node)) {
        setIsKetersediaanOpen(false);
      }
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) {
        setIsBudgetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic for rooms
  const filteredRooms = roomsList.filter((room) => {
    if (selectedProperty !== 'all' && room.propertySlug !== selectedProperty) {
      return false;
    }
    if (rentalMode === 'DAILY' && !room.allowDailyBooking) return false;

    const currentStatus = roomStatuses[room.id] || room.status;
    if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;

    // Budget filter
    if (budgetFilter === 'UNDER_15' && room.price >= 1500000) return false;
    if (budgetFilter === '15_TO_25' && (room.price < 1500000 || room.price > 2500000)) return false;
    if (budgetFilter === 'ABOVE_25' && room.price <= 2500000) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = room.type.toLowerCase().includes(q);
      const matchNum = room.number.toLowerCase().includes(q);
      const matchProp = room.propertyName.toLowerCase().includes(q);
      const matchCity = room.propertyCity.toLowerCase().includes(q);
      const matchFac = room.facilities?.some((f) => f.toLowerCase().includes(q));
      if (!matchName && !matchNum && !matchProp && !matchCity && !matchFac) {
        return false;
      }
    }
    return true;
  });

  // Filter logic for buildings
  const filteredBuildings = PROPERTY_BUILDINGS.filter((b) => {
    if (selectedProperty !== 'all' && b.slug !== selectedProperty) return false;
    if (budgetFilter === 'UNDER_15' && b.priceStart >= 1500000) return false;
    if (budgetFilter === 'ABOVE_25' && b.priceStart <= 2500000) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.area.toLowerCase().includes(q) ||
        b.transit.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const nextBuildingPhoto = (slug: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBuildingPhotoIndices((prev) => ({
      ...prev,
      [slug]: ((prev[slug] || 0) + 1) % max,
    }));
  };

  const prevBuildingPhoto = (slug: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBuildingPhotoIndices((prev) => ({
      ...prev,
      [slug]: ((prev[slug] || 0) - 1 + max) % max,
    }));
  };

  const activeBuilding = filteredBuildings[focusedBuildingIndex] || PROPERTY_BUILDINGS[0];

  return (
    <section id="rooms-showcase" className="relative w-full py-8 sm:py-12 px-2 sm:px-4 text-slate-900 dark:text-white transition-colors">
      
      <div className="relative w-full space-y-6 sm:space-y-8">
        
        {/* Section Heading (Punchy & High-Converting Copywriting) */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Hunian Mewah, Tinggal Masuk.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold max-w-xl mx-auto">
            Fasilitas lengkap bintang lima, akses Smart Lock, dan lokasi terbaik di pusat kota.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TOP NEUMORPHIC FILTER DOCK (Exact Cove.id Layout)
            ═══════════════════════════════════════════════════════════ */}
        <div className="neu-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-white/80 dark:border-white/10 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3 items-center">
            
            {/* 1. Custom Neumorphic Dropdown: Ketersediaan */}
            <div className="relative lg:col-span-4" ref={ketersediaanRef}>
              <div
                onClick={() => {
                  setIsKetersediaanOpen(!isKetersediaanOpen);
                  setIsBudgetOpen(false);
                }}
                className="neu-inset p-2.5 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer select-none hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs shrink-0">
                    <i className="fa-solid fa-calendar-check" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">KETERSEDIAAN KAMAR</div>
                    <div className="font-black text-xs text-slate-900 dark:text-white truncate mt-0.5">
                      {statusFilter === 'ALL'
                        ? 'Semua Status (Siap Huni)'
                        : statusFilter === 'AVAILABLE'
                        ? 'Hanya Kamar Ready'
                        : 'Termasuk Kamar Terisi'}
                    </div>
                  </div>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-slate-400 text-[10px] transition-transform duration-300 pr-1 ${
                    isKetersediaanOpen ? 'rotate-180 text-amber-500' : ''
                  }`}
                />
              </div>

              {/* Neumorphic Dropdown Menu */}
              {isKetersediaanOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 p-1.5 neu-card rounded-2xl border border-white/90 dark:border-white/15 shadow-2xl animate-scale-in space-y-1">
                  {[
                    { value: 'ALL', label: 'Semua Status (Siap Huni)', icon: 'fa-solid fa-layer-group' },
                    { value: 'AVAILABLE', label: 'Hanya Kamar Ready (Tersedia)', icon: 'fa-solid fa-circle-check text-emerald-500' },
                    { value: 'OCCUPIED', label: 'Termasuk Kamar Terisi', icon: 'fa-solid fa-door-closed text-slate-400' },
                  ].map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value as any);
                          setIsKetersediaanOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'neu-inset text-amber-600 dark:text-amber-400 font-black'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <i className={`${opt.icon} text-[11px]`} />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <i className="fa-solid fa-check text-amber-500 text-xs" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Custom Neumorphic Dropdown: Budget per Bulan */}
            <div className="relative lg:col-span-4" ref={budgetRef}>
              <div
                onClick={() => {
                  setIsBudgetOpen(!isBudgetOpen);
                  setIsKetersediaanOpen(false);
                }}
                className="neu-inset p-2.5 rounded-2xl flex items-center justify-between gap-2.5 cursor-pointer select-none hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs shrink-0">
                    <i className="fa-solid fa-wallet" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">RENTANG BUDGET SEWA</div>
                    <div className="font-black text-xs text-slate-900 dark:text-white truncate mt-0.5">
                      {budgetFilter === 'ALL'
                        ? 'Semua Rentang Budget'
                        : budgetFilter === 'UNDER_15'
                        ? '< Rp 1.500.000 / bln'
                        : budgetFilter === '15_TO_25'
                        ? 'Rp 1.5jt - Rp 2.5jt / bln'
                        : '> Rp 2.500.000 / bln'}
                    </div>
                  </div>
                </div>
                <i
                  className={`fa-solid fa-chevron-down text-slate-400 text-[10px] transition-transform duration-300 pr-1 ${
                    isBudgetOpen ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </div>

              {/* Neumorphic Dropdown Menu */}
              {isBudgetOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 p-1.5 neu-card rounded-2xl border border-white/90 dark:border-white/15 shadow-2xl animate-scale-in space-y-1">
                  {[
                    { value: 'ALL', label: 'Semua Rentang Budget', sub: 'Tampilkan semua harga kamar' },
                    { value: 'UNDER_15', label: 'Di bawah Rp 1.500.000 / bln', sub: 'Kamar hemat & reguler' },
                    { value: '15_TO_25', label: 'Rp 1.500.000 - Rp 2.500.000 / bln', sub: 'Kamar nyaman & eksekutif' },
                    { value: 'ABOVE_25', label: 'Di atas Rp 2.500.000 / bln', sub: 'Paviliun & Smart Loft Suites' },
                  ].map((opt) => {
                    const isSelected = budgetFilter === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => {
                          setBudgetFilter(opt.value as any);
                          setIsBudgetOpen(false);
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'neu-inset text-emerald-600 dark:text-emerald-400 font-black'
                            : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div>{opt.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">{opt.sub}</div>
                        </div>
                        {isSelected && <i className="fa-solid fa-check text-emerald-500 text-xs ml-2 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Search Keyword */}
            <div className="lg:col-span-3 neu-inset p-2.5 rounded-2xl flex items-center gap-2">
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs shrink-0" />
              <input
                type="text"
                placeholder="Cari Dago, AC, WiFi, RSHS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              )}
            </div>

            {/* 4. Reset Button */}
            <div className="lg:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedProperty('all');
                  setRentalMode('ALL');
                  setBudgetFilter('ALL');
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="w-full py-2.5 px-3 neu-btn rounded-2xl text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                title="Reset Filter"
              >
                <i className="fa-solid fa-sliders text-[11px]" />
                <span className="lg:hidden">Reset</span>
              </button>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SUB-BAR: VIEW MODE TOGGLE (Gedung vs Tipe Kamar) + COUNT
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* TAMPILKAN MODE: [Gedung Properti] [Tipe Kamar & Unit] */}
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TAMPILKAN:</span>
            <div className="p-1 neu-inset rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setViewMode('GEDUNG')}
                className={`px-3.5 py-1.5 rounded-xl transition-all font-black text-xs flex items-center gap-1.5 ${
                  viewMode === 'GEDUNG'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <i className="fa-solid fa-building text-[10px]" />
                <span>Gedung Properti</span>
              </button>
              <button
                onClick={() => setViewMode('TIPE_KAMAR')}
                className={`px-3.5 py-1.5 rounded-xl transition-all font-black text-xs flex items-center gap-1.5 ${
                  viewMode === 'TIPE_KAMAR'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <i className="fa-solid fa-door-open text-[10px]" />
                <span>Tipe Kamar &amp; Unit</span>
              </button>
            </div>
          </div>

          {/* Counter & Sorting info & Mobile Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>
                {viewMode === 'GEDUNG'
                  ? `${filteredBuildings.length} Cabang Properti Ditemukan`
                  : `${filteredRooms.length} Kamar Siap Sewa`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                <span className="text-slate-400 font-semibold">Urutkan:</span>
                <strong className="text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[11px]">Rekomendasi</strong>
              </span>
            </div>

            {/* Mobile-Only Tabs Toggle: [Daftar] [Peta] */}
            <div className="lg:hidden neu-card rounded-2xl p-1 flex items-center gap-1 border border-white/80 dark:border-white/10 shadow-sm">
              <button
                type="button"
                onClick={() => handleSetMobileTab('LISTING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  mobileTab === 'LISTING'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <i className="fa-solid fa-list-ul text-[10px]" />
                <span>Daftar</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetMobileTab('MAP')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  mobileTab === 'MAP'
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <i className="fa-solid fa-map-location-dot text-[10px]" />
                <span>Peta</span>
              </button>
            </div>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN SPLIT-SCREEN LAYOUT (Left: Listing Cards | Right: Map)
            ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8 w-full">
          
          {/* ════ LEFT COLUMN: LISTING CARDS (2 Columns, 50% Ratio) ════ */}
          <div className={`w-full lg:w-1/2 flex flex-col justify-between shrink-0 ${mobileTab === 'LISTING' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* VIEW 1: GEDUNG / PROPERTY CARDS (4 Main Properties) */}
            {viewMode === 'GEDUNG' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {filteredBuildings.map((building, idx) => {
                  const photoIdx = buildingPhotoIndices[building.slug] || 0;
                  const currentImage = building.images[photoIdx] || building.images[0];

                  return (
                    <div
                      key={building.slug}
                      onMouseEnter={() => setFocusedBuildingIndex(idx)}
                      onClick={() => {
                        setFocusedBuildingIndex(idx);
                        setSelectedBuildingForDetail(building);
                      }}
                      className={`group relative rounded-3xl neu-card border transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                        focusedBuildingIndex === idx
                          ? 'border-amber-500 shadow-xl shadow-amber-500/10'
                          : 'border-white/80 dark:border-white/10 hover:border-amber-500/40'
                      }`}
                    >
                      {/* Photo Section with Slider Arrows */}
                      <div className="relative w-full h-52 sm:h-56 bg-slate-200 dark:bg-white/5 overflow-hidden">
                        <img
                          src={currentImage}
                          alt={building.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Slider Arrows ‹ › */}
                        {building.images.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                            <button
                              type="button"
                              onClick={(e) => prevBuildingPhoto(building.slug, building.images.length, e)}
                              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white text-xs flex items-center justify-center pointer-events-auto backdrop-blur-sm transition-all shadow-md"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              onClick={(e) => nextBuildingPhoto(building.slug, building.images.length, e)}
                              className="w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white text-xs flex items-center justify-center pointer-events-auto backdrop-blur-sm transition-all shadow-md"
                            >
                              ›
                            </button>
                          </div>
                        )}

                        {/* Available Units Badge */}
                        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-cyan-600/90 text-white font-black text-[10px] tracking-wider uppercase backdrop-blur-md shadow-md">
                          {building.unitCount} unit tersedia
                        </div>

                        {/* Badge Luxe Overlay */}
                        <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider border border-white/15">
                          {building.badge}
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                            {building.name}
                          </h3>
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <i className="fa-solid fa-location-dot text-amber-500 text-[10px]" />
                            <span>{building.area}</span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 pt-1 leading-snug">
                            {building.transit}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Mulai Dari</div>
                            <div className="text-base font-black text-slate-900 dark:text-white">
                              {formatPrice(building.priceStart)}
                              <span className="text-[10px] text-slate-400 font-medium ml-1">/bln</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBuildingForDetail(building);
                            }}
                            className="px-4 py-2.5 neu-btn-amber rounded-2xl font-black text-xs"
                          >
                            Pilih Tipe Kamar
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: TIPE KAMAR / INDIVIDUAL ROOMS (PAGINATED 4 CARDS PER PAGE) */}
            {viewMode === 'TIPE_KAMAR' && (
              <div className="flex-1 flex flex-col justify-between min-h-[600px] lg:min-h-[820px] w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {filteredRooms
                    .slice((roomCurrentPage - 1) * ROOMS_PER_PAGE, roomCurrentPage * ROOMS_PER_PAGE)
                    .map((room) => {
                      const currentStatus = roomStatuses[room.id] || room.status;
                      const isAvailable = currentStatus === 'AVAILABLE';

                      return (
                        <div
                          key={room.id}
                          className="group relative rounded-3xl neu-card border border-white/80 dark:border-white/10 hover:border-amber-500/50 shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                        >
                          {/* Photo Section (Clickable to open Detail Modal) */}
                          <div
                            onClick={() => setSelectedRoomForDetail(room)}
                            className="relative w-full h-48 bg-slate-200 dark:bg-white/5 overflow-hidden cursor-pointer"
                          >
                            <img
                              src={room.imageUrl || '/images/kosanku_logo.svg'}
                              alt={room.type}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-cyan-600/90 text-white font-black text-[9px] uppercase tracking-wider backdrop-blur-md">
                              {isAvailable ? '● Siap Huni' : '● Terisi'}
                            </div>
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-xl bg-black/70 backdrop-blur-md text-white text-[10px] font-bold truncate max-w-[80%] border border-white/15">
                                📍 {room.propertyName}
                              </span>
                            </div>
                          </div>

                          {/* Card Content Body */}
                          <div
                            onClick={() => setSelectedRoomForDetail(room)}
                            className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5 cursor-pointer"
                          >
                            <div className="space-y-1">
                              <div className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Kamar {room.number} • Lt {room.floor}
                              </div>
                              <h3
                                className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate"
                              >
                                {room.type}
                              </h3>
                            </div>

                            {/* Specs Chips */}
                            <div className="grid grid-cols-2 gap-1 py-1.5 border-y border-slate-100 dark:border-white/5 text-[10px] text-slate-600 dark:text-slate-300">
                              <div>📐 {room.size || '3.5 x 4 m'}</div>
                              <div>🛏️ {room.bedType || 'Kasur Comfort'}</div>
                              <div>🚿 KM Dalam</div>
                              <div>🧺 Free Laundry</div>
                            </div>

                            {/* Price & Action Buttons */}
                            <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-black text-slate-900 dark:text-white">
                                  {formatPrice(room.price)}
                                  <span className="text-[10px] text-slate-400 font-medium ml-1">/bln</span>
                                </span>
                                {room.dailyPrice && room.allowDailyBooking && (
                                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    {formatPrice(room.dailyPrice)}/hari
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedRoomForSurvey(room)}
                                  className="py-2.5 px-3 neu-btn rounded-2xl text-slate-800 dark:text-slate-200 text-xs font-black flex items-center justify-center hover:text-amber-500 active:neu-inset transition-all"
                                >
                                  Survei
                                </button>
                                <button
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => {
                                    const bookingPayload = {
                                      id: room.id,
                                      number: room.number,
                                      type: room.type,
                                      price: room.price,
                                      floor: room.floor,
                                      imageUrl: room.imageUrl,
                                    };
                                    if (onSelectRoom) onSelectRoom(room);
                                    if (onOpenBookingPage) {
                                      onOpenBookingPage(bookingPayload);
                                    } else {
                                      setSelectedRoomForBooking(bookingPayload);
                                    }
                                  }}
                                  className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center transition-all ${
                                    isAvailable
                                      ? 'neu-btn-amber'
                                      : 'neu-inset text-slate-400 opacity-40 cursor-not-allowed'
                                  }`}
                                >
                                  {isAvailable ? 'Booking' : 'Penuh'}
                                </button>
                              </div>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                </div>

                {/* Neumorphic Pagination: 1 2 [🏠 Icon Home Bundar di Tengah] 3 4 (Anchored at Bottom) */}
                {Math.ceil(filteredRooms.length / ROOMS_PER_PAGE) > 1 && (
                  <div className="mt-auto pt-6 flex items-center justify-center gap-3 select-none">
                    {/* Prev Button */}
                    <button
                      type="button"
                      onClick={() => setRoomCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={roomCurrentPage === 1}
                      className="px-4 py-2.5 neu-btn rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <i className="fa-solid fa-chevron-left text-[10px]" />
                      <span>Prev</span>
                    </button>

                    {/* Center Numbered Capsule with Circular Home Icon in the Middle (No Button Backgrounds) */}
                    <div className="neu-card rounded-2xl px-3 py-1.5 flex items-center gap-3 border border-white/80 dark:border-white/10 shadow-md">
                      {/* Page 1 */}
                      <button
                        type="button"
                        onClick={() => setRoomCurrentPage(1)}
                        className={`w-7 h-7 flex items-center justify-center transition-colors bg-transparent text-sm font-black ${
                          roomCurrentPage === 1
                            ? 'text-amber-500 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        1
                      </button>

                      {/* Page 2 */}
                      {Math.ceil(filteredRooms.length / ROOMS_PER_PAGE) >= 2 && (
                        <button
                          type="button"
                          onClick={() => setRoomCurrentPage(2)}
                          className={`w-7 h-7 flex items-center justify-center transition-colors bg-transparent text-sm font-black ${
                            roomCurrentPage === 2
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          2
                        </button>
                      )}

                      {/* 🏠 Center Circular Neumorphic Home Icon */}
                      <div
                        className="w-8 h-8 rounded-full neu-inset flex items-center justify-center text-amber-500 shadow-inner"
                        title="KosanKu Pro"
                      >
                        <i className="fa-solid fa-house text-xs" />
                      </div>

                      {/* Page 3 */}
                      {Math.ceil(filteredRooms.length / ROOMS_PER_PAGE) >= 3 && (
                        <button
                          type="button"
                          onClick={() => setRoomCurrentPage(3)}
                          className={`w-7 h-7 flex items-center justify-center transition-colors bg-transparent text-sm font-black ${
                            roomCurrentPage === 3
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          3
                        </button>
                      )}

                      {/* Page 4 */}
                      {Math.ceil(filteredRooms.length / ROOMS_PER_PAGE) >= 4 && (
                        <button
                          type="button"
                          onClick={() => setRoomCurrentPage(4)}
                          className={`w-7 h-7 flex items-center justify-center transition-colors bg-transparent text-sm font-black ${
                            roomCurrentPage === 4
                              ? 'text-amber-500 dark:text-amber-400'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          4
                        </button>
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setRoomCurrentPage((p) =>
                          Math.min(p + 1, Math.ceil(filteredRooms.length / ROOMS_PER_PAGE))
                        )
                      }
                      disabled={
                        roomCurrentPage === Math.ceil(filteredRooms.length / ROOMS_PER_PAGE)
                      }
                      className="px-4 py-2.5 neu-btn rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Next</span>
                      <i className="fa-solid fa-chevron-right text-[10px]" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ════ RIGHT COLUMN: STICKY REAL ESTATE MAP (Exact 50% Ratio & Flush Height) ════ */}
          <div className={`w-full lg:w-1/2 sticky top-24 shrink-0 flex flex-col ${mobileTab === 'MAP' ? 'flex' : 'hidden lg:flex'}`}>
            <InteractivePropertyMap
              activeSlug={activeBuilding.slug}
              onSelectProperty={(slug) => {
                setSelectedProperty(slug);
                const idx = PROPERTY_BUILDINGS.findIndex((b) => b.slug === slug);
                if (idx !== -1) setFocusedBuildingIndex(idx);
              }}
              onOpenDetail={(item) => {
                const matchedRoom = ALL_MULTI_PROPERTY_ROOMS.find((r) => r.propertySlug === item.slug);
                const matchedBuilding = PROPERTY_BUILDINGS.find((b) => b.slug === item.slug);
                if (matchedRoom) {
                  setSelectedRoomForDetail(matchedRoom);
                } else if (matchedBuilding) {
                  setSelectedBuildingForDetail(matchedBuilding);
                }
              }}
            />
          </div>

        </div>

        {/* ════ Mobile Floating Bottom View Switcher (Airbnb / Cove style) ════ */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => handleSetMobileTab(mobileTab === 'LISTING' ? 'MAP' : 'LISTING')}
            className="px-5 py-3 rounded-full bg-slate-950/95 hover:bg-slate-900 text-white font-black text-xs shadow-2xl backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <i className={`fa-solid ${mobileTab === 'LISTING' ? 'fa-map-location-dot' : 'fa-list-ul'} text-amber-400 text-sm`} />
            <span>{mobileTab === 'LISTING' ? 'Tampilkan Peta' : 'Tampilkan Daftar'}</span>
          </button>
        </div>

      </div>

      {/* Full-Page Luxury Property & Room Detail Modal (Exact Screenshot Layout) */}
      {(selectedRoomForDetail || selectedBuildingForDetail) && (
        <PropertyDetailModal
          isOpen={true}
          room={selectedRoomForDetail}
          building={selectedBuildingForDetail}
          onClose={() => {
            setSelectedRoomForDetail(null);
            setSelectedBuildingForDetail(null);
          }}
          onOpenBooking={(item) => {
            const bookingPayload = {
              id: item.id || item.slug,
              number: item.number || '01',
              type: item.type || item.name,
              price: item.price || item.priceStart,
              floor: item.floor || 1,
              imageUrl: item.imageUrl || (item.images ? item.images[0] : null),
            };
            if (onOpenBookingPage) {
              onOpenBookingPage(bookingPayload);
            } else {
              setSelectedRoomForBooking(bookingPayload);
            }
          }}
          onOpenSurvey={(item) => {
            setSelectedRoomForSurvey(item);
          }}
        />
      )}

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          room={selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
          onBookingSuccess={(roomId: string) => {
            setRoomStatuses((prev) => ({ ...prev, [roomId]: 'BOOKED' }));
            setSelectedRoomForBooking(null);
          }}
        />
      )}

      {/* Survey Schedule Modal */}
      {selectedRoomForSurvey && (
        <SurveyScheduleModal
          room={selectedRoomForSurvey}
          onClose={() => setSelectedRoomForSurvey(null)}
        />
      )}

    </section>
  );
}
