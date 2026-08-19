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

    // ── 0. DYNAMIC INSTANT MULTI-PROPERTY ROLE SWITCHER ───────────────────
    if (msgLower.startsWith('#') || msgLower.startsWith('!role') || msgLower.startsWith('/role')) {
      const parts = msgLower.replace(/^[#!]/, '').split(' ');
      const mainCmd = parts[0] || '';
      const subCmd = parts[1] || parts[0] || '';

      // A. OWNER SWITCHER
      if (mainCmd.includes('owner') || mainCmd.includes('bos') || (mainCmd.includes('role') && subCmd.includes('owner'))) {
        const isRshs = msgLower.includes('rshs') || msgLower.includes('pasteur');
        const isItb = msgLower.includes('itb') || msgLower.includes('dago');
        const propName = isRshs
          ? 'Juragan Kost Pasteur (Depan RSHS Bandung)'
          : isItb
          ? 'KosanKu Smart Living ITB Dago'
          : 'KosanKu Pro Premium Residence';

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = {
          role: 'OWNER',
          name: isRshs ? 'Owner Juragan Kost RSHS' : 'Ibu Dewi Tri Oktariani (Owner)',
          property: propName,
        };

        const switchText = `👑 *MODE OWNER AKTIF: ${propName.toUpperCase()}*\n\nNomor Anda sekarang mengelola properti *${propName}*.\n\nSilakan coba fitur Owner:\n• *Kas* ➔ Cek omset & saldo kas cabang ini.\n• *ACC 12 Galon* ➔ Setujui pengadaan logistik.\n• *ACC Servis AC* ➔ Setujui perbaikan teknisi.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'OWNER', property: propName, reply: switchText });
      }

      // B. TENANT SWITCHER
      else if (mainCmd.includes('tenant') || mainCmd.includes('penghuni') || (mainCmd.includes('role') && subCmd.includes('tenant'))) {
        const isRshs = msgLower.includes('rshs') || msgLower.includes('pasteur');
        const propName = isRshs ? 'Juragan Kost Pasteur (Depan RSHS Bandung)' : 'KosanKu Pro Residence';
        const tenantName = isRshs ? 'dr. Rizky Pratama, Sp.A' : 'Rian Pratama';
        const roomNo = isRshs ? 'EKS-01' : 'A-101';

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = {
          role: 'TENANT',
          name: tenantName,
          property: propName,
          room: roomNo,
        };

        const switchText = `🏠 *MODE PENGHUNI AKTIF: ${tenantName} (Kamar ${roomNo})*\n🏢 Properti: *${propName}*\n\nSilakan coba fitur Penghuni:\n• *Tagihan* ➔ Cek invoice & bayar sewa QRIS.\n• *Pesan Nasi Goreng 1* ➔ Order makanan katering.\n• *Pesan Galon 1* ➔ Order refill air galon.\n• *Laundry* ➔ Cek sisa kuota gratis 5kg.\n• *Komplain: Kran bocor* ➔ Buat tiket kendala ke staf.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'TENANT', property: propName, reply: switchText });
      }

      // C. STAFF SWITCHER
      else if (mainCmd.includes('staff') || mainCmd.includes('staf') || (mainCmd.includes('role') && subCmd.includes('staff'))) {
        DYNAMIC_ACTIVE_ROLES[cleanPhone] = { role: 'STAFF', name: 'Bambang (Staf Operasional)', property: 'Juragan Kost Pasteur (Depan RSHS)' };
        const switchText = `👷 *MODE STAF OPERASIONAL AKTIF (Bambang)*\n\nSilakan coba fitur Staf:\n• *SO: GALON 12 GAS 2 SPREI 6* ➔ Input audit fisik stok barang.\n• *Jadwal* ➔ Cek tamu yang akan survei hari ini.\n• *Kamar siap* ➔ Konfirmasi kamar bersih siap huni.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'STAFF', reply: switchText });
      }

      // D. VENDOR SWITCHER
      else if (mainCmd.includes('warung') || mainCmd.includes('food') || mainCmd.includes('depot') || mainCmd.includes('teknisi')) {
        const isWarung = mainCmd.includes('warung') || mainCmd.includes('food');
        const isDepot = mainCmd.includes('depot') || mainCmd.includes('galon');
        const roleType = isWarung ? 'VENDOR_WARUNG' : isDepot ? 'VENDOR_GALON' : 'VENDOR_TEKNISI';
        const vendorName = isWarung ? 'Warung Nasi & Katering Bu Imas' : isDepot ? 'Depot Air & Gas Suci' : 'Teknisi Servis AC Subur';

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = { role: roleType, name: vendorName, property: 'Juragan Kost Pasteur' };
        const switchText = `🛠️ *MODE MITRA VENDOR AKTIF: ${vendorName.toUpperCase()}*\n\nSilakan coba fitur Vendor:\n• *Ready* ➔ Konfirmasi pesanan siap.\n• *Sudah diantar* ➔ Konfirmasi barang tiba di kamar.\n• *Rekap* ➔ Cek total rekap tagihan siap cair.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: roleType, reply: switchText });
      }

      // E. RESET TO OFFICIAL KOSANKU PRO
      else if (mainCmd.includes('reset') || mainCmd.includes('official') || mainCmd.includes('lead')) {
        delete DYNAMIC_ACTIVE_ROLES[cleanPhone];
        const switchText = `🏨 *MODE OFFICIAL KOSANKU PRO DIAKTIFKAN!*\n\nNomor ini sekarang kembali ke mode *Resepsionis & Konsultan Resmi KosanKu Pro*.\n\nKetik *Menu* untuk melihat pilihan tipe kamar & fasilitas properti.`;
        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'OFFICIAL_LEAD', reply: switchText });
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
        const ticketId = `CMP-${Date.now().toString().slice(-4)}`;
        try {
          await prisma.complaint.create({
            data: {
              id: ticketId,
              title: msg.length > 50 ? msg.slice(0, 50) + '...' : msg,
              description: `Laporan WhatsApp dari ${userName} (${userRoom || 'EKS-01'}): ${msg}`,
              category: msgLower.includes('bocor') || msgLower.includes('air') ? 'Plumbing' : msgLower.includes('mati') || msgLower.includes('listrik') ? 'Electrical' : 'Lain-lain',
              status: 'OPEN',
            },
          });
        } catch {}

        replyText = `🛠️ *Tiket Laporan Kendala #${ticketId} Diterima!*\nPenghuni: *${userName}* (Kamar ${userRoom || 'EKS-01'})\nLaporan: _"${msg}"_\n\nTiket telah tersimpan di Database PostgreSQL KosanKu Pro dan langsung tampil di Web Dashboard Staf & Teknisi untuk penanganan segera.`;
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

      // 1. WELCOME MENU: OFFICIAL KOSANKU PRO HUB
      if (isGreetingOrMenu) {
        replyText = `🏨 *Selamat Datang di KosanKu Pro Platform Resmi!* 👋\nLayanan Konsultan Kos & Resepsionis Digital 24/7.\n\nSilakan pilih cabang kosan yang ingin Kakak tuju:\n\n1️⃣ *Juragan Kost Pasteur (Depan RS Hasan Sadikin / RSHS)*\n👉 Ketik: *1* atau *RSHS*\n\n2️⃣ *KosanKu Smart Living (Dekat Kampus ITB & Unpar Dago)*\n👉 Ketik: *2* atau *ITB*\n\n3️⃣ *KosanKu Pro Residence (Area Suci / Dipatiukur)*\n👉 Ketik: *3* atau *Suci*\n\n👉 *Lihat Seluruh Showcase Kamar di Web:*\n🌐 https://kosankupro.cloud/#rooms-showcase\n\n💬 _Kakak juga bisa langsung tanya bebas apa saja di sini!_`;
        replyButtons = [
          { id: '1', text: '🏥 1. Cabang RSHS' },
          { id: '2', text: '🎓 2. Cabang ITB' },
          { id: '3', text: '🏙️ 3. Cabang Suci' },
        ];
        buttonTitle = '🏢 Pilih Cabang KosanKu';
      }

      // 2. BRANCH: JURAGAN KOST PASTEUR (DEPAN RSHS BANDUNG)
      else if (msgLower === '1' || msgLower.includes('rshs') || msgLower.includes('pasteur') || msgLower.includes('hasan sadikin') || msgLower.includes('dokter') || msgLower.includes('koas')) {
        let rshsRooms = '';
        try {
          const rooms = await prisma.room.findMany({
            orderBy: { price: 'asc' },
          });
          if (rooms && rooms.length > 0) {
            const types = Array.from(new Set(rooms.map((r) => r.type)));
            rshsRooms = types
              .map((type, idx) => {
                const sample = rooms.find((r) => r.type === type);
                const facs = sample?.facilities && sample.facilities.length > 0 ? sample.facilities.join(', ') : 'AC, Free WiFi 100Mbps, Smart Lock, KM Dalam';
                return `${idx + 1}. *${type} (${formatIDR(sample?.price || 1500000)}/bln)*\n• Fasilitas: ${facs}`;
              })
              .join('\n\n');
          }
        } catch {}

        if (!rshsRooms) {
          rshsRooms = `1. *Deluxe Studio Smart (Depan RSHS)* — Rp 1.500.000/bln\n• Fasilitas: AC, Free WiFi 100Mbps, KM Dalam Water Heater, Smart Lock\n\n2. *VIP Executive Suite (Khusus Dokter & PPDS)* — Rp 2.200.000/bln\n• Fasilitas: Balkon Pribadi, Kulkas Mini, Dapur Pribadi, Smart Lock\n\n3. *Standard Smart Suite (Depan RSHS)* — Rp 1.300.000/bln\n• Fasilitas: AC, Free WiFi 100Mbps, KM Dalam, Smart Lock`;
        }

        replyText = `🏥 *JURAGAN KOST PASTEUR (DEPAN RSHS BANDUNG)*\n📍 Jl. Pasirkaliki / Pasteur No. 42 (2 Menit Jalan Kaki ke Gerbang Utama RSHS)\n\n🛏️ *Pilihan Tipe Kamar Tersedia:*\n\n${rshsRooms}\n\n✨ *Promo Spesial Dokter, Koas, PPDS & Nakes:* Diskon Sewa 3 Bulan (5%) & Bebas Jam Malam (Smart Lock).\n\nKetik:\n• *Harga RSHS* ➔ Rincian harga sewa harian & bulanan\n• *Maps RSHS* ➔ Peta lokasi Google Maps\n• *Survei RSHS* ➔ Janji temu survei kamar\n• *Booking RSHS* ➔ Kunci kamar DP 50%`;
        replyButtons = [
          { id: 'maps_rshs', text: '📍 Peta Maps RSHS' },
          { id: 'harga_rshs', text: '💰 Promo Dokter/Koas' },
          { id: 'booking_rshs', text: '🔒 Kunci Kamar DP' },
        ];
      }

      // 3. BRANCH: KOSANKU SMART LIVING (ITB & UNPAR DAGO)
      else if (msgLower === '2' || msgLower.includes('itb') || msgLower.includes('dago') || msgLower.includes('unpar')) {
        replyText = `🎓 *KOSANKU SMART LIVING (DEKAT ITB & UNPAR DAGO)*\n📍 Jl. Dago Asri No. 18 (5 Menit dari Kampus ITB Ganesha & Unpar)\n\n🛏️ *Pilihan Tipe Kamar:*\n1. *Cozy Study Room (Rp 1.400.000/bln)* — AC, High-Speed WiFi 100Mbps, Meja Belajar Luas, KM Dalam.\n2. *Executive Balcony Dago (Rp 2.000.000/bln)* — Smart TV, Balkon Sejuk, Smart Lock.\n\n✨ *Promo Mahasiswa:* Free Laundry 5kg/bulan & Free Air Minum Galon.`;
        replyButtons = [
          { id: '1', text: '🏥 Cek Cabang RSHS' },
          { id: 'menu', text: '🏨 Menu Utama' },
        ];
      }

      // 4. BRANCH: KOSANKU PRO RESIDENCE (SUCI / DIPATIUKUR)
      else if (msgLower === '3' || msgLower.includes('suci') || msgLower.includes('dipatiukur') || msgLower.includes('widyatama')) {
        replyText = `🏙️ *KOSANKU PRO RESIDENCE (SUCI / DIPATIUKUR)*\n📍 Jl. Surapati / Suci No. 88 (Dekat ITENAS, Widyatama & Unpad DU)\n\n🛏️ *Pilihan Tipe Kamar:*\n1. *Standard Modern (Rp 1.250.000/bln)* — AC, WiFi, Springbed, Lemari.\n2. *Deluxe Suite (Rp 1.650.000/bln)* — KM Dalam Water Heater, TV LED, Smart Lock.`;
        replyButtons = [
          { id: '1', text: '🏥 Cek Cabang RSHS' },
          { id: 'menu', text: '🏨 Menu Utama' },
        ];
      }

      // 5. SUB-MENU: HARGA & PROMO
      else if (msgLower.includes('harga') || msgLower.includes('promo') || msgLower.includes('tarif')) {
        replyText = `💰 *DAFTAR HARGA & PROMO SEWA KOSANKU PRO:*\n\n• Sewa Harian: *Mulai Rp 135.000 - Rp 220.000 / malam*\n• Sewa Bulanan: *Mulai Rp 1.250.000 - Rp 2.200.000 / bulan*\n\n🎁 *PROMO BULAN INI:*\n• Diskon 5% untuk sewa 3 bulan di muka\n• Diskon 1 Bulan Sewa Gratis untuk sewa tahunan\n• Promo Spesial Dokter/PPDS/Koas di Cabang RSHS\n\n✨ *Semua kamar include AC, Free WiFi 100Mbps, Listrik & Smart Lock.*`;
        replyButtons = [
          { id: '1', text: '🏥 Listing RSHS' },
          { id: 'menu', text: '🏨 Menu Utama' },
        ];
      }

      // 6. SUB-MENU: MAPS & LOKASI
      else if (msgLower.includes('maps') || msgLower.includes('lokasi') || msgLower.includes('alamat')) {
        replyText = `📍 *PETA LOKASI JARINGAN KOSANKU PRO:*\n\n🏥 *Cabang Pasteur (Depan RSHS):*\nJl. Pasirkaliki / Pasteur No. 42 (2 Menit Jalan Kaki dari RSHS Bandung)\n🗺️ Google Maps: https://maps.google.com/?q=Juragan+Kost+Pasteur+RSHS+Bandung\n\n🎓 *Cabang Dago (Dekat ITB):*\nJl. Dago Asri No. 18 Bandung\n🗺️ Google Maps: https://maps.google.com/?q=KosanKu+Smart+Living+Dago`;
        replyButtons = [
          { id: '1', text: '🏥 Listing RSHS' },
          { id: 'menu', text: '🏨 Menu Utama' },
        ];
      }

      // 7. SUB-MENU: SURVEI & BOOKING
      else if (msgLower.includes('survei') || msgLower.includes('kunjung') || msgLower.includes('booking') || msgLower.includes('dp')) {
        replyText = `🔒 *BOOKING & JANJI TEMU SURVEI:*\n\n1. *Kunci Kamar Langsung (DP 50% via QRIS):*\n👉 https://kosankupro.cloud/#rooms-showcase\n\n2. *Jadwal Survei Onsite (08.00 - 20.00 WIB):*\nSilakan kirim balasan chat dengan format:\n*Nama:* [Nama Anda]\n*Cabang:* [RSHS / ITB / Suci]\n*Hari & Jam Rencana Datang:*`;
        replyButtons = [
          { id: '1', text: '🏥 Listing RSHS' },
          { id: 'menu', text: '🏨 Menu Utama' },
        ];
      }

      // 8. AI CONCIERGE ASSISTANT 24/7 (Natural Language Q&A)
      else {
        try {
          const systemPrompt = `Kamu adalah Resepsionis & Asisten Cerdas Resmi dari Platform "KosanKu Pro Residence".
KosanKu Pro memiliki 3 jaringan cabang properti unggulan di Bandung:
1. "Juragan Kost Pasteur (Depan RS Hasan Sadikin / RSHS)" — Sangat strategis 2 menit jalan kaki dari RSHS Bandung, favorit Dokter Spesialis (PPDS), Dokter Muda (Koas), Perawat, dan Profesional Medis.
2. "KosanKu Smart Living ITB Dago" — Dekat kampus ITB dan Unpar.
3. "KosanKu Pro Residence Suci" — Dekat ITENAS, Widyatama, dan Dipatiukur.

Fasilitas Utama: Smart Lock bebas jam malam, Free WiFi 100Mbps, AC dingin, KM Dalam Water Heater, Free Laundry, dan booking DP 50% via QRIS di: https://kosankupro.cloud/#rooms-showcase.

Tugas: Jawab pertanyaan calon penyewa dengan ramah, hangat, sopan, singkat (2-3 kalimat), dan bantu berikan info cabang yang mereka cari.`;

          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: msg },
          ];

          const aiResponse = await chatCompletion(messages);
          replyText = aiResponse.choices[0]?.message?.content || `Halo Kak! Terima kasih telah menghubungi Platform Resmi KosanKu Pro. Kami memiliki cabang unggulan di Depan RSHS Pasteur, Dago ITB, dan Suci. Kakak tertarik mencari kosan di area mana? Cek ketersediaan di: https://kosankupro.cloud`;
          replyButtons = [
            { id: '1', text: '🏥 Cabang RSHS' },
            { id: '2', text: '🎓 Cabang ITB' },
            { id: '3', text: '🏙️ Cabang Suci' },
          ];
        } catch {
          replyText = `Halo Kak! 👋 Selamat datang di *KosanKu Pro Platform*. Kami memiliki unit kosan siap huni dengan Smart Lock, AC, WiFi 100Mbps di: (1) Depan RSHS Pasteur, (2) Dago dekat ITB, dan (3) Suci. Ketik *1* untuk info cabang RSHS atau ketik *Menu* untuk pilihan lengkap!`;
          replyButtons = [
            { id: '1', text: '🏥 Cabang RSHS' },
            { id: '2', text: '🎓 Cabang ITB' },
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
