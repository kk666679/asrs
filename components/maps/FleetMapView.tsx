'use client';

import React, { useState, useEffect } from 'react';
import GoogleMapView from './GoogleMapView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Navigation, Battery, Fuel } from 'lucide-react';

interface Vehicle {
  id: string;
  code: string;
  lat: number;
  lng: number;
  status: string;
  batteryLevel: number;
  fuelLevel: number;
  driver: string;
}

interface FleetMapViewProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle | null;
  onVehicleSelect?: (vehicle: Vehicle) => void;
}

const FleetMapView: React.FC<FleetMapViewProps> = ({
  vehicles = [],
  selectedVehicle,
  onVehicleSelect
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10B981';
      case 'IN_TRANSIT': return '#3B82F6';
      case 'LOADING': return '#F59E0B';
      case 'MAINTENANCE': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const markers = vehicles.map(vehicle => ({
    lat: vehicle.lat,
    lng: vehicle.lng,
    title: vehicle.code,
    info: `
      <div class="p-2">
        <h3 class="font-bold">${vehicle.code}</h3>
        <p>Status: ${vehicle.status}</p>
        <p>Driver: ${vehicle.driver}</p>
        <p>Battery: ${vehicle.batteryLevel}%</p>
        <p>Fuel: ${vehicle.fuelLevel}%</p>
      </div>
    `
  }));

  useEffect(() => {
    if (vehicles.length > 0) {
      const avgLat = vehicles.reduce((sum, v) => sum + v.lat, 0) / vehicles.length;
      const avgLng = vehicles.reduce((sum, v) => sum + v.lng, 0) / vehicles.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [vehicles]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Fleet Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMapView
              lat={mapCenter.lat}
              lng={mapCenter.lng}
              zoom={12}
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
              <Truck className="h-5 w-5" />
              Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedVehicle?.id === vehicle.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => onVehicleSelect?.(vehicle)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{vehicle.code}</span>
                    <Badge 
                      variant="outline" 
                      style={{ backgroundColor: getStatusColor(vehicle.status), color: 'white' }}
                    >
                      {vehicle.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Battery className="h-3 w-3" />
                      <span>{vehicle.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-3 w-3" />
                      <span>{vehicle.fuelLevel}%</span>
                    </div>
                    <div className="text-xs">
                      Driver: {vehicle.driver}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetMapView;