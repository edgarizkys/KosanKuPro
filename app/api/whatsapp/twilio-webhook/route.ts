import { NextRequest, NextResponse } from 'next/server';
import { pushWaLiveLog } from '@/lib/activityEvents';
import { sendTwilioWhatsApp } from '@/lib/twilio';

export const dynamic = 'force-dynamic';

/**
 * GET /api/whatsapp/twilio-webhook
 * Friendly Status Health Check for Browser Testing
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'KosanKu Pro Twilio WhatsApp Webhook Gateway',
    message: 'Webhook endpoint is active and ready to receive POST events from Twilio.',
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/whatsapp/twilio-webhook
 * Inbound Webhook Handler for Twilio WhatsApp Messages
 */
export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    const params = new URLSearchParams(rawText);
    const from = params.get('From') || '';
    const bodyText = params.get('Body') || '';
    const profileName = params.get('ProfileName') || 'Penghuni Kos';

    const cleanPhone = from.replace('whatsapp:', '').replace('+', '');

    console.log(`[Twilio Inbound Webhook] From: ${cleanPhone} (${profileName}) | Message: ${bodyText}`);

    // Standard auto-responder logic for KosanKu Pro
    let replyText = `Halo Kak *${profileName}*, pesan Anda telah diterima oleh Bot Operasional KosanKu Pro!\n\nPerintah cepat:\n• *BAYAR* -> Info tagihan sewa & QRIS\n• *LAPOR* -> Buat tiket perbaikan kamar\n• *GALON* -> Pesan galon/gas otomatis`;

    if (bodyText.toLowerCase().includes('bayar')) {
      replyText = `💳 *INFORMASI TAGIHAN SEWA KOSANKU PRO*\nHalo Kak *${profileName}*,\nTagihan sewa kamar Anda bulan ini adalah *Rp 1.500.000*.\n\n👉 *Bayar via Portal Web:* https://kosankupro.cloud`;
    } else if (bodyText.toLowerCase().includes('lapor')) {
      replyText = `🛠️ *FASILITAS & LATIHAN TIKET KELUHAN*\nTerima kasih Kak *${profileName}*. Laporan keluhan Anda telah dicatat dan diteruskan ke tim Maintenance Kosan.`;
    }

    // Log to Live WA Monitor Stream
    pushWaLiveLog({
      phone: cleanPhone,
      senderName: profileName,
      detectedRole: 'TENANT',
      inboundText: bodyText,
      replyText: replyText,
      actionTaken: 'TWILIO_AUTO_REPLY',
      property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
    });

    // Send response back via Twilio
    await sendTwilioWhatsApp(cleanPhone, replyText);

    // Twilio TwiML Response
    return new NextResponse('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error: any) {
    console.error('[Twilio Webhook Error]:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
