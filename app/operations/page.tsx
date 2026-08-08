'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useOperations } from '@/lib/hooks/useOperations';
import { useRobots } from '@/lib/hooks/useRobots';
import { useSensors } from '@/lib/hooks/useSensors';
import { useWebSocket } from '@/lib/websocket';
import { 
  Bot, Thermometer, Package, MapPin, Activity, AlertTriangle, 
  CheckCircle, Clock, Play, Pause, Square, Zap, Eye, Droplets,
  RefreshCw, Plus, Settings, BarChart3
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  type: 'robot' | 'sensor' | 'conveyor' | 'scanner';
  status: 'active' | 'idle' | 'maintenance' | 'error';
  position: { x: number; y: number };
  zone: string;
  data?: {
    robot_commands?: Array<{
      id: string;
      status: string;
      type: string;
      createdAt: string;
    }>;
    sensor_readings?: Array<{
      id: string;
      value: number;
      unit?: string;
      timestamp: string;
    }>;
    location?: string;
    batteryLevel?: number;
    type?: string;
  };
}

interface OperationMetrics {
  activeRobots: number;
  totalTasks: number;
  completedTasks: number;
  errorCount: number;
  efficiency: number;
  throughput: number;
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  maintenance: 'bg-orange-500',
  error: 'bg-red-500'
};

const equipmentIcons = {
  robot: Bot,
  sensor: Thermometer,
  conveyor: Package,
  scanner: Eye
};

