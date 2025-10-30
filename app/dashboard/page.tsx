"use client";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MetricsGrid from "./components/MetricsGrid";
import FleetGrid from "./components/FleetGrid";
import WarehouseMap from "./components/WarehouseMap";
import TaskList from "./components/TaskList";
import Modal from "./components/Modal";
import { Play, Pause, StopCircle, Route } from "lucide-react";
import { createAMRAction, createTaskAction } from "./serverActions";

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

  return (
    <div className="min-h-screen grid grid-rows-[70px_1fr] lg:grid-cols-[250px_1fr]">
      <Header activeCount={metrics.active} />
      <Sidebar />

      <main className="p-6 bg-gray-100 lg:col-start-2">
        <div className="grid gap-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-sky-500">
              <h3 className="flex items-center gap-2 text-slate-700 font-semibold">Fleet Overview</h3>
              <MetricsGrid metrics={metrics} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-500">
              <h3 className="text-slate-700 font-semibold mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button aria-label="Start Fleet" className="px-4 py-2 bg-sky-600 text-white rounded flex items-center gap-2"><Play size={16}/> Start</button>
                <button aria-label="Pause Fleet" className="px-4 py-2 bg-amber-500 text-white rounded flex items-center gap-2"><Pause size={16}/> Pause</button>
                <button aria-label="Emergency Stop" className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2"><StopCircle size={16}/> Stop</button>
                <button aria-label="Optimize Routes" className="px-4 py-2 bg-teal-600 text-white rounded flex items-center gap-2"><Route size={16}/> Optimize</button>
              </div>
            </div>
          </div>

          <FleetGrid amrs={amrs} onAdd={() => setShowAMRModal(true)} />
          <WarehouseMap amrs={amrs} />
          <TaskList tasks={tasks} onAdd={() => setShowTaskModal(true)} />
        </div>
      </main>

      {notification && <div className="fixed top-6 right-6 z-50 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg">{notification}</div>}

      {showAMRModal && (
        <Modal title="Configure New AMR" onClose={() => setShowAMRModal(false)}>
          <form action={handleCreateAMR} className="flex flex-col gap-3" aria-label="Create AMR Form">
            <label className="text-sm font-medium">AMR Name</label>
            <input name="name" className="p-2 border rounded" required />

            <label className="text-sm font-medium">Battery (%)</label>
            <input name="battery" type="number" className="p-2 border rounded" min={0} max={100} defaultValue={100} />

            <label className="text-sm font-medium">Initial Zone</label>
            <input name="location" className="p-2 border rounded" placeholder="Receiving" />

            <button type="submit" disabled={isPending} className="px-3 py-2 bg-sky-600 text-white rounded disabled:opacity-50">
              {isPending ? "Adding..." : "Add AMR"}
            </button>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal title="Create New Task" onClose={() => setShowTaskModal(false)}>
          <form action={handleCreateTask} className="flex flex-col gap-3" aria-label="Create Task Form">
            <label className="text-sm font-medium">Task Title</label>
            <input name="title" className="p-2 border rounded" required />

            <label className="text-sm font-medium">AMR ID</label>
            <input name="amrId" className="p-2 border rounded" placeholder="AMR-001" />

            <label className="text-sm font-medium">Location</label>
            <input name="location" className="p-2 border rounded" placeholder="Aisle B-12" />

            <button type="submit" disabled={isPending} className="px-3 py-2 bg-sky-600 text-white rounded disabled:opacity-50">
              {isPending ? "Creating..." : "Create Task"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
