"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const twin_engine_1 = require("@/lib/digital-twin/twin-engine");
const agent_orchestrator_1 = require("@/lib/ai-agents/agent-orchestrator");
const inventory_agent_1 = require("@/lib/ai-agents/inventory-agent");
const twinEngine = new twin_engine_1.DigitalTwinEngine();
const orchestrator = new agent_orchestrator_1.AgentOrchestrator();
const inventoryAgent = new inventory_agent_1.InventoryAgent();
let initialized = false;
async function initializeSystem() {
    if (!initialized) {
        await twinEngine.initialize();
        await orchestrator.registerAgent(inventoryAgent);
        initialized = true;
    }
}
async function GET(request) {
    try {
        await initializeSystem();
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        switch (action) {
            case 'twins':
                const twins = twinEngine.getAllTwins();
                return server_1.NextResponse.json({ twins });
            case 'agents':
                const agents = orchestrator.getAgentStatus();
                return server_1.NextResponse.json({ agents });
            case 'health':
                const health = twinEngine.getSystemHealth();
                return server_1.NextResponse.json({ health });
            default:
                return server_1.NextResponse.json({
                    twins: twinEngine.getAllTwins(),
                    agents: orchestrator.getAgentStatus(),
                    health: twinEngine.getSystemHealth(),
                    metrics: orchestrator.getSystemMetrics()
                });
        }
    }
    catch (error) {
        console.error('Error fetching digital twin status:', error);
        return server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
async function POST(request) {
    try {
        await initializeSystem();
        const body = await request.json();
        const { action, ...params } = body;
        switch (action) {
            case 'create_twin':
                const twin = await twinEngine.createTwin(params.type, params.id, params.initialState);
                return server_1.NextResponse.json({ twin }, { status: 201 });
            case 'update_physical':
                await twinEngine.updatePhysicalState(params.entityId, params.state);
                return server_1.NextResponse.json({ success: true });
            case 'run_simulation':
                const results = await twinEngine.runSimulation(params);
                return server_1.NextResponse.json({ results });
            case 'agent_request':
                const response = await orchestrator.requestCapability(params.agentId, params.capability, params.parameters);
                return server_1.NextResponse.json({ response });
            default:
                return server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    }
    catch (error) {
        console.error('Error in digital twin operation:', error);
        return server_1.NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
async function PUT(request) {
    try {
        await initializeSystem();
        const { searchParams } = new URL(request.url);
        const entityId = searchParams.get('entityId');
        if (!entityId) {
            return server_1.NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
        }
        const body = await request.json();
        await twinEngine.updatePhysicalState(entityId, body);
        return server_1.NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error updating twin:', error);
        return server_1.NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }
}
async function DELETE() {
    try {
        await twinEngine.shutdown();
        await orchestrator.shutdown();
        initialized = false;
        return server_1.NextResponse.json({ message: 'System shutdown complete' });
    }
    catch (error) {
        console.error('Error shutting down system:', error);
        return server_1.NextResponse.json({ error: 'Shutdown failed' }, { status: 500 });
    }
}
//# sourceMappingURL=route.js.map