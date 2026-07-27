import { NextRequest, NextResponse } from 'next/server';
import { visionOCR } from '@/lib/openai';

// POST /api/ai/ocr — extract receipt data using GPT-4o Vision
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
    }

    const mime = mimeType || 'image/jpeg';
    const result = await visionOCR(imageBase64, mime);

    if (result.error) {
      return NextResponse.json({ error: result.error, raw: result.raw }, { status: 422 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[POST /api/ai/ocr]', error);
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
  }
}
