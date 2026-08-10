import { NextRequest, NextResponse } from 'next/server';

// Server-Side RBAC Middleware for KosanKu Pro Edge Authorization
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets, next internal routes, and public landing resources
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/' ||
    pathname === '/api/payments/webhook' ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  // Extract Role Header or Cookie for Authorization Audit
  const roleHeader = req.headers.get('x-user-role')?.toLowerCase() || 'guest';
  const isSuperAdmin = roleHeader === 'superadmin';
  const isOwner = roleHeader === 'owner' || isSuperAdmin;
  const isEmployee = roleHeader === 'employee' || isOwner;

  // 1. Restricted SuperAdmin & Owner Master Config Endpoints
  if (pathname.startsWith('/api/master-data') || pathname.startsWith('/api/expenses') || pathname.startsWith('/api/approval')) {
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized: Owner or SuperAdmin access required' },
        { status: 403 }
      );
    }
  }

  // 2. Restricted Staff & Employee Field Audit Endpoints
  if (pathname.startsWith('/api/inventory/audit')) {
    if (!isEmployee) {
      return NextResponse.json(
        { error: 'Unauthorized: Employee or Owner access required for Stock Opname Audit' },
        { status: 403 }
      );
    }
  }

  // Pass authorization check cleanly
  const response = NextResponse.next();
  response.headers.set('X-Security-Auth', 'Enforced-Edge-RBAC');
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
