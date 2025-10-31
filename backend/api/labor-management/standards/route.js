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
const createStandardSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(['PICKING', 'PACKING', 'PUTAWAY', 'QUALITY_CHECK', 'MAINTENANCE', 'ADMIN']),
    unit: zod_1.z.enum(['SECONDS', 'MINUTES', 'HOURS', 'ITEMS_PER_HOUR', 'ORDERS_PER_HOUR']),
    standardTime: zod_1.z.number().min(0.1, 'Standard time must be greater than 0'),
    difficultyLevel: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).default('MEDIUM'),
    equipmentRequired: zod_1.z.array(zod_1.z.string()).optional(),
    trainingRequired: zod_1.z.boolean().default(false),
    active: zod_1.z.boolean().default(true),
    notes: zod_1.z.string().optional(),
});
const updateStandardSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(['PICKING', 'PACKING', 'PUTAWAY', 'QUALITY_CHECK', 'MAINTENANCE', 'ADMIN']).optional(),
    unit: zod_1.z.enum(['SECONDS', 'MINUTES', 'HOURS', 'ITEMS_PER_HOUR', 'ORDERS_PER_HOUR']).optional(),
    standardTime: zod_1.z.number().min(0.1).optional(),
    difficultyLevel: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
    equipmentRequired: zod_1.z.array(zod_1.z.string()).optional(),
    trainingRequired: zod_1.z.boolean().optional(),
    active: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    category: zod_1.z.enum(['PICKING', 'PACKING', 'PUTAWAY', 'QUALITY_CHECK', 'MAINTENANCE', 'ADMIN']).optional(),
    difficultyLevel: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD', 'VERY_HARD']).optional(),
    unit: zod_1.z.enum(['SECONDS', 'MINUTES', 'HOURS', 'ITEMS_PER_HOUR', 'ORDERS_PER_HOUR']).optional(),
    active: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['name', 'category', 'standardTime', 'createdAt']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, category, difficultyLevel, unit, active, search, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (category)
            where.category = category;
        if (difficultyLevel)
            where.difficultyLevel = difficultyLevel;
        if (unit)
            where.unit = unit;
        if (active !== undefined)
            where.active = active;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [standards, total] = await Promise.all([
            prisma.laborStandard.findMany({
                where,
                include: {
                    performances: {
                        select: {
                            id: true,
                            actualTime: true,
                            efficiency: true,
                            user: { select: { id: true, name: true } },
                            createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.laborStandard.count({ where }),
        ]);
        return server_1.NextResponse.json({
            standards,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching labor standards:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createStandardSchema.parse(body);
        const existingStandard = await prisma.laborStandard.findFirst({
            where: { name: data.name },
        });
        if (existingStandard) {
            return server_1.NextResponse.json({ error: 'Labor standard with this name already exists' }, { status: 409 });
        }
        const standard = await prisma.laborStandard.create({
            data,
            include: {
                performances: {
                    select: {
                        id: true,
                        actualTime: true,
                        efficiency: true,
                        user: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        return server_1.NextResponse.json(standard, { status: 201 });
    }
    catch (error) {
        console.error('Error creating labor standard:', error);
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
            return server_1.NextResponse.json({ error: 'Labor standard ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateStandardSchema.parse(body);
        const existingStandard = await prisma.laborStandard.findUnique({
            where: { id },
        });
        if (!existingStandard) {
            return server_1.NextResponse.json({ error: 'Labor standard not found' }, { status: 404 });
        }
        if (data.name && data.name !== existingStandard.name) {
            const nameConflict = await prisma.laborStandard.findFirst({
                where: { name: data.name },
            });
            if (nameConflict) {
                return server_1.NextResponse.json({ error: 'Labor standard with this name already exists' }, { status: 409 });
            }
        }
        const updatedStandard = await prisma.laborStandard.update({
            where: { id },
            data,
            include: {
                performances: {
                    select: {
                        id: true,
                        actualTime: true,
                        efficiency: true,
                        user: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        return server_1.NextResponse.json(updatedStandard);
    }
    catch (error) {
        console.error('Error updating labor standard:', error);
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
            return server_1.NextResponse.json({ error: 'Labor standard ID is required' }, { status: 400 });
        }
        const standard = await prisma.laborStandard.findUnique({
            where: { id },
            include: { performances: true },
        });
        if (!standard) {
            return server_1.NextResponse.json({ error: 'Labor standard not found' }, { status: 404 });
        }
        if (standard.performances.length > 0) {
            return server_1.NextResponse.json({ error: 'Cannot delete labor standard with associated performance records' }, { status: 409 });
        }
        await prisma.laborStandard.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Labor standard deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting labor standard:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map