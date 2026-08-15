'use client';

import { useState, useEffect } from 'react';

export default function LocationSection() {
  const [propertyInfo, setPropertyInfo] = useState({
    name: 'KosanKu Pro — Dago Bandung',
    address: 'Jl. Ir. H. Juanda No. 128, Dago, Coblong, Bandung',
    city: 'Bandung',
    phone: '+62 812-3456-7890',
    email: 'hello@kosanku.pro',
    description: 'Hanya 3 menit dari ITB, UNPAD Dipatiukur & pusat kuliner Dago.',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kosanku_master_property');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPropertyInfo((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          address: parsed.address || prev.address,
          city: parsed.city || prev.city,
          phone: parsed.phone || prev.phone,
          email: parsed.email || prev.email,
        }));
      }
    } catch {}
  }, []);

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
              <div className="flex items-center gap-3.5 p-3 neu-card-sm rounded-xl transition-all">
                <div className="w-9 h-9 rounded-xl neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-sm shadow-xs"><i className="fa-solid fa-phone" /></div>
                {propertyInfo.phone}
              </div>
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
        <div className="border-t border-slate-200/60 dark:border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-3 sm:gap-4">
          <p>&copy; 2026 KosanKu Pro. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#" className="hover:text-[#047857] dark:hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#047857] dark:hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#047857] dark:hover:text-emerald-400 transition-colors">System Status</a>
          </div>
        </div>
      </div>
    </section>
  );
}
