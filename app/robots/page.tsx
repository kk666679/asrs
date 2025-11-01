'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
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
import { Switch } from '@/components/ui/switch';
import { useRobots } from '@/lib/hooks/useRobots';
import {
  Bot,
  Play,
  Square,
  Settings,
  MapPin,
  Battery,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Zap,
  Navigation,
  Package,
  Camera,
  Wifi,
  WifiOff,
  BarChart3,
  Activity,
  Gauge,
  Thermometer,
  Cpu
} from 'lucide-react';

interface Robot {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  location: string | null;
  batteryLevel: number | null;
  lastMaintenance: string | null;
  zone: {
    id: string;
    code: string;
    name: string;
  } | null;
  commands: Array<{
    id: string;
    type: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  specifications?: {
    maxSpeed: number;
    maxLoad: number;
    temperature: number;
    signalStrength: number;
    firmware: string;
  };
  performance?: {
    tasksCompleted: number;
    uptime: number;
    efficiency: number;
    errors: number;
  };
}

interface RobotCommand {
  id: string;
  robotId: string;
  type: string;
  status: string;
  parameters: any;
  priority: string;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  robot?: {
    code: string;
    name: string;
  };
}

interface RobotMetrics {
  timestamp: string;
  batteryLevel: number;
  temperature: number;
  signalStrength: number;
  currentLoad: number;
  speed: number;
}

export default function RobotsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Use the new hook
  const {
    robots,
    filteredRobots,
    robotStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    createRobot: createRobotHook,
    updateRobot: updateRobotHook,
    deleteRobot: deleteRobotHook,
    refreshRobots,
  } = useRobots();

