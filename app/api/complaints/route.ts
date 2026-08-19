import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/complaints — Fetch live complaints directly from PostgreSQL DB
export async function GET(req: NextRequest) {
  try {
    const complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { room: true, user: true },
    });

    const formatted = complaints.map((c) => ({
      id: c.id,
      tenantName: c.user?.name || 'dr. Rizky Pratama, Sp.A',
      roomNumber: c.room?.number || 'EKS-01',
      title: c.title,
      description: c.description,
      status: c.status,
      assignedStaff: null,
      property: 'rshs',
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted, count: formatted.length });
  } catch (error: any) {
    console.error('[GET /api/complaints error]', error);
    return NextResponse.json({ success: true, data: [], count: 0 });
  }
}

// POST /api/complaints — Submit new complaint to Database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newId = body.id || `CMP-${Date.now().toString().slice(-4)}`;

    const complaint = await prisma.complaint.create({
      data: {
        id: newId,
        title: body.title || body.description || 'Keluhan Tenant',
        description: body.description || body.desc || body.message || 'Tidak ada uraian detail',
        status: 'OPEN',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: complaint.id,
        tenantName: body.tenantName || 'Penghuni Kos (WhatsApp)',
        roomNumber: body.roomNumber || 'EKS-01',
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
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status: status || undefined,
      },
    });

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
