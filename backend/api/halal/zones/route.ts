import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createHalalZoneSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']),
  securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
});

const updateHalalZoneSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
  securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  warehouseId: z.string().optional(),
  temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
  securityLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).optional(),
  sortBy: z.enum(['code', 'name', 'createdAt']).default('code'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * GET /api/halal/zones - Retrieve all halal zones
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, warehouseId, temperature, securityLevel, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (temperature) where.temperature = temperature;
    if (securityLevel) where.securityLevel = securityLevel;

    const [zones, total] = await Promise.all([
      prisma.zone.findMany({
        where,
        include: {
          warehouse: { select: { id: true, code: true, name: true } },
          bins: { select: { id: true, code: true, status: true } },
          robots: { select: { id: true, code: true, status: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.zone.count({ where }),
    ]);

    return NextResponse.json({
      zones,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching halal zones:', error);
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
 * POST /api/halal/zones - Create a new halal zone
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createHalalZoneSchema.parse(body);

    // Check if zone code already exists
    const existingZone = await prisma.zone.findUnique({
      where: { code: data.code },
    });
    if (existingZone) {
      return NextResponse.json(
        { error: 'Zone code already exists' },
        { status: 409 },
      );
    }

    const zone = await prisma.zone.create({
      data,
      include: {
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('Error creating halal zone:', error);
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
 * PUT /api/halal/zones - Update a halal zone
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateHalalZoneSchema.parse(body);

    const existingZone = await prisma.zone.findUnique({
      where: { id },
    });
    if (!existingZone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Check if new code conflicts
    if (data.code && data.code !== existingZone.code) {
      const codeConflict = await prisma.zone.findUnique({
        where: { code: data.code },
      });
      if (codeConflict) {
        return NextResponse.json(
          { error: 'Zone code already exists' },
          { status: 409 },
        );
      }
    }

    const updatedZone = await prisma.zone.update({
      where: { id },
      data,
      include: {
        warehouse: { select: { id: true, code: true, name: true } },
        bins: { select: { id: true, code: true, status: true } },
      },
    });

    return NextResponse.json(updatedZone);
  } catch (error) {
    console.error('Error updating halal zone:', error);
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
 * DELETE /api/halal/zones - Delete a halal zone
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
    }

    const zone = await prisma.zone.findUnique({
      where: { id },
      include: { bins: true, robots: true },
    });
    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Check if zone has active bins or robots
    if (zone.bins.length > 0 || zone.robots.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete zone with active bins or robots' },
        { status: 409 },
      );
    }

    await prisma.zone.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
