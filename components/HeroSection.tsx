'use client';

import { useState, useEffect } from 'react';

interface HeroSectionProps {
  onLogin: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function HeroSection({ onLogin, theme = 'light', onToggleTheme }: HeroSectionProps) {
  const [dismissCard, setDismissCard] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);

  // Automatic smooth door opening and closing loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDoorOpen((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic falling autumn leaves originating specifically from the autumn tree canopy (Shifted right over tree)
  const leaves = [
    { top: '55%', left: '22%', delay: '0s', duration: '5.2s', color: '#ea580c', size: '18px', anim: 'fallingLeafSwayRight' },
    { top: '58%', left: '27%', delay: '0.8s', duration: '6.4s', color: '#dc2626', size: '15px', anim: 'fallingLeafSwayLeft' },
    { top: '53%', left: '24%', delay: '1.6s', duration: '5.8s', color: '#d97706', size: '20px', anim: 'fallingLeafSwayRight' },
    { top: '63%', left: '20%', delay: '2.4s', duration: '7.0s', color: '#b45309', size: '16px', anim: 'fallingLeafSwayLeft' },
    { top: '56%', left: '30%', delay: '0.4s', duration: '5.6s', color: '#f59e0b', size: '14px', anim: 'fallingLeafSwayRight' },
    { top: '66%', left: '23%', delay: '1.2s', duration: '6.2s', color: '#ea580c', size: '22px', anim: 'fallingLeafSwayLeft' },
    { top: '51%', left: '26%', delay: '3.0s', duration: '6.8s', color: '#c2410c', size: '17px', anim: 'fallingLeafSwayRight' },
    { top: '60%', left: '29%', delay: '3.8s', duration: '5.4s', color: '#d97706', size: '19px', anim: 'fallingLeafSwayLeft' },
    { top: '64%', left: '21%', delay: '2.0s', duration: '6.6s', color: '#f97316', size: '15px', anim: 'fallingLeafSwayRight' },
    { top: '54%', left: '28%', delay: '4.4s', duration: '5.9s', color: '#dc2626', size: '21px', anim: 'fallingLeafSwayLeft' },
    { top: '68%', left: '25%', delay: '1.0s', duration: '6.5s', color: '#b45309', size: '16px', anim: 'fallingLeafSwayRight' },
    { top: '56%', left: '19%', delay: '3.4s', duration: '7.2s', color: '#ea580c', size: '18px', anim: 'fallingLeafSwayLeft' },
    { top: '62%', left: '31%', delay: '4.8s', duration: '5.5s', color: '#f59e0b', size: '14px', anim: 'fallingLeafSwayRight' },
    { top: '58%', left: '23%', delay: '2.8s', duration: '6.1s', color: '#c2410c', size: '20px', anim: 'fallingLeafSwayLeft' },
    { top: '65%', left: '27%', delay: '5.2s', duration: '6.7s', color: '#d97706', size: '16px', anim: 'fallingLeafSwayRight' },
    { top: '52%', left: '21%', delay: '1.4s', duration: '5.7s', color: '#f97316', size: '17px', anim: 'fallingLeafSwayLeft' },
    { top: '63%', left: '30%', delay: '3.6s', duration: '6.3s', color: '#ea580c', size: '19px', anim: 'fallingLeafSwayRight' },
    { top: '70%', left: '22%', delay: '4.2s', duration: '6.0s', color: '#dc2626', size: '15px', anim: 'fallingLeafSwayLeft' },
  ];

