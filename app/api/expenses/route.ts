import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { visionOCR } from '@/lib/openai';

// GET /api/expenses — list expenses with optional filters (category, dateFrom, dateTo)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Summary by category
    const summary = expenses.reduce((acc: Record<string, number>, exp: { category: string; amount: number }) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = expenses.reduce((sum: number, exp: { amount: number }) => sum + exp.amount, 0);

    return NextResponse.json({ data: expenses, summary, total, count: expenses.length });
  } catch (error) {
    console.error('[GET /api/expenses]', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

// POST /api/expenses — create expense (optionally with OCR from receipt image)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, amount, description, receiptUrl, imageBase64, mimeType, date } = body;

    let ocrData = null;
    let finalCategory = category;
    let finalAmount = amount ? parseFloat(amount) : 0;
    let finalDescription = description || '';

    // If image provided, run OCR first
    if (imageBase64) {
      const mime = mimeType || 'image/jpeg';
      ocrData = await visionOCR(imageBase64, mime);

      if (!ocrData.error) {
        // Auto-fill from OCR if not manually provided
        if (!finalCategory) finalCategory = ocrData.category || 'lain_lain';
        if (!finalAmount) finalAmount = ocrData.totalAmount || 0;
        if (!finalDescription) finalDescription = ocrData.vendor ? `${ocrData.vendor} - ${ocrData.notes || ''}`.trim() : 'OCR extracted expense';
      }
    }

    if (!finalCategory || !finalAmount) {
      return NextResponse.json(
        { error: 'category and amount are required (or provide imageBase64 for OCR extraction)' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category: finalCategory,
        amount: finalAmount,
        description: finalDescription,
        receiptUrl: receiptUrl || null,
        ocrRaw: ocrData || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ data: expense, ocr: ocrData }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/expenses]', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
