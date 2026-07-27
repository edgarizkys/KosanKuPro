import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chatCompletion } from '@/lib/openai';
import { sendWhatsApp } from '@/lib/fonnte';
import type OpenAI from 'openai';

// POST /api/whatsapp/webhook — receive inbound WA from Fonnte → AI concierge
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Fonnte webhook payload: { sender, message, ... }
    const sender = body.sender || body.from || '';
    const message = body.message || body.text || '';

    if (!sender || !message) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    // Normalize phone number
    const phone = sender.replace(/[^0-9]/g, '');

    // Load FAQ knowledge base from DB
    const faqEntries = await prisma.faqEntry.findMany({ take: 50 });
    const knowledgeBase = faqEntries
      .map((f: { question: string; answer: string }) => `Q: ${f.question}\nA: ${f.answer}`)
      .join('\n\n');

    // Load conversation history
    let conversation = await prisma.conversation.findUnique({ where: { phone } });
    const history: OpenAI.Chat.ChatCompletionMessageParam[] = conversation
      ? (conversation.messages as unknown as OpenAI.Chat.ChatCompletionMessageParam[])
      : [];

    // Build system prompt with knowledge base
    const systemPrompt = `Kamu adalah AI Concierge KosanKu Pro, asisten virtual untuk kos premium.
Tugas: menjawab pertanyaan calon penyewa, cek ketersediaan kamar, info harga, dan bantu booking.
Bersikap ramah, profesional, dan gunakan bahasa Indonesia.

Knowledge Base (FAQ):
${knowledgeBase || 'Belum ada FAQ tersedia.'}

Kamar tersedia:
- Standard Smart Suite: Rp 1.200.000/bln (AC, WiFi, KM Dalam)
- Deluxe Studio Smart: Rp 1.500.000/bln (AC, WiFi, KM Dalam, Smart TV)
- VIP Balcony Resort: Rp 2.000.000/bln (AC, WiFi, KM Dalam, Balkon, Smart TV)

Jika user ingin booking, kumpulkan: nama, nomor HP, tipe kamar, tanggal check-in.
Jangan mengarang informasi di luar knowledge base.`;

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Define tools for function calling
    const tools: OpenAI.Chat.ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'check_availability',
          description: 'Check room availability for a given date and room type',
          parameters: {
            type: 'object',
            properties: {
              checkInDate: { type: 'string', description: 'Check-in date (YYYY-MM-DD)' },
              roomType: { type: 'string', description: 'Room type filter (optional)' },
            },
            required: ['checkInDate'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_booking_dp',
          description: 'Create a booking with DP payment link',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              phone: { type: 'string' },
              roomId: { type: 'string' },
              checkInDate: { type: 'string' },
            },
            required: ['name', 'phone', 'roomId', 'checkInDate'],
          },
        },
      },
    ];

    // Call GPT-4o
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Keep last 10 messages for context
    ];

    const response = await chatCompletion(messages, tools);
    const assistantMessage = response.choices[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json({ error: 'No AI response' }, { status: 500 });
    }

    let replyText = assistantMessage.content || 'Maaf, saya tidak bisa memproses pesan Anda.';

    // Handle tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments);

        if (fnName === 'check_availability') {
          const rooms = await prisma.room.findMany({
            where: {
              status: 'AVAILABLE',
              ...(fnArgs.roomType ? { type: { contains: fnArgs.roomType, mode: 'insensitive' } } : {}),
            },
            select: { number: true, type: true, price: true, floor: true },
          });

          if (rooms.length > 0) {
            const roomList = rooms.map((r: { number: string; type: string; price: number; floor: number }) =>
              `• ${r.number} (${r.type}) - Lt ${r.floor} - Rp ${r.price.toLocaleString('id-ID')}/bln`
            ).join('\n');
            replyText = `Kamar tersedia untuk check-in ${fnArgs.checkInDate}:\n\n${roomList}\n\nMau booking yang mana? 😊`;
          } else {
            replyText = `Maaf, saat ini tidak ada kamar tersedia untuk tipe ${fnArgs.roomType || 'semua'} pada tanggal ${fnArgs.checkInDate}. Mau coba tanggal lain?`;
          }
        }

        if (fnName === 'create_booking_dp') {
          const booking = await prisma.booking.create({
            data: {
              roomId: fnArgs.roomId,
              tenantName: fnArgs.name,
              tenantPhone: fnArgs.phone,
              checkInDate: new Date(fnArgs.checkInDate),
              dpAmount: 500000, // Fixed DP
              status: 'PENDING_DP',
            },
          });
          replyText = `Booking berhasil dibuat! 🎉\n\nDetail:\n• Nama: ${fnArgs.name}\n• Check-in: ${fnArgs.checkInDate}\n• DP: Rp 500.000\n\nSilakan lakukan pembayaran DP untuk konfirmasi. Link pembayaran akan dikirim segera.\n\nID Booking: ${booking.id.slice(0, 8).toUpperCase()}`;
        }
      }
    }

    // Save conversation
    history.push({ role: 'assistant', content: replyText });
    if (conversation) {
      await prisma.conversation.update({
        where: { phone },
        data: { messages: history.slice(-20) as any },
      });
    } else {
      await prisma.conversation.create({
        data: { phone, messages: history.slice(-20) as any },
      });
    }

    // Send reply via WhatsApp
    await sendWhatsApp(sender, replyText);

    return NextResponse.json({ message: 'Processed', reply: replyText });
  } catch (error) {
    console.error('[POST /api/whatsapp/webhook]', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
