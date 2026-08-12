'use client';

import { useState, useEffect } from 'react';
import type { RoleType } from '@/app/page';
import { getStoredUserProfiles, saveStoredUserProfiles, type UserProfile } from '@/lib/userProfiles';
import UserProfileModal from './UserProfileModal';
import UserManagementView from './UserManagementView';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [proMode, setProMode] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  // Theme Sync on Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kosanku_theme');
      const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('kosanku_theme', 'dark');
      showToast('🌙 Mode Gelap (Dark Mode) Diaktifkan');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('kosanku_theme', 'light');
      showToast('☀️ Mode Terang (Light Mode) Diaktifkan');
    }
  };

  // User Profiles Persistent State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    setUsers(getStoredUserProfiles());
  }, []);

  const handleAddUser = (newUser: UserProfile) => {
    const updated = [newUser, ...users];
    setUsers(updated);
    saveStoredUserProfiles(updated);
    showToast(`✓ User ${newUser.name} (${newUser.role.toUpperCase()}) berhasil ditambahkan!`);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveStoredUserProfiles(updated);

    if (activeSessionUser && (activeSessionUser.id === updatedUser.id || activeSessionUser.email === updatedUser.email)) {
      const newSession = {
        ...activeSessionUser,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        avatar: updatedUser.avatar,
        avatarBg: updatedUser.avatarBg,
      };
      setActiveSessionUser(newSession);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kosanku_user_session', JSON.stringify(newSession));
      }
    }

    // Persist avatarUrl to database via API (fire and forget)
    if (updatedUser.email) {
      fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          avatarUrl: updatedUser.avatarUrl,
        }),
      }).catch((err) => console.warn('[handleUpdateUser] DB sync failed:', err));
    }

    showToast(`✓ Profil ${updatedUser.name} berhasil diperbarui!`);
  };


  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u.id === userId);
    if (userToDelete?.role === 'owner' && users.filter((u) => u.role === 'owner').length <= 1) {
      showToast('⚠️ Tidak dapat menghapus satu-satunya akun Owner!');
      return;
    }
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    saveStoredUserProfiles(updated);
    showToast('✓ Akun pengguna berhasil dihapus.');
  };

  // Find active user profile or fallback to session
  const [activeSessionUser, setActiveSessionUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kosanku_user_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setActiveSessionUser(parsed);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [role]);

  const DEFAULT_FALLBACK_USER: UserProfile = {
    id: 'USR-ACT-01',
    name: 'Bapak Hendra Gunawan',
    email: 'owner@kosanku.com',
    phone: '0811-9988-7766',
    role: role || 'owner',
    title: 'Pemilik Properti KosanKu',
    avatar: '👑',
    avatarBg: 'bg-amber-500',
    branchId: activeBranch || 'all',
    branchName: 'Konsolidasi Semua Cabang',
    status: 'ACTIVE',
    joinDate: '01 Jan 2024',
  };

  const currentUser: UserProfile =
    (activeSessionUser && activeSessionUser.role?.toLowerCase() === (role || 'owner')
      ? {
          id: activeSessionUser.id || 'USR-ACT-01',
          name: activeSessionUser.name || 'User KosanKu',
          email: activeSessionUser.email || '',
          phone: '0812-3456-7890',
          role: role || 'owner',
          title: activeSessionUser.role === 'SUPERADMIN' ? '👑 Super Admin SaaS' : activeSessionUser.role === 'ADMIN' ? '🛡️ Admin Operasional' : 'Pemilik Properti KosanKu',
          avatar: activeSessionUser.avatar || (activeSessionUser.role === 'SUPERADMIN' ? '👑' : activeSessionUser.role === 'ADMIN' ? '🛡️' : '👑'),
          avatarBg: activeSessionUser.avatarBg || (activeSessionUser.role === 'SUPERADMIN' ? 'bg-amber-500' : 'bg-emerald-600'),
          avatarUrl: activeSessionUser.avatarUrl,
          branchId: activeBranch || 'all',
          branchName: 'Konsolidasi Semua Cabang',
          status: 'ACTIVE',
          joinDate: '01 Jan 2024',
        }
      : null) ||
    users.find((u) => u.role === role) ||
    users[0] ||
    DEFAULT_FALLBACK_USER;

  const handleSwitchUserProfile = (targetUser: UserProfile) => {
    onSwitchRole(targetUser.role);
    if (targetUser.branchId && targetUser.branchId !== 'all') {
      onBranchChange(targetUser.branchId);
    }
    showToast(`🔄 Beralih ke profil: ${targetUser.name} (${targetUser.role.toUpperCase()})`);
  };

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

  // Read stored user property name if available
  const [propertyName, setPropertyName] = useState('KosanKu Pro');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kosanku_user_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.property && parsed.property.name) {
            setPropertyName(parsed.property.name);
          } else if (parsed.name && parsed.role === 'OWNER') {
            setPropertyName(`Kosan ${parsed.name.split(' ')[0]}`);
          }
        } catch (e) {
          // fallback
        }
      }
    }
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

  // Navigation sections generator based on user role
  const getNavSections = () => {
    if (role === 'owner') {
      return [
        {
          title: 'KosanKu Executive Hub',
          items: [
            { id: 'financial', label: 'Laporan P&L', icon: 'fa-solid fa-chart-pie' },
            { id: 'reports', label: 'Pusat Laporan & Ekspor', icon: 'fa-solid fa-file-invoice', highlight: true },
            { id: 'deposit', label: 'Escrow & Fee', icon: 'fa-solid fa-vault' },
            { id: 'users', label: 'Manajemen User', icon: 'fa-solid fa-users-gear' },
            { id: 'master_data', label: 'Master Setting', icon: 'fa-solid fa-sliders' },
            { id: 'inventory', label: 'Audit Stock (SO)', icon: 'fa-solid fa-boxes-packing' },
            { id: 'autopilot', label: 'Auto-Pilot AI', icon: 'fa-solid fa-wand-magic-sparkles' },
            { id: 'tenant_requests', label: 'Permintaan Tenant', icon: 'fa-solid fa-route', badge: pendingRequestsCount },
            { id: 'approval', label: 'Approval Dana', icon: 'fa-solid fa-signature', badge: pendingApprovalsCount, badgeColor: 'bg-amber-500 text-slate-900' },
          ],
        },
        {
          title: 'Operasional Properti',
          items: [
            { id: 'rooms_ai', label: 'Kamar & Pricing AI', icon: 'fa-solid fa-door-open' },
            { id: 'invoices', label: 'Invoice & Midtrans', icon: 'fa-solid fa-file-invoice-dollar' },
            { id: 'complaints', label: 'Tiket Keluhan', icon: 'fa-solid fa-headset' },
          ],
        },
      ];
    }

    if (role === 'superadmin' || role === 'admin') {
      return [
        {
          title: 'Super Admin Control Hub',
          items: [
            { id: 'users', label: 'Manajemen User', icon: 'fa-solid fa-users-gear', highlight: true },
            { id: 'master_data', label: 'Master Data Kosan', icon: 'fa-solid fa-sliders' },
            { id: 'overview', label: 'Overview Control', icon: 'fa-solid fa-gauge-high' },
            { id: 'financial', label: 'Laporan P&L', icon: 'fa-solid fa-chart-pie' },
            { id: 'deposit', label: 'Deposit Escrow', icon: 'fa-solid fa-vault' },
            { id: 'inventory', label: 'Audit Stock (SO)', icon: 'fa-solid fa-boxes-packing' },
            { id: 'autopilot', label: 'Auto-Pilot AI', icon: 'fa-solid fa-wand-magic-sparkles' },
          ],
        },
        {
          title: 'Modul Properti & Transaksi',
          items: [
            { id: 'rooms_ai', label: 'Kamar & Pricing AI', icon: 'fa-solid fa-door-open' },
            { id: 'invoices', label: 'Invoice QRIS', icon: 'fa-solid fa-file-invoice-dollar' },
            { id: 'tenant_requests', label: 'Permintaan Tenant', icon: 'fa-solid fa-route', badge: pendingRequestsCount },
            { id: 'approval', label: 'Approval Dana', icon: 'fa-solid fa-signature', badge: pendingApprovalsCount, badgeColor: 'bg-amber-500 text-slate-900' },
            { id: 'complaints', label: 'Pusat Keluhan', icon: 'fa-solid fa-headset', badge: 1 },
          ],
        },
      ];
    }

    if (role === 'employee') {
      return [
        {
          title: 'Portal Karyawan Staf',
          items: [
            { id: 'tenant_requests', label: 'Tugas & Plotting Owner', icon: 'fa-solid fa-list-check' },
            { id: 'inventory', label: 'Audit Stock Opname (SO)', icon: 'fa-solid fa-boxes-packing' },
            { id: 'approval', label: 'Checklist Kamar & Cek-In', icon: 'fa-solid fa-clipboard-check' },
          ],
        },
      ];
    }

    if (role === 'vendor') {
      return [
        {
          title: 'Portal Mitra Vendor',
          items: [
            { id: 'tenant_requests', label: 'Order Pesanan Masuk', icon: 'fa-solid fa-store' },
            { id: 'inventory', label: 'Status Pengantaran Kurir', icon: 'fa-solid fa-truck-fast' },
            { id: 'invoices', label: 'Add-On Billing Tenant', icon: 'fa-solid fa-receipt' },
          ],
        },
      ];
    }

    // Tenant
    return [
      {
        title: 'Portal Penghuni Tenant',
        items: [
          { id: 'invoices', label: 'Tagihan & QRIS Midtrans', icon: 'fa-solid fa-credit-card' },
          { id: 'rooms_ai', label: 'Kamar Saya & Akses Kunci', icon: 'fa-solid fa-door-open' },
          { id: 'tenant_requests', label: 'Add-On Galon/Laundry', icon: 'fa-solid fa-bottle-water' },
          { id: 'complaints', label: 'Tiket Perbaikan Kamar', icon: 'fa-solid fa-headset' },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <div className="min-h-screen bg-[#f8f7f4] dark:bg-[#0a0710] flex flex-col lg:flex-row font-sans overflow-x-hidden max-w-full">
      
      {/* 🟣 MOBILE TOP BAR NAVIGATION HEADER */}
      <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/10 sticky top-0 z-40 shadow-sm max-w-full overflow-hidden">
        {/* LEFT SIDE: [1. Garis 3 Menu] + [2. Foto Profil User Avatar (Tepat Disampingnya)] */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 1. Garis 3 Menu Button (Paling Kiri) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
            title="Buka Menu Sidebar"
          >
            <i className="fa-solid fa-bars text-sm" />
          </button>

          {/* 2. Foto User Avatar (Disamping Garis 3 Menu) */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center cursor-pointer active:scale-95 transition-all overflow-hidden border border-emerald-500/30"
            title="Buka Profil Akun"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span className="text-base">{currentUser?.avatar || '👤'}</span>
            )}
          </button>
        </div>

        {/* RIGHT SIDE: [1. Notification Bell] + [2. Dark/Light Mode Toggle] + [3. Logout Button] */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell Trigger */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle_notif_drawer'));
              }
            }}
            className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer active:scale-95 transition-all relative"
            title="Buka Panel Notifikasi"
          >
            <i className="fa-solid fa-bell text-sm" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-xs animate-pulse">
              3
            </span>
          </button>

          {/* Dark / White Mode Toggle */}
          <button
            onClick={handleToggleTheme}
            className="w-10 h-10 rounded-2xl neu-btn flex items-center justify-center text-amber-500 dark:text-amber-400 cursor-pointer text-sm active:scale-95 transition-all"
            title="Toggle Dark/Light Mode"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-2xl neu-btn text-rose-500 hover:text-rose-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all"
            title="Keluar dari Sesi"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-sm" />
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

      {/* 🟢 LEFT SIDEBAR (Desktop Minimize/Maximize + Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#f2f5fa] dark:bg-[#141122] border-r border-[#d1d9e6]/70 dark:border-white/10 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 shadow-[4px_0_20px_rgba(163,177,198,0.25)] dark:shadow-[4px_0_20px_rgba(0,0,0,0.6)]
        ${sidebarCollapsed ? 'lg:w-24 p-3' : 'lg:w-72 p-4'}
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl w-72 p-4' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-6">
          {/* 🍎 macOS Style Control Bar & User Profile Header Card */}
          <div className="neu-card-sm p-3.5 rounded-2xl space-y-3">
            {/* macOS Red/Yellow/Green Traffic Lights Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden w-7 h-7 rounded-full neu-btn flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Profile Row: [Foto Profil User] + [Nama & Title] + [Large Chevron Circle Button on Right] */}
            {!sidebarCollapsed ? (
              <div className="flex items-center justify-between gap-2 pt-1">
                <div 
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-3 overflow-hidden cursor-pointer group flex-1"
                  title="Klik untuk lihat rincian profil"
                >
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 shadow-md border border-emerald-500 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-full ${currentUser?.avatarBg || 'bg-amber-500'} text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                      {currentUser?.avatar || '👤'}
                    </div>
                  )}
                  <div className="truncate flex-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                      {currentUser?.title || role.toUpperCase()}
                    </span>
                    <span className="font-black text-sm text-slate-900 dark:text-white block truncate leading-tight group-hover:text-emerald-500 transition-colors">
                      {currentUser?.name || 'User KosanKu'}
                    </span>
                  </div>
                </div>

                {/* Large Chevron Circle Button (Right edge of profile card) */}
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="hidden lg:flex w-8 h-8 rounded-full neu-btn items-center justify-center text-slate-600 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0 border border-slate-300/50 dark:border-white/10"
                  title="Kecilkan Sidebar"
                >
                  <i className="fa-solid fa-chevron-left text-xs font-black" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 pt-1">
                <div 
                  onClick={() => setShowProfileModal(true)}
                  className="hover:scale-105 transition-transform cursor-pointer"
                  title={`${currentUser?.name} (${currentUser?.title})`}
                >
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover shadow-md border border-emerald-500"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${currentUser?.avatarBg || 'bg-amber-500'} text-white flex items-center justify-center font-bold text-base shadow-md`}>
                      {currentUser?.avatar || '👤'}
                    </div>
                  )}
                </div>

                {/* Large Chevron Circle Button (Expanded view trigger) */}
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="hidden lg:flex w-8 h-8 rounded-full neu-btn items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0 border border-emerald-500/40 bg-emerald-500/10"
                  title="Perluas Sidebar"
                >
                  <i className="fa-solid fa-chevron-right text-xs font-black" />
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Time-Based Greeting Card for All Roles */}
          {!sidebarCollapsed && (
            <div className="p-3.5 neu-card-sm rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#047857] dark:text-emerald-400 uppercase tracking-wider block">
                  {getDynamicGreeting()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#047857] text-white text-[9px] font-black uppercase shadow-xs">
                  {role === 'owner' ? '👑 Owner' : role === 'admin' ? '🛡️ Admin' : role === 'employee' ? '👷 Staf' : role === 'vendor' ? '🏪 Vendor' : '👤 Tenant'}
                </span>
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white block truncate">
                {currentUser.name}
              </span>
            </div>
          )}

          {/* 🌟 ACCENTUATED NEUMORPHIC SIDEBAR NAVIGATION (100% UNIFORM & HARMONIOUS) */}
          <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-none px-0.5">
            {navSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-2">
                {sec.title && !sidebarCollapsed && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block px-2 mb-1">
                    {sec.title}
                  </span>
                )}
                {sec.title && sidebarCollapsed && (
                  <div className="w-8 mx-auto border-t border-slate-300/60 dark:border-white/10 my-3" />
                )}

                <nav className={sidebarCollapsed ? 'space-y-3.5 flex flex-col items-center' : 'space-y-2'}>
                  {sec.items.map((item) => {
                    const isActive = activeTab === item.id;

                    if (sidebarCollapsed) {
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center relative cursor-pointer transition-all ${
                            isActive
                              ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 bg-emerald-500/10 font-black shadow-md scale-105'
                              : 'neu-btn text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                          title={item.label}
                        >
                          <i className={`${item.icon} text-sm ${isActive ? 'scale-110 text-[#047857] dark:text-emerald-400' : ''}`} />
                          {item.badge && item.badge > 0 ? (
                            <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center shadow-sm ${item.badgeColor || 'bg-rose-500 text-white animate-pulse'}`}>
                              {item.badge}
                            </span>
                          ) : null}
                        </button>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-extrabold text-xs cursor-pointer transition-all ${
                          isActive
                            ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 bg-emerald-500/10 font-black shadow-xs'
                            : 'neu-btn text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <i className={`${item.icon} text-sm ${isActive ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && item.badge > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 shadow-xs ${item.badgeColor || 'bg-rose-500 text-white animate-pulse'}`}>
                            {item.badge}
                          </span>
                        ) : (
                          isActive && (
                            <span className="w-2 h-2 rounded-full bg-[#047857] dark:bg-emerald-400 shadow-sm shrink-0" />
                          )
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Profile & Pro Mode Controls */}
        <div className="space-y-3 pt-3 border-t border-slate-200/60 dark:border-white/5 text-xs">
          {/* Pro Mode Toggle Switch */}
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between px-3 py-2 neu-inset rounded-2xl">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Live Graph Stream</span>
              <button
                onClick={() => setProMode(!proMode)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                  proMode ? 'bg-[#047857] justify-end shadow-inner' : 'neu-inset justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center" title="Toggle Live Graph">
              <button
                onClick={() => setProMode(!proMode)}
                className={`w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-xs cursor-pointer ${
                  proMode ? 'text-[#047857] dark:text-emerald-400 font-black' : 'text-slate-400'
                }`}
              >
                <i className="fa-solid fa-chart-simple" />
              </button>
            </div>
          )}

          {/* User Profile Card (Clickable to open full profile & switcher) */}
          {!sidebarCollapsed ? (
            <div 
              onClick={() => setShowProfileModal(true)}
              className="p-3 neu-card-sm rounded-2xl flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all"
              title="Buka Profil Akun & Beralih Pengguna"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-2xl object-cover shrink-0 border border-emerald-500 shadow-sm"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-2xl ${currentUser.avatarBg || 'bg-[#047857]'} text-white flex items-center justify-center font-bold text-xs shrink-0 neu-card-sm`}>
                    {currentUser.avatar}
                  </div>
                )}
                <div className="truncate">
                  <span className="font-black text-slate-900 dark:text-white block truncate text-xs">{currentUser.name}</span>
                  <span className="text-[10px] font-bold text-[#047857] dark:text-emerald-400 block truncate">{currentUser.title}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }} 
                title="Keluar dari Sesi" 
                className="w-8 h-8 rounded-xl neu-btn text-rose-500 hover:text-rose-700 flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                onClick={() => setShowProfileModal(true)}
                className="cursor-pointer hover:scale-105 transition-all" 
                title={`${currentUser.name} (${currentUser.title}) - Klik untuk buka profil`}
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-2xl object-cover border border-emerald-500 shadow-md"
                  />
                ) : (
                  <div className={`w-9 h-9 rounded-2xl ${currentUser.avatarBg || 'bg-[#047857]'} text-white flex items-center justify-center font-bold text-xs neu-card-sm`}>
                    {currentUser.avatar}
                  </div>
                )}
              </div>
              <button onClick={onLogout} title="Keluar dari Sesi" className="w-9 h-9 rounded-2xl neu-btn text-rose-500 hover:text-rose-700 flex items-center justify-center cursor-pointer">
                <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ⚪ MAIN CONTENT AREA (Sequence.io Layout Engine) */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden max-w-full min-w-0">

        {/* 1. TOP HEADER BAR (Search + Active User Profile Capsule + Branch Selector + Date Range + Export) */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Search Bar */}
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search kamar, tenant, transaksi, inventori..."
              className="w-full neu-input rounded-2xl pl-9 pr-16 py-2.5 text-xs outline-none focus:border-[#047857] font-medium text-slate-800 dark:text-slate-100"
            />
            <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 bg-[#e8ecf4] dark:bg-black/30 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-white/5">⌘+F</span>
          </div>

          {/* Right Controls: Desktop Only (Hidden on mobile to eliminate double header) */}
          <div className="hidden lg:flex flex-wrap items-center gap-2 text-xs">
            {/* Active User Profile Capsule Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 neu-btn rounded-2xl cursor-pointer hover:scale-[1.02] transition-all"
              title="Buka Profil Pengguna & Beralih Akun"
            >
              <div className={`w-7 h-7 rounded-xl ${currentUser.avatarBg || 'bg-[#047857]'} text-white flex items-center justify-center text-xs font-black shadow-xs`}>
                {currentUser.avatar}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">{currentUser.name}</span>
                <span className="text-[9px] text-[#047857] dark:text-emerald-400 font-bold block leading-none">{currentUser.title}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#047857] text-white text-[8px] font-black uppercase shadow-2xs">
                {currentUser.role}
              </span>
            </button>

            {/* Custom Neumorphic Multi-Branch Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black cursor-pointer transition-all ${
                  branchDropdownOpen
                    ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 bg-emerald-500/10'
                    : 'neu-btn text-slate-800 dark:text-white hover:text-[#047857]'
                }`}
                title="Pilih Cabang Properti Kosan"
              >
                <i className="fa-solid fa-building-user text-[#047857] dark:text-emerald-400" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{selectedBranch.name.split('(')[0].trim()}</span>
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${branchDropdownOpen ? 'rotate-180 text-[#047857]' : 'text-slate-400'}`} />
              </button>

              {/* Custom Neumorphic Floating Menu */}
              {branchDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBranchDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 neu-card rounded-3xl p-3 z-50 shadow-2xl border border-white/80 dark:border-white/10 space-y-2 animate-scale-in">
                    <div className="px-3 py-1 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">PILIH CABANG KOSAN</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">4 Cabang Aktif</span>
                    </div>

                    <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-none">
                      {BRANCHES.map((b) => {
                        const isSelected = activeBranch === b.id;
                        return (
                          <div
                            key={b.id}
                            onClick={() => {
                              onBranchChange(b.id);
                              setBranchDropdownOpen(false);
                              showToast(`🏢 Beralih ke: ${b.name}`);
                            }}
                            className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'neu-card-sm border-2 border-[#047857] bg-emerald-500/10 text-[#047857] dark:text-emerald-400 font-black'
                                : 'neu-btn text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                isSelected ? 'bg-[#047857] text-white shadow-xs' : 'neu-inset text-slate-500'
                              }`}>
                                <i className="fa-solid fa-location-dot" />
                              </div>
                              <div className="truncate text-left">
                                <span className="text-xs font-bold block truncate">{b.name}</span>
                                <span className="text-[10px] font-medium text-slate-400 block">{b.totalRooms} Kamar &bull; {b.occupancy}% Okupansi</span>
                              </div>
                            </div>
                            {isSelected && (
                              <i className="fa-solid fa-circle-check text-sm text-[#047857] dark:text-emerald-400 shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Dark/Light Mode Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-amber-500 dark:text-amber-400 hover:scale-105 transition-all cursor-pointer text-xs"
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`} />
            </button>

            {/* Executive Notification Bell Trigger */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('toggle_notif_drawer'));
                }
              }}
              className="w-9 h-9 rounded-xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all relative cursor-pointer text-xs"
              title="Buka Panel Rincian Notifikasi"
            >
              <i className="fa-solid fa-bell text-slate-600 dark:text-slate-300" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center shadow-xs animate-pulse">
                3
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => showToast('📥 Laporan Keuangan & Audit Fisik Berhasil Diekspor!')}
              className="px-3 py-2 neu-btn text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              title="Export Laporan Excel & PDF"
            >
              <i className="fa-solid fa-download text-xs text-[#047857] dark:text-emerald-400" />
              <span className="hidden xl:inline">Export</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="px-3 py-2 neu-btn text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all font-bold flex items-center gap-1.5 cursor-pointer"
              title="Keluar dari Akun"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Conditional Layout: Overview Dashboard per Role if activeTab is overview, else render module view directly at top */}
        {(activeTab === 'financial' || activeTab === 'overview' || activeTab === 'tasks' || activeTab === 'orders' || activeTab === 'my_room') ? (
          <>
            {/* 2. DYNAMIC HERO CARD (100% Signature Neumorphic Master Card) */}
            <section className="neu-card rounded-3xl p-6 sm:p-8 relative space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-wallet text-[#047857] dark:text-emerald-400" />
                  {role === 'owner' && 'TOTAL BALANCE (AGGREGATED KOSAN REVENUE)'}
                  {role === 'admin' && 'TINGKAT OKUPANSI PROPERTI (ADMIN CONTROL)'}
                  {role === 'employee' && 'PORTAL OPERASIONAL STAF LAPANGAN & AUDIT SO'}
                  {role === 'vendor' && 'SALDO PAYOUT MITRA VENDOR KOSAN'}
                  {role === 'tenant' && 'PORTAL PENGHUNI • KAMAR A-101 (BUDI SANTOSO)'}
                </span>
                <span className="px-3 py-1 neu-inset rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Moving Realtime</span>
                </span>
              </div>

              <div className="flex items-baseline gap-3.5 flex-wrap pt-1">
                <span className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  {role === 'owner' && `Rp ${(selectedBranch.revenue * 3.16).toLocaleString('id-ID')}`}
                  {role === 'admin' && '85.7% (24 / 28 Kamar)'}
                  {role === 'employee' && '3 Tugas Plotting Aktif'}
                  {role === 'vendor' && 'Rp 2.450.000'}
                  {role === 'tenant' && 'Rp 1.624.500'}
                </span>
                <span className="px-3 py-1.5 neu-inset rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5 shadow-inner">
                  <i className="fa-solid fa-arrow-trend-up" />
                  {role === 'owner' && '15.8% vs bulan lalu'}
                  {role === 'admin' && 'Okupansi Optimal ⚡'}
                  {role === 'employee' && 'Shift Pagi Standby'}
                  {role === 'vendor' && '3 Order Selesai 💳'}
                  {role === 'tenant' && 'Lunas (Midtrans QRIS) ✅'}
                </span>
              </div>

              {/* Sub-Metric Tactile Inset Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 neu-inset rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {role === 'owner' ? 'Pendapatan Bulan Berjalan' : role === 'admin' ? 'Total Kamar Tersewa' : 'Status Terverifikasi'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                    {role === 'owner' ? `Rp ${(selectedBranch.revenue).toLocaleString('id-ID')}` : role === 'admin' ? '24 Unit Kamar' : 'Semua Berjalan Normal'}
                  </span>
                </div>
                <div className="p-3.5 neu-inset rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {role === 'owner' ? 'Rata-Rata Okupansi' : role === 'admin' ? 'Kamar Tersedia' : 'Audit Fisik SO'}
                  </span>
                  <span className="text-sm font-black text-[#047857] dark:text-emerald-400 block">
                    {role === 'owner' ? `${selectedBranch.occupancy}% Okupansi` : role === 'admin' ? '4 Unit Kosong' : 'Sesuai Standar'}
                  </span>
                </div>
                <div className="p-3.5 neu-inset rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {role === 'owner' ? 'Arus Kas Masuk (Gross)' : role === 'admin' ? 'Pending Invoice' : 'Koneksi Gateway'}
                  </span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 block">
                    {role === 'owner' ? '+100% On-Track' : role === 'admin' ? '2 Tagihan Menunggu' : 'Midtrans Terhubung'}
                  </span>
                </div>
              </div>
            </section>

            {/* 3. ROLE-SCOPED METRIC WIDGETS & CHARTS (Soft Neumorphic Cards) */}
            {(role === 'owner' || role === 'admin') && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 neu-card rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                      <i className="fa-solid fa-arrow-up-right-dots text-[#047857] dark:text-emerald-400" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Grafik Arus Kas</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="neu-inset p-1 rounded-xl flex text-xs font-bold">
                        <button className="px-3 py-1 neu-btn text-slate-900 dark:text-white rounded-lg font-bold">Weekly</button>
                        <button className="px-3 py-1 text-slate-500 hover:text-slate-900 dark:hover:text-white">Daily</button>
                      </div>
                      <button className="px-3 py-1.5 neu-btn rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <i className="fa-solid fa-sliders text-[10px]" /> Live Graph ⚡
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 pt-6 border-b border-slate-200/60 dark:border-white/5 pb-2 px-2">
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

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
                      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-xs bg-[#047857] animate-pulse" /> Total Income (Pemasukan Sewa &amp; Add-on)</span>
                      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-xs bg-[#10b981] animate-pulse" /> Total Expense (Pengeluaran Operasional)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 justify-between">
                  {/* Total Income Card */}
                  <div className="neu-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all hover:scale-[1.01]">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-[#047857] shrink-0" /> Total Income
                      </span>
                      <span className="text-base sm:text-2xl font-black text-slate-900 dark:text-white block truncate">Rp 34.5jt</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-[#047857] dark:text-emerald-300 text-[9px] sm:text-[10px] font-extrabold inline-block border border-emerald-300/60 dark:border-emerald-500/30 truncate max-w-full">45.0% ↗ Pemasukan</span>
                    </div>
                    {/* Inflow Icon Badge */}
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#047857] text-white flex items-center justify-center text-sm sm:text-xl shadow-md shrink-0 self-end sm:self-center" title="Cash Inflow (Uang Masuk)">
                      <i className="fa-solid fa-arrow-down-left" />
                    </div>
                  </div>

                  {/* Total Expense Card */}
                  <div className="neu-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all hover:scale-[1.01]">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" /> Total Expense
                      </span>
                      <span className="text-base sm:text-2xl font-black text-slate-900 dark:text-white block truncate">Rp 8.9jt</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[9px] sm:text-[10px] font-extrabold inline-block border border-rose-300/60 dark:border-rose-500/30 truncate max-w-full">12.5% ↘ Operasional</span>
                    </div>
                    {/* Outflow Icon Badge */}
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-rose-500 text-white flex items-center justify-center text-sm sm:text-xl shadow-md shrink-0 self-end sm:self-center" title="Cash Outflow (Uang Keluar)">
                      <i className="fa-solid fa-arrow-up-right" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 4. METRIC CARDS ROW (Soft Raised Neumorphic Cards - 2 Cols on Mobile) */}
            <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {role === 'owner' && (
                <>
                  <div className="neu-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-1.5 sm:space-y-3">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate"><i className="fa-solid fa-building-columns text-[#047857] dark:text-emerald-400 shrink-0" /> Rekening BCA</span>
                    <div className="text-sm sm:text-2xl font-black text-slate-900 dark:text-white truncate">Rp 8.672.200</div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">16.0% ↗ <span className="text-slate-400 font-normal">vs Last</span></div>
                  </div>
                  <div className="neu-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-1.5 sm:space-y-3">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate"><i className="fa-solid fa-piggy-bank text-[#047857] dark:text-emerald-400 shrink-0" /> Escrow Deposit</span>
                    <div className="text-sm sm:text-2xl font-black text-slate-900 dark:text-white truncate">Rp 3.765.350</div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-rose-600 dark:text-rose-400 truncate">8.2% ↘ <span className="text-slate-400 font-normal">vs Last</span></div>
                  </div>
                  <div className="neu-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 space-y-1.5 sm:space-y-3 col-span-2 sm:col-span-1">
                    <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate"><i className="fa-solid fa-receipt text-[#047857] dark:text-emerald-400 shrink-0" /> Cadangan Pajak &amp; Maint</span>
                    <div className="text-sm sm:text-2xl font-black text-slate-900 dark:text-white truncate">Rp 14.376.160</div>
                    <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">35.2% ↗ <span className="text-slate-400 font-normal">vs Last</span></div>
                  </div>
                </>
              )}

              {role === 'admin' && (
                <>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-door-open text-[#047857] dark:text-emerald-400" /> Total Kamar Terisi</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">24 / 28 Kamar</div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">85.7% Okupansi</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-file-invoice-dollar text-[#047857] dark:text-emerald-400" /> Invoice Pending</span>
                    <div className="text-2xl font-black text-amber-600 dark:text-amber-400">2 Tagihan</div>
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Total Rp 3.774.500</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-headset text-[#047857] dark:text-emerald-400" /> Keluhan Aktif</span>
                    <div className="text-2xl font-black text-rose-600 dark:text-rose-400">1 Tiket</div>
                    <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Kamar A-101 (AC)</div>
                  </div>
                </>
              )}

              {role === 'employee' && (
                <>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-list-check text-[#047857] dark:text-emerald-400" /> Tugas Plotting Owner</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">3 Tugas</div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">1 Selesai Hari Ini</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-boxes-packing text-[#047857] dark:text-emerald-400" /> Status Audit SO</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Terverifikasi</div>
                    <div className="text-[11px] font-bold text-slate-400">Terakhir: Hari ini 09:30</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-id-badge text-[#047857] dark:text-emerald-400" /> Petugas Piket</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">Bambang</div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Shift Pagi • Standby</div>
                  </div>
                </>
              )}

              {role === 'vendor' && (
                <>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-store text-[#047857] dark:text-emerald-400" /> Order Pesanan Hari Ini</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">3 Order</div>
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">1 Baru • 1 Diproses</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-receipt text-[#047857] dark:text-emerald-400" /> Add-On Billed Tenant</span>
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400">Rp 20.000</div>
                    <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400">Laundry Exceed 2.5kg</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-money-bill-wave text-[#047857] dark:text-emerald-400" /> Saldo Siap Cair</span>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">Rp 2.450.000</div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Transfer Mandiri **** 8821</div>
                  </div>
                </>
              )}

              {role === 'tenant' && (
                <>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-door-open text-[#047857] dark:text-emerald-400" /> Kamar Tersewa</span>
                    <div className="text-2xl font-black text-[#047857] dark:text-emerald-400">Kamar A-101</div>
                    <div className="text-[11px] font-bold text-slate-400">Deluxe Studio Smart</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-key text-[#047857] dark:text-emerald-400" /> Kode Akses Kunci Digital</span>
                    <div className="text-2xl font-mono font-black text-purple-600 dark:text-purple-400">#9920</div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Aktif • Tap NFC / PIN</div>
                  </div>
                  <div className="neu-card rounded-3xl p-6 space-y-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2"><i className="fa-solid fa-shirt text-[#047857] dark:text-emerald-400" /> Sisa Kuota Laundry</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">2.5 Kg Sisa</div>
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Terpakai 7.5 Kg (Exceed 2.5kg)</div>
                  </div>
                </>
              )}
            </section>

            {/* Dynamic Children Content (Active Selected Tab Module) */}
            <section className="pt-2">
              {children}
            </section>
          </>
        ) : (
          /* Render Active Selected Module Content Directly At Top */
          <section className="pt-2">
            {activeTab === 'users' ? (
              <UserManagementView
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onSwitchUser={handleSwitchUserProfile}
              />
            ) : (
              children
            )}
          </section>
        )}
      </main>

      {/* 📱 MOBILE FLOATING DOCK BAR (100% Signature Neumorphic Card Dock) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 neu-card rounded-3xl p-2 shadow-2xl flex items-center justify-around text-[10px] font-bold border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-100">
        {role === 'owner' && (
          <>
            <button onClick={() => handleTabClick('financial')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'financial' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-chart-pie text-xs" /> <span>P&amp;L</span>
            </button>
            <button onClick={() => handleTabClick('deposit')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'deposit' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-vault text-xs" /> <span>Deposit</span>
            </button>
            <button onClick={() => handleTabClick('users')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'users' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-users-gear text-xs" /> <span>Users</span>
            </button>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'tenant_requests' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-route text-xs" /> <span>Requests</span>
            </button>
          </>
        )}

        {role === 'admin' && (
          <>
            <button onClick={() => handleTabClick('overview')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'overview' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-gauge-high text-xs" /> <span>Overview</span>
            </button>
            <button onClick={() => handleTabClick('users')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'users' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-users-gear text-xs" /> <span>Users</span>
            </button>
            <button onClick={() => handleTabClick('rooms_ai')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'rooms_ai' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-door-open text-xs" /> <span>Kamar AI</span>
            </button>
            <button onClick={() => handleTabClick('complaints')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'complaints' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-headset text-xs" /> <span>Keluhan</span>
            </button>
          </>
        )}

        {role === 'employee' && (
          <>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'tenant_requests' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-list-check text-xs" /> <span>Tugas</span>
            </button>
            <button onClick={() => handleTabClick('inventory')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'inventory' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-boxes-packing text-xs" /> <span>Audit SO</span>
            </button>
            <button onClick={() => handleTabClick('approval')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'approval' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-clipboard-check text-xs" /> <span>Checkin</span>
            </button>
          </>
        )}

        {role === 'vendor' && (
          <>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'tenant_requests' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-store text-xs" /> <span>Orders</span>
            </button>
            <button onClick={() => handleTabClick('inventory')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'inventory' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-truck-fast text-xs" /> <span>Delivery</span>
            </button>
            <button onClick={() => handleTabClick('invoices')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'invoices' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-receipt text-xs" /> <span>Add-On</span>
            </button>
          </>
        )}

        {role === 'tenant' && (
          <>
            <button onClick={() => handleTabClick('invoices')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'invoices' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-credit-card text-xs" /> <span>Bayar QRIS</span>
            </button>
            <button onClick={() => handleTabClick('rooms_ai')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'rooms_ai' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-door-open text-xs" /> <span>Kamar Saya</span>
            </button>
            <button onClick={() => handleTabClick('tenant_requests')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'tenant_requests' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-bottle-water text-xs" /> <span>Add-On</span>
            </button>
            <button onClick={() => handleTabClick('complaints')} className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${activeTab === 'complaints' ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black bg-emerald-500/10 shadow-xs scale-105' : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
              <i className="fa-solid fa-headset text-xs" /> <span>Keluhan</span>
            </button>
          </>
        )}
      </div>

      {/* User Profile & Switcher Modal */}
      <UserProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUserProfile}
        onUpdateUser={handleUpdateUser}
      />

      {/* Toast Notification (Bottom Right - Fixed 2 Lines Container) */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[9999] max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-xs font-bold neu-card text-emerald-900 dark:text-emerald-200 border border-emerald-500/40 shadow-2xl animate-scale-in flex items-start gap-2.5">
          <i className="fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400 text-sm shrink-0 mt-0.5" />
          <span
            className="leading-snug flex-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {toast}
          </span>
        </div>
      )}
    </div>
  );
}
