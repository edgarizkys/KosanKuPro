import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roomStatusOverrides } from '@/lib/roomStatusStore';
import { ALL_MULTI_PROPERTY_ROOMS } from '@/lib/multiPropertyRoomsData';

export const dynamic = 'force-dynamic';

function applyStatusOverrides(roomList: any[], propertySlug: string) {
  return roomList.map((r) => {
    const override =
      roomStatusOverrides.get(`${propertySlug}:${r.id}`) ||
      roomStatusOverrides.get(`${propertySlug}:${r.number}`) ||
      roomStatusOverrides.get(`rshs:${r.id}`) ||
      roomStatusOverrides.get(`rshs:${r.number}`) ||
      roomStatusOverrides.get(`default:${r.id}`) ||
      roomStatusOverrides.get(`default:${r.number}`);

    return override ? { ...r, status: override } : r;
  });
}

// GET /api/rooms — list with optional filters (status, floor, type, property, rentalType, city)
export async function GET(req: NextRequest) {
  let propertyParam: string | null = null;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const floor = searchParams.get('floor');
    const type = searchParams.get('type');
    const rentalType = searchParams.get('rentalType'); // daily | monthly
    const city = searchParams.get('city');
    propertyParam = searchParams.get('property') || searchParams.get('kosan') || 'all';

    // 1. Check Database first if available
    try {
      const where: any = {};
      if (status && status !== 'ALL') where.status = status.toUpperCase();
      if (floor && floor !== 'ALL') where.floor = parseInt(floor, 10);
      if (type) where.type = { contains: type, mode: 'insensitive' };

      if (propertyParam && propertyParam !== 'all' && propertyParam !== 'default') {
        where.OR = [
          { propertyId: propertyParam },
          { property: { name: { contains: propertyParam, mode: 'insensitive' } } },
        ];
      }

      where.NOT = [
        { number: { contains: 'EDGAR', mode: 'insensitive' } },
        { type: { contains: 'SIREGAR', mode: 'insensitive' } },
        { type: { contains: 'SUREGR', mode: 'insensitive' } },
      ];

      const dbRooms = await prisma.room.findMany({
        where,
        include: { tenant: { select: { id: true, name: true, phone: true } } },
        orderBy: { number: 'asc' },
      });

      if (dbRooms && dbRooms.length > 0) {
        const result = applyStatusOverrides(dbRooms, propertyParam);
        return NextResponse.json({ data: result, count: result.length });
      }
    } catch {}

    // 2. Multi-Property Unified In-Memory Registry
    let rooms = [...ALL_MULTI_PROPERTY_ROOMS];

    if (propertyParam && propertyParam !== 'all' && propertyParam !== 'default') {
      rooms = rooms.filter((r) => r.propertySlug === propertyParam);
    }

    if (city && city !== 'all') {
      rooms = rooms.filter((r) => r.propertyCity.toLowerCase().includes(city.toLowerCase()));
    }

    if (rentalType === 'daily') {
      rooms = rooms.filter((r) => r.allowDailyBooking);
    }

    if (status && status !== 'ALL') {
      rooms = rooms.filter((r) => (roomStatusOverrides.get(r.id) || r.status) === status.toUpperCase());
    }

    if (floor && floor !== 'ALL') {
      rooms = rooms.filter((r) => r.floor === parseInt(floor, 10));
    }

    if (type) {
      rooms = rooms.filter((r) => r.type.toLowerCase().includes(type.toLowerCase()));
    }

    const result = applyStatusOverrides(rooms, propertyParam || 'all');
    return NextResponse.json({ data: result, count: result.length });
  } catch (error) {
    const result = applyStatusOverrides(ALL_MULTI_PROPERTY_ROOMS, propertyParam || 'all');
    return NextResponse.json({ data: result, count: result.length });
  }
}

// POST /api/rooms — create a new room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { number, type, price, dailyPrice, floor, capacity, facilities, propertyId, propertySlug, propertyName, propertyCity, propertyAddress, imageUrl, videoUrl } = body;

    if (!number || !type || !price) {
      return NextResponse.json({ error: 'number, type, and price are required' }, { status: 400 });
    }

    const newRoomObj = {
      id: `rm-${Date.now()}`,
      number,
      type,
      propertySlug: propertySlug || propertyId || 'default',
      propertyName: propertyName || 'KosanKu Pro Residence',
      propertyCity: propertyCity || 'Bandung',
      propertyAddress: propertyAddress || 'Jl. Merdeka No. 123, Bandung',
      price: parseFloat(price),
      dailyPrice: dailyPrice ? parseFloat(dailyPrice) : undefined,
      allowDailyBooking: !!dailyPrice,
      floor: floor ? parseInt(floor, 10) : 1,
      capacity: capacity ? parseInt(capacity, 10) : 1,
      facilities: facilities || [],
      status: 'AVAILABLE',
      tenant: null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
    };

    try {
      await prisma.room.create({
        data: {
          number,
          type,
          price: parseFloat(price),
          floor: floor ? parseInt(floor, 10) : 1,
          capacity: capacity ? parseInt(capacity, 10) : 1,
          facilities: facilities || [],
          status: 'AVAILABLE',
          imageUrl: imageUrl || null,
        },
      });
    } catch {}

    return NextResponse.json({ data: newRoomObj }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/rooms error]', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
