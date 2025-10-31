import { NextRequest, NextResponse } from 'next/server';
import { RoboticsService } from '@/lib/services/robotics';
import { prisma } from '@/lib/db';

const roboticsService = new RoboticsService();

// GET /api/robots - Get robots with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const zoneId = searchParams.get('zoneId');
    const search = searchParams.get('search');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (zoneId) where.zoneId = zoneId;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [robots, total] = await Promise.all([
      prisma.robot.findMany({
        where,
        include: {
          zone: { select: { id: true, code: true, name: true } },
          commands: {
            where: { status: { in: ['PENDING', 'EXECUTING'] } },
            select: { id: true, type: true, status: true, priority: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 5
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.robot.count({ where }),
    ]);

    return NextResponse.json({
      robots,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching robots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/robots - Create new robot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, type, status, location, zoneId, batteryLevel, specifications } = body;

    // Check if robot code already exists
    const existingRobot = await prisma.robot.findUnique({
      where: { code },
    });
    if (existingRobot) {
      return NextResponse.json(
        { error: 'Robot code already exists' },
        { status: 409 }
      );
    }

    const robot = await prisma.robot.create({
      data: {
        code,
        name,
        type,
        status: status || 'IDLE',
        location,
        zoneId,
        batteryLevel: batteryLevel || 100,
        specifications,
      },
      include: {
        zone: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json(robot, { status: 201 });
  } catch (error) {
    console.error('Error creating robot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/robots - Update robot
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Robot ID required' }, { status: 400 });
    }

    const body = await request.json();
    const robot = await prisma.robot.update({
      where: { id },
      data: body,
      include: {
        zone: { select: { id: true, code: true, name: true } },
        commands: {
          where: { status: { in: ['PENDING', 'EXECUTING'] } },
          select: { id: true, type: true, status: true, priority: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
      },
    });

    return NextResponse.json(robot);
  } catch (error) {
    console.error('Error updating robot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/robots - Delete robot
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Robot ID required' }, { status: 400 });
    }

    // Check if robot has active commands
    const activeCommands = await prisma.robotCommand.count({
      where: {
        robotId: id,
        status: { in: ['PENDING', 'EXECUTING'] },
      },
    });
    if (activeCommands > 0) {
      return NextResponse.json(
        { error: 'Cannot delete robot with active commands' },
        { status: 409 }
      );
    }

    await prisma.robot.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Robot deleted successfully' });
  } catch (error) {
    console.error('Error deleting robot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
