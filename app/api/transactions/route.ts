import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const movements = await prisma.movement.findMany({
      include: {
        binItem: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        fromBin: {
          select: {
            code: true,
          },
        },
        toBin: {
          select: {
            code: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error('Failed to fetch movements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, quantity, priority, binItemId, fromBinId, toBinId, userId } = body;

    const movement = await prisma.movement.create({
      data: {
        type,
        quantity: parseInt(quantity),
        priority,
        binItemId,
        fromBinId,
        toBinId,
        userId,
      },
      include: {
        binItem: {
          include: {
            item: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        fromBin: {
          select: {
            code: true,
          },
        },
        toBin: {
          select: {
            code: true,
          },
        },
      },
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error('Failed to create movement:', error);
    return NextResponse.json(
      { error: 'Failed to create movement' },
      { status: 500 }
    );
  }
}
