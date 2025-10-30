import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const scanSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  location: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * POST /api/barcodes/scan - Scan and process barcode
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, location, userId } = scanSchema.parse(body);

    // Find item by barcode
    const item = await prisma.item.findFirst({
      where: { barcode },
      include: {
        binItems: {
          include: {
            bin: {
              include: {
                rack: {
                  include: {
                    aisle: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found for barcode' },
        { status: 404 }
      );
    }

    // Check halal compliance if applicable
    if (item.halalProduct) {
      const complianceCheck = await prisma.complianceCheck.findFirst({
        where: {
          halalProductId: item.halalProduct.id,
          status: 'PASSED',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!complianceCheck) {
        return NextResponse.json(
          { error: 'Halal compliance check failed or not found' },
          { status: 403 }
        );
      }
    }

    // Log the scan
    await prisma.movement.create({
      data: {
        type: 'SCAN',
        itemId: item.id,
        quantity: 1,
        fromLocation: location,
        userId,
        metadata: {
          barcode,
          scannedAt: new Date().toISOString(),
        },
      },
    });

    // Return item details
    return NextResponse.json({
      item: {
        id: item.id,
        name: item.name,
        barcode: item.barcode,
        sku: item.sku,
        description: item.description,
        category: item.category,
        halalCertified: !!item.halalProduct,
        locations: item.binItems.map(bi => ({
          binId: bi.bin.id,
          rackId: bi.bin.rack.id,
          aisleId: bi.bin.rack.aisle.id,
          quantity: bi.quantity,
        })),
      },
      message: 'Barcode scanned successfully',
    });
  } catch (error) {
    console.error('Error scanning barcode:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
