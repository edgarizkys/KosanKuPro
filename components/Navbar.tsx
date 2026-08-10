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
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0f0c18]/85 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 sm:px-6 py-3 navbar-visible shadow-xs transition-colors">
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
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer text-sm shadow-xs" 
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Dynamic Greeting & User Indicator (Replaced manual role switcher tab) */}
            <div className="px-3.5 py-1.5 bg-[#047857]/10 dark:bg-emerald-950/40 rounded-xl border border-[#047857]/20 flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-emerald-300">
              <span className="text-[11px] font-extrabold text-[#047857] dark:text-emerald-400">
                {getDynamicGreeting()}
              </span>
              <span className="text-slate-400">•</span>
              <span>{userProfileName}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#047857] text-white text-[9px] font-black uppercase ml-1">
                {role === 'owner' ? '👑 Owner' : role === 'admin' ? '🛡️ Admin' : role === 'employee' ? '👷 Staf' : role === 'vendor' ? '🏪 Vendor' : '👤 Tenant'}
              </span>
            </div>

            {/* Notification Button */}
            <button 
              onClick={onToggleNotif} 
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
              title="Notifikasi"
            >
              <i className="fa-solid fa-bell text-sm" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-sm">3</span>
            </button>

            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-[10px]" />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center gap-2">
          <button 
            onClick={onToggleTheme} 
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => setMobileOpen((o) => !o)} 
            className="p-2 text-slate-700 dark:text-slate-200 font-bold"
          >
            <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-white/10 mt-3 pt-3 space-y-3 pb-2 animate-scale-in">
          <div className="p-3 bg-[#047857]/10 rounded-xl border border-[#047857]/20 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
            <span>{getDynamicGreeting()} • {userProfileName}</span>
            <span className="px-2 py-0.5 rounded-full bg-[#047857] text-white text-[9px] uppercase">
              {role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-center font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-xl mt-2"
          >
            Keluar dari Sesi
          </button>
        </div>
      )}
    </header>
  );
}
