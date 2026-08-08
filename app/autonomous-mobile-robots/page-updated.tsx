"use client";

import { useState, useTransition, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Wrench, Zap, Battery, Thermometer } from "lucide-react";
import { useRobots } from "@/lib/hooks/useRobots";
import { useEquipment } from "@/lib/hooks/useEquipment";
import { useSensors } from "@/lib/hooks/useSensors";
import { useAlerts } from "@/lib/hooks/useAlerts";
import { useMaintenance } from "@/lib/hooks/useMaintenance";
import { useWebSocket } from "@/lib/websocket";

interface FleetKpi {
  totalRobots: number;
  activeRobots: number;
  errorRobots: number;
  maintenanceRobots: number;
  utilization: number;
  totalEquipment: number;
  activeEquipment: number;
  errorEquipment: number;
  maintenanceEquipment: number;
  totalSensors: number;
  activeSensors: number;
  faultySensors: number;
  criticalAlerts: number;
  pendingMaintenance: number;
  averageBattery: number;
  averageTemperature: number;
}

export default function AsrsDashboard() {
  const [kpi, setKpi] = useState<FleetKpi>({
    totalRobots: 0,
    activeRobots: 0,
    errorRobots: 0,
    maintenanceRobots: 0,
    utilization: 0,
    totalEquipment: 0,
    activeEquipment: 0,
    errorEquipment: 0,
    maintenanceEquipment: 0,
    totalSensors: 0,
    activeSensors: 0,
    faultySensors: 0,
    criticalAlerts: 0,
    pendingMaintenance: 0,
    averageBattery: 0,
    averageTemperature: 0,
  });

  const { robots } = useRobots();
  const { equipment } = useEquipment();
  const { sensors } = useSensors();
  const { alerts } = useAlerts();
  const { maintenance } = useMaintenance();
  const { isConnected } = useWebSocket();

  useEffect(() => {
    const activeRobots = robots.filter(r => r.status === 'WORKING').length;
    const errorRobots = robots.filter(r => r.status === 'ERROR').length;
    const maintenanceRobots = robots.filter(r => r.status === 'MAINTENANCE').length;
    const activeEquipment = equipment.filter(e => e.status === 'moving' || e.status === 'loading' || e.status === 'unloading').length;
    const errorEquipment = equipment.filter(e => e.status === 'error').length;
    const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
    const activeSensors = sensors.filter(s => s.status === 'ACTIVE').length;
    const faultySensors = sensors.filter(s => s.status === 'FAULTY').length;
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
    const pendingMaintenance = maintenance.filter(m => m.status === 'SCHEDULED').length;
    const avgBattery = robots.reduce((sum, r) => sum + (r.batteryLevel || 0), 0) / robots.length || 0;
    const avgTemp = 22.5; // Default temperature since sensors don't have temperature readings

    setKpi({
      totalRobots: robots.length,
      activeRobots,
      errorRobots,
      maintenanceRobots,
      utilization: robots.length ? (activeRobots / robots.length) * 100 : 0,
      totalEquipment: equipment.length,
      activeEquipment,
      errorEquipment,
      maintenanceEquipment,
      totalSensors: sensors.length,
      activeSensors,
      faultySensors,
      criticalAlerts,
      pendingMaintenance,
      averageBattery: avgBattery,
      averageTemperature: avgTemp,
    });
  }, [robots, equipment, sensors, alerts, maintenance]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ASRS Fleet Dashboard</h1>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Robots</p>
                <p className="text-2xl font-bold">{kpi.activeRobots}/{kpi.totalRobots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Battery className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Battery</p>
                <p className="text-2xl font-bold">{kpi.averageBattery.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold">{kpi.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{kpi.pendingMaintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fleet Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Utilization Rate</span>
                <span className="font-bold">{kpi.utilization.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Equipment Active</span>
                <span className="font-bold">{kpi.activeEquipment}/{kpi.totalEquipment}</span>
              </div>
              <div className="flex justify-between">
                <span>Sensors Online</span>
                <span className="font-bold">{kpi.activeSensors}/{kpi.totalSensors}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Avg Temperature</span>
                <span className="font-bold">{kpi.averageTemperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Error Devices</span>
                <span className="font-bold text-red-500">{kpi.errorRobots + kpi.errorEquipment}</span>
              </div>
              <div className="flex justify-between">
                <span>Faulty Sensors</span>
                <span className="font-bold text-orange-500">{kpi.faultySensors}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
