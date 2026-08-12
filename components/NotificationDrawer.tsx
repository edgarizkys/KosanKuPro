'use client';

import { useState, useEffect } from 'react';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  role?: string;
}

interface NotifItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  targetRole?: string[]; // e.g. ['owner', 'admin']
  targetTab?: string;    // e.g. 'tenant_requests', 'invoices', 'complaints', 'deposit'
  badgeColor?: string;
}

// Role-specific notification streams
const ROLE_NOTIFS: Record<string, NotifItem[]> = {
  owner: [
    { id: 'o-1', title: '🛒 Order Suplai Baru dari Tenant', message: 'Budi Santoso (Kamar A-101) memesan Refill Air Galon Aqua.', createdAt: new Date().toISOString(), targetTab: 'tenant_requests', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'o-2', title: '💳 Tagihan Rent Settled (Midtrans)', message: 'Sewa Kamar B-201 oleh Siti Rahma sebesar Rp 1.650.000 LUNAS via QRIS.', createdAt: new Date(Date.now() - 3600000).toISOString(), targetTab: 'financial', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'o-3', title: '💵 Dana Escrow Deposit Terkunci', message: 'Deposit Rp 500.000 Kamar C-302 berhasil dikunci di Escrow Vault.', createdAt: new Date(Date.now() - 14400000).toISOString(), targetTab: 'deposit', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'o-4', title: '🛠 Tiket Keluhan Baru Diposting', message: 'Rian Pratama melaporkan kendala AC kurang dingin.', createdAt: new Date(Date.now() - 86400000).toISOString(), targetTab: 'complaints', badgeColor: 'bg-rose-100 text-rose-800' },
  ],
  vendor: [
    { id: 'v-1', title: '📦 Tugas Pengantaran Baru', message: 'Owner menugaskan pesanan Galon Aqua ke Kamar A-101 (Budi Santoso).', createdAt: new Date().toISOString(), targetTab: 'tenant_requests', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'v-2', title: '🚚 Status Pengantaran Berubah', message: 'Order #V-101 dikonfirmasi sedang dalam pengantaran kurir Bambang.', createdAt: new Date(Date.now() - 5400000).toISOString(), targetTab: 'inventory', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'v-3', title: '🧾 Add-On Billing Berhasil Di-charge', message: 'Kelebihan kuota laundry Rp 20.000 masuk ke invoice bulanan tenant.', createdAt: new Date(Date.now() - 18000000).toISOString(), targetTab: 'invoices', badgeColor: 'bg-purple-100 text-purple-800' },
  ],
  tenant: [
    { id: 't-1', title: '🚚 Status Pesanan Suplai: Diantar', message: 'Galon Aqua Anda sedang diantar oleh Kurir Bambang (ETA 30 menit).', createdAt: new Date().toISOString(), targetTab: 'tenant_requests', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 't-2', title: '📄 Tagihan Sewa Terbit', message: 'Invoice Sewa Kamar A-101 (Agustus 2026) jatuh tempo 28 Agustus.', createdAt: new Date(Date.now() - 86400000).toISOString(), targetTab: 'invoices', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 't-3', title: '🔧 Tiket Perbaikan Diproses', message: 'Laporan perbaikan kran air sedang ditangani Staf Lapangan.', createdAt: new Date(Date.now() - 172800000).toISOString(), targetTab: 'complaints', badgeColor: 'bg-emerald-100 text-emerald-800' },
  ],
  admin: [
    { id: 'a-1', title: '⚙️ Master Data Setting Diubah', message: 'Konfigurasi identitas kosan & rekening bank diperbarui.', createdAt: new Date().toISOString(), targetTab: 'master_data', badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'a-2', title: '👥 User Baru Terdaftar', message: 'Akun Staf Karyawan Bambang (SO Inspector) aktif.', createdAt: new Date(Date.now() - 7200000).toISOString(), targetTab: 'users', badgeColor: 'bg-emerald-100 text-emerald-800' },
  ],
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export default function NotificationDrawer({ open, onClose, role = 'owner' }: NotificationDrawerProps) {
  const currentRole = role.toLowerCase();
  const [notifs, setNotifs] = useState<NotifItem[]>(ROLE_NOTIFS[currentRole] || ROLE_NOTIFS.owner);

  useEffect(() => {
    if (!open) return;
    const fetchRoleNotifs = async () => {
      try {
        const fallbackList = ROLE_NOTIFS[currentRole] || ROLE_NOTIFS.owner;

        // Fetch live server order notifications
        const resOrderNotifs = await fetch('/api/orders?type=notifications');
        let liveOrderNotifs: NotifItem[] = [];
        if (resOrderNotifs.ok) {
          const json = await resOrderNotifs.json();
          if (json?.data?.length) {
            liveOrderNotifs = json.data.map((item: any) => ({
              ...item,
              targetTab: currentRole === 'tenant' ? 'tenant_requests' : currentRole === 'vendor' ? 'tenant_requests' : 'tenant_requests',
              badgeColor: 'bg-emerald-100 text-emerald-800',
            }));
          }
        }

        const merged = [...liveOrderNotifs, ...fallbackList];
        setNotifs(merged);
      } catch (err) {}
    };

    fetchRoleNotifs();
  }, [open, currentRole]);

  const handleNotifClick = (n: NotifItem) => {
    onClose();
    if (typeof window !== 'undefined' && n.targetTab) {
      // Dispatch custom event to switch to the exact tab where notification originates!
      window.dispatchEvent(new CustomEvent('switch_dashboard_tab', { detail: { tab: n.targetTab, role: currentRole } }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div
        id="drawerNotif"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:w-80 md:w-96 neu-card h-full p-5 sm:p-6 flex flex-col text-slate-900 dark:text-white shadow-2xl border-l border-white/80 dark:border-white/10 animate-slide-left"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <i className="fa-solid fa-bell text-[#047857] dark:text-emerald-400" />
              <span>Notifikasi ({notifs.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Role Logged In: <strong className="text-[#047857] dark:text-emerald-400">{currentRole.toUpperCase()}</strong>
            </span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"><i className="fa-solid fa-xmark text-xs" /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotifClick(n)}
              className="p-3.5 neu-card-sm rounded-2xl space-y-1.5 cursor-pointer hover:scale-[1.02] hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${n.badgeColor || 'bg-emerald-100 text-emerald-800'}`}>
                  {n.title}
                </span>
                <span className="text-[9px] text-slate-400 shrink-0">{timeAgo(n.createdAt)}</span>
              </div>
              <p
                className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pr-4 relative"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word',
                }}
              >
                {n.message}
                <i className="fa-solid fa-arrow-right text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bottom-0" />
              </p>
            </div>
          ))}
          {notifs.length === 0 && (
            <p className="text-center text-xs text-slate-500 py-8">Belum ada notifikasi untuk role ini.</p>
          )}
        </div>

        <button onClick={onClose} className="w-full py-2.5 neu-btn rounded-xl text-xs font-bold text-slate-700 dark:text-white transition-all cursor-pointer">
          Tutup Panel Notifikasi
        </button>
      </div>
    </div>
  );
}
