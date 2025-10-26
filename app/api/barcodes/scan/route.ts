import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode } = body;

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode is required' },
        { status: 400 }
      );
    }

    // Search for the barcode in all entities
    const item = await prisma.item.findUnique({
      where: { barcode },
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
      },
    });

    if (item) {
      return NextResponse.json({
        type: 'item',
        data: item,
      });
    }

    const bin = await prisma.bin.findUnique({
      where: { barcode },
      include: {
        rack: {
          include: {
            aisle: {
              include: {
                zone: {
                  select: {
                    code: true,
                    temperature: true,
                  },
                },
              },
            },
          },
        },
        binItems: {
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
    });

    if (bin) {
      return NextResponse.json({
        type: 'bin',
        data: bin,
      });
    }

    const shipment = await prisma.shipment.findUnique({
      where: { barcode },
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
    });

    if (shipment) {
      return NextResponse.json({
        type: 'shipment',
        data: shipment,
      });
    }

    return NextResponse.json(
      { error: 'Barcode not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Failed to scan barcode:', error);
    return NextResponse.json(
      { error: 'Failed to scan barcode' },
      { status: 500 }
    );
  }
}
