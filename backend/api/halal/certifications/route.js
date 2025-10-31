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
const createCertificationSchema = zod_1.z.object({
    certificateNumber: zod_1.z.string().min(1, 'Certificate number is required'),
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    certificationBodyId: zod_1.z.string().min(1, 'Certification body ID is required'),
    issueDate: zod_1.z.string(),
    expiryDate: zod_1.z.string(),
    complianceScore: zod_1.z.number().min(0).max(100).optional(),
});
const updateCertificationSchema = zod_1.z.object({
    status: zod_1.z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
    complianceScore: zod_1.z.number().min(0).max(100).optional(),
    renewalNotified: zod_1.z.boolean().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    productId: zod_1.z.string().optional(),
    certificationBodyId: zod_1.z.string().optional(),
    status: zod_1.z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
    sortBy: zod_1.z.enum(['certificateNumber', 'issueDate', 'expiryDate']).default('issueDate'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, productId, certificationBodyId, status, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (productId)
            where.productId = productId;
        if (certificationBodyId)
            where.certificationBodyId = certificationBodyId;
        if (status)
            where.status = status;
        const [certifications, total] = await Promise.all([
            prisma.halalCertification.findMany({
                where,
                include: {
                    product: { select: { id: true, sku: true, name: true } },
                    certificationBody: { select: { id: true, name: true, country: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.halalCertification.count({ where }),
        ]);
        return server_1.NextResponse.json({
            certifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching certifications:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createCertificationSchema.parse(body);
        const existingCert = await prisma.halalCertification.findUnique({
            where: { certificateNumber: data.certificateNumber },
        });
        if (existingCert) {
            return server_1.NextResponse.json({ error: 'Certificate number already exists' }, { status: 409 });
        }
        const certification = await prisma.halalCertification.create({
            data: {
                ...data,
                issueDate: new Date(data.issueDate),
                expiryDate: new Date(data.expiryDate),
            },
            include: {
                product: { select: { id: true, sku: true, name: true } },
                certificationBody: { select: { id: true, name: true, country: true } },
            },
        });
        return server_1.NextResponse.json(certification, { status: 201 });
    }
    catch (error) {
        console.error('Error creating certification:', error);
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
            return server_1.NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateCertificationSchema.parse(body);
        const existingCert = await prisma.halalCertification.findUnique({
            where: { id },
        });
        if (!existingCert) {
            return server_1.NextResponse.json({ error: 'Certification not found' }, { status: 404 });
        }
        const updatedCert = await prisma.halalCertification.update({
            where: { id },
            data,
            include: {
                product: { select: { id: true, sku: true, name: true } },
                certificationBody: { select: { id: true, name: true, country: true } },
            },
        });
        return server_1.NextResponse.json(updatedCert);
    }
    catch (error) {
        console.error('Error updating certification:', error);
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
            return server_1.NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
        }
        const cert = await prisma.halalCertification.findUnique({
            where: { id },
        });
        if (!cert) {
            return server_1.NextResponse.json({ error: 'Certification not found' }, { status: 404 });
        }
        await prisma.halalCertification.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Certification deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting certification:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map