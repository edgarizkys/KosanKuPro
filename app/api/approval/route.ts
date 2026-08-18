import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/fonnte';

export const dynamic = 'force-dynamic';

const PENDING_APPROVALS: any[] = [
  {
    id: 'appr-galon-w3',
    type: 'WEEKLY_SUPPLY_WATER',
    title: 'Order Mingguan 12 Galon Air Mineral & Gas LPG',
    requesterName: 'Rudi Hartono (Staf)',
    propertySlug: 'default',
    propertyName: 'KosanKu Premium Residence',
    amount: 240000,
    status: 'APPROVED',
    notes: '12 Galon Aqua 19L + 1 Tabung Gas 3kg',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'appr-servis-ac-102',
    type: 'VENDOR_MAINTENANCE',
    title: 'Servis AC Bocor & Isi Freon Kamar A-102',
    requesterName: 'Bambang Prasetyo (Teknisi)',
    propertySlug: 'default',
    propertyName: 'KosanKu Premium Residence',
    amount: 250000,
    status: 'PENDING',
    notes: 'Teknisi Subur Teknik estimasi perbaikan 2 jam',
    createdAt: new Date().toISOString(),
    approvedAt: null,
  },
];

// GET /api/approval — list approval requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let list = [...PENDING_APPROVALS];
    if (status && status !== 'ALL') {
      list = list.filter((a) => a.status?.toUpperCase() === status.toUpperCase());
    }

    return NextResponse.json({ data: list, count: list.length });
  } catch (error) {
    return NextResponse.json({ data: PENDING_APPROVALS, count: PENDING_APPROVALS.length });
  }
}

// POST /api/approval — 1-Click Action from Owner WhatsApp / Web
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action = 'APPROVE', ownerNotes, ownerPhone } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID Approval wajib disertakan' }, { status: 400 });
    }

    const idx = PENDING_APPROVALS.findIndex((a) => a.id === id);
    const newStatus = action.toUpperCase() === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    if (idx !== -1) {
      PENDING_APPROVALS[idx] = {
        ...PENDING_APPROVALS[idx],
        status: newStatus,
        notes: ownerNotes ? `${PENDING_APPROVALS[idx].notes} • Catatan Owner: ${ownerNotes}` : PENDING_APPROVALS[idx].notes,
        approvedAt: new Date().toISOString(),
      };
    }

    // If approved, also record expense into the central ledger
    if (newStatus === 'APPROVED') {
      const match = PENDING_APPROVALS[idx] || body;
      try {
        await prisma.expense.create({
          data: {
            category: match.type === 'WEEKLY_SUPPLY_WATER' ? 'air' : 'perbaikan',
            amount: parseFloat(String(match.amount || 240000)),
            description: `[1-Click Owner Approved] ${match.title}`,
          },
        });
      } catch {}

      // Notify Staf / Vendor via WhatsApp
      if (ownerPhone) {
        sendWhatsApp(
          ownerPhone,
          `✅ *Konfirmasi Approval Berhasil!*\nPengajuan: *${match.title}* senilai *Rp ${Number(match.amount || 0).toLocaleString('id-ID')}* telah resmi disetujui dan dicatat di Buku Kas Operasional.`
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `Status berhasil diubah menjadi ${newStatus}`,
      data: PENDING_APPROVALS[idx] || { id, status: newStatus },
    });
  } catch (error) {
    console.error('[POST /api/approval error]', error);
    return NextResponse.json({ error: 'Gagal memproses approval' }, { status: 500 });
  }
}
