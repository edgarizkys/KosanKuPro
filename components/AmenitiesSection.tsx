'use client';

import { useProperty } from '@/lib/PropertyContext';

const DEFAULT_AMENITIES = [
  { icon: 'fa-solid fa-wifi', bg: 'bg-sky-500/10', color: 'text-sky-400', title: 'WiFi 100Mbps', desc: 'Fiber optic dedicated per lantai' },
  { icon: 'fa-solid fa-snowflake', bg: 'bg-cyan-500/10', color: 'text-cyan-400', title: 'AC Inverter', desc: '1 PK hemat energi tiap kamar' },
  { icon: 'fa-solid fa-hot-tub-person', bg: 'bg-amber-500/10', color: 'text-amber-400', title: 'Water Heater', desc: 'Air panas 24 jam setiap unit' },
  { icon: 'fa-solid fa-fingerprint', bg: 'bg-purple-500/10', color: 'text-purple-400', title: 'Smart Lock', desc: 'Fingerprint & PIN access' },
  { icon: 'fa-solid fa-shirt', bg: 'bg-emerald-500/10', color: 'text-emerald-400', title: 'Free Laundry', desc: 'Free cuci kiloan per penghuni' },
  { icon: 'fa-solid fa-video', bg: 'bg-rose-500/10', color: 'text-rose-400', title: 'CCTV 24/7', desc: 'Keamanan penuh seluruh area' },
  { icon: 'fa-solid fa-square-parking', bg: 'bg-orange-500/10', color: 'text-orange-400', title: 'Parking Area', desc: 'Motor & mobil dengan kanopi' },
  { icon: 'fa-solid fa-couch', bg: 'bg-indigo-500/10', color: 'text-indigo-400', title: 'Common Area', desc: 'Dapur bersama & ruang santai' },
];

const RSHS_AMENITIES = [
  { icon: 'fa-solid fa-dumbbell', bg: 'bg-amber-500/10', color: 'text-amber-500', title: 'Mini Gym & Olahraga', desc: 'Fasilitas gym in-house & bonus trial Oxy Gym' },
  { icon: 'fa-solid fa-shirt', bg: 'bg-emerald-500/10', color: 'text-emerald-500', title: 'Free Laundry 5-10 Kg', desc: 'Laundry room lengkap setrika, mesin cuci & hanger' },
  { icon: 'fa-solid fa-utensils', bg: 'bg-indigo-500/10', color: 'text-indigo-500', title: 'Dapur & Kulkas Bersama', desc: 'Lengkap dengan alat masak, kompor gas & makan' },
  { icon: 'fa-solid fa-wifi', bg: 'bg-sky-500/10', color: 'text-sky-500', title: 'WiFi High Speed', desc: 'Internet stabil untuk browsing, tugas & streaming' },
  { icon: 'fa-solid fa-broom', bg: 'bg-teal-500/10', color: 'text-teal-500', title: 'Pembersihan 2x / Bln', desc: 'Jasa pembersihan kamar & ganti sprei berkala' },
  { icon: 'fa-solid fa-video', bg: 'bg-rose-500/10', color: 'text-rose-500', title: 'CCTV 24 Jam', desc: 'Monitoring keamanan non-stop di seluruh koridor' },
  { icon: 'fa-solid fa-motorcycle', bg: 'bg-orange-500/10', color: 'text-orange-500', title: 'Parkir Motor Luas', desc: 'Area parkir aman di dalam pekarangan kosan' },
  { icon: 'fa-solid fa-tree', bg: 'bg-emerald-500/10', color: 'text-emerald-600', title: 'Ruang Terbuka Bersama', desc: 'Area santai terbuka dengan sirkulasi udara sejuk' },
];

export default function AmenitiesSection() {
  const { property } = useProperty();
  const isRshs = property.slug === 'rshs';
  const activeAmenities = isRshs ? RSHS_AMENITIES : DEFAULT_AMENITIES;

  return (
    <section id="amenities-section" className="space-y-8 sm:space-y-12">
      <div className="text-center max-w-2xl mx-auto reveal px-2">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {isRshs ? 'Fasilitas Juragan Kost RSHS' : 'Fasilitas Premium'}
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
          {isRshs ? 'Fasilitas Lengkap & Nyaman' : 'Semua yang Kamu Butuhkan'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 sm:mt-3">
          {isRshs
            ? 'Dilengkapi Mini Gym, Laundry Room, Dapur Bersama & Pembersihan Berkala di Depan RS Hasan Sadikin'
            : 'Fasilitas kelas hotel bintang 5 dengan harga kos eksekutif'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {activeAmenities.map((a, idx) => (
          <div 
            key={a.title} 
            className={`reveal delay-${(idx % 4) + 1} neu-card-sm rounded-2xl p-4 sm:p-6 text-center space-y-2 sm:space-y-3 group cursor-default transition-all duration-300 hover:scale-[1.03]`}
          >
            <div className={`amenity-icon w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl sm:rounded-2xl neu-inset ${a.color} flex items-center justify-center text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-300`}>
              <i className={a.icon} />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#047857] dark:group-hover:text-emerald-400 transition-colors">{a.title}</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
