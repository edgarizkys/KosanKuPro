import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/invoices — list invoices with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};
    if (status) where.paymentStatus = status.toUpperCase();
    if (userId) where.userId = userId;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: invoices, count: invoices.length });
  } catch (error) {
    console.error('[GET /api/invoices]', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST /api/invoices — create a new invoice
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, roomId, amount, penaltyAmount, dueDate } = body;

    if (!userId || !roomId || !amount || !dueDate) {
      return NextResponse.json({ error: 'userId, roomId, amount, and dueDate are required' }, { status: 400 });
    }

    const penalty = penaltyAmount ? parseFloat(penaltyAmount) : 0;
    const total = parseFloat(amount) + penalty;

    // Generate invoice number: INV-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        userId,
        roomId,
        amount: parseFloat(amount),
        penaltyAmount: penalty,
        totalAmount: total,
        dueDate: new Date(dueDate),
      },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true } },
      },
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/invoices]', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
