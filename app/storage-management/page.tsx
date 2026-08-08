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
import { AlertCircle, Plus, Edit, Trash2, Warehouse, Building2, Grid3X3, Package, Layout, Map, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
    position: {
      row: number;
      column: number;
    };
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

interface RackingLayoutProps {
  racks: StorageEntity[];
  bins: StorageEntity[];
  onBinClick?: (bin: StorageEntity) => void;
}

interface BinVisual {
  id: string;
  code: string;
  utilization: number;
  status: string;
  capacity: number;
  occupied: number;
  position: {
    row: number;
    column: number;
    level: number;
  };
}

function RackingLayout({ racks, bins, onBinClick }: RackingLayoutProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedRack, setSelectedRack] = useState<string | null>(null);
  const [layoutView, setLayoutView] = useState<'2d' | '3d'>('2d');

  // Group bins by rack
  const binsByRack = bins.reduce((acc, bin) => {
    const rackCode = bin.rack?.code || 'unknown';
    if (!acc[rackCode]) {
      acc[rackCode] = [];
    }
    acc[rackCode].push(bin);
    return acc;
  }, {} as Record<string, StorageEntity[]>);

  // Get bins for selected rack or all racks
  const displayBins = selectedRack ? binsByRack[selectedRack] || [] : bins;

  // Find max dimensions for grid layout
  const maxRow = Math.max(...displayBins.map(bin => bin.rack?.position?.row || 0));
  const maxColumn = Math.max(...displayBins.map(bin => bin.rack?.position?.column || 0));
  const maxLevel = Math.max(...displayBins.map(bin => bin.rack?.level || 0));

  const getBinColor = (utilization: number, status: string) => {
    if (status !== 'ACTIVE') return 'bg-gray-300';
    if (utilization >= 90) return 'bg-red-500';
    if (utilization >= 70) return 'bg-yellow-500';
    if (utilization >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getBinTooltip = (bin: StorageEntity) => {
    return `Code: ${bin.code}\nUtilization: ${bin.utilization}%\nCapacity: ${bin.capacity}\nOccupied: ${bin.occupied}\nStatus: ${bin.status}`;
  };

  const render2DLayout = () => {
    const grid = [];

    for (let level = maxLevel; level >= 1; level--) {
      const levelBins = displayBins.filter(bin => bin.rack?.level === level);

      if (levelBins.length === 0) continue;

      grid.push(
        <div key={`level-${level}`} className="mb-6">
          <h4 className="text-sm font-medium mb-2">Level {level}</h4>
          <div
            className="grid gap-1 p-4 bg-gray-100 rounded-lg border"
            style={{
              gridTemplateColumns: `repeat(${maxColumn}, minmax(0, 1fr))`,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left'
            }}
          >
            {Array.from({ length: maxRow * maxColumn }).map((_, index) => {
              const row = Math.floor(index / maxColumn) + 1;
              const column = (index % maxColumn) + 1;
              const bin = levelBins.find(b =>
                b.rack?.position?.row === row && b.rack?.position?.column === column
              );

              return (
                <div
                  key={`${level}-${row}-${column}`}
                  className={`
                    aspect-square border rounded cursor-pointer transition-all duration-200
                    ${bin
                      ? `${getBinColor(bin.utilization, bin.status || 'ACTIVE')} text-white font-medium text-xs flex items-center justify-center hover:opacity-80`
                      : 'bg-white border-dashed'
                    }
                  `}
                  title={bin ? getBinTooltip(bin) : `Empty slot - Level ${level}, Row ${row}, Column ${column}`}
                  onClick={() => bin && onBinClick?.(bin)}
                >
                  {bin && (
                    <div className="text-center p-1">
                      <div className="font-bold">{bin.code.split('-').pop()}</div>
                      <div className="text-xs opacity-90">{bin.utilization}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return grid;
  };

  const render3DLayout = () => {
    return (
      <div className="space-y-4">
        {racks.map(rack => {
          const rackBins = binsByRack[rack.code] || [];
          const levels = [...new Set(rackBins.map(bin => bin.rack?.level))].sort();

          return (
            <div key={rack.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">{rack.code}</h4>
                <Badge variant="secondary">
                  {rackBins.length} bins · {rack.utilization}% utilized
                </Badge>
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2">
                {levels.map(level => {
                  const levelBins = rackBins.filter(bin => bin.rack?.level === level);

                  return (
                    <div key={level} className="flex-shrink-0">
                      <div className="text-xs text-center mb-1">Level {level}</div>
                      <div className="bg-gray-50 p-2 rounded border">
                        <div className="grid grid-cols-2 gap-1">
                          {levelBins.map(bin => (
                            <div
                              key={bin.id}
                              className={`
                                w-12 h-12 border rounded cursor-pointer transition-all
                                ${getBinColor(bin.utilization, bin.status || 'ACTIVE')}
                                text-white text-xs flex items-center justify-center hover:opacity-80
                              `}
                              title={getBinTooltip(bin)}
                              onClick={() => onBinClick?.(bin)}
                            >
                              <div className="text-center">
                                <div className="font-bold">{bin.utilization}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Racking Layout</CardTitle>
            <CardDescription>
              Visual representation of storage racks and bins
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedRack || 'all'} onValueChange={(value) => setSelectedRack(value === 'all' ? null : value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Racks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Racks</SelectItem>
                {racks.map(rack => (
                  <SelectItem key={rack.id} value={rack.code}>
                    {rack.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border rounded-md">
              <Button
                variant={layoutView === '2d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutView('2d')}
                className="px-3"
              >
                <Map className="h-4 w-4" />
              </Button>
              <Button
                variant={layoutView === '3d' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayoutView('3d')}
                className="px-3"
              >
                <Layout className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                className="px-3"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(1)}
                className="px-3"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                className="px-3"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs">Low (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs">Medium (50-70%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs">High (70-90%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs">Critical (&gt;90%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-xs">Inactive</span>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
          {layoutView === '2d' ? render2DLayout() : render3DLayout()}
        </div>

        {displayBins.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No bins found for the selected rack
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function StorageManagementPage() {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<StorageEntity | null>(null);
  const [selectedBin, setSelectedBin] = useState<StorageEntity | null>(null);
  const [binDialogOpen, setBinDialogOpen] = useState(false);
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
    row: '',
    column: '',
    level: '',
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
        row: '',
        column: '',
        level: '',
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
      row: entity.rack?.position?.row?.toString() || '',
      column: entity.rack?.position?.column?.toString() || '',
      level: entity.rack?.level?.toString() || '',
    });
    setEditDialogOpen(true);
  };

  const handleBinClick = (bin: StorageEntity) => {
    setSelectedBin(bin);
    setBinDialogOpen(true);
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
          <DialogContent className="max-w-2xl">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="aisles">Aisles</TabsTrigger>
          <TabsTrigger value="racks">Racks</TabsTrigger>
          <TabsTrigger value="bins">Bins</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">Overall Utilization</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.overallUtilization}%</div>
                <Progress value={data.summary.overallUtilization} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.activeSections}</div>
                <p className="text-xs text-muted-foreground">
                  Out of {data.storageSections.data.length} total
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
                  Out of {data.storageBins.data.length} total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <RackingLayout
              racks={data.storageUnits.data}
              bins={data.storageBins.data}
              onBinClick={handleBinClick}
            />
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
                      <TableCell>{zone.warehouse?.code}</TableCell>
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
                    <TableHead>Name</TableHead>
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
                      <TableCell>{aisle.name}</TableCell>
                      <TableCell>{aisle.zone?.code}</TableCell>
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

