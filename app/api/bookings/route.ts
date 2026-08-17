import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { roomStatusOverrides } from '@/lib/roomStatusStore';

export const dynamic = 'force-dynamic';

// In-memory property-scoped store for live bookings
const propertyBookingsMap = new Map<string, any[]>();

const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'bkg-demo-01',
    bookingId: 'BKG-883912',
    tenantName: 'Andi Wijaya',
    tenantPhone: '081299887766',
    email: 'andi.w@gmail.com',
    roomNumber: 'A-101',
    roomType: 'Deluxe AC',
    checkInDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    dpAmount: 750000,
    durationMonths: 6,
    status: 'CONFIRMED',
    paymentMethod: 'Midtrans QRIS',
    property: 'default',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    room: { id: 'rm-1', number: 'A-101', type: 'Deluxe AC', price: 1500000, floor: 1 },
  },
  {
    id: 'bkg-demo-02',
    bookingId: 'BKG-883913',
    tenantName: 'Rina Kusuma',
    tenantPhone: '081377665544',
    email: 'rina.k@gmail.com',
    roomNumber: 'B-203',
    roomType: 'Standard AC',
    checkInDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    dpAmount: 500000,
    durationMonths: 12,
    status: 'PENDING_DP',
    paymentMethod: 'Transfer Mandiri',
    property: 'default',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    room: { id: 'rm-2', number: 'B-203', type: 'Standard AC', price: 1400000, floor: 2 },
  },
];

propertyBookingsMap.set('default', INITIAL_DEMO_BOOKINGS);
propertyBookingsMap.set('rshs', INITIAL_DEMO_BOOKINGS);

// GET /api/bookings — Fetch all bookings with fallback and property filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');
    const propertySlug = searchParams.get('property') || 'default';

    const specificBookings = propertyBookingsMap.get(propertySlug) || [];
    const defaultBookings = propertyBookingsMap.get('default') || [];
    const rshsBookings = propertyBookingsMap.get('rshs') || [];
    let list = [...specificBookings];

    defaultBookings.forEach((b) => {
      if (!list.some((c) => c.id === b.id || c.bookingId === b.bookingId)) list.push(b);
    });

    rshsBookings.forEach((b) => {
      if (!list.some((c) => c.id === b.id || c.bookingId === b.bookingId)) list.push(b);
    });

    // Try fetching DB if connected
    try {
      const where: Record<string, unknown> = {};
      if (roomId) where.roomId = roomId;
      if (status) where.status = status;

      const dbBookings = await prisma.booking.findMany({
        where,
        include: {
          room: {
            select: {
              id: true,
              number: true,
              type: true,
              price: true,
              floor: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbBookings && dbBookings.length > 0) {
        const mappedDb = dbBookings.map((b) => ({
          id: b.id,
          bookingId: b.dpOrderId || `BKG-${b.id.slice(-6)}`,
          tenantName: b.tenantName,
          tenantPhone: b.tenantPhone,
          roomNumber: b.room?.number || 'A-101',
          roomType: b.room?.type || 'Standard',
          checkInDate: b.checkInDate.toISOString().slice(0, 10),
          dpAmount: b.dpAmount,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
          property: propertySlug,
          room: b.room,
        }));
        
        const combined = [...mappedDb];
        list.forEach((m) => {
          if (!combined.some((c) => c.id === m.id || c.bookingId === m.bookingId)) combined.push(m);
        });
        list = combined;
      }
    } catch {}

    if (status) {
      list = list.filter((b) => b.status?.toUpperCase() === status.toUpperCase());
    }

    return NextResponse.json({ data: list, count: list.length });
  } catch (error) {
    return NextResponse.json({ data: INITIAL_DEMO_BOOKINGS, count: INITIAL_DEMO_BOOKINGS.length });
  }
}

// POST /api/bookings — Record a new room booking from guest/tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const propertySlug = body.property || 'default';
    const {
      roomId,
      roomNumber = 'A-101',
      roomType = 'Standard Studio',
      tenantName,
      tenantPhone,
      email = '',
      checkInDate,
      dpAmount,
      durationMonths = 1,
      paymentMethod = 'Midtrans QRIS',
    } = body;

    if (!tenantName || !tenantPhone) {
      return NextResponse.json({ error: 'Nama dan Nomor Telepon wajib diisi' }, { status: 400 });
    }

    const calculatedDp = dpAmount ? parseFloat(String(dpAmount)) : 750000;
    const dpOrderId = body.bookingId || `BKG-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const newBooking = {
      id: `bkg-${Date.now()}`,
      bookingId: dpOrderId,
      tenantName,
      tenantPhone,
      email,
      roomNumber,
      roomType,
      checkInDate: checkInDate || nowIso.slice(0, 10),
      dpAmount: calculatedDp,
      durationMonths,
      status: body.status || 'CONFIRMED',
      paymentMethod,
      property: propertySlug,
      createdAt: nowIso,
      room: { id: roomId || `rm-${Date.now()}`, number: roomNumber, type: roomType, price: calculatedDp * 2, floor: 1 },
    };

    // 1. Update Room Status Overrides globally
    if (roomId) {
      roomStatusOverrides.set(`${propertySlug}:${roomId}`, 'BOOKED');
      roomStatusOverrides.set(`default:${roomId}`, 'BOOKED');
      roomStatusOverrides.set(`rshs:${roomId}`, 'BOOKED');
    }
    if (roomNumber) {
      roomStatusOverrides.set(`${propertySlug}:${roomNumber}`, 'BOOKED');
      roomStatusOverrides.set(`default:${roomNumber}`, 'BOOKED');
      roomStatusOverrides.set(`rshs:${roomNumber}`, 'BOOKED');
    }

    // 2. Store in all property memory lists for cross-visibility
    const spec = propertyBookingsMap.get(propertySlug) || [];
    propertyBookingsMap.set(propertySlug, [newBooking, ...spec.filter((b) => b.id !== newBooking.id)]);

    const def = propertyBookingsMap.get('default') || [];
    propertyBookingsMap.set('default', [newBooking, ...def.filter((b) => b.id !== newBooking.id)]);

    const rshs = propertyBookingsMap.get('rshs') || [];
    propertyBookingsMap.set('rshs', [newBooking, ...rshs.filter((b) => b.id !== newBooking.id)]);

    // 3. Non-blocking DB async persist if available
    try {
      if (roomId) {
        await prisma.booking.create({
          data: {
            roomId,
            tenantName,
            tenantPhone,
            checkInDate: new Date(checkInDate || nowIso),
            dpAmount: calculatedDp,
            dpOrderId,
            status: newBooking.status,
          },
        });
        await prisma.room.update({
          where: { id: roomId },
          data: { status: 'BOOKED' },
        });
      }
    } catch (dbErr) {}

    return NextResponse.json(
      {
        success: true,
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/bookings error]', error);
    return NextResponse.json({ error: 'Gagal memproses booking kamar' }, { status: 500 });
  }
}
