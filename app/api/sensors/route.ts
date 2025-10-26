import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/sensors - Get all sensors with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');
    const binId = searchParams.get('binId');

    const sensors = await prisma.sensor.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
        ...(zoneId && { zoneId }),
        ...(binId && { binId }),
      },
      include: {
        zone: {
          select: { id: true, code: true, name: true, temperature: true }
        },
        bin: {
          select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } }
        },
        readings: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Get latest reading
        }
      },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json(sensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensors' },
      { status: 500 }
    );
  }
}

// POST /api/sensors - Create a new sensor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      type,
      location,
      binId,
      zoneId,
      thresholdMin,
      thresholdMax
    } = body;

    // Validate required fields
    if (!code || !name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, type' },
        { status: 400 }
      );
    }

    // Check if sensor code already exists
    const existingSensor = await prisma.sensor.findUnique({
      where: { code }
    });

    if (existingSensor) {
      return NextResponse.json(
        { error: 'Sensor code already exists' },
        { status: 409 }
      );
    }

    // Validate bin and zone relationship
    if (binId) {
      const bin = await prisma.bin.findUnique({
        where: { id: binId },
        include: { rack: { include: { aisle: { include: { zone: true } } } } }
      });

      if (!bin) {
        return NextResponse.json(
          { error: 'Bin not found' },
          { status: 404 }
        );
      }

      // If binId is provided, zoneId should match the bin's zone
      if (zoneId && bin.rack.aisle.zone.id !== zoneId) {
        return NextResponse.json(
          { error: 'Bin does not belong to the specified zone' },
          { status: 400 }
        );
      }
    }

    const sensor = await prisma.sensor.create({
      data: {
        code,
        name,
        type,
        location,
        binId,
        zoneId: zoneId || (binId ? undefined : null), // Use zone from bin if not specified
        thresholdMin,
        thresholdMax
      },
      include: {
        zone: {
          select: { id: true, code: true, name: true }
        },
        bin: {
          select: { id: true, code: true }
        }
      }
    });

    return NextResponse.json(sensor, { status: 201 });
  } catch (error) {
    console.error('Error creating sensor:', error);
    return NextResponse.json(
      { error: 'Failed to create sensor' },
      { status: 500 }
    );
  }
}
