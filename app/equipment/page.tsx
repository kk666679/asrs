'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useEquipment } from '@/lib/hooks/useEquipment';
import { useWebSocket } from '@/lib/websocket';
import {
  Play,
  Square,
  AlertTriangle,
  Battery,
  Zap,
  Activity,
  Cpu,
  Wrench,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Brain,
  Eye,
  Thermometer,
  TrendingUp,
  Clock
} from 'lucide-react';

import { useInView } from 'react-intersection-observer';
import TrustIndicator from '@/components/enhanced/TrustIndicator';
import RealTimeMetrics from '@/components/enhanced/RealTimeMetrics';



export default function EquipmentPage() {
  const {
    equipment,
    filteredEquipment,
    equipmentStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    updateEquipment,
    refreshEquipment
  } = useEquipment();
  
  const { isConnected } = useWebSocket();
  const [selectedEquipment, setSelectedEquipment] = React.useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [maintenanceNotes, setMaintenanceNotes] = React.useState('');
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [predictiveAlerts, setPredictiveAlerts] = useState<any[]>([]);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  
  useEffect(() => {
    // Generate health metrics for equipment
    const generateHealthMetrics = () => {
      return equipment.map(eq => ({
        id: eq.id,
        name: eq.name,
        overallHealth: 85 + Math.random() * 15,
        vibration: Math.random() * 5,
        temperature: 35 + Math.random() * 15,
        performance: 90 + Math.random() * 10,
        predictedMaintenance: Math.floor(Math.random() * 30) + 1
      }));
    };
    
    setHealthMetrics(generateHealthMetrics());
    
    // Generate predictive maintenance alerts
    setPredictiveAlerts([
      { id: 1, equipment: 'Shuttle-001', issue: 'Motor bearing wear detected', priority: 'medium', daysUntil: 7 },
      { id: 2, equipment: 'Conveyor-A', issue: 'Belt tension anomaly', priority: 'low', daysUntil: 14 },
      { id: 3, equipment: 'VLM-003', issue: 'Hydraulic pressure drop', priority: 'high', daysUntil: 3 }
    ]);
  }, [equipment]);



  const toggleEquipment = async (equipmentId: string, status: boolean) => {
    try {
      await updateEquipment(equipmentId, { 
        status: status ? 'idle' : 'maintenance' 
      });
    } catch (err) {
      console.error('Failed to update equipment status:', err);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const scheduleMaintenance = async (equipmentId: string) => {
    try {
      await updateEquipment(equipmentId, { 
        status: 'maintenance'
      });
      setIsDialogOpen(false);
      setMaintenanceNotes('');
    } catch (err) {
      console.error('Failed to schedule maintenance:', err);
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

  const filterOptions = [
    {
      key: 'type',
      label: 'Equipment Type',
      type: 'select' as const,
      options: [
        { value: 'shuttle', label: 'Shuttle' },
        { value: 'conveyor', label: 'Conveyor' },
        { value: 'vlm', label: 'VLM' },
        { value: 'robot', label: 'Robot' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'idle', label: 'Idle' },
        { value: 'moving', label: 'Moving' },
        { value: 'charging', label: 'Charging' },
        { value: 'error', label: 'Error' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'paused', label: 'Paused' },
        { value: 'loading', label: 'Loading' },
        { value: 'unloading', label: 'Unloading' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search by name, model, or location'
    }
  ];

  const columns = [
    {
      key: 'name' as const,
      header: 'Name',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          {getEquipmentIcon(row.type)}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <StatusBadge status={value as any} />
      )
    },
    {
      key: 'location' as const,
      header: 'Location'
    },
    {
      key: 'battery' as const,
      header: 'Battery',
      render: (value: number) => value ? (
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4" />
          <span>{value}%</span>
        </div>
      ) : null
    },
    {
      key: 'efficiency' as const,
      header: 'Efficiency',
      render: (value: number) => value ? `${value}%` : null
    }
  ];

  const groupedEquipment = equipment.reduce((acc, eq) => {
    if (!acc[eq.type]) acc[eq.type] = [];
    acc[eq.type].push(eq);
    return acc;
  }, {} as Record<string, any[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading equipment...</div>
      </div>
    );
  }



  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Smart Equipment Management</h1>
          <p className="text-muted-foreground">
            AI-powered equipment monitoring and predictive maintenance
            {isConnected && <span className="ml-2 text-green-400">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshEquipment} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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

      {/* Enhanced Metrics Section */}
      <RealTimeMetrics />
      
      {/* Trust and Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrustIndicator />
        
        <Card className="lg:col-span-2 glass-effect hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-glow flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Predictive Maintenance Alerts
            </CardTitle>
            <CardDescription>AI-powered equipment health predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {predictiveAlerts.map((alert) => (
                <div key={alert.id} className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wrench className={`h-4 w-4 ${
                        alert.priority === 'high' ? 'text-red-400' :
                        alert.priority === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground">{alert.equipment}: {alert.issue}</p>
                        <p className="text-xs text-muted-foreground">Maintenance needed in {alert.daysUntil} days</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${
                      alert.priority === 'high' ? 'border-red-500/30 text-red-400' :
                      alert.priority === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                      'border-blue-500/30 text-blue-400'
                    }`}>
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Equipment Health Dashboard */}
      <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-glow flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Equipment Health Dashboard
            </CardTitle>
            <CardDescription>Real-time health metrics and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthMetrics.slice(0, 6).map((metric) => (
                <div key={metric.id} className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-foreground">{metric.name}</h4>
                    <Badge variant="outline" className={`${
                      metric.overallHealth > 90 ? 'border-green-500/30 text-green-400' :
                      metric.overallHealth > 75 ? 'border-yellow-500/30 text-yellow-400' :
                      'border-red-500/30 text-red-400'
                    }`}>
                      {metric.overallHealth.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Health Score</span>
                      <span className="font-medium">{metric.overallHealth.toFixed(1)}%</span>
                    </div>
                    <Progress value={metric.overallHealth} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-red-400" />
                        <span>{metric.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3 text-blue-400" />
                        <span>{metric.vibration.toFixed(2)} m/s²</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Next maintenance: {metric.predictedMaintenance} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">{equipmentStats.online}</p>
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
                <p className="text-2xl font-bold">{equipmentStats.offline}</p>
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
                <p className="text-2xl font-bold">{equipmentStats.maintenance}</p>
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
                <p className="text-2xl font-bold">{equipmentStats.charging}</p>
                <p className="text-sm text-muted-foreground">Charging</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={clearFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Equipment List</CardTitle>
              <CardDescription>
                {filteredEquipment.length} of {equipment.length} equipment items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredEquipment}
                columns={columns}
                loading={isLoading}
                onRowClick={setSelectedEquipment}
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>
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
                    <StatusBadge status={eq.status} />
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
                    checked={eq.status === 'idle' || eq.status === 'moving'}
                    onCheckedChange={(checked) => toggleEquipment(eq.id, checked)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Equipment Details Dialog */}
      {selectedEquipment && (
        <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getEquipmentIcon(selectedEquipment.type)}
                {selectedEquipment.name}
              </DialogTitle>
              <DialogDescription>
                Detailed information and controls for this equipment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedEquipment.status} />
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedEquipment.location}</p>
                </div>
                {selectedEquipment.battery !== undefined && (
                  <div>
                    <Label>Battery Level</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Battery className="h-4 w-4" />
                      <span>{selectedEquipment.battery}%</span>
                    </div>
                  </div>
                )}
                {selectedEquipment.efficiency !== undefined && (
                  <div>
                    <Label>Efficiency</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedEquipment.efficiency}%</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsDialogOpen(true);
                }}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
