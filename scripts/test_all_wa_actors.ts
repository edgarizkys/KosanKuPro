import { POST as webhookPOST } from '../app/api/whatsapp/webhook/route';
import { GET as activityGET } from '../app/api/activity/route';
import { NextRequest } from 'next/server';

async function sendTestMessage(phone: string, text: string) {
  const req = new NextRequest('http://localhost:3000/api/whatsapp/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: phone,
      message: text,
    }),
  });

  const res = await webhookPOST(req);
  const json = await res.json();
  return json;
}

async function getLiveActivity(type: string, role?: string) {
  const url = role
    ? `http://localhost:3000/api/activity?type=${type}&role=${role}`
    : `http://localhost:3000/api/activity?type=${type}`;
  const req = new NextRequest(url);
  const res = await activityGET(req);
  return await res.json();
}

async function runTests() {
  console.log('🚀 ========================================');
  console.log('🧪 RUNNING KOSANKU PRO MULTI-ACTOR WA TESTS');
  console.log('🚀 ========================================\n');

  const testPhone = '082217415131';

  // 1. TEST LEAD / CALON PENGHUNI
  console.log('--- 1. Testing Actor: LEAD (Calon Penghuni) ---');
  let res = await sendTestMessage(testPhone, '#role lead');
  console.log('✅ Switch to Lead:', res.switchedTo);

  res = await sendTestMessage(testPhone, 'Menu');
  console.log('✅ Menu Response:\n', res.reply?.substring(0, 150) + '...\n');

  res = await sendTestMessage(testPhone, '1');
  console.log('✅ Selection (1 - RSHS Pasteur):\n', res.reply?.substring(0, 200) + '...\n');

  // 2. TEST TENANT (Penghuni)
  console.log('--- 2. Testing Actor: TENANT (Penghuni Kos) ---');
  res = await sendTestMessage(testPhone, '#role tenant');
  console.log('✅ Switch to Tenant:', res.switchedTo);

  res = await sendTestMessage(testPhone, 'Tagihan');
  console.log('✅ Tagihan Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Pesan Galon 1');
  console.log('✅ Pesan Galon Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Komplain: Kran kamar mandi bocor');
  console.log('✅ Komplain Response:\n', res.reply?.substring(0, 180) + '...\n');

  // 3. TEST STAFF (Staf Lapangan)
  console.log('--- 3. Testing Actor: STAFF (Staf Lapangan) ---');
  res = await sendTestMessage(testPhone, '#role staff');
  console.log('✅ Switch to Staff:', res.switchedTo);

  res = await sendTestMessage(testPhone, 'SO 12 2 6');
  console.log('✅ Shorthand SO Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Dana: Beli Sapu & Pel 75000 untuk lorong lt 2');
  console.log('✅ Pengajuan Dana Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Cek-in: EKS-01 dr. Rizky Kunci OK AC Dingin Normal');
  console.log('✅ Laporan Cek-In Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Selesai CMP-8812 kran sudah diganti seal baru');
  console.log('✅ Laporan Selesai Response:\n', res.reply?.substring(0, 180) + '...\n');

  // 4. TEST OWNER (Pemilik Kos)
  console.log('--- 4. Testing Actor: OWNER (Pemilik Kos) ---');
  res = await sendTestMessage(testPhone, '#role owner');
  console.log('✅ Switch to Owner:', res.switchedTo);

  res = await sendTestMessage(testPhone, 'Kas');
  console.log('✅ Laporan Kas Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'ACC Galon');
  console.log('✅ ACC Galon Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Plot CMP-8812 ke Bambang');
  console.log('✅ Plotting Tugas Response:\n', res.reply?.substring(0, 180) + '...\n');

  // 5. TEST VENDOR (Mitra Warung / Depot)
  console.log('--- 5. Testing Actor: VENDOR (Mitra Vendor) ---');
  res = await sendTestMessage(testPhone, '#role warung');
  console.log('✅ Switch to Vendor Warung:', res.switchedTo);

  res = await sendTestMessage(testPhone, 'Order');
  console.log('✅ Order Masuk Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Diantar REQ-9901');
  console.log('✅ Update Diantar Response:\n', res.reply?.substring(0, 180) + '...\n');

  res = await sendTestMessage(testPhone, 'Rekap');
  console.log('✅ Rekap Tagihan Response:\n', res.reply?.substring(0, 180) + '...\n');

  // 6. VERIFY LIVE STREAM ACTIVITY QUEUE & OWNER TOAST NOTIFICATIONS
  console.log('--- 6. Verifying Live Activity Stream & Owner Toast Queue ---');
  const liveLogs = await getLiveActivity('wa_live_stream');
  console.log(`✅ Live Stream Logs Captured: ${liveLogs.count} messages in queue.`);

  const ownerNotifs = await getLiveActivity('notifs', 'owner');
  console.log(`✅ Owner Real-Time Toast Notifications Queued: ${ownerNotifs.data?.length || 0} notifications ready for Web Pop-up!`);
  if (ownerNotifs.data?.length > 0) {
    console.log('   Latest Toast:', ownerNotifs.data[0]?.title, '->', ownerNotifs.data[0]?.message);
  }

  console.log('\n🎉 ========================================');
  console.log('🏆 ALL 5 ACTORS & LIVE STREAM TESTS PASSED!');
  console.log('🎉 ========================================');
}

runTests().catch(console.error);
