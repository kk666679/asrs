'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Package, 
  Route, 
  BarChart3, 
  Globe, 
  Activity,
  RefreshCw,
  Zap
} from 'lucide-react';
import Head from 'next/head';
import ShipmentTracker from '@/components/logistics/ShipmentTracker';
import RouteOptimizer from '@/components/logistics/RouteOptimizer';
import FleetManager from '@/components/logistics/FleetManager';
import LogisticsAnalytics from '@/components/logistics/LogisticsAnalytics';
import FleetMapView from '@/components/maps/FleetMapView';
import RouteMapView from '@/components/maps/RouteMapView';
import { healthChecker } from '@/lib/services/logistics-microservices';
import { GOOGLE_MAP_API_URL } from '@/lib/constants';

export default function LogisticsPage() {
  const [microserviceHealth, setMicroserviceHealth] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [fleetData, setFleetData] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any>({
    origin: { id: 'origin', name: 'Distribution Center', lat: 37.7749, lng: -122.4194, priority: 1 },
    destinations: [
      { id: '1', name: 'Warehouse A', lat: 37.7849, lng: -122.4094, priority: 3 },
      { id: '2', name: 'Warehouse B', lat: 37.7649, lng: -122.4294, priority: 2 },
      { id: '3', name: 'Warehouse C', lat: 37.7549, lng: -122.4394, priority: 1 }
    ]
  });

  useEffect(() => {
    checkMicroserviceHealth();
    generateMockFleetData();
    const interval = setInterval(checkMicroserviceHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateMockFleetData = () => {
    const vehicles = [];
    for (let i = 1; i <= 10; i++) {
      vehicles.push({
        id: `vehicle-${i}`,
        code: `FL-${String(i).padStart(3, '0')}`,
        lat: 37.7749 + (Math.random() - 0.5) * 0.1,
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        status: ['AVAILABLE', 'IN_TRANSIT', 'LOADING', 'MAINTENANCE'][Math.floor(Math.random() * 4)],
        batteryLevel: Math.floor(Math.random() * 100),
        fuelLevel: Math.floor(Math.random() * 100),
        driver: `Driver ${i}`
      });
    }
    setFleetData(vehicles);
  };

  const checkMicroserviceHealth = async () => {
    try {
      const health = await healthChecker.checkAllServices();
      setMicroserviceHealth(health);
    } catch (error) {
      console.error('Health check failed:', error);
      // Simulate health status for demo
      setMicroserviceHealth({
        SHIPMENT_SERVICE: 'healthy',
        ROUTING_SERVICE: 'healthy',
        TRACKING_SERVICE: 'healthy',
        FLEET_SERVICE: 'healthy',
        NOTIFICATION_SERVICE: 'healthy'
      });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'down': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <Head>
        <script async defer src={GOOGLE_MAP_API_URL} />
      </Head>
      <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Logistics Microservices Hub</h1>
          <p className="text-muted-foreground">
            Enterprise-grade logistics management with distributed microservice architecture
          </p>
        </div>
        <Button onClick={checkMicroserviceHealth} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Microservice Health Dashboard */}
      <Card className="glass-effect hover-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-glow flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Microservice Architecture Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(microserviceHealth).map(([service, status]) => (
              <div key={service} className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${getHealthColor(status)}`}></div>
                  <span className="text-sm font-medium capitalize">
                    {service.replace('_SERVICE', '').toLowerCase()}
                  </span>
                </div>
                <Badge variant={getHealthBadgeVariant(status) as any} className="text-xs">
                  {status}
                </Badge>
                <div className="mt-2 text-xs text-muted-foreground">
                  {status === 'healthy' ? 'All systems operational' : 
                   status === 'degraded' ? 'Performance issues detected' : 
                   'Service unavailable'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">1,247</p>
                <p className="text-sm text-muted-foreground">Active Shipments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">25</p>
                <p className="text-sm text-muted-foreground">Fleet Vehicles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Route className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">87.5%</p>
                <p className="text-sm text-muted-foreground">Route Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">99.2%</p>
                <p className="text-sm text-muted-foreground">System Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Logistics Dashboard */}
      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Routing
          </TabsTrigger>
          <TabsTrigger value="fleet" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Fleet
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShipmentTracker />
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Real-time Tracking Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '14:32', event: 'Shipment SH-001 departed from warehouse', status: 'info' },
                    { time: '14:28', event: 'Route optimization completed for 5 deliveries', status: 'success' },
                    { time: '14:25', event: 'Vehicle FL-003 arrived at destination', status: 'success' },
                    { time: '14:20', event: 'New shipment SH-002 created', status: 'info' },
                    { time: '14:15', event: 'Fleet utilization at 92%', status: 'warning' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 glass-effect rounded">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.status === 'success' ? 'bg-green-400' :
                        event.status === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{event.event}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <RouteMapView 
            origin={routeData.origin}
            destinations={routeData.destinations}
            onOptimizeRoute={() => console.log('Optimizing route...')}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RouteOptimizer />
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-purple-400" />
                  Route Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-effect p-3 rounded">
                      <div className="text-2xl font-bold text-green-400">-23%</div>
                      <div className="text-sm text-muted-foreground">Travel Time Reduction</div>
                    </div>
                    <div className="glass-effect p-3 rounded">
                      <div className="text-2xl font-bold text-blue-400">-18%</div>
                      <div className="text-sm text-muted-foreground">Fuel Cost Savings</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Routes Optimized Today</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Optimization Time</span>
                      <span className="font-medium">2.3s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium text-green-400">99.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <FleetMapView 
            vehicles={fleetData}
            selectedVehicle={selectedVehicle}
            onVehicleSelect={setSelectedVehicle}
          />
          <FleetManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <LogisticsAnalytics />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}