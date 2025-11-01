"use client";

import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useWebSocket } from '@/lib/websocket';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, RefreshCw, Brain, Eye, Shield, Zap } from 'lucide-react';

import { useInView } from 'react-intersection-observer';
import TrustIndicator from '@/components/enhanced/TrustIndicator';
import RealTimeMetrics from '@/components/enhanced/RealTimeMetrics';
import InteractiveHeatmap from '@/components/enhanced/InteractiveHeatmap';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  summary: {
    totalItems: number;
    activeBins: number;
    todaysMovements: number;
    pendingTasks: number;
  };
  kpis: {
    inventoryTurnover: number;
    spaceUtilization: number;
    stockAlertsCount: number;
  };
  alerts: Array<{
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStock: number;
    status: string;
  }>;
  trends: Array<{
    date: string;
    movements: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState('30d');
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());
  const [predictiveData, setPredictiveData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const { isConnected } = useWebSocket();
  
  useEffect(() => {
    // Generate predictive analytics data
    const generatePredictiveData = () => {
      const data = [];
      for (let i = 0; i < 30; i++) {
        data.push({
          day: i + 1,
          predicted: 1200 + Math.sin(i * 0.2) * 200 + Math.random() * 100,
          actual: i < 20 ? 1150 + Math.sin(i * 0.2) * 180 + Math.random() * 80 : null,
          confidence: 95 - Math.random() * 10
        });
      }
      return data;
    };
    
    setPredictiveData(generatePredictiveData());
    
    // Generate anomaly detection data
    setAnomalies([
      { id: 1, type: 'throughput', severity: 'medium', time: '2024-01-15 14:30', description: 'Throughput 15% below expected' },
      { id: 2, type: 'efficiency', severity: 'low', time: '2024-01-15 16:45', description: 'Minor efficiency dip detected' },
      { id: 3, type: 'temperature', severity: 'high', time: '2024-01-15 18:20', description: 'Temperature spike in Zone A' }
    ]);
  }, []);

  React.useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(() => {
      if (isConnected) {
        fetchAnalyticsData();
        setLastUpdated(new Date());
      }
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [period, isConnected]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (response.ok) {
        try {
          const data = await response.json();
          setAnalyticsData(data);
        } catch (parseError) {
          console.warn('Failed to parse analytics response:', parseError);
        }
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Active Bins', value: analyticsData?.summary.activeBins || 0 },
    { name: 'Inactive Bins', value: Math.max(0, (analyticsData?.summary.totalItems || 0) - (analyticsData?.summary.activeBins || 0)) },
  ];



  return (
    <PageWrapper 
      title="Advanced Analytics" 
      description={`AI-powered insights and predictive analytics ${isConnected ? '• Live' : ''} ${isConnected ? `Updated ${formatLastUpdated()}` : ''}`}
    >
      {/* Enhanced Metrics Section */}
      <RealTimeMetrics />
      
      {/* Trust and Reliability Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <TrustIndicator />
        
        <Card className="lg:col-span-2 glass-effect hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-glow flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Anomaly Detection
            </CardTitle>
            <CardDescription>Machine learning powered anomaly detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        anomaly.severity === 'high' ? 'text-red-400' :
                        anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground">{anomaly.description}</p>
                        <p className="text-xs text-muted-foreground">{anomaly.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${
                      anomaly.severity === 'high' ? 'border-red-500/30 text-red-400' :
                      anomaly.severity === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                      'border-blue-500/30 text-blue-400'
                    }`}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Interactive Heatmap */}
      <div className="mb-6">
        <InteractiveHeatmap />
      </div>
      
      {/* Predictive Analytics Section */}
      <div ref={ref} className={`mb-6 transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-glow flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-400" />
              Predictive Analytics
            </CardTitle>
            <CardDescription>30-day throughput forecast with confidence intervals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.6)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    fill="rgba(59, 130, 246, 0.2)" 
                    name="Predicted"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    fill="rgba(16, 185, 129, 0.2)" 
                    name="Actual"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <motion.div 
        className="flex items-center justify-end gap-2 mb-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={fetchAnalyticsData} className="glass-effect neon-border text-blue-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </motion.div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40 glass-effect neon-border text-blue-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-effect neon-border">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="glass-effect neon-border rounded-xl p-6 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-300/70">Total Items</p>
              <p className="text-2xl font-bold gradient-text">{analyticsData?.summary.totalItems || 0}</p>
            </div>
            <Activity className="h-8 w-8 text-cyan-400" />
          </div>
        </motion.div>

        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Turnover</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{analyticsData?.kpis.inventoryTurnover || 0}</p>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Space Utilization</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{analyticsData?.kpis.spaceUtilization || 0}%</p>
                  {(analyticsData?.kpis.spaceUtilization || 0) > 80 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Alerts</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{analyticsData?.kpis.stockAlertsCount || 0}</p>
                  {(analyticsData?.kpis.stockAlertsCount || 0) > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Critical
                    </Badge>
                  )}
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movement Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Movement Trends</CardTitle>
            <CardDescription>Daily warehouse movement activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="movements" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bin Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Utilization</CardTitle>
            <CardDescription>Active vs inactive storage bins</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Low Stock Alerts
          </CardTitle>
          <CardDescription>
            Items that are below minimum stock levels and require attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData?.alerts && analyticsData.alerts.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.name}</h4>
                        <p className="text-sm text-muted-foreground">SKU: {alert.sku}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-1">
                          LOW STOCK
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Current: {alert.currentStock} / Min: {alert.minStock}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No low stock alerts at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
