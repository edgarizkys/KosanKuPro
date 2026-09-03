import { NextRequest, NextResponse } from 'next/server';
import { createSnapTransaction } from '@/lib/midtrans';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId = `ORD-${Date.now()}`,
      amount,
      customerName = 'Penghuni Kos',
      customerEmail = 'tenant@kosanku.pro',
      customerPhone = '08123456789',
      itemName = 'Pembayaran Sewa Kosan',
      itemDetails,
    } = body;

    const parsedAmount = parseFloat(String(amount || 0));

    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json(
        { error: 'Nominal pembayaran (amount) tidak valid' },
        { status: 400 }
      );
    }

    const firstItemName = itemDetails?.[0]?.name || itemName;

    const snap = await createSnapTransaction({
      orderId,
      amount: parsedAmount,
      customerName,
      customerEmail,
      customerPhone,
      itemName: firstItemName,
    });

    return NextResponse.json({
      token: snap.token,
      redirectUrl: snap.redirectUrl,
      orderId,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || process.env.MIDTRANS_CLIENT_KEY || 'Mid-client-8f3eXqGDNIR_WoDE',
    });
  } catch (error: any) {
    console.error('[POST /api/midtrans/token]', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses pembuatan token Midtrans' },
      { status: 500 }
    );
  }
}
