import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const querySchema = z.object({
  region: z.enum([
    'MIDDLE_EAST',
    'SOUTHEAST_ASIA',
    'EUROPE',
    'NORTH_AMERICA',
    'AFRICA',
    'SOUTH_ASIA',
    'OCEANIA',
  ]).optional(),
});

/**
 * GET /api/halal/dashboard - Retrieve Halal dashboard data
 * Query parameters: region (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { region } = query;

    // Mock data for now - replace with actual database queries
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

    return NextResponse.json({
      data: dashboardData,
      region: region || 'all',
    });
  } catch (error) {
    console.error('Error fetching halal dashboard data:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
