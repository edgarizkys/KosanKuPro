const JWT_SECRET_STRING = process.env.JWT_SECRET || 'kosaanku-pro-super-secret-key-2026-change-in-production';
const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface JWTPayload {
  userId: string;
  role: string;
  email: string;
  name: string;
  propertyId?: string | null;
  iat?: number;
  exp?: number;
}

// Helper: Base64URL encode
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Helper: Base64URL decode
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

// Helper: Get CryptoKey for HMAC-SHA256
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(JWT_SECRET_STRING),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Pure Web Crypto JWT Signer (Zero external dependencies)
 */
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  const signatureBase64Url = Buffer.from(signatureBuffer)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${dataToSign}.${signatureBase64Url}`;
}

/**
 * Pure Web Crypto JWT Verifier (Zero external dependencies)
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;

    // Reconstruct binary signature
    let sigBase64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    while (sigBase64.length % 4) {
      sigBase64 += '=';
    }
    const signatureBytes = new Uint8Array(Buffer.from(sigBase64, 'base64'));

    const key = await getCryptoKey();
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: JWTPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract JWT token from request cookies or Authorization header.
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)kos_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Hash a password using Web Crypto API (SHA-256).
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'kosanku-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare plain password against stored hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hash;
}
