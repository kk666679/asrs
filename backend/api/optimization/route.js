"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.PUT = PUT;
const server_1 = require("next/server");
const picking_1 = require("@/lib/algorithms/picking");
const putaway_1 = require("@/lib/algorithms/putaway");
const validation_1 = require("@/lib/middleware/validation");
const zod_1 = require("zod");
const pickingOptimizer = new picking_1.PickingOptimizer();
const putawayOptimizer = new putaway_1.PutawayOptimizer();
const pickingRequestSchema = zod_1.z.object({
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    })),
    constraints: zod_1.z.object({
        maxWeight: zod_1.z.number().optional(),
        maxVolume: zod_1.z.number().optional(),
        timeWindow: zod_1.z.object({
            start: zod_1.z.string(),
            end: zod_1.z.string(),
        }).optional(),
    }).optional(),
});
const putawayRequestSchema = zod_1.z.object({
    itemId: zod_1.z.string(),
    quantity: zod_1.z.number().positive(),
    batchNumber: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    constraints: zod_1.z.object({
        temperature: zod_1.z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
        hazardLevel: zod_1.z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
        maxWeight: zod_1.z.number().optional(),
    }).optional(),
});
async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        if (action === 'picking') {
            return (0, validation_1.validateRequest)(pickingRequestSchema)(request, async ({ data }) => {
                const plan = await pickingOptimizer.generateOptimizedPlan(data);
                return server_1.NextResponse.json({ plan });
            });
        }
        if (action === 'putaway') {
            return (0, validation_1.validateRequest)(putawayRequestSchema)(request, async ({ data }) => {
                const requestData = {
                    ...data,
                    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                };
                const result = await putawayOptimizer.findOptimalLocation(requestData);
                if (!result) {
                    return server_1.NextResponse.json({ error: 'No suitable location found' }, { status: 404 });
                }
                return server_1.NextResponse.json({ result });
            });
        }
        return server_1.NextResponse.json({ error: 'Invalid action. Use ?action=picking or ?action=putaway' }, { status: 400 });
    }
    catch (error) {
        console.error('Error in optimization:', error);
        return server_1.NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const body = await request.json();
        if (action === 'picking') {
            const { routes, userId } = body;
            const movements = await pickingOptimizer.executePicking(routes, userId);
            return server_1.NextResponse.json({ movements });
        }
        if (action === 'putaway') {
            const { request: putawayRequest, binId, userId } = body;
            const result = await putawayOptimizer.executePutaway(putawayRequest, binId, userId);
            return server_1.NextResponse.json({ result });
        }
        return server_1.NextResponse.json({ error: 'Invalid action. Use ?action=picking or ?action=putaway' }, { status: 400 });
    }
    catch (error) {
        console.error('Error executing optimization:', error);
        return server_1.NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map