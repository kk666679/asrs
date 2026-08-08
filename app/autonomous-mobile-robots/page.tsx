"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, FilterPanel, StatusBadge, EnhancedPageLayout, StatCard, statGridVariants } from '@/components/shared';
import { useRobots } from '@/lib/hooks/useRobots';
import { useWebSocket } from '@/lib/websocket';
import AMRMap from '@/components/AMRMap';
import {
  Activity,
  AlertTriangle,
  Battery,
  Bot,
  CheckCircle,
  Command,
  Cpu,
  Eye,
  MapPin,
  Play,
  RefreshCw,
  Settings,
  Square,
  Wrench,
  Zap,
  Plus,
  BarChart3
} from 'lucide-react';

export default function AMRFleetDashboard() {
  const router = useRouter();
  const {
    robots,
    filteredRobots,
    robotStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    updateRobot,
    refreshRobots
  } = useRobots();
  
  const { isConnected } = useWebSocket();

  const navigateToRobotDetail = (robotId: string) => {
    router.push(`/robots/${robotId}`);
  };

  const navigateToRobotsPage = () => {
    router.push('/robots');
  };

  const navigateToAnalytics = () => {
    router.push('/analytics');
  };

  const navigateToMaintenance = () => {
    router.push('/maintenance');
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const startAllRobots = async () => {
    try {
      const idleRobots = robots.filter(robot => robot.status === 'IDLE');
      await Promise.all(
        idleRobots.map(robot => 
          updateRobot(robot.id, { status: 'WORKING' })
        )
      );
    } catch (err) {
      console.error('Failed to start all robots:', err);
    }
  };

  const emergencyStop = async () => {
    try {
      const workingRobots = robots.filter(robot => robot.status === 'WORKING');
      await Promise.all(
        workingRobots.map(robot => 
          updateRobot(robot.id, { status: 'IDLE' })
        )
      );
    } catch (err) {
      console.error('Failed to emergency stop robots:', err);
    }
  };

  const filterOptions = [
    {
      key: 'type',
      label: 'Robot Type',
      type: 'select' as const,
      options: [
        { value: 'STORAGE_RETRIEVAL', label: 'Storage & Retrieval' },
        { value: 'CONVEYOR', label: 'Conveyor' },
        { value: 'SORTING', label: 'Sorting' },
        { value: 'PACKING', label: 'Packing' },
        { value: 'TRANSPORT', label: 'Transport' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'IDLE', label: 'Idle' },
        { value: 'WORKING', label: 'Working' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'ERROR', label: 'Error' },
        { value: 'OFFLINE', label: 'Offline' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search by name, code, or location'
    }
  ];

  const columns = [
    {
      key: 'name' as const,
      header: 'Robot Name',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'code' as const,
      header: 'Code'
    },
    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline">{value.replace('_', ' ')}</Badge>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <StatusBadge status={value.toLowerCase() as any} />
      )
    },
    {
      key: 'location' as const,
      header: 'Location',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ) : null
    },
    {
      key: 'batteryLevel' as const,
      header: 'Battery',
      render: (value: number) => value ? (
        <div className="flex items-center gap-2">
          <Battery className={`h-4 w-4 ${
            value > 50 ? 'text-green-500' : 
            value > 20 ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <span className="text-sm">{value}%</span>
        </div>
      ) : null
    }
  ];

  const quickActions = [
    { label: 'Refresh', onClick: () => refreshRobots() },
    { label: 'Start All', onClick: () => startAllRobots() },
    { label: 'Emergency Stop', onClick: () => emergencyStop() },
    { label: 'Analytics', onClick: () => navigateToAnalytics() },
    { label: 'Maintenance', onClick: () => navigateToMaintenance() },
  ];

  return (
    <EnhancedPageLayout
      title="AMR Fleet Management"
      description="Autonomous Mobile Robot fleet monitoring and control"
      loading={isLoading}
      isConnected={isConnected}
      quickActions={quickActions}
      headerRight={
        <>
          <Button onClick={startAllRobots} className="glass-effect bg-emerald-600/30 text-emerald-300 neon-border border-emerald-400/30">
            <Play className="h-4 w-4 mr-2" />Start All
          </Button>
          <Button onClick={emergencyStop} className="glass-effect bg-red-600/30 text-red-300 neon-border border-red-400/30">
            <Square className="h-4 w-4 mr-2" />E-Stop
          </Button>
        </>
      }
    >
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        variants={statGridVariants}
        initial="hidden"
        animate="show"
      >
        <StatCard label="Total Robots" value={robotStats.total} icon={<Bot className="h-5 w-5" />} color="blue" />
        <StatCard label="Active" value={robotStats.active} icon={<Activity className="h-5 w-5" />} color="green" />
        <StatCard label="Idle" value={robotStats.idle} icon={<CheckCircle className="h-5 w-5" />} color="cyan" />
        <StatCard label="Maintenance" value={robotStats.maintenance} icon={<Wrench className="h-5 w-5" />} color="yellow" />
        <StatCard label="Avg Battery" value={`${robotStats.averageBattery}%`} icon={<Battery className="h-5 w-5" />} color="purple" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect hover-glow cursor-pointer" onClick={navigateToRobotsPage}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-300">
              <Settings className="h-5 w-5" />
              Robot Control Center
            </CardTitle>
            <CardDescription>Detailed robot management and control interface</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-effect hover-glow cursor-pointer" onClick={navigateToMaintenance}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-300">
              <Wrench className="h-5 w-5" />
              Maintenance Schedule
            </CardTitle>
            <CardDescription>View and manage robot maintenance tasks</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass-effect hover-glow cursor-pointer" onClick={navigateToAnalytics}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-300">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>Fleet performance metrics and insights</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* AMR Map Layout */}
      <AMRMap amrs={robots.map(robot => ({
        id: robot.id,
        name: robot.name,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        status: robot.status === 'WORKING' ? 'moving' :
                robot.status === 'IDLE' ? 'idle' :
                robot.status === 'MAINTENANCE' ? 'maintenance' :
                robot.status === 'ERROR' ? 'error' :
                robot.status === 'OFFLINE' ? 'charging' : 'idle',
        battery: robot.batteryLevel || 0,
        type: robot.type
      }))} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={handleFilterChange}
            onClear={clearFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Fleet Overview</CardTitle>
              <CardDescription>
                {filteredRobots.length} of {robots.length} robots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredRobots}
                columns={columns}
                loading={isLoading}
                onRowClick={(robot) => navigateToRobotDetail(robot.id)}
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(
          robots.reduce((acc, robot) => {
            acc[robot.type] = (acc[robot.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([type, count]) => (
          <Card key={type} className="glass-effect hover-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-400" />
                {type.replace('_', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{count}</div>
              <p className="text-sm text-muted-foreground">
                {Math.round((count / robots.length) * 100)}% of fleet
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    </EnhancedPageLayout>
  );
}
