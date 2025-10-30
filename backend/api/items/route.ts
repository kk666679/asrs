import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  weight: z.number().positive('Weight must be positive'),
  hazardLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).default('NONE'),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).default('AMBIENT'),
  minStock: z.number().int().min(0).default(0),
  maxStock: z.number().int().positive().optional(),
  barcode: z.string().optional(),
  supplierId: z.string().min(1, 'Supplier ID is required'),
});

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  weight: z.number().positive().optional(),
  hazardLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().positive().optional(),
  barcode: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  supplierId: z.string().optional(),
  category: z.string().optional(),
  hazardLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['sku', 'name', 'category', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/items - Retrieve all items with optional filtering and pagination
 * Query parameters: page, limit, supplierId, category, hazardLevel, temperature, search, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const {
      page,
      limit,
      supplierId,
      category,
      hazardLevel,
      temperature,
      search,
      sortBy,
      sortOrder,
    } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};
    if (supplierId) where.supplierId = supplierId;
    if (category) where.category = category;
    if (hazardLevel) where.hazardLevel = hazardLevel;
    if (temperature) where.temperature = temperature;
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          supplier: { select: { id: true, code: true, name: true } },
          binItems: {
            include: {
              bin: { select: { id: true, code: true, rack: { select: { code: true } } } },
            },
          },
          _count: { select: { binItems: true, shipmentItems: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
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
 * POST /api/items - Create a new item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createItemSchema.parse(body);

    // Check if SKU already exists
    const existingItem = await prisma.item.findUnique({
      where: { sku: data.sku },
    });
    if (existingItem) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 },
      );
    }

    // Check if barcode already exists (if provided)
    if (data.barcode) {
      const existingBarcode = await prisma.item.findUnique({
        where: { barcode: data.barcode },
      });
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Barcode already exists' },
          { status: 409 },
        );
      }
    }

    // Verify supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId },
    });
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 },
      );
    }

    const item = await prisma.item.create({
      data,
      include: {
        supplier: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
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

/**
 * PUT /api/items - Update an existing item
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const data = updateItemSchema.parse(body);

    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if barcode already exists (if updating barcode)
    if (data.barcode && data.barcode !== existingItem.barcode) {
      const existingBarcode = await prisma.item.findUnique({
        where: { barcode: data.barcode },
      });
      if (existingBarcode) {
        return NextResponse.json(
          { error: 'Barcode already exists' },
          { status: 409 },
        );
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data,
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        binItems: {
          include: {
            bin: {
              select: {
                id: true,
                code: true,
                rack: { select: { code: true } },
              },
            },
          },
        },
        _count: { select: { binItems: true, shipmentItems: true } },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
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

/**
 * DELETE /api/items - Delete an item
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 },
      );
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id },
      include: { binItems: true, shipmentItems: true },
    });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if item has any bin items or shipment items
    if (item.binItems.length > 0 || item.shipmentItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item with existing inventory or shipments' },
        { status: 409 },
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
