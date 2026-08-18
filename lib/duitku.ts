import crypto from 'crypto';

const DUITKU_SANDBOX_URL = 'https://sandbox.duitku.com/webapi/api/merchant/v2/inquiry';
const DUITKU_PASSPORT_URL = 'https://passport.duitku.com/webapi/api/merchant/v2/inquiry';

export interface DuitkuPaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemDetails: { name: string; price: number; quantity: number }[];
  returnUrl?: string;
  callbackUrl?: string;
}

/**
 * Generate MD5 Signature for Duitku Request:
 * MD5(merchantCode + orderId + amount + apiKey)
 */
export function generateDuitkuSignature(
  merchantCode: string,
  orderId: string,
  amount: number,
  apiKey: string
): string {
  const payload = `${merchantCode}${orderId}${amount}${apiKey}`;
  return crypto.createHash('md5').update(payload).digest('hex');
}

/**
 * Request payment URL / QRIS from Duitku API
 */
export async function createDuitkuTransaction(params: DuitkuPaymentRequest) {
  const merchantCode = process.env.DUITKU_MERCHANT_CODE || 'D12345_DEMO';
  const apiKey = process.env.DUITKU_API_KEY || 'duitku_demo_api_key_2026';
  const isProduction = process.env.DUITKU_ENV === 'production';
  const apiUrl = isProduction ? DUITKU_PASSPORT_URL : DUITKU_SANDBOX_URL;

  // Fallback simulator if keys are still demo
  if (!process.env.DUITKU_API_KEY || process.env.DUITKU_API_KEY.includes('DEMO') || process.env.DUITKU_API_KEY.includes('demo')) {
    console.log(`[Duitku Payment Simulation] Order: ${params.orderId} | Total: Rp ${params.amount.toLocaleString('id-ID')}`);
    return {
      success: true,
      simulated: true,
      paymentUrl: `https://sandbox.duitku.com/simulator?orderId=${params.orderId}&amount=${params.amount}`,
      orderId: params.orderId,
      amount: params.amount,
      statusCode: '00',
      statusMessage: 'SUCCESS_SIMULATION',
    };
  }

  const signature = generateDuitkuSignature(merchantCode, params.orderId, params.amount, apiKey);

  const payload = {
    merchantCode,
    paymentAmount: params.amount,
    merchantOrderId: params.orderId,
    productDetails: params.itemDetails.map((i) => i.name).join(', '),
    email: params.customerEmail,
    phoneNumber: params.customerPhone,
    customerVaName: params.customerName,
    callbackUrl: params.callbackUrl || 'https://kosankupro.cloud/api/payments/duitku/webhook',
    returnUrl: params.returnUrl || 'https://kosankupro.cloud/portal',
    signature,
    expiryPeriod: 1440, // 24 hours in minutes
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return {
      success: data.statusCode === '00',
      paymentUrl: data.paymentUrl,
      reference: data.reference,
      data,
    };
  } catch (error: any) {
    console.error('[Duitku createDuitkuTransaction error]', error);
    return { success: false, error: error.message };
  }
}
