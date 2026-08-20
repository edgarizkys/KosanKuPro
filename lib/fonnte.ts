const FONNTE_API_URL = 'https://api.fonnte.com';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Anti-Ban Helper 1: Process Spintax (e.g. "{Halo|Hai|Selamat datang}")
 */
export function parseSpintax(text: string): string {
  const spintaxRegex = /\{([^{}]+)\}/g;
  let matches;
  let result = text;
  while ((matches = spintaxRegex.exec(result)) !== null) {
    const choices = matches[1].split('|');
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    result = result.replace(matches[0], randomChoice);
    spintaxRegex.lastIndex = 0;
  }
  return result;
}

/**
 * Anti-Ban Helper 2: Inject Invisible Zero-Width Unique Hash Token
 * This ensures that every outgoing message has a 100% unique cryptographic SHA-256 hash,
 * preventing Meta's anti-spam filter from flagging identical mass duplicate messages.
 */
export function applyAntiBanVariation(message: string): string {
  const parsed = parseSpintax(message);
  // Zero-width characters (Invisible to humans, unique to Meta algorithms)
  const zwChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
  let randomZw = '';
  for (let i = 0; i < 4; i++) {
    randomZw += zwChars[Math.floor(Math.random() * zwChars.length)];
  }
  return `${parsed}${randomZw}`;
}

/**
 * Anti-Ban Helper 3: Clean Indonesian Phone Number
 * Converts '0812...' or '+62812...' to '62812...'
 */
