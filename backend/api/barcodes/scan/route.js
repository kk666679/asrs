"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const scanSchema = zod_1.z.object({
    barcode: zod_1.z.string().min(1, 'Barcode is required'),
    location: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
});
async function POST(request) {
    try {
        const body = await request.json();
        const { barcode, location, userId } = scanSchema.parse(body);
        const item = await prisma.item.findFirst({
            where: { barcode },
            include: {
                binItems: {
                    include: {
                        bin: {
                            include: {
                                rack: {
                                    include: {
                                        aisle: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!item) {
            return server_1.NextResponse.json({ error: 'Item not found for barcode' }, { status: 404 });
        }
        if (item.halalProduct) {
            const complianceCheck = await prisma.complianceCheck.findFirst({
                where: {
                    halalProductId: item.halalProduct.id,
                    status: 'PASSED',
                },
                orderBy: { createdAt: 'desc' },
            });
            if (!complianceCheck) {
                return server_1.NextResponse.json({ error: 'Halal compliance check failed or not found' }, { status: 403 });
            }
        }
        await prisma.movement.create({
            data: {
                type: 'SCAN',
                itemId: item.id,
                quantity: 1,
                fromLocation: location,
                userId,
                metadata: {
                    barcode,
                    scannedAt: new Date().toISOString(),
                },
            },
        });
        return server_1.NextResponse.json({
            item: {
                id: item.id,
                name: item.name,
                barcode: item.barcode,
                sku: item.sku,
                description: item.description,
                category: item.category,
                halalCertified: !!item.halalProduct,
                locations: item.binItems.map(bi => ({
                    binId: bi.bin.id,
                    rackId: bi.bin.rack.id,
                    aisleId: bi.bin.rack.aisle.id,
                    quantity: bi.quantity,
                })),
            },
            message: 'Barcode scanned successfully',
        });
    }
    catch (error) {
        console.error('Error scanning barcode:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map