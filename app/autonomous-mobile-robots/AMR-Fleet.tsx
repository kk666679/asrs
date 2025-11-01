import React, { useEffect, useState, useCallback } from 'react';
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
  X,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Navigation,
  Route,
  Pause,
  StopCircle,
  Power,
  Signal,
  Thermometer,
  Gauge,
  Cpu,
  Wifi,
  WifiOff,
  Camera,
  Shield,
  Lock,
  Unlock,
  MessageSquare,
  Bell,
  Users,
  Database,
  Server,
  Cloud,
  HardDrive,
  ZoomOut,
  ZoomIn,
  Brain
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AMRMap from '@/components/AMRMap';

// Comprehensive Robot Categories for AMR Fleet Management
export interface FleetEntity {
  id: string;
  name: string;
  category: "physical_amr" | "workstation" | "payload" | "virtual_agent";
  type: string;
  status: string;
  location?: string;
  assignedAgent?: string;
  currentTask?: string;
  x?: number;
  y?: number;
  metadata: Record<string, any>;
}

// Category 1: Physical AMRs
export interface PhysicalAMR extends FleetEntity {
  category: "physical_amr";
  type: "transport" | "pallet_mover" | "goods_to_person" | "hybrid_shuttle" | "mobile_manipulator";
  status: "idle" | "moving" | "charging" | "error" | "maintenance" | "paused" | "executing";
  battery: number;
  speed: number;
  loadKg: number;
  currentLoad: number;
  rotation: number;
  model: string;
  firmware: string;
  signalStrength: number;
  temperature: number;
  tasksCompleted: number;
  assignedPayload?: string;
}

// Category 2: Workstation & Docking Resources
export interface WorkstationResource extends FleetEntity {
  category: "workstation";
  type: "pick_station" | "induction_station" | "charging_dock" | "output_lane" | "staging_area";
  status: "available" | "busy" | "offline" | "maintenance";
  capacity?: number;
  currentOperator?: string;
  queueLength?: number;
}

// Category 3: Task & Payload Resources
export interface PayloadResource extends FleetEntity {
  category: "payload";
  type: "inventory_pod" | "transport_tote" | "pallet" | "cart" | "container";
  status: "available" | "in_transit" | "at_station" | "stored" | "maintenance";
  contents?: string[];
  weight?: number;
  destination?: string;
}

// Category 4: Virtual Agents
export interface VirtualAgent extends FleetEntity {
  category: "virtual_agent";
  type: "scheduler" | "traffic_manager" | "battery_manager" | "data_logger" | "optimizer";
  status: "active" | "inactive" | "processing" | "error";
  capabilities: string[];
  queueLength: number;
  processedTasks: number;
  averageResponseTime: number;
}

// Legacy AMR interface for backward compatibility
export interface AMR {
  id: string;
  name: string;
  battery: number;
  speed: number;
  loadKg: number;
  currentLoad: number;
  location: string;
  status: "idle" | "moving" | "charging" | "error" | "maintenance" | "paused";
  x: number;
  y: number;
  rotation: number;
  type: "storage" | "transport" | "sorting" | "packing";
  model: string;
  firmware: string;
  lastMaintenance: string;
  nextMaintenance: string;
  totalDistance: number;
  operationalHours: number;
  signalStrength: number;
  temperature: number;
  errors: number;
  tasksCompleted: number;
}

export interface TaskItem {
  id: string;
  title: string;
  amrId: string;
  amrName?: string;
  location: string;
  targetX: number;
  targetY: number;
  startedAt?: string;
  completedAt?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "failed" | "cancelled";
  type: "pick" | "place" | "move" | "charge" | "inspect";
  estimatedDuration: number;
  progress?: number;
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: "storage" | "charging" | "workshop" | "transit" | "packing";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  capacity?: number;
  occupied?: number;
}

