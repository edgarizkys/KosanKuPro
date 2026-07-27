'use client';

import { useState, useEffect } from 'react';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  rooms?: { id: string; number: string; type: string; price: number }[];
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentStatus: string;
  dueDate: string;
}

const FALLBACK_INVOICE = {
  id: 'INV-2026-0701',
  amount: 1604500,
  dueDate: '28 Agustus 2026',
  daysLeft: 3,
};

interface Ticket {
  id: number;
  title: string;
  desc: string;
  status: string;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function TenantDashboard({ user }: { user: TenantUser | null }) {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 1, title: 'AC kurang dingin', desc: 'AC kamar A-101 kurang dingin sejak kemarin.', status: 'OPEN' },
  ]);
  const [invoice, setInvoice] = useState(FALLBACK_INVOICE);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const tenantName = user?.name || 'Budi Santoso';
  const roomInfo = user?.rooms?.[0];

  // Load invoices for this tenant
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/invoices?userId=${user.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.length) {
          const pending = json.data.find((i: InvoiceItem) => i.paymentStatus === 'PENDING');
          if (pending) {
            const due = new Date(pending.dueDate);
            const daysLeft = Math.max(0, Math.ceil((due.getTime() - Date.now()) / 86400000));
            setInvoice({
              id: pending.invoiceNumber,
              amount: pending.totalAmount,
              dueDate: due.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
              daysLeft,
            });
          }
        }
      })
      .catch(() => {});
  }, [user?.id]);

  // Load existing complaints from API
  useEffect(() => {
    const url = user?.id ? `/api/complaints?userId=${user.id}` : '/api/complaints';
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.length) {
          setTickets(json.data.map((c: { id: string; title: string; description: string; status: string }) => ({
            id: parseInt(c.id.slice(0, 8), 36) || Date.now(),
            title: c.title,
            desc: c.description,
            status: c.status,
          })));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: desc.trim(), userId: user?.id, roomId: roomInfo?.id }),
      });
      if (res.ok) {
        setTickets((prev) => [
          { id: Date.now(), title: title.trim(), desc: desc.trim(), status: 'OPEN' },
          ...prev,
        ]);
        setTitle('');
        setDesc('');
      }
    } catch {
      setTickets((prev) => [
        { id: Date.now(), title: title.trim(), desc: desc.trim(), status: 'OPEN' },
        ...prev,
      ]);
      setTitle('');
      setDesc('');
    } finally {
      setSubmitting(false);
    }
  };

  const loadMidtransSnap = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).snap) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-TEST');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Midtrans'));
      document.body.appendChild(script);
    });
  };

  const handlePay = async () => {
    setPaying(true);
    setPayError(null);
    try {
      await loadMidtransSnap();
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, amount: invoice.amount }),
      });
      const json = await res.json();
      if (json.data?.snapToken && (window as any).snap) {
        (window as any).snap.pay(json.data.snapToken, {
          onSuccess: () => { setPayError(null); alert('Pembayaran berhasil!'); },
          onPending: () => { setPayError('Pembayaran menunggu konfirmasi.'); },
          onError: () => { setPayError('Pembayaran gagal. Coba lagi.'); },
          onClose: () => { setPaying(false); },
        });
      } else {
        setPayError(json.error || 'Gagal membuat transaksi. Pastikan MIDTRANS_SERVER_KEY sudah diisi.');
      }
    } catch {
      setPayError('Gagal menghubungi server pembayaran.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative rounded-2xl p-5 sm:p-8 overflow-hidden glass-card shimmer">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orchid-violet/10 rounded-full blur-[80px]" />
        <h2 className="text-2xl sm:text-3xl font-black text-white animate-fade-down">Halo, {tenantName} 👋</h2>
        <p className="text-sm text-slate-400 mt-2">
          {roomInfo ? `Kamar ${roomInfo.number} (${roomInfo.type})` : 'Sewa aktif'} hingga <span className="text-orchid-tint font-semibold">{invoice.dueDate}</span>
        </p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-bold">
          <i className="fa-solid fa-hourglass-half text-xs" /> Jatuh tempo: {invoice.daysLeft} hari lagi
        </div>
      </div>

      {/* Billing + Complaint */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing card */}
        <div className="glass-panel p-5 sm:p-8 rounded-2xl space-y-5 sm:space-y-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <h3 className="text-base font-bold text-white">Tagihan Bulan Ini</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">#{invoice.id}</p>
            </div>
            <div className="text-2xl font-black text-white">{formatIDR(invoice.amount)}</div>
          </div>

          {/* Invoice breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/5">
              <span className="text-slate-300">Sewa Kamar {roomInfo?.number || 'A-101'}</span>
              <span className="font-bold text-white">{formatIDR(roomInfo?.price || 1500000)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/5">
              <span className="text-slate-300">Listrik + Air</span>
              <span className="font-bold text-white">Rp 104.500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orchid-tint/5 rounded-xl border border-orchid-tint/10">
              <span className="text-orchid-tint font-semibold">Total Tagihan</span>
              <span className="font-black text-orchid-tint">{formatIDR(invoice.amount)}</span>
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-4 bg-gradient-to-r from-orchid-tint to-orchid-glow text-orchid-dark font-bold text-sm rounded-xl shadow-lg shadow-orchid-tint/20 hover:shadow-orchid-tint/40 hover:scale-[1.01] transition-all duration-300 magnetic-btn ripple-effect disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {paying ? (
              <span><i className="fa-solid fa-spinner fa-spin mr-2" /> Memproses...</span>
            ) : (
              <span><i className="fa-solid fa-credit-card mr-2" /> Bayar via Midtrans Snap</span>
            )}
          </button>
          {payError && (
            <p className="text-[11px] text-rose-400 font-semibold text-center mt-2">{payError}</p>
          )}

          {/* Payment history */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Riwayat Pembayaran</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px]"><i className="fa-solid fa-check" /></div>
                  <div>
                    <span className="text-white font-semibold block">Juni 2026</span>
                    <span className="text-slate-500 text-[10px]">QRIS • INV-2026-0601</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">Rp 1.604.500</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/3 rounded-xl border border-white/5 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px]"><i className="fa-solid fa-check" /></div>
                  <div>
                    <span className="text-white font-semibold block">Mei 2026</span>
                    <span className="text-slate-500 text-[10px]">BCA VA • INV-2026-0501</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-400">Rp 1.604.500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint form */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4 sm:space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-headset text-orchid-tint text-xs" /> Lapor Kendala
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul kendala..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-500"
            />
            <textarea
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Deskripsi..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-orchid-tint/40 transition-colors placeholder-slate-500 resize-none"
            />
            <button type="submit" disabled={submitting} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 hover:border-white/25 transition-all disabled:opacity-50">
              {submitting ? <i className="fa-solid fa-spinner fa-spin mr-1" /> : null} Kirim Tiket
            </button>
          </form>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tickets.map((t) => (
              <div key={t.id} className="p-3 bg-white/3 border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">{t.title}</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[8px] font-bold uppercase">{t.status}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
