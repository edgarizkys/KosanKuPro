'use client';

interface OwnerPartnerBannerProps {
  onOpenConsultation?: () => void;
}

export default function OwnerPartnerBanner({ onOpenConsultation }: OwnerPartnerBannerProps) {
  const stats = [
    { value: '95%+', label: 'Rata-rata Okupansi' },
    { value: '100%', label: 'Smart Lock Otomatis' },
    { value: '0 Biaya', label: 'Setup Awal Konsultasi' },
    { value: '24/7', label: 'Resepsionis & Perawatan' },
  ];

  const handleWhatsApp = () => {
    window.open(
      'https://wa.me/6282114242634?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20tertarik%20untuk%20mendaftarkan%20properti%20kos%20saya%20sebagai%20mitra.',
      '_blank'
    );
  };

  return (
    <section className="relative w-full py-6 sm:py-10 select-none">
      <div className="relative neu-card-lg rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden p-6 sm:p-10 lg:p-14 reveal-scale">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider reveal reveal-delay-1">
              <i className="fa-solid fa-handshake text-xs" />
              <span>Program Kemitraan Pemilik Properti</span>
            </div>

            <div className="space-y-3 reveal reveal-delay-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Punya Properti Kos? <br />
                <span className="text-amber-500">
                  Lipatgandakan Okupansi &amp; Pendapatan.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                Serahkan operasional harian kos Anda pada ekosistem manajemen KosanKu Pro. Dilengkapi IoT Smart Lock otomatis, pembukuan digital transparan, dan pemasaran terpadu tanpa biaya tersembunyi.
              </p>
            </div>

            {/* Quick Metrics — stagger */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {stats.map((s, idx) => (
                <div key={idx} className="p-3 rounded-2xl neu-inset stagger-item">
                  <div className="text-xl sm:text-2xl font-black text-amber-500">{s.value}</div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2 reveal reveal-delay-3">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="px-6 sm:px-8 py-3.5 rounded-2xl neu-btn-amber font-black text-xs sm:text-sm flex items-center gap-2 ripple-effect magnetic-btn"
              >
                <i className="fa-brands fa-whatsapp text-base" />
                <span>Konsultasi Kemitraan Gratis</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if ((window as any).__openOwnerRegister) {
                    (window as any).__openOwnerRegister();
                  } else if (onOpenConsultation) {
                    onOpenConsultation();
                  }
                }}
                className="px-6 py-3.5 rounded-2xl neu-btn text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm hover:text-amber-500 active:neu-inset transition-all ripple-effect"
              >
                Pelajari Simulasi ROI
              </button>
            </div>

          </div>

          {/* Right: Dashboard Preview */}
          <div className="lg:col-span-5 flex justify-center reveal-right">
            <div className="relative w-full max-w-sm rounded-3xl p-6 neu-card space-y-4 spotlight-card">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-amber-500 text-xl">
                  <i className="fa-solid fa-chart-line" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">Dashboard Owner Realtime</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Laporan Pemasukan &amp; Okupansi</div>
                </div>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl neu-inset text-xs">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
                  <span>Tingkat Okupansi Kamar</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black">98.4%</strong>
                </div>
                <div className="w-full h-2 rounded-full neu-inset overflow-hidden">
                  <div className="w-[98%] h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-medium">
                  <span>Auto Tagih WhatsApp</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">● 100% Otomatis</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <i className="fa-solid fa-circle-check text-xs" />
                  <span>Garansi Transparan</span>
                </span>
                <span>Mitra KosanKu Pro</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
