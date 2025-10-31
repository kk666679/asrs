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
const createCrossDockingSchema = zod_1.z.object({
    inboundShipmentId: zod_1.z.string().min(1, 'Inbound shipment ID is required'),
    outboundShipmentId: zod_1.z.string().min(1, 'Outbound shipment ID is required'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    scheduledDate: zod_1.z.string(),
    estimatedDuration: zod_1.z.number().min(1, 'Estimated duration must be at least 1 minute'),
    notes: zod_1.z.string().optional(),
    assignedTo: zod_1.z.string().optional(),
});
const updateCrossDockingSchema = zod_1.z.object({
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
    inboundShipmentId: zod_1.z.string().optional(),
    outboundShipmentId: zod_1.z.string().optional(),
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
        const { page, limit, status, priority, inboundShipmentId, outboundShipmentId, assignedTo, dateFrom, dateTo, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (inboundShipmentId)
            where.inboundShipmentId = inboundShipmentId;
        if (outboundShipmentId)
            where.outboundShipmentId = outboundShipmentId;
        if (assignedTo)
            where.assignedTo = assignedTo;
        if (dateFrom || dateTo) {
            where.scheduledDate = {};
            if (dateFrom)
                where.scheduledDate.gte = new Date(dateFrom);
            if (dateTo)
                where.scheduledDate.lte = new Date(dateTo);
        }
        const [crossDockingOperations, total] = await Promise.all([
            prisma.crossDocking.findMany({
                where,
                include: {
                    inboundShipment: { select: { id: true, shipmentNumber: true, status: true, carrier: true } },
                    outboundShipment: { select: { id: true, shipmentNumber: true, status: true, carrier: true } },
                    assignedUser: { select: { id: true, name: true } },
                    items: {
                        include: {
                            product: { select: { id: true, sku: true, name: true } },
                            sourceLocation: { select: { id: true, code: true } },
                            destinationLocation: { select: { id: true, code: true } },
                        },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.crossDocking.count({ where }),
        ]);
        return server_1.NextResponse.json({
            crossDocking: crossDockingOperations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching cross-docking operations:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createCrossDockingSchema.parse(body);
        const [inboundShipment, outboundShipment] = await Promise.all([
            prisma.shipment.findUnique({
                where: { id: data.inboundShipmentId },
                select: { id: true, status: true },
            }),
            prisma.shipment.findUnique({
                where: { id: data.outboundShipmentId },
                select: { id: true, status: true },
            }),
        ]);
        if (!inboundShipment) {
            return server_1.NextResponse.json({ error: 'Inbound shipment not found' }, { status: 404 });
        }
        if (!outboundShipment) {
            return server_1.NextResponse.json({ error: 'Outbound shipment not found' }, { status: 404 });
        }
        if (inboundShipment.status !== 'RECEIVED' && inboundShipment.status !== 'IN_TRANSIT') {
            return server_1.NextResponse.json({ error: 'Inbound shipment must be received or in transit for cross-docking' }, { status: 400 });
        }
        if (outboundShipment.status !== 'PENDING' && outboundShipment.status !== 'SCHEDULED') {
            return server_1.NextResponse.json({ error: 'Outbound shipment must be pending or scheduled for cross-docking' }, { status: 400 });
        }
        const crossDocking = await prisma.crossDocking.create({
            data: {
                ...data,
                scheduledDate: new Date(data.scheduledDate),
            },
            include: {
                inboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
                outboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
                assignedUser: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(crossDocking, { status: 201 });
    }
    catch (error) {
        console.error('Error creating cross-docking operation:', error);
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
            return server_1.NextResponse.json({ error: 'Cross-docking ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateCrossDockingSchema.parse(body);
        const existingCrossDocking = await prisma.crossDocking.findUnique({
            where: { id },
        });
        if (!existingCrossDocking) {
            return server_1.NextResponse.json({ error: 'Cross-docking operation not found' }, { status: 404 });
        }
        if (existingCrossDocking.status === 'COMPLETED' && data.status !== 'CANCELLED') {
            return server_1.NextResponse.json({ error: 'Cannot update completed cross-docking operations' }, { status: 409 });
        }
        const updatedCrossDocking = await prisma.crossDocking.update({
            where: { id },
            data: {
                ...data,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
                actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
                completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
            },
            include: {
                inboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
                outboundShipment: { select: { id: true, shipmentNumber: true, status: true } },
                assignedUser: { select: { id: true, name: true } },
                items: {
                    include: {
                        product: { select: { id: true, sku: true, name: true } },
                        sourceLocation: { select: { id: true, code: true } },
                        destinationLocation: { select: { id: true, code: true } },
                    },
                },
            },
        });
        return server_1.NextResponse.json(updatedCrossDocking);
    }
    catch (error) {
        console.error('Error updating cross-docking operation:', error);
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
            return server_1.NextResponse.json({ error: 'Cross-docking ID is required' }, { status: 400 });
        }
        const crossDocking = await prisma.crossDocking.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!crossDocking) {
            return server_1.NextResponse.json({ error: 'Cross-docking operation not found' }, { status: 404 });
        }
        if (crossDocking.status === 'COMPLETED') {
            return server_1.NextResponse.json({ error: 'Cannot delete completed cross-docking operations' }, { status: 409 });
        }
        if (crossDocking.status === 'IN_PROGRESS') {
            return server_1.NextResponse.json({ error: 'Cannot delete cross-docking operations that are in progress' }, { status: 409 });
        }
        await prisma.crossDocking.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Cross-docking operation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting cross-docking operation:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map