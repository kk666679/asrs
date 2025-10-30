import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createCrossDockingSchema = z.object({
  inboundShipmentId: z.string().min(1, 'Inbound shipment ID is required'),
  outboundShipmentId: z.string().min(1, 'Outbound shipment ID is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  scheduledDate: z.string(),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 minute'),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
});

const updateCrossDockingSchema = z.object({
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
  inboundShipmentId: z.string().optional(),
  outboundShipmentId: z.string().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['scheduledDate', 'priority', 'createdAt', 'completedDate']).default('scheduledDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * GET /api/cross-docking - Retrieve all cross-docking operations with optional filtering and pagination
 * Query parameters: page, limit, status, priority, inboundShipmentId, outboundShipmentId, assignedTo, dateFrom, dateTo, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, priority, inboundShipmentId, outboundShipmentId, assignedTo, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (inboundShipmentId) where.inboundShipmentId = inboundShipmentId;
    if (outboundShipmentId) where.outboundShipmentId = outboundShipmentId;
    if (assignedTo) where.assignedTo = assignedTo;
    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = new Date(dateFrom);
      if (dateTo) where.scheduledDate.lte = new Date(dateTo);
    }

    const [crossDockingOperations, total] = await Promise.all([
      prisma.crossDocking.findMany({
        where,
        include: {
          inboundShipment: { select: { id: true, shipmentNumber: true, status: true, carrier: true } },
          outboundShipment: { select: { id: true, shipmentNumber: true, status: true, carrier: true } },
          assignedUser: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, sku: true, name: true } },
              sourceLocation: { select: { id: true, code: true } },
              destinationLocation: { select: { id: true, code: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.crossDocking.count({ where }),
    ]);

    return NextResponse.json({
      crossDocking: crossDockingOperations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cross-docking operations:', error);
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
 * POST /api/cross-docking - Create a new cross-docking operation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCrossDockingSchema.parse(body);

    // Check if shipments exist and are in appropriate states
    const [inboundShipment, outboundShipment] = await Promise.all([
      prisma.shipment.findUnique({
        where: { id: data.inboundShipmentId },
        select: { id: true, status: true },
      }),
      prisma.shipment.findUnique({
        where: { id: data.outboundShipmentId },
        select: { id: true, status: true },
      }),
    ]);

    if (!inboundShipment) {
      return NextResponse.json(
        { error: 'Inbound shipment not found' },
        { status: 404 },
      );
    }

    if (!outboundShipment) {
      return NextResponse.json(
        { error: 'Outbound shipment not found' },
        { status: 404 },
      );
    }

    if (inboundShipment.status !== 'RECEIVED' && inboundShipment.status !== 'IN_TRANSIT') {
      return NextResponse.json(
        { error: 'Inbound shipment must be received or in transit for cross-docking' },
        { status: 400 },
      );
    }

    if (outboundShipment.status !== 'PENDING' && outboundShipment.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: 'Outbound shipment must be pending or scheduled for cross-docking' },
        { status: 400 },
      );
    }

    const crossDocking = await prisma.crossDocking.create({
      data: {
        ...data,
        scheduledDate: new Date(data.scheduledDate),
      },
      include: {
        inboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
        outboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(crossDocking, { status: 201 });
  } catch (error) {
    console.error('Error creating cross-docking operation:', error);
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
 * PUT /api/cross-docking - Update a cross-docking operation
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Cross-docking ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateCrossDockingSchema.parse(body);

    // Check if cross-docking operation exists
    const existingCrossDocking = await prisma.crossDocking.findUnique({
      where: { id },
    });
    if (!existingCrossDocking) {
      return NextResponse.json({ error: 'Cross-docking operation not found' }, { status: 404 });
    }

    // Prevent updates to completed operations unless cancelling
    if (existingCrossDocking.status === 'COMPLETED' && data.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot update completed cross-docking operations' },
        { status: 409 },
      );
    }

    const updatedCrossDocking = await prisma.crossDocking.update({
      where: { id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      },
      include: {
        inboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
        outboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
        assignedUser: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, sku: true, name: true } },
            sourceLocation: { select: { id: true, code: true } },
            destinationLocation: { select: { id: true, code: true } },
          },
        },
      },
    });

    return NextResponse.json(updatedCrossDocking);
  } catch (error) {
    console.error('Error updating cross-docking operation:', error);
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
 * DELETE /api/cross-docking - Delete a cross-docking operation
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Cross-docking ID is required' }, { status: 400 });
    }

    // Check if cross-docking operation exists
    const crossDocking = await prisma.crossDocking.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!crossDocking) {
      return NextResponse.json({ error: 'Cross-docking operation not found' }, { status: 404 });
    }

    // Check if operation can be deleted
    if (crossDocking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed cross-docking operations' },
        { status: 409 },
      );
    }

    if (crossDocking.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete cross-docking operations that are in progress' },
        { status: 409 },
      );
    }

    await prisma.crossDocking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cross-docking operation deleted successfully' });
  } catch (error) {
    console.error('Error deleting cross-docking operation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
