'use client';

import { useState } from 'react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (user: { id: string; name: string; email: string; role: string; rooms?: any[] }) => void;
}

export default function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('admin@kosanku.com');
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

  return (
    <div className="fixed inset-0 z-50 bg-orchid-dark/85 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl space-y-5 sm:space-y-6 border border-white/10 shadow-2xl relative animate-scale-in">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"><i className="fa-solid fa-xmark text-lg" /></button>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orchid-tint to-orchid-violet text-orchid-dark flex items-center justify-center text-xl mx-auto shadow-lg"><i className="fa-solid fa-lock" /></div>
          <h3 className="text-xl font-black text-white">Masuk ke KosanKu Pro</h3>
          <p className="text-xs text-slate-400">Role terdeteksi otomatis dari akun</p>
        </div>
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold text-center">
            <i className="fa-solid fa-circle-exclamation mr-1.5" />{error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => { setEmail('admin@kosanku.com'); setPassword('password123'); }} className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all">
            <span className="text-xs font-bold text-white block">👑 Admin</span>
            <span className="text-[10px] text-slate-500">admin@kosanku.com</span>
          </button>
          <button type="button" onClick={() => { setEmail('budi@kosanku.com'); setPassword('password123'); }} className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all">
            <span className="text-xs font-bold text-white block">👤 Tenant</span>
            <span className="text-[10px] text-slate-500">budi@kosanku.com</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-500"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-500"
          />
          <button type="submit" disabled={loading} className="w-full py-4 bg-white text-orchid-dark font-bold rounded-xl shadow-lg hover:shadow-white/20 hover:scale-[1.01] transition-all duration-300 ripple-effect disabled:opacity-50">
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2" /> : null}Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
