'use client';

import { useState } from 'react';

interface DepositRecord {
  id: string;
  tenantName: string;
  roomNumber: string;
  depositAmount: number;
  lateFeePerDay: number;
  daysOverdue: number;
  status: 'ESCROW_LOCKED' | 'REFUNDED' | 'DEDUCTED';
  deductionReason?: string;
}

const INITIAL_DEPOSITS: DepositRecord[] = [
  { id: 'DEP-101', tenantName: 'Budi Santoso', roomNumber: 'A-101', depositAmount: 500000, lateFeePerDay: 50000, daysOverdue: 0, status: 'ESCROW_LOCKED' },
  { id: 'DEP-102', tenantName: 'Siti Rahma', roomNumber: 'B-201', depositAmount: 500000, lateFeePerDay: 50000, daysOverdue: 2, status: 'ESCROW_LOCKED' },
  { id: 'DEP-103', tenantName: 'Rian Pratama', roomNumber: 'C-302', depositAmount: 500000, lateFeePerDay: 50000, daysOverdue: 0, status: 'REFUNDED' },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function SecurityDepositEscrow() {
  const [deposits, setDeposits] = useState<DepositRecord[]>(INITIAL_DEPOSITS);
  const [toast, setToast] = useState<string | null>(null);

  const handleRefund = (id: string) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'REFUNDED' } : d))
    );
    const dep = deposits.find((d) => d.id === id);
    setToast(`✅ Deposit Jaminan Rp ${dep?.depositAmount.toLocaleString('id-ID')} atas nama ${dep?.tenantName} (Kamar ${dep?.roomNumber}) BERHASIL DI-REFUND!`);
    setTimeout(() => setToast(null), 3500);
  };

  const handleDeductDamage = (id: string, amount: number, reason: string) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'DEDUCTED', deductionReason: reason } : d))
    );
    setToast(`⚠️ Deposit Kategori Potongan Kerusakan (${reason}) Sebesar Rp ${amount.toLocaleString('id-ID')} Diaplikasikan!`);
    setTimeout(() => setToast(null), 3500);
  };

  const totalEscrowLocked = deposits
    .filter((d) => d.status === 'ESCROW_LOCKED')
    .reduce((s, d) => s + d.depositAmount, 0);

  return (
    <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-500/30">
              💵 Escrow &amp; Penalty Automation
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Auto-Deduction &amp; Refund Management</span>
          </div>
          <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            Manajemen Deposit Jaminan (Escrow) &amp; Denda Terlambat Automatic
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Penguncian dana jaminan kerusakan deposit saat cek-in &amp; kalkulasi denda keterlambatan Rp 50.000/hari otomatis
          </p>
        </div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl text-center">
          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Total Dana Escrow Terkunci</span>
          <span className="text-base font-black text-emerald-800 dark:text-emerald-300">{formatIDR(totalEscrowLocked)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {deposits.map((dep) => {
          const totalLateFee = dep.daysOverdue * dep.lateFeePerDay;
          return (
            <div
              key={dep.id}
              className="bg-slate-50 dark:bg-black/25 rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 space-y-3 transition-all hover:border-purple-500/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-mono text-[10px] font-bold">
                    {dep.id}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold text-xs">
                    Kamar {dep.roomNumber} ({dep.tenantName})
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase w-fit border ${
                    dep.status === 'ESCROW_LOCKED'
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300'
                      : dep.status === 'REFUNDED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400'
                      : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-400'
                  }`}
                >
                  {dep.status === 'ESCROW_LOCKED' ? '🔒 Dana Deposit Terkunci' : dep.status === 'REFUNDED' ? '✅ Deposit Di-Refund' : '⚠️ Dipotong Kerusakan'}
                </span>
              </div>

              <div className="p-3.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 block">
                    Deposit Jaminan Cek-In: <strong className="text-slate-900 dark:text-white font-bold">{formatIDR(dep.depositAmount)}</strong>
                  </span>
                  {dep.daysOverdue > 0 && (
                    <span className="text-rose-600 dark:text-rose-400 font-bold block mt-0.5">
                      ⚠️ Terlambat {dep.daysOverdue} Hari (Denda Otomatis: {formatIDR(totalLateFee)})
                    </span>
                  )}
                </div>

                {dep.status === 'ESCROW_LOCKED' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeductDamage(dep.id, 150000, 'Kerusakan Kran & Remote AC')}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 font-bold rounded-xl text-[11px] transition-all cursor-pointer"
                    >
                      Potong Kerusakan
                    </button>
                    <button
                      onClick={() => handleRefund(dep.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-rotate-left" />
                      <span>Refund Full Deposit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl text-xs font-bold bg-emerald-600 text-white shadow-2xl animate-scale-in flex items-center gap-2">
          <i className="fa-solid fa-circle-check" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
