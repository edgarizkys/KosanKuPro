'use client';

import { useState, useEffect } from 'react';

interface NotificationDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface NotifItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

const FALLBACK_NOTIFS: NotifItem[] = [
  { id: '1', title: 'Cron Reminder Terkirim', message: 'WhatsApp ke Budi Santoso (A-101) via Vercel Cron.', createdAt: new Date().toISOString() },
  { id: '2', title: 'Webhook Settlement', message: 'INV-2026-0602 dibayar via QRIS oleh Rian Pratama.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Tiket Baru', message: 'AC kurang dingin dilaporkan oleh Budi Santoso.', createdAt: new Date(Date.now() - 7200000).toISOString() },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export default function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const [notifs, setNotifs] = useState<NotifItem[]>(FALLBACK_NOTIFS);

  useEffect(() => {
    if (!open) return;
    fetch('/api/notifications?limit=20')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.length) setNotifs(json.data);
      })
      .catch(() => {});
  }, [open]);

  return (
    <div
      id="drawerNotif"
      className={`fixed right-0 top-0 bottom-0 w-full sm:w-80 md:w-96 bg-white dark:bg-[#150f20] z-50 border-l border-slate-200 dark:border-white/10 shadow-2xl p-5 sm:p-6 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col text-slate-900 dark:text-white ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifikasi</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><i className="fa-solid fa-xmark" /></button>
      </div>
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {notifs.map((n) => (
          <div key={n.id} className="p-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-900 dark:text-white">{n.title}</span>
              <span className="text-[9px] text-slate-500">{timeAgo(n.createdAt)}</span>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
          </div>
        ))}
        {notifs.length === 0 && (
          <p className="text-center text-xs text-slate-500 py-8">Belum ada notifikasi.</p>
        )}
      </div>
      <button onClick={onClose} className="w-full py-2.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all">
        Tutup
      </button>
    </div>
  );
}
