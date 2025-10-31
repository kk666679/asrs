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
const createBatchSchema = zod_1.z.object({
    batchNumber: zod_1.z.string().min(1, 'Batch number is required'),
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    expiryDate: zod_1.z.string().optional(),
    manufacturedDate: zod_1.z.string().optional(),
    quantity: zod_1.z.number().min(0, 'Quantity must be non-negative'),
    locationId: zod_1.z.string().min(1, 'Location ID is required'),
    supplierId: zod_1.z.string().optional(),
    cost: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().optional(),
});
const updateBatchSchema = zod_1.z.object({
    expiryDate: zod_1.z.string().optional(),
    manufacturedDate: zod_1.z.string().optional(),
    quantity: zod_1.z.number().min(0).optional(),
    locationId: zod_1.z.string().optional(),
    supplierId: zod_1.z.string().optional(),
    cost: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'EXPIRED', 'QUARANTINED', 'RECALLED']).optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    productId: zod_1.z.string().optional(),
    locationId: zod_1.z.string().optional(),
    supplierId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'EXPIRED', 'QUARANTINED', 'RECALLED']).optional(),
    expiryBefore: zod_1.z.string().optional(),
    expiryAfter: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['batchNumber', 'expiryDate', 'quantity', 'createdAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, productId, locationId, supplierId, status, expiryBefore, expiryAfter, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (productId)
            where.productId = productId;
        if (locationId)
            where.locationId = locationId;
        if (supplierId)
            where.supplierId = supplierId;
        if (status)
            where.status = status;
        if (expiryBefore || expiryAfter) {
            where.expiryDate = {};
            if (expiryBefore)
                where.expiryDate.lte = new Date(expiryBefore);
            if (expiryAfter)
                where.expiryDate.gte = new Date(expiryAfter);
        }
        const [batches, total] = await Promise.all([
            prisma.batch.findMany({
                where,
                include: {
                    product: { select: { id: true, sku: true, name: true } },
                    location: {
                        select: {
                            id: true,
                            code: true,
                            zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
                        },
                    },
                    supplier: { select: { id: true, name: true } },
                    inventory: { select: { id: true, quantityOnHand: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.batch.count({ where }),
        ]);
        return server_1.NextResponse.json({
            batches,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching inventory batches:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createBatchSchema.parse(body);
        const existingBatch = await prisma.batch.findUnique({
            where: { batchNumber: data.batchNumber },
        });
        if (existingBatch) {
            return server_1.NextResponse.json({ error: 'Batch number already exists' }, { status: 409 });
        }
        const batch = await prisma.batch.create({
            data: {
                ...data,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                manufacturedDate: data.manufacturedDate ? new Date(data.manufacturedDate) : undefined,
            },
            include: {
                product: { select: { id: true, sku: true, name: true } },
                location: {
                    select: {
                        id: true,
                        code: true,
                        zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
                    },
                },
                supplier: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(batch, { status: 201 });
    }
    catch (error) {
        console.error('Error creating inventory batch:', error);
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
            return server_1.NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateBatchSchema.parse(body);
        const existingBatch = await prisma.batch.findUnique({
            where: { id },
        });
        if (!existingBatch) {
            return server_1.NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }
        const updatedBatch = await prisma.batch.update({
            where: { id },
            data: {
                ...data,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                manufacturedDate: data.manufacturedDate ? new Date(data.manufacturedDate) : undefined,
            },
            include: {
                product: { select: { id: true, sku: true, name: true } },
                location: {
                    select: {
                        id: true,
                        code: true,
                        zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
                    },
                },
                supplier: { select: { id: true, name: true } },
                inventory: { select: { id: true, quantityOnHand: true } },
            },
        });
        return server_1.NextResponse.json(updatedBatch);
    }
    catch (error) {
        console.error('Error updating inventory batch:', error);
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
            return server_1.NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
        }
        const batch = await prisma.batch.findUnique({
            where: { id },
            include: { inventory: true },
        });
        if (!batch) {
            return server_1.NextResponse.json({ error: 'Batch not found' }, { status: 404 });
        }
        if (batch.inventory.some(inv => inv.quantityOnHand > 0)) {
            return server_1.NextResponse.json({ error: 'Cannot delete batch with active inventory' }, { status: 409 });
        }
        await prisma.batch.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Batch deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting inventory batch:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map