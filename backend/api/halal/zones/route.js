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
const createHalalZoneSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Code is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']),
    securityLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']),
    warehouseId: zod_1.z.string().min(1, 'Warehouse ID is required'),
});
const updateHalalZoneSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).optional(),
    name: zod_1.z.string().min(1).optional(),
    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
    securityLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    warehouseId: zod_1.z.string().optional(),
    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
    securityLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'RESTRICTED']).optional(),
    sortBy: zod_1.z.enum(['code', 'name', 'createdAt']).default('code'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, warehouseId, temperature, securityLevel, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (warehouseId)
            where.warehouseId = warehouseId;
        if (temperature)
            where.temperature = temperature;
        if (securityLevel)
            where.securityLevel = securityLevel;
        const [zones, total] = await Promise.all([
            prisma.zone.findMany({
                where,
                include: {
                    warehouse: { select: { id: true, code: true, name: true } },
                    bins: { select: { id: true, code: true, status: true } },
                    robots: { select: { id: true, code: true, status: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.zone.count({ where }),
        ]);
        return server_1.NextResponse.json({
            zones,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching halal zones:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createHalalZoneSchema.parse(body);
        const existingZone = await prisma.zone.findUnique({
            where: { code: data.code },
        });
        if (existingZone) {
            return server_1.NextResponse.json({ error: 'Zone code already exists' }, { status: 409 });
        }
        const zone = await prisma.zone.create({
            data,
            include: {
                warehouse: { select: { id: true, code: true, name: true } },
            },
        });
        return server_1.NextResponse.json(zone, { status: 201 });
    }
    catch (error) {
        console.error('Error creating halal zone:', error);
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
            return server_1.NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateHalalZoneSchema.parse(body);
        const existingZone = await prisma.zone.findUnique({
            where: { id },
        });
        if (!existingZone) {
            return server_1.NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }
        if (data.code && data.code !== existingZone.code) {
            const codeConflict = await prisma.zone.findUnique({
                where: { code: data.code },
            });
            if (codeConflict) {
                return server_1.NextResponse.json({ error: 'Zone code already exists' }, { status: 409 });
            }
        }
        const updatedZone = await prisma.zone.update({
            where: { id },
            data,
            include: {
                warehouse: { select: { id: true, code: true, name: true } },
                bins: { select: { id: true, code: true, status: true } },
            },
        });
        return server_1.NextResponse.json(updatedZone);
    }
    catch (error) {
        console.error('Error updating halal zone:', error);
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
            return server_1.NextResponse.json({ error: 'Zone ID is required' }, { status: 400 });
        }
        const zone = await prisma.zone.findUnique({
            where: { id },
            include: { bins: true, robots: true },
        });
        if (!zone) {
            return server_1.NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }
        if (zone.bins.length > 0 || zone.robots.length > 0) {
            return server_1.NextResponse.json({ error: 'Cannot delete zone with active bins or robots' }, { status: 409 });
        }
        await prisma.zone.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Zone deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting zone:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map