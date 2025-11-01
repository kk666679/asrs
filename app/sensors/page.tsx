'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useSensors } from '@/lib/hooks/useSensors';
import { 
  Thermometer, 
  Droplets, 
  Weight, 
  Zap, 
  Eye, 
  Vibrate, 
  Activity, 
  AlertTriangle,
  Plus,
  Settings,
  TrendingUp,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  MapPin,
  Clock,
  BarChart3,
  LineChart,
  RefreshCw,
  Download,
  Upload,
  Bell,
  Shield
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const dynamic = 'force-dynamic';

interface Sensor {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  thresholdMin?: number;
  thresholdMax?: number;
  zone?: {
    code: string;
    name: string;
  };
  bin?: {
    code: string;
  };
  readings?: Array<{
    value: number;
    unit: string;
    timestamp: string;
  }>;
}

const sensorIcons = {
  TEMPERATURE: Thermometer,
  HUMIDITY: Droplets,
  WEIGHT: Weight,
  PRESSURE: Zap,
  MOTION: Eye,
  LIGHT: Activity,
  VIBRATION: Vibrate,
};

const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
  MAINTENANCE: 'bg-yellow-500',
  FAULTY: 'bg-red-500',
};

// Mock real-time data generator
const generateMockSensorData = () => {
  const baseTemp = 22;
  const baseHumidity = 45;
  const basePressure = 1013;
  
  return {
    temperature: baseTemp + (Math.random() - 0.5) * 4,
    humidity: baseHumidity + (Math.random() - 0.5) * 10,
    pressure: basePressure + (Math.random() - 0.5) * 20,
    timestamp: new Date().toISOString()
  };
};

