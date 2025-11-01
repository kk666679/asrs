"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Play, 
  Pause, 
  StopCircle, 
  Route, 
  Bot, 
  MapPin, 
  Battery, 
  Zap, 
  Plus, 
  Package,
  Palette,
  Truck,
  Warehouse,
  Move,
  Scale,
  Thermometer,
  Gauge,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Navigation,
  RefreshCw,
  BarChart3,
  Users,
  Settings
} from "lucide-react";
import { createAMRAction, createTaskAction } from "./serverActions";
import AMRMap from "@/components/AMRMap";

export interface AMR {
  id: string;
  name: string;
  battery: number;
  speed: number;
  loadKg: number;
  currentLoad: number;
  location: string;
  status: "idle" | "moving" | "charging" | "error" | "maintenance" | "paused" | "loading" | "unloading";
  x?: number;
  y?: number;
  type: "forklift" | "conveyor" | "pallet" | "sorting" | "storage_retrieval";
  model: string;
  temperature: number;
  efficiency: number;
  tasksCompleted: number;
  lastMaintenance: string;
}

export interface MaterialTask {
  id: string;
  title: string;
  amrId: string;
  amrName?: string;
  location: string;
  targetLocation: string;
  materialType: "pallet" | "carton" | "bulk" | "fragile";
  weight: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in-progress" | "completed" | "failed" | "cancelled";
  startedAt?: string;
  completedAt?: string;
  estimatedDuration: number;
  progress?: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  type: "pallet" | "carton" | "bulk" | "fragile";
  weight: number;
  location: string;
  destination: string;
  status: "waiting" | "assigned" | "in-transit" | "delivered";
  amrId?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

const initialAMRs: AMR[] = [
  { 
    id: "1", 
    name: "Forklift-001", 
    battery: 85, 
    speed: 1.2, 
    loadKg: 1000, 
    currentLoad: 450,
    location: "Loading Dock A", 
    status: "moving", 
    x: 300, 
    y: 180,
    type: "forklift",
    model: "FL-5000",
    temperature: 42,
    efficiency: 94,
    tasksCompleted: 127,
    lastMaintenance: "2024-01-15"
  },
  { 
    id: "2", 
    name: "PalletBot-002", 
    battery: 42, 
    speed: 0, 
    loadKg: 500, 
    currentLoad: 0,
    location: "Charging Station 3", 
    status: "charging", 
    x: 700, 
    y: 400,
    type: "pallet",
    model: "PB-3000",
    temperature: 38,
    efficiency: 88,
    tasksCompleted: 89,
    lastMaintenance: "2024-01-10"
  },
  { 
    id: "3", 
    name: "Sorter-003", 
    battery: 92, 
    speed: 2.1, 
    loadKg: 200, 
    currentLoad: 150,
    location: "Sorting Zone", 
    status: "moving", 
    x: 500, 
    y: 300,
    type: "sorting",
    model: "SR-2000",
    temperature: 45,
    efficiency: 96,
    tasksCompleted: 234,
    lastMaintenance: "2024-01-18"
  },
  { 
    id: "4", 
    name: "Conveyor-004", 
    battery: 78, 
    speed: 1.5, 
    loadKg: 300, 
    currentLoad: 280,
    location: "Packaging Line", 
    status: "loading", 
    x: 400, 
    y: 250,
    type: "conveyor",
    model: "CV-1500",
    temperature: 41,
    efficiency: 91,
    tasksCompleted: 312,
    lastMaintenance: "2024-01-12"
  },
  { 
    id: "5", 
    name: "Retriever-005", 
    battery: 68, 
    speed: 0, 
    loadKg: 800, 
    currentLoad: 320,
    location: "High Bay Rack C-07", 
    status: "error", 
    x: 500, 
    y: 200,
    type: "storage_retrieval",
    model: "SR-8000",
    temperature: 52,
    efficiency: 85,
    tasksCompleted: 156,
    lastMaintenance: "2024-01-05"
  },
];

const initialTasks: MaterialTask[] = [
  { 
    id: "t1", 
    title: "Transfer Pallet to Shipping", 
    amrId: "1", 
    amrName: "Forklift-001",
    location: "Loading Dock A", 
    targetLocation: "Shipping Zone 2",
    materialType: "pallet",
    weight: 450,
    priority: "high",
    status: "in-progress",
    startedAt: "10:23 AM",
    estimatedDuration: 15,
    progress: 65
  },
  { 
    id: "t2", 
    title: "Sort Cartons Zone C", 
    amrId: "3", 
    amrName: "Sorter-003",
    location: "Receiving Area", 
    targetLocation: "Sorting Zone",
    materialType: "carton",
    weight: 180,
    priority: "medium",
    status: "pending",
    estimatedDuration: 25,
    progress: 0
  },
  { 
    id: "t3", 
    title: "Store Bulk Items", 
    amrId: "2", 
    amrName: "PalletBot-002",
    location: "Bulk Storage", 
    targetLocation: "Rack B-12",
    materialType: "bulk",
    weight: 320,
    priority: "low",
    status: "pending",
    estimatedDuration: 20,
    progress: 0
  },
];

const initialMaterials: MaterialItem[] = [
  {
    id: "m1",
    name: "Electronics Pallet #45",
    type: "pallet",
    weight: 450,
    location: "Loading Dock A",
    destination: "Shipping Zone 2",
    status: "in-transit",
    amrId: "1",
    priority: "high"
  },
  {
    id: "m2",
    name: "Fragile Cartons Set",
    type: "fragile",
    weight: 120,
    location: "Receiving Area",
    destination: "Quality Check",
    status: "waiting",
    priority: "urgent"
  },
  {
    id: "m3",
    name: "Bulk Raw Materials",
    type: "bulk",
    weight: 680,
    location: "Bulk Storage",
    destination: "Production Line A",
    status: "assigned",
    amrId: "4",
    priority: "medium"
  }
];

export default function MaterialHandlingPage() {
  const [amrs, setAmrs] = useState<AMR[]>(initialAMRs);
  const [tasks, setTasks] = useState<MaterialTask[]>(initialTasks);
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [showAMRModal, setShowAMRModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const id = setInterval(() => {
      setAmrs(prev => prev.map(a => {
        if (a.status === "moving" || a.status === "loading" || a.status === "unloading") {
          return { 
            ...a, 
            battery: Math.max(0, a.battery - 0.2),
            currentLoad: a.status === "loading" ? Math.min(a.loadKg, a.currentLoad + 10) : 
                        a.status === "unloading" ? Math.max(0, a.currentLoad - 10) : a.currentLoad
          };
        }
        if (a.status === "charging") {
          return { ...a, battery: Math.min(100, a.battery + 0.5) };
        }
        return a;
      }));

      // Update task progress
      setTasks(prev => prev.map(task => {
        if (task.status === "in-progress" && task.progress !== undefined) {
          const newProgress = Math.min(100, task.progress + 2);
          if (newProgress === 100) {
            return { ...task, status: "completed", progress: 100, completedAt: new Date().toLocaleTimeString() };
          }
          return { ...task, progress: newProgress };
        }
        return task;
      }));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const metrics = useMemo(() => {
    const total = amrs.length;
    const active = amrs.filter(a => a.status === "moving" || a.status === "loading" || a.status === "unloading").length;
    const avgBattery = Math.round(amrs.reduce((s, a) => s + a.battery, 0) / Math.max(1, total));
    const totalThroughput = amrs.reduce((s, a) => s + a.tasksCompleted, 0);
    const efficiency = Math.round(amrs.reduce((s, a) => s + a.efficiency, 0) / Math.max(1, total));
    const pendingTasks = tasks.filter(t => t.status === "pending").length;
    const activeTasks = tasks.filter(t => t.status === "in-progress").length;
    const materialsInTransit = materials.filter(m => m.status === "in-transit").length;

    return { 
      total, 
      active, 
      avgBattery, 
      totalThroughput, 
      efficiency,
      pendingTasks,
      activeTasks,
      materialsInTransit
    };
  }, [amrs, tasks, materials]);

  async function handleCreateAMR(formData: FormData) {
    startTransition(async () => {
      await createAMRAction(formData);
      setNotification("New AMR added to material handling fleet!");
      setShowAMRModal(false);
    });
  }

  async function handleCreateTask(formData: FormData) {
    startTransition(async () => {
      await createTaskAction(formData);
      setNotification("New material handling task created!");
      setShowTaskModal(false);
    });
  }

  async function handleCreateMaterial(formData: FormData) {
    startTransition(async () => {
      // Implementation for creating material
      setNotification("New material added to handling queue!");
      setShowMaterialModal(false);
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'moving': return 'bg-green-500';
      case 'charging': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      case 'loading': return 'bg-purple-500';
      case 'unloading': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type) {
      case 'pallet': return <Palette className="h-4 w-4" />;
      case 'carton': return <Package className="h-4 w-4" />;
      case 'bulk': return <Scale className="h-4 w-4" />;
      case 'fragile': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getAMRTypeIcon = (type: string) => {
    switch (type) {
      case 'forklift': return <Truck className="h-4 w-4" />;
      case 'conveyor': return <Move className="h-4 w-4" />;
      case 'pallet': return <Palette className="h-4 w-4" />;
      case 'sorting': return <Route className="h-4 w-4" />;
      case 'storage_retrieval': return <Warehouse className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const filteredAMRs = amrs.filter(amr => 
    amr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amr.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amr.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground gradient-text">AMR Material Handling</h1>
              <p className="text-muted-foreground mt-1">Automated material movement and logistics management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Route className="h-4 w-4 mr-2" />
                Optimize Routes
              </Button>
              <Dialog open={showAMRModal} onOpenChange={setShowAMRModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add AMR
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configure New Material Handling AMR</DialogTitle>
                    <DialogDescription>Add a new autonomous mobile robot to the material handling fleet</DialogDescription>
                  </DialogHeader>
                  <form action={handleCreateAMR} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">AMR Name</Label>
                        <Input name="name" id="name" required placeholder="Forklift-001" />
                      </div>
                      <div>
                        <Label htmlFor="type">AMR Type</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="forklift">Forklift</SelectItem>
                            <SelectItem value="pallet">Pallet Mover</SelectItem>
                            <SelectItem value="conveyor">Conveyor System</SelectItem>
                            <SelectItem value="sorting">Sorter</SelectItem>
                            <SelectItem value="storage_retrieval">Storage Retriever</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="model">Model</Label>
                        <Input name="model" id="model" required placeholder="FL-5000" />
                      </div>
                      <div>
                        <Label htmlFor="loadKg">Max Load Capacity (kg)</Label>
                        <Input name="loadKg" id="loadKg" type="number" required defaultValue={500} />
                      </div>
                      <div>
                        <Label htmlFor="battery">Battery (%)</Label>
                        <Input name="battery" id="battery" type="number" min={0} max={100} defaultValue={100} />
                      </div>
                      <div>
                        <Label htmlFor="location">Initial Location</Label>
                        <Input name="location" id="location" placeholder="Loading Dock A" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add AMR"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAMRModal(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Enhanced Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-effect hover-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total AMRs</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total}</div>
                <p className="text-xs text-muted-foreground">{metrics.active} active</p>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                <Move className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalThroughput}</div>
                <p className="text-xs text-muted-foreground">Tasks completed</p>
              </CardContent>
            </Card>

            <Card className="glass-effect hover-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.efficiency}%</div>
                <Progress value={metrics.efficiency} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="glass-effect hover-glow transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Materials in Transit</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.materialsInTransit}</div>
                <p className="text-xs text-muted-foreground">Active movements</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Different Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="categories">Robot Categories</TabsTrigger>
              <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
              <TabsTrigger value="tasks">Task Management</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* AMR Map Layout */}
              <AMRMap amrs={amrs.map(amr => ({
                id: amr.id,
                name: amr.name,
                x: amr.x,
                y: amr.y,
                status: amr.status,
                battery: amr.battery,
                type: amr.type
              }))} />

              {/* Quick Actions */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-glow">Material Handling Controls</CardTitle>
                  <CardDescription>Fleet-wide control commands for material operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Play className="h-4 w-4 mr-2" />
                      Start All Operations
                    </Button>
                    <Button variant="secondary">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Operations
                    </Button>
                    <Button variant="destructive">
                      <StopCircle className="h-4 w-4 mr-2" />
                      Emergency Stop
                    </Button>
                    <Button variant="outline">
                      <Route className="h-4 w-4 mr-2" />
                      Optimize Material Flow
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh System
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AMR Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amrs.map((amr) => (
                  <Card key={amr.id} className="glass-effect hover-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getAMRTypeIcon(amr.type)}
                          {amr.name}
                        </CardTitle>
                        <Badge className={`${getStatusColor(amr.status)} text-white`}>
                          {amr.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <span>{amr.model}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {amr.location}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Battery className="h-4 w-4" />
                            Battery
                          </span>
                          <span>{amr.battery}%</span>
                        </div>
                        <Progress value={amr.battery} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Current Load</div>
                          <div className="font-semibold">{amr.currentLoad}/{amr.loadKg}kg</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Efficiency</div>
                          <div className="font-semibold">{amr.efficiency}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Speed</div>
                          <div className="font-semibold">{amr.speed}m/s</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Temperature</div>
                          <div className={`font-semibold ${amr.temperature > 50 ? 'text-red-600' : 'text-gray-900'}`}>
                            {amr.temperature}°C
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                        <span>Tasks: {amr.tasksCompleted}</span>
                        <span>Last Maintenance: {amr.lastMaintenance}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              {/* AMR Categories Summary Table */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-glow">AMR Material Handling Robot Categories</CardTitle>
                  <CardDescription>Comprehensive overview of different AMR types and their specialized applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Primary Payload</TableHead>
                        <TableHead>Handling Mechanism</TableHead>
                        <TableHead>Typical Use Case</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Pallet Transporters</span>
                          </div>
                        </TableCell>
                        <TableCell>Pallets</TableCell>
                        <TableCell>Roller Deck, Lift</TableCell>
                        <TableCell>Receiving to Storage, Line Feeding</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Warehouse className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Forklift AMRs</span>
                          </div>
                        </TableCell>
                        <TableCell>Pallets (on racks)</TableCell>
                        <TableCell>Forklift Tines</TableCell>
                        <TableCell>High-Bay Storage, Truck Loading</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Tote Transporters</span>
                          </div>
                        </TableCell>
                        <TableCell>Totes, Cartons</TableCell>
                        <TableCell>Flat Surface/Conveyor</TableCell>
                        <TableCell>Order Fulfillment, Kitting</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Move className="h-4 w-4 text-orange-600" />
                            <span className="font-medium">G2P Carriers</span>
                          </div>
                        </TableCell>
                        <TableCell>Mobile Shelving (Pods)</TableCell>
                        <TableCell>Lift & Move</TableCell>
                        <TableCell>High-Density E-commerce Picking</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4 text-red-600" />
                            <span className="font-medium">Cart/Tugger Trains</span>
                          </div>
                        </TableCell>
                        <TableCell>Carts, Cages</TableCell>
                        <TableCell>Hitch & Pull</TableCell>
                        <TableCell>Manufacturing Milk Runs, Hospital Logistics</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-indigo-600" />
                            <span className="font-medium">Roll Handlers</span>
                          </div>
                        </TableCell>
                        <TableCell>Material Rolls</TableCell>
                        <TableCell>Specialized Gripper</TableCell>
                        <TableCell>Textile, Paper, Carpet Industries</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-teal-600" />
                            <span className="font-medium">Assembly Deliverers</span>
                          </div>
                        </TableCell>
                        <TableCell>Components</TableCell>
                        <TableCell>Custom Racks/Shelves</TableCell>
                        <TableCell>JIT Assembly Line Supply</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Cleanroom AMRs</span>
                          </div>
                        </TableCell>
                        <TableCell>Sensitive Materials</TableCell>
                        <TableCell>Clean-compliant Design</TableCell>
                        <TableCell>Semiconductor, Pharma, Food</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fleet" className="space-y-6">
              {/* Fleet Management Table */}
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-glow">Material Handling Fleet</CardTitle>
                  <CardDescription>Complete overview of all AMRs in the material handling system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search AMRs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="moving">Moving</SelectItem>
                        <SelectItem value="idle">Idle</SelectItem>
                        <SelectItem value="charging">Charging</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>AMR</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Battery</TableHead>
                        <TableHead>Load</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Efficiency</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAMRs.map((amr) => (
                        <TableRow key={amr.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAMRTypeIcon(amr.type)}
                              <div>
                                <div className="font-medium">{amr.name}</div>
                                <div className="text-sm text-muted-foreground">{amr.model}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {amr.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(amr.status)} text-white`}>
                              {amr.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4" />
                              <span>{amr.battery}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{amr.currentLoad}/{amr.loadKg}kg</div>
                              <Progress value={(amr.currentLoad / amr.loadKg) * 100} className="h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{amr.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">{amr.efficiency}%</div>
                              <Progress value={amr.efficiency} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Navigation className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              {/* Task Management */}
              <Card className="glass-effect">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-glow">Material Handling Tasks</CardTitle>
                      <CardDescription>Current AMR tasks and material assignments</CardDescription>
                    </div>
                    <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create New Material Handling Task</DialogTitle>
                          <DialogDescription>Assign a new material movement task to an AMR</DialogDescription>
                        </DialogHeader>
                        <form action={handleCreateTask} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="title">Task Title</Label>
                              <Input name="title" id="title" required placeholder="Transfer Pallet to Shipping" />
                            </div>
                            <div>
                              <Label htmlFor="materialType">Material Type</Label>
                              <Select name="materialType" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pallet">Pallet</SelectItem>
                                  <SelectItem value="carton">Carton</SelectItem>
                                  <SelectItem value="bulk">Bulk</SelectItem>
                                  <SelectItem value="fragile">Fragile</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="amrId">Assign AMR</Label>
                              <Select name="amrId" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select AMR" />
                                </SelectTrigger>
                                <SelectContent>
                                  {amrs.map((amr) => (
                                    <SelectItem key={amr.id} value={amr.id}>
                                      {amr.name} ({amr.type})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="weight">Weight (kg)</Label>
                              <Input name="weight" id="weight" type="number" required placeholder="450" />
                            </div>
                            <div>
                              <Label htmlFor="location">Pickup Location</Label>
                              <Input name="location" id="location" placeholder="Loading Dock A" />
                            </div>
                            <div>
                              <Label htmlFor="targetLocation">Destination</Label>
                              <Input name="targetLocation" id="targetLocation" placeholder="Shipping Zone 2" />
                            </div>
                            <div>
                              <Label htmlFor="priority">Priority</Label>
                              <Select name="priority" required>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="estimatedDuration">Est. Duration (min)</Label>
                              <Input name="estimatedDuration" id="estimatedDuration" type="number" placeholder="15" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Creating..." : "Create Task"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              {getMaterialTypeIcon(task.materialType)}
                              {task.status === 'in-progress' && <Play className="h-4 w-4 text-blue-500 animate-pulse" />}
                              {task.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {task.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{task.title}</p>
                                <Badge variant={
                                  task.priority === 'urgent' ? 'destructive' :
                                  task.priority === 'high' ? 'default' :
                                  task.priority === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {task.priority}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  <span>{task.amrName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{task.location} → {task.targetLocation}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Scale className="h-3 w-3" />
                                  <span>{task.weight}kg</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{task.estimatedDuration}m</span>
                                </div>
                              </div>

                              {task.status === 'in-progress' && task.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Progress</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <Progress value={task.progress} className="h-2" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge variant={
                              task.status === 'in-progress' ? 'default' :
                              task.status === 'completed' ? 'secondary' :
                              task.status === 'pending' ? 'outline' : 'destructive'
                            }>
                              {task.status.replace('-', ' ')}
                            </Badge>
                            {task.startedAt && (
                              <p className="text-xs text-gray-500 mt-1">Started: {task.startedAt}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              {/* Materials Management */}
              <Card className="glass-effect">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-glow">Material Inventory</CardTitle>
                      <CardDescription>Track and manage all materials in the handling system</CardDescription>
                    </div>
                    <Dialog open={showMaterialModal} onOpenChange={setShowMaterialModal}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Material
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Material</DialogTitle>
                          <DialogDescription>Add material to the handling queue</DialogDescription>
                        </DialogHeader>
                        <form action={handleCreateMaterial} className="space-y-4">
                          <div>
                            <Label htmlFor="materialName">Material Name</Label>
                            <Input name="materialName" id="materialName" required />
                          </div>
                          <div>
                            <Label htmlFor="materialType">Material Type</Label>
                            <Select name="materialType" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pallet">Pallet</SelectItem>
                                <SelectItem value="carton">Carton</SelectItem>
                                <SelectItem value="bulk">Bulk</SelectItem>
                                <SelectItem value="fragile">Fragile</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="materialWeight">Weight (kg)</Label>
                            <Input name="materialWeight" id="materialWeight" type="number" required />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={isPending}>
                              {isPending ? "Adding..." : "Add Material"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowMaterialModal(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMaterialTypeIcon(material.type)}
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {material.location} → {material.destination} • {material.weight}kg
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            material.status === 'in-transit' ? 'default' :
                            material.status === 'assigned' ? 'secondary' :
                            material.status === 'waiting' ? 'outline' : 'destructive'
                          }>
                            {material.status}
                          </Badge>
                          {material.amrId && (
                            <p className="text-xs text-gray-500 mt-1">AMR: {material.amrId}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {notification && (
            <Alert className="fixed top-4 right-4 w-80 z-50">
              <AlertDescription>{notification}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}