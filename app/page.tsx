"use client";

import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  AlertTriangle,
  Battery,
  Cpu,
  Gauge,
  Thermometer,
  Wind,
  Zap,
  Play,
  Square,
  Settings,
  TrendingUp,
  Users,
  Wrench,
  FileText,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Package,
  Truck,
  BarChart3,
  Eye,
  EyeOff
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  summary: {
    totalItems: number;
    activeBins: number;
    todaysMovements: number;
    pendingTasks: number;
  };
  sensors: {
    temperature: number;
    humidity: number;
    airQuality: string;
    vibration: number;
    powerUsage: number;
    motorHealth: number;
    loadCapacity: number;
  };
  equipment: {
    shuttles: Array<{
      id: string;
      name: string;
      status: string;
      battery: number;
      location: string;
      task?: string;
    }>;
    conveyors: Array<{
      id: string;
      name: string;
      status: string;
      throughput: number;
      zone: string;
    }>;
    vlms: Array<{
      id: string;
      name: string;
      status: string;
      currentFloor: number;
      task?: string;
    }>;
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    time: string;
    acknowledged: boolean;
  }>;
  performance: {
    throughput: number[];
    efficiency: number[];
    labels: string[];
  };
}

export default function EnhancedDashboard() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    if (realTimeUpdates) {
      const interval = setInterval(fetchDashboardData, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeUpdates]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, sensorsRes, robotsRes] = await Promise.all([
        fetch("/api/analytics"),
        fetch("/api/sensor-readings"),
        fetch("/api/robots")
      ]);

      const analytics = analyticsRes.ok ? await analyticsRes.json() : null;
      const sensors = sensorsRes.ok ? await sensorsRes.json() : [];
      const robots = robotsRes.ok ? await robotsRes.json() : [];

      // Mock comprehensive data structure
      const mockData: DashboardData = {
        summary: analytics?.summary || {
          totalItems: 15420,
          activeBins: 892,
          todaysMovements: 1247,
          pendingTasks: 23
        },
        sensors: {
          temperature: sensors.find((s: any) => s.type === 'temperature')?.value || 23.5,
          humidity: sensors.find((s: any) => s.type === 'humidity')?.value || 45,
          airQuality: 'Good',
          vibration: sensors.find((s: any) => s.type === 'vibration')?.value || 2.3,
          powerUsage: 45,
          motorHealth: 94,
          loadCapacity: 78
        },
        equipment: {
          shuttles: [
            { id: 's1', name: 'Shuttle #1', status: 'online', battery: 87, location: 'Aisle 3, Pos 45', task: 'Retrieving Item #4582' },
            { id: 's2', name: 'Shuttle #2', status: 'online', battery: 92, location: 'Aisle 5, Pos 12', task: 'Idle' },
            { id: 's3', name: 'Shuttle #3', status: 'charging', battery: 45, location: 'Aisle 7, Pos 33', task: 'Charging' }
          ],
          conveyors: [
            { id: 'c1', name: 'Conveyor A', status: 'maintenance', throughput: 120, zone: 'Loading Bay' },
            { id: 'c2', name: 'Conveyor B', status: 'online', throughput: 95, zone: 'Sorting' }
          ],
          vlms: [
            { id: 'v1', name: 'VLM #1', status: 'online', currentFloor: 3, task: 'Moving to Floor 5' },
            { id: 'v2', name: 'VLM #2', status: 'online', currentFloor: 7, task: 'Idle' }
          ]
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            title: 'Elevated Vibration - Shuttle #3',
            description: 'Vibration levels above threshold in motor assembly',
            time: '10 minutes ago',
            acknowledged: false
          },
          {
            id: '2',
            type: 'info',
            title: 'Preventive Maintenance Due',
            description: 'Conveyor System A maintenance scheduled in 2 days',
            time: '1 hour ago',
            acknowledged: false
          }
        ],
        performance: {
          throughput: [120, 210, 180, 245, 230, 195, 160],
          efficiency: [85, 92, 88, 95, 90, 87, 82],
          labels: ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00']
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'charging': return 'bg-blue-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const performanceData = {
    labels: dashboardData?.performance.labels || [],
    datasets: [
      {
        label: 'Throughput (units/hr)',
        data: dashboardData?.performance.throughput || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Efficiency (%)',
        data: dashboardData?.performance.efficiency || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const performanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const toggleEquipment = async (equipmentId: string, status: boolean) => {
    // Mock API call
    console.log(`Toggling ${equipmentId} to ${status ? 'on' : 'off'}`);
  };

  const acknowledgeAlert = (alertId: string) => {
    setDashboardData(prev => prev ? {
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    } : null);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header with System Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ASRS Control Center</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring and control dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Online</span>
          </div>
          <Button
            variant={realTimeUpdates ? "default" : "outline"}
            size="sm"
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
          >
            {realTimeUpdates ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Live Updates
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button className="bg-green-600 hover:bg-green-700">
          <Play className="h-4 w-4 mr-2" />
          Start All Systems
        </Button>
        <Button variant="destructive">
          <Square className="h-4 w-4 mr-2" />
          Emergency Stop
        </Button>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Optimize Routes
        </Button>
        <Button variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Run Diagnostics
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.summary.todaysMovements || 0}/hr</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Units</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12/15</div>
            <p className="text-xs text-muted-foreground">3 units in maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.summary.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Throughput and efficiency over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={performanceData} options={performanceOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>System notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData?.alerts.filter(alert => !alert.acknowledged).map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-yellow-500">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <AlertTitle className="text-sm">{alert.title}</AlertTitle>
                      <AlertDescription className="text-xs mt-1">
                        {alert.description}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                </div>
              </Alert>
            ))}
            {(!dashboardData?.alerts.filter(alert => !alert.acknowledged).length) && (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No active alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status and Environmental Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
            <CardDescription>Real-time status of all ASRS equipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.equipment.shuttles.map((shuttle) => (
              <div key={shuttle.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(shuttle.status)}`}></div>
                  <div>
                    <p className="font-medium text-sm">{shuttle.name}</p>
                    <p className="text-xs text-muted-foreground">{shuttle.location}</p>
                    {shuttle.task && <p className="text-xs text-blue-600">{shuttle.task}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{shuttle.battery}%</span>
                  <Switch
                    checked={shuttle.status === 'online'}
                    onCheckedChange={(checked) => toggleEquipment(shuttle.id, checked)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Environmental Sensors */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Conditions</CardTitle>
            <CardDescription>Current sensor readings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Thermometer className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Temperature</p>
                  <p className="text-lg font-bold">{dashboardData?.sensors.temperature}°C</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Wind className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Humidity</p>
                  <p className="text-lg font-bold">{dashboardData?.sensors.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Gauge className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Air Quality</p>
                  <p className="text-lg font-bold">{dashboardData?.sensors.airQuality}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Power Usage</p>
                  <p className="text-lg font-bold">{dashboardData?.sensors.powerUsage} kW</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSensors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sensor Monitoring</h1>
          <p className="text-gray-600">Real-time sensor data and historical trends</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure Sensors
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.sensors.temperature}°C</div>
            <Badge variant="secondary" className="mt-1">Normal</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              Humidity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.sensors.humidity}%</div>
            <Badge variant="secondary" className="mt-1">Optimal</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-green-500" />
              Vibration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.sensors.vibration} m/s²</div>
            <Badge variant="destructive" className="mt-1">Elevated</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Power Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.sensors.powerUsage} kW</div>
            <Badge variant="secondary" className="mt-1">Optimal</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sensor Data History</CardTitle>
          <CardDescription>Historical sensor readings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Bar
              data={{
                labels: ['Shuttle 1', 'Shuttle 2', 'Shuttle 3', 'Conveyor A', 'Conveyor B', 'VLM 1', 'VLM 2'],
                datasets: [{
                  label: 'Vibration (m/s²)',
                  data: [2.3, 1.8, 3.1, 1.2, 0.9, 1.5, 1.7],
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                }, {
                  label: 'Temperature (°C)',
                  data: [28, 25, 31, 23, 22, 26, 24],
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Control</h1>
          <p className="text-gray-600">Monitor and control all ASRS equipment</p>
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

      {/* Retrieval Shuttles */}
      <Card>
        <CardHeader>
          <CardTitle>Retrieval Shuttles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData?.equipment.shuttles.map((shuttle) => (
            <div key={shuttle.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{shuttle.name}</h3>
                  <Badge variant={shuttle.status === 'online' ? 'default' : shuttle.status === 'charging' ? 'secondary' : 'destructive'}>
                    {shuttle.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{shuttle.location}</p>
                {shuttle.task && <p className="text-sm text-blue-600">Task: {shuttle.task}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Battery className="h-4 w-4" />
                  <span className="text-sm">Battery: {shuttle.battery}%</span>
                </div>
              </div>
              <Switch
                checked={shuttle.status === 'online'}
                onCheckedChange={(checked) => toggleEquipment(shuttle.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conveyors */}
      <Card>
        <CardHeader>
          <CardTitle>Conveyor Systems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData?.equipment.conveyors.map((conveyor) => (
            <div key={conveyor.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{conveyor.name}</h3>
                  <Badge variant={conveyor.status === 'online' ? 'default' : 'destructive'}>
                    {conveyor.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Zone: {conveyor.zone}</p>
                <p className="text-sm text-muted-foreground">Throughput: {conveyor.throughput}/min</p>
              </div>
              <Switch
                checked={conveyor.status === 'online'}
                onCheckedChange={(checked) => toggleEquipment(conveyor.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* VLMs */}
      <Card>
        <CardHeader>
          <CardTitle>Vertical Lift Modules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData?.equipment.vlms.map((vlm) => (
            <div key={vlm.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">{vlm.name}</h3>
                  <Badge variant={vlm.status === 'online' ? 'default' : 'destructive'}>
                    {vlm.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Current Floor: {vlm.currentFloor}</p>
                {vlm.task && <p className="text-sm text-blue-600">Task: {vlm.task}</p>}
              </div>
              <Switch
                checked={vlm.status === 'online'}
                onCheckedChange={(checked) => toggleEquipment(vlm.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
          <p className="text-gray-600">System alerts and maintenance notifications</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Alert Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Active Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Total This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData?.alerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.type === 'critical' ? 'border-l-red-500' :
              alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
            } ${alert.acknowledged ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      {alert.acknowledged && <Badge variant="outline" className="text-xs">Acknowledged</Badge>}
                    </AlertTitle>
                    <AlertDescription className="mt-1">
                      {alert.description}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-2">{alert.time}</p>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Schedule</h1>
          <p className="text-gray-600">Scheduled maintenance and service tasks</p>
        </div>
        <Button>
          <Wrench className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Due This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">5</p>
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
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-muted-foreground">Completed This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-medium">Conveyor System A - Preventive Maintenance</h3>
                <p className="text-sm text-muted-foreground">Scheduled: Tomorrow at 2:00 PM</p>
                <p className="text-sm text-muted-foreground">Technician: John Smith</p>
              </div>
            </div>
            <Badge>Scheduled</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="font-medium">Shuttle #3 - Motor Inspection</h3>
                <p className="text-sm text-muted-foreground">Scheduled: Friday at 9:00 AM</p>
                <p className="text-sm text-muted-foreground">Technician: Sarah Johnson</p>
              </div>
            </div>
            <Badge>Scheduled</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium">VLM #1 - Emergency Repair</h3>
                <p className="text-sm text-muted-foreground">Due: Today at 4:00 PM</p>
                <p className="text-sm text-muted-foreground">Priority: High</p>
              </div>
            </div>
            <Badge variant="destructive">Urgent</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and view system reports</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Report
            </CardTitle>
            <CardDescription>Weekly throughput and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Last generated: 2 hours ago</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Equipment Report
            </CardTitle>
            <CardDescription>Equipment utilization and maintenance history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Last generated: 1 day ago</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Efficiency Report
            </CardTitle>
            <CardDescription>System efficiency and optimization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Last generated: 3 hours ago</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ASRS Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="sensors">Sensors</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
          <TabsContent value="dashboard" className="mt-0">
            {renderDashboard()}
          </TabsContent>
          <TabsContent value="sensors" className="mt-0">
            {renderSensors()}
          </TabsContent>
          <TabsContent value="equipment" className="mt-0">
            {renderEquipment()}
          </TabsContent>
          <TabsContent value="alerts" className="mt-0">
            {renderAlerts()}
          </TabsContent>
          <TabsContent value="maintenance" className="mt-0">
            {renderMaintenance()}
          </TabsContent>
          <TabsContent value="reports" className="mt-0">
            {renderReports()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
