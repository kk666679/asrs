'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Route, MapPin, Clock, Fuel, TrendingUp } from 'lucide-react';

interface RoutePoint {
  id: string;
  name: string;
  coordinates: { x: number; y: number };
  priority: number;
}

interface OptimizedRoute {
  routes: any[];
  totalDistance: number;
  estimatedTime: number;
  fuelCost: number;
  efficiency: number;
}

export default function RouteOptimizer() {
  const [origin] = useState<RoutePoint>({
    id: 'origin',
    name: 'Distribution Center',
    coordinates: { x: 0, y: 0 },
    priority: 1
  });

  const [destinations] = useState<RoutePoint[]>([
    { id: '1', name: 'Warehouse A', coordinates: { x: 10, y: 15 }, priority: 3 },
    { id: '2', name: 'Warehouse B', coordinates: { x: 25, y: 8 }, priority: 2 },
    { id: '3', name: 'Warehouse C', coordinates: { x: 18, y: 22 }, priority: 1 },
    { id: '4', name: 'Warehouse D', coordinates: { x: 5, y: 30 }, priority: 2 }
  ]);

  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(false);

  const optimizeRoute = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/logistics/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destinations,
          constraints: {
            maxDistance: 100,
            timeWindow: { start: '08:00', end: '18:00' }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOptimizedRoute(data);
      }
    } catch (error) {
      console.error('Route optimization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-500';
      case 2: return 'bg-yellow-500';
      case 1: return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-purple-400" />
          AI Route Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Destinations ({destinations.length})</h4>
          <div className="space-y-1">
            {destinations.map((dest) => (
              <div key={dest.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(dest.priority)}`} />
                  <span>{dest.name}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Priority {dest.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={optimizeRoute} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Optimizing...' : 'Optimize Route'}
        </Button>

        {optimizedRoute && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-effect p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Distance</span>
                </div>
                <p className="text-lg font-bold">{optimizedRoute.totalDistance} km</p>
              </div>

              <div className="glass-effect p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="text-lg font-bold">{optimizedRoute.estimatedTime} min</p>
              </div>

              <div className="glass-effect p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Fuel className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">Fuel Cost</span>
                </div>
                <p className="text-lg font-bold">${optimizedRoute.fuelCost}</p>
              </div>

              <div className="glass-effect p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">Efficiency</span>
                </div>
                <p className="text-lg font-bold">{optimizedRoute.efficiency}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Optimized Route</h4>
              <div className="space-y-1">
                {optimizedRoute.routes.map((route, index) => (
                  <div key={index} className="flex items-center justify-between text-sm p-2 glass-effect rounded">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <span>{route.from.name} → {route.to.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {route.distance.toFixed(1)} km • {route.estimatedTime} min
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}