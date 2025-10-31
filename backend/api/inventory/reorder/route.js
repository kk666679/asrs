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
const createReorderSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    locationId: zod_1.z.string().min(1, 'Location ID is required'),
    reorderQuantity: zod_1.z.number().min(1, 'Reorder quantity must be at least 1'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    reason: zod_1.z.string().min(1, 'Reason is required'),
    supplierId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const updateReorderSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
    reorderQuantity: zod_1.z.number().min(1).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    supplierId: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    approvedBy: zod_1.z.string().optional(),
    approvedAt: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    productId: zod_1.z.string().optional(),
    locationId: zod_1.z.string().optional(),
    supplierId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    sortBy: zod_1.z.enum(['createdAt', 'priority', 'reorderQuantity']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, productId, locationId, supplierId, status, priority, sortBy, sortOrder } = query;
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
        if (priority)
            where.priority = priority;
        const [reorders, total] = await Promise.all([
            prisma.reorder.findMany({
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
                    inventory: { select: { id: true, quantityOnHand: true, reorderPoint: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.reorder.count({ where }),
        ]);
        return server_1.NextResponse.json({
            reorders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching reorder requests:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createReorderSchema.parse(body);
        const existingReorder = await prisma.reorder.findFirst({
            where: {
                productId: data.productId,
                locationId: data.locationId,
                status: { in: ['PENDING', 'APPROVED', 'ORDERED'] },
            },
        });
        if (existingReorder) {
            return server_1.NextResponse.json({ error: 'A reorder request already exists for this product and location' }, { status: 409 });
        }
        const reorder = await prisma.reorder.create({
            data,
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
                inventory: { select: { id: true, quantityOnHand: true, reorderPoint: true } },
            },
        });
        return server_1.NextResponse.json(reorder, { status: 201 });
    }
    catch (error) {
        console.error('Error creating reorder request:', error);
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
            return server_1.NextResponse.json({ error: 'Reorder ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateReorderSchema.parse(body);
        const existingReorder = await prisma.reorder.findUnique({
            where: { id },
        });
        if (!existingReorder) {
            return server_1.NextResponse.json({ error: 'Reorder request not found' }, { status: 404 });
        }
        const updatedReorder = await prisma.reorder.update({
            where: { id },
            data: {
                ...data,
                approvedAt: data.approvedAt ? new Date(data.approvedAt) : undefined,
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
                inventory: { select: { id: true, quantityOnHand: true, reorderPoint: true } },
            },
        });
        return server_1.NextResponse.json(updatedReorder);
    }
    catch (error) {
        console.error('Error updating reorder request:', error);
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
            return server_1.NextResponse.json({ error: 'Reorder ID is required' }, { status: 400 });
        }
        const reorder = await prisma.reorder.findUnique({
            where: { id },
        });
        if (!reorder) {
            return server_1.NextResponse.json({ error: 'Reorder request not found' }, { status: 404 });
        }
        if (reorder.status === 'RECEIVED') {
            return server_1.NextResponse.json({ error: 'Cannot delete a reorder request that has been received' }, { status: 409 });
        }
        await prisma.reorder.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Reorder request deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting reorder request:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map