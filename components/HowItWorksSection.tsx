'use client';

export default function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Pilih & Jelajahi Kamar',
      desc: 'Eksplorasi foto asli resolusi tinggi, fasilitas lengkap, dan cek peta interaktif tanpa biaya tersembunyi.',
      icon: 'fa-solid fa-magnifying-glass-location',
      badge: 'Transparan & Nyata',
    },
    {
      step: '02',
      title: 'Jadwalkan Survei Bebas Ribet',
      desc: 'Pilih waktu survei langsung ke lokasi atau lakukan video tour online via WhatsApp bersama tim kami.',
      icon: 'fa-solid fa-calendar-check',
      badge: 'Online / Offline',
    },
    {
      step: '03',
      title: 'Booking & Smart Check-in',
      desc: 'Bayar DP aman via QRIS/Transfer, terima Smart PIN pintu otomatis, dan langsung masuk tanpa repot bawa kunci fisik.',
      icon: 'fa-solid fa-key',
      badge: '100% Otomatis',
    },
  ];

  return (
    <section className="relative w-full py-10 sm:py-16 text-slate-900 dark:text-white select-none">
      <div className="space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto reveal-blur">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider">
            Proses Sewa Modern 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            3 Langkah Mudah Tinggal di KosanKu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto">
            Dari pencarian hingga check-in, semua serba instan, digital, dan terverifikasi aman.
          </p>
        </div>

        {/* Steps Grid — stagger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className={`group relative rounded-3xl neu-card p-6 sm:p-8 transition-all duration-300 hover:shadow-xl flex flex-col justify-between stagger-item`}
            >
              {/* Step Number Watermark */}
              <div className="absolute top-4 right-6 text-5xl sm:text-6xl font-black text-slate-200 dark:text-white/5 group-hover:text-amber-500/10 transition-colors pointer-events-none select-none">
                {item.step}
              </div>

              <div className="space-y-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center text-amber-500 text-xl group-hover:scale-110 transition-transform">
                  <i className={item.icon} />
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-[10px] uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Langkah {idx + 1} dari 3</span>
                <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
