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
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  User,
  Package,
  Navigation
} from 'lucide-react';

interface YardSlot {
  id: string;
  location: string;
  type: 'loading' | 'unloading' | 'parking' | 'staging';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentVehicle?: {
    id: string;
    type: 'truck' | 'van' | 'forklift' | 'pallet_jack';
    licensePlate: string;
    driver: string;
    purpose: string;
    arrivalTime: string;
    expectedDeparture?: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  restrictions?: string[];
}

interface YardActivity {
  id: string;
  vehicleId: string;
  type: 'arrival' | 'departure' | 'loading' | 'unloading' | 'parking';
  timestamp: string;
  location: string;
  driver: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  notes?: string;
}

const statusColors = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  reserved: 'bg-yellow-500',
  maintenance: 'bg-gray-500',
};

const typeColors = {
  loading: 'bg-blue-500',
  unloading: 'bg-purple-500',
  parking: 'bg-green-500',
  staging: 'bg-orange-500',
};

const activityStatusColors = {
  completed: 'bg-green-500',
  in_progress: 'bg-blue-500',
  scheduled: 'bg-yellow-500',
};

export default function YardManagementPage() {
  const [yardSlots, setYardSlots] = useState<YardSlot[]>([]);
  const [activities, setActivities] = useState<YardActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('slots');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedSlot, setSelectedSlot] = useState<YardSlot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchYardData();
    const interval = setInterval(fetchYardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchYardData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockSlots: YardSlot[] = [
        {
          id: 'YS001',
          location: 'Dock A1',
          type: 'loading',
          status: 'occupied',
          currentVehicle: {
            id: 'TRK001',
            type: 'truck',
            licensePlate: 'ABC123',
            driver: 'Ahmad Rahman',
            purpose: 'Outbound delivery',
            arrivalTime: '2024-01-15T08:30:00Z',
            expectedDeparture: '2024-01-15T10:00:00Z'
          },
          dimensions: { length: 15, width: 3, height: 4 },
          restrictions: ['Heavy vehicles only']
        },
        {
          id: 'YS002',
          location: 'Dock B2',
          type: 'unloading',
          status: 'available',
          dimensions: { length: 12, width: 3, height: 4 },
          restrictions: ['Refrigerated vehicles preferred']
        },
        {
          id: 'YS003',
          location: 'Parking Lot P5',
          type: 'parking',
          status: 'reserved',
          currentVehicle: {
            id: 'VAN001',
            type: 'van',
            licensePlate: 'XYZ789',
            driver: 'Siti Aminah',
            purpose: 'Scheduled pickup',
            arrivalTime: '2024-01-15T09:00:00Z'
          },
          dimensions: { length: 8, width: 2.5, height: 3 },
        },
        {
          id: 'YS004',
          location: 'Staging Area S1',
          type: 'staging',
          status: 'maintenance',
          dimensions: { length: 20, width: 10, height: 5 },
          restrictions: ['No parking during maintenance']
        }
      ];

      const mockActivities: YardActivity[] = [
        {
          id: 'YA001',
          vehicleId: 'TRK001',
          type: 'arrival',
          timestamp: '2024-01-15T08:30:00Z',
          location: 'Dock A1',
          driver: 'Ahmad Rahman',
          status: 'completed',
          notes: 'Arrived on time for loading'
        },
        {
          id: 'YA002',
          vehicleId: 'VAN001',
          type: 'parking',
          timestamp: '2024-01-15T09:00:00Z',
          location: 'Parking Lot P5',
          driver: 'Siti Aminah',
          status: 'completed',
          notes: 'Reserved spot for afternoon pickup'
        },
        {
          id: 'YA003',
          vehicleId: 'TRK002',
          type: 'loading',
          timestamp: '2024-01-15T10:15:00Z',
          location: 'Dock B2',
          driver: 'Mohd Hassan',
          status: 'in_progress',
          notes: 'Loading halal products for distribution'
        }
      ];

      setYardSlots(mockSlots);
      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch yard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSlots = yardSlots.filter(slot => {
    const matchesSearch = slot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slot.currentVehicle?.licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
    const matchesType = typeFilter === 'all' || slot.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredActivities = activities.filter(activity =>
    activity.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getActivityStatusBadge = (status: string) => {
    return (
      <Badge className={`${activityStatusColors[status as keyof typeof activityStatusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const yardStats = {
    totalSlots: yardSlots.length,
    available: yardSlots.filter(s => s.status === 'available').length,
    occupied: yardSlots.filter(s => s.status === 'occupied').length,
    reserved: yardSlots.filter(s => s.status === 'reserved').length,
    maintenance: yardSlots.filter(s => s.status === 'maintenance').length,
  };

  const activityStats = {
    total: activities.length,
    completed: activities.filter(a => a.status === 'completed').length,
    inProgress: activities.filter(a => a.status === 'in_progress').length,
    scheduled: activities.filter(a => a.status === 'scheduled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading yard management data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Yard Management</h1>
          <p className="text-muted-foreground">Manage yard slots, vehicle parking, and loading/unloading operations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Vehicle
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{yardStats.totalSlots}</p>
                <p className="text-sm text-muted-foreground">Total Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{yardStats.available}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{yardStats.occupied}</p>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{yardStats.reserved + yardStats.maintenance}</p>
                <p className="text-sm text-muted-foreground">Unavailable</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'slots' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('slots')}
          className="flex-1"
        >
          Yard Slots
        </Button>
        <Button
          variant={activeTab === 'activities' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('activities')}
          className="flex-1"
        >
          Activities
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search slots or activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {activeTab === 'slots' && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="loading">Loading</SelectItem>
                    <SelectItem value="unloading">Unloading</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Button onClick={fetchYardData}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yard Slots Tab */}
      {activeTab === 'slots' && (
        <Card>
          <CardHeader>
            <CardTitle>Yard Slots ({filteredSlots.length})</CardTitle>
            <CardDescription>Current status of all yard locations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Vehicle</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{slot.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(slot.type)}</TableCell>
                    <TableCell>{getStatusBadge(slot.status)}</TableCell>
                    <TableCell>
                      {slot.currentVehicle ? (
                        <div className="text-sm">
                          <p className="font-medium">{slot.currentVehicle.licensePlate}</p>
                          <p className="text-muted-foreground">{slot.currentVehicle.driver}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Empty</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {slot.dimensions.length}×{slot.dimensions.width}×{slot.dimensions.height}m
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedSlot?.id === slot.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Yard Slot Details - {slot.location}</DialogTitle>
                            <DialogDescription>
                              Detailed information about this yard location
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Slot ID</Label>
                                <p className="text-sm font-medium">{slot.id}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div>{getStatusBadge(slot.status)}</div>
                              </div>
                              <div>
                                <Label>Type</Label>
                                <div>{getTypeBadge(slot.type)}</div>
                              </div>
                              <div>
                                <Label>Location</Label>
                                <p className="text-sm">{slot.location}</p>
                              </div>
                            </div>

                            <div>
                              <Label>Dimensions</Label>
                              <p className="text-sm">
                                {slot.dimensions.length}m × {slot.dimensions.width}m × {slot.dimensions.height}m
                              </p>
                            </div>

                            {slot.restrictions && slot.restrictions.length > 0 && (
                              <div>
                                <Label>Restrictions</Label>
                                <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                                  {slot.restrictions.map((restriction, index) => (
                                    <li key={index}>{restriction}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {slot.currentVehicle && (
                              <div>
                                <Label>Current Vehicle</Label>
                                <div className="border rounded p-3 mt-2">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium">License Plate</p>
                                      <p className="text-sm">{slot.currentVehicle.licensePlate}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Type</p>
                                      <p className="text-sm capitalize">{slot.currentVehicle.type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Driver</p>
                                      <p className="text-sm">{slot.currentVehicle.driver}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Purpose</p>
                                      <p className="text-sm">{slot.currentVehicle.purpose}</p>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-sm font-medium">Arrival Time</p>
                                    <p className="text-sm">{new Date(slot.currentVehicle.arrivalTime).toLocaleString()}</p>
                                  </div>
                                  {slot.currentVehicle.expectedDeparture && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium">Expected Departure</p>
                                      <p className="text-sm">{new Date(slot.currentVehicle.expectedDeparture).toLocaleString()}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No yard slots found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <Card>
          <CardHeader>
            <CardTitle>Yard Activities ({filteredActivities.length})</CardTitle>
            <CardDescription>Recent vehicle movements and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.vehicleId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {activity.type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span className="text-sm">{activity.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-sm">{activity.driver}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getActivityStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm truncate">{activity.notes || 'No notes'}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No activities found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
