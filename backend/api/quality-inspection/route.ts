import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createInspectionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  inspectionType: z.enum(['VISUAL', 'DIMENSIONAL', 'WEIGHT', 'BARCODE', 'EXPIRY', 'TEMPERATURE']),
  status: z.enum(['PENDING', 'PASSED', 'FAILED', 'IN_PROGRESS']).default('PENDING'),
  inspectorId: z.string().min(1, 'Inspector ID is required'),
  notes: z.string().optional(),
  measurements: z.record(z.any()).optional(),
  defects: z.array(z.object({
    type: z.string(),
    severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']),
    description: z.string(),
  })).optional(),
});

const updateInspectionSchema = z.object({
  status: z.enum(['PENDING', 'PASSED', 'FAILED', 'IN_PROGRESS']).optional(),
  notes: z.string().optional(),
  measurements: z.record(z.any()).optional(),
  defects: z.array(z.object({
    type: z.string(),
    severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']),
    description: z.string(),
  })).optional(),
  completedAt: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  itemId: z.string().optional(),
  inspectionType: z.enum(['VISUAL', 'DIMENSIONAL', 'WEIGHT', 'BARCODE', 'EXPIRY', 'TEMPERATURE']).optional(),
  status: z.enum(['PENDING', 'PASSED', 'FAILED', 'IN_PROGRESS']).optional(),
  inspectorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['createdAt', 'completedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/quality-inspection - Retrieve all quality inspections with optional filtering and pagination
 * Query parameters: page, limit, itemId, inspectionType, status, inspectorId, dateFrom, dateTo, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, itemId, inspectionType, status, inspectorId, dateFrom, dateTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (itemId) where.itemId = itemId;
    if (inspectionType) where.inspectionType = inspectionType;
    if (status) where.status = status;
    if (inspectorId) where.inspectorId = inspectorId;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [inspections, total] = await Promise.all([
      prisma.qualityInspection.findMany({
        where,
        include: {
          item: { select: { id: true, sku: true, name: true } },
          inspector: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.qualityInspection.count({ where }),
    ]);

    return NextResponse.json({
      inspections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
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
 * POST /api/quality-inspection - Create a new quality inspection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInspectionSchema.parse(body);

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: data.itemId },
      select: { id: true },
    });
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 },
      );
    }

    // Check if inspector exists
    const inspector = await prisma.user.findUnique({
      where: { id: data.inspectorId },
      select: { id: true, role: true },
    });
    if (!inspector) {
      return NextResponse.json(
        { error: 'Inspector not found' },
        { status: 404 },
      );
    }

    const inspection = await prisma.qualityInspection.create({
      data,
      include: {
        item: { select: { id: true, sku: true, name: true } },
        inspector: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(inspection, { status: 201 });
  } catch (error) {
    console.error('Error creating quality inspection:', error);
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
 * PUT /api/quality-inspection - Update a quality inspection
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Inspection ID is required' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const data = updateInspectionSchema.parse(body);

    // Check if inspection exists
    const existingInspection = await prisma.qualityInspection.findUnique({
      where: { id },
    });
    if (!existingInspection) {
      return NextResponse.json(
        { error: 'Quality inspection not found' },
        { status: 404 },
      );
    }

    const updatedInspection = await prisma.qualityInspection.update({
      where: { id },
      data: {
        ...data,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      },
      include: {
        item: { select: { id: true, sku: true, name: true } },
        inspector: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedInspection);
  } catch (error) {
    console.error('Error updating quality inspection:', error);
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
 * DELETE /api/quality-inspection - Delete a quality inspection
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Inspection ID is required' },
        { status: 400 },
      );
    }

    // Check if inspection exists
    const inspection = await prisma.qualityInspection.findUnique({
      where: { id },
    });
    if (!inspection) {
      return NextResponse.json(
        { error: 'Quality inspection not found' },
        { status: 404 },
      );
    }

    // Check if inspection can be deleted
    if (inspection.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete inspections that are in progress' },
        { status: 409 },
      );
    }

    await prisma.qualityInspection.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Quality inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality inspection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
