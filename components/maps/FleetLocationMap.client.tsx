"use client";

import React from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Point {
  id: string;
  name?: string;
  lat: number;
  lng: number;
  status?: string;
}

interface FleetLocationMapProps {
  geoJson?: any;
  points?: Point[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
}

const FleetLocationMapClient: React.FC<FleetLocationMapProps> = ({ geoJson, points = [], center, zoom = 10, height = '500px' }) => {
  const mapCenter = center ?? (points.length > 0 ? { lat: points[0].lat, lng: points[0].lng } : { lat: 0, lng: 0 });
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // Defer readiness to the next tick to avoid Leaflet double-initialization
    // during React StrictMode/HMR in development.
    const t = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const renderPoints = () => (
    points.map(p => (
      <CircleMarker
        key={p.id}
        center={[p.lat, p.lng]}
        pathOptions={{ color: '#1e90ff', fillColor: '#1e90ff', fillOpacity: 0.8 }}
        radius={8}
      >
        <Popup>
          <div>
            <div className="font-medium">{p.name ?? 'Vehicle'}</div>
            {p.status && <div className="text-sm text-gray-600">{p.status}</div>}
          </div>
        </Popup>
      </CircleMarker>
    ))
  );

  const mapKey = `${mapCenter.lat}-${mapCenter.lng}-${points.length}-${zoom}`;

  return (
    <div style={{ height }}>
      {ready && (
        <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoJson && <GeoJSON data={geoJson} />}
          {points.length > 0 && renderPoints()}
        </MapContainer>
      )}
    </div>
  );
};

export default FleetLocationMapClient;
