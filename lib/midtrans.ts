import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';

const MIDTRANS_BASE_URL = isProduction
  ? 'https://app.midtrans.com'
  : 'https://app.sandbox.midtrans.com';

function getAuthHeader() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;
}

export async function createSnapTransaction(params: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  itemName: string;
}) {
  const { orderId, amount, customerName, customerEmail, customerPhone, itemName } = params;

  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(amount),
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: customerPhone,
    },
    item_details: [
      {
        id: orderId,
        price: Math.round(amount),
        quantity: 1,
        name: itemName,
      },
    ],
    credit_card: { secure: true },
  };

  const response = await fetch(`${MIDTRANS_BASE_URL}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error_messages?.join(', ') || 'Midtrans Snap creation failed');
  }

  return {
    token: data.token as string,
    redirectUrl: data.redirect_url as string,
  };
}

export function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const expected = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return signatureKey === expected;
}

export function mapTransactionStatus(transactionStatus: string): string {
  switch (transactionStatus) {
    case 'capture':
    case 'settlement':
      return 'SETTLED';
    case 'pending':
      return 'PENDING';
    case 'deny':
    case 'cancel':
    case 'expire':
      return 'EXPIRED';
    default:
      return 'FAILED';
  }
}
