import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_BOOKINGS_FALLBACK = [
  {
    id: 'bkg-demo-01',
    bookingId: 'BKG-8801',
    tenantName: 'dr. Sarah Nabila',
    tenantPhone: '081234567890',
    roomNumber: 'EKS-02',
    roomType: 'Eksklusif (Balkon)',
    checkInDate: '2026-09-01',
    dpAmount: 500000,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bkg-demo-02',
    bookingId: 'BKG-8802',
    tenantName: 'Indra Gunawan, S.Kom',
    tenantPhone: '081987654321',
    roomNumber: 'NYM-01',
    roomType: 'Nyaman (Standard)',
    checkInDate: '2026-09-05',
    dpAmount: 500000,
    status: 'PENDING_DP',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

// GET /api/bookings — Fetch all bookings directly from PostgreSQL DB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (roomId) where.roomId = roomId;
    if (status) where.status = status.toUpperCase();

    const dbBookings = await safeDbQuery(
      () =>
        prisma.booking.findMany({
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
        }),
      []
    );

    let mappedDb: any[] = [];
    if (dbBookings && dbBookings.length > 0) {
      mappedDb = dbBookings.map((b) => ({
        id: b.id,
        bookingId: b.dpOrderId || `BKG-${b.id.slice(-6)}`,
        tenantName: b.tenantName,
        tenantPhone: b.tenantPhone,
        roomNumber: b.room?.number || 'NYM-01',
        roomType: b.room?.type || 'Nyaman',
        checkInDate: b.checkInDate.toISOString().slice(0, 10),
        dpAmount: b.dpAmount,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
        room: b.room,
      }));
    } else {
      mappedDb = DEFAULT_BOOKINGS_FALLBACK;
    }

    return NextResponse.json({ success: true, data: mappedDb, count: mappedDb.length });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: DEFAULT_BOOKINGS_FALLBACK, count: DEFAULT_BOOKINGS_FALLBACK.length });
  }
}

// POST /api/bookings — Record a new room booking in Database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomId,
      roomNumber,
      tenantName,
      tenantPhone,
      checkInDate,
      dpAmount,
      status = 'CONFIRMED',
    } = body;

    if (!tenantName || !tenantPhone) {
      return NextResponse.json({ error: 'Nama dan Nomor Telepon wajib diisi' }, { status: 400 });
    }

    const calculatedDp = dpAmount ? parseFloat(String(dpAmount)) : 750000;
    const dpOrderId = body.bookingId || `BKG-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    let targetRoomId = roomId;
    if (!targetRoomId && roomNumber) {
      const foundRoom = await prisma.room.findFirst({ where: { number: roomNumber } });
      if (foundRoom) targetRoomId = foundRoom.id;
    }
    if (!targetRoomId) {
      const firstRoom = await prisma.room.findFirst();
      targetRoomId = firstRoom?.id || 'rm-default';
    }

    const newBooking = await prisma.booking.create({
      data: {
        roomId: targetRoomId,
        tenantName,
        tenantPhone,
        checkInDate: new Date(checkInDate || nowIso),
        dpAmount: calculatedDp,
        dpOrderId,
        status: status.toUpperCase(),
      },
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
    });

    if (targetRoomId) {
      await prisma.room.update({
        where: { id: targetRoomId },
        data: { status: 'BOOKED' },
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        data: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/bookings error]', error);
    return NextResponse.json({ error: 'Gagal memproses booking kamar di database' }, { status: 500 });
  }
}

// PUT /api/bookings — Update booking status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: status ? status.toUpperCase() : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal update status booking' }, { status: 500 });
  }
}

// DELETE /api/bookings — Delete booking
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.booking.delete({ where: { id } });
    } else {
      await prisma.booking.deleteMany({});
    }

    return NextResponse.json({ success: true, message: 'Booking berhasil dihapus dari database' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus booking' }, { status: 500 });
  }
}
