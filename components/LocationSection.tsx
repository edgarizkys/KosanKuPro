'use client';

import { useState, useEffect } from 'react';
import { useProperty } from '@/lib/PropertyContext';

export default function LocationSection() {
  const { property } = useProperty();
  const [propertyInfo, setPropertyInfo] = useState({
    name: property.name || 'KosanKu Pro — Dago Bandung',
    address: property.address || 'Jl. Ir. H. Juanda No. 128, Dago, Coblong, Bandung',
    city: property.city || 'Bandung',
    phone: property.whatsapp ? `+62 ${property.whatsapp.replace(/^0/, '')}` : '+62 812-3456-7890',
    email: 'hello@kosanku.pro',
    description: property.tagline || 'Hunian nyaman, strategis & siap huni.',
    mapsUrl: property.mapsUrl || 'https://maps.google.com/?q=-6.8903333,107.6083818',
  });

  useEffect(() => {
    setPropertyInfo({
      name: property.name,
      address: property.address,
      city: property.city,
      phone: property.whatsapp ? (property.whatsapp.startsWith('+') ? property.whatsapp : `+62 ${property.whatsapp.replace(/^0/, '')}`) : '+62 812-3456-7890',
      email: property.slug === 'rshs' ? 'juragankostrshs@gmail.com' : 'hello@kosanku.pro',
      description: property.tagline,
      mapsUrl: property.mapsUrl || 'https://maps.google.com/?q=-6.897368,107.598642',
    });
  }, [property]);

  return (
    <section id="location-section" className="reveal-scale">
      <div className="neu-card rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-14 space-y-8 sm:space-y-10 transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          <div className="space-y-6 max-w-md reveal-left">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#047857] dark:text-emerald-400">Lokasi Strategis</span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{propertyInfo.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {propertyInfo.address}. {propertyInfo.description}
            </p>
            <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <a
                href={`https://wa.me/${(property.whatsapp || '6281223798307').replace(/[^0-9]/g, '')}?text=Halo%20Admin%20${encodeURIComponent(property.name)},%20saya%20tertarik%20tanya%20sewa%20kamar`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3 neu-card-sm rounded-xl transition-all hover:scale-[1.02] cursor-pointer text-[#047857] dark:text-emerald-400 font-bold"
              >
                <div className="w-9 h-9 rounded-xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shadow-xs"><i className="fa-brands fa-whatsapp" /></div>
                <span>WhatsApp: {propertyInfo.phone}</span>
              </a>
              <div className="flex items-center gap-3.5 p-3 neu-card-sm rounded-xl transition-all">
                <div className="w-9 h-9 rounded-xl neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-sm shadow-xs"><i className="fa-solid fa-envelope" /></div>
                {propertyInfo.email}
              </div>
              <div className="flex items-center gap-3.5 p-3 neu-card-sm rounded-xl transition-all">
                <div className="w-9 h-9 rounded-xl neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-sm shadow-xs"><i className="fa-solid fa-clock" /></div>
                Layanan Resepsionis &amp; Operasional 24 Jam
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 h-64 sm:h-80 rounded-2xl overflow-hidden neu-inset p-2 reveal-right group">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757048744043!2d107.6083818!3d-6.8903333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e657929a7d37%3A0x6b44a7719602a8db!2sDago%2C%20Coblong%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="KosanKu Pro Location"
              className="rounded-xl group-hover:scale-102 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
        <div className="border-t border-slate-200/60 dark:border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-3">
            <p>&copy; 2026 {propertyInfo.name}. Powered by <span className="font-extrabold text-[#047857] dark:text-emerald-400">KosanKu Pro</span>.</p>
          </div>

          {/* Clean Subtle Footer Consultation Badge */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <a
              href="https://wa.me/6282114242634?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20tertarik%20menerapkan%20sistem%20digital%20KosanKu%20Pro%20untuk%20kosan%20saya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset text-emerald-700 dark:text-emerald-400 hover:scale-105 transition-all"
              title="Tertarik pasang sistem KosanKu Pro di properti Anda?"
            >
              <i className="fa-brands fa-whatsapp text-emerald-600" />
              <span>Pasang Sistem di Kosan Anda (WA: +6282114242634)</span>
            </a>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <a href="#" className="hover:text-[#047857] dark:hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#047857] dark:hover:text-emerald-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-[#047857] dark:hover:text-emerald-400 transition-colors">System Status</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
