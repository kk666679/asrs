import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateForecast } from '@/lib/forecast-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemIds, daysAhead = 30 } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: 'itemIds array is required' }, { status: 400 });
    }

    const days = Math.min(90, Math.max(1, Number(daysAhead) || 30));
    const items = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, sku: true },
    });

    const forecasts = items.map(item => generateForecast(item.id, item.name, item.sku, days));
    const foundIds = new Set(items.map(i => i.id));
    const errors = itemIds.filter((id: string) => !foundIds.has(id)).map((id: string) => `Item ${id} not found`);

    return NextResponse.json({ forecasts, errors });
  } catch (err) {
    console.error('Batch forecast error:', err);
    return NextResponse.json({ error: 'Failed to generate batch forecast' }, { status: 500 });
  }
}
