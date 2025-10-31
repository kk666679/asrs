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
const createCommandSchema = zod_1.z.object({
    robotId: zod_1.z.string().min(1, 'Robot ID is required'),
    type: zod_1.z.enum(['MOVE', 'PICK', 'PLACE', 'SCAN', 'CALIBRATE', 'EMERGENCY_STOP']),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    userId: zod_1.z.string().min(1, 'User ID is required'),
});
const updateCommandSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    parameters: zod_1.z.record(zod_1.z.any()).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    startedAt: zod_1.z.string().optional(),
    completedAt: zod_1.z.string().optional(),
    errorMessage: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    robotId: zod_1.z.string().optional(),
    type: zod_1.z.enum(['MOVE', 'PICK', 'PLACE', 'SCAN', 'CALIBRATE', 'EMERGENCY_STOP']).optional(),
    status: zod_1.z.enum(['PENDING', 'EXECUTING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    userId: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'priority', 'startedAt', 'completedAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, robotId, type, status, priority, userId, dateFrom, dateTo, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (robotId)
            where.robotId = robotId;
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (userId)
            where.userId = userId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const [commands, total] = await Promise.all([
            prisma.robotCommand.findMany({
                where,
                include: {
                    robot: { select: { id: true, code: true, name: true, status: true } },
                    user: { select: { id: true, name: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.robotCommand.count({ where }),
        ]);
        return server_1.NextResponse.json({
            commands,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching robot commands:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createCommandSchema.parse(body);
        const robot = await prisma.robot.findUnique({
            where: { id: data.robotId },
            select: { id: true, status: true },
        });
        if (!robot) {
            return server_1.NextResponse.json({ error: 'Robot not found' }, { status: 404 });
        }
        if (robot.status === 'MAINTENANCE' || robot.status === 'ERROR') {
            return server_1.NextResponse.json({ error: 'Robot is not available for commands' }, { status: 409 });
        }
        const command = await prisma.robotCommand.create({
            data,
            include: {
                robot: { select: { id: true, code: true, name: true } },
                user: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(command, { status: 201 });
    }
    catch (error) {
        console.error('Error creating robot command:', error);
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
            return server_1.NextResponse.json({ error: 'Command ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateCommandSchema.parse(body);
        const existingCommand = await prisma.robotCommand.findUnique({
            where: { id },
        });
        if (!existingCommand) {
            return server_1.NextResponse.json({ error: 'Robot command not found' }, { status: 404 });
        }
        if (existingCommand.status === 'COMPLETED' && data.status !== 'CANCELLED') {
            return server_1.NextResponse.json({ error: 'Cannot update completed commands' }, { status: 409 });
        }
        const updatedCommand = await prisma.robotCommand.update({
            where: { id },
            data: {
                ...data,
                startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
                completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
            },
            include: {
                robot: { select: { id: true, code: true, name: true, status: true } },
                user: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(updatedCommand);
    }
    catch (error) {
        console.error('Error updating robot command:', error);
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
            return server_1.NextResponse.json({ error: 'Command ID is required' }, { status: 400 });
        }
        const command = await prisma.robotCommand.findUnique({
            where: { id },
        });
        if (!command) {
            return server_1.NextResponse.json({ error: 'Robot command not found' }, { status: 404 });
        }
        if (command.status === 'EXECUTING') {
            return server_1.NextResponse.json({ error: 'Cannot delete commands that are currently executing' }, { status: 409 });
        }
        if (command.status === 'COMPLETED') {
            return server_1.NextResponse.json({ error: 'Cannot delete completed commands' }, { status: 409 });
        }
        await prisma.robotCommand.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Robot command deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting robot command:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map