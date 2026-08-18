import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const IN_MEMORY_SO_AUDITS: any[] = [
  {
    id: 'so-audit-demo-01',
    itemName: 'Galon Air Mineral 19L',
    category: 'CONSUMABLES',
    systemStock: 12,
    physicalStock: 12,
    discrepancy: 0,
    photoUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
    watermarkText: 'AUDIT-SO-RUDI-20260818-1430',
    auditedBy: 'Rudi Hartono (Staf)',
    branchId: 'default',
    notes: 'Stok galon utuh di rak gudang lantai 1.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'so-audit-demo-02',
    itemName: 'Tabung Gas LPG 3Kg',
    category: 'CONSUMABLES',
    systemStock: 2,
    physicalStock: 2,
    discrepancy: 0,
    photoUrl: null,
    watermarkText: 'AUDIT-SO-BAMBANG-20260818-1435',
    auditedBy: 'Bambang Prasetyo (Teknisi)',
    branchId: 'default',
    notes: 'Dapur bersama lantai 1 & 2 terpasang rapi.',
    createdAt: new Date().toISOString(),
  },
];

// GET /api/inventory/audit — fetch audit history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId') || searchParams.get('property') || 'all';

    let audits = [...IN_MEMORY_SO_AUDITS];

    try {
      const where: any = {};
      if (branchId && branchId !== 'all') {
        where.branchId = branchId;
      }

      const dbAudits = await prisma.stockOpnameAudit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      if (dbAudits && dbAudits.length > 0) {
        const existingIds = new Set(dbAudits.map((d) => d.id));
        audits = [...dbAudits, ...IN_MEMORY_SO_AUDITS.filter((d) => !existingIds.has(d.id))];
      }
    } catch {}

    return NextResponse.json({ data: audits, count: audits.length });
  } catch (error) {
    return NextResponse.json({ data: IN_MEMORY_SO_AUDITS, count: IN_MEMORY_SO_AUDITS.length });
  }
}

// POST /api/inventory/audit — staff submits physical count audit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      itemName,
      category = 'CONSUMABLES',
      systemStock = 0,
      physicalStock = 0,
      photoUrl,
      auditedBy = 'Staf Lapangan',
      branchId = 'default',
      notes = '',
    } = body;

    if (!itemName) {
      return NextResponse.json({ error: 'Nama item wajib diisi' }, { status: 400 });
    }

    const sys = parseInt(String(systemStock), 10);
    const phys = parseInt(String(physicalStock), 10);
    const discrepancy = phys - sys;
    const nowIso = new Date().toISOString();

    const newAudit = {
      id: `so-${Date.now()}`,
      itemName,
      category,
      systemStock: sys,
      physicalStock: phys,
      discrepancy,
      photoUrl: photoUrl || null,
      watermarkText: `SO-${auditedBy.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      auditedBy,
      branchId,
      notes,
      createdAt: nowIso,
    };

    IN_MEMORY_SO_AUDITS.unshift(newAudit);

    try {
      await prisma.stockOpnameAudit.create({
        data: {
          id: newAudit.id,
          itemName,
          category,
          systemStock: sys,
          physicalStock: phys,
          discrepancy,
          photoUrl: newAudit.photoUrl,
          watermarkText: newAudit.watermarkText,
          auditedBy,
          branchId,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, data: newAudit }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/inventory/audit error]', error);
    return NextResponse.json({ error: 'Gagal mencatat audit Stock Opname' }, { status: 500 });
  }
}
