'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Battery, 
  Wrench,
  Pause,
  Play,
  Loader2
} from 'lucide-react';

export type StatusType = 
  | 'online' | 'offline' | 'maintenance' | 'charging' | 'error' 
  | 'active' | 'inactive' | 'pending' | 'completed' | 'failed'
  | 'moving' | 'idle' | 'loading' | 'unloading' | 'paused'
  | 'low' | 'medium' | 'high' | 'critical'
  | 'success' | 'warning' | 'danger' | 'info';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
  icon?: React.ReactNode;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // Equipment/Robot Status
  online: {
    label: 'Online',
    variant: 'default',
    className: 'bg-green-500 text-white hover:bg-green-600',
    icon: <CheckCircle className="h-3 w-3" />
  },
  offline: {
    label: 'Offline',
    variant: 'secondary',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
    icon: <XCircle className="h-3 w-3" />
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'outline',
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
    icon: <Wrench className="h-3 w-3" />
  },
  charging: {
    label: 'Charging',
    variant: 'outline',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
    icon: <Battery className="h-3 w-3" />
  },
  error: {
    label: 'Error',
    variant: 'destructive',
    className: 'bg-red-500 text-white hover:bg-red-600',
    icon: <AlertTriangle className="h-3 w-3" />
  },

  // General Status
  active: {
    label: 'Active',
    variant: 'default',
    className: 'bg-green-500 text-white hover:bg-green-600',
    icon: <Play className="h-3 w-3" />
  },
  inactive: {
    label: 'Inactive',
    variant: 'secondary',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
    icon: <Pause className="h-3 w-3" />
  },
  pending: {
    label: 'Pending',
    variant: 'outline',
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
    icon: <Clock className="h-3 w-3" />
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    className: 'bg-green-500 text-white hover:bg-green-600',
    icon: <CheckCircle className="h-3 w-3" />
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
    className: 'bg-red-500 text-white hover:bg-red-600',
    icon: <XCircle className="h-3 w-3" />
  },

  // Movement Status
  moving: {
    label: 'Moving',
    variant: 'default',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
    icon: <Zap className="h-3 w-3" />
  },
  idle: {
    label: 'Idle',
    variant: 'secondary',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
    icon: <Pause className="h-3 w-3" />
  },
  loading: {
    label: 'Loading',
    variant: 'outline',
    className: 'bg-orange-500 text-white hover:bg-orange-600',
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  unloading: {
    label: 'Unloading',
    variant: 'outline',
    className: 'bg-purple-500 text-white hover:bg-purple-600',
    icon: <Loader2 className="h-3 w-3 animate-spin" />
  },
  paused: {
    label: 'Paused',
    variant: 'outline',
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
    icon: <Pause className="h-3 w-3" />
  },

  // Priority/Severity Status
  low: {
    label: 'Low',
    variant: 'outline',
    className: 'bg-green-100 text-green-800 border-green-300',
    icon: undefined
  },
  medium: {
    label: 'Medium',
    variant: 'outline',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: undefined
  },
  high: {
    label: 'High',
    variant: 'outline',
    className: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: undefined
  },
  critical: {
    label: 'Critical',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 border-red-300',
    icon: <AlertTriangle className="h-3 w-3" />
  },

  // Semantic Status
  success: {
    label: 'Success',
    variant: 'default',
    className: 'bg-green-500 text-white hover:bg-green-600',
    icon: <CheckCircle className="h-3 w-3" />
  },
  warning: {
    label: 'Warning',
    variant: 'outline',
    className: 'bg-yellow-500 text-white hover:bg-yellow-600',
    icon: <AlertTriangle className="h-3 w-3" />
  },
  danger: {
    label: 'Danger',
    variant: 'destructive',
    className: 'bg-red-500 text-white hover:bg-red-600',
    icon: <XCircle className="h-3 w-3" />
  },
  info: {
    label: 'Info',
    variant: 'outline',
    className: 'bg-blue-500 text-white hover:bg-blue-600',
    icon: undefined
  }
};

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export function StatusBadge({
  status,
  customLabel,
  showIcon = true,
  size = 'md',
  className,
  pulse = false,
}: StatusBadgeProps) {
  const config = statusConfigs[status];
  
  if (!config) {
    console.warn(`Unknown status type: ${status}`);
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        sizeClasses[size],
        pulse && 'animate-pulse',
        'inline-flex items-center gap-1',
        className
      )}
    >
      {showIcon && config.icon}
      {customLabel || config.label}
    </Badge>
  );
}

// Utility function to get status color for charts/indicators
export function getStatusColor(status: StatusType): string {
  const colorMap: Record<StatusType, string> = {
    online: '#10b981',
    offline: '#6b7280',
    maintenance: '#f59e0b',
    charging: '#3b82f6',
    error: '#ef4444',
    active: '#10b981',
    inactive: '#6b7280',
    pending: '#f59e0b',
    completed: '#10b981',
    failed: '#ef4444',
    moving: '#3b82f6',
    idle: '#6b7280',
    loading: '#f97316',
    unloading: '#8b5cf6',
    paused: '#f59e0b',
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  };
  
  return colorMap[status] || '#6b7280';
}