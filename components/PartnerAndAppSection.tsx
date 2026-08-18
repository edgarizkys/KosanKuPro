'use client';

interface PartnerAndAppSectionProps {
  onOpenConsultation?: () => void;
}

export default function PartnerAndAppSection({ onOpenConsultation }: PartnerAndAppSectionProps) {
  const stats = [
    { value: '95%+', label: 'Rata-rata Okupansi' },
    { value: '100%', label: 'Smart Lock Otomatis' },
    { value: '0 Biaya', label: 'Setup Awal' },
    { value: '24/7', label: 'Resepsionis' },
  ];

  const features = [
    'Smart Lock 1-Tap Unlock Pintu',
    'Auto Notifikasi Tagihan & Resi',
    'Tiket Komplain & Perbaikan Teknisi',
    'Layanan Laundry & Air Galon Antar',
  ];

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/6282114242634?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20tertarik%20untuk%20mendaftarkan%20properti%20kos%20saya%20sebagai%20mitra.',
      '_blank'
    );
  };

  return (
    <section className="relative w-full select-none space-y-5 sm:space-y-6">

      {/* ── ROW 1: Kemitraan Owner + Phone Mockup side-by-side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">

        {/* LEFT — Kemitraan Pemilik */}
        <div className="lg:col-span-7 neu-card-lg rounded-3xl p-6 sm:p-8 reveal-left flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider">
              Program Kemitraan Pemilik Properti
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Punya Properti Kos? <br />
              <span className="text-amber-500">Lipatgandakan Okupansi &amp; Pendapatan.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Serahkan operasional harian kos Anda pada ekosistem KosanKu Pro. IoT Smart Lock otomatis, pembukuan digital transparan, pemasaran terpadu tanpa biaya tersembunyi.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stats.map((s, idx) => (
              <div key={idx} className="p-3 rounded-2xl neu-inset stagger-item text-center">
                <div className="text-lg sm:text-xl font-black text-amber-500">{s.value}</div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-5 py-3 rounded-2xl neu-btn-amber font-black text-xs flex items-center gap-2 ripple-effect magnetic-btn"
            >
              <i className="fa-brands fa-whatsapp text-sm" />
              <span>Konsultasi Kemitraan Gratis</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if ((window as any).__openOwnerRegister) (window as any).__openOwnerRegister();
                else if (onOpenConsultation) onOpenConsultation();
              }}
              className="px-5 py-3 rounded-2xl neu-btn text-slate-700 dark:text-slate-200 font-bold text-xs hover:text-amber-500 active:neu-inset transition-all ripple-effect"
            >
              Pelajari Simulasi ROI
            </button>
          </div>
        </div>

        {/* RIGHT — Phone Mockup App */}
        <div className="lg:col-span-5 neu-card-lg rounded-3xl p-6 sm:p-8 reveal-right flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider">
              Mobile App (Coming Soon 2026)
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Kontrol Hunian dari <span className="text-amber-500">Genggaman.</span>
            </h3>
          </div>

          {/* Phone + Features side by side on md+ */}
          <div className="flex flex-col sm:flex-row items-center gap-5">

            {/* Phone */}
            <div className="shrink-0 w-44 rounded-[2.4rem] p-2.5 neu-card-lg ring-1 ring-slate-200 dark:ring-white/10 spotlight-card">
              <div className="relative">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full neu-inset z-10" />
                <div className="w-full h-[280px] rounded-[1.9rem] overflow-hidden neu-inset p-3 flex flex-col justify-between">
                  <div className="pt-5">
                    <div className="text-[9px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">KosanKu Mobile</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">Selamat Datang!</div>
                  </div>
                  <div className="p-2.5 rounded-xl neu-btn-amber space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black text-slate-950">
                      <span>Smart Key</span>
                      <i className="fa-solid fa-wifi" />
                    </div>
                    <div className="text-xs font-black text-slate-950">Kamar NYM-03</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
                      <span>Terhubung</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[8px] font-bold">
                    {[
                      { icon: 'fa-lock-open', label: 'Buka' },
                      { icon: 'fa-receipt', label: 'Tagihan' },
                      { icon: 'fa-screwdriver-wrench', label: 'Bantu' },
                    ].map((a, i) => (
                      <div key={i} className="p-1.5 rounded-lg neu-card flex flex-col items-center gap-0.5 text-slate-700 dark:text-slate-200">
                        <i className={`fa-solid ${a.icon} text-amber-500 text-[11px]`} />
                        <span>{a.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 rounded-lg neu-inset text-[8px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-check text-[9px]" />
                    <span>Tagihan Lunas!</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features list */}
            <div className="flex-1 space-y-2 w-full">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl neu-inset stagger-item text-xs font-bold text-slate-700 dark:text-slate-200">
                  <div className="w-5 h-5 rounded-full neu-btn-amber flex items-center justify-center text-[8px] shrink-0">
                    <i className="fa-solid fa-check" />
                  </div>
                  <span className="text-[11px]">{feat}</span>
                </div>
              ))}

              {/* Store badges */}
              <div className="flex gap-2 pt-1.5">
                <div className="px-3 py-2 rounded-xl neu-btn flex items-center gap-2 cursor-pointer group hover:text-amber-500 transition-all magnetic-btn ripple-effect flex-1 justify-center">
                  <i className="fa-brands fa-google-play text-lg text-amber-500" />
                  <div>
                    <div className="text-[8px] uppercase text-slate-400 font-bold leading-none">Segera di</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">Google Play</div>
                  </div>
                </div>
                <div className="px-3 py-2 rounded-xl neu-btn flex items-center gap-2 cursor-pointer group hover:text-amber-500 transition-all magnetic-btn ripple-effect flex-1 justify-center">
                  <i className="fa-brands fa-apple text-lg text-slate-700 dark:text-white" />
                  <div>
                    <div className="text-[8px] uppercase text-slate-400 font-bold leading-none">Segera di</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">App Store</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
