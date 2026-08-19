import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/invoices — list invoices directly from PostgreSQL DB
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) where.paymentStatus = status.toUpperCase();

    const dbInvoices = await prisma.invoice.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedDb = dbInvoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      penaltyAmount: inv.penaltyAmount,
      totalAmount: inv.totalAmount,
      paymentStatus: inv.paymentStatus,
      dueDate: inv.dueDate.toISOString().slice(0, 10),
      createdAt: inv.createdAt.toISOString(),
      user: inv.user || { name: 'Penghuni Kos' },
      room: inv.room || { number: 'EKS-01' },
    }));

    return NextResponse.json({ success: true, data: mappedDb, count: mappedDb.length });
  } catch (error: any) {
    console.error('[GET /api/invoices error]', error);
    return NextResponse.json({ success: true, data: [], count: 0 });
  }
}

// POST /api/invoices — create a new invoice into Database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amountNum = parseFloat(body.amount || '0');
    const penaltyNum = body.penaltyAmount ? parseFloat(body.penaltyAmount) : 0;
    const totalNum = amountNum + penaltyNum;
    const dueDateStr = body.dueDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = body.invoiceNumber || `INV-${dateStr}-${Date.now().toString().slice(-4)}`;

    let userId = body.userId;
    let roomId = body.roomId;

    if (!userId) {
      const firstUser = await prisma.user.findFirst({ where: { role: 'TENANT' } });
      userId = firstUser?.id || 'usr-default';
    }
    if (!roomId) {
      const firstRoom = await prisma.room.findFirst();
      roomId = firstRoom?.id || 'rm-default';
    }

    const created = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId,
        roomId,
        amount: amountNum,
        penaltyAmount: penaltyNum,
        totalAmount: totalNum,
        paymentStatus: body.paymentStatus || 'PENDING',
        dueDate: new Date(dueDateStr),
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true, type: true } },
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/invoices error]', error);
    return NextResponse.json({ error: 'Gagal membuat invoice di database' }, { status: 500 });
  }
}

// PUT /api/invoices — update payment status in Database
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        paymentStatus: paymentStatus ? paymentStatus.toUpperCase() : undefined,
        settledAt: paymentStatus?.toUpperCase() === 'SETTLED' ? new Date() : undefined,
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true, type: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[PUT /api/invoices error]', error);
    return NextResponse.json({ error: 'Gagal update invoice di database' }, { status: 500 });
  }
}

// DELETE /api/invoices — delete invoice from Database
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.invoice.delete({ where: { id } });
    } else {
      await prisma.invoice.deleteMany({});
    }

    return NextResponse.json({ success: true, message: 'Invoice berhasil dibersihkan dari database' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus invoice' }, { status: 500 });
  }
}
