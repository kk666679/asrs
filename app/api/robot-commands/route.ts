import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/robot-commands - Get robot commands with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const robotId = searchParams.get('robotId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');

    const commands = await prisma.robotCommand.findMany({
      where: {
        ...(robotId && { robotId }),
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
      },
      include: {
        robot: {
          select: { id: true, code: true, name: true, type: true, status: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 200) // Max 200 commands
    });

    return NextResponse.json(commands);
  } catch (error) {
    console.error('Error fetching robot commands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch robot commands' },
      { status: 500 }
    );
  }
}

// POST /api/robot-commands - Create a new robot command
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      robotId,
      type,
      parameters,
      priority,
      userId
    } = body;

    // Validate required fields
    if (!robotId || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: robotId, type, userId' },
        { status: 400 }
      );
    }

    // Validate robot exists and is operational
    const robot = await prisma.robot.findUnique({
      where: { id: robotId }
    });

    if (!robot) {
      return NextResponse.json(
        { error: 'Robot not found' },
        { status: 404 }
      );
    }

    if (robot.status === 'MAINTENANCE' || robot.status === 'ERROR') {
      return NextResponse.json(
        { error: `Robot is currently ${robot.status.toLowerCase()}` },
        { status: 409 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate command type and parameters
    const validTypes = ['MOVE', 'PICK', 'PLACE', 'SCAN', 'CALIBRATE', 'EMERGENCY_STOP'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid command type' },
        { status: 400 }
      );
    }

    // Emergency stop should be high priority
    const commandPriority = type === 'EMERGENCY_STOP' ? 'URGENT' : (priority || 'MEDIUM');

    const command = await prisma.robotCommand.create({
      data: {
        robotId,
        type,
        parameters,
        priority: commandPriority,
        userId
      },
      include: {
        robot: {
          select: { id: true, code: true, name: true, status: true }
        },
        user: {
          select: { id: true, name: true }
        }
      }
    });

    // If emergency stop, update robot status
    if (type === 'EMERGENCY_STOP') {
      await prisma.robot.update({
        where: { id: robotId },
        data: { status: 'ERROR' }
      });
    }

    return NextResponse.json(command, { status: 201 });
  } catch (error) {
    console.error('Error creating robot command:', error);
    return NextResponse.json(
      { error: 'Failed to create robot command' },
      { status: 500 }
    );
  }
}
