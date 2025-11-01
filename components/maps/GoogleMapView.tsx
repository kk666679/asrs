'use client';

import React, { useEffect, useState, useRef } from 'react';
import { DEFAULT_MAP_CENTER, MAP_STYLES } from '@/lib/constants';

interface GoogleMapViewProps {
  width?: string;
  height?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  zoomControl?: boolean;
  scaleControl?: boolean;
  fullscreenControl?: boolean;
  disableDefaultUI?: boolean;
  gestureHandling?: boolean;
  onDragStart?: () => void;
  onDragEnd?: (lat: number, lng: number) => void;
  showMyLocationButton?: boolean;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    info?: string;
  }>;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  width = '100%',
  height = '400px',
  lat = DEFAULT_MAP_CENTER.lat,
  lng = DEFAULT_MAP_CENTER.lng,
  zoom = 10,
  zoomControl = true,
  scaleControl = false,
  fullscreenControl = false,
  disableDefaultUI = false,
  gestureHandling = true,
  onDragStart = () => {},
  onDragEnd = () => {},
  showMyLocationButton = false,
  markers = []
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  const options = {
    center: { lat, lng },
    zoom,
    disableDefaultUI,
    zoomControl,
    scaleControl,
    fullscreenControl,
    gestureHandling: gestureHandling ? 'greedy' : 'none',
    clickableIcons: false,
    clickableLabels: false,
    styles: MAP_STYLES,
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, options);
      
      // Get current location
      if (navigator.geolocation && showMyLocationButton) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(location);
            if (!lat || !lng) {
              newMap.setCenter(location);
              onDragEnd(location.lat, location.lng);
            }
          },
          () => {}
        );
      }

      // Add drag listeners
      const dragStartListener = newMap.addListener('dragstart', () => {
        setIsDragging(true);
        onDragStart();
      });

      const dragEndListener = newMap.addListener('dragend', () => {
        setIsDragging(false);
        const center = newMap.getCenter();
        onDragEnd(center.lat(), center.lng());
      });

      setMap(newMap);

      return () => {
        if (window.google) {
          window.google.maps.event.removeListener(dragStartListener);
          window.google.maps.event.removeListener(dragEndListener);
        }
      };
    }
  }, []);

  // Update map center when lat/lng props change
  useEffect(() => {
    if (map && lat && lng) {
      map.setCenter({ lat, lng });
    }
  }, [map, lat, lng]);

  // Add markers
  useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach((marker) => {
        const mapMarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: map,
          title: marker.title || '',
        });

        if (marker.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: marker.info,
          });

          mapMarker.addListener('click', () => {
            infoWindow.open(map, mapMarker);
          });
        }
      });
    }
  }, [map, markers]);

  const handleMyLocationClick = () => {
    if (currentLocation && map) {
      map.setCenter(currentLocation);
      onDragEnd(currentLocation.lat, currentLocation.lng);
    }
  };

  return (
    <div style={{ width, height }} className="relative">
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        className="rounded-lg"
      />
      
      {/* Center marker */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform ${
        isDragging ? '-translate-y-6' : '-translate-y-4'
      }`}>
        <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
      </div>

      {/* My location button */}
      {showMyLocationButton && currentLocation && (
        <button
          onClick={handleMyLocationClick}
          className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default GoogleMapView;