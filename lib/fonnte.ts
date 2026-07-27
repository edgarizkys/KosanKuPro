const FONNTE_API_URL = 'https://api.fonnte.com';

export async function sendWhatsApp(target: string, message: string) {
  const token = process.env.FONNTE_WHATSAPP_TOKEN;
  if (!token) {
    console.warn('[Fonnte] No token configured, skipping WA send');
    return { success: false, error: 'FONNTE_WHATSAPP_TOKEN not set' };
  }

  try {
    const response = await fetch(`${FONNTE_API_URL}/send`, {
      method: 'POST',
      headers: { Authorization: token },
      body: new URLSearchParams({ target, message }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error: any) {
    console.error('[Fonnte] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendWhatsAppWithImage(
  target: string,
  message: string,
  imageUrl: string
) {
  const token = process.env.FONNTE_WHATSAPP_TOKEN;
  if (!token) {
    return { success: false, error: 'FONNTE_WHATSAPP_TOKEN not set' };
  }

  try {
    const formData = new FormData();
    formData.append('target', target);
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

export function formatBillingReminder(
  tenantName: string,
  roomNumber: string,
  amount: number,
  dueDate: string,
  type: 'H-3' | 'H-1' | 'H-0' | 'OVERDUE',
  paymentLink?: string
): string {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

  const templates: Record<string, string> = {
    'H-3': `Halo ${tenantName} 👋\n\nPengingat ramah: tagihan kos kamar ${roomNumber} sebesar *${formattedAmount}* akan jatuh tempo pada *${dueDate}*.\n\nBayar mudah via KosanKu Pro!\n${paymentLink ? `Link pembayaran: ${paymentLink}` : ''}`,
    'H-1': `[Penting] Halo ${tenantName},\n\nTagihan kos kamar ${roomNumber} sebesar *${formattedAmount}* jatuh tempo *besok* (${dueDate}).\n\nSegera lakukan pembayaran agar tidak terkena denda.\n${paymentLink ? `Link pembayaran: ${paymentLink}` : ''}`,
    'H-0': `[Hari Ini Jatuh Tempo] ⚠️\n\nHalo ${tenantName}, hari ini adalah tanggal jatuh tempo pembayaran kos kamar ${roomNumber} sebesar *${formattedAmount}*.\n\n${paymentLink ? `Bayar sekarang: ${paymentLink}` : 'Hubungi pengelola untuk info pembayaran.'}`,
    OVERDUE: `[Peringatan Tunggakan] 🚨\n\nHalo ${tenantName}, tagihan kos kamar ${roomNumber} sebesar *${formattedAmount}* telah melewati jatuh tempo.\n\nHarap segera melunasi tagihan Anda untuk menghindari denda keterlambatan.\n${paymentLink ? `Bayar sekarang: ${paymentLink}` : ''}`,
  };

  return templates[type] || templates['H-3'];
}
