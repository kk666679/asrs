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
const createInspectionSchema = zod_1.z.object({
    itemId: zod_1.z.string().min(1, 'Item ID is required'),
    inspectionType: zod_1.z.enum(['VISUAL', 'DIMENSIONAL', 'WEIGHT', 'BARCODE', 'EXPIRY', 'TEMPERATURE']),
    status: zod_1.z.enum(['PENDING', 'PASSED', 'FAILED', 'IN_PROGRESS']).default('PENDING'),
    inspectorId: zod_1.z.string().min(1, 'Inspector ID is required'),
    notes: zod_1.z.string().optional(),
    measurements: zod_1.z.record(zod_1.z.any()).optional(),
    defects: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        severity: zod_1.z.enum(['MINOR', 'MAJOR', 'CRITICAL']),
        description: zod_1.z.string(),
    })).optional(),
});
const updateInspectionSchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'PASSED', 'FAILED', 'IN_PROGRESS']).optional(),
    notes: zod_1.z.string().optional(),
    measurements: zod_1.z.record(zod_1.z.any()).optional(),
    defects: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.string(),
        severity: zod_1.z.enum(['MINOR', 'MAJOR', 'CRITICAL']),
        description: zod_1.z.string(),
    })).optional(),
    completedAt: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    itemId: zod_1.z.string().optional(),
    inspectionType: zod_1.z.enum(['VISUAL', 'DIMENSIONAL', 'WEIGHT', 'BARCODE', 'EXPIRY', 'TEMPERATURE']).optional(),
    status: zod_1.z.enum(['PENDING', 'PASSED', 'FAILED', 'IN_PROGRESS']).optional(),
    inspectorId: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().optional(),
    dateTo: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['createdAt', 'completedAt', 'status']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, itemId, inspectionType, status, inspectorId, dateFrom, dateTo, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (itemId)
            where.itemId = itemId;
        if (inspectionType)
            where.inspectionType = inspectionType;
        if (status)
            where.status = status;
        if (inspectorId)
            where.inspectorId = inspectorId;
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const [inspections, total] = await Promise.all([
            prisma.qualityInspection.findMany({
                where,
                include: {
                    item: { select: { id: true, sku: true, name: true } },
                    inspector: { select: { id: true, name: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.qualityInspection.count({ where }),
        ]);
        return server_1.NextResponse.json({
            inspections,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching quality inspections:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createInspectionSchema.parse(body);
        const item = await prisma.item.findUnique({
            where: { id: data.itemId },
            select: { id: true },
        });
        if (!item) {
            return server_1.NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        const inspector = await prisma.user.findUnique({
            where: { id: data.inspectorId },
            select: { id: true, role: true },
        });
        if (!inspector) {
            return server_1.NextResponse.json({ error: 'Inspector not found' }, { status: 404 });
        }
        const inspection = await prisma.qualityInspection.create({
            data,
            include: {
                item: { select: { id: true, sku: true, name: true } },
                inspector: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(inspection, { status: 201 });
    }
    catch (error) {
        console.error('Error creating quality inspection:', error);
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
            return server_1.NextResponse.json({ error: 'Inspection ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateInspectionSchema.parse(body);
        const existingInspection = await prisma.qualityInspection.findUnique({
            where: { id },
        });
        if (!existingInspection) {
            return server_1.NextResponse.json({ error: 'Quality inspection not found' }, { status: 404 });
        }
        const updatedInspection = await prisma.qualityInspection.update({
            where: { id },
            data: {
                ...data,
                completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
            },
            include: {
                item: { select: { id: true, sku: true, name: true } },
                inspector: { select: { id: true, name: true } },
            },
        });
        return server_1.NextResponse.json(updatedInspection);
    }
    catch (error) {
        console.error('Error updating quality inspection:', error);
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
            return server_1.NextResponse.json({ error: 'Inspection ID is required' }, { status: 400 });
        }
        const inspection = await prisma.qualityInspection.findUnique({
            where: { id },
        });
        if (!inspection) {
            return server_1.NextResponse.json({ error: 'Quality inspection not found' }, { status: 404 });
        }
        if (inspection.status === 'IN_PROGRESS') {
            return server_1.NextResponse.json({ error: 'Cannot delete inspections that are in progress' }, { status: 409 });
        }
        await prisma.qualityInspection.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Quality inspection deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting quality inspection:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map