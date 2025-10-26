import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, name, category, weight, hazardLevel, temperature, minStock, maxStock, supplierId, barcode } = body;

    // Validate required fields
    if (!sku || !name || !category || !weight || !supplierId) {
      return NextResponse.json(
        { error: 'Missing required fields: sku, name, category, weight, supplierId' },
        { status: 400 }
      );
    }

    // Check if barcode is unique if provided
    if (barcode) {
      const existingItem = await prisma.item.findUnique({ where: { barcode } });
      const existingBin = await prisma.bin.findUnique({ where: { barcode } });
      const existingShipment = await prisma.shipment.findUnique({ where: { barcode } });

      if (existingItem || existingBin || existingShipment) {
        return NextResponse.json(
          { error: 'Barcode already exists' },
          { status: 400 }
        );
      }
    }

    const item = await prisma.item.create({
      data: {
        sku,
        name,
        category,
        weight: parseFloat(weight),
        hazardLevel: hazardLevel || 'NONE',
        temperature: temperature || 'AMBIENT',
        minStock: minStock ? parseInt(minStock) : 0,
        maxStock: maxStock ? parseInt(maxStock) : null,
        supplierId,
        barcode,
      },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
