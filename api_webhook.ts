// Next.js App Router API Route: Midtrans Payment Webhook Receiver
// Path: app/api/payments/webhook/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const notification = await req.json();
    
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-TEST_KEY_DEMO';
    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type } = notification;

    // Signature Key Verification: SHA512(order_id + status_code + gross_amount + ServerKey)
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key !== expectedSignature && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Invalid signature key' }, { status: 403 });
    }

    let paymentStatus = 'PENDING';

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      paymentStatus = 'SETTLED';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      paymentStatus = 'EXPIRED';
    }

    // UPDATE DATABASE (Prisma / Supabase Example)
    /*
    await prisma.invoice.update({
      where: { orderId: order_id },
      data: {
        paymentStatus: paymentStatus,
        settledAt: paymentStatus === 'SETTLED' ? new Date() : null,
        paymentType: payment_type,
      },
    });

    if (paymentStatus === 'SETTLED') {
      // Automatically extend lease / mark tenant as current
    }
    */

    return NextResponse.json({ status: 'OK', message: `Invoice updated to ${paymentStatus}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
