import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createSensorSchema = z.object({
  code: z.string().min(1, 'Sensor code is required'),
  name: z.string().min(1, 'Sensor name is required'),
  type: z.enum(['TEMPERATURE', 'HUMIDITY', 'WEIGHT', 'PRESSURE', 'MOTION', 'LIGHT', 'VIBRATION']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).default('ACTIVE'),
  location: z.string().optional(),
  binId: z.string().optional(),
  zoneId: z.string().optional(),
  thresholdMin: z.number().optional(),
  thresholdMax: z.number().optional(),
  calibrationDate: z.string().optional(),
  lastMaintenance: z.string().optional(),
});

const updateSensorSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).optional(),
  location: z.string().optional(),
  binId: z.string().optional(),
  zoneId: z.string().optional(),
  thresholdMin: z.number().optional(),
  thresholdMax: z.number().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).optional(),
  type: z.enum(['TEMPERATURE', 'HUMIDITY', 'WEIGHT', 'PRESSURE', 'MOTION', 'LIGHT', 'VIBRATION']).optional(),
  binId: z.string().optional(),
  zoneId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['code', 'name', 'type', 'status', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/sensors - Retrieve all sensors with optional filtering and pagination
 * Query parameters: page, limit, status, type, binId, zoneId, search, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, type, binId, zoneId, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (binId) where.binId = binId;
    if (zoneId) where.zoneId = zoneId;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [sensors, total] = await Promise.all([
      prisma.sensor.findMany({
        where,
        include: {
          bins: { select: { id: true, code: true } },
          zones: { select: { id: true, code: true, name: true } },
          sensor_readings: {
            orderBy: { timestamp: 'desc' },
            take: 1,
            select: { value: true, unit: true, timestamp: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.sensor.count({ where }),
    ]);

    return NextResponse.json({
      sensors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
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
 * POST /api/sensors - Create a new sensor
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSensorSchema.parse(body);

    // Check if sensor code already exists
    const existingSensor = await prisma.sensor.findUnique({
      where: { code: data.code },
    });
    if (existingSensor) {
      return NextResponse.json(
        { error: 'Sensor code already exists' },
        { status: 409 },
      );
    }

    const sensor = await prisma.sensor.create({
      data: {
        ...data,
        calibrationDate: data.calibrationDate ? new Date(data.calibrationDate) : undefined,
        lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
      },
      include: {
        bins: { select: { id: true, code: true } },
        zones: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json(sensor, { status: 201 });
  } catch (error) {
    console.error('Error creating sensor:', error);
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
 * PUT /api/sensors - Update a sensor
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Sensor ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateSensorSchema.parse(body);

    // Check if sensor exists
    const existingSensor = await prisma.sensor.findUnique({
      where: { id },
    });
    if (!existingSensor) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    }

    const updatedSensor = await prisma.sensor.update({
      where: { id },
      data,
      include: {
        bins: { select: { id: true, code: true } },
        zones: { select: { id: true, code: true, name: true } },
        sensor_readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
          select: { value: true, unit: true, timestamp: true },
        },
      },
    });

    return NextResponse.json(updatedSensor);
  } catch (error) {
    console.error('Error updating sensor:', error);
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
 * DELETE /api/sensors - Delete a sensor
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Sensor ID is required' }, { status: 400 });
    }

    // Check if sensor exists
    const sensor = await prisma.sensor.findUnique({
      where: { id },
    });
    if (!sensor) {
      return NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
    }

    await prisma.sensor.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Sensor deleted successfully' });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
