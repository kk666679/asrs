"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const createReadingSchema = zod_1.z.object({
    sensorId: zod_1.z.string().min(1, 'Sensor ID is required'),
    value: zod_1.z.number(),
    unit: zod_1.z.string().min(1, 'Unit is required'),
    timestamp: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    sensorId: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(1000).default(100),
    page: zod_1.z.coerce.number().min(1).default(1),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { sensorId, startDate, endDate, limit, page } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (sensorId)
            where.sensorId = sensorId;
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate)
                where.timestamp.gte = new Date(startDate);
            if (endDate)
                where.timestamp.lte = new Date(endDate);
        }
        const [readings, total] = await Promise.all([
            prisma.sensor_readings.findMany({
                where,
                include: {
                    sensors: {
                        select: { id: true, code: true, name: true, type: true },
                    },
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
            }),
            prisma.sensor_readings.count({ where }),
        ]);
        return server_1.NextResponse.json({
            readings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching sensor readings:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createReadingSchema.parse(body);
        const sensor = await prisma.sensors.findUnique({
            where: { id: data.sensorId },
        });
        if (!sensor) {
            return server_1.NextResponse.json({ error: 'Sensor not found' }, { status: 404 });
        }
        const reading = await prisma.sensor_readings.create({
            data: {
                sensorId: data.sensorId,
                value: data.value,
                unit: data.unit,
                timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            },
            include: {
                sensors: {
                    select: { id: true, code: true, name: true, type: true },
                },
            },
        });
        return server_1.NextResponse.json(reading, { status: 201 });
    }
    catch (error) {
        console.error('Error creating sensor reading:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map