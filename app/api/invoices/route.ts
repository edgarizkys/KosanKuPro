import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// In-memory property-scoped store for live invoice persistence
const propertyInvoicesMap = new Map<string, any[]>();

const INITIAL_DEMO_INVOICES = [
  {
    id: 'inv-demo-01',
    invoiceNumber: 'INV-2026-0701',
    amount: 1600000,
    penaltyAmount: 0,
    totalAmount: 1600000,
    paymentStatus: 'SETTLED',
    dueDate: '2026-08-25',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    property: 'default',
    user: { id: 'usr-1', name: 'Budi Santoso', phone: '08123456789' },
    room: { id: 'rm-1', number: 'A-101', type: 'Deluxe AC' },
  },
  {
    id: 'inv-demo-02',
    invoiceNumber: 'INV-2026-0702',
    amount: 1450000,
    penaltyAmount: 50000,
    totalAmount: 1500000,
    paymentStatus: 'PENDING',
    dueDate: '2026-08-30',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    property: 'default',
    user: { id: 'usr-2', name: 'Siti Rahma', phone: '08219876543' },
    room: { id: 'rm-2', number: 'B-203', type: 'Standard AC' },
  },
];

propertyInvoicesMap.set('default', INITIAL_DEMO_INVOICES);
propertyInvoicesMap.set('rshs', INITIAL_DEMO_INVOICES);

// GET /api/invoices — list invoices with optional property filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const propertySlug = searchParams.get('property') || 'default';

    let list = propertyInvoicesMap.get(propertySlug) || propertyInvoicesMap.get('default') || INITIAL_DEMO_INVOICES;

    // Try fetching from DB if available
    try {
      const where: any = {};
      if (status) where.paymentStatus = status.toUpperCase();

      const dbInvoices = await prisma.invoice.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true } },
          room: { select: { id: true, number: true, type: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbInvoices && dbInvoices.length > 0) {
        const mappedDb = dbInvoices.map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount,
          penaltyAmount: inv.penaltyAmount,
          totalAmount: inv.totalAmount,
          paymentStatus: inv.paymentStatus,
          dueDate: inv.dueDate.toISOString().slice(0, 10),
          createdAt: inv.createdAt.toISOString(),
          property: propertySlug,
          user: inv.user || { name: 'Tenant' },
          room: inv.room || { number: 'A-101' },
        }));
        
        // Merge with in-memory store
        const combined = [...mappedDb];
        list.forEach((m) => {
          if (!combined.some((c) => c.id === m.id || c.invoiceNumber === m.invoiceNumber)) {
            combined.push(m);
          }
        });
        list = combined;
      }
    } catch {}

    if (status) {
      list = list.filter((inv) => inv.paymentStatus?.toUpperCase() === status.toUpperCase());
    }

    return NextResponse.json({ data: list, count: list.length });
  } catch (error) {
    return NextResponse.json({ data: INITIAL_DEMO_INVOICES, count: INITIAL_DEMO_INVOICES.length });
  }
}

// POST /api/invoices — create a new invoice from Admin/Owner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const propertySlug = body.property || 'default';
    const amountNum = parseFloat(body.amount || '0');
    const penaltyNum = body.penaltyAmount ? parseFloat(body.penaltyAmount) : 0;
    const totalNum = amountNum + penaltyNum;
    const tenantName = body.tenantName || body.userName || 'Budi Santoso';
    const roomNum = body.roomNumber || body.roomNo || 'A-101';
    const dueDateStr = body.dueDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const currentList = propertyInvoicesMap.get(propertySlug) || propertyInvoicesMap.get('default') || [];
    const invoiceNumber = body.invoiceNumber || `INV-${dateStr}-${String(currentList.length + 1).padStart(4, '0')}`;

    const newInvoiceObj = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      amount: amountNum,
      penaltyAmount: penaltyNum,
      totalAmount: totalNum,
      paymentStatus: body.paymentStatus || 'PENDING',
      dueDate: dueDateStr,
      createdAt: now.toISOString(),
      property: propertySlug,
      user: { id: body.userId || `usr-${Date.now()}`, name: tenantName, phone: body.phone || '08123456789' },
      room: { id: body.roomId || `rm-${Date.now()}`, number: roomNum, type: body.roomType || 'Standard' },
    };

    // 1. Instantly store in memory for property & default fallback
    const existingSpecific = propertyInvoicesMap.get(propertySlug) || [];
    propertyInvoicesMap.set(propertySlug, [newInvoiceObj, ...existingSpecific]);

    if (propertySlug !== 'default') {
      const existingDefault = propertyInvoicesMap.get('default') || [];
      propertyInvoicesMap.set('default', [newInvoiceObj, ...existingDefault]);
    }

    // 2. Non-blocking DB async persist if userId and roomId exist in DB
    if (body.userId && body.roomId) {
      prisma.invoice.create({
        data: {
          invoiceNumber,
          userId: body.userId,
          roomId: body.roomId,
          amount: amountNum,
          penaltyAmount: penaltyNum,
          totalAmount: totalNum,
          dueDate: new Date(dueDateStr),
        },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: newInvoiceObj }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/invoices error]', error);
    return NextResponse.json({ error: 'Gagal membuat invoice' }, { status: 500 });
  }
}

// PUT /api/invoices — update payment status (SETTLED / PENDING)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, paymentStatus, property: propertySlug = 'default' } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    propertyInvoicesMap.forEach((invList, slug) => {
      const updated = invList.map((inv) =>
        inv.id === id || inv.invoiceNumber === id ? { ...inv, paymentStatus: paymentStatus || inv.paymentStatus } : inv
      );
      propertyInvoicesMap.set(slug, updated);
    });

    const activeList = propertyInvoicesMap.get(propertySlug) || propertyInvoicesMap.get('default') || [];
    const updatedInvoice = activeList.find((inv) => inv.id === id || inv.invoiceNumber === id) || { id, paymentStatus };

    return NextResponse.json({ success: true, data: updatedInvoice });
  } catch (error) {
    console.error('[PUT /api/invoices error]', error);
    return NextResponse.json({ error: 'Gagal update invoice' }, { status: 500 });
  }
}
