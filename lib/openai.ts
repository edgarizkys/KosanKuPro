import OpenAI from 'openai';

// Lazy initialization — env vars only available at runtime, not build time
let _openai: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      timeout: 30000,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'KosanKu Pro',
      },
    });
  }
  return _openai;
}

const MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'openai/gpt-oss-20b:free',
];
const FALLBACK_MODEL = 'google/gemma-4-26b-a4b-it:free';
const VISION_MODEL = 'nvidia/nemotron-nano-12b-v2-vl:free';

// Retry with exponential backoff for 429 rate limits
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes('429');
      const is5xx = err?.status >= 500 || err?.status === undefined;
      if ((is429 || is5xx) && i < retries) {
        const delay = Math.pow(2, i) * 1500;
        console.log(`[AI] Error ${err?.status || 'unknown'}, retrying in ${delay}ms (attempt ${i + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

export async function chatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  tools?: OpenAI.Chat.ChatCompletionTool[]
) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_OPENROUTER_KEY') {
    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: `Halo Kak! 👋 Terima kasih telah menghubungi *KosanKu Pro Residence*. Kamar siap huni kami dilengkapi AC, Smart Lock pintu, Free WiFi 100Mbps, dan Free Laundry 5kg/bulan. Ada yang bisa kami bantu? Silakan cek kamar kami di https://kosankupro.cloud`,
          },
        },
      ],
    } as any;
  }

  // Try models in order until one works
  for (const model of MODELS) {
    const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    };

    if (tools && tools.length > 0) {
      params.tools = tools;
      params.tool_choice = 'auto';
    }

    try {
      const result = await withRetry(() => getOpenAI().chat.completions.create(params), 1);
      return result;
    } catch (err: any) {
      console.log(`[AI] Model ${model} failed (status: ${err?.status}), trying next...`);
      continue;
    }
  }

  // All models failed, try fallback with longer retry
  console.log('[AI] All primary models failed, trying fallback:', FALLBACK_MODEL);
  try {
    const fallbackParams: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
      model: FALLBACK_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    };
    return await withRetry(() => getOpenAI().chat.completions.create(fallbackParams), 2);
  } catch {
    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: `Halo Kak! 👋 Terima kasih telah menghubungi *KosanKu Pro*. Kamar siap huni kami dilengkapi Smart Lock, AC, WiFi 100Mbps, dan Free Laundry. Kakak berminat untuk sewa harian atau bulanan? Cek ketersediaan di: https://kosankupro.cloud`,
          },
        },
      ],
    } as any;
  }
}

export async function visionOCR(imageBase64: string, mimeType: string) {
  const response = await withRetry(() => getOpenAI().chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a receipt/invoice OCR extractor for an Indonesian kos (boarding house) management system.
Extract from the receipt image and return ONLY valid JSON with this structure:
{
  "vendor": "store/service name",
  "date": "YYYY-MM-DD",
  "category": "listrik|air|perbaikan|internet|lain_lain",
  "totalAmount": number (in IDR, no formatting),
  "items": [{"name": "item name", "amount": number}],
  "notes": "any additional info"
}
Category rules:
- listrik: electricity bills (PLN, token listrik)
- air: water bills (PDAM)
- perbaikan: repairs, maintenance, hardware
- internet: WiFi, internet service
- lain_lain: anything else
Return ONLY the JSON, no markdown, no explanation.`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
          {
            type: 'text',
            text: 'Extract all information from this receipt/invoice.',
          },
        ],
      },
    ],
    max_tokens: 1000,
  }));

  const content = response.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(content);
  } catch {
    return { error: 'Failed to parse OCR result', raw: content };
  }
}
