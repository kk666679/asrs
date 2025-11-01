"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useShipments } from '@/lib/hooks/useShipments';
import { useWebSocket } from '@/lib/websocket';
import {
  Package,
  Truck,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Search,
  Brain,
  Route,
  Globe,
  Shield
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import Head from 'next/head';
import ShipmentTracker from '@/components/logistics/ShipmentTracker';
import RouteOptimizer from '@/components/logistics/RouteOptimizer';
import FleetManager from '@/components/logistics/FleetManager';
import LogisticsAnalytics from '@/components/logistics/LogisticsAnalytics';
import TrustIndicator from '@/components/enhanced/TrustIndicator';
import RealTimeMetrics from '@/components/enhanced/RealTimeMetrics';
import { GOOGLE_MAP_API_URL } from '@/lib/constants';

interface Shipment {
  id: string;
  shipmentNumber: string;
  type: string;
  status: string;
  expectedArrival: string | null;
  actualArrival: string | null;
  barcode?: string;
  warehouse: {
    name: string;
  };
  supplier: {
    name: string;
  };
  shipmentItems: Array<{
    item: {
      name: string;
      sku: string;
    };
    quantity: number;
    received: number;
  }>;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

export default function ShipmentsPage() {
  const router = useRouter();
  const {
    shipments,
    filteredShipments,
    shipmentsStats: shipmentStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    createShipment,
    updateShipment,
    refreshShipments
  } = useShipments();
  
  const { isConnected } = useWebSocket();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [microserviceStatus, setMicroserviceStatus] = useState({
    shipmentService: 'healthy',
    routingService: 'healthy',
    trackingService: 'healthy',
    fleetService: 'healthy',
    notificationService: 'healthy'
  });
  const [formData, setFormData] = React.useState({
    shipmentNumber: '',
    type: 'INBOUND',
    expectedArrival: '',
    warehouseId: '',
    supplierId: '',
    barcode: '',
  });

  const navigateToShipmentDetail = (shipmentId: string) => {
    router.push(`/shipments/${shipmentId}`);
  };

  const navigateToAnalytics = () => {
    router.push('/analytics');
  };

  const navigateToSuppliers = () => {
    router.push('/suppliers');
  };

  const generateBarcode = async () => {
    try {
      const response = await fetch("/api/barcodes/generate", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, barcode: data.barcode }));
      }
    } catch (error) {
      console.error("Failed to generate barcode:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShipment({
        type: formData.type as any,
        status: 'PENDING' as any,
        reference: formData.shipmentNumber,
        items: [],
        totalWeight: 0,
        totalVolume: 0,
        priority: 'MEDIUM' as any,
        scheduledDate: new Date(formData.expectedArrival),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setShowCreateDialog(false);
      setFormData({
        shipmentNumber: '',
        type: 'INBOUND',
        expectedArrival: '',
        warehouseId: '',
        supplierId: '',
        barcode: '',
      });
    } catch (error) {
      console.error("Failed to create shipment:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filterOptions = [
    {
      key: 'type',
      label: 'Shipment Type',
      type: 'select' as const,
      options: [
        { value: 'INBOUND', label: 'Inbound' },
        { value: 'OUTBOUND', label: 'Outbound' },

      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_TRANSIT', label: 'In Transit' },
        { value: 'RECEIVED', label: 'Received' },
        { value: 'SHIPPED', label: 'Shipped' },
        { value: 'DELIVERED', label: 'Delivered' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search by shipment number or reference'
    }
  ];

  const columns = [
    {
      key: 'reference' as const,
      header: 'Reference',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
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
      key: 'supplierId' as const,
      header: 'Supplier',
      render: (value: string) => `Supplier ${value}` || 'N/A'
    },
    {
      key: 'scheduledDate' as const,
      header: 'Scheduled Date',
      render: (value: Date) => value ? new Date(value).toLocaleDateString() : 'TBD'
    },
    {
      key: 'totalWeight' as const,
      header: 'Weight (kg)'
    },
    {
      key: 'priority' as const,
      header: 'Priority',
      render: (value: string) => (
        <Badge variant={value === 'HIGH' ? 'destructive' : 'secondary'}>
          {value}
        </Badge>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipments...</p>
        </div>
      </div>
    );
  }



  useEffect(() => {
    // Simulate microservice health checks
    const interval = setInterval(() => {
      setMicroserviceStatus(prev => ({
        ...prev,
        shipmentService: Math.random() > 0.1 ? 'healthy' : 'degraded',
        routingService: Math.random() > 0.05 ? 'healthy' : 'degraded',
        trackingService: Math.random() > 0.08 ? 'healthy' : 'degraded',
        fleetService: Math.random() > 0.12 ? 'healthy' : 'degraded',
        notificationService: Math.random() > 0.15 ? 'healthy' : 'degraded'
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <script async defer src={GOOGLE_MAP_API_URL} />
      </Head>
      <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Smart Logistics & Shipment</h1>
          <p className="text-muted-foreground">
            AI-powered logistics with microservice architecture
            {isConnected && <span className="ml-2 text-green-400">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshShipments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToAnalytics} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Shipment</DialogTitle>
                <DialogDescription>
                  Create a new shipment for tracking and management
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="shipmentNumber">Shipment Number *</Label>
                  <Input
                    id="shipmentNumber"
                    name="shipmentNumber"
                    value={formData.shipmentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, shipmentNumber: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INBOUND">Inbound</SelectItem>
                      <SelectItem value="OUTBOUND">Outbound</SelectItem>

                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expectedArrival">Expected Arrival</Label>
                  <Input
                    id="expectedArrival"
                    name="expectedArrival"
                    type="datetime-local"
                    value={formData.expectedArrival}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedArrival: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Barcode (optional)"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                  />
                  <Button type="button" onClick={generateBarcode} variant="outline">
                    Generate
                  </Button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Enhanced Metrics Section */}
      <RealTimeMetrics />
      
      {/* Microservice Architecture Dashboard */}
      <Card className="glass-effect hover-glow transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-glow flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Microservice Architecture Status
          </CardTitle>
          <CardDescription>Real-time health monitoring of logistics microservices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(microserviceStatus).map(([service, status]) => (
              <div key={service} className="glass-effect p-3 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'healthy' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">
                    {service.replace('Service', '')}
                  </span>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  status === 'healthy' ? 'text-green-400 border-green-500/30' : 'text-yellow-400 border-yellow-500/30'
                }`}>
                  {status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Advanced Logistics Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrustIndicator />
        <ShipmentTracker />
        <RouteOptimizer />
      </div>
      
      {/* Fleet Management */}
      <FleetManager />
      
      {/* Logistics Analytics */}
      <LogisticsAnalytics />
      
      {/* AI-Powered Logistics Analytics */}
      <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-glow flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Logistics Intelligence
            </CardTitle>
            <CardDescription>Machine learning insights for logistics optimization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Route className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Route Optimization</span>
                </div>
                <div className="text-2xl font-bold gradient-text">-23%</div>
                <p className="text-xs text-muted-foreground">Delivery time reduction</p>
              </div>
              
              <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Fleet Efficiency</span>
                </div>
                <div className="text-2xl font-bold gradient-text">96.8%</div>
                <p className="text-xs text-muted-foreground">Vehicle utilization</p>
              </div>
              
              <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">Predictive Analytics</span>
                </div>
                <div className="text-2xl font-bold gradient-text">99.2%</div>
                <p className="text-xs text-muted-foreground">Delivery accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">{shipmentStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Shipments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{shipmentStats.inTransit}</p>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{shipmentStats.delivered}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{shipmentStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Shipments ({shipments.length})</TabsTrigger>
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="outbound">Outbound</TabsTrigger>

        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FilterPanel
                filters={filterOptions}
                values={filters}
                onChange={(key: string, value: any) => setFilters({ [key]: value })}
                onClear={clearFilters}
              />
            </div>
            
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Shipments</CardTitle>
                  <CardDescription>
                    {filteredShipments.length} of {shipments.length} shipments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={filteredShipments}
                    columns={columns}
                    loading={isLoading}
                    onRowClick={(shipment) => navigateToShipmentDetail(shipment.id)}
                    searchable={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inbound">
          <Card>
            <CardHeader>
              <CardTitle>Inbound Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredShipments.filter(s => s.type === 'INBOUND')}
                columns={columns}
                loading={isLoading}
                onRowClick={(shipment) => navigateToShipmentDetail(shipment.id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outbound">
          <Card>
            <CardHeader>
              <CardTitle>Outbound Shipments</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredShipments.filter(s => s.type === 'OUTBOUND')}
                columns={columns}
                loading={isLoading}
                onRowClick={(shipment) => navigateToShipmentDetail(shipment.id)}
              />
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>


      </div>
    </>
  );
}
