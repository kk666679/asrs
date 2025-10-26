import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const bins = await prisma.bin.findMany({
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
      },
    });

    return NextResponse.json(bins);
  } catch (error) {
    console.error('Failed to fetch bins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bins' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, capacity, weightLimit, rackId, barcode } = body;

    // Validate required fields
    if (!code || !capacity || !weightLimit || !rackId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, capacity, weightLimit, rackId' },
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

    const bin = await prisma.bin.create({
      data: {
        code,
        capacity: parseInt(capacity),
        weightLimit: parseFloat(weightLimit),
        rackId,
        barcode,
      },
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
      },
    });

    return NextResponse.json(bin, { status: 201 });
  } catch (error) {
    console.error('Failed to create bin:', error);
    return NextResponse.json(
      { error: 'Failed to create bin' },
      { status: 500 }
    );
  }
}
