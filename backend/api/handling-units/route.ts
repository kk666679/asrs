import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const createHandlingUnitSchema = z.object({
  type: z.enum(['PALLET', 'CARTON', 'CRATE', 'BIN', 'CONTAINER']),
  barcode: z.string().min(1, 'Barcode is required'),
  weight: z.number().min(0, 'Weight must be non-negative'),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
  })).optional(),
});

const updateHandlingUnitSchema = z.object({
  type: z.enum(['PALLET', 'CARTON', 'CRATE', 'BIN', 'CONTAINER']).optional(),
  barcode: z.string().min(1).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
  }).optional(),
  location: z.string().optional(),
  status: z.enum(['AVAILABLE', 'IN_TRANSIT', 'DAMAGED', 'QUARANTINED', 'RESERVED']).optional(),
  assignedTo: z.string().optional(),
});

const addItemsSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    batchNumber: z.string().optional(),
    expiryDate: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['AVAILABLE', 'IN_TRANSIT', 'DAMAGED', 'QUARANTINED', 'RESERVED']).optional(),
  type: z.enum(['PALLET', 'CARTON', 'CRATE', 'BIN', 'CONTAINER']).optional(),
  location: z.string().optional(),
  assignedTo: z.string().optional(),
  barcode: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'weight', 'type', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/handling-units - Retrieve all handling units with optional filtering and pagination
 * Query parameters: page, limit, status, type, location, assignedTo, barcode, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, status, type, location, assignedTo, barcode, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (assignedTo) where.assignedTo = { contains: assignedTo, mode: 'insensitive' };
    if (barcode) where.barcode = { contains: barcode, mode: 'insensitive' };

    const [handlingUnits, total] = await Promise.all([
      prisma.handlingUnit.findMany({
        where,
        include: {
          items: {
            include: {
              item: { select: { id: true, sku: true, name: true } },
            },
          },
          bin: { select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.handlingUnit.count({ where }),
    ]);

    // Transform dimensions from JSON string to object
    const transformedUnits = handlingUnits.map(unit => ({
      ...unit,
      dimensions: JSON.parse(unit.dimensions),
    }));

    return NextResponse.json({
      handlingUnits: transformedUnits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching handling units:', error);
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
 * POST /api/handling-units - Create a new handling unit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createHandlingUnitSchema.parse(body);

    // Check if barcode already exists
    const existingUnit = await prisma.handlingUnit.findUnique({
      where: { barcode: data.barcode },
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: 'Handling unit with this barcode already exists' },
        { status: 409 },
      );
    }

    // Validate items exist
    if (data.items && data.items.length > 0) {
      const itemIds = data.items.map(item => item.itemId);
      const existingItems = await prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true },
      });

      if (existingItems.length !== itemIds.length) {
        return NextResponse.json(
          { error: 'One or more items not found' },
          { status: 400 },
        );
      }
    }

    const handlingUnit = await prisma.handlingUnit.create({
      data: {
        type: data.type,
        barcode: data.barcode,
        weight: data.weight,
        dimensions: JSON.stringify(data.dimensions),
        location: data.location,
        assignedTo: data.assignedTo,
        items: data.items ? {
          create: data.items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          })),
        } : undefined,
      },
      include: {
        items: {
          include: {
            item: { select: { id: true, sku: true, name: true } },
          },
        },
        bin: { select: { id: true, code: true } },
        user: { select: { id: true, name: true } },
      },
    });

    // Transform dimensions back to object
    const transformedUnit = {
      ...handlingUnit,
      dimensions: JSON.parse(handlingUnit.dimensions),
    };

    return NextResponse.json(transformedUnit, { status: 201 });
  } catch (error) {
    console.error('Error creating handling unit:', error);
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
 * PUT /api/handling-units - Update a handling unit
 * Query parameter: id (required)
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Handling unit ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateHandlingUnitSchema.parse(body);

    // Check if handling unit exists
    const existingUnit = await prisma.handlingUnit.findUnique({
      where: { id },
    });
    if (!existingUnit) {
      return NextResponse.json({ error: 'Handling unit not found' }, { status: 404 });
    }

    // Check barcode uniqueness if updating
    if (data.barcode && data.barcode !== existingUnit.barcode) {
      const barcodeExists = await prisma.handlingUnit.findUnique({
        where: { barcode: data.barcode },
      });
      if (barcodeExists) {
        return NextResponse.json(
          { error: 'Barcode already exists' },
          { status: 409 },
        );
      }
    }

    const updateData: any = { ...data };
    if (data.dimensions) {
      updateData.dimensions = JSON.stringify(data.dimensions);
    }

    const updatedUnit = await prisma.handlingUnit.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            item: { select: { id: true, sku: true, name: true } },
          },
        },
        bin: { select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
        user: { select: { id: true, name: true } },
      },
    });

    // Transform dimensions back to object
    const transformedUnit = {
      ...updatedUnit,
      dimensions: JSON.parse(updatedUnit.dimensions),
    };

    return NextResponse.json(transformedUnit);
  } catch (error) {
    console.error('Error updating handling unit:', error);
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
 * DELETE /api/handling-units - Delete a handling unit
 * Query parameter: id (required)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Handling unit ID is required' }, { status: 400 });
    }

    // Check if handling unit exists
    const handlingUnit = await prisma.handlingUnit.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!handlingUnit) {
      return NextResponse.json({ error: 'Handling unit not found' }, { status: 404 });
    }

    // Check if unit can be deleted (not in transit or reserved)
    if (handlingUnit.status === 'IN_TRANSIT' || handlingUnit.status === 'RESERVED') {
      return NextResponse.json(
        { error: 'Cannot delete handling unit that is in transit or reserved' },
        { status: 409 },
      );
    }

    await prisma.handlingUnit.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Handling unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting handling unit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
