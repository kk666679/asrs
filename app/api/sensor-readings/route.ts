import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/sensor-readings - Get sensor readings with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sensorId = searchParams.get('sensorId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const hours = parseInt(searchParams.get('hours') || '24'); // Default to last 24 hours

    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const readings = await prisma.sensorReading.findMany({
      where: {
        ...(sensorId && { sensorId }),
        ...(type && {
          sensor: { type: type as any }
        }),
        timestamp: {
          gte: startDate
        }
      },
      include: {
        sensor: {
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            thresholdMin: true,
            thresholdMax: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: Math.min(limit, 1000) // Max 1000 readings
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor readings' },
      { status: 500 }
    );
  }
}

// POST /api/sensor-readings - Create sensor readings (bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both single reading and bulk readings
    const readings = Array.isArray(body) ? body : [body];

    if (readings.length === 0) {
      return NextResponse.json(
        { error: 'No readings provided' },
        { status: 400 }
      );
    }

    // Validate all readings
    for (const reading of readings) {
      const { sensorId, value, unit, quality } = reading;

      if (!sensorId || value === undefined || !unit) {
        return NextResponse.json(
          { error: 'Missing required fields: sensorId, value, unit' },
          { status: 400 }
        );
      }

      // Check if sensor exists
      const sensor = await prisma.sensor.findUnique({
        where: { id: sensorId }
      });

      if (!sensor) {
        return NextResponse.json(
          { error: `Sensor ${sensorId} not found` },
          { status: 404 }
        );
      }

      // Validate value against thresholds if they exist
      if (sensor.thresholdMin !== null && value < sensor.thresholdMin) {
        console.warn(`Sensor ${sensor.code}: Value ${value} below threshold ${sensor.thresholdMin}`);
      }

      if (sensor.thresholdMax !== null && value > sensor.thresholdMax) {
        console.warn(`Sensor ${sensor.code}: Value ${value} above threshold ${sensor.thresholdMax}`);
      }
    }

    // Create readings in transaction
    const createdReadings = await prisma.$transaction(
      readings.map(reading => prisma.sensorReading.create({
        data: {
          sensorId: reading.sensorId,
          value: reading.value,
          unit: reading.unit,
          quality: reading.quality || 100,
          timestamp: reading.timestamp ? new Date(reading.timestamp) : new Date()
        },
        include: {
          sensor: {
            select: { id: true, code: true, name: true, type: true }
          }
        }
      }))
    );

    return NextResponse.json(createdReadings, { status: 201 });
  } catch (error) {
    console.error('Error creating sensor readings:', error);
    return NextResponse.json(
      { error: 'Failed to create sensor readings' },
      { status: 500 }
    );
  }
}
