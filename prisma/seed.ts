import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Multi-Role Demo Accounts
  const multiRoleUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'superadmin@kosanku.pro' },
      update: { name: 'Super Admin KosanKu', passwordHash: 'demo123', role: Role.SUPERADMIN },
      create: { name: 'Super Admin KosanKu', email: 'superadmin@kosanku.pro', phone: '081200000001', passwordHash: 'demo123', role: Role.SUPERADMIN },
    }),
    prisma.user.upsert({
      where: { email: 'owner@kosanku.pro' },
      update: { name: 'Ibu Dewi Tri Oktariani', passwordHash: 'demo123', role: Role.OWNER },
      create: { name: 'Ibu Dewi Tri Oktariani', email: 'owner@kosanku.pro', phone: '081199887766', passwordHash: 'demo123', role: Role.OWNER },
    }),
    prisma.user.upsert({
      where: { email: 'owner@kosanku.com' },
      update: { name: 'Ibu Dewi Tri Oktariani', passwordHash: 'demo123', role: Role.OWNER },
      create: { name: 'Ibu Dewi Tri Oktariani', email: 'owner@kosanku.com', phone: '081199887766', passwordHash: 'demo123', role: Role.OWNER },
    }),
    prisma.user.upsert({
      where: { email: 'admin@kosanku.pro' },
      update: { name: 'Pak Admin Operasional (Siti)', passwordHash: 'demo123', role: Role.ADMIN },
      create: { name: 'Pak Admin Operasional (Siti)', email: 'admin@kosanku.pro', phone: '081234567890', passwordHash: 'demo123', role: Role.ADMIN },
    }),
    prisma.user.upsert({
      where: { email: 'admin2@kosanku.pro' },
      update: { name: 'Rina (Admin Keuangan)', passwordHash: 'demo123', role: Role.ADMIN },
      create: { name: 'Rina (Admin Keuangan)', email: 'admin2@kosanku.pro', phone: '081299883344', passwordHash: 'demo123', role: Role.ADMIN },
    }),
    prisma.user.upsert({
      where: { email: 'staf@kosanku.pro' },
      update: { name: 'Bambang Prasetyo (Teknisi)', passwordHash: 'demo123', role: Role.EMPLOYEE },
      create: { name: 'Bambang Prasetyo (Teknisi)', email: 'staf@kosanku.pro', phone: '081355443322', passwordHash: 'demo123', role: Role.EMPLOYEE },
    }),
    prisma.user.upsert({
      where: { email: 'staf.kebersihan@kosanku.pro' },
      update: { name: 'Rudi Hartono (Kebersihan)', passwordHash: 'demo123', role: Role.EMPLOYEE },
      create: { name: 'Rudi Hartono (Kebersihan)', email: 'staf.kebersihan@kosanku.pro', phone: '081399881122', passwordHash: 'demo123', role: Role.EMPLOYEE },
    }),
    prisma.user.upsert({
      where: { email: 'vendor.galon@kosanku.pro' },
      update: { name: 'Depot Air & Gas Suci', passwordHash: 'demo123', role: Role.VENDOR },
      create: { name: 'Depot Air & Gas Suci', email: 'vendor.galon@kosanku.pro', phone: '081299887711', passwordHash: 'demo123', role: Role.VENDOR },
    }),
    prisma.user.upsert({
      where: { email: 'vendor.laundry@kosanku.pro' },
      update: { name: 'Laundry Express Clean', passwordHash: 'demo123', role: Role.VENDOR },
      create: { name: 'Laundry Express Clean', email: 'vendor.laundry@kosanku.pro', phone: '081388776655', passwordHash: 'demo123', role: Role.VENDOR },
    }),
    prisma.user.upsert({
      where: { email: 'vendor.teknik@kosanku.pro' },
      update: { name: 'Toko Bangunan & Teknik Subur', passwordHash: 'demo123', role: Role.VENDOR },
      create: { name: 'Toko Bangunan & Teknik Subur', email: 'vendor.teknik@kosanku.pro', phone: '081511223344', passwordHash: 'demo123', role: Role.VENDOR },
    }),
    prisma.user.upsert({
      where: { email: 'tenant@kosanku.pro' },
      update: { name: 'Rian Pratama (Penghuni A-101)', passwordHash: 'demo123', role: Role.TENANT },
      create: { name: 'Rian Pratama (Penghuni A-101)', email: 'tenant@kosanku.pro', phone: '081566778899', passwordHash: 'demo123', role: Role.TENANT },
    }),
    prisma.user.upsert({
      where: { email: 'tenant2@kosanku.pro' },
      update: { name: 'Siti Rahma (Penghuni B-201)', passwordHash: 'demo123', role: Role.TENANT },
      create: { name: 'Siti Rahma (Penghuni B-201)', email: 'tenant2@kosanku.pro', phone: '081233445566', passwordHash: 'demo123', role: Role.TENANT },
    }),
    prisma.user.upsert({
      where: { email: 'tenant3@kosanku.pro' },
      update: { name: 'Budi Santoso (Penghuni C-302)', passwordHash: 'demo123', role: Role.TENANT },
      create: { name: 'Budi Santoso (Penghuni C-302)', email: 'tenant3@kosanku.pro', phone: '081377889900', passwordHash: 'demo123', role: Role.TENANT },
    }),
  ]);
  console.log(`✅ Multi-Role Accounts: ${multiRoleUsers.map((u) => u.email).join(', ')} (password: demo123)`);

  const tenants = [multiRoleUsers[6]];

  // Create property
  const property = await prisma.property.upsert({
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
      totalRooms: 12,
    },
  });
  console.log(`✅ Property: ${property.name}`);

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
      update: { type: rd.type, price: rd.price, imageUrl: rd.imageUrl, facilities: rd.facilities },
      create: { ...rd, propertyId: property.id },
    });
    rooms.push(room);
  }
  console.log(`✅ Rooms: ${rooms.length} created`);

  // Assign tenants to rooms
  await prisma.room.update({ where: { number: 'EKS-01' }, data: { status: 'OCCUPIED', tenantId: tenants[0].id } });
  await prisma.room.update({ where: { number: 'NYM-01' }, data: { status: 'OCCUPIED', tenantId: tenants[0].id } });
  await prisma.room.update({ where: { number: 'NYM-03' }, data: { status: 'OCCUPIED', tenantId: tenants[0].id } });
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
    await prisma.faqEntry.create({ data: { ...faq, propertyId: property.id } });
  }
  console.log(`✅ FAQ: ${faqs.length} entries`);

  // Create sample expenses
  const expenses = [
    { category: 'listrik', amount: 4200000, description: 'Token PLN Juli 2026' },
    { category: 'air', amount: 850000, description: 'PDAM Juli 2026' },
    { category: 'internet', amount: 1200000, description: 'IndiHome 100Mbps Juli' },
    { category: 'perbaikan', amount: 350000, description: 'Ganti kran kamar B-202' },
    { category: 'lain_lain', amount: 500000, description: 'Kebersihan & sampah Juli' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({ data: exp });
  }
  console.log(`✅ Expenses: ${expenses.length} entries`);

  // Create sample invoices
  const roomA101 = rooms.find((r) => r.number === 'A-101')!;
  const roomB201 = rooms.find((r) => r.number === 'B-201')!;
  const roomC302 = rooms.find((r) => r.number === 'C-302')!;

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-20260701-0001' },
    update: {},
    create: {
      invoiceNumber: 'INV-20260701-0001',
      userId: tenants[0].id,
      roomId: roomA101.id,
      amount: 1500000,
      penaltyAmount: 0,
      totalAmount: 1604500,
      dueDate: new Date('2026-07-28'),
      paymentStatus: 'PENDING',
    },
  });
  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-20260601-0001' },
    update: {},
    create: {
      invoiceNumber: 'INV-20260601-0001',
      userId: tenants[0].id,
      roomId: roomB201.id,
      amount: 2000000,
      penaltyAmount: 0,
      totalAmount: 2000000,
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
      userId: tenants[0].id,
      roomId: roomC302.id,
      amount: 1200000,
      penaltyAmount: 0,
      totalAmount: 1200000,
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
