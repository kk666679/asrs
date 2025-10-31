import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createReplenishmentSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  binId: z.string().min(1, 'Bin ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  reason: z.enum(['LOW_STOCK', 'OPTIMIZATION', 'SEASONAL', 'DEMAND_SPIKE', 'REBALANCE']).default('LOW_STOCK'),
  scheduledDate: z.string(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

const updateReplenishmentSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
  quantity: z.number().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  scheduledDate: z.string().optional(),
  actualStartDate: z.string().optional(),
  completedDate: z.string().optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  issues: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  itemId: z.string().optional(),
  binId: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  reason: z.enum(['LOW_STOCK', 'OPTIMIZATION', 'SEASONAL', 'DEMAND_SPIKE', 'REBALANCE']).optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['scheduledDate', 'priority', 'createdAt', 'completedDate']).default('scheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * GET /api/slotting/replenishment - Retrieve all replenishment operations with optional filtering and pagination
 * Query parameters: page, limit, itemId, binId, status, priority, reason, assignedTo, dateFrom, dateTo, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, itemId, binId, status, priority, reason, assignedTo, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (itemId) where.itemId = itemId;
    if (binId) where.binId = binId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (reason) where.reason = reason;
    if (assignedTo) where.assignedTo = assignedTo;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduledDate.lte = new Date(dateTo);
    }

    const [replenishments, total] = await Promise.all([
      prisma.replenishment.findMany({
        where,
        include: {
          item: { select: { id: true, sku: true, name: true, minStock: true, maxStock: true } },
          bin: { select: { id: true, code: true, capacity: true, currentLoad: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
        assignedUser: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.replenishment.count({ where }),
    ]);

    return NextResponse.json({
      replenishments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching replenishment operations:', error);
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
 * POST /api/slotting/replenishment - Create a new replenishment operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createReplenishmentSchema.parse(body);

    // Check if item and bin exist
    const [item, bin] = await Promise.all([
      prisma.item.findUnique({
        where: { id: data.itemId },
        select: { id: true, name: true },
      }),
      prisma.bin.findUnique({
        where: { id: data.binId },
        select: { id: true, status: true, capacity: true, currentLoad: true },
      }),
    ]);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 },
      );
    }

    if (!bin) {
      return NextResponse.json(
        { error: 'Bin not found' },
        { status: 404 },
      );
    }

    if (bin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Bin is not active' },
        { status: 409 },
      );
    }

    // Check if bin has capacity for the replenishment
    if (bin.currentLoad + data.quantity > bin.capacity) {
      return NextResponse.json(
        { error: 'Bin does not have sufficient capacity for this replenishment' },
        { status: 409 },
      );
    }

    const replenishment = await prisma.replenishment.create({
      data: {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
      },
      include: {
        item: { select: { id: true, sku: true, name: true } },
        bin: { select: { id: true, code: true, capacity: true, currentLoad: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(replenishment, { status: 201 });
  } catch (error) {
    console.error('Error creating replenishment operation:', error);
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
 * PUT /api/slotting/replenishment - Update a replenishment operation
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Replenishment ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateReplenishmentSchema.parse(body);

    // Check if replenishment operation exists
    const existingReplenishment = await prisma.replenishment.findUnique({
      where: { id },
    });
    if (!existingReplenishment) {
      return NextResponse.json({ error: 'Replenishment operation not found' }, { status: 404 });
    }

    // Prevent updates to completed operations unless cancelling
    if (existingReplenishment.status === 'COMPLETED' && data.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot update completed replenishment operations' },
        { status: 409 },
      );
    }

    const updatedReplenishment = await prisma.replenishment.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      },
      include: {
        item: { select: { id: true, sku: true, name: true, minStock: true, maxStock: true } },
        bin: { select: { id: true, code: true, capacity: true, currentLoad: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedReplenishment);
  } catch (error) {
    console.error('Error updating replenishment operation:', error);
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
 * DELETE /api/slotting/replenishment - Delete a replenishment operation
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Replenishment ID is required' }, { status: 400 });
    }

    // Check if replenishment operation exists
    const replenishment = await prisma.replenishment.findUnique({
      where: { id },
    });
    if (!replenishment) {
      return NextResponse.json({ error: 'Replenishment operation not found' }, { status: 404 });
    }

    // Check if operation can be deleted
    if (replenishment.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed replenishment operations' },
        { status: 409 },
      );
    }

    if (replenishment.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete replenishment operations that are in progress' },
        { status: 409 },
      );
    }

    await prisma.replenishment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Replenishment operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting replenishment operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
