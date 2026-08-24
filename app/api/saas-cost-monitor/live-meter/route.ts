import { NextRequest, NextResponse } from 'next/server';
import { getLiveSaaSUsage, incrementSaaSUsage } from '@/lib/saasUsageMeter';

export const dynamic = 'force-dynamic';

// GET /api/saas-cost-monitor/live-meter — Fetch real-time usage meters for WA, AI, and PG
export async function GET() {
  const usage = getLiveSaaSUsage();
  return NextResponse.json({
    success: true,
    data: usage,
  });
}

// POST /api/saas-cost-monitor/live-meter — Manually trigger or test meter increment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount = 1 } = body;

    if (!['WA', 'AI', 'PG'].includes(type)) {
      return NextResponse.json({ error: 'type must be WA, AI, or PG' }, { status: 400 });
    }

    const updated = incrementSaaSUsage(type as 'WA' | 'AI' | 'PG', Number(amount));
    return NextResponse.json({
      success: true,
      message: `Successfully incremented ${type} by ${amount}`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
