import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import type OpenAI from 'openai';

// POST /api/ai/chat — Admin chatbot untuk KosanKu Pro
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, phone, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Load FAQ knowledge base
    let knowledgeBase = '';
    let roomList = 'Belum ada data kamar.';
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

    const systemPrompt = `Kamu adalah admin/staf KosanKu Pro, kos premium di Bandung. Bukan AI, tapi staf kos yang bertugas melayani calon dan penghuni kos.

Gaya bicara:
- Ramah, santai tapi profesional, seperti admin kos yang baik
- Panggil "kak" atau "mas/mbak" untuk calon penghuni
- Jawaban singkat dan jelas (maksimal 3-4 kalimat)
- Tidak perlu menyebut diri sendiri sebagai AI atau asisten virtual
- Gunakan bahasa Indonesia sehari-hari yang natural
- Emoji boleh digunakan secukupnya, tapi jangan berlebihan
- Jangan gunakan markdown

Tugas:
- Jawab pertanyaan tentang kamar, harga, fasilitas, dan proses booking
- Bantu calon penghuni memilih kamar yang cocok
- Berikan info yang akurat berdasarkan data kamar

Knowledge Base:
${knowledgeBase || 'Belum ada FAQ.'}

Kamar tersedia saat ini:
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
