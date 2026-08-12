'use client';

import { useState, useEffect } from 'react';
import SequenceSaaSLayout from './SequenceSaaSLayout';
import type { RoleType } from '@/app/page';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  rooms?: { id: string; number: string; type: string; price: number }[];
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
  const [activeTab, setActiveTab] = useState('invoices');
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

  const tenantName = user?.name || 'Budi Santoso';
  const roomInfo = user?.rooms?.[0];

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

  const totalAddons = addOns.reduce((acc, item) => acc + item.amount, 0);
  const grandTotalPayment = invoice.amount + totalAddons;

  const handleSubmitComplaint = async (e: React.FormEvent) => {
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
        alert('✅ Tiket kendala berhasil dikirim ke Pengelola Kos!');
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
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t)}
    >
      <div className="space-y-6 sm:space-y-8 text-slate-900 dark:text-white transition-colors">
        
        {/* Welcome Banner */}
        <div className="neu-card p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Selamat Datang, {tenantName}! 👋
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Penghuni Kamar <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{roomInfo?.number || 'A-101'}</strong> ({roomInfo?.type || 'Deluxe Studio Smart'})
            </p>
          </div>
        </div>

        {/* ===== TAB 1: KAMAR SAYA & SMART LOCK ===== */}
        {activeTab === 'rooms_ai' && (
          <div className="space-y-6 animate-fade-in">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                    🚪 Smart Key &amp; Access Control
                  </span>
                  <h3 className="text-xl font-black mt-1">Kamar {roomInfo?.number || 'A-101'} — {roomInfo?.type || 'Deluxe Studio Smart'}</h3>
                  <p className="text-xs text-slate-500">Lantai 1 • KosanKu Pro Residence Bandung</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5">
                  <i className="fa-solid fa-lock" /> Smart Lock Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white space-y-4 shadow-xl neu-card">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">KUNCI DIGITAL KAMAR</span>
                    <i className="fa-solid fa-key text-emerald-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">Buka Pintu Kamar A-101</h4>
                    <p className="text-xs text-slate-300 mt-1">Tekan tombol di bawah untuk membuka pintu pintar via IoT Smart Lock.</p>
                  </div>
                  <button
                    onClick={() => alert('🔓 PIN Kunci Digital Dikirim: Pintu Kamar A-101 BERHASIL DIBUKA!')}
                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-sm tracking-wide shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-lock-open text-lg" />
                    <span>BUKA PINTU KAMAR (1-KLIK)</span>
                  </button>
                </div>

                <div className="neu-inset p-6 rounded-3xl space-y-3 text-xs">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-emerald-500" /> Fasilitas Kamar Anda
                  </h4>
                  <ul className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 font-medium">
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-snowflake text-blue-500" /> AC Studio 1 PK</li>
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-wifi text-emerald-500" /> High-Speed Wi-Fi 6</li>
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-shower text-teal-500" /> KM Dalam &amp; Water Heater</li>
                    <li className="flex items-center gap-1.5"><i className="fa-solid fa-tv text-purple-500" /> Smart TV 43 Inch</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 2: ADD-ON REFILL & SERVICES ===== */}
        {activeTab === 'tenant_requests' && (
          <div className="space-y-6 animate-fade-in">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-[10px]">
                    🏪 Vendor Refill &amp; Service
                  </span>
                  <h3 className="text-xl font-black mt-1">Pesan Suplai Galon, LPG &amp; Laundry</h3>
                  <p className="text-xs text-slate-500">Order diantar langsung ke kamar oleh Vendor Mitra Kosan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="neu-card-sm p-5 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-bottle-water" />
                  </div>
                  <h4 className="font-black text-sm">Refill Air Galon Aqua</h4>
                  <p className="text-xs text-slate-500">Rp 20.000 / Galon (Termasuk Antar)</p>
                  <button
                    onClick={() => alert('✅ Pesanan Air Galon Aqua dikirim ke Vendor! Billing otomatis ditambahkan ke invoice.')}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Pesan 1 Galon
                  </button>
                </div>

                <div className="neu-card-sm p-5 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-shirt" />
                  </div>
                  <h4 className="font-black text-sm">Laundry Express 1-Day</h4>
                  <p className="text-xs text-slate-500">Rp 8.000 / kg (Jemput &amp; Antar Lipat)</p>
                  <button
                    onClick={() => alert('✅ Permintaan Penjemputan Laundry dikirim ke Vendor Suci Express!')}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Jemput Laundry
                  </button>
                </div>

                <div className="neu-card-sm p-5 rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-fire-flame-simple" />
                  </div>
                  <h4 className="font-black text-sm">Tabung Gas Bright 5.5kg</h4>
                  <p className="text-xs text-slate-500">Rp 110.000 / Tabung</p>
                  <button
                    onClick={() => alert('✅ Pesanan Gas Bright dikirim ke Vendor!')}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Pesan Gas
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 3: TAGIHAN SEWA & MIDTRANS ===== */}
        {(activeTab === 'invoices' || !activeTab) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">INVOICE SEWA TERBIT</span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{invoice.id}</h3>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-extrabold rounded-full text-xs animate-pulse">
                    Jatuh Tempo: {invoice.dueDate}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-200/50 dark:border-white/5 font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Sewa Kamar {roomInfo?.number || 'A-101'} (Agustus 2026)</span>
                    <span className="font-black text-slate-900 dark:text-white">{formatIDR(invoice.amount)}</span>
                  </div>

                  {addOns.map((add) => (
                    <div key={add.id} className="flex justify-between py-2 border-b border-slate-200/50 dark:border-white/5 font-medium text-purple-700 dark:text-purple-300">
                      <span>+ {add.description}</span>
                      <span className="font-bold">{formatIDR(add.amount)}</span>
                    </div>
                  ))}
                </div>

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
                    {paying ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-bolt" />}
                    <span>Bayar 1-Klik via Midtrans Snap</span>
                  </button>
                </div>

                {payError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 text-center">{payError}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="neu-card p-6 rounded-3xl space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <i className="fa-solid fa-headset text-rose-500" /> Form Lapor Kendala Kamar
                </h3>
                <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Judul Keluhan *</label>
                    <input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="cth: Kran Air Bocor / AC Berisik"
                      className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors"
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
                      className="w-full p-3 neu-input rounded-xl text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors resize-none"
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
            </div>
          </div>
        )}

        {/* ===== TAB 4: TIKET KELUHAN DEDICATED PAGE ===== */}
        {activeTab === 'complaints' && (
          <div className="space-y-6 animate-fade-in">
            <div className="neu-card p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-headset text-purple-500" /> Riwayat &amp; Pengajuan Tiket Kendala Kamar
              </h3>
              
              <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs neu-inset p-5 rounded-2xl">
                <div>
                  <label className="font-bold block mb-1">Judul Keluhan Baru *</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="cth: Lampu Kamar Mandi Mati"
                    className="w-full p-3 neu-input rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Rincian Kendala *</label>
                  <textarea
                    required
                    rows={2}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Tuliskan lokasi & detail masalah..."
                    className="w-full p-3 neu-input rounded-xl outline-none resize-none"
                  />
                </div>
                <button type="submit" disabled={submitting} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md cursor-pointer">
                  Kirim Tiket Perbaikan
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Daftar Tiket Terdaftar</h4>
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 neu-card-sm rounded-2xl flex items-center justify-between">
                    <div>
                      <h5 className="font-black text-sm">{t.title}</h5>
                      <p className="text-xs text-slate-500">{t.desc}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </SequenceSaaSLayout>
  );
}
