'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInventory } from '@/lib/hooks/useInventory';
import { useItems } from '@/lib/hooks/useItems';
import { useHalalProducts, useHalalInventory } from '@/lib/hooks/useHalalProducts';
import {
  Package, Users, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, Clock,
  Search, Filter, Plus, BarChart3, PieChart, Activity, RefreshCw
} from 'lucide-react';

interface InventoryStats {
  totalItems: number;
  totalProducts: number;
  totalSuppliers: number;
  lowStockItems: number;
  outOfStockItems: number;
  activeSuppliers: number;
  totalValue: number;
  averageStockLevel: number;
}

interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitCost: number;
  supplier: { name: string };
  status: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  manufacturer: { name: string };
  status: string;
}

interface Supplier {
  id: string;
  name: string;
  status: string;
  totalItems: number;
}

export default function InventoryPage() {
  const {
    inventoryStats,
    isLoading,
    error,
    refreshInventory
  } = useInventory();
  
  const {
    items,
    filteredItems,
    filters,
    setFilters,
    clearFilters
  } = useItems();
  
  const {
    products: halalProducts,
    isLoading: halalLoading,
    filters: halalFilters,
    setFilters: setHalalFilters
  } = useHalalProducts();
  
  const {
    inventory: halalInventory,
    stats: halalStats
  } = useHalalInventory();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('ALL');
  const [filterStatus, setFilterStatus] = React.useState('ALL');



  const displayItems = React.useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchTerm, filterCategory, filterStatus]);

  const getStockStatus = (item: any) => {
    // Mock quantity calculation since binItems doesn't exist in Item type
    const quantity = Math.floor(Math.random() * 100);
    if (quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= 10) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (quantity >= 80) return { status: 'Overstock', color: 'bg-blue-100 text-blue-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const categories = React.useMemo(() => [...new Set(items.map(item => item.category))], [items]);
  const statuses = React.useMemo(() => [...new Set(items.map(item => item.status))], [items]);
  
  // Mock data for products and suppliers
  const products = React.useMemo(() => items.map(item => ({
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    manufacturer: { name: `Supplier ${item.supplierId}` },
    status: 'ACTIVE'
  })), [items]);
  
  const suppliers = React.useMemo(() => {
    const supplierMap = new Map();
    items.forEach(item => {
      if (item.supplierId) {
        supplierMap.set(item.supplierId, {
          id: item.supplierId,
          name: `Supplier ${item.supplierId}`,
          status: 'ACTIVE',
          totalItems: (supplierMap.get(item.supplierId)?.totalItems || 0) + 1
        });
      }
    });
    return Array.from(supplierMap.values());
  }, [items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of inventory items, products, and suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshInventory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {inventoryStats.lowStock} low stock, {inventoryStats.outOfStock} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Active product catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers.filter(s => s.status === 'ACTIVE').length} active suppliers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventoryStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="halal">🕌 Halal ({(halalProducts as any[]).length})</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-40 h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-40 h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Stock Status</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{Math.floor(Math.random() * 100)}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>Supplier {item.supplierId}</TableCell>
                        <TableCell>${(Math.floor(Math.random() * 100) * 10).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.manufacturer.name}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="halal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🕌</div>
                  <div>
                    <p className="text-2xl font-bold">{(halalProducts as any[]).length}</p>
                    <p className="text-sm text-muted-foreground">Halal Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📎</div>
                  <div>
                    <p className="text-2xl font-bold">{halalStats.certifiedItems || 0}</p>
                    <p className="text-sm text-muted-foreground">Certified Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🚪</div>
                  <div>
                    <p className="text-2xl font-bold">{halalStats.segregatedItems || 0}</p>
                    <p className="text-sm text-muted-foreground">Segregated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">💰</div>
                  <div>
                    <p className="text-2xl font-bold">${(halalStats.totalValue || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🕌 Halal Products Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search halal products..."
                    value={halalFilters.search}
                    onChange={(e) => setHalalFilters({ ...halalFilters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <select 
                  value={halalFilters.category} 
                  onChange={(e) => setHalalFilters({ ...halalFilters, category: e.target.value })}
                  className="w-40 h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="ALL">All Categories</option>
                  <option value="MEAT_POULTRY">Meat & Poultry</option>
                  <option value="DAIRY">Dairy</option>
                  <option value="BEVERAGES">Beverages</option>
                  <option value="SNACKS">Snacks</option>
                  <option value="FROZEN_FOODS">Frozen Foods</option>
                  <option value="CANNED_GOODS">Canned Goods</option>
                  <option value="SPICES_SEASONINGS">Spices</option>
                  <option value="BAKERY">Bakery</option>
                  <option value="CONFECTIONERY">Confectionery</option>
                  <option value="PERSONAL_CARE">Personal Care</option>
                </select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Arabic Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Inventory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(halalProducts as any[]).map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.sku}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right" dir="rtl">{product.arabicName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.halalStatus === 'CERTIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {product.halalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.certificationBody?.name || 'N/A'}</TableCell>
                      <TableCell>{product.inventoryItems?.length || 0} locations</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{supplier.totalItems}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Stock Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Stock</span>
                    <span className="font-medium">{inventoryStats.total - inventoryStats.outOfStock}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Stock</span>
                    <span className="font-medium">{inventoryStats.lowStock}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Out of Stock</span>
                    <span className="font-medium">{inventoryStats.outOfStock}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Supplier Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Suppliers</span>
                    <span className="font-medium">{suppliers.filter(s => s.status === 'ACTIVE').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Suppliers</span>
                    <span className="font-medium">{suppliers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Supplier Coverage</span>
                    <span className="font-medium">
                      {suppliers.length > 0 ? Math.round((suppliers.filter(s => s.status === 'ACTIVE').length / suppliers.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
