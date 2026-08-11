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

      {/* Main SaaS Card Container */}
      <main className="max-w-4xl w-full mx-auto my-auto z-10 py-8">
        <div className="neu-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/80 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center animate-scale-in">
          
          {/* Left Hero & Info Column */}
          <div className="md:col-span-5 space-y-6 md:border-r border-slate-200/60 dark:border-white/10 md:pr-8">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#047857] dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-block">
                🔒 Enterprise Authentication
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Selamat Datang Kembali di Portal SaaS
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Kelola ekosistem kosan berbasis Auto-Pilot AI, pembukuan P&L multi-cabang, escrow deposit, dan integrasi WhatsApp otomatis.
              </p>
            </div>

            {/* Platform Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 neu-card-sm rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 neu-inset">
                  👑
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Multi-Role Executive Hub</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Akses khusus Owner, Admin, Staf Staf, Vendor, & Tenant</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 neu-card-sm rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 neu-inset">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">Midtrans QRIS &amp; Escalation AI</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Pembayaran otomatis real-time &amp; late fee escrow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form & Presets Column */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-user-lock text-[#047857] dark:text-emerald-400" />
                Pilih Akun Demo Multi-Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Klik salah satu role di bawah untuk mengisi kredensial secara otomatis:
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-sm" />
                <span>{error}</span>
              </div>
            )}

            {/* 5 Quick Preset Accounts Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => selectPreset('owner@kosanku.pro')}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === 'owner@kosanku.pro'
                    ? 'neu-inset border-2 border-emerald-500 bg-emerald-500/10'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  👑 Owner Kosan
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">owner@kosanku.pro</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Executive &amp; P&L</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset('admin@kosanku.pro')}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === 'admin@kosanku.pro'
                    ? 'neu-inset border-2 border-purple-500 bg-purple-500/10'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  🛡️ Super Admin
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">admin@kosanku.pro</span>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold block mt-0.5">Full System Control</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset('staf@kosanku.pro')}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === 'staf@kosanku.pro'
                    ? 'neu-inset border-2 border-blue-500 bg-blue-500/10'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  🪪 Staf / Karyawan
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">staf@kosanku.pro</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">Tugas &amp; Maintenance</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset('vendor@kosanku.pro')}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === 'vendor@kosanku.pro'
                    ? 'neu-inset border-2 border-emerald-500 bg-emerald-500/10'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  🏪 Vendor Mitra
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">vendor@kosanku.pro</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">Order Laundry/Gas</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset('tenant@kosanku.pro')}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer col-span-2 ${
                  email === 'tenant@kosanku.pro'
                    ? 'neu-inset border-2 border-emerald-500 bg-emerald-500/10'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  👤 Tenant (Penghuni Kos)
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">tenant@kosanku.pro</span>
              </button>
            </div>

            {/* Direct Form Submission */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Email Terdaftar</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3.5 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
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
                  className="w-full p-3.5 neu-input rounded-2xl text-slate-900 dark:text-white outline-none focus:border-[#047857] transition-colors font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-2xl shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer text-xs flex items-center justify-center gap-2"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-right-to-bracket" />}
                <span>Masuk ke Dashboard Pro</span>
              </button>

              <div className="pt-2 text-center border-t border-slate-200 dark:border-white/10 mt-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
                  Pemilik Kos Baru? Berminat Menggunakan KosanKu Pro?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if ((window as any).__openOwnerRegister) {
                      (window as any).__openOwnerRegister();
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-2xl shadow-lg hover:scale-[1.01] transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-handshake" />
                  <span>Minta Penawaran &amp; Setting Kosan Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* SaaS Footer */}
      <footer className="max-w-7xl w-full mx-auto text-center py-3 z-10 border-t border-slate-200/50 dark:border-white/5">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          &copy; 2026 KosanKu Pro Enterprise • Auto-Pilot Property &amp; Financial SaaS Platform
        </p>
      </footer>
    </div>
  );
}
