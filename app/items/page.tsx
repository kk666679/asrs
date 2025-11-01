'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useItems } from '@/lib/hooks/useItems';
import { useWebSocket } from '@/lib/websocket';
import {
  Package, Barcode, Tag, Users, RefreshCw, BarChart3, Plus,
  Search, Filter, TrendingUp, AlertTriangle
} from 'lucide-react';

export default function ItemsPage() {
  const router = useRouter();
  const {
    items,
    filteredItems,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    refreshItems
  } = useItems();
  
  const { isConnected } = useWebSocket();

  const navigateToDetail = (itemId: string) => {
    router.push(`/items/${itemId}`);
  };

  const navigateToProducts = () => {
    router.push('/products');
  };

  const navigateToSuppliers = () => {
    router.push('/suppliers');
  };

  const navigateToInventory = () => {
    router.push('/inventory');
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
  };

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Clothing', label: 'Clothing' },
        { value: 'Food', label: 'Food' },
        { value: 'Tools', label: 'Tools' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'DISCONTINUED', label: 'Discontinued' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search items by name, SKU, or description'
    }
  ];

  const columns = [
    {
      key: 'sku' as const,
      header: 'SKU',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Barcode className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'name' as const,
      header: 'Name',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-green-500" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'category' as const,
      header: 'Category',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Tag className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
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
      key: 'weight' as const,
      header: 'Weight (kg)'
    },
    {
      key: 'supplierId' as const,
      header: 'Supplier',
      render: (value: string) => `Supplier ${value}` || 'N/A'
    }
  ];

  const itemStats = React.useMemo(() => ({
    total: items.length,
    active: items.filter(item => item.status === 'ACTIVE').length,
    inactive: items.filter(item => item.status === 'INACTIVE').length,
    discontinued: items.filter(item => item.status === 'DISCONTINUED').length,
  }), [items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Item Catalog</h1>
          <p className="text-muted-foreground">
            Manage product catalog and item information
            {isConnected && <span className="ml-2 text-green-600">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshItems} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToProducts} variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Products
          </Button>
          <Button onClick={navigateToSuppliers} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Suppliers
          </Button>
          <Button onClick={navigateToInventory} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Inventory
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{itemStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{itemStats.active}</p>
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
                <p className="text-2xl font-bold">{itemStats.inactive}</p>
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
                <p className="text-2xl font-bold">{itemStats.discontinued}</p>
                <p className="text-sm text-muted-foreground">Discontinued</p>
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
              <CardTitle>Item Catalog</CardTitle>
              <CardDescription>
                {filteredItems.length} of {items.length} items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredItems}
                columns={columns}
                loading={isLoading}
                onRowClick={(item) => navigateToDetail(item.id)}
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}