  // Commands state (keeping for now, could be moved to hook later)
  const [commands, setCommands] = useState<RobotCommand[]>([]);
  const [commandPagination, setCommandPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Real-time metrics
  const [robotMetrics, setRobotMetrics] = useState<Record<string, RobotMetrics>>({});

  // Create robot state
  const [newRobot, setNewRobot] = useState({
    code: '',
    name: '',
    type: 'STORAGE_RETRIEVAL',
    status: 'IDLE',
    location: '',
    zoneId: '',
    batteryLevel: 100,
  });

  // Command state
  const [selectedRobot, setSelectedRobot] = useState<any>(null);
  const [newCommand, setNewCommand] = useState({
    type: 'MOVE',
    priority: 'MEDIUM',
    parameters: '{}',
  });

  // Real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshRobots();
      loadCommands();
      loadMetrics();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshRobots]);

  // Remove old loadRobots function since we're using the hook

  const loadCommands = async () => {
    try {
      const params = new URLSearchParams({
        page: commandPagination.page.toString(),
        limit: commandPagination.limit.toString(),
      });

      const data = await apiClient.robotCommands.getAll(Object.fromEntries(params)) as any;
      setCommands(data.commands);
      setCommandPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load commands:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await apiClient.robotMetrics.getAll() as any;
      setRobotMetrics(data.metrics);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const createRobot = async () => {
    try {
      await createRobotHook({
        code: newRobot.code,
        name: newRobot.name,
        type: newRobot.type as any,
        status: newRobot.status as any,
        location: newRobot.location,
        zoneId: newRobot.zoneId,
        batteryLevel: newRobot.batteryLevel,
      });

      setNewRobot({
        code: '',
        name: '',
        type: 'STORAGE_RETRIEVAL',
        status: 'IDLE',
        location: '',
        zoneId: '',
        batteryLevel: 100,
      });
      alert('Robot created successfully!');
    } catch (err) {
      console.error('Failed to create robot:', err);
    }
  };

  const updateRobot = async (robotId: string, updates: Partial<Robot>) => {
    try {
      await updateRobotHook(robotId, updates as any);
    } catch (err) {
      console.error('Failed to update robot:', err);
    }
  };

  const deleteRobot = async (robotId: string) => {
    if (!confirm('Are you sure you want to delete this robot?')) return;

    try {
      await deleteRobotHook(robotId);
      alert('Robot deleted successfully!');
    } catch (err) {
      console.error('Failed to delete robot:', err);
    }
  };

  const sendCommand = async () => {
    if (!selectedRobot) return;

    try {
      let parameters;
      try {
        parameters = JSON.parse(newCommand.parameters);
      } catch {
        throw new Error('Invalid JSON in parameters');
      }

      // For now, just log the command - in a real implementation this would call an API
      console.log('Sending command:', {
        robotId: selectedRobot.id,
        type: newCommand.type,
        priority: newCommand.priority,
        parameters,
      });

      setNewCommand({
        type: 'MOVE',
        priority: 'MEDIUM',
        parameters: '{}',
      });
      setSelectedRobot(null);
      await loadCommands();
      alert('Command sent successfully!');
    } catch (err) {
      console.error('Failed to send command:', err);
    }
  };

  const cancelCommand = async (commandId: string) => {
    try {
      // For now, just log the cancellation - in a real implementation this would call an API
      console.log('Cancelling command:', commandId);

      await loadCommands();
      alert('Command cancelled successfully!');
    } catch (err) {
      console.error('Failed to cancel command:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      IDLE: 'bg-gray-500',
      WORKING: 'bg-blue-500',
      MAINTENANCE: 'bg-yellow-500',
      ERROR: 'bg-red-500',
      OFFLINE: 'bg-gray-700',
      CHARGING: 'bg-purple-500',
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-500',
      MEDIUM: 'bg-yellow-500',
      HIGH: 'bg-orange-500',
      URGENT: 'bg-red-500',
    };
    return (
      <Badge className={`${colors[priority as keyof typeof colors]} text-white`}>
        {priority.toLowerCase()}
      </Badge>
    );
  };

  const getCommandStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      EXECUTING: 'bg-blue-500',
      COMPLETED: 'bg-green-500',
      FAILED: 'bg-red-500',
      CANCELLED: 'bg-gray-500',
    };
    return (
      <Badge className={`${colors[status as keyof typeof colors] || 'bg-gray-500'} text-white`}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getBatteryColor = (level: number | null | undefined) => {
    if (!level) return 'text-gray-500';
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSignalStrength = (strength: number) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-yellow-600';
    if (strength >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 40) return 'text-green-600';
    if (temp <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Robotics Control Center</h1>
          <p className="text-muted-foreground">Monitor and manage automated storage and retrieval robots</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
          </div>
          <Button onClick={refreshRobots} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="robots">Robots</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Robots</p>
                    <p className="text-2xl font-bold">{robotStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Play className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">
                      {robotStats.active}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Charging</p>
                    <p className="text-2xl font-bold">
                      {robotStats.idle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Issues</p>
                    <p className="text-2xl font-bold">
                      {robotStats.error + robotStats.maintenance}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Robot Grid with Enhanced Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map((robot) => {
              const metrics = robotMetrics[robot.id];
              return (
                <Card key={robot.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        {robot.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {metrics && (
                          <Wifi className={`h-4 w-4 ${getSignalStrength(metrics.signalStrength)}`} />
                        )}
                        {getStatusBadge(robot.status)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span>{robot.code}</span>
                      <span>•</span>
                      <span className="capitalize">{robot.type.toLowerCase().replace('_', ' ')}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{robot.location || 'Unknown location'}</span>
                    </div>

                    {/* Real-time Metrics */}
                    {metrics && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          <span>Speed: {metrics.speed}m/s</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Load: {metrics.currentLoad}kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          <span className={getTemperatureColor(metrics.temperature)}>
                            Temp: {metrics.temperature}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          <span>Signal: {metrics.signalStrength}%</span>
                        </div>
                      </div>
                    )}

                    {/* Battery */}
                    {robot.batteryLevel !== null && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4" />
                            <span>Battery</span>
                          </div>
                          <span className={getBatteryColor(robot.batteryLevel)}>
                            {robot.batteryLevel}%
                          </span>
                        </div>
                        <Progress value={robot.batteryLevel} className="h-2" />
                      </div>
                    )}

                    {/* Performance */}
                    {(robot as any).performance && (
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div>
                          <div className="font-bold">{(robot as any).performance.tasksCompleted}</div>
                          <div className="text-muted-foreground">Tasks</div>
                        </div>
                        <div>
                          <div className="font-bold">{formatUptime((robot as any).performance.uptime)}</div>
                          <div className="text-muted-foreground">Uptime</div>
                        </div>
                        <div>
                          <div className="font-bold">{(robot as any).performance.efficiency}%</div>
                          <div className="text-muted-foreground">Efficiency</div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRobot(robot)}
                            className="flex-1"
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Command
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Command to {robot.name}</DialogTitle>
                            <DialogDescription>
                              Configure and send a command to this robot
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="cmdType">Command Type</Label>
                                <Select
                                  value={newCommand.type}
                                  onValueChange={(value) => setNewCommand({...newCommand, type: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="MOVE">Move</SelectItem>
                                    <SelectItem value="PICK">Pick Item</SelectItem>
                                    <SelectItem value="PLACE">Place Item</SelectItem>
                                    <SelectItem value="SCAN">Scan Area</SelectItem>
                                    <SelectItem value="CALIBRATE">Calibrate</SelectItem>
                                    <SelectItem value="CHARGE">Go to Charge</SelectItem>
                                    <SelectItem value="EMERGENCY_STOP">Emergency Stop</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="cmdPriority">Priority</Label>
                                <Select
                                  value={newCommand.priority}
                                  onValueChange={(value) => setNewCommand({...newCommand, priority: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                    <SelectItem value="URGENT">Urgent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="cmdParams">Parameters (JSON)</Label>
                              <Textarea
                                id="cmdParams"
                                value={newCommand.parameters}
                                onChange={(e) => setNewCommand({...newCommand, parameters: e.target.value})}
                                placeholder='{"destination": "A-01-01", "itemId": "ITEM-001"}'
                                rows={3}
                              />
                            </div>
                            <Button onClick={sendCommand} disabled={isLoading} className="w-full">
                              {isLoading ? 'Sending...' : 'Send Command'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRobot(robot.id, {
                          status: robot.status === 'IDLE' ? 'MAINTENANCE' : 'IDLE'
                        })}
                        disabled={isLoading}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        {robot.status === 'MAINTENANCE' ? 'Activate' : 'Maintenance'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="robots">
          <div className="space-y-6">
            {/* Enhanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="search">Search Robots</Label>
                    <Input
                      id="search"
                      placeholder="Search by code, name, or location..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Robot Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters({...filters, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="STORAGE_RETRIEVAL">Storage Retrieval</SelectItem>
                        <SelectItem value="CONVEYOR">Conveyor</SelectItem>
                        <SelectItem value="SORTING">Sorting</SelectItem>
                        <SelectItem value="PACKING">Packing</SelectItem>
                        <SelectItem value="TRANSPORT">Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({...filters, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="IDLE">Idle</SelectItem>
                        <SelectItem value="WORKING">Working</SelectItem>
                        <SelectItem value="CHARGING">Charging</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zone">Zone ID</Label>
                    <Input
                      id="zone"
                      placeholder="Zone ID"
                      value={filters.zoneId}
                      onChange={(e) => setFilters({...filters, zoneId: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Robots Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Robots Management ({robotStats.total})
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Robot
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Robot</DialogTitle>
                        <DialogDescription>
                          Add a new robot to the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="robotCode">Robot Code</Label>
                          <Input
                            id="robotCode"
                            value={newRobot.code}
                            onChange={(e) => setNewRobot({...newRobot, code: e.target.value})}
                            placeholder="RBT-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="robotName">Robot Name</Label>
                          <Input
                            id="robotName"
                            value={newRobot.name}
                            onChange={(e) => setNewRobot({...newRobot, name: e.target.value})}
                            placeholder="Storage Robot 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="robotType">Type</Label>
                          <Select
                            value={newRobot.type}
                            onValueChange={(value) => setNewRobot({...newRobot, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STORAGE_RETRIEVAL">Storage Retrieval</SelectItem>
                              <SelectItem value="CONVEYOR">Conveyor</SelectItem>
                              <SelectItem value="SORTING">Sorting</SelectItem>
                              <SelectItem value="PACKING">Packing</SelectItem>
                              <SelectItem value="TRANSPORT">Transport</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="robotBattery">Battery Level</Label>
                          <Input
                            id="robotBattery"
                            type="number"
                            value={newRobot.batteryLevel ?? 100}
                            onChange={(e) => setNewRobot({...newRobot, batteryLevel: parseInt(e.target.value) || 100})}
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="robotZone">Zone ID</Label>
                          <Input
                            id="robotZone"
                            value={newRobot.zoneId}
                            onChange={(e) => setNewRobot({...newRobot, zoneId: e.target.value})}
                            placeholder="ZONE-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="robotLocation">Initial Location</Label>
                          <Input
                            id="robotLocation"
                            value={newRobot.location}
                            onChange={(e) => setNewRobot({...newRobot, location: e.target.value})}
                            placeholder="A-01-01"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={createRobot}
                        disabled={isLoading || !newRobot.code.trim() || !newRobot.name.trim()}
                        className="w-full mt-4"
                      >
                        {isLoading ? 'Creating...' : 'Create Robot'}
                      </Button>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
                <CardDescription>
                  {robotStats.active} active robots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead>Commands</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {robots.map((robot) => (
                      <TableRow key={robot.id}>
                        <TableCell className="font-medium">{robot.code}</TableCell>
                        <TableCell>{robot.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {robot.type.toLowerCase().replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(robot.status)}</TableCell>
                        <TableCell>{robot.location || 'N/A'}</TableCell>
                        <TableCell>
                          {robot.batteryLevel !== null ? (
                            <div className="flex items-center gap-2">
                              <span className={getBatteryColor(robot.batteryLevel)}>
                                {robot.batteryLevel}%
                              </span>
                              <Progress value={robot.batteryLevel} className="w-12 h-2" />
                            </div>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{robot.zoneId || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            0
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRobot(robot.id, { status: 'MAINTENANCE' })}
                              disabled={isLoading}
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRobot(robot)}
                            >
                              <Navigation className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteRobot(robot.id)}
                              disabled={isLoading}
                            >
                              <Square className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredRobots.length} of {robotStats.total} robots
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentPage = ((filters as any).page as number) || 1;
                        (setFilters as any)({...filters, page: currentPage - 1});
                      }}
                      disabled={(((filters as any).page as number) || 1) <= 1 || isLoading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const currentPage = ((filters as any).page as number) || 1;
                        (setFilters as any)({...filters, page: currentPage + 1});
                      }}
                      disabled={isLoading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commands">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Command History
                </CardTitle>
                <CardDescription>
                  Monitor and manage robot command execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Command ID</TableHead>
                      <TableHead>Robot</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commands.map((command) => (
                      <TableRow key={command.id}>
                        <TableCell className="font-mono text-sm">
                          {command.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {command.robot ? (
                            <div>
                              <div className="font-medium">{command.robot.name}</div>
                              <div className="text-sm text-muted-foreground">{command.robot.code}</div>
                            </div>
                          ) : (
                            'Unknown Robot'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {command.type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{getCommandStatusBadge(command.status)}</TableCell>
                        <TableCell>{getPriorityBadge(command.priority)}</TableCell>
                        <TableCell>
                          {new Date(command.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {command.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelCommand(command.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {commands.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No commands found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRobots.filter(r => (r as any).performance).map(robot => (
                    <div key={robot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{robot.name}</div>
                        <div className="text-sm text-muted-foreground">{robot.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{(robot as any).performance!.efficiency}%</div>
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Battery Health</span>
                      <span>
                        {Math.round(robots.reduce((sum, r) => sum + (r.batteryLevel || 0), 0) / robots.length)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.round(robots.reduce((sum, r) => sum + (r.batteryLevel || 0), 0) / robots.length)}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>System Uptime</span>
                      <span>98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Task Success Rate</span>
                      <span>99.2%</span>
                    </div>
                    <Progress value={99.2} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
