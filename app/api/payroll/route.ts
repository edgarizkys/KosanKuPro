import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/payroll?staff=Bambang&month=8&year=2026&phone=08xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const staffPhone = searchParams.get('phone');
  const staffName = searchParams.get('staff');
  const month = searchParams.get('month') ? Number(searchParams.get('month')) : new Date().getMonth() + 1;
  const year = searchParams.get('year') ? Number(searchParams.get('year')) : new Date().getFullYear();
  const propertyId = searchParams.get('propertyId');

  try {
    const where: any = { month, year };
    if (staffPhone) where.staffPhone = staffPhone;
    if (staffName) where.staffName = { contains: staffName, mode: 'insensitive' };
    if (propertyId) where.propertyId = propertyId;

    const payroll = await safeDbQuery(
      () => (prisma as any).payroll.findFirst({ where, orderBy: { createdAt: 'desc' } }),
      null
    );

    if (!payroll) {
      // Return default/estimated payslip if not yet issued
      const baseGaji = 2500000;
      const tunjangan = 350000;
      const uangMakan = 600000;
      const bonus = 150000;
      const potongan = 125000;
      const totalBruto = baseGaji + tunjangan + uangMakan + bonus;
      const totalNeto = totalBruto - potongan;
      return NextResponse.json({
        success: true,
        data: {
          id: 'estimate',
          staffName: staffName || 'Staf Lapangan',
          staffPhone: staffPhone || null,
          month, year,
          baseGaji, tunjangan, uangMakan,
          bonus, bonusNote: 'Bonus kinerja Stock Opname',
          potongan, potonganNote: 'BPJS Ketenagakerjaan',
          totalBruto, totalNeto,
          bankName: 'BCA', bankAccount: '***8821',
          isPaid: false,
          paymentDate: null,
          payslipNotes: 'Estimasi — belum diterbitkan oleh Owner',
        },
        isEstimate: true,
      });
    }

    return NextResponse.json({ success: true, data: payroll });
  } catch (error: any) {
    console.error('[GET /api/payroll]', error);
    return NextResponse.json({ error: 'Gagal memuat data payroll' }, { status: 500 });
  }
}

// POST /api/payroll — owner menerbitkan slip gaji
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      staffName, staffPhone, propertyId, month, year,
      baseGaji = 2500000, tunjangan = 350000, uangMakan = 600000,
      bonus = 0, bonusNote, potongan = 125000, potonganNote,
      bankName, bankAccount, payslipNotes,
    } = body;

    if (!staffName || !month || !year) {
      return NextResponse.json({ error: 'staffName, month, year wajib' }, { status: 400 });
    }

    const totalBruto = baseGaji + tunjangan + uangMakan + bonus;
    const totalNeto = totalBruto - potongan;

    const payroll = await (prisma as any).payroll.upsert({
      where: { staffPhone_month_year: { staffPhone: staffPhone || '', month, year } },
      create: {
        staffName, staffPhone, propertyId, month, year,
        baseGaji, tunjangan, uangMakan, bonus, bonusNote,
        potongan, potonganNote, totalBruto, totalNeto,
        bankName, bankAccount, payslipNotes, isPaid: true,
        paymentDate: new Date(),
      },
      update: {
        baseGaji, tunjangan, uangMakan, bonus, bonusNote,
        potongan, potonganNote, totalBruto, totalNeto,
        bankName, bankAccount, payslipNotes, isPaid: true,
        paymentDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: payroll }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/payroll]', error);
    return NextResponse.json({ error: 'Gagal menerbitkan payroll' }, { status: 500 });
  }
}
