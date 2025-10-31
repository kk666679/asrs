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
const createItemSchema = zod_1.z.object({
    sku: zod_1.z.string().min(1, 'SKU is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    weight: zod_1.z.number().positive('Weight must be positive'),
    hazardLevel: zod_1.z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).default('NONE'),
    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).default('AMBIENT'),
    minStock: zod_1.z.number().int().min(0).default(0),
    maxStock: zod_1.z.number().int().positive().optional(),
    barcode: zod_1.z.string().optional(),
    supplierId: zod_1.z.string().min(1, 'Supplier ID is required'),
});
const updateItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().min(1).optional(),
    weight: zod_1.z.number().positive().optional(),
    hazardLevel: zod_1.z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
    minStock: zod_1.z.number().int().min(0).optional(),
    maxStock: zod_1.z.number().int().positive().optional(),
    barcode: zod_1.z.string().optional(),
});
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    supplierId: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    hazardLevel: zod_1.z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
    temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['sku', 'name', 'category', 'createdAt']).default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, supplierId, category, hazardLevel, temperature, search, sortBy, sortOrder, } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (supplierId)
            where.supplierId = supplierId;
        if (category)
            where.category = category;
        if (hazardLevel)
            where.hazardLevel = hazardLevel;
        if (temperature)
            where.temperature = temperature;
        if (search) {
            where.OR = [
                { sku: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [items, total] = await Promise.all([
            prisma.item.findMany({
                where,
                include: {
                    supplier: { select: { id: true, code: true, name: true } },
                    binItems: {
                        include: {
                            bin: { select: { id: true, code: true, rack: { select: { code: true } } } },
                        },
                    },
                    _count: { select: { binItems: true, shipmentItems: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.item.count({ where }),
        ]);
        return server_1.NextResponse.json({
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching items:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const data = createItemSchema.parse(body);
        const existingItem = await prisma.item.findUnique({
            where: { sku: data.sku },
        });
        if (existingItem) {
            return server_1.NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
        }
        if (data.barcode) {
            const existingBarcode = await prisma.item.findUnique({
                where: { barcode: data.barcode },
            });
            if (existingBarcode) {
                return server_1.NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
            }
        }
        const supplier = await prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });
        if (!supplier) {
            return server_1.NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
        }
        const item = await prisma.item.create({
            data,
            include: {
                supplier: { select: { id: true, code: true, name: true } },
            },
        });
        return server_1.NextResponse.json(item, { status: 201 });
    }
    catch (error) {
        console.error('Error creating item:', error);
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
            return server_1.NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateItemSchema.parse(body);
        const existingItem = await prisma.item.findUnique({
            where: { id },
        });
        if (!existingItem) {
            return server_1.NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (data.barcode && data.barcode !== existingItem.barcode) {
            const existingBarcode = await prisma.item.findUnique({
                where: { barcode: data.barcode },
            });
            if (existingBarcode) {
                return server_1.NextResponse.json({ error: 'Barcode already exists' }, { status: 409 });
            }
        }
        const updatedItem = await prisma.item.update({
            where: { id },
            data,
            include: {
                supplier: { select: { id: true, code: true, name: true } },
                binItems: {
                    include: {
                        bin: {
                            select: {
                                id: true,
                                code: true,
                                rack: { select: { code: true } },
                            },
                        },
                    },
                },
                _count: { select: { binItems: true, shipmentItems: true } },
            },
        });
        return server_1.NextResponse.json(updatedItem);
    }
    catch (error) {
        console.error('Error updating item:', error);
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
            return server_1.NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }
        const item = await prisma.item.findUnique({
            where: { id },
            include: { binItems: true, shipmentItems: true },
        });
        if (!item) {
            return server_1.NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (item.binItems.length > 0 || item.shipmentItems.length > 0) {
            return server_1.NextResponse.json({ error: 'Cannot delete item with existing inventory or shipments' }, { status: 409 });
        }
        await prisma.item.delete({
            where: { id },
        });
        return server_1.NextResponse.json({ message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting item:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map