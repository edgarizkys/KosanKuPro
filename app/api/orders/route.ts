import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Clean in-memory store for orders and notifications scoped per property
const propertyOrdersMap = new Map<string, any[]>();
const propertyNotifsMap = new Map<string, any[]>();

// GET /api/orders — Fetch live server orders & notifications (<10ms instant response)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isNotifs = searchParams.get('type') === 'notifications';
  const propertySlug = searchParams.get('property') || 'default';

  const orders = propertyOrdersMap.get(propertySlug) || [];
  const notifs = propertyNotifsMap.get(propertySlug) || [];

  if (isNotifs) {
    return NextResponse.json({ data: notifs, count: notifs.length });
  }

  return NextResponse.json({ data: orders, count: orders.length });
}

// POST /api/orders — Tenant submits new order from any device (Instant response + background DB persist)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const propertySlug = body.property || 'default';
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
      property: propertySlug,
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly store in property-scoped store
    const existing = propertyOrdersMap.get(propertySlug) || [];
    propertyOrdersMap.set(propertySlug, [newOrderData, ...existing.filter((o) => o.id !== newOrderId)]);

    // 2. Add in-app notification instantly
    const notifTitle = `🛒 Order Baru: ${newOrderData.category}`;
    const notifMsg = `${newOrderData.tenantName} (Kamar ${newOrderData.roomNumber}) memesan: ${newOrderData.item}${newOrderData.notes ? ` • Catatan: "${newOrderData.notes}"` : ''}`;
    const existingNotifs = propertyNotifsMap.get(propertySlug) || [];
    propertyNotifsMap.set(propertySlug, [
      {
        id: `notif-${Date.now()}`,
        title: notifTitle,
        message: notifMsg,
        createdAt: new Date().toISOString(),
      },
      ...existingNotifs,
    ]);

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
    const { id, status, assignedStaff, vendorName, addOnBilled, property: propertySlug = 'default' } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Instantly update memory store
    const existing = propertyOrdersMap.get(propertySlug) || [];
    const updatedList = existing.map((o) =>
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
    propertyOrdersMap.set(propertySlug, updatedList);

    const updatedOrder = updatedList.find((o) => o.id === id) || { id, status, assignedStaff, vendorName, addOnBilled };

    // 2. Background DB async persist (non-blocking)
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
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertySlug = searchParams.get('property');

    if (propertySlug) {
      propertyOrdersMap.delete(propertySlug);
      propertyNotifsMap.delete(propertySlug);
    } else {
      propertyOrdersMap.clear();
      propertyNotifsMap.clear();
    }

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
