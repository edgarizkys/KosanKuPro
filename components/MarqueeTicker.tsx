'use client';

const ITEMS = [
  { icon: 'fa-solid fa-bolt', color: 'text-orchid-gold', label: 'Midtrans Payment' },
  { icon: 'fa-brands fa-whatsapp', color: 'text-emerald-400', label: 'WhatsApp Reminder' },
  { icon: 'fa-solid fa-fingerprint', color: 'text-purple-400', label: 'Smart Lock 24/7' },
  { icon: 'fa-solid fa-wifi', color: 'text-sky-400', label: 'WiFi 100Mbps' },
  { icon: 'fa-solid fa-video', color: 'text-rose-400', label: 'CCTV Security' },
  { icon: 'fa-solid fa-snowflake', color: 'text-cyan-400', label: 'AC Inverter' },
  { icon: 'fa-solid fa-shirt', color: 'text-emerald-400', label: 'Free Laundry' },
  { icon: 'fa-solid fa-couch', color: 'text-amber-400', label: 'Co-Working Space' },
];

export default function MarqueeTicker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <section className="reveal -mt-12 relative z-20">
      <div className="marquee-container glass-panel rounded-2xl py-4 px-2 overflow-hidden">
        <div className="marquee-track items-center gap-8">
          {doubled.map((item, i) => (
            <span key={i} className="marquee-item">
              <i className={`${item.icon} ${item.color}`} /> {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
