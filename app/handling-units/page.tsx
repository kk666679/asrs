'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  QrCode,
  Scale,
  MapPin,
  Calendar,
  User
} from 'lucide-react';

interface HandlingUnit {
  id: string;
  type: 'pallet' | 'carton' | 'crate' | 'bin';
  barcode: string;
  contents: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  location: string;
  status: 'available' | 'in_transit' | 'damaged' | 'quarantined';
  createdAt: string;
  lastModified: string;
  assignedTo?: string;
}

const statusColors = {
  available: 'bg-green-500',
  in_transit: 'bg-yellow-500',
  damaged: 'bg-red-500',
  quarantined: 'bg-orange-500',
};

const typeColors = {
  pallet: 'bg-blue-500',
  carton: 'bg-purple-500',
  crate: 'bg-brown-500',
  bin: 'bg-gray-500',
};

export default function HandlingUnitsPage() {
  const [handlingUnits, setHandlingUnits] = useState<HandlingUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState<HandlingUnit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchHandlingUnits();
    const interval = setInterval(fetchHandlingUnits, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHandlingUnits = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockUnits: HandlingUnit[] = [
        {
          id: 'HU001',
          type: 'pallet',
          barcode: 'HU001234567',
          contents: [
            { itemId: 'ITM001', itemName: 'Halal Chicken Breast', quantity: 50, batchNumber: 'BCH20240101', expiryDate: '2024-06-01' },
            { itemId: 'ITM002', itemName: 'Organic Rice', quantity: 100, batchNumber: 'BOR20240101', expiryDate: '2025-01-01' },
          ],
          weight: 250.5,
          dimensions: { length: 120, width: 80, height: 150 },
          location: 'Aisle 3, Level 2, Position 5',
          status: 'available',
          createdAt: '2024-01-10T08:00:00Z',
          lastModified: '2024-01-15T10:30:00Z',
          assignedTo: 'Shuttle #1'
        },
        {
          id: 'HU002',
          type: 'carton',
          barcode: 'HU001234568',
          contents: [
            { itemId: 'ITM003', itemName: 'Halal Beef', quantity: 25, batchNumber: 'BBF20240102', expiryDate: '2024-05-15' },
          ],
          weight: 15.2,
          dimensions: { length: 40, width: 30, height: 25 },
          location: 'Aisle 5, Level 1, Position 12',
          status: 'in_transit',
          createdAt: '2024-01-12T14:00:00Z',
          lastModified: '2024-01-15T11:00:00Z',
          assignedTo: 'Conveyor B'
        },
        {
          id: 'HU003',
          type: 'bin',
          barcode: 'HU001234569',
          contents: [
            { itemId: 'ITM004', itemName: 'Fresh Vegetables', quantity: 75, batchNumber: 'BVG20240103', expiryDate: '2024-01-20' },
          ],
          weight: 8.5,
          dimensions: { length: 50, width: 40, height: 30 },
          location: 'Quarantine Zone',
          status: 'quarantined',
          createdAt: '2024-01-14T09:00:00Z',
          lastModified: '2024-01-15T08:00:00Z'
        }
      ];

      setHandlingUnits(mockUnits);
    } catch (error) {
      console.error('Failed to fetch handling units:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = handlingUnits.filter(unit => {
    const matchesSearch = unit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.contents.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    const matchesType = typeFilter === 'all' || unit.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge className={`${typeColors[type as keyof typeof typeColors]} text-white text-xs`}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const updateUnitStatus = (unitId: string, newStatus: HandlingUnit['status']) => {
    setHandlingUnits(prev => prev.map(unit =>
      unit.id === unitId ? { ...unit, status: newStatus, lastModified: new Date().toISOString() } : unit
    ));
  };

  const unitStats = {
    total: handlingUnits.length,
    available: handlingUnits.filter(u => u.status === 'available').length,
    inTransit: handlingUnits.filter(u => u.status === 'in_transit').length,
    damaged: handlingUnits.filter(u => u.status === 'damaged').length,
    quarantined: handlingUnits.filter(u => u.status === 'quarantined').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading handling units...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Handling Units</h1>
          <p className="text-muted-foreground">Manage pallets, cartons, crates, and bins in the warehouse</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Handling Unit
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{unitStats.total}</p>
                <p className="text-sm text-muted-foreground">Total Units</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{unitStats.available}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{unitStats.inTransit}</p>
                <p className="text-sm text-muted-foreground">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{unitStats.damaged}</p>
                <p className="text-sm text-muted-foreground">Damaged</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{unitStats.quarantined}</p>
                <p className="text-sm text-muted-foreground">Quarantined</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                  <SelectItem value="quarantined">Quarantined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pallet">Pallet</SelectItem>
                  <SelectItem value="carton">Carton</SelectItem>
                  <SelectItem value="crate">Crate</SelectItem>
                  <SelectItem value="bin">Bin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchHandlingUnits} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Handling Units ({filteredUnits.length})</CardTitle>
          <CardDescription>Current handling units and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead>Contents</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.id}</TableCell>
                  <TableCell>{getTypeBadge(unit.type)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      <span className="text-sm font-mono">{unit.barcode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {unit.contents.length} item{unit.contents.length !== 1 ? 's' : ''} (
                      {unit.contents.reduce((sum, item) => sum + item.quantity, 0)} units)
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Scale className="h-3 w-3" />
                      <span className="text-sm">{unit.weight} kg</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {unit.location}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(unit.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog open={isDialogOpen && selectedUnit?.id === unit.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUnit(unit)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Handling Unit Details - {unit.id}</DialogTitle>
                            <DialogDescription>
                              Detailed information about this handling unit
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Type</Label>
                                <div>{getTypeBadge(unit.type)}</div>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div>{getStatusBadge(unit.status)}</div>
                              </div>
                              <div>
                                <Label>Barcode</Label>
                                <p className="text-sm font-mono">{unit.barcode}</p>
                              </div>
                              <div>
                                <Label>Weight</Label>
                                <p className="text-sm">{unit.weight} kg</p>
                              </div>
                              <div>
                                <Label>Dimensions (L×W×H)</Label>
                                <p className="text-sm">{unit.dimensions.length}×{unit.dimensions.width}×{unit.dimensions.height} cm</p>
                              </div>
                              <div>
                                <Label>Location</Label>
                                <p className="text-sm">{unit.location}</p>
                              </div>
                            </div>

                            {unit.assignedTo && (
                              <div>
                                <Label>Assigned To</Label>
                                <p className="text-sm">{unit.assignedTo}</p>
                              </div>
                            )}

                            <div>
                              <Label>Contents</Label>
                              <div className="space-y-2 mt-2">
                                {unit.contents.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                      <p className="text-sm font-medium">{item.itemName}</p>
                                      <p className="text-xs text-muted-foreground">ID: {item.itemId}</p>
                                      {item.batchNumber && <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">Qty: {item.quantity}</p>
                                      {item.expiryDate && (
                                        <p className="text-xs text-muted-foreground">
                                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created: {new Date(unit.createdAt).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Modified: {new Date(unit.lastModified).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Close
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUnits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">No handling units found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
