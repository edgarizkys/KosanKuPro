import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/bookings — Fetch all bookings with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
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

    return NextResponse.json({ data: bookings, count: bookings.length });
  } catch (error) {
    console.error('[GET /api/bookings error]', error);
    return NextResponse.json({ error: 'Gagal mengambil data booking' }, { status: 500 });
  }
}

// POST /api/bookings — Record a new room booking from the guest/tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      roomId,
      roomNumber,
      tenantName,
      tenantPhone,
      email,
      checkInDate,
      dpAmount,
      durationMonths,
      emergencyName,
      emergencyPhone,
      reason,
      otherReason,
      idCardUrl,
      paymentMethod,
    } = body;

    if (!tenantName || !tenantPhone) {
      return NextResponse.json({ error: 'Nama dan Nomor Telepon wajib diisi' }, { status: 400 });
    }

    // 1. Resolve room if roomId is missing or by room number
    let targetRoom: any = null;
    if (roomId) {
      targetRoom = await prisma.room.findUnique({ where: { id: roomId } });
    } else if (roomNumber) {
      targetRoom = await prisma.room.findUnique({ where: { number: roomNumber } });
    }

    // Fallback: If no room matches in DB, find any room or create one
    if (!targetRoom) {
      const anyRoom = await prisma.room.findFirst();
      if (anyRoom) {
        targetRoom = anyRoom;
      } else {
        targetRoom = await prisma.room.create({
          data: {
            number: roomNumber || 'A-101',
            type: 'Deluxe Studio Smart',
            price: 1500000,
            floor: 1,
            capacity: 1,
            facilities: ['AC', 'WiFi', 'KM Dalam', 'Smart Lock'],
          },
        });
      }
    }

    // 2. Parse checkInDate
    let parsedDate = new Date();
    if (checkInDate) {
      const d = new Date(checkInDate);
      if (!isNaN(d.getTime())) parsedDate = d;
    }

    const calculatedDp = dpAmount ? parseFloat(String(dpAmount)) : Math.round((targetRoom?.price || 1500000) * 0.5);
    const dpOrderId = `BKG-${Date.now().toString().slice(-6)}`;

    // 3. Create Booking record in Database
    const booking = await prisma.booking.create({
      data: {
        roomId: targetRoom.id,
        tenantName,
        tenantPhone,
        checkInDate: parsedDate,
        dpAmount: calculatedDp,
        dpOrderId,
        status: 'PENDING_DP', // or CONFIRMED if simulated/settled
      },
    });

    // 4. Update Room status to BOOKED
    await prisma.room.update({
      where: { id: targetRoom.id },
      data: { status: 'BOOKED' },
    });

    // 5. Create In-App Notification for Owner and Admin
    try {
      // Find an admin or owner user to relate the notification to, or first available user
      const adminOrOwner = await prisma.user.findFirst({
        where: { role: { in: ['SUPERADMIN', 'ADMIN', 'OWNER'] } },
      });

      if (adminOrOwner) {
        const notifMsg = `Calon Penghuni ${tenantName} (${tenantPhone}) telah mengajukan booking Kamar ${targetRoom.number}. Durasi: ${durationMonths || 1} bulan. DP: Rp ${calculatedDp.toLocaleString('id-ID')}.`;
        await prisma.notificationLog.create({
          data: {
            userId: adminOrOwner.id,
            title: `📅 Booking Kamar ${targetRoom.number} Baru`,
            message: notifMsg,
            channel: 'IN_APP',
          },
        });
      }
    } catch (notifErr) {
      console.warn('[POST /api/bookings notification warning]', notifErr);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          booking,
          room: targetRoom,
          bookingId: dpOrderId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[POST /api/bookings error]', error);
    return NextResponse.json({ error: 'Gagal memproses booking kamar' }, { status: 500 });
  }
}
