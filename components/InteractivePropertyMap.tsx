'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPropertyPin {
  id: string;
  slug: string;
  name: string;
  priceFormatted: string;
  price: number;
  area: string;
  address: string;
  beds: string;
  baths: string;
  size: string;
  status: string;
  imageUrl: string;
  lat: number;
  lng: number;
}

const PROPERTY_PINS: MapPropertyPin[] = [
  {
    id: 'pin-rshs',
    slug: 'rshs',
    name: 'Juragan Kost RSHS',
    priceFormatted: 'Rp 1.500.000',
    price: 1500000,
    area: 'Sukajadi, Bandung',
    address: 'Jl. Pasir Kaliki GG h tabri No.76, Sukajadi',
    beds: '1 bed',
    baths: '1 bath',
    size: '16 m²',
    status: 'Siap Huni',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    lat: -6.897368,
    lng: 107.598642,
  },
  {
    id: 'pin-dago',
    slug: 'dago-heritage',
    name: 'KosanKu Dago Heritage Co-Living',
    priceFormatted: 'Rp 2.200.000',
    price: 2200000,
    area: 'Dago Atas, Bandung',
    address: 'Jl. Ir. H. Juanda No. 88, Dago Atas',
    beds: '1 bed',
    baths: '1 bath',
    size: '20 m²',
    status: 'Siap Huni',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    lat: -6.883333,
    lng: 107.615,
  },
  {
    id: 'pin-bsd',
    slug: 'bsd-foresta',
    name: 'KosanKu BSD Foresta Smart Suites',
    priceFormatted: 'Rp 2.400.000',
    price: 2400000,
    area: 'BSD City, Tangerang',
    address: 'Foresta Business District Blok B No. 12, BSD',
    beds: '1 bed',
    baths: '1 bath',
    size: '22 m²',
    status: 'Siap Huni',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    lat: -6.302324,
    lng: 106.65271,
  },
  {
    id: 'pin-dipatiukur',
    slug: 'dipatiukur-student',
    name: 'KosanKu Dipatiukur Student Living',
    priceFormatted: 'Rp 1.650.000',
    price: 1650000,
    area: 'Dipatiukur, Bandung',
    address: 'Jl. Dipatiukur No. 45 (Depan UNPAD)',
    beds: '1 bed',
    baths: '1 bath',
    size: '14 m²',
    status: 'Siap Huni',
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    lat: -6.89312,
    lng: 107.61635,
  },
];

interface InteractivePropertyMapProps {
  activeSlug?: string;
  onSelectProperty?: (slug: string) => void;
  onOpenDetail?: (item: any) => void;
}

