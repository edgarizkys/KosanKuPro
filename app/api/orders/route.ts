import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Fallback in-memory store if DB is disconnected or during seed/migration
let fallbackOrders: any[] = [
  {
    id: 'REQ-1001',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    category: 'GALON',
    item: 'Refill Air Galon Aqua 19L (1x)',
    notes: 'Mohon ditaruh depan pintu kamar',
    status: 'PENDING_DISPATCH',
    createdAt: new Date().toISOString(),
  },
];

let fallbackNotifs: any[] = [
  { id: 'n-1', title: 'Pesanan Tenant Baru', message: 'Budi Santoso (A-101) memesan Refill Air Galon Aqua 19L.', createdAt: new Date().toISOString() },
  { id: 'n-2', title: 'Cron Reminder Terkirim', message: 'WhatsApp reminder sewa ke Budi Santoso (A-101).', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n-3', title: 'Webhook Settlement', message: 'INV-2026-0602 dibayar via QRIS oleh Rian Pratama.', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

// GET /api/orders — Fetch live server orders & notifications
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isNotifs = searchParams.get('type') === 'notifications';

  if (isNotifs) {
    try {
      const dbNotifs = await prisma.notificationLog.findMany({
        take: 30,
        orderBy: { sentAt: 'desc' },
      });
      if (dbNotifs.length > 0) {
        const formatted = dbNotifs.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          createdAt: n.sentAt.toISOString(),
        }));
        return NextResponse.json({ data: formatted, count: formatted.length });
      }
    } catch {
      // Fallback if DB unavailable
    }
    return NextResponse.json({ data: fallbackNotifs, count: fallbackNotifs.length });
  }

  try {
    const dbOrders = await (prisma as any).supplyOrder?.findMany?.({
      orderBy: { createdAt: 'desc' },
    });
    if (dbOrders && dbOrders.length > 0) {
      return NextResponse.json({ data: dbOrders, count: dbOrders.length });
    }
  } catch {
    // Fallback if DB unavailable
  }

  return NextResponse.json({ data: fallbackOrders, count: fallbackOrders.length });
}

// POST /api/orders — Tenant submits new order from any device
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrderData = {
      tenantName: body.tenantName || 'Tenant Kosan',
      roomNumber: body.roomNumber || 'A-101',
      category: body.category || 'CUSTOM',
      item: body.item || 'Order Suplai',
      notes: body.notes || 'Tidak ada catatan tambahan',
      status: 'PENDING_DISPATCH',
    };

    let createdOrder: any = null;

    try {
      createdOrder = await (prisma as any).supplyOrder?.create?.({
        data: newOrderData,
      });
    } catch {
      // Fallback
    }

    if (!createdOrder) {
      createdOrder = {
        id: `REQ-${Date.now().toString().slice(-4)}`,
        ...newOrderData,
        createdAt: new Date().toISOString(),
      };
      fallbackOrders.unshift(createdOrder);
    }

    const notifMsg = `${newOrderData.tenantName} (Kamar ${newOrderData.roomNumber}) memesan: ${newOrderData.item}`;
    fallbackNotifs.unshift({
      id: `notif-${Date.now()}`,
      title: '🛒 Order Suplai Tenant Baru',
      message: notifMsg,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: createdOrder });
  } catch (error) {
    console.error('[POST /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal memproses order server' }, { status: 500 });
  }
}

// PUT /api/orders — Update order status live on server
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    let updatedOrder: any = null;

    try {
      updatedOrder = await (prisma as any).supplyOrder?.update?.({
        where: { id },
        data: { status },
      });
    } catch {
      // Fallback
    }

    if (!updatedOrder) {
      const found = fallbackOrders.find((o) => o.id === id);
      if (found) {
        found.status = status;
        found.updatedAt = new Date().toISOString();
        updatedOrder = found;
      }
    }

    fallbackNotifs.unshift({
      id: `notif-${Date.now()}`,
      title: `🚚 Status Order ${id}: ${status}`,
      message: `Pesanan ${updatedOrder?.item || 'Suplai'} kini berstatus ${status}.`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui status order' }, { status: 500 });
  }
}

