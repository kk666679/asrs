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
  Users,
  Clock,
  TrendingUp,
  Calendar,
  UserCheck,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  BarChart3,
  Target,
  Activity
} from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  role: 'picker' | 'packer' | 'supervisor' | 'maintenance';
  shift: 'morning' | 'afternoon' | 'night';
  status: 'active' | 'break' | 'off_duty' | 'training';
  currentTask?: string;
  location?: string;
  performance: {
    tasksCompleted: number;
    accuracy: number;
    efficiency: number;
    hoursWorked: number;
  };
  schedule: {
    startTime: string;
    endTime: string;
    breaks: number;
  };
}

interface LaborMetrics {
  totalWorkers: number;
  activeWorkers: number;
  avgEfficiency: number;
  totalTasksCompleted: number;
  avgAccuracy: number;
  overtimeHours: number;
}

const statusColors = {
  active: 'bg-green-500',
  break: 'bg-yellow-500',
  off_duty: 'bg-gray-500',
  training: 'bg-blue-500',
};

const roleColors = {
  picker: 'bg-blue-500',
  packer: 'bg-purple-500',
  supervisor: 'bg-orange-500',
  maintenance: 'bg-red-500',
};

const shiftColors = {
  morning: 'bg-yellow-500',
  afternoon: 'bg-orange-500',
  night: 'bg-indigo-500',
};

