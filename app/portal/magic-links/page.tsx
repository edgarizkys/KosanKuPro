'use client';
import React, { useState } from 'react';

interface MagicLink {
  id: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
  url: string;
  role: string;
  params?: string;
}

export default function MagicLinkDirectoryPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('SEMUA');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://kosankupro.cloud';

  const links: MagicLink[] = [
    // OWNER
    { id: 'owner-report', label: 'Laporan Keuangan Eksekutif', desc: 'P&L, kas, dan okupansi real-time', icon: 'fa-chart-bar', color: 'text-[#047857]', role: 'OWNER', url: `${BASE}/portal/owner-report`, params: '?property=Juragan+Kost+Pasteur' },
    { id: 'owner-compare', label: 'Perbandingan Multi-Properti', desc: 'Perbandingan semua cabang kosan', icon: 'fa-chart-bar', color: 'text-[#047857]', role: 'OWNER', url: `${BASE}/portal/owner-compare`, params: '?properties=rshs,dago,suci' },
    { id: 'approve', label: 'Otorisasi Pengajuan Dana', desc: '1-klik setujui pengajuan dari staf', icon: 'fa-stamp', color: 'text-[#047857]', role: 'OWNER', url: `${BASE}/portal/approve`, params: '?id=APP-001&amount=240000&staff=Bambang' },
    { id: 'announcement', label: 'Broadcast Pengumuman', desc: 'Kirim pengumuman ke semua penghuni', icon: 'fa-bullhorn', color: 'text-[#047857]', role: 'OWNER', url: `${BASE}/portal/announcement`, params: '?property=Juragan+Kost+Pasteur' },
    { id: 'sign-contract', label: 'Kontrak Sewa Digital (Lama)', desc: 'TTD kontrak sewa elektronik tenant baru', icon: 'fa-file-signature', color: 'text-[#047857]', role: 'OWNER', url: `${BASE}/portal/sign-contract`, params: '?tenant=dr.+Ahmad&room=EKS-01&price=1500000&duration=12' },
    { id: 'agreement', label: 'Surat Perjanjian Sewa Resmi (E-Sign)', desc: 'Dokumen perjanjian hukum resmi + E-Signature Canvas', icon: 'fa-file-contract', color: 'text-[#047857]', role: 'OWNER', url: `${BASE}/portal/agreement`, params: '?tenant=dr.+Rizky+Pratama&room=EKS-01&rent=2200000' },
    // TENANT
    { id: 'invoice', label: 'Invoice & Pembayaran QRIS', desc: 'Tagihan sewa + bayar QRIS/VA', icon: 'fa-file-invoice-dollar', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/invoice`, params: '?invoice=INV-20260801-0001' },
    { id: 'smartlock', label: 'Kunci Smart Lock IoT', desc: 'Buka pintu kamar via mobile', icon: 'fa-key', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/smartlock`, params: '?room=EKS-01&tenant=dr.+Rizky' },
    { id: 'complaint', label: 'Form Komplain Kerusakan', desc: 'Laporkan kerusakan fasilitas kamar', icon: 'fa-screwdriver-wrench', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/complaint`, params: '?room=EKS-01&tenant=dr.+Rizky' },
    { id: 'payment-history', label: 'Riwayat Tagihan PDF', desc: 'Semua riwayat bayar sewa tenant', icon: 'fa-receipt', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/payment-history`, params: '?tenant=dr.+Rizky&room=EKS-01' },
    { id: 'rate', label: 'Rating Layanan Staf', desc: 'Bintang & ulasan setelah perbaikan', icon: 'fa-star', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/rate`, params: '?task=CMP-101&staff=Bambang&tenant=dr.+Rizky' },
    { id: 'renew', label: 'Perpanjang Kontrak Sewa', desc: 'Pilih durasi & bayar DP perpanjangan', icon: 'fa-rotate', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/renew`, params: '?tenant=dr.+Rizky&room=EKS-01&price=1500000' },
    { id: 'tenant-statement', label: 'Rekap Pengeluaran Bulanan', desc: 'Sewa + galon + laundry + makan', icon: 'fa-chart-pie', color: 'text-blue-600', role: 'TENANT', url: `${BASE}/portal/tenant-statement`, params: '?tenant=dr.+Rizky&room=EKS-01' },
    // LEAD
    { id: 'booking', label: 'Virtual Showroom & Booking', desc: 'Listing kamar + DP 50% QRIS', icon: 'fa-house-chimney', color: 'text-purple-600', role: 'LEAD', url: `${BASE}/portal/booking`, params: '' },
    { id: 'lead', label: 'Registrasi Penghuni Baru', desc: 'Form KTP + profesi + rencana sewa', icon: 'fa-user-plus', color: 'text-purple-600', role: 'LEAD', url: `${BASE}/portal/lead`, params: '?room=EKS-01&property=Juragan+Kost+Pasteur' },
    { id: 'survey-schedule', label: 'Jadwal Survei Kosan', desc: 'Booking hari & jam kunjungan survei', icon: 'fa-calendar-plus', color: 'text-purple-600', role: 'LEAD', url: `${BASE}/portal/survey-schedule`, params: '?property=Juragan+Kost+Pasteur' },
    { id: 'cost-simulator', label: 'Simulasi Biaya Kos', desc: 'Hitung total biaya sewa + addon', icon: 'fa-calculator', color: 'text-purple-600', role: 'LEAD', url: `${BASE}/portal/cost-simulator`, params: '?property=Juragan+Kost+Pasteur' },
    // VENDOR
    { id: 'dispatch', label: 'Lembar Pengantaran Vendor', desc: 'Work order + konfirmasi selesai antar', icon: 'fa-truck-fast', color: 'text-orange-500', role: 'VENDOR', url: `${BASE}/portal/dispatch`, params: '?id=REQ-001&vendor=Depot+Air&item=Galon+19L&room=EKS-01' },
    { id: 'vendor-settlement', label: 'Rekap Pencairan Dana Vendor', desc: 'Tagihan & pencairan per periode', icon: 'fa-money-bill-transfer', color: 'text-orange-500', role: 'VENDOR', url: `${BASE}/portal/vendor-settlement`, params: '?vendor=Depot+Air&balance=480000' },
    { id: 'vendor-catalog', label: 'Katalog Produk Vendor', desc: 'Menu & harga + add-to-cart mini', icon: 'fa-store', color: 'text-orange-500', role: 'VENDOR', url: `${BASE}/portal/vendor-catalog`, params: '?vendor=Depot+Air&room=EKS-01' },
    { id: 'vendor-stats', label: 'Statistik Penjualan Vendor', desc: 'Total order, pencairan bulan ini', icon: 'fa-chart-line', color: 'text-orange-500', role: 'VENDOR', url: `${BASE}/portal/vendor-stats`, params: '?vendor=Depot+Air&month=2026-08' },
    // STAFF
    { id: 'form', label: 'Form Lapangan Staf (SO/Cek/Dana)', desc: 'SO, Check-in/out, Pengajuan dana', icon: 'fa-person-digging', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/form`, params: '?staff=Bambang&type=SO' },
    { id: 'staff-task', label: 'Work Order / Lembar Kerja', desc: 'Detail tugas + update status selesai', icon: 'fa-clipboard-list', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/staff-task`, params: '?id=CMP-101&staff=Bambang&title=Servis+AC&room=EKS-01' },
    { id: 'inspection', label: 'Inspeksi Kamar Check-in/out', desc: 'Checklist fisik fasilitas kamar', icon: 'fa-clipboard-check', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/inspection`, params: '?room=EKS-01&tenant=dr.+Rizky&type=CHECK_IN' },
    { id: 'track', label: 'Live Tracking Pengantaran', desc: 'Progress real-time order vendor', icon: 'fa-location-arrow', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/track`, params: '?id=REQ-001&item=Galon&room=EKS-01' },
    { id: 'schedule', label: 'Jadwal Shift Staf Mingguan', desc: 'Shift, tugas, dan hari libur staf', icon: 'fa-calendar-week', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/schedule`, params: '?staff=Bambang&phone=08xxx' },
    { id: 'payslip', label: 'Slip Gaji Digital Staf', desc: 'Komponen gaji + cetak PDF', icon: 'fa-money-check-dollar', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/payslip`, params: '?staff=Bambang&month=2026-08' },
    { id: 'proof-upload', label: 'Upload Foto Bukti Kerja', desc: 'Foto bukti pekerjaan selesai ke owner', icon: 'fa-camera', color: 'text-amber-500', role: 'STAFF', url: `${BASE}/portal/proof-upload`, params: '?task=CMP-101&staff=Bambang&room=EKS-01' },
  ];

  const roles = ['SEMUA', 'OWNER', 'TENANT', 'LEAD', 'VENDOR', 'STAFF'];
  const roleColors: Record<string, string> = {
    SEMUA: 'text-slate-600 dark:text-slate-300',
    OWNER: 'text-[#047857]',
    TENANT: 'text-blue-600',
    LEAD: 'text-purple-600',
    VENDOR: 'text-orange-500',
    STAFF: 'text-amber-500',
  };
  const roleBg: Record<string, string> = {
    OWNER: 'bg-emerald-500/10 border-emerald-500/20 text-[#047857]',
    TENANT: 'bg-blue-500/10 border-blue-500/20 text-blue-600',
    LEAD: 'bg-purple-500/10 border-purple-500/20 text-purple-600',
    VENDOR: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    STAFF: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
  };

  const filtered = links.filter(l => {
    const matchRole = filterRole === 'SEMUA' || l.role === filterRole;
    const matchSearch = !search || l.label.toLowerCase().includes(search.toLowerCase()) || l.desc.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const copyLink = (link: MagicLink) => {
    navigator.clipboard.writeText(link.url + (link.params || ''));
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openLink = (link: MagicLink) => {
    window.open(link.url + (link.params || ''), '_blank');
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 font-sans antialiased">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-link text-xs" />
            <span>SUPERADMIN — KOSANKUPRO.CLOUD</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">🔗 Direktori Magic Link</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Semua portal yang dapat dikirim via WhatsApp ke pengguna sesuai role
          </p>
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold">
            <i className="fa-solid fa-lock text-xs" /> Hanya terlihat di dashboard KosanKu Pro (superadmin)
          </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="neu-inset rounded-2xl p-3 flex items-center gap-2">
            <i className="fa-solid fa-search text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Cari magic link..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm text-slate-800 dark:text-white bg-transparent outline-none placeholder-slate-400 font-semibold"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${filterRole === r ? 'neu-card ' + roleColors[r] : 'neu-inset text-slate-400'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-2">
          {roles.slice(1).map(r => (
            <div key={r} className="neu-inset rounded-xl p-2 text-center">
              <div className={`text-sm font-black ${roleColors[r]}`}>
                {links.filter(l => l.role === r).length}
              </div>
              <div className="text-[9px] text-slate-400">{r}</div>
            </div>
          ))}
        </div>

        {/* Link List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="neu-card rounded-2xl p-8 text-center text-slate-400">
              <i className="fa-solid fa-search text-2xl mb-2 block" />
              <p className="text-sm font-bold">Tidak ada magic link yang cocok</p>
            </div>
          )}
          {filtered.map(link => (
            <div key={link.id} className="neu-card rounded-2xl p-4 flex items-center gap-3">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl neu-inset flex-shrink-0 flex items-center justify-center ${link.color}`}>
                <i className={`fa-solid ${link.icon} text-sm`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-slate-800 dark:text-white">{link.label}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${roleBg[link.role]}`}>{link.role}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{link.desc}</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono mt-0.5 truncate">/portal/{link.id}{link.params}</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => copyLink(link)}
                  className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center cursor-pointer transition-all"
                  title="Salin link"
                >
                  <i className={`fa-solid ${copiedId === link.id ? 'fa-check text-[#047857]' : 'fa-copy text-slate-400'} text-xs`} />
                </button>
                <button
                  onClick={() => openLink(link)}
                  className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center cursor-pointer"
                  title="Buka link"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square text-xs text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-slate-400 pb-6">
          {filtered.length} dari {links.length} magic link • KosanKu Pro SuperAdmin
        </div>
      </div>
    </div>
  );
}
