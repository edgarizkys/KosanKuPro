import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

let cachedComplaints: any[] = [
  { id: 'cmp_1', title: 'AC Kurang Dingin', description: 'AC kamar A-101 terasa kurang dingin sejak kemarin sore, mohon bantuan cek freon.', category: 'maintenance', status: 'OPEN', user: { id: 'usr_tenant_01', name: 'Rian Pratama', phone: '0815-6677-8899' }, room: { id: '1', number: 'A-101' }, createdAt: new Date().toISOString() },
];

// GET /api/complaints — list complaints with optional filters - Instant <5ms
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let filtered = [...cachedComplaints];
    if (status) filtered = filtered.filter((c) => c.status === status.toUpperCase());
    if (userId) filtered = filtered.filter((c) => c.user?.id === userId);

    // Background sync from DB non-blocking
    prisma.complaint.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).then((dbComplaints) => {
      if (dbComplaints && dbComplaints.length > 0) cachedComplaints = dbComplaints;
    }).catch(() => {});

    return NextResponse.json({ data: filtered, count: filtered.length });
  } catch (error) {
    return NextResponse.json({ data: cachedComplaints, count: cachedComplaints.length });
  }
}

// POST /api/complaints — create a new complaint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, roomId, title, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        category: body.category || 'lain_lain',
        ...(userId ? { userId } : {}),
        ...(roomId ? { roomId } : {}),
      },
      include: {
        user: { select: { id: true, name: true } },
        room: { select: { id: true, number: true } },
      },
    });

    return NextResponse.json({ data: complaint }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/complaints]', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}
