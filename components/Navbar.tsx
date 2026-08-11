'use client';

import { useState } from 'react';
import type { ViewType, RoleType } from '@/app/page';
import KosanKuLogo from './KosanKuLogo';

interface NavbarProps {
  view: ViewType;
  role: RoleType;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onSwitchRole: (r: RoleType) => void;
  onToggleNotif: () => void;
  onNavigate: (v: ViewType) => void;
}

export default function Navbar({ view, role, theme, onToggleTheme, onLogout, onSwitchRole, onToggleNotif, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPublic = view === 'landing';

  const closeMobile = () => setMobileOpen(false);

  if (isPublic) {
    return null;
  }

  const roleSubtitle =
    role === 'owner'
      ? 'Owner Executive Portal'
      : role === 'employee'
      ? 'Staf Operasional'
      : role === 'vendor'
      ? 'Mitra Vendor Kosan'
      : role === 'admin'
      ? 'Admin Control Center'
      : 'Tenant Portal';

  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 3 && hour < 11) return 'Selamat Pagi 🌅';
    if (hour >= 11 && hour < 15) return 'Selamat Siang ☀️';
    if (hour >= 15 && hour < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  };

  const userProfileName =
    role === 'owner'
      ? 'Bapak Hendra'
      : role === 'admin'
      ? 'Pak Admin Properti'
      : role === 'employee'
      ? 'Bambang (Staf Lapangan)'
      : role === 'vendor'
      ? 'Depot Suci (Mitra Vendor)'
      : 'Budi Santoso (Tenant A-101)';

  return (
    <header className="sticky top-0 z-40 bg-[#f2f5fa]/95 dark:bg-[#141122]/95 backdrop-blur-xl border-b border-[#d1d9e6]/70 dark:border-white/10 shadow-[0_6px_20px_rgba(163,177,198,0.35)] dark:shadow-[0_6px_20px_rgba(0,0,0,0.6)] px-4 sm:px-6 py-3.5 navbar-visible transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <KosanKuLogo
          size="md"
          subtitle={roleSubtitle}
          onClick={() => { onNavigate('landing'); closeMobile(); }}
        />

        {/* Desktop authenticated nav */}
        {!isPublic && (
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={onToggleTheme} 
              className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-800 dark:text-amber-400 transition-all cursor-pointer text-sm" 
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Dynamic Greeting & User Indicator */}
            <div className="px-4 py-2 neu-inset rounded-2xl flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="text-[11px] font-black text-[#047857] dark:text-emerald-400">
                {getDynamicGreeting()}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-extrabold text-slate-800 dark:text-white">{userProfileName}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#047857] text-white text-[9px] font-black uppercase tracking-wider shadow-sm ml-1">
                {role === 'owner' ? '👑 Owner' : role === 'admin' ? '🛡️ Admin' : role === 'employee' ? '👷 Staf' : role === 'vendor' ? '🏪 Vendor' : '👤 Tenant'}
              </span>
            </div>

            {/* Notification Button */}
            <button 
              onClick={onToggleNotif} 
              className="relative w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              title="Notifikasi"
            >
              <i className="fa-solid fa-bell text-sm" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-md">3</span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="px-4 py-2 rounded-2xl neu-btn text-rose-600 dark:text-rose-400 text-xs font-black transition-all flex items-center gap-2 cursor-pointer hover:text-rose-700 dark:hover:text-rose-300"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-[11px]" />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-2.5">
          <button 
            onClick={onToggleTheme} 
            className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-xs cursor-pointer"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={onToggleNotif} 
            className="relative w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs cursor-pointer"
            title="Notifikasi"
          >
            <i className="fa-solid fa-bell" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[7px] font-black flex items-center justify-center shadow-xs">3</span>
          </button>
          <button 
            onClick={() => setMobileOpen((o) => !o)} 
            className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden neu-card rounded-2xl p-4 mt-3 space-y-3 animate-scale-in">
          <div className="p-3 neu-inset rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
            <span>{getDynamicGreeting()} • {userProfileName}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#047857] text-white text-[9px] uppercase font-black">
              {role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-center font-bold text-rose-600 dark:text-rose-400 neu-btn rounded-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
            <span>Keluar dari Sesi</span>
          </button>
        </div>
      )}
    </header>
  );
}
