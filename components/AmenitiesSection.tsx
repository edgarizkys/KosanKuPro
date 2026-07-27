'use client';

const AMENITIES = [
  { icon: 'fa-solid fa-wifi', bg: 'bg-sky-500/10', color: 'text-sky-400', title: 'WiFi 100Mbps', desc: 'Fiber optic dedicated per lantai' },
  { icon: 'fa-solid fa-snowflake', bg: 'bg-cyan-500/10', color: 'text-cyan-400', title: 'AC Inverter', desc: '1 PK hemat energi tiap kamar' },
  { icon: 'fa-solid fa-hot-tub-person', bg: 'bg-amber-500/10', color: 'text-amber-400', title: 'Water Heater', desc: 'Air panas 24 jam setiap unit' },
  { icon: 'fa-solid fa-fingerprint', bg: 'bg-purple-500/10', color: 'text-purple-400', title: 'Smart Lock', desc: 'Fingerprint & PIN access' },
  { icon: 'fa-solid fa-shirt', bg: 'bg-emerald-500/10', color: 'text-emerald-400', title: 'Laundry', desc: 'Free 2x seminggu per penghuni' },
  { icon: 'fa-solid fa-video', bg: 'bg-rose-500/10', color: 'text-rose-400', title: 'CCTV 24/7', desc: 'Keamanan penuh seluruh area' },
  { icon: 'fa-solid fa-square-parking', bg: 'bg-orange-500/10', color: 'text-orange-400', title: 'Parking Area', desc: 'Motor & mobil dengan kanopi' },
  { icon: 'fa-solid fa-couch', bg: 'bg-indigo-500/10', color: 'text-indigo-400', title: 'Common Area', desc: 'Co-working space & rooftop' },
];

export default function AmenitiesSection() {
  return (
    <section id="amenities-section" className="space-y-8 sm:space-y-12">
      <div className="text-center max-w-2xl mx-auto reveal px-2">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-orchid-gold">Fasilitas Premium</span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-2">Semua yang Kamu Butuhkan</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-3">Fasilitas kelas hotel bintang 5 dengan harga kos eksekutif</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
        {AMENITIES.map((a) => (
          <div key={a.title} className="glass-card rounded-2xl p-4 sm:p-6 text-center space-y-2 sm:space-y-3 card-premium spotlight-card group cursor-default">
            <div className={`amenity-icon w-11 h-11 sm:w-14 sm:h-14 mx-auto rounded-xl sm:rounded-2xl ${a.bg} ${a.color} flex items-center justify-center text-base sm:text-xl`}>
              <i className={a.icon} />
            </div>
            <h4 className="text-xs font-bold text-white">{a.title}</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
