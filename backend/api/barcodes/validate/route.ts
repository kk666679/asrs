import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const validateBarcodeSchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  type: z.enum(['PRODUCT', 'LOCATION', 'CONTAINER', 'PALLET', 'BATCH']).optional(),
});

const querySchema = z.object({
  barcode: z.string().min(1, 'Barcode is required'),
  type: z.enum(['PRODUCT', 'LOCATION', 'CONTAINER', 'PALLET', 'BATCH']).optional(),
});

/**
 * GET /api/barcodes/validate - Validate a barcode and return associated data
 * Query parameters: barcode, type (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { barcode, type } = query;

    let result: any = null;
    let foundType = '';

    // Try to find product by barcode
    if (!type || type === 'PRODUCT') {
      const product = await prisma.product.findFirst({
        where: { barcode },
        include: {
          category: { select: { id: true, name: true } },
          inventory: {
            include: {
              location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
            },
          },
        },
      });
      if (product) {
        result = {
          type: 'PRODUCT',
          data: product,
          inventory: product.inventory,
        };
        foundType = 'PRODUCT';
      }
    }

    // Try to find location by barcode
    if (!result && (!type || type === 'LOCATION')) {
      const location = await prisma.location.findFirst({
        where: { barcode },
        include: {
          zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
          inventory: {
            include: {
              product: { select: { id: true, sku: true, name: true } },
            },
          },
        },
      });
      if (location) {
        result = {
          type: 'LOCATION',
          data: location,
          inventory: location.inventory,
        };
        foundType = 'LOCATION';
      }
    }

    // Try to find container by barcode
    if (!result && (!type || type === 'CONTAINER')) {
      const container = await prisma.handlingUnit.findFirst({
        where: { barcode },
        include: {
          location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
          items: {
            include: {
              product: { select: { id: true, sku: true, name: true } },
            },
          },
        },
      });
      if (container) {
        result = {
          type: 'CONTAINER',
          data: container,
          items: container.items,
        };
        foundType = 'CONTAINER';
      }
    }

    // Try to find pallet by barcode
    if (!result && (!type || type === 'PALLET')) {
      const pallet = await prisma.pallet.findFirst({
        where: { barcode },
        include: {
          location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
          handlingUnits: {
            include: {
              items: {
                include: {
                  product: { select: { id: true, sku: true, name: true } },
                },
              },
            },
          },
        },
      });
      if (pallet) {
        result = {
          type: 'PALLET',
          data: pallet,
          handlingUnits: pallet.handlingUnits,
        };
        foundType = 'PALLET';
      }
    }

    // Try to find batch by barcode
    if (!result && (!type || type === 'BATCH')) {
      const batch = await prisma.batch.findFirst({
        where: { barcode },
        include: {
          product: { select: { id: true, sku: true, name: true } },
          inventory: {
            include: {
              location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
            },
          },
        },
      });
      if (batch) {
        result = {
          type: 'BATCH',
          data: batch,
          inventory: batch.inventory,
        };
        foundType = 'BATCH';
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Barcode not found', barcode },
        { status: 404 },
      );
    }

    return NextResponse.json({
      barcode,
      foundType,
      ...result,
    });
  } catch (error) {
    console.error('Error validating barcode:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/barcodes/validate - Validate multiple barcodes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcodes, type } = body;

    if (!Array.isArray(barcodes) || barcodes.length === 0) {
      return NextResponse.json(
        { error: 'Barcodes array is required and must not be empty' },
        { status: 400 },
      );
    }

    const results = [];
    const errors = [];

    for (const barcode of barcodes) {
      try {
        const validationSchema = validateBarcodeSchema.parse({ barcode, type });
        const { searchParams } = new URL(`${request.url}?barcode=${encodeURIComponent(barcode)}${type ? `&type=${type}` : ''}`);
        const mockRequest = { url: `http://localhost?${searchParams.toString()}` } as NextRequest;

        // Reuse GET logic
        const response = await GET(mockRequest);
        const data = await response.json();

        if (response.status === 200) {
          results.push(data);
        } else {
          errors.push({ barcode, error: data.error });
        }
      } catch (error) {
        errors.push({ barcode, error: 'Validation failed' });
      }
    }

    return NextResponse.json({
      total: barcodes.length,
      valid: results.length,
      invalid: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Error validating barcodes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
