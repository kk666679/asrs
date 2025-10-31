"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.PUT = PUT;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(20),
    warehouseId: zod_1.z.string().optional(),
    zoneId: zod_1.z.string().optional(),
    productId: zod_1.z.string().optional(),
    stockLevel: zod_1.z.enum(['LOW', 'NORMAL', 'HIGH', 'OUT_OF_STOCK']).optional(),
    sortBy: zod_1.z.enum(['product.sku', 'quantityOnHand', 'reorderPoint', 'createdAt']).default('quantityOnHand'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
const updateStockLevelSchema = zod_1.z.object({
    reorderPoint: zod_1.z.number().min(0).optional(),
    maxStockLevel: zod_1.z.number().min(0).optional(),
    minStockLevel: zod_1.z.number().min(0).optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, warehouseId, zoneId, productId, stockLevel, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (warehouseId)
            where.location = { zone: { warehouseId } };
        if (zoneId)
            where.location = { ...where.location, zoneId };
        if (productId)
            where.productId = productId;
        const [inventoryItems, total] = await Promise.all([
            prisma.inventory.findMany({
                where,
                include: {
                    product: { select: { id: true, sku: true, name: true, category: { select: { name: true } } } },
                    location: {
                        select: {
                            id: true,
                            code: true,
                            zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
                        },
                    },
                    batch: { select: { id: true, batchNumber: true, expiryDate: true } },
                },
                orderBy: sortBy === 'product.sku' ? { product: { sku: sortOrder } } : { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.inventory.count({ where }),
        ]);
        const processedItems = inventoryItems.map(item => {
            const stockLevelCalc = item.quantityOnHand === 0 ? 'OUT_OF_STOCK' :
                item.quantityOnHand <= (item.reorderPoint || 0) ? 'LOW' :
                    item.quantityOnHand >= (item.maxStockLevel || Infinity) ? 'HIGH' : 'NORMAL';
            return {
                ...item,
                stockLevel: stockLevelCalc,
            };
        });
        const filteredItems = stockLevel ? processedItems.filter(item => item.stockLevel === stockLevel) : processedItems;
        return server_1.NextResponse.json({
            inventory: filteredItems,
            pagination: {
                page,
                limit,
                total: stockLevel ? filteredItems.length : total,
                pages: Math.ceil((stockLevel ? filteredItems.length : total) / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching stock levels:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ error: 'Inventory ID is required' }, { status: 400 });
        }
        const body = await request.json();
        const data = updateStockLevelSchema.parse(body);
        const existingInventory = await prisma.inventory.findUnique({
            where: { id },
        });
        if (!existingInventory) {
            return server_1.NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
        }
        const updatedInventory = await prisma.inventory.update({
            where: { id },
            data,
            include: {
                product: { select: { id: true, sku: true, name: true } },
                location: {
                    select: {
                        id: true,
                        code: true,
                        zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
                    },
                },
            },
        });
        return server_1.NextResponse.json(updatedInventory);
    }
    catch (error) {
        console.error('Error updating stock levels:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map