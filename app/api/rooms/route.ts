import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roomStatusOverrides } from '@/lib/roomStatusStore';

export const dynamic = 'force-dynamic';

let cachedRooms: any[] = [
  { id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000, floor: 1, capacity: 1, facilities: ['AC', 'WiFi', 'KM Dalam', 'Water Heater', 'Smart TV'], status: 'OCCUPIED', tenant: { id: 'usr_tenant_01', name: 'Rian Pratama', phone: '0815-6677-8899' }, imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600' },
  { id: '2', number: 'A-102', type: 'Standard Room Single', price: 1200000, floor: 1, capacity: 1, facilities: ['AC', 'WiFi', 'KM Luar'], status: 'AVAILABLE', tenant: null, imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600' },
  { id: '3', number: 'B-201', type: 'Executive Suite Balcony', price: 2100000, floor: 2, capacity: 2, facilities: ['AC', 'WiFi', 'KM Dalam', 'Balkon', 'Kulkas'], status: 'OCCUPIED', tenant: { id: 'usr_tnt_02', name: 'Siti Rahma', phone: '0812-3344-5566' }, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600' },
  { id: '4', number: 'B-202', type: 'Standard Room Single', price: 1200000, floor: 2, capacity: 1, facilities: ['AC', 'WiFi', 'KM Luar'], status: 'AVAILABLE', tenant: null, imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600' },
];

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

// GET /api/rooms — list with optional filters (status, floor, type, property/kosan)
export async function GET(req: NextRequest) {
  let propertyParam: string | null = null;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const floor = searchParams.get('floor');
    const type = searchParams.get('type');
    propertyParam = searchParams.get('property') || searchParams.get('kosan') || 'default';
    const isRshs = propertyParam && propertyParam.toLowerCase() === 'rshs';

    // 1. Direct DB Query filtered strictly by property
    try {
      const where: any = {};
      if (status) where.status = status.toUpperCase();
      if (floor) where.floor = parseInt(floor, 10);
      if (type) where.type = { contains: type, mode: 'insensitive' };

      if (propertyParam && propertyParam !== 'default' && propertyParam !== 'all') {
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

    const { RSHS_ROOMS_DATA } = await import('@/lib/rshsRoomsData');

    // Fallback for static RSHS if specific RSHS requested
    if (isRshs) {
      let filteredRshs = applyStatusOverrides([...RSHS_ROOMS_DATA], 'rshs');
      if (status) filteredRshs = filteredRshs.filter((r) => r.status === status.toUpperCase());
      if (floor) filteredRshs = filteredRshs.filter((r) => r.floor === parseInt(floor, 10));
      if (type) filteredRshs = filteredRshs.filter((r) => r.type.toLowerCase().includes(type.toLowerCase()));
      return NextResponse.json({ data: filteredRshs, count: filteredRshs.length });
    }

    // Combine default cachedRooms & RSHS rooms so Konsolidasi / Default sees all units
    const combinedAll = [...cachedRooms];
    RSHS_ROOMS_DATA.forEach((rshsRoom) => {
      if (!combinedAll.some((c) => c.number === rshsRoom.number || c.id === rshsRoom.id)) {
        combinedAll.push(rshsRoom);
      }
    });

    let filtered = applyStatusOverrides(combinedAll, propertyParam);
    if (status) filtered = filtered.filter((r) => r.status === status.toUpperCase());
    if (floor) filtered = filtered.filter((r) => r.floor === parseInt(floor, 10));
    if (type) filtered = filtered.filter((r) => r.type.toLowerCase().includes(type.toLowerCase()));

    return NextResponse.json({ data: filtered, count: filtered.length });
  } catch (error) {
    const { RSHS_ROOMS_DATA } = await import('@/lib/rshsRoomsData');
    const combinedAll = [...cachedRooms, ...RSHS_ROOMS_DATA];
    const result = applyStatusOverrides(combinedAll, propertyParam || 'default');
    return NextResponse.json({ data: result, count: result.length });
  }
}

// POST /api/rooms — create a new room
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { number, type, price, floor, capacity, facilities, propertyId, imageUrl, videoUrl } = body;

    if (!number || !type || !price) {
      return NextResponse.json({ error: 'number, type, and price are required' }, { status: 400 });
    }

    const newRoomObj = {
      id: `rm-${Date.now()}`,
      number,
      type,
      price: parseFloat(price),
      floor: floor ? parseInt(floor, 10) : 1,
      capacity: capacity ? parseInt(capacity, 10) : 1,
      facilities: facilities || [],
      status: 'AVAILABLE',
      tenant: null,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      propertyId: propertyId || 'default',
    };

    cachedRooms.push(newRoomObj);

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
