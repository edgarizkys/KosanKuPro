import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import type OpenAI from 'openai';

// POST /api/ai/chat — Admin chatbot untuk KosanKu Pro
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, phone, history, propertySlug, propertyName, propertyAddress } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const isRshs = propertySlug === 'rshs' || (propertyName && propertyName.toLowerCase().includes('rshs'));
    const activeKosName = isRshs ? 'Juragan Kost RSHS Bandung' : (propertyName || 'KosanKu Pro Residence');
    const activeAddress = isRshs
      ? 'Jl. Pasir Kaliki GG h tabri No.76/65, Sukabungah, Kec. Sukajadi, Kota Bandung (Persis di seberang / depan RS Hasan Sadikin Bandung)'
      : (propertyAddress || 'Bandung');

    // Load FAQ knowledge base
    let knowledgeBase = '';
    let roomList = 'Belum ada data kamar.';

    if (isRshs) {
      const { RSHS_ROOMS_DATA } = await import('@/lib/rshsRoomsData');
      roomList = RSHS_ROOMS_DATA.map(
        (r) =>
          `- ${r.type} (${r.number}): Rp ${r.price.toLocaleString('id-ID')}/bln. Ukuran: ${r.size || 'Kamar Nyaman'}. Fasilitas: ${(r.facilities || []).join(', ')}`
      ).join('\n');
      knowledgeBase = `Lokasi: Tepat di depan RS Hasan Sadikin (RSHS) Bandung, sangat dekat untuk dokter jaga, koas, mahasiswa FK Unpad, perawat, atau keluarga pasien.
Fasilitas Utama: Mini Gym, Dapur & Kulkas Bersama Lengkap, Laundry Room (Free Laundry 5-10kg/bln), Pembersihan kamar berkala, Parkir Motor, WiFi Kencang & CCTV 24 Jam.
Kamar: Tipe Eksekutif (1.5jt), Nyaman (1jt), Nyaman 2 (1.4jt), Nyaman 3 (1.3jt), Nyaman 4 (1.4jt), Paviliun Eksekutif (2.8jt), Paviliun Tipe B (2.6jt), Super Nyaman (1.7jt).`;
    } else {
      try {
        const faqEntries = await prisma.faqEntry.findMany({ take: 50 });
        knowledgeBase = faqEntries
          .map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`)
          .join('\n\n');
      } catch {
        // DB might not be available
      }

      try {
        const availableRooms = await prisma.room.findMany({
          where: { status: 'AVAILABLE' },
          select: { number: true, type: true, price: true, facilities: true },
          take: 10,
        });
        roomList = availableRooms.length > 0
          ? availableRooms.map((r: { number: string; type: string; price: number; facilities: string[] }) => `- ${r.type} (${r.number}): Rp ${r.price.toLocaleString('id-ID')}/bln, fasilitas: ${r.facilities.join(', ')}`).join('\n')
          : 'Belum ada kamar tersedia.';
      } catch {
        // DB might not be available
      }
    }

    const ownerPhone = isRshs ? '+62 812-2379-8307' : '+62 812-3456-7890';

    const systemPrompt = `Kamu adalah Customer Service / Resepsionis resmi dari "${activeKosName}", berlokasi di ${activeAddress}. Kamu BUKAN AI, melainkan staf / admin pengelola kosan manusia yang ramah, sopan, dan sigap membantu calon penghuni maupun penghuni kos.

Gaya bicara:
- Sangat ramah, bersahabat, dan profesional khas staf pengelola kos Indonesia
- Panggil "kak" atau "dokter / mas / mbak" untuk calon penghuni
- Jawaban ringkas, padat, dan jelas (maksimal 2-3 kalimat)
- Selalu berikan info harga sewa, fasilitas, atau keunggulan lokasi yang akurat sesuai data di bawah
- JIKA ada pertanyaan khusus di luar data (misal: negosiasi diskon khusus, aturan hewan peliharaan, atau hal yang tidak kamu ketahui pasti), JANGAN menebak! Arahkan calon penghuni untuk langsung menghubungi Owner / Pengelola melalui WhatsApp resmi: ${ownerPhone}
- Jangan pernah menyebut dirimu sebagai robot/AI atau asisten kecerdasan buatan

Knowledge Base Kosan:
${knowledgeBase || 'Belum ada FAQ khusus.'}

Daftar Pilihan Kamar & Harga Resmi Saat Ini:
${roomList}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10),
      { role: 'user', content: message },
    ];

    const response = await chatCompletion(messages);
    const reply = response.choices[0]?.message?.content || 'Maaf, terjadi kesalahan.';

    // Save to conversation if phone provided
    if (phone) {
      try {
        const normalizedPhone = phone.replace(/[^0-9]/g, '');
        const existing = await prisma.conversation.findUnique({ where: { phone: normalizedPhone } });
        const msgs = existing ? (existing.messages as unknown as OpenAI.Chat.ChatCompletionMessageParam[]) : [];
        msgs.push({ role: 'user', content: message });
        msgs.push({ role: 'assistant', content: reply });

        if (existing) {
          await prisma.conversation.update({ where: { phone: normalizedPhone }, data: { messages: msgs.slice(-20) as any } });
        } else {
          await prisma.conversation.create({ data: { phone: normalizedPhone, messages: msgs.slice(-20) as any } });
        }
      } catch {
        // Non-critical, ignore
      }
    }

    return NextResponse.json({ data: { reply } });
  } catch (error: any) {
    console.error('[POST /api/ai/chat]', error?.message || error);
    const is429 = error?.status === 429;
    return NextResponse.json(
      { data: { reply: is429
        ? 'Maaf kak, lagi rame banget nih. Coba kirim lagi beberapa detik ya.'
        : 'Maaf kak, ada kendala teknis. Silakan coba lagi atau hubungi admin via WhatsApp.'
      } },
      { status: is429 ? 429 : 500 }
    );
  }
}
