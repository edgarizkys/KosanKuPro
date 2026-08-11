import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/rooms — list with optional filters (status, floor, type)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const floor = searchParams.get('floor');
    const type = searchParams.get('type');

    const where: Record<string, unknown> = {};
    if (status) where.status = status.toUpperCase();
    if (floor) where.floor = parseInt(floor, 10);
    if (type) where.type = { contains: type, mode: 'insensitive' };

    const rooms = await prisma.room.findMany({
      where,
      include: { tenant: { select: { id: true, name: true, phone: true } } },
      orderBy: { number: 'asc' },
    });

    return NextResponse.json({ data: rooms, count: rooms.length });
  } catch (error) {
    console.error('[GET /api/rooms]', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

// POST /api/rooms — create a new room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { number, type, price, floor, capacity, facilities, propertyId, imageUrl } = body;

    if (!number || !type || !price) {
      return NextResponse.json({ error: 'number, type, and price are required' }, { status: 400 });
    }

    const existing = await prisma.room.findUnique({ where: { number } });
    if (existing) {
      return NextResponse.json({ error: `Room ${number} already exists` }, { status: 409 });
    }

    const room = await prisma.room.create({
      data: {
        number,
        type,
        price: parseFloat(price),
        floor: floor ? parseInt(floor, 10) : 1,
        capacity: capacity ? parseInt(capacity, 10) : 1,
        facilities: facilities || [],
        imageUrl: imageUrl || null,
        propertyId: propertyId || null,
      },
    });

    return NextResponse.json({ data: room }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/rooms]', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
