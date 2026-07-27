'use client';

import { useState } from 'react';
import type { ViewType } from '@/app/page';

interface NavbarProps {
  view: ViewType;
  role: 'admin' | 'tenant';
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onSwitchRole: (r: 'admin' | 'tenant') => void;
  onToggleNotif: () => void;
  onNavigate: (v: ViewType) => void;
}

export default function Navbar({ view, role, theme, onToggleTheme, onLogin, onLogout, onSwitchRole, onToggleNotif, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPublic = view === 'landing';
  const iconClass = theme === 'light' ? 'fa-solid fa-sun text-xs' : 'fa-solid fa-moon text-xs';

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 glass-panel px-4 sm:px-6 py-3 navbar-visible">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { onNavigate('landing'); closeMobile(); }}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orchid-tint to-orchid-violet flex items-center justify-center text-orchid-dark text-base sm:text-lg shadow-lg shadow-orchid-violet/30 group-hover:shadow-orchid-violet/50 transition-shadow">
            <i className="fa-solid fa-building-user" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-none">
              KosanKu <span className="text-gradient-animated">Pro</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide">LUXURY LIVING MANAGEMENT</p>
          </div>
        </div>

        {/* Desktop public nav */}
        {isPublic && (
          <div className="hidden md:flex items-center gap-5">
            <button onClick={() => onNavigate('landing')} className="text-xs font-semibold text-slate-300 hover:text-orchid-tint transition-colors">Home</button>
            <a href="#rooms-section" className="text-xs font-semibold text-slate-300 hover:text-orchid-tint transition-colors">Kamar</a>
            <a href="#amenities-section" className="text-xs font-semibold text-slate-300 hover:text-orchid-tint transition-colors">Fasilitas</a>
            <a href="#location-section" className="text-xs font-semibold text-slate-300 hover:text-orchid-tint transition-colors">Lokasi</a>
            <button onClick={onToggleTheme} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-orchid-tint hover:border-orchid-tint/30 transition-all duration-300" title="Toggle Dark/Light Mode">
              <i className={iconClass} />
            </button>
            <button onClick={onLogin} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-orchid-dark shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.03] transition-all duration-300 magnetic-btn ripple-effect">
              Masuk
            </button>
          </div>
        )}

        {/* Desktop authenticated nav */}
        {!isPublic && (
          <div className="hidden md:flex items-center gap-4">
            <button onClick={onToggleTheme} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-orchid-tint hover:border-orchid-tint/30 transition-all duration-300" title="Toggle Dark/Light Mode">
              <i className={iconClass} />
            </button>
            <div className="bg-orchid-dark/80 p-1 rounded-xl border border-orchid-tint/10 flex items-center gap-0.5">
              <button onClick={() => onSwitchRole('admin')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${role === 'admin' ? 'active-tab' : 'text-slate-400 hover:text-white'}`}>
                <i className="fa-solid fa-shield-halved text-[10px]" /> Admin
              </button>
              <button onClick={() => onSwitchRole('tenant')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${role === 'tenant' ? 'active-tab' : 'text-slate-400 hover:text-white'}`}>
                <i className="fa-solid fa-user text-[10px]" /> Tenant
              </button>
            </div>
            <button onClick={onToggleNotif} className="relative p-2.5 rounded-xl bg-gradient-to-br from-orchid-violet/20 to-orchid-tint/10 border border-orchid-violet/30 text-orchid-tint hover:from-orchid-violet/30 hover:to-orchid-tint/20 hover:border-orchid-violet/50 hover:shadow-lg hover:shadow-orchid-violet/20 transition-all duration-300">
              <i className="fa-solid fa-bell text-sm" />
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-md shadow-rose-500/40 animate-pulse">3</span>
            </button>
            <button onClick={onLogout} className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
              <i className="fa-solid fa-arrow-right-from-bracket" />
            </button>
          </div>
        )}

        {/* Mobile right actions */}
        <div className="flex md:hidden items-center gap-2">
          {!isPublic && (
            <>
              <button onClick={onToggleNotif} className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                <i className="fa-solid fa-bell text-xs" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">3</span>
              </button>
              <button onClick={onLogout} className="p-2 rounded-xl bg-white/5 border border-white/10 text-rose-400">
                <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              </button>
            </>
          )}
          <button onClick={onToggleTheme} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
            <i className={iconClass} />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'} text-sm`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pb-3 border-t border-white/5 pt-3 space-y-2 animate-fade-down">
          {isPublic && (
            <>
              <button onClick={() => { onNavigate('landing'); closeMobile(); }} className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-orchid-tint hover:bg-white/5 rounded-lg transition-colors">Home</button>
              <a href="#rooms-section" onClick={closeMobile} className="block px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-orchid-tint hover:bg-white/5 rounded-lg transition-colors">Kamar</a>
              <a href="#amenities-section" onClick={closeMobile} className="block px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-orchid-tint hover:bg-white/5 rounded-lg transition-colors">Fasilitas</a>
              <a href="#location-section" onClick={closeMobile} className="block px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-orchid-tint hover:bg-white/5 rounded-lg transition-colors">Lokasi</a>
              <div className="pt-2 border-t border-white/5">
                <button onClick={() => { onLogin(); closeMobile(); }} className="w-full py-3 rounded-xl text-xs font-bold bg-white text-orchid-dark shadow-lg">Masuk</button>
              </div>
            </>
          )}
          {!isPublic && (
            <div className="flex gap-2 px-1">
              <button onClick={() => { onSwitchRole('admin'); closeMobile(); }} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${role === 'admin' ? 'active-tab' : 'text-slate-400 bg-white/5 border border-white/10'}`}>
                <i className="fa-solid fa-shield-halved mr-1.5 text-[10px]" /> Admin
              </button>
              <button onClick={() => { onSwitchRole('tenant'); closeMobile(); }} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${role === 'tenant' ? 'active-tab' : 'text-slate-400 bg-white/5 border border-white/10'}`}>
                <i className="fa-solid fa-user mr-1.5 text-[10px]" /> Tenant
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