export default function InteractivePropertyMap({
  activeSlug = 'rshs',
  onSelectProperty,
  onOpenDetail,
}: InteractivePropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const [selectedPinId, setSelectedPinId] = useState<string>(
    PROPERTY_PINS.find((p) => p.slug === activeSlug)?.id || PROPERTY_PINS[0].id
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likedPins, setLikedPins] = useState<Record<string, boolean>>({});
  const [mapLayer, setMapLayer] = useState<'VOYAGER' | 'DARK'>('VOYAGER');

  const activePin = PROPERTY_PINS.find((p) => p.id === selectedPinId) || PROPERTY_PINS[0];

  // Initialize Leaflet Map with Real-World CartoDB / OpenStreetMap Tiles
  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = async () => {
      // Inject Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Dynamically load Leaflet JS
      if (!(window as any).L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      if (!isMounted || !mapContainerRef.current || leafletMapRef.current) return;

      const L = (window as any).L;
      if (!L) return;

      // Initialize map centered at Bandung
      const map = L.map(mapContainerRef.current, {
        center: [activePin.lat, activePin.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });
      leafletMapRef.current = map;

      // Real World CartoDB Positron / Voyager Tiles (Clean luxury map style)
      const tileUrl =
        mapLayer === 'DARK'
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Create Custom Real-Estate HTML Price Pill Markers
      PROPERTY_PINS.forEach((pin) => {
        const isSelected = pin.id === selectedPinId;
        const customIcon = L.divIcon({
          className: 'custom-price-pin',
          html: `
            <div class="cursor-pointer group select-none" style="display: flex; flex-direction: column; align-items: center; width: max-content; min-width: 150px; white-space: nowrap;">
              <div style="display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; gap: 4px; padding: 6px 16px; border-radius: 9999px; font-weight: 900; font-size: 12px; letter-spacing: -0.025em; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); ${
                isSelected
                  ? 'background-color: #020617; color: #ffffff; transform: scale(1.1); box-shadow: 0 0 0 2px #f59e0b, 0 15px 30px -5px rgba(245,158,11,0.4);'
                  : 'background-color: rgba(15,23,42,0.95); color: #ffffff; backdrop-filter: blur(8px);'
              }">
                <span style="white-space: nowrap; font-family: inherit;">${pin.priceFormatted}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; margin-top: 4px;">
                <span style="position: relative; display: flex; height: 14px; width: 14px;">
                  <span style="animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; position: absolute; display: inline-flex; height: 100%; width: 100%; border-radius: 9999px; background-color: #fbbf24; opacity: 0.75;"></span>
                  <span style="position: relative; display: inline-flex; height: 14px; width: 14px; border-radius: 9999px; background-color: #e78b32; border: 2px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);"></span>
                </span>
              </div>
            </div>
          `,
          iconSize: [160, 50],
          iconAnchor: [80, 42],
        });

        const marker = L.marker([pin.lat, pin.lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedPinId(pin.id);
          if (onSelectProperty) onSelectProperty(pin.slug);
          map.panTo([pin.lat, pin.lng], { animate: true, duration: 0.6 });
        });

        markersRef.current[pin.id] = marker;
      });
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapLayer]);

  // Sync when activeSlug prop changes or when pin is selected
  useEffect(() => {
    if (activeSlug) {
      const found = PROPERTY_PINS.find((p) => p.slug === activeSlug);
      if (found) {
        setSelectedPinId(found.id);
        if (leafletMapRef.current) {
          leafletMapRef.current.panTo([found.lat, found.lng], { animate: true, duration: 0.5 });
        }
      }
    }
  }, [activeSlug]);

  // Auto-invalidate size on mount, slug change, and window resize
  useEffect(() => {
    const triggerInvalidate = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };

    triggerInvalidate();
    const t1 = setTimeout(triggerInvalidate, 100);
    const t2 = setTimeout(triggerInvalidate, 400);
    const t3 = setTimeout(triggerInvalidate, 1000);

    window.addEventListener('resize', triggerInvalidate);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', triggerInvalidate);
    };
  }, [activeSlug, mapLayer]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleZoomIn = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (leafletMapRef.current) leafletMapRef.current.zoomOut();
  };

  const handleCenter = () => {
    if (leafletMapRef.current && activePin) {
      leafletMapRef.current.setView([activePin.lat, activePin.lng], 15, { animate: true });
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden neu-card border border-white/80 dark:border-white/10 shadow-2xl select-none transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]'
          : 'h-[550px] sm:h-[650px] lg:h-[820px]'
      }`}
    >
      {/* ════ Real Interactive Leaflet Tile Map Container ════ */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[550px] z-0 bg-[#e5e3df] dark:bg-[#121019]" />

      {/* ═══════════════════════════════════════════════════════════
          FLOATING PROPERTY CARD POPUP (Mobile-Friendly Responsive)
          ═══════════════════════════════════════════════════════════ */}
      {activePin && (
        <div
          onClick={() => {
            if (onOpenDetail) onOpenDetail(activePin);
          }}
          className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-6 sm:right-auto z-30 max-w-[420px] w-auto neu-card rounded-3xl p-3 sm:p-4 border border-white/95 dark:border-white/15 shadow-2xl bg-white/95 dark:bg-[#151221]/95 backdrop-blur-xl animate-scale-in cursor-pointer hover:border-amber-500 hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex items-center gap-3 sm:gap-3.5">
            
            {/* Thumbnail Left */}
            <div className="w-20 sm:w-32 h-20 sm:h-28 rounded-2xl overflow-hidden neu-inset shrink-0 bg-slate-200 dark:bg-white/5 relative">
              <img
                src={activePin.imageUrl}
                alt={activePin.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Info Right */}
            <div className="flex-1 min-w-0 space-y-1.5">
              
              {/* Status Dot & Like Button Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>• {activePin.status}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleLike(activePin.id, e)}
                  className="w-7 h-7 rounded-full neu-btn flex items-center justify-center text-slate-500 hover:text-rose-500 text-xs transition-colors"
                >
                  <i className={`fa-${likedPins[activePin.id] ? 'solid' : 'regular'} fa-heart ${likedPins[activePin.id] ? 'text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Price */}
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {activePin.priceFormatted}
                <span className="text-xs font-medium text-slate-400 ml-1">/bln</span>
              </div>

              {/* Specs: 1 bed | 1 bath | 16 m² */}
              <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-bold">
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-bed text-xs text-slate-400" />
                  <span>{activePin.beds}</span>
                </span>
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-bath text-xs text-slate-400" />
                  <span>{activePin.baths}</span>
                </span>
                <span className="flex items-center gap-1">
                  <i className="fa-solid fa-ruler-combined text-xs text-slate-400" />
                  <span>{activePin.size}</span>
                </span>
              </div>

              {/* Address */}
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate pt-0.5 font-medium">
                {activePin.address}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FLOATING NEUMORPHIC MAP CONTROLS
          ═══════════════════════════════════════════════════════════ */}

      {/* Top Left: Expand / Fullscreen */}
      <div className="absolute top-4 left-4 z-30">
        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
          title={isFullscreen ? 'Kecilkan Peta' : 'Perlebar Peta Penuh'}
        >
          <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`} />
        </button>
      </div>

      {/* Top Right: Layer Switcher & Zoom Controls Column */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2.5">
        
        {/* Layer Switcher Button */}
        <button
          type="button"
          onClick={() => setMapLayer(mapLayer === 'VOYAGER' ? 'DARK' : 'VOYAGER')}
          className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="Ganti Mode Tampilan Peta (Light / Dark)"
        >
          <i className="fa-solid fa-layer-group" />
        </button>

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={handleCenter}
          className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="Pusatkan ke Properti Terpilih"
        >
          <i className="fa-solid fa-crosshairs" />
        </button>

        {/* Zoom In & Out Pill */}
        <div className="neu-card rounded-2xl p-1 flex flex-col items-center shadow-lg border border-white/80 dark:border-white/10">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center text-sm font-black transition-all"
            title="Zoom In"
          >
            +
          </button>
          <div className="w-5 h-[1px] bg-slate-200 dark:bg-white/10 my-0.5" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center text-sm font-black transition-all"
            title="Zoom Out"
          >
            -
          </button>
        </div>

      </div>

    </div>
  );
}
