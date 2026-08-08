'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Truck, Battery, Fuel, MapPin, Activity, RefreshCw } from 'lucide-react';

interface Vehicle {
  id: string;
  code: string;
  type: string;
  status: string;
  location: {
    x: number;
    y: number;
    address: string;
  };
  capacity: number;
  currentLoad: number;
  fuelLevel: number;
  batteryLevel: number;
  driver: string;
  efficiency: number;
  activeRoute?: {
    id: string;
    destination: string;
    eta: Date;
  };
}

interface FleetStats {
  total: number;
  available: number;
  inTransit: number;
  maintenance: number;
  utilization: number;
  avgEfficiency: number;
  avgFuelLevel: number;
}

export default function FleetManager() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    fetchFleetData();
    const interval = setInterval(fetchFleetData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFleetData = async () => {
    try {
      const response = await fetch('/api/logistics/fleet');
      if (response.ok) {
        const data = await response.json();
        setFleet(data.fleet);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch fleet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeCommand = async (vehicleId: string, command: string) => {
    try {
      const response = await fetch('/api/logistics/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          command,
          parameters: {}
        })
      });

      if (response.ok) {
        fetchFleetData(); // Refresh data
      }
    } catch (error) {
      console.error('Command execution failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500';
      case 'IN_TRANSIT': return 'bg-blue-500';
      case 'LOADING': return 'bg-yellow-500';
      case 'MAINTENANCE': return 'bg-red-500';
      case 'OFFLINE': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRUCK': return <Truck className="h-4 w-4" />;
      case 'VAN': return <Truck className="h-4 w-4" />;
      case 'DRONE': return <Activity className="h-4 w-4" />;
      case 'AMR': return <Activity className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fleet Statistics */}
      {stats && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-400" />
                Fleet Management Dashboard
              </div>
              <Button variant="outline" size="sm" onClick={fetchFleetData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Vehicles</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{stats.available}</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">{stats.inTransit}</div>
                <div className="text-sm text-muted-foreground">In Transit</div>
              </div>
              <div className="glass-effect p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{stats.utilization}%</div>
                <div className="text-sm text-muted-foreground">Utilization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fleet.map((vehicle) => (
          <Card key={vehicle.id} className="glass-effect hover-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(vehicle.type)}
                  <span className="font-semibold">{vehicle.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(vehicle.status)}`} />
                  <Badge variant="outline" className="text-xs">
                    {vehicle.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Load Capacity</span>
                  <span>{((vehicle.currentLoad / vehicle.capacity) * 100).toFixed(0)}%</span>
                </div>
                <Progress 
                  value={(vehicle.currentLoad / vehicle.capacity) * 100} 
                  className="h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Fuel className="h-3 w-3 text-yellow-400" />
                  <span>{vehicle.fuelLevel}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Battery className="h-3 w-3 text-green-400" />
                  <span>{vehicle.batteryLevel}%</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3 text-blue-400" />
                <span className="truncate">{vehicle.location.address}</span>
              </div>

              {vehicle.activeRoute && (
                <div className="glass-effect p-2 rounded text-xs">
                  <div className="font-medium">Active Route</div>
                  <div className="text-muted-foreground">
                    → {vehicle.activeRoute.destination}
                  </div>
                  <div className="text-muted-foreground">
                    ETA: {new Date(vehicle.activeRoute.eta).toLocaleTimeString()}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  Details
                </Button>
                {vehicle.status === 'AVAILABLE' && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => executeCommand(vehicle.id, 'DISPATCH')}
                  >
                    Dispatch
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}