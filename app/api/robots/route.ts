import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/robots - Get all robots with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');

    const robots = await prisma.robot.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
        ...(zoneId && { zoneId }),
      },
      include: {
        zone: {
          select: { id: true, code: true, name: true, temperature: true }
        },
        commands: {
          where: { status: { in: ['PENDING', 'EXECUTING'] } },
          orderBy: { createdAt: 'desc' },
          take: 5 // Get recent active commands
        }
      },
      orderBy: { code: 'asc' }
    });

    return NextResponse.json(robots);
  } catch (error) {
    console.error('Error fetching robots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch robots' },
      { status: 500 }
    );
  }
}

// POST /api/robots - Create a new robot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      name,
      type,
      zoneId,
      location
    } = body;

    // Validate required fields
    if (!code || !name || !type || !zoneId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, type, zoneId' },
        { status: 400 }
      );
    }

    // Check if robot code already exists
    const existingRobot = await prisma.robot.findUnique({
      where: { code }
    });

    if (existingRobot) {
      return NextResponse.json(
        { error: 'Robot code already exists' },
        { status: 409 }
      );
    }

    // Validate zone exists
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId }
    });

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    const robot = await prisma.robot.create({
      data: {
        code,
        name,
        type,
        zoneId,
        location
      },
      include: {
        zone: {
          select: { id: true, code: true, name: true }
        }
      }
    });

    return NextResponse.json(robot, { status: 201 });
  } catch (error) {
    console.error('Error creating robot:', error);
    return NextResponse.json(
      { error: 'Failed to create robot' },
      { status: 500 }
    );
  }
}
