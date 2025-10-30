import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createPutawaySchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  scheduledDate: z.string(),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 minute'),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

const updatePutawaySchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  scheduledDate: z.string().optional(),
  actualStartDate: z.string().optional(),
  completedDate: z.string().optional(),
  estimatedDuration: z.number().min(1).optional(),
  actualDuration: z.number().min(0).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  issues: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  shipmentId: z.string().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['scheduledDate', 'priority', 'createdAt', 'completedDate']).default('scheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * GET /api/putaway - Retrieve all putaway operations with optional filtering and pagination
 * Query parameters: page, limit, status, priority, shipmentId, assignedTo, dateFrom, dateTo, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, priority, shipmentId, assignedTo, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (shipmentId) where.shipmentId = shipmentId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduledDate.lte = new Date(dateTo);
    }

    const [putawayOperations, total] = await Promise.all([
      prisma.putaway.findMany({
        where,
        include: {
          shipment: { select: { id: true, shipmentNumber: true, status: true, supplier: { select: { name: true } } } },
          assignedUser: { select: { id: true, name: true } },
          items: {
            include: {
              item: { select: { id: true, sku: true, name: true } },
              bin: { select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.putaway.count({ where }),
    ]);

    return NextResponse.json({
      putaway: putawayOperations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching putaway operations:', error);
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
 * POST /api/putaway - Create a new putaway operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createPutawaySchema.parse(body);

    // Check if shipment exists and is in appropriate state
    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId },
      select: { id: true, status: true, type: true },
    });

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 },
      );
    }

    if (shipment.type !== 'INBOUND') {
      return NextResponse.json(
        { error: 'Putaway operations can only be created for inbound shipments' },
        { status: 400 },
      );
    }

    if (shipment.status !== 'RECEIVED' && shipment.status !== 'PARTIALLY_RECEIVED') {
      return NextResponse.json(
        { error: 'Shipment must be received or partially received for putaway' },
        { status: 400 },
      );
    }

    // Check if putaway already exists for this shipment
    const existingPutaway = await prisma.putaway.findFirst({
      where: { shipmentId: data.shipmentId },
    });

    if (existingPutaway) {
      return NextResponse.json(
        { error: 'Putaway operation already exists for this shipment' },
        { status: 409 },
      );
    }

    const putaway = await prisma.putaway.create({
      data: {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
      },
      include: {
        shipment: { select: { id: true, shipmentNumber: true, status: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(putaway, { status: 201 });
  } catch (error) {
    console.error('Error creating putaway operation:', error);
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
 * PUT /api/putaway - Update a putaway operation
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Putaway ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updatePutawaySchema.parse(body);

    // Check if putaway operation exists
    const existingPutaway = await prisma.putaway.findUnique({
      where: { id },
    });
    if (!existingPutaway) {
      return NextResponse.json({ error: 'Putaway operation not found' }, { status: 404 });
    }

    // Prevent updates to completed operations unless cancelling
    if (existingPutaway.status === 'COMPLETED' && data.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot update completed putaway operations' },
        { status: 409 },
      );
    }

    const updatedPutaway = await prisma.putaway.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      },
      include: {
        shipment: { select: { id: true, shipmentNumber: true, status: true } },
        assignedUser: { select: { id: true, name: true } },
        items: {
          include: {
            item: { select: { id: true, sku: true, name: true } },
            bin: { select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
          },
        },
      },
    });

    return NextResponse.json(updatedPutaway);
  } catch (error) {
    console.error('Error updating putaway operation:', error);
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
 * DELETE /api/putaway - Delete a putaway operation
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Putaway ID is required' }, { status: 400 });
    }

    // Check if putaway operation exists
    const putaway = await prisma.putaway.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!putaway) {
      return NextResponse.json({ error: 'Putaway operation not found' }, { status: 404 });
    }

    // Check if operation can be deleted
    if (putaway.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed putaway operations' },
        { status: 409 },
      );
    }

    if (putaway.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete putaway operations that are in progress' },
        { status: 409 },
      );
    }

    await prisma.putaway.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Putaway operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting putaway operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
