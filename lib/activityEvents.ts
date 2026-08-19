// Clean in-memory persistent stores on Node.js runtime scoped per property
export const propertyApprovalsMap = new Map<string, any[]>();
export const propertyInspectionsMap = new Map<string, any[]>();
export const propertyNotifsMap = new Map<string, any[]>();

export const inMemoryOrders: any[] = [
  {
    id: 'REQ-9901',
    tenantName: 'dr. Rizky Pratama, Sp.A',
    roomNumber: 'EKS-01',
    category: 'GALON',
    item: 'Refill Air Galon Aqua 19L (1x)',
    notes: 'Kamar lantai 2, titip di depan pintu jika sedang visit RS.',
    status: 'PROCESSING',
    assignedStaff: 'Bambang (Staf Maintenance)',
    vendorName: 'Depot Air & Gas Suci',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'REQ-9902',
    tenantName: 'dr. Sarah Nabila (Residen Bedah)',
    roomNumber: 'EKS-02',
    category: 'LAUNDRY',
    item: 'Laundry Express Jas Dokter & Sprei 5kg',
    notes: 'Mohon setrika rapi & pewangi lavender.',
    status: 'DELIVERED',
    assignedStaff: 'Rudi (Staf Lapangan)',
    vendorName: 'Mitra Laundry Bersih Express',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export function pushSupplyOrder(order: any) {
  const existingIdx = inMemoryOrders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    inMemoryOrders[existingIdx] = { ...inMemoryOrders[existingIdx], ...order };
  } else {
    inMemoryOrders.unshift({
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
    });
  }
  return order;
}

export const INITIAL_WA_LIVE_LOGS: any[] = [
  {
    id: 'walog_init_01',
    timestamp: '01:34:20',
    date: new Date().toISOString(),
    phone: '082217415131',
    senderName: 'Owner Juragan Kost RSHS',
    detectedRole: 'OWNER',
    inboundText: 'Plot CMP-101 ke Bambang',
    replyText: '👨‍🔧 *Tugas Berhasil Di-Plotting!*\n• Pekerjaan: *CMP-101*\n• Ditugaskan ke: *Bambang*\n\nNotifikasi penugasan telah diteruskan ke WhatsApp staf terkait dan tercatat di tab Complaints Web Dashboard.',
    actionTaken: 'PLOT_TASK_CMP-101',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
  },
  {
    id: 'walog_init_02',
    timestamp: '01:34:10',
    date: new Date(Date.now() - 60000).toISOString(),
    phone: '082217415131',
    senderName: 'Owner Juragan Kost RSHS',
    detectedRole: 'OWNER',
    inboundText: '#owner rshs',
    replyText: '👑 *MODE OWNER AKTIF: JURAGAN KOST PASTEUR (DEPAN RSHS BANDUNG)*\nNomor Anda sekarang mengelola properti *Juragan Kost Pasteur (Depan RSHS Bandung)* (Data Live DB).\n\nSilakan coba fitur Owner:\n• *Kas* ➔ Cek omset, laba bersih & saldo kas.\n• *ACC APP-101* ➔ Setujui pengajuan dana staf.\n• *Plot CMP-101 ke Bambang* ➔ Tugaskan perbaikan keluhan tenant.',
    actionTaken: 'SWITCH_TO_OWNER',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
  },
  {
    id: 'walog_init_03',
    timestamp: '01:30:15',
    date: new Date(Date.now() - 300000).toISOString(),
    phone: '081234567890',
    senderName: 'dr. Rizky Pratama, Sp.A',
    detectedRole: 'TENANT',
    inboundText: 'Tagihan',
    replyText: '📋 *Rincian Tagihan Sewa Anda (Live DB)*\nPenghuni: *dr. Rizky Pratama, Sp.A*\nUnit: *Kamar EKS-01*\nNo. Invoice: *INV-20260701-0001*\n\n💵 *Sewa Kamar:* Rp 1.500.000\n🛍️ *Add-On / Suplai:* Rp 0 (Lunas)\n────────────────────────\n💰 *Total Pembayaran:* *Rp 1.500.000*\nJatuh Tempo: *28 Agustus 2026*\n\n👉 *Bayar Instan QRIS & VA Midtrans:*\nhttps://kosankupro.cloud/portal?invoice=INV-20260701-0001',
    actionTaken: 'VIEW_INVOICE',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
  },
  {
    id: 'walog_init_04',
    timestamp: '01:25:00',
    date: new Date(Date.now() - 600000).toISOString(),
    phone: '081398765432',
    senderName: 'Bambang Prasetyo (Staf RSHS)',
    detectedRole: 'STAFF',
    inboundText: 'SO 12 2 6',
    replyText: '📦 *Laporan Audit Stok Opname Fisik (SO) Berhasil!*\n🏢 Properti: *Juragan Kost Pasteur (Depan RSHS Bandung)*\nAuditor: *Bambang Prasetyo (Staf RSHS)*\n\n• Galon Air Mineral 19L: *12 unit* (Fisik: 12 | Selisih: 0)\n• Tabung Gas LPG 3Kg: *2 unit* (Fisik: 2 | Selisih: 0)\n• Set Sprei Dokter: *6 set* (Fisik: 6 | Selisih: 0)\n\n✅ Data langsung tersimpan di PostgreSQL & sinkron ke Web Dashboard.',
    actionTaken: 'STOCK_OPNAME_LOGGED',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
  },
  {
    id: 'walog_init_05',
    timestamp: '01:20:00',
    date: new Date(Date.now() - 900000).toISOString(),
    phone: '085712345678',
    senderName: 'Depot Air & Gas Suci',
    detectedRole: 'VENDOR_GALON',
    inboundText: 'Diantar REQ-9901',
    replyText: '💧 *Konfirmasi Pengantaran Galon Berhasil!*\nNo. Order: *REQ-9901*\nStatus: *DELIVERED (Selesai Diantar ke Kamar EKS-01)*\n\nNotifikasi otomatis dikirimkan ke WhatsApp dr. Rizky Pratama.',
    actionTaken: 'VENDOR_ORDER_DELIVERED',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
  },
  {
    id: 'walog_init_06',
    timestamp: '01:15:00',
    date: new Date(Date.now() - 1200000).toISOString(),
    phone: '081928374650',
    senderName: 'dr. Sarah Nabila (Residen Bedah)',
    detectedRole: 'LEAD',
    inboundText: '1',
    replyText: '🏥 *Daftar Kamar Tersedia di Juragan Kost Pasteur (Depan RSHS)*:\n\n1️⃣ *EKS-01 (Eksekutif Dokter)* — Rp 1.500.000/bln\nFasilitas: AC, Smart Lock, KM Dalam, Free Laundry 5kg\n\n2️⃣ *NYM-01 (Nyaman Comfort)* — Rp 1.200.000/bln\nFasilitas: AC, Meja Kerja, KM Luar Bersih, WiFi 100Mbps\n\nKetik *Booking EKS-01* untuk reservasi DP 50%.',
    actionTaken: 'LEAD_LIST_ROOMS',
    property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
  },
];

export const waLiveStreamLogs: any[] = [...INITIAL_WA_LIVE_LOGS];

// Helper to push a notification safely
export function pushActivityNotification(
  propertySlug: string = 'default',
  notif: {
    id?: string;
    title: string;
    message: string;
    targetRole?: string[];
    targetTab?: string;
    badgeColor?: string;
    metadata?: any;
  }
) {
  const existingNotifs = propertyNotifsMap.get(propertySlug) || [];
  const fullNotif = {
    ...notif,
    createdAt: new Date().toISOString(),
    id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  };
  propertyNotifsMap.set(propertySlug, [fullNotif, ...existingNotifs.filter((n) => n.id !== fullNotif.id)].slice(0, 50));
  return fullNotif;
}

// Helper to push WhatsApp live stream event
export function pushWaLiveLog(log: {
  phone: string;
  senderName: string;
  detectedRole: string;
  inboundText: string;
  replyText: string;
  actionTaken?: string;
  property?: string;
}) {
  const entry = {
    id: `walog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: new Date().toISOString(),
    ...log,
  };
  waLiveStreamLogs.unshift(entry);
  if (waLiveStreamLogs.length > 100) waLiveStreamLogs.pop();
  return entry;
}
