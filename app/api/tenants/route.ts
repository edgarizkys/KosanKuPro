import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tenants — list all tenants (users with role TENANT)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { role: 'TENANT' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tenants = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        rooms: { select: { id: true, number: true, type: true, price: true, status: true } },
        invoices: {
          select: { id: true, invoiceNumber: true, totalAmount: true, paymentStatus: true, dueDate: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: tenants, count: tenants.length });
  } catch (error) {
    console.error('[GET /api/tenants]', error);
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
  }
}

// POST /api/tenants — register a new tenant
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, roomId } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: 'name, email, and phone are required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Simple hash placeholder — in production use bcrypt
    const passwordHash = password || 'default_password_hash';

    const tenant = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'TENANT',
        ...(roomId ? { rooms: { connect: { id: roomId } } } : {}),
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    // Update room status to OCCUPIED if assigned
    if (roomId) {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED', tenantId: tenant.id },
      });
    }

    return NextResponse.json({ data: tenant }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/tenants]', error);
    return NextResponse.json({ error: 'Failed to register tenant' }, { status: 500 });
  }
}
