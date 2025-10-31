import { NextRequest, NextResponse } from 'next/server';
import { DigitalTwinEngine } from '@/lib/digital-twin/twin-engine';
import { AgentOrchestrator } from '@/lib/ai-agents/agent-orchestrator';
import { InventoryAgent } from '@/lib/ai-agents/inventory-agent';

const twinEngine = new DigitalTwinEngine();
const orchestrator = new AgentOrchestrator();
const inventoryAgent = new InventoryAgent();

// Initialize system
let initialized = false;

async function initializeSystem() {
  if (!initialized) {
    await twinEngine.initialize();
    await orchestrator.registerAgent(inventoryAgent);
    initialized = true;
  }
}

// GET /api/digital-twin - Get system status
export async function GET(request: NextRequest) {
  try {
    await initializeSystem();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'twins':
        const twins = twinEngine.getAllTwins();
        return NextResponse.json({ twins });

      case 'agents':
        const agents = orchestrator.getAgentStatus();
        return NextResponse.json({ agents });

      case 'health':
        const health = twinEngine.getSystemHealth();
        return NextResponse.json({ health });

      default:
        return NextResponse.json({
          twins: twinEngine.getAllTwins(),
          agents: orchestrator.getAgentStatus(),
          health: twinEngine.getSystemHealth(),
          metrics: orchestrator.getSystemMetrics()
        });
    }
  } catch (error) {
    console.error('Error fetching digital twin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/digital-twin - Create twin or run simulation
export async function POST(request: NextRequest) {
  try {
    await initializeSystem();

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create_twin':
        const twin = await twinEngine.createTwin(
          params.type,
          params.id,
          params.initialState
        );
        return NextResponse.json({ twin }, { status: 201 });

      case 'update_physical':
        await twinEngine.updatePhysicalState(params.entityId, params.state);
        return NextResponse.json({ success: true });

      case 'run_simulation':
        const results = await twinEngine.runSimulation(params);
        return NextResponse.json({ results });

      case 'agent_request':
        const response = await orchestrator.requestCapability(
          params.agentId,
          params.capability,
          params.parameters
        );
        return NextResponse.json({ response });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in digital twin operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/digital-twin - Update twin
export async function PUT(request: NextRequest) {
  try {
    await initializeSystem();

    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get('entityId');

    if (!entityId) {
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    const body = await request.json();
    await twinEngine.updatePhysicalState(entityId, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating twin:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/digital-twin - Shutdown system
export async function DELETE() {
  try {
    await twinEngine.shutdown();
    await orchestrator.shutdown();
    initialized = false;
    return NextResponse.json({ message: 'System shutdown complete' });
  } catch (error) {
    console.error('Error shutting down system:', error);
    return NextResponse.json(
      { error: 'Shutdown failed' },
      { status: 500 }
    );
  }
}
