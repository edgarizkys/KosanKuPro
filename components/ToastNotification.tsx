'use client';

import React from 'react';

export interface ToastProps {
  msg: string;
  type?: 'success' | 'error' | 'info';
  targetTab?: string;
  onClick?: () => void;
  onClose?: () => void;
}

export default function ToastNotification({ msg, type = 'success', targetTab, onClick, onClose }: ToastProps) {
  if (!msg) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  // Determine vibrant icon & gradient accents based on content or type
  let iconClass = 'fa-solid fa-circle-check';
  let gradientBg = 'from-[#047857] to-emerald-500';
  let glowColor = 'shadow-emerald-500/25 border-emerald-400/40';
  let badgeLabel = 'SUKSES';

  if (isError || msg.includes('DITOLAK') || msg.includes('GAGAL')) {
    iconClass = 'fa-solid fa-triangle-exclamation';
    gradientBg = 'from-rose-500 to-pink-600';
    glowColor = 'shadow-rose-500/20 border-rose-400/30';
    badgeLabel = 'PERINGATAN';
  } else if (msg.includes('INSPEKSI') || msg.includes('CEK-IN') || msg.includes('CEK-OUT')) {
    iconClass = 'fa-solid fa-clipboard-check';
    gradientBg = 'from-[#047857] via-emerald-500 to-teal-500';
    glowColor = 'shadow-emerald-500/30 border-emerald-400/50';
    badgeLabel = 'INSPEKSI KAMAR';
  } else if (msg.includes('PENGAJUAN DANA') || msg.includes('ANGGARAN') || msg.includes('Rp')) {
    iconClass = 'fa-solid fa-file-invoice-dollar';
    gradientBg = 'from-emerald-600 to-teal-700';
    glowColor = 'shadow-emerald-500/25 border-emerald-400/40';
    badgeLabel = 'FINANSIAL';
  } else if (msg.includes('ORDER') || msg.includes('SUPLAI') || msg.includes('PESANAN')) {
    iconClass = 'fa-solid fa-boxes-stacked';
    gradientBg = 'from-[#047857] to-emerald-600';
    glowColor = 'shadow-emerald-500/25 border-emerald-400/40';
    badgeLabel = 'LOGISTIK';
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (targetTab && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('switch_dashboard_tab', { detail: { tab: targetTab } }));
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`fixed z-[999999] transition-all duration-300 animate-slide-down sm:animate-scale-in
        /* Mobile: Top floating pill */
        top-4 inset-x-4 sm:inset-x-auto sm:top-auto
        /* Desktop: Bottom right luxury glass card */
        sm:bottom-6 sm:right-6 sm:max-w-md w-auto
        flex items-center gap-3.5 p-4 rounded-3xl
        backdrop-blur-xl bg-white/90 dark:bg-[#120f24]/90
        border shadow-2xl ${glowColor}
        ${onClick || targetTab ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
      `}
      style={{
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.4)',
      }}
    >
      {/* Dynamic Gradient Glass Icon */}
      <div
        className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradientBg} text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}
      >
        <i className={`${iconClass} text-base animate-pulse`} />
      </div>

      <div className="flex-1 space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-white/10 text-slate-800 dark:text-slate-200">
            {badgeLabel}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">Baru Saja</span>
        </div>
        <p className="text-xs font-black text-slate-900 dark:text-white leading-snug break-words">
          {msg.replace(/^[🔔✅📋🎉⚠️🛒📦🧾]+\s*/, '')}
        </p>
        {(onClick || targetTab) && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
            <i className="fa-solid fa-arrow-right text-[9px]" /> Klik untuk melihat detail laporan
          </span>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs font-black shrink-0"
          aria-label="Tutup Notifikasi"
        >
          ✕
        </button>
      )}
    </div>
  );
}
