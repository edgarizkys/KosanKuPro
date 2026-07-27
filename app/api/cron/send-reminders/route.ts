import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp, formatBillingReminder } from '@/lib/fonnte';

export const dynamic = 'force-dynamic';

// GET /api/cron/send-reminders — Vercel Cron: send billing reminders via WhatsApp
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Helper: get date N days from now
    const daysFromNow = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d;
    };

    const results: { phone: string; type: string; success: boolean }[] = [];

    // Find invoices by due date offset
    const reminderConfigs: { daysOffset: number; type: 'H-3' | 'H-1' | 'H-0' | 'OVERDUE' }[] = [
      { daysOffset: 3, type: 'H-3' },
      { daysOffset: 1, type: 'H-1' },
      { daysOffset: 0, type: 'H-0' },
      { daysOffset: -1, type: 'OVERDUE' },
      { daysOffset: -3, type: 'OVERDUE' },
      { daysOffset: -7, type: 'OVERDUE' },
    ];

    for (const config of reminderConfigs) {
      const targetDate = daysFromNow(config.daysOffset);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const invoices = await prisma.invoice.findMany({
        where: {
          paymentStatus: 'PENDING',
          dueDate: { gte: targetDate, lt: nextDay },
        },
        include: {
          user: { select: { name: true, phone: true } },
          room: { select: { number: true } },
        },
      });

      for (const invoice of invoices) {
        // Check if reminder already sent today
        const existingNotif = await prisma.notificationLog.findFirst({
          where: {
            userId: invoice.userId,
            channel: 'WHATSAPP',
            title: { contains: `Reminder ${config.type}` },
            sentAt: { gte: today, lt: nextDay },
          },
        });

        if (existingNotif) continue; // Skip if already sent today

        const dueDateStr = invoice.dueDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const message = formatBillingReminder(
          invoice.user.name,
          invoice.room.number,
          invoice.totalAmount,
          dueDateStr,
          config.type
        );

        const waResult = await sendWhatsApp(invoice.user.phone, message);

        // Log notification
        await prisma.notificationLog.create({
          data: {
            userId: invoice.userId,
            title: `Reminder ${config.type} - ${invoice.invoiceNumber}`,
            message: `WhatsApp ${config.type} terkirim ke ${invoice.user.name} (${invoice.room.number})`,
            channel: 'WHATSAPP',
          },
        });

        results.push({ phone: invoice.user.phone, type: config.type, success: waResult.success });
      }
    }

    return NextResponse.json({
      message: `Cron completed. ${results.length} reminders processed.`,
      results,
    });
  } catch (error) {
    console.error('[GET /api/cron/send-reminders]', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
