'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useLocations } from '@/lib/hooks/useLocations';
import { useWebSocket } from '@/lib/websocket';
import {
  MapPin, Building, Grid, Package, RefreshCw, BarChart3, Plus,
  TrendingUp, AlertTriangle, Search, Map
} from 'lucide-react';

export default function LocationsPage() {
  const router = useRouter();
  const {
    locations,
    filteredLocations,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    refreshLocations
  } = useLocations();
  
  const { isConnected } = useWebSocket();

  const navigateToDetail = (locationId: string) => {
    router.push(`/locations/${locationId}`);
  };

  const navigateToZones = () => {
    router.push('/zones');
  };

  const navigateToRacks = () => {
    router.push('/racks');
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const filterOptions = [
    {
      key: 'type',
      label: 'Location Type',
      type: 'select' as const,
      options: [
        { value: 'BIN', label: 'Bin' },
        { value: 'SHELF', label: 'Shelf' },
        { value: 'FLOOR', label: 'Floor' },
        { value: 'CONVEYOR', label: 'Conveyor' },
        { value: 'DOCK', label: 'Dock' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'BLOCKED', label: 'Blocked' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search by code, name, or coordinates'
    }
  ];

  const columns = [
    {
      key: 'code' as const,
      header: 'Location Code',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },

    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <StatusBadge status={value?.toLowerCase() as any} />
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <StatusBadge status={value?.toLowerCase() as any} />
      )
    },
    {
      key: 'capacity' as const,
      header: 'Capacity'
    },
    {
      key: 'currentLoad' as const,
      header: 'Current Load'
    },
    {
      key: 'coordinates' as const,
      header: 'Coordinates',
      render: (value: any) => value ? `${value.x}, ${value.y}` : '-'
    }
  ];

  const locationStats = React.useMemo(() => ({
    total: locations.length,
    active: locations.filter(loc => loc.status === 'ACTIVE').length,
    inactive: locations.filter(loc => loc.status === 'INACTIVE').length,
    maintenance: locations.filter(loc => loc.status === 'MAINTENANCE').length,
  }), [locations]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-muted-foreground">
            Manage warehouse locations and storage hierarchy
            {isConnected && <span className="ml-2 text-green-600">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshLocations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToZones} variant="outline">
            <Building className="h-4 w-4 mr-2" />
            Zones
          </Button>
          <Button onClick={navigateToRacks} variant="outline">
            <Grid className="h-4 w-4 mr-2" />
            Racks
          </Button>
          <Button onClick={() => router.push('/analytics')} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{locationStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{locationStats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{locationStats.inactive}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{locationStats.maintenance}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
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
            onChange={handleFilterChange}
            onClear={clearFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Location Directory</CardTitle>
              <CardDescription>
                {filteredLocations.length} of {locations.length} locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredLocations}
                columns={columns}
                loading={isLoading}
                onRowClick={(location) => navigateToDetail(location.id)}
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}