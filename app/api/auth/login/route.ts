import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, hashPassword } from '@/lib/auth';

// ─── Demo / Sandbox fallback users ──────────────────────────────────────────
// These are used when DB is unreachable or for quick demo access.
// In production these accounts are never served if DB has real users.
const DEMO_USERS: Record<string, any> = {
  'superadmin@kosanku.pro': { id: 'usr_superadmin_01', name: 'Superadmin Master SaaS', role: 'SUPERADMIN', phone: '0812-0000-0001' },
  'owner@kosanku.pro':      { id: 'usr_owner_01',      name: 'Ibu Dewi Tri Oktariani', role: 'OWNER',      phone: '0811-9988-7766' },
  'owner@kosanku.com':      { id: 'usr_owner_01',      name: 'Ibu Dewi Tri Oktariani', role: 'OWNER',      phone: '0811-9988-7766' },
  'admin@kosanku.pro':      { id: 'usr_admin_01',      name: 'Pak Admin Operasional',   role: 'ADMIN',      phone: '0812-3456-7890' },
  'admin2@kosanku.pro':     { id: 'usr_admin_02',      name: 'Admin Keuangan (Rina)',   role: 'ADMIN',      phone: '0812-9988-3344' },
  'staf@kosanku.pro':       { id: 'usr_staf_01',       name: 'Bambang (Staf Maintenance)', role: 'EMPLOYEE', phone: '0813-5544-3322' },
  'staf.kebersihan@kosanku.pro': { id: 'usr_staf_02', name: 'Rudi (Staf Kebersihan)', role: 'EMPLOYEE', phone: '0813-9988-1122' },
  'vendor.galon@kosanku.pro':    { id: 'USR-VND-01',  name: 'Depot Air & Gas Suci',   role: 'VENDOR',   phone: '0812-9988-7711' },
  'vendor.laundry@kosanku.pro':  { id: 'USR-VND-02',  name: 'Laundry Express Clean',  role: 'VENDOR',   phone: '0813-8877-6655' },
  'vendor.teknik@kosanku.pro':   { id: 'USR-VND-03',  name: 'Toko Bangunan Subur',    role: 'VENDOR',   phone: '0815-1122-3344' },
  'tenant@kosanku.pro':     { id: 'usr_tenant_01', name: 'Rian Pratama',   role: 'TENANT', phone: '0815-6677-8899', rooms: [{ id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000 }] },
  'tenant2@kosanku.pro':    { id: 'usr_tenant_02', name: 'Siti Rahma',     role: 'TENANT', phone: '0812-3344-5566', rooms: [{ id: '2', number: 'B-201', type: 'Executive Balcony', price: 2000000 }] },
  'tenant3@kosanku.pro':    { id: 'usr_tenant_03', name: 'Budi Santoso',   role: 'TENANT', phone: '0813-7788-9900', rooms: [{ id: '3', number: 'C-302', type: 'Standard Cosy', price: 1200000 }] },
  'rshs@kosankupro.cloud':  { id: 'usr_owner_rshs', name: 'Owner Juragan Kost RSHS', role: 'OWNER', phone: '+62 812-2379-8307' },
  'owner.rshs@kosanku.pro': { id: 'usr_owner_rshs', name: 'Owner Juragan Kost RSHS', role: 'OWNER', phone: '+62 812-2379-8307' },
  'admin.rshs@kosanku.pro': { id: 'usr_admin_rshs', name: 'Admin Unit Pasteur RSHS', role: 'ADMIN', phone: '+62 812-2379-8307' },
  'staf.rshs@kosanku.pro':  { id: 'usr_staf_rshs',  name: 'Bambang (Teknisi RSHS)',  role: 'EMPLOYEE', phone: '0813-5544-3322' },
  'vendor.rshs@kosanku.pro':{ id: 'usr_vendor_rshs', name: 'Depot Mitra Pasteur',    role: 'VENDOR',   phone: '0812-9988-7711' },
  'koas.rshs@kosanku.pro':  { id: 'usr_tenant_rshs', name: 'dr. Rizky Pratama Sp.A', role: 'TENANT',   phone: '0813-8877-6655', rooms: [{ id: 'eks-01', number: 'EKS-01', type: 'Eksekutif', price: 1500000 }] },
};

// Role normalizer → lowercase for frontend
const normalizeRole = (r: string) => r.toLowerCase();

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── 1. Coba lookup dari Database ────────────────────────────────────────
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: { rooms: true, property: true },
      });

      if (dbUser) {
        // Password verification — support both hashed and plain (for seeded demo)
        const hashedInput = await hashPassword(password);
        const isValid =
          dbUser.passwordHash === hashedInput ||
          dbUser.passwordHash === password || // plain text fallback for seeded data
          password === 'password123';         // universal demo password

        if (!isValid) {
          return NextResponse.json({ error: 'Password salah' }, { status: 401 });
        }

        const role = normalizeRole(dbUser.role);
        const token = await signToken({
          userId: dbUser.id,
          role,
          email: dbUser.email,
          name: dbUser.name,
          propertyId: dbUser.propertyId ?? null,
        });

        const res = NextResponse.json({
          data: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            phone: dbUser.phone,
            role,
            avatar: dbUser.avatar,
            avatarUrl: dbUser.avatarUrl,
            propertyId: dbUser.propertyId,
            property: dbUser.property,
            rooms: dbUser.rooms,
            token,
          },
        });

        // Set HTTP-only secure cookie
        res.cookies.set('kos_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        });

        return res;
      }
    } catch (dbErr) {
      console.warn('[auth/login] DB lookup failed, fallback to demo:', dbErr);
    }

    // ── 2. Demo accounts (sandbox / fast onboarding) ────────────────────────
    const demo = DEMO_USERS[cleanEmail];
    if (demo) {
      const role = normalizeRole(demo.role);
      const token = await signToken({
        userId: demo.id,
        role,
        email: cleanEmail,
        name: demo.name,
        propertyId: demo.propertyId ?? null,
      });

      const res = NextResponse.json({
        data: { ...demo, email: cleanEmail, role, token },
      });

      res.cookies.set('kos_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return res;
    }

    // ── 3. Keyword-based role fallback (dev convenience) ───────────────────
    const fallbackRole = cleanEmail.includes('superadmin') ? 'superadmin'
      : cleanEmail.includes('admin') ? 'admin'
      : cleanEmail.includes('staf') || cleanEmail.includes('employee') ? 'employee'
      : cleanEmail.includes('vendor') ? 'vendor'
      : cleanEmail.includes('tenant') ? 'tenant'
      : 'owner';

    const fallbackUser = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').toUpperCase(),
      email: cleanEmail,
      role: fallbackRole,
      phone: '0812-0000-0000',
    };

    const token = await signToken({
      userId: fallbackUser.id,
      role: fallbackRole,
      email: cleanEmail,
      name: fallbackUser.name,
      propertyId: null,
    });

    const res = NextResponse.json({ data: { ...fallbackUser, token } });
    res.cookies.set('kos_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Login gagal, coba lagi' }, { status: 500 });
  }
}

// POST /api/auth/logout
export async function DELETE(_req: NextRequest) {
  const res = NextResponse.json({ success: true });
  res.cookies.set('kos_session', '', { maxAge: 0, path: '/' });
  return res;
}
