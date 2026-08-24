import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp, formatBookingConfirmation, formatPaymentReceipt } from '@/lib/fonnte';
import { incrementSaaSUsage } from '@/lib/saasUsageMeter';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/duitku/webhook
 * Duitku Callback Endpoint
 * Triggers when tenant completes payment via QRIS / VA / Retail
 */
export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    const params = new URLSearchParams(rawText);
    
    // Duitku sends parameters as form-data / urlencoded
    const merchantCode = params.get('merchantCode') || '';
    const amount = params.get('amount') || '';
    const merchantOrderId = params.get('merchantOrderId') || '';
    const productDetail = params.get('productDetail') || '';
    const resultCode = params.get('resultCode') || '';
    const reference = params.get('reference') || '';
    const signature = params.get('signature') || '';

    console.log(`[Duitku Webhook Received] Order: ${merchantOrderId} | Result: ${resultCode} | Ref: ${reference}`);

    // Result code "00" indicates successful payment in Duitku
    if (resultCode === '00') {
      const parsedAmount = parseFloat(amount || '0');

      // Record Real-Time Payment Gateway Settlement Meter
      incrementSaaSUsage('PG', 1);

      // ── 1. Handle DP Booking Payment ──────────────────────────────────────
      if (merchantOrderId.startsWith('DP-') || merchantOrderId.includes('BKG')) {
        try {
          const booking = await prisma.booking.findFirst({
            where: {
              OR: [
                { dpOrderId: merchantOrderId },
                { id: merchantOrderId.replace('DP-', '') },
              ],
            },
            include: { room: true },
          });

          if (booking) {
            await prisma.booking.update({
              where: { id: booking.id },
              data: { status: 'CONFIRMED' },
            });

            await prisma.room.update({
              where: { id: booking.roomId },
              data: { status: 'BOOKED' },
            });

            // Send WhatsApp Confirmation + Smart Lock PIN to Tenant
            sendWhatsApp(
              booking.tenantPhone,
              formatBookingConfirmation({
                tenantName: booking.tenantName,
                propertyName: 'KosanKu Pro Residence',
                roomNumber: booking.room?.number || 'A-101',
                roomType: booking.room?.type || 'Standard Room',
                checkInDate: booking.checkInDate.toISOString().slice(0, 10),
                dpAmount: parsedAmount || booking.dpAmount,
                pinCode: '8821',
              })
            ).catch(() => {});

            // Send WhatsApp Alert to Owner
            sendWhatsApp(
              '081199887766',
              `💰 *Uang DP Booking Masuk via Duitku!* 💰\n\nPenghuni: *${booking.tenantName}*\nKamar: *${booking.room?.number || 'A-101'}*\nNominal DP: *Rp ${parsedAmount.toLocaleString('id-ID')}*\nStatus: *LUNAS (CONFIRMED)*`
            ).catch(() => {});
          }
        } catch (dbErr) {
          console.warn('[Duitku Webhook DB DP Update bypassed]', dbErr);
        }
      }

      // ── 2. Handle Monthly Rent Invoice Payment ─────────────────────────────
      else {
        try {
          const invoice = await prisma.invoice.findFirst({
            where: {
              OR: [
                { orderId: merchantOrderId },
                { invoiceNumber: merchantOrderId },
              ],
            },
            include: { user: true, room: true },
          });

          if (invoice) {
            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { paymentStatus: 'SETTLED' },
            });

            // Send WhatsApp Settlement Receipt to Tenant
            sendWhatsApp(
              invoice.user.phone,
              formatPaymentReceipt({
                tenantName: invoice.user.name,
                invoiceNumber: invoice.invoiceNumber,
                roomNumber: invoice.room?.number || 'A-101',
                amount: parsedAmount || invoice.totalAmount,
                paidAt: new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }),
              })
            ).catch(() => {});

            // Send WhatsApp Alert to Owner
            sendWhatsApp(
              '081199887766',
              `💰 *Uang Sewa Bulanan Masuk via Duitku!* 💰\n\nPenghuni: *${invoice.user.name}*\nKamar: *${invoice.room?.number || 'A-101'}*\nNominal: *Rp ${parsedAmount.toLocaleString('id-ID')}*\nStatus: *LUNAS (SETTLED)*`
            ).catch(() => {});
          }
        } catch (dbErr) {
          console.warn('[Duitku Webhook DB Invoice Update bypassed]', dbErr);
        }
      }
    }

    // Duitku expects standard "OK" string or HTTP 200 response
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('[POST /api/payments/duitku/webhook error]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
