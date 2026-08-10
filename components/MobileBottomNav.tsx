'use client';

import { useState, useEffect } from 'react';

interface MobileBottomNavProps {
  onLogin: () => void;
}

export default function MobileBottomNav({ onLogin }: MobileBottomNavProps) {
  const [activeSection, setActiveSection] = useState<'home' | 'rooms' | 'amenities' | 'location'>('home');
  const [visible, setVisible] = useState(true);
  const [lastY, setLastY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const curY = window.pageYOffset;
      // Track active section based on scroll position
      const roomsEl = document.getElementById('rooms-section');
      const amenitiesEl = document.getElementById('amenities-section');
      const locationEl = document.getElementById('location-section');

      if (locationEl && curY >= locationEl.offsetTop - 300) {
        setActiveSection('location');
      } else if (amenitiesEl && curY >= amenitiesEl.offsetTop - 300) {
        setActiveSection('amenities');
      } else if (roomsEl && curY >= roomsEl.offsetTop - 300) {
        setActiveSection('rooms');
      } else {
        setActiveSection('home');
      }

      // Hide on fast scroll down, reveal on scroll up
      if (curY > lastY && curY > 150) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastY(curY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastY]);

  const scrollTo = (id: string, section: typeof activeSection) => {
    setActiveSection(section);
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center md:hidden transition-all duration-300 pointer-events-none ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <div className="pointer-events-auto flex items-center justify-around gap-1 px-3 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-black/10 dark:border-white/15 rounded-full shadow-2xl max-w-sm w-full">
        {/* Home */}
        <button
          type="button"
          onClick={() => scrollTo('hero', 'home')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-full transition-all active:scale-90 cursor-pointer ${
            activeSection === 'home'
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-400 dark:text-slate-400'
          }`}
          aria-label="Home"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            activeSection === 'home' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : ''
          }`}>
            <i className="fa-solid fa-house text-xs" />
          </div>
          <span className="text-[9px] mt-0.5">Home</span>
        </button>

        {/* Rooms */}
        <button
          type="button"
          onClick={() => scrollTo('rooms-section', 'rooms')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-full transition-all active:scale-90 cursor-pointer ${
            activeSection === 'rooms'
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-400 dark:text-slate-400'
          }`}
          aria-label="Kamar"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            activeSection === 'rooms' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : ''
          }`}>
            <i className="fa-solid fa-bed text-xs" />
          </div>
          <span className="text-[9px] mt-0.5">Kamar</span>
        </button>

        {/* Facilities */}
        <button
          type="button"
          onClick={() => scrollTo('amenities-section', 'amenities')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-full transition-all active:scale-90 cursor-pointer ${
            activeSection === 'amenities'
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-400 dark:text-slate-400'
          }`}
          aria-label="Fasilitas"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            activeSection === 'amenities' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : ''
          }`}>
            <i className="fa-solid fa-wifi text-xs" />
          </div>
          <span className="text-[9px] mt-0.5">Fasilitas</span>
        </button>

        {/* Location */}
        <button
          type="button"
          onClick={() => scrollTo('location-section', 'location')}
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-full transition-all active:scale-90 cursor-pointer ${
            activeSection === 'location'
              ? 'text-slate-900 dark:text-white font-bold'
              : 'text-slate-400 dark:text-slate-400'
          }`}
          aria-label="Lokasi"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            activeSection === 'location' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm' : ''
          }`}>
            <i className="fa-solid fa-location-dot text-xs" />
          </div>
          <span className="text-[9px] mt-0.5">Lokasi</span>
        </button>

        {/* Login CTA */}
        <button
          type="button"
          onClick={onLogin}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 rounded-full font-bold text-[11px] shadow-md shadow-amber-500/30 active:scale-95 transition-all cursor-pointer ml-1"
        >
          <i className="fa-solid fa-arrow-right-to-bracket text-[10px]" />
          <span>Login</span>
        </button>
      </div>
    </div>
  );
}
