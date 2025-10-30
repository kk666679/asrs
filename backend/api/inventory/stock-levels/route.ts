import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  warehouseId: z.string().optional(),
  zoneId: z.string().optional(),
  productId: z.string().optional(),
  stockLevel: z.enum(['LOW', 'NORMAL', 'HIGH', 'OUT_OF_STOCK']).optional(),
  sortBy: z.enum(['product.sku', 'quantityOnHand', 'reorderPoint', 'createdAt']).default('quantityOnHand'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const updateStockLevelSchema = z.object({
  reorderPoint: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
  minStockLevel: z.number().min(0).optional(),
});

/**
 * GET /api/inventory/stock-levels - Retrieve inventory stock levels with filtering and pagination
 * Query parameters: page, limit, warehouseId, zoneId, productId, stockLevel, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, warehouseId, zoneId, productId, stockLevel, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (warehouseId) where.location = { zone: { warehouseId } };
    if (zoneId) where.location = { ...where.location, zoneId };
    if (productId) where.productId = productId;

    const [inventoryItems, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: { select: { id: true, sku: true, name: true, category: { select: { name: true } } } },
          location: {
            select: {
              id: true,
              code: true,
              zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
            },
          },
          batch: { select: { id: true, batchNumber: true, expiryDate: true } },
        },
        orderBy: sortBy === 'product.sku' ? { product: { sku: sortOrder } } : { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.inventory.count({ where }),
    ]);

    // Calculate stock levels and filter if needed
    const processedItems = inventoryItems.map(item => {
      const stockLevelCalc = item.quantityOnHand === 0 ? 'OUT_OF_STOCK' :
                            item.quantityOnHand <= (item.reorderPoint || 0) ? 'LOW' :
                            item.quantityOnHand >= (item.maxStockLevel || Infinity) ? 'HIGH' : 'NORMAL';

      return {
        ...item,
        stockLevel: stockLevelCalc,
      };
    });

    const filteredItems = stockLevel ? processedItems.filter(item => item.stockLevel === stockLevel) : processedItems;

    return NextResponse.json({
      inventory: filteredItems,
      pagination: {
        page,
        limit,
        total: stockLevel ? filteredItems.length : total,
        pages: Math.ceil((stockLevel ? filteredItems.length : total) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching stock levels:', error);
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
 * PUT /api/inventory/stock-levels - Update stock level settings for an inventory item
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Inventory ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateStockLevelSchema.parse(body);

    const existingInventory = await prisma.inventory.findUnique({
      where: { id },
    });
    if (!existingInventory) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, sku: true, name: true } },
        location: {
          select: {
            id: true,
            code: true,
            zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
          },
        },
      },
    });

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error('Error updating stock levels:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
