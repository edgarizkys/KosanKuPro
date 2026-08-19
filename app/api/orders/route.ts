import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';
import { pushActivityNotification, inMemoryOrders, pushSupplyOrder } from '@/lib/activityEvents';

export const dynamic = 'force-dynamic';

// GET /api/orders — Fetch live server orders with category & vendor isolation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const vendorName = searchParams.get('vendorName');

    const where: any = {};
    if (category && category !== 'all') {
      if (category === 'WATER_GAS') {
        where.category = { in: ['GALON', 'GAS', 'WATER_GAS'] };
      } else {
        where.category = category;
      }
    }
    if (vendorName && vendorName !== 'all') {
      where.vendorName = { contains: vendorName, mode: 'insensitive' };
    }

    const dbOrders = await safeDbQuery(
      () => prisma.supplyOrder.findMany({ where, orderBy: { createdAt: 'desc' } }),
      []
    );

    const mergedOrdersMap = new Map<string, any>();
    inMemoryOrders.forEach((o) => mergedOrdersMap.set(o.id, o));
    if (dbOrders && dbOrders.length > 0) {
      dbOrders.forEach((o) => mergedOrdersMap.set(o.id, o));
    }

    let allOrders = Array.from(mergedOrdersMap.values());
    if (category && category !== 'all') {
      allOrders = allOrders.filter((o) => (category === 'WATER_GAS' ? ['GALON', 'GAS', 'WATER_GAS'].includes(o.category) : o.category === category));
    }
    if (vendorName && vendorName !== 'all') {
      allOrders = allOrders.filter((o) => o.vendorName?.toLowerCase().includes(vendorName.toLowerCase()));
    }

    const formatted = allOrders.map((o) => ({
      id: o.id,
      tenantName: o.tenantName,
      roomNumber: o.roomNumber,
      category: o.category,
      item: o.item,
      notes: o.notes || '',
      status: o.status,
      assignedStaff: o.assignedStaff || 'Bambang (Staf Maintenance)',
      vendorName: o.vendorName || (o.category === 'LAUNDRY' ? 'Mitra Laundry Bersih Express' : o.category === 'WARUNG' ? 'Warung Makan Bu Imas' : 'Depot Air & Gas Suci'),
      property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
      createdAt: typeof o.createdAt === 'string' ? o.createdAt : o.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted, count: formatted.length });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: inMemoryOrders, count: inMemoryOrders.length });
  }
}

// POST /api/orders — Tenant submits new order into Database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrderId = body.id || `REQ-${Date.now().toString().slice(-4)}`;
    const vendor = body.vendorName || (body.category === 'LAUNDRY' ? 'Mitra Laundry Bersih Express' : body.category === 'WARUNG' ? 'Warung Makan Bu Imas' : 'Depot Air & Gas Suci');

    const orderObj = {
      id: newOrderId,
      tenantName: body.tenantName || 'dr. Rizky Pratama, Sp.A',
      roomNumber: body.roomNumber || 'EKS-01',
      category: body.category || 'CUSTOM',
      item: body.item || 'Order Suplai',
      notes: body.notes || 'Order WhatsApp',
      status: body.status || 'PENDING_DISPATCH',
      assignedStaff: body.assignedStaff || null,
      vendorName: vendor,
      createdAt: new Date().toISOString(),
    };

    // Store in live memory immediately
    pushSupplyOrder(orderObj);

    safeDbQuery(() => prisma.supplyOrder.create({ data: orderObj }), null, 500).catch(() => {});

    // Push real-time toast to Owner and Vendor
    pushActivityNotification('default', {
      id: `ord_${orderObj.id}`,
      title: `🛒 Pesanan Suplai Baru: Kamar ${orderObj.roomNumber}`,
      message: `${orderObj.tenantName}: "${orderObj.item}". Vendor: ${vendor}.`,
      targetRole: ['owner', 'admin', 'vendor'],
      targetTab: 'tenant_requests',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    });

    return NextResponse.json({
      success: true,
      data: orderObj,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// PATCH /api/orders — Update status of order (e.g. PROCESSING, DELIVERED)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedStaff, vendorName } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    pushSupplyOrder({ id, status, assignedStaff, vendorName });
    safeDbQuery(() => prisma.supplyOrder.update({ where: { id }, data: { status, assignedStaff, vendorName } }), null, 500).catch(() => {});

    return NextResponse.json({ success: true, message: 'Status order berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
