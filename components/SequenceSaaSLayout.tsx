'use client';

import { useState, useEffect } from 'react';
import type { RoleType } from '@/app/page';

interface SequenceSaaSLayoutProps {
  role: RoleType;
  children: React.ReactNode;
  activeBranch: string;
  onBranchChange: (b: string) => void;
  onSwitchRole: (r: RoleType) => void;
  onLogout: () => void;
  activeTab?: string;
  onTabChange?: (t: string) => void;
  pendingRequestsCount?: number;
  pendingApprovalsCount?: number;
}

export const BRANCHES = [
  { id: 'all', name: 'Konsolidasi Semua Cabang (Aggregated P&L)', totalRooms: 40, revenue: 101500000, occupancy: 93 },
  { id: 'jkt', name: 'KosanKu Pro - Jakarta Selatan (Utama)', totalRooms: 12, revenue: 34500000, occupancy: 100 },
  { id: 'bdg', name: 'KosanKu Pro - Dago Bandung', totalRooms: 18, revenue: 42000000, occupancy: 88 },
  { id: 'sby', name: 'KosanKu Pro - Gubeng Surabaya', totalRooms: 10, revenue: 25000000, occupancy: 90 },
];

export default function SequenceSaaSLayout({
  role,
  children,
  activeBranch,
  onBranchChange,
  onSwitchRole,
  onLogout,
  activeTab = 'financial',
  onTabChange,
  pendingRequestsCount = 1,
  pendingApprovalsCount = 2,
}: SequenceSaaSLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [proMode, setProMode] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Live Chart Animation Pulse State
  const [chartBars, setChartBars] = useState([
    { date: '06 Nov', in: 45, out: 20 },
    { date: '07 Nov', in: 60, out: 15 },
    { date: '08 Nov', in: 80, out: 35 },
    { date: '09 Nov', in: 55, out: 25 },
    { date: '10 Nov', in: 95, out: 40 },
    { date: '11 Nov', in: 70, out: 18 },
    { date: '12 Nov', in: 65, out: 30 },
  ]);

  // Dynamic live chart bar movement interval
  useEffect(() => {
    const interval = setInterval(() => {
      setChartBars((prev) =>
        prev.map((b) => ({
          ...b,
          in: Math.min(100, Math.max(30, b.in + (Math.random() > 0.5 ? 5 : -5))),
          out: Math.min(60, Math.max(10, b.out + (Math.random() > 0.5 ? 3 : -3))),
        }))
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const selectedBranch = BRANCHES.find((b) => b.id === activeBranch) || BRANCHES[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleTabClick = (tabId: string) => {
    if (onTabChange) onTabChange(tabId);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const userEmail =
    role === 'owner'
      ? 'owner@kosanku.com'
      : role === 'admin'
      ? 'admin@kosanku.com'
      : role === 'employee'
      ? 'staf@kosanku.com'
      : role === 'vendor'
      ? 'vendor@kosanku.com'
      : 'budi@kosanku.com';

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#0f172a] font-sans flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* 📱 MOBILE TOP HEADER BAR (lg:hidden) */}
      <div className="lg:hidden bg-white border-b border-[#e2e8f0] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-800 font-bold cursor-pointer"
          >
            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-sm`} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#047857] flex items-center justify-center text-white font-black text-xs">
              <i className="fa-solid fa-cubes-stacked" />
            </div>
            <span className="font-black text-base text-[#047857]">KosanKu<span className="text-slate-900">Pro</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[#047857] text-white text-[9px] font-black uppercase">
            {role}
          </span>
          <button
            onClick={() => showToast('🔔 3 Notifikasi Kosan Baru')}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 font-bold relative"
          >
            <i className="fa-solid fa-bell text-xs" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center">3</span>
          </button>
        </div>
      </div>

      {/* 🟢 MOBILE SLIDE-OVER DRAWER BACKDROP OVERLAY (lg:hidden) */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden animate-fade-in"
        />
      )}

      {/* 🟢 LEFT SIDEBAR (Desktop Permanent Sidebar + Mobile Drawer Overlay) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#e2e8f0] flex flex-col justify-between shrink-0 p-5 space-y-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* Top Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#047857] flex items-center justify-center text-white font-black shadow-sm text-sm">
                <i className="fa-solid fa-cubes-stacked" />
              </div>
              <span className="font-black text-lg text-[#047857] tracking-tight">KosanKu<span className="text-[#0f172a]">Pro</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#047857] text-[9px] font-extrabold border border-emerald-300">
                v2.5 Enterprise
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>
          </div>

          {/* Dynamic Time-Based Greeting Card for All Roles */}
          <div className="p-3.5 bg-gradient-to-br from-[#047857]/10 via-[#10b981]/5 to-transparent rounded-2xl border border-[#047857]/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[#047857] uppercase tracking-wider block">
                {getDynamicGreeting()}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#047857] text-white text-[9px] font-black uppercase">
                {role === 'owner' ? '👑 Owner' : role === 'admin' ? '🛡️ Admin' : role === 'employee' ? '👷 Staf' : role === 'vendor' ? '🏪 Vendor' : '👤 Tenant'}
              </span>
            </div>
            <span className="text-sm font-black text-slate-900 block truncate">
              {userProfileName}
            </span>
          </div>

          {/* 🌟 DYNAMIC ROLE-BASED SIDEBAR NAVIGATION */}
          {role === 'owner' && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2">KosanKu Executive Hub</span>
                <nav className="space-y-1">
                  <button onClick={() => handleTabClick('financial')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'financial' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-chart-pie text-sm" /> <span>Laporan Laba Rugi</span>
                  </button>
                  <button onClick={() => handleTabClick('deposit')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'deposit' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-vault text-sm" /> <span>Deposit Escrow &amp; Late Fee</span>
                  </button>
                  <button onClick={() => handleTabClick('master_data')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'master_data' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-sliders text-sm" /> <span>Master Data &amp; Setting Kosan</span>
                  </button>
                  <button onClick={() => handleTabClick('inventory')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'inventory' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-boxes-packing text-sm" /> <span>Audit Stock Opname (SO)</span>
                  </button>
                  <button onClick={() => handleTabClick('autopilot')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'autopilot' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-wand-magic-sparkles text-sm text-amber-300" /> <span>Auto-Pilot AI Engine</span>
                  </button>
                  <button onClick={() => handleTabClick('tenant_requests')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'tenant_requests' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <div className="flex items-center gap-2.5"><i className="fa-solid fa-route text-sm" /> <span>Permintaan Tenant</span></div>
                    {pendingRequestsCount > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">{pendingRequestsCount}</span>}
                  </button>
                  <button onClick={() => handleTabClick('approval')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'approval' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <div className="flex items-center gap-2.5"><i className="fa-solid fa-signature text-sm" /> <span>Approval Dana</span></div>
                    {pendingApprovalsCount > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-extrabold">{pendingApprovalsCount}</span>}
                  </button>
                </nav>
              </div>

              <div className="pt-3 border-t border-[#e2e8f0]">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2 mb-1">Operasional &amp; Properti</span>
                <nav className="space-y-1">
                  <button onClick={() => handleTabClick('rooms_ai')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'rooms_ai' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-door-open text-sm" /> <span>Kamar &amp; Pricing AI</span>
                  </button>
                  <button onClick={() => handleTabClick('invoices')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'invoices' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-file-invoice-dollar text-sm" /> <span>Invoice &amp; Midtrans</span>
                  </button>
                  <button onClick={() => handleTabClick('complaints')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'complaints' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-headset text-sm" /> <span>Tiket Keluhan Tenant</span>
                  </button>
                </nav>
              </div>
            </div>
          )}

          {(role === 'superadmin' || role === 'admin') && (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider block px-2 flex items-center gap-1">
                  <i className="fa-solid fa-bolt text-amber-400" /> Super Admin Control Hub
                </span>
                <nav className="space-y-1">
                  <button onClick={() => handleTabClick('master_data')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'master_data' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-sliders text-sm text-amber-400" /> <span>Setting Master Data Kosan</span>
                  </button>
                  <button onClick={() => handleTabClick('overview')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'overview' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-gauge-high text-sm" /> <span>Overview System Control</span>
                  </button>
                  <button onClick={() => handleTabClick('financial')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'financial' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-chart-pie text-sm" /> <span>Laporan Laba Rugi (P&amp;L)</span>
                  </button>
                  <button onClick={() => handleTabClick('deposit')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'deposit' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-vault text-sm" /> <span>Deposit Escrow &amp; Fee</span>
                  </button>
                  <button onClick={() => handleTabClick('inventory')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'inventory' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-boxes-packing text-sm" /> <span>Audit Stock Opname (SO)</span>
                  </button>
                  <button onClick={() => handleTabClick('autopilot')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'autopilot' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-wand-magic-sparkles text-sm text-amber-300" /> <span>Auto-Pilot AI Engine</span>
                  </button>
                </nav>
              </div>

              <div className="pt-3 border-t border-[#e2e8f0]">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2 mb-1">Modul Properti &amp; Transaksi</span>
                <nav className="space-y-1">
                  <button onClick={() => handleTabClick('rooms_ai')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'rooms_ai' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-door-open text-sm" /> <span>Kamar &amp; Pricing AI</span>
                  </button>
                  <button onClick={() => handleTabClick('invoices')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'invoices' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <i className="fa-solid fa-file-invoice-dollar text-sm" /> <span>Invoice &amp; Midtrans QRIS</span>
                  </button>
                  <button onClick={() => handleTabClick('tenant_requests')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'tenant_requests' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <div className="flex items-center gap-2.5"><i className="fa-solid fa-route text-sm" /> <span>Permintaan Tenant</span></div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">{pendingRequestsCount}</span>
                  </button>
                  <button onClick={() => handleTabClick('approval')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'approval' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <div className="flex items-center gap-2.5"><i className="fa-solid fa-signature text-sm" /> <span>Approval Dana</span></div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-extrabold">{pendingApprovalsCount}</span>
                  </button>
                  <button onClick={() => handleTabClick('complaints')} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'complaints' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                    <div className="flex items-center gap-2.5"><i className="fa-solid fa-headset text-sm" /> <span>Pusat Keluhan System</span></div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">1</span>
                  </button>
                </nav>
              </div>
            </div>
          )}

          {role === 'employee' && (
            <div className="space-y-4 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2">Portal Karyawan Staf</span>
              <nav className="space-y-1">
                <button onClick={() => handleTabClick('tenant_requests')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'tenant_requests' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-list-check text-sm" /> <span>Tugas &amp; Plotting Owner</span>
                </button>
                <button onClick={() => handleTabClick('inventory')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'inventory' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-boxes-packing text-sm" /> <span>Audit Stock Opname (SO)</span>
                </button>
                <button onClick={() => handleTabClick('approval')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'approval' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-clipboard-check text-sm" /> <span>Checklist Kamar &amp; Cek-In</span>
                </button>
              </nav>
            </div>
          )}

          {role === 'vendor' && (
            <div className="space-y-4 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2">Portal Mitra Vendor</span>
              <nav className="space-y-1">
                <button onClick={() => handleTabClick('tenant_requests')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'tenant_requests' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-store text-sm" /> <span>Order Pesanan Masuk</span>
                </button>
                <button onClick={() => handleTabClick('inventory')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'inventory' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-[#fa-truck-fast] text-sm" /> <span>Status Pengantaran Kurir</span>
                </button>
                <button onClick={() => handleTabClick('invoices')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'invoices' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-receipt text-sm" /> <span>Add-On Billing Tenant</span>
                </button>
              </nav>
            </div>
          )}

          {role === 'tenant' && (
            <div className="space-y-4 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block px-2">Portal Penghuni Tenant</span>
              <nav className="space-y-1">
                <button onClick={() => handleTabClick('invoices')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'invoices' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-credit-card text-sm" /> <span>Tagihan &amp; QRIS Midtrans</span>
                </button>
                <button onClick={() => handleTabClick('rooms_ai')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'rooms_ai' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-[#fa-door-open] text-sm" /> <span>Kamar Saya &amp; Akses Kunci</span>
                </button>
                <button onClick={() => handleTabClick('tenant_requests')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'tenant_requests' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-[#fa-bottle-water] text-sm" /> <span>Add-On Galon/Laundry</span>
                </button>
                <button onClick={() => handleTabClick('complaints')} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold cursor-pointer transition-all ${activeTab === 'complaints' ? 'bg-[#047857] text-white shadow-xs' : 'text-slate-600 hover:bg-[#f1f5f9]'}`}>
                  <i className="fa-solid fa-headset text-sm" /> <span>Tiket Perbaikan Kamar</span>
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Bottom Profile & Pro Mode Controls */}
        <div className="space-y-3 pt-4 border-t border-[#e2e8f0] text-xs">
          {/* Pro Mode Toggle Switch */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <span className="font-bold text-slate-700 text-[11px]">Dynamic Live Graphs</span>
            <button
              onClick={() => setProMode(!proMode)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                proMode ? 'bg-[#047857] justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#047857] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userProfileName.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate text-xs">{userProfileName}</span>
                <span className="text-[10px] text-slate-500 block truncate">{userEmail}</span>
              </div>
            </div>
            <button onClick={onLogout} title="Logout" className="text-slate-400 hover:text-rose-600 cursor-pointer p-1">
              <i className="fa-solid fa-[#fa-arrow-right-from-bracket]" />
            </button>
          </div>
        </div>
      </aside>

      {/* ⚪ MAIN CONTENT AREA (Sequence.io Layout Engine) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">

        {/* 1. TOP HEADER BAR (Search + Branch Selector + Date Range + Export) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left Search Bar */}
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search kamar, tenant, transaksi, inventori..."
              className="w-full bg-white border border-[#e2e8f0] rounded-xl pl-9 pr-16 py-2 text-xs outline-none focus:border-[#047857] shadow-2xs font-medium text-slate-800"
            />
            <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 bg-[#f1f5f9] px-1.5 py-0.5 rounded border border-slate-200">⌘+F</span>
          </div>

          {/* Right Controls: Branch Selector + Date Range + Export */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Multi-Branch Selector Dropdown */}
            <div className="relative">
              <select
                value={activeBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                className="bg-white text-slate-900 font-bold py-2 px-3 pr-8 rounded-xl border border-[#e2e8f0] outline-none cursor-pointer hover:border-slate-400 transition-all text-xs appearance-none shadow-2xs"
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-3 text-[10px] text-slate-400 pointer-events-none" />
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#e2e8f0] rounded-xl text-slate-700 font-semibold shadow-2xs">
              <i className="fa-regular fa-calendar text-slate-400 text-xs" />
              <span>18 Oct 2026 - 18 Nov 2026</span>
              <span className="text-slate-400 px-1">|</span>
              <span className="font-bold text-slate-900">Last 30 days v</span>
            </div>

            {/* Export Button */}
            <button
              onClick={() => showToast('📥 Laporan Keuangan & Audit Fisik Berhasil Diekspor!')}
              className="px-3.5 py-2 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-800 font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-download text-xs text-[#047857]" />
              <span>Export Excel &amp; PDF</span>
            </button>
          </div>
        </header>

        {/* Conditional Layout: Overview Dashboard per Role if activeTab is overview, else render module view directly at top */}
        {(activeTab === 'financial' || activeTab === 'overview' || activeTab === 'tasks' || activeTab === 'orders' || activeTab === 'my_room') ? (
          <>
            {/* 2. DYNAMIC HERO CARD (Role-Scoped Content) */}
            <section className="bg-gradient-to-r from-[#047857] via-[#065f46] to-[#047857] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <span className="text-xs font-bold text-emerald-200 block uppercase tracking-wider">
                    {role === 'owner' && 'Total Balance (Aggregated Kosan Revenue)'}
                    {role === 'admin' && 'Tingkat Okupansi Properti (Admin Control Center)'}
                    {role === 'employee' && 'Portal Operasional Staf Lapangan & Audit SO'}
                    {role === 'vendor' && 'Saldo Payout Mitra Vendor Kosan (Siap Cair)'}
                    {role === 'tenant' && 'Portal Penghuni • Kamar A-101 (Budi Santoso)'}
                  </span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl sm:text-5xl font-black tracking-tight animate-pulse">
                      {role === 'owner' && `Rp ${(selectedBranch.revenue * 3.16).toLocaleString('id-ID')}`}
                      {role === 'admin' && '85.7% (24 / 28 Kamar Terisi)'}
                      {role === 'employee' && '3 Tugas Plotting Aktif Hari Ini'}
                      {role === 'vendor' && 'Rp 2.450.000 (3 Order Selesai)'}
                      {role === 'tenant' && 'Tagihan Sewa: Rp 1.624.500 (SETTLED)'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/40 text-xs font-black flex items-center gap-1">
                      {role === 'owner' && '15.8% ↗'}
                      {role === 'admin' && 'Okupansi Tinggi ⚡'}
                      {role === 'employee' && 'Bambang (Staf Maintenance)'}
                      {role === 'vendor' && 'Add-On Auto-Billed 💳'}
                      {role === 'tenant' && 'Lunas (Midtrans QRIS) ✅'}
                    </span>
                  </div>
                </div>

                {/* Right Hero Action Buttons (Role Specific) */}
                <div className="flex flex-wrap items-center gap-2">
                  {role === 'owner' && (
                    <>
                      <button onClick={() => showToast('➕ Modal Tambah Transaksi / Invoice Baru Ditampilkan')} className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <i className="fa-solid fa-plus" /> + Add Transaction
                      </button>
                      <button onClick={() => showToast('💸 Dispatched Payout to Owner Bank Account')} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/10">
                        <i className="fa-solid fa-arrow-up" /> Send Payout
                      </button>
                    </>
                  )}
                  {role === 'admin' && (
                    <>
                      <button onClick={() => showToast('➕ Modal Tambah Kamar Baru Ditampilkan')} className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <i className="fa-solid fa-plus" /> + Tambah Kamar
                      </button>
                      <button onClick={() => showToast('🧾 Penerbitan Invoice Midtrans Snap QRIS')} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/10">
                        <i className="fa-solid fa-receipt" /> Buat Invoice
                      </button>
                    </>
                  )}
                  {role === 'employee' && (
                    <>
                      <button onClick={() => showToast('📦 Form Audit Stock Opname (SO) Ditampilkan')} className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <i className="fa-solid fa-boxes-packing" /> Input Stock Opname (SO)
                      </button>
                      <button onClick={() => showToast('💸 Form Pengajuan Dana ke Owner Ditampilkan')} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/10">
                        <i className="fa-solid fa-file-signature" /> Ajukan Dana
                      </button>
                    </>
                  )}
                  {role === 'vendor' && (
                    <>
                      <button onClick={() => showToast('💳 Modal Add-On Billing Tenant Ditampilkan')} className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <i className="fa-solid fa-credit-card" /> + Tagih Add-On Tenant
                      </button>
                      <button onClick={() => showToast('💰 Permohonan Payout ke Bank Vendor Terkirim')} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/10">
                        <i className="fa-solid fa-[#fa-money-bill-transfer]" /> Request Payout
                      </button>
                    </>
                  )}
                  {role === 'tenant' && (
                    <>
                      <button onClick={() => showToast('💳 Membuka Payment Gateway QRIS Midtrans Snap...')} className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer">
                        <i className="fa-solid fa-qrcode" /> Bayar Sewa QRIS
                      </button>
                      <button onClick={() => showToast('🎧 Modal Buat Tiket Perbaikan Ditampilkan')} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/10">
                        <i className="fa-solid fa-headset" /> Lapor Keluhan AC/Air
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* 3. ROLE-SCOPED METRIC WIDGETS & CHARTS */}
            {(role === 'owner' || role === 'admin') && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                      <i className="fa-solid fa-arrow-up-right-dots text-[#047857]" />
                      <h3 className="text-sm font-black text-slate-900">Grafik Cash Flow Moving Realtime (Pendapatan vs Beban)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-[#f1f5f9] p-1 rounded-xl flex text-xs font-bold border border-slate-200">
                        <button className="px-3 py-1 bg-white text-slate-900 rounded-lg shadow-2xs">Weekly</button>
                        <button className="px-3 py-1 text-slate-500 hover:text-slate-900">Daily</button>
                      </div>
                      <button className="px-3 py-1.5 bg-white border border-[#e2e8f0] rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1">
                        <i className="fa-solid fa-sliders text-[10px]" /> Live Graph ⚡
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 border-b border-slate-200 pb-2 px-2">
                      {chartBars.map((bar, idx) => {
                        const incomeHeight = Math.max(18, Math.round((bar.in / 100) * 115));
                        const expenseHeight = Math.max(12, Math.round((bar.out / 100) * 65));

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer">
                            {/* Floating Value Badge on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute -top-8 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg pointer-events-none whitespace-nowrap z-10">
                              +Rp {(bar.in * 400000).toLocaleString('id-ID')}
                            </div>

                            <div className="flex items-end gap-1.5 w-full justify-center">
                              {/* Income Bar (Dark Emerald Teal) */}
                              <div
                                className="w-3.5 sm:w-6 bg-gradient-to-t from-[#047857] to-[#059669] rounded-t-md group-hover:brightness-125 transition-all duration-500 shadow-sm"
                                style={{ height: `${incomeHeight}px` }}
                                title={`Income (${bar.date}): Rp ${(bar.in * 400000).toLocaleString('id-ID')}`}
                              />
                              {/* Expense Bar (Mint Green) */}
                              <div
                                className="w-3.5 sm:w-6 bg-gradient-to-t from-[#10b981] to-[#34d399] rounded-t-md group-hover:brightness-125 transition-all duration-500 shadow-sm"
                                style={{ height: `${expenseHeight}px` }}
                                title={`Expense (${bar.date}): Rp ${(bar.out * 200000).toLocaleString('id-ID')}`}
                              />
                            </div>

                            <span className="text-[10px] font-bold text-slate-400 mt-2 block">{bar.date}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-xs bg-[#047857] animate-pulse" /> Total Income (Pemasukan Sewa &amp; Add-on)</span>
                      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-xs bg-[#10b981] animate-pulse" /> Total Expense (Pengeluaran Operasional)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between">
                  {/* Total Income Card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs flex items-center justify-between hover:border-[#047857]/50 transition-all">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#047857]" /> Total Income (Sewa Kos)
                      </span>
                      <span className="text-2xl font-black text-slate-900 block">Rp 34.500.000</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#047857] text-[10px] font-extrabold inline-block">45.0% ↗ Pemasukan Arus Kas</span>
                    </div>
                    {/* Inflow Icon Badge (Emerald Green with Down-Left Inflow Arrow) */}
                    <div className="w-12 h-12 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-xl shadow-md shrink-0" title="Cash Inflow (Uang Masuk)">
                      <i className="fa-solid fa-arrow-down-left" />
                    </div>
                  </div>

                  {/* Total Expense Card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs flex items-center justify-between hover:border-rose-300 transition-all">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> Total Expense (Operasional)
                      </span>
                      <span className="text-2xl font-black text-slate-900 block">Rp 8.900.000</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold inline-block">12.5% ↘ Pengeluaran Operasional</span>
                    </div>
                    {/* Outflow Icon Badge (Rose Red with Up-Right Outflow Arrow) */}
                    <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-xl shadow-md shrink-0" title="Cash Outflow (Uang Keluar)">
                      <i className="fa-solid fa-arrow-up-right" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 4. METRIC CARDS ROW (Owner: Business Accounts, Tenant: Key & Addons, Employee: SO Stats) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {role === 'owner' && (
                <>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-building-columns text-[#047857]" /> Rekening Operasional BCA</span>
                    <div className="text-2xl font-black text-slate-900">Rp 8.672.200</div>
                    <div className="text-[11px] font-bold text-emerald-600">16.0% ↗ <span className="text-slate-400 font-normal">vs Last Period</span></div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-piggy-bank text-[#047857]" /> Escrow Deposit Jaminan</span>
                    <div className="text-2xl font-black text-slate-900">Rp 3.765.350</div>
                    <div className="text-[11px] font-bold text-rose-600">8.2% ↘ <span className="text-slate-400 font-normal">vs Last Period</span></div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-receipt text-[#047857]" /> Cadangan Pajak &amp; Maint</span>
                    <div className="text-2xl font-black text-slate-900">Rp 14.376.160</div>
                    <div className="text-[11px] font-bold text-emerald-600">35.2% ↗ <span className="text-slate-400 font-normal">vs Last Period</span></div>
                  </div>
                </>
              )}

              {role === 'admin' && (
                <>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-door-open text-[#047857]" /> Total Kamar Terisi</span>
                    <div className="text-2xl font-black text-slate-900">24 / 28 Kamar</div>
                    <div className="text-[11px] font-bold text-emerald-600">85.7% Okupansi</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-file-invoice-dollar] text-[#047857]" /> Invoice Pending</span>
                    <div className="text-2xl font-black text-amber-600">2 Tagihan</div>
                    <div className="text-[11px] font-bold text-amber-600">Total Rp 3.774.500</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-headset] text-[#047857]" /> Keluhan Aktif</span>
                    <div className="text-2xl font-black text-rose-600">1 Tiket</div>
                    <div className="text-[11px] font-bold text-rose-600">Kamar A-101 (AC)</div>
                  </div>
                </>
              )}

              {role === 'employee' && (
                <>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-list-check] text-[#047857]" /> Tugas Plotting Owner</span>
                    <div className="text-2xl font-black text-slate-900">3 Tugas</div>
                    <div className="text-[11px] font-bold text-emerald-600">1 Selesai Hari Ini</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-boxes-packing] text-[#047857]" /> Status Audit SO</span>
                    <div className="text-2xl font-black text-emerald-600">Terverifikasi</div>
                    <div className="text-[11px] font-bold text-slate-400">Terakhir: Hari ini 09:30</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-id-badge] text-[#047857]" /> Petugas Piket</span>
                    <div className="text-2xl font-black text-slate-900">Bambang</div>
                    <div className="text-[11px] font-bold text-emerald-600">Shift Pagi • Standby</div>
                  </div>
                </>
              )}

              {role === 'vendor' && (
                <>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-store] text-[#047857]" /> Order Pesanan Hari Ini</span>
                    <div className="text-2xl font-black text-slate-900">3 Order</div>
                    <div className="text-[11px] font-bold text-amber-600">1 Baru • 1 Diproses</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-receipt] text-[#047857]" /> Add-On Billed Tenant</span>
                    <div className="text-2xl font-black text-purple-600">Rp 20.000</div>
                    <div className="text-[11px] font-bold text-purple-600">Laundry Exceed 2.5kg</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-money-bill-wave] text-[#047857]" /> Saldo Siap Cair</span>
                    <div className="text-2xl font-black text-emerald-600">Rp 2.450.000</div>
                    <div className="text-[11px] font-bold text-emerald-600">Transfer Mandiri **** 8821</div>
                  </div>
                </>
              )}

              {role === 'tenant' && (
                <>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-door-open] text-[#047857]" /> Kamar Tersewa</span>
                    <div className="text-2xl font-black text-[#047857]">Kamar A-101</div>
                    <div className="text-[11px] font-bold text-slate-400">Deluxe Studio Smart</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-key] text-[#047857]" /> Kode Akses Kunci Digital</span>
                    <div className="text-2xl font-mono font-black text-purple-600">#9920</div>
                    <div className="text-[11px] font-bold text-emerald-600">Aktif • Tap NFC / PIN</div>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs space-y-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><i className="fa-solid fa-[#fa-[#fa-shirt]] text-[#047857]" /> Sisa Kuota Laundry</span>
                    <div className="text-2xl font-black text-slate-900">2.5 Kg Sisa</div>
                    <div className="text-[11px] font-bold text-amber-600">Terpakai 7.5 Kg (Exceed 2.5kg)</div>
                  </div>
                </>
              )}
            </section>

            {/* Dynamic Children Content (Active Selected Tab Module) */}
            <section className="pt-4 border-t border-[#e2e8f0]">{children}</section>
          </>
        ) : (
          /* Render Active Selected Module Content Directly At Top */
          <section className="pt-2 animate-scale-in">{children}</section>
        )}
      </main>

      {/* 📱 MOBILE FLOATING DOCK BAR (Tailored Dynamically per Active User Role) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/20 text-white rounded-2xl p-2 shadow-2xl flex items-center justify-around text-[10px] font-bold">
        {role === 'owner' && (
          <>
            <button onClick={() => handleTabClick('financial')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'financial' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-chart-pie text-sm" /> <span>P&amp;L</span>
            </button>
            <button onClick={() => handleTabClick('deposit')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'deposit' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-vault text-sm" /> <span>Deposit</span>
            </button>
            <button onClick={() => handleTabClick('inventory')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'inventory' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-boxes-packing text-sm" /> <span>SO Audit</span>
            </button>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'tenant_requests' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-route text-sm" /> <span>Requests</span>
            </button>
          </>
        )}

        {role === 'admin' && (
          <>
            <button onClick={() => handleTabClick('overview')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'overview' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-gauge-high text-sm" /> <span>Overview</span>
            </button>
            <button onClick={() => handleTabClick('master_data')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'master_data' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-users text-sm" /> <span>Penyewa</span>
            </button>
            <button onClick={() => handleTabClick('rooms_ai')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'rooms_ai' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-door-open text-sm" /> <span>Kamar AI</span>
            </button>
            <button onClick={() => handleTabClick('complaints')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'complaints' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-headset text-sm" /> <span>Keluhan</span>
            </button>
          </>
        )}

        {role === 'employee' && (
          <>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'tenant_requests' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-list-check text-sm" /> <span>Tugas</span>
            </button>
            <button onClick={() => handleTabClick('inventory')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'inventory' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-boxes-packing text-sm" /> <span>Audit SO</span>
            </button>
            <button onClick={() => handleTabClick('approval')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'approval' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-clipboard-check text-sm" /> <span>Checkin</span>
            </button>
          </>
        )}

        {role === 'vendor' && (
          <>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'tenant_requests' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-store text-sm" /> <span>Orders</span>
            </button>
            <button onClick={() => handleTabClick('inventory')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'inventory' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-truck-fast text-sm" /> <span>Delivery</span>
            </button>
            <button onClick={() => handleTabClick('invoices')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'invoices' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-receipt text-sm" /> <span>Add-On</span>
            </button>
          </>
        )}

        {role === 'tenant' && (
          <>
            <button onClick={() => handleTabClick('invoices')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'invoices' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-credit-card text-sm" /> <span>Bayar QRIS</span>
            </button>
            <button onClick={() => handleTabClick('rooms_ai')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'rooms_ai' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-door-open text-sm" /> <span>Kamar Saya</span>
            </button>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'tenant_requests' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-bottle-water text-sm" /> <span>Add-On</span>
            </button>
            <button onClick={() => handleTabClick('complaints')} className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl cursor-pointer ${activeTab === 'complaints' ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`}>
              <i className="fa-solid fa-headset text-sm" /> <span>Keluhan</span>
            </button>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[999] px-5 py-3 rounded-2xl text-xs font-bold bg-[#047857] text-white shadow-2xl animate-scale-in flex items-center gap-2">
          <i className="fa-solid fa-circle-check" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
