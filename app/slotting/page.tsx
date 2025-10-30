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
  MapPin,
  Package,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Play,
  Square,
  Settings,
  BarChart3,
  Target
} from 'lucide-react';

interface SlottingRule {
  id: string;
  name: string;
  description: string;
  criteria: {
    itemType?: string;
    velocity?: 'high' | 'medium' | 'low';
    size?: 'small' | 'medium' | 'large';
    weight?: 'light' | 'medium' | 'heavy';
    expiryDate?: string;
  };
  targetZone: string;
  priority: number;
  active: boolean;
  performance: {
    itemsProcessed: number;
    efficiency: number;
    lastRun: string;
  };
}

interface SlottingResult {
  id: string;
  itemId: string;
  itemName: string;
  currentLocation: string;
  recommendedLocation: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  createdAt: string;
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const statusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-blue-500',
  implemented: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function SlottingPage() {
  const [rules, setRules] = useState<SlottingRule[]>([]);
  const [results, setResults] = useState<SlottingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState<SlottingRule | null>(null);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isRunningOptimization, setIsRunningOptimization] = useState(false);

  useEffect(() => {
    fetchSlottingData();
    const interval = setInterval(fetchSlottingData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSlottingData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockRules: SlottingRule[] = [
        {
          id: 'RULE001',
          name: 'High Velocity Items',
          description: 'Fast-moving items should be placed in easily accessible locations',
          criteria: {
            velocity: 'high',
            size: 'small'
          },
          targetZone: 'Zone A (Ground Level)',
          priority: 1,
          active: true,
          performance: {
            itemsProcessed: 1250,
            efficiency: 94.5,
            lastRun: '2024-01-15T10:00:00Z'
          }
        },
        {
          id: 'RULE002',
          name: 'Perishable Items',
          description: 'Temperature-sensitive items near cooling zones',
          criteria: {
            expiryDate: 'within_7_days'
          },
          targetZone: 'Zone C (Climate Controlled)',
          priority: 2,
          active: true,
          performance: {
            itemsProcessed: 890,
            efficiency: 87.2,
            lastRun: '2024-01-15T09:30:00Z'
          }
        },
        {
          id: 'RULE003',
          name: 'Heavy Items',
          description: 'Heavy items placed at lower levels for safety',
          criteria: {
            weight: 'heavy'
          },
          targetZone: 'Zone B (Lower Levels)',
          priority: 3,
          active: false,
          performance: {
            itemsProcessed: 456,
            efficiency: 91.8,
            lastRun: '2024-01-14T16:00:00Z'
          }
        }
      ];

      const mockResults: SlottingResult[] = [
        {
          id: 'RES001',
          itemId: 'ITM001',
          itemName: 'Halal Chicken Breast',
          currentLocation: 'Aisle 7, Level 3, Pos 15',
          recommendedLocation: 'Aisle 2, Level 1, Pos 5',
          reason: 'High velocity item - move to prime location',
          priority: 'high',
          status: 'pending',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'RES002',
          itemId: 'ITM002',
          itemName: 'Organic Rice',
          currentLocation: 'Aisle 5, Level 2, Pos 8',
          recommendedLocation: 'Aisle 3, Level 1, Pos 12',
          reason: 'Medium velocity - optimize accessibility',
          priority: 'medium',
          status: 'approved',
          createdAt: '2024-01-15T07:30:00Z'
        },
        {
          id: 'RES003',
          itemId: 'ITM003',
          itemName: 'Fresh Milk',
          currentLocation: 'Aisle 8, Level 4, Pos 20',
          recommendedLocation: 'Zone C, Aisle 1, Level 1, Pos 3',
          reason: 'Perishable item - move to climate controlled zone',
          priority: 'high',
          status: 'implemented',
          createdAt: '2024-01-15T06:00:00Z'
        }
      ];

      setRules(mockRules);
      setResults(mockResults);
    } catch (error) {
      console.error('Failed to fetch slotting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSlottingOptimization = async () => {
    setIsRunningOptimization(true);
    try {
      // Mock optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update results with new recommendations
      const newResults: SlottingResult[] = [
        {
          id: 'RES004',
          itemId: 'ITM004',
          itemName: 'Frozen Vegetables',
          currentLocation: 'Aisle 6, Level 3, Pos 10',
          recommendedLocation: 'Zone C, Aisle 2, Level 1, Pos 8',
          reason: 'Perishable item - optimize storage conditions',
          priority: 'high',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      setResults(prev => [...newResults, ...prev]);
    } catch (error) {
      console.error('Failed to run optimization:', error);
    } finally {
      setIsRunningOptimization(false);
    }
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
  };

  const updateResultStatus = (resultId: string, newStatus: SlottingResult['status']) => {
    setResults(prev => prev.map(result =>
      result.id === resultId ? { ...result, status: newStatus } : result
    ));
  };

  const filteredRules = rules.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(result =>
    result.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.itemId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={`${priorityColors[priority as keyof typeof priorityColors]} text-white text-xs`}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} text-white text-xs`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const ruleStats = {
    total: rules.length,
    active: rules.filter(r => r.active).length,
    avgEfficiency: rules.reduce((sum, r) => sum + r.performance.efficiency, 0) / rules.length,
  };

  const resultStats = {
    total: results.length,
    pending: results.filter(r => r.status === 'pending').length,
    approved: results.filter(r => r.status === 'approved').length,
    implemented: results.filter(r => r.status === 'implemented').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading slotting optimization...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Slotting Optimization</h1>
          <p className="text-muted-foreground">Optimize item placement for maximum efficiency and accessibility</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runSlottingOptimization}
            disabled={isRunningOptimization}
            className="bg-green-600 hover:bg-green-700"
          >
            {isRunningOptimization ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Optimization
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{ruleStats.total}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{ruleStats.avgEfficiency.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Efficiency</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{resultStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Moves</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{resultStats.implemented}</p>
                <p className="text-sm text-muted-foreground">Completed Moves</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'rules' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rules')}
          className="flex-1"
        >
          Slotting Rules
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('results')}
          className="flex-1"
        >
          Optimization Results
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
                  placeholder="Search rules or results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button onClick={fetchSlottingData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <CardTitle>Slotting Rules ({filteredRules.length})</CardTitle>
            <CardDescription>Automated rules for optimal item placement</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Target Zone</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="text-sm">{rule.targetZone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.active ? 'default' : 'secondary'}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {rule.performance.efficiency.toFixed(1)}%
                        <br />
                        <span className="text-muted-foreground">
                          {rule.performance.itemsProcessed} items
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleRuleStatus(rule.id)}
                        >
                          {rule.active ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </Button>
                        <Dialog open={isRuleDialogOpen && selectedRule?.id === rule.id} onOpenChange={setIsRuleDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRule(rule)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rule Details - {rule.name}</DialogTitle>
                              <DialogDescription>
                                Detailed information about this slotting rule
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm">{rule.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Target Zone</Label>
                                  <p className="text-sm">{rule.targetZone}</p>
                                </div>
                                <div>
                                  <Label>Priority</Label>
                                  <p className="text-sm">{rule.priority}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Criteria</Label>
                                <div className="text-sm space-y-1">
                                  {Object.entries(rule.criteria).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Items Processed</Label>
                                  <p className="text-sm">{rule.performance.itemsProcessed}</p>
                                </div>
                                <div>
                                  <Label>Efficiency</Label>
                                  <p className="text-sm">{rule.performance.efficiency}%</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Results ({filteredResults.length})</CardTitle>
            <CardDescription>Recommended item relocations for better efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Current Location</TableHead>
                  <TableHead>Recommended Location</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.itemName}</p>
                        <p className="text-sm text-muted-foreground">{result.itemId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {result.currentLocation}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-green-500" />
                        {result.recommendedLocation}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(result.priority)}</TableCell>
                    <TableCell>{getStatusBadge(result.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {result.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateResultStatus(result.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateResultStatus(result.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {result.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateResultStatus(result.id, 'implemented')}
                          >
                            Implement
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
