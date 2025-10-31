import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  region: z.enum([
    'MIDDLE_EAST',
    'SOUTHEAST_ASIA',
    'EUROPE',
    'NORTH_AMERICA',
    'AFRICA',
    'SOUTH_ASIA',
    'OCEANIA',
  ]).optional(),
  period: z.string().optional(),
});

/**
 * GET /api/analytics - Retrieve business metrics with optional filtering and pagination
 * Query parameters: page, limit, startDate, endDate, category, region, period
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const { page, limit, startDate, endDate, category, region, period } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};
    if (startDate || endDate) {
      where.calculationDate = {};
      if (startDate) (where.calculationDate as any).gte = new Date(startDate);
      if (endDate) (where.calculationDate as any).lte = new Date(endDate);
    }
    if (category) where.category = category;
    if (region) where.region = region;
    if (period) where.period = period;

    const [metrics, total] = await Promise.all([
      prisma.businessMetric.findMany({
        where,
        orderBy: { calculationDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.businessMetric.count({ where }),
    ]);

    return NextResponse.json({
      metrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
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
