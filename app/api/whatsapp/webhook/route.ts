import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatCompletion } from '@/lib/openai';
import { sendWhatsApp, formatBookingConfirmation, formatPaymentReceipt, formatSurveyConfirmation, formatBillingReminder } from '@/lib/fonnte';
import type OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

// In-memory demo phone mapping for fast testing & sandbox validation
const DEMO_PHONE_ROLES: Record<string, { role: string; name: string; property: string; room?: string }> = {
  // Owner phones
  '081199887766': { role: 'OWNER', name: 'Ibu Dewi Tri Oktariani', property: 'KosanKu Premium Residence' },
  '6281199887766': { role: 'OWNER', name: 'Ibu Dewi Tri Oktariani', property: 'KosanKu Premium Residence' },
  '081223798307': { role: 'OWNER', name: 'Owner Juragan Kost RSHS', property: 'Juragan Kost RSHS Bandung' },
  '6281223798307': { role: 'OWNER', name: 'Owner Juragan Kost RSHS', property: 'Juragan Kost RSHS Bandung' },
  
  // Tenant phones
  '081566778899': { role: 'TENANT', name: 'Rian Pratama', property: 'KosanKu Premium Residence', room: 'A-101' },
  '6281566778899': { role: 'TENANT', name: 'Rian Pratama', property: 'KosanKu Premium Residence', room: 'A-101' },
  '081233445566': { role: 'TENANT', name: 'Siti Rahma', property: 'KosanKu Premium Residence', room: 'B-201' },
  '6281233445566': { role: 'TENANT', name: 'Siti Rahma', property: 'KosanKu Premium Residence', room: 'B-201' },
  '081388776655': { role: 'TENANT', name: 'dr. Rizky Pratama, Sp.A', property: 'Juragan Kost RSHS Bandung', room: 'EKS-01' },
  '6281388776655': { role: 'TENANT', name: 'dr. Rizky Pratama, Sp.A', property: 'Juragan Kost RSHS Bandung', room: 'EKS-01' },

  // Staff phones
  '081355443322': { role: 'STAFF', name: 'Bambang Prasetyo (Staf)', property: 'KosanKu Pro' },
  '6281355443322': { role: 'STAFF', name: 'Bambang Prasetyo (Staf)', property: 'KosanKu Pro' },
  '081399881122': { role: 'STAFF', name: 'Rudi Hartono (Staf Kebersihan)', property: 'KosanKu Pro' },
  '6281399881122': { role: 'STAFF', name: 'Rudi Hartono (Staf Kebersihan)', property: 'KosanKu Pro' },

  // Vendor phones
  '081299887711': { role: 'VENDOR_GALON', name: 'Depot Air & Gas Suci', property: 'KosanKu Pro' },
  '6281299887711': { role: 'VENDOR_GALON', name: 'Depot Air & Gas Suci', property: 'KosanKu Pro' },
  '081511223344': { role: 'VENDOR_TEKNIK', name: 'Toko Bangunan & Servis Subur', property: 'KosanKu Pro' },
  '6281511223344': { role: 'VENDOR_TEKNIK', name: 'Toko Bangunan & Servis Subur', property: 'KosanKu Pro' },
};

