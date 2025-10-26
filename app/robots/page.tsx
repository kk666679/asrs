'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Play, Square, AlertTriangle, Clock, CheckCircle, XCircle, Pause } from 'lucide-react';

interface Robot {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  zone?: {
    code: string;
    name: string;
  };
  commands?: Array<{
    id: string;
    type: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

interface RobotCommand {
  robotId: string;
  type: string;
  parameters?: any;
  priority: string;
  userId: string;
}

const robotTypeIcons = {
  STORAGE_RETRIEVAL: Bot,
  CONVEYOR: Bot,
  SORTING: Bot,
  PACKING: Bot,
  TRANSPORT: Bot,
};

const statusColors = {
  IDLE: 'bg-gray-500',
  WORKING: 'bg-blue-500',
  ERROR: 'bg-red-500',
  MAINTENANCE: 'bg-yellow-500',
  OFFLINE: 'bg-gray-700',
};

const priorityColors = {
  LOW: 'bg-gray-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export default function RobotsPage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRobot, setSelectedRobot] = useState<Robot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);
  const [commandForm, setCommandForm] = useState<RobotCommand>({
    robotId: '',
    type: 'MOVE',
    priority: 'MEDIUM',
    userId: 'user-1', // Mock user ID
  });

  useEffect(() => {
    fetchRobots();
  }, [filterType, filterStatus]);

  const fetchRobots = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/robots?${params}`);
      if (!response.ok) throw new Error('Failed to fetch robots');
      const data = await response.json();
      setRobots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load robots');
    } finally {
      setLoading(false);
    }
  };

  const sendCommand = async (command: RobotCommand) => {
    try {
      const response = await fetch('/api/robot-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send command');
      }

      alert('Command sent successfully!');
      setIsCommandDialogOpen(false);
      fetchRobots(); // Refresh robot status
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send command');
    }
  };

  const filteredRobots = robots.filter(robot =>
    robot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    robot.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} text-white`}>
        {priority.toLowerCase()}
      </Badge>
    );
  };

  const getRobotIcon = (type: string) => {
    const IconComponent = robotTypeIcons[type as keyof typeof robotTypeIcons] || Bot;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCommandStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'EXECUTING':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading robots...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Robotic Control</h1>
          <p className="text-muted-foreground">Monitor and control automated warehouse robots</p>
        </div>
        <Dialog open={isCommandDialogOpen} onOpenChange={setIsCommandDialogOpen}>
          <DialogTrigger asChild>
            <Button>Send Command</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Robot Command</DialogTitle>
              <DialogDescription>
                Send a command to control robot operations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="robotId">Robot</Label>
                <Select
                  value={commandForm.robotId}
                  onValueChange={(value) => setCommandForm({ ...commandForm, robotId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select robot" />
                  </SelectTrigger>
                  <SelectContent>
                    {robots.map((robot) => (
                      <SelectItem key={robot.id} value={robot.id}>
                        {robot.name} ({robot.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Command Type</Label>
                <Select
                  value={commandForm.type}
                  onValueChange={(value) => setCommandForm({ ...commandForm, type: value })}
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
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={commandForm.priority}
                  onValueChange={(value) => setCommandForm({ ...commandForm, priority: value })}
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
              <div>
                <Label htmlFor="parameters">Parameters (JSON)</Label>
                <Textarea
                  id="parameters"
                  placeholder='{"destination": "A-01-01", "speed": 1.0}'
                  value={JSON.stringify(commandForm.parameters || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value);
                      setCommandForm({ ...commandForm, parameters: params });
                    } catch {
                      // Invalid JSON, keep as string for now
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => sendCommand(commandForm)}
                  disabled={!commandForm.robotId}
                >
                  Send Command
                </Button>
                <Button variant="outline" onClick={() => setIsCommandDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search robots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Robot Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="IDLE">Idle</SelectItem>
                  <SelectItem value="WORKING">Working</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchRobots} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Robots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Robots ({filteredRobots.length})</CardTitle>
          <CardDescription>Automated warehouse robots and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Robot</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Active Commands</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRobots.map((robot) => {
                const activeCommands = robot.commands?.filter(cmd =>
                  ['PENDING', 'EXECUTING'].includes(cmd.status)
                ) || [];

                return (
                  <TableRow key={robot.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRobotIcon(robot.type)}
                        <div>
                          <div className="font-medium">{robot.name}</div>
                          <div className="text-sm text-muted-foreground">{robot.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{robot.type.replace('_', ' ').toLowerCase()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {robot.zone && <div>Zone: {robot.zone.code}</div>}
                        {robot.location && <div>{robot.location}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(robot.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {activeCommands.length > 0 ? (
                          <div className="space-y-1">
                            {activeCommands.slice(0, 2).map((cmd) => (
                              <div key={cmd.id} className="flex items-center gap-1">
                                {getCommandStatusIcon(cmd.status)}
                                <span>{cmd.type}</span>
                                {getPriorityBadge(cmd.priority)}
                              </div>
                            ))}
                            {activeCommands.length > 2 && (
                              <div className="text-muted-foreground">
                                +{activeCommands.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No active commands</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedRobot?.id === robot.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRobot(robot)}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getRobotIcon(robot.type)}
                              {robot.name} ({robot.code})
                            </DialogTitle>
                            <DialogDescription>
                              Robot details and command history
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRobot && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Type</Label>
                                  <div className="text-sm">{selectedRobot.type.replace('_', ' ')}</div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div>{getStatusBadge(selectedRobot.status)}</div>
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <div className="text-sm">
                                    {selectedRobot.zone && `Zone: ${selectedRobot.zone.name}`}
                                    {selectedRobot.location && <div>{selectedRobot.location}</div>}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Recent Commands</Label>
                                <div className="mt-2 max-h-40 overflow-y-auto">
                                  {selectedRobot.commands?.slice(0, 10).map((cmd) => (
                                    <div key={cmd.id} className="flex justify-between items-center py-2 border-b text-sm">
                                      <div className="flex items-center gap-2">
                                        {getCommandStatusIcon(cmd.status)}
                                        <span>{cmd.type}</span>
                                        {getPriorityBadge(cmd.priority)}
                                      </div>
                                      <span className="text-muted-foreground">
                                        {new Date(cmd.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                  )) || <div className="text-muted-foreground">No commands</div>}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCommandForm({ ...commandForm, robotId: selectedRobot.id });
                                    setIsCommandDialogOpen(true);
                                    setIsDialogOpen(false);
                                  }}
                                >
                                  Send Command
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => sendCommand({
                                    robotId: selectedRobot.id,
                                    type: 'EMERGENCY_STOP',
                                    priority: 'URGENT',
                                    userId: 'user-1'
                                  })}
                                >
                                  Emergency Stop
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