export default function SensorsPage() {
  const {
    sensors,
    filteredSensors,
    sensorStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    refreshSensors
  } = useSensors();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  // Real-time data simulation
  useEffect(() => {
    if (!isRealTimeEnabled) return;
    
    const interval = setInterval(() => {
      const newData = generateMockSensorData();
      setRealTimeData(prev => {
        const updated = [...prev, newData].slice(-20); // Keep last 20 readings
        return updated;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);



  const displaySensors = React.useMemo(() => {
    return filteredSensors.filter(sensor =>
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredSensors, searchTerm]);

  // Enhanced metrics calculation
  const enhancedMetrics = React.useMemo(() => {
    const totalSensors = filteredSensors.length;
    const activeSensors = filteredSensors.filter(s => s.status === 'ACTIVE').length;
    const faultySensors = filteredSensors.filter(s => s.status === 'FAULTY').length;
    const maintenanceSensors = filteredSensors.filter(s => s.status === 'MAINTENANCE').length;
    const avgUptime = totalSensors > 0 ? ((activeSensors / totalSensors) * 100).toFixed(1) : '0';
    
    return {
      totalSensors,
      activeSensors,
      faultySensors,
      maintenanceSensors,
      avgUptime: parseFloat(avgUptime)
    };
  }, [filteredSensors]);

  const getLatestReading = (sensor: Sensor) => {
    return sensor.readings?.[0];
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getSensorIcon = (type: string) => {
    const IconComponent = sensorIcons[type as keyof typeof sensorIcons] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sensors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">IoT Sensor Network</h1>
          <p className="text-muted-foreground">Advanced sensor monitoring and analytics platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sensor
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedMetrics.totalSensors}</div>
            <p className="text-xs text-muted-foreground">
              {enhancedMetrics.activeSensors} active
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedMetrics.avgUptime}%</div>
            <Progress value={enhancedMetrics.avgUptime} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedMetrics.faultySensors}</div>
            <p className="text-xs text-muted-foreground">
              {enhancedMetrics.maintenanceSensors} in maintenance
            </p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Real-time Controls */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-glow">System Controls</CardTitle>
          <CardDescription>Manage real-time monitoring and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={isRealTimeEnabled} 
                  onCheckedChange={setIsRealTimeEnabled}
                />
                <Label>Real-time Monitoring</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={alertsEnabled} 
                  onCheckedChange={setAlertsEnabled}
                />
                <Label>Alert Notifications</Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshSensors}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sensors">Sensor List</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Chart */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-glow">Real-time Sensor Data</CardTitle>
              <CardDescription>Live environmental monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                      name="Temperature (°C)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.3}
                      name="Humidity (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Sensor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySensors.slice(0, 6).map((sensor) => {
              const latestReading = getLatestReading(sensor);
              return (
                <Card key={sensor.id} className="glass-effect hover-glow transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getSensorIcon(sensor.type)}
                        {sensor.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {sensor.status === 'ACTIVE' ? 
                          <Wifi className="h-4 w-4 text-green-500" /> : 
                          <WifiOff className="h-4 w-4 text-red-500" />
                        }
                        {getStatusBadge(sensor.status)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {sensor.location || 'Unknown location'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {latestReading && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current Reading</span>
                          <span className="text-lg font-bold">
                            {latestReading.value} {latestReading.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(latestReading.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Signal className="h-3 w-3" />
                            Strong
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {sensor.thresholdMin !== undefined && sensor.thresholdMax !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Threshold Range</span>
                          <span>{sensor.thresholdMin} - {sensor.thresholdMax}</span>
                        </div>
                        <Progress 
                          value={latestReading ? 
                            ((latestReading.value - sensor.thresholdMin) / (sensor.thresholdMax - sensor.thresholdMin)) * 100 : 0
                          } 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-glow">Sensor Analytics</CardTitle>
              <CardDescription>Historical data and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Humidity (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pressure" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                      name="Pressure (hPa)"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sensors" className="space-y-6">
          {/* Filters */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search sensors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Sensor Type</Label>
                  <Select value={filters.type || 'all'} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="TEMPERATURE">Temperature</SelectItem>
                      <SelectItem value="HUMIDITY">Humidity</SelectItem>
                      <SelectItem value="WEIGHT">Weight</SelectItem>
                      <SelectItem value="PRESSURE">Pressure</SelectItem>
                      <SelectItem value="MOTION">Motion</SelectItem>
                      <SelectItem value="LIGHT">Light</SelectItem>
                      <SelectItem value="VIBRATION">Vibration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="FAULTY">Faulty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={refreshSensors} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sensors Table */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Sensors ({displaySensors.length})</CardTitle>
              <CardDescription>Complete sensor inventory and status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sensor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latest Reading</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displaySensors.map((sensor) => {
                    const latestReading = getLatestReading(sensor);
                    return (
                      <TableRow key={sensor.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSensorIcon(sensor.type)}
                            <div>
                              <div className="font-medium">{sensor.name}</div>
                              <div className="text-sm text-muted-foreground">{sensor.code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {sensor.type.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {sensor.location || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {sensor.status === 'ACTIVE' ? 
                              <Wifi className="h-4 w-4 text-green-500" /> : 
                              <WifiOff className="h-4 w-4 text-red-500" />
                            }
                            {getStatusBadge(sensor.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {latestReading ? (
                            <div className="text-sm">
                              <div className="font-medium">{latestReading.value} {latestReading.unit}</div>
                              <div className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(latestReading.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No data</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Signal className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Strong</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={isDialogOpen && selectedSensor?.id === sensor.id} onOpenChange={setIsDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSensor(sensor)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getSensorIcon(sensor.type)}
                                    {sensor.name} ({sensor.code})
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detailed sensor information and analytics
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedSensor && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Type</Label>
                                        <div className="text-sm">{selectedSensor.type}</div>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div>{getStatusBadge(selectedSensor.status)}</div>
                                      </div>
                                      <div>
                                        <Label>Location</Label>
                                        <div className="text-sm">
                                          {selectedSensor.zone && `Zone: ${selectedSensor.zone.name}`}
                                          {selectedSensor.bin && `Bin: ${selectedSensor.bin.code}`}
                                          {selectedSensor.location}
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Signal Strength</Label>
                                        <div className="flex items-center gap-2">
                                          <Signal className="h-4 w-4 text-green-500" />
                                          <span className="text-sm">Strong (-45 dBm)</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label>Recent Readings Chart</Label>
                                      <div className="mt-2 h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <RechartsLineChart data={realTimeData.slice(-10)}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                              dataKey="timestamp" 
                                              tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                                            />
                                            <YAxis />
                                            <Tooltip />
                                            <Line 
                                              type="monotone" 
                                              dataKey="temperature" 
                                              stroke="#8884d8" 
                                              strokeWidth={2}
                                            />
                                          </RechartsLineChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label>Recent Readings</Label>
                                      <div className="mt-2 max-h-40 overflow-y-auto">
                                        {selectedSensor.readings?.slice(0, 10).map((reading, index) => (
                                          <div key={index} className="flex justify-between py-1 border-b text-sm">
                                            <span>{new Date(reading.timestamp).toLocaleString()}</span>
                                            <span className="font-medium">{reading.value} {reading.unit}</span>
                                          </div>
                                        )) || <div className="text-muted-foreground">No readings available</div>}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-glow">Active Alerts</CardTitle>
              <CardDescription>System alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <span>Temperature sensor TMP-001 reading above threshold (28°C)</span>
                      <Badge variant="destructive">High</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <span>Humidity sensor HUM-003 requires calibration</span>
                      <Badge variant="secondary">Medium</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <span>Motion sensor MOT-005 offline for 2 hours</span>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
