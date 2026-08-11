'use client';

import { useState } from 'react';

interface OwnerRegisterModalProps {
  onClose: () => void;
  onSuccessLogin: (userData: any) => void;
}

export default function OwnerRegisterModal({ onClose, onSuccessLogin }: OwnerRegisterModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bandung');
  const [totalRooms, setTotalRooms] = useState('10');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          propertyName,
          address,
          city,
          totalRooms,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        onSuccessLogin(json.data);
      } else {
        setError(json.error || 'Gagal mendaftarkan akun Owner');
      }
    } catch {
      setError('Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#f2f5fa] dark:bg-[#120e24] text-slate-900 dark:text-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-lg neu-card-sm">
              <i className="fa-solid fa-building-circle-check" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Daftarkan Kosan Baru (Owner)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Buat Workspace Kos Terisolasi Anda Dalam 1 Menit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-slate-700 dark:text-white transition-all"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-3">
            <i className="fa-solid fa-circle-exclamation text-base" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 ? (
            /* STEP 1: INFORMASI AKUN OWNER */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <span>Langkah 1 dari 2: Data Pemilik Kos</span>
                <span>50%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-500 h-full w-1/2 transition-all duration-300" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Nama Lengkap Owner</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hendra Wijaya, S.E."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Email Bisnis / Login</label>
                  <input
                    type="email"
                    required
                    placeholder="hendra@kosandago.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">No. WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (name && email && phone && password) setError(null), setStep(2);
                  else setError('Lengkapi data profil Owner terlebih dahulu.');
                }}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span>Lanjut: Data Properti Kos</span>
                <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          ) : (
            /* STEP 2: INFORMASI PROPERTI KOSAN */
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                <span>Langkah 2 dari 2: Spesifikasi Kosan</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-500 h-full w-full transition-all duration-300" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Nama Properti Kosan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Griya Dago Executive Residence"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Kota</label>
                  <input
                    type="text"
                    required
                    placeholder="Bandung"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Est. Total Kamar</label>
                  <input
                    type="number"
                    required
                    placeholder="12"
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Ir. H. Juanda No. 120, Dago, Bandung"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium resize-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-300 flex items-start gap-2">
                <i className="fa-solid fa-shield-halved text-base mt-0.5" />
                <span>Workspace Kosan Anda akan <strong>terisolasi 100% (Clean Slate)</strong>. Seluruh data demo master tidak akan muncul di dashboard Anda.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-4 rounded-2xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 font-bold text-sm transition-all"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin" />
                      <span>Membuat Workspace...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-rocket" />
                      <span>Buat Workspace Kosan Saya</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