  return (
    <section className="relative w-full font-sans select-none overflow-hidden transition-colors">
      
      {/* Seamless Full-Width Canvas Container (Mobile: Compact Editorial | Desktop: Full Luxury) */}
      <div className="relative w-full h-[420px] xs:h-[450px] sm:h-[84vh] sm:min-h-[640px] sm:max-h-[820px] bg-[#f8f7f4] dark:bg-[#121018] rounded-[2rem] sm:rounded-[3rem] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm flex flex-col justify-between transition-colors">
        
        {/* Top Navbar Floating Inside Canvas */}
        <div className="relative z-40 flex items-center justify-between w-full px-4 py-3 sm:px-10 sm:py-5">
          {/* Left Logo */}
          <div className="flex items-center gap-2 font-bold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white">
            <div className="flex gap-[2.5px]">
              <span className="w-1.5 h-4 sm:w-2.5 sm:h-6 bg-slate-900 dark:bg-white rounded-[2px]" />
              <span className="w-1.5 h-4 sm:w-2.5 sm:h-6 bg-slate-900 dark:bg-white rounded-[2px] mt-0.5" />
            </div>
            KosanKu <span className="font-light text-slate-500 dark:text-slate-400">Pro</span>
          </div>

          {/* Center Floating Pill Menu */}
          <div className="hidden md:flex items-center gap-7 px-7 py-2.5 bg-white/95 dark:bg-white/10 backdrop-blur-md rounded-full border border-black/5 dark:border-white/10 shadow-sm text-xs font-medium text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Home
            </span>
            <a href="#rooms-section" className="hover:text-black dark:hover:text-white transition-colors">Kamar</a>
            <a href="#amenities-section" className="hover:text-black dark:hover:text-white transition-colors">Fasilitas</a>
            <a href="#location-section" className="hover:text-black dark:hover:text-white transition-colors">Lokasi</a>
            <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Harga</a>
          </div>

          {/* Right Action Group: Theme Toggle + CTA Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Light/Dark Switcher) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-800 border border-black/10 dark:border-white/15 shadow-sm flex items-center justify-center text-slate-800 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm cursor-pointer"
                title={theme === 'dark' ? 'Ganti ke Mode Clean White (Terang)' : 'Ganti ke Mode Dark (Gelap)'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {/* CTA Button: Solid Black in White Mode, Solid White in Dark Mode */}
            <button
              onClick={onLogin}
              className="px-4 py-1.5 sm:px-5 sm:py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-[10px]" />
              <span>Login</span>
            </button>
          </div>
        </div>

        {/* Dynamic Falling Autumn Leaves under the Left Tree (Visible on tablet/desktop where tree canopy is shown) */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden hidden sm:block">
          {leaves.map((leaf, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: leaf.top,
                left: leaf.left,
                animation: `${leaf.anim} ${leaf.duration} ease-in-out infinite`,
                animationDelay: leaf.delay,
              }}
            >
              <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill={leaf.color} className="opacity-85 drop-shadow">
                <path d="M17,8C8,10 5,16 3,21C8,20 14,17 17,8M17,8C19.5,4.5 20,2 20,2C20,2 17.5,2.5 14,5C16,6.5 16.8,7.2 17,8Z" />
              </svg>
            </div>
          ))}
        </div>

        {/* Main Composition: Selling 3D Typography + Villa Cutout Overlap */}
        <div className="relative w-full flex-1 flex flex-col justify-end items-center overflow-hidden">
          
          {/* DESKTOP LAYER 1: Selling Display Typography (Original Wide Spread 100% Untouched) */}
          <div className="hidden sm:block hero-parallax-text absolute top-5 lg:top-7 w-full max-w-7xl mx-auto px-8 z-10 pointer-events-none select-none will-change-transform">
            <h1 className="text-[8rem] lg:text-[11rem] font-black tracking-tight text-slate-900 dark:text-white leading-[0.88] whitespace-nowrap">
              Sewa Kos Modern
            </h1>
            <div className="relative flex items-baseline justify-end pr-8 lg:pr-14 -mt-6 lg:-mt-8">
              <h1 className="text-[8rem] lg:text-[11rem] font-serif italic font-light tracking-tight text-slate-800 dark:text-slate-200 leading-[0.88] whitespace-nowrap">
                Siap Huni.
              </h1>
            </div>
          </div>

          {/* MOBILE LAYER 1: Luxury Stacked Editorial Typography (Option A) */}
          <div className="block sm:hidden hero-parallax-text absolute top-12 left-4 right-4 z-10 pointer-events-none select-none will-change-transform">
            <div className="flex flex-col items-start">
              <h1 className="text-[2.6rem] xs:text-[2.9rem] font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                Sewa Kos
              </h1>
              <h1 className="text-[2.6rem] xs:text-[2.9rem] font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                Modern
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-[2px] bg-amber-500 rounded-full" />
                <span className="text-[1.65rem] xs:text-[1.85rem] font-serif italic font-light tracking-tight text-amber-600 dark:text-amber-400 leading-none">
                  Siap Huni.
                </span>
              </div>
            </div>
          </div>

          {/* LAYER 2: Modern 3-Story Kosan Villa Cutout (Massive & Grand on Mobile) */}
          <div className="hero-parallax-house relative z-20 w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto -mb-1 sm:-mb-3 lg:-mb-4 scale-[2.85] xs:scale-[3.0] sm:scale-105 lg:scale-110 origin-bottom translate-x-4 xs:translate-x-6 sm:translate-x-0 translate-y-3 sm:translate-y-0 pointer-events-none will-change-transform">
            <img
              src="/images/modern_kosan_cutout.png"
              alt="KosanKu Pro Luxury Executive Villa"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />

            {/* LAYER 3: Smart Automatic Glass Sliding Door (Placed Exactly on Front Entrance Doorway) */}
            <div 
              className="absolute bottom-[7.0%] left-[57.9%] w-[7.8%] h-[10.8%] pointer-events-auto flex items-center justify-between p-0.5 overflow-hidden cursor-pointer rounded-t-sm group"
              onClick={() => setDoorOpen(!doorOpen)}
              title="Smart Keyless Door Lock (Klik untuk Buka/Tutup)"
            >
              {/* Warm Interior Welcome Glow */}
              <div 
                className={`absolute inset-0 bg-amber-400/45 blur-[2px] transition-opacity duration-700 ${
                  doorOpen ? 'opacity-100' : 'opacity-0'
                }`} 
              />
              
