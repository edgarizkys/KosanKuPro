import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

let cachedUsersList: any[] = [
  { id: 'USR-OWN-01', name: 'Bapak Hendra Gunawan', email: 'owner@kosanku.pro', phone: '0811-9988-7766', role: 'OWNER', avatar: '👑' },
  { id: 'USR-ADM-01', name: 'Pak Suryadi Wibowo', email: 'admin@kosanku.pro', phone: '0812-3456-7890', role: 'ADMIN', avatar: '🛡️' },
  { id: 'USR-EMP-01', name: 'Bambang Prasetyo', email: 'staf@kosanku.pro', phone: '0813-5544-3322', role: 'EMPLOYEE', avatar: '👷' },
  { id: 'USR-VND-01', name: 'Depot Air & Gas Suci', email: 'vendor.galon@kosanku.pro', phone: '0812-9988-7711', role: 'VENDOR', avatar: '💧' },
  { id: 'USR-VND-02', name: 'Laundry Express Clean', email: 'vendor.laundry@kosanku.pro', phone: '0813-8877-6655', role: 'VENDOR', avatar: '🧺' },
  { id: 'USR-TNT-01', name: 'Rian Pratama', email: 'tenant@kosanku.pro', phone: '0815-6677-8899', role: 'TENANT', avatar: '👤' },
];

/**
 * GET /api/users/profile?email=xxx - Instant <5ms
 * Returns user profile including avatarUrl from Memory & non-blocking DB.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.toLowerCase().trim();
    const all = searchParams.get('all');

    if (all === 'true' || !email) {
      // Non-blocking background sync
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          avatarUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }).then((dbUsers) => {
        if (dbUsers && dbUsers.length > 0) cachedUsersList = dbUsers;
      }).catch(() => {});

      return NextResponse.json({ data: cachedUsersList });
    }

    const found = cachedUsersList.find((u) => u.email.toLowerCase() === email);
    return NextResponse.json({ data: found || null });
  } catch (error) {
    return NextResponse.json({ data: cachedUsersList, fallback: true });
  }
}

/**
 * PATCH /api/users/profile
 * Upserts user profile including avatarUrl in DB.
 * Body: { email, name?, phone?, avatar?, avatarUrl? }
 * Uses upsert so demo users are auto-created on first save.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, avatar, avatarUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Limit base64 avatarUrl size to ~800KB to avoid DB/network issues
    if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.startsWith('data:') && avatarUrl.length > 800_000) {
      return NextResponse.json(
        { error: 'Ukuran foto terlalu besar. Gunakan URL foto atau file lebih kecil dari 600KB.' },
        { status: 413 }
      );
    }

    const demoDefaults: Record<string, { name: string; role: string; phone: string }> = {
      'owner@kosanku.pro': { name: 'Bapak Hendra (Property Owner)', role: 'OWNER', phone: '0811-9988-7766' },
      'superadmin@kosanku.pro': { name: 'Superadmin Master SaaS', role: 'SUPERADMIN', phone: '0812-0000-0001' },
      'admin@kosanku.pro': { name: 'Pak Admin Operasional', role: 'ADMIN', phone: '0812-3456-7890' },
      'staf@kosanku.pro': { name: 'Bambang (Staf Maintenance)', role: 'EMPLOYEE', phone: '0813-5544-3322' },
      'vendor@kosanku.pro': { name: 'Depot Air & Gas Suci (Vendor Mitra)', role: 'VENDOR', phone: '0814-7788-9900' },
      'tenant@kosanku.pro': { name: 'Rian Pratama', role: 'TENANT', phone: '0815-6677-8899' },
    };

    const defaults = demoDefaults[cleanEmail];

    // Upsert: auto-create stub record for demo users, update existing users
    const result = await prisma.user.upsert({
      where: { email: cleanEmail },
      create: {
        // Prisma auto-generates UUID via @default(uuid()) — no manual ID needed
        name: name || defaults?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || defaults?.phone || '0812-3456-7890',
        passwordHash: 'demo_password_hash',
        role: (defaults?.role as any) || 'TENANT',
        avatar: avatar || null,
        avatarUrl: avatarUrl || null,
      },
      update: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[PATCH /api/users/profile]', error);
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