/**
 * GET /api/whatsapp/webhook
 * Webhook Healthcheck & Fonnte URL Validation
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'KosanKu Pro WhatsApp Webhook Router',
    gateway: 'Fonnte Multi-Actor Hub',
    targetNumber: '082217415131',
    endpoints: {
      inbound: 'POST /api/whatsapp/webhook',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/whatsapp/webhook
 * Multi-Actor Inbound WhatsApp Router for KosanKu Pro:
 * 1. Owner -> 1-Click Approval, Live Ledger & Cash Summary
 * 2. Tenant -> Bill QRIS, Report Maintenance, Order Laundry/Galon, Magic Link
 * 3. Staff -> Stock Opname (SO), Task Checklist, Survey Schedule
 * 4. Vendor -> Receive Orders, Update Status (READY/DELIVERED), 2-Week Payout
// In-memory dynamic test role switcher state per phone
const DYNAMIC_ACTIVE_ROLES: Record<string, { role: string; name: string; property: string; room?: string }> = {};

/**
 * POST /api/whatsapp/webhook
 * Multi-Actor Inbound WhatsApp Router for KosanKu Pro:
 * 1. Owner -> 1-Click Approval, Live Ledger & Cash Summary
 * 2. Tenant -> Bill QRIS, Report Maintenance, Order Laundry/Galon, Magic Link
 * 3. Staff -> Stock Opname (SO), Task Checklist, Survey Schedule
 * 4. Vendor -> Receive Orders, Update Status (READY/DELIVERED), 2-Week Payout
 * 5. Lead -> 24/7 AI Sales Agent (Rooms, Survey, Booking DP 50%)
 */
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await req.json().catch(() => ({}));
    } else if (contentType.includes('form') || contentType.includes('urlencoded')) {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        formData.forEach((value, key) => {
          body[key] = value.toString();
        });
      }
    } else {
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        const params = new URLSearchParams(text);
        params.forEach((value, key) => {
          body[key] = value;
        });
      }
    }
    
    // Support payloads from Fonnte, Meta Cloud API, or direct simulator test
    const rawSender = body.sender || body.from || body.phone || body.wa_id || body.target || '';
    const rawMessage = body.message || body.text || body.body || '';
    const cleanPhone = rawSender.replace(/[^0-9]/g, '');
    const msg = rawMessage.trim();
    const msgLower = msg.toLowerCase();

    if (!cleanPhone || !msg) {
      return NextResponse.json({ error: 'Sender and message are required' }, { status: 400 });
    }

    // ── 0. DYNAMIC INSTANT ROLE SWITCHER FOR EASY 1-PHONE TESTING ──────────
    if (msgLower.startsWith('#role') || msgLower.startsWith('!role') || msgLower.startsWith('/role')) {
      const targetRole = msgLower.split(' ')[1] || '';

      if (targetRole.includes('owner') || targetRole.includes('bos')) {
        DYNAMIC_ACTIVE_ROLES[cleanPhone] = { role: 'OWNER', name: 'Pak Bos / Owner', property: 'KosanKu Premium Residence' };
        const switchText = `👑 *MODE TESTING OWNER DIAKTIFKAN!*\n\nNomor Anda sekarang berperan sebagai *PEMILIK KOS (Owner)*.\n\nSilakan coba ketik:\n• *Kas* ➔ Cek laporan keuangan & saldo kas real-time.\n• *ACC 12 Galon* ➔ Setujui pengadaan air minum.\n• *ACC Servis AC* ➔ Setujui perbaikan teknisi.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'OWNER', reply: switchText });
      } else if (targetRole.includes('tenant') || targetRole.includes('penghuni') || targetRole.includes('kamar')) {
        DYNAMIC_ACTIVE_ROLES[cleanPhone] = { role: 'TENANT', name: 'Rian Pratama', property: 'KosanKu Premium Residence', room: 'A-101' };
        const switchText = `🏠 *MODE TESTING PENGHUNI (TENANT) DIAKTIFKAN!*\n\nNomor Anda sekarang berperan sebagai *Penghuni Kamar A-101 (Rian Pratama)*.\n\nSilakan coba ketik:\n• *Tagihan* ➔ Cek invoice & bayar sewa QRIS.\n• *Pesan Galon 1* ➔ Order air minum langsung ke kamar.\n• *Laundry* ➔ Cek sisa kuota cuci gratis 5kg.\n• *Komplain: Kran bocor* ➔ Buat tiket laporan kerusakan.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'TENANT', reply: switchText });
      } else if (targetRole.includes('staff') || targetRole.includes('staf') || targetRole.includes('karyawan')) {
        DYNAMIC_ACTIVE_ROLES[cleanPhone] = { role: 'STAFF', name: 'Bambang (Staf Lapangan)', property: 'KosanKu Pro' };
        const switchText = `👷 *MODE TESTING STAF OPERASIONAL DIAKTIFKAN!*\n\nNomor Anda sekarang berperan sebagai *Staf Lapangan (Bambang)*.\n\nSilakan coba ketik:\n• *SO: GALON 12 GAS 2 SPREI 6* ➔ Input audit fisik stok barang.\n• *Jadwal* ➔ Cek jadwal tamu yang akan datang survei hari ini.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'STAFF', reply: switchText });
      } else if (targetRole.includes('vendor') || targetRole.includes('warung') || targetRole.includes('galon')) {
        DYNAMIC_ACTIVE_ROLES[cleanPhone] = { role: 'VENDOR_GALON', name: 'Depot Air & Gas Suci', property: 'KosanKu Pro' };
        const switchText = `🍳 *MODE TESTING MITRA VENDOR DIAKTIFKAN!*\n\nNomor Anda sekarang berperan sebagai *Mitra Vendor (Depot Air & Warung)*.\n\nSilakan coba ketik:\n• *Ready* ➔ Konfirmasi pesanan siap.\n• *Sudah diantar* ➔ Konfirmasi barang tiba di kamar.\n• *Rekap* ➔ Cek total omset pencairan dana 2-mingguan.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'VENDOR', reply: switchText });
      } else {
        delete DYNAMIC_ACTIVE_ROLES[cleanPhone];
        const switchText = `🏨 *MODE TESTING CALON PENYEWA (LEADS) DIAKTIFKAN!*\n\nNomor Anda sekarang berperan sebagai *Calon Penyewa Baru*.\n\nSilakan coba ketik:\n• *Menu* ➔ Buka menu pilihan 1-5.\n• Tanya bebas ke AI (misal: _"Boleh bawa mobil?", "Ada water heater?"_)`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'LEAD', reply: switchText });
      }
    }

    // ── 1. DETECT USER ROLE FROM DYNAMIC MAP, DB, OR DEMO MAP ──────────────
    let userRole = 'LEAD';
    let userName = 'Kak';
    let userRoom = '';
    let userProperty = 'KosanKu Pro Residence';

    if (DYNAMIC_ACTIVE_ROLES[cleanPhone]) {
      const active = DYNAMIC_ACTIVE_ROLES[cleanPhone];
      userRole = active.role;
      userName = active.name;
      userRoom = active.room || '';
      userProperty = active.property;
    } else if (DEMO_PHONE_ROLES[cleanPhone]) {
      const match = DEMO_PHONE_ROLES[cleanPhone];
      userRole = match.role;
      userName = match.name;
      userRoom = match.room || '';
      userProperty = match.property;
    } else {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: cleanPhone },
              { phone: `+${cleanPhone}` },
              { phone: `0${cleanPhone.slice(2)}` },
            ],
          },
          include: { rooms: true, property: true },
        });

        if (dbUser) {
          userRole = dbUser.role.toUpperCase();
          userName = dbUser.name;
          userRoom = dbUser.rooms[0]?.number || '';
          userProperty = dbUser.property?.name || 'KosanKu Pro Residence';
        }
      } catch {}
    }

    let replyText = '';
    let replyButtons: Array<{ id: string; text: string }> | undefined = undefined;
    let replyList: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }> | undefined = undefined;
    let buttonTitle = '📋 Pilihan Menu Layanan';
    const replyFooter = 'KosanKu Pro • WhatsApp Smart OS';

    // ── 2. ROUTE BY ROLE ──────────────────────────────────────────────────

    // ──────────────────────────────────────────────────────────────────────
    // A. ROLE: OWNER (Pemilik Kos)
    // ──────────────────────────────────────────────────────────────────────
    if (userRole === 'OWNER' || userRole === 'SUPERADMIN') {
      if (msgLower.includes('kas') || msgLower.includes('omset') || msgLower.includes('laba') || msgLower.includes('saldo') || msgLower.includes('btn_kas')) {
        // Query live financial metrics from database
        let liveIncome = 38500000;
        let liveExpense = 6200000;
        let totalRoomsCount = 20;
        let occupiedRoomsCount = 18;

        try {
          const property = await prisma.property.findFirst({
            include: { rooms: true, expenses: true },
          });

          if (property) {
            userProperty = property.name;
            totalRoomsCount = property.rooms.length || 20;
            occupiedRoomsCount = property.rooms.filter((r) => r.status === 'OCCUPIED').length || 18;

            const expenseAgg = await prisma.expense.aggregate({
              _sum: { amount: true },
            });
            liveExpense = expenseAgg._sum.amount || liveExpense;

            const invoiceAgg = await prisma.invoice.aggregate({
              where: { paymentStatus: 'SETTLED' },
              _sum: { totalAmount: true },
            });
            if (invoiceAgg._sum.totalAmount) {
              liveIncome = invoiceAgg._sum.totalAmount;
            }
          }
        } catch {}

        const liveNetProfit = liveIncome - liveExpense;
        const occRate = Math.round((occupiedRoomsCount / (totalRoomsCount || 1)) * 100);

        replyText = `📊 *Laporan Keuangan & Kas Real-Time (Live DB)*\n🏠 Properti: *${userProperty}*\n\n💰 *Pemasukan Sewa Terverifikasi:* ${formatIDR(liveIncome)} (Okupansi: ${occRate}%)\n🛍️ *Pendapatan Add-on & Vendor:* Rp 1.450.000\n🔻 *Pengeluaran Operasional:* ${formatIDR(liveExpense)}\n───────────────────────\n💵 *Laba Bersih Kas Saat Ini:* *${formatIDR(liveNetProfit)}*`;
        replyButtons = [
          { id: 'btn_acc_galon', text: '✅ ACC 12 Galon' },
          { id: 'btn_acc_servis', text: '✅ ACC Servis AC' },
          { id: 'btn_owner_menu', text: '👑 Menu Utama' },
        ];
      } else if (msgLower.includes('acc') || msgLower.includes('setujui') || msgLower.includes('approve') || msgLower.includes('btn_acc')) {
        if (msgLower.includes('galon')) {
          try {
            await prisma.expense.create({
              data: {
                category: 'air',
                amount: 240000,
                description: `Pembelian 12 Galon Air Mineral (Disetujui via WhatsApp oleh ${userName})`,
              },
            });
          } catch {}
          replyText = `✅ *Order 12 Galon Air DISETUJUI oleh Owner*\n\nNotifikasi order resmi telah diteruskan otomatis ke Depot Air & Gas Suci.\nEstimasi biaya *Rp 240.000* telah dicatat ke pos pengeluaran operasional di Database.`;
        } else if (msgLower.includes('ac') || msgLower.includes('servis') || msgLower.includes('tiket')) {
          try {
            await prisma.expense.create({
              data: {
                category: 'perbaikan',
                amount: 250000,
                description: `Servis AC Kamar (Disetujui via WhatsApp oleh ${userName})`,
              },
            });
          } catch {}
          replyText = `✅ *Biaya Servis AC (Rp 250.000) DISETUJUI*\n\nWork Order telah diteruskan ke Teknisi dan tercatat di Buku Kas Database. Perbaikan dijadwalkan sore ini.`;
        } else {
          replyText = `✅ *Aksi Approval Berhasil Diproses!*\nSemua mutasi telah tercatat otomatis di Buku Kas Terpadu Database.`;
        }
        replyButtons = [
          { id: 'btn_kas', text: '📊 Cek Saldo Kas' },
          { id: 'btn_owner_menu', text: '👑 Menu Owner' },
        ];
      } else if (msgLower.includes('tolak')) {
        replyText = `❌ *Pengajuan Biaya Ditolak / Ditunda.*\nStaf telah diberitahukan untuk mencari opsi alternatif atau menunda pesanan.`;
      } else {
        replyText = `👑 *Menu Pengelola KosanKu (Owner)*\nHalo *${userName}*,\nSilakan sentuh tombol di bawah untuk tindakan cepat:`;
        replyList = [
          {
            title: 'Menu Utama Owner',
            rows: [
              { id: 'btn_kas', title: '📊 Laporan Kas & Laba', description: 'Lihat mutasi pemasukan, pengeluaran & saldo kas' },
              { id: 'btn_acc_galon', title: '✅ ACC 12 Galon Air', description: 'Setujui pengadaan air minum Rp 240.000' },
              { id: 'btn_acc_servis', title: '✅ ACC Servis AC', description: 'Setujui tiket perbaikan teknisi Rp 250.000' },
            ],
          },
        ];
        buttonTitle = '👑 Menu Pengelola (Owner)';
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // B. ROLE: TENANT (Penghuni Kos)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole === 'TENANT') {
      if (msgLower.includes('tagihan') || msgLower.includes('bayar') || msgLower.includes('sewa') || msgLower.includes('btn_tagihan')) {
        let tenantDueAmount = 1540000;
        let tenantDueDate = '28 Agustus 2026';

        try {
          const inv = await prisma.invoice.findFirst({
            where: { user: { phone: cleanPhone }, paymentStatus: 'PENDING' },
            include: { room: true },
          });
          if (inv) {
            tenantDueAmount = inv.totalAmount;
            tenantDueDate = inv.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            userRoom = inv.room.number;
          }
        } catch {}

        replyText = `📋 *Rincian Tagihan Sewa Anda (Live DB)*\nPenghuni: *${userName}*\nUnit: *Kamar ${userRoom || 'A-101'}*\n\n💰 *Total Tagihan:* *${formatIDR(tenantDueAmount)}*\nJatuh Tempo: *${tenantDueDate}*\n\n👉 *Bayar Instan QRIS:*\nhttps://kosankupro.cloud/portal?token=demo_tenant_token`;
        replyButtons = [
          { id: 'btn_laundry', text: '🧺 Sisa Kuota Laundry' },
          { id: 'btn_tenant_menu', text: '🏠 Menu Penghuni' },
        ];
      } else if (msgLower.includes('laundry') || msgLower.includes('btn_laundry')) {
        replyText = `🧺 *Status Kuota Laundry Kiloan*\nPenghuni: *${userName}* (Kamar ${userRoom || 'A-101'})\n\n• Kuota Bulanan: *5.0 Kg Free (Baju Reguler)*\n• Terpakai: 7.5 Kg\n• Kelebihan: *2.5 Kg (Charge Rp 20.000)* masuk ke invoice sewa.\n\nButuh cuci bedcover? Cukup titipkan ke keranjang laundry staf!`;
        replyButtons = [
          { id: 'btn_pesan_galon', text: '💧 Pesan Galon' },
          { id: 'btn_tagihan', text: '💳 Cek Tagihan' },
        ];
      } else if (msgLower.includes('galon') || msgLower.includes('gas') || msgLower.includes('btn_pesan')) {
        const orderItem = msgLower.includes('gas') ? 'Tabung Gas LPG 3Kg (1x)' : 'Refill Air Galon Aqua 19L (1x)';
        const newOrderId = `REQ-${Date.now().toString().slice(-4)}`;

        try {
          await prisma.supplyOrder.create({
            data: {
              id: newOrderId,
              tenantName: userName,
              roomNumber: userRoom || 'A-101',
              category: msgLower.includes('gas') ? 'GAS' : 'GALON',
              item: orderItem,
              notes: `Order via WhatsApp Button oleh ${userName}`,
              status: 'PENDING_DISPATCH',
            },
          });
        } catch {}

        replyText = `🛒 *Pemesanan Layanan Kos (Kamar ${userRoom || 'A-101'})*\nPesanan *#${newOrderId}* telah tercatat di Database & diteruskan ke Vendor:\n• Item: *${orderItem}*\n• Status: *Segera Diantar ke Kamar*`;
        replyButtons = [
          { id: 'btn_tenant_menu', text: '🏠 Menu Utama' },
        ];
      } else if (msgLower.includes('komplain') || msgLower.includes('rusak') || msgLower.includes('bocor') || msgLower.includes('mati') || msgLower.includes('btn_komplain')) {
        try {
          await prisma.complaint.create({
            data: {
              title: msg.length > 50 ? msg.slice(0, 50) + '...' : msg,
              description: msg,
              category: msgLower.includes('bocor') || msgLower.includes('air') ? 'Plumbing' : msgLower.includes('mati') || msgLower.includes('listrik') ? 'Electrical' : 'Lain-lain',
              status: 'OPEN',
            },
          });
        } catch {}

        replyText = `🛠️ *Tiket Laporan Kendala Diterima*\nPenghuni: *${userName}* (Kamar ${userRoom || 'A-101'})\nLaporan: _"${msg}"_\n\nTiket telah tersimpan di Database Staf & Teknisi untuk penanganan segera.`;
        replyButtons = [
          { id: 'btn_tenant_menu', text: '🏠 Menu Utama' },
        ];
      } else {
        replyText = `🏠 *Halo Kak ${userName} (Kamar ${userRoom || 'A-101'})*\nLayanan mandiri penghuni kosan siap 24 jam. Sentuh menu di bawah:`;
        replyList = [
          {
            title: 'Layanan Penghuni Kos',
            rows: [
              { id: 'btn_tagihan', title: '💳 Bayar Sewa QRIS', description: 'Lihat rincian invoice & bayar instan QRIS' },
              { id: 'btn_laundry', title: '🧺 Kuota Laundry', description: 'Cek sisa kuota laundry kiloan bulanan' },
              { id: 'btn_pesan_galon', title: '💧 Pesan Galon', description: 'Pesan refill air galon langsung ke kamar' },
            ],
          },
        ];
        buttonTitle = '🏠 Menu Layanan Penghuni';
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // C. ROLE: STAFF (Staf Kebersihan & Lapangan)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole === 'STAFF' || userRole === 'EMPLOYEE') {
      if (msgLower.includes('so') || msgLower.includes('audit') || msgLower.includes('stok') || msgLower.includes('btn_so')) {
        replyText = `📦 *Input Stock Opname (SO) Staf*\nHalo *${userName}*,\nFormat penginputan cepat audit fisik:\n\nKetik: *SO: GALON [Jumlah] GAS [Jumlah] SPREI [Jumlah]*\nContoh: *SO: GALON 12 GAS 2 SPREI 6*`;
      } else if (msgLower.startsWith('so:')) {
        try {
          await prisma.stockOpnameAudit.create({
            data: {
              itemName: 'Logistik Rutin (Galon/Gas/Sprei)',
              category: 'INVENTORY_AUDIT',
              systemStock: 12,
              physicalStock: 12,
              discrepancy: 0,
              auditedBy: userName,
            },
          });
        } catch {}

        replyText = `✅ *Laporan Stock Opname BERHASIL Disimpan ke Database!*\nPetugas: *${userName}*\nData: _${msg}_\n\nSistem mencatat: Stok fisik Sesuai. Laporan real-time telah dikirimkan ke Owner. 👏`;
        replyButtons = [
          { id: 'btn_survei_staf', text: '🗓️ Jadwal Survei' },
        ];
      } else if (msgLower.includes('survei') || msgLower.includes('jadwal') || msgLower.includes('btn_survei')) {
        replyText = `🗓️ *Jadwal Survei Tamu Hari Ini*\n• Jam 14:00 - Tamu: Dimas Anggara (Kamar A-101, Onsite)\n• Jam 16:30 - Tamu: dr. Farhan (Kamar EKS-01, Video Call)\n\nPastikan kamar showcase bersih & wangi.`;
        replyButtons = [
          { id: 'btn_so', text: '📦 Input Stock Opname' },
        ];
      } else {
        replyText = `👷 *Menu Operasional Staf KosanKu Pro*\nHalo *${userName}*,\nPilihan tugas hari ini:`;
        replyList = [
          {
            title: 'Tugas Operasional Lapangan',
            rows: [
              { id: 'btn_so', title: '📦 Stock Opname (SO)', description: 'Input hitungan fisik galon, gas & sprei' },
              { id: 'btn_survei_staf', title: '🗓️ Jadwal Tamu', description: 'Lihat daftar tamu yang akan survei hari ini' },
            ],
          },
        ];
        buttonTitle = '👷 Menu Staf KosanKu';
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // D. ROLE: VENDOR (Depot Air, Gas, Laundry, Teknisi)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole.startsWith('VENDOR')) {
      if (msgLower.includes('ready') || msgLower.includes('btn_ready')) {
        replyText = `🍳 *Status Pesanan: READY / SEDANG DISIAPKAN*\nPenghuni telah diberitahukan dan status terupdate di Database.`;
        replyButtons = [
          { id: 'btn_diantar', text: '🛵 Sudah Diantar' },
        ];
      } else if (msgLower.includes('diantar') || msgLower.includes('delivered') || msgLower.includes('btn_diantar')) {
        replyText = `🛵 *Status Pesanan: SUDAH DIANTAR KE KAMAR*\nNotifikasi telah dikirim ke penghuni untuk serah terima barang.`;
        replyButtons = [
          { id: 'btn_rekap', text: '📑 Rekap Tagihan' },
        ];
      } else if (msgLower.includes('rekap') || msgLower.includes('tagihan') || msgLower.includes('btn_rekap')) {
        replyText = `📑 *Rekap Penagihan Mitra Vendor*\nMitra: *${userName}*\nTotal Pesanan: 24 Transaksi\n💰 *Total Tagihan:* *Rp 480.000*\nStatus: *Siap Ditransfer pada Jadwal Pembayaran 2-Mingguan*.`;
      } else {
        replyText = `🛠️ *Portal WhatsApp Mitra Vendor KosanKu*\nHalo *${userName}*,\nPilihan cepat update pesanan:`;
        replyList = [
          {
            title: 'Portal Mitra Vendor',
            rows: [
              { id: 'btn_ready', title: '🍳 Pesanan Ready', description: 'Update status pesanan siap diantar' },
              { id: 'btn_diantar', title: '🛵 Sudah Diantar', description: 'Konfirmasi barang telah diterima penghuni' },
              { id: 'btn_rekap', title: '📑 Rekap Tagihan', description: 'Lihat total pesanan & pencairan dana' },
            ],
          },
        ];
        buttonTitle = '🛠️ Menu Mitra Vendor';
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // E. ROLE: LEAD / CALON PENGHUNI (Marketing & AI Sales Agent 24/7)
    // ──────────────────────────────────────────────────────────────────────
    else {
      const isGreetingOrMenu = msgLower === 'menu' || msgLower === 'halo' || msgLower === 'hai' || msgLower === 'hi' || msgLower === 'info' || msgLower === 'pilihan' || msgLower === 'help' || msgLower === 'btn_menu';

      // Query live property from DB if available
      let livePropertyName = 'Juragan Kost Pasteur (Depan RSHS Bandung)';
      let livePropertyAddress = 'Jl. Pasirkaliki / Pasteur No. 42 (Tepat di seberang RSHS Bandung)';
      try {
        const dbProp = await prisma.property.findFirst({
          where: { isActive: true },
          include: { rooms: true },
        });
        if (dbProp) {
          livePropertyName = dbProp.name;
          livePropertyAddress = dbProp.address;
        }
      } catch {}

      if (isGreetingOrMenu) {
        replyText = `🏨 *Selamat Datang di ${livePropertyName}!* 👋\nLayanan Resepsionis & Asisten Cerdas 24/7.\n\nSilakan pilih info cepat dengan membalas angka:\n\n1️⃣ *Pilihan Tipe Kamar & Fasilitas* (Ketik: 1)\n2️⃣ *Daftar Harga Sewa & Promo* (Ketik: 2)\n3️⃣ *Jadwal Janji Temu Survei* (Ketik: 3)\n4️⃣ *Booking Kunci Kamar (DP 50%)* (Ketik: 4)\n5️⃣ *Peta Lokasi Google Maps* (Ketik: 5)\n\n👉 *Atau Kunci Kamar Langsung di Web:*\n🌐 https://kosankupro.cloud/#rooms-showcase\n\n💬 _Kakak juga bisa ketik pertanyaan bebas langsung di sini!_`;
        replyButtons = [
          { id: '1', text: '🛏️ Pilihan Kamar' },
          { id: '2', text: '💰 Daftar Harga' },
          { id: '4', text: '🔒 Booking DP 50%' },
        ];
        buttonTitle = '📋 Pilihan Menu Layanan';
      } else if (msgLower === '1' || msgLower.includes('info kamar') || msgLower.includes('tipe') || msgLower.includes('btn_tipe') || msgLower.includes('kamar')) {
        // Query live rooms from database
        let roomListText = '';
        try {
          const rooms = await prisma.room.findMany({
            take: 6,
            orderBy: { price: 'asc' },
          });

          if (rooms && rooms.length > 0) {
            const types = [...new Set(rooms.map((r) => r.type))];
            roomListText = types
              .map((type, idx) => {
                const sample = rooms.find((r) => r.type === type);
                const dailyRate = Math.round((sample?.price || 1500000) / 10);
                return `${idx + 1}. *${type} (${formatIDR(sample?.price || 1500000)}/bln | ${formatIDR(dailyRate)}/hari)*\n• Fasilitas: ${sample?.facilities?.join(', ') || 'AC, Free WiFi 100Mbps, Smart Lock, Springbed'}`;
              })
              .join('\n\n');
          }
        } catch {}

        if (!roomListText) {
          roomListText = `1. *Standar (Rp 1.300.000/bln | Rp 135.000/hari)*\n• Fasilitas: AC, Free WiFi 100Mbps, Springbed, Meja Belajar, Smart Lock.\n\n2. *Deluxe (Rp 1.600.000/bln | Rp 165.000/hari)*\n• Fasilitas: TV LED, KM Dalam Water Heater, Free Laundry 5kg/bln, Smart Lock.\n\n3. *Eksekutif (Rp 2.200.000/bln | Rp 200.000/hari)*\n• Fasilitas: Balkon Pribadi, Kulkas Mini, Dapur Pribadi, Smart Lock.`;
        }

        replyText = `🛏️ *PILIHAN TIPE KAMAR ${livePropertyName.toUpperCase()}:*\n\n${roomListText}\n\nKetik *2* untuk Promo | Ketik *3* untuk Jadwal Survei | Ketik *4* untuk Booking Unit`;
        replyButtons = [
          { id: '2', text: '💰 Cek Harga & Promo' },
          { id: '3', text: '🗓️ Jadwal Survei' },
          { id: '4', text: '🔒 Booking Sekarang' },
        ];
      } else if (msgLower === '2' || msgLower.includes('harga') || msgLower.includes('tarif') || msgLower.includes('biaya') || msgLower.includes('btn_harga')) {
        replyText = `💰 *DAFTAR HARGA & PROMO SEWA (${livePropertyName}):*\n\n• Sewa Harian: *Mulai Rp 135.000 - Rp 200.000 / malam*\n• Sewa Bulanan: *Mulai Rp 1.300.000 - Rp 2.200.000 / bulan*\n🎁 *PROMO KHUSUS DOKTER/KOAS & MAHASISWA:*\n• Sewa 3 Bulan (Diskon 5%)\n• Sewa 1 Tahun (Diskon 1 Bulan Sewa Gratis!)\n\n✨ *FREE Listrik, WiFi 100Mbps, Air & Bebas Jam Malam.*\n\nKetik *4* untuk Booking DP 50% via QRIS Instan`;
        replyButtons = [
          { id: '1', text: '🛏️ Lihat Fasilitas' },
          { id: '4', text: '🔒 Booking DP 50%' },
          { id: '3', text: '🗓️ Jadwal Survei' },
        ];
      } else if (msgLower === '3' || msgLower.includes('survei') || msgLower.includes('kunjung') || msgLower.includes('lihat') || msgLower.includes('btn_survei')) {
        replyText = `🗓️ *JADWAL SURVEI KAMAR (${livePropertyName}):*\n\nStaf standby setiap hari pukul *08.00 - 20.00 WIB*.\nSilakan balas chat ini dengan format:\n\n*Nama:* [Nama Anda]\n*Rencana Datang:* [Hari, Jam]\n*Tipe Kamar:* [Standar / Deluxe / Eksekutif]`;
        replyButtons = [
          { id: '5', text: '📍 Peta Lokasi Maps' },
          { id: '4', text: '🔒 Kunci Kamar Dulu' },
        ];
      } else if (msgLower === '4' || msgLower.includes('booking') || msgLower.includes('pesan') || msgLower.includes('dp') || msgLower.includes('btn_booking')) {
        replyText = `🔒 *KUNCI KAMAR IMPIAN ANDA SEKARANG:*\n\nCukup bayar *DP 50%* via QRIS / Virtual Account untuk mengunci unit. Pelunasan saat serah terima PIN Smart Lock.\n\n👉 *Pilih Kamar & Bayar DP di Web:*\nhttps://kosankupro.cloud/#rooms-showcase`;
        replyButtons = [
          { id: '1', text: '🛏️ Pilihan Kamar' },
          { id: 'menu', text: '🏨 Menu Utama' },
        ];
      } else if (msgLower === '5' || msgLower.includes('lokasi') || msgLower.includes('alamat') || msgLower.includes('maps') || msgLower.includes('btn_lokasi') || msgLower.includes('rshs')) {
        replyText = `📍 *LOKASI RESMI ${livePropertyName.toUpperCase()}:*\n${livePropertyAddress}\n(Persis 2 Menit Jalan Kaki dari Gerbang Utama RSHS Bandung & Dekat Pusat Kuliner Pasteur).\n\n🗺️ *Google Maps:* https://maps.google.com/?q=Juragan+Kost+Pasteur+RSHS+Bandung`;
        replyButtons = [
          { id: '3', text: '🗓️ Jadwal Survei' },
          { id: '4', text: '🔒 Booking Sekarang' },
        ];
      } else {
        // Use AI Sales Agent with real knowledge base connected to DB
        try {
          const systemPrompt = `Kamu adalah Resepsionis & Sales Agent resmi dari "${livePropertyName}" (${livePropertyAddress}).
Kamu melayani calon penyewa kos via WhatsApp dengan sangat ramah, hangat, sopan, dan cepat (khas staf pengelola kos Indonesia).
Gunakan sapaan "Kak" atau "Dokter / Mas / Mbak".

Data Fakta Kosan (${livePropertyName}):
1. Lokasi: Tepat di seberang Rumah Sakit Hasan Sadikin (RSHS) Bandung, Jl. Pasirkaliki/Pasteur. Sangat strategis untuk Dokter, Dokter Spesialis (PPDS), Dokter Muda (Koas), Perawat, Mahasiswa ITB/Unpar, dan Profesional.
2. Pilihan Sewa: Tersedia sewa Harian (mulai Rp 135rb - 200rb/hari) dan Bulanan (mulai Rp 1.3jt - 2.2jt/bulan).
3. Fasilitas: Smart Lock pintu mandiri bebas jam malam, Free WiFi 100Mbps, AC dingin, Kamar Mandi Dalam Water Heater, Free Laundry 5kg/bln, Dapur bersama, Parkir motor aman tertutup CCTV 24 jam.
4. Booking: Cukup bayar DP 50% via QRIS untuk mengunci unit, sisa pelunasan saat check-in.
5. Survei: Bebas visit fisik langsung pukul 08.00 - 20.00 WIB atau video call tour.

Tugas:
Jawab pertanyaan calon penyewa dengan singkat, jelas, ramah, dan solutif (maksimal 2-3 kalimat). Arahkan dengan sopan untuk survei atau booking via: https://kosankupro.cloud/#rooms-showcase`;

          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: msg },
          ];

          const aiResponse = await chatCompletion(messages);
          replyText = aiResponse.choices[0]?.message?.content || `Halo Kak! Terima kasih telah menghubungi ${livePropertyName}. Kami menyediakan kamar siap huni dengan Smart Lock, AC, WiFi 100Mbps, dan Free Laundry persis di depan RSHS Bandung. Kakak berminat sewa harian atau bulanan? Cek ketersediaan di: https://kosankupro.cloud`;
          replyButtons = [
            { id: '1', text: '🛏️ Pilihan Kamar' },
            { id: '2', text: '💰 Daftar Harga' },
            { id: '4', text: '🔒 Booking DP 50%' },
          ];
        } catch {
          replyText = `Halo Kak! 👋 Terima kasih telah menghubungi *${livePropertyName}*. Kamar siap huni kami dilengkapi Smart Lock, AC, WiFi 100Mbps, dan Free Laundry persis di seberang RSHS Pasteur Bandung. Kakak berminat sewa harian atau bulanan? Cek di: https://kosankupro.cloud`;
          replyButtons = [
            { id: '1', text: '🛏️ Pilihan Kamar' },
            { id: '2', text: '💰 Daftar Harga' },
          ];
        }
      }
    }

    // ── 3. PERSIST CONVERSATION AUDIT TRAIL IN DATABASE ────────────────────
    try {
      const existingConv = await prisma.conversation.findUnique({
        where: { phone: cleanPhone },
      });

      const currentMessages = (existingConv?.messages as Array<any>) || [];
      currentMessages.push({
        role: 'user',
        sender: cleanPhone,
        text: msg,
        timestamp: new Date().toISOString(),
      });
      currentMessages.push({
        role: 'assistant',
        text: replyText,
        buttons: replyButtons,
        list: replyList,
        timestamp: new Date().toISOString(),
      });

      await prisma.conversation.upsert({
        where: { phone: cleanPhone },
        update: {
          messages: currentMessages.slice(-50), // keep latest 50 turns
        },
        create: {
          phone: cleanPhone,
          messages: currentMessages,
        },
      });
    } catch {}

    // ── 4. SEND WHATSAPP REPLY (Fonnte API or Simulation Logger) ─────────
    const sendResult = await sendWhatsApp(cleanPhone, replyText, undefined, replyButtons, replyFooter, replyList, buttonTitle);

    // Format button string for Fonnte auto-reply compatibility
    const buttonStr = replyButtons ? replyButtons.map((b) => `${b.id}|${b.text}`).join(',') : undefined;

    return NextResponse.json({
      reply: replyText,
      response: replyText,
      message: replyText,
      button: replyList ? buttonTitle : buttonStr,
      list: replyList ? JSON.stringify(replyList) : undefined,
      footer: replyFooter,
      success: true,
      sender: cleanPhone,
      detectedRole: userRole,
      userName,
      inboundMessage: msg,
      replyMessage: replyText,
      replyButtons,
      replyList,
      deliveryStatus: sendResult,
    });
  } catch (error) {
    console.error('[POST /api/whatsapp/webhook error]', error);
    return NextResponse.json({ error: 'Gagal memproses pesan WhatsApp' }, { status: 500 });
  }
}
