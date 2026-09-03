import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSnapTransaction } from '@/lib/midtrans';
import { createDuitkuTransaction } from '@/lib/duitku';

export const dynamic = 'force-dynamic';

// POST /api/payments/create — generate Payment Token / URL (Supports both Duitku & Midtrans)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, bookingId, adminFee = 5000, provider = process.env.PAYMENT_PROVIDER || 'duitku' } = body;

    // ── 1. Flow A: Booking DP 50% ───────────────────────────────────────────
    if (bookingId) {
      const dpAmount = parseFloat(String(body.amount || 750000));
      const totalCharge = dpAmount + parseFloat(String(adminFee || 0));
      const orderId = `DP-${bookingId}-${Date.now().toString().slice(-4)}`;
      const itemName = `DP 50% Booking Kamar ${body.roomNumber || ''} (${body.roomType || 'Standard'})`;

      if (provider === 'duitku') {
        const duitkuRes = await createDuitkuTransaction({
          orderId,
          amount: totalCharge,
          customerName: body.customerName || 'Calon Penghuni',
          customerEmail: body.customerEmail || 'tenant@kosanku.pro',
          customerPhone: body.customerPhone || '08123456789',
          itemDetails: [{ name: itemName, price: totalCharge, quantity: 1 }],
        });

        return NextResponse.json({
          data: {
            provider: 'duitku',
            paymentUrl: duitkuRes.paymentUrl,
            reference: (duitkuRes as any).reference,
            orderId,
            baseAmount: dpAmount,
            adminFee,
            totalAmount: totalCharge,
          },
        });
      }

      // Default: Midtrans
      const snap = await createSnapTransaction({
        orderId,
        amount: totalCharge,
        customerName: body.customerName || 'Calon Penghuni',
        customerEmail: body.customerEmail || 'tenant@kosanku.pro',
        customerPhone: body.customerPhone || '08123456789',
        itemName,
      });

      return NextResponse.json({
        data: {
          provider: 'midtrans',
          token: snap.token,
          redirectUrl: snap.redirectUrl,
          orderId,
          baseAmount: dpAmount,
          adminFee,
          totalAmount: totalCharge,
        },
      });
    }

    // ── 2. Flow B: Monthly Invoice ──────────────────────────────────────────
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId or bookingId is required' }, { status: 400 });
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

    const baseAmount = invoice.totalAmount;
    const totalCharge = baseAmount + parseFloat(String(adminFee || 0));
    const orderId = invoice.orderId || `${invoice.invoiceNumber}-${Date.now().toString().slice(-4)}`;
    const itemName = `Sewa Kamar ${invoice.room.number} - ${invoice.room.type}`;

    if (provider === 'duitku') {
      const duitkuRes = await createDuitkuTransaction({
        orderId,
        amount: totalCharge,
        customerName: invoice.user.name,
        customerEmail: invoice.user.email,
        customerPhone: invoice.user.phone,
        itemDetails: [{ name: itemName, price: totalCharge, quantity: 1 }],
      });

      return NextResponse.json({
        data: {
          provider: 'duitku',
          paymentUrl: duitkuRes.paymentUrl,
          reference: (duitkuRes as any).reference,
          orderId,
          baseAmount,
          adminFee,
          totalAmount: totalCharge,
        },
      });
    }

    // Default: Midtrans
    const snap = await createSnapTransaction({
      orderId,
      amount: totalCharge,
      customerName: invoice.user.name,
      customerEmail: invoice.user.email,
      customerPhone: invoice.user.phone,
      itemName,
    });

    // Save orderId and snapToken to invoice
    try {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { orderId, snapToken: snap.token },
      });
    } catch {}

    return NextResponse.json({
      data: {
        provider: 'midtrans',
        token: snap.token,
        redirectUrl: snap.redirectUrl,
        snapScriptUrl: snap.snapScriptUrl,
        orderId,
        baseAmount,
        adminFee,
        totalAmount: totalCharge,
      },
    });
  } catch (error) {
    console.error('[POST /api/payments/create]', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
