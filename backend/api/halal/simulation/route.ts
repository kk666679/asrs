import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createSimulationSchema = z.object({
  scenarioName: z.string().min(1, 'Scenario name is required'),
  description: z.string().optional(),
  parameters: z.record(z.any()),
  baselineMetrics: z.record(z.any()),
  projectedOutcome: z.record(z.any()),
  createdBy: z.string().optional(),
});

const updateSimulationSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  actualOutcome: z.record(z.any()).optional(),
  executedAt: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  sortBy: z.enum(['scenarioName', 'createdAt', 'executedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/halal/simulation - Retrieve all simulation scenarios
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [scenarios, total] = await Promise.all([
      prisma.simulationScenario.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.simulationScenario.count({ where }),
    ]);

    return NextResponse.json({
      scenarios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching simulations:', error);
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
 * POST /api/halal/simulation - Create a new simulation scenario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSimulationSchema.parse(body);

    const scenario = await prisma.simulationScenario.create({
      data,
    });

    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    console.error('Error creating simulation:', error);
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
 * PUT /api/halal/simulation - Update a simulation scenario
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Simulation ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateSimulationSchema.parse(body);

    const existingScenario = await prisma.simulationScenario.findUnique({
      where: { id },
    });
    if (!existingScenario) {
      return NextResponse.json({ error: 'Simulation scenario not found' }, { status: 404 });
    }

    const updatedScenario = await prisma.simulationScenario.update({
      where: { id },
      data: {
        ...data,
        executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
      },
    });

    return NextResponse.json(updatedScenario);
  } catch (error) {
    console.error('Error updating simulation:', error);
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
 * DELETE /api/halal/simulation - Delete a simulation scenario
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Simulation ID is required' }, { status: 400 });
    }

    const scenario = await prisma.simulationScenario.findUnique({
      where: { id },
    });
    if (!scenario) {
      return NextResponse.json({ error: 'Simulation scenario not found' }, { status: 404 });
    }

    await prisma.simulationScenario.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Simulation scenario deleted successfully' });
  } catch (error) {
    console.error('Error deleting simulation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
