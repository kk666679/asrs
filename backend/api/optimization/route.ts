import { NextRequest, NextResponse } from 'next/server';
import { PickingOptimizer } from '@/lib/algorithms/picking';
import { PutawayOptimizer } from '@/lib/algorithms/putaway';
import { validateRequest } from '@/lib/middleware/validation';
import { z } from 'zod';

const pickingOptimizer = new PickingOptimizer();
const putawayOptimizer = new PutawayOptimizer();

// Validation schemas
const pickingRequestSchema = z.object({
  items: z.array(z.object({
    itemId: z.string(),
    quantity: z.number().positive(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  })),
  constraints: z.object({
    maxWeight: z.number().optional(),
    maxVolume: z.number().optional(),
    timeWindow: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
  }).optional(),
});

const putawayRequestSchema = z.object({
  itemId: z.string(),
  quantity: z.number().positive(),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  constraints: z.object({
    temperature: z.enum(['AMBIENT', 'REFRIGERATED', 'FROZEN']).optional(),
    hazardLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
    maxWeight: z.number().optional(),
  }).optional(),
});

// POST /api/optimization/picking - Generate picking plan
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'picking') {
      return validateRequest(pickingRequestSchema)(request, async ({ data }) => {
        const plan = await pickingOptimizer.generateOptimizedPlan(data);
        return NextResponse.json({ plan });
      });
    }

    if (action === 'putaway') {
      return validateRequest(putawayRequestSchema)(request, async ({ data }) => {
        const requestData = {
          ...data,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        };
        const result = await putawayOptimizer.findOptimalLocation(requestData);

        if (!result) {
          return NextResponse.json(
            { error: 'No suitable location found' },
            { status: 404 }
          );
        }

        return NextResponse.json({ result });
      });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=picking or ?action=putaway' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in optimization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/optimization/execute - Execute optimization plan
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    if (action === 'picking') {
      const { routes, userId } = body;
      const movements = await pickingOptimizer.executePicking(routes, userId);
      return NextResponse.json({ movements });
    }

    if (action === 'putaway') {
      const { request: putawayRequest, binId, userId } = body;
      const result = await putawayOptimizer.executePutaway(putawayRequest, binId, userId);
      return NextResponse.json({ result });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use ?action=picking or ?action=putaway' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error executing optimization:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
