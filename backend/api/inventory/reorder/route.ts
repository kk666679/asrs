import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createReorderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  reorderQuantity: z.number().min(1, 'Reorder quantity must be at least 1'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  reason: z.string().min(1, 'Reason is required'),
  supplierId: z.string().optional(),
  notes: z.string().optional(),
});

const updateReorderSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
  reorderQuantity: z.number().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  supplierId: z.string().optional(),
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  productId: z.string().optional(),
  locationId: z.string().optional(),
  supplierId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  sortBy: z.enum(['createdAt', 'priority', 'reorderQuantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/inventory/reorder - Retrieve reorder requests with optional filtering and pagination
 * Query parameters: page, limit, productId, locationId, supplierId, status, priority, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, productId, locationId, supplierId, status, priority, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (locationId) where.locationId = locationId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [reorders, total] = await Promise.all([
      prisma.reorder.findMany({
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
          inventory: { select: { id: true, quantityOnHand: true, reorderPoint: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reorder.count({ where }),
    ]);

    return NextResponse.json({
      reorders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reorder requests:', error);
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
 * POST /api/inventory/reorder - Create a new reorder request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createReorderSchema.parse(body);

    // Check if there's already a pending reorder for this product/location
    const existingReorder = await prisma.reorder.findFirst({
      where: {
        productId: data.productId,
        locationId: data.locationId,
        status: { in: ['PENDING', 'APPROVED', 'ORDERED'] },
      },
    });
    if (existingReorder) {
      return NextResponse.json(
        { error: 'A reorder request already exists for this product and location' },
        { status: 409 },
      );
    }

    const reorder = await prisma.reorder.create({
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
        supplier: { select: { id: true, name: true } },
        inventory: { select: { id: true, quantityOnHand: true, reorderPoint: true } },
      },
    });

    return NextResponse.json(reorder, { status: 201 });
  } catch (error) {
    console.error('Error creating reorder request:', error);
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
 * PUT /api/inventory/reorder - Update a reorder request
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Reorder ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateReorderSchema.parse(body);

    // Check if reorder exists
    const existingReorder = await prisma.reorder.findUnique({
      where: { id },
    });
    if (!existingReorder) {
      return NextResponse.json({ error: 'Reorder request not found' }, { status: 404 });
    }

    const updatedReorder = await prisma.reorder.update({
      where: { id },
      data: {
        ...data,
        approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
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
        inventory: { select: { id: true, quantityOnHand: true, reorderPoint: true } },
      },
    });

    return NextResponse.json(updatedReorder);
  } catch (error) {
    console.error('Error updating reorder request:', error);
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
 * DELETE /api/inventory/reorder - Delete a reorder request
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Reorder ID is required' }, { status: 400 });
    }

    // Check if reorder exists
    const reorder = await prisma.reorder.findUnique({
      where: { id },
    });
    if (!reorder) {
      return NextResponse.json({ error: 'Reorder request not found' }, { status: 404 });
    }

    // Check if reorder is in a state that allows deletion
    if (reorder.status === 'RECEIVED') {
      return NextResponse.json(
        { error: 'Cannot delete a reorder request that has been received' },
        { status: 409 },
      );
    }

    await prisma.reorder.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Reorder request deleted successfully' });
  } catch (error) {
    console.error('Error deleting reorder request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
