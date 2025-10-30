'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, Cpu, Activity, Zap, Eye, Settings, Play, Pause, 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle 
} from 'lucide-react';

interface TwinEntity {
  id: string;
  type: string;
  physicalState: Record<string, any>;
  virtualState: Record<string, any>;
  predictions: Record<string, any>;
  confidence: number;
  lastSync: Date;
}

interface AgentStatus {
  name: string;
  active: boolean;
  capabilities: string[];
  status: Record<string, any>;
}

export default function DigitalTwinPage() {
  const [twins, setTwins] = useState<TwinEntity[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({});
  const [systemHealth, setSystemHealth] = useState<any>({});
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const mockTwins: TwinEntity[] = [
        {
          id: 'robot-001',
          type: 'robot',
          physicalState: { status: 'WORKING', batteryLevel: 85, location: 'A-01-02' },
          virtualState: { status: 'WORKING', batteryLevel: 87, taskProgress: 0.6 },
          predictions: { nextHourState: { batteryLevel: 75 }, anomalyScore: 0.1 },
          confidence: 0.92,
          lastSync: new Date()
        },
        {
          id: 'bin-A01',
          type: 'bin',
          physicalState: { currentLoad: 45, capacity: 100, temperature: 22 },
          virtualState: { currentLoad: 45, predictedUtilization: 0.52 },
          predictions: { nextHourState: { currentLoad: 48 }, anomalyScore: 0.05 },
          confidence: 0.95,
          lastSync: new Date()
        }
      ];

      const mockAgents = {
        'inventory-agent': {
          name: 'Inventory Optimization Agent',
          active: true,
          capabilities: ['optimize_reorder_points', 'forecast_demand', 'abc_analysis'],
          status: { trackedItems: 1250, averageAccuracy: 0.87, stockoutRisk: 5.2 }
        },
        'routing-agent': {
          name: 'Routing Optimization Agent',
          active: true,
          capabilities: ['optimize_routes', 'traffic_management', 'collision_avoidance'],
          status: { activeRoutes: 12, averageEfficiency: 0.91, collisionsPrevented: 3 }
        }
      };

      const mockSystemHealth = {
        totalTwins: mockTwins.length,
        averageConfidence: 0.95,
        recentlySynced: mockTwins.length,
        syncPercentage: 100,
        isRunning: true
      };

      setTwins(mockTwins);
      setAgents(mockAgents);
      setSystemHealth(mockSystemHealth);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    setSimulationRunning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResults = {
        scenarios: [
          {
            scenario: 'peak_demand',
            summary: { efficiency: 0.78, totalThroughput: 245, averageUtilization: 0.89 }
          }
        ],
        recommendations: ['Consider additional robots for peak demand scenario'],
        confidence: 0.84
      };

      setSimulationResults(mockResults);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setSimulationRunning(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'robot': return <Cpu className="h-5 w-5" />;
      case 'sensor': return <Activity className="h-5 w-5" />;
      case 'bin': return <Eye className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const variant = percentage > 90 ? 'default' : percentage > 70 ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{percentage}%</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Digital Twin System...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital Twin & AI Agents</h1>
          <p className="text-muted-foreground">Real-time digital twin synchronization and multi-agent AI system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSimulation} disabled={simulationRunning}>
            {simulationRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {simulationRunning ? 'Running...' : 'Run Simulation'}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Digital Twins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemHealth.totalTwins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemHealth.syncPercentage}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{Math.round(systemHealth.averageConfidence * 100)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Object.values(agents).filter(a => a.active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Operational</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="twins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="twins">Digital Twins</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="twins">
          <Card>
            <CardHeader>
              <CardTitle>Digital Twin Entities</CardTitle>
              <CardDescription>Real-time synchronization between physical and virtual states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {twins.map((twin) => (
                  <div key={twin.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getEntityIcon(twin.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{twin.id}</h3>
                        <p className="text-sm text-muted-foreground">Type: {twin.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Physical State</div>
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(twin.physicalState).slice(0, 2).map(([key, value]) => (
                            <div key={key}>{key}: {String(value)}</div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getConfidenceBadge(twin.confidence)}
                        <Button size="sm" variant="outline">Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent Network</CardTitle>
              <CardDescription>Multi-agent system for autonomous warehouse optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(agents).map(([agentId, agent]) => (
                  <div key={agentId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Brain className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <div className="flex gap-2 mt-1">
                          {agent.capabilities.slice(0, 2).map((cap) => (
                            <Badge key={cap} variant="outline" className="text-xs">
                              {cap.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Performance</div>
                        <div className="text-xs text-muted-foreground">
                          {Object.entries(agent.status).slice(0, 2).map(([key, value]) => (
                            <div key={key}>{key}: {String(value)}</div>
                          ))}
                        </div>
                      </div>
                      <Badge variant={agent.active ? 'default' : 'secondary'}>
                        {agent.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Simulation</CardTitle>
              <CardDescription>Test different operational scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={runSimulation} disabled={simulationRunning}>
                    Peak Demand
                  </Button>
                  <Button variant="outline" onClick={runSimulation} disabled={simulationRunning}>
                    Equipment Failure
                  </Button>
                </div>
                
                {simulationRunning && (
                  <Alert>
                    <Activity className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Running simulation scenarios...
                    </AlertDescription>
                  </Alert>
                )}

                {simulationResults && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Results</h4>
                    <div className="text-sm">
                      <div>Efficiency: {Math.round(simulationResults.scenarios[0].summary.efficiency * 100)}%</div>
                      <div>Confidence: {Math.round(simulationResults.confidence * 100)}%</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}