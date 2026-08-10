'use client';

import { useState } from 'react';
import type { RoleType } from '@/app/page';

interface SaaSLayoutProps {
  role: RoleType;
  children: React.ReactNode;
  activeBranch: string;
  onBranchChange: (b: string) => void;
}

export const BRANCHES = [
  { id: 'all', name: '🌟 Konsolidasi Semua Cabang (Aggregated P&L)', totalRooms: 40, revenue: 101500000, occupancy: 93 },
  { id: 'jkt', name: '🏢 KosanKu Pro - Jakarta Selatan (Utama)', totalRooms: 12, revenue: 34500000, occupancy: 100 },
  { id: 'bdg', name: '🏡 KosanKu Pro - Dago Bandung', totalRooms: 18, revenue: 42000000, occupancy: 88 },
  { id: 'sby', name: '🏬 KosanKu Pro - Gubeng Surabaya', totalRooms: 10, revenue: 25000000, occupancy: 90 },
];

export default function SaaSLayout({ role, children, activeBranch, onBranchChange }: SaaSLayoutProps) {
  const [isOfflineTest, setIsOfflineTest] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedBranch = BRANCHES.find((b) => b.id === activeBranch) || BRANCHES[0];

  const triggerSocketTest = () => {
    setToast('⚡ [WebSockets Realtime] Event Baru Received: "Tiket Kamar A-101 Diterima dari Tenant via WebSockets"');
    setTimeout(() => setToast(null), 4000);
  };

  const rbacBadge =
    role === 'owner'
      ? { text: '👑 FULL EXECUTIVE ACCESS', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30' }
      : role === 'admin'
      ? { text: '🛡️ PROPERTY MANAGER ACCESS', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' }
      : role === 'employee'
      ? { text: '🪪 FIELD OPERATIONAL ACCESS', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30' }
      : role === 'vendor'
      ? { text: '🏪 PARTNER VENDOR ACCESS', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
      : { text: '👤 RESIDENT PORTAL ACCESS', bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 🚀 Sleek SaaS Enterprise Topbar (Multi-Branch, WebSockets, PWA Offline, RBAC Guard) */}
      <div className="bg-[#120e20]/90 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 rounded-3xl shadow-2xl space-y-4 text-white">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
          
          {/* Multi-Branch Aggregation Selector */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-md text-sm">
              <i className="fa-solid fa-building-user" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest block">Multi-Property Branch Aggregator</span>
              <div className="relative mt-0.5">
                <select
                  value={activeBranch}
                  onChange={(e) => onBranchChange(e.target.value)}
                  className="bg-[#1e1735] text-white text-xs sm:text-sm font-black py-1.5 px-3 pr-8 rounded-xl border border-purple-500/30 outline-none cursor-pointer hover:border-purple-400 transition-all appearance-none"
                >
                  {BRANCHES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#161224] text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-3 top-2.5 text-[10px] text-purple-300 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* SaaS System Status Engine Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* RBAC Guard Badge */}
            <span className={`px-3 py-1 rounded-xl text-[10px] font-extrabold border ${rbacBadge.bg}`}>
              {rbacBadge.text}
            </span>

            {/* Live WebSockets Status */}
            <button
              onClick={triggerSocketTest}
              className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 hover:bg-emerald-500/25 transition-all cursor-pointer"
              title="Klik untuk simulasi WebSocket alert real-time"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🟢 WebSockets Realtime</span>
            </button>

            {/* PWA Offline Sync Indicator */}
            <button
              onClick={() => setIsOfflineTest(!isOfflineTest)}
              className={`px-3 py-1 rounded-xl text-[10px] font-extrabold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isOfflineTest
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              }`}
              title="Klik untuk menguji simulasi mode PWA Offline IndexedDB"
            >
              <i className={`fa-solid ${isOfflineTest ? 'fa-wifi-slash text-amber-400' : 'fa-signal text-blue-400'}`} />
              <span>{isOfflineTest ? '⚡ PWA Offline (IndexedDB Queued)' : '⚡ PWA Online Synced'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Branch Aggregated Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Cabang Aktif</span>
            <span className="text-xs font-bold text-purple-300 truncate block mt-0.5">{selectedBranch.name.split('-')[1] || selectedBranch.name}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Unit Kamar</span>
            <span className="text-sm font-black text-white block mt-0.5">{selectedBranch.totalRooms} Kamar</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Omset Cabang</span>
            <span className="text-sm font-black text-emerald-400 block mt-0.5">
              Rp {(selectedBranch.revenue / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Rata-Rata Okupansi</span>
            <span className="text-sm font-black text-amber-400 block mt-0.5">{selectedBranch.occupancy}% Terisi</span>
          </div>
        </div>
      </div>

      {/* Main SaaS Dashboard Body */}
      <div>{children}</div>

      {/* Toast Notification for WebSockets test */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl animate-scale-in flex items-center gap-2 border border-white/20">
          <i className="fa-solid fa-[#fa-bolt] text-amber-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
