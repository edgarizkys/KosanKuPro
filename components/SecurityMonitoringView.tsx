'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/userProfiles';
import { INITIAL_SECURITY_LOGS, INITIAL_INVITE_TOKENS, type SecurityAuditLog, type RoomInviteToken } from '@/lib/securityAudit';

interface SecurityMonitoringViewProps {
  users: UserProfile[];
  onApproveUser: (user: UserProfile) => void;
  onRejectUser: (user: UserProfile) => void;
}

export default function SecurityMonitoringView({
  users,
  onApproveUser,
  onRejectUser,
}: SecurityMonitoringViewProps) {
  const [logs] = useState<SecurityAuditLog[]>(INITIAL_SECURITY_LOGS);
  const [inviteTokens, setInviteTokens] = useState<RoomInviteToken[]>(INITIAL_INVITE_TOKENS);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // New Invite Generator Form State
  const [newRoomNumber, setNewRoomNumber] = useState('A-103');
  const [newRoomType, setNewRoomType] = useState('VIP Studio King');
  const [newExpiryHours, setNewExpiryHours] = useState('48');

  // Filter pending users
  const pendingUsers = users.filter((u) => u.status === 'PENDING_APPROVAL');

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newTokenStr = `ksk_inv_${newRoomNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvite: RoomInviteToken = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      roomNumber: newRoomNumber,
      roomType: newRoomType,
      token: newTokenStr,
      inviteUrl: `https://kosanku.pro/join?room=${encodeURIComponent(newRoomNumber)}&token=${newTokenStr}`,
      expiresAt: `${newExpiryHours} Jam lagi`,
      isUsed: false,
      createdBy: 'Owner (Sistem Kosan)',
      createdAt: 'Baru saja',
    };

    setInviteTokens([newInvite, ...inviteTokens]);
  };

  const handleCopyLink = (tokenObj: RoomInviteToken) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(tokenObj.inviteUrl);
      setCopiedTokenId(tokenObj.id);
      setTimeout(() => setCopiedTokenId(null), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Top Banner Alert */}
      <div className="neu-card p-6 rounded-3xl border-l-4 border-amber-500 bg-amber-500/5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-inset text-amber-500 flex items-center justify-center text-xl shrink-0">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Pusat Pengawasan Keamanan &amp; Verifikasi Pendaftaran
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Mencegah orang asing (bukan penghuni kos) mendaftar dan masuk ke sistem KosanKuPro
              </p>
            </div>
          </div>
          <span className="hidden sm:flex px-3 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-black items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            {pendingUsers.length} Membutuhkan Persetujuan
          </span>
        </div>
      </div>

      {/* Grid: Pending Approval Queue & Room Invite Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7-COLS: Antrean Persetujuan (Pending Queue) */}
        <div className="lg:col-span-7 neu-card p-5 sm:p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-[#047857] text-[#047857] dark:text-emerald-400 fa-user-clock text-lg" />
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Antrean Pendaftaran Baru (Pending Approval)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 rounded-full text-[11px] font-black">
              {pendingUsers.length} User
            </span>
          </div>

          {pendingUsers.length === 0 ? (
            <div className="neu-inset p-8 rounded-2xl text-center space-y-2">
              <div className="text-3xl">✅</div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white">Tidak Ada Pendaftaran Tertunda</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Semua pendaftar dan pengguna Google SSO telah terverifikasi secara aman oleh Admin Kosan.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {pendingUsers.map((u) => (
                <div key={u.id} className="neu-inset p-4 rounded-2xl space-y-3 border border-amber-500/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0 font-bold">
                        {u.avatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                            {u.name}
                          </h4>
                          {u.verificationSource === 'GOOGLE_SSO_DIRECT' && (
                            <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-md text-[9px] font-black flex items-center gap-1">
                              <i className="fa-brands fa-google text-[10px]" /> Google SSO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                          {u.email} • {u.phone}
                        </p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                          Tujuan: <span className="text-[#047857] dark:text-emerald-400 font-black">{u.roomNumber || u.title}</span> ({u.registeredAt || 'Hari Ini'})
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg text-[9px] font-black uppercase shrink-0">
                      PENDING VERIFIKASI
                    </span>
                  </div>

                  <div className="p-2.5 neu-card-sm rounded-xl text-[11px] text-slate-600 dark:text-slate-300 italic flex items-center justify-between">
                    <span>&ldquo;{u.bio || 'Mendaftar secara mandiri tanpa Link Undangan Kamar.'}&rdquo;</span>
                  </div>

                  {/* Actions: Setujui vs Tolak */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => onRejectUser(u)}
                      className="px-3.5 py-2 neu-btn text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-xmark text-xs" />
                      <span>Tolak &amp; Blokir</span>
                    </button>

                    <button
                      onClick={() => onApproveUser(u)}
                      className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-check text-xs" />
                      <span>Setujui Sebagai Penghuni</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT 5-COLS: Generator Link Undangan Khusus (Invite Links) */}
        <div className="lg:col-span-5 neu-card p-5 sm:p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-qrcode text-[#047857] dark:text-emerald-400 text-lg" />
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Buat Link / QR Undangan Kamar
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">Terverifikasi Otomatis</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Penghuni yang mendaftar via Link / QR Undangan ini akan **langsung terverifikasi (ACTIVE)** ke kamar terkait tanpa antrean approval.
          </p>

          <form onSubmit={handleGenerateInvite} className="neu-inset p-4 rounded-2xl space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Kamar</label>
                <input
                  required
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full p-2.5 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                  placeholder="Misal: A-103"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Tipe Kamar</label>
                <input
                  required
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full p-2.5 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
                  placeholder="Misal: VIP Studio"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Masa Berlaku Link</label>
              <select
                value={newExpiryHours}
                onChange={(e) => setNewExpiryHours(e.target.value)}
                className="w-full p-2.5 neu-input rounded-xl outline-none text-slate-900 dark:text-white font-bold"
              >
                <option value="24">24 Jam (1 Hari)</option>
                <option value="48">48 Jam (2 Hari)</option>
                <option value="168">7 Hari (1 Minggu)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-wand-magic-sparkles" />
              <span>Generate Link Undangan Baru</span>
            </button>
          </form>

          {/* Active Tokens List */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
              Daftar Link Undangan Aktif:
            </span>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {inviteTokens.map((tok) => (
                <div key={tok.id} className="neu-card-sm p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 dark:text-white">Kamar {tok.roomNumber}</span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-black ${tok.isUsed ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-emerald-500/20 text-[#047857] dark:text-emerald-300'}`}>
                        {tok.isUsed ? 'Terpakai' : 'Aktif'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block truncate">{tok.inviteUrl}</span>
                  </div>

                  <button
                    onClick={() => handleCopyLink(tok)}
                    className="px-3 py-1.5 neu-btn text-xs font-bold rounded-xl shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <i className={`fa-solid ${copiedTokenId === tok.id ? 'fa-check text-emerald-500' : 'fa-copy text-slate-600 dark:text-slate-300'}`} />
                    <span>{copiedTokenId === tok.id ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FULL-WIDTH: Log Audit Keamanan Login & SSO */}
      <div className="neu-card p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <i className="fa-solid fa-list-check text-[#047857] dark:text-emerald-400 text-lg" />
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Log Real-Time Audit Keamanan Login &amp; SSO
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                Rekam jejak setiap aktivitas autentikasi Google SSO dan login password
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">{logs.length} Peristiwa Dicatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] uppercase font-black text-slate-400">
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Pengguna / Email</th>
                <th className="py-2.5 px-3">Metode Autentikasi</th>
                <th className="py-2.5 px-3">IP &amp; Perangkat</th>
                <th className="py-2.5 px-3 text-right">Status Keamanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
              {logs.map((lg) => (
                <tr key={lg.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{lg.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{lg.userName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{lg.email}</span>
                  </td>
                  <td className="py-3 px-3">
                    {lg.method === 'GOOGLE_SSO' && (
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                        <i className="fa-brands fa-google text-xs" /> Google SSO
                      </span>
                    )}
                    {lg.method === 'INVITE_LINK_REGISTRATION' && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-[#047857] dark:text-emerald-400 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                        <i className="fa-solid fa-qrcode text-xs" /> Link Undangan
                      </span>
                    )}
                    {lg.method === 'PASSWORD_LOGIN' && (
                      <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                        <i className="fa-solid fa-key text-xs" /> Password
                      </span>
                    )}
                    {lg.method === 'DIRECT_REGISTRATION' && (
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                        <i className="fa-solid fa-globe text-xs" /> Form Web
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block">{lg.ipAddress}</span>
                    <span className="text-[10px] text-slate-400">{lg.device}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {lg.status === 'SUCCESS' && (
                      <span className="px-2.5 py-1 bg-emerald-500/20 text-[#047857] dark:text-emerald-400 rounded-full text-[9px] font-black uppercase">
                        ✓ VERIFIED
                      </span>
                    )}
                    {lg.status === 'PENDING_APPROVAL' && (
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-black uppercase">
                        ⚠️ PENDING
                      </span>
                    )}
                    {lg.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full text-[9px] font-black uppercase">
                        ✕ DITOLAK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
