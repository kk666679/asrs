'use client';

import React from 'react';
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
import { useMaintenance } from '@/lib/hooks/useMaintenance';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  const {
    maintenance: tasks,
    filteredMaintenance: filteredTasks,
    maintenanceStats: taskStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    createMaintenance: createTask,
    updateMaintenance: updateTask,
    refreshMaintenance: refreshTasks
  } = useMaintenance();
  
  const [selectedTask, setSelectedTask] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = React.useState(false);
  const [newTask, setNewTask] = React.useState<any>({
    type: 'preventive',
    priority: 'medium',
    status: 'scheduled',
    estimatedHours: 1
  });
  const [scheduledDate, setScheduledDate] = React.useState<Date>();



  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateTask(taskId, {
        status: status.toUpperCase() as any,
        completedDate: status === 'COMPLETED' ? new Date().toISOString() : undefined
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const createNewTask = async () => {
    try {
      if (!newTask.title || !newTask.equipment || !scheduledDate) {
        console.error('Please fill in all required fields');
        return;
      }

      const task = {
        type: (newTask.type?.toUpperCase() || 'PREVENTIVE') as any,
        priority: (newTask.priority?.toUpperCase() || 'MEDIUM') as any,
        status: 'SCHEDULED' as any,
        description: newTask.description || '',
        scheduledDate: scheduledDate.toISOString(),
        estimatedDuration: newTask.estimatedHours || 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await createTask(task);
      setIsNewTaskDialogOpen(false);
      setNewTask({
        type: 'preventive',
        priority: 'medium',
        status: 'scheduled',
        estimatedHours: 1
      });
      setScheduledDate(undefined);
    } catch (err) {
      console.error('Failed to create maintenance task:', err);
    }
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

  if (isLoading) {
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
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="equipment">Equipment *</Label>
                <Input
                  id="equipment"
                  value={newTask.equipment || ''}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, equipment: e.target.value }))}
                  placeholder="e.g., Conveyor A"
                />
              </div>
              <div>
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  value={newTask.zone || ''}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, zone: e.target.value }))}
                  placeholder="e.g., Loading Bay"
                />
              </div>
              <div>
                <Label htmlFor="type">Maintenance Type</Label>
                <Select value={newTask.type} onValueChange={(value) => setNewTask((prev: any) => ({ ...prev, type: value }))}>
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
                <Select value={newTask.priority} onValueChange={(value) => setNewTask((prev: any) => ({ ...prev, priority: value }))}>
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
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask((prev: any) => ({ ...prev, description: e.target.value }))}
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
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({...filters, status: value})}>
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
              <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({...filters, type: value})}>
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
              <Select value={filters.priority || 'all'} onValueChange={(value) => setFilters({...filters, priority: value})}>
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
              <Button onClick={refreshTasks} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[
                { name: 'Scheduled', value: taskStats.scheduled },
                { name: 'In Progress', value: taskStats.inProgress },
                { name: 'Completed', value: taskStats.completed },
                { name: 'Overdue', value: taskStats.overdue },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Preventive', value: tasks.filter(t => t.type === 'PREVENTIVE').length },
                    { name: 'Corrective', value: tasks.filter(t => t.type === 'CORRECTIVE').length },
                    { name: 'Predictive', value: tasks.filter(t => t.type === 'PREDICTIVE').length },
                    { name: 'Inspection', value: tasks.filter(t => t.type === 'INSPECTION').length },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2, 3].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
                  <h3 className="font-medium">{task.description}</h3>
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-2">Maintenance Task</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    Equipment ID: {task.equipmentId || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(task.scheduledDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedDuration}h estimated
                  </div>
                  {task.technician && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {task.technician}
                    </div>
                  )}

                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'SCHEDULED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                  >
                    Start Task
                  </Button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
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
                      <DialogTitle>{task.description}</DialogTitle>
                      <DialogDescription>
                        View detailed information about this maintenance task
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Equipment ID</Label>
                          <div className="text-sm">{task.equipmentId || 'N/A'}</div>
                        </div>
                        <div>
                          <Label>Robot ID</Label>
                          <div className="text-sm">{task.robotId || 'N/A'}</div>
                        </div>
                        <div>
                          <Label>Type</Label>
                          <div className="text-sm">{task.type}</div>
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
                          <Label>Estimated Duration</Label>
                          <div className="text-sm">{task.estimatedDuration}h</div>
                        </div>
                        {task.actualDuration && (
                          <div>
                            <Label>Actual Duration</Label>
                            <div className="text-sm">{task.actualDuration}h</div>
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
