import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/staff-schedule?staff=Bambang&week=2026-08-19&propertyId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const staffPhone = searchParams.get('phone');
  const staffName = searchParams.get('staff');
  const weekStr = searchParams.get('week'); // ISO date of Monday
  const propertyId = searchParams.get('propertyId');

  // Compute start/end of week
  const weekStart = weekStr ? new Date(weekStr) : (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff); d.setHours(0, 0, 0, 0); return d;
  })();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  try {
    const where: any = { weekDate: { gte: weekStart, lt: weekEnd } };
    if (staffPhone) where.staffPhone = staffPhone;
    if (staffName) where.staffName = { contains: staffName, mode: 'insensitive' };
    if (propertyId) where.propertyId = propertyId;

    const schedules = await safeDbQuery(
      () => (prisma as any).staffSchedule.findMany({ where, orderBy: { dayOfWeek: 'asc' } }),
      []
    );

    // If no data yet → return default 7-day template
    if (!schedules || schedules.length === 0) {
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const defaultSchedule = days.map((day, i) => ({
        id: `default-${i}`,
        dayOfWeek: i + 1,
        dayName: day,
        shift: i === 4 ? 'LIBUR' : i % 2 === 0 ? 'PAGI' : 'SORE',
        startTime: i === 4 ? '—' : i % 2 === 0 ? '07:00' : '13:00',
        endTime: i === 4 ? '—' : i % 2 === 0 ? '15:00' : '21:00',
        tasks: i === 4 ? ['Hari libur'] : ['Bersih-bersih area umum', 'Cek stok & laporan harian'],
        status: i < 3 ? 'SELESAI' : i === 3 ? 'PROSES' : 'RENCANA',
        staffName: staffName || 'Staf Lapangan',
      }));
      return NextResponse.json({ success: true, data: defaultSchedule, isDefault: true });
    }

    return NextResponse.json({ success: true, data: schedules });
  } catch (error: any) {
    console.error('[GET /api/staff-schedule]', error);
    return NextResponse.json({ error: 'Gagal memuat jadwal' }, { status: 500 });
  }
}

// POST /api/staff-schedule — create or upsert schedule entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { staffName, staffPhone, propertyId, dayOfWeek, weekDate, shift, startTime, endTime, tasks, status, notes } = body;

    if (!staffName || dayOfWeek === undefined || !weekDate) {
      return NextResponse.json({ error: 'staffName, dayOfWeek, weekDate wajib diisi' }, { status: 400 });
    }

    const weekStart = new Date(weekDate);
    weekStart.setHours(0, 0, 0, 0);

    const schedule = await (prisma as any).staffSchedule.create({
      data: {
        staffName,
        staffPhone: staffPhone || null,
        propertyId: propertyId || null,
        dayOfWeek: Number(dayOfWeek),
        weekDate: weekStart,
        shift: shift || 'PAGI',
        startTime: startTime || '07:00',
        endTime: endTime || '15:00',
        tasks: tasks || [],
        status: status || 'RENCANA',
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/staff-schedule]', error);
    return NextResponse.json({ error: 'Gagal menyimpan jadwal' }, { status: 500 });
  }
}

// PUT /api/staff-schedule — update status sebuah jadwal
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

    const updated = await (prisma as any).staffSchedule.update({
      where: { id },
      data: { status, notes },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal update jadwal' }, { status: 500 });
  }
}
