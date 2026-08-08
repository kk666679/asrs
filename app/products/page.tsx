'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, StatusBadge } from '@/components/shared';
import {
  Package, Factory, Tag, Ruler, RefreshCw, BarChart3, Plus,
  TrendingUp, AlertTriangle, Search
} from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Mock data - replace with actual API call
    setProducts([]);
    setLoading(false);
  }, []);

  const navigateToDetail = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const navigateToItems = () => {
    router.push('/items');
  };

  const navigateToSuppliers = () => {
    router.push('/suppliers');
  };

  const columns = [
    {
      key: 'sku' as const,
      header: 'SKU',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'name' as const,
      header: 'Product Name'
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
      key: 'manufacturer' as const,
      header: 'Manufacturer',
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <Factory className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value?.name || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'weight' as const,
      header: 'Weight (kg)'
    },
    {
      key: 'dimensions' as const,
      header: 'Dimensions',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <Ruler className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <StatusBadge status={value?.toLowerCase() as any} />
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Manage product specifications and manufacturing details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToItems} variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Items
          </Button>
          <Button onClick={navigateToSuppliers} variant="outline">
            <Factory className="h-4 w-4 mr-2" />
            Suppliers
          </Button>
          <Button onClick={() => router.push('/analytics')} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">0</p>
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
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Factory className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Manufacturers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Manage product specifications and manufacturing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}