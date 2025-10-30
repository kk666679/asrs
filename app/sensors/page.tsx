'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Thermometer, Droplets, Weight, Zap, Eye, Vibrate, Activity, AlertTriangle } from 'lucide-react';

interface Sensor {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  thresholdMin?: number;
  thresholdMax?: number;
  zone?: {
    code: string;
    name: string;
  };
  bin?: {
    code: string;
  };
  readings?: Array<{
    value: number;
    unit: string;
    timestamp: string;
  }>;
}

const sensorIcons = {
  TEMPERATURE: Thermometer,
  HUMIDITY: Droplets,
  WEIGHT: Weight,
  PRESSURE: Zap,
  MOTION: Eye,
  LIGHT: Activity,
  VIBRATION: Vibrate,
};

const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
  MAINTENANCE: 'bg-yellow-500',
  FAULTY: 'bg-red-500',
};

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSensors();
  }, [filterType, filterStatus]);

  const fetchSensors = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType && filterType !== 'all') params.append('type', filterType);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`/api/sensors?${params}`);
      if (!response.ok) throw new Error('Failed to fetch sensors');
      const data = await response.json();
      setSensors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sensors');
    } finally {
      setLoading(false);
    }
  };

  const filteredSensors = sensors.filter(sensor =>
    sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLatestReading = (sensor: Sensor) => {
    return sensor.readings?.[0];
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white`}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  const getSensorIcon = (type: string) => {
    const IconComponent = sensorIcons[type as keyof typeof sensorIcons] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sensors...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sensor Monitoring</h1>
          <p className="text-muted-foreground">Monitor IoT sensors across your warehouse</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search sensors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Sensor Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="TEMPERATURE">Temperature</SelectItem>
                  <SelectItem value="HUMIDITY">Humidity</SelectItem>
                  <SelectItem value="WEIGHT">Weight</SelectItem>
                  <SelectItem value="PRESSURE">Pressure</SelectItem>
                  <SelectItem value="MOTION">Motion</SelectItem>
                  <SelectItem value="LIGHT">Light</SelectItem>
                  <SelectItem value="VIBRATION">Vibration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="FAULTY">Faulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSensors} className="w-full">
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sensors ({filteredSensors.length})</CardTitle>
          <CardDescription>Real-time sensor data and status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sensor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latest Reading</TableHead>
                <TableHead>Thresholds</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSensors.map((sensor) => {
                const latestReading = getLatestReading(sensor);
                return (
                  <TableRow key={sensor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSensorIcon(sensor.type)}
                        <div>
                          <div className="font-medium">{sensor.name}</div>
                          <div className="text-sm text-muted-foreground">{sensor.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{sensor.type.toLowerCase()}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sensor.zone && <div>Zone: {sensor.zone.code}</div>}
                        {sensor.bin && <div>Bin: {sensor.bin.code}</div>}
                        {sensor.location && <div>{sensor.location}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                    <TableCell>
                      {latestReading ? (
                        <div className="text-sm">
                          <div className="font-medium">{latestReading.value} {latestReading.unit}</div>
                          <div className="text-muted-foreground">
                            {new Date(latestReading.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {sensor.thresholdMin !== undefined && (
                          <div>Min: {sensor.thresholdMin}</div>
                        )}
                        {sensor.thresholdMax !== undefined && (
                          <div>Max: {sensor.thresholdMax}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedSensor?.id === sensor.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSensor(sensor)}
                          >
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getSensorIcon(sensor.type)}
                              {sensor.name} ({sensor.code})
                            </DialogTitle>
                            <DialogDescription>
                              Sensor details and recent readings
                            </DialogDescription>
                          </DialogHeader>
                          {selectedSensor && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Type</Label>
                                  <div className="text-sm">{selectedSensor.type}</div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div>{getStatusBadge(selectedSensor.status)}</div>
                                </div>
                                <div>
                                  <Label>Location</Label>
                                  <div className="text-sm">
                                    {selectedSensor.zone && `Zone: ${selectedSensor.zone.name}`}
                                    {selectedSensor.bin && `Bin: ${selectedSensor.bin.code}`}
                                  </div>
                                </div>
                                <div>
                                  <Label>Thresholds</Label>
                                  <div className="text-sm">
                                    Min: {selectedSensor.thresholdMin ?? 'N/A'}<br />
                                    Max: {selectedSensor.thresholdMax ?? 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Recent Readings</Label>
                                <div className="mt-2 max-h-40 overflow-y-auto">
                                  {selectedSensor.readings?.slice(0, 10).map((reading, index) => (
                                    <div key={index} className="flex justify-between py-1 border-b text-sm">
                                      <span>{new Date(reading.timestamp).toLocaleString()}</span>
                                      <span>{reading.value} {reading.unit}</span>
                                    </div>
                                  )) || <div className="text-muted-foreground">No readings available</div>}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