// Comprehensive Fleet Data
export const FLEET_ENTITIES: FleetEntity[] = [
  // Category 1: Physical AMRs
  { id: "AMR_Trans_001", name: "Transport Bot Alpha", category: "physical_amr", type: "transport", status: "moving", location: "Zone_A", assignedAgent: "Agent_Scheduler", currentTask: "T_4512", x: 150, y: 200, metadata: { battery: 85, speed: 1.2, model: "LocusBot_V2" } },
  { id: "AMR_Pallet_005", name: "Pallet Mover Beta", category: "physical_amr", type: "pallet_mover", status: "executing", location: "Dock_3", assignedAgent: "Agent_Traffic_Cop", currentTask: "T_4513", x: 300, y: 150, metadata: { battery: 72, speed: 0.8, model: "MiR1350" } },
  { id: "AMR_G2P_023", name: "Goods-to-Person Charlie", category: "physical_amr", type: "goods_to_person", status: "executing", location: "Grid_A05", assignedAgent: "Agent_Scheduler", currentTask: "T_4514", x: 450, y: 300, metadata: { battery: 82, assignedPayload: "POD_B7", model: "Geek+_P800" } },
  { id: "BOT_Skypod_Alpha", name: "Skypod Alpha", category: "physical_amr", type: "hybrid_shuttle", status: "moving", location: "Grid_B12", assignedAgent: "Agent_Scheduler", currentTask: "T_4515", x: 200, y: 400, metadata: { battery: 91, model: "Exotec_Skypod" } },
  { id: "AMR_Arms_001", name: "Mobile Manipulator Delta", category: "physical_amr", type: "mobile_manipulator", status: "idle", location: "Workshop_1", assignedAgent: "Agent_Scheduler", x: 100, y: 350, metadata: { battery: 67, model: "MiR+UR_Arm" } },
  
  // Category 2: Workstations & Docking Resources
  { id: "STATION_PickZone_A", name: "Pick Zone Alpha", category: "workstation", type: "pick_station", status: "busy", location: "Zone_A", assignedAgent: "Agent_Scheduler", metadata: { currentOperator: "OP_JSmith", queueLength: 3 } },
  { id: "STATION_Induct_01", name: "Induction Station 1", category: "workstation", type: "induction_station", status: "available", location: "Inbound_Area", assignedAgent: "Agent_Scheduler", metadata: { capacity: 50, queueLength: 0 } },
  { id: "DOCK_Charge_15", name: "Charging Dock 15", category: "workstation", type: "charging_dock", status: "busy", location: "Charging_Zone", assignedAgent: "Agent_Power_Manager", metadata: { capacity: 4, occupied: 2 } },
  { id: "LANE_Pack_01", name: "Packing Lane 1", category: "workstation", type: "output_lane", status: "available", location: "Outbound_Area", assignedAgent: "Agent_Scheduler", metadata: { throughput: 120 } },
  
  // Category 3: Task & Payload Resources
  { id: "POD_B7", name: "Inventory Pod B7", category: "payload", type: "inventory_pod", status: "in_transit", location: "Grid_A05", assignedAgent: "Agent_Scheduler", metadata: { contents: ["SKU_001", "SKU_045"], weight: 45.2, destination: "STATION_PickZone_A" } },
  { id: "TOTE_Blue_001", name: "Blue Tote 001", category: "payload", type: "transport_tote", status: "at_station", location: "STATION_PickZone_A", assignedAgent: "Agent_Scheduler", metadata: { contents: ["Order_12345"], weight: 2.1 } },
  { id: "PALLET_PLT_2034", name: "Pallet 2034", category: "payload", type: "pallet", status: "in_transit", location: "Dock_3", assignedAgent: "Agent_Traffic_Cop", metadata: { contents: ["Bulk_Items"], weight: 850.0, destination: "LANE_Shipping_1" } },
  
  // Category 4: Virtual Agents
  { id: "Agent_Scheduler", name: "Task Scheduler", category: "virtual_agent", type: "scheduler", status: "active", assignedAgent: "System", metadata: { capabilities: ["task_assignment", "priority_management"], queueLength: 12, processedTasks: 1547, averageResponseTime: 45 } },
  { id: "Agent_Traffic_Cop", name: "Traffic Manager", category: "virtual_agent", type: "traffic_manager", status: "active", assignedAgent: "System", metadata: { capabilities: ["path_planning", "collision_avoidance"], queueLength: 8, processedTasks: 892, averageResponseTime: 23 } },
  { id: "Agent_Power_Manager", name: "Battery Manager", category: "virtual_agent", type: "battery_manager", status: "active", assignedAgent: "System", metadata: { capabilities: ["battery_monitoring", "charge_scheduling"], queueLength: 2, processedTasks: 234, averageResponseTime: 12 } },
  { id: "Agent_Data_Logger", name: "Data Historian", category: "virtual_agent", type: "data_logger", status: "active", assignedAgent: "System", metadata: { capabilities: ["data_collection", "analytics"], queueLength: 0, processedTasks: 5623, averageResponseTime: 8 } }
];

