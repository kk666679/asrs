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
const createReplenishmentSchema = zod_1.z.object({
    itemId: zod_1.z.string().min(1, 'Item ID is required'),
    binId: zod_1.z.string().min(1, 'Bin ID is required'),
    quantity: zod_1.z.number().min(1, 'Quantity must be at least 1'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    reason: zod_1.z.enum(['LOW_STOCK', 'OPTIMIZATION', 'SEASONAL', 'DEMAND_SPIKE', 'REBALANCE']).default('LOW_STOCK'),
    scheduledDate: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
});
const updateReplenishmentSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
    quantity: zod_1.z.number().min(1).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    scheduledDate: zod_1.z.string().optional(),
    actualStartDate: zod_1.z.string().optional(),
    completedDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
    issues: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    itemId: zod_1.z.string().optional(),
    binId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    reason: zod_1.z.enum(['LOW_STOCK', 'OPTIMIZATION', 'SEASONAL', 'DEMAND_SPIKE', 'REBALANCE']).optional(),
    assignedTo: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['scheduledDate', 'priority', 'createdAt', 'completedDate']).default('scheduledDate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, itemId, binId, status, priority, reason, assignedTo, dateFrom, dateTo, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (itemId)
            where.itemId = itemId;
        if (binId)
            where.binId = binId;
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (reason)
            where.reason = reason;
        if (assignedTo)
            where.assignedTo = assignedTo;
        if (dateFrom || dateTo) {
            where.scheduledDate = {};
            if (dateFrom)
                where.scheduledDate.gte = new Date(dateFrom);
            if (dateTo)
                where.scheduledDate.lte = new Date(dateTo);
        }
        const [replenishments, total] = await Promise.all([
            prisma.replenishment.findMany({
                where,
                include: {
                    item: { select: { id: true, sku: true, name: true, minStock: true, maxStock: true } },
                    bin: { select: { id: true, code: true, capacity: true, currentLoad: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
                    assignedUser: { select: { id: true, name: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.replenishment.count({ where }),
        ]);
        return server_1.NextResponse.json({
            replenishments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching replenishment operations:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createReplenishmentSchema.parse(body);
        const [item, bin] = await Promise.all([
            prisma.item.findUnique({
                where: { id: data.itemId },
                select: { id: true, name: true },
            }),
            prisma.bin.findUnique({
                where: { id: data.binId },
                select: { id: true, status: true, capacity: true, currentLoad: true },
            }),
        ]);
        if (!item) {
            return server_1.NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (!bin) {
            return server_1.NextResponse.json({ error: 'Bin not found' }, { status: 404 });
        }
        if (bin.status !== 'ACTIVE') {
            return server_1.NextResponse.json({ error: 'Bin is not active' }, { status: 409 });
        }
        if (bin.currentLoad + data.quantity > bin.capacity) {
            return server_1.NextResponse.json({ error: 'Bin does not have sufficient capacity for this replenishment' }, { status: 409 });
        }
        const replenishment = await prisma.replenishment.create({
            data: {
                ...data,
                scheduledDate: new Date(data.scheduledDate),
            },
            include: {
                item: { select: { id: true, sku: true, name: true } },
                bin: { select: { id: true, code: true, capacity: true, currentLoad: true } },
                assignedUser: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(replenishment, { status: 201 });
    }
    catch (error) {
        console.error('Error creating replenishment operation:', error);
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
            return server_1.NextResponse.json({ error: 'Replenishment ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateReplenishmentSchema.parse(body);
        const existingReplenishment = await prisma.replenishment.findUnique({
            where: { id },
        });
        if (!existingReplenishment) {
            return server_1.NextResponse.json({ error: 'Replenishment operation not found' }, { status: 404 });
        }
        if (existingReplenishment.status === 'COMPLETED' && data.status !== 'CANCELLED') {
            return server_1.NextResponse.json({ error: 'Cannot update completed replenishment operations' }, { status: 409 });
        }
        const updatedReplenishment = await prisma.replenishment.update({
            where: { id },
            data: {
                ...data,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
                actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
                completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
            },
            include: {
                item: { select: { id: true, sku: true, name: true, minStock: true, maxStock: true } },
                bin: { select: { id: true, code: true, capacity: true, currentLoad: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
                assignedUser: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(updatedReplenishment);
    }
    catch (error) {
        console.error('Error updating replenishment operation:', error);
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
            return server_1.NextResponse.json({ error: 'Replenishment ID is required' }, { status: 400 });
        }
        const replenishment = await prisma.replenishment.findUnique({
            where: { id },
        });
        if (!replenishment) {
            return server_1.NextResponse.json({ error: 'Replenishment operation not found' }, { status: 404 });
        }
        if (replenishment.status === 'COMPLETED') {
            return server_1.NextResponse.json({ error: 'Cannot delete completed replenishment operations' }, { status: 409 });
        }
        if (replenishment.status === 'IN_PROGRESS') {
            return server_1.NextResponse.json({ error: 'Cannot delete replenishment operations that are in progress' }, { status: 409 });
        }
        await prisma.replenishment.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Replenishment operation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting replenishment operation:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map