export default function OperationsPage() {
  const router = useRouter();
  const {
    operations,
    filteredOperations,
    operationsStats: operationStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    createOperation,
    updateOperation,
    refreshOperations
  } = useOperations();
  
  const { robots, robotStats } = useRobots();
  const { sensors } = useSensors();
  const { isConnected } = useWebSocket();
  
  const [selectedEquipment, setSelectedEquipment] = React.useState<EquipmentItem | null>(null);
  
  const navigateToRobots = () => {
    router.push('/robots');
  };
  
  const navigateToSensors = () => {
    router.push('/sensors');
  };
  
  const navigateToAnalytics = () => {
    router.push('/analytics');
  };
  
  const navigateToMaintenance = () => {
    router.push('/maintenance');
  };
  
  const createNewOperation = () => {
    router.push('/operations/create');
  };

  const equipment: EquipmentItem[] = React.useMemo(() => [
    ...robots.map((robot: any, index: number) => ({
      id: robot.id,
      name: robot.name,
      type: 'robot' as const,
      status: robot.status.toLowerCase(),
      position: { x: 100 + (index * 150), y: 100 + (index % 3) * 100 },
      zone: robot.zoneId || 'Unknown',
      data: robot
    })),
    ...sensors.map((sensor: any, index: number) => ({
      id: sensor.id,
      name: sensor.name,
      type: 'sensor' as const,
      status: sensor.status.toLowerCase(),
      position: { x: 200 + (index * 120), y: 200 + (index % 4) * 80 },
      zone: sensor.zoneId || 'Unknown',
      data: sensor
    }))
  ], [robots, sensors]);
  
  const metrics: OperationMetrics = React.useMemo(() => ({
    activeRobots: robotStats.active,
    totalTasks: operations.length,
    completedTasks: operations.filter(op => op.status === 'COMPLETED').length,
    errorCount: operations.filter(op => op.status === 'FAILED').length,
    efficiency: operations.length > 0 ? Math.round((operations.filter(op => op.status === 'COMPLETED').length / operations.length) * 100) : 0,
    throughput: Math.round(operations.filter(op => op.status === 'COMPLETED').length / 24)
  }), [operations, robotStats]);

  const getEquipmentIcon = (type: string) => {
    const IconComponent = equipmentIcons[type as keyof typeof equipmentIcons] || Activity;
    return IconComponent;
  };

  const getStatusBadge = (status: string) => (
    <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
      {status}
    </Badge>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading operations dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations Control Center</h1>
          <p className="text-muted-foreground">
            Real-time warehouse operations monitoring and control
            {isConnected && <span className="ml-2 text-green-600">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshOperations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={createNewOperation}>
            <Plus className="h-4 w-4 mr-2" />
            New Operation
          </Button>
          <Button onClick={navigateToAnalytics} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Robots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.activeRobots}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.errorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.efficiency}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.throughput}/hr</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="space-y-4">
        <TabsList>
          <TabsTrigger value="map">Equipment Map</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="robots">Robot Control</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Equipment Map</CardTitle>
              <CardDescription>Real-time equipment positions and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-50 rounded-lg" style={{ height: '600px', overflow: 'hidden' }}>
                <svg className="absolute inset-0 w-full h-full">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  <rect x="50" y="50" width="200" height="150" fill="rgba(59, 130, 246, 0.1)" stroke="#3b82f6" strokeWidth="2" rx="8"/>
                  <text x="60" y="70" className="text-sm font-medium fill-blue-600">Zone A</text>
                  
                  <rect x="300" y="50" width="200" height="150" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="2" rx="8"/>
                  <text x="310" y="70" className="text-sm font-medium fill-green-600">Zone B</text>
                  
                  <rect x="50" y="250" width="200" height="150" fill="rgba(245, 158, 11, 0.1)" stroke="#f59e0b" strokeWidth="2" rx="8"/>
                  <text x="60" y="270" className="text-sm font-medium fill-yellow-600">Zone C</text>
                  
                  <rect x="300" y="250" width="200" height="150" fill="rgba(239, 68, 68, 0.1)" stroke="#ef4444" strokeWidth="2" rx="8"/>
                  <text x="310" y="270" className="text-sm font-medium fill-red-600">Zone D</text>
                </svg>

                {equipment.map((item) => {
                  const IconComponent = getEquipmentIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 p-2 rounded-full border-2 ${
                        selectedEquipment?.id === item.id ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'
                      } hover:shadow-lg transition-all`}
                      style={{ left: item.position.x, top: item.position.y }}
                      onClick={() => setSelectedEquipment(item)}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs font-medium mt-1">{item.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedEquipment && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">{selectedEquipment.name}</h3>
                    {getStatusBadge(selectedEquipment.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {selectedEquipment.type}
                    </div>
                    <div>
                      <span className="font-medium">Zone:</span> {selectedEquipment.zone}
                    </div>
                    {selectedEquipment.type === 'robot' && selectedEquipment.data && (
                      <>
                        <div>
                          <span className="font-medium">Active Commands:</span> {selectedEquipment.data.robot_commands?.filter((c: any) => c.status === 'EXECUTING').length || 0}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {selectedEquipment.data.location || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Battery Level:</span> {selectedEquipment.data.batteryLevel || 'N/A'}%
                        </div>
                      </>
                    )}
                    {selectedEquipment.type === 'sensor' && selectedEquipment.data && (
                      <>
                        <div>
                          <span className="font-medium">Latest Reading:</span> {selectedEquipment.data.sensor_readings?.[0]?.value || 'N/A'} {selectedEquipment.data.sensor_readings?.[0]?.unit || ''}
                        </div>
                        <div>
                          <span className="font-medium">Last Update:</span> {selectedEquipment.data.sensor_readings?.[0] ? new Date(selectedEquipment.data.sensor_readings[0].timestamp).toLocaleTimeString() : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {selectedEquipment.data.type}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="robots">
          <Card>
            <CardHeader>
              <CardTitle>Robot Control Panel</CardTitle>
              <CardDescription>Monitor and control robotic operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment.filter(e => e.type === 'robot').map((robot) => (
                  <div key={robot.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bot className="h-6 w-6" />
                      <div>
                        <h3 className="font-medium">{robot.name}</h3>
                        <p className="text-sm text-muted-foreground">Zone: {robot.zone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(robot.status)}
                      <Button size="sm" variant="outline" onClick={navigateToRobots}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Monitoring</CardTitle>
              <CardDescription>Real-time sensor data and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.filter(e => e.type === 'sensor').map((sensor) => {
                  const IconComponent = sensor.data?.type === 'TEMPERATURE' ? Thermometer :
                                     sensor.data?.type === 'HUMIDITY' ? Droplets :
                                     sensor.data?.type === 'PRESSURE' ? Zap : Activity;
                  return (
                    <Card key={sensor.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={navigateToSensors}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {sensor.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Status:</span>
                            {getStatusBadge(sensor.status)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Zone:</span>
                            <span>{sensor.zone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Active Operations</CardTitle>
              <CardDescription>Monitor and manage warehouse operations</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredOperations}
                columns={[
                  {
                    key: 'type' as const,
                    header: 'Type',
                    render: (value: string) => (
                      <Badge variant="outline">{value}</Badge>
                    )
                  },
                  {
                    key: 'status' as const,
                    header: 'Status',
                    render: (value: string) => (
                      <StatusBadge status={value.toLowerCase() as any} />
                    )
                  },
                  {
                    key: 'priority' as const,
                    header: 'Priority',
                    render: (value: string) => (
                      <Badge variant={value === 'URGENT' ? 'destructive' : 'secondary'}>
                        {value}
                      </Badge>
                    )
                  },
                  {
                    key: 'quantity' as const,
                    header: 'Quantity'
                  },
                  {
                    key: 'sourceLocation' as const,
                    header: 'Source'
                  },
                  {
                    key: 'destinationLocation' as const,
                    header: 'Destination'
                  },
                  {
                    key: 'createdAt' as const,
                    header: 'Created',
                    render: (value: string) => new Date(value).toLocaleString()
                  }
                ]}
                loading={isLoading}
                onRowClick={(operation) => router.push(`/operations/${operation.id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}