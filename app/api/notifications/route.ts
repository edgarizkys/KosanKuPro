import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/notifications — list recent notification logs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;

    const notifications = await prisma.notificationLog.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { sentAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ data: notifications, count: notifications.length });
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
