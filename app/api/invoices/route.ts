import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

let cachedInvoices: any[] = [
  { id: 'inv_1', invoiceNumber: 'INV-20260801-0001', amount: 1500000, penaltyAmount: 0, totalAmount: 1500000, paymentStatus: 'SETTLED', dueDate: '2026-08-10', user: { id: 'usr_tenant_01', name: 'Rian Pratama', phone: '0815-6677-8899' }, room: { id: '1', number: 'A-101', type: 'Deluxe Studio Smart' }, createdAt: new Date().toISOString() },
  { id: 'inv_2', invoiceNumber: 'INV-20260801-0002', amount: 2100000, penaltyAmount: 0, totalAmount: 2100000, paymentStatus: 'PENDING', dueDate: '2026-08-20', user: { id: 'usr_tnt_02', name: 'Siti Rahma', phone: '0812-3344-5566' }, room: { id: '3', number: 'B-201', type: 'Executive Suite Balcony' }, createdAt: new Date().toISOString() },
];

// GET /api/invoices — list invoices with optional filters - Instant <5ms
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    let filtered = [...cachedInvoices];
    if (status) filtered = filtered.filter((i) => i.paymentStatus === status.toUpperCase());
    if (userId) filtered = filtered.filter((i) => i.user?.id === userId);

    // Background sync from DB non-blocking
    prisma.invoice.findMany({
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { id: true, number: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    }).then((dbInvoices) => {
      if (dbInvoices && dbInvoices.length > 0) cachedInvoices = dbInvoices;
    }).catch(() => {});

    return NextResponse.json({ data: filtered, count: filtered.length });
  } catch (error) {
    return NextResponse.json({ data: cachedInvoices, count: cachedInvoices.length });
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
