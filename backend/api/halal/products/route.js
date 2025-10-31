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
const createHalalProductSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1, 'SKU is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(['MEAT', 'POULTRY', 'SEAFOOD', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS', 'PHARMACEUTICALS', 'SUPPLEMENTS', 'PROCESSED_FOOD']),
    subcategory: zod_1.z.string().optional(),
    weight: zod_1.z.number().positive('Weight must be positive'),
    dimensions: zod_1.z.string().min(1, 'Dimensions are required'),
    sourceCountry: zod_1.z.string().min(1, 'Source country is required'),
    manufacturerId: zod_1.z.string().min(1, 'Manufacturer ID is required'),
    halalComplianceScore: zod_1.z.number().min(0).max(100).optional(),
    isHalalCertified: zod_1.z.boolean().default(false),
    certificationStatus: zod_1.z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).default('PENDING_RENEWAL'),
});
const updateHalalProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum(['MEAT', 'POULTRY', 'SEAFOOD', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS', 'PHARMACEUTICALS', 'SUPPLEMENTS', 'PROCESSED_FOOD']).optional(),
    subcategory: zod_1.z.string().optional(),
    weight: zod_1.z.number().positive().optional(),
    dimensions: zod_1.z.string().min(1).optional(),
    sourceCountry: zod_1.z.string().min(1).optional(),
    halalComplianceScore: zod_1.z.number().min(0).max(100).optional(),
    isHalalCertified: zod_1.z.boolean().optional(),
    certificationStatus: zod_1.z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    category: zod_1.z.enum(['MEAT', 'POULTRY', 'SEAFOOD', 'DAIRY', 'BEVERAGES', 'SNACKS', 'COSMETICS', 'PHARMACEUTICALS', 'SUPPLEMENTS', 'PROCESSED_FOOD']).optional(),
    isHalalCertified: zod_1.z.coerce.boolean().optional(),
    certificationStatus: zod_1.z.enum(['VALID', 'EXPIRED', 'PENDING_RENEWAL', 'SUSPENDED', 'REVOKED']).optional(),
    manufacturerId: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['sku', 'name', 'halalComplianceScore', 'createdAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, category, isHalalCertified, certificationStatus, manufacturerId, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (category)
            where.category = category;
        if (isHalalCertified !== undefined)
            where.isHalalCertified = isHalalCertified;
        if (certificationStatus)
            where.certificationStatus = certificationStatus;
        if (manufacturerId)
            where.manufacturerId = manufacturerId;
        const [products, total] = await Promise.all([
            prisma.halalProduct.findMany({
                where,
                include: {
                    manufacturer: { select: { id: true, name: true, country: true } },
                    certifications: { select: { id: true, certificateNumber: true, status: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.halalProduct.count({ where }),
        ]);
        return server_1.NextResponse.json({
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching halal products:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createHalalProductSchema.parse(body);
        const existingProduct = await prisma.halalProduct.findUnique({
            where: { sku: data.sku },
        });
        if (existingProduct) {
            return server_1.NextResponse.json({ error: 'Product SKU already exists' }, { status: 409 });
        }
        const product = await prisma.halalProduct.create({
            data,
            include: {
                manufacturer: { select: { id: true, name: true, country: true } },
            },
        });
        return server_1.NextResponse.json(product, { status: 201 });
    }
    catch (error) {
        console.error('Error creating halal product:', error);
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
            return server_1.NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateHalalProductSchema.parse(body);
        const existingProduct = await prisma.halalProduct.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            return server_1.NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        const updatedProduct = await prisma.halalProduct.update({
            where: { id },
            data,
            include: {
                manufacturer: { select: { id: true, name: true, country: true } },
                certifications: { select: { id: true, certificateNumber: true, status: true } },
            },
        });
        return server_1.NextResponse.json(updatedProduct);
    }
    catch (error) {
        console.error('Error updating halal product:', error);
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
            return server_1.NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }
        const product = await prisma.halalProduct.findUnique({
            where: { id },
            include: { certifications: true, inventory: true },
        });
        if (!product) {
            return server_1.NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        if (product.inventory.some(inv => inv.quantityOnHand > 0)) {
            return server_1.NextResponse.json({ error: 'Cannot delete product with active inventory' }, { status: 409 });
        }
        await prisma.halalProduct.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting halal product:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map