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
    const body = await req.json();
    
    // Support payloads from Fonnte, Meta Cloud API, or direct simulator test
    const rawSender = body.sender || body.from || body.phone || body.wa_id || '';
    const rawMessage = body.message || body.text || body.body || '';
    const cleanPhone = rawSender.replace(/[^0-9]/g, '');
    const msg = rawMessage.trim();
    const msgLower = msg.toLowerCase();

    if (!cleanPhone || !msg) {
      return NextResponse.json({ error: 'Sender and message are required' }, { status: 400 });
    }

    // ── 1. DETECT USER ROLE FROM DB OR DEMO MAP ────────────────────────────
    let userRole = 'LEAD';
    let userName = 'Kak';
    let userRoom = '';
    let userProperty = 'KosanKu Pro Residence';

    if (DEMO_PHONE_ROLES[cleanPhone]) {
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

    // ── 2. ROUTE BY ROLE ──────────────────────────────────────────────────

    // ──────────────────────────────────────────────────────────────────────
    // A. ROLE: OWNER (Pemilik Kos)
    // ──────────────────────────────────────────────────────────────────────
    if (userRole === 'OWNER' || userRole === 'SUPERADMIN') {
      if (msgLower.includes('kas') || msgLower.includes('omset') || msgLower.includes('laba') || msgLower.includes('saldo')) {
        replyText = `📊 *Laporan Keuangan & Kas Real-Time* 📊\n🏠 Properti: *${userProperty}*\n\n💰 *Pemasukan Sewa:* Rp 38.500.000 (Okupansi: 96%)\n🛍️ *Pendapatan Add-on & Vendor:* Rp 1.450.000\n🔻 *Pengeluaran Operasional:* Rp 6.200.000\n───────────────────────\n💵 *Laba Bersih Kas Saat Ini:* *Rp 33.750.000*\n\nKetik *ACC 12 GALON* untuk menyetujui pasokan air minggu ini, atau ketik *LAPORAN* untuk rekap detail.`;
      } else if (msgLower.includes('acc') || msgLower.includes('setujui') || msgLower.includes('approve')) {
        if (msgLower.includes('galon')) {
          replyText = `✅ *Order 12 Galon Air DISETUJUI oleh Owner* ✅\n\nNotifikasi order resmi telah diteruskan otomatis ke Depot Air & Gas Suci.\nEstimasi biaya *Rp 240.000* telah dicatat ke pos pengeluaran operasional (Pembayaran 2-Mingguan).`;
        } else if (msgLower.includes('ac') || msgLower.includes('servis') || msgLower.includes('tiket')) {
          replyText = `✅ *Biaya Servis AC Kamar A-102 (Rp 250.000) DISETUJUI* ✅\n\nWork Order telah diteruskan ke Teknisi Subur. Teknisi akan menjadwalkan perbaikan sore ini.`;
        } else {
          replyText = `✅ *Aksi Approval Berhasil Diproses!*\nSemua mutasi telah tercatat otomatis di Buku Kas Terpadu Owner.`;
        }
      } else if (msgLower.includes('tolak')) {
        replyText = `❌ *Pengajuan Biaya Ditolak / Ditunda.*\nStaf telah diberitahukan untuk mencari opsi alternatif atau menunda pesanan.`;
      } else {
        replyText = `👑 *Menu Pengelola KosanKu (Owner)*\nHalo *${userName}*,\n\nPilihan cepat perintah WhatsApp:\n• Ketik *KAS* ➔ Cek omset, pengeluaran & laba bersih real-time\n• Ketik *ACC 12 GALON* ➔ Setujui pasokan air mineral mingguan\n• Ketik *ACC SERVIS* ➔ Setujui tiket perbaikan teknisi\n• Ketik *LAPORAN* ➔ Ringkasan okupansi & mutasi kas`;
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // B. ROLE: TENANT (Penghuni Kos)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole === 'TENANT') {
      if (msgLower.includes('tagihan') || msgLower.includes('bayar') || msgLower.includes('sewa')) {
        replyText = `📋 *Rincian Tagihan Sewa Anda*\nPenghuni: *${userName}*\nUnit: *Kamar ${userRoom || 'A-101'}*\n\n• Sewa Kamar: Rp 1.500.000\n• Add-on Laundry (2.5kg lebih): Rp 20.000\n• Galon Tambahan: Rp 20.000\n───────────────────────\n💰 *Total Tagihan:* *Rp 1.540.000*\nJatuh Tempo: *28 Agustus 2026*\n\n👉 *Bayar Instan 1-Klik via QRIS/VA:*\nhttps://kosanku.pro/portal?token=demo_tenant_token`;
      } else if (msgLower.includes('laundry')) {
        replyText = `🧺 *Status Kuota Laundry Kiloan*\nPenghuni: *${userName}* (Kamar ${userRoom || 'A-101'})\n\n• Kuota Bulanan: *5.0 Kg Free (Baju Reguler)*\n• Terpakai: 7.5 Kg\n• Kelebihan: *2.5 Kg (Charge Rp 20.000)* masuk ke tagihan bulan depan.\n\nButuh cuci bedcover / selimut? Cukup titipkan ke keranjang loundry staf!`;
      } else if (msgLower.includes('galon') || msgLower.includes('gas') || msgLower.includes('makan') || msgLower.includes('laundry')) {
        const orderCategory = msgLower.includes('galon') ? 'GALON' : msgLower.includes('gas') ? 'GAS' : msgLower.includes('laundry') ? 'LAUNDRY' : 'MAKANAN';
        const orderItem = msgLower.includes('galon') ? 'Refill Air Galon Aqua 19L (1x)' : msgLower.includes('gas') ? 'Tabung Gas LPG 3Kg (1x)' : msg;
        const newOrderId = `REQ-${Date.now().toString().slice(-4)}`;

        try {
          await prisma.supplyOrder.create({
            data: {
              id: newOrderId,
              tenantName: userName,
              roomNumber: userRoom || 'A-101',
              category: orderCategory,
              item: orderItem,
              notes: `Order via WhatsApp oleh ${userName}`,
              status: 'PENDING_DISPATCH',
            },
          });
        } catch {}

        replyText = `🛒 *Pemesanan Layanan Kos (Kamar ${userRoom || 'A-101'})*\nPesanan *#${newOrderId}* telah masuk ke sistem:\n• Item: *${orderItem}*\n• Status: *Diteruskan ke Vendor*\n\nStatus pesanan dapat dipantau langsung di Dashboard Web maupun WhatsApp Anda.`;
      } else if (msgLower.includes('komplain') || msgLower.includes('rusak') || msgLower.includes('bocor') || msgLower.includes('mati')) {
        const compTitle = msg.length > 50 ? msg.slice(0, 50) + '...' : msg;
        try {
          await prisma.complaint.create({
            data: {
              title: compTitle,
              description: msg,
              category: msgLower.includes('bocor') || msgLower.includes('air') ? 'Plumbing' : msgLower.includes('mati') || msgLower.includes('listrik') ? 'Electrical' : 'Lain-lain',
              status: 'OPEN',
            },
          });
        } catch {}

        replyText = `🛠️ *Tiket Komplain Diterima!*\nPenghuni: *${userName}* (Kamar ${userRoom || 'A-101'})\nLaporan: _"${msg}"_\n\nTiket telah tercatat otomatis di Dashboard Staf & Teknisi. Anda akan menerima notifikasi saat perbaikan selesai dikerjakan.`;
      } else if (msgLower.includes('perpanjang')) {
        replyText = `🎉 *Terima Kasih Kak ${userName}!* Konfirmasi perpanjangan sewa Kamar ${userRoom || 'A-101'} untuk bulan depan telah kami catat. Akses Smart Lock Anda akan otomatis diperpanjang!`;
      } else {
        replyText = `🏠 *Halo Kak ${userName} (Kamar ${userRoom || 'A-101'})*\nAda yang bisa kami bantu hari ini?\n\nPilihan cepat:\n• Ketik *TAGIHAN* ➔ Cek invoice & link bayar QRIS\n• Ketik *LAUNDRY* ➔ Cek sisa kuota 5kg & add-on\n• Ketik *PESAN GALON* / *PESAN GAS* ➔ Antar ke kamar\n• Ketik *KOMPLAIN [keluhan]* ➔ Lapor kendala kamar\n• Ketik *PORTAL* ➔ Buka Dashboard Web Penghuni`;
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // C. ROLE: STAFF (Staf Kebersihan & Lapangan)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole === 'STAFF' || userRole === 'EMPLOYEE') {
      if (msgLower.includes('so') || msgLower.includes('stock opname') || msgLower.includes('audit') || msgLower.includes('stok')) {
        replyText = `📦 *Input Stock Opname (SO) Staf*\nHalo *${userName}*,\nFormat penginputan cepat audit fisik:\n\nKetik: *SO: GALON [Jumlah] GAS [Jumlah] SPREI [Jumlah]*\nContoh: *SO: GALON 12 GAS 2 SPREI 6*\n\nSistem akan otomatis mencocokkan fisik vs sistem dan melaporkan ke Owner.`;
      } else if (msgLower.startsWith('so:')) {
        replyText = `✅ *Laporan Stock Opname BERHASIL Disimpan!*\nPetugas: *${userName}*\nData: _${msg}_\n\nSistem mencatat: Stok fisik Sesuai (0 Selisih). Laporan real-time telah dikirimkan ke WhatsApp Owner. Terima kasih atas auditnya! 👏`;
      } else if (msgLower.includes('survei') || msgLower.includes('tamu') || msgLower.includes('jadwal')) {
        replyText = `🗓️ *Jadwal Survei Tamu Hari Ini*\n• Jam 14:00 - Tamu: Dimas Anggara (Kamar A-101, Onsite)\n• Jam 16:30 - Tamu: dr. Farhan (Kamar EKS-01, Video Call)\n\nMohon pastikan kamar showcase dalam keadaan bersih dan wangi.`;
      } else {
        replyText = `👷 *Menu Operasional Staf KosanKu Pro*\nHalo *${userName}*,\n\nPilihan perintah cepat:\n• Ketik *SO* ➔ Input Stock Opname inventaris (Galon, Gas, Linen)\n• Ketik *SURVEI* ➔ Cek jadwal tamu yang akan datang\n• Ketik *SELESAI [No Tiket]* ➔ Update komplain telah beres`;
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // D. ROLE: VENDOR (Depot Air, Gas, Laundry, Teknisi)
    // ──────────────────────────────────────────────────────────────────────
    else if (userRole.startsWith('VENDOR')) {
      if (msgLower.includes('ready') || msgLower.includes('proses')) {
        replyText = `🍳 *Status Pesanan Diperbarui: READY / SEDANG DIPROSES*\nPenghuni telah diberitahu bahwa pesanan sedang disiapkan.`;
      } else if (msgLower.includes('diantar') || msgLower.includes('jalan') || msgLower.includes('delivered')) {
        replyText = `🛵 *Status Pesanan Diperbarui: SUDAH DIANTAR*\nNotifikasi telah dikirim ke kamar tenant untuk konfirmasi penerimaan barang.`;
      } else if (msgLower.includes('rekap') || msgLower.includes('tagihan') || msgLower.includes('bayar')) {
        replyText = `📑 *Rekap Penagihan 2-Mingguan Mitra Vendor*\nMitra: *${userName}*\nTotal Pesanan: 24 Transaksi\n💰 *Total Tagihan:* *Rp 480.000*\nStatus: *Siap Ditransfer pada Jadwal Pembayaran 2-Mingguan*.`;
      } else {
        replyText = `🛠️ *Portal WhatsApp Mitra Vendor KosanKu*\nHalo *${userName}*,\n\nPilihan cepat:\n• Ketik *READY* ➔ Tandai pesanan siap\n• Ketik *DIANTAR* ➔ Tandai pesanan sudah diantar ke kamar\n• Ketik *REKAP* ➔ Cek total penagihan 2-mingguan Anda`;
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // E. ROLE: LEAD / CALON PENGHUNI (Marketing AI Sales Agent 24/7)
    // ──────────────────────────────────────────────────────────────────────
    else {
      // Use AI Sales Agent with real knowledge base
      try {
        const isRshs = msgLower.includes('rshs') || msgLower.includes('pasteur') || msgLower.includes('hasan sadikin') || msgLower.includes('dokter') || msgLower.includes('koas');
        const activeKos = isRshs ? 'Juragan Kost Pasteur (Depan RSHS Bandung)' : 'KosanKu Pro Premium Residence Bandung';
        
        const systemPrompt = `Kamu adalah Resepsionis & Sales Agent resmi dari "${activeKos}".
Kamu melayani calon penyewa kos via WhatsApp dengan sangat ramah, hangat, sopan, dan cepat (khas staf pengelola kos Indonesia).
Gunakan sapaan "Kak" atau "Dokter / Mas / Mbak".

Aturan Bisnis & Penawaran:
1. Pilihan Sewa: Tersedia sewa Harian dan Bulanan.
2. Booking: Cukup bayar DP 50% untuk mengunci kamar, pelunasan 50% di hari-H check-in.
3. Fasilitas: Smart Lock pintu, Free WiFi 100Mbps, AC, Kamar Mandi Dalam Water Heater, Free Laundry 5kg/bln, Dapur bersama, Parkir motor aman, CCTV 24 jam.
4. Harga: Kamar Standar (Rp 1.2jt - 1.4jt/bln), Deluxe (Rp 1.5jt - 1.7jt/bln), Eksekutif (Rp 2.0jt - 2.8jt/bln). Harian mulai Rp 125rb - 190rb/hari.
5. Survei: Bisa jadwalkan visit fisik langsung ke lokasi atau video tour via WhatsApp.

Tugas:
Jawab pertanyaan calon penyewa dengan singkat (maksimal 2-3 kalimat), berikan info harga akurat, dan tawarkan apakah ingin survei lokasi atau langsung booking DP 50% via link: https://kosanku.pro/#rooms-showcase`;

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: msg },
        ];

        const aiResponse = await chatCompletion(messages);
        replyText = aiResponse.choices[0]?.message?.content || `Halo Kak! Terima kasih telah menghubungi KosanKu Pro. Ada kamar siap huni dengan Smart Lock, AC, WiFi, dan Free Laundry. Kakak berminat sewa harian atau bulanan?`;
      } catch {
        replyText = `Halo Kak! 👋 Terima kasih telah menghubungi *KosanKu Pro*. Kamar siap huni kami dilengkapi Smart Lock, AC, WiFi 100Mbps, dan Free Laundry 5kg. Kakak berminat untuk sewa harian atau bulanan? Cek foto & ketersediaan di: https://kosanku.pro/#rooms-showcase`;
      }
    }

    // ── 3. SEND WHATSAPP REPLY (Fonnte API or Simulation Logger) ─────────
    const sendResult = await sendWhatsApp(cleanPhone, replyText);

    return NextResponse.json({
      success: true,
      sender: cleanPhone,
      detectedRole: userRole,
      userName,
      inboundMessage: msg,
      replyMessage: replyText,
      deliveryStatus: sendResult,
    });
  } catch (error) {
    console.error('[POST /api/whatsapp/webhook error]', error);
    return NextResponse.json({ error: 'Gagal memproses pesan WhatsApp' }, { status: 500 });
  }
}
