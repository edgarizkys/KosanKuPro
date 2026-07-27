import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp, sendWhatsAppWithImage } from '@/lib/fonnte';

// POST /api/whatsapp/send — send outbound WhatsApp message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, message, imageUrl } = body;

    if (!target || !message) {
      return NextResponse.json({ error: 'target and message are required' }, { status: 400 });
    }

    const result = imageUrl
      ? await sendWhatsAppWithImage(target, message, imageUrl)
      : await sendWhatsApp(target, message);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('[POST /api/whatsapp/send]', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
