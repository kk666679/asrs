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
const createSimulationSchema = zod_1.z.object({
    scenarioName: zod_1.z.string().min(1, 'Scenario name is required'),
    description: zod_1.z.string().optional(),
    parameters: zod_1.z.record(zod_1.z.any()),
    baselineMetrics: zod_1.z.record(zod_1.z.any()),
    projectedOutcome: zod_1.z.record(zod_1.z.any()),
    createdBy: zod_1.z.string().optional(),
});
const updateSimulationSchema = zod_1.z.object({
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    actualOutcome: zod_1.z.record(zod_1.z.any()).optional(),
    executedAt: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    status: zod_1.z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    sortBy: zod_1.z.enum(['scenarioName', 'createdAt', 'executedAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, status, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [scenarios, total] = await Promise.all([
            prisma.simulationScenario.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.simulationScenario.count({ where }),
        ]);
        return server_1.NextResponse.json({
            scenarios,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching simulations:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createSimulationSchema.parse(body);
        const scenario = await prisma.simulationScenario.create({
            data,
        });
        return server_1.NextResponse.json(scenario, { status: 201 });
    }
    catch (error) {
        console.error('Error creating simulation:', error);
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
            return server_1.NextResponse.json({ error: 'Simulation ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateSimulationSchema.parse(body);
        const existingScenario = await prisma.simulationScenario.findUnique({
            where: { id },
        });
        if (!existingScenario) {
            return server_1.NextResponse.json({ error: 'Simulation scenario not found' }, { status: 404 });
        }
        const updatedScenario = await prisma.simulationScenario.update({
            where: { id },
            data: {
                ...data,
                executedAt: data.executedAt ? new Date(data.executedAt) : undefined,
            },
        });
        return server_1.NextResponse.json(updatedScenario);
    }
    catch (error) {
        console.error('Error updating simulation:', error);
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
            return server_1.NextResponse.json({ error: 'Simulation ID is required' }, { status: 400 });
        }
        const scenario = await prisma.simulationScenario.findUnique({
            where: { id },
        });
        if (!scenario) {
            return server_1.NextResponse.json({ error: 'Simulation scenario not found' }, { status: 404 });
        }
        await prisma.simulationScenario.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Simulation scenario deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting simulation:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map