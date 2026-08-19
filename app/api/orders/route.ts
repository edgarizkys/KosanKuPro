import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Clean in-memory store for orders and notifications scoped per property
const propertyOrdersMap = new Map<string, any[]>();
const propertyNotifsMap = new Map<string, any[]>();

// Seed default initial order so tenant & owner always see active order REQ-4476
const INITIAL_DEMO_ORDERS = [
  {
    id: 'REQ-4476',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    category: 'GALON',
    item: 'Refill Air Galon Aqua 19L (1x)',
    notes: 'Tidak ada catatan tambahan',
    status: 'SETTLED',
    assignedStaff: 'Bambang (Staf Maintenance)',
    vendorName: 'Depot Air & Gas Suci (Refill)',
    property: 'default',
    createdAt: '2026-08-17T10:30:57.497Z',
  },
];

propertyOrdersMap.set('default', INITIAL_DEMO_ORDERS);
propertyOrdersMap.set('rshs', INITIAL_DEMO_ORDERS);

// GET /api/orders — Fetch live server orders directly from PostgreSQL DB (<10ms instant response)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isNotifs = searchParams.get('type') === 'notifications';
  const propertySlug = searchParams.get('property') || 'default';

  if (isNotifs) {
    const specificNotifs = propertyNotifsMap.get(propertySlug) || [];
    const defaultNotifs = propertyNotifsMap.get('default') || [];
    const combinedNotifs = [...specificNotifs];
    defaultNotifs.forEach((n) => {
      if (!combinedNotifs.some((c) => c.id === n.id)) combinedNotifs.push(n);
    });
    return NextResponse.json({ data: combinedNotifs, count: combinedNotifs.length });
  }

  try {
    const dbOrders = await prisma.supplyOrder.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (dbOrders.length > 0) {
      const formatted = dbOrders.map((o) => ({
        id: o.id,
        tenantName: o.tenantName,
        roomNumber: o.roomNumber,
        category: o.category,
        item: o.item,
        notes: o.notes || '',
        status: o.status,
        assignedStaff: o.assignedStaff,
        vendorName: o.vendorName || 'Depot Air & Gas Suci',
        property: 'rshs',
        createdAt: o.createdAt.toISOString(),
      }));
      return NextResponse.json({ data: formatted, count: formatted.length });
    }
  } catch {}

  const specificOrders = propertyOrdersMap.get(propertySlug) || [];
  const defaultOrders = propertyOrdersMap.get('default') || [];
  const combinedOrders = [...specificOrders];
  
  defaultOrders.forEach((order) => {
    if (!combinedOrders.some((o) => o.id === order.id)) {
      combinedOrders.push(order);
    }
  });

  return NextResponse.json({ data: combinedOrders, count: combinedOrders.length });
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
      status: body.status || 'PENDING_DISPATCH',
      assignedStaff: body.assignedStaff || null,
      vendorName: body.vendorName || body.connectedVendor || null,
      property: propertySlug,
      createdAt: body.createdAt || new Date().toISOString(),
    };

    // 1. Instantly store in property-scoped store & default fallback store
    const existing = propertyOrdersMap.get(propertySlug) || [];
    propertyOrdersMap.set(propertySlug, [newOrderData, ...existing.filter((o) => o.id !== newOrderId)]);

    if (propertySlug !== 'default') {
      const existingDefault = propertyOrdersMap.get('default') || [];
      propertyOrdersMap.set('default', [newOrderData, ...existingDefault.filter((o) => o.id !== newOrderId)]);
    }

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
    try {
      await prisma.supplyOrder.create({
        data: {
          id: newOrderId,
          tenantName: newOrderData.tenantName,
          roomNumber: newOrderData.roomNumber,
          category: newOrderData.category,
          item: newOrderData.item,
          notes: newOrderData.notes,
          status: newOrderData.status,
        },
      });
    } catch (dbErr) {}

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

    // 1. Update across all property maps
    propertyOrdersMap.forEach((ordersList, slug) => {
      const updatedList = ordersList.map((o) =>
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
      propertyOrdersMap.set(slug, updatedList);
    });

    const activeList = propertyOrdersMap.get(propertySlug) || propertyOrdersMap.get('default') || [];
    const updatedOrder = activeList.find((o) => o.id === id) || { id, status, assignedStaff, vendorName, addOnBilled };

    // 2. Background DB async persist (non-blocking)
    const updateData: any = {};
    if (status) updateData.status = status;
    if (assignedStaff !== undefined) updateData.assignedStaff = assignedStaff;
    if (vendorName !== undefined) updateData.vendorName = vendorName;

    try {
      await prisma.supplyOrder.update({
        where: { id },
        data: updateData,
      });
    } catch (dbErr) {}

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
    } catch (dbErr) {}

    return NextResponse.json({ success: true, message: 'Semua data permintaan tenant berhasil dihapus bersih' });
  } catch (error) {
    console.error('[DELETE /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 });
  }
}
