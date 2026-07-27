import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSnapTransaction } from '@/lib/midtrans';

// POST /api/payments/create — generate Midtrans Snap token for an invoice
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        room: { select: { number: true, type: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.paymentStatus === 'SETTLED') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    const orderId = invoice.orderId || `${invoice.invoiceNumber}-${Date.now()}`;

    const snap = await createSnapTransaction({
      orderId,
      amount: invoice.totalAmount,
      customerName: invoice.user.name,
      customerEmail: invoice.user.email,
      customerPhone: invoice.user.phone,
      itemName: `Sewa Kamar ${invoice.room.number} - ${invoice.room.type}`,
    });

    // Save orderId and snapToken to invoice
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { orderId, snapToken: snap.token },
    });

    return NextResponse.json({
      data: {
        token: snap.token,
        redirectUrl: snap.redirectUrl,
        orderId,
        amount: invoice.totalAmount,
      },
    });
  } catch (error) {
    console.error('[POST /api/payments/create]', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
