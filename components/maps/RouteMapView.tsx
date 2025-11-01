'use client';

import React, { useState, useEffect } from 'react';
import GoogleMapView from './GoogleMapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Route, MapPin, Clock, Fuel } from 'lucide-react';

interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  priority: number;
  estimatedTime?: number;
}

interface RouteMapViewProps {
  origin: RoutePoint;
  destinations: RoutePoint[];
  optimizedRoute?: RoutePoint[];
  onOptimizeRoute?: () => void;
}

const RouteMapView: React.FC<RouteMapViewProps> = ({
  origin,
  destinations,
  optimizedRoute,
  onOptimizeRoute
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: origin.lat, lng: origin.lng });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#EF4444'; // High - Red
      case 2: return '#F59E0B'; // Medium - Yellow
      case 1: return '#10B981'; // Low - Green
      default: return '#6B7280'; // Default - Gray
    }
  };

  const allPoints = [origin, ...destinations];
  const markers = allPoints.map((point, index) => ({
    lat: point.lat,
    lng: point.lng,
    title: point.name,
    info: `
      <div class="p-2">
        <h3 class="font-bold">${point.name}</h3>
        <p>Priority: ${point.priority}</p>
        ${point.estimatedTime ? `<p>ETA: ${point.estimatedTime} min</p>` : ''}
        ${index === 0 ? '<p class="text-blue-600">Origin</p>' : ''}
      </div>
    `
  }));

  useEffect(() => {
    if (allPoints.length > 0) {
      const avgLat = allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
      const avgLng = allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [allPoints]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Planning Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMapView
              lat={mapCenter.lat}
              lng={mapCenter.lng}
              zoom={10}
              height="500px"
              markers={markers}
              zoomControl={true}
              fullscreenControl={true}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Origin */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{origin.name}</span>
                  <Badge variant="outline" className="text-xs">Origin</Badge>
                </div>
              </div>

              {/* Destinations */}
              {destinations.map((dest, index) => (
                <div key={dest.id} className="p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPriorityColor(dest.priority) }}
                      ></div>
                      <span className="font-medium">{dest.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Priority {dest.priority}
                    </Badge>
                  </div>
                  {dest.estimatedTime && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{dest.estimatedTime} min</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button 
              onClick={onOptimizeRoute}
              className="w-full mt-4"
              disabled={destinations.length === 0}
            >
              <Route className="h-4 w-4 mr-2" />
              Optimize Route
            </Button>
          </CardContent>
        </Card>

        {optimizedRoute && optimizedRoute.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Optimized Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {optimizedRoute.map((point, index) => (
                  <div key={`${point.id}-${index}`} className="flex items-center gap-2 text-sm">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    <span>{point.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RouteMapView;