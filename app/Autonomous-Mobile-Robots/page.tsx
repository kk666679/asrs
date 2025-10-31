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
import { Play, Pause, StopCircle, Route, Bot, MapPin, Battery, Zap, Plus } from "lucide-react";
import { createAMRAction, createTaskAction } from "./serverActions";
import { Sidebar } from "./AMR";

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

const initialAMRs: AMR[] = [
  { id: "1", name: "AMR-001", battery: 85, speed: 1.2, loadKg: 45, location: "Aisle B-12", status: "moving", x: 300, y: 180 },
  { id: "2", name: "AMR-002", battery: 42, speed: 0, loadKg: 0, location: "Charging Station 3", status: "charging", x: 700, y: 400 },
  { id: "5", name: "AMR-005", battery: 68, speed: 0, loadKg: 32, location: "Aisle C-07", status: "error", x: 500, y: 200 },
];

const initialTasks: TaskItem[] = [
  { id: "t1", title: "Retrieve Item #B-12-45", amrId: "1", location: "Aisle B, Shelf 12", startedAt: "10:23 AM", status: "in-progress" },
  { id: "t2", title: "Inventory Check Zone C", amrId: "3", location: "Zone C", status: "pending" },
];

export default function Page() {
  const [amrs, setAmrs] = useState<AMR[]>(initialAMRs);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [showAMRModal, setShowAMRModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => {
      setAmrs(prev => prev.map(a => (a.status === "moving" ? { ...a, battery: Math.max(0, a.battery - 0.2) } : a)));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const metrics = useMemo(() => {
    const total = amrs.length;
    const active = amrs.filter(a => a.status === "moving").length;
    const avgBattery = Math.round(amrs.reduce((s, a) => s + a.battery, 0) / Math.max(1, total));
    return { total, active, avgBattery, tasksToday: tasks.length };
  }, [amrs, tasks]);

  async function handleCreateAMR(formData: FormData) {
    startTransition(async () => {
      await createAMRAction(formData);
      setNotification("New AMR added!");
      setShowAMRModal(false);
    });
  }

  async function handleCreateTask(formData: FormData) {
    startTransition(async () => {
      await createTaskAction(formData);
      setNotification("New task created!");
      setShowTaskModal(false);
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-500';
      case 'moving': return 'bg-green-500';
      case 'charging': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Autonomous Mobile Robots</h1>
              <p className="text-gray-600 mt-1">Fleet management and control for AMRs</p>
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure New AMR</DialogTitle>
                    <DialogDescription>Add a new autonomous mobile robot to the fleet</DialogDescription>
                  </DialogHeader>
                  <form action={handleCreateAMR} className="space-y-4">
                    <div>
                      <Label htmlFor="name">AMR Name</Label>
                      <Input name="name" id="name" required />
                    </div>
                    <div>
                      <Label htmlFor="battery">Battery (%)</Label>
                      <Input name="battery" id="battery" type="number" min={0} max={100} defaultValue={100} />
                    </div>
                    <div>
                      <Label htmlFor="location">Initial Zone</Label>
                      <Input name="location" id="location" placeholder="Receiving" />
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

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AMRs</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">Active fleet size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active AMRs</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active}</div>
            <p className="text-xs text-muted-foreground">Currently moving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgBattery}%</div>
            <p className="text-xs text-muted-foreground">Fleet average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tasksToday}</div>
            <p className="text-xs text-muted-foreground">Completed tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Fleet-wide control commands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Start Fleet
            </Button>
            <Button variant="secondary">
              <Pause className="h-4 w-4 mr-2" />
              Pause Fleet
            </Button>
            <Button variant="destructive">
              <StopCircle className="h-4 w-4 mr-2" />
              Emergency Stop
            </Button>
            <Button variant="outline">
              <Route className="h-4 w-4 mr-2" />
              Optimize Routes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AMR Fleet Table */}
      <Card>
        <CardHeader>
          <CardTitle>AMR Fleet Status</CardTitle>
          <CardDescription>Real-time status of all autonomous mobile robots</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>AMR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Load</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {amrs.map((amr) => (
                <TableRow key={amr.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{amr.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {amr.id}</div>
                      </div>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{amr.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>{amr.loadKg}kg</TableCell>
                  <TableCell>{amr.speed} m/s</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Command
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Task Management */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>Current AMR tasks and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    task.status === 'in-progress' ? 'bg-blue-500' :
                    task.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      AMR: {task.amrId} | Location: {task.location}
                      {task.startedAt && ` | Started: ${task.startedAt}`}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  task.status === 'in-progress' ? 'default' :
                  task.status === 'pending' ? 'secondary' : 'outline'
                }>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Assign a new task to an AMR</DialogDescription>
                </DialogHeader>
                <form action={handleCreateTask} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Task Title</Label>
                    <Input name="title" id="title" required />
                  </div>
                  <div>
                    <Label htmlFor="amrId">AMR ID</Label>
                    <Select name="amrId" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AMR" />
                      </SelectTrigger>
                      <SelectContent>
                        {amrs.map((amr) => (
                          <SelectItem key={amr.id} value={amr.id}>
                            {amr.name} ({amr.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input name="location" id="location" placeholder="Aisle B-12" />
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
        </CardContent>
      </Card>

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
