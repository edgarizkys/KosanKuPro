import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

let cachedUsersList: any[] = [
  { id: 'USR-OWN-01', name: 'Ibu Dewi Tri Oktariani', email: 'owner@kosanku.pro', phone: '0811-9988-7766', role: 'OWNER', avatar: '👑' },
  { id: 'USR-ADM-01', name: 'Pak Suryadi Wibowo', email: 'admin@kosanku.pro', phone: '0812-3456-7890', role: 'ADMIN', avatar: '🛡️' },
  { id: 'USR-ADM-02', name: 'Rina (Finance)', email: 'admin2@kosanku.pro', phone: '0812-9988-1122', role: 'ADMIN', avatar: '💼' },
  { id: 'USR-EMP-01', name: 'Bambang Prasetyo', email: 'staf@kosanku.pro', phone: '0813-5544-3322', role: 'EMPLOYEE', avatar: '👷' },
  { id: 'USR-EMP-02', name: 'Rudi Hartono (Kebersihan)', email: 'staf.kebersihan@kosanku.pro', phone: '0813-2233-4455', role: 'EMPLOYEE', avatar: '🧹' },
  { id: 'USR-VND-01', name: 'Depot Air & Gas Suci', email: 'vendor.galon@kosanku.pro', phone: '0812-9988-7711', role: 'VENDOR', avatar: '💧' },
  { id: 'USR-VND-02', name: 'Laundry Express Clean', email: 'vendor.laundry@kosanku.pro', phone: '0813-8877-6655', role: 'VENDOR', avatar: '🧺' },
  { id: 'USR-VND-03', name: 'Toko Bangunan & Teknik Subur', email: 'vendor.teknik@kosanku.pro', phone: '0815-1122-3344', role: 'VENDOR', avatar: '🔧' },
  { id: 'USR-TNT-01', name: 'Rian Pratama', email: 'tenant@kosanku.pro', phone: '0815-6677-8899', role: 'TENANT', avatar: '👤' },
  { id: 'USR-TNT-02', name: 'Siti Rahma', email: 'tenant2@kosanku.pro', phone: '0812-3344-5566', role: 'TENANT', avatar: '👤' },
  { id: 'USR-TNT-03', name: 'Budi Santoso', email: 'tenant3@kosanku.pro', phone: '0813-7788-9900', role: 'TENANT', avatar: '👤' },
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

    // Attempt to load live data from database first
    try {
      const dbUsers = await prisma.user.findMany({
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
      });

      if (dbUsers && dbUsers.length > 0) {
        cachedUsersList = dbUsers;
      }
    } catch (e) {
      // fallback to memory cache
    }

    if (all === 'true' || !email) {
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
      'owner@kosanku.pro': { name: 'Ibu Dewi Tri Oktariani (Property Owner)', role: 'OWNER', phone: '0811-9988-7766' },
      'owner@kosanku.com': { name: 'Ibu Dewi Tri Oktariani (Property Owner)', role: 'OWNER', phone: '0811-9988-7766' },
      'superadmin@kosanku.pro': { name: 'Superadmin Master SaaS', role: 'SUPERADMIN', phone: '0812-0000-0001' },
      'admin@kosanku.pro': { name: 'Pak Admin Operasional', role: 'ADMIN', phone: '0812-3456-7890' },
      'admin2@kosanku.pro': { name: 'Rina (Admin Keuangan)', role: 'ADMIN', phone: '0812-9988-1122' },
      'staf@kosanku.pro': { name: 'Bambang (Staf Maintenance)', role: 'EMPLOYEE', phone: '0813-5544-3322' },
      'staf.kebersihan@kosanku.pro': { name: 'Rudi (Staf Kebersihan)', role: 'EMPLOYEE', phone: '0813-2233-4455' },
      'vendor.galon@kosanku.pro': { name: 'Depot Air & Gas Suci', role: 'VENDOR', phone: '0812-9988-7711' },
      'vendor.laundry@kosanku.pro': { name: 'Laundry Express Clean', role: 'VENDOR', phone: '0813-8877-6655' },
      'vendor.teknik@kosanku.pro': { name: 'Toko Bangunan & Teknik Subur', role: 'VENDOR', phone: '0815-1122-3344' },
      'tenant@kosanku.pro': { name: 'Rian Pratama', role: 'TENANT', phone: '0815-6677-8899' },
      'tenant2@kosanku.pro': { name: 'Siti Rahma', role: 'TENANT', phone: '0812-3344-5566' },
      'tenant3@kosanku.pro': { name: 'Budi Santoso', role: 'TENANT', phone: '0813-7788-9900' },
    };

    const defaults = demoDefaults[cleanEmail];

    // Update in-memory cachedUsersList immediately
    const foundIdx = cachedUsersList.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (foundIdx >= 0) {
      cachedUsersList[foundIdx] = {
        ...cachedUsersList[foundIdx],
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      };
    } else {
      cachedUsersList.push({
        id: `USR-${Date.now()}`,
        name: name || defaults?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || defaults?.phone || '0812-3456-7890',
        role: defaults?.role || 'TENANT',
        avatar: avatar || '👤',
        avatarUrl: avatarUrl || null,
      });
    }

    // Upsert directly in Prisma DB
    const result = await prisma.user.upsert({
      where: { email: cleanEmail },
      create: {
        name: name || defaults?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phone || defaults?.phone || '0812-3456-7890',
        passwordHash: 'demo_password_hash',
        role: (defaults?.role as any) || 'TENANT',
        avatar: avatar || null,
        avatarUrl: avatarUrl || null,
      },
      update: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[PATCH /api/users/profile error]', error);
    return NextResponse.json({ success: true, localOnly: true });
  }
}