export function cleanIndonesianPhone(target: string): string {
  let cleaned = target.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Send text, interactive button, or interactive list menu via Fonnte WhatsApp API with Anti-Ban Protection
 */
export async function sendWhatsApp(
  target: string,
  message: string,
  customToken?: string,
  buttons?: Array<{ id: string; text: string }> | string,
  footer?: string,
  list?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }> | string,
  buttonTitle?: string
) {
  const token = customToken || process.env.FONNTE_WHATSAPP_TOKEN;
  const cleanTarget = cleanIndonesianPhone(target);

  if (!token || token === 'YOUR_FONNTE_TOKEN' || token.includes('TOKEN')) {
    console.log(`[Fonnte WhatsApp Simulation] To: ${cleanTarget}\n${message}\n---`);
    return {
      success: true,
      simulated: true,
      data: { target: cleanTarget, status: 'simulated_success', timestamp: new Date().toISOString() },
    };
  }

  try {
    // 1. Apply Dynamic Spintax & Invisible Unique Hash
    const safeMessage = applyAntiBanVariation(message);

    // 2. Randomized Human Delay (2-4 seconds) & Native Typing Presence Indicator
    const randomDelaySeconds = Math.floor(Math.random() * 3) + 2; // 2 to 4 seconds

    const payload: Record<string, string> = {
      target: cleanTarget,
      message: safeMessage,
      typing: 'true', // Native Fonnte "Sedang Mengetik..." presence
      delay: randomDelaySeconds.toString(), // Random delay
      countryCode: '62',
    };

    if (list) {
      payload.list = typeof list === 'string' ? list : JSON.stringify(list);
      payload.button = buttonTitle || '📋 Pilihan Menu Layanan';
    } else if (buttons) {
      if (typeof buttons === 'string') {
        payload.button = buttons;
      } else {
        payload.button = buttons.map((b) => `${b.id}|${b.text}`).join(',');
      }
    }

    if (footer) {
      payload.footer = footer;
    }

    const response = await fetch(`${FONNTE_API_URL}/send`, {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams(payload),
      signal: AbortSignal.timeout(6000),
    });

    const data = await response.json().catch(() => ({}));
    return { success: response.ok, data };
  } catch (error: any) {
    console.error('[Fonnte] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message with Image attachment
 */
export async function sendWhatsAppWithImage(
  target: string,
  message: string,
  imageUrl: string,
  customToken?: string
) {
  const token = customToken || process.env.FONNTE_WHATSAPP_TOKEN;
  const cleanTarget = cleanIndonesianPhone(target);

  if (!token || token === 'YOUR_FONNTE_TOKEN' || token.includes('TOKEN')) {
    console.log(`[Fonnte WhatsApp with Image Simulation] To: ${cleanTarget} | Image: ${imageUrl}\n${message}\n---`);
    return { success: true, simulated: true };
  }

  try {
    const safeMessage = applyAntiBanVariation(message);
    const formData = new FormData();
    formData.append('target', cleanTarget);
    formData.append('message', safeMessage);
    formData.append('url', imageUrl);
    formData.append('typing', 'true');
    formData.append('delay', '3');
    formData.append('countryCode', '62');

    const response = await fetch(`${FONNTE_API_URL}/send`, {
      method: 'POST',
      headers: { Authorization: token },
      body: formData,
      signal: AbortSignal.timeout(8000),
    });

    const data = await response.json().catch(() => ({}));
    return { success: response.ok, data };
  } catch (error: any) {
    console.error('[Fonnte Image] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Anti-Ban Smart Queue Broadcaster
 * Sends messages sequentially with humanized jitter delay (3.5s - 7.5s) and cooldown pause.
 */
export async function broadcastWithAntiBanQueue(
  recipients: Array<{ phone: string; name?: string; room?: string }>,
  templateMessage: string,
  onProgress?: (index: number, total: number, phone: string, success: boolean) => void
) {
  const total = recipients.length;
  const results: Array<{ phone: string; success: boolean; data?: any }> = [];

  for (let i = 0; i < total; i++) {
    const recipient = recipients[i];
    const cleanPhone = cleanIndonesianPhone(recipient.phone);

    // Personalize message dynamically per recipient
    let personalized = templateMessage
      .replace(/\{nama\}/gi, recipient.name || 'Penghuni')
      .replace(/\{kamar\}/gi, recipient.room || 'Kamar Kos')
      .replace(/\[Nama Penghuni\]/gi, recipient.name || 'Penghuni');

    const res = await sendWhatsApp(cleanPhone, personalized);
    results.push({ phone: cleanPhone, success: res.success, data: res.data });

    if (onProgress) {
      onProgress(i + 1, total, cleanPhone, res.success);
    }

    // Apply Smart Jitter Delay (3500ms - 7500ms) between recipients
    if (i < total - 1) {
      const jitterMs = Math.floor(Math.random() * 4000) + 3500;
      await new Promise((resolve) => setTimeout(resolve, jitterMs));

      // After every 5 messages, take a 12-second cooldown breather
      if ((i + 1) % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
    }
  }

  return {
    totalSent: results.filter((r) => r.success).length,
    totalFailed: results.filter((r) => !r.success).length,
    details: results,
  };
}

/**
 * Message Templates with Anti-Ban Variation (Supports flexible arguments)
 */
export function formatBillingReminder(
  arg1: any,
  roomNumber?: string,
  amount?: number,
  dueDate?: string,
  paymentUrl?: string
) {
  const p = typeof arg1 === 'object' && arg1 !== null ? arg1 : { tenantName: arg1, roomNumber, amount, dueDate, paymentUrl };
  return applyAntiBanVariation(
    `📢 *PENGINGAT TAGIHAN SEWA KOSANKU PRO*\n\nHalo Kak *${p.tenantName || 'Penghuni'}* (Kamar ${p.roomNumber || 'Kosan'}),\n\nTagihan sewa kamar Anda sebesar *${formatIDR(p.amount || 0)}* akan jatuh tempo pada *${p.dueDate || 'segera'}*.\n\n👉 *Bayar Praktis via QRIS / Virtual Account:*\n${p.paymentUrl || 'https://kosankupro.cloud'}\n\n_Terima kasih telah menjadi bagian dari keluarga KosanKu Pro._`
  );
}

export function formatBookingConfirmation(
  arg1: any,
  roomType?: string,
  checkInDate?: string,
  propertyName?: string,
  receiptUrl?: string
) {
  const p = typeof arg1 === 'object' && arg1 !== null ? arg1 : { guestName: arg1, roomType, checkInDate, propertyName, receiptUrl };
  const guest = p.guestName || p.tenantName || 'Tamu';
  return applyAntiBanVariation(
    `🎉 *KONFIRMASI RESERVASI BERHASIL*\n\nHalo Kak *${guest}*,\n\nPemesanan kamar *${p.roomType || 'Kosan'}* di *${p.propertyName || 'KosanKu Pro'}* telah berhasil dikonfirmasi.\n• Tanggal Check-in: *${p.checkInDate || 'Hari ini'}*\n\n👉 *Lihat Kunci Digital & Smart Lock:* \n${p.receiptUrl || p.portalUrl || 'https://kosankupro.cloud'}`
  );
}

export function formatPaymentReceipt(
  arg1: any,
  invoiceNumber?: string,
  amount?: number,
  paymentMethod?: string,
  paidAt?: string
) {
  const p = typeof arg1 === 'object' && arg1 !== null ? arg1 : { tenantName: arg1, invoiceNumber, amount, paymentMethod, paidAt };
  return applyAntiBanVariation(
    `✅ *KWITANSI PEMBAYARAN RESMI*\n\nTerima kasih Kak *${p.tenantName || 'Penghuni'}*${p.roomNumber ? ` (Kamar ${p.roomNumber})` : ''},\nPembayaran invoice *#${p.invoiceNumber || ''}* sebesar *${formatIDR(p.amount || 0)}* telah kami terima via *${p.paymentMethod || 'QRIS / VA'}* pada ${p.paidAt || 'hari ini'}.\n\nStatus: *LUNAS (SETTLED)*.`
  );
}
