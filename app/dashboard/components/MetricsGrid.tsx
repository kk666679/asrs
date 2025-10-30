import React from 'react';
import { Bot, Battery, Zap, CheckCircle } from 'lucide-react';

interface Metrics {
  total: number;
  active: number;
  avgBattery: number;
  tasksToday: number;
}

interface MetricsGridProps {
  metrics: Metrics;
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricItems = [
    {
      label: 'Total AMRs',
      value: metrics.total,
      icon: Bot,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Active AMRs',
      value: metrics.active,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Avg Battery',
      value: `${metrics.avgBattery}%`,
      icon: Battery,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Tasks Today',
      value: metrics.tasksToday,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {metricItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-600">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
