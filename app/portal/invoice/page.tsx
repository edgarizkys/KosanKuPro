'use client';

import React, { useState, useEffect } from 'react';

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  amount: number;
  penaltyAmount: number;
  totalAmount: number;
  paymentStatus: string;
  dueDate: string;
  createdAt: string;
  user: { id?: string; name: string; phone?: string };
  room: { id?: string; number: string; type?: string };
}

export default function InvoicePortal() {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [payMethod, setPayMethod] = useState<'QRIS' | 'VA_BCA' | 'VA_BRI' | 'TRANSFER'>('QRIS');
  const [error, setError] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [propertyName, setPropertyName] = useState('Juragan Kost Pasteur (Depan RSHS)');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('invoice') || params.get('id') || '';
    const propParam = params.get('property') || 'Juragan Kost Pasteur (Depan RSHS)';
    setInvoiceId(idParam);
    setPropertyName(propParam);
    fetchInvoice(idParam);
  }, []);

  const fetchInvoice = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const allInvoices: InvoiceData[] = data.data || [];

      let found: InvoiceData | undefined;
      if (id) {
        found = allInvoices.find(
          (inv) =>
            inv.invoiceNumber === id ||
            inv.id === id ||
            inv.invoiceNumber.toLowerCase().includes(id.toLowerCase())
        );
      }
      if (!found && allInvoices.length > 0) {
        found = allInvoices[0];
      }

      if (found) {
        setInvoice(found);
        const s = found.paymentStatus?.toUpperCase();
        if (s === 'PAID' || s === 'LUNAS' || s === 'SETTLED') setPaid(true);
      } else {
        setError('Invoice tidak ditemukan. Hubungi admin kosan Anda.');
      }
    } catch {
      setError('Gagal memuat data invoice. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!invoice) return;
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1800));
    try {
      // Update status invoice yang ada dengan PUT
      await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id,
          paymentStatus: 'PAID',
        }),
      });
      // Log aktivitas ke dashboard owner
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'PAYMENT_RECEIVED',
          payload: {
            tenantName: invoice.user.name,
            roomNumber: invoice.room.number,
            item: `Pembayaran Sewa — ${invoice.invoiceNumber}`,
            amount: invoice.totalAmount,
            method: payMethod,
          },
        }),
      });
    } catch {}
    setPaid(true);
    setPaying(false);
  };

  const getStatus = (s: string) => {
    const upper = s?.toUpperCase() || '';
    if (upper === 'PAID' || upper === 'LUNAS' || upper === 'SETTLED')
      return { color: '#047857', bg: 'bg-emerald-500/10 border border-emerald-500/20', label: '✅ LUNAS' };
    if (upper === 'OVERDUE' || upper === 'TERLAMBAT')
      return { color: '#dc2626', bg: 'bg-rose-500/10 border border-rose-500/20', label: '🔴 TERLAMBAT' };
    return { color: '#d97706', bg: 'bg-amber-500/10 border border-amber-500/20', label: '⏳ MENUNGGU PEMBAYARAN' };
  };

  const fmt = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;
  const fmtDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">

        {/* Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black mb-3">
            <i className="fa-solid fa-file-invoice-dollar text-xs" />
            <span>TAGIHAN SEWA KAMAR — KOSANKU PRO</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Invoice Pembayaran</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{propertyName}</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="neu-card rounded-3xl p-10 text-center">
            <i className="fa-solid fa-spinner animate-spin text-2xl text-[#047857] dark:text-emerald-400 mb-3 block" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Memuat data invoice dari database...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="neu-card rounded-3xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl neu-inset text-rose-500 flex items-center justify-center text-2xl mx-auto">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{error}</p>
            <button
              onClick={() => fetchInvoice(invoiceId)}
              className="px-6 py-2.5 rounded-xl neu-btn text-xs font-bold text-[#047857] dark:text-emerald-400 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* SUCCESS PAID */}
        {paid && invoice && !loading && (
          <div className="neu-card rounded-3xl p-6 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">
              <i className="fa-solid fa-check" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white">Pembayaran Berhasil!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Invoice <strong className="text-[#047857]">{invoice.invoiceNumber}</strong> atas nama <strong className="text-slate-800 dark:text-white">{invoice.user.name}</strong> telah terkonfirmasi lunas.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl neu-inset text-left text-xs space-y-2">
              {[
                ['Invoice', invoice.invoiceNumber],
                ['Tenant', invoice.user.name],
                ['Kamar', invoice.room.number],
                ['Jumlah', fmt(invoice.totalAmount)],
                ['Metode', payMethod === 'QRIS' ? '📱 QRIS Scan' : payMethod === 'VA_BCA' ? '🏦 VA BCA' : payMethod === 'VA_BRI' ? '🏦 VA BRI' : '💳 Transfer Bank'],
                ['Status', '✅ LUNAS'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>{label}</span>
                  <strong className="text-[#047857] dark:text-emerald-400">{val}</strong>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro%2C%20saya%20sudah%20bayar%20invoice%20${invoice.invoiceNumber}`, '_blank')}
              className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] dark:text-emerald-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-sm" /> Konfirmasi via WhatsApp Admin
            </button>
          </div>
        )}

        {/* INVOICE DETAIL */}
        {!loading && !error && invoice && !paid && (
          <>
            {/* Status Banner */}
            <div className={`p-3 rounded-2xl text-center ${getStatus(invoice.paymentStatus).bg}`}>
              <span className="text-sm font-black" style={{ color: getStatus(invoice.paymentStatus).color }}>
                {getStatus(invoice.paymentStatus).label}
              </span>
            </div>

            {/* Invoice Header Card */}
            <div className="neu-card rounded-3xl p-5 space-y-4">
              {/* Invoice Number & Due Date */}
              <div className="flex justify-between items-start border-b border-slate-200/50 dark:border-white/5 pb-4">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">NOMOR INVOICE</div>
                  <div className="text-sm font-black text-[#047857] dark:text-emerald-400 font-mono">{invoice.invoiceNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">JATUH TEMPO</div>
                  <div className="text-sm font-black text-amber-600 dark:text-amber-400">{fmtDate(invoice.dueDate)}</div>
                </div>
              </div>

              {/* Tenant & Room */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'NAMA PENGHUNI', val: invoice.user.name },
                  { label: 'NOMOR KAMAR', val: invoice.room.number },
                ].map(({ label, val }) => (
                  <div key={label} className="p-3 rounded-2xl neu-inset">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</div>
                    <div className="text-sm font-black text-slate-800 dark:text-white">{val}</div>
                  </div>
                ))}
              </div>

              {/* Amount Breakdown */}
              <div className="p-4 rounded-2xl neu-inset space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Rincian Tagihan</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Biaya Sewa Kamar</span>
                  <span className="font-bold text-slate-800 dark:text-white">{fmt(invoice.amount)}</span>
                </div>
                {invoice.penaltyAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-600">⚠️ Denda Keterlambatan</span>
                    <span className="font-bold text-rose-600">{fmt(invoice.penaltyAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200/50 dark:border-white/5 pt-3 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-200">Total Tagihan</span>
                  <span className="text-xl font-black text-[#047857] dark:text-emerald-400 font-mono">{fmt(invoice.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="neu-card rounded-3xl p-5 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pilih Metode Pembayaran</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'QRIS', icon: 'fa-qrcode', label: 'QRIS Scan', sub: 'Semua e-wallet & bank' },
                  { id: 'VA_BCA', icon: 'fa-building-columns', label: 'VA BCA', sub: 'Virtual Account BCA' },
                  { id: 'VA_BRI', icon: 'fa-building-columns', label: 'VA BRI', sub: 'Virtual Account BRI' },
                  { id: 'TRANSFER', icon: 'fa-money-bill-transfer', label: 'Transfer Bank', sub: 'Konfirmasi manual ke admin' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayMethod(m.id as typeof payMethod)}
                    className={`p-3 rounded-2xl text-left cursor-pointer transition-all ${
                      payMethod === m.id
                        ? 'neu-card border border-[#047857]/20'
                        : 'neu-inset'
                    }`}
                  >
                    <i className={`fa-solid ${m.icon} text-base mb-2 block ${payMethod === m.id ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-400'}`} />
                    <div className={`text-xs font-bold ${payMethod === m.id ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>{m.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.sub}</div>
                  </button>
                ))}
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-4 rounded-2xl neu-btn-primary text-sm font-black flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 transition-all"
              >
                {paying ? (
                  <><i className="fa-solid fa-spinner animate-spin" /> Memproses Pembayaran...</>
                ) : (
                  <>
                    <i className={`fa-solid ${payMethod === 'QRIS' ? 'fa-qrcode' : 'fa-building-columns'}`} />
                    Bayar {fmt(invoice.totalAmount)} Sekarang
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-400">
                Atau{' '}
                <a
                  href={`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro%2C%20saya%20ingin%20konfirmasi%20pembayaran%20invoice%20${invoice.invoiceNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#047857] dark:text-emerald-400 font-bold underline underline-offset-2"
                >
                  konfirmasi manual via WhatsApp
                </a>
              </p>
            </div>

            <p className="text-[10px] text-center text-slate-400 font-semibold pb-4">
              Diterbitkan oleh Sistem KosanKu Pro • {fmtDate(invoice.createdAt)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
