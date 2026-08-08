import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateForecast } from '@/lib/forecast-engine';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');
  const days = Math.min(90, Math.max(1, parseInt(searchParams.get('days') ?? '30')));

  if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 });

  try {
    const item = await prisma.item.findUnique({ where: { id: itemId }, select: { id: true, name: true, sku: true } });
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    return NextResponse.json(generateForecast(item.id, item.name, item.sku, days));
  } catch (err) {
    console.error('Forecast error:', err);
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 });
  }
}
