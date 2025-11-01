'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Package, MapPin, Clock, Truck, Search } from 'lucide-react';
import GoogleMapView from '@/components/maps/GoogleMapView';

interface TrackingEvent {
  status: string;
  timestamp: Date;
  location: string;
  description: string;
}

interface TrackingData {
  shipment: any;
  trackingEvents: TrackingEvent[];
  estimatedDelivery: Date;
  currentLocation: string;
  progress: number;
}

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackShipment = async () => {
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/logistics/tracking?trackingNumber=${trackingNumber}`);
      if (!response.ok) {
        throw new Error('Shipment not found');
      }
      const data = await response.json();
      setTrackingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track shipment');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'in_transit': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-400" />
          Real-time Shipment Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter tracking number..."
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && trackShipment()}
          />
          <Button onClick={trackShipment} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        {trackingData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{trackingData.shipment.shipmentNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  {trackingData.shipment.type} Shipment
                </p>
              </div>
              <Badge variant="outline">
                {trackingData.shipment.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{trackingData.progress}%</span>
              </div>
              <Progress value={trackingData.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="font-medium">Current Location</p>
                  <p className="text-muted-foreground">{trackingData.currentLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-400" />
                <div>
                  <p className="font-medium">Est. Delivery</p>
                  <p className="text-muted-foreground">
                    {new Date(trackingData.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Map View */}
            <div className="space-y-2">
              <h4 className="font-medium">Live Location</h4>
              <GoogleMapView
                lat={37.7749 + Math.random() * 0.01}
                lng={-122.4194 + Math.random() * 0.01}
                zoom={12}
                height="200px"
                markers={[
                  {
                    lat: 37.7749 + Math.random() * 0.01,
                    lng: -122.4194 + Math.random() * 0.01,
                    title: trackingData.shipment.shipmentNumber,
                    info: `<div><strong>${trackingData.shipment.shipmentNumber}</strong><br/>Status: ${trackingData.shipment.status}</div>`
                  }
                ]}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Tracking History</h4>
              {trackingData.trackingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)} mt-1`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{event.description}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}