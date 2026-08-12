'use client';

import { useState } from 'react';

export interface LeadProspect {
  id: string;
  name: string;
  phone: string;
  propertyName: string;
  city: string;
  totalRooms: number;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_PROSPECTS: LeadProspect[] = [
  {
    id: 'LEAD-001',
    name: 'Drs. Hendra Wijaya',
    phone: '081234567890',
    propertyName: 'Griya Dago Executive Residence',
    city: 'Bandung',
    totalRooms: 16,
    date: '11 Aug 2026',
    status: 'PENDING',
  },
  {
    id: 'LEAD-002',
    name: 'Ibu Ratna Pertiwi',
    phone: '081987654321',
    propertyName: 'Kosan Sukajadi VIP Smart',
    city: 'Bandung',
    totalRooms: 10,
    date: '10 Aug 2026',
    status: 'APPROVED',
  },
];

export default function SuperadminDashboard({ onLogout }: { onLogout?: () => void }) {
  const [prospects, setProspects] = useState<LeadProspect[]>(INITIAL_PROSPECTS);
  const [toast, setToast] = useState<string | null>(null);

  // New Property Provisioning Form
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadProspect | null>(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('demo123');

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleApproveLead = (lead: LeadProspect) => {
    setSelectedLead(lead);
    setOwnerEmail(`${lead.name.toLowerCase().replace(/[^a-z]/g, '')}@kosanku.pro`);
    setShowProvisionModal(true);
  };

  const confirmProvisioning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setProspects((prev) =>
      prev.map((p) => (p.id === selectedLead.id ? { ...p, status: 'APPROVED' } : p))
    );

    showToastMsg(
      `✅ BERHASIL! Workspace Kosan "${selectedLead.propertyName}" terbit. Akun Owner (${ownerEmail}) berhasil diaktifkan dengan password default: ${tempPassword}`
    );
    setShowProvisionModal(false);
    setSelectedLead(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-900 dark:text-white">
      
      {/* Superadmin Executive Banner */}
      <div className="neu-card rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#047857]/20 via-emerald-500/10 to-teal-500/20 border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              <i className="fa-solid fa-[#047857] fa-crown" />
              <span>SUPERADMIN SaaS PLATFORM MASTER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Master Provisioning &amp; Lead Control</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
              Terbitkan Workspace Kosan baru, kelola lisensi SaaS mitra Owner, dan setujui penawaran kemitraan masuk dari pengunjung landing page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl neu-inset text-center shrink-0">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                {prospects.filter((p) => p.status === 'PENDING').length}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prospect Baru</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
                title="Keluar dari Akun Superadmin"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prospect Lead Requests Table */}
      <div className="neu-card rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <i className="fa-solid fa-handshake text-emerald-500" />
              <span>Permintaan Penawaran Mitra Owner (Landing Page Leads)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Persetujuan pembuatan akun Owner &amp; Workspace Kosan Terisolasi Baru</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">TANGGAL</th>
                <th className="py-3 px-4">CALON OWNER</th>
                <th className="py-3 px-4">PROPERTI KOSAN</th>
                <th className="py-3 px-4">LOKASI &amp; KAMAR</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI PROVISIONING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 dark:divide-white/5 font-medium">
              {prospects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500">{p.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono"><i className="fa-brands fa-whatsapp text-emerald-500 mr-1" />{p.phone}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">{p.propertyName}</td>
                  <td className="py-3.5 px-4">
                    <span className="block">{p.city}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{p.totalRooms} Unit Kamar</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.status === 'PENDING' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                        MENUNGGU PERSETUJUAN
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                        WORKSPACE TERBIT (AKTIF)
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.status === 'PENDING' ? (
                      <button
                        onClick={() => handleApproveLead(p)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles" />
                        <span>Setujui &amp; Terbitkan Workspace</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono text-[10px]">Akun Owner Telah Aktif</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {showProvisionModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#f2f5fa] dark:bg-[#120e24] text-slate-900 dark:text-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
              <h3 className="text-lg font-black">Terbitkan Kosan Baru (Superadmin)</h3>
              <button onClick={() => setShowProvisionModal(false)} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center">✕</button>
            </div>

            <form onSubmit={confirmProvisioning} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl neu-inset">
                <span className="text-emerald-600 font-bold block">Nama Properti Kosan:</span>
                <p className="text-base font-black">{selectedLead.propertyName}</p>
                <p className="text-slate-500">{selectedLead.city} • {selectedLead.totalRooms} Kamar</p>
              </div>

              <div>
                <label className="font-bold block mb-1">Set Email Akses Owner Baru *</label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Password Default Akses Owner *</label>
                <input
                  type="text"
                  required
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProvisionModal(false)} className="w-1/3 py-3 neu-btn font-bold rounded-2xl">Batal</button>
                <button type="submit" className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg">
                  Terbitkan Workspace Clean Slate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-scale-in">
          {toast}
        </div>
      )}
    </div>
  );
}
