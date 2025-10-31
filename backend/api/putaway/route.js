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
const createPutawaySchema = zod_1.z.object({
    shipmentId: zod_1.z.string().min(1, 'Shipment ID is required'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    scheduledDate: zod_1.z.string(),
    estimatedDuration: zod_1.z.number().min(1, 'Estimated duration must be at least 1 minute'),
    notes: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
});
const updatePutawaySchema = zod_1.z.object({
    status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    scheduledDate: zod_1.z.string().optional(),
    actualStartDate: zod_1.z.string().optional(),
    completedDate: zod_1.z.string().optional(),
    estimatedDuration: zod_1.z.number().min(1).optional(),
    actualDuration: zod_1.z.number().min(0).optional(),
    notes: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
    issues: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    status: zod_1.z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    shipmentId: zod_1.z.string().optional(),
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
        const { page, limit, status, priority, shipmentId, assignedTo, dateFrom, dateTo, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (shipmentId)
            where.shipmentId = shipmentId;
        if (assignedTo)
            where.assignedTo = assignedTo;
        if (dateFrom || dateTo) {
            where.scheduledDate = {};
            if (dateFrom)
                where.scheduledDate.gte = new Date(dateFrom);
            if (dateTo)
                where.scheduledDate.lte = new Date(dateTo);
        }
        const [putawayOperations, total] = await Promise.all([
            prisma.putaway.findMany({
                where,
                include: {
                    shipment: { select: { id: true, shipmentNumber: true, status: true, supplier: { select: { name: true } } } },
                    assignedUser: { select: { id: true, name: true } },
                    items: {
                        include: {
                            item: { select: { id: true, sku: true, name: true } },
                            bin: { select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.putaway.count({ where }),
        ]);
        return server_1.NextResponse.json({
            putaway: putawayOperations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching putaway operations:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createPutawaySchema.parse(body);
        const shipment = await prisma.shipment.findUnique({
            where: { id: data.shipmentId },
            select: { id: true, status: true, type: true },
        });
        if (!shipment) {
            return server_1.NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }
        if (shipment.type !== 'INBOUND') {
            return server_1.NextResponse.json({ error: 'Putaway operations can only be created for inbound shipments' }, { status: 400 });
        }
        if (shipment.status !== 'RECEIVED' && shipment.status !== 'PARTIALLY_RECEIVED') {
            return server_1.NextResponse.json({ error: 'Shipment must be received or partially received for putaway' }, { status: 400 });
        }
        const existingPutaway = await prisma.putaway.findFirst({
            where: { shipmentId: data.shipmentId },
        });
        if (existingPutaway) {
            return server_1.NextResponse.json({ error: 'Putaway operation already exists for this shipment' }, { status: 409 });
        }
        const putaway = await prisma.putaway.create({
            data: {
                ...data,
                scheduledDate: new Date(data.scheduledDate),
            },
            include: {
                shipment: { select: { id: true, shipmentNumber: true, status: true } },
                assignedUser: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(putaway, { status: 201 });
    }
    catch (error) {
        console.error('Error creating putaway operation:', error);
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
            return server_1.NextResponse.json({ error: 'Putaway ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updatePutawaySchema.parse(body);
        const existingPutaway = await prisma.putaway.findUnique({
            where: { id },
        });
        if (!existingPutaway) {
            return server_1.NextResponse.json({ error: 'Putaway operation not found' }, { status: 404 });
        }
        if (existingPutaway.status === 'COMPLETED' && data.status !== 'CANCELLED') {
            return server_1.NextResponse.json({ error: 'Cannot update completed putaway operations' }, { status: 409 });
        }
        const updatedPutaway = await prisma.putaway.update({
            where: { id },
            data: {
                ...data,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
                actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
                completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
            },
            include: {
                shipment: { select: { id: true, shipmentNumber: true, status: true } },
                assignedUser: { select: { id: true, name: true } },
                items: {
                    include: {
                        item: { select: { id: true, sku: true, name: true } },
                        bin: { select: { id: true, code: true, rack: { select: { code: true, aisle: { select: { code: true } } } } } },
                    },
                },
            },
        });
        return server_1.NextResponse.json(updatedPutaway);
    }
    catch (error) {
        console.error('Error updating putaway operation:', error);
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
            return server_1.NextResponse.json({ error: 'Putaway ID is required' }, { status: 400 });
        }
        const putaway = await prisma.putaway.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!putaway) {
            return server_1.NextResponse.json({ error: 'Putaway operation not found' }, { status: 404 });
        }
        if (putaway.status === 'COMPLETED') {
            return server_1.NextResponse.json({ error: 'Cannot delete completed putaway operations' }, { status: 409 });
        }
        if (putaway.status === 'IN_PROGRESS') {
            return server_1.NextResponse.json({ error: 'Cannot delete putaway operations that are in progress' }, { status: 409 });
        }
        await prisma.putaway.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Putaway operation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting putaway operation:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map