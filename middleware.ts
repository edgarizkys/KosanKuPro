import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Public routes — no auth needed
const PUBLIC_PATHS = [
  '/',
  '/api/auth/login',
  '/api/auth/register-owner',
  '/api/payments/webhook',   // Midtrans webhook must be open
  '/api/whatsapp/webhook',   // Fonnte webhook must be open
  '/api/rooms',              // Public room listing for landing page
  '/api/cron/send-reminders', // Vercel cron (protected by CRON_SECRET header)
];

// Role-based access map: path prefix → allowed roles
const ROLE_GUARDS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/api/master-data',         roles: ['superadmin', 'owner'] },
  { prefix: '/api/operational-reserves',roles: ['superadmin', 'owner', 'admin'] },
  { prefix: '/api/expenses',            roles: ['superadmin', 'owner', 'admin'] },
  { prefix: '/api/tenants',             roles: ['superadmin', 'owner', 'admin', 'employee'] },
  { prefix: '/api/invoices',            roles: ['superadmin', 'owner', 'admin', 'tenant'] },
  { prefix: '/api/complaints',          roles: ['superadmin', 'owner', 'admin', 'employee', 'tenant'] },
  { prefix: '/api/surveys',             roles: ['superadmin', 'owner', 'admin', 'employee'] },
  { prefix: '/api/bookings',            roles: ['superadmin', 'owner', 'admin', 'employee', 'tenant'] },
  { prefix: '/api/notifications',       roles: ['superadmin', 'owner', 'admin', 'employee', 'tenant'] },
  { prefix: '/api/activity',            roles: ['superadmin', 'owner', 'admin'] },
  { prefix: '/api/orders',              roles: ['superadmin', 'owner', 'admin', 'employee', 'vendor', 'tenant'] },
  { prefix: '/api/ai',                  roles: ['superadmin', 'owner', 'admin', 'employee', 'tenant'] },
  { prefix: '/api/properties',          roles: ['superadmin', 'owner', 'admin'] },
  { prefix: '/api/users',               roles: ['superadmin', 'owner', 'admin'] },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Allow all explicitly public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Skip middleware for non-API routes (all pages are client-rendered)
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // ── Extract and verify JWT ──────────────────────────────────────────────
  const cookieToken = req.cookies.get('kos_session')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: No session token. Silakan login kembali.' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized: Session expired atau tidak valid. Silakan login kembali.' },
      { status: 401 }
    );
  }

  // ── Role-based Access Control ───────────────────────────────────────────
  const userRole = payload.role?.toLowerCase();
  for (const guard of ROLE_GUARDS) {
    if (pathname.startsWith(guard.prefix)) {
      if (!guard.roles.includes(userRole)) {
        return NextResponse.json(
          { error: `Forbidden: Role '${userRole}' tidak memiliki akses ke resource ini.` },
          { status: 403 }
        );
      }
      break;
    }
  }

  // ── Inject user context into request headers ────────────────────────────
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-role', userRole);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-property-id', payload.propertyId || '');
  response.headers.set('X-Security-Auth', 'Enforced-JWT-RBAC');

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
