'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Package, Truck, Clock, CheckCircle, AlertTriangle, Calculator, Play } from 'lucide-react';

interface PickingItem {
  itemId: string;
  quantity: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface PickingRequest {
  items: PickingItem[];
  constraints?: {
    maxWeight?: number;
    maxVolume?: number;
    timeWindow?: { start: string; end: string };
  };
}

interface PutawayRequest {
  itemId: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  constraints?: {
    temperature?: 'AMBIENT' | 'REFRIGERATED' | 'FROZEN';
    hazardLevel?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    maxWeight?: number;
  };
}

interface PickingRoute {
  sequence: number;
  binId: string;
  binCode: string;
  itemId: string;
  quantity: number;
  location: string;
  estimatedTime: number;
  distance: number;
}

interface OptimizedPickingPlan {
  routes: PickingRoute[];
  totalDistance: number;
  estimatedTime: number;
  efficiency: number;
}

interface PutawayResult {
  binId: string;
  binCode: string;
  location: string;
  score: number;
  reasons: string[];
}

export default function OptimizationPage() {
  const [activeTab, setActiveTab] = useState('picking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Picking state
  const [pickingItems, setPickingItems] = useState<PickingItem[]>([
    { itemId: '', quantity: 1, priority: 'MEDIUM' }
  ]);
  const [pickingConstraints, setPickingConstraints] = useState({
    maxWeight: '',
    maxVolume: '',
    timeWindowStart: '',
    timeWindowEnd: ''
  });
  const [pickingPlan, setPickingPlan] = useState<OptimizedPickingPlan | null>(null);
  const [executingPicking, setExecutingPicking] = useState(false);

  // Putaway state
  const [putawayRequest, setPutawayRequest] = useState<PutawayRequest>({
    itemId: '',
    quantity: 1,
    priority: 'MEDIUM'
  });
  const [putawayResult, setPutawayResult] = useState<PutawayResult | null>(null);
  const [executingPutaway, setExecutingPutaway] = useState(false);

  const addPickingItem = () => {
    setPickingItems([...pickingItems, { itemId: '', quantity: 1, priority: 'MEDIUM' }]);
  };

  const updatePickingItem = (index: number, field: keyof PickingItem, value: any) => {
    const updated = [...pickingItems];
    updated[index] = { ...updated[index], [field]: value };
    setPickingItems(updated);
  };

  const removePickingItem = (index: number) => {
    setPickingItems(pickingItems.filter((_, i) => i !== index));
  };

  const generatePickingPlan = async () => {
    setLoading(true);
    setError('');

    try {
      const request: PickingRequest = {
        items: pickingItems.filter(item => item.itemId.trim()),
        constraints: {
          maxWeight: pickingConstraints.maxWeight ? parseFloat(pickingConstraints.maxWeight) : undefined,
          maxVolume: pickingConstraints.maxVolume ? parseFloat(pickingConstraints.maxVolume) : undefined,
          timeWindow: pickingConstraints.timeWindowStart && pickingConstraints.timeWindowEnd ? {
            start: pickingConstraints.timeWindowStart,
            end: pickingConstraints.timeWindowEnd
          } : undefined
        }
      };

      const response = await fetch('/api/optimization?action=picking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate picking plan');
      }

      const data = await response.json();
      setPickingPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate picking plan');
    } finally {
      setLoading(false);
    }
  };

  const executePickingPlan = async () => {
    if (!pickingPlan) return;

    setExecutingPicking(true);
    setError('');

    try {
      const response = await fetch('/api/optimization?action=picking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routes: pickingPlan.routes,
          userId: 'user-1' // Mock user ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute picking plan');
      }

      alert('Picking plan executed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute picking plan');
    } finally {
      setExecutingPicking(false);
    }
  };

  const findPutawayLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const request = {
        ...putawayRequest,
        expiryDate: putawayRequest.expiryDate || undefined
      };

      const response = await fetch('/api/optimization?action=putaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to find putaway location');
      }

