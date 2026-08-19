import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');  // Create properties first so users and rooms can be linked cleanly
  const propRshs = await prisma.property.upsert({
    where: { id: 'prop-001' },
    update: {
      name: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
      address: 'Jl. Pasirkaliki / Pasteur No. 42 (Tepat di seberang RSHS Bandung)',
      city: 'Bandung',
    },
    create: {
      id: 'prop-001',
      name: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
      address: 'Jl. Pasirkaliki / Pasteur No. 42 (Tepat di seberang RSHS Bandung)',
      city: 'Bandung',
      mapsUrl: 'https://maps.google.com/?q=-6.8988,107.5976',
      photos: [],
      totalRooms: 8,
    },
  });

  const propItb = await prisma.property.upsert({
    where: { id: 'prop-002' },
    update: {
      name: 'KosanKu Smart Living (Dekat ITB & Unpar Dago)',
      address: 'Jl. Dago Asri No. 18 Bandung',
      city: 'Bandung',
    },
    create: {
      id: 'prop-002',
      name: 'KosanKu Smart Living (Dekat ITB & Unpar Dago)',
      address: 'Jl. Dago Asri No. 18 Bandung',
      city: 'Bandung',
      mapsUrl: 'https://maps.google.com/?q=-6.8824,107.6160',
      photos: [],
      totalRooms: 6,
    },
  });

  const propSuci = await prisma.property.upsert({
    where: { id: 'prop-003' },
    update: {
      name: 'KosanKu Pro Residence (Suci / Dipatiukur)',
      address: 'Jl. Surapati / Suci No. 88 Bandung',
      city: 'Bandung',
    },
    create: {
      id: 'prop-003',
      name: 'KosanKu Pro Residence (Suci / Dipatiukur)',
      address: 'Jl. Surapati / Suci No. 88 Bandung',
      city: 'Bandung',
      mapsUrl: 'https://maps.google.com/?q=-6.8972,107.6250',
      photos: [],
      totalRooms: 6,
    },
  });

  console.log(`✅ Properties: ${propRshs.name}, ${propItb.name}, ${propSuci.name}`);

  // Create Multi-Role Accounts with strict Property Linkage
  const multiRoleUsers = await Promise.all([
    // Superadmin
    prisma.user.upsert({
      where: { email: 'superadmin@kosanku.pro' },
      update: { name: 'Super Admin KosanKu', passwordHash: 'demo123', role: Role.SUPERADMIN },
      create: { name: 'Super Admin KosanKu', email: 'superadmin@kosanku.pro', phone: '081200000001', passwordHash: 'demo123', role: Role.SUPERADMIN },
    }),

    // RSHS ACCOUNTS
    prisma.user.upsert({
      where: { email: 'owner.rshs@kosanku.pro' },
      update: { name: 'Owner Juragan Kost RSHS', passwordHash: 'demo123', role: Role.OWNER, propertyId: propRshs.id },
      create: { name: 'Owner Juragan Kost RSHS', email: 'owner.rshs@kosanku.pro', phone: '081223798307', passwordHash: 'demo123', role: Role.OWNER, propertyId: propRshs.id },
    }),
    prisma.user.upsert({
      where: { email: 'dr.rizky@kosanku.pro' },
      update: { name: 'dr. Rizky Pratama, Sp.A', passwordHash: 'demo123', role: Role.TENANT, propertyId: propRshs.id },
      create: { name: 'dr. Rizky Pratama, Sp.A', email: 'dr.rizky@kosanku.pro', phone: '081388776655', passwordHash: 'demo123', role: Role.TENANT, propertyId: propRshs.id },
    }),
    prisma.user.upsert({
      where: { email: 'staf.rshs@kosanku.pro' },
      update: { name: 'Bambang Prasetyo (Staf RSHS)', passwordHash: 'demo123', role: Role.EMPLOYEE, propertyId: propRshs.id },
      create: { name: 'Bambang Prasetyo (Staf RSHS)', email: 'staf.rshs@kosanku.pro', phone: '081355443322', passwordHash: 'demo123', role: Role.EMPLOYEE, propertyId: propRshs.id },
    }),
    prisma.user.upsert({
      where: { email: 'vendor.rshs@kosanku.pro' },
      update: { name: 'Depot Air & Gas Pasteur RSHS', passwordHash: 'demo123', role: Role.VENDOR, propertyId: propRshs.id },
      create: { name: 'Depot Air & Gas Pasteur RSHS', email: 'vendor.rshs@kosanku.pro', phone: '081299887711', passwordHash: 'demo123', role: Role.VENDOR, propertyId: propRshs.id },
    }),

    // ITB ACCOUNTS
    prisma.user.upsert({
      where: { email: 'owner@kosanku.pro' },
      update: { name: 'Ibu Dewi Tri Oktariani (Owner ITB)', passwordHash: 'demo123', role: Role.OWNER, propertyId: propItb.id },
      create: { name: 'Ibu Dewi Tri Oktariani (Owner ITB)', email: 'owner@kosanku.pro', phone: '081199887766', passwordHash: 'demo123', role: Role.OWNER, propertyId: propItb.id },
    }),
    prisma.user.upsert({
      where: { email: 'tenant@kosanku.pro' },
      update: { name: 'Rian Pratama (Mahasiswa ITB)', passwordHash: 'demo123', role: Role.TENANT, propertyId: propItb.id },
      create: { name: 'Rian Pratama (Mahasiswa ITB)', email: 'tenant@kosanku.pro', phone: '081566778899', passwordHash: 'demo123', role: Role.TENANT, propertyId: propItb.id },
    }),
    prisma.user.upsert({
      where: { email: 'staf.itb@kosanku.pro' },
      update: { name: 'Rudi Hartono (Staf Dago ITB)', passwordHash: 'demo123', role: Role.EMPLOYEE, propertyId: propItb.id },
      create: { name: 'Rudi Hartono (Staf Dago ITB)', email: 'staf.itb@kosanku.pro', phone: '081399881122', passwordHash: 'demo123', role: Role.EMPLOYEE, propertyId: propItb.id },
    }),
  ]);
  console.log(`✅ Multi-Role Accounts: ${multiRoleUsers.map((u) => u.email).join(', ')}`);

  const tenantRshs = multiRoleUsers[2];

  // Create rooms from Real RSHS Data
  const roomData = [
    { number: 'NYM-01', type: 'Nyaman 1', price: 1000000, floor: 1, facilities: ['Kipas Angin', 'Kasur Single Comfort', 'Free Laundry 5kg/bln', 'Dapur Bersama', 'WiFi', 'CCTV 24 Jam'], imageUrl: '/images/rshs/Nyaman/1.png' },
    { number: 'NYM-02', type: 'Nyaman 2', price: 1400000, floor: 2, facilities: ['Kasur Comfort', 'Lemari & Meja Kerja', 'Kamar Mandi Dalam', 'Shower & Closet Duduk', 'Free Laundry 5kg', 'WiFi'], imageUrl: '/images/rshs/Nyaman%202/1.png' },
    { number: 'NYM-03', type: 'Nyaman 3', price: 1300000, floor: 2, facilities: ['Kasur Single Comfort', 'Meja Belajar', 'Kamar Mandi Dalam', 'Water Heater (Air Hangat)', 'Free Laundry 5kg', 'WiFi'], imageUrl: '/images/rshs/Nyaman%203/1.png' },
    { number: 'NYM-04', type: 'Nyaman 4', price: 1400000, floor: 3, facilities: ['Kasur Nyaman Max 2 Org', 'Kamar Mandi Dalam', 'Dapur Bersama', 'Ruang Terbuka Bersama', 'Free Laundry 5kg', 'Free Trial Oxy Gym'], imageUrl: '/images/rshs/Nyaman%204/1.png' },
    { number: 'SN-01', type: 'Super Nyaman', price: 1700000, floor: 2, facilities: ['Queen Comfort Bed', 'Kamar Mandi Dalam', 'Water Heater (Air Hangat)', 'Meja Kerja', 'Free Laundry 5kg', 'WiFi Kencang'], imageUrl: '/images/rshs/Super%20Nyaman/1.png' },
    { number: 'EKS-01', type: 'Eksekutif (Dokter/Koas RSHS)', price: 1500000, floor: 1, facilities: ['Kasur Comfort Max 2 Org', 'Kipas Angin', 'Kamar Mandi Dalam', 'Mini Gym & CCTV', 'Free Laundry 5kg/bln', 'Dapur Bersama'], imageUrl: '/images/rshs/Eksekutif/1.png' },
    { number: 'PV-01', type: 'Paviliun Eksekutif', price: 2800000, floor: 1, facilities: ['King Bed Comfort + Ruang Tamu', 'Kamar Mandi Dalam Luas', 'Dapur Privat', 'Free Laundry 10kg/bln', 'Akses Privat', 'WiFi & CCTV'], imageUrl: '/images/rshs/Paviliun%20Eksekutif/1.png' },
    { number: 'PV-02', type: 'Paviliun Tipe B', price: 2600000, floor: 1, facilities: ['1 Kasur 160x200 + 2 Kasur Single', 'Kamar Mandi Dalam', 'Kompor Gas & Tabung Gas', 'Free Laundry 10kg', 'Listrik Termasuk'], imageUrl: '/images/rshs/Paviliun%20Tipe%20B/1.jpg' },
  ];

  const rooms = [];
  for (const rd of roomData) {
    const room = await prisma.room.upsert({
      where: { number: rd.number },
      update: { type: rd.type, price: rd.price, imageUrl: rd.imageUrl, facilities: rd.facilities, propertyId: propRshs.id },
      create: { ...rd, propertyId: propRshs.id },
    });
    rooms.push(room);
  }
  console.log(`✅ Rooms: ${rooms.length} created for RSHS`);

  // Assign tenants to rooms
  await prisma.room.update({ where: { number: 'EKS-01' }, data: { status: 'OCCUPIED', tenantId: tenantRshs.id } });
  await prisma.room.update({ where: { number: 'NYM-01' }, data: { status: 'OCCUPIED', tenantId: tenantRshs.id } });
  await prisma.room.update({ where: { number: 'NYM-03' }, data: { status: 'OCCUPIED', tenantId: tenantRshs.id } });
  console.log('✅ Room assignments done');

  // Create FAQ entries
  const faqs = [
    { question: 'Jam berapa check-in?', answer: 'Check-in mulai pukul 14:00 WIB. Early check-in bisa diminta H-1 (tergantung ketersediaan).', category: 'check_in' },
    { question: 'Jam berapa check-out?', answer: 'Check-out maksimal pukul 12:00 WIB. Late check-out dikenakan biaya 50% per malam.', category: 'jam_operasional' },
    { question: 'Apakah ada parkir?', answer: 'Ya, tersedia parkir motor gratis dan parkir mobil dengan biaya Rp 200.000/bulan.', category: 'parkir' },
    { question: 'Bagaimana cara pembayaran?', answer: 'Pembayaran via Midtrans (QRIS, VA, kartu kredit) atau transfer manual. Jatuh tempo setiap tanggal 1.', category: 'pembayaran' },
    { question: 'Apakah boleh bawa hewan peliharaan?', answer: 'Maaf, hewan peliharaan tidak diperkenankan demi kenyamanan bersama.', category: 'lain_lain' },
    { question: 'Fasilitas apa saja yang termasuk?', answer: 'Semua kamar include AC, WiFi 100Mbps, kamar mandi dalam, dan akses area bersama (dapur, laundry, rooftop).', category: 'lain_lain' },
  ];

  for (const faq of faqs) {
    await prisma.faqEntry.create({ data: { ...faq, propertyId: propRshs.id } });
  }
  console.log(`✅ FAQ: ${faqs.length} entries`);

  // Create sample expenses
  const expenses = [
    { category: 'listrik', amount: 4200000, description: 'Token PLN Juli 2026', propertyId: propRshs.id },
    { category: 'air', amount: 850000, description: 'PDAM Juli 2026', propertyId: propRshs.id },
    { category: 'internet', amount: 1200000, description: 'IndiHome 100Mbps Juli', propertyId: propRshs.id },
    { category: 'perbaikan', amount: 350000, description: 'Ganti kran kamar NYM-02', propertyId: propRshs.id },
    { category: 'lain_lain', amount: 500000, description: 'Kebersihan & sampah Juli', propertyId: propRshs.id },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }
  console.log(`✅ Expenses: ${expenses.length} entries`);

  // Create sample invoices
  const roomEks01 = rooms.find((r) => r.number === 'EKS-01') || rooms[0];
  const roomNym01 = rooms.find((r) => r.number === 'NYM-01') || rooms[1];
  const roomNym03 = rooms.find((r) => r.number === 'NYM-03') || rooms[2];

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-20260701-0001' },
    update: {},
    create: {
      invoiceNumber: 'INV-20260701-0001',
      userId: tenantRshs.id,
      roomId: roomEks01.id,
      amount: 1500000,
      penaltyAmount: 0,
      totalAmount: 1500000,
      dueDate: new Date('2026-07-28'),
      paymentStatus: 'PENDING',
    },
  });
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-20260601-0001' },
    update: {},
    create: {
      invoiceNumber: 'INV-20260601-0001',
      userId: tenantRshs.id,
      roomId: roomNym01.id,
      amount: 1000000,
      penaltyAmount: 0,
      totalAmount: 1000000,
      dueDate: new Date('2026-06-28'),
      paymentStatus: 'SETTLED',
      settledAt: new Date('2026-06-25'),
    },
  });
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-20260602-0001' },
    update: {},
    create: {
      invoiceNumber: 'INV-20260602-0001',
      userId: tenantRshs.id,
      roomId: roomNym03.id,
      amount: 1300000,
      penaltyAmount: 0,
      totalAmount: 1300000,
      dueDate: new Date('2026-06-28'),
      paymentStatus: 'SETTLED',
      settledAt: new Date('2026-06-27'),
    },
  });
  console.log('✅ Invoices: 3 created');

  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
