'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  User,
  Settings,
  Plus,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  equipment: string;
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  technician?: string;
  estimatedHours: number;
  actualHours?: number;
  cost?: number;
  notes?: string;
  zone?: string;
}

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const statusColors = {
  scheduled: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  overdue: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const typeLabels = {
  preventive: 'Preventive',
  corrective: 'Corrective',
  predictive: 'Predictive',
  emergency: 'Emergency',
};

export default function MaintenancePage() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<MaintenanceTask>>({
    type: 'preventive',
    priority: 'medium',
    status: 'scheduled',
    estimatedHours: 1
  });
  const [scheduledDate, setScheduledDate] = useState<Date>();

  useEffect(() => {
    fetchMaintenanceTasks();
    const interval = setInterval(fetchMaintenanceTasks, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [filterStatus, filterType, filterPriority]);

  const fetchMaintenanceTasks = async () => {
    try {
      // Mock API call - in real implementation, this would fetch from /api/maintenance
      const mockTasks: MaintenanceTask[] = [
        {
          id: '1',
          title: 'Conveyor System A - Preventive Maintenance',
          description: 'Monthly inspection and lubrication of conveyor belts and rollers',
          equipment: 'Conveyor A',
          type: 'preventive',
          priority: 'medium',
          status: 'scheduled',
          scheduledDate: '2024-02-15T09:00:00Z',
          estimatedHours: 2,
          zone: 'Loading Bay'
        },
        {
          id: '2',
          title: 'Shuttle #3 - Motor Inspection',
          description: 'Inspect motor bearings and check vibration levels',
          equipment: 'Shuttle #3',
          type: 'corrective',
          priority: 'high',
          status: 'in_progress',
          scheduledDate: '2024-02-10T14:00:00Z',
          estimatedHours: 1.5,
          technician: 'John Smith',
          zone: 'Aisle 7'
        },
        {
          id: '3',
          title: 'VLM #1 - Emergency Repair',
          description: 'Replace faulty lift mechanism motor',
          equipment: 'VLM #1',
          type: 'emergency',
          priority: 'critical',
          status: 'completed',
          scheduledDate: '2024-02-08T16:00:00Z',
          completedDate: '2024-02-08T18:30:00Z',
          technician: 'Sarah Johnson',
          estimatedHours: 3,
          actualHours: 2.5,
          cost: 450,
          zone: 'Zone A'
        },
        {
          id: '4',
          title: 'Temperature Sensor Calibration',
          description: 'Calibrate all temperature sensors across zones',
          equipment: 'All Temp Sensors',
          type: 'preventive',
          priority: 'low',
          status: 'overdue',
          scheduledDate: '2024-02-05T10:00:00Z',
          estimatedHours: 4,
          zone: 'All Zones'
        }
      ];

      setTasks(mockTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      // Mock API call
      console.log(`Updating task ${taskId} status to ${status}`);

      // Update local state
      setTasks(prev => prev.map(task =>
        task.id === taskId ? {
          ...task,
          status: status as MaintenanceTask['status'],
          completedDate: status === 'completed' ? new Date().toISOString() : task.completedDate
        } : task
      ));
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  const createNewTask = async () => {
    try {
      if (!newTask.title || !newTask.equipment || !scheduledDate) {
        setError('Please fill in all required fields');
        return;
      }

      const task: MaintenanceTask = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description || '',
        equipment: newTask.equipment,
        type: newTask.type as MaintenanceTask['type'],
        priority: newTask.priority as MaintenanceTask['priority'],
        status: 'scheduled',
        scheduledDate: scheduledDate.toISOString(),
        estimatedHours: newTask.estimatedHours || 1,
        zone: newTask.zone
      };

      // Mock API call
      console.log('Creating new maintenance task:', task);

      // Update local state
      setTasks(prev => [task, ...prev]);
      setIsNewTaskDialogOpen(false);
      setNewTask({
        type: 'preventive',
        priority: 'medium',
        status: 'scheduled',
        estimatedHours: 1
      });
      setScheduledDate(undefined);
    } catch (err) {
      setError('Failed to create maintenance task');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterType !== 'all' && task.type !== filterType) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} text-white text-xs`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading maintenance tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maintenance Management</h1>
          <p className="text-muted-foreground">Schedule and track maintenance tasks for warehouse equipment</p>
        </div>
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Maintenance Task</DialogTitle>
              <DialogDescription>
                Create a new maintenance task for warehouse equipment
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="equipment">Equipment *</Label>
                <Input
                  id="equipment"
                  value={newTask.equipment || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="e.g., Conveyor A"
                />
              </div>
              <div>
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  value={newTask.zone || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, zone: e.target.value }))}
                  placeholder="e.g., Loading Bay"
                />
              </div>
              <div>
                <Label htmlFor="type">Maintenance Type</Label>
                <Select value={newTask.type} onValueChange={(value) => setNewTask(prev => ({ ...prev, type: value as MaintenanceTask['type'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventive">Preventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="predictive">Predictive</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as MaintenanceTask['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  value={newTask.estimatedHours || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createNewTask}>
                Create Task
              </Button>
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-500 mr-3" />
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
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
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
              <Settings className="h-8 w-8 text-yellow-500 mr-3" />
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
                <p className="text-2xl font-bold">{taskStats.overdue}</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
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
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Maintenance Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="predictive">Predictive</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchMaintenanceTasks} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>Manage and track maintenance tasks for warehouse equipment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {task.equipment}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(task.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedHours}h estimated
                  </div>
                  {task.technician && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.technician}
                    </div>
                  )}
                  {task.zone && (
                    <div className="flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      {task.zone}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'in_progress')}
                  >
                    Start Task
                  </Button>
                )}
                {task.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'completed')}
                  >
                    Complete Task
                  </Button>
                )}
                <Dialog open={isDialogOpen && selectedTask?.id === task.id} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{task.title}</DialogTitle>
                      <DialogDescription>
                        View detailed information about this maintenance task
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Equipment</Label>
                          <div className="text-sm">{task.equipment}</div>
                        </div>
                        <div>
                          <Label>Zone</Label>
                          <div className="text-sm">{task.zone || 'N/A'}</div>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <div className="text-sm">{typeLabels[task.type]}</div>
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
                          <Label>Scheduled Date</Label>
                          <div className="text-sm">{new Date(task.scheduledDate).toLocaleString()}</div>
                        </div>
                        <div>
                          <Label>Estimated Hours</Label>
                          <div className="text-sm">{task.estimatedHours}h</div>
                        </div>
                        {task.actualHours && (
                          <div>
                            <Label>Actual Hours</Label>
                            <div className="text-sm">{task.actualHours}h</div>
                          </div>
                        )}
                        {task.technician && (
                          <div>
                            <Label>Technician</Label>
                            <div className="text-sm">{task.technician}</div>
                          </div>
                        )}
                        {task.cost && (
                          <div>
                            <Label>Cost</Label>
                            <div className="text-sm">${task.cost}</div>
                          </div>
                        )}
                      </div>
                      {task.notes && (
                        <div>
                          <Label>Notes</Label>
                          <div className="text-sm bg-gray-50 p-2 rounded">{task.notes}</div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg">No maintenance tasks found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