              {/* Left Glass Panel (Slides Left) */}
              <div 
                className="h-full w-[49%] bg-white/40 dark:bg-white/20 backdrop-blur-[2px] border border-white/60 shadow-sm rounded-l-[1px] flex items-center justify-end pr-0.5 transition-transform duration-700 ease-in-out origin-left"
                style={{ transform: doorOpen ? 'translateX(-85%)' : 'translateX(0)' }}
              >
                <div className="w-[2px] h-3.5 bg-slate-900/80 rounded-full" />
              </div>

              {/* Right Glass Panel (Slides Right) */}
              <div 
                className="h-full w-[49%] bg-white/40 dark:bg-white/20 backdrop-blur-[2px] border border-white/60 shadow-sm rounded-r-[1px] flex items-center justify-start pl-0.5 transition-transform duration-700 ease-in-out origin-right"
                style={{ transform: doorOpen ? 'translateX(85%)' : 'translateX(0)' }}
              >
                <div className="w-[2px] h-3.5 bg-slate-900/80 rounded-full" />
              </div>
            </div>
          </div>

        </div>

        {/* LAYER 4: Floating Glassmorphic Cards Tailored for KosanKu Pro */}
        {/* Bottom Left Card: +500 Penghuni & Rating (RESTORED 100% UNTOUCHED FOR WEB DESKTOP) */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-14 sm:left-28 lg:left-40 z-40 max-w-[200px] sm:max-w-[220px] p-3 sm:p-3.5 bg-white/95 dark:bg-black/80 backdrop-blur-xl border border-black/5 dark:border-white/15 rounded-2xl shadow-lg text-slate-900 dark:text-white hidden sm:block">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">+500</h3>
            <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
              ★ 4.9 / 5.0
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-tight font-medium">
            Penghuni &amp; pemilik kos mempercayai KosanKuPro
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/5 dark:border-white/10">
            <div className="flex -space-x-1.5">
              <img src="/images/avatar1.png" alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
              <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[7px] font-bold text-white">EK</div>
              <div className="w-6 h-6 rounded-full bg-purple-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[7px] font-bold text-white">AR</div>
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">96% Terisi</span>
          </div>
        </div>

        {/* Mobile Floating Mini Badge (ONLY ON MOBILE, ZERO IMPACT ON DESKTOP) */}
        <div className="absolute bottom-2 left-2 z-40 max-w-[110px] p-2 bg-white/95 dark:bg-black/80 backdrop-blur-xl border border-black/5 dark:border-white/15 rounded-xl shadow-md text-slate-900 dark:text-white block sm:hidden">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-extrabold tracking-tight">+500</h3>
            <span className="text-[7px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1 py-0.5 rounded-full">
              ★ 4.9
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 pt-1 border-t border-black/5 dark:border-white/10 text-[7px] text-slate-500 font-medium">
            <span>96% Terisi</span>
          </div>
        </div>

        {/* Center Right Card: Smart Property Status (Shifted lower and further left closer to the house) */}
        {!dismissCard && (
          <div className="absolute top-[40%] sm:top-[42%] right-14 sm:right-24 lg:right-36 xl:right-48 z-40 w-52 sm:w-60 p-3.5 sm:p-4 bg-white/95 dark:bg-slate-900/85 backdrop-blur-xl border border-black/5 dark:border-white/15 rounded-2xl shadow-lg text-slate-900 dark:text-white hidden sm:block animate-scale-in">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Smart System Status</span>
              </div>
              <button
                onClick={() => setDismissCard(true)}
                className="w-4 h-4 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-500 hover:text-black dark:hover:text-white transition-colors"
                title="Tutup Widget"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Tingkat Okupansi</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg sm:text-xl font-extrabold">98.4%</span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    ↑ 4 Kamar Tersedia
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/10 text-xs">
                <div>
                  <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Smart Door Lock</div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">● 100% Aktif & Aman</div>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[11px]">
                  <i className="fa-solid fa-shield-halved" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes fallingLeafSwayRight {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          50% {
            transform: translate(25px, 65px) rotate(160deg) scale(1);
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translate(-15px, 145px) rotate(340deg) scale(0.9);
            opacity: 0;
          }
        }
        @keyframes fallingLeafSwayLeft {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          50% {
            transform: translate(-20px, 70px) rotate(-140deg) scale(1);
          }
          85% {
            opacity: 0.85;
          }
          100% {
            transform: translate(20px, 150px) rotate(-320deg) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}



