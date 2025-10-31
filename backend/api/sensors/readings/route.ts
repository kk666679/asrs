import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createReadingSchema = z.object({
  sensorId: z.string().min(1, 'Sensor ID is required'),
  value: z.number(),
  unit: z.string().min(1, 'Unit is required'),
  timestamp: z.string().optional(),
});

const querySchema = z.object({
  sensorId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  page: z.coerce.number().min(1).default(1),
});

/**
 * GET /api/sensors/readings - Retrieve sensor readings with optional filtering
 * Query parameters: sensorId, startDate, endDate, limit, page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { sensorId, startDate, endDate, limit, page } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (sensorId) where.sensorId = sensorId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [readings, total] = await Promise.all([
      prisma.sensorReading.findMany({
        where,
        include: {
          sensors: {
            select: { id: true, code: true, name: true, type: true },
          },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sensorReading.count({ where }),
    ]);

    return NextResponse.json({
      readings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
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
 * POST /api/sensors/readings - Create a new sensor reading
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createReadingSchema.parse(body);

    // Check if sensor exists
    const sensor = await prisma.sensor.findUnique({
      where: { id: data.sensorId },
    });
    if (!sensor) {
      return NextResponse.json(
        { error: 'Sensor not found' },
        { status: 404 },
      );
    }

    const reading = await prisma.sensorReading.create({
      data: {
        sensorId: data.sensorId,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      },
      include: {
        sensors: {
          select: { id: true, code: true, name: true, type: true },
        },
      },
    });

    return NextResponse.json(reading, { status: 201 });
  } catch (error) {
    console.error('Error creating sensor reading:', error);
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
