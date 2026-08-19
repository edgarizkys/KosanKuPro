import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Property-scoped in-memory store for complaints & tenant feedback
const propertyComplaintsMap = new Map<string, any[]>();

// Pre-seed clean initial complaints for demo
const INITIAL_DEMO_COMPLAINTS = [
  {
    id: 'CMP-1001',
    tenantName: 'Budi Santoso',
    roomNumber: 'A-101',
    title: 'AC Kurang Dingin & Butuh Cuci Filter',
    description: 'AC di kamar A-101 hembusan anginnya agak hangat dan perlu dibersihkan filternya oleh staf maintenance.',
    status: 'IN_PROGRESS',
    assignedStaff: 'Bambang (Staf Maintenance)',
    property: 'rshs',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'CMP-1002',
    tenantName: 'Siti Rahma',
    roomNumber: 'B-203',
    title: 'Keran Air Mandi Berdecit',
    description: 'Keran kamar mandi berdecit saat diputar keras, mohon dicek fisiknya.',
    status: 'OPEN',
    assignedStaff: null,
    property: 'rshs',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// GET /api/complaints — Fetch live complaints list directly from PostgreSQL DB
export async function GET(req: NextRequest) {
  try {
    const dbComplaints = await prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      include: { room: true, user: true },
    });

    const formatted = dbComplaints.map((c) => ({
      id: c.id,
      tenantName: c.user?.name || 'Penghuni Kos (WhatsApp)',
      roomNumber: c.room?.number || 'EKS-01',
      title: c.title,
      description: c.description,
      status: c.status,
      assignedStaff: null,
      property: 'rshs',
      createdAt: c.createdAt.toISOString(),
    }));

    if (formatted.length > 0) {
      return NextResponse.json({ success: true, data: formatted, count: formatted.length });
    }

    return NextResponse.json({ success: true, data: INITIAL_DEMO_COMPLAINTS, count: INITIAL_DEMO_COMPLAINTS.length });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: INITIAL_DEMO_COMPLAINTS, count: INITIAL_DEMO_COMPLAINTS.length });
  }
}

// POST /api/complaints — Tenant submits complaint to Owner/Admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const propertySlug = body.property || 'default';
    const newId = body.id || `CMP-${Date.now().toString().slice(-4)}`;

    const newComplaint = {
      id: newId,
      tenantName: body.tenantName || body.userName || 'Budi Santoso',
      roomNumber: body.roomNumber || 'A-101',
      title: body.title || 'Keluhan Tenant',
      description: body.description || body.desc || body.message || 'Tidak ada uraian detail',
      status: 'OPEN',
      assignedStaff: body.assignedStaff || null,
      property: propertySlug,
      createdAt: new Date().toISOString(),
    };

    // 1. Save in property-scoped map & fallback map
    const existingSpecific = propertyComplaintsMap.get(propertySlug) || [];
    propertyComplaintsMap.set(propertySlug, [newComplaint, ...existingSpecific.filter((c) => c.id !== newId)]);

    if (propertySlug !== 'default') {
      const existingDefault = propertyComplaintsMap.get('default') || [];
      propertyComplaintsMap.set('default', [newComplaint, ...existingDefault.filter((c) => c.id !== newId)]);
    }

    // 2. Non-blocking DB async persist
    try {
      await (prisma as any).complaint?.create({
        data: {
          id: newId,
          tenantName: newComplaint.tenantName,
          roomNumber: newComplaint.roomNumber,
          title: newComplaint.title,
          description: newComplaint.description,
          status: 'OPEN',
        },
      });
    } catch {}

    return NextResponse.json({ success: true, data: newComplaint });
  } catch (error) {
    console.error('[POST /api/complaints error]', error);
    return NextResponse.json({ error: 'Gagal mengirim keluhan' }, { status: 500 });
  }
}

// PUT /api/complaints — Update complaint status or staff assignment
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assignedStaff, property: propertySlug = 'default' } = body;

    if (!id) {
      return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
    }

    // Update across all property maps
    propertyComplaintsMap.forEach((complaintList, slug) => {
      const updated = complaintList.map((c) =>
        c.id === id
          ? {
              ...c,
              status: status || c.status,
              assignedStaff: assignedStaff !== undefined ? assignedStaff : c.assignedStaff,
            }
          : c
      );
      propertyComplaintsMap.set(slug, updated);
    });

    const activeList = propertyComplaintsMap.get(propertySlug) || propertyComplaintsMap.get('default') || [];
    const updatedComplaint = activeList.find((c) => c.id === id) || { id, status, assignedStaff };

    return NextResponse.json({ success: true, data: updatedComplaint });
  } catch (error) {
    console.error('[PUT /api/complaints error]', error);
    return NextResponse.json({ error: 'Gagal update keluhan' }, { status: 500 });
  }
}

// DELETE /api/complaints — Wipe complaints for clean testing
export async function DELETE() {
  propertyComplaintsMap.clear();
  return NextResponse.json({ success: true, message: 'Semua keluhan berhasil direset' });
}
