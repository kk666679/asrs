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
  Filter
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
}

export default function RobotsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Robots state
  const [robots, setRobots] = useState<Robot[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    zoneId: '',
    search: '',
  });

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
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [newCommand, setNewCommand] = useState({
    type: 'MOVE',
    priority: 'MEDIUM',
    parameters: '{}',
  });

  useEffect(() => {
    loadRobots();
  }, [filters, pagination.page]);

  const loadRobots = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        ),
      });

      const response = await fetch(`/api/robots?${params}`);
      if (!response.ok) throw new Error('Failed to load robots');

      const data = await response.json();
      setRobots(data.robots);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load robots');
    } finally {
      setLoading(false);
    }
  };

  const createRobot = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/robots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRobot),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create robot');
      }

      setNewRobot({
        code: '',
        name: '',
        type: 'STORAGE_RETRIEVAL',
        status: 'IDLE',
        location: '',
        zoneId: '',
        batteryLevel: 100,
      });
      await loadRobots();
      alert('Robot created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create robot');
    } finally {
      setLoading(false);
    }
  };

  const updateRobot = async (robotId: string, updates: Partial<Robot>) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/robots?id=${robotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update robot');
      }

      await loadRobots();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update robot');
    } finally {
      setLoading(false);
    }
  };

  const deleteRobot = async (robotId: string) => {
    if (!confirm('Are you sure you want to delete this robot?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/robots?id=${robotId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete robot');
      }

      await loadRobots();
      alert('Robot deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete robot');
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async () => {
    if (!selectedRobot) return;

    setLoading(true);
    setError('');

    try {
      let parameters;
      try {
        parameters = JSON.parse(newCommand.parameters);
      } catch {
        throw new Error('Invalid JSON in parameters');
      }

      const response = await fetch('/api/robot-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robotId: selectedRobot.id,
          type: newCommand.type,
          priority: newCommand.priority,
          parameters,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send command');
      }

      setNewCommand({
        type: 'MOVE',
        priority: 'MEDIUM',
        parameters: '{}',
      });
      setSelectedRobot(null);
      await loadRobots();
      alert('Command sent successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send command');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      IDLE: 'bg-gray-500',
      WORKING: 'bg-blue-500',
      MAINTENANCE: 'bg-yellow-500',
      ERROR: 'bg-red-500',
      OFFLINE: 'bg-gray-700',
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

  const getBatteryColor = (level: number | null) => {
    if (!level) return 'text-gray-500';
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Robotics Control</h1>
          <p className="text-muted-foreground">Manage automated storage and retrieval robots</p>
        </div>
        <Button onClick={loadRobots} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="robots">Robots</TabsTrigger>
          <TabsTrigger value="commands">Commands</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Robots</p>
                    <p className="text-2xl font-bold">{pagination.total}</p>
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
                      {robots.filter(r => r.status === 'WORKING').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                    <p className="text-2xl font-bold">
                      {robots.filter(r => r.status === 'MAINTENANCE').length}
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
                    <p className="text-sm font-medium text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold">
                      {robots.filter(r => r.status === 'ERROR').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Robots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {robots.map((robot) => (
              <Card key={robot.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{robot.name}</CardTitle>
                    {getStatusBadge(robot.status)}
                  </div>
                  <CardDescription>{robot.code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{robot.location || 'Unknown'}</span>
                  </div>
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
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{robot.commands.length} pending commands</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRobot(robot)}
                        >
                          Send Command
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
                                  <SelectItem value="PICK">Pick</SelectItem>
                                  <SelectItem value="PLACE">Place</SelectItem>
                                  <SelectItem value="SCAN">Scan</SelectItem>
                                  <SelectItem value="CALIBRATE">Calibrate</SelectItem>
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
                              placeholder='{"destination": "A-01-01"}'
                              rows={3}
                            />
                          </div>
                          <Button onClick={sendCommand} disabled={loading} className="w-full">
                            {loading ? 'Sending...' : 'Send Command'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateRobot(robot.id, { status: robot.status === 'IDLE' ? 'MAINTENANCE' : 'IDLE' })}
                      disabled={loading}
                    >
                      {robot.status === 'MAINTENANCE' ? 'Activate' : 'Maintenance'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="robots">
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <Input
                      id="search"
                      placeholder="Robot code or name"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters({...filters, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
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
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="IDLE">Idle</SelectItem>
                        <SelectItem value="WORKING">Working</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="OFFLINE">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zone">Zone</Label>
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

            {/* Create Robot */}
            <Card>
              <CardHeader>
                <CardTitle>Create Robot</CardTitle>
                <CardDescription>Add a new robot to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="robotCode">Code</Label>
                    <Input
                      id="robotCode"
                      value={newRobot.code}
                      onChange={(e) => setNewRobot({...newRobot, code: e.target.value})}
                      placeholder="e.g., RBT-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="robotName">Name</Label>
                    <Input
                      id="robotName"
                      value={newRobot.name}
                      onChange={(e) => setNewRobot({...newRobot, name: e.target.value})}
                      placeholder="e.g., Storage Robot 1"
                    />
                  </div>
                  <div>
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
                  <div>
                    <Label htmlFor="robotZone">Zone ID</Label>
                    <Input
                      id="robotZone"
                      value={newRobot.zoneId}
                      onChange={(e) => setNewRobot({...newRobot, zoneId: e.target.value})}
                      placeholder="e.g., ZONE-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="robotLocation">Initial Location</Label>
                    <Input
                      id="robotLocation"
                      value={newRobot.location}
                      onChange={(e) => setNewRobot({...newRobot, location: e.target.value})}
                      placeholder="e.g., A-01-01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="robotBattery">Battery Level</Label>
                    <Input
                      id="robotBattery"
                      type="number"
                      value={newRobot.batteryLevel}
                      onChange={(e) => setNewRobot({...newRobot, batteryLevel: parseInt(e.target.value) || 100})}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
                <Button
                  onClick={createRobot}
                  disabled={loading || !newRobot.code.trim() || !newRobot.name.trim()}
                  className="mt-4"
                >
                  {loading ? 'Creating...' : 'Create Robot'}
                </Button>
              </CardContent>
            </Card>

            {/* Robots Table */}
            <Card>
              <CardHeader>
                <CardTitle>Robots ({pagination.total})</CardTitle>
                <CardDescription>Page {pagination.page} of {pagination.pages}</CardDescription>
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
                        <TableCell>{robot.type.replace('_', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(robot.status)}</TableCell>
                        <TableCell>{robot.location || 'N/A'}</TableCell>
                        <TableCell>
                          {robot.batteryLevel !== null ? (
                            <span className={getBatteryColor(robot.batteryLevel)}>
                              {robot.batteryLevel}%
                            </span>
                          ) : 'N/A'}
                        </TableCell>
                        <TableCell>{robot.zone?.name || 'N/A'}</TableCell>
                        <TableCell>{robot.commands.length}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateRobot(robot.id, { status: 'MAINTENANCE' })}
                              disabled={loading}
                            >
                              Maintenance
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteRobot(robot.id)}
                              disabled={loading}
                            >
                              Delete
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
                    Showing {robots.length} of {pagination.total} robots
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                      disabled={pagination.page <= 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                      disabled={pagination.page >= pagination.pages || loading}
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
          <Card>
            <CardHeader>
              <CardTitle>Robot Commands</CardTitle>
              <CardDescription>Monitor and manage robot command execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Command management interface coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
