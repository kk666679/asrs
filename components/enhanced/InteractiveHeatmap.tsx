'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Thermometer, Activity, AlertTriangle } from 'lucide-react';

interface HeatmapData {
  x: number;
  y: number;
  value: number;
  zone: string;
  status: 'normal' | 'warning' | 'critical';
  activity: number;
}

export default function InteractiveHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedZone, setSelectedZone] = useState<HeatmapData | null>(null);

  useEffect(() => {
    const generateData = () => {
      const data: HeatmapData[] = [];
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 6; y++) {
          const value = Math.random() * 100;
          const activity = Math.random() * 50;
          data.push({
            x,
            y,
            value,
            zone: `Zone-${x}-${y}`,
            status: value > 80 ? 'critical' : value > 60 ? 'warning' : 'normal',
            activity
          });
        }
      }
      return data;
    };

    setHeatmapData(generateData());
    
    const interval = setInterval(() => {
      setHeatmapData(generateData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHeatColor = (value: number) => {
    if (value > 80) return 'bg-red-500/80 border-red-400';
    if (value > 60) return 'bg-yellow-500/80 border-yellow-400';
    if (value > 40) return 'bg-blue-500/80 border-blue-400';
    return 'bg-green-500/80 border-green-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-3 w-3 text-red-400" />;
      case 'warning': return <Thermometer className="h-3 w-3 text-yellow-400" />;
      default: return <Activity className="h-3 w-3 text-green-400" />;
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-glow flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-blue-400" />
          Warehouse Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-10 gap-1 p-4 bg-background/50 rounded-lg">
            <TooltipProvider>
              {heatmapData.map((cell, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={`aspect-square rounded cursor-pointer transition-all duration-300 hover:scale-110 border ${getHeatColor(cell.value)}`}
                      onClick={() => setSelectedZone(cell)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{cell.zone}</p>
                      <p className="text-sm">Activity: {cell.value.toFixed(1)}%</p>
                      <p className="text-sm">Utilization: {cell.activity.toFixed(1)}%</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          {selectedZone && (
            <div className="glass-effect p-4 rounded-lg border border-electricBlue/30">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">{selectedZone.zone}</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedZone.status)}
                  <Badge variant="outline" className="capitalize">
                    {selectedZone.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Activity Level:</span>
                  <div className="font-medium text-foreground">{selectedZone.value.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Utilization:</span>
                  <div className="font-medium text-foreground">{selectedZone.activity.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/80 rounded"></div>
                <span>Low (0-40%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500/80 rounded"></div>
                <span>Medium (40-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500/80 rounded"></div>
                <span>High (60-80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/80 rounded"></div>
                <span>Critical (80%+)</span>
              </div>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              <Activity className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}