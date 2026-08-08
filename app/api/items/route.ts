import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      select: { id: true, name: true, sku: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const required = ['sku', 'name', 'category', 'weight', 'supplierId'];
    const missing = required.filter(f => !data[f]);
    if (missing.length) return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 });
    const item = await prisma.item.create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    const msg = err?.code === 'P2002' ? 'SKU already exists' : 'Failed to create item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
