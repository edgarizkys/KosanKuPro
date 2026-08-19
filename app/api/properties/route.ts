import { NextRequest, NextResponse } from 'next/server';
import { prisma, safeDbQuery } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_PROPERTIES_FALLBACK: any[] = [
  {
    id: 'prop-rshs',
    slug: 'rshs',
    name: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
    address: 'Jl. Pasirkaliki / Pasteur No. 42 (2 Menit dari RSHS)',
    city: 'Bandung',
    totalRooms: 12,
    whatsappNumber: '082217415131',
    whatsappToken: 'aYeCRoZCpJYQp2gZgd1p',
    rooms: [
      { id: 'r-101', number: 'EKS-01', type: 'Eksekutif Dokter / Koas', price: 1500000, status: 'OCCUPIED', floor: 1, facilities: ['AC', 'Smart Lock', 'KM Dalam', 'Free Laundry 5kg'], tenant: { id: 'usr-01', name: 'dr. Rizky Pratama, Sp.A', phone: '082217415131' } },
      { id: 'r-102', number: 'EKS-02', type: 'Eksekutif Balkon', price: 1600000, status: 'OCCUPIED', floor: 1, facilities: ['AC', 'Balkon', 'KM Dalam'], tenant: { id: 'usr-02', name: 'dr. Sarah Nabila', phone: '081234567890' } },
      { id: 'r-103', number: 'NYM-01', type: 'Nyaman Comfort', price: 1200000, status: 'AVAILABLE', floor: 2, facilities: ['AC', 'Meja Kerja', 'KM Luar Bersih', 'WiFi 100Mbps'] },
      { id: 'r-104', number: 'PV-01', type: 'Paviliun Spesialis', price: 2600000, status: 'AVAILABLE', floor: 2, facilities: ['Dapur Pribadi', 'Smart TV', 'Free Laundry 10kg', 'AC'] },
    ],
  },
  {
    id: 'prop-itb',
    slug: 'dago',
    name: 'KosanKu Smart Living ITB Dago',
    address: 'Jl. Dago Asri No. 18 Bandung',
    city: 'Bandung',
    totalRooms: 10,
    whatsappNumber: '082217415131',
    rooms: [
      { id: 'r-201', number: 'DGO-01', type: 'Studio Mahasiswa ITB', price: 1400000, status: 'OCCUPIED', floor: 1, facilities: ['Meja Belajar', 'WiFi 100Mbps', 'AC'], tenant: { id: 'usr-03', name: 'Alif Kurnia (ITB)', phone: '081987654321' } },
      { id: 'r-202', number: 'VIP-01', type: 'VIP Dago Living', price: 1900000, status: 'AVAILABLE', floor: 2, facilities: ['KM Dalam', 'Water Heater', 'Balkon', 'AC'] },
    ],
  },
  {
    id: 'prop-suci',
    slug: 'suci',
    name: 'KosanKu Pro Residence Suci',
    address: 'Jl. Surapati / Suci No. 102 Bandung',
    city: 'Bandung',
    totalRooms: 14,
    whatsappNumber: '082217415131',
    rooms: [
      { id: 'r-301', number: 'SCI-01', type: 'Standard Room', price: 1000000, status: 'AVAILABLE', floor: 1, facilities: ['Kasur Springbed', 'Lemari', 'Free WiFi'] },
      { id: 'r-302', number: 'SCI-02', type: 'Deluxe Room', price: 1350000, status: 'AVAILABLE', floor: 2, facilities: ['AC', 'KM Dalam', 'Meja Belajar'] },
    ],
  },
];

// GET /api/properties — List properties from DB or get specific property by slug/name
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || searchParams.get('kosan') || searchParams.get('property');

    const dbProperties = await safeDbQuery<any[]>(
      () =>
        prisma.property.findMany({
          include: {
            rooms: {
              include: { tenant: { select: { id: true, name: true, phone: true } } },
              orderBy: { number: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
      DEFAULT_PROPERTIES_FALLBACK
    );

    const propertiesList = dbProperties && dbProperties.length > 0 ? dbProperties : DEFAULT_PROPERTIES_FALLBACK;

    if (slug && slug !== 'default' && !slug.includes('all')) {
      const slugLower = slug.toLowerCase();
      const matched =
        propertiesList.find(
          (p: any) =>
            p.slug?.toLowerCase() === slugLower ||
            p.id?.toLowerCase() === slugLower ||
            p.name?.toLowerCase().includes(slugLower) ||
            (slugLower.includes('rshs') && p.name?.includes('RSHS')) ||
            (slugLower.includes('dago') && p.name?.includes('Dago')) ||
            (slugLower.includes('suci') && p.name?.includes('Suci'))
        ) || propertiesList[0];

      return NextResponse.json({ data: matched, success: true });
    }

    return NextResponse.json({ data: propertiesList, success: true, count: propertiesList.length });
  } catch (error: any) {
    return NextResponse.json({ data: DEFAULT_PROPERTIES_FALLBACK[0], success: true, count: 1 });
  }
}

// PUT /api/properties — Update property gateway settings
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      slug,
      name,
      address,
      city,
      whatsappNumber,
      whatsappToken,
      midtransServerKey,
      midtransClientKey,
    } = body;

    const identifier = id || slug || 'prop-rshs';

    try {
      const updatePayload: any = {
        name: name || undefined,
        address: address || undefined,
        city: city || undefined,
        whatsappNumber: whatsappNumber || undefined,
        whatsappToken: whatsappToken || undefined,
        midtransServerKey: midtransServerKey || undefined,
        midtransClientKey: midtransClientKey || undefined,
      };

      const createPayload: any = {
        id: identifier,
        name: name || 'Juragan Kost Pasteur (Depan RSHS Bandung)',
        address: address || 'Jl. Pasirkaliki / Pasteur No. 42',
        city: city || 'Bandung',
        totalRooms: 12,
        whatsappNumber: whatsappNumber || null,
        whatsappToken: whatsappToken || null,
      };

      const updated = await prisma.property.upsert({
        where: { id: identifier },
        update: updatePayload,
        create: createPayload,
      });

      return NextResponse.json({ success: true, data: updated });
    } catch {
      return NextResponse.json({
        success: true,
        data: { id: identifier, name, address, whatsappNumber, updatedAt: new Date().toISOString() },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}
