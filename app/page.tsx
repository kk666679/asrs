"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
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

// Lazy load chart components for better performance
const Line = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Line })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
});

const Bar = dynamic(() => import('react-chartjs-2').then(mod => ({ default: mod.Bar })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center">Loading chart...</div>
});
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedCard from "@/components/ui/animated-card";
import { LazyChart } from "@/components/ui/lazy-chart";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { AccessibilityWrapper } from "@/components/ui/accessibility-wrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ThemeToggle } from "@/components/theme-toggle";
import TrustIndicator from "@/components/enhanced/TrustIndicator";
import RealTimeMetrics from "@/components/enhanced/RealTimeMetrics";
import InteractiveHeatmap from "@/components/enhanced/InteractiveHeatmap";
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

interface SensorReading {
  sensor?: {
    type: string;
  };
  value: number;
}

interface RobotData {
  id: string;
  name: string;
  status: string;
  batteryLevel?: number;
  location?: string;
  type?: string;
  zones?: {
    code: string;
  };
}

export default function 
EnhancedDashboard() {
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
      const [sensorsRes, robotsRes] = await Promise.all([
        fetch("/api/sensors/readings"),
        fetch("/api/robots")
      ]);

      let sensors = { readings: [] };
      let robots = [];

      if (sensorsRes.ok) {
        try {
          sensors = await sensorsRes.json();
        } catch (e) {
          console.warn('Failed to parse sensors response:', e);
        }
      }

      if (robotsRes.ok) {
        try {
          const robotsData = await robotsRes.json();
          robots = Array.isArray(robotsData) ? robotsData : [];
        } catch (e) {
          console.warn('Failed to parse robots response:', e);
        }
      }

      const dashboardData: DashboardData = {
        summary: {
          totalItems: 0,
          activeBins: 0,
          todaysMovements: 0,
          pendingTasks: 0
        },
        sensors: {
          temperature: (sensors.readings as SensorReading[]).find((r: SensorReading) => r.sensor?.type === 'TEMPERATURE')?.value || 0,
          humidity: (sensors.readings as SensorReading[]).find((r: SensorReading) => r.sensor?.type === 'HUMIDITY')?.value || 0,
          airQuality: 'Unknown',
          vibration: (sensors.readings as SensorReading[]).find((r: SensorReading) => r.sensor?.type === 'VIBRATION')?.value || 0,
          powerUsage: 0,
          motorHealth: 0,
          loadCapacity: 0
        },
        equipment: {
          shuttles: (robots || []).filter((r: RobotData) => r && r.type === 'STORAGE_RETRIEVAL').map((r: RobotData) => ({
            id: r?.id || '',
            name: r?.name || '',
            status: r?.status || 'OFFLINE',
            battery: r?.batteryLevel || 0,
            location: r?.location || '',
            task: 'Idle'
          })),
          conveyors: (robots || []).filter((r: RobotData) => r && r.type === 'CONVEYOR').map((r: RobotData) => ({
            id: r?.id || '',
            name: r?.name || '',
            status: r?.status || 'OFFLINE',
            throughput: 0,
            zone: r?.zones?.code || ''
          })),
          vlms: (robots || []).filter((r: RobotData) => r && r.type === 'SORTING').map((r: RobotData) => ({
            id: r?.id || '',
            name: r?.name || '',
            status: r?.status || 'OFFLINE',
            currentFloor: 1,
            task: 'Idle'
          }))
        },
        alerts: [],
        performance: {
          throughput: [],
          efficiency: [],
          labels: []
        }
      };

      setDashboardData(dashboardData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set fallback data on error
      setDashboardData({
        summary: { totalItems: 0, activeBins: 0, todaysMovements: 0, pendingTasks: 0 },
        sensors: { temperature: 0, humidity: 0, airQuality: 'Unknown', vibration: 0, powerUsage: 0, motorHealth: 0, loadCapacity: 0 },
        equipment: { shuttles: [], conveyors: [], vlms: [] },
        alerts: [],
        performance: { throughput: [], efficiency: [], labels: [] }
      });
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
      <motion.div 
        className="flex justify-between items-center glass-effect neon-border rounded-xl p-6 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-glow bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            ASRS Control Center
          </h1>
          <p className="text-blue-300/80 mt-2 text-lg">Real-time monitoring and control dashboard</p>
        </motion.div>
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="flex items-center gap-2 glass-effect px-4 py-2 rounded-full neon-border"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-3 h-3 bg-cyan-400 rounded-full"
              animate={{ 
                boxShadow: [
                  "0 0 5px #00bcd4",
                  "0 0 20px #00bcd4",
                  "0 0 5px #00bcd4"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-cyan-300">System Online</span>
          </motion.div>
          <ThemeToggle />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={realTimeUpdates ? "default" : "outline"}
              size="sm"
              onClick={() => setRealTimeUpdates(!realTimeUpdates)}
              className={`glass-effect neon-border ${realTimeUpdates ? 'bg-blue-600/30 text-cyan-300' : 'text-blue-300'}`}
            >
              {realTimeUpdates ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              Live Updates
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="flex gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="glass-effect bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 neon-border border-emerald-400/30 hover:border-emerald-400/60">
            <Play className="h-4 w-4 mr-2" />
            Start All Systems
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="glass-effect bg-red-600/30 hover:bg-red-600/50 text-red-300 neon-border border-red-400/30 hover:border-red-400/60">
            <Square className="h-4 w-4 mr-2" />
            Emergency Stop
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="glass-effect bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 neon-border">
            <Settings className="h-4 w-4 mr-2" />
            Optimize Routes
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="glass-effect bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 neon-border border-purple-400/30">
            <Activity className="h-4 w-4 mr-2" />
            Run Diagnostics
          </Button>
        </motion.div>
      </motion.div>

      {/* Enhanced Real-time Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-8"
      >
        <RealTimeMetrics />
      </motion.div>

      {/* System Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1 }
          }}
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-300">Throughput</h3>
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{dashboardData?.summary.todaysMovements || 0}/hr</div>
          <p className="text-xs text-emerald-400">+12% from yesterday</p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1 }
          }}
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-green-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-300">Uptime</h3>
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">99.8%</div>
          <p className="text-xs text-blue-300/70">Last 30 days</p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1 }
          }}
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-300">Active Units</h3>
            <Cpu className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">12/15</div>
          <p className="text-xs text-yellow-400">3 units in maintenance</p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.9 },
            show: { opacity: 1, y: 0, scale: 1 }
          }}
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-cyan-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-300">Total Items</h3>
            <Package className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{dashboardData?.summary.totalItems || 0}</div>
          <p className="text-xs text-blue-300/70">Across all locations</p>
        </motion.div>
      </motion.div>

      {/* Trust and Heatmap Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <TrustIndicator />
        </motion.div>
        
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <InteractiveHeatmap />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <motion.div 
          className="lg:col-span-2 glass-effect neon-border rounded-xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Performance Metrics</h3>
            <p className="text-blue-300/70">Throughput and efficiency over time</p>
          </div>
          <div className="glass-effect rounded-lg p-4">
            <LazyChart>
              <div className="h-80">
                <Line data={performanceData} options={performanceOptions} />
              </div>
            </LazyChart>
          </div>
        </motion.div>

        {/* Active Alerts */}
        <motion.div 
          className="glass-effect neon-border rounded-xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Active Alerts</h3>
            <p className="text-blue-300/70">System notifications and warnings</p>
          </div>
          <div className="space-y-3">
            {dashboardData?.alerts.filter(alert => !alert.acknowledged).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
                className="glass-effect border-l-4 border-l-yellow-400 rounded-lg p-4 hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                      <p className="text-xs mt-1 text-blue-300/70">
                        {alert.description}
                      </p>
                      <p className="text-xs text-blue-400/60 mt-1">{alert.time}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="glass-effect p-2 rounded-full hover:bg-green-500/20"
                  >
                    <CheckCircle className="h-3 w-3 text-green-400" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
            {(!dashboardData?.alerts.filter(alert => !alert.acknowledged).length) && (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
                <p className="text-sm text-blue-300">No active alerts</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Equipment Status and Environmental Sensors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipment Status */}
        <AnimatedCard delay={0.6}>
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
        </AnimatedCard>

        {/* Environmental Sensors */}
        <AnimatedCard delay={0.7}>
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
        </AnimatedCard>
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
          <LazyChart>
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
          </LazyChart>
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
    <ErrorBoundary>
      <AccessibilityWrapper role="main" aria-label="ASRS Control Center">
        <div className="min-h-screen bg-background">
          {/* Navigation Tabs */}
          <div className="glass-effect border-b border-neonBlue/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
                <TabsList className="grid w-full grid-cols-6 glass-effect" role="tablist" aria-label="Main navigation">
                  <TabsTrigger value="dashboard" aria-controls="dashboard-panel">Dashboard</TabsTrigger>
                  <TabsTrigger value="sensors" aria-controls="sensors-panel">Sensors</TabsTrigger>
                  <TabsTrigger value="equipment" aria-controls="equipment-panel">Equipment</TabsTrigger>
                  <TabsTrigger value="alerts" aria-controls="alerts-panel">Alerts</TabsTrigger>
                  <TabsTrigger value="maintenance" aria-controls="maintenance-panel">Maintenance</TabsTrigger>
                  <TabsTrigger value="reports" aria-controls="reports-panel">Reports</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeModule} onValueChange={setActiveModule} className="w-full">
              <TabsContent value="dashboard" className="mt-0" id="dashboard-panel" role="tabpanel" aria-labelledby="dashboard-tab">
                {renderDashboard()}
              </TabsContent>
              <TabsContent value="sensors" className="mt-0" id="sensors-panel" role="tabpanel" aria-labelledby="sensors-tab">
                {renderSensors()}
              </TabsContent>
              <TabsContent value="equipment" className="mt-0" id="equipment-panel" role="tabpanel" aria-labelledby="equipment-tab">
                {renderEquipment()}
              </TabsContent>
              <TabsContent value="alerts" className="mt-0" id="alerts-panel" role="tabpanel" aria-labelledby="alerts-tab">
                {renderAlerts()}
              </TabsContent>
              <TabsContent value="maintenance" className="mt-0" id="maintenance-panel" role="tabpanel" aria-labelledby="maintenance-tab">
                {renderMaintenance()}
              </TabsContent>
              <TabsContent value="reports" className="mt-0" id="reports-panel" role="tabpanel" aria-labelledby="reports-tab">
                {renderReports()}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AccessibilityWrapper>
    </ErrorBoundary>
  );
}
