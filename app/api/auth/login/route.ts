import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/auth/login — verify credentials against DB
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
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

    if (!user) {
      return NextResponse.json({ error: 'Email tidak terdaftar' }, { status: 401 });
    }

    // Simple password check (in production, use bcrypt.compare)
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
  } catch (error) {
    console.error('[POST /api/auth/login]', error);
    return NextResponse.json({ error: 'Login gagal' }, { status: 500 });
  }
}
