import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createBatchSchema = z.object({
  batchNumber: z.string().min(1, 'Batch number is required'),
  productId: z.string().min(1, 'Product ID is required'),
  expiryDate: z.string().optional(),
  manufacturedDate: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  locationId: z.string().min(1, 'Location ID is required'),
  supplierId: z.string().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const updateBatchSchema = z.object({
  expiryDate: z.string().optional(),
  manufacturedDate: z.string().optional(),
  quantity: z.number().min(0).optional(),
  locationId: z.string().optional(),
  supplierId: z.string().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'QUARANTINED', 'RECALLED']).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  productId: z.string().optional(),
  locationId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'QUARANTINED', 'RECALLED']).optional(),
  expiryBefore: z.string().optional(),
  expiryAfter: z.string().optional(),
  sortBy: z.enum(['batchNumber', 'expiryDate', 'quantity', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/inventory/batch - Retrieve all inventory batches with optional filtering and pagination
 * Query parameters: page, limit, productId, locationId, supplierId, status, expiryBefore, expiryAfter, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, productId, locationId, supplierId, status, expiryBefore, expiryAfter, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (locationId) where.locationId = locationId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (expiryBefore || expiryAfter) {
      where.expiryDate = {};
      if (expiryBefore) where.expiryDate.lte = new Date(expiryBefore);
      if (expiryAfter) where.expiryDate.gte = new Date(expiryAfter);
    }

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        include: {
          product: { select: { id: true, sku: true, name: true } },
          location: {
            select: {
              id: true,
              code: true,
              zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
            },
          },
          supplier: { select: { id: true, name: true } },
          inventory: { select: { id: true, quantityOnHand: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.batch.count({ where }),
    ]);

    return NextResponse.json({
      batches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inventory batches:', error);
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
 * POST /api/inventory/batch - Create a new inventory batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createBatchSchema.parse(body);

    // Check if batch number already exists
    const existingBatch = await prisma.batch.findUnique({
      where: { batchNumber: data.batchNumber },
    });
    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch number already exists' },
        { status: 409 },
      );
    }

    const batch = await prisma.batch.create({
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        manufacturedDate: data.manufacturedDate ? new Date(data.manufacturedDate) : undefined,
      },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        location: {
          select: {
            id: true,
            code: true,
            zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
          },
        },
        supplier: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory batch:', error);
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
 * PUT /api/inventory/batch - Update an existing inventory batch
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateBatchSchema.parse(body);

    // Check if batch exists
    const existingBatch = await prisma.batch.findUnique({
      where: { id },
    });
    if (!existingBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const updatedBatch = await prisma.batch.update({
      where: { id },
      data: {
        ...data,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        manufacturedDate: data.manufacturedDate ? new Date(data.manufacturedDate) : undefined,
      },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        location: {
          select: {
            id: true,
            code: true,
            zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
          },
        },
        supplier: { select: { id: true, name: true } },
        inventory: { select: { id: true, quantityOnHand: true } },
      },
    });

    return NextResponse.json(updatedBatch);
  } catch (error) {
    console.error('Error updating inventory batch:', error);
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
 * DELETE /api/inventory/batch - Delete an inventory batch
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id },
      include: { inventory: true },
    });
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check if batch has active inventory
    if (batch.inventory.some(inv => inv.quantityOnHand > 0)) {
      return NextResponse.json(
        { error: 'Cannot delete batch with active inventory' },
        { status: 409 },
      );
    }

    await prisma.batch.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory batch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
