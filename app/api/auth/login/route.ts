import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEMO_USERS: Record<string, any> = {
  'owner@kosanku.pro': {
    id: 'usr_owner_01',
    name: 'Ibu Dewi Tri Oktariani (Property Owner)',
    email: 'owner@kosanku.pro',
    role: 'owner',
    phone: '0811-9988-7766',
  },
  'owner@kosanku.com': {
    id: 'usr_owner_01',
    name: 'Ibu Dewi Tri Oktariani (Property Owner)',
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
    name: 'Pak Admin Operasional (Siti)',
    email: 'admin@kosanku.pro',
    role: 'admin',
    phone: '0812-3456-7890',
  },
  'admin2@kosanku.pro': {
    id: 'usr_admin_02',
    name: 'Admin Keuangan (Rina)',
    email: 'admin2@kosanku.pro',
    role: 'admin',
    phone: '0812-9988-3344',
  },
  // Multi Staff Accounts
  'staf@kosanku.pro': {
    id: 'usr_staf_01',
    name: 'Bambang (Staf Maintenance)',
    email: 'staf@kosanku.pro',
    role: 'employee',
    phone: '0813-5544-3322',
  },
  'staf.kebersihan@kosanku.pro': {
    id: 'usr_staf_02',
    name: 'Rudi (Staf Kebersihan)',
    email: 'staf.kebersihan@kosanku.pro',
    role: 'employee',
    phone: '0813-9988-1122',
  },
  // Multi Vendor Accounts
  'vendor.galon@kosanku.pro': {
    id: 'USR-VND-01',
    name: 'Depot Air & Gas Suci',
    email: 'vendor.galon@kosanku.pro',
    role: 'vendor',
    phone: '0812-9988-7711',
  },
  'vendor.laundry@kosanku.pro': {
    id: 'USR-VND-02',
    name: 'Laundry Express Clean',
    email: 'vendor.laundry@kosanku.pro',
    role: 'vendor',
    phone: '0813-8877-6655',
  },
  'vendor.teknik@kosanku.pro': {
    id: 'USR-VND-03',
    name: 'Toko Bangunan & Teknik Subur',
    email: 'vendor.teknik@kosanku.pro',
    role: 'vendor',
    phone: '0815-1122-3344',
  },
  // Multi Tenant Accounts
  'tenant@kosanku.pro': {
    id: 'usr_tenant_01',
    name: 'Rian Pratama',
    email: 'tenant@kosanku.pro',
    role: 'tenant',
    phone: '0815-6677-8899',
    rooms: [{ id: '1', number: 'A-101', type: 'Deluxe Studio Smart', price: 1500000 }],
  },
  'tenant2@kosanku.pro': {
    id: 'usr_tenant_02',
    name: 'Siti Rahma',
    email: 'tenant2@kosanku.pro',
    role: 'tenant',
    phone: '0812-3344-5566',
    rooms: [{ id: '2', number: 'B-201', type: 'Executive Balcony', price: 2000000 }],
  },
  'tenant3@kosanku.pro': {
    id: 'usr_tenant_03',
    name: 'Budi Santoso',
    email: 'tenant3@kosanku.pro',
    role: 'tenant',
    phone: '0813-7788-9900',
    rooms: [{ id: '3', number: 'C-302', type: 'Standard Cosy Single', price: 1200000 }],
  },
};

// POST /api/auth/login — ultra-fast instant login (<5ms)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Instant match for demo & role accounts (<1ms)
    if (DEMO_USERS[cleanEmail]) {
      const demoUser = DEMO_USERS[cleanEmail];
      return NextResponse.json({
        data: {
          ...demoUser,
          token: Buffer.from(`${demoUser.id}:${demoUser.role}:${Date.now()}`).toString('base64'),
        },
      });
    }

    // 2. Fallback instant match based on keyword
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
