'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/userProfiles';
import type { RoleType } from '@/app/page';

/**
 * Compress image to max 400x400px and 80% JPEG quality.
 * Returns a smaller base64 data URL suitable for DB storage.
 */
async function compressImage(file: File, maxSize = 400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = Math.round((h * maxSize) / w); w = maxSize; }
          else { w = Math.round((w * maxSize) / h); h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface UserProfileModalProps {
  open: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (u: UserProfile) => void;
  onUpdateUser: (u: UserProfile) => void;
}

export default function UserProfileModal({
  open,
  onClose,
  currentUser,
  allUsers,
  onSwitchUser,
  onUpdateUser,
}: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>(currentUser);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      // If there's an avatarUrl from file upload (base64), check size
      if (editForm.avatarUrl && editForm.avatarUrl.startsWith('data:') && editForm.avatarUrl.length > 800_000) {
        setSaveError('⚠️ Foto terlalu besar (>600KB). Pilih foto yang lebih kecil atau gunakan link URL foto.');
        setIsSaving(false);
        return;
      }
      onUpdateUser(editForm);
      setIsEditing(false);
    } catch (err) {
      setSaveError('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-500 text-slate-900';
      case 'admin':
      case 'superadmin':
        return 'bg-emerald-600 text-white';
      case 'employee':
        return 'bg-blue-600 text-white';
      case 'vendor':
        return 'bg-teal-600 text-white';
      case 'tenant':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/5 dark:bg-black/20 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-xl neu-card rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-black/5 dark:border-white/10 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-black">
              <i className="fa-solid fa-id-card-clip" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Profil Akun Pengguna
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                Detail identitas, hak akses role, dan beralih profil sesi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {!isEditing ? (
          <>
            {/* Active User Card Banner */}
            <div className="neu-inset p-5 sm:p-6 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-16 h-16 rounded-3xl object-cover shadow-md shrink-0 border-2 border-emerald-500"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-3xl ${currentUser.avatarBg || 'bg-[#047857]'} text-white flex items-center justify-center text-3xl shadow-md neu-card-sm shrink-0`}>
                      {currentUser.avatar}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {currentUser.name}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase shadow-xs ${getRoleBadge(currentUser.role)}`}>
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#047857] dark:text-emerald-400 mt-0.5">
                      {currentUser.title}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                      ID: {currentUser.id} • Bergabung {currentUser.joinDate}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditForm(currentUser);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 neu-btn text-xs font-extrabold text-slate-700 dark:text-slate-200 rounded-2xl cursor-pointer flex items-center gap-2 self-start sm:self-center"
                >
                  <i className="fa-solid fa-pen-to-square text-xs text-[#047857]" />
                  <span>Edit Profil</span>
                </button>
              </div>

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/50 dark:border-white/5 text-xs">
                <div className="neu-card-sm p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Email Login</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white block truncate">{currentUser.email}</span>
                </div>
                <div className="neu-card-sm p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">No. WhatsApp / HP</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white block">{currentUser.phone}</span>
                </div>
                <div className="neu-card-sm p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Penugasan Cabang</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{currentUser.branchName}</span>
                </div>
                <div className="neu-card-sm p-3 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Departemen / Kamar</span>
                  <span className="font-bold text-slate-900 dark:text-white block">{currentUser.department || currentUser.roomNumber || 'Pusat Kontrol'}</span>
                </div>
              </div>

              {currentUser.bio && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                  &ldquo;{currentUser.bio}&rdquo;
                </div>
              )}
            </div>

            {/* Quick Account Switcher Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <i className="fa-solid fa-users text-[#047857]" /> Beralih ke Akun / Role Lain:
                </span>
                <span className="text-[10px] text-slate-500 font-bold">{allUsers.length} Profil Terdaftar</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'neu-inset ring-2 ring-[#047857]'
                          : 'neu-card-sm hover:scale-[1.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-9 h-9 rounded-2xl ${u.avatarBg || 'bg-[#047857]'} text-white flex items-center justify-center text-base shrink-0 shadow-xs`}>
                          {u.avatar}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-black text-slate-900 dark:text-white block truncate">{u.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">{u.title}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0 ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap *</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. WhatsApp / HP *</label>
                <input
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jabatan / Judul *</label>
                <input
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Departemen / Unit</label>
                <input
                  value={editForm.department || ''}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Avatar Preset Emoji</label>
                <div className="flex flex-wrap items-center gap-2">
                  {['👑', '🛡️', '👷', '👩‍💼', '🏪', '👤', '💼', '🧑‍💻'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, avatar: emoji })}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all ${
                        editForm.avatar === emoji ? 'neu-inset scale-110 ring-2 ring-emerald-500' : 'neu-btn'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Photo Upload Section */}
            <div className="neu-inset p-4 rounded-2xl space-y-3">
              <label className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <i className="fa-solid fa-camera text-emerald-500" />
                Upload Foto Profil Asli (File / URL Image)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative group shrink-0">
                  {editForm.avatarUrl ? (
                    <img
                      src={editForm.avatarUrl}
                      alt="Profile"
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-full ${editForm.avatarBg || 'bg-amber-500'} text-white flex items-center justify-center text-2xl font-bold shadow-md`}>
                      {editForm.avatar}
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  {/* File Upload Button Input */}
                  <label className="w-full p-2.5 neu-btn rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center justify-center gap-2 hover:text-emerald-500 transition-colors">
                    <i className="fa-solid fa-upload text-emerald-500" />
                    <span>Pilih Foto dari Galeri HP / Komputer</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSaveError(null);
                          try {
                            const compressed = await compressImage(file, 400, 0.82);
                            setEditForm({ ...editForm, avatarUrl: compressed });
                          } catch {
                            // Fallback to direct FileReader if canvas fails
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm({ ...editForm, avatarUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>

                  {/* Direct Image URL input */}
                  <input
                    type="url"
                    placeholder="Atau tempel Link URL Foto (Contoh: https://...)"
                    value={editForm.avatarUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    className="w-full p-2.5 neu-input rounded-xl outline-none font-mono text-[11px] text-slate-900 dark:text-white"
                  />
                </div>

                {editForm.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, avatarUrl: '' })}
                    className="px-3 py-2 neu-btn text-rose-500 hover:text-rose-700 text-xs font-bold rounded-xl shrink-0"
                    title="Hapus Foto Kustom"
                  >
                    <i className="fa-solid fa-trash" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bio / Catatan Pengguna</label>
              <textarea
                rows={2}
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white resize-none"
              />
            </div>

            {saveError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => { setIsEditing(false); setSaveError(null); }}
                className="px-4 py-2.5 neu-btn text-slate-600 dark:text-slate-300 font-bold rounded-2xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#047857] hover:bg-[#065f46] disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {isSaving ? <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
