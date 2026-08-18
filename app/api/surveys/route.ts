import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const IN_MEMORY_SURVEYS: any[] = [
  {
    id: 'srv-demo-01',
    propertyId: 'prop-001',
    propertyName: 'KosanKu Premium Residence (Sukajadi)',
    roomId: 'rm-1',
    roomNumber: 'A-101',
    prospectName: 'Dimas Anggara',
    prospectPhone: '0812-9988-1122',
    prospectEmail: 'dimas.a@gmail.com',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    surveyType: 'ONSITE',
    status: 'CONFIRMED',
    notes: 'Mau lihat kamar lantai 1 sore hari jam 16:00',
    handledBy: 'Bambang (Staf)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'srv-demo-02',
    propertyId: 'prop-002',
    propertyName: 'KosanKu Pasteur Medico (RSHS)',
    roomId: 'rm-eks-01',
    roomNumber: 'EKS-01',
    prospectName: 'dr. Farhan Syah',
    prospectPhone: '0813-4455-6677',
    prospectEmail: 'farhan.med@gmail.com',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    surveyType: 'VIDEO_CALL',
    status: 'PENDING',
    notes: 'Video tour via WhatsApp untuk dokter residen',
    handledBy: null,
    createdAt: new Date().toISOString(),
  },
];

// GET /api/surveys — list surveys with optional property & status filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId') || searchParams.get('property');
    const status = searchParams.get('status');

    let surveys = [...IN_MEMORY_SURVEYS];

    try {
      const where: any = {};
      if (propertyId && propertyId !== 'all') {
        where.propertyId = propertyId;
      }
      if (status && status !== 'ALL') {
        where.status = status.toUpperCase();
      }

      const dbSurveys = await prisma.surveySchedule.findMany({
        where,
        include: {
          property: { select: { id: true, name: true, city: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      if (dbSurveys && dbSurveys.length > 0) {
        const mapped = dbSurveys.map((s) => ({
          id: s.id,
          propertyId: s.propertyId,
          propertyName: s.property?.name || 'KosanKu Pro',
          roomId: s.roomId,
          prospectName: s.prospectName,
          prospectPhone: s.prospectPhone,
          prospectEmail: s.prospectEmail,
          scheduledAt: s.scheduledAt.toISOString(),
          surveyType: s.surveyType,
          status: s.status,
          notes: s.notes,
          handledBy: s.handledBy,
          createdAt: s.createdAt.toISOString(),
        }));

        const existingIds = new Set(mapped.map((m) => m.id));
        surveys = [...mapped, ...IN_MEMORY_SURVEYS.filter((d) => !existingIds.has(d.id))];
      }
    } catch {}

    if (status && status !== 'ALL') {
      surveys = surveys.filter((s) => s.status?.toUpperCase() === status.toUpperCase());
    }

    return NextResponse.json({ data: surveys, count: surveys.length });
  } catch (error) {
    console.error('[GET /api/surveys error]', error);
    return NextResponse.json({ data: IN_MEMORY_SURVEYS, count: IN_MEMORY_SURVEYS.length });
  }
}

// POST /api/surveys — create a new survey appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      propertyId = 'prop-001',
      propertyName = 'KosanKu Residence',
      roomId,
      roomNumber,
      prospectName,
      prospectPhone,
      prospectEmail,
      scheduledAt,
      surveyType = 'ONSITE',
      notes,
    } = body;

    if (!prospectName || !prospectPhone || !scheduledAt) {
      return NextResponse.json(
        { error: 'Nama, No. WhatsApp, dan Tanggal/Waktu survei wajib diisi' },
        { status: 400 }
      );
    }

    const newSurvey = {
      id: `srv-${Date.now()}`,
      propertyId,
      propertyName,
      roomId: roomId || null,
      roomNumber: roomNumber || null,
      prospectName,
      prospectPhone,
      prospectEmail: prospectEmail || null,
      scheduledAt: new Date(scheduledAt).toISOString(),
      surveyType: surveyType.toUpperCase(),
      status: 'PENDING',
      notes: notes || '',
      handledBy: null,
      createdAt: new Date().toISOString(),
    };

    IN_MEMORY_SURVEYS.unshift(newSurvey);

    try {
      await prisma.surveySchedule.create({
        data: {
          propertyId,
          roomId: roomId || null,
          prospectName,
          prospectPhone,
          prospectEmail: prospectEmail || null,
          scheduledAt: new Date(scheduledAt),
          surveyType: surveyType.toUpperCase(),
          notes: notes || null,
          status: 'PENDING',
        },
      });
    } catch {}

    return NextResponse.json({ success: true, data: newSurvey }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/surveys error]', error);
    return NextResponse.json({ error: 'Gagal menjadwalkan survei' }, { status: 500 });
  }
}

// PUT /api/surveys — update survey status (CONFIRMED, DONE, CANCELLED)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, handledBy, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID dan status wajib disertakan' }, { status: 400 });
    }

    const idx = IN_MEMORY_SURVEYS.findIndex((s) => s.id === id);
    if (idx !== -1) {
      IN_MEMORY_SURVEYS[idx] = {
        ...IN_MEMORY_SURVEYS[idx],
        status: status.toUpperCase(),
        handledBy: handledBy !== undefined ? handledBy : IN_MEMORY_SURVEYS[idx].handledBy,
        notes: notes !== undefined ? notes : IN_MEMORY_SURVEYS[idx].notes,
      };
    }

    try {
      await prisma.surveySchedule.update({
        where: { id },
        data: {
          status: status.toUpperCase(),
          handledBy: handledBy || undefined,
          notes: notes || undefined,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: `Status survei diperbarui menjadi ${status}` });
  } catch (error) {
    console.error('[PUT /api/surveys error]', error);
    return NextResponse.json({ error: 'Gagal memperbarui status survei' }, { status: 500 });
  }
}