export default function LaborManagementPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [metrics, setMetrics] = useState<LaborMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLaborData();
    const interval = setInterval(fetchLaborData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLaborData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockWorkers: Worker[] = [
        {
          id: 'W001',
          name: 'Ahmad Rahman',
          role: 'picker',
          shift: 'morning',
          status: 'active',
          currentTask: 'Picking order #ORD001',
          location: 'Aisle 3, Level 2',
          performance: {
            tasksCompleted: 45,
            accuracy: 98.5,
            efficiency: 92.3,
            hoursWorked: 6.5
          },
          schedule: {
            startTime: '08:00',
            endTime: '16:00',
            breaks: 1
          }
        },
        {
          id: 'W002',
          name: 'Siti Aminah',
          role: 'packer',
          shift: 'afternoon',
          status: 'break',
          location: 'Packing Station 5',
          performance: {
            tasksCompleted: 38,
            accuracy: 99.2,
            efficiency: 88.7,
            hoursWorked: 5.5
          },
          schedule: {
            startTime: '14:00',
            endTime: '22:00',
            breaks: 1
          }
        },
        {
          id: 'W003',
          name: 'Mohd Hassan',
          role: 'supervisor',
          shift: 'morning',
          status: 'active',
          currentTask: 'Overseeing Zone A operations',
          location: 'Control Room',
          performance: {
            tasksCompleted: 0,
            accuracy: 100,
            efficiency: 95.0,
            hoursWorked: 7.0
          },
          schedule: {
            startTime: '07:30',
            endTime: '15:30',
            breaks: 1
          }
        },
        {
          id: 'W004',
          name: 'Fatimah Yusof',
          role: 'maintenance',
          shift: 'night',
          status: 'training',
          currentTask: 'Safety training session',
          location: 'Training Room',
          performance: {
            tasksCompleted: 12,
            accuracy: 97.8,
            efficiency: 85.4,
            hoursWorked: 8.0
          },
          schedule: {
            startTime: '22:00',
            endTime: '06:00',
            breaks: 2
          }
        }
      ];

      const mockMetrics: LaborMetrics = {
        totalWorkers: mockWorkers.length,
        activeWorkers: mockWorkers.filter(w => w.status === 'active').length,
        avgEfficiency: mockWorkers.reduce((sum, w) => sum + w.performance.efficiency, 0) / mockWorkers.length,
        totalTasksCompleted: mockWorkers.reduce((sum, w) => sum + w.performance.tasksCompleted, 0),
        avgAccuracy: mockWorkers.reduce((sum, w) => sum + w.performance.accuracy, 0) / mockWorkers.length,
        overtimeHours: 12.5
      };

      setWorkers(mockWorkers);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to fetch labor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || worker.status === statusFilter;
    const matchesRole = roleFilter === 'all' || worker.role === roleFilter;
    const matchesShift = shiftFilter === 'all' || worker.shift === shiftFilter;
    return matchesSearch && matchesStatus && matchesRole && matchesShift;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge className={`${roleColors[role as keyof typeof roleColors]} text-white text-xs`}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getShiftBadge = (shift: string) => {
    return (
      <Badge className={`${shiftColors[shift as keyof typeof shiftColors]} text-white text-xs`}>
        {shift.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading labor management data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Labor Management</h1>
          <p className="text-muted-foreground">Monitor and optimize workforce performance and scheduling</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics?.totalWorkers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Workers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics?.activeWorkers || 0}</p>
                <p className="text-sm text-muted-foreground">Active Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics?.avgEfficiency.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics?.avgAccuracy.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-indigo-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics?.totalTasksCompleted || 0}</p>
                <p className="text-sm text-muted-foreground">Tasks Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{metrics?.overtimeHours || 0}h</p>
                <p className="text-sm text-muted-foreground">Overtime</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search workers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="break">Break</SelectItem>
                  <SelectItem value="off_duty">Off Duty</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="picker">Picker</SelectItem>
                  <SelectItem value="packer">Packer</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select value={shiftFilter} onValueChange={setShiftFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchLaborData} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Workers ({filteredWorkers.length})</CardTitle>
          <CardDescription>Current workforce status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Task</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-sm text-muted-foreground">{worker.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(worker.role)}</TableCell>
                  <TableCell>{getShiftBadge(worker.shift)}</TableCell>
                  <TableCell>{getStatusBadge(worker.status)}</TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="text-sm truncate">{worker.currentTask || 'No active task'}</p>
                      {worker.location && (
                        <p className="text-xs text-muted-foreground">{worker.location}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>Efficiency: {worker.performance.efficiency.toFixed(1)}%</div>
                      <div>Accuracy: {worker.performance.accuracy.toFixed(1)}%</div>
                      <div>Tasks: {worker.performance.tasksCompleted}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen && selectedWorker?.id === worker.id} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWorker(worker)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Worker Details - {worker.name}</DialogTitle>
                          <DialogDescription>
                            Comprehensive information about this worker
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Employee ID</Label>
                              <p className="text-sm font-medium">{worker.id}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <div>{getStatusBadge(worker.status)}</div>
                            </div>
                            <div>
                              <Label>Role</Label>
                              <div>{getRoleBadge(worker.role)}</div>
                            </div>
                            <div>
                              <Label>Shift</Label>
                              <div>{getShiftBadge(worker.shift)}</div>
                            </div>
                          </div>

                          <div>
                            <Label>Schedule</Label>
                            <div className="text-sm space-y-1">
                              <p>Start: {worker.schedule.startTime}</p>
                              <p>End: {worker.schedule.endTime}</p>
                              <p>Breaks: {worker.schedule.breaks}</p>
                            </div>
                          </div>

                          {worker.currentTask && (
                            <div>
                              <Label>Current Task</Label>
                              <p className="text-sm">{worker.currentTask}</p>
                              {worker.location && <p className="text-sm text-muted-foreground">Location: {worker.location}</p>}
                            </div>
                          )}

                          <div>
                            <Label>Performance Metrics</Label>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="p-3 border rounded">
                                <p className="text-sm font-medium">Tasks Completed</p>
                                <p className="text-lg font-bold">{worker.performance.tasksCompleted}</p>
                              </div>
                              <div className="p-3 border rounded">
                                <p className="text-sm font-medium">Accuracy</p>
                                <p className="text-lg font-bold">{worker.performance.accuracy}%</p>
                              </div>
                              <div className="p-3 border rounded">
                                <p className="text-sm font-medium">Efficiency</p>
                                <p className="text-lg font-bold">{worker.performance.efficiency}%</p>
                              </div>
                              <div className="p-3 border rounded">
                                <p className="text-sm font-medium">Hours Worked</p>
                                <p className="text-lg font-bold">{worker.performance.hoursWorked}h</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredWorkers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No workers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
