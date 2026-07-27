import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/complaints — list complaints with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status.toUpperCase();
    if (userId) where.userId = userId;

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: complaints, count: complaints.length });
  } catch (error) {
    console.error('[GET /api/complaints]', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
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
