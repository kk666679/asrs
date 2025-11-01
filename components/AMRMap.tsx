"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, MapPin, Battery, Zap } from "lucide-react";

interface AMRMapProps {
  amrs: Array<{
    id: string;
    name: string;
    x?: number;
    y?: number;
    status: string;
    battery: number;
    type: string;
  }>;
}

export default function AMRMap({ amrs }: AMRMapProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'moving': return 'bg-green-500';
      case 'charging': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'loading': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Warehouse Map - Live AMR Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden">{amrs.map(amr => amr.status).join(' ')}</div>
        <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
          {/* Warehouse Layout */}
          <div className="absolute inset-0">
            {/* Storage Areas */}
            <div className="absolute top-4 left-4 w-32 h-20 bg-blue-200 rounded border-2 border-blue-400 flex items-center justify-center text-xs font-medium">
              Storage A
            </div>
            <div className="absolute top-4 right-4 w-32 h-20 bg-blue-200 rounded border-2 border-blue-400 flex items-center justify-center text-xs font-medium">
              Storage B
            </div>
            
            {/* Loading Docks */}
            <div className="absolute bottom-4 left-4 w-40 h-16 bg-green-200 rounded border-2 border-green-400 flex items-center justify-center text-xs font-medium">
              Loading Dock A
            </div>
            <div className="absolute bottom-4 right-4 w-40 h-16 bg-green-200 rounded border-2 border-green-400 flex items-center justify-center text-xs font-medium">
              Loading Dock B
            </div>
            
            {/* Charging Stations */}
            <div className="absolute top-1/2 left-4 w-24 h-12 bg-yellow-200 rounded border-2 border-yellow-400 flex items-center justify-center text-xs font-medium transform -translate-y-1/2">
              <Zap className="h-3 w-3 mr-1" />
              Charging
            </div>
            
            {/* Sorting Zone */}
            <div className="absolute top-1/2 left-1/2 w-32 h-24 bg-purple-200 rounded border-2 border-purple-400 flex items-center justify-center text-xs font-medium transform -translate-x-1/2 -translate-y-1/2">
              Sorting Zone
            </div>
          </div>

          {/* AMR Positions */}
          {amrs.map((amr) => (
            <div
              key={amr.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{
                left: `${amr.x || Math.random() * 80 + 10}%`,
                top: `${amr.y || Math.random() * 80 + 10}%`,
              }}
            >
              <div className={`w-6 h-6 rounded-full ${getStatusColor(amr.status)} border-2 border-white shadow-lg flex items-center justify-center`}>
                <Bot className="h-3 w-3 text-white" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <div className="font-medium">{amr.name}</div>
                <div className="flex items-center gap-1">
                  <Battery className="h-3 w-3" />
                  {amr.battery}%
                </div>
                <Badge className={`${getStatusColor(amr.status)} text-white text-xs mt-1`}>
                  {amr.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Moving</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Charging</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Error</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Loading</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
