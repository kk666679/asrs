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
  Waves,
  Play,
  Pause,
  Square,
  Plus,
  Search,
  Filter,
  Clock,
  Package,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface Wave {
  id: string;
  name: string;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  waveType: 'picking' | 'replenishment' | 'putaway' | 'shipping';
  orders: Array<{
    id: string;
    items: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  assignedWorkers: string[];
  progress: {
    completedOrders: number;
    totalOrders: number;
    completedItems: number;
    totalItems: number;
  };
  startTime?: string;
  endTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  efficiency: number;
}

const statusColors = {
  planned: 'bg-gray-500',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
};

const priorityColors = {
  low: 'bg-gray-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const waveTypeColors = {
  picking: 'bg-blue-500',
  replenishment: 'bg-purple-500',
  putaway: 'bg-green-500',
  shipping: 'bg-indigo-500',
};

export default function WavesPage() {
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedWave, setSelectedWave] = useState<Wave | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchWaves();
    const interval = setInterval(fetchWaves, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWaves = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockWaves: Wave[] = [
        {
          id: 'WAVE001',
          name: 'Morning Picking Wave A',
          status: 'active',
          priority: 'high',
          waveType: 'picking',
          orders: [
            { id: 'ORD001', items: 25, priority: 'high' },
            { id: 'ORD002', items: 18, priority: 'medium' },
            { id: 'ORD003', items: 32, priority: 'high' },
          ],
          assignedWorkers: ['Ahmad Rahman', 'Siti Aminah', 'Mohd Hassan'],
          progress: {
            completedOrders: 2,
            totalOrders: 3,
            completedItems: 43,
            totalItems: 75
          },
          startTime: '2024-01-15T08:00:00Z',
          estimatedDuration: 120,
          efficiency: 87.5
        },
        {
          id: 'WAVE002',
          name: 'Replenishment Wave 1',
          status: 'planned',
          priority: 'medium',
          waveType: 'replenishment',
          orders: [
            { id: 'REP001', items: 45, priority: 'medium' },
            { id: 'REP002', items: 28, priority: 'low' },
          ],
          assignedWorkers: ['Fatimah Yusof'],
          progress: {
            completedOrders: 0,
            totalOrders: 2,
            completedItems: 0,
            totalItems: 73
          },
          estimatedDuration: 90,
          efficiency: 0
        },
        {
          id: 'WAVE003',
          name: 'Shipping Wave B',
          status: 'completed',
          priority: 'urgent',
          waveType: 'shipping',
          orders: [
            { id: 'SHIP001', items: 67, priority: 'urgent' },
            { id: 'SHIP002', items: 34, priority: 'high' },
          ],
          assignedWorkers: ['Ahmad Rahman', 'Siti Aminah'],
          progress: {
            completedOrders: 2,
            totalOrders: 2,
            completedItems: 101,
            totalItems: 101
          },
          startTime: '2024-01-14T14:00:00Z',
          endTime: '2024-01-14T15:30:00Z',
          estimatedDuration: 60,
          actualDuration: 90,
          efficiency: 92.3
        },
        {
          id: 'WAVE004',
          name: 'Putaway Wave C',
          status: 'paused',
          priority: 'low',
          waveType: 'putaway',
          orders: [
            { id: 'PUT001', items: 22, priority: 'low' },
            { id: 'PUT002', items: 15, priority: 'low' },
            { id: 'PUT003', items: 19, priority: 'medium' },
          ],
          assignedWorkers: ['Mohd Hassan'],
          progress: {
            completedOrders: 1,
            totalOrders: 3,
            completedItems: 22,
            totalItems: 56
          },
          startTime: '2024-01-15T10:00:00Z',
          estimatedDuration: 75,
          efficiency: 78.4
        }
      ];

      setWaves(mockWaves);
    } catch (error) {
      console.error('Failed to fetch waves:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWaves = waves.filter(wave => {
    const matchesSearch = wave.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wave.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wave.status === statusFilter;
    const matchesType = typeFilter === 'all' || wave.waveType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.toUpperCase()}
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

  const getTypeBadge = (type: string) => {
    return (
      <Badge className={`${waveTypeColors[type as keyof typeof waveTypeColors]} text-white text-xs`}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const updateWaveStatus = (waveId: string, newStatus: Wave['status']) => {
    setWaves(prev => prev.map(wave =>
      wave.id === waveId ? {
        ...wave,
        status: newStatus,
        startTime: newStatus === 'active' && !wave.startTime ? new Date().toISOString() : wave.startTime,
        endTime: newStatus === 'completed' ? new Date().toISOString() : wave.endTime
      } : wave
    ));
  };

  const waveStats = {
    total: waves.length,
    planned: waves.filter(w => w.status === 'planned').length,
    active: waves.filter(w => w.status === 'active').length,
    completed: waves.filter(w => w.status === 'completed').length,
    paused: waves.filter(w => w.status === 'paused').length,
    avgEfficiency: waves.filter(w => w.efficiency > 0).reduce((sum, w) => sum + w.efficiency, 0) /
                   waves.filter(w => w.efficiency > 0).length || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading waves...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wave Management</h1>
          <p className="text-muted-foreground">Organize and manage picking, putaway, and shipping waves</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Wave
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Waves className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{waveStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Waves</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-gray-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{waveStats.planned}</p>
                <p className="text-sm text-muted-foreground">Planned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{waveStats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{waveStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Pause className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{waveStats.paused}</p>
                <p className="text-sm text-muted-foreground">Paused</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{waveStats.avgEfficiency.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
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
                  placeholder="Search waves..."
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
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Wave Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="picking">Picking</SelectItem>
                  <SelectItem value="replenishment">Replenishment</SelectItem>
                  <SelectItem value="putaway">Putaway</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchWaves} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waves Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waves ({filteredWaves.length})</CardTitle>
          <CardDescription>Current wave operations and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWaves.map((wave) => (
                <TableRow key={wave.id}>
                  <TableCell className="font-medium">{wave.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{wave.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {wave.orders.length} orders • {wave.progress.totalItems} items
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(wave.waveType)}</TableCell>
                  <TableCell>{getStatusBadge(wave.status)}</TableCell>
                  <TableCell>{getPriorityBadge(wave.priority)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Orders: {wave.progress.completedOrders}/{wave.progress.totalOrders}</div>
                      <div>Items: {wave.progress.completedItems}/{wave.progress.totalItems}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {wave.efficiency.toFixed(1)}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {wave.status === 'planned' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateWaveStatus(wave.id, 'active')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {wave.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateWaveStatus(wave.id, 'paused')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateWaveStatus(wave.id, 'completed')}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      {wave.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateWaveStatus(wave.id, 'active')}
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      <Dialog open={isDialogOpen && selectedWave?.id === wave.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWave(wave)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Wave Details - {wave.name}</DialogTitle>
                            <DialogDescription>
                              Detailed information about this wave operation
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Wave ID</Label>
                                <p className="text-sm font-medium">{wave.id}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div>{getStatusBadge(wave.status)}</div>
                              </div>
                              <div>
                                <Label>Type</Label>
                                <div>{getTypeBadge(wave.waveType)}</div>
                              </div>
                              <div>
                                <Label>Priority</Label>
                                <div>{getPriorityBadge(wave.priority)}</div>
                              </div>
                            </div>

                            <div>
                              <Label>Progress</Label>
                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="p-3 border rounded">
                                  <p className="text-sm font-medium">Orders</p>
                                  <p className="text-lg font-bold">
                                    {wave.progress.completedOrders}/{wave.progress.totalOrders}
                                  </p>
                                </div>
                                <div className="p-3 border rounded">
                                  <p className="text-sm font-medium">Items</p>
                                  <p className="text-lg font-bold">
                                    {wave.progress.completedItems}/{wave.progress.totalItems}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label>Assigned Workers</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {wave.assignedWorkers.map((worker, index) => (
                                  <Badge key={index} variant="outline">{worker}</Badge>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Estimated Duration</Label>
                                <p className="text-sm">{wave.estimatedDuration} minutes</p>
                              </div>
                              {wave.actualDuration && (
                                <div>
                                  <Label>Actual Duration</Label>
                                  <p className="text-sm">{wave.actualDuration} minutes</p>
                                </div>
                              )}
                              <div>
                                <Label>Efficiency</Label>
                                <p className="text-sm">{wave.efficiency.toFixed(1)}%</p>
                              </div>
                              {wave.startTime && (
                                <div>
                                  <Label>Start Time</Label>
                                  <p className="text-sm">{new Date(wave.startTime).toLocaleString()}</p>
                                </div>
                              )}
                            </div>

                            <div>
                              <Label>Orders in Wave</Label>
                              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                                {wave.orders.map((order) => (
                                  <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                      <p className="text-sm font-medium">{order.id}</p>
                                      <p className="text-xs text-muted-foreground">{order.items} items</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      {order.priority}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
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

          {filteredWaves.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Waves className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No waves found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
