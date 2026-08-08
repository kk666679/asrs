import dynamic from 'next/dynamic';
import React from 'react';

const FleetLocationMapClient = dynamic(() => import('./FleetLocationMap.client'), { ssr: false });

type Props = {
  geoJson?: any;
  points?: Array<{ id: string; name?: string; lat: number; lng: number; status?: string }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
};

const FleetLocationMap: React.FC<Props> = (props) => {
  return <FleetLocationMapClient {...props} />;
};

export default FleetLocationMap;

