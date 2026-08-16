'use client';

import { useState, useEffect } from 'react';
import { useProperty } from '@/lib/PropertyContext';

interface HeroSectionProps {
  onLogin: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function HeroSection({ onLogin, theme = 'light', onToggleTheme }: HeroSectionProps) {
  const [dismissCard, setDismissCard] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const { property } = useProperty();

  // Sync theme with document element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, [theme]);

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
          <div className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#120e20] p-0.5 flex items-center justify-center shadow-md shadow-amber-900/20 group-hover:scale-105 transition-all overflow-hidden border border-amber-500/30">
              <img src="/images/kosanku_logo.svg" alt="KosanKu Pro Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div className="flex items-center gap-1.5 font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
              {property.slug === 'rshs' ? 'KosanKu' : 'KosanKu'}{' '}
              <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-black text-[9px] sm:text-[10px] tracking-wider uppercase">
                {property.slug === 'rshs' ? 'RSHS' : 'PRO'}
              </span>
            </div>
          </div>

          {/* Center Floating Pill Menu (Neumorphism with Tactile Buttons) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 neu-inset rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#" className="flex items-center gap-2 px-4 py-1.5 rounded-full neu-btn text-[#047857] dark:text-emerald-400 font-black transition-all">
              <span className="w-2 h-2 rounded-full bg-[#047857] dark:bg-emerald-400 animate-pulse" />
              <span>Home</span>
            </a>
            <a href="#rooms-section" className="px-4 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5">
              <i className="fa-solid fa-door-open text-[11px] text-slate-400" />
              <span>Kamar</span>
            </a>
            <a href="#amenities-section" className="px-4 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5">
              <i className="fa-solid fa-wand-magic-sparkles text-[11px] text-slate-400" />
              <span>Fasilitas</span>
            </a>
            <a href="#location-section" className="px-4 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5">
              <i className="fa-solid fa-location-dot text-[11px] text-slate-400" />
              <span>Lokasi</span>
            </a>
            <a href="#pricing" className="px-4 py-1.5 rounded-full hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5">
              <i className="fa-solid fa-tag text-[11px] text-slate-400" />
              <span>Harga</span>
            </a>
          </nav>

          {/* Right Action Group: Theme Toggle + CTA Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Light/Dark Switcher) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-800 dark:text-amber-400 transition-all text-xs sm:text-sm cursor-pointer"
                title={theme === 'dark' ? 'Ganti ke Mode Clean White (Terang)' : 'Ganti ke Mode Dark (Gelap)'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {/* CTA Button */}
            <button
              onClick={onLogin}
              className="px-5 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white rounded-2xl font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-[11px]" />
              <span>Login Portal</span>
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
          
          {/* DESKTOP LAYER 1: Selling Display Typography (Harmonious & Perfectly Aligned) */}
          <div className="hidden sm:block hero-parallax-text absolute top-4 lg:top-6 w-full max-w-7xl mx-auto px-8 z-10 pointer-events-none select-none will-change-transform text-center sm:text-left">
            <h1 className="text-[6.0rem] lg:text-[8.5rem] font-black tracking-tight text-slate-900 dark:text-white leading-[0.9] whitespace-nowrap drop-shadow-sm">
              {property.heroHeadline}
            </h1>
            <div className="relative flex items-center justify-start gap-4 pl-4 lg:pl-12 -mt-4 lg:-mt-6">
              <span className="w-12 lg:w-20 h-1.5 bg-[#047857] dark:bg-emerald-400 rounded-full shadow-sm" />
              <h2 className="text-[5.0rem] lg:text-[7.5rem] font-serif italic font-light tracking-tight text-amber-600 dark:text-amber-400 leading-[0.9] whitespace-nowrap drop-shadow-sm">
                {property.heroSubheadline}
              </h2>
            </div>
          </div>

          {/* MOBILE LAYER 1: Luxury Stacked Editorial Typography */}
          <div className="block sm:hidden hero-parallax-text absolute top-10 left-5 right-5 z-10 pointer-events-none select-none will-change-transform">
            <div className="flex flex-col items-start space-y-0">
              <h1 className="text-[2.3rem] xs:text-[2.6rem] font-black tracking-tight text-slate-900 dark:text-white leading-[0.95]">
                {property.heroHeadline}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-1 bg-amber-500 rounded-full" />
                <span className="text-[1.7rem] xs:text-[1.9rem] font-serif italic font-light tracking-tight text-amber-600 dark:text-amber-400 leading-none">
                  {property.heroSubheadline}
                </span>
              </div>
            </div>
          </div>

          {/* LAYER 2: Modern 3-Story Kosan Villa Cutout */}
          <div className="hero-parallax-house relative z-20 w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto -mb-1 sm:-mb-3 lg:-mb-4 scale-100 sm:scale-105 lg:scale-110 origin-bottom pointer-events-none will-change-transform">
            <img
              src="/images/modern_kosan_cutout.png"
              alt="KosanKu Pro Luxury Executive Villa"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />

            {/* LAYER 3: Smart Automatic Glass Sliding Door (Dedicated CSS Motion Engine) */}
            <div 
              className="absolute bottom-[7.0%] left-[57.9%] w-[7.8%] h-[10.8%] pointer-events-auto flex items-center justify-between p-0.5 overflow-hidden cursor-pointer rounded-t-sm group shadow-inner"
              onClick={() => setDoorOpen(!doorOpen)}
              title="Smart Keyless Door Lock (Klik untuk Buka/Tutup Pintu Otomatis)"
            >
              {/* Warm Interior Welcome Ambient Light Glow */}
              <div 
                className={`absolute inset-0 bg-gradient-to-t from-amber-400/90 via-amber-300/50 to-yellow-100/10 blur-[3px] rounded-t-sm pointer-events-none door-glow ${
                  doorOpen ? 'opacity-100' : 'opacity-0'
                }`}
              />
              
              {/* Left Glass Panel (Silky Smooth Motion) */}
              <div 
                className="h-full w-[49%] bg-white/40 dark:bg-white/15 backdrop-blur-[2px] border border-white/70 dark:border-white/20 shadow-md rounded-l-[1px] flex items-center justify-end pr-0.5 door-panel-left"
                style={{ transform: doorOpen ? 'translate3d(-90%, 0, 0)' : 'translate3d(0, 0, 0)' }}
              >
                <div className="w-[2px] h-3.5 bg-slate-900/80 dark:bg-amber-400 rounded-full" />
              </div>

              {/* Right Glass Panel (Silky Smooth Motion) */}
              <div 
                className="h-full w-[49%] bg-white/40 dark:bg-white/15 backdrop-blur-[2px] border border-white/70 dark:border-white/20 shadow-md rounded-r-[1px] flex items-center justify-start pl-0.5 door-panel-right"
                style={{ transform: doorOpen ? 'translate3d(90%, 0, 0)' : 'translate3d(0, 0, 0)' }}
              >
                <div className="w-[2px] h-3.5 bg-slate-900/80 dark:bg-amber-400 rounded-full" />
              </div>
            </div>
          </div>

        </div>

        {/* LAYER 4: 100% NEUMORPHIC FLOATING WIDGET CARDS */}
        {/* Bottom Left Card: +500 Penghuni & Rating (Full Neumorphic Extruded & Inset) */}
        <div className="absolute bottom-3 sm:bottom-5 left-6 sm:left-14 lg:left-20 z-40 max-w-[210px] sm:max-w-[230px] p-4 neu-card rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl text-slate-900 dark:text-white hidden sm:block hover:translate-y-[-3px] transition-all">
          <div className="flex items-baseline justify-between">
            <div className="px-2.5 py-1 neu-inset rounded-2xl text-xl sm:text-2xl font-black text-[#047857] dark:text-emerald-400 shadow-inner">
              500+
            </div>
            <span className="text-[10px] font-black neu-card-sm text-amber-600 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-500/20">
              ★ 4.9 / 5.0
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-snug font-bold">
            Penghuni &amp; pemilik kos mempercayai KosanKuPro
          </p>
          <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex -space-x-1.5">
              <img src="/images/avatar1.png" alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 object-cover" />
              <div className="w-6 h-6 rounded-full bg-[#047857] border-2 border-white dark:border-slate-800 flex items-center justify-center text-[7px] font-bold text-white">EK</div>
              <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[7px] font-bold text-white">AR</div>
            </div>
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-extrabold neu-inset px-2.5 py-0.5 rounded-full">96% Terisi</span>
          </div>
        </div>

        {/* Center Right Card: Smart Property Status (Full Neumorphic Extruded & Inset) */}
        {!dismissCard && (
          <div className="absolute top-[36%] sm:top-[38%] right-8 sm:right-14 lg:right-24 z-40 w-56 sm:w-64 p-4 sm:p-5 neu-card rounded-3xl border border-white/80 dark:border-white/10 shadow-2xl text-slate-900 dark:text-white hidden sm:block animate-scale-in hover:translate-y-[-3px] transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-[11px] font-black text-slate-800 dark:text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                <span>Smart System Status</span>
              </div>
              <button
                onClick={() => setDismissCard(true)}
                className="w-6 h-6 rounded-full neu-btn flex items-center justify-center text-[10px] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Tutup Widget"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 neu-inset rounded-2xl">
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Tingkat Okupansi</div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl sm:text-2xl font-black text-[#047857] dark:text-emerald-400 font-mono">98.4%</span>
                  <span className="text-[9px] font-black text-emerald-800 dark:text-emerald-300 neu-card-sm border border-emerald-500/20 px-2 py-0.5 rounded-xl">
                    ↑ 4 Tersedia
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Smart Keyless Lock</div>
                  <div className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">● Active &amp; Secure</div>
                </div>
                <div className="w-8 h-8 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs shadow-inner">
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



