"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const validateBarcodeSchema = zod_1.z.object({
    barcode: zod_1.z.string().min(1, 'Barcode is required'),
    type: zod_1.z.enum(['PRODUCT', 'LOCATION', 'CONTAINER', 'PALLET', 'BATCH']).optional(),
});
const querySchema = zod_1.z.object({
    barcode: zod_1.z.string().min(1, 'Barcode is required'),
    type: zod_1.z.enum(['PRODUCT', 'LOCATION', 'CONTAINER', 'PALLET', 'BATCH']).optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { barcode, type } = query;
        let result = null;
        let foundType = '';
        if (!type || type === 'PRODUCT') {
            const product = await prisma.product.findFirst({
                where: { barcode },
                include: {
                    category: { select: { id: true, name: true } },
                    inventory: {
                        include: {
                            location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
                        },
                    },
                },
            });
            if (product) {
                result = {
                    type: 'PRODUCT',
                    data: product,
                    inventory: product.inventory,
                };
                foundType = 'PRODUCT';
            }
        }
        if (!result && (!type || type === 'LOCATION')) {
            const location = await prisma.location.findFirst({
                where: { barcode },
                include: {
                    zone: { select: { id: true, code: true, name: true, warehouse: { select: { id: true, code: true, name: true } } } },
                    inventory: {
                        include: {
                            product: { select: { id: true, sku: true, name: true } },
                        },
                    },
                },
            });
            if (location) {
                result = {
                    type: 'LOCATION',
                    data: location,
                    inventory: location.inventory,
                };
                foundType = 'LOCATION';
            }
        }
        if (!result && (!type || type === 'CONTAINER')) {
            const container = await prisma.handlingUnit.findFirst({
                where: { barcode },
                include: {
                    location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
                    items: {
                        include: {
                            product: { select: { id: true, sku: true, name: true } },
                        },
                    },
                },
            });
            if (container) {
                result = {
                    type: 'CONTAINER',
                    data: container,
                    items: container.items,
                };
                foundType = 'CONTAINER';
            }
        }
        if (!result && (!type || type === 'PALLET')) {
            const pallet = await prisma.pallet.findFirst({
                where: { barcode },
                include: {
                    location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
                    handlingUnits: {
                        include: {
                            items: {
                                include: {
                                    product: { select: { id: true, sku: true, name: true } },
                                },
                            },
                        },
                    },
                },
            });
            if (pallet) {
                result = {
                    type: 'PALLET',
                    data: pallet,
                    handlingUnits: pallet.handlingUnits,
                };
                foundType = 'PALLET';
            }
        }
        if (!result && (!type || type === 'BATCH')) {
            const batch = await prisma.batch.findFirst({
                where: { barcode },
                include: {
                    product: { select: { id: true, sku: true, name: true } },
                    inventory: {
                        include: {
                            location: { select: { id: true, code: true, zone: { select: { id: true, code: true, name: true } } } },
                        },
                    },
                },
            });
            if (batch) {
                result = {
                    type: 'BATCH',
                    data: batch,
                    inventory: batch.inventory,
                };
                foundType = 'BATCH';
            }
        }
        if (!result) {
            return server_1.NextResponse.json({ error: 'Barcode not found', barcode }, { status: 404 });
        }
        return server_1.NextResponse.json({
            barcode,
            foundType,
            ...result,
        });
    }
    catch (error) {
        console.error('Error validating barcode:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { barcodes, type } = body;
        if (!Array.isArray(barcodes) || barcodes.length === 0) {
            return server_1.NextResponse.json({ error: 'Barcodes array is required and must not be empty' }, { status: 400 });
        }
        const results = [];
        const errors = [];
        for (const barcode of barcodes) {
            try {
                const validationSchema = validateBarcodeSchema.parse({ barcode, type });
                const { searchParams } = new URL(`${request.url}?barcode=${encodeURIComponent(barcode)}${type ? `&type=${type}` : ''}`);
                const mockRequest = { url: `http://localhost?${searchParams.toString()}` };
                const response = await GET(mockRequest);
                const data = await response.json();
                if (response.status === 200) {
                    results.push(data);
                }
                else {
                    errors.push({ barcode, error: data.error });
                }
            }
            catch (error) {
                errors.push({ barcode, error: 'Validation failed' });
            }
        }
        return server_1.NextResponse.json({
            total: barcodes.length,
            valid: results.length,
            invalid: errors.length,
            results,
            errors,
        });
    }
    catch (error) {
        console.error('Error validating barcodes:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map