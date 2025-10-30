'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Square,
  Settings,
  AlertTriangle,
  Battery,
  Zap,
  Activity,
  Cpu,
  Wrench,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: 'shuttle' | 'conveyor' | 'vlm' | 'robot';
  status: 'online' | 'offline' | 'maintenance' | 'charging';
  battery?: number;
  location: string;
  task?: string;
  throughput?: number;
  currentFloor?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  maintenance: 'bg-yellow-500',
  charging: 'bg-blue-500',
};

const statusLabels = {
  online: 'Online',
  offline: 'Offline',
  maintenance: 'Maintenance',
  charging: 'Charging',
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  useEffect(() => {
    fetchEquipment();
    const interval = setInterval(fetchEquipment, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/robots'); // Using robots API as base
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const robots = await response.json();

      // Mock comprehensive equipment data
      const mockEquipment: Equipment[] = [
        {
          id: 's1',
          name: 'Shuttle #1',
          type: 'shuttle',
          status: 'online',
          battery: 87,
          location: 'Aisle 3, Pos 45',
          task: 'Retrieving Item #4582',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-04-15'
        },
        {
          id: 's2',
          name: 'Shuttle #2',
          type: 'shuttle',
          status: 'online',
          battery: 92,
          location: 'Aisle 5, Pos 12',
          task: 'Idle',
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-04-10'
        },
        {
          id: 's3',
          name: 'Shuttle #3',
          type: 'shuttle',
          status: 'charging',
          battery: 45,
          location: 'Aisle 7, Pos 33',
          task: 'Charging',
          lastMaintenance: '2024-01-20',
          nextMaintenance: '2024-04-20'
        },
        {
          id: 'c1',
          name: 'Conveyor A',
          type: 'conveyor',
          status: 'maintenance',
          location: 'Loading Bay',
          throughput: 120,
          lastMaintenance: '2024-01-25',
          nextMaintenance: '2024-02-25'
        },
        {
          id: 'c2',
          name: 'Conveyor B',
          type: 'conveyor',
          status: 'online',
          location: 'Sorting',
          throughput: 95,
          lastMaintenance: '2024-01-18',
          nextMaintenance: '2024-04-18'
        },
        {
          id: 'v1',
          name: 'VLM #1',
          type: 'vlm',
          status: 'online',
          location: 'Zone A',
          currentFloor: 3,
          task: 'Moving to Floor 5',
          lastMaintenance: '2024-01-12',
          nextMaintenance: '2024-04-12'
        },
        {
          id: 'v2',
          name: 'VLM #2',
          type: 'vlm',
          status: 'online',
          location: 'Zone B',
          currentFloor: 7,
          task: 'Idle',
          lastMaintenance: '2024-01-08',
          nextMaintenance: '2024-04-08'
        }
      ];

      setEquipment(mockEquipment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const toggleEquipment = async (equipmentId: string, status: boolean) => {
    try {
      // Mock API call
      console.log(`Toggling ${equipmentId} to ${status ? 'on' : 'off'}`);

      // Update local state
      setEquipment(prev => prev.map(eq =>
        eq.id === equipmentId
          ? { ...eq, status: status ? 'online' : 'offline' as const }
          : eq
      ));
    } catch (err) {
      setError('Failed to update equipment status');
    }
  };

  const scheduleMaintenance = async (equipmentId: string) => {
    try {
      // Mock API call
      console.log(`Scheduling maintenance for ${equipmentId} with notes: ${maintenanceNotes}`);

      // Update local state
      setEquipment(prev => prev.map(eq =>
        eq.id === equipmentId
          ? { ...eq, status: 'maintenance' as const }
          : eq
      ));

      setIsDialogOpen(false);
      setMaintenanceNotes('');
    } catch (err) {
      setError('Failed to schedule maintenance');
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'shuttle': return <Activity className="h-5 w-5" />;
      case 'conveyor': return <Zap className="h-5 w-5" />;
      case 'vlm': return <Cpu className="h-5 w-5" />;
      case 'robot': return <Wrench className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const groupedEquipment = equipment.reduce((acc, eq) => {
    if (!acc[eq.type]) acc[eq.type] = [];
    acc[eq.type].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground">Monitor and control warehouse automation equipment</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-green-600 hover:bg-green-700">
            <Play className="h-4 w-4 mr-2" />
            Start All
          </Button>
          <Button variant="destructive">
            <Square className="h-4 w-4 mr-2" />
            Stop All
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Equipment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{equipment.filter(e => e.status === 'online').length}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{equipment.filter(e => e.status === 'offline').length}</p>
                <p className="text-sm text-muted-foreground">Offline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{equipment.filter(e => e.status === 'maintenance').length}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Battery className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{equipment.filter(e => e.status === 'charging').length}</p>
                <p className="text-sm text-muted-foreground">Charging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment by Type */}
      {Object.entries(groupedEquipment).map(([type, items]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getEquipmentIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)} ({items.length})
            </CardTitle>
            <CardDescription>
              {type === 'shuttle' ? 'Automated storage and retrieval shuttles' : type === 'conveyor' ? 'Material handling conveyor systems' : type === 'vlm' ? 'Vertical lift modules for storage' : 'Robotic automation equipment'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((eq) => (
              <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{eq.name}</h3>
                    {getStatusBadge(eq.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{eq.location}</p>
                  {eq.task && <p className="text-sm text-blue-600">Current Task: {eq.task}</p>}
                  {eq.battery !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <Battery className="h-4 w-4" />
                      <span className="text-sm">Battery: {eq.battery}%</span>
                    </div>
                  )}
                  {eq.throughput !== undefined && (
                    <p className="text-sm text-muted-foreground">Throughput: {eq.throughput}/min</p>
                  )}
                  {eq.currentFloor !== undefined && (
                    <p className="text-sm text-muted-foreground">Current Floor: {eq.currentFloor}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={isDialogOpen && selectedEquipment?.id === eq.id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEquipment(eq)}
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Maintenance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule Maintenance - {eq.name}</DialogTitle>
                        <DialogDescription>
                          Schedule maintenance for this equipment
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes">Maintenance Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Enter maintenance notes and requirements"
                            value={maintenanceNotes}
                            onChange={(e) => setMaintenanceNotes(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => scheduleMaintenance(eq.id)}>
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Switch
                    checked={eq.status === 'online'}
                    onCheckedChange={(checked) => toggleEquipment(eq.id, checked)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
