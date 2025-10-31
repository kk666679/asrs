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
const createSensorSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Sensor code is required'),
    name: zod_1.z.string().min(1, 'Sensor name is required'),
    type: zod_1.z.enum(['TEMPERATURE', 'HUMIDITY', 'WEIGHT', 'PRESSURE', 'MOTION', 'LIGHT', 'VIBRATION']),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).default('ACTIVE'),
    location: zod_1.z.string().optional(),
    binId: zod_1.z.string().optional(),
    zoneId: zod_1.z.string().optional(),
    thresholdMin: zod_1.z.number().optional(),
    thresholdMax: zod_1.z.number().optional(),
    calibrationDate: zod_1.z.string().optional(),
    lastMaintenance: zod_1.z.string().optional(),
});
const updateSensorSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).optional(),
    location: zod_1.z.string().optional(),
    binId: zod_1.z.string().optional(),
    zoneId: zod_1.z.string().optional(),
    thresholdMin: zod_1.z.number().optional(),
    thresholdMax: zod_1.z.number().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'FAULTY']).optional(),
    type: zod_1.z.enum(['TEMPERATURE', 'HUMIDITY', 'WEIGHT', 'PRESSURE', 'MOTION', 'LIGHT', 'VIBRATION']).optional(),
    binId: zod_1.z.string().optional(),
    zoneId: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['code', 'name', 'type', 'status', 'createdAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, status, type, binId, zoneId, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (binId)
            where.binId = binId;
        if (zoneId)
            where.zoneId = zoneId;
        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [sensors, total] = await Promise.all([
            prisma.sensors.findMany({
                where,
                include: {
                    bins: { select: { id: true, code: true } },
                    zones: { select: { id: true, code: true, name: true } },
                    sensor_readings: {
                        orderBy: { timestamp: 'desc' },
                        take: 1,
                        select: { value: true, unit: true, timestamp: true },
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.sensors.count({ where }),
        ]);
        return server_1.NextResponse.json({
            sensors,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching sensors:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createSensorSchema.parse(body);
        const existingSensor = await prisma.sensors.findUnique({
            where: { code: data.code },
        });
        if (existingSensor) {
            return server_1.NextResponse.json({ error: 'Sensor code already exists' }, { status: 409 });
        }
        const sensor = await prisma.sensors.create({
            data: {
                ...data,
                calibrationDate: data.calibrationDate ? new Date(data.calibrationDate) : undefined,
                lastMaintenance: data.lastMaintenance ? new Date(data.lastMaintenance) : undefined,
            },
            include: {
                bins: { select: { id: true, code: true } },
                zones: { select: { id: true, code: true, name: true } },
            },
        });
        return server_1.NextResponse.json(sensor, { status: 201 });
    }
    catch (error) {
        console.error('Error creating sensor:', error);
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
            return server_1.NextResponse.json({ error: 'Sensor ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateSensorSchema.parse(body);
        const existingSensor = await prisma.sensors.findUnique({
            where: { id },
        });
        if (!existingSensor) {
            return server_1.NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
        }
        const updatedSensor = await prisma.sensors.update({
            where: { id },
            data,
            include: {
                bins: { select: { id: true, code: true } },
                zones: { select: { id: true, code: true, name: true } },
                sensor_readings: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                    select: { value: true, unit: true, timestamp: true },
                },
            },
        });
        return server_1.NextResponse.json(updatedSensor);
    }
    catch (error) {
        console.error('Error updating sensor:', error);
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
            return server_1.NextResponse.json({ error: 'Sensor ID is required' }, { status: 400 });
        }
        const sensor = await prisma.sensors.findUnique({
            where: { id },
        });
        if (!sensor) {
            return server_1.NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
        }
        await prisma.sensors.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Sensor deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting sensor:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map