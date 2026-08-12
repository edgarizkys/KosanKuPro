import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Server-side order memory store (Production Ready fallback)
let globalOrders: any[] = [
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

// In-memory notifications store (Synced with orders & system events)
let globalNotifs: any[] = [
  { id: 'n-1', title: 'Pesanan Tenant Baru', message: 'Budi Santoso (A-101) memesan Refill Air Galon Aqua 19L.', createdAt: new Date().toISOString() },
  { id: 'n-2', title: 'Cron Reminder Terkirim', message: 'WhatsApp reminder sewa ke Budi Santoso (A-101).', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n-3', title: 'Webhook Settlement', message: 'INV-2026-0602 dibayar via QRIS oleh Rian Pratama.', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

// GET /api/orders — Fetch live server orders & notifications
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('type') === 'notifications') {
    return NextResponse.json({ data: globalNotifs, count: globalNotifs.length });
  }
  return NextResponse.json({ data: globalOrders, count: globalOrders.length });
}

// POST /api/orders — Tenant submits new order from any device
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrder = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      tenantName: body.tenantName || 'Tenant Kosan',
      roomNumber: body.roomNumber || 'A-101',
      category: body.category || 'CUSTOM',
      item: body.item || 'Order Suplai',
      notes: body.notes || 'Tidak ada catatan tambahan',
      status: 'PENDING_DISPATCH',
      createdAt: new Date().toISOString(),
    };

    globalOrders.unshift(newOrder);

    // Push new notification item to drawer list!
    globalNotifs.unshift({
      id: `notif-${Date.now()}`,
      title: '🛒 Order Suplai Tenant Baru',
      message: `${newOrder.tenantName} (Kamar ${newOrder.roomNumber}) memesan: ${newOrder.item}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: newOrder });
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

    const order = globalOrders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();

      // Add status change to global notifications stream
      globalNotifs.unshift({
        id: `notif-${Date.now()}`,
        title: `🚚 Status Order ${id}: ${status}`,
        message: `Pesanan ${order.item} (${order.tenantName}) kini berstatus ${status}.`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memperbarui status order' }, { status: 500 });
  }
}
