import React from 'react';
import { Plus, Battery, MapPin, AlertTriangle, Wrench, Zap } from 'lucide-react';
import { AMR } from '../page';

interface FleetGridProps {
  amrs: AMR[];
  onAdd: () => void;
}

export default function FleetGrid({ amrs, onAdd }: FleetGridProps) {
  const getStatusIcon = (status: AMR['status']) => {
    switch (status) {
      case 'moving':
        return <Zap className="h-4 w-4 text-green-600" />;
      case 'charging':
        return <Battery className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-yellow-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AMR['status']) => {
    switch (status) {
      case 'moving':
        return 'bg-green-100 text-green-800';
      case 'charging':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-purple-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-700 font-semibold">AMR Fleet</h3>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-purple-600 text-white rounded flex items-center gap-2 text-sm"
          aria-label="Add new AMR"
        >
          <Plus size={14} />
          Add AMR
        </button>
      </div>
      <div className="grid gap-3">
        {amrs.map((amr) => (
          <div key={amr.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(amr.status)}
              <div>
                <p className="font-medium text-gray-900">{amr.name}</p>
                <p className="text-sm text-gray-600">{amr.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(amr.status)}`}>
                {amr.status}
              </div>
              <p className="text-sm text-gray-600 mt-1">{amr.battery}% battery</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
