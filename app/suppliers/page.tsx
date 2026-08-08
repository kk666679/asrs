'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, StatusBadge } from '@/components/shared';
import {
  Users, Building, Mail, Phone, RefreshCw, BarChart3, Plus,
  TrendingUp, AlertTriangle, Search, Package
} from 'lucide-react';

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Mock data - replace with actual API call
    setSuppliers([]);
    setLoading(false);
  }, []);

  const navigateToDetail = (supplierId: string) => {
    router.push(`/suppliers/${supplierId}`);
  };

  const navigateToItems = () => {
    router.push('/items');
  };

  const navigateToProducts = () => {
    router.push('/products');
  };

  const columns = [
    {
      key: 'code' as const,
      header: 'Code',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'name' as const,
      header: 'Supplier Name',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-green-500" />
          <span>{value}</span>
        </div>
      )
    },
    {
      key: 'contact' as const,
      header: 'Contact',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ) : '-'
    },
    {
      key: 'email' as const,
      header: 'Email',
      render: (value: string) => value ? (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ) : '-'
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
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage vendor relationships and supplier information
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
          <Button onClick={navigateToProducts} variant="outline">
            <Building className="h-4 w-4 mr-2" />
            Products
          </Button>
          <Button onClick={() => router.push('/analytics')} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
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
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supplier Directory</CardTitle>
          <CardDescription>
            Manage vendor relationships and supplier performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={suppliers}
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}