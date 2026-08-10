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

interface AddOnBillItem {
  id: string;
  tenantName: string;
  roomNumber: string;
  description: string;
  amount: number;
  date: string;
}

const FALLBACK_INVOICE = {
  id: 'INV-2026-0701',
  amount: 1604500,
  dueDate: '28 Agustus 2026',
  daysLeft: 3,
};

const INITIAL_ADDONS: AddOnBillItem[] = [
  {
    id: 'V-101',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    description: 'Kelebihan Laundry 2.5 kg dari Kuota 5 kg bulanan',
    amount: 20000,
    date: '10 Ags 2026',
  },
];

interface Ticket {
  id: number;
  title: string;
  desc: string;
  status: string;
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

import SequenceSaaSLayout from './SequenceSaaSLayout';
import type { RoleType } from '@/app/page';

export default function TenantDashboard({
  user,
  onSwitchRole = () => {},
  onLogout = () => {},
}: {
  user: TenantUser | null;
  onSwitchRole?: (r: RoleType) => void;
  onLogout?: () => void;
}) {
  const [activeBranch, setActiveBranch] = useState('all');
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 1, title: 'AC kurang dingin', desc: 'AC kamar A-101 kurang dingin sejak kemarin.', status: 'OPEN' },
  ]);
  const [invoice, setInvoice] = useState(FALLBACK_INVOICE);
  const [addOns, setAddOns] = useState<AddOnBillItem[]>(INITIAL_ADDONS);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [rulesRead, setRulesRead] = useState(() => {
    try { return localStorage.getItem('kosanku_rules_read') === 'true'; } catch { return false; }
  });
  const [rulesExpanded, setRulesExpanded] = useState(true);

  const tenantName = user?.name || 'Budi Santoso';
  const roomInfo = user?.rooms?.[0];

  // Load Add-On items from localStorage if updated by Vendor
  useEffect(() => {
    try {
      const savedAddons = localStorage.getItem('kosanku_tenant_addons');
      if (savedAddons) {
        const parsed = JSON.parse(savedAddons);
        if (Array.isArray(parsed) && parsed.length) {
          setAddOns(parsed);
        }
      }
    } catch {}
  }, []);

  // Calculate total invoice with Add-On items
  const totalAddOnCost = addOns.reduce((s, a) => s + a.amount, 0);
  const grandTotalPayment = invoice.amount + totalAddOnCost;

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
        body: JSON.stringify({
          userId: user?.id || 'demo_user',
          title,
          description: desc,
        }),
      });
      if (res.ok) {
        setTickets((prev) => [{ id: Date.now(), title, desc, status: 'OPEN' }, ...prev]);
        setTitle('');
        setDesc('');
      } else {
        alert('Gagal mengirim keluhan.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayMidtrans = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch('/api/midtrans/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `${invoice.id}-${Date.now()}`,
          amount: grandTotalPayment,
          customerName: tenantName,
          customerEmail: user?.email || 'tenant@kosanku.com',
          itemDetails: [
            { id: 'RENT', name: 'Sewa Kamar + Utilitas Base', price: invoice.amount, quantity: 1 },
            ...addOns.map((a, i) => ({ id: `ADDON-${i}`, name: a.description, price: a.amount, quantity: 1 })),
          ],
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.token) {
        throw new Error(json.error || 'Gagal mendapatkan token Midtrans');
      }

      const snapToken = json.token;

      if (typeof window !== 'undefined' && (window as any).snap) {
        (window as any).snap.pay(snapToken, {
          onSuccess: function () {
            alert('🎉 Pembayaran sewa & add-on berhasil! Terima kasih.');
            setInvoice((prev) => ({ ...prev, daysLeft: 30 }));
            setPaying(false);
          },
          onPending: function () {
            alert('Menunggu penyelesaian pembayaran via QRIS / VA.');
            setPaying(false);
          },
          onError: function () {
            alert('Pembayaran gagal. Silakan coba kembali.');
            setPaying(false);
          },
          onClose: function () {
            setPaying(false);
          },
        });
      } else {
        alert(`Midtrans Snap Sandbox Token: ${snapToken}\n\n(Silakan gunakan metode QRIS/BCA VA di environment Snap produksi)`);
        setPaying(false);
      }
    } catch (err: any) {
      setPayError(err.message || 'Gagal memproses pembayaran');
      setPaying(false);
    }
  };

  return (
    <SequenceSaaSLayout
      role="tenant"
      activeBranch={activeBranch}
      onBranchChange={setActiveBranch}
      onSwitchRole={onSwitchRole}
      onLogout={onLogout}
      activeTab="invoices"
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
      {/* Welcome Banner */}
      <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300 text-[10px] font-bold border border-purple-300 dark:border-purple-500/30">
              👤 Active Resident Portal
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">KosanKu Pro Resident Experience</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            Selamat Datang, {tenantName}! 👋
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Penghuni Kamar <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{roomInfo?.number || 'A-101'}</strong> ({roomInfo?.type || 'Deluxe Studio Smart'})
          </p>
        </div>
      </div>

      {/* ===== PERATURAN KOSAN BANNER ===== */}
      <div className={`rounded-3xl border overflow-hidden shadow-xs transition-all ${rulesRead ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-900/10' : 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/10'}`}>
        {/* Banner Header */}
        <div
          className={`flex items-center justify-between p-4 cursor-pointer ${rulesRead ? 'bg-emerald-100/60 dark:bg-emerald-500/10' : 'bg-amber-100 dark:bg-amber-500/15'}`}
          onClick={() => setRulesExpanded((p) => !p)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${rulesRead ? 'bg-emerald-200 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-200 dark:bg-amber-500/30 text-amber-800 dark:text-amber-400'}`}>
              <i className="fa-solid fa-book-open" />
            </div>
            <div>
              <h3 className={`text-sm font-black ${rulesRead ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-900 dark:text-amber-300'}`}>
                📋 Peraturan &amp; Tata Tertib Kosan
              </h3>
              <p className={`text-[10px] font-medium ${rulesRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {rulesRead ? '✅ Sudah Dibaca & Dipahami' : '⚠️ Wajib dibaca oleh seluruh penghuni kosan'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {rulesRead && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                SUDAH DIPAHAMI
              </span>
            )}
            <i className={`fa-solid fa-chevron-${rulesExpanded ? 'up' : 'down'} text-xs ${rulesRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`} />
          </div>
        </div>

        {/* Rules Content (collapsible) */}
        {rulesExpanded && (
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { no: 1, rule: 'Jam malam mulai pukul 23.00 — harap menjaga ketenangan dan tidak membuat keributan.', icon: '🌙' },
                { no: 2, rule: 'Dilarang membawa tamu menginap tanpa izin tertulis dari manajemen kosan.', icon: '🚷' },
                { no: 3, rule: 'Bayar sewa sebelum tanggal 5 setiap bulan. Denda keterlambatan Rp 50.000/hari.', icon: '💳' },
                { no: 4, rule: 'Dilarang keras merokok di dalam kamar dan seluruh area dalam gedung kosan.', icon: '🚭' },
                { no: 5, rule: 'Sampah dibuang ke tempat yang telah disediakan. Jaga kebersihan kamar masing-masing.', icon: '🗑️' },
                { no: 6, rule: 'Perbaikan kerusakan kamar akibat kelalaian penghuni menjadi tanggung jawab penghuni.', icon: '🔧' },
                { no: 7, rule: 'Dilarang memelihara hewan peliharaan di dalam kamar maupun area kosan.', icon: '🐾' },
                { no: 8, rule: 'Token listrik dan air bersih adalah tanggung jawab masing-masing penghuni.', icon: '⚡' },
                { no: 9, rule: 'Tidak diperkenankan memasak makanan berbau menyengat di kamar. Gunakan dapur bersama.', icon: '🍳' },
                { no: 10, rule: 'Penghuni yang melanggar peraturan 3x berturut-turut dapat dikenai surat peringatan hingga pemutusan kontrak.', icon: '📝' },
              ].map((item) => (
                <div key={item.no} className="flex items-start gap-2.5 bg-white dark:bg-black/20 border border-slate-200/80 dark:border-white/10 rounded-xl p-3">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wide block mb-0.5 ${rulesRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Peraturan #{item.no}</span>
                    <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed">{item.rule}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Confirm Checkbox */}
            {!rulesRead ? (
              <div className="flex items-start gap-3 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4">
                <input
                  type="checkbox"
                  id="rulesConfirm"
                  className="w-4 h-4 accent-emerald-500 mt-0.5 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRulesRead(true);
                      try { localStorage.setItem('kosanku_rules_read', 'true'); } catch {}
                    }
                  }}
                />
                <label htmlFor="rulesConfirm" className="text-xs text-amber-900 dark:text-amber-300 cursor-pointer font-medium leading-relaxed">
                  Saya <strong>sudah membaca, memahami, dan bersedia mematuhi</strong> seluruh Peraturan &amp; Tata Tertib Kosan KosanKu Pro sebagai penghuni.
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-check text-sm" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">Peraturan Sudah Dibaca &amp; Dipahami</p>
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-500">Terima kasih telah menyetujui tata tertib kosan kami.</p>
                </div>
                <button
                  onClick={() => { setRulesRead(false); try { localStorage.removeItem('kosanku_rules_read'); } catch {} }}
                  className="ml-auto text-[9px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Rent Payment & Add-On Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-credit-card text-purple-600 dark:text-purple-400" />
                  Tagihan Sewa &amp; Add-On Vendor Bulan Ini
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Jatuh tempo: {invoice.dueDate}</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300 rounded-full text-xs font-extrabold border border-amber-300 dark:border-amber-500/30">
                ⏳ {invoice.daysLeft} Hari Lagi
              </span>
            </div>

            {/* Rincian Tagihan Termasuk Add-On */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Sewa Kamar + Utilitas Base (Air/Listrik)</span>
                  <span className="text-[10px] text-slate-500">Kamar {roomInfo?.number || 'A-101'} • Kuota Laundry 5.0 kg</span>
                </div>
                <span className="font-black text-slate-900 dark:text-white text-sm">{formatIDR(invoice.amount)}</span>
              </div>

              {/* Add-On Services Billed by Vendor/Staff */}
              {addOns.length > 0 && (
                <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-500/20 space-y-2.5 text-xs">
                  <span className="text-[10px] font-extrabold text-purple-900 dark:text-purple-300 uppercase tracking-wider block">
                    ⚡ Biaya Kelebihan / Add-On Vendor Terakumulasi:
                  </span>
                  {addOns.map((add) => (
                    <div key={add.id} className="flex items-center justify-between font-medium text-slate-800 dark:text-slate-200">
                      <span>• {add.description}</span>
                      <span className="font-bold text-purple-700 dark:text-purple-300">+{formatIDR(add.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Grand Total Payment */}
            <div className="p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div>
                <span className="text-[10px] text-purple-200 uppercase font-bold tracking-wider block">Total Pembayaran Gabungan</span>
                <span className="text-xl sm:text-2xl font-black text-white">{formatIDR(grandTotalPayment)}</span>
                <span className="text-[10px] text-purple-300 block">Termasuk Sewa Base + {addOns.length} Item Add-On</span>
              </div>
              <button
                onClick={handlePayMidtrans}
                disabled={paying}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs shadow-lg hover:scale-105 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {paying ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-[#fa-bolt]" />}
                <span>Bayar 1-Klik via Midtrans Snap</span>
              </button>
            </div>

            {payError && (
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 text-center">{payError}</p>
            )}
          </div>

          {/* Past Payment Receipts History */}
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-receipt text-emerald-500" /> Riwayat Pembayaran Terakhir
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Sewa Juli 2026 + Add-On Refill Aqua</span>
                  <span className="text-[10px] text-slate-500">Lunas via Midtrans QRIS • 28 Juli 2026</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold rounded-lg text-[10px]">
                  SETTLED (Lunas)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Complaint Ticket Submission */}
        <div className="space-y-6">
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-headset text-rose-500" /> Form Lapor Kendala Kamar
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Keluhan *</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Kran Air Bocor / AC Berisik"
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Deskripsi Kendala *</label>
                <textarea
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Jelaskan kendala fasilitas di kamar Anda..."
                  className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Mengirim...' : 'Kirim Laporan Keluhan'}
              </button>
            </form>
          </div>

          {/* Ticket Status Tracker */}
          <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-ticket text-amber-500" /> Status Tiket Kendala Anda
            </h3>
            <div className="space-y-2 text-xs">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200/60 dark:border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
    </SequenceSaaSLayout>
  );
}
