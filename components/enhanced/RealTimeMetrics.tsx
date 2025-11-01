'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';


interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
}

export default function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: '1', label: 'Throughput', value: 1247, unit: 'items/hr', trend: 'up', change: 12.5, status: 'good' },
    { id: '2', label: 'Efficiency', value: 94.2, unit: '%', trend: 'up', change: 2.1, status: 'good' },
    { id: '3', label: 'Error Rate', value: 0.02, unit: '%', trend: 'down', change: -15.3, status: 'good' },
    { id: '4', label: 'Response Time', value: 45, unit: 'ms', trend: 'stable', change: 0.5, status: 'good' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * (metric.value * 0.02),
        change: (Math.random() - 0.5) * 20
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 border-green-500/30';
      case 'warning': return 'text-yellow-400 border-yellow-500/30';
      case 'critical': return 'text-red-400 border-red-500/30';
      default: return 'text-blue-400 border-blue-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-400" />;
      default: return <Activity className="h-3 w-3 text-blue-400" />;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {


        return (
          <Card key={metric.id} className="glass-effect hover-glow transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="text-muted-foreground">{metric.label}</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-400 animate-pulse" />
                  {getTrendIcon(metric.trend)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold gradient-text">
                  {metric.unit === '%' ? metric.value.toFixed(1) : Math.round(metric.value)}
                  <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(metric.status)}`}
                >
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}