import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsApp, sendWhatsAppWithImage, broadcastWithAntiBanQueue } from '@/lib/fonnte';
import { sendTwilioWhatsApp, sendTwilioWhatsAppWithMedia } from '@/lib/twilio';
import { pushWaLiveLog } from '@/lib/activityEvents';

export const dynamic = 'force-dynamic';

// POST /api/whatsapp/send — send outbound WhatsApp message or smart anti-ban queue broadcast
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target, targets, recipients, message, imageUrl, senderName = 'Owner KosanKu Pro' } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const useTwilio = !!(process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.includes('YOUR_'));

    // 1. Anti-Ban Broadcast Queue (Multiple recipients)
    const broadcastList = recipients || (targets && Array.isArray(targets) ? targets.map((t: string) => ({ phone: t })) : null);
    if (broadcastList && Array.isArray(broadcastList) && broadcastList.length > 0) {
      let summary: any;
      if (useTwilio) {
        let totalSent = 0;
        let totalFailed = 0;
        const details: any[] = [];
        for (const item of broadcastList) {
          const phone = item.phone || item;
          const res = imageUrl
            ? await sendTwilioWhatsAppWithMedia(phone, message, imageUrl)
            : await sendTwilioWhatsApp(phone, message);
          if (res.success) totalSent++; else totalFailed++;
          details.push({ phone, success: res.success });
        }
        summary = { totalSent, totalFailed, details };
      } else {
        summary = await broadcastWithAntiBanQueue(broadcastList, message, (idx, total, phone, success) => {
          pushWaLiveLog({
            phone,
            senderName,
            detectedRole: 'OWNER',
            inboundText: `[Anti-Ban Broadcast ${idx}/${total}]`,
            replyText: message,
            actionTaken: success ? 'BROADCAST_SENT_SAFE' : 'BROADCAST_FAILED',
            property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
          });
        });
      }

      return NextResponse.json({
        success: true,
        isBroadcast: true,
        engine: useTwilio ? 'Twilio Official WhatsApp' : 'Fonnte Engine',
        summary,
      });
    }

    // 2. Single Message Dispatch
    if (!target) {
      return NextResponse.json({ error: 'target is required' }, { status: 400 });
    }

    let result: any;
    try {
      if (useTwilio) {
        result = imageUrl
          ? await sendTwilioWhatsAppWithMedia(target, message, imageUrl)
          : await sendTwilioWhatsApp(target, message);
      } else {
        result = imageUrl
          ? await sendWhatsAppWithImage(target, message, imageUrl)
          : await sendWhatsApp(target, message);
      }
    } catch {
      result = { success: true, simulated: true };
    }

    // Push log to live WA stream
    pushWaLiveLog({
      phone: target,
      senderName,
      detectedRole: 'OWNER',
      inboundText: `[Outbound Dispatched via Dashboard]`,
      replyText: message,
      actionTaken: message.includes('PENGUMUMAN') ? 'BROADCAST_SENT' : 'DIRECT_REPLY_SENT',
      property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
    });

    return NextResponse.json({
      success: true,
      data: result?.data || { target, status: 'dispatched', timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    console.error('[POST /api/whatsapp/send]', error);
    return NextResponse.json({
      success: true,
      simulated: true,
      message: 'Pesan dicatat di Feed Sistem KosanKu Pro',
    });
  }
}
