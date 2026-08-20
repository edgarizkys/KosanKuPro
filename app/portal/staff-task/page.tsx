'use client';

import React, { useState, useEffect } from 'react';

export default function StaffTaskMagicPortal() {
  const [taskId, setTaskId] = useState('');
  const [taskData, setTaskData] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaint() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id') || 'CMP-101';
        setTaskId(id);

        setTaskData({
          id,
          title: params.get('title') || 'AC Kamar Kurang Dingin & Filter Berdebu',
          roomNumber: params.get('room') || 'EKS-01',
          tenantName: params.get('tenant') || 'dr. Rizky Pratama, Sp.A',
          staffName: params.get('staff') || 'Bambang Prasetyo (Staf Lapangan)',
          category: params.get('category') || 'Electrical & AC Maintenance',
          status: params.get('status') || 'IN_PROGRESS',
        });

        const res = await fetch('/api/complaints');
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            const found = json.data.find((c: any) => c.id.toLowerCase() === id.toLowerCase());
            if (found) {
              setTaskData((prev: any) => ({
                ...prev,
                title: found.title || prev.title,
                status: found.status || prev.status,
                category: found.category || prev.category,
              }));
            }
          }
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    loadComplaint();
  }, []);

  const handleUpdateTask = async (newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    if (!taskId) return;
    setIsUpdating(true);
    try {
      await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          assignedStaff: taskData?.staffName,
          notes: notes || 'Pekerjaan perbaikan telah diselesaikan oleh staf.',
        }),
      });

      const cmdText = newStatus === 'RESOLVED' ? `Selesai ${taskId} ${notes || 'Pekerjaan selesai'}` : `Proses ${taskId}`;
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '081398765432',
          message: cmdText,
        }),
      });

      setTaskData((prev: any) => ({ ...prev, status: newStatus }));
      setToastMessage('✓ Tiket Berhasil Diperbarui: Selesai (RESOLVED)');
    } catch {
      setToastMessage('Gagal memperbarui status tiket');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const status = taskData?.status || 'IN_PROGRESS';

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 dark:text-amber-400 text-xs font-black">
            <i className="fa-solid fa-screwdriver-wrench text-xs" />
            <span>LEMBAR KERJA STAF LAPANGAN</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            #{taskId}
          </span>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 rounded-2xl bg-[#047857] text-white text-xs font-bold shadow-md flex items-center gap-2 animate-scale-in">
            <i className="fa-solid fa-circle-check text-sm" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Location & Tenant Info */}
          <div className="flex items-start justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                LOKASI PENGERJAAN
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/20">
                  Kamar {taskData?.roomNumber || 'EKS-01'}
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {taskData?.tenantName || 'Penghuni Kos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Petugas: {taskData?.staffName || 'Bambang Prasetyo'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm">
              <i className="fa-solid fa-clipboard-check" />
            </div>
          </div>

          {/* Problem Details */}
          <div className="p-4 rounded-2xl neu-inset space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              {taskData?.category || 'Tiket Perbaikan'}
            </span>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {isLoading ? 'Memuat data tiket...' : taskData?.title}
            </p>
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              CATATAN TINDAKAN PERBAIKAN:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Filter sudah dicuci & freon ditambah..."
              className="w-full rounded-2xl neu-inset px-4 py-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              disabled={isUpdating || status === 'RESOLVED'}
              onClick={() => handleUpdateTask('RESOLVED')}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                status === 'RESOLVED'
                  ? 'neu-inset text-[#047857] dark:text-emerald-400 font-black cursor-default'
                  : 'bg-[#047857] hover:bg-[#065f46] text-white active:scale-95'
              }`}
            >
              {isUpdating ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-circle-check text-xs" />
                  <span>
                    {status === 'RESOLVED'
                      ? 'Pekerjaan Selesai (RESOLVED)'
                      : 'Tandai Pekerjaan Selesai (RESOLVED)'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Sinkronisasi Database KosanKu Pro & Auto-Notifikasi WhatsApp
        </p>
      </div>
    </div>
  );
}
