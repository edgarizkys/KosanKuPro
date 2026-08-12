'use client';

import { useState } from 'react';

interface LoginViewProps {
  onClose: () => void;
  onLogin: (user: { id: string; name: string; email: string; role: string; rooms?: any[] }) => void;
}

export default function LoginView({ onClose, onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('owner@kosanku.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [ssoInputEmail, setSsoInputEmail] = useState('rahmat.hidayat99@gmail.com');
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
        setError(json.error || 'Login gagal');
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
          <div className="w-10 h-10 rounded-2xl bg-[#047857] flex items-center justify-center text-white font-black text-base neu-card-sm shadow-md">
            <i className="fa-solid fa-cubes-stacked" />
          </div>
          <div>
            <span className="font-black text-xl text-[#047857] tracking-tight block leading-none">
              KosanKu<span className="text-slate-900 dark:text-white">Pro</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 block">
              Enterprise SaaS Portal v2.5
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

      {/* Main SaaS Card Container (Compact Centered Card) */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-4">
        <div className="neu-card rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80 dark:border-white/10 space-y-5 animate-scale-in">
          
          {/* Header & Title */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-xl font-black mx-auto neu-card-sm shadow-md mb-2">
              <i className="fa-solid fa-cubes-stacked" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Portal SaaS KosanKuPro
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              Autentikasi Akun Multi-Role &amp; Google SSO
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Role Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 block tracking-wider text-center">
              Pilih Role Akses Demo:
            </label>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[
                { label: '👑 Owner', email: 'owner@kosanku.pro', role: 'owner', id: 'usr_owner_01', name: 'Bapak Hendra (Owner)' },
                { label: '🛡️ Admin', email: 'admin@kosanku.pro', role: 'admin', id: 'usr_admin_01', name: 'Pak Admin Operasional' },
                { label: '👷 Staf', email: 'staf@kosanku.pro', role: 'employee', id: 'usr_staf_01', name: 'Bambang (Staf)' },
                { label: '🏪 Vendor', email: 'vendor@kosanku.pro', role: 'vendor', id: 'usr_vendor_01', name: 'Depot Suci (Vendor)' },
                { label: '👤 Tenant', email: 'tenant@kosanku.pro', role: 'tenant', id: 'usr_tenant_01', name: 'Rian Pratama' },
              ].map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => {
                    selectPreset(item.email);
                    onLogin({ id: item.id, name: item.name, email: item.email, role: item.role });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                    email === item.email
                      ? 'bg-[#047857] text-white shadow-xs scale-105'
                      : 'neu-btn text-slate-700 dark:text-slate-200 hover:text-emerald-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Email Terdaftar</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-3 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Password Access</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-3 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-2xl shadow-md hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-right-to-bracket" />}
              <span>Masuk ke Dashboard Pro</span>
            </button>

            {/* Google SSO Login Button */}
            <button
              type="button"
              onClick={() => {
                setShowSsoModal(true);
                setSsoError(null);
              }}
              className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              <i className="fa-brands fa-google text-rose-500 text-sm" />
              <span>Masuk dengan Google (Google SSO)</span>
            </button>
          </form>
        </div>
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
