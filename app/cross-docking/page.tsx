'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';

interface CrossDockTask {
  id: string;
  inboundShipment: string;
  outboundShipment: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  scheduledTime: string;
  estimatedDuration: number;
  assignedEquipment?: string;
  notes?: string;
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const statusColors = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  delayed: 'bg-red-500',
};

export default function CrossDockingPage() {
  const [tasks, setTasks] = useState<CrossDockTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<CrossDockTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchCrossDockTasks();
    const interval = setInterval(fetchCrossDockTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCrossDockTasks = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockTasks: CrossDockTask[] = [
        {
          id: 'CD001',
          inboundShipment: 'INB-2024-001',
          outboundShipment: 'OUT-2024-001',
          items: [
            { id: 'ITM001', name: 'Halal Chicken Breast', quantity: 50, status: 'completed' },
            { id: 'ITM002', name: 'Organic Rice', quantity: 100, status: 'in_progress' },
          ],
          priority: 'high',
          status: 'in_progress',
          scheduledTime: '2024-01-15T10:00:00Z',
          estimatedDuration: 45,
          assignedEquipment: 'Conveyor A',
          notes: 'Priority shipment for major retailer'
        },
        {
          id: 'CD002',
          inboundShipment: 'INB-2024-002',
          outboundShipment: 'OUT-2024-002',
          items: [
            { id: 'ITM003', name: 'Halal Beef', quantity: 25, status: 'pending' },
            { id: 'ITM004', name: 'Fresh Vegetables', quantity: 75, status: 'pending' },
          ],
          priority: 'medium',
          status: 'scheduled',
          scheduledTime: '2024-01-15T14:00:00Z',
          estimatedDuration: 30,
          notes: 'Standard cross-dock operation'
        },
        {
          id: 'CD003',
          inboundShipment: 'INB-2024-003',
          outboundShipment: 'OUT-2024-003',
          items: [
            { id: 'ITM005', name: 'Frozen Halal Products', quantity: 200, status: 'completed' },
          ],
          priority: 'urgent',
          status: 'delayed',
          scheduledTime: '2024-01-15T08:00:00Z',
          estimatedDuration: 60,
          assignedEquipment: 'VLM #1',
          notes: 'Temperature-sensitive items - delay due to equipment maintenance'
        }
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to fetch cross-dock tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.inboundShipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.outboundShipment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} text-white text-xs`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const updateTaskStatus = (taskId: string, newStatus: CrossDockTask['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const taskStats = {
    total: tasks.length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    delayed: tasks.filter(t => t.status === 'delayed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading cross-docking tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cross-Docking Operations</h1>
          <p className="text-muted-foreground">Manage inbound to outbound transfers without storage</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Cross-Dock Task
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{taskStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{taskStats.scheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ArrowRight className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{taskStats.delayed}</p>
                <p className="text-sm text-muted-foreground">Delayed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchCrossDockTasks} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cross-Dock Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>Current cross-docking operations and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Inbound → Outbound</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">{task.inboundShipment}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{task.outboundShipment}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {task.items.length} item{task.items.length !== 1 ? 's' : ''} (
                      {task.items.filter(i => i.status === 'completed').length}/{task.items.length} completed)
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.scheduledTime).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{task.estimatedDuration} min</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog open={isDialogOpen && selectedTask?.id === task.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Cross-Dock Task Details - {task.id}</DialogTitle>
                            <DialogDescription>
                              Detailed information about this cross-docking operation
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Inbound Shipment</Label>
                                <p className="text-sm font-medium">{task.inboundShipment}</p>
                              </div>
                              <div>
                                <Label>Outbound Shipment</Label>
                                <p className="text-sm font-medium">{task.outboundShipment}</p>
                              </div>
                              <div>
                                <Label>Priority</Label>
                                <div>{getPriorityBadge(task.priority)}</div>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div>{getStatusBadge(task.status)}</div>
                              </div>
                              <div>
                                <Label>Scheduled Time</Label>
                                <p className="text-sm">{new Date(task.scheduledTime).toLocaleString()}</p>
                              </div>
                              <div>
                                <Label>Estimated Duration</Label>
                                <p className="text-sm">{task.estimatedDuration} minutes</p>
                              </div>
                            </div>

                            {task.assignedEquipment && (
                              <div>
                                <Label>Assigned Equipment</Label>
                                <p className="text-sm">{task.assignedEquipment}</p>
                              </div>
                            )}

                            {task.notes && (
                              <div>
                                <Label>Notes</Label>
                                <p className="text-sm">{task.notes}</p>
                              </div>
                            )}

                            <div>
                              <Label>Items</Label>
                              <div className="space-y-2 mt-2">
                                {task.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                      <p className="text-sm font-medium">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">Qty: {item.quantity}</span>
                                      <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                                        {item.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              {task.status === 'scheduled' && (
                                <Button onClick={() => updateTaskStatus(task.id, 'in_progress')}>
                                  Start Task
                                </Button>
                              )}
                              {task.status === 'in_progress' && (
                                <Button onClick={() => updateTaskStatus(task.id, 'completed')}>
                                  Complete Task
                                </Button>
                              )}
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Close
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No cross-dock tasks found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
