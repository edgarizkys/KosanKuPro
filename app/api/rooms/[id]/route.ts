import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/rooms/[id] — update room (status, price, facilities, tenant assignment)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const allowedFields = ['number', 'type', 'price', 'status', 'floor', 'capacity', 'facilities', 'propertyId', 'tenantId'];
    const data: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = field === 'price' ? parseFloat(body[field]) : body[field];
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data,
      include: { tenant: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ data: room });
  } catch (error) {
    console.error('[PUT /api/rooms/[id]]', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

// DELETE /api/rooms/[id] — soft delete (set status to MAINTENANCE) or hard delete
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get('hard') === 'true';

    const existing = await prisma.room.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (hard) {
      await prisma.room.delete({ where: { id } });
      return NextResponse.json({ message: `Room ${existing.number} deleted permanently` });
    }

    // Soft delete: mark as MAINTENANCE and remove tenant
    const room = await prisma.room.update({
      where: { id },
      data: { status: 'MAINTENANCE', tenantId: null },
    });

    return NextResponse.json({ data: room, message: `Room ${existing.number} marked as MAINTENANCE (soft delete)` });
  } catch (error) {
    console.error('[DELETE /api/rooms/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
