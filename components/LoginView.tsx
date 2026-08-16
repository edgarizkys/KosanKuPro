'use client';

import { useState } from 'react';
import { useProperty } from '@/lib/PropertyContext';

interface LoginViewProps {
  onClose: () => void;
  onLogin: (user: { id: string; name: string; email: string; role: string; rooms?: any[] }) => void;
}

export default function LoginView({ onClose, onLogin }: LoginViewProps) {
  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';

  const [email, setEmail] = useState(isCustomOrNewKos ? '' : 'owner@kosanku.com');
  const [password, setPassword] = useState(isCustomOrNewKos ? '' : 'password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [ssoInputEmail, setSsoInputEmail] = useState('');
  const [ssoError, setSsoError] = useState<string | null>(null);

  const handleGoogleSsoSubmit = () => {
    if (!ssoInputEmail) return;
    setLoading(true);
    setSsoError(null);
    setTimeout(() => {
      const clean = ssoInputEmail.toLowerCase().trim();
      if (clean.includes('budi') || clean.includes('owner') || clean.includes('admin') || clean.includes('staf') || clean.includes('vendor')) {
        setShowSsoModal(false);
        onLogin({
          id: `usr_sso_${Date.now().toString().slice(-4)}`,
          name: clean.split('@')[0].toUpperCase() + ' (Google SSO)',
          email: clean,
          role: clean.includes('owner') ? 'owner' : clean.includes('admin') ? 'admin' : clean.includes('staf') ? 'employee' : clean.includes('vendor') ? 'vendor' : 'tenant',
        });
      } else {
        setSsoError('PENDING_APPROVAL');
      }
      setLoading(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        onLogin(json.data);
      } else {
        setError(json.error || 'Login gagal. Silakan periksa email dan password.');
      }
    } catch {
      setError('Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (eMail: string) => {
    setEmail(eMail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f5fa] dark:bg-[#0f0c1a] text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden animate-fade-in selection:bg-emerald-500 selection:text-white">
      
      {/* Background Decorative SaaS Subtle Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* SaaS Top Header Bar */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between z-10 py-2">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-10 rounded-2xl bg-[#120e20] p-1 flex items-center justify-center neu-card-sm shadow-md border border-amber-500/30 overflow-hidden">
            <img src="/images/kosanku_logo.svg" alt="KosanKu Pro Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-xl text-[#047857] tracking-tight block leading-none">
              {property.name}
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 block">
              {isCustomOrNewKos ? `Portal Resmi • ${property.city}` : 'Enterprise SaaS Portal v2.5'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-2xl neu-btn font-extrabold text-xs text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-xs" />
          <span>Kembali ke Beranda</span>
        </button>
      </header>

      {/* Main SaaS Portal Layout */}
      <main className="max-w-6xl w-full mx-auto my-auto z-10 py-6">
        {isCustomOrNewKos ? (
          /* ========================================================
             CLEAN LUXURY PORTAL FOR LIVE PROPERTY (NO DEMO SANDBOX MATRIX)
             ======================================================== */
          <div className="max-w-xl mx-auto w-full">
            <div className="neu-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/80 dark:border-white/10 space-y-6 animate-scale-in">
              {/* Header Info */}
              <div className="text-center space-y-2 pb-2 border-b border-slate-200/60 dark:border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#047857] via-emerald-600 to-teal-600 text-white flex items-center justify-center text-2xl font-black shadow-lg mx-auto mb-3">
                  <i className="fa-solid fa-shield-halved" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {property.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {property.address}
                </p>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{error}</span>
                </div>
              )}

              {/* Clean Official Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Email Akun Terdaftar
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full p-3.5 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-400 hover:text-emerald-600 cursor-pointer">
                      Lupa Password?
                    </span>
                  </div>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3.5 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#047857] via-emerald-600 to-teal-600 hover:opacity-95 text-white font-black rounded-2xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-right-to-bracket" />}
                  <span>Masuk ke Akun Saya</span>
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  <span className="bg-[#f2f5fa] dark:bg-[#0f0c1a] px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">atau</span>
                </div>

                {/* Google SSO Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSsoModal(true);
                    setSsoError(null);
                  }}
                  className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <i className="fa-brands fa-google text-rose-500 text-sm" />
                  <span>Masuk Cepat via Google SSO</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ========================================================
             DEMO SANDBOX MATRIX VIEW (HANYA MUNCUL DI DEFAULT DEMO)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Quick Role Test Matrix */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#047857]/10 text-[#047857] dark:text-emerald-400 font-extrabold text-xs">
                  <i className="fa-solid fa-users-viewfinder" />
                  <span>Multi-Account Sandbox Demo</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Pilih Akun Uji Coba untuk Simulasi <span className="text-[#047857]">Plotting &amp; Notifikasi</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Klik salah satu profil di bawah untuk langsung login dan memverifikasi alur tugas antara Owner, Staf, dan Vendor secara real-time.
                </p>
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Category 1: Manajemen (Owner & Admin) */}
              <div className="neu-card p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">👑</span>
                    Owner &amp; Manajemen
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Pusat Plotting</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Ibu Dewi Tri Oktariani', sub: 'Property Owner Utama', email: 'owner@kosanku.pro', role: 'owner', id: 'usr_owner_01' },
                    { label: 'Pak Admin (Siti)', sub: 'Admin Operasional', email: 'admin@kosanku.pro', role: 'admin', id: 'usr_admin_01' },
                    { label: 'Rina (Finance)', sub: 'Admin Keuangan', email: 'admin2@kosanku.pro', role: 'admin', id: 'usr_admin_02' },
                  ].map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => {
                        selectPreset(u.email);
                        onLogin({ id: u.id, name: u.label, email: u.email, role: u.role });
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group ${
                        email === u.email
                          ? 'bg-[#047857] text-white shadow-md'
                          : 'neu-btn text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs leading-tight">{u.label}</p>
                        <p className={`text-[10px] ${email === u.email ? 'text-emerald-100' : 'text-slate-400'}`}>{u.sub}</p>
                      </div>
                      <i className={`fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1 ${email === u.email ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 2: Staf Lapangan */}
              <div className="neu-card p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">👷</span>
                    Staf Lapangan
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Penerima Tugas</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Bambang Prasetyo', sub: 'Teknisi & Maintenance', email: 'staf@kosanku.pro', role: 'employee', id: 'usr_staf_01' },
                    { label: 'Rudi Hartono', sub: 'Kebersihan & Kurir', email: 'staf.kebersihan@kosanku.pro', role: 'employee', id: 'usr_staf_02' },
                  ].map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => {
                        selectPreset(u.email);
                        onLogin({ id: u.id, name: u.label, email: u.email, role: u.role });
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group ${
                        email === u.email
                          ? 'bg-[#047857] text-white shadow-md'
                          : 'neu-btn text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs leading-tight">{u.label}</p>
                        <p className={`text-[10px] ${email === u.email ? 'text-emerald-100' : 'text-slate-400'}`}>{u.sub}</p>
                      </div>
                      <i className={`fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1 ${email === u.email ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 3: Mitra Vendor */}
              <div className="neu-card p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs">🏪</span>
                    Mitra Vendor Suplai
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Order Delivery</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Depot Air & Gas Suci', sub: 'Refill Galon & Gas LPG', email: 'vendor.galon@kosanku.pro', role: 'vendor', id: 'USR-VND-01' },
                    { label: 'Laundry Express Clean', sub: 'Jasa Cuci Kiloan', email: 'vendor.laundry@kosanku.pro', role: 'vendor', id: 'USR-VND-02' },
                    { label: 'Subur Teknik', sub: 'Supplier Sparepart', email: 'vendor.teknik@kosanku.pro', role: 'vendor', id: 'USR-VND-03' },
                  ].map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => {
                        selectPreset(u.email);
                        onLogin({ id: u.id, name: u.label, email: u.email, role: u.role });
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group ${
                        email === u.email
                          ? 'bg-[#047857] text-white shadow-md'
                          : 'neu-btn text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs leading-tight">{u.label}</p>
                        <p className={`text-[10px] ${email === u.email ? 'text-emerald-100' : 'text-slate-400'}`}>{u.sub}</p>
                      </div>
                      <i className={`fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1 ${email === u.email ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 4: Tenant / Penghuni Multi-Account */}
              <div className="neu-card p-4 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">👤</span>
                    Penyewa Kosan (Tenant)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Multi Kamar</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Rian Pratama', sub: 'Kamar A-101 (Deluxe Studio)', email: 'tenant@kosanku.pro', role: 'tenant', id: 'usr_tenant_01' },
                    { label: 'Siti Rahma', sub: 'Kamar B-201 (Executive Balcony)', email: 'tenant2@kosanku.pro', role: 'tenant', id: 'usr_tenant_02' },
                    { label: 'Budi Santoso', sub: 'Kamar C-302 (Standard Cosy)', email: 'tenant3@kosanku.pro', role: 'tenant', id: 'usr_tenant_03' },
                  ].map((u) => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => {
                        selectPreset(u.email);
                        onLogin({ id: u.id, name: u.label, email: u.email, role: u.role });
                      }}
                      className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between group ${
                        email === u.email
                          ? 'bg-[#047857] text-white shadow-md'
                          : 'neu-btn text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs leading-tight">{u.label}</p>
                        <p className={`text-[10px] ${email === u.email ? 'text-emerald-100' : 'text-slate-400'}`}>{u.sub}</p>
                      </div>
                      <i className={`fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1 ${email === u.email ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Sleek Glassmorphic Login Form Card */}
          <div className="lg:col-span-5">
            <div className="neu-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/80 dark:border-white/10 space-y-5 animate-scale-in">
              
              {/* Card Header */}
              <div className="flex items-center gap-3.5 border-b border-slate-200/60 dark:border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#047857] via-emerald-600 to-teal-600 text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                  <i className="fa-solid fa-lock" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Masuk ke Dashboard
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Masukkan kredensial atau klik profil cepat di samping.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Email Akun
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kosanku.pro"
                    className="w-full p-3.5 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3.5 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#047857] via-emerald-600 to-teal-600 hover:opacity-95 text-white font-black rounded-2xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-right-to-bracket" />}
                  <span>Masuk ke Dashboard Sekarang</span>
                </button>

                <div className="relative flex items-center justify-center py-1">
                  <div className="border-t border-slate-200 dark:border-white/10 w-full" />
                  <span className="bg-transparent px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">atau</span>
                </div>

                {/* Google SSO Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSsoModal(true);
                    setSsoError(null);
                  }}
                  className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <i className="fa-brands fa-google text-rose-500 text-sm" />
                  <span>Masuk Cepat via Google SSO</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      </main>

      {/* Modern Custom Google SSO Modal (No Browser Prompt/Alert) */}
      {showSsoModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSsoModal(false)}
        >
          <div
            className="w-full max-w-md neu-card rounded-3xl p-6 sm:p-7 space-y-5 border border-white/20 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                  <i className="fa-brands fa-google text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Masuk Akun Google SSO
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    Autentikasi akun aman via Google OAuth
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSsoModal(false)}
                className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Quick Test Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Pilih Email Google Simulasi:
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setSsoInputEmail('rahmat.hidayat99@gmail.com')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    ssoInputEmail === 'rahmat.hidayat99@gmail.com'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      rahmat.hidayat99@gmail.com
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">Pendaftar Bebas (Belum Terverifikasi)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md text-[9px] font-black">
                    ⚠️ PENDING
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSsoInputEmail('budi@kosanku.pro')}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    ssoInputEmail === 'budi@kosanku.pro'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      budi@kosanku.pro
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">Penghuni Kamar A-101 (Terdaftar)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-[#047857] dark:text-emerald-400 rounded-md text-[9px] font-black">
                    ✓ ACTIVE
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">
                Atau Ketik Email Google Lain:
              </label>
              <div className="relative">
                <i className="fa-brands fa-google text-slate-400 absolute left-3.5 top-3.5 text-xs" />
                <input
                  type="email"
                  value={ssoInputEmail}
                  onChange={(e) => {
                    setSsoInputEmail(e.target.value);
                    setSsoError(null);
                  }}
                  placeholder="nama.anda@gmail.com"
                  className="w-full pl-9 pr-3 py-3 neu-input rounded-2xl text-xs font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            {/* Feedback Alert Banner */}
            {ssoError && (
              <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-300 text-xs space-y-1 animate-fade-in">
                <div className="flex items-center gap-2 font-black">
                  <i className="fa-solid fa-triangle-exclamation text-amber-500" />
                  <span>Status: PENDING APPROVAL</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed">
                  Email <span className="font-mono font-bold">{ssoInputEmail}</span> terdaftar via Google SSO, namun belum memiliki Link Undangan Kamar. Permintaan telah dikirim ke Dashboard Admin Kosan untuk diverifikasi.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowSsoModal(false)}
                className="px-4 py-2.5 neu-btn text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loading || !ssoInputEmail}
                onClick={handleGoogleSsoSubmit}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-brands fa-google" />}
                <span>Lanjutkan dengan Google</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SaaS Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center py-3 z-10 border-t border-slate-200/50 dark:border-white/5">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          &copy; 2026 KosanKu Pro Enterprise • Auto-Pilot Property &amp; Financial SaaS Platform
        </p>
      </footer>
    </div>
  );
}
