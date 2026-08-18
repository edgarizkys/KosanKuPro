'use client';

export default function AppDownloadBanner() {
  return (
    <section className="relative w-full py-8 sm:py-12 select-none">
      <div className="relative neu-card-lg rounded-[2.5rem] sm:rounded-[3.2rem] p-6 sm:p-10 lg:p-12 reveal-scale">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider reveal reveal-delay-1">
              <i className="fa-solid fa-mobile-screen-button text-xs" />
              <span>Mobile App KosanKu Pro (Coming Soon 2026)</span>
            </div>

            <div className="space-y-3 reveal reveal-delay-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Kontrol Penuh Hunian Kos <br />
                <span className="text-amber-500">
                  Langsung dari Genggaman Anda.
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                Buka pintu kamar via Smart Keyless Bluetooth, bayar tagihan sewa 1-klik QRIS, pesan laundry kiloan, hingga ajukan tiket maintenance teknisi langsung lewat ponsel.
              </p>
            </div>

            {/* Features — stagger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              {[
                'Smart Lock 1-Tap Unlock Pintu',
                'Auto Notifikasi Tagihan & Resi',
                'Tiket Komplain & Perbaikan Teknisi',
                'Layanan Laundry & Air Galon Antar',
              ].map((feat, idx) => (
                <div key={idx} className={`flex items-center gap-2.5 p-2.5 rounded-xl neu-inset stagger-item`}>
                  <div className="w-6 h-6 rounded-full neu-btn-amber flex items-center justify-center text-[9px] shrink-0">
                    <i className="fa-solid fa-check" />
                  </div>
                  <span className="text-[11px]">{feat}</span>
                </div>
              ))}
            </div>

            {/* Store Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 reveal reveal-delay-4">
              <div className="px-4 py-3 rounded-2xl neu-btn flex items-center gap-3 cursor-pointer group hover:text-amber-500 transition-all magnetic-btn ripple-effect">
                <i className="fa-brands fa-google-play text-2xl text-amber-500 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none">Segera di</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">Google Play</div>
                </div>
              </div>

              <div className="px-4 py-3 rounded-2xl neu-btn flex items-center gap-3 cursor-pointer group hover:text-amber-500 transition-all magnetic-btn ripple-effect">
                <i className="fa-brands fa-apple text-2xl text-slate-700 dark:text-white group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold leading-none">Segera di</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">App Store</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center reveal-right">
            <div className="relative w-60 sm:w-64 rounded-[2.8rem] p-3 neu-card-lg ring-1 ring-slate-200 dark:ring-white/10 spotlight-card">
              
              {/* Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full neu-inset z-20" />

              {/* App Screen */}
              <div className="w-full h-[400px] rounded-[2.2rem] overflow-hidden neu-inset p-4 flex flex-col justify-between">
                
                <div className="pt-5 space-y-1">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">KosanKu Mobile</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white">Selamat Datang, Penghuni!</div>
                </div>

                {/* Digital Key Card */}
                <div className="p-3.5 rounded-2xl neu-btn-amber space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-950">
                    <span>Smart Key Access</span>
                    <i className="fa-solid fa-wifi text-xs" />
                  </div>
                  <div className="text-base font-black text-slate-950">Kamar NYM-03 • Lt 2</div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-black/10">PIN: •••• 88</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse" />
                      <span>Terhubung</span>
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  {[
                    { icon: 'fa-lock-open', label: 'Buka Pintu' },
                    { icon: 'fa-receipt', label: 'Tagihan' },
                    { icon: 'fa-screwdriver-wrench', label: 'Bantuan' },
                  ].map((a, idx) => (
                    <div key={idx} className="p-2 rounded-xl neu-card flex flex-col items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-colors cursor-pointer">
                      <i className={`fa-solid ${a.icon} text-amber-500 text-sm`} />
                      <span>{a.label}</span>
                    </div>
                  ))}
                </div>

                {/* Notification Toast */}
                <div className="p-2.5 rounded-xl neu-inset text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-xs" />
                  <span>Tagihan Bulan Depan Lunas!</span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
