import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Clean in-memory store for orders and notifications
let fallbackOrders: any[] = [];
let fallbackNotifs: any[] = [];

// GET /api/orders — Fetch live server orders & notifications (<10ms instant response)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isNotifs = searchParams.get('type') === 'notifications';

  if (isNotifs) {
    return NextResponse.json({ data: fallbackNotifs, count: fallbackNotifs.length });
  }

  return NextResponse.json({ data: fallbackOrders, count: fallbackOrders.length });
}

// POST /api/orders — Tenant submits new order from any device (Instant response + background DB persist)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrderId = body.id || `REQ-${Date.now().toString().slice(-4)}`;
    const newOrderData = {
      id: newOrderId,
      tenantName: body.tenantName || 'Tenant Kosan',
      roomNumber: body.roomNumber || 'A-101',
      category: body.category || 'CUSTOM',
      item: body.item || 'Order Suplai',
      notes: body.notes || 'Tidak ada catatan tambahan',
      status: 'PENDING_DISPATCH',
      assignedStaff: body.assignedStaff || null,
      vendorName: body.vendorName || null,
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly store in memory store (<1ms)
    fallbackOrders = [newOrderData, ...fallbackOrders.filter((o) => o.id !== newOrderId)];

    // 2. Add in-app notification instantly
    const notifTitle = `🛒 Order Baru: ${newOrderData.category}`;
    const notifMsg = `${newOrderData.tenantName} (Kamar ${newOrderData.roomNumber}) memesan: ${newOrderData.item}${newOrderData.notes ? ` • Catatan: "${newOrderData.notes}"` : ''}`;
    fallbackNotifs.unshift({
      id: `notif-${Date.now()}`,
      title: notifTitle,
      message: notifMsg,
      createdAt: new Date().toISOString(),
    });

    // 3. Background DB async persist (non-blocking)
    prisma.supplyOrder.create({
      data: {
        id: newOrderId,
        tenantName: newOrderData.tenantName,
        roomNumber: newOrderData.roomNumber,
        category: newOrderData.category,
        item: newOrderData.item,
        notes: newOrderData.notes,
        status: 'PENDING_DISPATCH',
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: newOrderData });
  } catch (error) {
    console.error('[POST /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal memproses order server' }, { status: 500 });
  }
}

// PUT /api/orders — Update order status live on server (<10ms instant response)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedStaff, vendorName, addOnBilled } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Instantly update memory store (<1ms)
    fallbackOrders = fallbackOrders.map((o) =>
      o.id === id
        ? {
            ...o,
            status: status || o.status,
            assignedStaff: assignedStaff !== undefined ? assignedStaff : o.assignedStaff,
            vendorName: vendorName !== undefined ? vendorName : o.vendorName,
            addOnBilled: addOnBilled !== undefined ? addOnBilled : o.addOnBilled,
          }
        : o
    );

    const updatedOrder = fallbackOrders.find((o) => o.id === id) || { id, status, assignedStaff, vendorName, addOnBilled };

    // 2. Trigger in-app notification instantly
    if (status) {
      const notifTitle = status === 'SETTLED' ? '✅ Pesanan Dikonfirmasi Tenant' : status === 'DELIVERED' ? '📦 Pesanan Tiba di Kamar' : '🚚 Pesanan Sedang Diantar';
      const notifMsg = `Pesanan #${id} (${updatedOrder?.item || 'Suplai'}) status: ${status} (Kurir: ${assignedStaff || 'Staf'}).`;

      fallbackNotifs.unshift({
        id: `notif-${Date.now()}`,
        title: notifTitle,
        message: notifMsg,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Background DB async persist (non-blocking)
    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedStaff !== undefined) updateData.assignedStaff = assignedStaff;
    if (vendorName !== undefined) updateData.vendorName = vendorName;

    prisma.supplyOrder.update({
      where: { id },
      data: updateData,
    }).catch(() => {});

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('[PUT /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal update order' }, { status: 500 });
  }
}

// DELETE /api/orders — Wipe all tenant supply orders for clean testing
export async function DELETE() {
  try {
    fallbackOrders = [];
    fallbackNotifs = [];

    try {
      await prisma.supplyOrder.deleteMany({});
    } catch (dbErr) {
      console.warn('[DELETE /api/orders DB fallback]', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Semua data permintaan tenant berhasil dihapus bersih' });
  } catch (error) {
    console.error('[DELETE /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 });
  }
}
