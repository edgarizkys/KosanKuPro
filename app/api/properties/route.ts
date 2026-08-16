import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/properties — List properties from DB or get specific property by slug/name
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || searchParams.get('kosan') || searchParams.get('property');

    const dbProperties = await prisma.property.findMany({
      include: {
        rooms: {
          include: { tenant: { select: { id: true, name: true, phone: true } } },
          orderBy: { number: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (slug && slug !== 'default') {
      const matched = dbProperties.find(
        (p) =>
          p.name.toLowerCase().includes(slug.toLowerCase()) ||
          p.id === slug ||
          slug.toLowerCase().includes(p.name.toLowerCase().replace(/\s+/g, ''))
      );

      if (matched) {
        return NextResponse.json({ data: matched, success: true });
      } else {
        return NextResponse.json({ data: null, success: false });
      }
    }

    return NextResponse.json({ data: dbProperties, success: true, count: dbProperties.length });
  } catch (error: any) {
    console.error('[GET /api/properties]', error);
    return NextResponse.json({ error: 'Failed to fetch properties', data: [] }, { status: 500 });
  }
}
