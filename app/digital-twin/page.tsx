'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Activity,
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  Square,
  Settings,
  TrendingUp,
  Users,
  Bot,
  Database
} from 'lucide-react';

interface TwinEntity {
  id: string;
  type: 'warehouse' | 'robot' | 'bin' | 'item' | 'sensor';
  physicalState: Record<string, any>;
  virtualState: Record<string, any>;
  predictions: Record<string, any>;
  confidence: number;
  lastSync: string;
}

interface AgentStatus {
  name: string;
  active: boolean;
  capabilities: string[];
  status: Record<string, any>;
}

interface SystemHealth {
  totalTwins: number;
  averageConfidence: number;
  recentlySynced: number;
  syncPercentage: number;
  isRunning: boolean;
}

interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  queueLength: number;
  isProcessing: boolean;
  totalCapabilities: number;
}

export default function DigitalTwinPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // System state
  const [twins, setTwins] = useState<TwinEntity[]>([]);
  const [agents, setAgents] = useState<Record<string, AgentStatus>>({});
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Create twin state
  const [newTwin, setNewTwin] = useState({
    type: 'robot' as TwinEntity['type'],
    id: '',
    initialState: '{}'
  });

  // Simulation state
  const [simulationParams, setSimulationParams] = useState({
    scenarios: ['normal_operation', 'peak_demand'],
    timeHorizon: 24,
    parameters: '{}'
  });

  // Update state
  const [updateTwin, setUpdateTwin] = useState({
    entityId: '',
    state: '{}'
  });

  useEffect(() => {
    loadSystemStatus();
    const interval = setInterval(loadSystemStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/digital-twin');
      if (!response.ok) throw new Error('Failed to load system status');

      const data = await response.json();
      setTwins(data.twins || []);
      setAgents(data.agents || {});
      setHealth(data.health || null);
      setMetrics(data.metrics || null);
      setIsRunning(data.health?.isRunning || false);
    } catch (err) {
      console.error('Error loading system status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load system status');
    }
  };

  const createTwin = async () => {
    setLoading(true);
    setError('');

    try {
      let initialState;
      try {
        initialState = JSON.parse(newTwin.initialState);
      } catch {
        throw new Error('Invalid JSON in initial state');
      }

      const response = await fetch('/api/digital-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_twin',
          type: newTwin.type,
          id: newTwin.id,
          initialState
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create twin');
      }

      setNewTwin({ type: 'robot', id: '', initialState: '{}' });
      await loadSystemStatus();
      alert('Digital twin created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create twin');
    } finally {
      setLoading(false);
    }
  };

  const updatePhysicalState = async () => {
    setLoading(true);
    setError('');

    try {
      let state;
      try {
        state = JSON.parse(updateTwin.state);
      } catch {
        throw new Error('Invalid JSON in state');
      }

      const response = await fetch('/api/digital-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_physical',
          entityId: updateTwin.entityId,
          state
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update physical state');
      }

      setUpdateTwin({ entityId: '', state: '{}' });
      await loadSystemStatus();
      alert('Physical state updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update physical state');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    setError('');

    try {
      let parameters;
      try {
        parameters = JSON.parse(simulationParams.parameters);
      } catch {
        throw new Error('Invalid JSON in parameters');
      }

      const response = await fetch('/api/digital-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_simulation',
          scenarios: simulationParams.scenarios,
          timeHorizon: simulationParams.timeHorizon,
          parameters
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to run simulation');
      }

      const data = await response.json();
      alert(`Simulation completed! Confidence: ${data.results.confidence.toFixed(2)}`);
      await loadSystemStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const requestAgentCapability = async (agentId: string, capability: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/digital-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'agent_request',
          agentId,
          capability,
          parameters: {} // Could be made configurable
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request agent capability');
      }

      const data = await response.json();
      alert(`Agent capability executed! Result: ${JSON.stringify(data.response)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request agent capability');
    } finally {
      setLoading(false);
    }
  };

  const shutdownSystem = async () => {
    if (!confirm('Are you sure you want to shutdown the digital twin system?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/digital-twin', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to shutdown system');
      }

      await loadSystemStatus();
      alert('System shutdown successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to shutdown system');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'robot': return <Bot className="h-4 w-4" />;
      case 'bin': return <Database className="h-4 w-4" />;
      case 'sensor': return <Activity className="h-4 w-4" />;
      case 'warehouse': return <TrendingUp className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital Twin System</h1>
          <p className="text-muted-foreground">Real-time warehouse simulation and AI orchestration</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            onClick={isRunning ? shutdownSystem : loadSystemStatus}
            disabled={loading}
          >
            {isRunning ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRunning ? 'Shutdown' : 'Start'} System
          </Button>
          <Button variant="outline" onClick={loadSystemStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Twins</p>
                  <p className="text-2xl font-bold">{health.totalTwins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                  <p className={`text-2xl font-bold ${getConfidenceColor(health.averageConfidence)}`}>
                    {(health.averageConfidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Sync Rate</p>
                  <p className="text-2xl font-bold">{health.syncPercentage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{metrics?.activeAgents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="twins">Digital Twins</TabsTrigger>
          <TabsTrigger value="agents">AI Agents</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current operational state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>System Running</span>
                  <Badge variant={isRunning ? "default" : "secondary"}>
                    {isRunning ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Processing Queue</span>
                  <Badge variant={metrics?.isProcessing ? "default" : "secondary"}>
                    {metrics?.queueLength || 0} items
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Capabilities</span>
                  <Badge variant="outline">
                    {metrics?.totalCapabilities || 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {twins.slice(0, 5).map((twin) => (
                    <div key={twin.id} className="flex items-center gap-3">
                      {getTypeIcon(twin.type)}
                      <div className="flex-1">
                        <div className="font-medium">{twin.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Last sync: {new Date(twin.lastSync).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge className={getConfidenceColor(twin.confidence)}>
                        {(twin.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                  {twins.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      No twins created yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="twins">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Twin */}
            <Card>
              <CardHeader>
                <CardTitle>Create Digital Twin</CardTitle>
                <CardDescription>Add a new entity to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twinType">Type</Label>
                    <Select
                      value={newTwin.type}
                      onValueChange={(value) => setNewTwin({...newTwin, type: value as TwinEntity['type']})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="robot">Robot</SelectItem>
                        <SelectItem value="bin">Bin</SelectItem>
                        <SelectItem value="item">Item</SelectItem>
                        <SelectItem value="sensor">Sensor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="twinId">Entity ID</Label>
                    <Input
                      id="twinId"
                      value={newTwin.id}
                      onChange={(e) => setNewTwin({...newTwin, id: e.target.value})}
                      placeholder="e.g., robot-001"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="initialState">Initial State (JSON)</Label>
                  <Textarea
                    id="initialState"
                    value={newTwin.initialState}
                    onChange={(e) => setNewTwin({...newTwin, initialState: e.target.value})}
                    placeholder='{"location": "A-01-01", "status": "idle"}'
                    rows={4}
                  />
                </div>
                <Button
                  onClick={createTwin}
                  disabled={loading || !newTwin.id.trim()}
                  className="w-full"
                >
                  {loading ? 'Creating...' : 'Create Twin'}
                </Button>
              </CardContent>
            </Card>

            {/* Update Physical State */}
            <Card>
              <CardHeader>
                <CardTitle>Update Physical State</CardTitle>
                <CardDescription>Sync physical entity state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="entityId">Entity ID</Label>
                  <Input
                    id="entityId"
                    value={updateTwin.entityId}
                    onChange={(e) => setUpdateTwin({...updateTwin, entityId: e.target.value})}
                    placeholder="e.g., robot-001"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State Update (JSON)</Label>
                  <Textarea
                    id="state"
                    value={updateTwin.state}
                    onChange={(e) => setUpdateTwin({...updateTwin, state: e.target.value})}
                    placeholder='{"temperature": 25.5, "humidity": 60}'
                    rows={4}
                  />
                </div>
                <Button
                  onClick={updatePhysicalState}
                  disabled={loading || !updateTwin.entityId.trim()}
                  className="w-full"
                >
                  {loading ? 'Updating...' : 'Update State'}
                </Button>
              </CardContent>
            </Card>

            {/* Twins List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Digital Twins ({twins.length})</CardTitle>
                <CardDescription>All entities in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Last Sync</TableHead>
                      <TableHead>Physical State</TableHead>
                      <TableHead>Virtual State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {twins.map((twin) => (
                      <TableRow key={twin.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(twin.type)}
                            <span className="capitalize">{twin.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{twin.id}</TableCell>
                        <TableCell>
                          <Badge className={getConfidenceColor(twin.confidence)}>
                            {(twin.confidence * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(twin.lastSync).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(twin.physicalState).slice(0, 50)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {JSON.stringify(twin.virtualState).slice(0, 50)}...
                          </code>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {twins.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No digital twins created yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Status */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Agents ({Object.keys(agents).length})</CardTitle>
                <CardDescription>Intelligent agents managing warehouse operations</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Capabilities</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(agents).map(([id, agent]) => (
                      <TableRow key={id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-sm text-muted-foreground">{id}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.active ? "default" : "secondary"}>
                            {agent.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.map((cap) => (
                              <Badge key={cap} variant="outline" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {agent.capabilities.map((cap) => (
                              <Button
                                key={cap}
                                variant="outline"
                                size="sm"
                                onClick={() => requestAgentCapability(id, cap)}
                                disabled={loading || !agent.active}
                              >
                                {cap.replace('_', ' ')}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {Object.keys(agents).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No agents registered yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulation">
          <Card>
            <CardHeader>
              <CardTitle>Run Simulation</CardTitle>
              <CardDescription>Test scenarios and predict outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeHorizon">Time Horizon (hours)</Label>
                  <Input
                    id="timeHorizon"
                    type="number"
                    value={simulationParams.timeHorizon}
                    onChange={(e) => setSimulationParams({...simulationParams, timeHorizon: parseInt(e.target.value) || 24})}
                  />
                </div>
                <div>
                  <Label htmlFor="scenarios">Scenarios</Label>
                  <Select
                    value={simulationParams.scenarios[0]}
                    onValueChange={(value) => setSimulationParams({...simulationParams, scenarios: [value]})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal_operation">Normal Operation</SelectItem>
                      <SelectItem value="peak_demand">Peak Demand</SelectItem>
                      <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                      <SelectItem value="supply_disruption">Supply Disruption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="simParams">Parameters (JSON)</Label>
                <Textarea
                  id="simParams"
                  value={simulationParams.parameters}
                  onChange={(e) => setSimulationParams({...simulationParams, parameters: e.target.value})}
                  placeholder='{"demandMultiplier": 1.5, "failureRate": 0.1}'
                  rows={4}
                />
              </div>
              <Button
                onClick={runSimulation}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Running Simulation...' : 'Run Simulation'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