      const data = await response.json();
      setPutawayResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find putaway location');
    } finally {
      setLoading(false);
    }
  };

  const executePutaway = async () => {
    if (!putawayResult) return;

    setExecutingPutaway(true);
    setError('');

    try {
      const response = await fetch('/api/optimization?action=putaway', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: putawayRequest,
          binId: putawayResult.binId,
          userId: 'user-1' // Mock user ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute putaway');
      }

      alert('Putaway executed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute putaway');
    } finally {
      setExecutingPutaway(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-500',
      MEDIUM: 'bg-yellow-500',
      HIGH: 'bg-orange-500',
      URGENT: 'bg-red-500'
    };
    return (
      <Badge className={`${colors[priority as keyof typeof colors]} text-white`}>
        {priority.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Optimization</h1>
          <p className="text-muted-foreground">AI-powered picking and putaway optimization</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="picking">Picking Optimization</TabsTrigger>
          <TabsTrigger value="putaway">Putaway Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="picking">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Picking Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>Picking Request</CardTitle>
                <CardDescription>Configure items to pick and constraints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Items to Pick</Label>
                  {pickingItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Item ID"
                          value={item.itemId}
                          onChange={(e) => updatePickingItem(index, 'itemId', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updatePickingItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <Select
                        value={item.priority}
                        onValueChange={(value) => updatePickingItem(index, 'priority', value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePickingItem(index)}
                        disabled={pickingItems.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addPickingItem}>
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Constraints (Optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Max Weight (kg)"
                      value={pickingConstraints.maxWeight}
                      onChange={(e) => setPickingConstraints({...pickingConstraints, maxWeight: e.target.value})}
                    />
                    <Input
                      placeholder="Max Volume (m³)"
                      value={pickingConstraints.maxVolume}
                      onChange={(e) => setPickingConstraints({...pickingConstraints, maxVolume: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="datetime-local"
                      placeholder="Time Window Start"
                      value={pickingConstraints.timeWindowStart}
                      onChange={(e) => setPickingConstraints({...pickingConstraints, timeWindowStart: e.target.value})}
                    />
                    <Input
                      type="datetime-local"
                      placeholder="Time Window End"
                      value={pickingConstraints.timeWindowEnd}
                      onChange={(e) => setPickingConstraints({...pickingConstraints, timeWindowEnd: e.target.value})}
                    />
                  </div>
                </div>

                <Button
                  onClick={generatePickingPlan}
                  disabled={loading || !pickingItems.some(item => item.itemId.trim())}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Picking Plan'}
                </Button>
              </CardContent>
            </Card>

            {/* Picking Results */}
            <Card>
              <CardHeader>
                <CardTitle>Optimized Picking Plan</CardTitle>
                <CardDescription>Efficient route for picking operations</CardDescription>
              </CardHeader>
              <CardContent>
                {pickingPlan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Total Distance</div>
                        <div className="text-muted-foreground">{pickingPlan.totalDistance.toFixed(1)} units</div>
                      </div>
                      <div>
                        <div className="font-medium">Estimated Time</div>
                        <div className="text-muted-foreground">{pickingPlan.estimatedTime.toFixed(1)} min</div>
                      </div>
                      <div>
                        <div className="font-medium">Efficiency</div>
                        <div className="text-muted-foreground">{pickingPlan.efficiency.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Routes ({pickingPlan.routes.length})</Label>
                      <div className="max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>Bin</TableHead>
                              <TableHead>Item</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Location</TableHead>
                              <TableHead>Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pickingPlan.routes.map((route) => (
                              <TableRow key={route.sequence}>
                                <TableCell>{route.sequence}</TableCell>
                                <TableCell>{route.binCode}</TableCell>
                                <TableCell>{route.itemId}</TableCell>
                                <TableCell>{route.quantity}</TableCell>
                                <TableCell>{route.location}</TableCell>
                                <TableCell>{route.estimatedTime.toFixed(1)}m</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <Button
                      onClick={executePickingPlan}
                      disabled={executingPicking}
                      className="w-full"
                    >
                      {executingPicking ? 'Executing...' : 'Execute Picking Plan'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Generate a picking plan to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="putaway">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Putaway Request Form */}
            <Card>
              <CardHeader>
                <CardTitle>Putaway Request</CardTitle>
                <CardDescription>Find optimal storage location for items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="itemId">Item ID</Label>
                    <Input
                      id="itemId"
                      value={putawayRequest.itemId}
                      onChange={(e) => setPutawayRequest({...putawayRequest, itemId: e.target.value})}
                      placeholder="Enter item ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={putawayRequest.quantity}
                      onChange={(e) => setPutawayRequest({...putawayRequest, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      value={putawayRequest.batchNumber || ''}
                      onChange={(e) => setPutawayRequest({...putawayRequest, batchNumber: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={putawayRequest.priority}
                      onValueChange={(value) => setPutawayRequest({...putawayRequest, priority: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={putawayRequest.expiryDate || ''}
                    onChange={(e) => setPutawayRequest({...putawayRequest, expiryDate: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Constraints</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={putawayRequest.constraints?.temperature || ''}
                      onValueChange={(value) => setPutawayRequest({
                        ...putawayRequest,
                        constraints: { ...putawayRequest.constraints, temperature: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Temperature" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AMBIENT">Ambient</SelectItem>
                        <SelectItem value="REFRIGERATED">Refrigerated</SelectItem>
                        <SelectItem value="FROZEN">Frozen</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={putawayRequest.constraints?.hazardLevel || ''}
                      onValueChange={(value) => setPutawayRequest({
                        ...putawayRequest,
                        constraints: { ...putawayRequest.constraints, hazardLevel: value as any }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hazard Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    placeholder="Max Weight (kg)"
                    value={putawayRequest.constraints?.maxWeight || ''}
                    onChange={(e) => setPutawayRequest({
                      ...putawayRequest,
                      constraints: { ...putawayRequest.constraints, maxWeight: parseFloat(e.target.value) || undefined }
                    })}
                  />
                </div>

                <Button
                  onClick={findPutawayLocation}
                  disabled={loading || !putawayRequest.itemId.trim()}
                  className="w-full"
                >
                  {loading ? 'Finding...' : 'Find Optimal Location'}
                </Button>
              </CardContent>
            </Card>

            {/* Putaway Results */}
            <Card>
              <CardHeader>
                <CardTitle>Optimal Storage Location</CardTitle>
                <CardDescription>AI-recommended bin for putaway</CardDescription>
              </CardHeader>
              <CardContent>
                {putawayResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">{putawayResult.binCode}</div>
                        <div className="text-sm text-muted-foreground">{putawayResult.location}</div>
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        Score: {putawayResult.score.toFixed(1)}
                      </Badge>
                    </div>

                    <div>
                      <Label>Reasons for Selection</Label>
                      <ul className="mt-2 space-y-1">
                        {putawayResult.reasons.map((reason, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      onClick={executePutaway}
                      disabled={executingPutaway}
                      className="w-full"
                    >
                      {executingPutaway ? 'Executing...' : 'Execute Putaway'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Find an optimal location to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
