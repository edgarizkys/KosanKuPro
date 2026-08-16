'use client';

import { useState } from 'react';
import { useProperty } from '@/lib/PropertyContext';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (user: { id: string; name: string; email: string; role: string; rooms?: any[] }) => void;
}

export default function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('owner@kosanku.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

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

  const { property } = useProperty();
  const isCustomOrNewKos = property.slug !== 'default';
  const isRshs = property.slug === 'rshs';

  const selectPreset = (eMail: string) => {
    setEmail(eMail);
    setPassword('password123');
  };

  const currentPresets = isRshs
    ? {
        owner: { email: 'owner.rshs@kosanku.pro', label: '👑 Owner RSHS', roleDesc: 'Plotting & Dividen dr. Dewi' },
        admin: { email: 'admin.rshs@kosanku.pro', label: '🛡️ Admin RSHS', roleDesc: 'Control Center Pasteur' },
        staff: { email: 'staf.rshs@kosanku.pro', label: '🪪 Staf Maintenance', roleDesc: 'Teknisi Medico Suite' },
        vendor: { email: 'vendor.rshs@kosanku.pro', label: '🏪 Vendor Mitra', roleDesc: 'Depot Suci & Laundry Pasteur' },
        tenant: { email: 'koas.rshs@kosanku.pro', label: '👤 Penghuni (dr. Rizky)', roleDesc: 'Tenant Kamar MED-101' },
      }
    : {
        owner: { email: 'owner@kosanku.com', label: '👑 Owner', roleDesc: 'Plotting & Approval' },
        admin: { email: 'admin@kosanku.com', label: '🛡️ Admin', roleDesc: 'Control Center' },
        staff: { email: 'staf@kosanku.com', label: '🪪 Karyawan', roleDesc: 'Tugas & Plotting' },
        vendor: { email: 'vendor@kosanku.com', label: '🏪 Vendor Mitra', roleDesc: 'Laundry & Galon/Gas' },
        tenant: { email: 'budi@kosanku.com', label: '👤 Tenant (Penghuni Kos)', roleDesc: 'Tenant Kamar A-101' },
      };

  return (
    <div className="fixed inset-0 z-[999] bg-black/5 dark:bg-black/20 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="neu-card max-w-lg w-full p-6 sm:p-8 rounded-3xl space-y-5 shadow-2xl relative animate-scale-in text-slate-900 dark:text-white border border-white/80 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
          <i className="fa-solid fa-xmark text-sm" />
        </button>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl neu-inset text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mx-auto shadow-xs">
            <i className="fa-solid fa-lock" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Login {property.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRshs ? 'Portal Kosan RSHS Pasteur Bandung' : 'Pilih akun role di bawah atau masukkan kredensial Anda'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
            <i className="fa-solid fa-circle-exclamation mr-1.5" />{error}
          </div>
        )}

        {/* Quick Preset Accounts — ONLY visible in Default Demo */}
        {!isCustomOrNewKos && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Pilih Akun Demo Multi-Role:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                type="button"
                onClick={() => selectPreset(currentPresets.owner.email)}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === currentPresets.owner.email
                    ? 'neu-inset border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  {currentPresets.owner.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono truncate">{currentPresets.owner.email}</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">{currentPresets.owner.roleDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset(currentPresets.admin.email)}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === currentPresets.admin.email
                    ? 'neu-inset border-purple-400/40 bg-purple-50/50 dark:bg-purple-950/20'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  {currentPresets.admin.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono truncate">{currentPresets.admin.email}</span>
                <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold block mt-0.5">{currentPresets.admin.roleDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset(currentPresets.staff.email)}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === currentPresets.staff.email
                    ? 'neu-inset border-blue-400/40 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  {currentPresets.staff.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono truncate">{currentPresets.staff.email}</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold block mt-0.5">{currentPresets.staff.roleDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset(currentPresets.vendor.email)}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  email === currentPresets.vendor.email
                    ? 'neu-inset border-emerald-400/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  {currentPresets.vendor.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono truncate">{currentPresets.vendor.email}</span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">{currentPresets.vendor.roleDesc}</span>
              </button>

              <button
                type="button"
                onClick={() => selectPreset(currentPresets.tenant.email)}
                className={`p-3 rounded-2xl transition-all text-left cursor-pointer col-span-2 ${
                  email === currentPresets.tenant.email
                    ? 'neu-inset border-purple-400/40 bg-purple-50/50 dark:bg-purple-950/20'
                    : 'neu-card-sm hover:scale-[1.02]'
                }`}
              >
                <span className="text-xs font-black text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                  {currentPresets.tenant.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{currentPresets.tenant.email}</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs pt-1">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Email Terdaftar</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3.5 neu-input rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-3.5 neu-input rounded-xl text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 cursor-pointer text-xs"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2" /> : <i className="fa-solid fa-right-to-bracket mr-2" />}
            Masuk ke Portal Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
