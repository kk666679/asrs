"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid3X3, ZoomIn, ZoomOut, RotateCcw, Package } from "lucide-react";

interface RackingMapProps {
  racks: Array<{
    id: string;
    code: string;
    level: number;
    utilization: number;
    capacity: number;
    occupied: number;
    status: string;
    position?: { row: number; column: number };
  }>;
  bins: Array<{
    id: string;
    code: string;
    utilization: number;
    capacity: number;
    occupied: number;
    status: string;
    rackId: string;
    position?: { row: number; column: number; level: number };
  }>;
  onBinClick?: (bin: any) => void;
}

export default function RackingMap({ racks, bins, onBinClick }: RackingMapProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);

  const getBinColor = (utilization: number, status: string) => {
    if (status !== 'ACTIVE') return 'bg-gray-300';
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    if (utilization >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const displayBins = selectedRack 
    ? bins.filter(bin => bin.rackId === selectedRack)
    : bins;

  const maxRow = Math.max(...displayBins.map(bin => bin.position?.row || 1));
  const maxColumn = Math.max(...displayBins.map(bin => bin.position?.column || 1));
  const maxLevel = Math.max(...displayBins.map(bin => bin.position?.level || 1));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            ASRS Racking Layout
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedRack || 'all'} onValueChange={(value) => setSelectedRack(value === 'all' ? null : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Racks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Racks</SelectItem>
                {racks.map(rack => (
                  <SelectItem key={rack.id} value={rack.id}>
                    {rack.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button variant="ghost" size="sm" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoom(1)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs">Low (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs">Medium (50-70%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs">High (70-90%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs">Critical (&gt;90%)</span>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
          {Array.from({ length: maxLevel }, (_, levelIndex) => {
            const level = maxLevel - levelIndex;
            const levelBins = displayBins.filter(bin => bin.position?.level === level);
            
            return (
              <div key={level} className="mb-6">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Level {level}
                </h4>
                <div
                  className="grid gap-1 p-4 bg-white rounded-lg border"
                  style={{
                    gridTemplateColumns: `repeat(${maxColumn}, minmax(0, 1fr))`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left'
                  }}
                >
                  {Array.from({ length: maxRow * maxColumn }).map((_, index) => {
                    const row = Math.floor(index / maxColumn) + 1;
                    const column = (index % maxColumn) + 1;
                    const bin = levelBins.find(b =>
                      b.position?.row === row && b.position?.column === column
                    );

                    return (
                      <div
                        key={`${level}-${row}-${column}`}
                        className={`
                          aspect-square border rounded cursor-pointer transition-all duration-200
                          ${bin
                            ? `${getBinColor(bin.utilization, bin.status)} text-white font-medium text-xs flex items-center justify-center hover:opacity-80`
                            : 'bg-gray-100 border-dashed'
                          }
                        `}
                        title={bin ? `${bin.code} - ${bin.utilization}% utilized` : `Empty - L${level}R${row}C${column}`}
                        onClick={() => bin && onBinClick?.(bin)}
                      >
                        {bin && (
                          <div className="text-center p-1">
                            <div className="font-bold text-xs">{bin.code.split('-').pop()}</div>
                            <div className="text-xs opacity-90">{bin.utilization}%</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {displayBins.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No bins found for the selected rack
          </div>
        )}
      </CardContent>
    </Card>
  );
}