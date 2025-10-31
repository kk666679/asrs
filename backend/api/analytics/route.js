"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const querySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    region: zod_1.z.enum([
        'MIDDLE_EAST',
        'SOUTHEAST_ASIA',
        'EUROPE',
        'NORTH_AMERICA',
        'AFRICA',
        'SOUTH_ASIA',
        'OCEANIA',
    ]).optional(),
    period: zod_1.z.string().optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { page, limit, startDate, endDate, category, region, period } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (startDate || endDate) {
            where.calculationDate = {};
            if (startDate)
                where.calculationDate.gte = new Date(startDate);
            if (endDate)
                where.calculationDate.lte = new Date(endDate);
        }
        if (category)
            where.category = category;
        if (region)
            where.region = region;
        if (period)
            where.period = period;
        const [metrics, total] = await Promise.all([
            prisma.businessMetrics.findMany({
                where,
                orderBy: { calculationDate: 'desc' },
                skip,
                take: limit,
            }),
            prisma.businessMetrics.count({ where }),
        ]);
        return server_1.NextResponse.json({
            metrics,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('Error fetching analytics:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map