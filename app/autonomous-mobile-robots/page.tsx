"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AMR fleet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden">moving idle maintenance moving idle</div>
      <motion.div 
        className="flex items-center justify-between glass-effect neon-border rounded-xl p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold gradient-text">AMR Fleet Management</h1>
          <p className="text-blue-300/80">
            Autonomous Mobile Robot fleet monitoring and control
            {isConnected && <span className="ml-2 text-cyan-400">• Live</span>}
          </p>
        </motion.div>
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={refreshRobots} className="glass-effect neon-border text-blue-300">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={navigateToAnalytics} className="glass-effect neon-border text-purple-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={startAllRobots} className="glass-effect bg-emerald-600/30 text-emerald-300 neon-border border-emerald-400/30">
              <Play className="h-4 w-4 mr-2" />
              Start All
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={emergencyStop} className="glass-effect bg-red-600/30 text-red-300 neon-border border-red-400/30">
              <Square className="h-4 w-4 mr-2" />
              Emergency Stop
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-5 gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-cyan-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{robotStats.total}</p>
              <p className="text-sm text-blue-300/70">Total Robots</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-green-500/20"
        >
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-emerald-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{robotStats.active}</p>
              <p className="text-sm text-blue-300/70">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-gray-500/20"
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{robotStats.idle}</p>
              <p className="text-sm text-blue-300/70">Idle</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-yellow-500/20"
        >
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-yellow-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{robotStats.maintenance}</p>
              <p className="text-sm text-blue-300/70">Maintenance</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="flex items-center">
            <Battery className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{robotStats.averageBattery}%</p>
              <p className="text-sm text-blue-300/70">Avg Battery</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={navigateToRobotsPage}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Robot Control Center
            </CardTitle>
            <CardDescription>
              Detailed robot management and control interface
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={navigateToMaintenance}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance Schedule
            </CardTitle>
            <CardDescription>
              View and manage robot maintenance tasks
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={navigateToAnalytics}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Analytics
            </CardTitle>
            <CardDescription>
              Fleet performance metrics and insights
            </CardDescription>
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
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                {type.replace('_', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-sm text-muted-foreground">
                {Math.round((count / robots.length) * 100)}% of fleet
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
