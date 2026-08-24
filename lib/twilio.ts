import twilio from 'twilio';

/**
 * Twilio WhatsApp Integration Helper for KosanKu Pro
 */

export function cleanIndonesianPhone(target: string): string {
  let cleaned = target.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Send WhatsApp text message via Twilio REST API
 */
export async function sendTwilioWhatsApp(
  targetPhone: string,
  messageText: string
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // Default to Sandbox US number if custom is not defined
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!accountSid || !authToken || accountSid.includes('YOUR_')) {
    console.log(`[Twilio Simulation] To: ${targetPhone}\n${messageText}\n---`);
    return {
      success: true,
      simulated: true,
      data: { target: targetPhone, status: 'simulated_success', timestamp: new Date().toISOString() },
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const cleanPhone = cleanIndonesianPhone(targetPhone);
    const formattedTo = `whatsapp:+${cleanPhone}`;
    const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    const res = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: messageText,
    });

    console.log(`[Twilio WhatsApp Success] SID: ${res.sid} | To: ${formattedTo}`);
    return { success: true, sid: res.sid, status: res.status };
  } catch (error: any) {
    console.error('[Twilio WhatsApp Error]:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message with Media Attachment (Image/PDF) via Twilio
 */
export async function sendTwilioWhatsAppWithMedia(
  targetPhone: string,
  messageText: string,
  mediaUrl: string
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!accountSid || !authToken || accountSid.includes('YOUR_')) {
    console.log(`[Twilio Media Simulation] To: ${targetPhone} | Media: ${mediaUrl}\n${messageText}\n---`);
    return { success: true, simulated: true };
  }

  try {
    const client = twilio(accountSid, authToken);
    const cleanPhone = cleanIndonesianPhone(targetPhone);
    const formattedTo = `whatsapp:+${cleanPhone}`;
    const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

    const res = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: messageText,
      mediaUrl: [mediaUrl],
    });

    console.log(`[Twilio WhatsApp Media Success] SID: ${res.sid} | To: ${formattedTo}`);
    return { success: true, sid: res.sid, status: res.status };
  } catch (error: any) {
    console.error('[Twilio WhatsApp Media Error]:', error.message);
    return { success: false, error: error.message };
  }
}
