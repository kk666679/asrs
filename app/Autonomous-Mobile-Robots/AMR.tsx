import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Battery,
  MapPin,
  AlertTriangle,
  Wrench,
  Zap,
  Bot,
  Home,
  Settings,
  BarChart3,
  Package,
  Truck,
  Clock,
  Play,
  CheckCircle,
  X
} from 'lucide-react';
export interface AMR {
  id: string;
  name: string;
  battery: number;
  speed: number;
  loadKg: number;
  location: string;
  status: "idle" | "moving" | "charging" | "error" | "maintenance";
  x?: number;
  y?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  amrId: string;
  location: string;
  startedAt?: string;
  status: "pending" | "in-progress" | "done";
}

type AMRType = AMR;

interface FleetGridProps {
  amrs: AMRType[];
  onAdd: () => void;
}

export function FleetGrid({ amrs, onAdd }: FleetGridProps) {
  const getStatusIcon = (status: AMRType['status']) => {
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

  const getStatusColor = (status: AMRType['status']) => {
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

interface HeaderProps {
  activeCount: number;
}

export function Header({ activeCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-sky-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AMR Fleet Control</h1>
            <p className="text-sm text-gray-600">{activeCount} AMRs Active</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Dashboard</p>
          <p className="text-xs text-gray-500">Real-time Monitoring</p>
        </div>
      </div>
    </header>
  );
}

interface Metrics {
  total: number;
  active: number;
  avgBattery: number;
  tasksToday: number;
}

interface MetricsGridProps {
  metrics: Metrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
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

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/robots', label: 'Robots', icon: Bot },
    { href: '/equipment', label: 'Equipment', icon: Package },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

interface TaskListProps {
  tasks: TaskItem[];
  onAdd: () => void;
}

export function TaskList({ tasks, onAdd }: TaskListProps) {
  const getStatusIcon = (status: TaskItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TaskItem['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-teal-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-700 font-semibold">Active Tasks</h3>
        <button
          onClick={onAdd}
          className="px-3 py-1 bg-teal-600 text-white rounded flex items-center gap-2 text-sm"
          aria-label="Add new task"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(task.status)}
              <div>
                <p className="font-medium text-gray-900">{task.title}</p>
                <p className="text-sm text-gray-600">{task.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </div>
              {task.startedAt && (
                <p className="text-sm text-gray-600 mt-1">Started: {task.startedAt}</p>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-gray-500 text-center py-4">No active tasks</p>
        )}
      </div>
    </div>
  );
}

interface WarehouseMapProps {
  amrs: AMRType[];
}

export function WarehouseMap({ amrs }: WarehouseMapProps) {
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
