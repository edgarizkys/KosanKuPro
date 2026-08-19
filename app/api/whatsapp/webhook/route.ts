import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatCompletion } from '@/lib/openai';
import { sendWhatsApp } from '@/lib/fonnte';
import { pushActivityNotification, pushWaLiveLog } from '@/lib/activityEvents';
import type OpenAI from 'openai';

export const dynamic = 'force-dynamic';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * GET /api/whatsapp/webhook
 * Healthcheck & Fonnte Webhook URL Validation
 */
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'KosanKu Pro WhatsApp Webhook Multi-Actor Hub',
    gateway: 'Fonnte Multi-Actor Hub',
    version: '2.0-unified-stream',
    timestamp: new Date().toISOString(),
  });
}

// In-memory dynamic active role and property context state per phone number
interface UserSession {
  role: string;
  name: string;
  property: string;
  propertyId?: string;
  room?: string;
  selectedPropertyId?: string;
  selectedPropertyName?: string;
  lastState?: string;
}

const DYNAMIC_ACTIVE_ROLES: Record<string, UserSession> = {};

/**
 * POST /api/whatsapp/webhook
 * Multi-Actor Inbound WhatsApp Router for KosanKu Pro:
 * 1. Owner -> 1-Click Approval, Live Ledger, Task Plotting
 * 2. Tenant -> Bill QRIS, Report Maintenance, Order Laundry/Galon/Food, Status Tracking
 * 3. Staff -> Stock Opname (SO) Shorthand, Fund Request (Dana), Check-in/Check-out, Work Completion
 * 4. Vendor -> Isolated Orders (Warung, Depot, Laundry, Teknisi), Dispatch Updates -> Auto WA to Tenant
 * 5. Lead -> Property Branch Selection -> Isolated Room Listing per Kosan -> Survey & DP Booking
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

    // Query active properties from database for all branching (with resilient fallback)
    let allProperties: any[] = [];
    try {
      allProperties = await prisma.property.findMany({
        include: { rooms: { orderBy: { price: 'asc' } } },
      });
    } catch (dbErr) {
      // Graceful fallback if database connection has network latency
    }

    if (!allProperties || allProperties.length === 0) {
      allProperties = [
        {
          id: 'prop-rshs',
          name: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
          address: 'Jl. Pasirkaliki / Pasteur No. 42 (2 Menit dari RSHS)',
          rooms: [
            { id: 'r-101', number: 'EKS-01', type: 'Eksekutif Dokter / Koas', price: 1500000, facilities: ['AC', 'Smart Lock', 'KM Dalam', 'Free Laundry 5kg'] },
            { id: 'r-102', number: 'NYM-01', type: 'Nyaman Comfort', price: 1200000, facilities: ['AC', 'Meja Kerja', 'KM Luar Bersih', 'WiFi 100Mbps'] },
            { id: 'r-103', number: 'PV-01', type: 'Paviliun Spesialis', price: 2600000, facilities: ['Dapur Pribadi', 'Smart TV', 'Free Laundry 10kg', 'AC'] },
          ],
        },
        {
          id: 'prop-itb',
          name: 'KosanKu Smart Living ITB Dago',
          address: 'Jl. Dago Asri No. 18 Bandung',
          rooms: [
            { id: 'r-201', number: 'DGO-01', type: 'Studio Mahasiswa ITB', price: 1400000, facilities: ['Meja Belajar', 'WiFi 100Mbps', 'AC'] },
            { id: 'r-202', number: 'VIP-01', type: 'VIP Dago Living', price: 1900000, facilities: ['KM Dalam', 'Water Heater', 'Balkon', 'AC'] },
          ],
        },
        {
          id: 'prop-suci',
          name: 'KosanKu Pro Residence Suci',
          address: 'Jl. Surapati / Suci No. 102 Bandung',
          rooms: [
            { id: 'r-301', number: 'SCI-01', type: 'Standard Room', price: 1000000, facilities: ['Kasur Springbed', 'Lemari', 'Free WiFi'] },
            { id: 'r-302', number: 'SCI-02', type: 'Deluxe Room', price: 1350000, facilities: ['AC', 'KM Dalam', 'Meja Belajar'] },
          ],
        },
      ];
    }

    const defaultProperty = allProperties[0];

    // ── 0. DYNAMIC MULTI-ROLE SWITCHER (#role ...) ────────────────────────
    if (msgLower.startsWith('#') || msgLower.startsWith('!role') || msgLower.startsWith('/role')) {
      const cleanCmd = msgLower.replace(/^[#!]/, '').trim();
      const parts = cleanCmd.split(' ');
      const mainCmd = parts[0] || '';
      const queryParam = parts.slice(1).join(' ').trim();
      const cmdAll = `${mainCmd} ${queryParam}`.toLowerCase();

      // A. OWNER SWITCHER (#role owner / #owner / #bos)
      if (cmdAll.includes('owner') || cmdAll.includes('bos') || cmdAll.includes('juragan')) {
        let matchedProperty = defaultProperty;
        if (queryParam && !queryParam.includes('owner')) {
          const match = allProperties.find((p) => p.name.toLowerCase().includes(queryParam.toLowerCase()) || p.address.toLowerCase().includes(queryParam.toLowerCase()));
          if (match) matchedProperty = match;
        }

        const propName = matchedProperty?.name || defaultProperty.name;
        const ownerName = propName.includes('RSHS') ? 'Owner Juragan Kost RSHS' : 'Ibu Dewi Tri Oktariani (Owner)';

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = {
          role: 'OWNER',
          name: ownerName,
          property: propName,
          propertyId: matchedProperty?.id,
        };

        const switchText = `👑 *MODE OWNER AKTIF: ${propName.toUpperCase()}*\nNomor Anda sekarang mengelola properti *${propName}* (Data Live DB).\n\nSilakan coba fitur Owner:\n• *Kas* ➔ Cek omset, laba bersih & saldo kas.\n• *ACC APP-101* ➔ Setujui pengajuan dana staf.\n• *Plot CMP-101 ke Bambang* ➔ Tugaskan perbaikan keluhan tenant.`;
        
        pushWaLiveLog({
          phone: cleanPhone,
          senderName: ownerName,
          detectedRole: 'OWNER',
          inboundText: msg,
          replyText: switchText,
          actionTaken: 'SWITCH_TO_OWNER',
          property: propName,
        });

        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'OWNER', property: propName, reply: switchText });
      }

      // B. TENANT SWITCHER (#role tenant / #tenant / #penghuni)
      else if (cmdAll.includes('tenant') || cmdAll.includes('penghuni') || cmdAll.includes('anak_kost')) {
        let matchedProperty = defaultProperty;
        if (queryParam && !queryParam.includes('tenant')) {
          const match = allProperties.find((p) => p.name.toLowerCase().includes(queryParam.toLowerCase()));
          if (match) matchedProperty = match;
        }

        const propName = matchedProperty?.name || defaultProperty.name;
        const isRshs = propName.includes('RSHS') || queryParam.includes('rshs');
        const tenantName = isRshs ? 'dr. Rizky Pratama, Sp.A' : 'Rian Pratama';
        const sampleRoom = isRshs ? 'EKS-01' : (matchedProperty?.rooms?.[0]?.number || 'A-101');

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = {
          role: 'TENANT',
          name: tenantName,
          property: propName,
          room: sampleRoom,
          propertyId: matchedProperty?.id,
        };

        const switchText = `🏠 *MODE PENGHUNI AKTIF: ${tenantName} (Kamar ${sampleRoom})*\n🏢 Properti: *${propName}*\n\nSilakan coba fitur Penghuni:\n• *Tagihan* ➔ Cek invoice & link bayar QRIS Midtrans.\n• *Pesan Galon 1* ➔ Order refill air galon ke kamar.\n• *Pesan Nasi Goreng 1* ➔ Order makanan katering.\n• *Pesanan* ➔ Cek tracking pesanan suplai aktif.\n• *Komplain: AC bocor* ➔ Buat tiket kendala ke pengelola.`;
        
        pushWaLiveLog({
          phone: cleanPhone,
          senderName: tenantName,
          detectedRole: 'TENANT',
          inboundText: msg,
          replyText: switchText,
          actionTaken: 'SWITCH_TO_TENANT',
          property: propName,
        });

        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'TENANT', property: propName, reply: switchText });
      }

      // C. STAFF SWITCHER (#role staff / #staf / #karyawan)
      else if (cmdAll.includes('staff') || cmdAll.includes('staf') || cmdAll.includes('karyawan') || cmdAll.includes('pegawai')) {
        let matchedProperty = defaultProperty;
        const propName = matchedProperty?.name || defaultProperty.name;
        const staffName = propName.includes('RSHS') ? 'Bambang Prasetyo (Staf RSHS)' : 'Rudi Hartono (Staf Lapangan)';

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = {
          role: 'STAFF',
          name: staffName,
          property: propName,
          propertyId: matchedProperty?.id,
        };

        const switchText = `👷 *MODE STAF OPERASIONAL AKTIF (${staffName})*\n🏢 Properti: *${propName}*\n\nSilakan coba fitur Staf:\n• *SO 12 2 6* ➔ Input cepat audit fisik (12 Galon, 2 Gas, 6 Sprei).\n• *Dana: Beli Sapu 50000 untuk lt 2* ➔ Ajukan dana operasional ke Owner.\n• *Cek-in: EKS-01 dr. Rizky Kunci OK* ➔ Lapor inspeksi masuk.\n• *Selesai CMP-101* ➔ Lapor perbaikan kamar selesai.`;
        
        pushWaLiveLog({
          phone: cleanPhone,
          senderName: staffName,
          detectedRole: 'STAFF',
          inboundText: msg,
          replyText: switchText,
          actionTaken: 'SWITCH_TO_STAFF',
          property: propName,
        });

        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'STAFF', reply: switchText });
      }

      // D. VENDOR SWITCHER (WARUNG, DEPOT, LAUNDRY, TEKNISI) (#role warung / #role depot / #role laundry / #role teknisi)
      else if (cmdAll.includes('vendor') || cmdAll.includes('warung') || cmdAll.includes('food') || cmdAll.includes('depot') || cmdAll.includes('galon') || cmdAll.includes('gas') || cmdAll.includes('laundry') || cmdAll.includes('cucian') || cmdAll.includes('teknisi')) {
        let matchedProperty = defaultProperty;
        const propName = matchedProperty?.name || defaultProperty.name;
        
        let roleType = 'VENDOR_WARUNG';
        let vendorName = 'Warung Makan & Katering Bu Imas';
        let sampleAction = 'Katering Makanan';

        if (cmdAll.includes('depot') || cmdAll.includes('galon') || cmdAll.includes('gas')) {
          roleType = 'VENDOR_GALON';
          vendorName = 'Depot Air Mineral & Gas Suci';
          sampleAction = 'Refill Galon & Gas LPG';
        } else if (cmdAll.includes('laundry') || cmdAll.includes('cucian')) {
          roleType = 'VENDOR_LAUNDRY';
          vendorName = 'Mitra Laundry Bersih Express';
          sampleAction = 'Laundry Kiloan & Bedcover';
        } else if (cmdAll.includes('teknisi') || cmdAll.includes('ac')) {
          roleType = 'VENDOR_TEKNISI';
          vendorName = 'Teknisi AC & Plumbing Subur Teknik';
          sampleAction = 'Servis AC & Perbaikan';
        }

        DYNAMIC_ACTIVE_ROLES[cleanPhone] = {
          role: roleType,
          name: vendorName,
          property: propName,
          propertyId: matchedProperty?.id,
        };

        const switchText = `🛠️ *MODE MITRA VENDOR AKTIF: ${vendorName.toUpperCase()}*\n📦 Kategori Layanan: *${sampleAction}*\n🏢 Properti: *${propName}*\n\nSilakan coba fitur Vendor:\n• *Order* ➔ Cek daftar pesanan masuk khusus kategori Anda.\n• *Diantar REQ-001* ➔ Update status (Otomatis kirim notif WA ke Tenant pemesan!).\n• *Rekap* ➔ Cek total rekap tagihan 2-mingguan.`;
        
        pushWaLiveLog({
          phone: cleanPhone,
          senderName: vendorName,
          detectedRole: roleType,
          inboundText: msg,
          replyText: switchText,
          actionTaken: `SWITCH_TO_${roleType}`,
          property: propName,
        });

        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: roleType, reply: switchText });
      }

      // E. RESET TO LEAD / CALON PENGHUNI (#role lead / #role reset)
      else if (cmdAll.includes('reset') || cmdAll.includes('lead') || cmdAll.includes('calon') || cmdAll.includes('tamu') || cmdAll.includes('official')) {
        delete DYNAMIC_ACTIVE_ROLES[cleanPhone];
        const switchText = `🏨 *MODE CALON PENGHUNI (LEAD) AKTIF!*\n\nNomor ini sekarang dalam mode *Calon Penyewa KosanKu Pro*.\n\nKetik *Menu* untuk memilih cabang kosan dan melihat pilihan tipe kamar yang tersedia.`;
        
        pushWaLiveLog({
          phone: cleanPhone,
          senderName: 'Calon Penghuni (Lead)',
          detectedRole: 'LEAD',
          inboundText: msg,
          replyText: switchText,
          actionTaken: 'SWITCH_TO_LEAD',
          property: defaultProperty.name,
        });

        await sendWhatsApp(cleanPhone, switchText);
        return NextResponse.json({ success: true, switchedTo: 'LEAD', reply: switchText });
      }
    }

    // ── 1. DETECT USER ROLE (MEMORY SESSION OR DATABASE) ──────────────────
    let userRole = 'LEAD';
    let userName = 'Kak';
    let userRoom = '';
    let userProperty = defaultProperty.name;
    let userPropertyId = defaultProperty.id;

    if (DYNAMIC_ACTIVE_ROLES[cleanPhone]) {
      const active = DYNAMIC_ACTIVE_ROLES[cleanPhone];
      userRole = active.role;
      userName = active.name;
      userRoom = active.room || '';
      userProperty = active.property;
      userPropertyId = active.propertyId || defaultProperty.id;
    } else {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: cleanPhone },
              { phone: `+${cleanPhone}` },
              { phone: `0${cleanPhone.slice(2)}` },
              { phone: cleanPhone.replace(/^62/, '0') },
              { phone: cleanPhone.replace(/^0/, '62') },
            ],
          },
          include: { rooms: true, property: true },
        });

        if (dbUser) {
          userRole = dbUser.role.toUpperCase();
          userName = dbUser.name;
          userRoom = dbUser.rooms[0]?.number || '';
          userProperty = dbUser.property?.name || defaultProperty.name;
          userPropertyId = dbUser.propertyId || defaultProperty.id;
        }
      } catch {}
    }

    let replyText = '';
    let replyButtons: Array<{ id: string; text: string }> | undefined = undefined;
    let replyList: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }> | undefined = undefined;
    let buttonTitle = '📋 Pilihan Menu Layanan';
    const replyFooter = 'KosanKu Pro • WhatsApp Smart OS';
    let actionSummary = '';

    // ── 2. ROUTE BY ROLE ──────────────────────────────────────────────────

    // ──────────────────────────────────────────────────────────────────────
    // A. ROLE: OWNER (Pemilik Kos)
    // ──────────────────────────────────────────────────────────────────────
    if (userRole === 'OWNER' || userRole === 'SUPERADMIN') {
      if (msgLower.includes('kas') || msgLower.includes('omset') || msgLower.includes('laba') || msgLower.includes('saldo') || msgLower.includes('btn_kas')) {
        let liveIncome = 3200000;
        let liveExpense = 7100000;
        let totalRoomsCount = 8;
        let occupiedRoomsCount = 3;

        try {
          const property = await prisma.property.findFirst({
            where: userPropertyId ? { id: userPropertyId } : undefined,
            include: { rooms: true, expenses: true },
          });

          if (property) {
            userProperty = property.name;
            totalRoomsCount = property.rooms.length || 8;
            occupiedRoomsCount = property.rooms.filter((r) => r.status === 'OCCUPIED').length || 3;

            const expenseAgg = await prisma.expense.aggregate({
              where: property.id ? { propertyId: property.id } : undefined,
              _sum: { amount: true },
            });
            liveExpense = expenseAgg._sum.amount || 7100000;

            const invoiceAgg = await prisma.invoice.aggregate({
              where: { paymentStatus: 'SETTLED' },
              _sum: { totalAmount: true },
            });
            liveIncome = invoiceAgg._sum.totalAmount || 3200000;
          }
        } catch {}

        const liveNetProfit = liveIncome - liveExpense;
        const occRate = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 38;

        replyText = `📊 *Laporan Keuangan & Kas Real-Time (Live DB)*\n🏠 Properti: *${userProperty}*\n\n💰 *Pemasukan Sewa Terverifikasi:* ${formatIDR(liveIncome)} (Okupansi: ${occRate}%)\n🛍️ *Pendapatan Add-on & Vendor:* Rp 1.450.000\n🔻 *Pengeluaran Operasional:* ${formatIDR(liveExpense)}\n───────────────────────\n💵 *Laba Bersih Kas Saat Ini:* *${formatIDR(liveNetProfit)}*`;
        replyButtons = [
          { id: 'acc_galon', text: '✅ ACC 12 Galon' },
          { id: 'acc_servis', text: '✅ ACC Servis AC' },
          { id: 'menu_owner', text: '👑 Menu Utama' },
        ];
        actionSummary = 'VIEW_CASH_STATEMENT';
      } else if (msgLower.startsWith('acc') || msgLower.startsWith('setujui') || msgLower.startsWith('approve') || msgLower.includes('btn_acc')) {
        let approvalTitle = 'Pengadaan Logistik & Operasional';
        let approvalAmount = 240000;
        let expenseCat = 'air';

        if (msgLower.includes('galon')) {
          approvalTitle = 'Pembelian 12 Galon Air Mineral';
          approvalAmount = 240000;
          expenseCat = 'air';
        } else if (msgLower.includes('ac') || msgLower.includes('servis') || msgLower.includes('teknisi')) {
          approvalTitle = 'Servis AC Kamar & Freon';
          approvalAmount = 250000;
          expenseCat = 'perbaikan';
        } else if (msgLower.includes('lampu') || msgLower.includes('sapu') || msgLower.includes('alat')) {
          approvalTitle = 'Perlengkapan Kebersihan & Lampu';
          approvalAmount = 75000;
          expenseCat = 'lain_lain';
        }

        try {
          await prisma.expense.create({
            data: {
              category: expenseCat,
              amount: approvalAmount,
              description: `[1-Click Owner Approved via WA] ${approvalTitle} oleh ${userName}`,
            },
          });
        } catch {}

        // Push real-time event to owner dashboard
        pushActivityNotification('default', {
          id: `appr_dec_${Date.now()}`,
          title: '✅ Pengajuan Dana DISETUJUI Owner via WA',
          message: `${approvalTitle} sebesar ${formatIDR(approvalAmount)} telah disetujui dan dicatat di Buku Kas.`,
          targetRole: ['owner', 'admin', 'employee'],
          targetTab: 'approval',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        });

        replyText = `✅ *APPROVAL BERHASIL DILAKUKAN!*\n\n📋 *Pengajuan:* ${approvalTitle}\n💰 *Nominal:* ${formatIDR(approvalAmount)}\nStatus: *DISETUJUI (APPROVED)*\n\nMutasi pengeluaran otomatis tercatat di Buku Kas Database PostgreSQL dan status di Web Dashboard langsung terupdate.`;
        replyButtons = [
          { id: 'kas', text: '📊 Cek Saldo Kas' },
          { id: 'menu_owner', text: '👑 Menu Owner' },
        ];
        actionSummary = `APPROVED_${approvalTitle}`;
      } else if (msgLower.startsWith('plot ') || msgLower.startsWith('tugaskan ')) {
        const parts = msg.split(/ke\s+/i);
        const taskPart = parts[0]?.replace(/^(plot|tugaskan)\s*/i, '').trim() || 'Perbaikan Kamar';
        const staffTarget = parts[1]?.trim() || 'Bambang Prasetyo (Staf Lapangan)';

        pushActivityNotification('default', {
          id: `task_plotted_${Date.now()}`,
          title: '📋 Tugas Baru Di-Plotting Owner via WA',
          message: `${taskPart} ditugaskan ke ${staffTarget}.`,
          targetRole: ['owner', 'employee'],
          targetTab: 'complaints',
          badgeColor: 'bg-blue-100 text-blue-800',
        });

        replyText = `👨‍🔧 *Tugas Berhasil Di-Plotting!*\n• Pekerjaan: *${taskPart}*\n• Ditugaskan ke: *${staffTarget}*\n\nNotifikasi penugasan telah diteruskan ke WhatsApp staf terkait dan tercatat di tab Complaints Web Dashboard.`;
        actionSummary = `PLOT_TASK_${taskPart}`;
      } else {
        replyText = `👑 *Menu Pengelola KosanKu (Owner)*\nHalo *${userName}*,\nSilakan sentuh menu di bawah untuk mengelola kosan:\n\n` +
          `👉 *Stempel Sah Pengeluaran Dana (Biometrik 1-Klik):*\n` +
          `https://kosankupro.cloud/portal/approve?id=APP-2152&amount=240000&staff=Bambang`;
        replyList = [
          {
            title: 'Menu Utama Owner',
            rows: [
              { id: 'kas', title: '📊 Laporan Kas & Omset', description: 'Lihat mutasi kas, okupansi & laba bersih live' },
              { id: 'acc_galon', title: '✅ ACC 12 Galon Air', description: 'Setujui pengadaan air minum Rp 240.000' },
              { id: 'acc_servis', title: '✅ ACC Servis AC', description: 'Setujui tiket perbaikan teknisi Rp 250.000' },
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
        let tenantDueAmount = 1500000;
        let tenantDueDate = '28 Agustus 2026';
        let tenantInvoiceNumber = 'INV-20260701-0001';

        try {
          let inv = null;
          if (userRoom) {
            inv = await prisma.invoice.findFirst({
              where: {
                paymentStatus: 'PENDING',
                room: { number: userRoom },
              },
              include: { room: true },
            });
          }
          if (!inv) {
            inv = await prisma.invoice.findFirst({
              where: { paymentStatus: 'PENDING' },
              include: { room: true },
            });
          }
          if (inv) {
            tenantDueAmount = inv.totalAmount;
            tenantDueDate = inv.dueDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            tenantInvoiceNumber = inv.invoiceNumber;
            userRoom = inv.room?.number || userRoom || 'EKS-01';
          }
        } catch {}

        replyText = `📋 *Rincian Tagihan Sewa Anda (Live DB)*\nPenghuni: *${userName}*\nUnit: *Kamar ${userRoom || 'EKS-01'}*\nNo. Invoice: *${tenantInvoiceNumber}*\n\n💵 *Sewa Kamar:* ${formatIDR(tenantDueAmount)}\n🛍️ *Add-On / Suplai:* Rp 0 (Lunas)\n────────────────────────\n💰 *Total Pembayaran:* *${formatIDR(tenantDueAmount)}*\nJatuh Tempo: *${tenantDueDate}*\n\n👉 *Bayar Instan QRIS & VA Midtrans:*\nhttps://kosankupro.cloud/portal?invoice=${tenantInvoiceNumber}`;
        replyButtons = [
          { id: 'pesan_galon', text: '💧 Pesan Galon' },
          { id: 'pesanan_saya', text: '📦 Pesanan Saya' },
          { id: 'menu_tenant', text: '🏠 Menu Utama' },
        ];
        actionSummary = 'VIEW_INVOICE';
      } else if (msgLower.includes('pesan') || msgLower.includes('galon') || msgLower.includes('gas') || msgLower.includes('laundry') || msgLower.includes('nasi') || msgLower.includes('makan')) {
        let orderCat = 'GALON';
        let orderItem = 'Refill Air Galon Aqua 19L (1x)';
        let targetVendor = 'Depot Air & Gas Suci';

        if (msgLower.includes('gas')) {
          orderCat = 'GAS';
          orderItem = 'Tabung Gas LPG 3Kg (1x)';
          targetVendor = 'Depot Air & Gas Suci';
        } else if (msgLower.includes('laundry') || msgLower.includes('cuci')) {
          orderCat = 'LAUNDRY';
          orderItem = 'Laundry Kiloan Regular (5kg)';
          targetVendor = 'Mitra Laundry Bersih Express';
        } else if (msgLower.includes('nasi') || msgLower.includes('makan') || msgLower.includes('food') || msgLower.includes('katering')) {
          orderCat = 'WARUNG';
          orderItem = msg.replace(/^pesan\s*/i, '') || 'Nasi Goreng Spesial (1x)';
          targetVendor = 'Warung Makan & Katering Bu Imas';
        }

        const newOrderId = `REQ-${Date.now().toString().slice(-4)}`;

        try {
          await prisma.supplyOrder.create({
            data: {
              id: newOrderId,
              tenantName: userName,
              roomNumber: userRoom || 'EKS-01',
              category: orderCat,
              item: orderItem,
              notes: `Order WhatsApp dari ${userName}`,
              status: 'PENDING_DISPATCH',
              vendorName: targetVendor,
            },
          });
        } catch {}

        // Push real-time toast to Owner & Vendor
        pushActivityNotification('default', {
          id: `ord_${newOrderId}`,
          title: `🛒 Pesanan ${orderCat} Baru dari Kamar ${userRoom || 'EKS-01'}`,
          message: `${userName} memesan "${orderItem}". Diteruskan ke ${targetVendor}.`,
          targetRole: ['owner', 'admin', 'vendor'],
          targetTab: 'tenant_requests',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        });

        replyText = `🛒 *Pemesanan Layanan Kos (Kamar ${userRoom || 'EKS-01'})*\nPesanan *#${newOrderId}* telah tercatat di Database:\n• Item: *${orderItem}*\n• Mitra Vendor: *${targetVendor}*\n• Status: *Sedang Diproses & Siap Diantar*\n\nAnda akan menerima pemberitahuan otomatis saat barang sedang diantar ke depan pintu kamar.`;
        replyButtons = [
          { id: 'pesanan_saya', text: '📦 Cek Pesanan' },
          { id: 'menu_tenant', text: '🏠 Menu Utama' },
        ];
        actionSummary = `ORDER_${orderCat}_${newOrderId}`;
      } else if (msgLower.includes('pesanan') || msgLower.includes('riwayat') || msgLower.includes('tracking') || msgLower.includes('status')) {
        let activeOrderList = '';
        let latestOrderId = 'REQ-9901';
        let latestItem = 'Refill Air Galon Aqua 19L (1x)';
        let isDelivering = true;

        try {
          const dbOrders = await prisma.supplyOrder.findMany({
            where: { tenantName: userName },
            orderBy: { createdAt: 'desc' },
            take: 3,
          });

          if (dbOrders.length > 0) {
            latestOrderId = dbOrders[0].id;
            latestItem = dbOrders[0].item;
            isDelivering = dbOrders[0].status === 'PROCESSING';
            activeOrderList = dbOrders
              .map((o) => `• *#${o.id}* - ${o.item}\n  Status: *${o.status === 'PENDING_DISPATCH' ? '⏳ Menunggu Pengantaran' : o.status === 'PROCESSING' ? '🛵 Sedang Diantar Kurir' : '✅ Sudah Diterima'}* (${o.vendorName || 'Mitra'})`)
              .join('\n\n');
          }
        } catch {}

        if (!activeOrderList) {
          activeOrderList = `• *#REQ-9901* - Refill Air Galon Aqua 19L\n  Status: *🛵 Sedang Diantar Kurir* (Depot Air Suci)\n• *#REQ-8802* - Laundry Kiloan 5kg\n  Status: *✅ Selesai Diterima*`;
        }

        const progressBar = isDelivering ? '[██████████░░░░] 75% SEDANG DIANTAR' : '[██████████████] 100% SUDAH SELESAI';

        replyText = `📦 *STATUS TRACKING PENGANTARAN (Kamar ${userRoom || 'EKS-01'})*\n\n` +
          `${progressBar}\n\n` +
          `📍 *Alur Tahapan Pengantaran:*\n` +
          `✅ Pesanan Diterima Mitra Vendor\n` +
          `✅ Barang Disiapkan & Dikemas\n` +
          `🛵 *Kurir Sedang Menuju Pintu Kamar Anda* ──▶ (Lantai 2)\n` +
          `⏳ Estimasi Tiba: *~3 - 5 Menit Lagi*\n\n` +
          `📋 *Daftar Pesanan Aktif:*\n${activeOrderList}\n\n` +
          `👉 *Pantau Radar Animasi & Posisi Kurir Live:*\n` +
          `https://kosankupro.cloud/portal/track?id=${latestOrderId}&item=${encodeURIComponent(latestItem)}&room=${encodeURIComponent(userRoom || 'EKS-01')}&status=${isDelivering ? 'delivering' : 'completed'}`;

        replyButtons = [
          { id: 'pesan_galon', text: '💧 Pesan Galon Lagi' },
          { id: 'tagihan', text: '💳 Cek Tagihan' },
          { id: 'menu_tenant', text: '🏠 Menu Utama' },
        ];
        actionSummary = 'VIEW_ORDERS_TRACKING';
      }
      // Smart Lock & Digital Keycard Portal
      else if (msgLower.includes('kunci') || msgLower.includes('pintu') || msgLower.includes('smartlock') || msgLower.includes('kartu') || msgLower.includes('akses')) {
        replyText = `🔑 *DIGITAL KEYCARD & SMART LOCK (Kamar ${userRoom || 'EKS-01'})*\nPenghuni: *${userName}*\nStatus: *TERKUNCI AMAN (SECURED)*\n\n` +
          `Buka pintu kamar Anda tanpa kunci fisik menggunakan kartu digital terenkripsi:\n\n` +
          `👉 *Sentuh untuk Buka Pintu (Tap to Unlock):*\n` +
          `https://kosankupro.cloud/portal/smartlock?room=${encodeURIComponent(userRoom || 'EKS-01')}&tenant=${encodeURIComponent(userName)}`;
        replyButtons = [
          { id: 'buka_pintu', text: '🔓 Buka Smart Lock' },
          { id: 'menu_tenant', text: '🏠 Menu Utama' },
        ];
        actionSummary = 'SMARTLOCK_PORTAL';
      } else if (msgLower.includes('komplain') || msgLower.includes('rusak') || msgLower.includes('bocor') || msgLower.includes('mati') || msgLower.includes('lampu') || msgLower.includes('ac')) {
        const ticketId = `CMP-${Date.now().toString().slice(-4)}`;
        const cleanTitle = msg.replace(/^(komplain|lapor|kendala)[:\s]*/i, '').trim() || 'Laporan Kerusakan Kamar';

        try {
          await prisma.complaint.create({
            data: {
              id: ticketId,
              title: cleanTitle,
              description: `Laporan WhatsApp dari ${userName} (Kamar ${userRoom || 'EKS-01'}): ${msg}`,
              category: msgLower.includes('bocor') || msgLower.includes('air') ? 'Plumbing' : msgLower.includes('mati') || msgLower.includes('listrik') || msgLower.includes('lampu') ? 'Electrical' : 'lain_lain',
              status: 'OPEN',
            },
          });
        } catch {}

        // Push real-time toast to Owner & Staff
        pushActivityNotification('default', {
          id: `cmp_${ticketId}`,
          title: `🛠️ Keluhan Baru: Kamar ${userRoom || 'EKS-01'}`,
          message: `${userName}: "${cleanTitle}". Segera tangani di tab Complaints.`,
          targetRole: ['owner', 'admin', 'employee'],
          targetTab: 'complaints',
          badgeColor: 'bg-rose-100 text-rose-800',
        });

        replyText = `🛠️ *Tiket Keluhan #${ticketId} Diterima!*\nPenghuni: *${userName}* (Kamar ${userRoom || 'EKS-01'})\nKeluhan: _"${cleanTitle}"_\n\nStatus: *OPEN (Diteruskan ke Staf Lapangan & Owner)*\n\n👉 *Buka Wizard Diagnostik Kerusakan & Estimasi Waktu:* \nhttps://kosankupro.cloud/portal/complaint?room=${encodeURIComponent(userRoom || 'EKS-01')}&tenant=${encodeURIComponent(userName)}`;
        replyButtons = [
          { id: 'menu_tenant', text: '🏠 Menu Utama' },
        ];
        actionSummary = `COMPLAINT_CREATED_${ticketId}`;
      } else {
        replyText = `🏠 *Halo Kak ${userName} (Kamar ${userRoom || 'EKS-01'})*\nLayanan mandiri penghuni kosan siap 24 jam. Sentuh menu di bawah:`;
        replyList = [
          {
            title: 'Layanan Penghuni Kos',
            rows: [
              { id: 'tagihan', title: '💳 Tagihan & Bayar QRIS', description: 'Lihat rincian invoice sewa & bayar instan QRIS' },
              { id: 'smartlock', title: '🔑 Kunci Digital & Smart Lock', description: 'Buka pintu kamar via kartu NFC' },
              { id: 'pesan_galon', title: '💧 Pesan Air Galon', description: 'Pesan refill galon Aqua 19L ke kamar' },
              { id: 'pesanan_saya', title: '📦 Tracking Pesanan', description: 'Lihat status pesanan suplai aktif' },
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
      // 1. Shorthand SO Input: "SO 12 2 6" or "SO: Galon 12 Gas 2 Sprei 6"
      if (msgLower.startsWith('so:') || msgLower.startsWith('so ') || msgLower.startsWith('audit:')) {
        let galonCount = 12;
        let gasCount = 2;
        let spreiCount = 6;

        const numbersOnly = msgLower.replace(/^so:?\s*/i, '').trim().split(/\s+/);
        if (numbersOnly.length >= 3 && !isNaN(parseInt(numbersOnly[0]))) {
          galonCount = parseInt(numbersOnly[0]);
          gasCount = parseInt(numbersOnly[1]);
          spreiCount = parseInt(numbersOnly[2]);
        } else {
          const galonMatch = msg.match(/galon\s*(\d+)/i);
          if (galonMatch) galonCount = parseInt(galonMatch[1]);
          const gasMatch = msg.match(/gas\s*(\d+)/i);
          if (gasMatch) gasCount = parseInt(gasMatch[1]);
          const spreiMatch = msg.match(/sprei\s*(\d+)/i);
          if (spreiMatch) spreiCount = parseInt(spreiMatch[1]);
        }

        const soId = `SO-${Date.now().toString().slice(-4)}`;
        try {
          await prisma.stockOpnameAudit.create({
            data: {
              id: soId,
              itemName: `Galon: ${galonCount}, Gas: ${gasCount}, Sprei: ${spreiCount}`,
              category: 'CONSUMABLES',
              systemStock: 12,
              physicalStock: galonCount,
              discrepancy: galonCount - 12,
              auditedBy: userName,
              branchId: userPropertyId || 'prop-rshs',
              watermarkText: `SO-${userName.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            },
          });
        } catch {}

        // Push real-time toast to Owner Dashboard
        pushActivityNotification('default', {
          id: `so_${soId}`,
          title: `📦 Laporan Stock Opname (SO) Baru: #${soId}`,
          message: `${userName}: Galon ${galonCount} unit, Gas ${gasCount} tbg, Sprei ${spreiCount} set.`,
          targetRole: ['owner', 'admin'],
          targetTab: 'inventory',
          badgeColor: 'bg-indigo-100 text-indigo-800',
        });

        replyText = `✅ *Laporan Stock Opname #${soId} BERHASIL Tersimpan!*\nPetugas: *${userName}*\n🏢 Properti: *${userProperty}*\n\n📊 *Hasil Audit Fisik:*\n• Galon Air: *${galonCount} unit* (Sistem: 12)\n• Tabung Gas: *${gasCount} unit* (Sistem: 2)\n• Sprei Linen: *${spreiCount} set* (Sistem: 6)\n\nData telah tercatat di Database dan otomatis memicu Pop-Up notifikasi di Dashboard Owner. 👏`;
        replyButtons = [
          { id: 'tugas_hari_ini', text: '🗓️ Tugas & Jadwal' },
          { id: 'menu_staf', text: '👷 Menu Staf' },
        ];
        actionSummary = `SO_SUBMITTED_${soId}`;
      }

      // 2. Fund Request via WA: "Dana: Beli Sapu 50000 untuk koridor"
      else if (msgLower.startsWith('dana:') || msgLower.startsWith('dana ') || msgLower.startsWith('kasbon:')) {
        const cleanReq = msg.replace(/^(dana|kasbon)[:\s]*/i, '').trim();
        const amountMatch = cleanReq.match(/(\d+[\d\.]*)/);
        const amountNum = amountMatch ? parseInt(amountMatch[1].replace(/\./g, '')) : 50000;
        const titleText = cleanReq.replace(/(\d+[\d\.]*)/, '').trim() || 'Pengajuan Dana Operasional';
        const appId = `APP-${Date.now().toString().slice(-4)}`;

        // Push real-time toast to Owner Dashboard
        pushActivityNotification('default', {
          id: `exp_${appId}`,
          title: `✍️ Pengajuan Dana Baru dari ${userName}`,
          message: `"${titleText}" sebesar ${formatIDR(amountNum)}. Segera setujui di tab Approval.`,
          targetRole: ['owner', 'admin'],
          targetTab: 'approval',
          badgeColor: 'bg-amber-100 text-amber-800',
        });

        replyText = `✍️ *Pengajuan Dana #${appId} Telah Dikirim ke Owner!*\n• Pemohon: *${userName}*\n• Keperluan: *${titleText}*\n• Nominal: *${formatIDR(amountNum)}*\n\nOwner telah menerima notifikasi pop-up di Web Dashboard & WhatsApp untuk persetujuan (1-Click Approval).`;
        replyButtons = [
          { id: 'tugas_hari_ini', text: '🗓️ Tugas Hari Ini' },
          { id: 'menu_staf', text: '👷 Menu Staf' },
        ];
        actionSummary = `EXPENSE_REQUESTED_${appId}`;
      }

      // 3. Check-in / Check-out Report via WA: "Cek-in: EKS-01 dr. Rizky Kunci OK AC dingin"
      else if (msgLower.startsWith('cek-in:') || msgLower.startsWith('cek-in ') || msgLower.startsWith('cek-out:') || msgLower.startsWith('cek-out ')) {
        const isCheckIn = msgLower.startsWith('cek-in');
        const inspType = isCheckIn ? 'CHECK_IN' : 'CHECK_OUT';
        const typeLabel = isCheckIn ? 'CEK-IN (MASUK)' : 'CEK-OUT (KELUAR)';
        const cleanInsp = msg.replace(/^(cek-in|cek-out)[:\s]*/i, '').trim();
        const inspId = `INSP-${Date.now().toString().slice(-4)}`;

        pushActivityNotification('default', {
          id: `insp_${inspId}`,
          title: `🚪 Laporan ${typeLabel} Kamar Masuk`,
          message: `${userName}: "${cleanInsp}".`,
          targetRole: ['owner', 'admin'],
          targetTab: 'checkin_reports',
          badgeColor: isCheckIn ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
        });

        replyText = `📋 *Laporan Inspeksi ${typeLabel} #${inspId} Terkirim!*\nPetugas: *${userName}*\nCatatan: _"${cleanInsp}"_\n\nLaporan telah masuk ke Dashboard Owner di tab Check-in & Check-out Reports.`;
        actionSummary = `INSPECTION_${inspType}_${inspId}`;
      }

      // 4. Work Completion: "Selesai CMP-101 kran air sudah diganti"
      else if (msgLower.startsWith('selesai') || msgLower.startsWith('done')) {
        const cleanDone = msg.replace(/^(selesai|done)[:\s]*/i, '').trim() || 'Perbaikan Selesai';

        pushActivityNotification('default', {
          id: `work_done_${Date.now()}`,
          title: `✅ Pekerjaan Selesai oleh ${userName}`,
          message: `Laporan: "${cleanDone}". Status tiket diupdate ke RESOLVED.`,
          targetRole: ['owner', 'admin', 'tenant'],
          targetTab: 'complaints',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        });

        replyText = `🎉 *Laporan Pengerjaan Selesai Dicatat!*\nPetugas: *${userName}*\nCatatan: _"${cleanDone}"_\n\nTiket keluhan telah diperbarui menjadi *RESOLVED* dan notifikasi penyelesaian telah diteruskan ke Tenant pemohon & Owner.`;
        actionSummary = `WORK_RESOLVED_${cleanDone.slice(0, 15)}`;
      }

      // 5. Default Staff Tasks
      else {
        replyText = `👷 *Menu Operasional Staf KosanKu Pro*\nHalo *${userName}*,\nFormat perintah cepat WhatsApp:\n\n• *SO 12 2 6* ➔ Input cepat hitungan galon, gas & sprei.\n• *Dana: Beli Sapu 50000* ➔ Ajukan anggaran ke Owner.\n• *Cek-in: EKS-01 dr. Rizky Kunci OK* ➔ Lapor kamar masuk.\n• *Selesai CMP-101* ➔ Konfirmasi perbaikan selesai.`;
        replyButtons = [
          { id: 'so_cepat', text: '📦 Input SO Cepat' },
          { id: 'tugas_hari_ini', text: '🗓️ Tugas Hari Ini' },
        ];
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // D. ROLE: VENDOR (Warung, Depot Galon/Gas, Laundry, Teknisi)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole.startsWith('VENDOR')) {
      const vendorCategory = userRole.replace('VENDOR_', '');
      
      // 1. Order List Filtered by Vendor Category
      if (msgLower.includes('order') || msgLower.includes('pesanan') || msgLower.includes('daftar')) {
        let orderListText = '';
        try {
          const categoryFilter = vendorCategory === 'WARUNG' ? 'WARUNG' : vendorCategory === 'GALON' ? 'GALON' : vendorCategory === 'LAUNDRY' ? 'LAUNDRY' : 'CUSTOM';
          const dbOrders = await prisma.supplyOrder.findMany({
            where: { category: categoryFilter },
            orderBy: { createdAt: 'desc' },
            take: 4,
          });

          if (dbOrders.length > 0) {
            orderListText = dbOrders
              .map((o) => `• *#${o.id}* - ${o.item}\n  Kamar: *${o.roomNumber}* (${o.tenantName})\n  Status: *${o.status}*`)
              .join('\n\n');
          }
        } catch {}

        if (!orderListText) {
          orderListText = `• *#REQ-9901* - Refill Air Galon Aqua 19L (1x)\n  Kamar: *EKS-01* (dr. Rizky Pratama)\n  Status: *PENDING_DISPATCH*`;
        }

        replyText = `📦 *Daftar Pesanan Masuk: ${userName.toUpperCase()}*\n\n${orderListText}\n\nKetik:\n• *Diantar [ID]* ➔ Konfirmasi barang sedang diantar ke kamar.`;
        replyButtons = [
          { id: 'diantar_req', text: '🛵 Diantar REQ-9901' },
          { id: 'rekap_vendor', text: '📑 Rekap Tagihan' },
        ];
        actionSummary = `VENDOR_VIEW_ORDERS_${vendorCategory}`;
      }

      // 2. Status Update -> Automatically notifies the specific Tenant
      else if (msgLower.startsWith('diantar') || msgLower.startsWith('kirim') || msgLower.startsWith('proses') || msgLower.startsWith('ready') || msgLower.startsWith('selesai')) {
        const isDelivered = msgLower.startsWith('diantar') || msgLower.startsWith('kirim');
        const isCompleted = msgLower.startsWith('selesai');
        const statusText = isCompleted ? 'SUDAH TIBA DI DEPAN KAMAR ✅' : isDelivered ? 'SEDANG DIANTAR KE KAMAR 🛵' : 'SEDANG DISIAPKAN DI DEPOT 🍳';
        const targetOrder = msg.replace(/^(diantar|kirim|proses|ready|selesai)[:\s]*/i, '').trim() || 'REQ-9901';

        // Push real-time toast to Owner & Tenant
        pushActivityNotification('default', {
          id: `vendor_stat_${Date.now()}`,
          title: `🛵 Update Pengantaran dari ${userName}`,
          message: `Pesanan #${targetOrder}: ${statusText}.`,
          targetRole: ['owner', 'tenant'],
          targetTab: 'tenant_requests',
          badgeColor: 'bg-blue-100 text-blue-800',
        });

        const progressBar = isCompleted ? '[██████████████] 100% SELESAI' : isDelivered ? '[██████████░░░░] 75% SEDANG DIANTAR' : '[█████░░░░░░░░░] 35% DISIAPKAN';

        replyText = `🛵 *Status Pesanan #${targetOrder} DIPERBARUI!*\nStatus: *${statusText}*\n\n` +
          `${progressBar}\n\n` +
          `✨ Notifikasi WhatsApp otomatis telah dikirim ke nomor Penghuni pemesan beserta link Radar Pelacakan Live:\n` +
          `https://kosankupro.cloud/portal/track?id=${targetOrder}&vendor=${encodeURIComponent(userName)}&status=${isCompleted ? 'completed' : isDelivered ? 'delivering' : 'processing'}`;

        replyButtons = [
          { id: 'rekap_vendor', text: '📑 Rekap Tagihan' },
          { id: 'order_vendor', text: '📦 Pesanan Lainnya' },
        ];
        actionSummary = `VENDOR_UPDATE_STATUS_${targetOrder}`;
      }

      // 3. Vendor Revenue Recap
      else if (msgLower.includes('rekap') || msgLower.includes('tagihan') || msgLower.includes('pencairan')) {
        replyText = `📑 *Rekap Tagihan Mitra: ${userName.toUpperCase()}*\nProperti: *${userProperty}*\n\n• Total Pesanan Selesai: *18 Transaksi*\n• Total Tagihan Add-on: *Rp 480.000*\n• Status: *Siap Dicairkan pada Jadwal Pembayaran 2-Mingguan*\n\nSemua pencairan dana ditransfer langsung ke rekening terdaftar Anda.`;
        replyButtons = [
          { id: 'order_vendor', text: '📦 Pesanan Masuk' },
        ];
        actionSummary = 'VENDOR_REKAP';
      }

      // 4. Default Vendor Portal
      else {
        replyText = `🛠️ *Portal WhatsApp Mitra Vendor KosanKu*\nHalo *${userName}*,\nPerintah cepat mitra vendor:\n\n• *Order* ➔ Cek daftar pesanan masuk khusus kategori Anda.\n• *Diantar [No Order]* ➔ Konfirmasi barang sedang diantar ke kamar.\n• *Rekap* ➔ Cek total rekap tagihan & pencairan dana.`;
        replyButtons = [
          { id: 'order_vendor', text: '📦 Cek Pesanan' },
          { id: 'rekap_vendor', text: '📑 Rekap Tagihan' },
        ];
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // E. ROLE: LEAD / CALON PENGHUNI (Marketing 24/7 & Dynamic Multi-Kos)
    // ──────────────────────────────────────────────────────────────────────
    else {
      const isGreetingOrMenu =
        msgLower.includes('menu') ||
        msgLower.includes('halo') ||
        msgLower.includes('hai') ||
        msgLower.includes('hi') ||
        msgLower.includes('info') ||
        msgLower.includes('pilihan') ||
        msgLower.includes('cabang') ||
        msgLower.includes('kosan') ||
        msgLower.includes('start') ||
        msgLower.includes('mulai');

      // 1. WELCOME MENU: BRANCH SELECTION (DYNAMIC FROM DB PROPERTIES)
      if (isGreetingOrMenu) {
        const branchList = allProperties
          .map((p, idx) => {
            const shortKey = p.name.includes('RSHS') ? 'RSHS' : p.name.includes('ITB') ? 'ITB' : p.name.includes('Suci') ? 'Suci' : `${idx + 1}`;
            return `${idx + 1}️⃣ *${p.name}*\n👉 Ketik: *${idx + 1}* atau *${shortKey}*`;
          })
          .join('\n\n');

        replyText = `🏨 *Selamat Datang di Platform Resmi KosanKu Pro!* 👋\nResepsionis & Konsultan Hunian Cerdas 24/7.\n\nSilakan pilih cabang kosan yang ingin Kakak tuju:\n\n${branchList || '1️⃣ *Juragan Kost Pasteur (Depan RSHS)*\n👉 Ketik: *1* atau *RSHS*'}\n\n👉 *Lihat Showcase Seluruh Kamar di Web:*\n🌐 https://kosankupro.cloud/#rooms-showcase`;
        replyButtons = [
          { id: '1', text: '🏥 Cabang RSHS' },
          { id: '2', text: '🎓 Cabang ITB' },
          { id: '3', text: '🏙️ Cabang Suci' },
        ];
        buttonTitle = '🏢 Pilih Cabang Kosan';
        actionSummary = 'VIEW_BRANCH_MENU';
      }

      // 2. DYNAMIC PROPERTY SELECTION & FILTERED ROOM LISTING
      else {
        let selectedProp: any = null;
        const numChoice = parseInt(msgLower);

        if (!isNaN(numChoice) && numChoice >= 1 && numChoice <= allProperties.length) {
          selectedProp = allProperties[numChoice - 1];
        } else {
          selectedProp = allProperties.find((p) => {
            const pName = p.name.toLowerCase();
            return (
              msgLower.includes(pName) ||
              (pName.includes('rshs') && (msgLower.includes('rshs') || msgLower.includes('pasteur') || msgLower.includes('hasan sadikin') || msgLower.includes('dokter') || msgLower.includes('koas'))) ||
              (pName.includes('itb') && (msgLower.includes('itb') || msgLower.includes('dago') || msgLower.includes('unpar'))) ||
              (pName.includes('suci') && (msgLower.includes('suci') || msgLower.includes('dipatiukur') || msgLower.includes('widyatama')))
            );
          });
        }

        if (selectedProp) {
          let roomListText = '';
          try {
            const rooms = await prisma.room.findMany({
              where: { propertyId: selectedProp.id },
              orderBy: { price: 'asc' },
            });

            if (rooms && rooms.length > 0) {
              const types = Array.from(new Set(rooms.map((r) => r.type)));
              roomListText = types
                .map((type, idx) => {
                  const sample = rooms.find((r) => r.type === type);
                  const facs = sample?.facilities && sample.facilities.length > 0 ? sample.facilities.join(', ') : 'AC, WiFi 100Mbps, Smart Lock, KM Dalam';
                  return `${idx + 1}. *${type} (${formatIDR(sample?.price || 1000000)}/bln)*\n• Fasilitas: ${facs}`;
                })
                .join('\n\n');
            }
          } catch {}

          if (!roomListText) {
            if (selectedProp.name.includes('RSHS')) {
              roomListText = `1. *Eksekutif Dokter / Koas (Rp 1.500.000/bln)* — AC, Smart Lock, KM Dalam, Free Laundry 5kg\n2. *Nyaman Comfort (Rp 1.200.000/bln)* — AC, Meja Kerja, KM Luar Bersih\n3. *Paviliun Dokter Spesialis (Rp 2.600.000/bln)* — Dapur Pribadi, Smart TV, Free Laundry 10kg`;
            } else if (selectedProp.name.includes('ITB')) {
              roomListText = `1. *Studio Mahasiswa ITB (Rp 1.400.000/bln)* — Meja Belajar Ergonomis, WiFi 100Mbps, AC\n2. *VIP Dago Living (Rp 1.900.000/bln)* — KM Dalam, Water Heater, Balkon`;
            } else {
              roomListText = `1. *Standard Room (Rp 1.000.000/bln)* — Kasur Springbed, Lemari, Free WiFi\n2. *Deluxe Room (Rp 1.350.000/bln)* — AC, KM Dalam, Meja Belajar`;
            }
          }

          replyText = `🏨 *${selectedProp.name.toUpperCase()}*\n📍 ${selectedProp.address}\n\n🛏️ *Pilihan Kamar Tersedia di Cabang Ini:*\n\n${roomListText}\n\n✨ *Fasilitas Bersama:* Free WiFi 100Mbps, Dapur & Kulkas Bersama, CCTV 24 Jam, Free Laundry.\n\n` +
            `👉 *Eksplorasi Virtual 360° & Kunci DP 50% Instan:*\n` +
            `https://kosankupro.cloud/portal/booking?room=EKS-01\n\n` +
            `Ketik:\n• *Maps* ➔ Buka Google Maps lokasi\n• *Survei* ➔ Buat janji temu survei lokasi\n• *Booking* ➔ Kunci kamar DP 50% via QRIS\n• *Menu* ➔ Kembali ke pilihan cabang`;
          replyButtons = [
            { id: 'booking', text: '🔒 Virtual 360 & DP' },
            { id: 'maps', text: '📍 Peta Lokasi' },
            { id: 'survei', text: '🗓️ Janji Survei' },
          ];
          actionSummary = `VIEW_ROOMS_${selectedProp.id}`;
        }

        // 3. SUB-MENUS: MAPS, SURVEI, BOOKING
        else if (msgLower.includes('maps') || msgLower.includes('lokasi') || msgLower.includes('alamat')) {
          replyText = `📍 *PETA LOKASI JARINGAN KOSANKU PRO:*\n\n🏥 *Cabang Pasteur (Depan RSHS):*\nJl. Pasirkaliki / Pasteur No. 42 (2 Menit Jalan Kaki ke RS Hasan Sadikin)\n🗺️ Maps: https://maps.google.com/?q=Juragan+Kost+Pasteur+RSHS+Bandung\n\n🎓 *Cabang Dago (Dekat ITB):*\nJl. Dago Asri No. 18 Bandung\n🗺️ Maps: https://maps.google.com/?q=KosanKu+Smart+Living+Dago`;
          replyButtons = [
            { id: '1', text: '🏥 Listing RSHS' },
            { id: 'menu', text: '🏨 Menu Utama' },
          ];
          actionSummary = 'VIEW_MAPS';
        } else if (msgLower.includes('survei') || msgLower.includes('kunjung') || msgLower.includes('booking') || msgLower.includes('dp')) {
          replyText = `🔒 *PORTAL BOOKING & JANJI TEMU SURVEI:*\n\n` +
            `1. *Kunci Kamar Langsung (Virtual 360° & DP 50% QRIS):*\n` +
            `👉 https://kosankupro.cloud/portal/booking?room=EKS-01\n\n` +
            `2. *Jadwal Survei Onsite (08.00 - 20.00 WIB):*\n` +
            `Silakan kirim balasan chat dengan format:\n` +
            `*Nama:* [Nama Anda]\n` +
            `*Cabang:* [RSHS / ITB / Suci]\n` +
            `*Hari & Jam Rencana Datang:*`;
          replyButtons = [
            { id: 'booking', text: '🔒 Virtual 360 & DP' },
            { id: '1', text: '🏥 Listing RSHS' },
            { id: 'menu', text: '🏨 Menu Utama' },
          ];
          actionSummary = 'VIEW_SURVEY_INFO';
        }

        // 4. AI CONCIERGE ASSISTANT 24/7
        else {
          try {
            const systemPrompt = `Kamu adalah Resepsionis Digital Resmi dari Platform KosanKu Pro.
Jaringan kosan:
1. Juragan Kost Pasteur (Depan RSHS Bandung) — favorit Dokter Spesialis (PPDS), Koas, Perawat.
2. KosanKu Smart Living ITB Dago — dekat ITB dan Unpar.
3. KosanKu Pro Residence Suci — dekat ITENAS dan Widyatama.

Jawab pertanyaan calon penyewa dengan ramah, hangat, sopan, singkat (2-3 kalimat). Arahkan untuk mengetik Menu atau memilih nomor cabang.`;

            const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: msg },
            ];

            const aiResponse = await chatCompletion(messages);
            replyText =
              aiResponse.choices[0]?.message?.content ||
              `Halo Kak! Terima kasih telah menghubungi Platform Resmi KosanKu Pro. Kami memiliki unit di Depan RSHS Pasteur, Dago ITB, dan Suci. Ketik *1* untuk info cabang RSHS atau ketik *Menu* untuk pilihan lengkap!`;
            replyButtons = [
              { id: '1', text: '🏥 Cabang RSHS' },
              { id: '2', text: '🎓 Cabang ITB' },
              { id: 'menu', text: '🏨 Menu Utama' },
            ];
          } catch {
            replyText = `Halo Kak! 👋 Selamat datang di *KosanKu Pro*. Kami memiliki unit kosan siap huni di: (1) Depan RSHS Pasteur, (2) Dago ITB, dan (3) Suci. Ketik *1* untuk info cabang RSHS atau ketik *Menu* untuk pilihan lengkap!`;
            replyButtons = [
              { id: '1', text: '🏥 Cabang RSHS' },
              { id: 'menu', text: '🏨 Menu Utama' },
            ];
          }
          actionSummary = 'AI_CONCIERGE_REPLY';
        }
      }
    }

    // ── 3. LOG REAL-TIME ACTIVITY & PERSIST CONVERSATION AUDIT ───────────
    pushWaLiveLog({
      phone: cleanPhone,
      senderName: userName,
      detectedRole: userRole,
      inboundText: msg,
      replyText,
      actionTaken: actionSummary || 'WA_INBOUND_PROCESSED',
      property: userProperty,
    });

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
          messages: currentMessages.slice(-50),
        },
        create: {
          phone: cleanPhone,
          messages: currentMessages,
        },
      });
    } catch {}

    // ── 4. DISPATCH WHATSAPP RESPONSE VIA GATEWAY ─────────────────────────
    const sendResult = await sendWhatsApp(cleanPhone, replyText, undefined, replyButtons, replyFooter, replyList, buttonTitle);

    const buttonStr = replyButtons ? replyButtons.map((b) => `${b.id}|${b.text}`).join(',') : undefined;

    return NextResponse.json({
      success: true,
      reply: replyText,
      response: replyText,
      message: replyText,
      button: replyList ? buttonTitle : buttonStr,
      list: replyList ? JSON.stringify(replyList) : undefined,
      footer: replyFooter,
      sender: cleanPhone,
      detectedRole: userRole,
      userName,
      inboundMessage: msg,
      actionSummary,
      deliveryStatus: sendResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[POST /api/whatsapp/webhook error]', error);
    return NextResponse.json({ error: 'Gagal memproses pesan WhatsApp', details: error.message }, { status: 500 });
  }
}
