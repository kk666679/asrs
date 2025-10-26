import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        warehouse: {
          select: {
            name: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
        shipmentItems: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return NextResponse.json(shipments);
  } catch (error) {
    console.error('Failed to fetch shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentNumber, type, expectedArrival, warehouseId, supplierId, barcode } = body;

    // Validate required fields
    if (!shipmentNumber || !type || !warehouseId || !supplierId) {
      return NextResponse.json(
        { error: 'Missing required fields: shipmentNumber, type, warehouseId, supplierId' },
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

    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber,
        type,
        expectedArrival: expectedArrival ? new Date(expectedArrival) : null,
        warehouseId,
        supplierId,
        barcode,
      },
      include: {
        warehouse: {
          select: {
            name: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch (error) {
    console.error('Failed to create shipment:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
}