interface FleetGridProps {
  amrs: AMR[];
  entities?: FleetEntity[];
  onAdd: () => void;
  onEdit: (amr: AMR) => void;
  onCommand: (amr: AMR, command: string) => void;
  onEntityClick?: (entity: FleetEntity) => void;
}

export function FleetGrid({ amrs, entities = FLEET_ENTITIES, onAdd, onEdit, onCommand, onEntityClick }: FleetGridProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"legacy" | "comprehensive">("comprehensive");

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || entity.category === filterCategory;
    const matchesStatus = filterStatus === "all" || entity.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredAMRs = amrs.filter(amr => {
    const matchesSearch = amr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amr.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || amr.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-600" />;
      default:
        return <MapPin className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: AMR['status']) => {
    switch (status) {
      case 'moving':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'charging':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paused':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 70) return 'text-green-600';
    if (level >= 40) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-yellow-600';
    if (strength >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical_amr': return <Bot className="h-4 w-4" />;
      case 'workstation': return <Home className="h-4 w-4" />;
      case 'payload': return <Package className="h-4 w-4" />;
      case 'virtual_agent': return <Brain className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'physical_amr': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workstation': return 'bg-green-100 text-green-800 border-green-200';
      case 'payload': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'virtual_agent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fleet Management System</h3>
          <p className="text-sm text-gray-600">Comprehensive view of all fleet entities and resources</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: "legacy" | "comprehensive") => setViewMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">All Entities</SelectItem>
              <SelectItem value="legacy">AMRs Only</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            aria-label="Add new entity"
          >
            <Plus size={16} />
            Add Entity
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={viewMode === "comprehensive" ? "Search entities by name or type..." : "Search AMRs by name or model..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {viewMode === "comprehensive" && (
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="physical_amr">Physical AMRs</SelectItem>
              <SelectItem value="workstation">Workstations</SelectItem>
              <SelectItem value="payload">Payloads</SelectItem>
              <SelectItem value="virtual_agent">Virtual Agents</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="moving">Moving</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="charging">Charging</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entity Grid */}
      <div className="grid gap-4">
        {viewMode === "comprehensive" ? (
          // Comprehensive Fleet View
          filteredEntities.map((entity) => (
            <div key={entity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onEntityClick?.(entity)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    {getCategoryIcon(entity.category)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{entity.name}</p>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(entity.category)}`}>
                        {entity.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{entity.type.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {entity.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entity.location}
                        </span>
                      )}
                      {entity.assignedAgent && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {entity.assignedAgent.replace('Agent_', '')}
                        </span>
                      )}
                      {entity.currentTask && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {entity.currentTask}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(entity.status as any)}`}>
                      {entity.status.replace('_', ' ')}
                    </div>
                    
                    {/* Category-specific metadata */}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {entity.category === 'physical_amr' && entity.metadata.battery && (
                        <div className={`flex items-center gap-1 ${getBatteryColor(entity.metadata.battery)}`}>
                          <Battery className="h-4 w-4" />
                          <span>{entity.metadata.battery}%</span>
                        </div>
                      )}
                      {entity.category === 'workstation' && entity.metadata.queueLength !== undefined && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Queue: {entity.metadata.queueLength}</span>
                        </div>
                      )}
                      {entity.category === 'payload' && entity.metadata.weight && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{entity.metadata.weight}kg</span>
                        </div>
                      )}
                      {entity.category === 'virtual_agent' && entity.metadata.averageResponseTime && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Cpu className="h-4 w-4" />
                          <span>{entity.metadata.averageResponseTime}ms</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Legacy AMR View
          filteredAMRs.map((amr) => (
          <div key={amr.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  {getStatusIcon(amr.status)}
                  <div className="absolute -top-1 -right-1">
                    <Wifi className={`h-3 w-3 ${getSignalColor(amr.signalStrength)}`} />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{amr.name}</p>
                    <Badge variant="outline" className="text-xs">{amr.model}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {amr.location}
                  </p>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(amr.status)}`}>
                    {amr.status}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className={`flex items-center gap-1 ${getBatteryColor(amr.battery)}`}>
                      <Battery className="h-4 w-4" />
                      <span>{amr.battery}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Package className="h-4 w-4" />
                      <span>{amr.currentLoad}/{amr.loadKg}kg</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Gauge className="h-4 w-4" />
                      <span>{amr.speed}m/s</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(amr)}
                  title="Edit AMR"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCommand(amr, 'pause')}
                  disabled={amr.status === 'charging' || amr.status === 'maintenance'}
                  title="Send Command"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onCommand(amr, 'go_to_charge')}>
                      <Battery className="h-4 w-4 mr-2" />
                      Send to Charge
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCommand(amr, 'emergency_stop')}>
                      <StopCircle className="h-4 w-4 mr-2" />
                      Emergency Stop
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCommand(amr, 'reboot')}>
                      <Power className="h-4 w-4 mr-2" />
                      Reboot
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Decommission
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-100 text-xs">
              <div className="text-center">
                <div className="text-gray-600">Tasks</div>
                <div className="font-semibold">{amr.tasksCompleted}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Distance</div>
                <div className="font-semibold">{amr.totalDistance}km</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Uptime</div>
                <div className="font-semibold">{Math.round(amr.operationalHours)}h</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Temp</div>
                <div className={`font-semibold ${amr.temperature > 60 ? 'text-red-600' : 'text-gray-900'}`}>
                  {amr.temperature}°C
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {(viewMode === "comprehensive" ? filteredEntities.length === 0 : filteredAMRs.length === 0) && (
        <div className="text-center py-8">
          <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {viewMode === "comprehensive"
              ? "No fleet entities found matching your criteria"
              : "No AMRs found matching your criteria"}
          </p>
        </div>
      )}

      {/* AMR Map Integration */}
      <div className="mt-6">
        <AMRMap amrs={filteredEntities
          .filter(entity => entity.category === 'physical_amr')
          .map(entity => ({
            id: entity.id,
            name: entity.name,
            x: entity.x || Math.random() * 80 + 10,
            y: entity.y || Math.random() * 80 + 10,
            status: entity.status === 'moving' ? 'moving' :
                    entity.status === 'charging' ? 'charging' :
                    entity.status === 'error' ? 'error' :
                    entity.status === 'maintenance' ? 'maintenance' :
                    entity.status === 'paused' ? 'paused' :
                    entity.status === 'executing' ? 'moving' :
                    entity.status === 'idle' ? 'idle' : 'idle',
            battery: entity.metadata?.battery || 0,
            type: entity.type
          }))} />
      </div>
    </div>
  );
}

// Enhanced Warehouse Map with Interactive Features
interface WarehouseMapProps {
  amrs: AMR[];
  tasks: TaskItem[];
  zones: WarehouseZone[];
  onAMRClick: (amr: AMR) => void;
  onTaskClick: (task: TaskItem) => void;
  onZoneClick: (zone: WarehouseZone) => void;
  selectedAMR?: AMR;
  selectedTask?: TaskItem;
}

export function WarehouseMap({
  amrs,
  tasks,
  zones,
  onAMRClick,
  onTaskClick,
  onZoneClick,
  selectedAMR,
  selectedTask
}: WarehouseMapProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'standard' | 'heatmap' | 'routes'>('standard');

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = e.deltaY > 0 ? Math.max(0.5, scale - 0.1) : Math.min(3, scale + 0.1);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const getAMRColor = (status: AMR['status']) => {
    switch (status) {
      case 'moving': return '#10b981';
      case 'charging': return '#3b82f6';
      case 'error': return '#ef4444';
      case 'maintenance': return '#f59e0b';
      case 'paused': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getTaskColor = (status: TaskItem['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Warehouse Map</h3>
          <p className="text-sm text-gray-600">Real-time AMR positions and task visualization</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(value: 'standard' | 'heatmap' | 'routes') => setViewMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard View</SelectItem>
              <SelectItem value="heatmap">Heatmap View</SelectItem>
              <SelectItem value="routes">Routes View</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="px-3"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="px-3"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScale(s => Math.min(3, s + 0.1))}
              className="px-3"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className="relative bg-gray-50 rounded-lg border-2 border-gray-200 h-96 overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Transform container for zoom and pan */}
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
            transformOrigin: '0 0',
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 grid grid-cols-24 grid-rows-16 gap-px p-2">
            {Array.from({ length: 384 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-sm"></div>
            ))}
          </div>

          {/* Warehouse Zones */}
          {zones.map(zone => (
            <div
              key={zone.id}
              className={`absolute rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                selectedAMR?.location === zone.name ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: `${(zone.x / 1200) * 100}%`,
                top: `${(zone.y / 800) * 100}%`,
                width: `${(zone.width / 1200) * 100}%`,
                height: `${(zone.height / 800) * 100}%`,
                backgroundColor: `${zone.color}20`,
                borderColor: zone.color,
              }}
              onClick={() => onZoneClick(zone)}
              title={`${zone.name} (${zone.type})`}
            >
              <div className="text-xs font-medium p-1" style={{ color: zone.color }}>
                {zone.name}
              </div>
            </div>
          ))}

          {/* Task Destinations */}
          {tasks.filter(task => task.status === 'in-progress' || task.status === 'pending').map(task => (
            <div
              key={task.id}
              className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer animate-pulse"
              style={{
                left: `${(task.targetX / 1200) * 100}%`,
                top: `${(task.targetY / 800) * 100}%`,
                backgroundColor: getTaskColor(task.status),
              }}
              onClick={() => onTaskClick(task)}
              title={`${task.title} - ${task.status}`}
            />
          ))}

          {/* AMR Positions */}
          {amrs.map(amr => (
            <div
              key={amr.id}
              className={`absolute cursor-pointer transition-all ${
                selectedAMR?.id === amr.id ? 'ring-2 ring-blue-500 scale-125' : 'hover:scale-110'
              }`}
              style={{
                left: `${(amr.x / 1200) * 100}%`,
                top: `${(amr.y / 800) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${amr.rotation}deg)`,
              }}
              onClick={() => onAMRClick(amr)}
              title={`${amr.name} - ${amr.status} - ${amr.battery}%`}
            >
              {/* AMR Icon with status indicator */}
              <div className="relative">
                <div
                  className="w-6 h-4 rounded-lg border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getAMRColor(amr.status) }}
                >
                  <Bot className="h-3 w-3 text-white" />
                </div>

                {/* Battery indicator */}
                <div className="absolute -top-1 -right-1 w-2 h-1 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${amr.battery}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
