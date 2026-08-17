import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory store for operational reserve requests (Cadangan Operasional)
const propertyReservesMap = new Map<string, any[]>();

const INITIAL_DEMO_RESERVES = [
  {
    id: 'RES-1001',
    title: 'Pengajuan Kas Kecil Perbaikan Pompa Air Lt 2',
    category: 'PERBAIKAN_DARURAT',
    amount: 750000,
    allocatedAmount: 750000,
    requestedBy: 'Bambang (Staf Maintenance)',
    notes: 'Pembelian sparepart seal dan bearing pompa air utama lantai 2',
    status: 'APPROVED',
    approvedBy: 'Owner / Admin KosanKu',
    property: 'default',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'RES-1002',
    title: 'Dana Cadangan Operasional Pembelian Stok Sabun & Galon',
    category: 'KAS_KECIL',
    amount: 500000,
    allocatedAmount: 500000,
    requestedBy: 'Asep (Staf Kebersihan)',
    notes: 'Stok awal sabun cuci piring & penggantian 5 galon cadangan',
    status: 'PENDING_APPROVAL',
    approvedBy: null,
    property: 'default',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

propertyReservesMap.set('default', INITIAL_DEMO_RESERVES);
propertyReservesMap.set('rshs', INITIAL_DEMO_RESERVES);

// GET /api/operational-reserves — Fetch operational funding requests
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertySlug = searchParams.get('property') || 'default';

  const specificReserves = propertyReservesMap.get(propertySlug) || [];
  const defaultReserves = propertyReservesMap.get('default') || [];
  const combined = [...specificReserves];

  defaultReserves.forEach((r) => {
    if (!combined.some((c) => c.id === r.id)) combined.push(r);
  });

  return NextResponse.json({ success: true, data: combined, count: combined.length });
}

// POST /api/operational-reserves — Staff submits a new funding request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const propertySlug = body.property || 'default';
    const newId = body.id || `RES-${Date.now().toString().slice(-4)}`;

    const newReserve = {
      id: newId,
      title: body.title || 'Pengajuan Dana Operasional',
      category: body.category || 'KAS_KECIL',
      amount: parseFloat(body.amount || '0'),
      allocatedAmount: parseFloat(body.allocatedAmount || body.amount || '0'),
      requestedBy: body.requestedBy || body.staffName || 'Staf Operasional',
      notes: body.notes || 'Tidak ada catatan tambahan',
      status: 'PENDING_APPROVAL',
      approvedBy: null,
      property: propertySlug,
      createdAt: new Date().toISOString(),
    };

    const existingSpecific = propertyReservesMap.get(propertySlug) || [];
    propertyReservesMap.set(propertySlug, [newReserve, ...existingSpecific]);

    if (propertySlug !== 'default') {
      const existingDefault = propertyReservesMap.get('default') || [];
      propertyReservesMap.set('default', [newReserve, ...existingDefault]);
    }

    return NextResponse.json({ success: true, data: newReserve }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/operational-reserves error]', error);
    return NextResponse.json({ error: 'Gagal mengajukan cadangan operasional' }, { status: 500 });
  }
}

// PUT /api/operational-reserves — Admin/Owner plots allocation & approves/rejects
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, allocatedAmount, approvedBy, property: propertySlug = 'default' } = body;

    if (!id) {
      return NextResponse.json({ error: 'Reserve ID is required' }, { status: 400 });
    }

    propertyReservesMap.forEach((reservesList, slug) => {
      const updated = reservesList.map((r) =>
        r.id === id
          ? {
              ...r,
              status: status || r.status,
              allocatedAmount: allocatedAmount !== undefined ? parseFloat(allocatedAmount) : r.allocatedAmount,
              approvedBy: approvedBy || r.approvedBy || 'Admin / Owner KosanKu',
            }
          : r
      );
      propertyReservesMap.set(slug, updated);
    });

    const activeList = propertyReservesMap.get(propertySlug) || propertyReservesMap.get('default') || [];
    const updatedItem = activeList.find((r) => r.id === id) || { id, status, allocatedAmount };

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('[PUT /api/operational-reserves error]', error);
    return NextResponse.json({ error: 'Gagal update alokasi operasional' }, { status: 500 });
  }
}

// DELETE /api/operational-reserves — Reset reserves
export async function DELETE() {
  propertyReservesMap.clear();
  return NextResponse.json({ success: true, message: 'Semua pengajuan cadangan operasional direset' });
}
