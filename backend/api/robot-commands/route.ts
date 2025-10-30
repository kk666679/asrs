import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createCommandSchema = z.object({
  robotId: z.string().min(1, 'Robot ID is required'),
  type: z.enum(['MOVE', 'PICK', 'PLACE', 'SCAN', 'CALIBRATE', 'EMERGENCY_STOP']),
  parameters: z.record(z.any()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  userId: z.string().min(1, 'User ID is required'),
});

const updateCommandSchema = z.object({
  status: z.enum(['PENDING', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  parameters: z.record(z.any()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  errorMessage: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  robotId: z.string().optional(),
  type: z.enum(['MOVE', 'PICK', 'PLACE', 'SCAN', 'CALIBRATE', 'EMERGENCY_STOP']).optional(),
  status: z.enum(['PENDING', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  userId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'priority', 'startedAt', 'completedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/robot-commands - Retrieve all robot commands with optional filtering and pagination
 * Query parameters: page, limit, robotId, type, status, priority, userId, dateFrom, dateTo, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, robotId, type, status, priority, userId, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (robotId) where.robotId = robotId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (userId) where.userId = userId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [commands, total] = await Promise.all([
      prisma.robotCommand.findMany({
        where,
        include: {
          robot: { select: { id: true, code: true, name: true, status: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.robotCommand.count({ where }),
    ]);

    return NextResponse.json({
      commands,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching robot commands:', error);
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
 * POST /api/robot-commands - Create a new robot command
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCommandSchema.parse(body);

    // Check if robot exists and is active
    const robot = await prisma.robot.findUnique({
      where: { id: data.robotId },
      select: { id: true, status: true },
    });

    if (!robot) {
      return NextResponse.json(
        { error: 'Robot not found' },
        { status: 404 },
      );
    }

    if (robot.status === 'MAINTENANCE' || robot.status === 'ERROR') {
      return NextResponse.json(
        { error: 'Robot is not available for commands' },
        { status: 409 },
      );
    }

    const command = await prisma.robotCommand.create({
      data,
      include: {
        robot: { select: { id: true, code: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(command, { status: 201 });
  } catch (error) {
    console.error('Error creating robot command:', error);
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
 * PUT /api/robot-commands - Update a robot command
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Command ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateCommandSchema.parse(body);

    // Check if command exists
    const existingCommand = await prisma.robotCommand.findUnique({
      where: { id },
    });
    if (!existingCommand) {
      return NextResponse.json({ error: 'Robot command not found' }, { status: 404 });
    }

    // Prevent updates to completed commands unless cancelling
    if (existingCommand.status === 'COMPLETED' && data.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot update completed commands' },
        { status: 409 },
      );
    }

    const updatedCommand = await prisma.robotCommand.update({
      where: { id },
      data: {
        ...data,
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
      include: {
        robot: { select: { id: true, code: true, name: true, status: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedCommand);
  } catch (error) {
    console.error('Error updating robot command:', error);
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
 * DELETE /api/robot-commands - Delete a robot command
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Command ID is required' }, { status: 400 });
    }

    // Check if command exists
    const command = await prisma.robotCommand.findUnique({
      where: { id },
    });
    if (!command) {
      return NextResponse.json({ error: 'Robot command not found' }, { status: 404 });
    }

    // Check if command can be deleted
    if (command.status === 'EXECUTING') {
      return NextResponse.json(
        { error: 'Cannot delete commands that are currently executing' },
        { status: 409 },
      );
    }

    if (command.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed commands' },
        { status: 409 },
      );
    }

    await prisma.robotCommand.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Robot command deleted successfully' });
  } catch (error) {
    console.error('Error deleting robot command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
