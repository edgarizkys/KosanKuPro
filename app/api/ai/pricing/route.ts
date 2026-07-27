import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatCompletion } from '@/lib/openai';

// POST /api/ai/pricing — AI dynamic pricing insights
export async function POST(req: NextRequest) {
  try {
    // Gather current data
    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({ where: { status: 'OCCUPIED' } });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Get room types and prices
    const rooms = await prisma.room.findMany({
      select: { type: true, price: true, status: true },
    });

    // Group by type
    const typeData: Record<string, { prices: number[]; occupied: number; total: number }> = {};
    for (const room of rooms) {
      if (!typeData[room.type]) {
        typeData[room.type] = { prices: [], occupied: 0, total: 0 };
      }
      typeData[room.type].prices.push(room.price);
      typeData[room.type].total++;
      if (room.status === 'OCCUPIED') typeData[room.type].occupied++;
    }

    // Get recent booking trends
    const recentBookings = await prisma.booking.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, dpAmount: true, status: true },
    });

    const currentMonth = new Date().getMonth() + 1;
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const prompt = `Kamu adalah analis harga properti kos (boarding house) di Indonesia.

Data saat ini:
- Total kamar: ${totalRooms}
- Kamar terisi: ${occupiedRooms}
- Tingkat okupansi: ${occupancyRate}%
- Bulan saat ini: ${monthNames[currentMonth - 1]}

Data per tipe kamar:
${Object.entries(typeData).map(([type, d]) => {
  const avgPrice = Math.round(d.prices.reduce((a: number, b: number) => a + b, 0) / d.prices.length);
  const occ = d.total > 0 ? Math.round((d.occupied / d.total) * 100) : 0;
  return `- ${type}: harga rata-rata Rp ${avgPrice.toLocaleString('id-ID')}, okupansi ${occ}% (${d.occupied}/${d.total})`;
}).join('\n')}

Booking terakhir (30 hari): ${recentBookings.length} booking

Berikan rekomendasi harga dalam format JSON:
{
  "recommendations": [
    {
      "roomType": "tipe kamar",
      "currentPrice": number,
      "suggestedPrice": number,
      "reason": "alasan singkat",
      "confidence": "high|medium|low"
    }
  ],
  "insights": "ringkasan insight pasar dalam 2-3 kalimat",
  "occupancyTrend": "naik|turun|stabil"
}

Pertimbangkan: musim (bulan), tingkat okupansi, dan tren booking.
Return ONLY valid JSON.`;

    const response = await chatCompletion([
      { role: 'system', content: 'Kamu adalah AI pricing analyst untuk properti kos di Indonesia. Return ONLY valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || '{}';
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { error: 'Failed to parse AI response', raw: content };
    }

    return NextResponse.json({ data: result, meta: { occupancyRate, totalRooms, occupiedRooms } });
  } catch (error) {
    console.error('[POST /api/ai/pricing]', error);
    return NextResponse.json({ error: 'Pricing analysis failed' }, { status: 500 });
  }
}
