'use client';
import React, { useState, useEffect } from 'react';

interface Payment { id: string; invoiceNumber: string; amount: number; totalAmount: number; paymentStatus: string; dueDate: string; createdAt: string; }

export default function PaymentHistoryPortal() {
  const [tenant, setTenant] = useState('dr. Rizky Pratama, Sp.A');
  const [room, setRoom] = useState('EKS-01');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fallback: Payment[] = [
    { id: '1', invoiceNumber: 'INV-20260601-0012', amount: 1500000, totalAmount: 1500000, paymentStatus: 'PAID', dueDate: '2026-06-05', createdAt: '2026-06-01' },
    { id: '2', invoiceNumber: 'INV-20260701-0008', amount: 1500000, totalAmount: 1500000, paymentStatus: 'PAID', dueDate: '2026-07-05', createdAt: '2026-07-01' },
    { id: '3', invoiceNumber: 'INV-20260801-0004', amount: 1500000, totalAmount: 1650000, paymentStatus: 'PAID', dueDate: '2026-08-05', createdAt: '2026-08-01' },
    { id: '4', invoiceNumber: 'INV-20260901-0001', amount: 1500000, totalAmount: 1500000, paymentStatus: 'PENDING', dueDate: '2026-09-05', createdAt: '2026-09-01' },
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenant(p.get('tenant')!);
    if (p.get('room')) setRoom(p.get('room')!);
    const load = async () => {
      try {
        const res = await fetch('/api/invoices');
        const data = await res.json();
        setPayments(data.data?.length ? data.data : fallback);
      } catch { setPayments(fallback); } finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
  const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } };
  const totalPaid = payments.filter(p => p.paymentStatus !== 'PENDING').reduce((a, p) => a + p.totalAmount, 0);
  const statusOf = (s: string) => s === 'PAID' || s === 'SETTLED'
    ? { label: '✅ Lunas', cls: 'bg-emerald-500/15 text-[#047857] border-emerald-500/20' }
    : s === 'OVERDUE' ? { label: '🔴 Terlambat', cls: 'bg-rose-500/15 text-rose-600 border-rose-500/20' }
    : { label: '⏳ Menunggu', cls: 'bg-amber-500/15 text-amber-600 border-amber-500/20' };

  const handleDownloadPDF = () => {
    window.open(`/api/reports/financial/pdf?tenant=${encodeURIComponent(tenant)}&room=${room}&autoprint=true`, '_blank');
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-receipt text-xs" /><span>RIWAYAT TAGIHAN & PEMBAYARAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Riwayat Pembayaran Sewa</h1>
          <p className="text-xs text-slate-400 mt-1">{tenant} • Kamar {room}</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="neu-card rounded-2xl p-4">
            <i className="fa-solid fa-coins text-lg text-[#047857] mb-2 block" />
            <div className="text-base font-black font-mono text-[#047857]">{fmt(totalPaid)}</div>
            <div className="text-[10px] text-slate-400">Total Terbayar</div>
          </div>
          <div className="neu-card rounded-2xl p-4">
            <i className="fa-solid fa-file-invoice text-lg text-blue-600 mb-2 block" />
            <div className="text-base font-black font-mono text-blue-600">{payments.length} Invoice</div>
            <div className="text-[10px] text-slate-400">Total Tagihan</div>
          </div>
        </div>

        {/* Download PDF */}
        <button onClick={handleDownloadPDF}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-solid fa-file-pdf" /> Unduh Rekap PDF (Struk Resmi)
        </button>

        {/* Payment List */}
        {loading ? (
          <div className="neu-card rounded-3xl p-10 text-center"><i className="fa-solid fa-spinner animate-spin text-2xl text-[#047857] mb-3 block" /></div>
        ) : (
          <div className="space-y-3">
            {payments.map(pay => {
              const s = statusOf(pay.paymentStatus);
              return (
                <div key={pay.id} className="neu-card rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs font-black text-slate-800 dark:text-white font-mono">{pay.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Jatuh Tempo: {fmtDate(pay.dueDate)}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${s.cls}`}>{s.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      {pay.totalAmount > pay.amount && <div className="text-[10px] text-rose-500">Termasuk denda {fmt(pay.totalAmount - pay.amount)}</div>}
                      <div className="text-base font-black text-[#047857] font-mono">{fmt(pay.totalAmount)}</div>
                    </div>
                    <div className="text-[10px] text-slate-400">{fmtDate(pay.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Riwayat Pembayaran Digital</p>
      </div>
    </div>
  );
}
