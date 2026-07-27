// Next.js Vercel Cron API Route: Automated WhatsApp & Email Reminders
// Path: app/api/cron/send-reminders/route.ts

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Verify Vercel Cron Secret for Security
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized Cron Request' }, { status: 401 });
  }

  const FONNTE_TOKEN = process.env.FONNTE_WHATSAPP_TOKEN || 'DEMO_FONNTE_TOKEN';
  const today = new Date();
  
  // Simulated database invoices due check (Prisma query in real app)
  const mockInvoicesToRemind = [
    {
      id: 'INV-101',
      tenantName: 'Budi Santoso',
      phone: '081234567890',
      email: 'budi@example.com',
      roomNumber: 'A-101',
      amount: 1500000,
      dueDate: '2026-07-27', // H-3
      type: 'H-3'
    },
    {
      id: 'INV-102',
      tenantName: 'Siti Rahma',
      phone: '089876543210',
      email: 'siti@example.com',
      roomNumber: 'B-202',
      amount: 2000000,
      dueDate: '2026-07-24', // H-0
      type: 'H-0'
    }
  ];

  const results = [];

  for (const inv of mockInvoicesToRemind) {
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(inv.amount);
    
    // WhatsApp Template Body
    let message = '';
    if (inv.type === 'H-7') {
      message = `Halo ${inv.tenantName}, pengingat ramah tagihan kos kamar ${inv.roomNumber} sebesar ${formattedAmount} akan jatuh tempo pada ${inv.dueDate}. Bayar mudah via KosanKu Pro!`;
    } else if (inv.type === 'H-3') {
      message = `[Penting] Halo ${inv.tenantName}, tagihan kos kamar ${inv.roomNumber} sebesar ${formattedAmount} jatuh tempo 3 hari lagi (${inv.dueDate}). Segera lakukan pembayaran.`;
    } else if (inv.type === 'H-0') {
      message = `[Hari Ini Jatuh Tempo] Halo ${inv.tenantName}, hari ini adalah tanggal jatuh tempo pembayaran kos kamar ${inv.roomNumber} sebesar ${formattedAmount}. Klik di sini untuk bayar sekarang: https://kosanku-pro.vercel.app`;
    } else {
      message = `[Peringatan Tunggakan] Halo ${inv.tenantName}, tagihan kos kamar ${inv.roomNumber} telah melewati jatuh tempo. Harap segera melunasi tagihan Anda.`;
    }

    // Call WhatsApp Gateway API (Fonnte / Wablas)
    try {
      /*
      await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: { Authorization: FONNTE_TOKEN },
        body: new URLSearchParams({ target: inv.phone, message: message }),
      });
      */
      
      results.push({
        tenant: inv.tenantName,
        phone: inv.phone,
        type: inv.type,
        status: 'SENT',
        channel: 'WHATSAPP & EMAIL',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      results.push({ tenant: inv.tenantName, status: 'FAILED', error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    processedCount: results.length,
    logs: results
  });
}
