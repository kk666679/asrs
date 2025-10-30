import React from 'react';
import { AMR } from '../page';

interface WarehouseMapProps {
  amrs: AMR[];
}

export default function WarehouseMap({ amrs }: WarehouseMapProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-orange-500">
      <h3 className="text-slate-700 font-semibold mb-4">Warehouse Map</h3>
      <div className="relative bg-gray-50 rounded-lg h-64 overflow-hidden">
        {/* Simple grid representation */}
        <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 gap-1 p-2">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-sm"></div>
          ))}
        </div>

        {/* AMR positions */}
        {amrs.map((amr) => (
          <div
            key={amr.id}
            className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg ${
              amr.status === 'moving' ? 'bg-green-500' :
              amr.status === 'charging' ? 'bg-blue-500' :
              amr.status === 'error' ? 'bg-red-500' :
              amr.status === 'maintenance' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`}
            style={{
              left: amr.x ? `${(amr.x / 900) * 100}%` : '50%',
              top: amr.y ? `${(amr.y / 600) * 100}%` : '50%',
            }}
            title={`${amr.name} - ${amr.status}`}
          />
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded text-xs">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Moving</span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Charging</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Error</span>
          </div>
        </div>
      </div>
    </div>
  );
}
