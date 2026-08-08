'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useMovements } from '@/lib/hooks/useMovements';
import { useWebSocket } from '@/lib/websocket';
import {
  ArrowRightLeft, Package, MapPin, Clock, User, RefreshCw,
  AlertTriangle, BarChart3, Activity, TrendingUp, Plus
} from 'lucide-react';

export default function MovementsPage() {
  const router = useRouter();
  const {
    movements,
    filteredMovements,
    movementStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    createMovement,
    refreshMovements
  } = useMovements();
  
  const { isConnected } = useWebSocket();

  const navigateToDetail = (movementId: string) => {
    router.push(`/movements/${movementId}`);
  };

  const navigateToAnalytics = () => {
    router.push('/analytics');
  };

  const navigateToTransactions = () => {
    router.push('/transactions');
  };

  const navigateToLocations = () => {
    router.push('/locations');
  };

  const filterOptions = [
    {
      key: 'type',
      label: 'Movement Type',
      type: 'select' as const,
      options: [
        { value: 'PUTAWAY', label: 'Putaway' },
        { value: 'PICKING', label: 'Picking' },
        { value: 'TRANSFER', label: 'Transfer' },
        { value: 'ADJUSTMENT', label: 'Adjustment' },
        { value: 'COUNT', label: 'Count' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'FAILED', label: 'Failed' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'LOW', label: 'Low' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'HIGH', label: 'High' },
        { value: 'URGENT', label: 'Urgent' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search movements, items, locations'
    }
  ];

  const columns = [
    {
      key: 'id' as const,
      header: 'Movement ID',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <StatusBadge status={value.toLowerCase() as any} />
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
      key: 'priority' as const,
      header: 'Priority',
      render: (value: string) => (
        <StatusBadge status={value.toLowerCase() as any} />
      )
    },
    {
      key: 'quantity' as const,
      header: 'Quantity'
    },
    {
      key: 'itemId' as const,
      header: 'Item',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'fromBinId' as const,
      header: 'From',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'toBinId' as const,
      header: 'To',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'timestamp' as const,
      header: 'Timestamp',
      render: (value: Date) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{new Date(value).toLocaleString()}</span>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading movements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Movement Tracking</h1>
          <p className="text-muted-foreground">
            Monitor all warehouse movements and transfers
            {isConnected && <span className="ml-2 text-green-600">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refreshMovements()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToAnalytics} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={navigateToTransactions} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Transactions
          </Button>
          <Button onClick={navigateToLocations} variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Locations
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{movementStats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{movementStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <ArrowRightLeft className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{movementStats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{movementStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{movementStats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              <CardTitle>Movement History</CardTitle>
              <CardDescription>
                {filteredMovements.length} of {movements.length} movements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredMovements}
                columns={columns}
                loading={isLoading}
                onRowClick={(movement) => navigateToDetail(movement.id)}
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}