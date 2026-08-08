import { NextRequest, NextResponse } from 'next/server';

// In-memory store (replace with DB/Prisma as needed)
let twins: Record<string, any> = {};
let isRunning = false;

const defaultAgents = {
  'inventory-agent': {
    name: 'Inventory Agent',
    active: true,
    capabilities: ['optimize_storage', 'reorder_check'],
    status: {},
  },
  'routing-agent': {
    name: 'Routing Agent',
    active: true,
    capabilities: ['plan_route', 'avoid_obstacles'],
    status: {},
  },
  'maintenance-agent': {
    name: 'Maintenance Agent',
    active: true,
    capabilities: ['predict_failure', 'schedule_maintenance'],
    status: {},
  },
};

function getHealth() {
  const twinList = Object.values(twins);
  const totalTwins = twinList.length;
  const averageConfidence = totalTwins
    ? twinList.reduce((s: number, t: any) => s + t.confidence, 0) / totalTwins
    : 0;
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const recentlySynced = twinList.filter(
    (t: any) => new Date(t.lastSync).getTime() > fiveMinAgo
  ).length;
  return {
    totalTwins,
    averageConfidence,
    recentlySynced,
    syncPercentage: totalTwins ? (recentlySynced / totalTwins) * 100 : 0,
    isRunning,
  };
}

function getMetrics() {
  const agents = Object.values(defaultAgents);
  return {
    totalAgents: agents.length,
    activeAgents: agents.filter((a) => a.active).length,
    queueLength: 0,
    isProcessing: false,
    totalCapabilities: agents.reduce((s, a) => s + a.capabilities.length, 0),
  };
}

export async function GET() {
  return NextResponse.json({
    twins: Object.values(twins),
    agents: defaultAgents,
    health: getHealth(),
    metrics: getMetrics(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'create_twin') {
    const { type, id, initialState } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    twins[id] = {
      id,
      type,
      physicalState: initialState || {},
      virtualState: initialState || {},
      predictions: {},
      confidence: 0.9,
      lastSync: new Date().toISOString(),
    };
    isRunning = true;
    return NextResponse.json({ twin: twins[id] });
  }

  if (action === 'update_physical') {
    const { entityId, state } = body;
    if (!twins[entityId]) return NextResponse.json({ error: 'Twin not found' }, { status: 404 });
    twins[entityId].physicalState = { ...twins[entityId].physicalState, ...state };
    twins[entityId].lastSync = new Date().toISOString();
    return NextResponse.json({ twin: twins[entityId] });
  }

  if (action === 'run_simulation') {
    return NextResponse.json({
      results: { confidence: 0.87, scenarios: body.scenarios, timeHorizon: body.timeHorizon },
    });
  }

  if (action === 'agent_request') {
    const { agentId, capability } = body;
    const agent = (defaultAgents as any)[agentId];
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    return NextResponse.json({ response: { agentId, capability, status: 'executed' } });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function DELETE() {
  twins = {};
  isRunning = false;
  return NextResponse.json({ success: true });
}
