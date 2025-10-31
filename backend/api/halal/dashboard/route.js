"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const querySchema = zod_1.z.object({
    region: zod_1.z.enum([
        'MIDDLE_EAST',
        'SOUTHEAST_ASIA',
        'EUROPE',
        'NORTH_AMERICA',
        'AFRICA',
        'SOUTH_ASIA',
        'OCEANIA',
    ]).optional(),
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));
        const { region } = query;
        const dashboardData = {
            kpis: {
                certificationRate: 85,
                complianceScore: 92,
                renewalsNeeded: 12,
                highRiskRenewals: 3,
                totalProducts: 1247,
                certifiedProducts: 1058,
            },
            complianceTrends: [
                { month: 'Jan', certificationRate: 82, complianceScore: 89, renewalRate: 95 },
                { month: 'Feb', certificationRate: 84, complianceScore: 91, renewalRate: 96 },
                { month: 'Mar', certificationRate: 85, complianceScore: 92, renewalRate: 97 },
                { month: 'Apr', certificationRate: 86, complianceScore: 93, renewalRate: 98 },
                { month: 'May', certificationRate: 85, complianceScore: 92, renewalRate: 97 },
                { month: 'Jun', certificationRate: 85, complianceScore: 92, renewalRate: 97 },
            ],
            renewalPredictions: [
                {
                    certificateId: 'HAL-2024-001',
                    productName: 'Organic Halal Chicken',
                    daysUntilExpiry: 45,
                    riskLevel: 'MEDIUM',
                },
                {
                    certificateId: 'HAL-2024-002',
                    productName: 'Halal Beef Patties',
                    daysUntilExpiry: 15,
                    riskLevel: 'HIGH',
                },
                {
                    certificateId: 'HAL-2024-003',
                    productName: 'Halal Milk Powder',
                    daysUntilExpiry: 90,
                    riskLevel: 'LOW',
                },
            ],
            marketInsights: {
                topGrowthCategories: [
                    'Halal Meat Products',
                    'Halal Dairy',
                    'Halal Snacks',
                    'Halal Beverages',
                    'Halal Cosmetics',
                ],
                seasonalTrends: {
                    current: 'Ramadan Season',
                    upcoming: 'Eid al-Adha',
                    impactFactor: 2.3,
                },
            },
        };
        return server_1.NextResponse.json({
            data: dashboardData,
            region: region || 'all',
        });
    }
    catch (error) {
        console.error('Error fetching halal dashboard data:', error);
        if (error instanceof zod_1.z.ZodError) {
            return server_1.NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 });
        }
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map