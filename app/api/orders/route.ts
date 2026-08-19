import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushActivityNotification, pushWaLiveLog } from '@/lib/activityEvents';

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

    const dbOrders = await prisma.supplyOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = dbOrders.map((o) => ({
      id: o.id,
      tenantName: o.tenantName,
      roomNumber: o.roomNumber,
      category: o.category,
      item: o.item,
      notes: o.notes || '',
      status: o.status,
      assignedStaff: o.assignedStaff || 'Bambang (Staf Maintenance)',
      vendorName: o.vendorName || (o.category === 'LAUNDRY' ? 'Mitra Laundry Bersih Express' : o.category === 'WARUNG' ? 'Warung Makan Bu Imas' : 'Depot Air & Gas Suci'),
      property: 'rshs',
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted, count: formatted.length });
  } catch (error: any) {
    console.error('[GET /api/orders error]', error);
    return NextResponse.json({ success: true, data: [], count: 0 });
  }
}

// POST /api/orders — Tenant submits new order into Database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newOrderId = body.id || `REQ-${Date.now().toString().slice(-4)}`;
    const vendor = body.vendorName || (body.category === 'LAUNDRY' ? 'Mitra Laundry Bersih Express' : body.category === 'WARUNG' ? 'Warung Makan Bu Imas' : 'Depot Air & Gas Suci');

    const order = await prisma.supplyOrder.create({
      data: {
        id: newOrderId,
        tenantName: body.tenantName || 'Tenant Kosan',
        roomNumber: body.roomNumber || 'EKS-01',
        category: body.category || 'CUSTOM',
        item: body.item || 'Order Suplai',
        notes: body.notes || 'Tidak ada catatan tambahan',
        status: body.status || 'PENDING_DISPATCH',
        assignedStaff: body.assignedStaff || null,
        vendorName: vendor,
      },
    });

    // Push real-time toast to Owner and Vendor
    pushActivityNotification('default', {
      id: `ord_${order.id}`,
      title: `🛒 Pesanan Suplai Baru: Kamar ${order.roomNumber}`,
      message: `${order.tenantName}: "${order.item}". Vendor: ${vendor}.`,
      targetRole: ['owner', 'admin', 'vendor'],
      targetTab: 'tenant_requests',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    });

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        tenantName: order.tenantName,
        roomNumber: order.roomNumber,
        category: order.category,
        item: order.item,
        notes: order.notes,
        status: order.status,
        vendorName: order.vendorName,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[POST /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal memproses order ke database' }, { status: 500 });
  }
}

// PUT /api/orders — Update order status in Database
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedStaff, vendorName } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const updated = await prisma.supplyOrder.update({
      where: { id },
      data: {
        status: status || undefined,
        assignedStaff: assignedStaff || undefined,
        vendorName: vendorName || undefined,
      },
    });

    // Push activity update
    if (status === 'PROCESSING' || status === 'DELIVERED') {
      const statusLabel = status === 'PROCESSING' ? 'Sedang Diproses/Diantar' : 'Sudah Tiba di Depan Kamar';
      pushActivityNotification('default', {
        id: `ord_stat_${id}_${Date.now()}`,
        title: `🚚 Update Pengantaran: Pesanan #${id}`,
        message: `${updated.item} untuk ${updated.tenantName} (${updated.roomNumber}): ${statusLabel}.`,
        targetRole: ['owner', 'tenant'],
        targetTab: 'tenant_requests',
        badgeColor: 'bg-blue-100 text-blue-800',
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('[PUT /api/orders error]', error);
    return NextResponse.json({ error: 'Gagal update order di database' }, { status: 500 });
  }
}

// DELETE /api/orders — Delete order from Database
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.supplyOrder.delete({ where: { id } });
    } else {
      await prisma.supplyOrder.deleteMany({});
    }

    return NextResponse.json({ success: true, message: 'Data pesanan berhasil dibersihkan dari database' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus data pesanan' }, { status: 500 });
  }
}
