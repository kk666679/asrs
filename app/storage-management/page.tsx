'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Plus, Edit, Trash2, Warehouse, Building2, Grid3X3, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StorageEntity {
  id: string;
  code: string;
  name?: string;
  capacity: number;
  occupied: number;
  utilization: number;
  warehouse?: {
    code: string;
    name: string;
  };
  zone?: {
    code: string;
    name: string;
  };
  aisle?: {
    code: string;
    number: number;
  };
  rack?: {
    code: string;
    level: number;
  };
  status?: string;
  active?: boolean;
}

interface StorageData {
  storageTypes: {
    data: StorageEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  storageSections: {
    data: StorageEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  storageUnits: {
    data: StorageEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  storageBins: {
    data: StorageEntity[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  summary: {
    totalCapacity: number;
    totalOccupied: number;
    overallUtilization: number;
    activeStorageTypes: number;
    activeSections: number;
    activeUnits: number;
    activeBins: number;
  };
}

export default function StorageManagementPage() {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<StorageEntity | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    code: '',
    name: '',
    warehouseId: '',
    zoneId: '',
    aisleId: '',
    rackId: '',
    capacity: '',
    weightLimit: '',
    barcode: '',
  });

  useEffect(() => {
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/storage-management');
      if (!response.ok) {
        throw new Error('Failed to fetch storage data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/storage-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create entity');
      }

      setCreateDialogOpen(false);
      setFormData({
        type: '',
        code: '',
        name: '',
        warehouseId: '',
        zoneId: '',
        aisleId: '',
        rackId: '',
        capacity: '',
        weightLimit: '',
        barcode: '',
      });
      fetchStorageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entity');
    }
  };

  const handleUpdate = async () => {
    if (!selectedEntity) return;

    try {
      const response = await fetch(`/api/storage-management?id=${selectedEntity.id}&type=${formData.type}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update entity');
      }

      setEditDialogOpen(false);
      setSelectedEntity(null);
      fetchStorageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entity');
    }
  };

  const handleDelete = async (entity: StorageEntity, type: string) => {
    if (!confirm(`Are you sure you want to delete ${entity.code}?`)) return;

    try {
      const response = await fetch(`/api/storage-management?id=${entity.id}&type=${type}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete entity');
      }

      fetchStorageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entity');
    }
  };

  const openEditDialog = (entity: StorageEntity, type: string) => {
    setSelectedEntity(entity);
    setFormData({
      type,
      code: entity.code,
      name: entity.name || '',
      warehouseId: entity.warehouse?.code || '',
      zoneId: entity.zone?.code || '',
      aisleId: entity.aisle?.code || '',
      rackId: entity.rack?.code || '',
      capacity: entity.capacity?.toString() || '',
      weightLimit: '',
      barcode: '',
    });
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading storage management data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Management</h1>
          <p className="text-muted-foreground">
            Manage warehouse storage hierarchy and utilization
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Storage Entity</DialogTitle>
              <DialogDescription>
                Add a new storage entity to the warehouse hierarchy.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zone">Zone</SelectItem>
                    <SelectItem value="aisle">Aisle</SelectItem>
                    <SelectItem value="rack">Rack</SelectItem>
                    <SelectItem value="bin">Bin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              {formData.type === 'zone' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="warehouseId" className="text-right">
                    Warehouse ID
                  </Label>
                  <Input
                    id="warehouseId"
                    value={formData.warehouseId}
                    onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}
              {formData.type === 'aisle' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zoneId" className="text-right">
                    Zone ID
                  </Label>
                  <Input
                    id="zoneId"
                    value={formData.zoneId}
                    onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}
              {formData.type === 'rack' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="aisleId" className="text-right">
                    Aisle ID
                  </Label>
                  <Input
                    id="aisleId"
                    value={formData.aisleId}
                    onChange={(e) => setFormData({ ...formData, aisleId: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              )}
              {formData.type === 'bin' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rackId" className="text-right">
                      Rack ID
                    </Label>
                    <Input
                      id="rackId"
                      value={formData.rackId}
                      onChange={(e) => setFormData({ ...formData, rackId: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weightLimit" className="text-right">
                      Weight Limit
                    </Label>
                    <Input
                      id="weightLimit"
                      type="number"
                      value={formData.weightLimit}
                      onChange={(e) => setFormData({ ...formData, weightLimit: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="barcode" className="text-right">
                      Barcode
                    </Label>
                    <Input
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.overallUtilization}%</div>
            <Progress value={data.summary.overallUtilization} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalCapacity.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.totalOccupied.toLocaleString()} occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.activeStorageTypes}</div>
            <p className="text-xs text-muted-foreground">
              Storage zones
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bins</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.activeBins}</div>
            <p className="text-xs text-muted-foreground">
              Storage locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="aisles">Aisles</TabsTrigger>
          <TabsTrigger value="racks">Racks</TabsTrigger>
          <TabsTrigger value="bins">Bins</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Storage Hierarchy</CardTitle>
                <CardDescription>Current storage structure overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Zones:</span>
                    <Badge variant="secondary">{data.storageTypes.data.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Aisles:</span>
                    <Badge variant="secondary">{data.storageSections.data.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Racks:</span>
                    <Badge variant="secondary">{data.storageUnits.data.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Bins:</span>
                    <Badge variant="secondary">{data.storageBins.data.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Utilization by Level</CardTitle>
                <CardDescription>Storage utilization breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Zones</span>
                      <span>{Math.round(data.storageTypes.data.reduce((sum, z) => sum + z.utilization, 0) / Math.max(data.storageTypes.data.length, 1))}%</span>
                    </div>
                    <Progress value={data.storageTypes.data.reduce((sum, z) => sum + z.utilization, 0) / Math.max(data.storageTypes.data.length, 1)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Aisles</span>
                      <span>{Math.round(data.storageSections.data.reduce((sum, a) => sum + a.utilization, 0) / Math.max(data.storageSections.data.length, 1))}%</span>
                    </div>
                    <Progress value={data.storageSections.data.reduce((sum, a) => sum + a.utilization, 0) / Math.max(data.storageSections.data.length, 1)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Racks</span>
                      <span>{Math.round(data.storageUnits.data.reduce((sum, r) => sum + r.utilization, 0) / Math.max(data.storageUnits.data.length, 1))}%</span>
                    </div>
                    <Progress value={data.storageUnits.data.reduce((sum, r) => sum + r.utilization, 0) / Math.max(data.storageUnits.data.length, 1)} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Bins</span>
                      <span>{Math.round(data.storageBins.data.reduce((sum, b) => sum + b.utilization, 0) / Math.max(data.storageBins.data.length, 1))}%</span>
                    </div>
                    <Progress value={data.storageBins.data.reduce((sum, b) => sum + b.utilization, 0) / Math.max(data.storageBins.data.length, 1)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Storage Zones</CardTitle>
              <CardDescription>Manage warehouse zones</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.storageTypes.data.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.code}</TableCell>
                      <TableCell>{zone.name}</TableCell>
                      <TableCell>{zone.warehouse?.name}</TableCell>
                      <TableCell>{zone.capacity.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={zone.utilization} className="w-16" />
                          <span className="text-sm">{zone.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(zone, 'zone')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(zone, 'zone')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aisles">
          <Card>
            <CardHeader>
              <CardTitle>Storage Aisles</CardTitle>
              <CardDescription>Manage warehouse aisles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.storageSections.data.map((aisle) => (
                    <TableRow key={aisle.id}>
                      <TableCell className="font-medium">{aisle.code}</TableCell>
                      <TableCell>{aisle.aisle?.number}</TableCell>
                      <TableCell>{aisle.zone?.name}</TableCell>
                      <TableCell>{aisle.capacity.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={aisle.utilization} className="w-16" />
                          <span className="text-sm">{aisle.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(aisle, 'aisle')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(aisle, 'aisle')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="racks">
          <Card>
            <CardHeader>
              <CardTitle>Storage Racks</CardTitle>
              <CardDescription>Manage warehouse racks</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Aisle</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.storageUnits.data.map((rack) => (
                    <TableRow key={rack.id}>
                      <TableCell className="font-medium">{rack.code}</TableCell>
                      <TableCell>{rack.rack?.level}</TableCell>
                      <TableCell>{rack.aisle?.code}</TableCell>
                      <TableCell>{rack.capacity.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rack.utilization} className="w-16" />
                          <span className="text-sm">{rack.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(rack, 'rack')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rack, 'rack')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bins">
          <Card>
            <CardHeader>
              <CardTitle>Storage Bins</CardTitle>
              <CardDescription>Manage warehouse bins</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Rack</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupied</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.storageBins.data.map((bin) => (
                    <TableRow key={bin.id}>
                      <TableCell className="font-medium">{bin.code}</TableCell>
                      <TableCell>{bin.rack?.code}</TableCell>
                      <TableCell>{bin.capacity.toLocaleString()}</TableCell>
                      <TableCell>{bin.occupied.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={bin.utilization} className="w-16" />
                          <span className="text-sm">{bin.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bin.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {bin.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(bin, 'bin')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(bin, 'bin')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Storage Entity</DialogTitle>
            <DialogDescription>
              Update the storage entity details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Code
              </Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            {formData.type === 'bin' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-capacity" className="text-right">
                  Capacity
                </Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
