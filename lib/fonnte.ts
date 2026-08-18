const FONNTE_API_URL = 'https://api.fonnte.com';

function formatIDR(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Send text message via Fonnte WhatsApp API (Supports per-property custom device token)
 */
export async function sendWhatsApp(target: string, message: string, customToken?: string) {
  const token = customToken || process.env.FONNTE_WHATSAPP_TOKEN;
  const cleanTarget = target.replace(/[^0-9]/g, '');

  if (!token || token === 'YOUR_FONNTE_TOKEN' || token.includes('TOKEN')) {
    console.log(`[Fonnte WhatsApp Simulation] To: ${cleanTarget}\n${message}\n---`);
    return {
      success: true,
      simulated: true,
      data: { target: cleanTarget, status: 'simulated_success', timestamp: new Date().toISOString() },
    };
  }

  try {
    const response = await fetch(`${FONNTE_API_URL}/send`, {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({ target: cleanTarget, message }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error: any) {
    console.error('[Fonnte] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send WhatsApp message with Image attachment (Supports per-property custom device token)
 */
export async function sendWhatsAppWithImage(
  target: string,
  message: string,
  imageUrl: string,
  customToken?: string
) {
  const token = customToken || process.env.FONNTE_WHATSAPP_TOKEN;
  const cleanTarget = target.replace(/[^0-9]/g, '');

  if (!token || token === 'YOUR_FONNTE_TOKEN' || token.includes('TOKEN')) {
    console.log(`[Fonnte WhatsApp with Image Simulation] To: ${cleanTarget} | Image: ${imageUrl}\n${message}\n---`);
    return { success: true, simulated: true };
  }

  try {
    const formData = new FormData();
    formData.append('target', cleanTarget);
    formData.append('message', message);
    formData.append('url', imageUrl);

    const response = await fetch(`${FONNTE_API_URL}/send`, {
      method: 'POST',
      headers: { Authorization: token },
      body: formData,
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── Notification Template Formats ───────────────────────────────────────────

/**
 * 1. Booking Confirmation & Smart Lock Access
 */
export function formatBookingConfirmation(data: {
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  dpAmount: number;
  pinCode?: string;
}) {
  return `🎉 *Konfirmasi Booking KosanKu Pro* 🎉\n\nHalo Kak *${data.tenantName}*,\nReservasi kamar Anda di *${data.propertyName}* telah berhasil dikonfirmasi!\n\n📋 *Rincian Booking:*\n• Unit: *Kamar ${data.roomNumber}* (${data.roomType})\n• Check-in: *${data.checkInDate}*\n• DP Masuk: *${formatIDR(data.dpAmount)}*\n\n🔑 *Akses Smart Lock Pintu:*\nPIN Sementara: *${data.pinCode || '8821'}#*\n(PIN ini aktif otomatis pada tanggal check-in Anda).\n\nAda pertanyaan? Balas pesan ini untuk terhubung langsung dengan resepsionis KosanKu Pro.`;
}

/**
 * 2. Survey Appointment Confirmation
 */
export function formatSurveyConfirmation(data: {
  prospectName: string;
  propertyName: string;
  scheduledDate: string;
  surveyType: 'ONSITE' | 'VIDEO_CALL';
  roomNumber?: string;
}) {
  const typeText = data.surveyType === 'VIDEO_CALL' ? 'Video Tour Online (WhatsApp)' : 'Kunjungan Langsung (On-Site)';
  return `🗓️ *Jadwal Survei KosanKu Pro* 🗓️\n\nHalo Kak *${data.prospectName}*,\nJanji temu survei Anda telah kami jadwalkan!\n\n📍 *Properti:* ${data.propertyName}\n🚪 *Unit:* ${data.roomNumber ? `Kamar ${data.roomNumber}` : 'Pilihan Kamar'}\n⏰ *Waktu:* ${data.scheduledDate}\n🔍 *Tipe:* ${typeText}\n\nTim operasional kami akan menyambut Anda di lokasi atau menghubungi nomor ini saat waktu survei tiba. Terima kasih!`;
}

/**
 * 3. Payment Receipt / Settlement
 */
export function formatPaymentReceipt(data: {
  tenantName: string;
  invoiceNumber: string;
  roomNumber: string;
  amount: number;
  paidAt: string;
}) {
  return `✅ *Kuitansi Pembayaran Lunas* ✅\n\nHalo *${data.tenantName}*,\nPembayaran tagihan sewa kamar *${data.roomNumber}* sebesar *${formatIDR(data.amount)}* untuk invoice *#${data.invoiceNumber}* telah berhasil diverifikasi pada *${data.paidAt}*.\n\nStatus: *LUNAS (SETTLED)*\nTerima kasih atas pembayaran tepat waktu Anda di KosanKu Pro! 🏠`;
}

/**
 * 4. Billing Reminder Templates (H-3, H-1, H-0, OVERDUE)
 */
export function formatBillingReminder(
  tenantName: string,
  roomNumber: string,
  amount: number,
  dueDate: string,
  type: 'H-3' | 'H-1' | 'H-0' | 'OVERDUE',
  paymentLink?: string
): string {
  const formattedAmount = formatIDR(amount);

  const templates: Record<string, string> = {
    'H-3': `Halo Kak ${tenantName} 👋\n\nPengingat ramah: tagihan kos kamar ${roomNumber} sebesar *${formattedAmount}* akan jatuh tempo pada *${dueDate}*.\n\nBayar praktis 1-klik QRIS/Transfer:\n${paymentLink ? `👉 ${paymentLink}` : 'Buka tab Invoices di Dashboard KosanKu Pro Anda.'}`,
    'H-1': `⚠️ *[Penting] H-1 Jatuh Tempo Sewa Kos*\n\nHalo Kak ${tenantName},\nTagihan kos kamar ${roomNumber} sebesar *${formattedAmount}* jatuh tempo *besok* (${dueDate}).\n\nSegera lakukan pembayaran agar terhindar dari denda keterlambatan:\n${paymentLink ? `👉 ${paymentLink}` : 'Buka Dashboard KosanKu Pro.'}`,
    'H-0': `🚨 *[Hari Ini Jatuh Tempo]* 🚨\n\nHalo Kak ${tenantName}, hari ini adalah batas akhir pembayaran sewa kamar ${roomNumber} sebesar *${formattedAmount}*.\n\n${paymentLink ? `Bayar sekarang via link: ${paymentLink}` : 'Silakan lakukan pembayaran hari ini via QRIS/VA.'}`,
    OVERDUE: `⚠️ *[Peringatan Keterlambatan Sewa]* ⚠️\n\nHalo Kak ${tenantName},\nTagihan kos kamar ${roomNumber} sebesar *${formattedAmount}* telah melewati jatuh tempo.\n\nMohon segera melakukan pelunasan untuk menghindari pemblokiran akses Smart Lock otomatis.\n${paymentLink ? `Bayar langsung: ${paymentLink}` : ''}`,
  };

  return templates[type] || templates['H-3'];
}
