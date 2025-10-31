"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const createHandlingUnitSchema = zod_1.z.object({
    type: zod_1.z.enum(['PALLET', 'CARTON', 'CRATE', 'BIN', 'CONTAINER']),
    barcode: zod_1.z.string().min(1, 'Barcode is required'),
    weight: zod_1.z.number().min(0, 'Weight must be non-negative'),
    dimensions: zod_1.z.object({
        length: zod_1.z.number().min(0),
        width: zod_1.z.number().min(0),
        height: zod_1.z.number().min(0),
    }),
    location: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string().min(1, 'Item ID is required'),
        quantity: zod_1.z.number().min(1, 'Quantity must be at least 1'),
        batchNumber: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().optional(),
    })).optional(),
});
const updateHandlingUnitSchema = zod_1.z.object({
    type: zod_1.z.enum(['PALLET', 'CARTON', 'CRATE', 'BIN', 'CONTAINER']).optional(),
    barcode: zod_1.z.string().min(1).optional(),
    weight: zod_1.z.number().min(0).optional(),
    dimensions: zod_1.z.object({
        length: zod_1.z.number().min(0),
        width: zod_1.z.number().min(0),
        height: zod_1.z.number().min(0),
    }).optional(),
    location: zod_1.z.string().optional(),
    status: zod_1.z.enum(['AVAILABLE', 'IN_TRANSIT', 'DAMAGED', 'QUARANTINED', 'RESERVED']).optional(),
    assignedTo: zod_1.z.string().optional(),
});
const addItemsSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string().min(1, 'Item ID is required'),
        quantity: zod_1.z.number().min(1, 'Quantity must be at least 1'),
        batchNumber: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().optional(),
    })).min(1, 'At least one item is required'),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    status: zod_1.z.enum(['AVAILABLE', 'IN_TRANSIT', 'DAMAGED', 'QUARANTINED', 'RESERVED']).optional(),
    type: zod_1.z.enum(['PALLET', 'CARTON', 'CRATE', 'BIN', 'CONTAINER']).optional(),
    location: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
    barcode: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'updatedAt', 'weight', 'type', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, status, type, location, assignedTo, barcode, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (location)
            where.location = { contains: location, mode: 'insensitive' };
        if (assignedTo)
            where.assignedTo = { contains: assignedTo, mode: 'insensitive' };
        if (barcode)
            where.barcode = { contains: barcode, mode: 'insensitive' };
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
        const transformedUnits = handlingUnits.map(unit => ({
            ...unit,
            dimensions: JSON.parse(unit.dimensions),
        }));
        return server_1.NextResponse.json({
            handlingUnits: transformedUnits,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching handling units:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createHandlingUnitSchema.parse(body);
        const existingUnit = await prisma.handlingUnit.findUnique({
            where: { barcode: data.barcode },
        });
        if (existingUnit) {
            return server_1.NextResponse.json({ error: 'Handling unit with this barcode already exists' }, { status: 409 });
        }
        if (data.items && data.items.length > 0) {
            const itemIds = data.items.map(item => item.itemId);
            const existingItems = await prisma.item.findMany({
                where: { id: { in: itemIds } },
                select: { id: true },
            });
            if (existingItems.length !== itemIds.length) {
                return server_1.NextResponse.json({ error: 'One or more items not found' }, { status: 400 });
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
        const transformedUnit = {
            ...handlingUnit,
            dimensions: JSON.parse(handlingUnit.dimensions),
        };
        return server_1.NextResponse.json(transformedUnit, { status: 201 });
    }
    catch (error) {
        console.error('Error creating handling unit:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ error: 'Handling unit ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateHandlingUnitSchema.parse(body);
        const existingUnit = await prisma.handlingUnit.findUnique({
            where: { id },
        });
        if (!existingUnit) {
            return server_1.NextResponse.json({ error: 'Handling unit not found' }, { status: 404 });
        }
        if (data.barcode && data.barcode !== existingUnit.barcode) {
            const barcodeExists = await prisma.handlingUnit.findUnique({
                where: { barcode: data.barcode },
            });
            if (barcodeExists) {
                return server_1.NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
            }
        }
        const updateData = { ...data };
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
        const transformedUnit = {
            ...updatedUnit,
            dimensions: JSON.parse(updatedUnit.dimensions),
        };
        return server_1.NextResponse.json(transformedUnit);
    }
    catch (error) {
        console.error('Error updating handling unit:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ error: 'Handling unit ID is required' }, { status: 400 });
        }
        const handlingUnit = await prisma.handlingUnit.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!handlingUnit) {
            return server_1.NextResponse.json({ error: 'Handling unit not found' }, { status: 404 });
        }
        if (handlingUnit.status === 'IN_TRANSIT' || handlingUnit.status === 'RESERVED') {
            return server_1.NextResponse.json({ error: 'Cannot delete handling unit that is in transit or reserved' }, { status: 409 });
        }
        await prisma.handlingUnit.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Handling unit deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting handling unit:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map