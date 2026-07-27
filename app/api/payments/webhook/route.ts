import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySignature, mapTransactionStatus } from '@/lib/midtrans';
import { sendWhatsApp } from '@/lib/fonnte';

// POST /api/payments/webhook — Midtrans payment notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type, va_numbers } = body;

    // Verify signature
    const isValid = verifySignature(order_id, status_code, gross_amount, signature_key);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Find invoice by orderId
    const invoice = await prisma.invoice.findUnique({
      where: { orderId: order_id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        room: { select: { number: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found for order' }, { status: 404 });
    }

    const newStatus = mapTransactionStatus(transaction_status);

    // Log the payment notification
    await prisma.paymentLog.create({
      data: {
        invoiceId: invoice.id,
        rawPayload: body,
        transactionStatus: transaction_status,
        statusCode: status_code,
      },
    });

    // Update invoice status
    const vaNumber = va_numbers?.[0]?.va_number || null;
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentStatus: newStatus as any,
        paymentType: payment_type || null,
        vaNumber,
        ...(newStatus === 'SETTLED' ? { settledAt: new Date() } : {}),
      },
    });

    // Send WhatsApp confirmation on settlement
    if (newStatus === 'SETTLED') {
      const amount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(invoice.totalAmount);

      const message = `✅ Pembayaran Diterima!\n\nHalo ${invoice.user.name}, pembayaran sebesar *${amount}* untuk kamar ${invoice.room.number} telah kami terima.\n\nInvoice: ${invoice.invoiceNumber}\nMetode: ${payment_type}\n\nTerima kasih! 🙏`;
      await sendWhatsApp(invoice.user.phone, message);

      // Log notification
      await prisma.notificationLog.create({
        data: {
          userId: invoice.user.id,
          title: 'Pembayaran Berhasil',
          message: `Pembayaran ${amount} untuk kamar ${invoice.room.number} telah diterima.`,
          channel: 'WHATSAPP',
        },
      });
    }

    return NextResponse.json({ message: 'Webhook processed', status: newStatus });
  } catch (error) {
    console.error('[POST /api/payments/webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
