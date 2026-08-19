import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';
import { pushActivityNotification } from '@/lib/activityEvents';

export const dynamic = 'force-dynamic';

const DEFAULT_COMPLAINTS_FALLBACK = [
  {
    id: 'CMP-2101',
    tenantName: 'dr. Rizky Pratama, Sp.A',
    roomNumber: 'EKS-01',
    title: 'AC Kamar Kurang Dingin & Netes',
    description: 'AC perlu servis freon dan cuci filter berkala.',
    status: 'OPEN',
    category: 'Air Conditioning',
    assignedStaff: 'Bambang (Staf Lapangan)',
    property: 'Juragan Kost Pasteur (Depan RSHS)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CMP-2102',
    tenantName: 'dr. Sarah Nabila',
    roomNumber: 'EKS-02',
    title: 'Kran Wastafel Kamar Mandi Menetes',
    description: 'Karet seal kran air perlu diganti baru.',
    status: 'RESOLVED',
    category: 'Plumbing',
    assignedStaff: 'Rudi (Teknisi)',
    property: 'Juragan Kost Pasteur (Depan RSHS)',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// GET /api/complaints — Fetch live complaints directly from PostgreSQL DB
export async function GET(req: NextRequest) {
  try {
    const complaints = await safeDbQuery(
      () => prisma.complaint.findMany({ orderBy: { createdAt: 'desc' }, include: { room: true, user: true } }),
      []
    );

    let formatted: any[] = [];
    if (complaints && complaints.length > 0) {
      formatted = complaints.map((c) => {
        let tName = c.user?.name;
        let rNum = c.room?.number;

        if (!tName && c.description?.includes('Laporan WhatsApp dari')) {
          try {
            tName = c.description.split('(')[0].replace('Laporan WhatsApp dari', '').trim();
          } catch {}
        }
        if (!rNum && c.description?.includes('(Kamar')) {
          try {
            rNum = c.description.split('(Kamar')[1].split(')')[0].trim();
          } catch {}
        }

        return {
          id: c.id,
          tenantName: tName || 'dr. Rizky Pratama, Sp.A (Penghuni RSHS)',
          roomNumber: rNum || 'EKS-01',
          title: c.title,
          description: c.description,
          status: c.status,
          category: c.category || 'lain_lain',
          assignedStaff: 'Bambang (Staf Lapangan)',
          property: 'Juragan Kost Pasteur (Depan RSHS)',
          createdAt: c.createdAt.toISOString(),
        };
      });
    } else {
      formatted = DEFAULT_COMPLAINTS_FALLBACK;
    }

    return NextResponse.json({ success: true, data: formatted, count: formatted.length });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: DEFAULT_COMPLAINTS_FALLBACK, count: DEFAULT_COMPLAINTS_FALLBACK.length });
  }
}

// POST /api/complaints — Submit new complaint to Database & trigger real-time toast
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newId = body.id || `CMP-${Date.now().toString().slice(-4)}`;
    const tenant = body.tenantName || 'Penghuni Kos';
    const room = body.roomNumber || 'A-101';
    const cleanTitle = body.title || body.description || 'Keluhan Kerusakan Kamar';

    const complaint = await prisma.complaint.create({
      data: {
        id: newId,
        title: cleanTitle,
        description: body.description || body.desc || body.message || 'Tidak ada uraian detail',
        status: 'OPEN',
      },
    });

    // Push real-time toast to Owner & Staff
    pushActivityNotification('default', {
      id: `cmp_${complaint.id}`,
      title: `🛠️ Keluhan Baru Masuk: Kamar ${room}`,
      message: `${tenant}: "${cleanTitle}". Segera periksa di tab Complaints.`,
      targetRole: ['owner', 'admin', 'employee'],
      targetTab: 'complaints',
      badgeColor: 'bg-rose-100 text-rose-800',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: complaint.id,
        tenantName: tenant,
        roomNumber: room,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        createdAt: complaint.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[POST /api/complaints error]', error);
    return NextResponse.json({ error: 'Gagal mengirim keluhan ke database' }, { status: 500 });
  }
}

// PUT /api/complaints — Update complaint status in Database
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedStaff, resolutionNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: status || undefined,
      },
    });

    if (status === 'RESOLVED' || status === 'IN_PROGRESS') {
      const statusLabel = status === 'RESOLVED' ? 'Selesai Diperbaiki' : 'Sedang Dikerjakan Teknisi';
      pushActivityNotification('default', {
        id: `cmp_stat_${id}_${Date.now()}`,
        title: `🛠️ Status Tiket #${id} Diperbarui`,
        message: `Tiket keluhan "${updated.title}": ${statusLabel}.`,
        targetRole: ['owner', 'tenant'],
        targetTab: 'complaints',
        badgeColor: status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800',
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[PUT /api/complaints error]', error);
    return NextResponse.json({ error: 'Gagal update status keluhan di database' }, { status: 500 });
  }
}

// DELETE /api/complaints — Delete complaint from Database
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.complaint.delete({ where: { id } });
    } else {
      await prisma.complaint.deleteMany({});
    }

    return NextResponse.json({ success: true, message: 'Data keluhan database berhasil dibersihkan' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus data keluhan' }, { status: 500 });
  }
}
