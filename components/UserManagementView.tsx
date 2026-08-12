'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/userProfiles';
import type { RoleType } from '@/app/page';
import SecurityMonitoringView from './SecurityMonitoringView';

interface UserManagementViewProps {
  users?: UserProfile[];
  onAddUser?: (u: UserProfile) => void;
  onUpdateUser?: (u: UserProfile) => void;
  onDeleteUser?: (id: string) => void;
  onSwitchUser?: (u: UserProfile) => void;
}

export default function UserManagementView({
  users = [],
  onAddUser = () => {},
  onUpdateUser = () => {},
  onDeleteUser = () => {},
  onSwitchUser,
}: UserManagementViewProps) {
  const [subTab, setSubTab] = useState<'users' | 'security'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states for new user
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<RoleType>('employee');
  const [formTitle, setFormTitle] = useState('');
  const [formBranchId, setFormBranchId] = useState('jkt');
  const [formDepartment, setFormDepartment] = useState('');
  const [formRoomNumber, setFormRoomNumber] = useState('');
  const [formAvatar, setFormAvatar] = useState('👷');
  const [formBio, setFormBio] = useState('');

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

  const getAvatarBg = (role: RoleType) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-500';
      case 'admin':
      case 'superadmin':
        return 'bg-emerald-600';
      case 'employee':
        return 'bg-blue-600';
      case 'vendor':
        return 'bg-teal-600';
      case 'tenant':
        return 'bg-purple-600';
      default:
        return 'bg-slate-700';
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.title.toLowerCase().includes(q) ||
      u.branchName.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const branchNameMap: Record<string, string> = {
      all: 'Konsolidasi Semua Cabang',
      jkt: 'KosanKu Pro - Jakarta Selatan (Utama)',
      bdg: 'KosanKu Pro - Dago Bandung',
      sby: 'KosanKu Pro - Gubeng Surabaya',
    };

    const newUser: UserProfile = {
      id: `USR-${formRole.toUpperCase().slice(0, 3)}-0${users.length + 1}`,
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      title: formTitle || `${formRole.toUpperCase()} Kosan`,
      avatar: formAvatar,
      avatarBg: getAvatarBg(formRole),
      branchId: formBranchId,
      branchName: branchNameMap[formBranchId] || 'KosanKu Pro Residence',
      department: formDepartment,
      roomNumber: formRoomNumber,
      status: 'ACTIVE',
      joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
      bio: formBio,
    };

    onAddUser(newUser);
    setShowAddModal(false);
    // Reset
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTitle('');
    setFormDepartment('');
    setFormRoomNumber('');
    setFormBio('');
  };

  const handleApproveUser = (target: UserProfile) => {
    const updated: UserProfile = {
      ...target,
      status: 'ACTIVE',
      title: target.title.includes('Mendaftar') ? 'Penghuni Kos Terverifikasi' : target.title,
    };
    onUpdateUser(updated);
  };

  const handleRejectUser = (target: UserProfile) => {
    const updated: UserProfile = {
      ...target,
      status: 'REJECTED',
    };
    onUpdateUser(updated);
  };

  const pendingCount = users.filter((u) => u.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Module Action Header & Sub-Tab Switcher */}
      <div className="neu-card p-5 sm:p-7 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
            Manajemen Akun &amp; Keamanan Akses
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
            Pengelolaan profil pengguna, otorisasi role, dan monitoring persetujuan Google SSO
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sub-tab switcher */}
          <div className="neu-inset p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setSubTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                subTab === 'users' ? 'neu-card text-[#047857] dark:text-emerald-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-users text-xs" />
              <span>Daftar User &amp; Role</span>
            </button>

            <button
              onClick={() => setSubTab('security')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 relative ${
                subTab === 'security' ? 'neu-card text-amber-500 dark:text-amber-400 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <i className="fa-solid fa-shield-halved text-xs text-amber-500" />
              <span>Monitoring &amp; Approval</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {subTab === 'users' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-user-plus text-xs" />
              <span>+ Tambah User</span>
            </button>
          )}
        </div>
      </div>

      {subTab === 'security' ? (
        <SecurityMonitoringView
          users={users}
          onApproveUser={handleApproveUser}
          onRejectUser={handleRejectUser}
        />
      ) : (
        <>

      {/* Role Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: '👑 Owner', count: users.filter((u) => u.role === 'owner').length, role: 'owner' },
          { label: '🛡️ Admin', count: users.filter((u) => u.role === 'admin' || u.role === 'superadmin').length, role: 'admin' },
          { label: '👷 Karyawan', count: users.filter((u) => u.role === 'employee').length, role: 'employee' },
          { label: '🏪 Vendor', count: users.filter((u) => u.role === 'vendor').length, role: 'vendor' },
          { label: '👤 Tenant', count: users.filter((u) => u.role === 'tenant').length, role: 'tenant' },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setRoleFilter(roleFilter === stat.role ? 'all' : stat.role)}
            className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
              roleFilter === stat.role ? 'neu-inset ring-2 ring-[#047857]' : 'neu-card-sm'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">{stat.label}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white block mt-0.5">{stat.count} Akun</span>
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="neu-card p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pengguna, email, WhatsApp, jabatan..."
            className="w-full neu-input rounded-2xl pl-9 pr-4 py-2.5 text-xs outline-none font-medium text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Role Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {[
            { key: 'all', label: 'Semua Role' },
            { key: 'owner', label: '👑 Owner' },
            { key: 'admin', label: '🛡️ Admin' },
            { key: 'employee', label: '👷 Karyawan' },
            { key: 'vendor', label: '🏪 Vendor' },
            { key: 'tenant', label: '👤 Tenant' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                roleFilter === f.key
                  ? 'neu-inset text-[#047857] dark:text-emerald-400'
                  : 'neu-btn text-slate-600 dark:text-slate-400'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredUsers.map((u) => (
          <div key={u.id} className="neu-card p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between transition-all hover:scale-[1.01]">
            <div className="space-y-3">
              {/* Top Avatar & Badges */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className={`w-13 h-13 rounded-2xl ${u.avatarBg || 'bg-[#047857]'} text-white flex items-center justify-center text-2xl shadow-md neu-card-sm shrink-0`}>
                    {u.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                      {u.name}
                    </h4>
                    <p className="text-[11px] font-bold text-[#047857] dark:text-emerald-400 mt-0.5">
                      {u.title}
                    </p>
                    <span className="text-[9px] font-mono text-slate-400 block">{u.id}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase shadow-xs shrink-0 ${getRoleBadge(u.role)}`}>
                  {u.role}
                </span>
              </div>

              {/* Information Rows */}
              <div className="neu-inset p-3 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Email:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{u.email}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{u.phone}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold">Cabang:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">{u.branchName}</span>
                </div>
                {(u.department || u.roomNumber) && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">{u.roomNumber ? 'Kamar:' : 'Departemen:'}</span>
                    <span className="font-bold text-[#047857] dark:text-emerald-400 truncate max-w-[170px]">{u.roomNumber || u.department}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/50 dark:border-white/5">
              {onSwitchUser && (
                <button
                  onClick={() => onSwitchUser(u)}
                  className="px-3 py-1.5 neu-btn text-[10px] font-black text-[#047857] dark:text-emerald-400 rounded-xl cursor-pointer flex items-center gap-1.5"
                  title="Login Langsung Sebagai Akun Ini"
                >
                  <i className="fa-solid fa-right-to-bracket text-xs" />
                  <span>Login Akun</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                <button
                  onClick={() => onDeleteUser(u.id)}
                  className="w-8 h-8 rounded-xl neu-btn text-rose-500 hover:text-rose-700 flex items-center justify-center cursor-pointer"
                  title="Hapus Akun Pengguna"
                >
                  <i className="fa-solid fa-trash text-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="neu-card p-12 rounded-3xl text-center space-y-2">
          <i className="fa-solid fa-user-slash text-slate-400 text-3xl" />
          <h4 className="text-sm font-black text-slate-900 dark:text-white">Tidak ada pengguna yang cocok</h4>
          <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter role di atas.</p>
        </div>
      )}

      {/* MODAL + TAMBAH USER BARU */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/5 dark:bg-black/20 backdrop-blur-xs animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div className="w-full max-w-xl neu-card rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-black/5 dark:border-white/10 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-black">
                  <i className="fa-solid fa-user-plus" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Tambah Profil &amp; Akun Pengguna Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    Pilih role hak akses, data personal, dan cabang operasional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-2xl neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap *</label>
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="cth: Ahmad Fauzi"
                    className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Role Akun &amp; Akses *</label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const r = e.target.value as RoleType;
                      setFormRole(r);
                      if (r === 'owner') setFormAvatar('👑');
                      else if (r === 'admin') setFormAvatar('🛡️');
                      else if (r === 'employee') setFormAvatar('👷');
                      else if (r === 'vendor') setFormAvatar('🏪');
                      else setFormAvatar('👤');
                    }}
                    className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="owner">👑 Owner (Pemilik / Investor)</option>
                    <option value="admin">🛡️ Admin (Super Admin Properti)</option>
                    <option value="employee">👷 Employee (Staf Lapangan / Teknisi)</option>
                    <option value="vendor">🏪 Vendor (Mitra Galon/Gas/Laundry)</option>
                    <option value="tenant">👤 Tenant (Penghuni Kamar Kos)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Login *</label>
                  <input
                    required
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cth: user@kosanku.com"
                    className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">No. WhatsApp / HP *</label>
                  <input
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="cth: 0812-3456-7890"
                    className="w-full p-3 neu-input rounded-xl outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Jabatan / Spesialisasi *</label>
                  <input
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="cth: Teknisi Listrik & AC / Investor 20%"
                    className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Penugasan Cabang *</label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="w-full p-3 neu-input rounded-xl outline-none font-bold text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="all">Konsolidasi Semua Cabang</option>
                    <option value="jkt">KosanKu Pro - Jakarta Selatan</option>
                    <option value="bdg">KosanKu Pro - Dago Bandung</option>
                    <option value="sby">KosanKu Pro - Gubeng Surabaya</option>
                  </select>
                </div>

                {formRole === 'tenant' ? (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Kamar Sewa</label>
                    <input
                      value={formRoomNumber}
                      onChange={(e) => setFormRoomNumber(e.target.value)}
                      placeholder="cth: Kamar A-102"
                      className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Departemen / Divisi</label>
                    <input
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      placeholder="cth: Operasional / Teknik"
                      className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Pilih Avatar Icon</label>
                  <div className="flex items-center gap-2">
                    {['👑', '🛡️', '👷', '👩‍💼', '🏪', '👤', '💼', '🧑‍💻'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormAvatar(emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base cursor-pointer transition-all ${
                          formAvatar === emoji ? 'neu-inset scale-110' : 'neu-btn'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bio / Catatan Pengguna</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Catatan tanggung jawab kerja atau informasi tambahan..."
                  className="w-full p-3 neu-input rounded-xl outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 neu-btn text-slate-600 dark:text-slate-300 font-bold rounded-2xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-extrabold rounded-2xl shadow-md cursor-pointer"
                >
                  + Tambah User Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
