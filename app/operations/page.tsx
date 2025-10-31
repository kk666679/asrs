'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, Thermometer, Package, MapPin, Activity, AlertTriangle, 
  CheckCircle, Clock, Play, Pause, Square, Zap, Eye, Droplets 
} from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  type: 'robot' | 'sensor' | 'conveyor' | 'scanner';
  status: 'active' | 'idle' | 'maintenance' | 'error';
  position: { x: number; y: number };
  zone: string;
  data?: any;
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
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [metrics, setMetrics] = useState<OperationMetrics>({
    activeRobots: 0,
    totalTasks: 0,
    completedTasks: 0,
    errorCount: 0,
    efficiency: 0,
    throughput: 0
  });
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperationsData();
    const interval = setInterval(fetchOperationsData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOperationsData = async () => {
    try {
      const [robotsRes, sensorsRes] = await Promise.all([
        fetch('/api/robots'),
        fetch('/api/sensors')
      ]);

      const [robotsData, sensorsData] = await Promise.all([
        robotsRes.json(),
        sensorsRes.json()
      ]);

      const robots = robotsData.robots || robotsData;
      const sensors = sensorsData.sensors || sensorsData;

      const equipmentData: EquipmentItem[] = [
        ...robots.map((robot: any, index: number) => ({
          id: robot.id,
          name: robot.name,
          type: 'robot' as const,
          status: robot.status.toLowerCase(),
          position: { x: 100 + (index * 150), y: 100 + (index % 3) * 100 },
          zone: robot.zones?.code || 'Unknown',
          data: robot
        })),
        ...sensors.map((sensor: any, index: number) => ({
          id: sensor.id,
          name: sensor.name,
          type: 'sensor' as const,
          status: sensor.status.toLowerCase(),
          position: { x: 200 + (index * 120), y: 200 + (index % 4) * 80 },
          zone: sensor.zones?.code || 'Unknown',
          data: sensor
        }))
      ];

      setEquipment(equipmentData);

      const activeRobots = robots.filter((r: any) => r.status === 'WORKING').length;
      const totalTasks = robots.reduce((sum: number, r: any) => sum + (r.commands?.length || 0), 0);
      const completedTasks = robots.reduce((sum: number, r: any) => 
        sum + (r.commands?.filter((c: any) => c.status === 'COMPLETED').length || 0), 0);
      const errorCount = robots.filter((r: any) => r.status === 'ERROR').length;

      setMetrics({
        activeRobots,
        totalTasks,
        completedTasks,
        errorCount,
        efficiency: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        throughput: Math.round(completedTasks / 24)
      });

    } catch (error) {
      console.error('Failed to fetch operations data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEquipmentIcon = (type: string) => {
    const IconComponent = equipmentIcons[type as keyof typeof equipmentIcons] || Activity;
    return IconComponent;
  };

  const getStatusBadge = (status: string) => (
    <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
      {status}
    </Badge>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading operations dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations Control Center</h1>
          <p className="text-muted-foreground">Real-time warehouse operations monitoring and control</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOperationsData}>Refresh</Button>
          <Button variant="outline">Emergency Stop All</Button>
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
          <TabsTrigger value="robots">Robot Control</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Monitor</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
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
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Square className="h-4 w-4" />
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
                    <Card key={sensor.id}>
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
                            <span className="text-sm">Reading:</span>
                            <span className="font-medium">
                              {sensor.data?.sensor_readings?.[0]?.value || 'N/A'} {sensor.data?.sensor_readings?.[0]?.unit || ''}
                            </span>
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

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Queue Management</CardTitle>
              <CardDescription>Monitor and manage active tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment
                  .filter(e => e.type === 'robot' && e.data?.robot_commands?.length > 0)
                  .flatMap(robot =>
                    robot.data.robot_commands.map((command: any) => (
                      <div key={command.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            command.status === 'COMPLETED' ? 'bg-green-500' :
                            command.status === 'EXECUTING' ? 'bg-blue-500' :
                            command.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}>
                            {command.status === 'COMPLETED' ? <CheckCircle className="h-4 w-4 text-white" /> :
                             command.status === 'EXECUTING' ? <Play className="h-4 w-4 text-white" /> :
                             command.status === 'FAILED' ? <AlertTriangle className="h-4 w-4 text-white" /> :
                             <Clock className="h-4 w-4 text-white" />}
                          </div>
                          <div>
                            <h3 className="font-medium">{command.type}</h3>
                            <p className="text-sm text-muted-foreground">Robot: {robot.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={command.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                            {command.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(command.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}