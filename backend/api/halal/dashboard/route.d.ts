import { NextRequest, NextResponse } from 'next/server';
export declare function GET(request: NextRequest): Promise<NextResponse<{
    data: {
        kpis: {
            certificationRate: number;
            complianceScore: number;
            renewalsNeeded: number;
            highRiskRenewals: number;
            totalProducts: number;
            certifiedProducts: number;
        };
        complianceTrends: {
            month: string;
            certificationRate: number;
            complianceScore: number;
            renewalRate: number;
        }[];
        renewalPredictions: {
            certificateId: string;
            productName: string;
            daysUntilExpiry: number;
            riskLevel: string;
        }[];
        marketInsights: {
            topGrowthCategories: string[];
            seasonalTrends: {
                current: string;
                upcoming: string;
                impactFactor: number;
            };
        };
    };
    region: string;
}> | NextResponse<{
    error: string;
}>>;
