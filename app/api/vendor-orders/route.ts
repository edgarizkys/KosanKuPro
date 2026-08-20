import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/vendor-orders?vendor=Depot+Air&month=2026-08&room=EKS-01
// Returns aggregated order stats + order list for a vendor/month
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const vendorName = searchParams.get('vendor');
  const monthStr = searchParams.get('month'); // e.g. "2026-08"
  const roomNumber = searchParams.get('room');

  // Build date range
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  if (monthStr) {
    startDate = new Date(`${monthStr}-01`);
    endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
  }

  try {
    const where: any = {};
    if (vendorName) where.vendorName = { contains: vendorName, mode: 'insensitive' };
    if (roomNumber) where.roomNumber = roomNumber;
    if (startDate && endDate) where.createdAt = { gte: startDate, lt: endDate };

    const orders = await safeDbQuery(
      () => prisma.supplyOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      []
    );

    // Aggregate stats
    const totalOrders = orders.length;
    const done = orders.filter((o: any) => ['DELIVERED', 'COMPLETED', 'DONE'].includes(o.status?.toUpperCase())).length;
    const pending = orders.filter((o: any) => ['PENDING_DISPATCH', 'IN_TRANSIT', 'PROSES'].includes(o.status?.toUpperCase())).length;

    return NextResponse.json({
      success: true,
      data: orders,
      stats: { totalOrders, done, pending },
    });
  } catch (error: any) {
    console.error('[GET /api/vendor-orders]', error);
    return NextResponse.json({ error: 'Gagal memuat data order vendor' }, { status: 500 });
  }
}

// GET /api/tenant-summary?phone=08xxx&month=2026-08 — spending summary per tenant
// Also handles /api/vendor-orders?tenant=... for tenant statement
