'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Bin {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'empty' | 'occupied' | 'reserved' | 'maintenance';
  occupancy: number;
  zone: string;
  items?: Array<{
    sku: string;
    name: string;
    quantity: number;
  }>;
}

interface Robot {
  id: string;
  x: number;
  y: number;
  status: 'idle' | 'moving' | 'working' | 'charging';
  batteryLevel: number;
}

interface WarehouseMapProps {
  bins?: Bin[];
  robots?: Robot[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showZones?: boolean;
}

const defaultBins: Bin[] = [
  { id: 'A-01-01', x: 50, y: 50, width: 40, height: 30, status: 'occupied', occupancy: 85, zone: 'A' },
  { id: 'A-01-02', x: 100, y: 50, width: 40, height: 30, status: 'occupied', occupancy: 60, zone: 'A' },
  { id: 'A-01-03', x: 150, y: 50, width: 40, height: 30, status: 'empty', occupancy: 0, zone: 'A' },
  { id: 'B-01-01', x: 50, y: 120, width: 40, height: 30, status: 'reserved', occupancy: 0, zone: 'B' },
  { id: 'B-01-02', x: 100, y: 120, width: 40, height: 30, status: 'occupied', occupancy: 95, zone: 'B' },
  { id: 'B-01-03', x: 150, y: 120, width: 40, height: 30, status: 'maintenance', occupancy: 0, zone: 'B' },
];

const defaultRobots: Robot[] = [
  { id: 'R-001', x: 220, y: 80, status: 'moving', batteryLevel: 85 },
  { id: 'R-002', x: 280, y: 140, status: 'working', batteryLevel: 92 },
];

export default function WarehouseMap({
  bins = defaultBins,
  robots = defaultRobots,
  width = 400,
  height = 300,
  showGrid = true,
  showZones = true
}: WarehouseMapProps) {
  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const getBinColor = (status: string, occupancy: number) => {
    switch (status) {
      case 'empty': return '#e5e7eb';
      case 'occupied': 
        if (occupancy > 80) return '#ef4444';
        if (occupancy > 50) return '#f59e0b';
        return '#10b981';
      case 'reserved': return '#3b82f6';
      case 'maintenance': return '#6b7280';
      default: return '#e5e7eb';
    }
  };

  const getRobotColor = (status: string) => {
    switch (status) {
      case 'idle': return '#6b7280';
      case 'moving': return '#3b82f6';
      case 'working': return '#10b981';
      case 'charging': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getZoneColor = (zone: string) => {
    const colors = {
      'A': 'rgba(59, 130, 246, 0.1)',
      'B': 'rgba(16, 185, 129, 0.1)',
      'C': 'rgba(245, 158, 11, 0.1)',
    };
    return colors[zone as keyof typeof colors] || 'rgba(107, 114, 128, 0.1)';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Warehouse Layout</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(zoom / 1.2, 0.5))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Map */}
          <div className="flex-1">
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <svg
                width={width}
                height={height}
                viewBox={`${-pan.x} ${-pan.y} ${width / zoom} ${height / zoom}`}
                className="cursor-move"
              >
                {/* Grid */}
                {showGrid && (
                  <defs>
                    <pattern
                      id="grid"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                )}
                {showGrid && (
                  <rect width="100%" height="100%" fill="url(#grid)" />
                )}

                {/* Zone backgrounds */}
                {showZones && (
                  <>
                    <rect x="30" y="30" width="180" height="70" fill={getZoneColor('A')} rx="5" />
                    <rect x="30" y="110" width="180" height="70" fill={getZoneColor('B')} rx="5" />
                    <text x="35" y="45" className="text-xs font-medium fill-gray-600">Zone A</text>
                    <text x="35" y="125" className="text-xs font-medium fill-gray-600">Zone B</text>
                  </>
                )}

                {/* Bins */}
                {bins.map((bin) => (
                  <g key={bin.id}>
                    <rect
                      x={bin.x}
                      y={bin.y}
                      width={bin.width}
                      height={bin.height}
                      fill={getBinColor(bin.status, bin.occupancy)}
                      stroke="#374151"
                      strokeWidth="1"
                      rx="2"
                      className="cursor-pointer hover:stroke-2"
                      onClick={() => setSelectedBin(bin)}
                    />
                    <text
                      x={bin.x + bin.width / 2}
                      y={bin.y + bin.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-medium fill-gray-800 pointer-events-none"
                    >
                      {bin.id}
                    </text>
                    {bin.occupancy > 0 && (
                      <text
                        x={bin.x + bin.width / 2}
                        y={bin.y + bin.height / 2 + 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-600 pointer-events-none"
                      >
                        {bin.occupancy}%
                      </text>
                    )}
                  </g>
                ))}

                {/* Robots */}
                {robots.map((robot) => (
                  <g key={robot.id}>
                    <circle
                      cx={robot.x}
                      cy={robot.y}
                      r="8"
                      fill={getRobotColor(robot.status)}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={robot.x}
                      y={robot.y + 20}
                      textAnchor="middle"
                      className="text-xs font-medium fill-gray-800"
                    >
                      {robot.id}
                    </text>
                  </g>
                ))}

                {/* Aisles */}
                <line x1="30" y1="100" x2="210" y2="100" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="220" y1="30" x2="220" y2="180" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Full</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-500 rounded"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          {/* Bin Details */}
          {selectedBin && (
            <div className="w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedBin.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={selectedBin.status === 'occupied' ? 'default' : 'secondary'}>
                      {selectedBin.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Occupancy:</span>
                    <span className="font-medium">{selectedBin.occupancy}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Zone:</span>
                    <span className="font-medium">{selectedBin.zone}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${selectedBin.occupancy}%` }}
                    ></div>
                  </div>
                  {selectedBin.items && selectedBin.items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Items:</h4>
                      <div className="space-y-1">
                        {selectedBin.items.map((item, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {item.sku}: {item.name} (Qty: {item.quantity})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}