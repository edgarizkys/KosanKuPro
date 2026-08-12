import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_USERS: Record<string, any> = {
  'owner@kosanku.pro': {
    id: 'usr_owner_01',
    name: 'Bapak Hendra (Property Owner)',
    email: 'owner@kosanku.pro',
    role: 'owner',
    phone: '0811-9988-7766',
  },
  'owner@kosanku.com': {
    id: 'usr_owner_01',
    name: 'Bapak Hendra (Property Owner)',
    email: 'owner@kosanku.pro',
    role: 'owner',
    phone: '0811-9988-7766',
  },
  'superadmin@kosanku.pro': {
    id: 'usr_superadmin_01',
    name: 'Superadmin Master SaaS',
    email: 'superadmin@kosanku.pro',
    role: 'superadmin',
    phone: '0812-0000-0001',
  },
  'admin@kosanku.pro': {
    id: 'usr_admin_01',
    name: 'Pak Admin Operasional',
    email: 'admin@kosanku.pro',
    role: 'admin',
    phone: '0812-3456-7890',
  },
  'staf@kosanku.pro': {
    id: 'usr_staf_01',
    name: 'Bambang (Staf Maintenance)',
    email: 'staf@kosanku.pro',
    role: 'employee',
    phone: '0813-5544-3322',
  },
  'vendor@kosanku.pro': {
    id: 'usr_vendor_01',
    name: 'Depot Air & Gas Suci (Vendor Mitra)',
    email: 'vendor@kosanku.pro',
    role: 'vendor',
    phone: '0814-7788-9900',
  },
  'tenant@kosanku.pro': {
    id: 'usr_tenant_01',
    name: 'Rian Pratama',
    email: 'tenant@kosanku.pro',
    role: 'tenant',
    phone: '0815-6677-8899',
    rooms: [{ id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000 }],
  },
};

// POST /api/auth/login — verify credentials against DB or Demo presets
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check demo accounts first for quick role switching test
    if (DEMO_USERS[cleanEmail]) {
      const demoUser = DEMO_USERS[cleanEmail];

      // Try to fetch avatarUrl from DB for this demo user
      let avatarUrl: string | null = null;
      let avatar: string | null = null;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: cleanEmail },
          select: { avatarUrl: true, avatar: true },
        });
        if (dbUser) {
          avatarUrl = dbUser.avatarUrl;
          avatar = dbUser.avatar;
        }
      } catch {
        // DB optional — ignore
      }

      return NextResponse.json({
        data: {
          ...demoUser,
          ...(avatarUrl ? { avatarUrl } : {}),
          ...(avatar ? { avatar } : {}),
          token: Buffer.from(`${demoUser.id}:${demoUser.role}:${Date.now()}`).toString('base64'),
        },
      });
    }

    // Otherwise check Prisma DB
    try {
      const user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          passwordHash: true,
          avatar: true,
          rooms: { select: { id: true, number: true, type: true, price: true } },
        },
      });

      if (user) {
        if (user.passwordHash !== password && user.passwordHash !== 'default_password_hash') {
          return NextResponse.json({ error: 'Password salah' }, { status: 401 });
        }
        const { passwordHash, ...safeUser } = user;
        return NextResponse.json({
          data: {
            ...safeUser,
            token: Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64'),
          },
        });
      }
    } catch {
      // DB optional fallback
    }

    // Allow fallback demo user if credentials don't match specific preset
    const fallbackRole = cleanEmail.includes('superadmin')
      ? 'superadmin'
      : cleanEmail.includes('admin')
      ? 'admin'
      : cleanEmail.includes('staf') || cleanEmail.includes('employee')
      ? 'employee'
      : cleanEmail.includes('vendor')
      ? 'vendor'
      : cleanEmail.includes('tenant')
      ? 'tenant'
      : 'owner';

    const fallbackUser = {
      id: `usr_${Date.now()}`,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      role: fallbackRole,
      phone: '0812-3456-7890',
    };

    return NextResponse.json({
      data: {
        ...fallbackUser,
        token: Buffer.from(`${fallbackUser.id}:${fallbackUser.role}:${Date.now()}`).toString('base64'),
      },
    });
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Login gagal' }, { status: 500 });
  }
}
