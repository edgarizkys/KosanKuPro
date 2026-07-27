// Next.js App Router API Route: Midtrans Payment Checkout Creation
// Path: app/api/invoice/create/route.ts or server.js handler

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { invoiceId, amount, customerDetails, itemDetails } = await req.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-TEST_KEY_DEMO';
    const isProduction = process.env.NODE_ENV === 'production';
    const authHeader = Buffer.from(`${serverKey}:`).toString('base64');

    const midtransUrl = isProduction
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const orderId = `KOSANKU-${invoiceId}-${Date.now()}`;

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      item_details: itemDetails || [
        {
          id: invoiceId,
          price: amount,
          quantity: 1,
          name: 'Sewa Kos Monthly Rent',
        },
      ],
      credit_card: {
        secure: true,
      },
    };

    const response = await fetch(midtransUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error_messages || 'Failed to create Midtrans transaction' }, { status: 500 });
    }

    return NextResponse.json({
      token: data.token,
      redirect_url: data.redirect_url,
      orderId: orderId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
